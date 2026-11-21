// Zufallstest: viele Taps auf alles Tippbare, danach Daten prüfen. Aufruf: node notenweg/quelle/test/monkey.js [taps]
const { serve, launch, ctx, watch, sleep, ok, done } = require('./lib');
(async () => {
  const N = +(process.argv[2] || 400);
  const { srv, url } = await serve(8813);
  const b = await launch(); const log = [];
  const c = await ctx(b, 'ipad'); const p = await c.newPage(); watch(p, log);
  p.on('dialog', d => d.dismiss());
  await p.goto(url); await p.waitForSelector('.today');
  let seed = 7; const rnd = n => { seed = (seed * 16807) % 2147483647; return seed % n; };
  for (let i = 0; i < N; i++) {
    const targets = await p.evaluate(() => {
      const els = [...document.querySelectorAll('[data-a]:not([data-a="reset-do"]):not([data-a="reset-ask"]), a[href^="#"], .ans, .tapkbd .key, input[type=checkbox], summary, .nav-i')]
        .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.disabled; });
      return els.length;
    });
    if (!targets) { await p.evaluate(() => { location.hash = '#pfad'; }); continue; }
    const k = rnd(targets);
    await p.evaluate(k => {
      const els = [...document.querySelectorAll('[data-a]:not([data-a="reset-do"]):not([data-a="reset-ask"]), a[href^="#"], .ans, .tapkbd .key, input[type=checkbox], summary, .nav-i')]
        .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.disabled; });
      const e = els[k]; if (e) { e.scrollIntoView({ block: 'center' }); e.click(); }
    }, k).catch(() => {});
    if (i % 3 === 0) await p.evaluate(k => { const e = document.querySelectorAll('[data-a]')[k]; if (e) { e.click(); e.click(); } }, rnd(40)).catch(() => {});  // Doppeltipp
    await sleep(25);
    if (i % 50 === 0) process.stdout.write('.');
  }
  console.log('');
  await sleep(800);
  const st = await p.evaluate(() => JSON.parse(JSON.stringify(S)));
  ok(st && st.v === 3 && typeof st.done === 'object', 'Zustand ist gültig');
  await p.reload(); await p.waitForSelector('#view');
  const st2 = await p.evaluate(() => JSON.parse(JSON.stringify(S)));
  ok(JSON.stringify(st2.done) === JSON.stringify(st.done) && JSON.stringify(st2.pieces) === JSON.stringify(st.pieces), 'Nach Neuladen identisch');
  const dupDays = Object.values(st2.days).every(d => typeof d === 'object');
  ok(dupDays, 'Tagesprotokoll sauber');
  ok(log.length === 0, 'Keine Fehler' + (log.length ? ':\n    ' + [...new Set(log)].slice(0, 8).join('\n    ') : ''));
  await b.close(); srv.close(); done();
})().catch(e => { console.error(e); process.exit(1); });
