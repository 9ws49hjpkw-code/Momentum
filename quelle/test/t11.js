// 1.1.1: Überfällige Tagesziele im eigenen Feld, Farbstufen, Start-Animation, Abhak-Stufen
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-16T09:00:00+01:00' });
  const { p, T, W, shot, capture, jump, texts } = t;

  console.log('\nStart-Animation');
  await p.reload(); await p.waitForSelector('body.go');
  const hello = await p.evaluate(() => { const e = document.querySelector('#in-hello'); return e ? e.textContent : '(weg) ' + document.body.className; });
  ok(hello === 'Guten Morgen', 'Begrüßung passt zur Uhrzeit: ' + hello);
  for (const ms of [250, 500, 800, 1050]) { await W(ms === 250 ? 250 : ms - [250, 500, 800, 1050][[250, 500, 800, 1050].indexOf(ms) - 1]); await shot('B0-start-' + ms); }

  await p.waitForSelector('body.live'); await t.L.decorate(p); await W(300);
  ok(await p.evaluate(() => !document.querySelector('#intro')), 'Start-Animation räumt sich ab');
  await p.reload(); await p.waitForSelector('body.ready'); await W(120);
  await p.touchscreen.tap(196, 400); await W(700);
  ok(await p.evaluate(() => !document.querySelector('#intro') && document.body.classList.contains('live')), 'Tippen überspringt die Start-Animation');
  await t.L.decorate(p); await W(1200);

  console.log('\nTagesziele von gestern');
  await capture('Bewerbung schreiben', { when: 'today', prio: 1 });
  await capture('Steuer machen', { when: 'today', prio: 2 });
  await capture('Wäsche', { when: 'today', prio: 1 });
  await capture('Keller', { when: 'today', prio: 0 });
  await W(2400);
  await T('#today [data-act="plan"]'); await W(700);
  await T('#plan-tasks .pick', 1); await W(200);
  await T('#plan-input'); await W(400); await p.keyboard.type('30 Minuten Klavier'); await p.keyboard.press('Enter'); await W(300);
  await T('#plan-input'); await W(200); await p.keyboard.type('Zimmer aufräumen'); await p.keyboard.press('Enter'); await W(300);
  await p.evaluate(() => document.activeElement.blur()); await W(300);
  await T('#L-plan .sheet-foot .btn'); await W(800);
  ok((await texts('#today .goals .goal-text')).length === 3, 'drei Tagesziele gesetzt');
  await jump('2026-11-17T08:00:00+01:00'); await W(400);
  const og = await texts('#today .ogoals .og-t');
  ok(og.length === 3, 'am nächsten Tag stehen alle drei unter „Ziele überfällig“: ' + og.join(' | '));
  const order = await p.evaluate(() => Array.from(document.querySelector('#today').children).map(e => e.className.split(' ')[0]));
  ok(order.indexOf('ogoals') === 1 && order.indexOf('ogoals') < order.indexOf('sec'), 'Feld steht direkt unter den Tageszielen, über allem anderen: ' + order.join(','));
  ok(og.includes('Bewerbung schreiben') && !(await texts('#today .over-g .row-title')).includes('Bewerbung schreiben'), 'Aufgabe als Ziel taucht nicht doppelt auf');
  ok((await texts('#today .og-meta'))[0] === 'Ziel von gestern', 'Hinweis „Ziel von gestern“');
  const col = sel => p.$eval(sel, e => { const s = getComputedStyle(e); return { c: s.borderTopColor, w: parseFloat(s.borderTopWidth) }; });
  const cg = await col('#today .og .check i'), ch = await col('#today .over-g .rw.p2 .check i'), cn = await col('#today .over-g .rw.p1 .check i'), cl = await col('#today .over-g .rw.p0 .check i');
  ok(cg.w > ch.w && ch.w > cn.w && cg.c === 'rgb(255, 45, 85)', 'Stufen: Ziel ' + cg.c + ' ' + cg.w + 'px > Hoch ' + ch.c + ' ' + ch.w + 'px > Normal ' + cn.c);
  ok(/0\.42\)$/.test(cl.c), 'Niedrig ist gedämpft: ' + cl.c);
  ok((await texts('#v-today .b-cap'))[0].indexOf('überfällig') > 0, 'Lichtlinie zählt die offenen Ziele: ' + (await texts('#v-today .b-cap'))[0]);
  await shot('B1-ziele-ueberfaellig');
  await T('[data-tab="tasks"]'); await W(600);
  ok((await texts('#tasks .ogoals .og-t')).length === 3, 'auch in Aufgaben ganz oben');
  await shot('B2-aufgaben-ziele');
  await T('[data-tab="today"]'); await W(500);

  console.log('\nErledigen, auf heute legen, verwerfen');
  await T('#today .og .check', 0); await W(260);
  await shot('B3-ziel-ueberfaellig-erledigen');
  await W(1300);
  ok((await texts('#today .ogoals .og-t')).length === 2, 'Erledigen nimmt es aus dem Feld');
  await T('#toast button'); await W(500);
  ok((await texts('#today .ogoals .og-t')).length === 3, 'Rückgängig holt es zurück');
  await W(3500);
  const t2 = (await texts('#today .ogoals .og-t'))[1];
  await T('#today .og .goal-text', 1); await W(600);
  await shot('B4-ziel-dialog');
  await T('#dlg-ok'); await W(700);
  ok((await texts('#today .goals .goal-text')).includes(t2), '„Auf heute legen“: ' + t2 + ' ist wieder Tagesziel');
  ok(!(await texts('#today .ogoals .og-t')).includes(t2), 'und steht nicht mehr unter überfällig');
  await W(3500);
  const t3 = (await texts('#today .ogoals .og-t'))[0];
  await T('#today .og .goal-text', 0); await W(600);
  await T('#dlg-alt'); await W(700);
  ok(!(await texts('#today .ogoals .og-t')).includes(t3), 'Verwerfen: ' + t3 + ' ist weg');

  console.log('\nÜbersteht Neuladen und Backup');
  const before = await texts('#today .ogoals .og-t');
  await p.reload(); await p.waitForSelector('body.live'); await t.L.decorate(p); await W(400);
  ok(JSON.stringify(await texts('#today .ogoals .og-t')) === JSON.stringify(before), 'Stand bleibt nach Neuladen: ' + before.join(' | '));
  await T('#v-today [data-act="settings"]'); await W(600);
  const [dl] = await Promise.all([p.waitForEvent('download'), T('#settings-body [data-act="exportData"]')]);
  const file = require('path').join(t.L.TMP, 'export-11.json');
  await dl.saveAs(file); await W(400);
  await p.setInputFiles('#import-file', file); await W(700); await T('#dlg-ok'); await W(900);
  await T('#L-settings [data-act="closeTop"]'); await W(600);
  ok(JSON.stringify(await texts('#today .ogoals .og-t')) === JSON.stringify(before), 'Export und Import behalten erledigt, verschoben und verworfen');

  console.log('\nAbhak-Licht nach Stufe');
  await jump('2026-11-17T09:00:00+01:00');
  await capture('Normal heute', { when: 'today', prio: 1 });
  await capture('Hoch heute', { when: 'today', prio: 2 });
  await W(2400);
  await T('#today .group:not(.over-g) .rw.p2 .check', 0); await W(200); await shot('B5-hoch-abhaken');
  await W(2500);
  await T('#today .goals .goal .check', 0); await W(280); await shot('B6-tagesziel-abhaken');
  await W(450); await shot('B7-tagesziel-abhaken-spaet');
  await W(2500);
  await t.end();
})().catch(e => { console.error(e); process.exit(1); });
