/* ===== Ansichten ===== */
const ui = { tab: 'today', filter: null, doneOpen: false, doneLimit: 30, jQuery: '', jLimit: 30, installHint: true, update: false, shareFailed: false, fresh: null };
const inSafariTab = ('standalone' in navigator) && !navigator.standalone;
const fill = (el, ...kids) => { el.replaceChildren(); add(el, kids); return el; };
const btn = (spec, act, data, ...kids) => h('button' + spec, { type: 'button', data: Object.assign({ act }, data || {}) }, ...kids);

function topicTag(id) {
  const t = id && topicById(id);
  return t ? h('span.tp', null, h('i.dot', { vars: { '--h': t.hue } }), t.name) : null;
}
function checkMark() { const i = document.createElement('i'); i.innerHTML = IC.check; return i; }
function empty(icon, title, text, small) {
  return h('div.empty', { class: small ? 'small' : '' }, h('div.empty-ic', null, ic(icon)), h('h3', null, title), text ? h('p', null, text) : null);
}
function doneLabel(t) {
  const d = diffDays(dayOf(t.doneAt || Date.now()), today());
  return d === 0 ? 'Heute erledigt' : d === -1 ? 'Gestern erledigt' : 'Erledigt am ' + shortDate(dayOf(t.doneAt));
}
function taskMeta(t, group) {
  const m = [];
  if (group === 'done') m.push(h('span', null, doneLabel(t)));
  else {
    if (group === 'over') m.push(h('span.over', null, dueLabel(t.due)));
    else if (group === 'soon' || group === 'later') m.push(h('span', null, dueLabel(t.due)));
    else if (group === 'today' && t.now) m.push(h('span.hot', null, 'Jetzt'));
    const tl = timeLabel(t);
    if (tl) m.push(h('span.tm', null, tl));
    if (t.prio === 2) m.push(h('span.hot', null, 'Hoch'));
    else if (t.prio === 0) m.push(h('span', null, 'Niedrig'));
  }
  if (group !== 'done' && t.moved > 0) m.push(h('span.moved', null, t.moved + '× verschoben'));
  const tp = topicTag(t.topicId);
  if (tp) m.push(tp);
  if (taskDetails(t).length) m.push(h('span.has-det', { 'aria-label': 'hat Details' }, ic('note')));
  return m;
}
/* Details klappen unter der Aufgabe auf (Heute): Notiz, Klammer-Details, Zeit, dazu „Bearbeiten“ */
function rowDetails(t) {
  const det = taskDetails(t);
  return h('div.rw-det', null, h('div', null, h('div.rw-det-in', null,
    det.length ? det.map(x => h('p.det-note', null, x)) : h('p.det-none', null, 'Keine Details. Unter „Bearbeiten“ ergänzt du welche.'),
    h('div.det-foot', null, h('span'), btn('.pill.det-edit', 'editTask', { id: t.id }, 'Bearbeiten')))));
}
/* Farbe des Themas für die ganze Zeile */
function tpVars(id) { const t = id && topicById(id); return t ? { '--h': t.hue } : null; }
function taskRow(t, group) {
  const meta = taskMeta(t, group), tv = tpVars(t.topicId);
  return h('div.rw', { class: 'p' + t.prio + (t.done ? ' is-done' : '') + (group === 'over' ? ' od' : '') + (tv ? ' tp-on' : '') + (ui.fresh === t.id ? ' fresh' : ''), vars: tv, data: { id: t.id, swipe: t.done ? null : '1' } },
    h('div.rw-under', null, ic('check')),
    h('div.row', null,
      h('button.check', { type: 'button', 'aria-label': t.done ? 'Wieder öffnen' : 'Erledigen', data: { act: 'check', id: t.id } }, checkMark()),
      h('button.row-main', { type: 'button', 'aria-expanded': group === 'done' ? null : 'false', data: { act: group === 'done' ? 'editTask' : 'taskOpen', id: t.id } },
        h('span.row-title', null, taskTitle(t)),
        meta.length ? h('span.row-meta', null, meta) : null)),
    group === 'done' ? null : rowDetails(t));
}
function taskSection(title, list, group, cls) {
  return h('section.sec', null,
    h('h2.sec-h', { class: cls }, title, h('span.n', null, list.length)),
    h('div.group.glass', { class: group === 'over' ? 'over-g' : '' }, list.map(t => taskRow(t, group))));
}

/* ----- Heute ----- */
function goalsCard(goals) {
  const head = h('div.goals-head', null, h('h2', null, 'Tagesziele'),
    goals.length ? btn('.link', 'plan', { day: 'today' }, 'Tag planen') : null);
  if (!goals.length) {
    return h('section.goals.holo', null, head,
      h('div.goals-empty', null, h('p', null, 'Was zählt heute? Wähl bis zu drei Dinge.'), btn('.btn.btn-ghost', 'plan', { day: 'today' }, 'Tag planen')));
  }
  return h('section.goals.holo', null, head, goals.map(g => {
    const done = goalDone(g), t = g.taskId ? S.tasks.get(g.taskId) : null;
    const det = t ? taskDetails(t) : ((g.note || '').trim() ? [g.note.trim()] : []);
    const tl = t ? timeLabel(t) : '';
    return [h('div.goal', { class: done ? 'is-done' : '', data: { gid: g.id } },
      h('button.check', { type: 'button', 'aria-label': done ? 'Wieder öffnen' : 'Erledigen', data: { act: 'goalCheck', gid: g.id } }, checkMark()),
      h('button.goal-text', { type: 'button', 'aria-expanded': 'false', data: { act: 'goalOpen', gid: g.id } }, t ? taskTitle(t) : goalText(g),
        det.length ? h('span.has-det', { 'aria-label': 'hat Notiz' }, ic('note')) : null)),
    h('div.goal-det', null, h('div', null, h('div.rw-det-in', null,
      det.length ? det.map(x => h('p.det-note', null, x)) : h('p.det-none', null, t ? 'Keine Details.' : 'Noch keine Notiz.'),
      h('div.det-foot', null,
        tl ? h('span.det-time', null, ic('clock'), tl) : h('span'),
        t ? btn('.pill.det-edit', 'editTask', { id: t.id }, 'Bearbeiten') : btn('.pill.det-edit', 'goalNote', { gid: g.id }, det.length ? 'Notiz ändern' : 'Notiz')))))];
  }));
}
/* Überfällige Tagesziele: eigenes rotes Feld, steht über allem anderen Überfälligen */
function sinceLabel(date) {
  const d = diffDays(date, today());
  return d === -1 ? 'Ziel von gestern' : 'Ziel vom ' + shortDate(date) + ' · ' + plural(-d, 'Tag', 'Tage') + ' her';
}
function overGoalsCard(list) {
  if (!list.length) return null;
  return h('section.ogoals', null,
    h('div.ogoals-head', null, h('h2', null, 'Ziele überfällig'), h('span.n', null, list.length)),
    list.map(o => h('div.goal.og', null,
      h('button.check', { type: 'button', 'aria-label': 'Erledigen', data: { act: 'ogCheck', gid: o.g.id, date: o.date } }, checkMark()),
      h('button.goal-text', { type: 'button', data: { act: 'ogOpen', gid: o.g.id, date: o.date } },
        h('span.og-t', null, goalText(o.g)), h('span.og-meta', null, sinceLabel(o.date))))));
}
function tomorrowHint(day) {
  const n = liveGoals(addDays(day, 1)).length;
  if (!n && hourNow() < 17) return null;
  return btn('.hint-row', 'plan', { day: 'tomorrow' },
    h('span', null, n ? ['Morgen: ', h('b', null, plural(n, 'Ziel', 'Ziele')), ' geplant'] : 'Morgen schon planen'),
    ic('chevR'));
}
function ideaCard(i) {
  const tv = tpVars(i.topicId);
  return h('article.glass.idea-card', { class: tv ? 'tp-on' : '', vars: tv, data: { id: i.id } },
    h('div.idea-meta', null, ic('tIdeas'), h('span', null, 'Idee vom ' + plainDate(i.parkedOn)), topicTag(i.topicId)),
    h('p.idea-text', null, i.text),
    h('div.idea-actions', null,
      btn('.pill.go', 'ideaGo', { id: i.id }, 'Angehen'),
      btn('.pill', 'ideaPark', { id: i.id }, 'Weiter parken'),
      btn('.pill.quiet', 'ideaDrop', { id: i.id }, 'Verwerfen')));
}
function installCard() {
  return h('div.glass.notice', null, ic('share'),
    h('span', null, h('b', null, 'Erst installieren: '), 'Teilen, dann „Zum Home-Bildschirm“. Was du hier im Browser einträgst, landet nicht in der App.'),
    h('button.x', { type: 'button', 'aria-label': 'Hinweis schließen', data: { act: 'hideInstall' } }, ic('close')));
}
function updateCard() {
  return h('div.glass.holo.notice.center', null,
    h('span', null, h('b', null, 'Neue Version bereit')),
    btn('.pill.go', 'reload', {}, 'Aktualisieren'));
}
function renderToday() {
  renderBeams();
  const day = today();
  const goals = liveGoals(day);
  const inGoals = new Set(goals.filter(g => g.taskId).map(g => g.taskId));
  const og = overdueGoals(day);
  for (const o of og) if (o.g.taskId) inGoals.add(o.g.taskId);
  const open = Array.from(S.tasks.values()).filter(t => !t.done && t.due <= day && !inGoals.has(t.id));
  const now = open.filter(t => t.due === day && t.now).sort(cmpTask);
  const over = open.filter(t => t.due < day).sort(cmpTask);
  const due = open.filter(t => t.due === day && !t.now).sort(cmpTask);
  const ideas = Array.from(S.ideas.values()).filter(i => ideaDue(i, day)).sort((a, b) => a.createdAt - b.createdAt);
  const none = !now.length && !over.length && !due.length && !og.length;
  $('#today-title').textContent = cap(fWeekday.format(D(day)));
  $('#today-sub').textContent = plainDate(day);
  fill($('#today-top'), ui.update ? updateCard() : null, inSafariTab && ui.installHint ? installCard() : null);
  fill($('#today'),
    goalsCard(goals),
    overGoalsCard(og),
    tomorrowHint(day),
    ideas.length ? h('section.sec.idea-sec', null, h('h2.sec-h', null, 'Was wird daraus?', h('span.n', null, ideas.length)), ideas.map(ideaCard)) : null,
    now.length ? taskSection('Jetzt', now, 'now', 'now-h') : null,
    over.length ? taskSection('Überfällig', over, 'over', 'over-h') : null,
    due.length ? taskSection('Heute', due, 'today') : null,
    none ? empty('check', 'Nichts fällig', goals.length ? 'Bleiben deine Tagesziele. Mehr steht heute nicht an.' : 'Heute steht nichts an. Fällt dir etwas ein, leg es mit + ab.', true) : null);
}

/* ----- Aufgaben: Zeit-Übersicht ----- */
/* Hier wird nichts abgehakt. Tippen öffnet die Aufgabe mit allen Details. */
const BAND = 14, PPM = 1.15;
const fWd = fmt({ weekday: 'short' });
function tiMeta(t, ctx) {
  const m = [];
  if (ctx === 'done') m.push(h('span', null, doneLabel(t)));
  else {
    if (ctx === 'over') m.push(h('span.over', null, dueLabel(t.due)));
    else if (ctx === 'later') m.push(h('span', null, dueLabel(t.due)));
    if (t.prio === 2) m.push(h('span.hot', null, 'Hoch'));
    else if (t.prio === 0) m.push(h('span', null, 'Niedrig'));
    if (t.moved > 0) m.push(h('span.moved', null, t.moved + '× verschoben'));
  }
  const tp = topicTag(t.topicId);
  if (tp) m.push(tp);
  if (taskDetails(t).length) m.push(h('span.has-det', { 'aria-label': 'hat Details' }, ic('note')));
  return m;
}
function tiCard(t, ctx) {
  const tv = tpVars(t.topicId), tl = timeLabel(t), meta = tiMeta(t, ctx);
  return h('button.ti', { type: 'button', class: 'p' + t.prio + (t.done ? ' is-done' : '') + (ctx === 'over' ? ' od' : '') + (tv ? ' tp-on' : '') + (ui.fresh === t.id ? ' fresh' : ''), vars: tv, data: { act: 'editTask', id: t.id } },
    h('span.ti-main', null,
      h('span.row-title', null, taskTitle(t)),
      meta.length ? h('span.row-meta', null, meta) : null),
    tl ? h('span.ti-time', null, tl) : null);
}
function loadOf(list) { return list.reduce((n, t) => n + (t.dur || 30), 0); }
function weekBand(day, open) {
  const days = [];
  for (let i = 0; i < BAND; i++) days.push(addDays(day, i));
  return h('div.wband', null, h('div.wb-days', null, days.map(d => {
    const list = open.filter(t => t.due === d), load = loadOf(list);
    const lv = Math.min(1, load / 480);
    return h('button.wb-day', { type: 'button', class: (d === ui.tday ? 'on' : '') + (d === day ? ' today' : '') + (list.some(t => t.prio === 2) ? ' hot' : ''), 'aria-pressed': String(d === ui.tday), 'aria-label': longDate(d) + ', ' + plural(list.length, 'Aufgabe', 'Aufgaben'), vars: { '--l': lv.toFixed(3) }, data: { act: 'tday', day: d } },
      h('span.wb-w', null, d === day ? 'Heute' : fWd.format(D(d)).replace('.', '')),
      h('span.wb-n', null, String(+d.slice(8))),
      h('i.wb-bar', null, h('i')),
      h('span.wb-c', null, list.length ? String(list.length) : ''));
  })));
}
/* Blöcke, die sich überschneiden, teilen sich die Breite */
function lanes(items) {
  items.sort((a, b) => a.a - b.a || b.e - a.e);
  let cluster = [], end = -1;
  const flush = () => {
    const lastEnd = [];
    for (const it of cluster) {
      let l = lastEnd.findIndex(e => e <= it.a);
      if (l < 0) { l = lastEnd.length; lastEnd.push(0); }
      lastEnd[l] = it.e; it.lane = l;
    }
    for (const it of cluster) it.n = lastEnd.length;
    cluster = [];
  };
  for (const it of items) { if (it.a >= end && cluster.length) flush(); cluster.push(it); end = Math.max(end, it.e); }
  if (cluster.length) flush();
  return items;
}
function timeline(list, isToday) {
  const now = minNow();
  const items = list.map(t => { const a = toMin(t.time), d = t.dur || 30; return { t, a, e: Math.min(1440, a + d), d }; });
  /* Sichtbarer Ausschnitt: eine Stunde vor dem Ersten (bzw. jetzt) bis eine Stunde nach dem Letzten, mindestens 6 Stunden */
  let lo = Infinity, hi = -Infinity;
  for (const it of items) { lo = Math.min(lo, it.a); hi = Math.max(hi, it.e); }
  if (isToday) { lo = Math.min(lo, now); hi = Math.max(hi, now); }
  if (lo === Infinity) { lo = 9 * 60; hi = 17 * 60; }
  let from = Math.max(0, Math.floor(lo / 60) * 60 - 60), to = Math.min(1440, Math.ceil(hi / 60) * 60 + 60);
  if (to - from < 360) to = Math.min(1440, from + 360);
  if (to - from < 360) from = Math.max(0, to - 360);
  const y = m => Math.round((m - from) * PPM);
  const hours = [];
  for (let m = from; m <= to; m += 60) hours.push(h('div.tl-h', { style: 'top:' + y(m) + 'px', class: isToday && m + 60 <= now ? 'past' : '' }, h('span', null, String(m / 60 % 24).padStart(2, '0'))));
  const blocks = lanes(items).map(it => {
    const t = it.t, tv = tpVars(t.topicId), hgt = Math.max(30, Math.round(it.d * PPM) - 3);
    const st = isToday && !t.done ? (it.e <= now ? ' past' : it.a <= now ? ' live' : '') : '';
    return h('button.tl-b', { type: 'button', class: 'p' + t.prio + (t.done ? ' is-done' : '') + (tv ? ' tp-on' : '') + st + (hgt < 44 ? ' short' : ''), vars: Object.assign({ '--lane': it.lane, '--n': it.n, '--y': y(it.a) + 'px', '--bh': hgt + 'px' }, tv || {}), data: { act: 'editTask', id: t.id } },
      h('span.tl-t', null, taskTitle(t)),
      h('span.tl-m', null, timeLabel(t) + (st === ' live' ? ' · läuft' : '')));
  });
  const nowEl = isToday && now >= from && now <= to ? h('div.tl-now', { style: 'top:' + y(now) + 'px' }, h('span', null, fromMin(now))) : null;
  return h('div.tl', { style: 'height:' + (y(to) + 14) + 'px' }, hours, h('div.tl-col', null, blocks), nowEl);
}
function dayView(day, open, doneAll) {
  const d = ui.tday, isToday = d === day;
  const list = open.filter(t => t.due === d), doneHere = doneAll.filter(t => t.due === d);
  const timed = list.concat(doneHere).filter(t => toMin(t.time) != null);
  const free = list.filter(t => toMin(t.time) == null).sort(cmpTask);
  const load = loadOf(list.filter(t => t.dur));
  const sum = list.length ? plural(list.length, 'Aufgabe', 'Aufgaben') + (load ? ' · ' + durLabel(load) + ' geplant' : '') : (doneHere.length ? 'Alles erledigt' : 'Nichts geplant');
  return h('section.dayv', null,
    h('div.dv-head', null,
      h('h2', null, isToday ? 'Heute' : dueLabel(d)),
      h('span.dv-date', null, plainDate(d)),
      h('span.dv-sum', null, sum)),
    free.length ? h('div.dv-free', null, h('h3.dv-sub', null, 'Im Lauf des Tages', h('span.n', null, free.length)), h('div.ti-list', null, free.map(t => tiCard(t, 'day')))) : null,
    timed.length || isToday ? timeline(timed, isToday) : null,
    !list.length && !doneHere.length && !isToday ? h('p.dv-empty', null, 'Frei. Was hier landen soll, legst du mit + und einem Datum ab.') : null);
}
function renderTasks() {
  const day = today(), box = $('#tasks');
  if (ui.filter && !topicById(ui.filter)) ui.filter = null;
  if (!ui.tday || ui.tday < day || diffDays(ui.tday, day) >= BAND) ui.tday = day;
  const pass = t => !ui.filter || t.topicId === ui.filter;
  const all = Array.from(S.tasks.values());
  const og = overdueGoals(day).filter(o => o.g.taskId ? pass(S.tasks.get(o.g.taskId)) : !ui.filter);
  const ogIds = new Set(og.filter(o => o.g.taskId).map(o => o.g.taskId));
  const open = all.filter(t => !t.done && pass(t) && !ogIds.has(t.id));
  const doneAll = all.filter(t => t.done && pass(t));
  const done = doneAll.slice().sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const over = open.filter(t => t.due < day).sort(cmpTask);
  const ahead = open.filter(t => t.due >= day);
  const openAll = all.filter(t => !t.done).length;
  const oldC = $('.filter .chips', box), keep = oldC ? oldC.scrollLeft : 0;
  const oldB = $('.wb-days', box), keepB = oldB ? oldB.scrollLeft : null;
  let filter = null;
  if (S.topics.length && all.length) {
    filter = h('div.filter', null, h('div.chips', null,
      btn('.chip' + (ui.filter ? '' : '.on'), 'filter', {}, 'Alle'),
      S.topics.map(t => btn('.chip' + (ui.filter === t.id ? '.on' : ''), 'filter', { id: t.id }, h('i.dot', { vars: { '--h': t.hue } }), t.name))));
  }
  $('#tasks-sub').textContent = openAll ? plural(openAll, 'offene Aufgabe', 'offene Aufgaben') : 'Nichts offen';
  if (!all.length) {
    fill(box, empty('tTasks', 'Noch keine Aufgaben', 'Tipp auf +, schreib es auf und sag, wann. Mit Uhrzeit und Dauer erscheint es hier im Zeitstrahl.'));
    return;
  }
  /* Was nach dem gewählten Tag kommt: nach Tag gruppiert, dann alles Spätere */
  const rest = ahead.filter(t => t.due !== ui.tday).sort(cmpTime);
  const byDay = new Map(), later = [];
  for (const t of rest) {
    if (diffDays(t.due, day) < BAND) { if (!byDay.has(t.due)) byDay.set(t.due, []); byDay.get(t.due).push(t); }
    else later.push(t);
  }
  const agenda = [];
  for (const [d, list] of byDay) agenda.push(h('div.ag-day', null, h('h3.ag-h', null, h('b', null, dueLabel(d)), h('span', null, plainDate(d))), h('div.ti-list', null, list.map(t => tiCard(t, 'day')))));
  let blank = null;
  if (!open.length && !og.length && ui.filter) blank = empty('tTasks', 'Nichts offen', 'Für „' + topicById(ui.filter).name + '“ steht gerade nichts an.', true);
  else if (!open.length && !og.length) blank = empty('check', 'Alles erledigt', 'Nichts mehr offen. Der Rest gehört dir.', true);
  let doneSec = null;
  if (done.length) {
    const shown = done.slice(0, ui.doneLimit);
    doneSec = h('section.sec', null,
      h('button.done-toggle', { type: 'button', 'aria-expanded': String(ui.doneOpen), data: { act: 'toggleDone' } }, 'Erledigt', h('span.n', null, done.length), ic('chevD')),
      ui.doneOpen ? h('div.ti-list', { style: 'margin-top:6px' }, shown.map(t => tiCard(t, 'done'))) : null,
      ui.doneOpen && done.length > shown.length ? btn('.more', 'moreDone', {}, 'Mehr anzeigen') : null);
  }
  fill(box,
    filter,
    og.length ? h('div.sec', null, overGoalsCard(og)) : null,
    blank,
    over.length ? h('section.sec.over-s', null, h('h2.sec-h.over-h', null, 'Überfällig', h('span.n', null, over.length)), h('div.ti-list', null, over.map(t => tiCard(t, 'over')))) : null,
    h('section.sec.plan-s', null, weekBand(day, ahead), dayView(day, open, doneAll)),
    agenda.length ? h('section.sec.ag', null, h('h2.sec-h', null, 'Danach'), agenda) : null,
    later.length ? h('section.sec', null, h('h2.sec-h', null, 'Später', h('span.n', null, later.length)), h('div.ti-list', null, later.map(t => tiCard(t, 'later')))) : null,
    doneSec);
  if (keep) { const c = $('.filter .chips', box); if (c) c.scrollLeft = keep; }
  const wb = $('.wb-days', box);
  if (wb) {
    if (keepB != null) wb.scrollLeft = keepB;
    else { const on = $('.wb-day.on', wb); if (on && on.offsetLeft > wb.clientWidth - 70) wb.scrollLeft = on.offsetLeft - 20; }
  }
}
/* Jetzt-Linie und „läuft“ bleiben aktuell, solange Aufgaben offen ist */
function tickTasks() {
  if (ui.tab !== 'tasks' || layers.length || animating || document.hidden) return;
  if (!$('#tasks .tl-now') && !$('#tasks .tl-b')) return;
  renderTasks();
}

/* ----- Ideen ----- */
function renderIdeas() {
  const day = today();
  const list = Array.from(S.ideas.values()).sort((a, b) => b.createdAt - a.createdAt);
  $('#ideas-sub').textContent = list.length ? plural(list.length, 'Idee geparkt', 'Ideen geparkt') : 'Parkplatz für alles, was warten kann';
  fill($('#ideas'),
    list.length
      ? h('div.group.glass', null, list.map(i => {
        const due = ideaDue(i, day);
        const tv = tpVars(i.topicId);
        return h('div.rw.flat', { class: (ui.fresh === i.id ? 'fresh' : '') + (tv ? ' tp-on' : ''), vars: tv }, h('button.row', { type: 'button', data: { act: 'ideaOpen', id: i.id } },
          h('span.row-main', null,
            h('span.row-title', null, i.text),
            h('span.row-meta', null,
              h('span', null, 'Seit ' + shortDate(i.parkedOn)),
              due ? h('span.hot', null, 'Entscheidung fällig') : h('span', null, 'noch ' + plural(diffDays(i.reviewOn, day), 'Tag', 'Tage')),
              topicTag(i.topicId))),
          ic('chevR', 'row-chev')));
      }))
      : empty('tIdeas', 'Noch nichts geparkt', 'Ideen warten hier sieben Tage. Danach entscheidest du mit kühlem Kopf, was daraus wird.'));
}

/* ----- Journal ----- */
const JR = { date: null, els: null, pendingRoll: false };
const JE = { date: null, els: null };
const jTimers = {};
function buildFields(container, entry, onInput) {
  const els = {};
  container.replaceChildren();
  for (const f of J_FIELDS) {
    const ta = h('textarea', { rows: '2', placeholder: 'Hier schreiben', autocapitalize: 'sentences', 'aria-label': f[1] });
    ta.value = (entry && entry[f[0]]) || '';
    const wrap = h('div.grow', null, ta);
    bindGrow(wrap, ta);
    ta.addEventListener('input', () => { onInput(); keepEndVisible(ta); });
    container.appendChild(h('label.jf', null, h('span.jq', null, f[1]), wrap));
    els[f[0]] = ta;
  }
  return els;
}
function readFields(els) { const o = {}; for (const f of J_FIELDS) o[f[0]] = els[f[0]].value; return o; }
/* Text landet sofort im Speicherabbild, kurz darauf in der Datenbank */
function touchJ(date, vals) {
  const e = Object.assign({ date, updatedAt: Date.now() }, vals);
  if (jEmpty(e)) S.journal.delete(date); else S.journal.set(date, e);
  clearTimeout(jTimers[date]);
  jTimers[date] = setTimeout(() => flushJ(date), 350);
}
function flushJ(date) {
  if (!(date in jTimers)) return;
  clearTimeout(jTimers[date]);
  delete jTimers[date];
  const e = S.journal.get(date);
  if (e) dbPut('journal', e); else dbDel('journal', date);
}
function flushAllJ() { for (const d of Object.keys(jTimers)) flushJ(d); }
function dropJTimers() { for (const d of Object.keys(jTimers)) { clearTimeout(jTimers[d]); delete jTimers[d]; } }
function jState(text) {
  const has = JR.els && !jEmpty(readFields(JR.els));
  $('#j-save').setAttribute('aria-disabled', String(!has));
  $('#j-state').textContent = text != null ? text : (has ? 'Wird beim Schreiben automatisch gesichert' : '');
}
function mountJournal() {
  JR.date = today();
  JR.pendingRoll = false;
  $('#j-date').textContent = longDate(JR.date);
  JR.els = buildFields($('#j-editor'), S.journal.get(JR.date), () => { touchJ(JR.date, readFields(JR.els)); jState(); });
  jState();
}
function rollJournal() {
  if (JR.date === today()) return;
  flushJ(JR.date);
  const a = document.activeElement;
  if (a && $('#j-editor').contains(a)) { JR.pendingRoll = true; return; }
  mountJournal();
  renderJournalList();
}
function snippet(e, q) {
  const texts = J_FIELDS.map(f => (e[f[0]] || '').trim()).filter(Boolean);
  if (q) {
    for (const t of texts) {
      const i = t.toLowerCase().indexOf(q);
      if (i < 0) continue;
      const from = Math.max(0, i - 28);
      return [from ? '…' : '', t.slice(from, i), h('mark', null, t.slice(i, i + q.length)), t.slice(i + q.length, i + q.length + 110)];
    }
  }
  return [texts[0] || ''];
}
function renderJournalList() {
  const q = ui.jQuery.trim().toLowerCase();
  const all = Array.from(S.journal.values()).filter(e => e.date !== JR.date && !jEmpty(e)).sort((a, b) => (a.date < b.date ? 1 : -1));
  $('.search', $('#j-past')).hidden = !all.length;
  const box = $('#j-list');
  if (!all.length) { fill(box, h('div.jempty', null, 'Noch keine früheren Einträge. Was du heute schreibst, steht ab morgen hier.')); return; }
  const hit = e => J_FIELDS.some(f => (e[f[0]] || '').toLowerCase().indexOf(q) >= 0) || fLongY.format(D(e.date)).toLowerCase().indexOf(q) >= 0;
  const list = q ? all.filter(hit) : all;
  if (!list.length) { fill(box, h('div.jempty', null, 'Nichts gefunden für „' + ui.jQuery.trim() + '“.')); return; }
  const shown = list.slice(0, ui.jLimit);
  fill(box,
    h('div.group.glass', null, shown.map(e => h('div.rw.flat', null,
      h('button.jitem', { type: 'button', data: { act: 'jOpen', date: e.date } },
        h('span.jitem-date', null, longDate(e.date)),
        h('span.jitem-text', null, snippet(e, q)))))),
    list.length > shown.length ? btn('.more', 'jMore', {}, 'Ältere anzeigen') : null);
}
function openJEntry(date) {
  const e = S.journal.get(date);
  if (!e) return;
  JE.date = date;
  $('#je-title').textContent = (sameYear(date) ? fWShort : fShortY).format(D(date));
  JE.els = buildFields($('#je-editor'), e, () => touchJ(JE.date, readFields(JE.els)));
  const L = openLayer('L-jentry');
  $('.sheet-body', L).scrollTop = 0;
  L._onClose = () => { flushJ(JE.date); renderJournalList(); };
}

/* ----- Erfassen und Bearbeiten ----- */
const E = { mode: 'new', type: 'task', when: null, date: null, prio: 1, topicId: null, id: null, time: null, dur: null };
const eText = () => $('#e-text');
function entryValid() {
  if (!eText().value.trim()) return false;
  return E.type !== 'task' || (!!E.when && (E.when !== 'date' || validDay(E.date)));
}
function syncEntry() {
  const isNew = E.mode === 'new', isTask = E.type === 'task';
  $('#e-head').hidden = isNew;
  $('#e-title').textContent = E.mode === 'task' ? 'Aufgabe' : E.mode === 'idea' ? 'Idee' : E.mode === 'fromIdea' ? 'Idee angehen' : '';
  $('#e-type-fold').classList.toggle('off', !isNew);
  $('#e-seg').dataset.i = isTask ? '0' : '1';
  for (const b of $$('#e-seg button')) b.classList.toggle('on', b.dataset.type === E.type);
  $('#e-task-fold').classList.toggle('off', !isTask);
  /* Ideen: mehrere Zeilen, kein Limit. Aufgaben: eine Zeile, Enter speichert. */
  const ta = eText();
  if (isTask) { ta.setAttribute('maxlength', '280'); ta.setAttribute('enterkeyhint', 'done'); }
  else { ta.removeAttribute('maxlength'); ta.setAttribute('enterkeyhint', 'enter'); }
  $('#e-grow').classList.toggle('multi', !isTask);
  for (const b of $$('#e-when [data-when]')) b.classList.toggle('on', b.dataset.when === E.when);
  $('#e-date-chip').classList.toggle('on', E.when === 'date');
  $('#e-date-label').textContent = E.when === 'date' && E.date ? shortDate(E.date) : 'Datum';
  for (const b of $$('#e-prio [data-prio]')) b.classList.toggle('on', +b.dataset.prio === E.prio);
  $('#e-time-chip').classList.toggle('on', !!E.time);
  $('#e-time-label').textContent = E.time ? E.time + ' Uhr' : 'Uhrzeit';
  for (const b of $$('#e-time [data-dur]')) b.classList.toggle('on', +b.dataset.dur === E.dur);
  $('#e-detail-fold').classList.toggle('off', !(isTask && E.mode === 'task'));
  /* Zeitrahmen (Uhrzeit + Dauer) erscheint, sobald ein Tag gewählt ist – freiwillig */
  $('#e-dur-fold').classList.toggle('off', !(isTask && (E.when || E.time || E.dur || E.mode === 'task')));
  for (const b of $$('#e-topics [data-id]')) b.classList.toggle('on', b.dataset.id === E.topicId);
  let note = '';
  if (isNew && !isTask) note = 'Die Idee parkt. In 7 Tagen fragt „Heute“, was daraus wird.';
  else if (E.mode === 'idea') {
    const i = S.ideas.get(E.id);
    if (i) note = 'Geparkt am ' + plainDate(i.parkedOn) + '. ' + (ideaDue(i, today()) ? 'Die Entscheidung ist fällig.' : 'Meldet sich ' + inDays(i.reviewOn) + ' auf „Heute“.');
  }
  $('#e-note').textContent = note;
  $('#e-note').hidden = !note;
  const save = $('#e-save');
  save.textContent = E.mode === 'fromIdea' ? 'Als Aufgabe speichern' : (isNew && !isTask) ? 'Idee parken' : 'Speichern';
  save.setAttribute('aria-disabled', String(!entryValid()));
}
function openEntry(o) {
  const day = today();
  Object.assign(E, { mode: o.mode, type: 'task', when: null, date: null, prio: 1, topicId: null, id: o.id || null, time: null, dur: null, moveOk: false });
  let text = '', note = '';
  const sec = $('#e-secondary');
  sec.replaceChildren();
  if (o.mode === 'new') {
    if (ui.tab === 'tasks' && ui.filter) E.topicId = ui.filter;
  } else if (o.mode === 'task') {
    const t = S.tasks.get(o.id);
    if (!t) return;
    text = t.text; E.prio = t.prio; E.topicId = t.topicId; E.time = validTime(t.time) ? t.time : null; E.dur = normDur(t.dur); note = t.note || '';
    if (t.due === day) E.when = t.now ? 'now' : 'today';
    else if (t.due === addDays(day, 1)) E.when = 'tomorrow';
    else { E.when = 'date'; E.date = t.due; }
    if (t.done) sec.appendChild(btn('.btn.btn-ghost.sm', 'eReopen', {}, 'Wieder öffnen'));
    else if (validTime(t.time)) add(sec, [btn('.btn.btn-ghost.sm', 'toCal', {}, ic('cal'), 'Kalender'), btn('.btn.btn-ghost.sm', 'toAlarm', {}, ic('alarm'), 'Wecker')]);
    sec.appendChild(btn('.btn.btn-danger.sm', 'eDelete', {}, 'Löschen'));
  } else {
    const i = S.ideas.get(o.id);
    if (!i) return;
    text = i.text; E.topicId = i.topicId;
    if (o.mode === 'idea') {
      E.type = 'idea';
      add(sec, [btn('.btn.btn-ghost.sm', 'eGo', {}, 'Angehen'), btn('.btn.btn-danger.sm', 'eDrop', {}, 'Verwerfen')]);
    }
  }
  sec.hidden = !sec.children.length;
  const ta = eText();
  if (E.type === 'task') text = text.replace(/\s*\n+\s*/g, ' ');
  ta.value = text;
  $('#e-grow').dataset.v = text;
  const det = $('#e-detail');
  det.value = note;
  $('#e-detail-grow').dataset.v = note;
  $('#e-time-in').value = E.time || '';
  const dateEl = $('#e-date');
  dateEl.min = (E.date && E.date < day) ? '' : day;
  dateEl.value = E.date || addDays(day, 2);
  const topics = $('#e-topics');
  fill(topics, S.topics.map(t => btn('.chip', 'eTopic', { id: t.id }, h('i.dot', { vars: { '--h': t.hue } }), t.name)));
  $('#e-topic-fold').classList.toggle('off', !S.topics.length);
  for (const c of $$('#L-entry .chips, #L-entry .fold > div, #L-entry .sheet-body')) c.scrollLeft = 0;
  syncEntry();
  if (o.mode === 'new') guessKb();
  const L = openLayer('L-entry');
  $('.sheet-body', L).scrollTop = 0;
  if (o.mode === 'new') { try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); } }
}
function dueFromForm() {
  const day = today();
  if (E.when === 'now') return { due: day, now: true };
  if (E.when === 'today') return { due: day, now: false };
  if (E.when === 'tomorrow') return { due: addDays(day, 1), now: false };
  return { due: E.date, now: false };
}
function savedMsg(due, now) {
  const d = diffDays(due, today());
  if (d === 0) return now ? 'Gespeichert. Jetzt dran.' : 'Für heute gespeichert';
  if (d === 1) return 'Für morgen gespeichert';
  return 'Gespeichert für ' + shortDate(due);
}
/* Aufgaben bleiben einzeilig, Ideen behalten ihre Absätze */
const oneLine = v => v.replace(/\s+/g, ' ').trim();
const multiLine = v => v.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
function saveEntry() {
  const text = E.type === 'task' ? oneLine(eText().value) : multiLine(eText().value);
  if (!text) { nudge($('#e-grow')); return; }
  if (E.type === 'task' && !entryValid()) { nudge($('#e-when-row')); return; }
  const topicId = E.topicId && topicById(E.topicId) ? E.topicId : null;
  let msg = 'Gespeichert';
  if (E.type === 'task') {
    const w = dueFromForm();
    /* Klammern werden Details, ein eigenes Feld nimmt längere Notizen */
    let title = text, note = E.mode === 'task' ? multiLine($('#e-detail').value) : '';
    const sp = splitBrackets(text);
    if (sp.details.length) { title = sp.text; note = sp.details.concat(note ? [note] : []).join('\n'); }
    const extra = { note, time: E.time, dur: E.dur };
    if (E.mode === 'task') {
      /* Überfälliges verschieben ist unbequem: Rückfrage, und es zählt sichtbar mit */
      const old = S.tasks.get(E.id), day = today();
      const moving = !!old && !old.done && old.due < day && w.due !== old.due;
      if (moving && !E.moveOk) {
        const n = diffDays(day, old.due);
        dialog({
          title: 'Wirklich verschieben?',
          text: (old.moved ? 'Schon ' + old.moved + '× verschoben. ' : '') + 'Seit ' + plural(n, 'Tag', 'Tagen') + ' überfällig. Erledigen bringt dich weiter als Verschieben.',
          ok: 'Trotzdem verschieben', danger: true, cancel: 'Zurück'
        }).then(r => { if (r) { E.moveOk = true; saveEntry(); } });
        return;
      }
      if (moving) extra.moved = (old.moved || 0) + 1;
    }
    if (E.mode === 'task') updateTask(E.id, Object.assign({ text: title, due: w.due, now: w.now, prio: E.prio, topicId }, extra));
    else {
      ui.fresh = addTask(Object.assign({ text: title, due: w.due, now: w.now, prio: E.prio, topicId }, extra)).id;
      if (E.mode === 'fromIdea') removeIdea(E.id);
      msg = savedMsg(w.due, w.now);
    }
  } else if (E.mode === 'idea') updateIdea(E.id, { text, topicId });
  else { ui.fresh = addIdea({ text, topicId }).id; msg = 'Idee geparkt'; }
  haptic();
  Sound.play('save');
  closeLayer('L-entry');
  renderAll();
  ui.fresh = null;
  toast(msg);
}

/* ----- Notiz an einem Tagesziel ----- */
const N = { gid: null, day: null };
function openNote(gid) {
  const day = today(), g = liveGoals(day).find(x => x.id === gid);
  if (!g) return;
  N.gid = gid; N.day = day;
  $('#note-title').textContent = goalText(g);
  const ta = $('#note-text');
  ta.value = g.note || '';
  $('#note-grow').dataset.v = ta.value;
  guessKb();
  openLayer('L-note');
  try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); }
}
function saveNote() {
  const goals = liveGoals(N.day), g = goals.find(x => x.id === N.gid);
  if (g) {
    const v = multiLine($('#note-text').value);
    if (v) g.note = v; else delete g.note;
    saveGoals(N.day, goals);
  }
  haptic();
  Sound.play('save');
  closeLayer('L-note');
  renderToday();
  toast('Notiz gespeichert');
}

/* ----- Tag planen ----- */
const P = { which: 'today', day: null };
function openPlan(which) {
  P.which = which === 'tomorrow' ? 'tomorrow' : 'today';
  $('#plan-input').value = '';
  renderPlan();
  const L = openLayer('L-plan');
  $('.sheet-body', L).scrollTop = 0;
  L._onClose = () => renderToday();
}
function renderPlan() {
  const day = today();
  P.day = P.which === 'tomorrow' ? addDays(day, 1) : day;
  const goals = liveGoals(P.day), full = goals.length >= MAX_GOALS;
  $('#plan-seg').dataset.i = P.which === 'tomorrow' ? '1' : '0';
  for (const b of $$('#plan-seg button')) b.classList.toggle('on', b.dataset.day === P.which);
  fill($('#plan-date'), longDate(P.day), h('span.count', { class: full ? 'full' : '' }, goals.length + ' von ' + MAX_GOALS));
  const slots = [];
  for (let i = 0; i < MAX_GOALS; i++) {
    const g = goals[i];
    slots.push(g
      ? h('div.slot', { class: goalDone(g) ? 'is-done' : '' }, h('span.slot-n', null, i + 1), h('span.slot-t', null, goalText(g)),
        h('button.slot-x', { type: 'button', 'aria-label': 'Ziel entfernen', data: { act: 'planRemove', gid: g.id } }, ic('close')))
      : h('div.slot.free', null, h('span.slot-n', null, i + 1), h('span.slot-t', null, 'Noch frei')));
  }
  fill($('#plan-slots'), slots);
  const input = $('#plan-input');
  $('#plan-add').classList.toggle('dim', full);
  input.readOnly = full;
  input.placeholder = full ? 'Drei Ziele stehen' : 'Eigenes Ziel';
  if (full) input.value = '';
  $('#plan-add-btn').setAttribute('aria-disabled', String(full || !input.value.trim()));
  const sel = new Set(goals.filter(g => g.taskId).map(g => g.taskId));
  const tasks = Array.from(S.tasks.values()).filter(t => !t.done)
    .sort((a, b) => (GROUP_ORDER[groupOf(a, day)] - GROUP_ORDER[groupOf(b, day)]) || cmpTask(a, b));
  fill($('#plan-tasks'), tasks.length
    ? h('div.group.glass', null, tasks.map(t => {
      const on = sel.has(t.id), g = groupOf(t, day);
      return h('button.pick', { type: 'button', class: (on ? 'on' : '') + (full && !on ? ' dim' : ''), 'aria-pressed': String(on), data: { act: 'planPick', id: t.id } },
        h('span.sel', null, h('i', null, ic(on ? 'check' : 'plus'))),
        h('span.row-main', null, h('span.row-title', null, t.text),
          h('span.row-meta', null, h('span', { class: g === 'over' ? 'over' : '' }, dueLabel(t.due)), topicTag(t.topicId))));
    }))
    : h('div.jempty', null, 'Keine offenen Aufgaben. Schreib dein Ziel oben einfach als Text.'));
}
function planFull() {
  nudge($('#plan-slots'));
  toast('Mehr als drei geht nicht.');
}
function planAddFree() {
  const input = $('#plan-input');
  const text = input.value.replace(/\s+/g, ' ').trim();
  if (liveGoals(P.day).length >= MAX_GOALS) { planFull(); return; }
  if (!text) { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } return; }
  addGoal(P.day, { text });
  input.value = '';
  haptic();
  renderPlan();
  if (liveGoals(P.day).length >= MAX_GOALS) input.blur();
  renderToday();
}

/* ----- Einstellungen und Themen ----- */
const T = { id: null, hue: HUES[0] };
function renderSettings() {
  const last = S.meta.lastExport ? 'Letzter Export: ' + fStamp.format(new Date(S.meta.lastExport)) + ' Uhr' : 'Noch nie exportiert';
  fill($('#settings-body'),
    h('h3.sec-h', null, 'Themen'),
    h('div.glass.list', null,
      S.topics.map(t => h('button.li', { type: 'button', data: { act: 'topicOpen', id: t.id } }, h('i.dot', { vars: { '--h': t.hue } }), h('span.li-t', null, h('b', null, t.name)), ic('chevR', 'chev'))),
      h('button.li.add', { type: 'button', data: { act: 'topicOpen' } }, ic('plus'), h('span.li-t', null, h('b', null, 'Thema hinzufügen')))),
    h('div.sec', null,
      h('h3.sec-h', null, 'Daten'),
      h('div.glass.list', null,
        h('button.li', { type: 'button', data: { act: 'exportData' } }, ic('exportI'), h('span.li-t', null, h('b', null, 'Daten exportieren'), h('span', null, last))),
        h('label.li', { for: 'import-file' }, ic('importI'), h('span.li-t', null, h('b', null, 'Daten importieren'), h('span', null, 'Ersetzt alles, was jetzt in der App ist'))))),
    h('div.sec', null,
      h('h3.sec-h', null, 'Erinnern'),
      h('div.glass.list', null,
        h('button.li', { type: 'button', data: { act: 'soundToggle' } }, ic('sound'), h('span.li-t', null, h('b', null, 'Töne'), h('span', null, Sound.on() ? 'An · leise, Stummschalter wird beachtet' : 'Aus')), h('span.sw', { class: Sound.on() ? 'on' : '' }, h('i'))),
        h('button.li', { type: 'button', data: { act: 'badgeAsk' } }, ic('alarm'), h('span.li-t', null, h('b', null, 'Roter Zähler am App-Icon'), h('span', null, badgeText()))),
        h('button.li', { type: 'button', data: { act: 'rulesOpen' } }, ic('note'), h('span.li-t', null, h('b', null, 'Folge-Aufgaben'), h('span', null, rules().length ? plural(rules().length, 'Regel', 'Regeln') + ' aktiv' : 'Stichwort → Aufgabe danach')), ic('chevR', 'chev')),
        h('button.li', { type: 'button', data: { act: 'shortcutsHelp' } }, ic('cal'), h('span.li-t', null, h('b', null, 'Kalender & Wecker'), h('span', null, 'Über Kurzbefehle, einmal einrichten')), ic('chevR', 'chev')))),
    h('div.about', null, h('b', null, 'Momentum ' + VERSION), 'Alles bleibt auf diesem iPhone. Kein Konto, keine Cloud. Ein Export ab und zu ist dein Backup.'));
}
function renderHues() {
  fill($('#topic-hues'), HUES.map(hue => h('button.hue', { type: 'button', class: hue === T.hue ? 'on' : '', 'aria-label': 'Farbnuance', 'aria-pressed': String(hue === T.hue), vars: { '--h': hue }, data: { act: 'topicHue', hue } }, h('i'))));
}
function openTopic(id) {
  const t = id ? topicById(id) : null;
  T.id = t ? t.id : null;
  T.hue = t ? t.hue : nextHue();
  $('#topic-title').textContent = t ? 'Thema' : 'Neues Thema';
  $('#topic-name').value = t ? t.name : '';
  $('#topic-del').hidden = !t;
  renderHues();
  if (!t) guessKb();
  openLayer('L-topic');
  if (!t) { try { $('#topic-name').focus({ preventScroll: true }); } catch (e) {} }
}
function saveTopic() {
  const input = $('#topic-name');
  const name = input.value.replace(/\s+/g, ' ').trim();
  if (!name) { nudge($('#topic-field')); return; }
  if (S.topics.some(t => t.id !== T.id && t.name.toLowerCase() === name.toLowerCase())) { nudge($('#topic-field')); toast('Den Namen gibt es schon.'); return; }
  if (T.id) updateTopic(T.id, { name, hue: T.hue }); else addTopic(name, T.hue);
  haptic();
  closeLayer('L-topic');
  renderSettings();
  renderAll();
}

/* ----- Export und Import ----- */
function download(json, name, done) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = h('a', { href: url, download: name, style: 'display:none' });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  done();
}
function exportData() {
  flushAllJ();
  const json = JSON.stringify(exportPayload(), null, 2);
  const name = 'momentum-backup-' + today() + '.json';
  const done = () => { setMeta('lastExport', Date.now()); renderSettings(); toast('Backup erstellt'); };
  if (!ui.shareFailed && navigator.share && navigator.canShare && typeof File === 'function') {
    let file = null, can = false;
    for (const type of ['application/json', 'text/plain']) {
      try { file = new File([json], name, { type }); can = navigator.canShare({ files: [file] }); } catch (e) { can = false; }
      if (can) break;
    }
    if (can) {
      /* Abbruch im Teilen-Menü ist kein Fehler. Scheitert das Teilen wirklich, nimmt der nächste Versuch den Download-Weg. */
      navigator.share({ files: [file] }).then(done).catch(err => {
        if (err && err.name === 'AbortError') return;
        ui.shareFailed = true;
        toast('Der Export hat nicht geklappt. Tipp noch einmal darauf.', { ms: 4500 });
      });
      return;
    }
  }
  download(json, name, done);
}
function readFile(f) {
  if (f.text) return f.text();
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsText(f); });
}
async function importFile(f) {
  let parsed = null;
  try { parsed = normalizeImport(JSON.parse(await readFile(f))); } catch (e) { parsed = null; }
  if (!parsed) {
    await dialog({ title: 'Das ist kein Momentum-Backup', text: 'Wähl eine Datei, die du hier über „Daten exportieren“ gesichert hast.', ok: 'OK', cancel: false });
    return;
  }
  const d = parsed.data;
  const when = parsed.exportedAt ? ' vom ' + fStamp.format(new Date(parsed.exportedAt)) + ' Uhr' : '';
  const ok = await dialog({
    title: 'Alles ersetzen?',
    text: 'Das Backup' + when + ' enthält ' + plural(d.tasks.length, 'Aufgabe', 'Aufgaben') + ', ' + plural(d.ideas.length, 'Idee', 'Ideen') + ' und ' + plural(d.journal.length, 'Journal-Eintrag', 'Journal-Einträge') + '. Was jetzt in der App ist, wird überschrieben.',
    ok: 'Ersetzen', danger: true
  });
  if (!ok) return;
  if (S.meta.lastExport) d.meta.push({ key: 'lastExport', value: S.meta.lastExport });
  dropJTimers();
  try { await DB.replaceAll(d); }
  catch (e) { toast('Der Import hat nicht geklappt. Deine Daten sind unverändert.', { ms: 5000 }); return; }
  hydrate(d);
  ui.filter = null; ui.jQuery = ''; $('#j-search').value = ''; $('#j-clear').hidden = true;
  mountJournal();
  renderAll();
  renderSettings();
  toast('Daten importiert');
}

/* ----- Lichtlinie: Bilanz des Tages ----- */
function balance() {
  const day = today();
  let done = 0, open = 0, over = 0;
  for (const t of S.tasks.values()) {
    if (t.done) { if (t.due <= day && t.doneAt && dayOf(t.doneAt) === day) done++; }
    else if (t.due < day) over++;
    else if (t.due === day) open++;
  }
  for (const g of liveGoals(day)) if (!g.taskId) { if (g.done) done++; else open++; }
  for (const d of S.days.values()) if (d.date < day) for (const g of d.goals) if (!g.taskId && g.done && g.doneAt && dayOf(g.doneAt) === day) done++;
  for (const o of overdueGoals(day)) if (!o.g.taskId) over++;
  return { done, open, over, total: done + open + over };
}
function renderBeams() {
  renderAlarm();
  const b = balance();
  const pct = n => (b.total ? Math.round(n / b.total * 1000) / 10 : 0) + '%';
  const cap = () => {
    if (!b.total) return [];
    if (!b.open && !b.over) return [h('b', null, 'Alles erledigt')];
    return [h('b', null, b.done + '/' + b.total), ' erledigt', b.over ? [' · ', h('em', null, b.over + ' überfällig')] : null];
  };
  for (const el of $$('.beam')) {
    el.style.setProperty('--a', pct(b.done));
    el.style.setProperty('--o', pct(b.over));
    el.classList.toggle('calm', !b.total);
    fill($('.b-cap', el), cap());
  }
}

/* ----- Überfällig soll wehtun: roter Leuchtrand, stärker je mehr und wichtiger ----- */
function alarmState() {
  const day = today();
  let score = 0, n = 0;
  for (const t of S.tasks.values()) if (!t.done && t.due < day) { n++; score += t.prio === 2 ? 3 : t.prio === 1 ? 2 : 1; }
  const og = overdueGoals(day).length;
  score += og * 4; n += og;
  const level = !score ? 0 : (og > 0 || score >= 8) ? 3 : score >= 4 ? 2 : 1;
  return { score, n, goals: og, level };
}
function renderAlarm() {
  const a = alarmState(), el = $('#alarm');
  if (el) {
    el.dataset.l = String(a.level);
    el.style.setProperty('--ai', Math.min(1, a.score / 16).toFixed(3));
  }
  document.body.classList.toggle('alarm', a.level > 0);
  updateBadge(a.n);
  return a;
}
/* Roter Zähler am App-Icon (nur wenn das System es erlaubt; keine Mitteilungen) */
let badgeN = -1;
function updateBadge(n) {
  if (n === badgeN || !('setAppBadge' in navigator)) return;
  badgeN = n;
  try {
    const p = n > 0 ? navigator.setAppBadge(n) : navigator.clearAppBadge();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

function badgeText() {
  if (!('setAppBadge' in navigator)) return 'Geht erst in der installierten App (ab iOS 16.4)';
  const p = 'Notification' in window ? Notification.permission : 'granted';
  if (p === 'granted') return 'An · zeigt, wie viel überfällig ist';
  if (p === 'denied') return 'Nicht erlaubt · in den iPhone-Einstellungen unter Momentum erlauben';
  return 'Tippen, um es zu erlauben (es kommen keine Mitteilungen)';
}
async function badgeAsk() {
  if (!('setAppBadge' in navigator)) { toast('Das geht nur in der installierten App.'); return; }
  try { if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); } catch (e) {}
  badgeN = -1;
  renderAlarm();
  renderSettings();
}

/* ----- Folge-Aufgaben: Regeln verwalten und auslösen ----- */
function renderRules() {
  const list = rules();
  fill($('#rules-list'), list.length
    ? list.map(r => h('div.li.rule', null, h('span.li-t', null, h('b', null, r.word), h('span', null, '→ ' + r.then)),
      h('button.slot-x', { type: 'button', 'aria-label': 'Regel löschen', data: { act: 'ruleDel', id: r.id } }, ic('close'))))
    : h('div.li', null, h('span.li-t', null, h('span', null, 'Noch keine Regel. Zum Beispiel: Drucken → Stundenliste eintragen.'))));
}
function openRules() {
  renderRules();
  $('#rule-word').value = ''; $('#rule-then').value = '';
  const L = openLayer('L-rules');
  $('.sheet-body', L).scrollTop = 0;
  L._onClose = () => renderSettings();
}
function addRule() {
  const word = $('#rule-word').value.replace(/\s+/g, ' ').trim(), then = $('#rule-then').value.replace(/\s+/g, ' ').trim();
  if (!word) { nudge($('#rule-word').parentElement); return; }
  if (!then) { nudge($('#rule-then').parentElement); return; }
  const list = rules();
  if (list.some(r => r.word.toLowerCase() === word.toLowerCase())) { nudge($('#rule-word').parentElement); toast('Das Stichwort gibt es schon.'); return; }
  list.push({ id: uid(), word, then, since: Date.now() });
  setMeta('rules', list);
  $('#rule-word').value = ''; $('#rule-then').value = '';
  const a = document.activeElement; if (a && a.blur) a.blur();
  haptic(); Sound.play('save');
  renderRules();
  toast('Regel angelegt');
}
function delRule(id) {
  const list = rules(), r = list.find(x => x.id === id);
  if (!r) return;
  setMeta('rules', list.filter(x => x.id !== id));
  renderRules();
  toast('Regel gelöscht', { action: 'Rückgängig', onAction: () => { const l = rules(); l.push(r); setMeta('rules', l); renderRules(); } });
}
/* Fällige Folge-Aufgaben anlegen (einmalig je Aufgabe) und melden */
function followUp() {
  const made = runRules();
  if (!made.length) return;
  for (const t of made) ui.fresh = t.id;
  if (!layers.length && !animating) renderAll(); else renderAlarm();
  ui.fresh = null;
  haptics(2, 90);
  Sound.play('save');
  toast(made.length === 1 ? 'Jetzt dran: ' + made[0].text : plural(made.length, 'Folge-Aufgabe', 'Folge-Aufgaben') + ' auf „Heute“', { ms: 5000 });
}

/* ----- Kalender & Wecker über Kurzbefehle ----- */
function runShortcut(name, data) {
  const url = 'shortcuts://run-shortcut?name=' + encodeURIComponent(name) + '&input=text&text=' + encodeURIComponent(JSON.stringify(data));
  try { location.href = url; } catch (e) {}
}
function taskToCal(t) {
  const a = toMin(t.time), e = a + (t.dur || 30);
  const endDay = addDays(t.due, Math.floor(e / 1440));
  runShortcut('Momentum Termin', { titel: taskTitle(t), start: t.due + ' ' + t.time, ende: endDay + ' ' + fromMin(e), notiz: taskDetails(t).join('\n') });
}
function taskToAlarm(t) { runShortcut('Momentum Wecker', { titel: taskTitle(t), zeit: t.time, datum: t.due }); }
/* Zeilen aus dem Kurzbefehl „Momentum Woche“: „2026-11-20 14:00 | 60 | Titel“ (auch ganztägig „2026-11-20 | | Titel“) */
function parseCal(text) {
  const out = [];
  for (const raw of String(text || '').split(/\r?\n/)) {
    const parts = raw.split(/\s*[|;\t]\s*/);
    if (parts.length < 2) continue;
    const m = parts[0].trim().match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
    if (!m || !validDay(m[1])) continue;
    const title = (parts.length >= 3 ? parts.slice(2).join(' ') : parts[1]).replace(/\s+/g, ' ').trim().slice(0, 280);
    if (!title) continue;
    const time = m[2] != null ? String(+m[2]).padStart(2, '0') + ':' + m[3] : null;
    const dur = parts.length >= 3 ? normDur(parseFloat(String(parts[1]).replace(',', '.'))) : null;
    out.push({ due: m[1], time: validTime(time) ? time : null, dur, text: title });
  }
  return out;
}
async function calPaste() {
  let text = '';
  try { text = navigator.clipboard && navigator.clipboard.readText ? await navigator.clipboard.readText() : ''; } catch (e) { text = ''; }
  const day = today();
  const found = parseCal(text).filter(x => x.due >= day);
  if (!found.length) {
    const r = await dialog({ title: 'Keine Termine gefunden', text: 'Starte zuerst den Kurzbefehl „Momentum Woche“. Er kopiert deine Termine, dann hier noch einmal tippen.', ok: 'So richtest du es ein', cancel: 'OK' });
    if (r) openHelp();
    return;
  }
  const key = x => x.text.toLowerCase() + '|' + x.due + '|' + (x.time || '');
  const have = new Set(Array.from(S.tasks.values()).map(t => key({ text: t.text, due: t.due, time: t.time })));
  const fresh = found.filter(x => !have.has(key(x)));
  if (!fresh.length) { toast('Alle Termine sind schon da.'); return; }
  const ok = await dialog({ title: plural(fresh.length, 'Termin', 'Termine') + ' übernehmen?', text: fresh.slice(0, 4).map(x => shortDate(x.due) + (x.time ? ' ' + x.time : '') + ' · ' + x.text).join('\n') + (fresh.length > 4 ? '\n…' : '') + (found.length > fresh.length ? '\n' + plural(found.length - fresh.length, 'Termin ist', 'Termine sind') + ' schon da.' : ''), ok: 'Übernehmen' });
  if (!ok) return;
  for (const x of fresh) addTask({ text: x.text, due: x.due, now: false, prio: 1, topicId: null, time: x.time, dur: x.dur, src: 'cal' });
  if (topLayer() && topLayer().id === 'L-help') closeLayer('L-help');
  haptic(); Sound.play('save');
  renderAll();
  toast(plural(fresh.length, 'Termin', 'Termine') + ' im Zeitplan');
}
function openHelp() { const L = openLayer('L-help'); $('.sheet-body', L).scrollTop = 0; }

/* ----- Alles zeichnen ----- */
function renderAll() {
  renderAlarm();
  renderToday();
  renderTasks();
  renderIdeas();
  renderJournalList();
}
let animating = 0;
function animEnd() {
  animating = Math.max(0, animating - 1);
  if (!animating) renderAll();
}
function collapseCard(card) {
  const sec = card.closest('.idea-sec');
  return collapse(sec && sec.querySelectorAll('.idea-card').length === 1 ? sec : card);
}
function collapseRow(w) {
  const g = w.parentElement;
  const only = g && g.classList.contains('group') && g.children.length === 1;
  return collapse(only ? (g.closest('.sec') || g) : w);
}
/* Seitenwechsel: Scanlinie in der Bereichsfarbe, neue Ansicht baut sich von oben auf. Blockiert keine Eingabe. */
let hudT = 0;
function hudSweep(view) {
  if (reduced()) return;
  const hud = $('#hud');
  if (hud) { hud.classList.remove('run'); void hud.offsetWidth; hud.classList.add('run'); }
  if (view) { void view.offsetWidth; view.classList.add('reveal'); }
  clearTimeout(hudT);
  hudT = setTimeout(() => { if (hud) hud.classList.remove('run'); for (const v of $$('.view.reveal')) v.classList.remove('reveal'); }, 520);
}
/* Der Lichtpunkt gleitet von der Stelle des alten Bereichs zur neuen */
const BEAM_POS = { today: 0, tasks: 1 / 3, ideas: 2 / 3, journal: 1 };
function glideBeam(from, to) {
  if (reduced()) return;
  const c = $('#v-' + to + ' .b-c'), beam = c && c.parentElement;
  if (!c || !c.animate || !beam.offsetWidth) return;
  const w = beam.offsetWidth - 4, x = p => Math.round(BEAM_POS[p] * w) + 'px';
  try { c.animate([{ transform: 'translateX(' + x(from) + ')' }, { transform: 'translateX(' + x(to) + ')' }], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' }); } catch (e) {}
}
function go(name) {
  if (ui.tab === name) {
    const sc = $('#v-' + name + ' .scroll');
    if (sc) { try { sc.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) { sc.scrollTop = 0; } }
    return;
  }
  const a = document.activeElement;
  if (a && a.blur && isField(a)) a.blur();
  const from = ui.tab;
  ui.tab = name;
  Sound.play('swipe');
  document.body.dataset.tab = name;
  for (const v of $$('.view')) { v.classList.toggle('active', v.id === 'v-' + name); v.classList.remove('reveal'); }
  hudSweep($('#v-' + name));
  glideBeam(from, name);
  for (const b of $$('.tab')) { const on = b.dataset.tab === name; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); }
}
