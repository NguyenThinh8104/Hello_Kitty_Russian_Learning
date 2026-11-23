// The installed app supplies a narrow native bridge; browser preview uses ASP.NET.
export const runtime = () => globalThis.window?.ngaNgoNative || globalThis.window?.ngaNgoDesktop;
export const isInstalled = () => Boolean(runtime());
export async function apiFetch(path, options = {}) {
  const native = runtime();
  if (!native) return fetch(path, options);
  if(options.signal?.aborted)throw new DOMException('Canceled','AbortError');
  const result = await native.request(path, options.body ? JSON.parse(options.body) : null);
  if(options.signal?.aborted)throw new DOMException('Canceled','AbortError');
  return new Response(JSON.stringify(result.data), { status: result.status, headers:{'Content-Type':'application/json'} });
}
