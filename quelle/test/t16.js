// 1.2.0: Design & Bewegung – Lichtlinie, Eck-Ringe, Seitenwechsel im HUD-Stil, leise Schwingung, Bewegung reduzieren
const { start, ok } = require('./common');
const L = require('./lib');
(async () => {
  const t = await start({ time: '2026-11-19T10:00:00+01:00' });
  const { p, T, W, capture, shot } = t;
  await capture('Wäsche', { when: 'today' });
  await capture('Steuer', { when: 'today', prio: 2 });
  await W(2300);
  await T('#today .rw[data-swipe] .check'); await W(1400);

  console.log('Lichtlinie und Eck-Ringe');
  const beam = await p.evaluate(() => { const d = getComputedStyle(document.querySelector('#v-today .b-done')); return { h: d.height, glow: d.boxShadow.length > 40 }; });
  ok(beam.h === '2px' && beam.glow, 'Lichtlinie: 2 px, stärkerer Glanz');
  const ring = () => p.evaluate(() => getComputedStyle(document.querySelector('#ambient'), '::before').borderTopColor);
  const r1 = await ring();
  await T('[data-tab="tasks"]'); await W(1200);
  const r2 = await ring();
  ok(r1 !== r2 && r2.startsWith('rgba(150, 132, 255'), 'Eck-Ringe leuchten in der Bereichsfarbe: ' + r1 + ' → ' + r2);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.amb-glow')).animationName === 'amb'), 'Schimmer hinter den Ringen');

  console.log('Seitenwechsel');
  await T('[data-tab="ideas"]'); await W(120);
  const mid = await p.evaluate(() => ({ hud: document.querySelector('#hud').classList.contains('run'), rev: document.querySelector('#v-ideas').classList.contains('reveal') }));
  ok(mid.hud && mid.rev, 'Scanlinie läuft, Ansicht baut sich auf');
  await shot('160-wechsel');
  await W(500);
  ok(await p.evaluate(() => document.querySelector('#v-ideas').classList.contains('active') && !document.querySelector('#hud').classList.contains('run') && getComputedStyle(document.querySelector('#v-ideas')).pointerEvents === 'auto'), 'nach 600 ms fertig und bedienbar');
  for (let i = 0; i < 6; i++) { await T('[data-tab="' + ['today', 'tasks', 'journal'][i % 3] + '"]'); await W(60); }
  await T('[data-tab="today"]'); await W(700);
  ok(await p.evaluate(() => document.querySelectorAll('.view.active').length === 1 && document.querySelector('#v-today').classList.contains('active')), 'schnelles Hin und Her: genau eine Ansicht aktiv');

  console.log('Leise Schwingung');
  const anim = await p.evaluate(() => { const g = document.querySelector('#today > .goals'); return g.getAnimations().map(a => a.animationName); });
  ok(anim.includes('drift'), 'Tagesziele schweben minimal: ' + anim.join());
  await T('#plus'); await W(600);
  ok(await p.evaluate(() => document.querySelector('#today > .goals').getAnimations().every(a => a.playState === 'paused')), 'beim Erfassen pausiert alles');
  await p.keyboard.press('Escape'); await W(600);
  await shot('161-heute-bewegung');

  console.log('Bewegung reduzieren');
  const c2 = await L.ctx(t.b, { reducedMotion: 'reduce' }), p2 = await c2.newPage(), log2 = [];
  L.watch(p2, log2);
  await p2.goto(t.url); await p2.waitForSelector('body.live'); await p2.waitForTimeout(800);
  ok(await p2.evaluate(() => document.querySelector('#today > .goals').getAnimations().length === 0 && document.querySelector('.amb-glow').getAnimations().length === 0), 'keine laufende Animation');
  await L.tap(p2, '[data-tab="tasks"]'); await p2.waitForTimeout(60);
  ok(await p2.evaluate(() => !document.querySelector('#hud').classList.contains('run') && !document.querySelector('.view.reveal')), 'kein HUD-Wechsel');
  ok(log2.length === 0, 'keine Fehler mit reduzierter Bewegung');
  await c2.close();
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
