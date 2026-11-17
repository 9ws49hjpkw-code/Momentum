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
    if (t.prio === 2) m.push(h('span.hot', null, 'Hoch'));
    else if (t.prio === 0) m.push(h('span', null, 'Niedrig'));
  }
  const tp = topicTag(t.topicId);
  if (tp) m.push(tp);
  return m;
}
/* Farbe des Themas für die ganze Zeile */
function tpVars(id) { const t = id && topicById(id); return t ? { '--h': t.hue } : null; }
function taskRow(t, group) {
  const meta = taskMeta(t, group), tv = tpVars(t.topicId);
  return h('div.rw', { class: 'p' + t.prio + (t.done ? ' is-done' : '') + (group === 'over' ? ' od' : '') + (tv ? ' tp-on' : '') + (ui.fresh === t.id ? ' fresh' : ''), vars: tv, data: { id: t.id, swipe: t.done ? null : '1' } },
    h('div.rw-under', null, ic('check')),
    h('div.row', null,
      h('button.check', { type: 'button', 'aria-label': t.done ? 'Wieder öffnen' : 'Erledigen', data: { act: 'check', id: t.id } }, checkMark()),
      h('button.row-main', { type: 'button', data: { act: 'editTask', id: t.id } },
        h('span.row-title', null, t.text),
        meta.length ? h('span.row-meta', null, meta) : null)));
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
    const done = goalDone(g);
    return h('div.goal', { class: done ? 'is-done' : '' },
      h('button.check', { type: 'button', 'aria-label': done ? 'Wieder öffnen' : 'Erledigen', data: { act: 'goalCheck', gid: g.id } }, checkMark()),
      btn('.goal-text', 'goalOpen', { gid: g.id }, goalText(g)));
  }));
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
  const open = Array.from(S.tasks.values()).filter(t => !t.done && t.due <= day && !inGoals.has(t.id));
  const now = open.filter(t => t.due === day && t.now).sort(cmpTask);
  const over = open.filter(t => t.due < day).sort(cmpTask);
  const due = open.filter(t => t.due === day && !t.now).sort(cmpTask);
  const ideas = Array.from(S.ideas.values()).filter(i => ideaDue(i, day)).sort((a, b) => a.createdAt - b.createdAt);
  const none = !now.length && !over.length && !due.length;
  $('#today-title').textContent = cap(fWeekday.format(D(day)));
  $('#today-sub').textContent = plainDate(day);
  fill($('#today-top'), ui.update ? updateCard() : null, inSafariTab && ui.installHint ? installCard() : null);
  fill($('#today'),
    goalsCard(goals),
    tomorrowHint(day),
    ideas.length ? h('section.sec.idea-sec', null, h('h2.sec-h', null, 'Was wird daraus?', h('span.n', null, ideas.length)), ideas.map(ideaCard)) : null,
    now.length ? taskSection('Jetzt', now, 'now', 'now-h') : null,
    over.length ? taskSection('Überfällig', over, 'over', 'over-h') : null,
    due.length ? taskSection('Heute', due, 'today') : null,
    none ? empty('check', 'Nichts fällig', inGoals.size ? 'Bleiben deine Tagesziele. Mehr steht heute nicht an.' : 'Heute steht nichts an. Fällt dir etwas ein, leg es mit + ab.', true) : null);
}

/* ----- Aufgaben ----- */
function renderTasks() {
  const day = today(), box = $('#tasks');
  if (ui.filter && !topicById(ui.filter)) ui.filter = null;
  const pass = t => !ui.filter || t.topicId === ui.filter;
  const all = Array.from(S.tasks.values());
  const open = all.filter(t => !t.done && pass(t));
  const done = all.filter(t => t.done && pass(t)).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const g = { over: [], today: [], soon: [], later: [] };
  for (const t of open) g[groupOf(t, day)].push(t);
  for (const k in g) g[k].sort(cmpTask);
  const openAll = all.filter(t => !t.done).length;
  const old = $('.filter .chips', box), keep = old ? old.scrollLeft : 0;
  let filter = null;
  if (S.topics.length && all.length) {
    filter = h('div.filter', null, h('div.chips', null,
      btn('.chip' + (ui.filter ? '' : '.on'), 'filter', {}, 'Alle'),
      S.topics.map(t => btn('.chip' + (ui.filter === t.id ? '.on' : ''), 'filter', { id: t.id }, h('i.dot', { vars: { '--h': t.hue } }), t.name))));
  }
  let blank = null;
  if (!open.length) {
    if (ui.filter) blank = empty('tTasks', 'Nichts offen', 'Für „' + topicById(ui.filter).name + '“ steht gerade nichts an.');
    else if (!all.length) blank = empty('tTasks', 'Noch keine Aufgaben', 'Tipp auf +, schreib es auf und sag, wann. Dann ist es aus dem Kopf.');
    else blank = empty('check', 'Alles erledigt', 'Nichts mehr offen. Der Rest gehört dir.');
  }
  let doneSec = null;
  if (done.length) {
    const shown = done.slice(0, ui.doneLimit);
    doneSec = h('section.sec', null,
      h('button.done-toggle', { type: 'button', 'aria-expanded': String(ui.doneOpen), data: { act: 'toggleDone' } }, 'Erledigt', h('span.n', null, done.length), ic('chevD')),
      ui.doneOpen ? h('div.group.glass', { style: 'margin-top:6px' }, shown.map(t => taskRow(t, 'done'))) : null,
      ui.doneOpen && done.length > shown.length ? btn('.more', 'moreDone', {}, 'Mehr anzeigen') : null);
  }
  $('#tasks-sub').textContent = openAll ? plural(openAll, 'offene Aufgabe', 'offene Aufgaben') : 'Nichts offen';
  fill(box,
    filter,
    g.over.length ? taskSection('Überfällig', g.over, 'over', 'over-h') : null,
    g.today.length ? taskSection('Heute', g.today, 'today') : null,
    g.soon.length ? taskSection('Demnächst', g.soon, 'soon') : null,
    g.later.length ? taskSection('Später', g.later, 'later') : null,
    blank, doneSec);
  if (keep) { const c = $('.filter .chips', box); if (c) c.scrollLeft = keep; }
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
const E = { mode: 'new', type: 'task', when: null, date: null, prio: 1, topicId: null, id: null };
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
  Object.assign(E, { mode: o.mode, type: 'task', when: null, date: null, prio: 1, topicId: null, id: o.id || null });
  let text = '';
  const sec = $('#e-secondary');
  sec.replaceChildren();
  if (o.mode === 'new') {
    if (ui.tab === 'tasks' && ui.filter) E.topicId = ui.filter;
  } else if (o.mode === 'task') {
    const t = S.tasks.get(o.id);
    if (!t) return;
    text = t.text; E.prio = t.prio; E.topicId = t.topicId;
    if (t.due === day) E.when = t.now ? 'now' : 'today';
    else if (t.due === addDays(day, 1)) E.when = 'tomorrow';
    else { E.when = 'date'; E.date = t.due; }
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
  const dateEl = $('#e-date');
  dateEl.min = (E.date && E.date < day) ? '' : day;
  dateEl.value = E.date || addDays(day, 2);
  const topics = $('#e-topics');
  fill(topics, S.topics.map(t => btn('.chip', 'eTopic', { id: t.id }, h('i.dot', { vars: { '--h': t.hue } }), t.name)));
  $('#e-topic-fold').classList.toggle('off', !S.topics.length);
  for (const c of $$('#L-entry .chips')) c.scrollLeft = 0;
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
    if (E.mode === 'task') updateTask(E.id, { text, due: w.due, now: w.now, prio: E.prio, topicId });
    else {
      ui.fresh = addTask({ text, due: w.due, now: w.now, prio: E.prio, topicId }).id;
      if (E.mode === 'fromIdea') removeIdea(E.id);
      msg = savedMsg(w.due, w.now);
    }
  } else if (E.mode === 'idea') updateIdea(E.id, { text, topicId });
  else { ui.fresh = addIdea({ text, topicId }).id; msg = 'Idee geparkt'; }
  haptic();
  closeLayer('L-entry');
  renderAll();
  ui.fresh = null;
  toast(msg);
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
  if (!text) { input.focus(); return; }
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
  return { done, open, over, total: done + open + over };
}
function renderBeams() {
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

/* ----- Alles zeichnen ----- */
function renderAll() {
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
  for (const v of $$('.view')) v.classList.toggle('active', v.id === 'v-' + name);
  glideBeam(from, name);
  for (const b of $$('.tab')) { const on = b.dataset.tab === name; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); }
}
