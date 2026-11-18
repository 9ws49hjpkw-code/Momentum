// Audit: Tippflächen, Leer-Zustände, Bewegung reduzieren, Installationshinweis, lange Texte, viele Daten, kleines iPhone
const { start, ok } = require('./common');
const L = require('./lib');
(async () => {
  const t = await start({ time: '2026-11-16T10:00:00+01:00' });
  const { p, T, W, texts, shot } = t;

  const audit = async where => {
    const bad = await p.evaluate(() => {
      const out = [];
      const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !e.closest('[hidden]') && (!e.closest('.layer') || e.closest('.layer.open')) && (!e.closest('.view') || e.closest('.view.active')) && !e.closest('.fold.off'); };
      for (const e of document.querySelectorAll('button, label.li, label.chip, .search, .field, .addfree')) {
        if (!vis(e) || e.closest('#__sb') || (document.body.classList.contains('layered') && e.closest('#app'))) continue;
        if (e.id === 'toast' || e.closest('#update:not(.show)') || e.closest('#toast:not(.show)')) continue;
        const r = e.getBoundingClientRect();
        if (r.height < 43.5 || r.width < 43.5) out.push((e.id || e.className || e.tagName) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
      }
      return out;
    });
    ok(bad.length === 0, 'Tippflächen ≥ 44 px: ' + where + (bad.length ? ' → ' + [...new Set(bad)].join(', ') : ''));
  };
  const noOverflow = async where => {
    const w = await p.evaluate(() => { const v = document.querySelector('.view.active .scroll'); return v.scrollWidth - v.clientWidth; });
    ok(w <= 0, 'kein seitliches Überlaufen: ' + where);
  };

  console.log('Leer-Zustände');
  ok((await texts('#today .empty h3'))[0] === 'Nichts fällig', 'Heute leer');
  await audit('Heute leer');
  await T('[data-tab="tasks"]'); await W(400); ok((await texts('#tasks .empty h3'))[0] === 'Noch keine Aufgaben', 'Aufgaben leer'); await audit('Aufgaben leer');
  await T('[data-tab="ideas"]'); await W(400); ok((await texts('#ideas .empty h3'))[0] === 'Noch nichts geparkt', 'Ideen leer');
  await T('[data-tab="journal"]'); await W(400); ok((await texts('#j-list .jempty')).length === 1, 'Journal ohne frühere Einträge'); await audit('Journal leer');
  ok(await p.evaluate(() => document.querySelector('#j-past .search').hidden), 'Suche ist ausgeblendet, solange es nichts zu durchsuchen gibt');
  await T('[data-tab="today"]'); await W(300);
  await T('#today [data-act="plan"]'); await W(700); ok((await texts('#plan-tasks .jempty')).length === 1, 'Tag planen ohne Aufgaben'); await audit('Tag planen leer');
  await T('#L-plan [data-act="closeTop"]'); await W(600);

  console.log('Tippflächen in allen Bereichen');
  await t.seed();
  await audit('Heute');
  await T('#plus'); await W(700); await audit('Erfassen'); await T('#e-seg [data-type="idea"]'); await W(500); await audit('Erfassen Idee');
  await p.evaluate(() => document.activeElement.blur()); await W(300); await p.keyboard.press('Escape'); await W(600);
  await T('[data-tab="tasks"]'); await W(400); await audit('Aufgaben'); await noOverflow('Aufgaben');
  await T('#tasks .rw[data-swipe] .row-main'); await W(700); await audit('Aufgabe bearbeiten'); await T('#L-entry [data-act="closeTop"]'); await W(600);
  await T('[data-tab="ideas"]'); await W(400); await audit('Ideen');
  await T('#ideas .rw .row'); await W(700); await audit('Idee'); await T('#L-entry [data-act="closeTop"]'); await W(600);
  await T('[data-tab="today"]'); await W(300);
  await T('#today [data-act="plan"]'); await W(700); await T('#plan-tasks .pick', 0); await W(200); await audit('Tag planen'); await T('#L-plan [data-act="closeTop"]'); await W(600);
  await audit('Heute mit Ziel');
  await T('#v-today [data-act="settings"]'); await W(700); await audit('Einstellungen');
  await T('#settings-body .li', 0); await W(700); await audit('Thema'); await T('#topic-del'); await W(500); await audit('Dialog'); await T('#dlg-cancel'); await W(500);
  await T('#L-topic [data-act="closeTop"]'); await W(500); await T('#L-settings [data-act="closeTop"]'); await W(600);
  await t.jump('2026-11-23T08:00:00+01:00'); await audit('Heute mit fälligen Ideen'); await noOverflow('Heute');

  console.log('Alles erledigt / Filter leer');
  await T('[data-tab="tasks"]'); await W(400);
  await T('#tasks .filter .chip', 1); await W(300);
  for (let i = 0; i < 1; i++) { await T('#tasks .rw[data-swipe] .check, #tasks .og .check'); await W(1400); }
  ok((await texts('#tasks .empty h3'))[0] === 'Nichts offen', 'Filter ohne offene Aufgaben: ' + (await texts('#tasks .empty p'))[0]);
  await W(2500); await shot('80-filter-leer');
  await T('#tasks .filter .chip', 0); await W(300);
  let n = (await p.$$('#tasks .rw[data-swipe]')).length;
  while (n-- > 0) { await T('#tasks .rw[data-swipe] .check'); await W(1150); }
  ok((await texts('#tasks .empty h3'))[0] === 'Alles erledigt', 'Aufgaben: alles erledigt');
  await W(2600); await shot('81-alles-erledigt');

  console.log('Lange Texte und viele Daten');
  await T('#plus'); await W(400);
  await p.keyboard.type('Donaudampfschifffahrtsgesellschaftskapitänsmützenabzeichenverleihungszeremonie und dann noch ein richtig langer Satz, der über mehrere Zeilen geht, damit man sieht, ob das Feld mitwächst und nichts abgeschnitten wird, egal wie viel ich schreibe, bis zur Grenze von 280 Zeichen, die hier irgendwann erreicht ist, und noch mehr Text dazu');
  await W(400); await shot('82-erfassen-lang');
  ok((await p.inputValue('#e-text')).length === 280, 'Text ist auf 280 Zeichen begrenzt');
  const fit = await p.evaluate(() => { const s = document.querySelector('#L-entry .sheet').getBoundingClientRect(), b = document.querySelector('#e-save').getBoundingClientRect(); return { top: Math.round(s.top), saveBottom: Math.round(b.bottom), limit: document.documentElement.clientHeight - 336 }; });
  ok(fit.top >= 59 && fit.saveBottom <= fit.limit, 'Sheet bleibt zwischen Statusleiste und Tastatur, Speichern sichtbar (' + JSON.stringify(fit) + ')');
  await T('#e-when [data-when="today"]'); await W(100); await T('#e-save'); await W(700);
  await noOverflow('Aufgaben mit langem Wort'); await W(2300); await shot('83-langes-wort');
  await p.evaluate(async () => {
    const req = indexedDB.open('momentum'); const db = await new Promise(r => { req.onsuccess = () => r(req.result); });
    const tx = db.transaction(['tasks', 'journal'], 'readwrite');
    for (let i = 0; i < 400; i++) { const d = new Date(Date.UTC(2026, 10, 20 + (i % 60))).toISOString().slice(0, 10); tx.objectStore('tasks').put({ id: 'bulk' + i, text: 'Massentest Aufgabe ' + i, due: d, now: false, prio: i % 3, topicId: null, createdAt: 1e12 + i, done: i % 4 === 0, doneAt: i % 4 === 0 ? 1.79e12 + i : null }); }
    for (let i = 0; i < 200; i++) { const d = new Date(Date.UTC(2026, 3, 1 + i)).toISOString().slice(0, 10); tx.objectStore('journal').put({ date: d, learned: 'Eintrag ' + i + ' mit etwas Text zum Durchsuchen.', good: '', free: '', updatedAt: 1 }); }
    await new Promise(r => { tx.oncomplete = r; });
  });
  const t0 = Date.now();
  await p.reload(); await p.waitForSelector('body.ready'); const loadMs = Date.now() - t0; await p.waitForSelector('body.live'); await L.decorate(p); await W(300);
  ok(loadMs < 1500, 'Start mit 400 Aufgaben und 200 Journal-Einträgen in ' + loadMs + ' ms');
  await T('[data-tab="tasks"]'); await W(400);
  const rt = await p.evaluate(() => { const s = performance.now(); document.querySelector('#tasks .filter .chip').click(); return Math.round(performance.now() - s); });
  ok(rt < 120, 'Liste mit 300 offenen Aufgaben zeichnet in ' + rt + ' ms');
  await T('[data-tab="journal"]'); await W(400);
  ok((await p.$$('#j-list .jitem')).length === 30 && (await texts('#j-list .more'))[0] === 'Ältere anzeigen', 'Journal zeigt 30 Einträge und „Ältere anzeigen“');
  await p.fill('#j-search', 'Eintrag 137'); await W(300);
  ok((await p.$$('#j-list .jitem')).length === 1, 'Suche findet auch ältere, nicht angezeigte Einträge');

  console.log(t.log.length ? 'KONSOLE ' + JSON.stringify(t.log) : '');
  await t.end();

  console.log('\nBewegung reduzieren');
  const r = await start({ time: '2026-11-16T10:00:00+01:00', port: 8767, ctx: { reducedMotion: 'reduce' } });
  await r.capture('Ruhig erledigen', { when: 'today' });
  const dur = await r.p.evaluate(() => { document.querySelector('#plus').click(); const s = getComputedStyle(document.querySelector('#L-entry .sheet')); return { d: s.transitionDuration, tr: s.transform, prop: s.transitionProperty }; });
  ok(dur.tr === 'none' && dur.prop === 'opacity', 'Sheets blenden nur ein, ohne Fahrt (' + dur.prop + ' ' + dur.d + ')');
  await r.W(300); await r.p.keyboard.press('Escape'); await r.W(400);
  const t1 = Date.now(); await r.T('#today .rw[data-swipe] .check'); await r.p.waitForFunction(() => document.querySelector('#toast').classList.contains('show')); const dt = Date.now() - t1;
  ok(dt < 400, 'Abhaken ohne Animation in ' + dt + ' ms, Hinweis kommt sofort');
  ok((await r.texts('#today .empty h3'))[0] === 'Nichts fällig', 'Funktion bleibt gleich');
  await r.end();

  console.log('\nInstallationshinweis in Safari');
  const s = await L.serve(L.APP, 8768);
  const b = await L.launch(), c = await L.ctx(b);
  await c.addInitScript(() => { Object.defineProperty(Navigator.prototype, 'standalone', { get: () => false, configurable: true }); });
  const p2 = await c.newPage(); const log2 = []; L.watch(p2, log2);
  await p2.goto(s.url); await p2.waitForSelector('body.live'); await L.decorate(p2); await p2.waitForTimeout(1600);
  ok((await p2.$$('#v-today .notice')).length === 1, 'Hinweis „Erst installieren“ erscheint im Browser');
  ok(await p2.evaluate(() => !!document.querySelector('link[rel="apple-touch-startup-image"]')), 'Startbild für den Home-Bildschirm wird erzeugt');
  await L.shot(p2, '84-install-hinweis');
  await L.tap(p2, '#v-today .notice .x'); await p2.waitForTimeout(300);
  ok((await p2.$$('#v-today .notice')).length === 0, 'Hinweis lässt sich schließen');
  ok(log2.length === 0, 'keine Konsolenfehler' + (log2.length ? ' ' + JSON.stringify(log2) : ''));
  await c.close();

  console.log('\nKleines iPhone (375×667)');
  const c3 = await L.ctx(b, { viewport: { width: 375, height: 667 } }); const p3 = await c3.newPage();
  await p3.addInitScript(() => { window.__kbSmall = true; });
  await p3.goto(s.url); await p3.waitForSelector('body.live'); await p3.addStyleTag({ content: ':root{--sat:20px!important}' }); await p3.evaluate(() => { window.__kbH = 260; }); await p3.waitForTimeout(300);
  await L.tap(p3, '#plus'); await p3.waitForTimeout(900); await p3.keyboard.type('Passt auch hier');
  const f3 = await p3.evaluate(() => { const s = document.querySelector('#L-entry .sheet').getBoundingClientRect(), b = document.querySelector('#e-save').getBoundingClientRect(); return { top: Math.round(s.top), saveBottom: Math.round(b.bottom), limit: document.documentElement.clientHeight - 260 }; });
  const sc3 = await p3.evaluate(() => { const b = document.querySelector('#L-entry .sheet-body'); return b.scrollHeight - b.clientHeight; });
  ok(sc3 <= 0, 'ohne Scrollen im Sheet (' + sc3 + ')');
  ok(f3.top >= 20 && f3.saveBottom <= f3.limit, 'Erfassen passt über die Tastatur (' + JSON.stringify(f3) + ')');
  await L.shot(p3, '85-klein');
  await b.close(); s.srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
