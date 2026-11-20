// Kern-Durchlauf: Erfassen, Aufgaben, Heute
const L = require('./lib');
const assert = (c, m) => { if (!c) { console.log('  ✗ ' + m); process.exitCode = 1; } else console.log('  ✓ ' + m); };
(async () => {
  const { srv, url } = await L.serve(L.APP, 8765);
  const b = await L.launch(), c = await L.ctx(b), p = await c.newPage(), log = [];
  L.watch(p, log);
  await p.clock.install({ time: new Date('2026-11-16T10:00:00+01:00') });
  await p.goto(url); await p.waitForSelector('body.live'); await L.decorate(p); await p.waitForTimeout(400);

  const capture = async (text, o) => {
    o = o || {};
    await L.tap(p, '#plus'); await p.waitForTimeout(350);
    await p.keyboard.type(text);
    if (o.idea) { await L.tap(p, '#e-seg [data-type="idea"]'); await p.waitForTimeout(450); }
    if (o.when === 'date') { await p.evaluate(d => { const e = document.querySelector('#e-date'); e.focus(); e.value = d; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur(); }, o.date); }
    else if (o.when) await L.tap(p, `#e-when [data-when="${o.when}"]`);
    if (o.prio != null) await L.tap(p, `#e-prio [data-prio="${o.prio}"]`);
    if (o.topic != null) await L.tap(p, '#e-topics .chip', o.topic);
    if (o.shot) { await p.waitForTimeout(450); await L.shot(p, o.shot); }
    await p.waitForTimeout(120);
    await L.tap(p, '#e-save'); await p.waitForTimeout(550);
  };

  console.log('Erfassen');
  await L.tap(p, '#plus'); await p.waitForTimeout(700);
  assert(await p.evaluate(() => document.activeElement.id === 'e-text'), 'Tastatur-Fokus sofort im Textfeld');
  await L.shot(p, '10-erfassen-leer');
  await p.keyboard.type('Zahnarzt anrufen');
  await L.tap(p, '#e-save'); await p.waitForTimeout(200);
  assert(await p.evaluate(() => document.querySelector('#L-entry').classList.contains('open')), 'Ohne „Wann“ wird nicht gespeichert');
  await L.tap(p, '#e-when [data-when="now"]'); await L.tap(p, '#e-save'); await p.waitForTimeout(600);
  assert(await p.evaluate(() => !document.querySelector('#L-entry').classList.contains('open')), 'Mit „Jetzt“ gespeichert, Sheet zu');
  await L.shot(p, '11-heute-nach-erstem');

  await capture('Klavierstück Takt 1 bis 16 üben', { when: 'today', prio: 2, topic: 0, shot: '12-erfassen-voll' });
  await capture('Fotos vom Wochenende sichten und die besten zehn auswählen', { when: 'today', topic: 1 });
  await capture('Joggen, 30 Minuten', { when: 'tomorrow', topic: 2 });
  await capture('Geld an Finn zurückgeben', { when: 'tomorrow', prio: 2 });
  await capture('Bewerbung Studienplatz abschicken', { when: 'date', date: '2026-11-20', prio: 2 });
  await capture('Zimmer umstellen', { when: 'date', date: '2026-12-05', prio: 0 });
  await capture('Drohnenflug-Regeln nachlesen', { when: 'date', date: '2026-11-30', topic: 1 });
  await capture('Kurzfilm über einen Tag am Hafen drehen', { idea: true, topic: 1, shot: '13-erfassen-idee' });
  await capture('Jeden Morgen zehn Minuten dehnen', { idea: true });
  await p.waitForTimeout(2400);
  await L.shot(p, '14-heute-gefuellt');
  await L.tap(p, '[data-tab="tasks"]'); await p.waitForTimeout(450); await L.shot(p, '15-aufgaben');
  const groups = await p.$$eval('#tasks .sec-h', e => e.map(x => x.textContent));
  console.log('  Gruppen:', groups.join(' | '));
  const dh = await p.$$eval('#tasks .dv-head h2', e => e.map(x => x.textContent));
  assert(dh[0] === 'Heute' && groups.join().includes('Danach') && groups.join().includes('Später'), 'Zeit-Übersicht: Heute, Danach, Später');
  const order = await p.$$eval('#tasks .dayv .row-title', e => e.map(x => x.textContent));
  console.log('  Reihenfolge erste Gruppe:', order.join(' | '));
  await L.tap(p, '[data-tab="ideas"]'); await p.waitForTimeout(450); await L.shot(p, '16-ideen');

  console.log('LOG', JSON.stringify(log));
  await c.storageState({ path: require('path').join(L.TMP, 'state.json'), indexedDB: true }).catch(e => console.log('state', e.message));
  await b.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
