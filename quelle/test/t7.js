// Offline, Service Worker, Update ohne Datenverlust, keine externen Anfragen
const L = require('./lib');
const fs = require('fs'), path = require('path');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
(async () => {
  const V1 = L.APP, V2 = require('path').join(L.TMP, 'v2');
  fs.rmSync(V2, { recursive: true, force: true }); fs.cpSync(V1, V2, { recursive: true });
  const html = fs.readFileSync(path.join(V1, 'index.html'), 'utf8');
  const CUR = html.match(/const VERSION = '([\d.]+)';/)[1], NEXT = CUR.replace(/(\d+)$/, n => +n + 1);
  fs.writeFileSync(path.join(V2, 'index.html'), html.replace(/content="(\d+\.\d+)\.(\d+)"/, (m, a, b) => 'content="' + a + '.' + (+b + 1) + '"').replace("const VERSION = '" + CUR + "';", "const VERSION = '" + NEXT + "';"));

  let { srv, url, state } = await L.serve(V1, 8766);
  const b = await L.launch(), c = await L.ctx(b), p = await c.newPage(), log = [], reqs = [];
  await c.addInitScript(() => { const o = navigator.storage.persist.bind(navigator.storage); window.__persist = 0; navigator.storage.persist = () => { window.__persist++; return o(); }; });
  L.watch(p, log);
  p.on('request', r => reqs.push(r.url()));
  const T = (s, n) => L.tap(p, s, n), W = ms => p.waitForTimeout(ms);
  const texts = sel => p.$$eval(sel, e => e.map(x => x.textContent.trim()));

  console.log('Erster Start');
  await p.goto(url); await p.waitForSelector('body.live');
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 });
  ok(true, 'Service Worker aktiv und steuert die Seite');
  ok(await p.evaluate(() => window.__persist) === 1, 'navigator.storage.persist() wird aufgerufen');
  const cached = await p.evaluate(async () => (await (await caches.open('momentum-cache-v1')).keys()).map(r => r.url.split('/').pop()).sort());
  ok(cached.join() === 'apple-touch-icon.png,icon-192.png,icon-512.png,index.html,manifest.json', 'im Cache: ' + cached.join(', '));
  await T('#plus'); await W(350); await p.keyboard.type('Offline-Test Aufgabe'); await T('#e-when [data-when="today"]'); await W(100); await T('#e-save'); await W(600);
  await T('[data-tab="journal"]'); await W(300); await T('#j-editor textarea', 0); await W(400); await p.keyboard.type('Das hier muss ein Update überleben.'); await p.evaluate(() => document.activeElement.blur()); await W(600);
  await W(3200);
  ok(!(await p.evaluate(() => !!document.querySelector('#today-top .pill'))), 'kein Update-Hinweis, wenn nichts Neues da ist');

  console.log('Keine externen Abhängigkeiten');
  const ext = reqs.filter(u => !u.startsWith(url) && !u.startsWith('data:') && !u.startsWith('blob:'));
  ok(ext.length === 0, 'alle Anfragen gehen an die eigene Adresse (' + reqs.length + ' Anfragen)' + (ext.length ? ': ' + ext.join(', ') : ''));
  const src = fs.readFileSync(path.join(V1, 'index.html'), 'utf8') + fs.readFileSync(path.join(V1, 'sw.js'), 'utf8');
  const urls = (src.match(/https?:\/\/[^\s"'<>)]+/g) || []).filter(u => !u.startsWith('http://www.w3.org/'));
  ok(urls.length === 0, 'kein externer Link im Code' + (urls.length ? ': ' + urls.join(', ') : ''));
  ok(!/@import|<link[^>]+stylesheet|<script[^>]+src=|url\(\s*["']?https?:/.test(src), 'keine externen Skripte, Styles oder Schriften');

  console.log('Offline');
  await c.setOffline(true); srv.close(); await W(300);
  await p.reload(); await p.waitForSelector('body.live'); await L.decorate(p); await W(500);
  ok((await texts('#today .rw .row-title')).includes('Offline-Test Aufgabe'), 'App startet offline, Aufgabe ist da');
  await T('#plus'); await W(350); await p.keyboard.type('Offline angelegt'); await T('#e-when [data-when="now"]'); await W(100); await T('#e-save'); await W(600);
  ok((await texts('#today .rw .row-title'))[0] === 'Offline angelegt', 'offline lässt sich alles bedienen und speichern');
  const icon = await p.evaluate(async () => { const r = await fetch('icon-192.png'); return r.ok && (await r.blob()).size > 1000; });
  const mani = await p.evaluate(async () => (await (await fetch('manifest.json')).json()).display);
  ok(icon && mani === 'standalone', 'Icons und Manifest kommen offline aus dem Cache (display: ' + mani + ')');
  await p.evaluate(() => navigator.serviceWorker.controller.postMessage({ type: 'momentum-check' })); await W(800);
  ok(!(await p.evaluate(() => !!document.querySelector('#today-top .pill'))), 'Update-Prüfung ohne Netz bleibt still');
  await p.reload(); await p.waitForSelector('body.live'); await W(300);
  ok((await texts('#today .rw .row-title')).length === 2, 'zweiter Offline-Start: beide Aufgaben da');
  await L.shot(p, '70-offline');

  console.log('Falsche Antwort vom Netz (z. B. WLAN-Anmeldeseite)');
  const BAD = require('path').join(L.TMP, 'bad'); fs.rmSync(BAD, { recursive: true, force: true }); fs.cpSync(V1, BAD, { recursive: true });
  fs.writeFileSync(path.join(BAD, 'index.html'), '<html><body>Bitte im WLAN anmelden</body></html>');
  ({ srv, url, state } = await L.serve(BAD, 8766)); await c.setOffline(false); await W(200);
  await p.evaluate(() => navigator.serviceWorker.controller.postMessage({ type: 'momentum-check' })); await W(1200);
  await p.reload(); await p.waitForSelector('body.live', { timeout: 5000 }); await W(300);
  ok((await texts('#today .rw .row-title')).length === 2, 'fremde Seite wird nicht in den Cache übernommen, App bleibt heil');
  srv.close();

  console.log('Update einspielen');
  ({ srv, url, state } = await L.serve(V2, 8766)); await W(200);
  await L.tap(p, '#v-today [data-act="settings"]'); await W(600);
  ok((await texts('#settings-body .about b'))[0] === 'Momentum ' + CUR, 'läuft noch Version ' + CUR);
  await L.tap(p, '#L-settings [data-act="closeTop"]'); await W(600);
  await p.evaluate(() => navigator.serviceWorker.controller.postMessage({ type: 'momentum-check' }));
  await p.waitForFunction(() => !!document.querySelector('#today-top .pill'), null, { timeout: 8000 });
  ok(true, 'Hinweis „Neue Version bereit“ erscheint');
  await L.decorate(p); await W(700); await L.shot(p, '71-update-hinweis');
  await Promise.all([p.waitForNavigation(), L.tap(p, '#today-top .pill')]);
  await p.waitForSelector('body.live'); await L.decorate(p); await W(400);
  await L.tap(p, '#v-today [data-act="settings"]'); await W(600);
  ok((await texts('#settings-body .about b'))[0] === 'Momentum ' + NEXT, 'nach „Aktualisieren“ läuft die neue Version: ' + (await texts('#settings-body .about b'))[0]);
  await L.tap(p, '#L-settings [data-act="closeTop"]'); await W(600);
  ok((await texts('#today .rw .row-title')).length === 2, 'Aufgaben haben das Update überlebt');
  await T('[data-tab="journal"]'); await W(300);
  ok((await p.inputValue('#j-editor textarea >> nth=0')) === 'Das hier muss ein Update überleben.', 'Journal hat das Update überlebt');
  await c.setOffline(true); srv.close();
  await p.reload(); await p.waitForSelector('body.live'); await W(300);
  await T('[data-tab="today"]').catch(() => {}); await W(200);
  await L.tap(p, '#v-today [data-act="settings"]'); await W(600);
  ok((await texts('#settings-body .about b'))[0] === 'Momentum ' + NEXT, 'neue Version läuft auch offline');

  console.log(log.length ? 'KONSOLE: ' + JSON.stringify(log, null, 1) : 'Konsole: keine Fehler');
  ok(log.length === 0, 'keine Konsolenfehler');
  await b.close();
  console.log(fails ? '\n' + fails + ' FEHLGESCHLAGEN' : '\nALLES BESTANDEN'); process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error('FAIL', e); process.exit(1); });
