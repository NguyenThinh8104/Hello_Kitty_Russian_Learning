using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: false);
if (builder.Environment.IsDevelopment()) builder.Configuration.AddUserSecrets<Program>(optional: true);
builder.Configuration.AddEnvironmentVariables();
builder.Services.AddHttpClient("language", c => c.Timeout = TimeSpan.FromSeconds(25));
builder.Services.AddHttpClient("speech", c => c.Timeout = TimeSpan.FromSeconds(60));
builder.Services.AddHttpClient("google", c => c.Timeout = TimeSpan.FromSeconds(20));
builder.Services.AddMemoryCache(options => options.SizeLimit = 12 * 1024 * 1024);
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("voice", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "local",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 60, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("online", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "local",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.OnRejected = async (context, token) =>
        await context.HttpContext.Response.WriteAsJsonAsync(new { error = "Bạn thao tác quá nhanh. Hãy đợi một phút rồi thử lại." }, token);
});
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 11 * 1024 * 1024);
var app = builder.Build();
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "same-origin";
    context.Response.Headers["Permissions-Policy"] = "microphone=(self), camera=()";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob: https://resources.lidenz.ru; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.Headers.CacheControl = "no-store";
        // Reject cross-origin form uploads as well as cross-origin fetches.
        var origin = context.Request.Headers.Origin.ToString();
        if (origin.Length > 0 && (!Uri.TryCreate(origin, UriKind.Absolute, out var parsed) ||
            !string.Equals(parsed.Authority, context.Request.Host.Value, StringComparison.OrdinalIgnoreCase) ||
            parsed.Scheme != context.Request.Scheme))
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { error = "Yêu cầu phải đến từ ứng dụng này." });
            return;
        }
    }
    await next();
});
app.UseRateLimiter();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        if (ctx.File.Name is "sw.js" or "index.html") ctx.Context.Response.Headers.CacheControl = "no-cache";
    }
});
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/capabilities", (IConfiguration config) => Results.Ok(new
{
    transcription = !string.IsNullOrWhiteSpace(config["Speech:ApiKey"]),
    textbook = File.Exists(TextbookPath(config, app.Environment)),
    writingProvider = "LanguageTool",
    ttsProvider = "Google Translate",
    writingPrivacy = "https://languagetool.org/legal/privacy"
}));
app.MapPost("/api/tts", async (VoiceRequest request, IHttpClientFactory clients, IConfiguration config, Microsoft.Extensions.Caching.Memory.IMemoryCache cache, HttpContext context) =>
{
    var text = request.Text?.Normalize().Replace("\u0301", "").Trim();
    if (string.IsNullOrEmpty(text) || text.Length > 180)
        return Results.BadRequest(new { error = "Mỗi đoạn giọng đọc cần từ 1 đến 180 ký tự." });
    var key = "voice:" + text;
    if (cache.TryGetValue(key, out string? audio)) return Results.Ok(new { audio, provider = "Google Translate" });
    try
    {
        var endpoint = config["GoogleVoice:Endpoint"] ?? "https://translate.google.com/translate_tts";
        using var response = await clients.CreateClient("google").GetAsync(endpoint + "?ie=UTF-8&tl=ru&client=tw-ob&q=" + Uri.EscapeDataString(text), context.RequestAborted);
        if (!response.IsSuccessStatusCode || response.Content.Headers.ContentType?.MediaType?.StartsWith("audio/") != true)
            return Results.Json(new { error = "Google Translate hiện chưa phát được giọng Nga. Hãy thử lại sau." }, statusCode: 502);
        var bytes = await response.Content.ReadAsByteArrayAsync(context.RequestAborted);
        if (bytes.Length is 0 or > 1000000) return Results.StatusCode(502);
        audio = Convert.ToBase64String(bytes);
        // Bound memory lifetime and avoid storing study text on disk.
        cache.Set(key, audio, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), Size = audio.Length * 2 + key.Length * 2 });
        return Results.Ok(new { audio, provider = "Google Translate" });
    }
    catch (Exception ex) when (ex is HttpRequestException or OperationCanceledException)
    { return Results.Json(new { error = "Chưa kết nối được Google Translate. Kiểm tra Internet rồi thử lại." }, statusCode: 502); }
}).RequireRateLimiting("voice");
app.MapGet("/api/textbook", (IConfiguration config) =>
{
    var path = TextbookPath(config, app.Environment);
    return File.Exists(path)
        ? Results.File(path, "application/pdf", enableRangeProcessing: true)
        : Results.NotFound(new { error = "Chưa cấu hình PDF trên máy chủ này. Xem hướng dẫn App_Data trong README." });
});
app.MapPost("/api/writing/check", async (WritingRequest request, IHttpClientFactory clients, IConfiguration config, HttpContext context) =>
{
    if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > 5000)
        return Results.BadRequest(new { error = "Hãy nhập bài viết từ 1 đến 5.000 ký tự." });
    if (!request.Consent) return Results.BadRequest(new { error = "Cần đồng ý gửi bài viết đến LanguageTool trước khi kiểm tra." });
    var fields = new Dictionary<string, string> { ["text"] = request.Text, ["language"] = "ru" };
    if (!string.IsNullOrWhiteSpace(config["LanguageTool:ApiKey"]))
    {
        fields["apiKey"] = config["LanguageTool:ApiKey"]!;
        fields["username"] = config["LanguageTool:Username"] ?? "";
    }
    try
    {
        using var response = await clients.CreateClient("language").PostAsync(
            config["LanguageTool:Endpoint"] ?? "https://api.languagetool.org/v2/check",
            new FormUrlEncodedContent(fields), context.RequestAborted);
        if (!response.IsSuccessStatusCode) return ProviderFailure(response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(context.RequestAborted));
        var matches = document.RootElement.GetProperty("matches").EnumerateArray().Select(m => new
        {
            message = m.GetProperty("message").GetString(),
            offset = m.GetProperty("offset").GetInt32(),
            length = m.GetProperty("length").GetInt32(),
            replacements = m.GetProperty("replacements").EnumerateArray().Take(5).Select(r => r.GetProperty("value").GetString()).ToArray(),
            rule = m.GetProperty("rule").GetProperty("id").GetString()
        }).ToArray();
        return Results.Ok(new { matches, provider = "LanguageTool" });
    }
    catch (OperationCanceledException) when (!context.RequestAborted.IsCancellationRequested)
    { return Results.Json(new { error = "Dịch vụ kiểm tra phản hồi chậm. Bài viết đã được giữ trên thiết bị; thử lại sau." }, statusCode: 504); }
    catch (Exception ex) when (ex is HttpRequestException or JsonException or KeyNotFoundException or InvalidOperationException)
    { return Results.Json(new { error = "Chưa kết nối được dịch vụ kiểm tra. Không thể kết luận bài viết đúng hay sai." }, statusCode: 502); }
}).RequireRateLimiting("online");

app.MapPost("/api/speech/transcribe", async (HttpRequest request, IHttpClientFactory clients, IConfiguration config) =>
{
    if (string.IsNullOrWhiteSpace(config["Speech:ApiKey"]))
        return Results.Json(new { error = "Máy chủ chưa cấu hình nhận giọng online. Dùng nhận giọng của Safari hoặc nghe lại bản ghi." }, statusCode: 503);
    if (!request.HasFormContentType) return Results.BadRequest(new { error = "Cần gửi tệp âm thanh." });
    var form = await request.ReadFormAsync(request.HttpContext.RequestAborted);
    if (form["consent"] != "true") return Results.BadRequest(new { error = "Cần đồng ý gửi âm thanh để nhận dạng." });
    var file = form.Files.GetFile("audio");
    var allowed = new[] { "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/webm", "audio/ogg", "audio/wav", "audio/mpeg" };
    if (file is null || file.Length == 0 || file.Length > 10 * 1024 * 1024 || !allowed.Contains(file.ContentType.Split(';')[0]))
        return Results.BadRequest(new { error = "Tệp âm thanh phải dưới 10 MB và có định dạng MP4, M4A, WebM, Ogg, WAV hoặc MP3." });
    try
    {
        using var content = new MultipartFormDataContent();
        using var stream = file.OpenReadStream();
        var audio = new StreamContent(stream);
        audio.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType.Split(';')[0]);
        var ext = file.ContentType.Contains("webm") ? "webm" : file.ContentType.Contains("ogg") ? "ogg" : file.ContentType.Contains("wav") ? "wav" : file.ContentType.Contains("mpeg") ? "mp3" : "mp4";
        content.Add(audio, "file", "recording." + ext);
        content.Add(new StringContent(config["Speech:Model"] ?? "gpt-4o-mini-transcribe"), "model");
        content.Add(new StringContent("ru"), "language");
        using var message = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/audio/transcriptions") { Content = content };
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", config["Speech:ApiKey"]);
        using var response = await clients.CreateClient("speech").SendAsync(message, request.HttpContext.RequestAborted);
        if (!response.IsSuccessStatusCode) return ProviderFailure(response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(request.HttpContext.RequestAborted));
        return Results.Ok(new { text = document.RootElement.GetProperty("text").GetString() });
    }
    catch (OperationCanceledException) when (!request.HttpContext.RequestAborted.IsCancellationRequested)
    { return Results.Json(new { error = "Nhận giọng quá thời gian. Bạn vẫn có thể nghe lại bản ghi." }, statusCode: 504); }
    catch (Exception ex) when (ex is HttpRequestException or JsonException or KeyNotFoundException or InvalidOperationException)
    { return Results.Json(new { error = "Chưa nhận dạng được bản ghi. Hãy thử lại." }, statusCode: 502); }
}).RequireRateLimiting("online");

app.Run();

static string TextbookPath(IConfiguration config, IWebHostEnvironment environment) =>
    Path.GetFullPath(config["Textbook:Path"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "2017-a1.pdf"));

static IResult ProviderFailure(HttpStatusCode status) => Results.Json(new
{
    error = status == HttpStatusCode.TooManyRequests
        ? "Dịch vụ đang giới hạn lượt kiểm tra. Hãy đợi một phút rồi thử lại."
        : "Dịch vụ online hiện chưa sẵn sàng. Hãy thử lại sau."
}, statusCode: status == HttpStatusCode.TooManyRequests ? 429 : 502);

record WritingRequest(string? Text, bool Consent);
record VoiceRequest(string? Text);
