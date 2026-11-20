/* ===== Aktionen ===== */
const A = {
  tab(b) { go(b.dataset.tab); },
  plus() { Sound.play('open'); openEntry({ mode: 'new' }); },
  settings() { renderSettings(); const L = openLayer('L-settings'); $('.sheet-body', L).scrollTop = 0; },
  closeTop() { const L = topLayer(); if (L) closeLayer(L); },
  reload() { flushAllJ(); location.reload(); },
  hideInstall() { ui.installHint = false; renderToday(); },

  /* Aufgaben */
  check(b) {
    if (Date.now() - suppressClick < 400) return;
    const w = b.closest('.rw'), id = b.dataset.id, t = S.tasks.get(id);
    if (!t || !w || w.dataset.busy) return;
    if (t.done) { haptic(); setDone(id, false); renderAll(); return; }
    w.dataset.busy = '1';
    animating++;
    Sound.play('check', t.prio);
    const pt = checkPoint(w);
    FX.burst(pt.x, pt.y, { prio: t.prio, over: groupOf(t, today()) === 'over', rect: w.getBoundingClientRect() });
    setDone(id, true);
    renderBeams();
    w.classList.add('is-done', 'pop');
    wait(reduced() ? 60 : 470).then(() => collapseRow(w)).then(() => {
      animEnd();
      toast('Erledigt', { action: 'Rückgängig', onAction: () => { setDone(id, false); renderAll(); } });
      setTimeout(followUp, 5600);
    });
  },
  editTask(b) { if (Date.now() - suppressClick < 400) return; openEntry({ mode: 'task', id: b.dataset.id }); },
  /* Heute: Tippen auf die Aufgabe klappt ihre Details auf */
  taskOpen(b) {
    if (Date.now() - suppressClick < 400) return;
    const w = b.closest('.rw');
    if (!w || w.dataset.busy) return;
    const on = !w.classList.contains('open');
    for (const o of $$('.rw.open', w.parentElement)) if (o !== w) { o.classList.remove('open'); const m = $('.row-main', o); if (m) m.setAttribute('aria-expanded', 'false'); }
    w.classList.toggle('open', on);
    b.setAttribute('aria-expanded', String(on));
    Sound.play('tap');
  },
  filter(b) { ui.filter = b.dataset.id || null; ui.doneLimit = 30; renderTasks(); },
  tday(b) { ui.tday = b.dataset.day; haptic(); Sound.play('tap'); renderTasks(); },
  toggleDone() { ui.doneOpen = !ui.doneOpen; renderTasks(); },
  moreDone() { ui.doneLimit += 50; renderTasks(); },

  /* Tagesziele */
  plan(b) { openPlan(b.dataset.day); },
  goalCheck(b) {
    const day = today(), goals = liveGoals(day), g = goals.find(x => x.id === b.dataset.gid);
    if (!g) return;
    const done = !goalDone(g), row = b.closest('.goal'), card = b.closest('.goals');
    if (done) {
      Sound.play('goal');
      const pt = checkPoint(row);
      FX.burst(pt.x, pt.y, { goal: true, rect: card.getBoundingClientRect() });
      quake(card);
    } else haptic();
    if (g.taskId) setDone(g.taskId, done); else { g.done = done; saveGoals(day, goals); }
    renderBeams();
    row.classList.remove('pop');
    row.classList.toggle('is-done', done);
    b.setAttribute('aria-label', done ? 'Wieder öffnen' : 'Erledigen');
    if (done) { void row.offsetWidth; row.classList.add('pop'); }
    renderTasks();
  },
  goalOpen(b) {
    const row = b.closest('.goal');
    if (!row) return;
    const on = !row.classList.contains('open');
    for (const o of $$('.goal.open', row.parentElement)) if (o !== row) { o.classList.remove('open'); const x = $('.goal-text', o); if (x) x.setAttribute('aria-expanded', 'false'); }
    row.classList.toggle('open', on);
    b.setAttribute('aria-expanded', String(on));
    Sound.play('tap');
  },
  goalNote(b) { openNote(b.dataset.gid); },
  noteSave() { saveNote(); },
  /* Überfällige Tagesziele */
  ogCheck(b) {
    const date = b.dataset.date, gid = b.dataset.gid, g = pastGoal(date, gid);
    const row = b.closest('.og'), card = b.closest('.ogoals');
    if (!g || !row || row.dataset.busy) return;
    row.dataset.busy = '1';
    Sound.play('goal');
    const pt = checkPoint(row);
    FX.burst(pt.x, pt.y, { goal: true, over: true, rect: card.getBoundingClientRect() });
    quake(card);
    const tid = g.taskId;
    if (tid) setDone(tid, true); else patchPastGoal(date, gid, { done: true, doneAt: Date.now() });
    renderBeams();
    row.classList.add('is-done', 'pop');
    animating++;
    const only = card.querySelectorAll('.og').length === 1;
    wait(reduced() ? 60 : 700).then(() => collapse(only ? (card.parentElement.classList.contains('sec') ? card.parentElement : card) : row)).then(() => {
      animEnd();
      toast('Ziel erledigt', { action: 'Rückgängig', onAction: () => { if (tid) setDone(tid, false); else patchPastGoal(date, gid, { done: false, doneAt: null }); renderAll(); } });
    });
  },
  async ogOpen(b) {
    const date = b.dataset.date, gid = b.dataset.gid, g = pastGoal(date, gid);
    if (!g) return;
    const full = liveGoals(today()).length >= MAX_GOALS;
    const dropLabel = g.taskId ? 'Kein Ziel mehr' : 'Verwerfen';
    const r = await dialog({
      title: goalText(g),
      text: sinceLabel(date) + (full ? '. Heute stehen schon drei Ziele.' : '. Leg es auf heute, dann zählt es wieder.'),
      ok: full ? dropLabel : 'Auf heute legen', danger: full, alt: full ? null : dropLabel
    });
    if (r === true && !full) {
      addGoal(today(), g.taskId ? { taskId: g.taskId } : { text: g.text });
      patchPastGoal(date, gid, { moved: today() });
      haptic(); renderAll();
      toast('Liegt jetzt bei deinen Tageszielen');
    } else if (r === 'alt' || (r === true && full)) {
      patchPastGoal(date, gid, { dropped: true });
      renderAll();
      toast(g.taskId ? 'Aus den Zielen genommen' : 'Ziel verworfen', { action: 'Rückgängig', onAction: () => { patchPastGoal(date, gid, { dropped: null }); renderAll(); } });
    }
  },
  planDay(b) { P.which = b.dataset.day; $('#plan-input').value = ''; renderPlan(); },
  planPick(b) {
    const id = b.dataset.id, goals = liveGoals(P.day), cur = goals.find(g => g.taskId === id);
    if (cur) removeGoal(P.day, cur.id);
    else if (goals.length >= MAX_GOALS) { planFull(); return; }
    else addGoal(P.day, { taskId: id });
    haptic();
    renderPlan();
    renderToday();
  },
  planAdd() { planAddFree(); },
  planRemove(b) { removeGoal(P.day, b.dataset.gid); renderPlan(); renderToday(); },

  /* Ideen */
  ideaOpen(b) { openEntry({ mode: 'idea', id: b.dataset.id }); },
  ideaGo(b) { openEntry({ mode: 'fromIdea', id: b.dataset.id }); },
  ideaPark(b) {
    const id = b.dataset.id, card = b.closest('.idea-card');
    if (!S.ideas.has(id) || card.dataset.busy) return;
    card.dataset.busy = '1';
    const until = addDays(today(), PARK_DAYS);
    updateIdea(id, { reviewOn: until });
    haptic();
    animating++;
    collapseCard(card).then(() => { animEnd(); toast('Geparkt bis ' + shortDate(until)); });
  },
  ideaDrop(b) {
    const id = b.dataset.id, card = b.closest('.idea-card'), idea = S.ideas.get(id);
    if (!idea || card.dataset.busy) return;
    card.dataset.busy = '1';
    removeIdea(id);
    animating++;
    collapseCard(card).then(() => { animEnd(); toast('Idee verworfen', { action: 'Rückgängig', onAction: () => { restoreIdea(idea); renderAll(); } }); });
  },

  /* Erfassen */
  eType(b) {
    E.type = b.dataset.type;
    const ta = eText();
    if (E.type === 'task' && /\n/.test(ta.value)) { ta.value = ta.value.replace(/\s*\n+\s*/g, ' '); $('#e-grow').dataset.v = ta.value; }
    syncEntry();
  },
  eWhen(b) { E.when = b.dataset.when; syncEntry(); },
  ePrio(b) { E.prio = +b.dataset.prio; syncEntry(); },
  eDur(b) { const d = +b.dataset.dur; E.dur = E.dur === d ? null : d; syncEntry(); },
  eReopen() {
    const t = S.tasks.get(E.id);
    if (!t) return;
    setDone(t.id, false);
    haptic();
    closeLayer('L-entry');
    renderAll();
    toast('Wieder offen');
  },
  eTopic(b) { E.topicId = E.topicId === b.dataset.id ? null : b.dataset.id; syncEntry(); },
  eSave() { saveEntry(); },
  eDelete() {
    const t = S.tasks.get(E.id);
    if (!t) return;
    removeTask(t.id);
    closeLayer('L-entry');
    renderAll();
    toast('Aufgabe gelöscht', { action: 'Rückgängig', onAction: () => { restoreTask(t); renderAll(); } });
  },
  eGo() {
    E.mode = 'fromIdea'; E.type = 'task'; E.when = null;
    { const ta = eText(); ta.value = oneLine(ta.value); $('#e-grow').dataset.v = ta.value; }
    const sec = $('#e-secondary'); sec.replaceChildren(); sec.hidden = true;
    syncEntry();
  },
  eDrop() {
    const idea = S.ideas.get(E.id);
    if (!idea) return;
    removeIdea(idea.id);
    closeLayer('L-entry');
    renderAll();
    toast('Idee verworfen', { action: 'Rückgängig', onAction: () => { restoreIdea(idea); renderAll(); } });
  },

  /* Journal */
  jSave() {
    if (jEmpty(readFields(JR.els))) { nudge($('#j-editor')); return; }
    touchJ(JR.date, readFields(JR.els));
    flushJ(JR.date);
    const a = document.activeElement;
    if (a && a.blur) a.blur();
    haptic();
    jState('Gespeichert');
    const n = liveGoals(addDays(today(), 1)).length;
    $('#offer-text').textContent = n ? 'Morgen ist schon geplant.' : 'Morgen planen?';
    $('#offer-go').textContent = n ? 'Plan ansehen' : 'Morgen planen';
    openLayer('L-offer');
  },
  offerPlan() { closeLayer('L-offer'); openPlan('tomorrow'); },
  jOpen(b) { openJEntry(b.dataset.date); },
  jMore() { ui.jLimit += 30; renderJournalList(); },
  jClear() { const i = $('#j-search'); i.value = ''; ui.jQuery = ''; ui.jLimit = 30; $('#j-clear').hidden = true; renderJournalList(); },
  async jeDelete() {
    const date = JE.date;
    const ok = await dialog({ title: 'Eintrag löschen?', text: 'Der Eintrag vom ' + plainDate(date) + ' ist danach weg.', ok: 'Löschen', danger: true });
    if (!ok) return;
    clearTimeout(jTimers[date]); delete jTimers[date];
    S.journal.delete(date); dbDel('journal', date);
    closeLayer('L-jentry');
    renderJournalList();
    toast('Eintrag gelöscht');
  },

  /* Einstellungen */
  topicOpen(b) { openTopic(b.dataset.id || null); },
  topicHue(b) { T.hue = +b.dataset.hue; renderHues(); },
  topicSave() { saveTopic(); },
  async topicDelete() {
    const t = topicById(T.id);
    if (!t) return;
    const ok = await dialog({ title: '„' + t.name + '“ löschen?', text: 'Aufgaben und Ideen bleiben, nur ohne dieses Thema.', ok: 'Löschen', danger: true });
    if (!ok) return;
    removeTopic(t.id);
    closeLayer('L-topic');
    renderSettings();
    renderAll();
  },
  exportData() { exportData(); },
  badgeAsk() { badgeAsk(); },
  rulesOpen() { openRules(); },
  shortcutsHelp() { openHelp(); },
  calPaste() { calPaste(); },
  toCal() { const t = S.tasks.get(E.id); if (t && validTime(t.time)) taskToCal(t); },
  toAlarm() { const t = S.tasks.get(E.id); if (t && validTime(t.time)) taskToAlarm(t); },
  ruleAdd() { addRule(); },
  ruleDel(b) { delRule(b.dataset.id); },
  soundToggle() { Sound.set(!Sound.on()); renderSettings(); if (Sound.on()) Sound.play('save'); },
  dlgOk() { dialogAnswer(true); },
  dlgAlt() { dialogAnswer('alt'); },
  dlgCancel() { dialogAnswer(false); }
};

function quake(card) {
  if (reduced() || !card) return;
  card.classList.remove('quake'); void card.offsetWidth; card.classList.add('quake');
  setTimeout(() => card.classList.remove('quake'), 640);
}

/* ===== Ereignisse ===== */
function bindEvents() {
  for (const e of $$('[data-ic]')) e.innerHTML = IC[e.dataset.ic];

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const lay = b.closest('.layer');
    if (lay && !lay.classList.contains('open')) return;
    const fn = A[b.dataset.act];
    if (fn) fn(b, e);
  });
  for (const L of $$('.layer')) {
    const bd = $('.backdrop', L);
    /* Ein zweiter Tipp direkt nach dem Öffnen (Doppeltipp) schließt nichts und lässt die Tastatur offen */
    const guard = e => { if (Date.now() - (L._at || 0) < 380 && e.cancelable) e.preventDefault(); };
    bd.addEventListener('touchend', guard, { passive: false });
    bd.addEventListener('mousedown', guard);
    bd.addEventListener('click', () => {
      if (Date.now() - (L._at || 0) < 380) return;
      if (L.id === 'L-dialog') dialogAnswer(false); else if (topLayer() === L) closeLayer(L);
    });
    bindSheetDrag(L);
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && topLayer()) { if (topLayer().id === 'L-dialog') dialogAnswer(false); else closeLayer(topLayer()); }
  });

  /* Erfassen */
  const ta = eText();
  bindGrow($('#e-grow'), ta);
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && E.type === 'task' && !e.isComposing) { e.preventDefault(); saveEntry(); } });
  ta.addEventListener('input', () => {
    if (E.type === 'task' && ta.value.indexOf('\n') >= 0) { ta.value = ta.value.replace(/\n+/g, ' '); $('#e-grow').dataset.v = ta.value; }
    if (E.type !== 'task') keepEndVisible(ta);
    $('#e-save').setAttribute('aria-disabled', String(!entryValid()));
  });
  const det = $('#e-detail');
  bindGrow($('#e-detail-grow'), det);
  det.addEventListener('input', () => keepEndVisible(det));
  const dateEl = $('#e-date');
  const pickDate = () => {
    if (!validDay(dateEl.value)) dateEl.value = addDays(today(), 2);
    E.when = 'date'; E.date = dateEl.value; syncEntry();
  };
  dateEl.addEventListener('focus', pickDate);
  dateEl.addEventListener('click', () => { pickDate(); if (!mqCoarse.matches && dateEl.showPicker) { try { dateEl.showPicker(); } catch (e) {} } });
  const onDate = () => {
    if (validDay(dateEl.value)) { E.when = 'date'; E.date = dateEl.value; }
    else if (E.when === 'date') { E.when = null; E.date = null; }
    syncEntry();
  };
  dateEl.addEventListener('input', onDate);
  dateEl.addEventListener('change', onDate);
  const timeEl = $('#e-time-in');
  const onTime = () => { E.time = validTime(timeEl.value) ? timeEl.value : null; syncEntry(); };
  timeEl.addEventListener('input', onTime);
  timeEl.addEventListener('change', onTime);
  timeEl.addEventListener('click', () => { if (!mqCoarse.matches && timeEl.showPicker) { try { timeEl.showPicker(); } catch (e) {} } });

  /* Notiz */
  const nt = $('#note-text');
  bindGrow($('#note-grow'), nt);
  nt.addEventListener('input', () => keepEndVisible(nt));

  /* Tag planen */
  const pi = $('#plan-input');
  pi.addEventListener('input', () => $('#plan-add-btn').setAttribute('aria-disabled', String(pi.readOnly || !pi.value.trim())));
  pi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); planAddFree(); } });

  /* Folge-Regeln */
  $('#rule-word').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); try { $('#rule-then').focus({ preventScroll: true }); } catch (x) {} } });
  $('#rule-then').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addRule(); } });

  /* Thema */
  $('#topic-name').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveTopic(); } });

  /* Journal */
  const js = $('#j-search');
  js.addEventListener('input', () => { ui.jQuery = js.value; ui.jLimit = 30; $('#j-clear').hidden = !js.value; renderJournalList(); });
  js.addEventListener('keydown', e => { if (e.key === 'Enter') js.blur(); });
  $('#j-editor').addEventListener('focusout', () => setTimeout(() => { if (JR.pendingRoll) rollJournal(); }, 50));

  /* Import */
  $('#import-file').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (f) importFile(f);
  });

  /* Wischen */
  const swipeDone = (w, fly) => {
    const id = w.dataset.id, t = S.tasks.get(id);
    if (!t) return;
    animating++;
    const r = w.getBoundingClientRect();
    Sound.play('check', t.prio);
    FX.burst(r.left + 29, r.top + r.height / 2, { prio: t.prio, over: groupOf(t, today()) === 'over', rect: r });
    setDone(id, true);
    renderBeams();
    wait(fly).then(() => collapseRow(w)).then(() => {
      animEnd();
      toast('Erledigt', { action: 'Rückgängig', onAction: () => { setDone(id, false); renderAll(); } });
      setTimeout(followUp, 5600);
    });
  };
  bindSwipe($('#today'), swipeDone);

  /* Tipp auf einen Button lässt die Tastatur offen (Fokus bleibt im Textfeld) */
  document.addEventListener('mousedown', e => {
    if (isField(document.activeElement) && e.target.closest && e.target.closest('button') && !isField(e.target)) e.preventDefault();
  });

  /* Töne erst nach der ersten Berührung (iOS-Regel) */
  const un = () => Sound.unlock();
  document.addEventListener('touchend', un, { passive: true, capture: true });
  document.addEventListener('pointerup', un, { passive: true, capture: true });

  /* Native-Gefühl: kein Zoom, kein Kontextmenü, :active auf iOS */
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('gesturechange', e => e.preventDefault());
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('contextmenu', e => { if (!isField(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', e => e.preventDefault());

  /* Nichts verlieren, wenn die App in den Hintergrund geht */
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushAllJ(); else wake(); });
  window.addEventListener('pagehide', flushAllJ);
  window.addEventListener('pageshow', wake);
  window.addEventListener('focus', wake);
}

/* ===== Tageswechsel um Mitternacht (deutsche Zeit) ===== */
let curDay = '', curHour = -1;
function wake() {
  const d = today(), hr = hourNow();
  if (d !== curDay) {
    curDay = d; curHour = hr;
    if (layers.some(L => L.id === 'L-plan')) renderPlan();
    rollJournal();
    renderAll();
  } else if (hr !== curHour) { curHour = hr; renderToday(); }
  followUp();
  checkUpdate();
}

/* ===== Offline und Updates ===== */
let lastCheck = 0;
function checkUpdate() {
  const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
  if (!sw || Date.now() - lastCheck < 60000) return;
  lastCheck = Date.now();
  try { sw.postMessage({ type: 'momentum-check' }); } catch (e) {}
}
function registerSW() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data;
    if (d && d.type === 'momentum-update') { ui.update = true; renderToday(); }
  });
  navigator.serviceWorker.register('sw.js').then(() => setTimeout(checkUpdate, 3000)).catch(() => {});
}

/* ===== Startbild für den Home-Bildschirm (iOS) ===== */
function startupImage() {
  if (!inSafariTab) return;
  try {
    const dpr = window.devicePixelRatio || 2;
    const w = Math.round(Math.min(screen.width, screen.height) * dpr), hgt = Math.round(Math.max(screen.width, screen.height) * dpr);
    const c = document.createElement('canvas');
    c.width = w; c.height = hgt;
    const x = c.getContext('2d');
    x.fillStyle = '#04070C';
    x.fillRect(0, 0, w, hgt);
    const r = w * 0.085, cx = w / 2, cy = hgt / 2;
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = '#7FE0FF'; x.lineWidth = Math.max(2, r * 0.11);
    x.shadowColor = 'rgba(98,217,255,.7)'; x.shadowBlur = r * 0.5;
    x.beginPath(); x.arc(cx, cy, r, -0.3, Math.PI * 2 - 1.1); x.stroke();
    x.beginPath(); x.moveTo(cx - r * 0.42, cy + r * 0.04); x.lineTo(cx - r * 0.1, cy + r * 0.36); x.lineTo(cx + r * 0.82, cy - r * 0.7); x.stroke();
    const link = document.createElement('link');
    link.rel = 'apple-touch-startup-image';
    link.media = 'screen and (orientation: portrait)';
    link.href = c.toDataURL('image/png');
    document.head.appendChild(link);
  } catch (e) {}
}

/* ===== Start-Animation ===== */
const INTRO = { t0: 0, out: false, MIN: 1180, over: 0, fx: false };
function greeting() {
  const hr = hourNow();
  return hr < 5 ? 'Gute Nacht' : hr < 11 ? 'Guten Morgen' : hr < 18 ? 'Schön, dass du da bist' : hr < 23 ? 'Guten Abend' : 'Gute Nacht';
}
function startIntro() {
  const el = $('#intro');
  INTRO.t0 = performance.now();
  if (!el) return;
  if (reduced()) { INTRO.MIN = 0; return; }
  try { $('#in-hello').textContent = greeting(); } catch (e) {}
  document.body.classList.add('go');
  el.addEventListener('pointerdown', () => { if (document.body.classList.contains('ready')) endIntro(true); });
  setTimeout(() => { if (!INTRO.out) { INTRO.fx = true; FX.intro(INTRO.over > 0); Sound.play(INTRO.over > 0 ? 'over' : 'intro'); } }, 80);
  setTimeout(() => {
    if (INTRO.out) return;
    const r = $('#intro svg').getBoundingClientRect();
    FX.lock(r.left + r.width / 2, r.top + r.height / 2);
  }, 840);
}
/* Überfällig beim Öffnen: Startbild färbt sich rot, die Begrüßung nennt die Zahl */
function introAlarm() {
  const a = alarmState(), el = $('#intro');
  INTRO.over = a.n;
  if (!a.n || !el || INTRO.out) return;
  el.classList.add('over');
  if (a.level >= 3) el.classList.add('hard');
  try { $('#in-hello').textContent = a.n === 1 ? '1 überfällig. Zeit, es zu erledigen.' : a.n + ' überfällig. Zeit, sie zu erledigen.'; } catch (e) {}
  if (INTRO.fx) FX.alarm();
}
/* Erst wenn die Daten geladen sind und der Aufbau gelaufen ist, gleitet die App herein */
function endIntro(now) {
  if (INTRO.out) return;
  const left = now ? 0 : Math.max(0, INTRO.MIN - (performance.now() - INTRO.t0));
  setTimeout(() => {
    if (INTRO.out) return;
    INTRO.out = true;
    const b = document.body, el = $('#intro');
    if (!el || reduced() || !b.classList.contains('go')) {
      if (el) el.remove();
      b.classList.remove('intro', 'go'); b.classList.add('live');
      return;
    }
    b.classList.add('enter');
    setTimeout(() => { el.remove(); b.classList.remove('intro', 'go'); }, 480);
    setTimeout(() => b.classList.add('live'), now ? 560 : 1050);
    setTimeout(() => b.classList.remove('enter'), 1800);
  }, left);
}

/* ===== Start ===== */
async function boot() {
  startIntro();
  try {
    await DB.init();
    hydrate(await DB.loadAll());
  } catch (e) {
    document.body.appendChild(h('div#fatal', null, h('div', null,
      h('h1', null, 'Speicher nicht erreichbar'),
      h('p', null, 'Momentum kann auf diesem Gerät gerade nichts sichern. Schließ die App ganz und öffne sie neu. Im privaten Modus von Safari funktioniert sie nicht.'))));
    document.body.classList.add('ready');
    endIntro(true);
    return;
  }
  try {
    seedTopics();
    document.body.dataset.area = ui.tab;
    curDay = today(); curHour = hourNow();
    initKeyboard();
    bindEvents();
    mountJournal();
    renderAll();
    introAlarm();
  } catch (e) {
    document.body.appendChild(h('div#fatal', null, h('div', null,
      h('h1', null, 'Start hat nicht geklappt'),
      h('p', null, 'Schließ Momentum ganz und öffne es neu. Deine Daten sind auf dem iPhone gespeichert und bleiben erhalten.'))));
    document.body.classList.add('ready');
    endIntro(true);
    return;
  }
  document.body.classList.add('ready');
  endIntro(false);
  setTimeout(followUp, 1600);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  setInterval(wake, 20000);
  setInterval(tickTasks, 30000);
  registerSW();
  setTimeout(startupImage, 1200);
}
boot();
