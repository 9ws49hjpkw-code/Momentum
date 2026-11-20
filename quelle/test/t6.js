// Einstellungen, Themen, Export, Import
const { start, ok } = require('./common');
const fs = require('fs'), L = require('./lib');
(async () => {
  const t = await start({ time: '2026-11-16T10:00:00+01:00' });
  const { p, T, W, texts, shot, L } = t;
  await t.seed();
  await T('[data-tab="journal"]'); await W(300); await T('#j-editor textarea', 0); await W(400); await p.keyboard.type('Erster Eintrag für den Export.'); await p.evaluate(() => document.activeElement.blur()); await W(500);
  await T('[data-tab="today"]'); await W(300);
  await T('#today [data-act="plan"]'); await W(600); await T('#plan-tasks .pick', 0); await T('#L-plan .sheet-foot .btn'); await W(600);

  console.log('Einstellungen');
  await T('#v-today [data-act="settings"]'); await W(700); await shot('60-einstellungen');
  ok((await texts('#settings-body .li-t b')).slice(0, 3).join('|') === 'Klavier|Film/Foto|Sport', 'Standard-Themen: Klavier, Film/Foto, Sport');

  console.log('Thema anlegen');
  await T('#settings-body .li.add'); await W(700);
  ok(await p.evaluate(() => document.activeElement.id === 'topic-name'), 'Tastatur direkt im Namensfeld');
  await T('#topic-save'); await W(300);
  ok(await p.evaluate(() => document.querySelector('#L-topic').classList.contains('open')), 'leerer Name wird nicht gespeichert');
  await p.keyboard.type('Studium'); await W(300); await shot('61-thema-neu');
  await T('#topic-hues .hue', 4); await W(200); await T('#topic-save'); await W(700);
  ok((await texts('#settings-body .li-t b')).includes('Studium'), 'neues Thema in der Liste');
  await T('#settings-body .li.add'); await W(700); await p.keyboard.type('studium'); await W(200); await T('#topic-save'); await W(400);
  ok(await p.evaluate(() => document.querySelector('#L-topic').classList.contains('open')), 'doppelter Name wird abgelehnt: ' + (await t.toastText()));
  await T('#L-topic [data-act="closeTop"]'); await W(600);

  console.log('Thema umbenennen');
  await T('#settings-body .li', 2); await W(700); await shot('62-thema-bearbeiten');
  ok((await p.inputValue('#topic-name')) === 'Sport', 'Sport geöffnet');
  await p.fill('#topic-name', 'Sport & Laufen'); await W(700); await T('#topic-hues .hue', 7); await W(200); await T('#topic-save'); await W(700);
  ok((await texts('#settings-body .li-t b')).includes('Sport & Laufen'), 'umbenannt');
  await T('#L-settings [data-act="closeTop"]'); await W(600);
  await T('[data-tab="tasks"]'); await W(400);
  ok((await texts('#tasks .filter .chip')).join('|') === 'Alle|Klavier|Film/Foto|Sport & Laufen|Studium', 'Filter kennt die Themen: ' + (await texts('#tasks .filter .chip')).join(' | '));
  ok((await texts('#tasks .tp')).includes('Sport & Laufen'), 'Aufgabe trägt den neuen Themennamen');
  await shot('63-aufgaben-themen');

  console.log('Thema löschen');
  await T('[data-tab="today"]'); await W(300); await T('#v-today [data-act="settings"]'); await W(600);
  await T('#settings-body .li', 1); await W(600); await T('#topic-del'); await W(500); await shot('64-thema-loeschen-dialog');
  ok((await texts('#dlg-title'))[0] === '„Film/Foto“ löschen?', 'Rückfrage: ' + (await texts('#dlg-title'))[0]);
  await T('#dlg-ok'); await W(700);
  ok(!(await texts('#settings-body .li-t b')).includes('Film/Foto'), 'Thema gelöscht');
  await T('#L-settings [data-act="closeTop"]'); await W(600); await T('[data-tab="tasks"]'); await W(300);
  ok((await texts('#tasks .ti:not(.is-done) .row-title, #tasks .tl-b:not(.is-done) .tl-t')).includes('Drohnenflug-Regeln nachlesen') && !(await texts('#tasks .tp')).includes('Film/Foto'), 'Aufgaben bleiben, nur ohne Thema');

  console.log('Export');
  await T('[data-tab="today"]'); await W(300); await T('#v-today [data-act="settings"]'); await W(600);
  const [dl] = await Promise.all([p.waitForEvent('download'), T('#settings-body [data-act="exportData"]')]);
  const file = require('path').join(L.TMP, 'export.json');
  await dl.saveAs(file);
  ok(dl.suggestedFilename() === 'momentum-backup-2026-11-16.json', 'Dateiname: ' + dl.suggestedFilename());
  const ex = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('   Export:', ex.app, 'Format', ex.format, '|', ex.data.tasks.length, 'Aufgaben,', ex.data.ideas.length, 'Ideen,', ex.data.journal.length, 'Journal,', ex.data.topics.length, 'Themen,', ex.data.days.length, 'Tagespläne');
  ok(ex.app === 'momentum' && ex.data.tasks.length === 8 && ex.data.ideas.length === 2 && ex.data.journal.length === 1 && ex.data.topics.length === 3 && ex.data.days.length === 1, 'Export enthält alle Daten');
  await W(500);
  ok((await texts('#settings-body .li-t span'))[0].startsWith('Letzter Export: 16.11.2026, 10:0'), 'zeigt Zeitpunkt in deutschem Format: ' + (await texts('#settings-body .li-t span'))[0]);
  await shot('65-nach-export');

  console.log('Import');
  // Daten verändern, dann Backup zurückspielen
  await T('#L-settings [data-act="closeTop"]'); await W(600);
  await t.capture('Nach dem Export angelegt', { when: 'today' });
  await T('[data-tab="today"]'); await W(300);
  for (let i = 0; i < 3; i++) { await T('#today .rw[data-swipe] .check'); await W(1100); }
  await T('[data-tab="tasks"]'); await W(300);
  ok((await texts('#tasks .ti:not(.is-done) .row-title, #tasks .tl-b:not(.is-done) .tl-t')).length === 6, 'Stand vor dem Import: 6 offen');
  await T('[data-tab="today"]'); await W(300); await T('#v-today [data-act="settings"]'); await W(600);
  // falsche Datei
  fs.writeFileSync(require('path').join(L.TMP, 'bad.json'), '{"hallo":1}');
  await p.setInputFiles('#import-file', require('path').join(L.TMP, 'bad.json')); await W(600);
  ok((await texts('#dlg-title'))[0] === 'Das ist kein Momentum-Backup', 'fremde Datei wird abgelehnt');
  await shot('66-import-falsch');
  await T('#dlg-ok'); await W(500);
  fs.writeFileSync(require('path').join(L.TMP, 'bad.txt'), 'kein json');
  await p.setInputFiles('#import-file', require('path').join(L.TMP, 'bad.txt')); await W(600);
  ok((await texts('#dlg-title'))[0] === 'Das ist kein Momentum-Backup', 'kaputte Datei wird abgelehnt');
  await T('#dlg-ok'); await W(500);
  // richtige Datei, erst abbrechen
  await p.setInputFiles('#import-file', file); await W(700);
  ok((await texts('#dlg-title'))[0] === 'Alles ersetzen?', 'Bestätigung vor dem Überschreiben');
  console.log('   ' + (await texts('#dlg-text'))[0]);
  await shot('67-import-bestaetigen');
  await T('#dlg-cancel'); await W(500);
  await T('#L-settings [data-act="closeTop"]'); await W(600); await T('[data-tab="tasks"]'); await W(300);
  ok((await texts('#tasks .ti:not(.is-done) .row-title, #tasks .tl-b:not(.is-done) .tl-t')).length === 6, 'Abbrechen ändert nichts');
  await T('[data-tab="today"]'); await W(300); await T('#v-today [data-act="settings"]'); await W(600);
  await p.setInputFiles('#import-file', file); await W(700); await T('#dlg-ok'); await W(900);
  ok((await t.toastText()).includes('importiert'), 'Hinweis: ' + (await t.toastText()));
  await T('#L-settings [data-act="closeTop"]'); await W(600); await T('[data-tab="tasks"]'); await W(300);
  const after = await texts('#tasks .ti:not(.is-done) .row-title, #tasks .tl-b:not(.is-done) .tl-t');
  ok(after.length === 8 && !after.includes('Nach dem Export angelegt'), 'Import stellt den exportierten Stand her (8 offen)');
  await T('[data-tab="today"]'); await W(300);
  ok((await texts('#today .goal .goal-text')).length === 1, 'Tagesziel ist wieder da');
  await T('[data-tab="journal"]'); await W(300);
  ok((await p.inputValue('#j-editor textarea >> nth=0')) === 'Erster Eintrag für den Export.', 'Journal ist wieder da');
  await p.reload(); await p.waitForSelector('body.live'); await L.decorate(p); await W(300);
  await T('[data-tab="tasks"]'); await W(300);
  ok((await texts('#tasks .ti:not(.is-done) .row-title, #tasks .tl-b:not(.is-done) .tl-t')).length === 8, 'importierter Stand übersteht Neuladen');
  ok((await texts('#tasks .filter .chip')).join('|') === 'Alle|Klavier|Sport & Laufen|Studium', 'Themen aus dem Backup: ' + (await texts('#tasks .filter .chip')).join(' | '));

  console.log('Import in eine frische App');
  const c2 = await L.ctx(t.b), p2 = await c2.newPage();
  await p2.goto(t.url); await p2.waitForSelector('body.live'); await p2.waitForTimeout(300);
  await L.tap(p2, '#v-today [data-act="settings"]'); await p2.waitForTimeout(600);
  await p2.setInputFiles('#import-file', file); await p2.waitForTimeout(700); await L.tap(p2, '#dlg-ok'); await p2.waitForTimeout(900);
  await L.tap(p2, '#L-settings [data-act="closeTop"]'); await p2.waitForTimeout(600); await L.tap(p2, '[data-tab="tasks"]'); await p2.waitForTimeout(300);
  ok((await p2.$$eval('#tasks .ti:not(.is-done) .row-title, #tasks .tl-b:not(.is-done) .tl-t, #tasks .og .og-t', e => e.length)) === 8, 'Backup lässt sich auf einem neuen Gerät einspielen');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
