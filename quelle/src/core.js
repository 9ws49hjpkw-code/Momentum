/* ===== Grundlagen ===== */
const VERSION = '1.1';
const TZ = 'Europe/Berlin';
const PARK_DAYS = 7;
const MAX_GOALS = 3;
/* Gut unterscheidbare Farben; Rot bleibt für Überfälliges reserviert */
const HUES = [195, 228, 272, 318, 28, 52, 96, 150];
const root = document.documentElement;
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqCoarse = window.matchMedia('(pointer: coarse)');
const reduced = () => mqReduce.matches;
const wait = ms => new Promise(r => setTimeout(r, ms));
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function add(e, kids) {
  for (const k of kids) {
    if (k == null || k === false || k === true) continue;
    if (Array.isArray(k)) add(e, k);
    else e.appendChild(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return e;
}
/* h('button.chip.on#id', {attrs}, ...children) */
function h(spec, props, ...kids) {
  const parts = spec.split(/(?=[.#])/);
  const e = document.createElement(parts[0] || 'div');
  for (let i = 1; i < parts.length; i++) {
    if (parts[i][0] === '.') e.classList.add(parts[i].slice(1)); else e.id = parts[i].slice(1);
  }
  if (props) for (const k in props) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') { for (const c of String(v).split(' ')) if (c) e.classList.add(c); }
    else if (k === 'data') { for (const d in v) if (v[d] != null) e.dataset[d] = v[d]; }
    else if (k === 'vars') { for (const d in v) e.style.setProperty(d, v[d]); }
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  }
  return add(e, kids);
}

/* ===== Icons: dünne Linien, ein Stil ===== */
const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
const IC = {
  tToday: svg('<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="2.6"/>'),
  tTasks: svg('<path d="M10.5 6.5H20M10.5 12H20M10.5 17.5H20"/><path d="M4 6.4l1.3 1.3 2.2-2.4M4 11.9l1.3 1.3 2.2-2.4M4 17.4l1.3 1.3 2.2-2.4"/>'),
  tIdeas: svg('<path d="M9.2 18.2h5.6M10.3 21h3.4"/><path d="M12 3a6.2 6.2 0 0 0-3.8 11.1c.6.5 1 1.2 1 2v.1h5.6v-.1c0-.8.4-1.5 1-2A6.2 6.2 0 0 0 12 3z"/>'),
  tJournal: svg('<path d="M12 6.6C10.4 5.3 8.2 4.6 5.4 4.5a.9.9 0 0 0-.9.9v11.7c0 .5.4.9.9.9 2.8.1 5 .8 6.6 2.1 1.6-1.3 3.8-2 6.6-2.1.5 0 .9-.4.9-.9V5.4a.9.9 0 0 0-.9-.9c-2.8.1-5 .8-6.6 2.1z"/><path d="M12 6.6v13.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="M5 12.6l4.4 4.4L19 7.4"/>'),
  close: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
  sliders: svg('<path d="M4 8h8.5M17.5 8H20M4 16h2.5M11.5 16H20"/><circle cx="15" cy="8" r="2.4"/><circle cx="9" cy="16" r="2.4"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3 2"/>'),
  flag: svg('<path d="M6 21V4.6h11l-2.2 3.9L17 12.4H6"/>'),
  tag: svg('<path d="M3.6 12.1V5.6a2 2 0 0 1 2-2h6.5a2 2 0 0 1 1.4.6l6.4 6.4a2 2 0 0 1 0 2.8l-6.5 6.5a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1-.6-1.4z"/><circle cx="8.1" cy="8.1" r="1.3"/>'),
  chevR: svg('<path d="M9.5 6l6 6-6 6"/>'),
  chevD: svg('<path d="M6 9.5l6 6 6-6"/>'),
  search: svg('<circle cx="11" cy="11" r="6.6"/><path d="M16 16l4 4"/>'),
  exportI: svg('<path d="M12 15V3.8M8 7.6l4-4 4 4M5 12.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.5"/>'),
  importI: svg('<path d="M12 3.8V15M8 11.2l4 4 4-4M5 12.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.5"/>'),
  share: svg('<path d="M12 14.5V3.8M8.4 7 12 3.4 15.6 7M7.5 10.5H7a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.5a2 2 0 0 0-2-2h-.5"/>')
};
function ic(name, cls) {
  const s = document.createElement('span');
  s.className = 'ic' + (cls ? ' ' + cls : '');
  s.innerHTML = IC[name];
  return s;
}

/* ===== Zeit: immer deutsche Zeitzone, Tageswechsel um Mitternacht ===== */
const partsFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
function berlin(ts) { const o = {}; for (const p of partsFmt.formatToParts(new Date(ts))) o[p.type] = p.value; return o; }
const dayOf = ts => { const p = berlin(ts); return p.year + '-' + p.month + '-' + p.day; };
const today = () => dayOf(Date.now());
const hourNow = () => +berlin(Date.now()).hour % 24;
const utc = day => { const a = day.split('-'); return Date.UTC(+a[0], +a[1] - 1, +a[2]); };
const D = day => new Date(utc(day));
const addDays = (day, n) => new Date(utc(day) + n * 864e5).toISOString().slice(0, 10);
const diffDays = (a, b) => Math.round((utc(a) - utc(b)) / 864e5);
const validDay = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(utc(s)) && addDays(s, 0) === s;
const fmt = o => new Intl.DateTimeFormat('de-DE', Object.assign({ timeZone: 'UTC' }, o));
const fWeekday = fmt({ weekday: 'long' });
const fDayMonth = fmt({ day: 'numeric', month: 'long' });
const fLong = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
const fLongY = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fDMY = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const fShort = fmt({ day: 'numeric', month: 'short' });
const fShortY = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
const fWShort = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
const fStamp = new Intl.DateTimeFormat('de-DE', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const sameYear = day => day.slice(0, 4) === today().slice(0, 4);
const shortDate = day => (sameYear(day) ? fShort : fShortY).format(D(day));
const longDate = day => (sameYear(day) ? fLong : fLongY).format(D(day));
const plainDate = day => (sameYear(day) ? fDayMonth : fDMY).format(D(day));
function dueLabel(day) {
  const d = diffDays(day, today());
  if (d === 0) return 'Heute';
  if (d === 1) return 'Morgen';
  if (d === -1) return 'Gestern';
  if (d < -1) return 'seit ' + (-d) + ' Tagen';
  if (d <= 6) return cap(fWeekday.format(D(day)));
  return sameYear(day) ? fWShort.format(D(day)) : fShortY.format(D(day));
}
function inDays(day) {
  const d = diffDays(day, today());
  if (d <= 0) return 'heute';
  if (d === 1) return 'morgen';
  return 'in ' + d + ' Tagen';
}

/* ===== Speicher: IndexedDB ===== */
const DB = (() => {
  const NAME = 'momentum', VER = 1;
  const KEYS = { tasks: 'id', ideas: 'id', topics: 'id', journal: 'date', days: 'date', meta: 'key' };
  const STORES = Object.keys(KEYS);
  let db = null;

  function open() {
    return new Promise((res, rej) => {
      let req;
      try { req = indexedDB.open(NAME, VER); } catch (e) { rej(e); return; }
      req.onupgradeneeded = () => {
        const d = req.result;
        for (const s of STORES) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: KEYS[s] });
      };
      req.onsuccess = () => {
        db = req.result;
        db.onversionchange = () => { try { db.close(); } catch (e) {} db = null; };
        db.onclose = () => { db = null; };
        res(db);
      };
      req.onerror = () => rej(req.error || new Error('open'));
    });
  }
  async function init() {
    for (let i = 0; ; i++) {
      try {
        await Promise.race([open(), wait(5000).then(() => { throw new Error('timeout'); })]);
        return;
      } catch (e) { if (i >= 2) throw e; await wait(250); }
    }
  }
  function tx(stores, mode, fn) {
    return new Promise((res, rej) => {
      let t;
      try { t = db.transaction(stores, mode); } catch (e) { rej(e); return; }
      t.oncomplete = () => res();
      t.onerror = () => rej(t.error || new Error('tx'));
      t.onabort = () => rej(t.error || new Error('abort'));
      try { fn(t); } catch (e) { try { t.abort(); } catch (x) {} rej(e); }
    });
  }
  /* Schreibvorgänge laufen nacheinander; bei verlorener Verbindung einmal neu verbinden. */
  let chain = Promise.resolve();
  function run(stores, mode, fn) {
    const job = async () => {
      try { if (!db) await open(); await tx(stores, mode, fn); }
      catch (e) { await open(); await tx(stores, mode, fn); }
    };
    const p = chain.then(job, job);
    chain = p.catch(() => {});
    return p;
  }
  async function loadAll() {
    const out = {};
    await run(STORES, 'readonly', t => {
      for (const s of STORES) { const r = t.objectStore(s).getAll(); r.onsuccess = () => { out[s] = r.result || []; }; }
    });
    return out;
  }
  const put = (s, v) => run([s], 'readwrite', t => { t.objectStore(s).put(v); });
  const del = (s, k) => run([s], 'readwrite', t => { t.objectStore(s).delete(k); });
  const replaceAll = data => run(STORES, 'readwrite', t => {
    for (const s of STORES) { const os = t.objectStore(s); os.clear(); for (const v of (data[s] || [])) os.put(v); }
  });
  return { init, loadAll, put, del, replaceAll, STORES };
})();

/* ===== Zustand ===== */
const S = { tasks: new Map(), ideas: new Map(), journal: new Map(), days: new Map(), topics: [], meta: {} };
function hydrate(d) {
  S.tasks = new Map((d.tasks || []).map(x => [x.id, x]));
  S.ideas = new Map((d.ideas || []).map(x => [x.id, x]));
  S.journal = new Map((d.journal || []).map(x => [x.date, x]));
  S.days = new Map((d.days || []).map(x => [x.date, x]));
  S.topics = (d.topics || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  S.meta = {};
  for (const m of (d.meta || [])) S.meta[m.key] = m.value;
}
let saveFailed = false;
function persist(p) {
  p.catch(() => {
    if (saveFailed) return;
    saveFailed = true;
    toast('Speichern hat nicht geklappt. Bitte App neu öffnen.', { ms: 6000 });
    setTimeout(() => { saveFailed = false; }, 8000);
  });
}
const dbPut = (s, v) => persist(DB.put(s, v));
const dbDel = (s, k) => persist(DB.del(s, k));
function setMeta(key, value) { S.meta[key] = value; dbPut('meta', { key, value }); }

/* ----- Themen ----- */
const topicById = id => S.topics.find(t => t.id === id) || null;
function nextHue() {
  const used = {};
  for (const t of S.topics) used[t.hue] = (used[t.hue] || 0) + 1;
  let best = HUES[0], n = Infinity;
  for (const hue of HUES) { const c = used[hue] || 0; if (c < n) { n = c; best = hue; } }
  return best;
}
function addTopic(name, hue) {
  const order = S.topics.reduce((m, t) => Math.max(m, t.order || 0), 0) + 1;
  const t = { id: uid(), name, hue, order };
  S.topics.push(t); dbPut('topics', t);
  return t;
}
function updateTopic(id, patch) { const t = topicById(id); if (!t) return; Object.assign(t, patch); dbPut('topics', t); }
function removeTopic(id) {
  S.topics = S.topics.filter(t => t.id !== id);
  dbDel('topics', id);
  for (const t of S.tasks.values()) if (t.topicId === id) { t.topicId = null; dbPut('tasks', t); }
  for (const i of S.ideas.values()) if (i.topicId === id) { i.topicId = null; dbPut('ideas', i); }
}
function seedTopics() {
  if (S.meta.seeded) return;
  if (!S.topics.length) { addTopic('Klavier', 272); addTopic('Film/Foto', 195); addTopic('Sport', 28); }
  setMeta('seeded', true);
}

/* ----- Aufgaben ----- */
function addTask(o) {
  const t = { id: uid(), text: o.text, due: o.due, now: !!o.now, prio: o.prio, topicId: o.topicId || null, createdAt: Date.now(), done: false, doneAt: null };
  S.tasks.set(t.id, t); dbPut('tasks', t);
  return t;
}
function updateTask(id, patch) { const t = S.tasks.get(id); if (!t) return; Object.assign(t, patch); dbPut('tasks', t); }
function setDone(id, done) { updateTask(id, { done: !!done, doneAt: done ? Date.now() : null }); }
function removeTask(id) { S.tasks.delete(id); dbDel('tasks', id); }
function restoreTask(t) { S.tasks.set(t.id, t); dbPut('tasks', t); }
const cmpTask = (a, b) => (b.prio - a.prio) || (a.due < b.due ? -1 : a.due > b.due ? 1 : 0) || ((b.now ? 1 : 0) - (a.now ? 1 : 0)) || (a.createdAt - b.createdAt);
function groupOf(t, day) {
  if (t.due < day) return 'over';
  if (t.due === day) return 'today';
  return diffDays(t.due, day) <= 7 ? 'soon' : 'later';
}
const GROUP_ORDER = { over: 0, today: 1, soon: 2, later: 3 };

/* ----- Ideen ----- */
function addIdea(o) {
  const day = today();
  const i = { id: uid(), text: o.text, topicId: o.topicId || null, createdAt: Date.now(), parkedOn: day, reviewOn: addDays(day, PARK_DAYS) };
  S.ideas.set(i.id, i); dbPut('ideas', i);
  return i;
}
function updateIdea(id, patch) { const i = S.ideas.get(id); if (!i) return; Object.assign(i, patch); dbPut('ideas', i); }
function removeIdea(id) { S.ideas.delete(id); dbDel('ideas', id); }
function restoreIdea(i) { S.ideas.set(i.id, i); dbPut('ideas', i); }
const ideaDue = (i, day) => i.reviewOn <= day;

/* ----- Tagesziele ----- */
function liveGoals(day) {
  const d = S.days.get(day);
  if (!d) return [];
  return d.goals.filter(g => !g.taskId || S.tasks.has(g.taskId)).slice(0, MAX_GOALS);
}
function saveGoals(day, goals) {
  const d = { date: day, goals: goals.slice(0, MAX_GOALS) };
  S.days.set(day, d); dbPut('days', d);
}
const goalText = g => g.taskId ? S.tasks.get(g.taskId).text : g.text;
const goalDone = g => g.taskId ? !!S.tasks.get(g.taskId).done : !!g.done;
function addGoal(day, g) {
  const goals = liveGoals(day);
  if (goals.length >= MAX_GOALS) return false;
  if (g.taskId && goals.some(x => x.taskId === g.taskId)) return false;
  goals.push(Object.assign({ id: uid(), done: false }, g));
  saveGoals(day, goals);
  return true;
}
function removeGoal(day, goalId) { saveGoals(day, liveGoals(day).filter(g => g.id !== goalId)); }
/* Verpasste Tagesziele früherer Tage bleiben präsent, bis sie erledigt, auf heute gelegt oder verworfen sind.
   Felder (optional, nur ergänzt): done/doneAt, moved (Tag, auf den es gelegt wurde), dropped. */
const goalKey = t => String(t || '').trim().toLowerCase();
function overdueGoals(day) {
  const out = [], seenT = new Set(), seenX = new Set();
  for (const g of liveGoals(day)) { if (g.taskId) seenT.add(g.taskId); else seenX.add(goalKey(g.text)); }
  const past = Array.from(S.days.values()).filter(d => d.date < day).sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  for (const d of past) for (const g of d.goals.slice(0, MAX_GOALS)) {
    if (g.taskId) {
      const t = S.tasks.get(g.taskId);
      if (!t || seenT.has(t.id)) continue;
      seenT.add(t.id);
      if (t.done || g.dropped || g.moved) continue;
    } else {
      const k = goalKey(g.text);
      if (!k || seenX.has(k)) continue;
      seenX.add(k);
      if (g.done || g.dropped || g.moved) continue;
    }
    out.push({ g, date: d.date });
  }
  return out;
}
function pastGoal(date, gid) { const d = S.days.get(date); return d ? d.goals.find(g => g.id === gid) || null : null; }
function patchPastGoal(date, gid, patch) {
  const d = S.days.get(date), g = d && d.goals.find(x => x.id === gid);
  if (!g) return;
  for (const k in patch) { if (patch[k] == null || patch[k] === false) delete g[k]; else g[k] = patch[k]; }
  if (patch.done === false) g.done = false;
  dbPut('days', d);
}

/* ----- Journal ----- */
const J_FIELDS = [
  ['learned', 'Was habe ich heute gelernt oder erkannt?'],
  ['good', 'Was lief gut, was nicht?'],
  ['free', 'Freie Gedanken']
];
const jEmpty = e => !e || !J_FIELDS.some(f => (e[f[0]] || '').trim());

/* ----- Export und Import ----- */
function exportPayload() {
  return {
    app: 'momentum', format: 1, version: VERSION, exportedAt: new Date().toISOString(),
    data: {
      tasks: Array.from(S.tasks.values()),
      ideas: Array.from(S.ideas.values()),
      journal: Array.from(S.journal.values()).filter(e => !jEmpty(e)),
      topics: S.topics.slice(),
      days: Array.from(S.days.values())
    }
  };
}
const str = (v, max) => (typeof v === 'string' ? v : '').slice(0, max || 100000);
function normalizeImport(obj) {
  if (!obj || typeof obj !== 'object' || obj.app !== 'momentum' || !obj.data || typeof obj.data !== 'object') return null;
  const d = obj.data, arr = k => Array.isArray(d[k]) ? d[k] : [];
  const ids = new Set();
  const fresh = id => { id = str(id, 80) || uid(); while (ids.has(id)) id = uid(); ids.add(id); return id; };
  const topics = [];
  arr('topics').forEach((t, i) => {
    if (!t || !str(t.name).trim()) return;
    topics.push({ id: fresh(t.id), name: str(t.name, 24).trim(), hue: Number.isFinite(+t.hue) ? +t.hue : HUES[i % HUES.length], order: Number.isFinite(+t.order) ? +t.order : i + 1 });
  });
  const tIds = new Set(topics.map(t => t.id));
  const topic = id => tIds.has(id) ? id : null;
  const tasks = [];
  for (const t of arr('tasks')) {
    if (!t || !str(t.text).trim() || !validDay(t.due)) continue;
    const prio = [0, 1, 2].indexOf(+t.prio) >= 0 ? +t.prio : 1;
    tasks.push({ id: fresh(t.id), text: str(t.text, 5000).trim(), due: t.due, now: !!t.now, prio, topicId: topic(t.topicId), createdAt: +t.createdAt || Date.now(), done: !!t.done, doneAt: t.done ? (+t.doneAt || Date.now()) : null });
  }
  const taskIds = new Set(tasks.map(t => t.id));
  const ideas = [];
  for (const i of arr('ideas')) {
    if (!i || !str(i.text).trim()) continue;
    const createdAt = +i.createdAt || Date.now();
    const parkedOn = validDay(i.parkedOn) ? i.parkedOn : dayOf(createdAt);
    ideas.push({ id: fresh(i.id), text: str(i.text, 50000).trim(), topicId: topic(i.topicId), createdAt, parkedOn, reviewOn: validDay(i.reviewOn) ? i.reviewOn : addDays(parkedOn, PARK_DAYS) });
  }
  const journal = [], seenJ = new Set();
  for (const e of arr('journal')) {
    if (!e || !validDay(e.date) || seenJ.has(e.date)) continue;
    const x = { date: e.date, learned: str(e.learned), good: str(e.good), free: str(e.free), updatedAt: +e.updatedAt || Date.now() };
    if (jEmpty(x)) continue;
    seenJ.add(e.date); journal.push(x);
  }
  const days = [], seenD = new Set();
  for (const p of arr('days')) {
    if (!p || !validDay(p.date) || seenD.has(p.date) || !Array.isArray(p.goals)) continue;
    const goals = [];
    for (const g of p.goals) {
      if (!g || goals.length >= MAX_GOALS) continue;
      let x = null;
      if (g.taskId) { if (taskIds.has(g.taskId)) x = { id: str(g.id, 80) || uid(), taskId: g.taskId, done: false }; }
      else if (str(g.text).trim()) x = { id: str(g.id, 80) || uid(), text: str(g.text, 140).trim(), done: !!g.done };
      if (!x) continue;
      if (x.done && typeof g.doneAt === 'number' && isFinite(g.doneAt)) x.doneAt = g.doneAt;
      if (validDay(g.moved)) x.moved = g.moved;
      if (g.dropped === true) x.dropped = true;
      goals.push(x);
    }
    seenD.add(p.date); days.push({ date: p.date, goals });
  }
  return {
    exportedAt: Date.parse(obj.exportedAt) || null,
    data: { tasks, ideas, journal, topics, days, meta: [{ key: 'seeded', value: true }] }
  };
}
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
