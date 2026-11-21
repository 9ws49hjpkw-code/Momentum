// 1.2.0: Überfällig soll wehtun – roter Rand nach Stufen, Rot in der Startanimation, Verschieben unbequem, Zähler am Icon
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-18T09:00:00+01:00' });
  const { p, T, W, capture, texts, shot, jump, L } = t;
  const lvl = () => p.evaluate(() => ({ l: document.querySelector('#alarm').dataset.l, o: getComputedStyle(document.querySelector('#alarm')).opacity }));

  console.log('Roter Rand');
  ok((await lvl()).l === '0', 'ohne Überfälliges kein Rand');
  await capture('Kleinkram', { when: 'today', prio: 0 });
  await jump('2026-11-19T09:00:00+01:00'); await W(400);
  let a = await lvl();
  ok(a.l === '1' && +a.o > .9, 'eine niedrige überfällig → Stufe 1, sichtbar (' + JSON.stringify(a) + ')');
  await shot('140-rand-1');
  await capture('Steuer', { when: 'today', prio: 2 });
  await capture('Wäsche', { when: 'today', prio: 1 });
  await jump('2026-11-20T09:00:00+01:00'); await W(400);
  a = await lvl();
  ok(a.l === '2', '1 + 3 + 2 = 6 → Stufe 2 (' + a.l + ')');
  await shot('141-rand-2');
  await T('#today [data-act="plan"]'); await W(700);
  await T('#plan-input'); await W(300); await p.keyboard.type('Bewerbung'); await p.keyboard.press('Enter'); await W(300);
  await p.evaluate(() => document.activeElement.blur()); await W(300);
  await T('#L-plan [data-act="closeTop"]'); await W(600);
  await jump('2026-11-21T09:00:00+01:00'); await W(400);
  a = await lvl();
  ok(a.l === '3', 'überfälliges Tagesziel → Stufe 3 (' + a.l + ')');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#alarm'), '::after').animationName) === 'none', 'Stufe 3: keine Welle zur Mitte (1.3.1)');
  await shot('142-rand-3');
  await T('#today .og .check'); await W(1400);
  a = await lvl();
  ok(a.l === '2', 'Ziel erledigt → Rand wird schwächer (' + a.l + ')');

  console.log('Start mit Überfälligem');
  await p.reload(); await p.waitForSelector('body.go');
  await W(1050);
  const intro = await p.evaluate(() => { const e = document.querySelector('#intro'); return e ? { over: e.classList.contains('over'), hello: e.querySelector('#in-hello').textContent } : null; });
  ok(intro && intro.over && /^3 überfällig/.test(intro.hello), 'Startbild rot, Begrüßung nennt die Zahl: ' + JSON.stringify(intro));
  await shot('143-start-rot');
  await p.waitForSelector('body.live'); await L.decorate(p); await W(400);
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
