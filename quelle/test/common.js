const L = require('./lib');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
async function start(opts) {
  opts = opts || {};
  const { srv, url, state } = await L.serve(opts.dir || L.APP, opts.port || 8765);
  const b = await L.launch(), c = await L.ctx(b, opts.ctx), p = await c.newPage(), log = [];
  L.watch(p, log);
  if (opts.time) await p.clock.install({ time: new Date(opts.time) });
  await p.goto(url); await p.waitForSelector('body.live'); await L.decorate(p); await p.waitForTimeout(350);
  const T = (sel, n) => L.tap(p, sel, n);
  const W = ms => p.waitForTimeout(ms);
  const capture = async (text, o) => {
    o = o || {};
    await T('#plus'); await W(350);
    await p.keyboard.type(text);
    if (o.idea) { await T('#e-seg [data-type="idea"]'); await W(450); }
    if (o.when === 'date') { await setDate(o.date); await W(550); }
    else if (o.when) await T(`#e-when [data-when="${o.when}"]`);
    if (o.prio != null) await T(`#e-prio [data-prio="${o.prio}"]`);
    if (o.topic != null) await T('#e-topics .chip', o.topic);
    if (o.time || o.dur) await W(450);
    if (o.time) await p.evaluate(v => { const e = document.querySelector('#e-time-in'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, o.time);
    if (o.dur) await T(`#e-time [data-dur="${o.dur}"]`);
    await W(120); await T('#e-save'); await W(600);
  };
  const setDate = d => p.evaluate(d => { const e = document.querySelector('#e-date'); e.focus(); e.value = d; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur(); }, d);
  const texts = sel => p.$$eval(sel, e => e.map(x => x.textContent.trim()));
  const jump = async iso => { await p.clock.setSystemTime(new Date(iso)); await p.evaluate(() => window.dispatchEvent(new Event('focus'))); await W(300); };
  const toastText = () => p.evaluate(() => { const t = document.querySelector('#toast'); return t.classList.contains('show') ? t.textContent : ''; });
  const seed = async () => {
    await capture('Zahnarzt anrufen', { when: 'now' });
    await capture('Klavierstück Takt 1 bis 16 üben', { when: 'today', prio: 2, topic: 0 });
    await capture('Fotos vom Wochenende sichten und die besten zehn auswählen', { when: 'today', topic: 1 });
    await capture('Joggen, 30 Minuten', { when: 'tomorrow', topic: 2 });
    await capture('Geld an Finn zurückgeben', { when: 'tomorrow', prio: 2 });
    await capture('Bewerbung Studienplatz abschicken', { when: 'date', date: '2026-11-20', prio: 2 });
    await capture('Zimmer umstellen', { when: 'date', date: '2026-12-05', prio: 0 });
    await capture('Drohnenflug-Regeln nachlesen', { when: 'date', date: '2026-11-30', topic: 1 });
    await capture('Kurzfilm über einen Tag am Hafen drehen', { idea: true, topic: 1 });
    await capture('Jeden Morgen zehn Minuten dehnen', { idea: true });
    await W(2300);
  };
  const end = async () => { console.log(log.length ? 'KONSOLE: ' + JSON.stringify(log, null, 1) : 'Konsole: keine Fehler'); ok(log.length === 0, 'keine Konsolenfehler'); await b.close(); srv.close(); console.log(fails ? '\n' + fails + ' FEHLGESCHLAGEN' : '\nALLES BESTANDEN'); process.exitCode = fails ? 1 : 0; };
  return { L, b, c, p, log, T, W, capture, setDate, texts, jump, toastText, seed, end, url, state, shot: n => L.shot(p, n) };
}
module.exports = { start, ok };
