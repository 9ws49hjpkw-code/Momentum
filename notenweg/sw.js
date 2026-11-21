/* Notenweg · Service Worker
   Alle App-Dateien liegen im Cache, die App startet ohne Netz.
   Neue Versionen werden installiert und dann angeboten (die App zeigt „Neue Version bereit“).
   Nur eigene, gültige Antworten werden gespeichert, nie WLAN-Anmeldeseiten oder Umleitungen.
   Caches heißen immer „notenweg-…“: Momentum und Kickerabend liegen auf derselben Domain. */
const VERSION = 'notenweg-b3';
const SCOPE = self.registration.scope;
const INDEX = new URL('index.html', SCOPE).href;
const ASSETS = ['manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'].map(f => new URL(f, SCOPE).href);
const MARK = 'data-nw-app';

async function grab(url) {
  const res = await fetch(url, { cache: 'reload', credentials: 'same-origin' });
  if (!res || !res.ok || res.redirected || res.type !== 'basic') throw new Error('fetch ' + url);
  return res;
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    const res = await grab(INDEX);
    const text = await res.clone().text();
    if (text.indexOf(MARK) < 0) throw new Error('not the app');
    await c.put(INDEX, res);
    await Promise.all(ASSETS.map(u => grab(u).then(r => c.put(u, r)).catch(() => { })));
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.indexOf('notenweg-') === 0 && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.href.indexOf(SCOPE) !== 0) return;
  const bare = url.href.split('#')[0].split('?')[0];
  const rel = bare.slice(SCOPE.length);
  const key = (req.mode === 'navigate' || rel === '' || rel === 'index.html') ? INDEX : bare;
  if (key !== INDEX && ASSETS.indexOf(key) < 0) return;
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const hit = await c.match(key);
    if (hit) return hit;
    try {
      const res = await fetch(req.mode === 'navigate' ? INDEX : req);
      if (res.ok && !res.redirected && res.type === 'basic') {
        if (key !== INDEX || (await res.clone().text()).indexOf(MARK) >= 0) await c.put(key, res.clone());
      }
      return res;
    } catch (err) {
      const any = await caches.match(key);
      return any || Response.error();
    }
  })());
});
