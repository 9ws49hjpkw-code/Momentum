// Metronom nach „eingefrorenem“ Audio-Kontext (wie auf dem iPad nach App-Wechsel)
const L = require('./lib.js');
(async () => {
  const { srv, url } = await L.serve(8791); const br = await L.launch();
  const c = await L.ctx(br, 'ipad', { }); const p = await c.newPage(); const log = []; L.watch(p, log);
  await p.goto(url + '#werkzeuge'); await L.sleep(1200);
  const dot = () => p.evaluate(() => [...document.querySelectorAll('#mt-dots span')].findIndex(d => d.classList.contains('on')));
  const btn = () => p.evaluate(() => document.querySelector('[data-a="mt-toggle"]').textContent);
  await p.click('[data-a="mt-toggle"]'); await L.sleep(1500);
  const seen = new Set(); for (let i = 0; i < 8; i++) { seen.add(await dot()); await L.sleep(250); }
  L.ok(seen.size >= 2, 'Metronom läuft (Punkte wandern)');
  // Kontext einfrieren wie iOS
  await p.evaluate(() => Sound.ctx.suspend()); await L.sleep(2200);
  L.ok((await btn()).includes('Start'), 'Hängende Audio-Uhr erkannt → Metronom gestoppt');
  L.ok(await p.evaluate(() => !document.getElementById('toast').hidden), 'Hinweis erscheint');
  await p.click('[data-a="mt-toggle"]'); await L.sleep(1500);
  L.ok(await p.evaluate(() => Sound.ctx.state) === 'running', 'Neuer Start: Audio läuft wieder');
  const s2 = new Set(); for (let i = 0; i < 8; i++) { s2.add(await dot()); await L.sleep(250); }
  L.ok(s2.size >= 2, 'Metronom läuft wieder');
  await p.click('[data-a="mt-toggle"]');
  // Anhören nach Neustart des Kontexts
  L.ok(log.length === 0, 'Keine Konsolenfehler ' + log.join(' | '));
  await br.close(); srv.close(); L.done();
})();
