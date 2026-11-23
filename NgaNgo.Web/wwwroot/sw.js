const CACHE = 'russian-kitty-shell-v4';
const SHELL = ['/', '/index.html', '/styles.css', '/practice-ui.css', '/hello-kitty.css', '/images/hello-kitty-study.png', '/js/app.js', '/js/audio.js','/js/google-voice.js','/js/platform.js', '/js/content.js', '/js/curriculum.js', '/js/practice.js', '/js/sessions.js', '/js/dialogs.js', '/js/exercise-bank.js', '/js/exercise-bank-late.js', '/js/book-audio.js', '/manifest.webmanifest', '/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))); });
// Activate a new shell on the next visit, preserving in-progress exercises.
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('nga-ngo-shell-') || key.startsWith('russian-kitty-shell-')) && key !== CACHE).map(key => caches.delete(key))))); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache learner text, API responses, external audio or provider requests.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !SHELL.includes(url.pathname)) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const saved = await cache.match(event.request, {ignoreSearch:true});
    if (saved) return saved;
    return fetch(event.request);
  }));
});
