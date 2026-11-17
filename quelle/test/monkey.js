// Zufallstest: hunderte zufällige Tipps, Eingaben und Zeitsprünge. Danach müssen alle Regeln noch gelten.
const { start, ok } = require('./common');
const SEED = +process.argv[2] || 7, STEPS = +process.argv[3] || 500;
let seed = SEED; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = a => a[Math.floor(rnd() * a.length)];
const WORDS = ['Klavier üben', 'Mail an Lisa', 'Fotos sichern', 'Laufen gehen', 'Einkaufen', 'Zimmer aufräumen', 'Drehbuch skizzieren', 'x', 'Ein ziemlich langer Text, der über mehrere Zeilen laufen soll, damit die Zeilen umbrechen', 'ÄÖÜ ß „Zitat“ <b>kein html</b> & Co'];
(async () => {
  const t = await start({ time: '2026-11-16T09:00:00+01:00' });
  const { p, W } = t;
  let now = new Date('2026-11-16T09:00:00+01:00').getTime(), taps = 0, typed = 0, jumps = 0;
  for (let i = 0; i < STEPS; i++) {
    const r = rnd();
    if (r < 0.05) { now += pick([3600e3, 5 * 3600e3, 26 * 3600e3, 8 * 86400e3]); await p.clock.setSystemTime(new Date(now)); await p.evaluate(() => window.dispatchEvent(new Event('focus'))); jumps++; await W(60); continue; }
    if (r < 0.2) {
      const has = await p.evaluate(() => { const a = document.activeElement; return !!a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type === 'text')) && !a.readOnly; });
      if (has) { await p.keyboard.type(pick(WORDS), { delay: 0 }); if (rnd() < 0.3) await p.keyboard.press('Enter'); typed++; await W(40); continue; }
    }
    const cand = await p.evaluate(() => {
      const layer = [...document.querySelectorAll('.layer.open')].sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
      const scope = layer || document.querySelector('#app');
      const out = [];
      for (const e of scope.querySelectorAll('[data-act], textarea, input[type=text], .backdrop')) {
        if (e.dataset.act === 'reload' || e.dataset.act === 'exportData') continue;
        if (!layer && e.closest('.view') && !e.closest('.view.active')) continue;
        if (e.closest('[hidden]') || e.closest('.fold.off')) continue;
        const b = e.getBoundingClientRect();
        if (b.width < 4 || b.height < 4) continue;
        const x = b.left + b.width / 2, y = e.classList.contains('backdrop') ? 40 : b.top + b.height / 2;
        if (y < 62 || y > 846 || x < 2 || x > 391) continue;
        const top = document.elementFromPoint(x, y);
        if (!top || !(e === top || e.contains(top) || top.contains(e))) continue;
        out.push({ x, y, bd: e.classList.contains('backdrop') });
      }
      return out;
    });
    if (!cand.length) { await W(120); continue; }
    let c = pick(cand); if (c.bd && rnd() < 0.7) c = pick(cand);
    await p.touchscreen.tap(c.x, c.y); taps++;
    await W(rnd() < 0.15 ? 450 : 70);
  }
  await p.keyboard.press('Escape'); await W(300); await p.keyboard.press('Escape'); await W(300); await p.keyboard.press('Escape'); await W(900);
  console.log('Seed', SEED, '|', taps, 'Tipps,', typed, 'Eingaben,', jumps, 'Zeitsprünge');
  const inv = await p.evaluate(async () => {
    const req = indexedDB.open('momentum'); const db = await new Promise(r => { req.onsuccess = () => r(req.result); });
    const all = s => new Promise(r => { const q = db.transaction(s).objectStore(s).getAll(); q.onsuccess = () => r(q.result); });
    const [tasks, ideas, days, journal, topics] = await Promise.all(['tasks', 'ideas', 'days', 'journal', 'topics'].map(all));
    const ids = tasks.map(x => x.id).concat(ideas.map(x => x.id));
    return {
      tasks: tasks.length, ideas: ideas.length, days: days.length, journal: journal.length, topics: topics.length,
      maxGoals: Math.max(0, ...days.map(d => d.goals.length)),
      dupIds: ids.length - new Set(ids).size,
      badTask: tasks.filter(x => !x.text || !/^\d{4}-\d{2}-\d{2}$/.test(x.due) || ![0, 1, 2].includes(x.prio) || (x.done && !x.doneAt)).length,
      badIdea: ideas.filter(x => !x.text || !/^\d{4}-\d{2}-\d{2}$/.test(x.reviewOn) || x.reviewOn < x.parkedOn).length,
      orphanTopic: tasks.concat(ideas).filter(x => x.topicId && !topics.some(tp => tp.id === x.topicId)).length,
      emptyJournal: journal.filter(e => !((e.learned || '') + (e.good || '') + (e.free || '')).trim()).length,
      html: tasks.filter(x => /<b>/.test(x.text)).length,
      rendered: document.querySelectorAll('b').length,
      layered: document.body.classList.contains('layered'), kb: document.body.classList.contains('kb-open')
    };
  });
  console.log('  ', JSON.stringify(inv));
  ok(inv.maxGoals <= 3, 'nie mehr als 3 Tagesziele (max ' + inv.maxGoals + ')');
  ok(inv.dupIds === 0 && inv.badTask === 0 && inv.badIdea === 0, 'alle Aufgaben und Ideen sind gültig');
  ok(inv.orphanTopic === 0, 'kein Eintrag zeigt auf ein gelöschtes Thema');
  ok(inv.emptyJournal === 0, 'keine leeren Journal-Einträge gespeichert');
  ok(!inv.layered, 'alle Sheets lassen sich schließen');
  const before = await p.evaluate(() => document.querySelector('#tasks-sub').textContent);
  await p.reload(); await p.waitForSelector('body.ready'); await W(300);
  ok((await p.evaluate(() => document.querySelector('#tasks-sub').textContent)) === before, 'nach Neuladen derselbe Stand (' + before + ')');
  ok(!(await p.$('#fatal')), 'App startet danach normal');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
