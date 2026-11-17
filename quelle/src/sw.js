/* Momentum · Service Worker
   Alle Dateien liegen lokal im Cache, die App startet ohne Netz.
   Auf Anfrage der App wird geprüft, ob auf dem Server eine neuere Version liegt. */
const CACHE = 'momentum-cache-v1';
const SCOPE = self.registration.scope;
const INDEX = new URL('index.html', SCOPE).href;
const ASSETS = ['manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'].map(f => new URL(f, SCOPE).href);
const MARK = 'rel="manifest"';

async function clean(res) {
  if (!res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}
async function grab(url, mode) {
  const res = await fetch(url, { cache: mode, credentials: 'same-origin' });
  if (!res || !res.ok) throw new Error('fetch ' + url);
  return clean(res);
}
/* Die Startseite wird nur übernommen, wenn sie wirklich die App ist (kein WLAN-Anmeldefenster o. Ä.). */
async function grabIndex(mode) {
  const res = await grab(INDEX, mode);
  const text = await res.clone().text();
  if (text.indexOf(MARK) < 0) throw new Error('not the app');
  return { res, text };
}
async function refresh(c, url) {
  try { await c.put(url, await grab(url, 'no-cache')); } catch (e) {}
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.put(INDEX, (await grabIndex('reload')).res);
    await Promise.all(ASSETS.map(u => grab(u, 'reload').then(r => c.put(u, r)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.indexOf('momentum-cache-') === 0 && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.href.indexOf(SCOPE) !== 0) return;
  const bare = url.href.split('#')[0].split('?')[0];
  const rel = bare.slice(SCOPE.length);
  const key = (rel === '' || rel === 'index.html') ? INDEX : bare;
  if (key !== INDEX && ASSETS.indexOf(key) < 0) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(key);
    if (hit) return hit;
    try {
      const res = key === INDEX ? (await grabIndex('no-cache')).res : await grab(key, 'no-cache');
      await c.put(key, res.clone());
      return res;
    } catch (err) { return fetch(req); }
  })());
});

/* Die App fragt nach dem Start: Gibt es etwas Neues? */
self.addEventListener('message', e => {
  const d = e.data;
  if (!d || d.type !== 'momentum-check' || !e.source) return;
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(INDEX);
    const old = hit ? await hit.text() : null;
    let fresh;
    try { fresh = await grabIndex('no-cache'); } catch (err) { return; }
    await Promise.all(ASSETS.map(u => refresh(c, u)));
    if (old !== null && fresh.text === old) return;
    await c.put(INDEX, fresh.res);
    if (old !== null) e.source.postMessage({ type: 'momentum-update' });
  })());
});
