// Aufgaben: abhaken, wischen, rückgängig, bearbeiten, löschen, filtern, Erledigt
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-16T10:00:00+01:00' });
  const { p, T, W, texts, shot, L } = t;
  await t.seed();

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

  console.log('Wischen');
  await T('[data-tab="tasks"]'); await W(450);
  await L.swipe(p, '#tasks .rw[data-swipe]', 40); await W(700);
  ok((await texts('#tasks .rw[data-swipe] .row-title'))[0] === 'Klavierstück Takt 1 bis 16 üben', 'kurzes Wischen hakt nicht ab');
  await L.swipe(p, '#tasks .rw[data-swipe]', 130, { hold: async () => { await shot('22-wischen'); } }); await W(1100);
  ok(!(await texts('#tasks .rw[data-swipe] .row-title')).includes('Klavierstück Takt 1 bis 16 üben'), 'Wischen nach rechts = erledigt');
  ok((await t.toastText()).includes('Erledigt'), 'Rückgängig-Hinweis nach Wischen');
  // vertikales Scrollen darf nicht abhaken
  await L.swipe(p, '#tasks .rw[data-swipe]', 12, { dy: -120 }); await W(500);
  const before = (await texts('#tasks .rw[data-swipe] .row-title')).length;
  ok(before === 7, 'senkrechtes Wischen scrollt nur (7 offen): ' + before);
  await p.evaluate(() => document.querySelector('#v-tasks .scroll').scrollTo(0, 0));
  await W(2500);

  console.log('Erledigt-Bereich');
  ok((await texts('#tasks .done-toggle'))[0].startsWith('Erledigt'), 'Bereich „Erledigt“ vorhanden');
  ok((await p.$$('#tasks .rw.is-done')).length === 0, 'eingeklappt');
  await T('#tasks .done-toggle'); await W(300);
  ok((await texts('#tasks .rw.is-done .row-title'))[0] === 'Klavierstück Takt 1 bis 16 üben', 'aufgeklappt zeigt erledigte Aufgabe');
  await p.evaluate(() => { const s = document.querySelector('#v-tasks .scroll'); s.scrollTo(0, s.scrollHeight); }); await W(300);
  await shot('23-erledigt-offen');
  await T('#tasks .rw.is-done .check'); await W(400);
  ok((await texts('#tasks .rw[data-swipe] .row-title')).includes('Klavierstück Takt 1 bis 16 üben'), 'Kreis in „Erledigt“ öffnet wieder');
  await p.evaluate(() => document.querySelector('#v-tasks .scroll').scrollTo(0, 0));

  console.log('Bearbeiten');
  await T('#tasks .rw[data-swipe] .row-main', 1); await W(700);
  await shot('24-bearbeiten');
  ok((await texts('#e-title'))[0] === 'Aufgabe', 'Bearbeiten-Sheet offen');
  ok(await p.evaluate(() => document.activeElement.id !== 'e-text'), 'beim Bearbeiten springt keine Tastatur auf');
  const on = await texts('#L-entry .chip.on');
  console.log('   aktiv:', on.join(', '));
  await T('#e-when [data-when="tomorrow"]'); await T('#e-prio [data-prio="0"]');
  await p.fill('#e-text', 'Zahnarzt anrufen und Termin machen'); await W(600); await shot('24b-bearbeiten-tastatur');
  await T('#e-save'); await W(600);
  const soon = await p.$$eval('#tasks .sec', s => s.map(x => x.querySelector('.sec-h').textContent + ': ' + [...x.querySelectorAll('.row-title')].map(r => r.textContent).join(' / ')));
  console.log('   ' + soon.join('\n   '));
  ok(soon.some(x => x.startsWith('Demnächst') && x.includes('Zahnarzt anrufen und Termin machen')), 'geänderte Aufgabe steht unter Demnächst');
  ok(soon.find(x => x.startsWith('Demnächst')).endsWith('Zahnarzt anrufen und Termin machen'), 'niedrige Priorität steht in der Gruppe unten');

  console.log('Löschen + Rückgängig');
  await T('#tasks .rw[data-swipe] .row-main', 0); await W(600);
  const victim = await p.inputValue('#e-text');
  await T('[data-act="eDelete"]'); await W(500);
  ok(!(await texts('#tasks .row-title')).includes(victim), 'gelöscht: ' + victim);
  ok((await t.toastText()).includes('gelöscht'), 'Hinweis mit Rückgängig');
  await T('#toast button'); await W(400);
  ok((await texts('#tasks .row-title')).includes(victim), 'Rückgängig stellt wieder her');

  console.log('Filter nach Thema');
  await T('#tasks .filter .chip', 2); await W(350); await shot('25-filter');
  const f = await texts('#tasks .rw[data-swipe] .row-title');
  ok(f.length === 2 && f.every(x => /Fotos|Drohnen/.test(x)), 'Filter Film/Foto zeigt 2 Aufgaben: ' + f.join(' / '));
  await T('#tasks .filter .chip', 3); await W(300);
  await T('#tasks .filter .chip', 0); await W(300);
  ok((await texts('#tasks .rw[data-swipe] .row-title')).length === 8, 'Alle zeigt wieder 8');

  console.log('Sortierung');
  const all = await p.$$eval('#tasks .sec', s => s.map(x => x.querySelector('.sec-h').textContent + ': ' + [...x.querySelectorAll('.rw[data-swipe]')].map(r => r.className.match(/p\d/)[0] + ' ' + r.querySelector('.row-title').textContent).join(' / ')));
  console.log('   ' + all.join('\n   '));

  console.log('Neu laden');
  await p.reload(); await p.waitForSelector('body.ready'); await L.decorate(p); await W(400);
  await T('[data-tab="tasks"]'); await W(400);
  ok((await texts('#tasks .rw[data-swipe] .row-title')).length === 8, 'nach Neuladen sind alle 8 Aufgaben da');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
