// Aufgaben: abhaken + wischen (Heute), Details aufklappen, neue Aufgaben-Seite (Zeitstrahl), bearbeiten, löschen, filtern, Erledigt
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-16T10:00:00+01:00' });
  const { p, T, W, texts, shot, L } = t;
  await t.seed();
  const openTi = () => texts('#tasks .ti:not(.is-done) .row-title, #tasks .tl-b:not(.is-done) .tl-t');

  console.log('Abhaken per Tipp + Rückgängig');
  let rows = await texts('#today .rw .row-title');
  ok(rows[0] === 'Zahnarzt anrufen', 'Jetzt-Aufgabe steht oben: ' + rows[0]);
  await T('#today .rw[data-swipe] .check'); await W(250); await shot('20-abhaken-animation');
  await W(900);
  ok(!(await texts('#today .rw .row-title')).includes('Zahnarzt anrufen'), 'abgehakte Aufgabe verschwindet aus Heute');
  ok((await t.toastText()).includes('Erledigt'), 'Hinweis „Erledigt“ mit Rückgängig');
  await shot('21-toast-rueckgaengig');
  await T('#toast button'); await W(400);
  ok((await texts('#today .rw .row-title')).includes('Zahnarzt anrufen'), 'Rückgängig holt sie zurück');

  console.log('Wischen (Heute)');
  await L.swipe(p, '#today .rw[data-swipe]', 40); await W(700);
  ok((await texts('#today .rw[data-swipe] .row-title'))[0] === 'Zahnarzt anrufen', 'kurzes Wischen hakt nicht ab');
  await L.swipe(p, '#today .rw[data-swipe]', 130, { hold: async () => { await shot('22-wischen'); } }); await W(1100);
  ok(!(await texts('#today .rw[data-swipe] .row-title')).includes('Zahnarzt anrufen'), 'Wischen nach rechts = erledigt');
  ok((await t.toastText()).includes('Erledigt'), 'Rückgängig-Hinweis nach Wischen');
  const b0 = (await texts('#today .rw[data-swipe] .row-title')).length;
  await L.swipe(p, '#today .rw[data-swipe]', 12, { dy: -120 }); await W(500);
  ok((await texts('#today .rw[data-swipe] .row-title')).length === b0, 'senkrechtes Wischen hakt nicht ab');
  await W(2500);

  console.log('Details aufklappen (Heute)');
  await T('#today .rw[data-swipe] .row-main'); await W(600);
  ok(await p.evaluate(() => { const w = document.querySelector('#today .rw.open'); return !!w && w.querySelector('.rw-det').getBoundingClientRect().height > 30; }), 'Tippen auf die Aufgabe klappt Details auf');
  ok(!(await p.evaluate(() => document.querySelector('#L-entry').classList.contains('open'))), 'kein Sheet, Kreis bleibt Abhaken');
  await shot('23a-details');
  await T('#today .rw.open [data-act="editTask"]'); await W(700);
  ok((await texts('#e-title'))[0] === 'Aufgabe', '„Bearbeiten“ öffnet das Sheet');
  await p.keyboard.press('Escape'); await W(600);
  await T('#today .rw.open .row-main'); await W(500);
  ok(!(await p.$('#today .rw.open')), 'nochmal Tippen klappt zu');

  console.log('Aufgaben-Seite: Zeit-Übersicht ohne Abhaken');
  await T('[data-tab="tasks"]'); await W(500);
  ok((await p.$$('#tasks .ti .check, #tasks .rw[data-swipe], #tasks .tl-b .check')).length === 0, 'kein Kreis, kein Wischen auf der Aufgaben-Seite');
  ok((await openTi()).length === 7, '7 offene Aufgaben sichtbar: ' + (await openTi()).length);
  ok((await texts('#tasks .wb-day')).length === 14, 'Wochenband mit 14 Tagen');
  ok((await texts('#tasks .dv-head h2'))[0] === 'Heute', 'gewählt ist heute');
  ok((await texts('#tasks .ag-h b')).join('|').startsWith('Morgen'), 'danach kommen die nächsten Tage: ' + (await texts('#tasks .ag-h b')).join('|'));
  await shot('23b-aufgaben');
  await T('#tasks .wb-day', 1); await W(400);
  ok((await texts('#tasks .dv-head h2'))[0] === 'Morgen', 'Tippen auf Morgen wählt den Tag');
  const tm = await texts('#tasks .dayv .row-title');
  ok(tm.length === 2 && tm[0] === 'Geld an Finn zurückgeben', 'Morgen: ' + tm.join(' / '));
  ok(!(await texts('#tasks .ag .row-title')).includes('Joggen, 30 Minuten'), 'Morgen steht nicht doppelt in „Danach“');
  await T('#tasks .wb-day', 0); await W(400);

  console.log('Erledigt-Bereich');
  ok((await texts('#tasks .done-toggle'))[0].startsWith('Erledigt'), 'Bereich „Erledigt“ vorhanden');
  ok((await p.$$('#tasks .ti.is-done')).length === 0, 'eingeklappt');
  await T('#tasks .done-toggle'); await W(300);
  ok((await texts('#tasks .ti.is-done .row-title'))[0] === 'Zahnarzt anrufen', 'aufgeklappt zeigt erledigte Aufgabe');
  await T('#tasks .ti.is-done'); await W(700);
  await T('[data-act="eReopen"]'); await W(600);
  ok((await openTi()).includes('Zahnarzt anrufen'), '„Wieder öffnen“ holt sie zurück');
  await p.evaluate(() => document.querySelector('#v-tasks .scroll').scrollTo(0, 0));

  console.log('Bearbeiten');
  await T('#tasks .dv-free .ti', 0); await W(700);
  await shot('24-bearbeiten');
  ok((await texts('#e-title'))[0] === 'Aufgabe', 'Bearbeiten-Sheet offen');
  ok(await p.evaluate(() => document.activeElement.id !== 'e-text'), 'beim Bearbeiten springt keine Tastatur auf');
  await T('#e-when [data-when="tomorrow"]'); await T('#e-prio [data-prio="0"]');
  await p.fill('#e-text', 'Zahnarzt anrufen und Termin machen'); await W(600); await shot('24b-bearbeiten-tastatur');
  await T('#e-save'); await W(600);
  const morgen = await p.$$eval('#tasks .ag-day', s => s.map(x => x.querySelector('.ag-h b').textContent + ': ' + [...x.querySelectorAll('.row-title')].map(r => r.textContent).join(' / ')));
  console.log('   ' + morgen.join('\n   '));
  ok(morgen[0].startsWith('Morgen') && morgen[0].endsWith('Zahnarzt anrufen und Termin machen'), 'geänderte Aufgabe steht morgen, niedrige Priorität unten');

  console.log('Löschen + Rückgängig');
  await T('#tasks .dv-free .ti', 0); await W(600);
  const victim = await p.inputValue('#e-text');
  await T('[data-act="eDelete"]'); await W(500);
  ok(!(await texts('#tasks .row-title')).includes(victim), 'gelöscht: ' + victim);
  ok((await t.toastText()).includes('gelöscht'), 'Hinweis mit Rückgängig');
  await T('#toast button'); await W(400);
  ok((await texts('#tasks .row-title')).includes(victim), 'Rückgängig stellt wieder her');

  console.log('Filter nach Thema');
  await T('#tasks .filter .chip', 2); await W(350); await shot('25-filter');
  const f = await openTi();
  ok(f.length === 2 && f.every(x => /Fotos|Drohnen/.test(x)), 'Filter Film/Foto zeigt 2 Aufgaben: ' + f.join(' / '));
  await T('#tasks .filter .chip', 3); await W(300);
  await T('#tasks .filter .chip', 0); await W(300);
  ok((await openTi()).length === 8, 'Alle zeigt wieder 8');

  console.log('Neu laden');
  await p.reload(); await p.waitForSelector('body.live'); await L.decorate(p); await W(400);
  await T('[data-tab="tasks"]'); await W(400);
  ok((await openTi()).length === 8, 'nach Neuladen sind alle 8 Aufgaben da');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
