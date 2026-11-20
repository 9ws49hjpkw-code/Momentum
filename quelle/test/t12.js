// 1.2.0 A1: Tastatur schiebt nichts mehr aus dem Bild (simuliert: visualViewport-Attrappe inkl. iOS-Eigenverschiebung)
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-19T10:00:00+01:00' });
  const { p, T, W, capture } = t;
  const vis = sel => p.evaluate(sel => {
    const e = document.querySelector(sel), r = e.getBoundingClientRect(), vv = window.visualViewport;
    const top = vv.offsetTop, bot = vv.offsetTop + vv.height;
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), vTop: Math.round(top), vBot: Math.round(bot), off: vv.offsetTop, ok: r.top >= top + 50 && r.top < bot - 30 };
  }, sel);
  const iosShift = (px, honour) => p.evaluate(([px, honour]) => {
    window.__vv.offsetTop = px;
    window.__scrolled = 0;
    window.scrollTo = () => { window.__scrolled++; if (honour) { window.__vv.offsetTop = 0; window.__vvFire('scroll'); } };
    window.__vvFire('scroll');
  }, [px, honour]);

  const openEdit = async () => { if (!(await p.$('#today .rw.open'))) { await T('#today .rw .row-main'); await W(600); } await T('#today .rw.open [data-act="editTask"]'); await W(700); };
  await capture('Drucken', { when: 'today' });
  await W(2300);

  console.log('Aufgabe bearbeiten, dann in den Text tippen');
  await openEdit();
  await T('#e-text'); await W(300);
  await iosShift(220, true); await W(700);
  let v = await vis('#e-text');
  ok(await p.evaluate(() => window.__scrolled > 0 && window.__vv.offsetTop === 0), 'iOS-Eigenverschiebung wird zurückgenommen');
  ok(v.ok, 'Textfeld sichtbar zwischen oberem Rand und Tastatur (' + JSON.stringify(v) + ')');
  ok(await p.evaluate(() => document.body.classList.contains('kb-open')), 'Tastatur erkannt');
  await p.evaluate(() => document.activeElement.blur()); await W(400);
  await T('#L-entry [data-act="closeTop"]'); await W(600);

  console.log('Wenn iOS die Verschiebung nicht zurücknimmt');
  await openEdit();
  await T('#e-text'); await W(300);
  await iosShift(200, false); await W(700);
  v = await vis('#e-text');
  ok(v.ok, 'Textfeld bleibt trotzdem im sichtbaren Bereich (' + JSON.stringify(v) + ')');
  ok(await p.evaluate(() => document.body.classList.contains('kb-open')), 'Tastatur bleibt erkannt, obwohl verschoben');
  await p.evaluate(() => { window.__vv.offsetTop = 0; document.activeElement.blur(); }); await W(400);
  await T('#L-entry [data-act="closeTop"]'); await W(600);

  console.log('Lange Idee tippen');
  await T('#plus'); await W(400);
  await T('#e-seg [data-type="idea"]'); await W(400);
  for (let i = 0; i < 12; i++) { await p.keyboard.type('Zeile ' + i + ' einer langen Idee'); await p.keyboard.press('Enter'); }
  await W(600);
  const caret = await p.evaluate(() => { const e = document.querySelector('#e-text'), r = e.getBoundingClientRect(), vv = window.visualViewport; return { bottom: Math.round(r.bottom), lim: vv.offsetTop + vv.height, sh: e.scrollHeight, ch: e.clientHeight }; });
  ok(caret.bottom <= caret.lim, 'Ende der Idee bleibt über der Tastatur (' + JSON.stringify(caret) + ')');
  await p.evaluate(() => document.activeElement.blur()); await W(400);
  await p.keyboard.press('Escape'); await W(600);

  console.log('Tagesziel eintippen');
  await T('#today [data-act="plan"]'); await W(700);
  await T('#plan-input'); await W(300);
  await iosShift(160, true); await W(700);
  v = await vis('#plan-input');
  ok(v.ok, 'Zielfeld sichtbar (' + JSON.stringify(v) + ')');
  await p.keyboard.type('Klavier 30 Minuten');
  v = await vis('#plan-input');
  ok(v.ok, 'beim Tippen weiter sichtbar');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
