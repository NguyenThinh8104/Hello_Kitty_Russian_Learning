# Russian Kitty — Русский A1

Ứng dụng luyện tiếng Nga A1: bản Windows đóng gói bằng Electron, bản iPad dùng Capacitor/iOS với bài học cài trong app; ASP.NET Core dùng cho bản xem trước trên trình duyệt. Lộ trình theo **Я люблю русский язык / I Love Russian for Beginners, lần xuất bản thứ 2, năm 2017** do người dùng cung cấp.

## Bản ứng dụng cài đặt

**Windows:** mở `artifacts/native/win-unpacked/Russian Kitty.exe`. Khi chuyển sang máy khác, giải nén toàn bộ `Russian-Kitty-Windows.zip`, giữ các file đi kèm và mở exe trong thư mục đó. Không cần .NET, Safari hay máy chủ. Bản hiện tại chưa ký chứng chỉ phát hành Windows.

**iPad / MacBook M1:** dùng `Russian-Kitty-iPad-Source.zip` và làm theo [hướng dẫn từng bước](CAI-IPAD-MAC-M1.md). Xcode là công cụ miễn phí của Apple để build/ký/cài app; dự án iOS đã tạo và đồng bộ, chưa có IPA đã ký hoặc kiểm thử trên thiết bị thật. Bản iPad dùng plugin micro và nhận giọng iOS, không phụ thuộc Web Speech của Safari.

Để build lại (Node.js 24 LTS):

```bash
cd NgaNgo.App
npm ci
npm run windows
# Trên Mac đã có Xcode + CocoaPods:
npm run ios:sync
npx cap open ios
```

`NgaNgo.App/src/providers.mjs` gọi trực tiếp Google Translate/LanguageTool qua HTTP native hoặc Electron main process, chỉ nhận các route cố định. Bản cài đặt không cần backend ASP.NET. PDF cá nhân được script build chép riêng vào gói app; không nằm trong mã nguồn Git và không đưa vào bản publish web.

## Chạy bản xem trước trên máy tính

Cần .NET SDK 9 (đã có trên máy hiện tại). Không cần SQL Server, npm install hoặc khóa API để mở app, chấm nghe/đọc và kiểm tra bài viết bằng endpoint LanguageTool mặc định.

```powershell
dotnet run --project NgaNgo.Web --launch-profile http
```

Mở <http://localhost:5188>. Trong Visual Studio 2022, mở `Nga_Ngo_Cung_Toi.sln`, chọn `NgaNgo.Web` làm Startup Project và nhấn F5. **Không mở trực tiếp `wwwroot/index.html` bằng file://**: các JavaScript module và API cần được phục vụ bởi máy chủ.

Nếu CLI báo lỗi kiểm tra workloads trên Windows, đặt `$env:MSBuildEnableWorkloadResolver = 'false'` trước lệnh chạy. SDK project này không dùng workloads MAUI.

## Những gì đã có

- 14 bài đúng thứ tự mục lục. Mỗi bài có 3 bộ nghe, 3 bộ đọc (mỗi bộ 3 câu), 6 câu luyện nói và 3 đề viết: tổng cộng **252 câu nghe/đọc, 84 câu luyện nói và 42 đề viết**. Các bộ nghe/đọc dùng 84 đoạn văn khác nhau.
- Cửa sổ chọn bộ luyện có tên bài, nội dung trọng tâm và kết quả từng bộ. Có nút chuyển bộ trước/tiếp theo, sửa riêng câu sai, đóng bằng Escape hoặc nút đóng; hỗ trợ màn hình nhỏ và bàn phím.
- Giao diện Hello Kitty tông hồng, ảnh nền nằm trong `wwwroot/images/hello-kitty-study.png`. Lỗi giọng đọc, quyền micro và kết nối chấm bài có hộp thoại hướng dẫn riêng. Ảnh được tạo bằng công cụ ImageGen tích hợp; prompt đầy đủ lưu ở `scripts/hello-kitty-background-prompt.txt`.
- Bản nháp/kết quả được tách theo bài, kỹ năng và bộ luyện. Dữ liệu cũ của phiên bản đầu được giữ ở bộ Khởi động, bản sao lưu cũ vẫn nhập được. Hộp thoại khôi phục/xóa cho xem lại thao tác trước khi thay đổi dữ liệu.
- Nghe lại không giới hạn, chọn tốc độ, xem lời thoại. Giọng Nga lấy từ Google Translate, chia đoạn tối đa 180 ký tự và giữ tạm MP3 để nghe lại; không yêu cầu cài giọng hệ điều hành.
- 41 đường dẫn MP3 gốc Module 1 từ trang Liden & Denz (bài 1–13), chọn track và lặp audio. Không sao chép MP3 vào ứng dụng. Bài 14 không có MP3 Module 1 được xác minh; vẫn có bài nghe bổ trợ. Câu hỏi của app gắn với **đoạn bổ trợ**; audio gốc sử dụng cùng bài tập tương ứng trong PDF.
- Bản iPad dùng `@capgo/capacitor-speech-recognition` (Apple Speech, `ru-RU`) và `capacitor-voice-recorder`. Bản xem trước có `SpeechRecognition/webkitSpeechRecognition`; Windows dùng ghi âm để tự nghe lại, không giả định Chromium có dịch vụ nhận giọng Google. Ghi âm bằng `MediaRecorder`, chọn MIME theo khả năng thiết bị (ưu tiên MP4 trên Safari), nghe lại, tự dừng sau 30 giây và đóng micro khi rời trang.
- Tùy chọn chuyển bản ghi thành chữ bằng API OpenAI qua backend, nếu cấu hình khóa. Mức khớp từ được tính trên văn bản nhận dạng, **không phải chấm phát âm/ngữ điệu**.
- Bài viết giữ bản nháp, đếm từ, đề gợi ý và bài mẫu. Người học bấm đồng ý trước khi gửi tới LanguageTool; lỗi có gợi ý thay thế. Sửa một chỗ rồi kiểm tra lại để tránh sai vị trí các lỗi còn lại.
- 112 mục từ trọng tâm với dấu trọng âm, 33 chữ cái, tiến độ, chuỗi ngày học, xuất/nhập JSON.
- Chấm chính tả phân biệt е/ё mặc định; có cài đặt nới lỏng. Không bỏ qua đuôi cách hay biến chữ Latin thành chữ Nga.
- Khi triển khai HTTPS, PWA cache phần giao diện/nội dung để mở ngoại tuyến sau lần truy cập online đầu tiên. API, PDF và audio gốc không được cache; sửa viết/nhận giọng online vẫn cần mạng. Giọng Google cần mạng khi chưa có đoạn MP3 trong bộ nhớ phiên; không hứa hoạt động offline sau khi đóng app. Chạy localhost không đăng ký cache để tránh giữ mã cũ khi phát triển.

## Đối chiếu giáo trình

PDF nguồn là bản scan 192 trang, không có lớp text. Đã kiểm tra bằng ảnh trang xuất bản (trang PDF 2), mục lục (PDF 4), lời giới thiệu (PDF 3), các trang tổng kết/từ vựng cuối bài và danh mục audio (PDF 191). **Số trang in = số trang PDF - 1.**

| Bài | Tên trong mục lục | Trang in |
|---|---|---|
| 1 | Привет! | 6–15 |
| 2 | Кто вы? | 16–25 |
| 3 | Моя семья | 26–41 |
| 4 | Живу, учусь, работаю | 42–53 |
| 5 | Города, страны | 54–65 |
| 6 | Что вы делали вчера? | 66–75 |
| 7 | Ресторан | 76–89 |
| 8 | Мой день | 90–103 |
| 9 | Кино. Музыка. Театр | 104–119 |
| 10 | Дом, квартира | 120–133 |
| 11 | В университете | 134–145 |
| 12 | День рождения | 146–159 |
| 13 | В городе | 160–175 |
| 14 | Читаем русскую литературу | 176–185 |

Các đoạn văn, câu hỏi, đáp án, bài mẫu và hướng dẫn tiếng Việt là **nội dung bổ trợ tự biên soạn**, có sử dụng từ vựng được chọn từ các bảng từ vựng/chủ đề của sách và kiến thức A1 đã học. Đây không phải bản số hóa đầy đủ toàn bộ bài tập/module trong sách. Bài 14 dùng truyện đơn giản tự viết, không gắn nhãn là trích đoạn văn học gốc. Chưa có vòng thẩm định độc lập của giảng viên tiếng Nga bản ngữ.

Tham khảo dấu trọng âm: [từ điển Грамота.ру, январь](https://gramota.ru/meta/yanvar), [tài liệu A1 của MGSU](https://isa.mgsu.ru/universityabout/Struktura/Kafedri/Rus_Yaz/sotrudniki-kafedry/%D0%A1%D1%82%D1%83%D0%BF%D0%B5%D0%BD%D0%B8.%20%D0%AD%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%BD%D1%8B%D0%B9%20%D1%83%D1%80%D0%BE%D0%B2%D0%B5%D0%BD%D1%8C.pdf) (познако́миться). Các dấu trọng âm là trợ giúp đọc; khi phát giọng tổng hợp, app gửi từ không dấu trọng âm cho Google Translate.

Đường dẫn audio lấy từ trang in 190 của PDF và đối chiếu các trang chính thức, ví dụ [Module 1, bài 1](https://resources.lidenz.ru/audio/a1v2/l1/m1/). Danh mục `wwwroot/js/book-audio.js` chỉ giữ các URL thực tế đã tìm thấy, không suy đoán tên tệp. Danh mục hiện tại là Module 1, chưa bao gồm toàn bộ audio của sách.

PDF người dùng đã được chép vào `NgaNgo.Web/App_Data/2017-a1.pdf` để mở từ bài học cục bộ. Thư mục này bị loại khỏi Git, gói publish và Docker. Có thể thay bằng biến môi trường `Textbook__Path` trỏ đến một PDF có quyền sử dụng trên máy chủ. Endpoint hỗ trợ byte-range để trình xem PDF tải từng phần.

## Bản xem trước PWA (tùy chọn)

Để cài ứng dụng iPad theo yêu cầu hiện tại, xem **CAI-IPAD-MAC-M1.md**. Các bước dưới đây chỉ dành cho bản xem trước web.

1. Triển khai backend ASP.NET Core trên máy chủ/domain có **HTTPS được iPad tin cậy** (ví dụ host ASP.NET Core hoặc container sau reverse proxy HTTPS). `localhost` trên iPad là chính iPad, không phải laptop.
2. Mở URL HTTPS bằng Safari > Chia sẻ > **Thêm vào Màn hình chính**.
3. Thêm bàn phím tiếng Nga và cho phép micro của website khi luyện nói.
4. Nghe mẫu Google Translate cần Internet. Không phải tải giọng Nga hệ điều hành.

App hiện được chạy cục bộ; **chưa có domain/HTTPS công khai, chưa phát hành App Store và chưa kiểm thử trên iPad thật**. HTTP qua IP LAN chỉ phù hợp xem giao diện, không mở được micro. Không cần MAUI/Xcode để dùng PWA này. Nếu cần bản App Store, đó là bước đóng gói/phát hành tiếp theo.

Safari hỗ trợ Web Speech và MediaRecorder, nhưng nhận giọng thực tế còn phụ thuộc phiên bản iPadOS, cài đặt Siri/Đọc chính tả, tiếng Nga và mạng. App phát hiện tính năng, báo lỗi quyền/mạng, có timeout và đường ghi âm dự phòng. Không cam kết nhận dạng tiếng Nga hoạt động trên mọi iPad. Audio nghe gốc và giọng tổng hợp được dừng khi bắt đầu dùng micro để hạn chế xung đột.

## Cấu hình dịch vụ

Không đặt khóa vào JavaScript hoặc commit file bí mật. Dùng biến môi trường hoặc .NET user-secrets. Mẫu `appsettings.Local.example.json` có thể chép thành `appsettings.Local.json` trong project; file Local bị Git bỏ qua. File bí mật được loại khỏi publish; máy chủ triển khai nên dùng biến môi trường.

### Sửa bài viết

Mặc định `LanguageTool:Endpoint=https://api.languagetool.org/v2/check`, ngôn ngữ `ru`, POST. Giới hạn app: tối đa 5.000 ký tự, 10 yêu cầu online/IP/phút. Chỉ gửi khi người dùng bấm kiểm tra và đồng ý. Lỗi mạng/giới hạn không bị biến thành kết quả “đúng”.

API công cộng có giới hạn riêng, không đảm bảo khả dụng. Dùng instance LanguageTool riêng hoặc gói thương mại phù hợp khi triển khai cho lớp học; cấu hình `LanguageTool__Endpoint`, và nếu cần `LanguageTool__Username`, `LanguageTool__ApiKey`. Không tự động chấm theo từng phím gõ. Xem [quy định API](https://dev.languagetool.org/public-http-api) và [quyền riêng tư](https://languagetool.org/legal/privacy).

LanguageTool kiểm tra chính tả và một số ngữ pháp, chưa đủ đánh giá việc trả lời câu hỏi, tính mạch lạc, độ tự nhiên hoặc cho điểm theo thang CEFR. Trong tiến độ, “Đã kiểm tra” phần viết chỉ có nghĩa đã nhận phản hồi online và đạt số từ tối thiểu.

### Nhận giọng online (tùy chọn)

```powershell
$env:Speech__ApiKey = '<khóa của bạn>'
$env:Speech__Model = 'gpt-4o-mini-transcribe'
dotnet run --project NgaNgo.Web --launch-profile http
```

Backend gửi tệp đến `https://api.openai.com/v1/audio/transcriptions` với `language=ru`. Tối đa 10 MB/tệp. Không lưu tệp âm thanh ở server. Chưa cấu hình khóa thì UI nói rõ và giữ chức năng nhận giọng trình duyệt/ghi âm nghe lại. Chưa kiểm thử live đường nhận giọng OpenAI vì chưa có khóa. Không cần khóa này cho LanguageTool.

Nếu triển khai với reverse proxy, cấu hình HTTPS và forwarded headers/host đúng theo hạ tầng, giữ chính sách cùng origin của `/api`. Bản hiện tại dành cho cá nhân/thử nghiệm lớp học, chưa có đăng nhập hay đồng bộ tài khoản. Trước khi mở một backend có khóa dịch vụ cho nhiều người, thêm xác thực và quota người dùng; rate limit hiện tại theo IP và là bộ nhớ của từng instance.

## Kiểm tra

```powershell
dotnet build Nga_Ngo_Cung_Toi.sln
node --test tests/practice.test.mjs tests/sessions.test.mjs tests/audio.test.mjs tests/native-providers.test.mjs
node --test tests/api.test.mjs
```

Không có thư viện test ngoài. Unit tests kiểm tra chuẩn hóa Cyrillic, đuôi từ, е/ё, Latin nhìn giống Cyrillic, so khớp từ, tất cả 84 bộ nghe/đọc, 42 bài mẫu và bản sao lưu. Kiểm thử session xác minh các bộ không dùng nhầm bản nháp/điểm, việc thử lại không làm tăng số bộ đã luyện và dữ liệu cũ được chuyển đúng sang bộ Khởi động. Integration tests khởi động backend ở `127.0.0.1:5190` và fixture LanguageTool ở `5191`, kiểm tra consent, giới hạn, UTF-8, phản hồi gợi ý, cross-origin và lỗi thiếu khóa. Fixture không gửi dữ liệu ra mạng.

Kiểm tra thủ công bản cài đặt trên iPad thật: build bằng Xcode, cấp/từ chối micro, nhận giọng Nga hai lần liên tiếp, nghe mẫu rồi nhận giọng, ghi MP4 và nghe lại, chuyển bài khi đang ghi, bàn phím Nga, xoay màn hình, offline sau lần mở online và kiểm tra giữ bản nháp khi đóng/mở app. Nhận giọng online cần cấu hình khóa và kiểm thử riêng.

## Cấu trúc

- `NgaNgo.Web/Program.cs`: máy chủ, kiểm tra bài viết, nhận giọng, PDF và bảo vệ API.
- `NgaNgo.Web/wwwroot/js/content.js`, `curriculum.js`: nội dung và liên kết 14 bài với sách.
- `wwwroot/js/exercise-bank.js`, `exercise-bank-late.js`: 56 đoạn nghe/đọc bổ sung, 42 câu nói bổ sung, 28 đề viết bổ sung, chia theo chủ đề của sách.
- `wwwroot/js/sessions.js`: khóa bản nháp, kết quả theo bộ và tương thích dữ liệu cũ.
- `wwwroot/js/dialogs.js`, `wwwroot/practice-ui.css`: hộp thoại và giao diện các bộ luyện.
- `wwwroot/js/app.js`: giao diện, bản nháp, tiến độ và tương tác.
- `wwwroot/js/audio.js`: giọng đọc, nhận giọng và ghi âm.
- `wwwroot/js/practice.js`: chấm và xác thực sao lưu.
- `wwwroot/sw.js`, `manifest.webmanifest`: PWA.

Muốn thay/biên tập nội dung, sửa dữ liệu các bài và chạy lại kiểm thử. Thay phiên bản cache trong `sw.js` khi phát hành bộ file frontend mới. Không đưa PDF cá nhân hoặc tệp bí mật vào thư mục `wwwroot`.


## Giọng Google Translate

Luồng đọc mẫu dùng endpoint web `https://translate.google.com/translate_tts`, cố định `tl=ru`, `client=tw-ob`, văn bản mã hóa UTF-8. Đây **không phải API Google Cloud TTS có hợp đồng dịch vụ**, cũng không phải MP3 gốc Liden & Denz. Endpoint có thể bị Google giới hạn/thay đổi. App báo lỗi, không âm thầm đổi giọng. Không dùng proxy né chặn hay đưa khóa Google vào app. Giọng phát thành công đã được kiểm tra cả qua backend và bản Windows.

Bản web giới hạn 60 yêu cầu giọng/IP/phút, cache RAM tối đa 12 MB/10 phút. Bản native chỉ gọi domain cố định, giới hạn văn bản và cache theo phiên. Không lưu văn bản hay bản ghi lên đĩa máy chủ. Bài viết chỉ gửi LanguageTool khi có consent; iOS sẽ hỏi riêng quyền micro và nhận giọng Apple.

## Xác minh bản ứng dụng

Đã chạy cửa sổ Russian Kitty trên Windows, kiểm tra tên, theme Hello Kitty, phát xong câu mẫu Google Translate và mở PDF 192 trang trong cửa sổ của app. Unit/integration tests bao gồm adapter native, hủy giọng đang tải, consent, cache, lỗi dịch vụ và chuyển dữ liệu cũ. Chưa kiểm tra micro native hoặc build/ký iOS vì phiên làm việc đang ở Windows; checklist thiết bị thật nằm trong hướng dẫn Mac.
