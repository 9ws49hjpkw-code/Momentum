// 1.3.0: Erledigtes nach Tagen gruppiert (Rückblick unten auf Aufgaben)
const { start, ok } = require('./common');
(async () => {
  const t = await start({ time: '2026-11-16T09:00:00+01:00' });
  const { p, T, W, capture, jump, texts } = t;
  const doneNow = async () => { await T('#today .rw[data-swipe] .check'); await W(1400); };

  console.log('Drei Tage, vier erledigte Aufgaben');
  await capture('Tonleitern C-Dur', { when: 'today', topic: 0 }); await W(2300); await doneNow();
  await jump('2026-11-17T10:00:00+01:00');
  await capture('Objektiv reinigen', { when: 'today', topic: 1 }); await W(2300); await doneNow();
  await jump('2026-11-19T08:00:00+01:00');
  await capture('Müll rausbringen', { when: 'today' }); await W(2300); await doneNow();
  await jump('2026-11-19T11:30:00+01:00');
  await capture('Rechnung zahlen', { when: 'today' }); await W(2300); await doneNow();

  await T('[data-tab="tasks"]'); await W(600);
  await T('#tasks .done-toggle'); await W(500);
  const heads = await texts('#tasks .dc-day .ag-h b');
  ok(JSON.stringify(heads) === JSON.stringify(['Heute', 'Dienstag', 'Montag']), 'Gruppen neueste zuerst: ' + heads.join(', '));
  const cnt = await texts('#tasks .dc-day .dc-n');
  ok(JSON.stringify(cnt) === JSON.stringify(['2 geschafft', '1 geschafft', '1 geschafft']), 'Zähler: ' + cnt.join(', '));
  const dates = await texts('#tasks .dc-day .ag-h span:not(.dc-n)');
  ok(dates[1] === '17. November', 'Datum neben dem Wochentag (' + dates[1] + ')');
  const first = await texts('#tasks .dc-day:first-child .row-title');
  ok(JSON.stringify(first) === JSON.stringify(['Rechnung zahlen', 'Müll rausbringen']), 'im Tag neueste zuerst: ' + first.join(', '));
  const tm = await texts('#tasks .dc-day:first-child .row-meta span:first-child');
  ok(tm[0] === '11:30' && tm[1] === '08:00', 'Uhrzeit des Erledigens (' + tm.join(', ') + ')');

  console.log('Themen-Filter');
  await T('#tasks .filter .chip', 1); await W(500);
  const fh = await texts('#tasks .dc-day .ag-h b');
  ok(JSON.stringify(fh) === JSON.stringify(['Montag']), 'nur das Klavier-Ziel bleibt: ' + fh.join(', '));
  ok((await texts('#tasks .dc-day .row-title'))[0] === 'Tonleitern C-Dur', 'richtige Aufgabe');
  await T('#tasks .filter .chip', 0); await W(500);

  console.log('Tippen öffnet zum Bearbeiten');
  await T('#tasks .dc-day .ti'); await W(700);
  ok((await p.$('#L-entry [data-act="reopen"], #L-entry .sheet')) !== null, 'Bearbeiten-Sheet offen');
  await T('#L-entry [data-act="closeTop"]'); await W(600);
  await p.evaluate(() => document.querySelector('#tasks .done-toggle').scrollIntoView({ block: 'start' })); await W(400);
  await t.shot('T18-rueckblick');
  await t.end();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
