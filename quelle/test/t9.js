// Gesten und Robustheit: Sheet ziehen, Hintergrund tippen, Doppeltipps, langer Text, Tab erneut tippen
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-16T10:00:00+01:00' });
  const { p, T, W, texts, shot, L } = t;
  const open = id => p.evaluate(id => document.querySelector(id).classList.contains('open'), id);
  const dragSheet = async (sel, dy) => {
    const box = await p.locator(sel + ' .grab').boundingBox();
    const cdp = await p.context().newCDPSession(p);
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + dy * i / 10 }] }); await W(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach();
  };

  console.log('Doppeltipps');
  const pb = await p.locator('#plus').boundingBox();
  await p.touchscreen.tap(pb.x + 27, pb.y + 27); await W(90); await p.touchscreen.tap(pb.x + 27, pb.y + 27); await W(700);
  ok(await open('#L-entry'), 'Doppeltipp auf + lässt das Sheet offen');
  await p.keyboard.type('Nur einmal speichern'); await T('#e-when [data-when="today"]'); await W(150);
  const sb = await p.locator('#e-save').boundingBox();
  await p.touchscreen.tap(sb.x + 100, sb.y + 20); await W(60); await p.touchscreen.tap(sb.x + 100, sb.y + 20); await W(60); await p.touchscreen.tap(sb.x + 100, sb.y + 20); await W(900);
  const rows = await texts('#today .rw .row-title');
  ok(rows.filter(x => x === 'Nur einmal speichern').length === 1, 'Dreifachtipp auf Speichern legt genau eine Aufgabe an (' + rows.length + ')');
  ok(!(await open('#L-entry')), 'und öffnet nichts darunter');

  console.log('Sheet schließen');
  await T('#v-today [data-act="settings"]'); await W(700);
  await dragSheet('#L-settings', 40); await W(600);
  ok(await open('#L-settings'), 'kurz ziehen: Sheet federt zurück');
  await dragSheet('#L-settings', 220); await W(700);
  ok(!(await open('#L-settings')), 'weit nach unten ziehen schließt das Sheet');
  await T('#v-today [data-act="settings"]'); await W(700);
  await p.touchscreen.tap(196, 30); await W(700);
  ok(!(await open('#L-settings')), 'Tipp neben das Sheet schließt es');
  await T('#today [data-act="plan"]'); await W(700);
  await T('#L-plan [data-act="closeTop"]'); await W(900);
  ok(!(await open('#L-plan')), 'X schließt');
  ok(await p.evaluate(() => !document.body.classList.contains('layered') && getComputedStyle(document.querySelector('#app')).transform === 'none' || getComputedStyle(document.querySelector('#app')).transform === 'matrix(1, 0, 0, 1, 0, 0)'), 'App steht wieder in voller Größe');

  console.log('Langer Text beim Erfassen');
  await T('#plus'); await W(500);
  await p.keyboard.type('Ein sehr langer Gedanke, der einfach nicht aufhören will und immer weiter geht, Zeile um Zeile, bis das Feld voll ist und man innen scrollen muss, damit die Bedienelemente darunter frei bleiben und nichts überlappt.');
  await W(400); await shot('90-erfassen-lang');
  const g = await p.evaluate(() => { const t = document.querySelector('#e-text').getBoundingClientRect(), s = document.querySelector('#e-seg').getBoundingClientRect(); return { textBottom: Math.round(t.bottom), segTop: Math.round(s.top), h: Math.round(t.height) }; });
  ok(g.textBottom <= g.segTop && g.h <= 85, 'Textfeld endet über dem Umschalter (' + JSON.stringify(g) + ')');
  const fit = await p.evaluate(() => { const s = document.querySelector('#L-entry .sheet').getBoundingClientRect(), b = document.querySelector('#e-save').getBoundingClientRect(), body = document.querySelector('#L-entry .sheet-body'); return { top: Math.round(s.top), sheetBottom: Math.round(s.bottom), saveBottom: Math.round(b.bottom), limit: document.documentElement.clientHeight - 336, scroll: body.scrollHeight - body.clientHeight }; });
  ok(fit.top >= 59 && fit.saveBottom < fit.sheetBottom && fit.sheetBottom <= fit.limit && fit.scroll <= 0, 'auch mit langem Text ist Speichern ganz sichtbar, ohne Scrollen (' + JSON.stringify(fit) + ')');
  await T('#e-when [data-when="today"]'); await W(100); await T('#e-save'); await W(2800);
  await T('#today .rw[data-swipe] .row-main'); await W(600); await T('#today .rw.open [data-act="editTask"]'); await W(700); await T('#e-text'); await W(900);
  const fit2 = await p.evaluate(() => { const s = document.querySelector('#L-entry .sheet').getBoundingClientRect(), b = document.querySelector('#e-save').getBoundingClientRect(), body = document.querySelector('#L-entry .sheet-body'); return { top: Math.round(s.top), sheetBottom: Math.round(s.bottom), saveBottom: Math.round(b.bottom), limit: document.documentElement.clientHeight - 336, scroll: body.scrollHeight - body.clientHeight }; });
  ok(fit2.top >= 59 && fit2.saveBottom < fit2.sheetBottom && fit2.sheetBottom <= fit2.limit && fit2.scroll <= 0, 'Bearbeiten mit Tastatur: Speichern ganz sichtbar (' + JSON.stringify(fit2) + ')');
  await shot('92-bearbeiten-lang-tastatur');
  await p.evaluate(() => document.activeElement.blur()); await W(500); await T('[data-act="eDelete"]'); await W(2800);

  console.log('Tab erneut tippen scrollt nach oben');
  for (let i = 0; i < 9; i++) await t.capture('Aufgabe ' + i, { when: 'today' });
  await W(2300);
  await p.evaluate(() => document.querySelector('#v-today .scroll').scrollTo(0, 600)); await W(200);
  await T('[data-tab="today"]'); await W(900);
  ok(await p.evaluate(() => document.querySelector('#v-today .scroll').scrollTop) < 5, 'Heute springt nach oben');
  await shot('91-heute-viele');

  console.log('Mitternacht mit offenem Sheet');
  await T('#plus'); await W(500); await p.keyboard.type('Kurz vor Mitternacht getippt');
  await t.jump('2026-11-17T00:00:05+01:00');
  ok(await open('#L-entry') && (await p.inputValue('#e-text')) === 'Kurz vor Mitternacht getippt', 'Eingabe bleibt beim Tageswechsel erhalten');
  await T('#e-when [data-when="today"]'); await W(100); await T('#e-save'); await W(700);
  const heads = await p.$$eval('#today .sec', s => s.map(x => x.querySelector('.sec-h').textContent + ':' + x.querySelectorAll('.rw').length));
  ok(heads.join(' ').includes('Heute1') && heads.join(' ').includes('Überfällig'), '„Heute“ meint den neuen Tag: ' + heads.join(' | '));
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
