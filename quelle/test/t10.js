// 1.1: Lichtlinie als Tagesbilanz, Kreise nach Priorität, Rot für Überfälliges, Themen-Tönung, mehrzeilige Ideen, Abhak-Licht
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-16T09:00:00+01:00' });
  const { p, T, W, shot, capture, jump, texts } = t;

  console.log('\nÜberfällige Aufgaben');
  await capture('Steuer-Unterlagen sortieren', { when: 'today', prio: 2 });
  await capture('Paket zur Post bringen', { when: 'today', topic: 2 });
  await capture('Alte Mails löschen', { when: 'today', prio: 0 });
  await W(2400);
  await jump('2026-11-17T08:00:00+01:00');
  await capture('Zähne putzen', { when: 'today', prio: 2 });
  await capture('Gym', { when: 'today', topic: 2 });
  await capture('Etüde Takt 9 bis 24', { when: 'today', topic: 0 });
  await capture('Ski-Helm anschauen', { when: 'today', prio: 0 });
  await capture('Bewerbung abschicken', { when: 'date', date: '2026-11-20', topic: 1 });
  await W(2400);
  const over = await p.$$eval('#today .over-g .rw', e => e.map(x => x.className));
  ok(over.length === 3 && over.every(c => / od/.test(c)), 'überfällige Zeilen sind rot markiert');
  ok(await p.$eval('#today .over-g .rw.p2 .check i', e => getComputedStyle(e).borderTopColor) === 'rgb(255, 59, 85)', 'überfällig + hoch: kräftig roter Kreis');
  const n1 = await p.$eval('#today .group:not(.over-g) .rw.p1 .check i', e => getComputedStyle(e).borderTopColor);
  ok(/rgba?\(255, 255, 255/.test(n1), 'Normal: weißer Kreis');
  ok(await p.$$eval('#today .rw.tp-on', e => e.length) >= 2, 'Aufgaben mit Thema sind farbig getönt');
  const meta = await texts('#today .over-g .rw.p2 .row-meta');
  ok(meta[0].indexOf('Hoch') >= 0, 'Priorität bleibt bei Überfälligem sichtbar');

  console.log('\nLichtlinie');
  const bv = () => p.$eval('#v-today .beam', e => ({ a: e.style.getPropertyValue('--a'), o: e.style.getPropertyValue('--o'), cap: e.querySelector('.b-cap').textContent, calm: e.classList.contains('calm') }));
  let b = await bv();
  ok(b.a === '0%' && b.o === '42.9%' && !b.calm, 'Bilanz: 3 von 7 überfällig (' + b.o + ')');
  ok(b.cap === '0/7 erledigt · 3 überfällig', 'Beschriftung: ' + b.cap);
  await shot('A1-heute-bilanz');
  await T('#today .group:not(.over-g) .rw .check', 0); await W(150);
  ok(await p.evaluate(() => !!document.querySelector('#fx')), 'Abhak-Licht erscheint');
  await shot('A2-abhaken-licht');
  await W(3000);
  b = await bv();
  ok(b.cap === '1/7 erledigt · 3 überfällig', 'Bilanz zählt Erledigtes: ' + b.cap);
  await T('#today .over-g .rw .check', 0); await W(200);
  await shot('A3-ueberfaellig-erloesen');
  await W(3000);
  b = await bv();
  ok(b.cap === '2/7 erledigt · 2 überfällig', 'Überfälliges erledigt: ' + b.cap);

  console.log('\nBereiche');
  await T('[data-tab="tasks"]'); await W(900);
  await shot('A4-aufgaben');
  const pos = await p.$eval('#v-tasks .b-dot', e => e.getBoundingClientRect().left);
  ok(pos > 100 && pos < 180, 'Aufgaben: Lichtpunkt mittig links (' + Math.round(pos) + ' px)');
  await T('[data-tab="ideas"]'); await W(900);
  const pos2 = await p.$eval('#v-ideas .b-dot', e => e.getBoundingClientRect().left);
  ok(pos2 > 220 && pos2 < 290, 'Ideen: Lichtpunkt mittig rechts (' + Math.round(pos2) + ' px)');

  console.log('\nMehrzeilige Ideen');
  await T('#plus'); await W(350);
  await T('#e-seg [data-type="idea"]'); await W(400);
  const long = 'Erste Zeile der Idee';
  await p.keyboard.type(long); await p.keyboard.press('Enter'); await p.keyboard.type('Zweite Zeile mit mehr Gedanken. ' + 'Noch mehr Text. '.repeat(25));
  ok(await p.$eval('#L-entry', e => e.classList.contains('open')), 'Enter speichert eine Idee nicht, sondern macht eine neue Zeile');
  const v = await p.inputValue('#e-text');
  ok(v.indexOf('\n') > 0 && v.length > 400, 'Idee: Zeilenumbruch und kein Limit (' + v.length + ' Zeichen)');
  await shot('A5-idee-mehrzeilig');
  await T('#e-save'); await W(700);
  const saved = await p.evaluate(() => Array.from(document.querySelectorAll('#ideas .row-title')).map(e => e.textContent));
  ok(saved.some(s => s.indexOf('Erste Zeile der Idee\nZweite Zeile') === 0), 'Absatz bleibt gespeichert');
  await p.reload(); await p.waitForSelector('body.live'); await t.L.decorate(p); await W(400);
  await T('[data-tab="ideas"]'); await W(500);
  const after = await p.evaluate(() => Array.from(document.querySelectorAll('#ideas .row-title')).map(e => e.textContent));
  ok(after.some(s => s.length > 400 && s.indexOf('\n') > 0), 'Lange Idee übersteht Neuladen');
  await shot('A6-ideen');
  await T('#plus'); await W(350);
  await p.keyboard.type('Aufgabe mit Enter');
  await T('#e-when [data-when="today"]'); await W(100);
  await p.keyboard.press('Enter'); await W(600);
  ok(!(await p.$eval('#L-entry', e => e.classList.contains('open'))), 'Aufgabe: Enter speichert weiterhin');

  console.log('\nTagesziel');
  await T('[data-tab="today"]'); await W(500);
  await T('#today [data-act="plan"]'); await W(700);
  await T('#plan-tasks .pick', 0); await W(200);
  await T('#L-plan .sheet-foot .btn'); await W(800);
  await T('#today .goal .check', 0); await W(220);
  await shot('A7-tagesziel-licht');
  await W(1200);

  console.log('\nThemenfarben');
  await T('#v-today [data-act="settings"]'); await W(600);
  await T('#settings-body .li.add'); await W(600);
  await p.evaluate(() => document.activeElement.blur()); await W(400);
  await shot('A8-farben');
  const hues = await p.$$eval('#topic-hues .hue', e => e.map(x => +x.style.getPropertyValue('--h')));
  let minGap = 360;
  for (let i = 0; i < hues.length; i++) for (let j = i + 1; j < hues.length; j++) { const d = Math.abs(hues[i] - hues[j]); minGap = Math.min(minGap, d, 360 - d); }
  ok(hues.length === 8 && minGap >= 24, 'Farben liegen weit auseinander (min. ' + minGap + '°)');
  await t.end();
})().catch(e => { console.error(e); process.exit(1); });
