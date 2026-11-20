// 1.2.0: Details in Klammern, Uhrzeit/Dauer, Notizen, Zeitstrahl, alte Daten, Export/Import der neuen Felder
const { start, ok } = require('./common');
const fs = require('fs'), path = require('path');
(async () => {
  const t = await start({ time: '2026-11-19T13:20:00+01:00' });
  const { p, T, W, capture, texts, shot, L } = t;
  const db = s => p.evaluate(async s => {
    const req = indexedDB.open('momentum'); const d = await new Promise(r => { req.onsuccess = () => r(req.result); });
    const q = d.transaction(s).objectStore(s).getAll(); const out = await new Promise(r => { q.onsuccess = () => r(q.result); }); d.close(); return out;
  }, s);

  console.log('Zeitrahmen beim Erfassen');
  await T('#plus'); await W(400);
  ok(await p.evaluate(() => document.querySelector('#e-dur-fold').classList.contains('off')), 'Zeitzeile erst nach „Wann“ (Erfassen bleibt kurz)');
  await p.keyboard.type('Test mit Tastatur'); await T('#e-when [data-when="today"]'); await W(700);
  const fitT = await p.evaluate(() => { const c = document.querySelector('#e-time-chip').getBoundingClientRect(), s = document.querySelector('#e-save').getBoundingClientRect(), vv = window.visualViewport; return { chip: Math.round(c.bottom), save: Math.round(s.bottom), lim: vv.height, open: !document.querySelector('#e-dur-fold').classList.contains('off') }; });
  ok(fitT.open && fitT.chip <= fitT.lim && fitT.save <= fitT.lim, 'Uhrzeit und Speichern sichtbar über der Tastatur (' + JSON.stringify(fitT) + ')');
  await shot('132-erfassen-zeit');
  await p.keyboard.press('Escape'); await W(600);

  console.log('Klammern werden Details');
  await capture('Drucken (Stundenliste, A4)', { when: 'today', time: '12:00', dur: 60, prio: 2 });
  await W(2300);
  let task = (await db('tasks')).find(x => x.text === 'Drucken');
  ok(!!task && task.note === 'Stundenliste, A4', 'gespeichert als „Drucken“ + Detail: ' + JSON.stringify(task && { text: task.text, note: task.note }));
  ok(task.time === '12:00' && task.dur === 60, 'Uhrzeit und Dauer gespeichert');
  ok((await texts('#today .rw .row-title'))[0] === 'Drucken', 'auf Heute steht nur „Drucken“');
  ok((await texts('#today .rw .row-meta .tm'))[0] === '12:00–13:00', 'Zeitfenster in der Zeile');
  await T('#today .rw .row-main'); await W(600);
  ok((await texts('#today .rw.open .det-note'))[0] === 'Stundenliste, A4', 'Tippen enthüllt das Detail');
  await shot('130-details');

  console.log('Notiz im Bearbeiten-Sheet');
  await T('#today .rw.open [data-act="editTask"]'); await W(700);
  ok((await p.inputValue('#e-detail')) === 'Stundenliste, A4', 'Details-Feld zeigt die Notiz');
  ok((await p.inputValue('#e-text')) === 'Drucken', 'Titel ohne Klammern');
  await p.fill('#e-detail', 'Stundenliste, A4\nDrucker im Flur'); await W(200);
  await T('#e-time [data-dur="30"]'); await W(100);
  await p.evaluate(() => document.activeElement.blur()); await W(400);
  await T('#e-save'); await W(700);
  task = (await db('tasks')).find(x => x.text === 'Drucken');
  ok(task.note === 'Stundenliste, A4\nDrucker im Flur' && task.dur === 30, 'Notiz und Dauer geändert');

  console.log('Ziel-Notiz');
  await T('#today [data-act="plan"]'); await W(700);
  await T('#plan-input'); await W(300); await p.keyboard.type('Klavier'); await p.keyboard.press('Enter'); await W(300);
  await p.evaluate(() => document.activeElement.blur()); await W(300);
  await T('#L-plan [data-act="closeTop"]'); await W(600);
  await T('#today .goal .goal-text'); await W(600);
  ok(await p.evaluate(() => document.querySelector('#today .goal').classList.contains('open')), 'Ziel klappt auf');
  await T('#today [data-act="goalNote"]'); await W(700);
  await p.keyboard.type('Takt 1–16, langsam'); await W(200);
  await T('#L-note [data-act="noteSave"]'); await W(600);
  const days = await db('days');
  ok(days[0].goals[0].note === 'Takt 1–16, langsam', 'Notiz am Ziel gespeichert');
  ok(!!(await p.$('#today .goal .has-det')), 'Ziel zeigt, dass es eine Notiz hat');

  console.log('Zeitstrahl');
  await capture('Klavier üben', { when: 'today', time: '13:00', dur: 90, topic: 0 });
  await capture('Mails', { when: 'today', time: '13:30', dur: 30 });
  await capture('Einkaufen', { when: 'today' });
  await capture('Zimmer', { when: 'tomorrow', time: '10:00', dur: 60 });
  await W(2300);
  await T('[data-tab="tasks"]'); await W(600);
  const pos = await p.evaluate(() => {
    const b = [...document.querySelectorAll('#tasks .tl-b')].map(e => ({ t: e.querySelector('.tl-t').textContent, top: e.getBoundingClientRect().top, h: e.getBoundingClientRect().height, l: e.getBoundingClientRect().left, w: e.getBoundingClientRect().width, cls: e.className }));
    const now = document.querySelector('#tasks .tl-now').getBoundingClientRect().top;
    return { b, now };
  });
  const by = n => pos.b.find(x => x.t === n);
  ok(pos.b.length === 3, 'drei Blöcke mit Uhrzeit: ' + pos.b.map(x => x.t).join(', '));
  ok(Math.abs((by('Klavier üben').top - by('Drucken').top) - 69) < 3, 'Abstand 1 Stunde = 69 px');
  ok(Math.abs(by('Klavier üben').h - (90 * 1.15 - 3)) < 3, 'Höhe nach Dauer');
  ok(by('Mails').l > by('Klavier üben').l + 20, 'Überschneidung: nebeneinander statt übereinander');
  ok(/live/.test(by('Klavier üben').cls) && /past/.test(by('Drucken').cls), 'läuft gerade / vorbei markiert');
  ok(pos.now > by('Klavier üben').top && pos.now < by('Klavier üben').top + by('Klavier üben').h, 'Jetzt-Linie liegt im laufenden Block');
  ok((await texts('#tasks .dv-free .row-title')).join() === 'Einkaufen', '„Im Lauf des Tages“ für Aufgaben ohne Uhrzeit');
  ok((await texts('#tasks .dv-sum'))[0].includes('2 Std 30 Min geplant'), 'Summe der geplanten Zeit: ' + (await texts('#tasks .dv-sum'))[0]);
  await shot('131-zeitstrahl');
  await T('#tasks .tl-b'); await W(700);
  ok((await texts('#e-title'))[0] === 'Aufgabe', 'Block antippen öffnet die Aufgabe');
  await T('#L-entry [data-act="closeTop"]'); await W(600);

  console.log('Alte Daten ohne neue Felder');
  await p.evaluate(async () => {
    const req = indexedDB.open('momentum'); const d = await new Promise(r => { req.onsuccess = () => r(req.result); });
    const tx = d.transaction('tasks', 'readwrite');
    tx.objectStore('tasks').put({ id: 'old1', text: 'Alte Aufgabe (mit Klammer)', due: '2026-11-19', now: false, prio: 1, topicId: null, createdAt: 1, done: false, doneAt: null });
    await new Promise(r => { tx.oncomplete = r; }); d.close();
  });
  await p.reload(); await p.waitForSelector('body.live'); await L.decorate(p); await W(400);
  ok((await texts('#today .rw .row-title')).includes('Alte Aufgabe'), 'alte Aufgabe erscheint, Klammer als Detail');
  await T('[data-tab="tasks"]'); await W(500);
  ok((await texts('#tasks .dv-free .row-title')).includes('Alte Aufgabe'), 'alte Aufgabe auch im Zeitplan');

  console.log('Export und Import behalten die neuen Felder');
  await T('[data-tab="today"]'); await W(300); await T('#v-today [data-act="settings"]'); await W(600);
  const [dl] = await Promise.all([p.waitForEvent('download'), T('#settings-body [data-act="exportData"]')]);
  const file = path.join(L.TMP, 'export13.json');
  await dl.saveAs(file);
  const ex = JSON.parse(fs.readFileSync(file, 'utf8'));
  const exT = ex.data.tasks.find(x => x.text === 'Drucken');
  ok(ex.format === 1 && exT.note.includes('Drucker im Flur') && exT.time === '12:00' && exT.dur === 30, 'Export enthält Notiz, Uhrzeit, Dauer');
  ok(ex.data.days[0].goals[0].note === 'Takt 1–16, langsam', 'Export enthält die Ziel-Notiz');
  // Altes Backup ohne neue Felder + Backup mit neuen Feldern
  const old = { app: 'momentum', format: 1, version: '1.1', exportedAt: new Date().toISOString(), data: { tasks: [{ id: 'a', text: 'Ohne Felder', due: '2026-11-19', prio: 1 }, { id: 'b', text: 'Kaputte Felder', due: '2026-11-19', prio: 1, time: '25:99', dur: -4, note: 7 }], ideas: [], journal: [], topics: [], days: [] } };
  fs.writeFileSync(path.join(L.TMP, 'old13.json'), JSON.stringify(old));
  await p.setInputFiles('#import-file', path.join(L.TMP, 'old13.json')); await W(700);
  await T('#dlg-ok'); await W(900);
  let tasks = await db('tasks');
  ok(tasks.length === 2 && tasks.every(x => x.time === null && x.dur === null && x.note === ''), 'altes Backup: Standardwerte, kaputte Felder verworfen');
  await p.setInputFiles('#import-file', file); await W(700);
  await T('#dlg-ok'); await W(900);
  tasks = await db('tasks');
  const back = tasks.find(x => x.text === 'Drucken');
  ok(back && back.note.includes('Drucker im Flur') && back.time === '12:00' && back.dur === 30, 'Import bringt Notiz, Uhrzeit, Dauer zurück');
  ok((await db('days'))[0].goals[0].note === 'Takt 1–16, langsam', 'Import bringt die Ziel-Notiz zurück');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
