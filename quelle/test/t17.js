// 1.2.1: Startbild mit Überfälligem länger, Rand-Wellen nur einmal beim Öffnen, Sheet verrutscht nicht seitlich, Töne
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-18T09:00:00+01:00' });
  const { p, T, W, capture, jump, L } = t;

  console.log('Sheet bleibt beim Markieren an seinem Platz');
  await capture('Termin Mercedes (Reifen & Felgen prüfen lassen, Winter) + Reifen Garage', { when: 'today', prio: 0, topic: 0 });
  await W(2300);
  await T('#today .rw .row-main'); await W(600); await T('#today .rw.open [data-act="editTask"]'); await W(700);
  const sw = await p.evaluate(() => { const b = document.querySelector('#e-text').closest('.sheet-body'); return [b.scrollWidth, b.clientWidth]; });
  ok(sw[0] <= sw[1], 'Sheet-Inhalt nicht breiter als das Sheet (' + sw.join(' / ') + ')');
  await T('#e-text'); await W(200);
  const sl = await p.evaluate(async () => { const b = document.querySelector('#e-text').closest('.sheet-body'); b.style.overflowX = 'auto'; b.scrollLeft = 80; await new Promise(r => setTimeout(r, 120)); const v = b.scrollLeft; b.style.overflowX = ''; return v; });
  ok(sl === 0, 'seitliches Verschieben wird sofort zurückgenommen (' + sl + ')');
  await p.evaluate(() => document.activeElement.blur()); await W(300);
  await T('#L-entry [data-act="closeTop"]'); await W(600);

  console.log('Rand-Wellen nur einmal');
  await T('#today [data-act="plan"]'); await W(700);
  await T('#plan-input'); await W(300); await p.keyboard.type('Bewerbung'); await p.keyboard.press('Enter'); await W(300);
  await p.evaluate(() => document.activeElement.blur()); await W(300);
  await T('#L-plan [data-act="closeTop"]'); await W(600);
  await jump('2026-11-19T09:00:00+01:00'); await W(400);
  const st = () => p.evaluate(() => { const a = document.querySelector('#alarm'); return { l: a.dataset.l, pulse: a.classList.contains('pulse'), anim: getComputedStyle(a, '::before').animationName, it: getComputedStyle(a, '::before').animationIterationCount, wave: getComputedStyle(a, '::after').animationName }; });
  let s = await st();
  ok(s.l === '3' && s.pulse && s.anim === 'al-breathe' && s.it === '1' && s.wave === 'none', 'Stufe 3: einmal atmen, keine Welle (' + JSON.stringify(s) + ')');
  await W(3000);
  s = await st();
  ok(!s.pulse && s.anim === 'none', 'danach ruhig, keine Dauer-Bewegung (' + JSON.stringify(s) + ')');

  console.log('Start mit Überfälligem: länger lesbar');
  await p.reload(); await p.waitForSelector('body.go');
  const t0 = Date.now();
  await p.waitForFunction(() => /überfällig/.test((document.querySelector('#in-hello') || {}).textContent || ''));
  await p.waitForSelector('body.enter', { timeout: 8000 });
  const shown = Date.now() - t0;
  ok(shown >= 2200, 'Startbild mit Zahl bleibt ≥ 2,2 s (' + shown + ' ms)');
  await p.waitForSelector('body.live'); await L.decorate(p); await W(100);
  ok(await p.evaluate(() => document.querySelector('#alarm').classList.contains('pulse')), 'beim Betreten: einmal sanft atmen');
  await W(3000);
  ok(await p.evaluate(() => !document.querySelector('#alarm').classList.contains('pulse')), 'danach ruhig');

  console.log('Töne');
  await p.addInitScript(() => {
    const C = window.AudioContext; window.__osc = 0;
    window.AudioContext = function () { const c = new C(); const o = c.createOscillator.bind(c); c.createOscillator = () => { window.__osc++; return o(); }; return c; };
  });
  await p.reload(); await p.waitForSelector('body.go'); await W(300);
  await p.mouse.click(200, 400); await W(600);
  ok(await p.evaluate(() => window.__osc === 0), 'kein Start-Klang (' + await p.evaluate(() => window.__osc) + ')');
  await p.waitForSelector('body.live'); await L.decorate(p); await W(400);
  await T('[data-tab="tasks"]'); await W(300); await T('[data-tab="today"]'); await W(400);
  ok(await p.evaluate(() => window.__osc === 0), 'Navigieren ist still');
  await capture('Kurz testen', { when: 'today' }); await W(2300);
  const n0 = await p.evaluate(() => window.__osc);
  ok(n0 <= 1, 'Speichern: höchstens ein kurzer Klick (' + n0 + ')');
  await T('#today .rw[data-swipe] .check'); await W(1400);
  const n1 = await p.evaluate(() => window.__osc);
  ok(n1 - n0 === 1, 'Abhaken: genau ein kurzer Klick (' + (n1 - n0) + ')');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
