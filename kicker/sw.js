/* Kickerabend · Offline-Cache. Neue Versionen werden angeboten, nicht erzwungen. */
const VERSION = 'kickerabend-b1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    // nur eigene alte Caches löschen – Momentum liegt auf derselben Domain!
    .then(keys => Promise.all(keys.filter(k => k.indexOf('kickerabend-') === 0 && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      // nur saubere eigene Antworten cachen (keine WLAN-Login-Seiten, keine Umleitungen)
      if (res.ok && res.type === 'basic' && !res.redirected) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
