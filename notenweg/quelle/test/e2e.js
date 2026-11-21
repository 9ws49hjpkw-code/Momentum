// Ende-zu-Ende: Start, Import des alten Lernstands, Speichern über Neustart, Offline, Export, Update-Angebot, alle Ansichten.
// Aufruf: node notenweg/quelle/test/e2e.js
const fs = require('fs'), path = require('path');
const { serve, launch, ctx, watch, shot, tap, sleep, ok, done, APP } = require('./lib');
const BACKUP = path.join(__dirname, 'fixtures', 'lernstand-artifact.json');

(async () => {
  const { srv, state, url } = await serve(8811);
  const b = await launch();
  const log = [];
  const c = await ctx(b, 'ipad');
  const p = await c.newPage(); watch(p, log);

  console.log('Start');
  await p.goto(url); await p.waitForSelector('.today');
  ok(await p.title() === 'Notenweg', 'Titel');
  ok(await p.locator('link[rel=manifest]').count() === 1, 'Manifest verlinkt');
  const heute = await p.locator('.today ol').innerText();
  ok(!/Aufwärmen/.test(heute) && await p.locator('[data-a="warm"]').count() === 0, 'Kein Aufwärmen in „Heute“');
  ok(/Blattspiel des Tages/.test(heute) && /Wiederholen/.test(heute), 'Wiederholen und Blattspiel sind noch da');
  ok(await p.locator('.hintbar').count() === 1, 'Installations-Tipp in Safari sichtbar');
  await shot(p, '01-start-ipad');
  await p.locator('.hintbar button').click();

  console.log('Import des alten Lernstands');
  await p.goto(url + '#profil'); await p.waitForSelector('#daten');
  await p.setInputFiles('input[data-f="imp-file"]', { name: 'kaputt.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"momentum","v":1}') });
  await p.waitForSelector('#imp-confirm .err'); ok(true, 'Fremde Sicherung wird abgelehnt');
  await p.setInputFiles('input[data-f="imp-file"]', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('nicht json') });
  await p.waitForFunction(() => /kein gültiges JSON/.test(document.querySelector('#imp-confirm').textContent)); ok(true, 'Kaputte Datei wird abgelehnt');
  await p.setInputFiles('input[data-f="imp-file"]', BACKUP);
  await p.waitForSelector('[data-a="imp-do"]');
  const sum = await p.locator('#imp-confirm').innerText();
  ok(/4 Lektionen bestanden/.test(sum), 'Zusammenfassung vor dem Ersetzen: ' + sum.replace(/\s+/g, ' '));
  await shot(p, '02-import-bestaetigen');
  await p.click('[data-a="imp-do"]');
  await p.waitForSelector('.today');
  ok(/4\/55 Lektionen/.test(await p.locator('#topmid').innerText()), 'Lernstand übernommen (4/55)');

  console.log('Speichern über Neustart');
  await sleep(800);
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForSelector('.today');
  ok(/4\/55 Lektionen/.test(await p.locator('#topmid').innerText()), 'Daten kommen aus IndexedDB, auch ohne localStorage');
  const persisted = await p.evaluate(async () => (await new Promise(r => { const q = indexedDB.open('notenweg'); q.onsuccess = () => { const t = q.result.transaction('kv').objectStore('kv').get('state'); t.onsuccess = () => r(t.result); }; })));
  ok(persisted && persisted.done && persisted.done['1.4'] && persisted.exDone, 'Unbekannte Felder (exDone) bleiben erhalten');

  console.log('Offline');
  await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  if (!(await p.evaluate(() => !!navigator.serviceWorker.controller))) { await p.reload(); await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 }); }
  ok(await p.evaluate(() => !!navigator.serviceWorker.controller), 'Service Worker aktiv');
  state.online = false; await c.setOffline(true);
  await p.reload(); await p.waitForSelector('.today', { timeout: 10000 });
  ok(/4\/55/.test(await p.locator('#topmid').innerText()), 'Start ohne Netz klappt, Daten da');
  const fontOk = await p.evaluate(() => document.fonts.check('600 20px "Cormorant Garamond"') && document.fonts.check('18px "EB Garamond"'));
  ok(fontOk, 'Schriften offline verfügbar (eingebettet)');
  await c.setOffline(false); state.online = true;

  console.log('Ansichten');
  const views = ['#pfad', '#wdh', '#training', '#blatt', '#wissen', '#glossar', '#ball', '#profil', '#werkzeuge', '#stuecke', '#stueck-mondschein', '#stueck-fuer-elise', '#lektion-1.5', '#lektion-1.1', '#folie-' ];
  for (const v of views) {
    let h = v;
    if (v === '#folie-') h = await p.evaluate(() => { const a = document.querySelector('a[href^="#folie-"]'); return a ? a.getAttribute('href') : '#wissen'; });
    await p.evaluate(x => { location.hash = x; }, h); await sleep(350);
    const err = await p.locator('.err').count();
    ok(err === 0, 'Ansicht ' + h + ' ohne Fehler');
  }
  await p.evaluate(() => { location.hash = '#wissen'; }); await sleep(300);
  const folio = await p.evaluate(() => { const a = document.querySelector('a[href^="#folie-"]'); return a ? a.getAttribute('href') : null; });
  if (folio) { await p.evaluate(x => { location.hash = x; }, folio); await sleep(300); ok(await p.locator('.err').count() === 0, 'Wissensfolie ' + folio); }
  await p.evaluate(() => { location.hash = '#lektion-1.5'; }); await sleep(500);
  await shot(p, '04-lektion');
  // Alle Stücke prüfen: in einem zweiten Kontext mit komplett freigeschaltetem Pfad
  {
    const c3 = await ctx(b, 'ipad'); const p3 = await c3.newPage(); watch(p3, log);
    await p3.goto(url); await p3.waitForSelector('.today');
    const ids = await p3.evaluate(() => { APP.LES.forEach(l => S.done[l.id] = { d: today(), score: 1 }); APP.CH.forEach(c => S.exams[c.id] = { pass: true, score: 1, d: today() }); return PIECES.filter(x => x.measures).map(x => x.id); });
    let bad = [];
    for (const id of ids) {
      await p3.evaluate(x => { location.hash = '#stueck-' + x; }, id);
      await p3.waitForFunction(() => document.querySelector('.scorewrap svg, .scorewrap .err'), null, { timeout: 8000 }).catch(() => {});
      if (await p3.locator('.scorewrap svg').count() === 0 || await p3.locator('.err').count()) bad.push(id);
    }
    ok(bad.length === 0, `Alle ${ids.length} Stücke werden gezeichnet` + (bad.length ? ': ' + bad.join(', ') : ''));
    await p3.evaluate(() => { location.hash = '#stueck-mondschein'; }); await sleep(700);
    await shot(p3, '03-stueck-mondschein');
    await c3.close();
  }

  console.log('Notizen werden beim Tippen gespeichert');
  await p.evaluate(() => { S.done['2.3'] = { d: today(), score: 1 }; location.hash = '#stueck-ode'; }); await sleep(400);
  await p.fill('textarea[data-f="pnote"]', 'T. 5 Fingersatz 3');
  await sleep(900);
  await p.reload(); await p.waitForSelector('textarea[data-f="pnote"]');
  ok(await p.inputValue('textarea[data-f="pnote"]') === 'T. 5 Fingersatz 3', 'Notiz überlebt Neuladen');

  console.log('Export');
  await p.evaluate(() => { location.hash = '#profil'; }); await p.waitForSelector('[data-a="exp-do"]');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-a="exp-do"]')]);
  const fp = await dl.path(); const ex = JSON.parse(fs.readFileSync(fp, 'utf8'));
  ok(ex.app === 'notenweg' && ex.state && ex.state.done['1.4'], 'Export enthält den Lernstand');
  ok(/^notenweg-sicherung-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()), 'Dateiname ' + dl.suggestedFilename());
  await shot(p, '05-profil-daten');

  console.log('Update wird angeboten, nicht erzwungen');
  const sw = fs.readFileSync(path.join(APP, 'sw.js'), 'utf8');
  const idx = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
  state.override['sw.js'] = sw.replace(/notenweg-b[^']*'/, "notenweg-bTEST'");
  state.override['index.html'] = idx.replace("window.NW_BUILD = '", "window.NW_BUILD = 'TEST ");
  await p.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r.update()));
  await p.waitForSelector('#updbar', { timeout: 15000 });
  ok(/Neue Version bereit/.test(await p.locator('#updbar').innerText()), 'Hinweis „Neue Version bereit“');
  ok(!/TEST/.test(await p.evaluate(() => window.NW_BUILD)), 'Alte Version läuft weiter, bis man tippt');
  await shot(p, '06-update');
  await Promise.all([p.waitForEvent('load', { timeout: 15000 }), p.click('#updbar [data-u="go"]')]);
  await p.waitForSelector('.today, #daten', { timeout: 10000 });
  ok(/TEST/.test(await p.evaluate(() => window.NW_BUILD)), 'Nach Tippen läuft die neue Version');
  ok(await p.evaluate(() => !!S.done['1.4'] && !!S.done['2.3']), 'Fortschritt nach Update erhalten');
  state.override = {};

  console.log('Kleine Bildschirme');
  for (const dev of ['ipadQuer', 'iphoneSE']) {
    const c2 = await ctx(b, dev); const p2 = await c2.newPage(); watch(p2, log);
    await p2.goto(url); await p2.waitForSelector('.today');
    const over = await p2.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(!over, dev + ': nichts ragt seitlich heraus');
    await shot(p2, '07-' + dev);
    await c2.close();
  }

  ok(log.length === 0, 'Keine Konsolenfehler' + (log.length ? ':\n    ' + log.join('\n    ') : ''));
  await b.close(); srv.close(); done();
})().catch(e => { console.error(e); process.exit(1); });
