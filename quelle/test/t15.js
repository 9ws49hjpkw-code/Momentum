// 1.2.0: Verschieben unbequem, Icon-Zähler, Töne, Folge-Aufgaben, Kalender über Kurzbefehle
const { start, ok } = require('./common');
const fs = require('fs'), path = require('path');
(async () => {
  const t = await start({ time: '2026-11-19T10:00:00+01:00' });
  const { p, c, T, W, capture, texts, shot, jump, L, toastText } = t;
  const db = s => p.evaluate(async s => {
    const req = indexedDB.open('momentum'); const d = await new Promise(r => { req.onsuccess = () => r(req.result); });
    const q = d.transaction(s).objectStore(s).getAll(); const out = await new Promise(r => { q.onsuccess = () => r(q.result); }); d.close(); return out;
  }, s);
  const openEdit = async title => {
    const i = (await texts('#today .rw .row-title')).indexOf(title);
    if (!(await p.$('#today .rw.open'))) { await T('#today .rw .row-main', i); await W(600); }
    await T('#today .rw.open [data-act="editTask"]'); await W(700);
  };
  const reload = async () => { await p.reload(); await p.waitForSelector('body.live'); await L.decorate(p); await W(400); };

  console.log('Verschieben wird unbequem');
  await capture('Steuer machen', { when: 'today', prio: 2 });
  await jump('2026-11-21T10:00:00+01:00'); await W(300);
  await openEdit('Steuer machen');
  await T('#e-when [data-when="tomorrow"]'); await T('#e-save'); await W(600);
  ok((await texts('#dlg-title'))[0] === 'Wirklich verschieben?', 'Rückfrage beim Verschieben: ' + (await texts('#dlg-text'))[0]);
  await shot('150-verschieben');
  await T('#dlg-cancel'); await W(500);
  ok((await db('tasks'))[0].due === '2026-11-19', '„Zurück“ ändert nichts');
  await T('#e-save'); await W(600); await T('#dlg-ok'); await W(900);
  let task = (await db('tasks'))[0];
  ok(task.due === '2026-11-22' && task.moved === 1, 'verschoben und gezählt: ' + task.moved);
  await jump('2026-11-24T10:00:00+01:00'); await W(300);
  ok((await texts('#today .rw .moved'))[0] === '1× verschoben', 'Zeile zeigt „1× verschoben“ rot');
  await openEdit('Steuer machen');
  await T('#e-when [data-when="today"]'); await T('#e-save'); await W(600);
  ok((await texts('#dlg-text'))[0].startsWith('Schon 1× verschoben.'), 'zweites Mal: „Schon 1× verschoben“');
  await T('#dlg-ok'); await W(900);
  ok((await db('tasks'))[0].moved === 2, 'Zähler steht auf 2');

  console.log('Einstellungen: Töne, Zähler, Regeln, Kurzbefehle');
  await T('#v-today [data-act="settings"]'); await W(700);
  const li = await texts('#settings-body .li-t b');
  ok(['Töne', 'Roter Zähler am App-Icon', 'Folge-Aufgaben', 'Kalender & Wecker'].every(x => li.includes(x)), 'neue Einträge: ' + li.join(' | '));
  await shot('151-einstellungen');

  console.log('Folge-Aufgaben');
  await T('#settings-body [data-act="rulesOpen"]'); await W(700);
  await T('#rule-word'); await W(300); await p.keyboard.type('Drucken'); await p.keyboard.press('Enter'); await W(200);
  await p.keyboard.type('Stundenliste eintragen'); await p.keyboard.press('Enter'); await W(500);
  ok((await texts('#rules-list .rule b')).join() === 'Drucken', 'Regel angelegt');
  await shot('152-regeln');
  await T('#L-rules [data-act="closeTop"]'); await W(500); await T('#L-settings [data-act="closeTop"]'); await W(600);
  await capture('Drucken (Stundenliste)', { when: 'today', time: '10:30', dur: 30 });
  await W(2300);
  await jump('2026-11-24T11:05:00+01:00'); await W(800);
  let tasks = await db('tasks');
  const fol = tasks.filter(x => x.text === 'Stundenliste eintragen');
  ok(fol.length === 1 && fol[0].now && fol[0].due === '2026-11-24', 'zum Ende der Druckzeit erscheint „Stundenliste eintragen“ (Jetzt)');
  ok((await texts('#today .rw .row-title')).includes('Stundenliste eintragen'), 'steht auf Heute');
  await reload();
  await jump('2026-11-24T11:10:00+01:00'); await W(600);
  ok((await db('tasks')).filter(x => x.text === 'Stundenliste eintragen').length === 1, 'kein Doppel nach Neuladen');
  await capture('Etiketten drucken', { when: 'today' });
  await W(2300);
  const i = (await texts('#today .rw .row-title')).indexOf('Etiketten drucken');
  await T('#today .rw[data-swipe] .check', i); await W(6800);
  ok((await db('tasks')).filter(x => x.text === 'Stundenliste eintragen').length === 2, 'ohne Uhrzeit: Folge-Aufgabe beim Abhaken');

  console.log('Töne');
  ok(await p.evaluate(() => localStorage.getItem('momentum.sound') !== '0'), 'Töne sind an (Standard)');
  await p.addInitScript(() => { const C = window.AudioContext; window.__ac = 0; window.AudioContext = function () { window.__ac++; return new C(); }; });
  await reload();
  await T('[data-tab="tasks"]'); await W(400); await T('[data-tab="today"]'); await W(400);
  ok(await p.evaluate(() => window.__ac === 1), 'nach der ersten Berührung entsteht der Ton-Kontext');
  await T('#v-today [data-act="settings"]'); await W(700);
  await T('#settings-body [data-act="soundToggle"]'); await W(300);
  ok(await p.evaluate(() => localStorage.getItem('momentum.sound') === '0'), 'Schalter aus');
  await T('#L-settings [data-act="closeTop"]'); await W(600);
  await reload();
  await T('[data-tab="tasks"]'); await W(400); await T('[data-tab="today"]'); await W(400);
  ok(await p.evaluate(() => window.__ac === 0), 'aus = kein Ton-Kontext, keine Töne');

  console.log('Kalender über Kurzbefehle');
  await p.evaluate(() => { navigator.clipboard.readText = async () => '2026-11-25 14:00 | 60 | Zahnarzt\n2026-11-26 | | Geburtstag Oma\nquatsch\n2026-11-20 09:00 | 30 | Vergangen'; });
  await T('[data-tab="tasks"]'); await W(400);
  await T('#v-tasks [data-act="calPaste"]'); await W(600);
  ok((await texts('#dlg-title'))[0] === '2 Termine übernehmen?', 'erkennt 2 Termine (Vergangenes und Unsinn bleiben draußen): ' + (await texts('#dlg-title'))[0]);
  await T('#dlg-ok'); await W(800);
  tasks = await db('tasks');
  const z = tasks.find(x => x.text === 'Zahnarzt');
  ok(z && z.due === '2026-11-25' && z.time === '14:00' && z.dur === 60 && z.src === 'cal', 'Termin mit Uhrzeit und Dauer übernommen');
  ok(tasks.some(x => x.text === 'Geburtstag Oma' && x.time === null), 'ganztägig ohne Uhrzeit');
  await T('#v-tasks [data-act="calPaste"]'); await W(500);
  ok((await toastText()).includes('schon da'), 'zweimal einfügen legt nichts doppelt an');
  await T('#tasks .wb-day', 1); await W(400);
  await T('#tasks .tl-b'); await W(700);
  ok((await texts('#e-secondary .btn')).join('|') === 'Kalender|Wecker|Löschen', 'Aufgabe mit Uhrzeit: „Kalender“ und „Wecker“ (Kurzbefehl)');
  await T('#L-entry [data-act="closeTop"]'); await W(600);

  console.log('Regeln im Backup');
  await T('[data-tab="today"]'); await W(300); await T('#v-today [data-act="settings"]'); await W(600);
  const [dl] = await Promise.all([p.waitForEvent('download'), T('#settings-body [data-act="exportData"]')]);
  const file = path.join(L.TMP, 'export15.json'); await dl.saveAs(file);
  const ex = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(ex.data.rules.length === 1 && ex.data.rules[0].word === 'Drucken', 'Export enthält die Regel');
  await p.setInputFiles('#import-file', file); await W(700); await T('#dlg-ok'); await W(900);
  ok((await texts('#settings-body .li-t span')).some(x => x === '1 Regel aktiv'), 'Import bringt die Regel zurück');
  ok((await db('tasks')).filter(x => x.text === 'Stundenliste eintragen').length === 2, 'Import erzeugt keine neuen Folge-Aufgaben');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
