// Erster Durchlauf: Start, Leer-Zustände, Erfassen
const L = require('./lib');
(async () => {
  const { srv, url } = await L.serve(L.APP, 8765);
  const b = await L.launch(), c = await L.ctx(b), p = await c.newPage(), log = [];
  L.watch(p, log);
  await p.goto(url); await p.waitForSelector('body.live'); await L.decorate(p); await p.waitForTimeout(500);
  await L.shot(p, '01-heute-leer');
  for (const [t, n] of [['tasks', '02-aufgaben-leer'], ['ideas', '03-ideen-leer'], ['journal', '04-journal-leer']]) {
    await p.tap(`[data-tab="${t}"]`); await p.waitForTimeout(450); await L.shot(p, n);
  }
  await p.tap('[data-tab="today"]'); await p.waitForTimeout(300);
  await p.tap('#plus'); await p.waitForTimeout(200);
  console.log('focus after +:', await p.evaluate(() => document.activeElement && document.activeElement.id));
  await p.waitForTimeout(1100);
  await L.fakeKeyboard(p, 336); await p.waitForTimeout(450);
  await L.shot(p, '05-erfassen-leer');
  await p.keyboard.type('Klavierstück Takt 1 bis 16 üben'); await p.tap('[data-when="today"]'); await p.tap('[data-prio="2"]'); await p.tap('#e-topics .chip >> nth=0'); await p.waitForTimeout(350);
  await L.shot(p, '06-erfassen-voll');
  console.log('LOG', JSON.stringify(log, null, 1));
  await b.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
