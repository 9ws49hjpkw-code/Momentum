/* ===== Notenweg 3 · Kern: Zustand, Ton, Notenbilder, Timer ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DAY = 86400000;
const pad2 = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => iso(new Date());
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((parseISO(a) - parseISO(b)) / DAY);
const fmtD = s => { const d = parseISO(s); return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.`; };
const REVIEW = [1, 3, 7, 14, 30];

/* ---------------- Zustand ---------------- */
const KEY = 'notenweg-v1';
const DEF = () => ({ v: 3, updatedAt: 0, settings: { ball: '', theme: '' }, done: {}, stepAt: {}, exams: {}, srs: {}, pieces: {}, songs: {}, blitz: [], days: {}, wbSet: null, wb: {}, sight: [], quiz: [], warm: {}, notes: '', legacy: null });
function fill(o) {
  const d = DEF(); if (!o || typeof o !== 'object') return d;
  if ((o.v || 0) < 3) { // Version 2 -> 3 übernehmen
    const r = DEF();
    r.legacy = { lessons: o.lessons || {}, weekly: o.weekly || {}, drills: o.drills || [] };
    ['pieces', 'songs', 'days', 'wb', 'tempo'].forEach(k => { if (o[k] && typeof o[k] === 'object') r[k] = o[k]; });
    ['blitz'].forEach(k => { if (Array.isArray(o[k])) r[k] = o[k]; });
    if (Array.isArray(o.wbSet)) r.wbSet = o.wbSet;
    if (o.settings && o.settings.ball) r.settings.ball = o.settings.ball;
    r.updatedAt = o.updatedAt || 0;
    return r;
  }
  const r = Object.assign(d, o); r.settings = Object.assign(DEF().settings, o.settings || {});
  ['done', 'stepAt', 'exams', 'srs', 'pieces', 'songs', 'days', 'wb', 'warm'].forEach(k => { if (!r[k] || typeof r[k] !== 'object' || Array.isArray(r[k])) r[k] = {}; });
  ['blitz', 'sight', 'quiz'].forEach(k => { if (!Array.isArray(r[k])) r[k] = []; });
  return r;
}
let S = DEF();
/* ---------------- Speicher: IndexedDB auf diesem Gerät (+ Spiegel in localStorage) ----------------
   Alles bleibt lokal. Die Datenbank „notenweg“ (Store „kv“, Schlüssel „state“) wird nie umbenannt;
   neue Felder kommen nur dazu. Schreibzugriffe laufen nacheinander, gebündelt und beim Verlassen sofort. */
try { const raw = localStorage.getItem(KEY); if (raw) S = fill(JSON.parse(raw)); } catch (e) { }
const Store = (() => {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('kein IndexedDB'));
      const rq = indexedDB.open('notenweg', 1);
      rq.onupgradeneeded = () => { const d = rq.result; if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); };
      rq.onsuccess = () => { const d = rq.result; d.onversionchange = () => d.close(); res(d); };
      rq.onerror = () => rej(rq.error); rq.onblocked = () => rej(new Error('blockiert'));
    });
    dbp.catch(() => { dbp = null; });
    return dbp;
  }
  async function get(k) { const d = await open(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readonly').objectStore('kv').get(k); t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error); }); }
  async function put(k, v) { const d = await open(); return new Promise((res, rej) => { const tx = d.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); }); }
  return { get, put };
})();
let sync = 'local', writing = Promise.resolve(), wTimer = null, dirty = false, storeOk = true;
function save() {
  S.updatedAt = Date.now();
  if (S.quiz.length > 400) S.quiz = S.quiz.slice(-400);
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
  dirty = true; clearTimeout(wTimer); wTimer = setTimeout(flush, 400);
}
function flush() {
  clearTimeout(wTimer);
  if (!dirty) return writing;
  dirty = false;
  const body = JSON.parse(JSON.stringify(S));
  writing = writing.then(() => Store.put('state', body)).then(() => { if (!storeOk) { storeOk = true; setSync(); } }).catch(() => { storeOk = false; setSync(); });
  return writing;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
window.addEventListener('pagehide', flush);
const READY = (async () => {
  try {
    const r = await Store.get('state');
    if (r && typeof r === 'object' && (r.updatedAt || 0) > (S.updatedAt || 0)) S = fill(r);
    else if (S.updatedAt) { dirty = true; flush(); }
  } catch (e) { storeOk = false; }
  try { if (navigator.storage && navigator.storage.persist) { const p = await navigator.storage.persisted(); if (!p) await navigator.storage.persist(); } } catch (e) { }
})();
function setSync() { const el = $('#syncnote'); if (el) el.textContent = storeOk ? 'Dein Fortschritt liegt nur auf diesem Gerät, nicht in einer Cloud. Sichere ihn ab und zu mit „Sicherung exportieren“.' : 'Achtung: Speichern auf diesem Gerät klappt gerade nicht. Exportiere eine Sicherung, bevor du die App schließt.'; }

/* ---------------- Ton ---------------- */
const Sound = (() => {
  let ctx = null, master = null, wave = null;
  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp); comp.connect(ctx.destination);
      const n = 20, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = Math.exp(-k * 0.22) / Math.pow(k, 0.7) * (k === 1 ? 1 : k % 2 ? 0.75 : 0.55);
      wave = ctx.createPeriodicWave(re, im);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function note(midi, t, dur, vel = 0.55, dest) {
    if (!ctx) return;
    const f = MU.freq(midi);
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 0.6;
    const bright = Math.min(15000, f * (2.5 + 9 * vel));
    lp.frequency.setValueAtTime(bright, t); lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.4, 300), t + 1.6);
    const peak = 0.05 + 0.32 * vel * vel;
    const dec = 0.6 + 2.6 * Math.max(0, (96 - midi) / 75);
    const rel = t + Math.max(dur, 0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.setTargetAtTime(peak * 0.38, t + 0.004, 0.07);
    if (rel > t + 0.2) g.gain.setTargetAtTime(0.0001, t + 0.2, dec);
    g.gain.setTargetAtTime(0.00001, rel, 0.07);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.setPeriodicWave(wave); o2.setPeriodicWave(wave);
    o1.frequency.value = f; o2.frequency.value = f * 1.0016;
    const g2 = ctx.createGain(); g2.gain.value = 0.5;
    o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest || master);
    o1.start(t); o2.start(t); o1.stop(rel + 0.6); o2.stop(rel + 0.6);
  }
  function click(t, acc, dest) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = acc ? 2000 : 1300;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(acc ? 0.35 : 0.2, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + 0.06);
  }
  function bus() { init(); const g = ctx.createGain(); g.connect(master); return g; }
  return { init, note, click, bus, get ctx() { return ctx; } };
})();

let PL = null;
function stopPlay(manual) {
  if (!PL) return;
  PL.manual = !!manual;
  PL.timers.forEach(clearTimeout);
  try { const g = PL.bus; g.gain.cancelScheduledValues(Sound.ctx.currentTime); g.gain.setTargetAtTime(0, Sound.ctx.currentTime, 0.03); setTimeout(() => g.disconnect(), 400); } catch (e) { }
  const f = PL.onEnd, man = PL.manual; PL = null;
  if (f) f(man);
}
function play(events, o = {}) {
  stopPlay();
  const ctx = Sound.init(); if (!ctx) return;
  const bpm = (o.bpm || 80) * (o.speed || 1); const spb = 60 / bpm;
  const bus = Sound.bus();
  const t0 = ctx.currentTime + 0.12 + (o.countIn ? o.countIn * spb : 0);
  const timers = [];
  const ped = []; let downAt = null;
  (o.pedals || []).slice().sort((a, b) => a.t - b.t).forEach(p => {
    if (p.k === 'd') downAt = p.t;
    else if (p.k === 'c') { if (downAt != null) ped.push([downAt, p.t]); downAt = p.t; }
    else if (p.k === 'u') { if (downAt != null) ped.push([downAt, p.t]); downAt = null; }
  });
  if (downAt != null) ped.push([downAt, 1e9]);
  const sustainEnd = rel => { for (const [a, b] of ped) if (rel >= a - 1e-6 && rel < b) return b; return rel; };
  let last = 0;
  events.forEach(e => {
    const relB = o.sustainAll ? Math.max(e.t + e.d, o.sustainAll) : sustainEnd(e.t + e.d);
    const vel = e.v != null ? e.v : 0.55;
    const top = e.top ? Math.max(...e.m) : null;
    e.m.forEach(m => Sound.note(m, t0 + e.t * spb, (relB - e.t) * spb, top != null ? (m === top ? Math.min(1, vel + 0.35) : vel * 0.55) : vel, bus));
    last = Math.max(last, e.t + e.d);
    if (o.onNote) timers.push(setTimeout(() => o.onNote(e, true), Math.max(0, (t0 + e.t * spb - ctx.currentTime) * 1000)));
    if (o.onNote) timers.push(setTimeout(() => o.onNote(e, false), Math.max(0, (t0 + (e.t + e.d) * spb - ctx.currentTime) * 1000 - 15)));
  });
  if (o.click) {
    const total = Math.ceil(last / o.clickBeat) * o.clickBeat;
    for (let b = -(o.countIn || 0); b < total; b += o.clickBeat) Sound.click(t0 + b * spb, ((b % o.bar) + o.bar) % o.bar === 0, bus);
  } else if (o.countIn) { for (let b = -o.countIn; b < 0; b += 1) Sound.click(t0 + b * spb, b === -o.countIn, bus); }
  timers.push(setTimeout(() => { if (PL && PL.bus === bus) { const f = PL.onEnd; PL = null; if (f) f(); } }, (t0 + last * spb - ctx.currentTime) * 1000 + 600));
  PL = { timers, bus, onEnd: o.onEnd, t0, spb };
}

/* ---------------- Notenbilder ---------------- */
const REG = {}; let regN = 0;
function scoreBox(spec, opt = {}) {
  const k = 'sb' + (++regN); REG[k] = { spec, opt };
  const bar = opt.play ? `<div class="scorebar"><button class="btn sm" data-a="score-play" data-k="${k}">▶︎ Anhören</button>${opt.speed ? `<label class="tick small">Tempo <select data-f="speed" data-k="${k}">${[0.4, 0.5, 0.6, 0.8, 1].map(v => `<option value="${v}"${(opt.speedDef || 1) === v ? ' selected' : ''}>${Math.round(v * 100)} %</option>`).join('')}</select></label>` : ''}${opt.loopable ? `<label class="tick small"><input type="checkbox" data-f="loop" data-k="${k}"${opt.loop ? ' checked' : ''}><span>Schleife</span></label>` : ''}${opt.metro ? `<label class="tick small"><input type="checkbox" data-f="click" data-k="${k}"${opt.click ? ' checked' : ''}><span>Metronom</span></label>` : ''}</div>` : '';
  const st = opt.fixedW ? ` style="display:inline-block;max-width:100%"` : '';
  return `<div class="scorebox${opt.barTop ? ' long' : ''}" data-k="${k}"${st}>${opt.barTop ? bar : ''}<div class="scorewrap"></div>${opt.kbd ? '<div class="kbdwrap"></div>' : ''}${opt.barTop ? '' : bar}</div>`;
}
const staffSize = w => Math.max(7.2, Math.min(10, w / 64));
function mountScores(root = document) {
  $$('.scorebox', root).forEach(box => {
    const r = REG[box.dataset.k]; if (!r) return;
    const wrap = $('.scorewrap', box);
    let w = r.opt.fixedW || Math.floor(wrap.clientWidth || box.clientWidth || 600);
    if (r.opt.fixedW) w = Math.min(r.opt.fixedW, Math.floor((box.parentElement && box.parentElement.clientWidth) || r.opt.fixedW) - 22);
    if (r.w === w && wrap.firstChild) return;
    r.w = w;
    const s = r.opt.s ? Math.min(r.opt.s, Math.max(7, w / 14)) : staffSize(w);
    try {
      const res = Engrave.render(Object.assign({}, r.spec, { width: Math.max(w, 120), s, prefix: box.dataset.k }));
      r.res = res; wrap.innerHTML = res.svg;
    } catch (e) { wrap.innerHTML = `<p class="err">Noten konnten nicht gezeichnet werden.</p>`; console.error(e); }
    if (r.opt.kbd) {
      const kw = $('.kbdwrap', box);
      let from = r.opt.kbd.from, to = r.opt.kbd.to;
      if (from == null && r.res && r.res.events.length) { const all = r.res.events.flatMap(e => e.midis); from = Math.min(...all) - 2; to = Math.max(...all) + 2; }
      if (from == null) { from = 48; to = 84; }
      while (MU.isBlack(from)) from--; while (MU.isBlack(to)) to++;
      while (to - from < 24) { from -= 1; while (MU.isBlack(from)) from--; if (to - from < 24) { to += 1; while (MU.isBlack(to)) to++; } }
      kw.innerHTML = Kbd.render({ from, to, width: Math.min(w, 760), labels: r.opt.kbdLabels || 'c' });
    }
  });
}
function setHdr() { try { const h = $('.top'); if (h) document.documentElement.style.setProperty('--hdr', (h.offsetHeight + ((window.innerWidth >= 900 && $('#nav')) ? $('#nav').offsetHeight : 0)) + 'px'); } catch (e) { } }
window.addEventListener('resize', setHdr);
let rsT = null, lastW = window.innerWidth;
window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => { if (Math.abs(window.innerWidth - lastW) > 24) { lastW = window.innerWidth; Object.values(REG).forEach(r => r.w = 0); mountScores(); } }, 200); });

function scoreEvents(r, filter) {
  let evs = r.res.events.map(e => ({ t: e.t, m: e.midis, d: e.dur, ids: e.ids, st: e.st, mi: e.mi, dyn: e.dyn, st2: e.st2, ac: e.ac }));
  const DV = { ppp: 0.16, pp: 0.22, p: 0.32, mp: 0.42, mf: 0.55, f: 0.72, ff: 0.9, fff: 1 };
  const cur = { treble: 0.55, bass: 0.5 };
  evs.sort((a, b) => a.t - b.t).forEach(e => { if (e.dyn && DV[e.dyn]) { cur.treble = DV[e.dyn]; cur.bass = DV[e.dyn] * 0.9; } e.v = cur[e.st] * (e.ac ? 1.3 : 1); if (e.st2) e.d = Math.min(e.d, 0.35); if (r.opt.voiced && e.st === 'treble') e.top = true; });
  if (filter) evs = evs.filter(e => e.st === filter);
  let pedals = r.res.pedals || [];
  const ord = r.opt.range ? Array.from({ length: r.opt.range[1] - r.opt.range[0] + 1 }, (_, i) => r.opt.range[0] + i) : r.opt.order;
  if (ord) {
    const ms = r.res.measureStart; const lens = r.res.measures.map(m => m.len);
    const out = []; const pOut = []; let t = 0;
    ord.forEach(mi => {
      evs.filter(e => e.mi === mi).forEach(e => out.push(Object.assign({}, e, { t: e.t - ms[mi] + t, mOrd: mi })));
      pedals.filter(p => p.t >= ms[mi] - 1e-6 && p.t < ms[mi] + lens[mi] - 1e-6).forEach(p => pOut.push({ t: p.t - ms[mi] + t, k: p.k }));
      t += lens[mi];
    });
    evs = out; pedals = pOut;
  } else evs.forEach(e => { e.mOrd = e.mi; });
  return { evs, pedals };
}
function meterOf(time) {
  let bar = 4, clickBeat = 1;
  if (time) { const [a, b] = time === 'C' ? [4, 4] : time === 'C|' ? [2, 2] : time.split('/').map(Number); bar = a * 4 / b; clickBeat = b === 8 ? 1.5 : b === 2 ? 2 : 1; if (b === 8 && a % 3) clickBeat = 0.5; }
  return { bar, clickBeat };
}
function playScore(k, btn) {
  const r = REG[k]; if (!r || !r.res) return;
  if (PL && PL.k === k) { stopPlay(true); return; }
  const box = $(`.scorebox[data-k="${k}"]`);
  const speed = +(($(`select[data-f="speed"][data-k="${k}"]`) || {}).value || 1);
  const filt = r.opt.hand || null;
  const lp = box && $(`input[data-f="loop"][data-k="${k}"]`, box); if (lp) r.opt.loop = lp.checked;
  const ck = box && $(`input[data-f="click"][data-k="${k}"]`, box); if (ck) r.opt.click = ck.checked;
  const { evs, pedals } = scoreEvents(r, filt);
  const { bar, clickBeat } = meterOf(r.spec.time);
  const hlKeys = (ms, on, st) => ms.forEach(m => $$(`.kbd .key[data-m="${m}"]`, box).forEach(k2 => k2.classList.toggle(st === 'bass' ? 'on-lh' : 'on-rh', on)));
  let lastMbar = null;
  play(evs, {
    bpm: r.opt.bpm || 80, speed, pedals, click: r.opt.click, clickBeat, bar, countIn: r.opt.countIn ? bar : 0,
    onNote: (e, on) => {
      e.ids.forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('is-now', on); });
      if (!r.opt.noKeys) hlKeys(e.m, on, e.st);
      if (on && e.mOrd != null) { const mb = document.getElementById(`${k}-m${e.mOrd}`); if (lastMbar && lastMbar !== mb) { lastMbar.classList.remove('is-bar'); if (r.opt.follow && mb) { const rc = mb.getBoundingClientRect(); if (rc.top < 120 || rc.bottom > window.innerHeight - 150) mb.scrollIntoView({ block: 'center', behavior: 'smooth' }); } } if (mb && r.opt.follow) mb.classList.add('is-bar'); lastMbar = mb; }
    },
    onEnd: manual => { $$('.is-now', box).forEach(x => x.classList.remove('is-now')); $$('.on-rh,.on-lh', box).forEach(x => x.classList.remove('on-rh', 'on-lh')); $$('.is-bar', box).forEach(x => x.classList.remove('is-bar')); if (btn) btn.innerHTML = '▶︎ Anhören'; if (!manual && r.opt.loop && document.body.contains(box)) setTimeout(() => { if (!PL) playScore(k, btn); }, 350); }
  });
  if (PL) PL.k = k;
  if (btn) btn.innerHTML = '■ Stopp';
}

/* ---------------- Übungszeit (Session) ---------------- */
const SESS = { on: false, t0: 0, int: null, warned: false };
let wakeLock = null;
async function wake(on) { try { if (on && navigator.wakeLock && !wakeLock) wakeLock = await navigator.wakeLock.request('screen'); if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; } } catch (e) { wakeLock = null; } }
function sessToggle() {
  if (!SESS.on) { SESS.on = true; SESS.t0 = Date.now(); SESS.warned = false; SESS.int = setInterval(sessTick, 1000); wake(true); }
  else {
    const mins = Math.round((Date.now() - SESS.t0) / 60000);
    SESS.on = false; clearInterval(SESS.int); wake(false);
    if (mins > 0) { const d = dayRec(); d.min = (d.min || 0) + mins; save(); toast(`${mins} Minuten eingetragen. Heute insgesamt ${d.min} Min.`); }
  }
  sessDraw();
}
function sessTick() {
  if (!SESS.on) return;
  const sec = Math.floor((Date.now() - SESS.t0) / 1000);
  const el = $('#sess-t'); if (el) el.textContent = `${Math.floor(sec / 60)}:${pad2(sec % 60)}`;
  if (!SESS.warned && sec >= 50 * 60) { SESS.warned = true; toast('50 Minuten am Stück – Zeit für 5 Minuten Pause: Hände ausschütteln, aufstehen, Wasser.'); }
}
function sessDraw() {
  const bar = $('#timerbar'); const b = $('#sessbtn');
  if (b) { b.classList.toggle('run', SESS.on); b.setAttribute('aria-label', SESS.on ? 'Übungszeit beenden' : 'Übungszeit starten'); }
  if (!SESS.on) { bar.hidden = true; document.body.classList.remove('has-timer'); return; }
  bar.hidden = false; document.body.classList.add('has-timer');
  const today0 = (S.days[today()] || {}).min || 0;
  bar.innerHTML = `<div><div class="small" style="opacity:.75">Übungszeit läuft${today0 ? ` · heute schon ${today0} Min.` : ''}</div><span class="t" id="sess-t">0:00</span></div><button class="btn sm ghost" data-a="sess">Beenden</button>`;
  sessTick();
}
function dayRec(d = today()) { const r = S.days[d] = S.days[d] || {}; r.items = r.items || {}; return r; }

let toastT = null;
function toast(msg) { let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3800); }

/* ---------------- Metronom ---------------- */
const MT = { bpm: 72, beats: 4, on: false, next: 0, beat: 0, timer: null, taps: [] };
function metronomeHTML() {
  return `<div class="metro"><div class="row" style="justify-content:center;gap:18px"><button class="iconbtn" data-a="mt-step" data-d="-4" aria-label="langsamer">−</button><div><div class="bpm" id="mt-bpm">${MT.bpm}</div><div class="small muted">Schläge pro Minute</div></div><button class="iconbtn" data-a="mt-step" data-d="4" aria-label="schneller">+</button></div><input type="range" min="30" max="200" value="${MT.bpm}" id="mt-range" data-f="mt-range" aria-label="Tempo"><div class="dots" id="mt-dots">${Array.from({ length: MT.beats }, (_, i) => `<span></span>`).join('')}</div><div class="btnrow" style="justify-content:center"><button class="btn" data-a="mt-toggle">${MT.on ? '■ Stopp' : '▶︎ Start'}</button><button class="btn ghost" data-a="mt-tap">Tippen</button><div class="seg">${[2, 3, 4, 6].map(v => `<button class="${MT.beats === v ? 'on' : ''}" data-a="mt-beats" data-v="${v}">${v === 6 ? '6/8' : v + '/4'}</button>`).join('')}</div></div></div>`;
}
function mtSched() {
  const ctx = Sound.ctx; if (!ctx || !MT.on) return;
  const spb = 60 / MT.bpm * (MT.beats === 6 ? 0.5 : 1);
  while (MT.next < ctx.currentTime + 0.12) {
    const b = MT.beat % MT.beats; const acc = b === 0 || (MT.beats === 6 && b === 3);
    Sound.click(MT.next, acc);
    const when = (MT.next - ctx.currentTime) * 1000; const bb = b;
    setTimeout(() => { $$('#mt-dots span').forEach((d, i) => d.classList.toggle('on', i === bb)); }, Math.max(0, when));
    MT.next += spb; MT.beat++;
  }
}
function mtToggle() {
  const ctx = Sound.init(); if (!ctx) return;
  MT.on = !MT.on;
  if (MT.on) { MT.next = ctx.currentTime + 0.08; MT.beat = 0; MT.timer = setInterval(mtSched, 25); }
  else clearInterval(MT.timer);
  const b = $('[data-a="mt-toggle"]'); if (b) b.textContent = MT.on ? '■ Stopp' : '▶︎ Start';
}
function mtSet(bpm) { MT.bpm = Math.max(30, Math.min(220, Math.round(bpm))); const e = $('#mt-bpm'); if (e) e.textContent = MT.bpm; const r = $('#mt-range'); if (r) r.value = MT.bpm; }

/* ===== Notenweg 3 · Aufgaben-Runner (Übung, Test, Prüfung, Wiederholung) =====
   Regeln: Jede Aufgabe wird frisch erzeugt. Falsch → später eine vergleichbare, aber andere Aufgabe (nie dieselbe).
   Übung: so lange, bis „need“ Aufgaben richtig sind. Test: N Aufgaben, Bestehen ab „pass“ UND jede falsche muss
   mit einer Ersatzaufgabe repariert werden. */
const QZ = (() => {
  let run = null;
  const sigSeen = new Set();
  function gen(item, avoid) {
    const [g, o] = item; const fn = TH.G[g]; if (!fn) return null;
    for (let i = 0; i < 25; i++) {
      const q = fn(o || {}); if (!q) return null;
      if (!avoid || !avoid.has(q.sig)) { q.item = item; return q; }
    }
    const q = fn(o || {}); if (q) q.item = item; return q;
  }
  function start(cfg) {
    // cfg: {id, kind:'ex'|'test'|'exam'|'review'|'free', items:[[g,o,count?]...], n, need, pass, title, onDone(result)}
    const qs = []; const avoid = new Set();
    const items = cfg.items.filter(it => TH.G[it[0]]);
    if (cfg.kind === 'ex' || cfg.kind === 'free') {
      for (let i = 0; i < (cfg.n || 8); i++) { const it = items[i % items.length]; const q = gen(it, avoid); if (q) { avoid.add(q.sig); qs.push(q); } }
    } else {
      items.forEach(it => { const c = it[2] || 1; for (let i = 0; i < c; i++) { const q = gen(it, avoid); if (q) { avoid.add(q.sig); q.lesson = it[3] || null; qs.push(q); } } });
      if (cfg.n && qs.length > cfg.n) qs.splice(cfg.n);
    }
    const order = cfg.kind === 'ex' ? qs : TH.shuffle(qs);
    run = { cfg, qs: order.map(q => Object.assign(q, { base: true })), i: 0, res: [], avoid, answered: false, sel: new Set() };
    return run;
  }
  const cur = () => run && run.qs[run.i];
  function counts() {
    if (!run) return {};
    const base = run.res.filter(r => r.base); const ok = run.res.filter(r => r.ok).length;
    return { ok, all: run.res.length, baseOk: base.filter(r => r.ok).length, baseN: run.qs.filter(q => q.base).length, left: run.qs.length - run.i };
  }
  function answer(ok, given) {
    const q = cur(); if (!q || run.answered) return;
    run.answered = true;
    run.res.push({ ok, base: !!q.base, sig: q.sig, item: q.item, lesson: q.lesson, repairOf: q.repairOf });
    try { S.quiz.push({ d: today(), g: q.item[0], ok: ok ? 1 : 0 }); } catch (e) { }
    if (!ok) {
      // vergleichbare Ersatzaufgabe einplanen (anderes sig)
      const tries = q.repairOf != null ? (q.tries || 1) + 1 : 1;
      if (run.cfg.kind === 'ex' || run.cfg.kind === 'free' || tries <= 3) {
        const r = gen(q.item, run.avoid);
        if (r) { run.avoid.add(r.sig); r.base = false; r.repairOf = q.repairOf != null ? q.repairOf : q.sig; r.tries = tries; r.lesson = q.lesson; const pos = Math.min(run.qs.length, run.i + 2 + Math.floor(Math.random() * 3)); run.qs.splice(pos, 0, r); }
      }
    }
  }
  function next() {
    if (!run) return;
    run.i++; run.answered = false; run.sel = new Set();
    // Übung: bis need erreicht – falls Liste leer, nachfüllen
    if ((run.cfg.kind === 'ex' || run.cfg.kind === 'free') && run.i >= run.qs.length) {
      const c = counts();
      if (c.ok < (run.cfg.need || 0)) { const it = run.cfg.items[run.i % run.cfg.items.length]; const q = gen(it, run.avoid); if (q) { run.avoid.add(q.sig); q.base = false; run.qs.push(q); } }
    }
    if ((run.cfg.kind === 'ex' || run.cfg.kind === 'free') && counts().ok >= (run.cfg.need || 1e9) && run.i >= run.qs.length) return finish();
    if (run.cfg.kind === 'ex' && counts().ok >= (run.cfg.need || 1e9)) { run.qs.splice(run.i); return finish(); }
    if (run.i >= run.qs.length) return finish();
  }
  function finish() {
    const c = counts();
    const repairsOpen = new Set();
    // jede falsche Basisfrage braucht eine richtig beantwortete Reparatur
    run.res.forEach(r => { if (!r.ok) repairsOpen.add(r.repairOf || r.sig); });
    run.res.forEach(r => { if (r.ok && r.repairOf) repairsOpen.delete(r.repairOf); });
    const score = c.baseN ? c.baseOk / c.baseN : 1;
    const pass = run.cfg.kind === 'ex' || run.cfg.kind === 'free' ? c.ok >= (run.cfg.need || 0) : score >= (run.cfg.pass || 0.8) && repairsOpen.size === 0;
    const result = { score, pass, ok: c.ok, all: c.all, baseOk: c.baseOk, baseN: c.baseN, res: run.res.slice(), repairsOpen: repairsOpen.size };
    run.done = result;
    if (run.cfg.onDone) run.cfg.onDone(result);
    return result;
  }
  return { start, cur, answer, next, counts, get run() { return run; }, reset() { run = null; } };
})();

/* ---------- Darstellung einer Aufgabe ---------- */
function figHTML(f, ctx = {}) {
  if (!f) return '';
  if (Array.isArray(f)) return f.map(x => figHTML(x, ctx)).join('');
  if (f.kind === 'score') return scoreBox(f.spec, { fixedW: ctx.quiz ? f.w : null, s: f.s, play: !!f.play, bpm: f.bpm || 72, speed: f.speed, kbd: f.kbd || null, countIn: !!f.countIn, loopable: f.loopable, metro: f.metro, hand: f.hand, voiced: f.voiced });
  if (f.kind === 'kbd') return `<div class="kbdbox${f.tap ? ' tapkbd' : ''}" data-from="${f.from}" data-to="${f.to}">${Kbd.render({ from: f.from, to: f.to, width: f.w || 560, labels: f.labels === 'c-mid' ? 'none' : (f.labels || 'none'), marks: f.marks || {}, spans: f.spans })}</div>`;
  if (f.kind === 'svg' || f.kind === 'html') return f.html || f.svg;
  if (f.kind === 'circle') return circleSVG(f.sel);
  return '';
}
function qHTML(q, run) {
  const c = QZ.counts();
  const kind = run.cfg.kind;
  const pips = run.res.map(r => `<i class="${r.ok ? 'ok' : 'no'}"></i>`).join('') + Array.from({ length: Math.max(0, run.qs.length - run.res.length) }, () => '<i></i>').join('');
  const label = kind === 'ex' || kind === 'free' ? `${c.ok} von ${run.cfg.need} richtig` : `Aufgabe ${Math.min(run.i + 1, run.qs.length)} von ${run.qs.length}`;
  let h = `<div class="qcard"><div class="qmeta"><span>${label}${q.base === false ? ' · <i>Ersatzaufgabe</i>' : ''}</span><span class="pips">${pips}</span></div>`;
  h += `<div class="qtext">${q.q}</div>`;
  if (q.listen) h += `<div class="listen"><button class="btn" data-a="q-listen">▶︎ Anhören</button></div>`;
  if (q.fig) h += `<div class="qfig">${figHTML(q.fig, { quiz: true })}</div>`;
  if (q.choices) {
    h += `<div class="answers">${q.choices.map((c0, i) => `<button class="ans${c0.fig ? ' fig-ans' : ''}" data-a="q-ans" data-i="${i}">${c0.fig ? figHTML(c0.fig, { quiz: true }) + `<span class="small">${esc(c0.t)}</span>` : esc(c0.t)}</button>`).join('')}</div>`;
  } else if (q.input === 'keys') {
    h += `<div class="btnrow" style="justify-content:center;margin-top:8px"><button class="btn" data-a="q-check">Prüfen</button><button class="btn ghost" data-a="q-clear">Auswahl löschen</button></div>`;
  } else if (q.input === 'tap') {
    h += `<button class="tapbtn" data-a="tap-hit" id="tapbtn">Start</button><div class="tapres" id="tapres"></div>`;
  }
  h += `<div id="qfb" aria-live="polite"></div></div>`;
  return h;
}
function feedbackHTML(q, ok, extra = '') {
  return `<div class="feedback ${ok ? 'ok' : 'no'}"><b class="v">${ok ? TH.pick(['Richtig.', 'Genau.', 'Sitzt.', 'Sehr gut.', 'Stimmt.']) : TH.pick(['Nicht ganz.', 'Noch nicht.', 'Knapp daneben.'])}</b>${extra}${q.explain ? `<div class="small">${q.explain}</div>` : ''}${!ok ? '<div class="small muted" style="margin-top:4px">Du bekommst gleich eine ähnliche, neue Aufgabe dazu.</div>' : ''}<div class="btnrow" style="margin-top:10px">${q.play && !q.listen ? '<button class="btn sm ghost" data-a="q-play">▶︎ Klang</button>' : ''}<button class="btn sm" data-a="q-next" id="qnext">Weiter</button></div></div>`;
}

/* Quintenzirkel als SVG */
function circleSVG(sel) {
  const maj = ['C', 'G', 'D', 'A', 'E', 'H', 'Fis/Ges', 'Des', 'As', 'Es', 'B', 'F'];
  const min = ['a', 'e', 'h', 'fis', 'cis', 'gis', 'dis/es', 'b', 'f', 'c', 'g', 'd'];
  const acc = ['0', '1♯', '2♯', '3♯', '4♯', '5♯', '6♯/6♭', '5♭', '4♭', '3♭', '2♭', '1♭'];
  let s = `<svg class="circle5" viewBox="-178 -178 356 356" role="img" aria-label="Quintenzirkel"><circle r="150" fill="none" stroke="currentColor" stroke-opacity=".35"/><circle r="104" fill="none" stroke="currentColor" stroke-opacity=".25"/><circle r="66" fill="none" stroke="currentColor" stroke-opacity=".2"/>`;
  maj.forEach((k, i) => {
    const a = (i * 30 - 90) * Math.PI / 180; const x = Math.cos(a), y = Math.sin(a);
    const on = sel === i;
    s += `<line x1="${x * 66}" y1="${y * 66}" x2="${x * 150}" y2="${y * 150}" stroke="currentColor" stroke-opacity=".12" transform="rotate(15)"/>`;
    s += `<text x="${x * 127}" y="${y * 127 + 7}" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="${k.length > 3 ? 15 : 21}" font-weight="700" fill="${on ? 'var(--gold)' : 'currentColor'}">${k}</text>`;
    s += `<text x="${x * 86}" y="${y * 86 + 5}" text-anchor="middle" font-family="EB Garamond, serif" font-size="${min[i].length > 3 ? 11 : 14}" font-style="italic" fill="currentColor" fill-opacity=".8">${min[i]}</text>`;
    s += `<text x="${x * 162}" y="${y * 162 + 4}" text-anchor="middle" font-size="9" fill="var(--gold)">${acc[i]}</text>`;
  });
  s += `<text y="-6" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity=".7">außen Dur</text><text y="10" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity=".7">innen Moll</text></svg>`;
  return s;
}

/* ===== Notenweg 3 · Ansichten & Ablauf ===== */
const APP = (() => {
  /* ---------- Inhalt indizieren ---------- */
  const CH = CUR.chapters;
  const LES = []; const LBY = {}; const CHOF = {};
  CH.forEach((c, ci) => c.lessons.forEach((l, li) => { l.ch = c; l.ci = ci; l.li = li; LES.push(l); LBY[l.id] = l; CHOF[l.id] = c; }));
  const PBY = {}; PIECES.forEach(p => PBY[p.id] = p);
  const FBY = {}; CUR.folios.forEach(f => FBY[f.id] = f);
  TH.setGloss(CUR.gloss); TH.setPools(CUR.pools || {});
  const PROTO = [['ueber', 'Überblick', 'Tonart, Takt, Form, schwierige Stellen markieren. 5 Minuten Partitur lesen, bevor du spielst.'], ['hoeren', 'Hören und mitlesen', 'Einmal ganz anhören und in den Noten mitlesen. Dann jeden Abschnitt einzeln.'], ['akkord', 'Harmonie-Skelett', 'Akkorde oder Bassverlauf bestimmen und als Blockgriffe spielen.'], ['getrennt', 'Hände getrennt', 'Abschnittweise, langsam (ca. 60 %), Fingersatz fest eintragen.'], ['zusammen', 'Zusammen langsam', 'Beide Hände zusammen, Abschnitt für Abschnitt, ohne Anhalten.'], ['tempo', 'Tempo-Treppe', 'Ab 55 % des Zieltempos. 3× fehlerfrei → +4. Fehler → eine Stufe zurück.'], ['ausdruck', 'Ausdruck', 'Dynamik, Pedal, Phrasen, Melodie über Begleitung.'], ['reif', 'Vorspielreif', '3× hintereinander ohne Anhalten und eine Aufnahme, die dir gefällt.']];
  const pSteps = id => ((S.pieces[id] || {}).steps) || {};
  const pDone = id => PROTO.filter(p => pSteps(id)[p[0]]).length;
  const pAtLeast = (id, key) => { const st = pSteps(id); const idx = PROTO.findIndex(p => p[0] === key); return PROTO.slice(idx).some(p => st[p[0]]) || !!st[key]; };

  /* ---------- Freischaltung ---------- */
  const isDone = id => !!S.done[id];
  const chDone = c => c.lessons.every(l => isDone(l.id));
  const examPassed = c => !!(S.exams[c.id] && S.exams[c.id].pass);
  function lessonOpen(l) {
    if (l.li > 0) return isDone(l.ch.lessons[l.li - 1].id);
    if (l.ci === 0) return true;
    return examPassed(CH[l.ci - 1]);
  }
  const mustOk = c => !c.must || !c.must.length || c.must.some(id => pAtLeast(id, 'zusammen'));
  const examOpen = c => chDone(c) && mustOk(c) && (c.ci === 0 || examPassed(CH[c.ci - 1]));
  CH.forEach((c, i) => c.ci = i);
  function curChapter() { for (const c of CH) if (!examPassed(c)) return c; return CH[CH.length - 1]; }
  function nextLesson() { for (const l of LES) if (!isDone(l.id) && lessonOpen(l)) return l; return null; }
  function pieceOpen(p) { if (!p.after) return true; if (p.after.startsWith('ch:')) return examPassed(CH.find(c => c.id === p.after.slice(3)) || {}); return isDone(p.after); }
  function ballDays() { if (!S.settings.ball) return null; return diffDays(S.settings.ball, today()); }
  function ballOpen() { const c2 = CH[1]; if (c2 && examPassed(c2)) return true; const b = ballDays(); return b != null && b <= 21; }

  /* ---------- Wiederholung (1-3-7-14-30) ---------- */
  function srsAdd(lid) { if (!S.srs[lid]) S.srs[lid] = { stage: 1, next: addDays(today(), REVIEW[0]) }; }
  const dueList = () => Object.entries(S.srs).filter(([id, s]) => s.stage <= 5 && s.next <= today() && (LBY[id] || id.startsWith('p:'))).map(([id]) => id);
  function srsGrade(id, wrong) {
    const s = S.srs[id]; if (!s) return;
    if (wrong === 0) { s.stage += 1; s.next = s.stage <= 5 ? addDays(today(), REVIEW[s.stage - 1]) : null; }
    else if (wrong === 1) { s.next = addDays(today(), REVIEW[Math.max(0, s.stage - 2)]); }
    else { s.stage = 1; s.next = addDays(today(), 1); }
    s.last = today();
  }

  /* ---------- Bilder ---------- */
  const img = (k, cls = '', title = '', sub = '', eyebrow = '') => { const im = (typeof IMG !== 'undefined' && IMG[k]) || null; if (!im) return `<section class="card framed"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${sub ? `<p class="lead">${sub}</p>` : ''}</section>`; return `<section class="salon ${cls}"><img src="${im.src}" alt="${esc(im.alt)}" style="object-position:${im.pos || 'center'}"><span class="credit">${esc(im.credit)}</span><div class="salon-t">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div></section>`; };
  const FLOUR = `<svg class="flourish" viewBox="0 0 180 16" aria-hidden="true"><path d="M2 8h58c6 0 9-6 15-6 5 0 7 4 7 6s-2 6-7 6c-6 0-9-6-15-6M178 8h-58c-6 0-9-6-15-6-5 0-7 4-7 6s2 6 7 6c6 0 9-6 15-6" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="90" cy="8" r="3" fill="currentColor"/></svg>`;
  const SEAL = `<svg class="seal" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--wax)"/><circle cx="12" cy="12" r="7" fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".8"/><path d="M9 11V9.5a3 3 0 0 1 6 0V11M8.5 11h7v5h-7z" fill="none" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/></svg>`;
  const CHECK = `<svg class="seal" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--gold)"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="var(--gold-ink)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICONS = {
    pfad: '<svg viewBox="0 0 24 24"><path d="M5 21c0-5 3-6 7-8s6-4 6-8"/><circle cx="18" cy="4" r="1.6"/><circle cx="5" cy="21" r="1.6"/><path d="M9 3l1.5 1.5L9 6M14 18l1.5 1.5L14 21"/></svg>',
    wdh: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>',
    wissen: '<svg viewBox="0 0 24 24"><path d="M4 5c3-1 6-1 8 1v14c-2-2-5-2-8-1zM20 5c-3-1-6-1-8 1v14c2-2 5-2 8-1z"/></svg>',
    ball: '<svg viewBox="0 0 24 24"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 5l2.5-1.5M9.5 20.5L12 19l2.5 1.5M4 10l2.5-.5L6 7M18 17l-.5-2.5 2.5-.5M4 14l2.5.5L6 17M18 7l-.5 2.5 2.5.5"/></svg>'
  };
  const VIEWS = [['pfad', 'Lernpfad'], ['wdh', 'Wiederholen'], ['wissen', 'Wissen'], ['ball', 'Winterball']];
  function navHTML(cur) {
    const due = dueList().length;
    return VIEWS.map(([k, t]) => `<a class="nav-i${cur === k ? ' on' : ''}${k === 'ball' && !ballOpen() ? ' locked' : ''}" href="#${k}"${cur === k ? ' aria-current="page"' : ''}>${ICONS[k]}<span>${t}</span>${k === 'wdh' && due ? `<span class="badge">${due}</span>` : ''}</a>`).join('');
  }

  /* ---------- Router ---------- */
  let curView = 'pfad';
  function route() {
    stopPlay(true);
    const h = decodeURIComponent((location.hash || '#pfad').slice(1));
    let html = '', nav = 'pfad';
    try {
      if (h === 'pfad' || h === '') html = vPfad();
      else if (h.startsWith('lektion-')) html = vLesson(h.slice(8));
      else if (h.startsWith('pruefung-')) html = vExam(h.slice(9));
      else if (h.startsWith('stueck-')) html = vPiece(h.slice(7));
      else if (h === 'stuecke') html = vShelf();
      else if (h === 'wdh') { html = vReview(); nav = 'wdh'; }
      else if (h === 'training') { html = vFree(); nav = 'wdh'; }
      else if (h === 'blatt') { html = vSight(); nav = 'wdh'; }
      else if (h === 'wissen') { html = vWissen(); nav = 'wissen'; }
      else if (h.startsWith('folie-')) { html = vFolio(h.slice(6)); nav = 'wissen'; }
      else if (h === 'glossar') { html = vGloss(); nav = 'wissen'; }
      else if (h === 'ball') { html = vBall(); nav = 'ball'; }
      else if (h.startsWith('lied-')) { html = vSong(h.slice(5)); nav = 'ball'; }
      else if (h === 'profil') { html = vProfil(); nav = ''; }
      else if (h === 'werkzeuge') { html = vTools(); nav = ''; }
      else html = vPfad();
    } catch (e) { console.error(e); html = `<section class="card"><p class="err">Hier ist etwas schiefgelaufen: ${esc(e.message)}</p><a class="btn" href="#pfad">Zum Lernpfad</a></section>`; }
    curView = nav;
    $('#view').innerHTML = html;
    $('#nav').innerHTML = navHTML(nav);
    $('#profbtn').classList.toggle('on', h === 'profil');
    updateTop();
    setHdr();
    requestAnimationFrame(() => { mountScores(); afterMount(h); });
    if (!route.keepScroll) window.scrollTo(0, 0);
    route.keepScroll = false;
  }
  function rerender() { route.keepScroll = true; const y = window.scrollY; route(); window.scrollTo(0, y); }
  function updateTop() {
    const el = $('#topmid'); if (!el) return;
    const c = curChapter(); const nl = nextLesson();
    const done = LES.filter(l => isDone(l.id)).length;
    el.textContent = `Kapitel ${c.id} · ${done}/${LES.length} Lektionen`;
  }

  /* =====================================================================
     LERNPFAD
     ===================================================================== */
  function todayItems() {
    const c = curChapter(); const nl = nextLesson(); const dr = dayRec();
    const due = dueList();
    const must = (c.must || []).map(id => PBY[id]).filter(Boolean);
    const focusPiece = must.find(p => pieceOpen(p) && !pAtLeast(p.id, 'reif')) || (c.more || []).map(id => PBY[id]).find(p => p && pieceOpen(p) && !pAtLeast(p.id, 'reif')) || PIECES.filter(p => pieceOpen(p) && pDone(p.id) > 0 && !pAtLeast(p.id, 'reif'))[0] || null;
    const items = [];
    items.push({ k: 'wdh', t: 'Wiederholen', d: due.length ? `${due.length} fällig · ca. ${Math.min(15, due.length * 3)} Min.` : 'heute nichts fällig', href: '#wdh', done: !due.length || !!dr.items.wdh });
    items.push({ k: 'lern', t: nl ? `Lektion ${nl.id}: ${nl.title}` : (examOpen(c) && !examPassed(c) ? `Kapitelprüfung ${c.id}` : 'Weiterlernen'), d: nl ? `${nl.min || 25} Min. · Schritt ${Math.min((S.stepAt[nl.id] || 0) + 1, nl.steps.length)} von ${nl.steps.length}` : (examOpen(c) ? 'Bereit für die Prüfung' : (!mustOk(c) ? 'Erst das Pflichtstück bis „Zusammen langsam“ bringen' : '')), href: nl ? `#lektion-${nl.id}` : (examOpen(c) ? `#pruefung-${c.id}` : '#pfad'), done: !!dr.items.lern });
    if (focusPiece) items.push({ k: 'stueck', t: `Stück: ${focusPiece.title}`, d: `15–20 Min. · nächster Schritt: ${(PROTO.find(p => !pSteps(focusPiece.id)[p[0]]) || PROTO[7])[1]}`, href: `#stueck-${focusPiece.id}`, done: !!dr.items['p:' + focusPiece.id] });
    items.push({ k: 'blatt', t: 'Blattspiel des Tages', d: '5 Min. · drei kurze Stücke, die du noch nie gesehen hast', href: '#blatt', done: !!dr.items.blatt });
    return items;
  }
  function vPfad() {
    const c = curChapter(); const nl = nextLesson();
    const done = LES.filter(l => isDone(l.id)).length;
    const first = done === 0 && !Object.keys(S.stepAt).length;
    let h = img(c.img || 'ancher', '', first ? 'Willkommen im Salon' : `Kapitel ${c.id} · ${esc(c.title)}`, first ? 'Ein Weg, Schritt für Schritt: Noten lesen, verstehen, spielen. Jede Lektion öffnet die nächste.' : esc(c.sub), first ? 'Notenweg' : `${done} von ${LES.length} Lektionen`);
    // Heute
    const items = todayItems();
    const nIdx = items.findIndex(x => !x.done);
    h += `<section class="card framed today"><div class="row-between"><h2>Heute</h2><span class="small muted">${new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div><p class="small muted">Von oben nach unten – das ist deine Übe-Einheit (40–55 Minuten). Aufwärmen machst du vorher auf deine Art. Tippe auf die Uhr oben, um die Zeit zu messen.</p><ol>${items.map((x, i) => `<li><a class="tstep${x.done ? ' done' : ''}${i === nIdx ? ' next' : ''}" href="${x.href}" ${x.act ? `data-a="${x.act}"` : ''} style="text-decoration:none;color:inherit"><span class="tn">${x.done ? '✓' : i + 1}</span><span class="tt"><b>${esc(x.t)}</b><span>${esc(x.d)}</span></span><span aria-hidden="true">›</span></a></li>`).join('')}</ol>`;
    h += `<details class="more"><summary>Mehr Zeit heute? (Bonus)</summary><ul class="small"><li><a href="#stuecke">Weitere Stücke deiner Stufe</a> – Kür neben dem Pflichtstück.</li><li><a href="#training">Freies Training</a> – alles, was du schon gelernt hast, gemischt.</li><li><a href="#blatt">Mehr Blattspiel</a> – der schnellste Weg zu „Noten sehen, sofort spielen“.</li>${ballOpen() ? '<li><a href="#ball">Winterball</a> – Lieder und Programm.</li>' : ''}<li><b>Gesund bleiben:</b> nach 25–30 Min. kurz Pause, nie über 60 Min. am Stück, am Tag höchstens 2,5–3 Stunden aktives Spielen.</li></ul></details></section>`;
    // Kapitel
    h += `<div class="rule"><span>Der Weg</span></div>`;
    CH.forEach(cc => { h += chapterHTML(cc, cc === c); });
    h += `<p class="foot">Gemälde: ${Object.values(typeof IMG !== 'undefined' ? IMG : {}).map(x => esc(x.credit)).join(' · ')} – gemeinfrei, über Standard Ebooks.</p>`;
    return h;
  }
  function chapterHTML(c, isCur) {
    const open = isCur || CHOPEN[c.id];
    const doneN = c.lessons.filter(l => isDone(l.id)).length;
    const locked = c.ci > 0 && !examPassed(CH[c.ci - 1]) && !c.lessons.some(l => isDone(l.id));
    const st = examPassed(c) ? 'done' : locked ? 'locked' : '';
    let h = `<section class="card chap ${st}" id="ch-${c.id}"><button class="chap-h" data-a="ch-toggle" data-c="${c.id}" aria-expanded="${open ? 'true' : 'false'}"><span class="medal">${c.id}</span><span><h3>${esc(c.title)}</h3><span class="sub">${locked ? 'Öffnet sich nach Kapitel ' + CH[c.ci - 1].id : esc(c.sub)}</span><div class="prog"><span style="width:${Math.round(doneN / c.lessons.length * 100)}%"></span></div></span><span class="small muted num">${doneN}/${c.lessons.length}</span></button>`;
    if (open && !locked) {
      h += `<ul class="lessons">`;
      let shownLocked = false;
      c.lessons.forEach(l => {
        const d = isDone(l.id), op = lessonOpen(l);
        if (!op && shownLocked) return;
        if (!op) { shownLocked = true; const rest = c.lessons.length - l.li; h += `<li><span class="lrow locked">${SEAL}<span class="lt">Versiegelt<small>${rest} weitere Lektion${rest > 1 ? 'en' : ''} – die nächste öffnet sich, wenn die vorige bestanden ist.</small></span></span></li>`; return; }
        const cur = !d && op;
        h += `<li class="${d ? 'done' : cur ? 'cur' : ''}"><a class="lrow" href="#lektion-${l.id}"><span class="ln">${l.id}</span><span class="lt">${esc(l.title)}<small>${d ? 'bestanden' + (S.done[l.id].skip ? ' (Einstufung)' : S.done[l.id].score != null ? ' · ' + Math.round(S.done[l.id].score * 100) + ' %' : '') : (S.stepAt[l.id] ? `Schritt ${S.stepAt[l.id] + 1} von ${l.steps.length}` : esc(l.sub || ''))}</small></span>${d ? CHECK : '<span aria-hidden="true">›</span>'}</a></li>`;
      });
      h += `</ul>`;
      // Stücke & Prüfung
      const must = (c.must || []).map(id => PBY[id]).filter(Boolean);
      const more = (c.more || []).map(id => PBY[id]).filter(Boolean);
      if (must.length || more.length) {
        h += `<div class="station"><h4>Stücke dieses Kapitels</h4><p class="small muted">${must.length > 1 ? 'Pflicht: eines davon bis „Zusammen langsam“ – dann öffnet sich die Prüfung.' : must.length ? 'Pflicht: bis „Zusammen langsam“ – dann öffnet sich die Prüfung.' : ''}</p><ul class="shelf">${must.map(p => pcardHTML(p, true)).join('')}${more.map(p => pcardHTML(p, false)).join('')}</ul></div>`;
      }
      const eo = examOpen(c), ep = examPassed(c);
      h += `<div class="station"><div class="row-between"><div><h4>Kapitelprüfung ${c.id}</h4><span class="small muted">${ep ? `bestanden${S.exams[c.id].skip ? ' (Einstufung)' : ''} · ${Math.round(S.exams[c.id].score * 100)} %` : eo ? 'Bereit: gemischte Fragen aus dem ganzen Kapitel + Vorspiel-Check.' : !chDone(c) ? 'Öffnet sich, wenn alle Lektionen bestanden sind.' : 'Erst ein Pflichtstück bis „Zusammen langsam“.'}</span></div>${eo || ep ? `<a class="btn sm${ep ? ' ghost' : ''}" href="#pruefung-${c.id}">${ep ? 'Ansehen' : 'Zur Prüfung'}</a>` : SEAL}</div>${!ep && isCur && c.ci > 0 ? `<p class="small" style="margin-top:8px">Kannst du das alles schon? <button class="linkbtn" data-a="einstufung" data-c="${c.id}">Einstufungstest machen</button> (ab 90 % ist das Kapitel geschafft).</p>` : ''}</div>`;
    }
    h += `</section>`;
    return h;
  }
  const CHOPEN = {};
  function pcardHTML(p, must) {
    const op = pieceOpen(p); const d = pDone(p.id);
    if (!op) return `<li><span class="pcard locked">${SEAL}<b>${esc(p.title)}</b><span class="who">${esc(p.composer)}</span><span class="small muted">öffnet sich nach Lektion ${esc(p.after)}</span></span></li>`;
    return `<li><a class="pcard${must ? ' must' : ''}" href="#stueck-${p.id}"><b>${esc(p.title)}</b><span class="who">${esc(p.composer)}</span><span class="meta">${must ? '<span class="chip gold">Pflicht</span>' : '<span class="chip">Kür</span>'}<span class="chip lvl">Stufe ${p.lvl}</span>${p.inApp === false ? '<span class="chip">Noten extern</span>' : ''}${pAtLeast(p.id, 'reif') ? '<span class="chip ok">vorspielreif</span>' : ''}</span><span class="prog"><span style="width:${Math.round(d / 8 * 100)}%"></span></span></a></li>`;
  }

  /* =====================================================================
     LEKTION
     ===================================================================== */
  const LV = { id: null, step: null, mode: 'steps' };
  function vLesson(id) {
    const l = LBY[id]; if (!l) return `<section class="card"><p>Lektion nicht gefunden.</p><a class="btn" href="#pfad">Zum Lernpfad</a></section>`;
    if (!lessonOpen(l) && !isDone(l.id)) return `<section class="card framed"><div class="locknote">${SEAL}<div><h2>Noch versiegelt</h2><p>Diese Lektion öffnet sich, wenn die vorige bestanden ist.</p></div></div><a class="btn" href="#pfad">Zum Lernpfad</a></section>`;
    if (LV.id !== id) { LV.id = id; LV.step = null; LV.mode = 'steps'; LV.started = false; QZ.reset(); }
    const reached = S.stepAt[id] || 0; const N = l.steps.length;
    if (LV.step == null) LV.step = isDone(id) ? 0 : Math.min(reached, N - 1);
    let h = `<nav class="crumb"><a href="#pfad">← Lernpfad</a> · Kapitel ${l.ch.id}</nav>`;
    if (LV.mode === 'intro' || (!reached && !isDone(id) && LV.step === 0 && !LV.started)) {
      h += `<section class="card framed"><p class="eyebrow">Lektion ${l.id} · ca. ${l.min || 25} Minuten</p><h1>${esc(l.title)}</h1><p class="lead">${esc(l.sub || '')}</p>${FLOUR}${l.goals ? `<h4>Danach kannst du</h4><ul class="body">${l.goals.map(g => `<li>${g}</li>`).join('')}</ul>` : ''}<h4>Ablauf</h4><p class="small muted">${stepSummary(l)}</p><div class="btnrow"><button class="btn" data-a="l-begin">Beginnen</button>${!isDone(id) ? `<button class="btn ghost" data-a="l-skip">Kann ich schon → direkt zum Test</button>` : ''}</div>${!isDone(id) ? '<p class="small muted" style="margin-top:8px">Abkürzung: Mit mindestens 90 % im Abschlusstest zählt die Lektion als bestanden.</p>' : ''}</section>`;
      return h;
    }
    if (LV.mode === 'skiptest') return h + `<section class="card"><p class="eyebrow">Lektion ${l.id} · Abkürzung</p><h2>Direkt zum Test</h2><p class="small muted">Gemischte Fragen aus der ganzen Lektion. Ab 90 % gilt sie als bestanden.</p><div id="quiz"></div></section>`;
    const s = l.steps[LV.step];
    h += `<section class="lhead"><div class="row-between"><span class="eyebrow" style="margin:0">Lektion ${l.id} · ${esc(l.title)}</span><span class="small muted num">${LV.step + 1}/${N}</span></div><div class="steps-dots">${l.steps.map((st, i) => `<button class="${i < reached || isDone(id) ? 'done' : ''}${i === LV.step ? ' cur' : ''}" data-a="l-go" data-i="${i}" aria-label="Schritt ${i + 1}" ${i > reached && !isDone(id) ? 'disabled' : ''}></button>`).join('')}</div></section>`;
    h += stepHTML(l, s, LV.step);
    return h;
  }
  const KIND = { read: 'Verstehen', ex: 'Üben', mix: 'Üben', piano: 'Am Klavier', piece: 'Stück', sight: 'Blattspiel', test: 'Abschlusstest', sum: 'Merkzettel', tool: 'Werkzeug', listen: 'Hören' };
  function stepSummary(l) {
    const c = {}; l.steps.forEach(s => c[s.t] = (c[s.t] || 0) + 1);
    return Object.entries(c).map(([k, n]) => `${n}× ${KIND[k] || k}`).join(' · ');
  }
  function bodyWithFigs(body, figs) {
    let used = new Set(); let html = (body || '').replace(/\[\[(\d+)\]\]/g, (m, i) => { used.add(+i); return figBlock(figs[+i]); });
    (figs || []).forEach((f, i) => { if (!used.has(i)) html += figBlock(f); });
    return html;
  }
  function figBlock(f) {
    if (!f) return '';
    if (Array.isArray(f)) return `<div class="figrow">${f.map(x => `<div style="flex:1 1 220px">${figBlock(x)}</div>`).join('')}</div>`;
    return `<figure class="fig">${figHTML(f)}${f.cap ? `<figcaption>${f.cap}</figcaption>` : ''}</figure>`;
  }
  function stepHTML(l, s, i) {
    const last = i === l.steps.length - 1;
    const canNext = stepComplete(l, i);
    const kind = KIND[s.t] || '';
    let h = `<section class="card stepcard${s.t === 'test' ? ' gold' : ''}"><div class="kind">${kind}${s.min ? ` · ${s.min} Min.` : ''}</div>${s.h ? `<h2>${s.h}</h2>` : ''}`;
    if (s.t === 'read' || s.t === 'sum' || s.t === 'listen') {
      h += `<div class="body">${bodyWithFigs(s.body, s.figs || (s.fig ? [s.fig] : []))}</div>`;
      if (s.t === 'sum') h += `<p class="small muted">Diese Zusammenfassung findest du jederzeit unter <a href="#wissen">Wissen</a>.</p>`;
    } else if (s.t === 'ex' || s.t === 'mix' || s.t === 'test') {
      if (s.body) h += `<div class="body">${bodyWithFigs(s.body, s.figs || [])}</div>`;
      const done = stepComplete(l, i);
      h += done && !QZ.run ? `<p class="chip ok">✓ ${s.t === 'test' ? 'bestanden' : 'geschafft'}</p> <button class="btn sm ghost" data-a="ex-start">Nochmal üben</button>` : `<div id="quiz"></div>`;
    } else if (s.t === 'piano') {
      h += `<div class="body">${bodyWithFigs(s.body, s.figs || (s.fig ? [s.fig] : []))}</div>`;
      const st = (S.pchk || {})[l.id + ':' + i] || [];
      const prep = (s.checks || []).filter(isPrep);
      if (prep.length) h += `<p class="small muted prephint">Vorher kurz, ohne Abhaken: ${prep.some(c => c.startsWith('Noten')) ? 'Noten benennen' : ''}${prep.length > 1 ? ', dann ' : ''}${prep.some(c => c.startsWith('Rhythmus')) ? 'Rhythmus zählen und klatschen' : ''} – erst dann spielen.</p>`;
      h += `<h4>Abhaken, wenn erledigt</h4><ul class="checks">${(s.checks || []).map((c, k) => isPrep(c) ? '' : `<li><label><input type="checkbox" data-f="pchk" data-l="${l.id}" data-s="${i}" data-k="${k}"${st[k] ? ' checked' : ''}><span>${c}</span></label></li>`).join('')}</ul>`;
      if (s.metro) h += `<details class="more"><summary>Metronom</summary>${metronomeHTML()}</details>`;
    } else if (s.t === 'piece') {
      const p = PBY[s.id];
      h += `<div class="body">${bodyWithFigs(s.body, s.figs || [])}</div>`;
      if (p) h += `<ul class="shelf">${pcardHTML(p, (l.ch.must || []).includes(p.id))}</ul><p class="small muted">Das Stück bleibt im Kapitel verfügbar – du arbeitest parallel zu den nächsten Lektionen daran.</p>`;
    } else if (s.t === 'sight') {
      h += `<div class="body">${bodyWithFigs(s.body, [])}</div>` + sightBlock(s.lv || 1, 'l');
    } else if (s.t === 'tool') {
      h += `<div class="body">${bodyWithFigs(s.body, [])}</div>` + toolHTML(s.tool, s);
    }
    h += `<div class="btnrow" style="margin-top:14px;justify-content:space-between">${i > 0 ? `<button class="btn ghost" data-a="l-prev">Zurück</button>` : '<span></span>'}${last ? (isDone(l.id) ? `<a class="btn" href="#pfad">Zum Lernpfad</a>` : `<button class="btn" data-a="l-next" ${canNext ? '' : 'disabled'}>Lektion abschließen</button>`) : `<button class="btn" data-a="l-next" ${canNext ? '' : 'disabled'}>Weiter</button>`}</div>`;
    if (!canNext) h += `<p class="small muted" style="text-align:right;margin-top:6px">${s.t === 'piano' ? 'Hake alle Punkte ab, um weiterzugehen.' : s.t === 'test' ? 'Bestehe den Test, um die Lektion abzuschließen.' : 'Schließe die Übung ab, um weiterzugehen.'}</p>`;
    h += `</section>`;
    return h;
  }
  /* Vorbereitung (Noten benennen, Rhythmus klatschen/zählen) wird nicht abgehakt, nur als kleiner Hinweis gezeigt. */
  const isPrep = c => /^(Noten( links)? laut benannt|Rhythmus (laut gezählt und geklatscht|geklatscht und gezählt))/.test(c);
  function stepComplete(l, i) {
    const s = l.steps[i];
    const key = l.id + ':' + i;
    if (s.t === 'piano') { const st = (S.pchk || {})[key] || []; return (s.checks || []).every((c, k) => st[k] || isPrep(c)); }
    if (s.t === 'ex' || s.t === 'mix' || s.t === 'test') return !!(S.exDone || {})[key] || (s.t === 'test' && isDone(l.id));
    if (s.t === 'sight') return !!(S.exDone || {})[key] || isDone(l.id);
    return true;
  }
  function markStep(l, i) {
    S.exDone = S.exDone || {}; S.exDone[l.id + ':' + i] = true;
    S.stepAt[l.id] = Math.max(S.stepAt[l.id] || 0, Math.min(i + 1, l.steps.length - 1));
    dayRec().items.lern = true; save();
  }
  function stepItems(s) { return s.t === 'ex' ? [[s.gen, s.o || {}]] : s.t === 'mix' ? s.gens : s.gens; }
  function startStepQuiz(l, i) {
    const s = l.steps[i];
    if (s.t === 'test') {
      QZ.start({ kind: 'test', items: s.gens, pass: s.pass || 0.8, onDone: r => { if (r.pass) { markStep(l, i); } } });
    } else {
      const items = s.t === 'ex' ? [[s.gen, s.o || {}]] : s.gens;
      QZ.start({ kind: 'ex', items, n: s.n || 8, need: s.need || Math.max(1, (s.n || 8) - 2), onDone: r => { markStep(l, i); } });
    }
    drawQuiz();
  }
  function completeLesson(l, score, skip) {
    S.done[l.id] = { d: today(), score: score != null ? score : null, skip: !!skip };
    S.stepAt[l.id] = l.steps.length - 1;
    srsAdd(l.id); dayRec().items.lern = true; save();
  }
  function lessonDoneHTML(l) {
    const nf = CUR.folios.filter(f => f.after === l.id);
    const nl = LES[LES.indexOf(l) + 1];
    const np = PIECES.filter(p => p.after === l.id);
    return `<section class="card framed" style="text-align:center"><div class="confetti"><svg viewBox="0 0 90 90"><circle cx="45" cy="45" r="40" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="45" cy="45" r="34" fill="none" stroke="currentColor" stroke-width=".8"/><path d="M30 46l10 10 20-22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><p class="eyebrow">Lektion ${l.id} bestanden</p><h1>${esc(l.title)}</h1>${FLOUR}<p>Die erste Wiederholung kommt morgen, dann nach 3, 7, 14 und 30 Tagen – so wandert es ins Langzeitgedächtnis.</p>${nf.length ? `<p>Neu im Wissen: ${nf.map(f => `<a href="#folie-${f.id}">${esc(f.title)}</a>`).join(', ')}</p>` : ''}${np.length ? `<p>Neues Stück freigeschaltet: ${np.map(p => `<a href="#stueck-${p.id}">${esc(p.title)}</a>`).join(', ')}</p>` : ''}<div class="btnrow" style="justify-content:center">${nl && lessonOpen(nl) ? `<a class="btn" href="#lektion-${nl.id}">Weiter: ${esc(nl.title)}</a>` : examOpen(l.ch) ? `<a class="btn" href="#pruefung-${l.ch.id}">Zur Kapitelprüfung</a>` : ''}<a class="btn ghost" href="#pfad">Lernpfad</a></div>${!nl || nl.ch !== l.ch ? (!mustOk(l.ch) ? `<p class="small muted" style="margin-top:10px">Letzte Lektion des Kapitels. Für die Prüfung fehlt noch ein Pflichtstück bis „Zusammen langsam“.</p>` : '') : ''}</section>`;
  }

  /* ---------- Quiz zeichnen ---------- */
  let quizTarget = null;
  function drawQuiz() {
    const box = $('#quiz'); if (!box) return;
    const run = QZ.run; if (!run) { box.innerHTML = ''; return; }
    if (run.done) { box.innerHTML = resultHTML(run); afterQuizDone(run); return; }
    const q = QZ.cur(); if (!q) { box.innerHTML = ''; return; }
    box.innerHTML = qHTML(q, run);
    mountScores(box);
    if (q.input === 'key' || q.input === 'keys') $$('.tapkbd .key', box).forEach(k => k.classList.add('tapme'));
  }
  function resultHTML(run) {
    const r = run.done; const k = run.cfg.kind;
    if (k === 'ex' || k === 'free') return `<div class="feedback ok"><b class="v">Übung geschafft</b><div>${r.ok} richtige Antworten, Trefferquote ${Math.round(r.ok / Math.max(1, r.all) * 100)} %.</div></div>`;
    const pct = Math.round(r.score * 100);
    const weak = {}; r.res.filter(x => !x.ok).forEach(x => weak[x.item[0]] = (weak[x.item[0]] || 0) + 1);
    const GN = { noteName: 'Notennamen', noteKey: 'Note → Taste', ivSize: 'Intervallgröße', ivQual: 'Intervalle genau', keySig: 'Vorzeichen → Tonart', keyAcc: 'Vorzeichen einer Tonart', triadQual: 'Dreiklänge', inversion: 'Umkehrungen', measureFill: 'Notenwerte im Takt', noteValue: 'Notenwerte', term: 'Fachbegriffe', degree: 'Stufenakkorde', prog: 'Akkordfolgen', symNotes: 'Akkordsymbole', pool: 'Wissensfragen' };
    if (r.pass) return `<div class="feedback ok"><b class="v">Bestanden – ${pct} %</b><div>${r.baseOk} von ${r.baseN} Aufgaben auf Anhieb richtig${r.res.some(x => !x.base) ? ', alle Fehler mit Ersatzaufgaben repariert' : ''}.</div></div>`;
    return `<div class="feedback no"><b class="v">Noch nicht bestanden – ${pct} %</b><div>Nötig: ${Math.round((run.cfg.pass || 0.8) * 100)} %${r.repairsOpen ? ' und jede falsche Aufgabe mit einer richtigen Ersatzaufgabe repariert' : ''}.</div>${Object.keys(weak).length ? `<div class="small" style="margin-top:6px">Schwerpunkte zum Nacharbeiten: ${Object.keys(weak).map(g => GN[g] || g).join(', ')}.</div>` : ''}<div class="btnrow" style="margin-top:10px"><button class="btn sm" data-a="test-retry">Neuer Test mit neuen Aufgaben</button></div></div>`;
  }
  function afterQuizDone(run) {
    const h = location.hash;
    if (h.startsWith('#lektion-')) {
      const l = LBY[h.slice(9)]; if (!l) return;
      if (LV.mode === 'skiptest') { if (run.done.pass) { completeLesson(l, run.done.score, true); $('#quiz').innerHTML = resultHTML(run) + lessonDoneHTML(l); } return; }
      const btn = $('[data-a="l-next"]'); if (btn && stepComplete(l, LV.step)) { btn.disabled = false; const p = btn.parentElement.nextElementSibling; if (p && p.classList.contains('small')) p.remove(); }
    }
  }

  /* =====================================================================
     KAPITELPRÜFUNG & EINSTUFUNG
     ===================================================================== */
  const EX = { ch: null, phase: 'intro' };
  function examItems(c) { return c.exam.items; }
  function vExam(cid) {
    const c = CH.find(x => x.id === cid); if (!c) return '<p>Prüfung nicht gefunden.</p>';
    if (EX.ch !== cid) { EX.ch = cid; EX.phase = 'intro'; QZ.reset(); }
    const ep = examPassed(c);
    let h = `<nav class="crumb"><a href="#pfad">← Lernpfad</a></nav>` + img(c.img || 'ancher', 'short', `Kapitelprüfung ${c.id}`, esc(c.title), 'Prüfung');
    if (!examOpen(c) && !ep && EX.phase !== 'placement') return h + `<section class="card"><div class="locknote">${SEAL}<p>Die Prüfung öffnet sich, wenn alle Lektionen des Kapitels bestanden sind und ein Pflichtstück „Zusammen langsam“ erreicht hat.</p></div></section>`;
    if (EX.phase === 'intro') {
      const must = (c.must || []).map(id => PBY[id]).filter(Boolean);
      const mp = must.find(p => pAtLeast(p.id, 'zusammen')) || must[0];
      h += `<section class="card framed"><h2>So läuft die Prüfung</h2><ol class="body"><li><b>Vorspiel-Check</b> am Klavier: ${mp ? `„${esc(mp.title)}“` : 'dein Pflichtstück'} einmal von Anfang bis Ende, ohne Anhalten, im langsamen Tempo.</li><li><b>Theorie</b>: ${c.exam.n || 16} gemischte Aufgaben aus dem ganzen Kapitel. Bestehen ab ${Math.round((c.exam.pass || 0.85) * 100)} %. Jede falsche Antwort bekommt eine Ersatzaufgabe.</li></ol>${ep ? `<p class="chip ok">✓ bestanden am ${fmtD(S.exams[c.id].d)} mit ${Math.round(S.exams[c.id].score * 100)} %</p>` : ''}<div class="btnrow"><button class="btn" data-a="exam-play">${ep ? 'Nochmal prüfen' : 'Beginnen'}</button></div></section>`;
      return h;
    }
    if (EX.phase === 'play') {
      const must = (c.must || []).map(id => PBY[id]).filter(Boolean);
      const checks = ['Ich habe einmal von Anfang bis Ende gespielt, ohne anzuhalten (auch wenn Fehler passiert sind).', 'Das Tempo war gleichmäßig – kein Abbremsen an schweren Stellen.', 'Ich habe die Noten gelesen (nicht nur aus dem Gedächtnis oder per Video).', 'Ich konnte nach einem Fehler sofort weiterspielen.'];
      h += `<section class="card"><h2>Vorspiel-Check</h2><p>Spiel dein Pflichtstück ${must.length ? `(${must.map(p => `<a href="#stueck-${p.id}">${esc(p.title)}</a>`).join(' oder ')})` : ''} einmal durch – wie vor Publikum. Am besten mit Aufnahme.</p><ul class="checks">${checks.map((t, i) => `<li><label><input type="checkbox" data-f="examchk" data-i="${i}"><span>${t}</span></label></li>`).join('')}</ul><div class="btnrow"><button class="btn" data-a="exam-theory" id="exam-go" disabled>Weiter zur Theorie</button></div></section>`;
      return h;
    }
    return h + `<section class="card"><h2>${EX.phase === 'placement' ? 'Einstufungstest' : 'Theorie'}</h2><div id="quiz"></div></section>`;
  }
  function startExam(c, placement) {
    const items = examItems(c);
    QZ.start({ kind: 'exam', items, n: placement ? Math.max(20, c.exam.n || 16) : c.exam.n || 16, pass: placement ? 0.9 : c.exam.pass || 0.85, onDone: r => {
      if (r.pass) {
        S.exams[c.id] = { d: today(), score: r.score, pass: true, skip: !!placement };
        if (placement) c.lessons.forEach(l => { if (!isDone(l.id)) completeLesson(l, null, true); });
        save();
      }
    } });
  }

  /* =====================================================================
     STÜCKE
     ===================================================================== */
  const PV = { id: null, hand: '', kbd: false, names: false, range: null };
  function clefAtStart(p, a) {
    const cur = Object.assign({ treble: 'treble', bass: 'bass' }, p.clefInit || {});
    for (let i = 0; i < a; i++) { const c = p.measures[i].clef; if (!c) continue; if (c.r) c.r.forEach(([, k]) => cur.treble = k); if (c.l) c.l.forEach(([, k]) => cur.bass = k); }
    return cur;
  }
  function keyAtStart(p, a) { let k = p.key; for (let i = 1; i <= a && i < p.measures.length; i++) if (p.measures[i].key) k = p.measures[i].key; return k; }
  function timeAtStart(p, a) { let t = p.time; for (let i = 1; i <= a && i < p.measures.length; i++) if (p.measures[i].time) t = p.measures[i].time; return t; }
  function vShelf() {
    let h = `<nav class="crumb"><a href="#pfad">← Lernpfad</a></nav><section class="card framed"><p class="eyebrow">Repertoire</p><h1>Deine Stücke</h1><p class="lead">Alle Stücke in Originalfassung, geordnet nach Stufen. Neue öffnen sich mit dem Lernpfad.</p></section>`;
    const lv = [...new Set(PIECES.map(p => p.lvl))].sort((a, b) => a - b);
    lv.forEach(v => {
      const ps = PIECES.filter(p => p.lvl === v);
      h += `<section class="card"><h2>Stufe ${v}</h2><p class="small muted">${LVL_TXT[v] || ''}</p><ul class="shelf">${ps.map(p => pcardHTML(p, CH.some(c => (c.must || []).includes(p.id)))).join('')}</ul></section>`;
    });
    return h;
  }
  const LVL_TXT = { 1: 'Erste echte Stücke: eine Lage, einfache Rhythmen, beide Schlüssel.', 2: 'Mehr Bewegung: Lagenwechsel, Achtel, erste Vorzeichen, Dynamik.', 3: 'Mittelstufe-Einstieg: Pedal, Akkordbegleitung, Ausdruck. Hier liegen Für Elise und viele Préludes.', 4: 'Mittelstufe: Klassik-Sonaten, Chopin, längere Formen.', 5: 'Fortgeschritten: Tempo, Virtuosität, komplexe Harmonik.', 6: 'Konzertrepertoire: deine großen Ziele.' };
  function vPiece(id) {
    const p = PBY[id]; if (!p) return `<section class="card"><p>Stück nicht gefunden.</p><a class="btn" href="#pfad">Zurück</a></section>`;
    if (!pieceOpen(p)) return `<nav class="crumb"><a href="#pfad">← Lernpfad</a></nav><section class="card framed"><div class="locknote">${SEAL}<div><h2>${esc(p.title)}</h2><p>Öffnet sich nach Lektion ${esc(p.after)}. Dann hast du alles gelernt, was du dafür brauchst.</p></div></div></section>`;
    if (PV.id !== id) { PV.id = id; PV.hand = ''; PV.range = null; PV.kbd = false; PV.names = false; }
    const ps = S.pieces[id] || {}; const steps = ps.steps || {};
    const chap = CH.find(c => (c.must || []).includes(id) || (c.more || []).includes(id));
    const isMust = chap && (chap.must || []).includes(id);
    let h = `<nav class="crumb"><a href="#pfad">← Lernpfad</a> · <a href="#stuecke">Alle Stücke</a></nav><section class="card framed"><p class="eyebrow">${esc(p.composer)}</p><h1>${esc(p.title)}</h1><p class="lead">${esc(p.cat || '')}${p.keyde ? ' · ' + esc(p.keyde) : ''}</p><div class="row">${isMust ? `<span class="chip gold">Pflichtstück Kapitel ${chap.id}</span>` : chap ? `<span class="chip">Kür · Kapitel ${chap.id}</span>` : ''}<span class="chip lvl">Notenweg-Stufe ${p.lvl}</span>${p.henle ? `<span class="chip">Henle ${esc(p.henle)}</span>` : ''}${p.bpm ? `<span class="chip">Zieltempo ♩ ≈ ${p.bpm}</span>` : ''}</div>${FLOUR}<div class="body"><p>${p.why}</p>${p.focus && p.focus.length ? `<h4>Worauf es ankommt</h4><ul>${p.focus.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}${p.henleSrc ? `<p class="small muted">Henle-Stufe: ${esc(p.henleSrc)}. „Notenweg-Stufe“ ist unsere eigene Einordnung im Lernpfad.</p>` : ''}</div></section>`;
    if (p.inApp !== false && p.measures) {
      const N = p.measures.length;
      const rg = PV.range; const a = rg ? rg[0] : 0, b = rg ? rg[1] : N - 1;
      const ms = p.measures.slice(a, b + 1).map((m, i) => i === 0 && a > 0 ? Object.assign({}, m, { key: undefined, time: undefined }) : m);
      const spec = { staves: p.staves || ['treble', 'bass'], key: keyAtStart(p, a), time: timeAtStart(p, a), measures: ms, numOffset: a + (p.pickup ? -1 : 0), tupletsUntil: p.tupletsUntil != null ? (a === 0 ? p.tupletsUntil : 1) : 2, clefInit: clefAtStart(p, a), names: PV.names ? 'all' : false, justifyLast: false };
      h += `<section class="card"><div class="ctrls"><div class="seg">${[['', 'beide'], ['treble', 'rechts'], ['bass', 'links']].map(([k, t]) => `<button class="${PV.hand === k ? 'on' : ''}" data-a="pv-hand" data-k="${k}">${t}</button>`).join('')}</div><label class="tick small"><input type="checkbox" data-f="pv-kbd"${PV.kbd ? ' checked' : ''}><span>Tastatur</span></label><label class="tick small"><input type="checkbox" data-f="pv-names"${PV.names ? ' checked' : ''}><span>Notennamen</span></label></div>
        <div class="rangebar"><span class="small">Takte</span><input type="number" id="pv-a" min="1" max="${N}" value="${a + 1}" inputmode="numeric" aria-label="von Takt"><span>–</span><input type="number" id="pv-b" min="1" max="${N}" value="${b + 1}" inputmode="numeric" aria-label="bis Takt"><button class="btn sm ghost" data-a="pv-range">Bereich</button>${rg ? '<button class="btn sm ghost" data-a="pv-all">ganzes Stück</button>' : ''}</div>`;
      h += scoreBox(spec, { play: true, bpm: p.bpm || 80, speed: true, speedDef: rg ? 0.6 : 1, countIn: true, hand: PV.hand || null, kbd: PV.kbd ? {} : null, noKeys: !PV.kbd, order: rg ? null : (p.order && p.order.length !== N ? p.order : null), follow: true, loopable: true, loop: !!rg, barTop: true, metro: true });
      h += `<p class="small muted">Bereich wählen + Schleife + 60 % = eine Stelle so oft hören, bis du sie innerlich mitsingst.${p.order && p.order.length !== N && !rg ? ' Wiederholungen werden beim Abspielen mitgespielt.' : ''} Taktnummern zählen ${p.pickup ? 'ab dem ersten vollen Takt (Auftakt = 0)' : 'ab 1'}.</p></section>`;
    }
    const pr = pDone(id);
    h += `<section class="card"><div class="row-between"><h2>Lernprotokoll</h2><span class="chip num">${pr}/8</span></div><p class="small muted">Diese acht Schritte funktionieren für jedes Stück – auch für Einaudi & Co. aus gekauften Noten.</p><ul class="proto">${PROTO.map(([k, t, d]) => `<li><label><input type="checkbox" data-f="pstep" data-p="${id}" data-k="${k}"${steps[k] ? ' checked' : ''}><span><b>${t}</b> – ${d}</span></label></li>`).join('')}</ul>
      <div class="grid2" style="margin-top:12px"><label>Aktuelles Tempo (fehlerfrei, ♩)<input type="number" inputmode="numeric" data-f="pbpm" data-p="${id}" value="${esc(ps.bpm || '')}" placeholder="z. B. 48"></label><label>Zieltempo<input type="number" inputmode="numeric" data-f="ptarget" data-p="${id}" value="${esc(ps.target || p.bpm || '')}"></label></div>
      <label style="margin-top:10px">Notizen (Fingersätze, schwierige Takte, Einstiegspunkte)<textarea data-f="pnote" data-p="${id}" rows="3">${esc(ps.note || '')}</textarea></label>
      <div class="btnrow" style="margin-top:12px"><button class="btn${dayRec().items['p:' + id] ? ' ghost' : ''}" data-a="p-today" data-p="${id}">${dayRec().items['p:' + id] ? '✓ Heute geübt' : 'Heute geübt'}</button><button class="btn ghost" data-a="p-metro">Metronom</button></div><div id="pmetro"></div></section>`;
    const links = p.links || [];
    h += `<section class="card"><h3>Noten und Quellen</h3>${links.length ? `<ul class="small">${links.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>` : ''}${p.src ? `<p class="small muted">Notentext in der App: ${esc(p.src)}</p>` : ''}${p.inApp === false ? '<p class="small muted">Diese Noten sind urheberrechtlich geschützt und deshalb nicht in der App. Kauf die Originalausgabe – mit dem Lernprotokoll oben arbeitest du genauso.</p>' : ''}</section>`;
    return h;
  }

  /* =====================================================================
     WIEDERHOLEN, FREIES TRAINING, BLATTSPIEL
     ===================================================================== */
  const RV = { phase: 'list', ids: [] };
  function vReview() {
    const due = dueList();
    let h = img('friedrich', 'short', 'Wiederholen', 'Gelerntes nach 1, 3, 7, 14 und 30 Tagen abrufen – so bleibt es.', 'Gedächtnis');
    if (RV.phase === 'run') return h + `<section class="card"><h2>Wiederholung</h2><p class="small muted">${RV.ids.length} Lektion${RV.ids.length > 1 ? 'en' : ''} · neue Aufgaben, keine bekannten.</p><div id="quiz"></div></section>`;
    const learned = Object.keys(S.srs).filter(id => LBY[id]);
    h += `<section class="card framed"><div class="row-between"><h2>${due.length ? `${due.length} fällig` : 'Alles wiederholt'}</h2>${due.length ? '<button class="btn" data-a="rv-start">Starten</button>' : ''}</div>${due.length ? `<ul class="small">${due.slice(0, 12).map(id => `<li>${LBY[id] ? `Lektion ${id}: ${esc(LBY[id].title)}` : esc(id)} <span class="muted">(Stufe ${S.srs[id].stage} von 5)</span></li>`).join('')}</ul>` : `<p class="muted">${learned.length ? 'Heute ist nichts fällig. Die nächste Wiederholung kommt am ' + fmtD(Object.values(S.srs).filter(s => s.next).map(s => s.next).sort()[0] || today()) + '.' : 'Sobald du die erste Lektion bestanden hast, erscheinen hier deine Wiederholungen.'}</p>`}</section>`;
    h += `<section class="card"><h2>Freies Training</h2><p>Alle Aufgabentypen aus bestandenen Lektionen, gemischt. Für Extra-Zeit oder zwischendurch.</p><a class="btn ghost" href="#training">Freies Training</a></section>`;
    h += `<section class="card"><h2>Blattspiel</h2><p>Kurze, neue Stücke auf deiner Stufe – nie zweimal dasselbe. Der direkteste Weg zu „Noten sehen und sofort spielen“.</p><a class="btn ghost" href="#blatt">Blattspiel</a></section>`;
    h += `<section class="card"><h3>So funktioniert die Wiederholung</h3><p class="small">Jede bestandene Lektion kommt nach <b>1, 3, 7, 14 und 30 Tagen</b> zurück, mit neuen Aufgaben. Alles richtig → nächste Stufe. Ein Fehler → gleiche Abstände noch einmal. Mehrere Fehler → zurück auf Tag 1. Nach Stufe 5 sitzt es.</p></section>`;
    return h;
  }
  function startReview() {
    const due = dueList().filter(id => LBY[id]).slice(0, 8);
    RV.ids = due; RV.phase = 'run';
    const items = [];
    due.forEach(id => { const l = LBY[id]; (l.review || []).slice(0, 3).forEach(it => items.push([it[0], it[1] || {}, 1, id])); if (!(l.review || []).length) items.push(['pool', { id: 'methode' }, 1, id]); });
    QZ.start({ kind: 'review', items, pass: 0, onDone: r => {
      const wrong = {}; due.forEach(id => wrong[id] = 0);
      r.res.filter(x => x.base && !x.ok).forEach(x => { if (x.lesson) wrong[x.lesson] = (wrong[x.lesson] || 0) + 1; });
      due.forEach(id => srsGrade(id, wrong[id]));
      dayRec().items.wdh = true; save(); RV.phase = 'list';
    } });
  }
  function vFree() {
    const learned = LES.filter(l => isDone(l.id));
    let h = `<nav class="crumb"><a href="#wdh">← Wiederholen</a></nav><section class="card framed"><p class="eyebrow">Extra-Zeit</p><h1>Freies Training</h1><p class="lead">Gemischte Aufgaben aus allem, was du bestanden hast.</p></section>`;
    if (!learned.length) return h + `<section class="card"><p class="muted">Noch keine Lektion bestanden.</p></section>`;
    h += `<section class="card"><div class="ctrls"><div class="seg">${[['mix', 'Gemischt'], ['lesen', 'Noten lesen'], ['theorie', 'Theorie'], ['ohr', 'Gehör']].map(([k, t]) => `<button class="${FREE.mode === k ? 'on' : ''}" data-a="free-mode" data-k="${k}">${t}</button>`).join('')}</div></div><div id="quiz"></div></section>`;
    return h;
  }
  const FREE = { mode: 'mix' };
  function startFree() {
    const learned = LES.filter(l => isDone(l.id));
    let items = []; learned.forEach(l => (l.review || []).forEach(it => items.push([it[0], it[1] || {}])));
    const lesen = ['noteName', 'noteKey', 'stepSkip', 'ivSize', 'keySig'], ohr = ['ivEar', 'triadEar', 'rhythmHear', 'cadence'];
    if (FREE.mode === 'lesen') items = items.filter(it => lesen.includes(it[0]));
    if (FREE.mode === 'ohr') items = items.filter(it => ohr.includes(it[0]));
    if (FREE.mode === 'theorie') items = items.filter(it => !lesen.includes(it[0]) && !ohr.includes(it[0]));
    if (!items.length) items = [['noteName', { clef: 'treble' }]];
    QZ.start({ kind: 'free', items: TH.shuffle(items), n: 12, need: 12 });
  }
  /* Blattspiel */
  const SR = { lv: null, cur: null, n: 0, ok: 0 };
  function sightLevel() { const d = LES.filter(l => isDone(l.id)).length; return d < 9 ? 1 : d < 14 ? 2 : d < 20 ? 3 : d < 28 ? 4 : d < 38 ? 5 : 6; }
  function sightBlock(lv, ctx) {
    if (!SR.cur || SR.ctx !== ctx || SR.lvSet !== lv) { SR.cur = TH.sightRead(lv); SR.ctx = ctx; SR.lvSet = lv; SR.n = 0; SR.ok = 0; }
    const x = SR.cur;
    return `<div class="sight"><p class="small muted">${esc(x.key)} · ${x.spec.time === 'C' ? '4/4' : x.spec.time}${ctx === 'l' ? '' : ` · Stufe ${lv}`} · erst 30 Sekunden ansehen (Tonart, Takt, Muster), dann einmal ohne Anhalten spielen – Metronom ♩ = ${x.bpm}.</p>${scoreBox(x.spec, { play: true, bpm: x.bpm, countIn: true, speed: true, metro: true })}<div class="btnrow" style="margin-top:10px"><button class="btn" data-a="sr-ok" data-c="${ctx}">Ohne Anhalten geschafft</button><button class="btn ghost" data-a="sr-no" data-c="${ctx}">Hängen geblieben</button></div><p class="small muted" style="margin-top:6px">${SR.n ? `Diese Runde: ${SR.ok} von ${SR.n} ohne Anhalten.` : 'Erst danach anhören und vergleichen.'}${ctx === 'l' ? ' Drei Stücke schaffen, dann geht es weiter.' : ''}</p></div>`;
  }
  function vSight() {
    const lv = SR.lv || sightLevel();
    let h = `<nav class="crumb"><a href="#wdh">← Wiederholen</a></nav><section class="card framed"><p class="eyebrow">Jeden Tag 5 Minuten</p><h1>Blattspiel</h1><p class="lead">Vom Blatt spielen heißt: nicht anhalten. Fehler sind erlaubt, Stocken nicht.</p></section><section class="card"><div class="ctrls"><span class="small">Stufe</span><div class="seg">${[1, 2, 3, 4, 5, 6].map(v => `<button class="${lv === v ? 'on' : ''}" data-a="sr-lv" data-v="${v}">${v}</button>`).join('')}</div></div>${sightBlock(lv, 'free')}</section>`;
    h += `<section class="card"><h3>Die vier Regeln</h3><ol class="small"><li>Vorher scannen: Tonart, Takt, höchster/tiefster Ton, Wiederholungen, Muster.</li><li>Langsames Tempo wählen, das du ohne Anhalten schaffst.</li><li>Augen immer einen Takt voraus, nicht auf die Hände.</li><li>Rhythmus vor Tönen: lieber ein falscher Ton im richtigen Moment als der richtige zu spät.</li></ol></section>`;
    return h;
  }

  /* =====================================================================
     WISSEN
     ===================================================================== */
  const FICON = { keys: '<svg viewBox="0 0 44 44"><rect x="4" y="10" width="36" height="24" rx="2" fill="none" stroke="currentColor"/><path d="M10 10v24M16 10v24M22 10v24M28 10v24M34 10v24" stroke="currentColor" stroke-width=".8"/><rect x="8" y="10" width="4" height="14" fill="currentColor"/><rect x="14" y="10" width="4" height="14" fill="currentColor"/><rect x="26" y="10" width="4" height="14" fill="currentColor"/><rect x="32" y="10" width="4" height="14" fill="currentColor"/></svg>', staff: '<svg viewBox="0 0 44 44"><path d="M4 14h36M4 19h36M4 24h36M4 29h36M4 34h36" stroke="currentColor" stroke-width=".8"/><ellipse cx="16" cy="26.5" rx="3.4" ry="2.4" fill="currentColor" transform="rotate(-20 16 26.5)"/><path d="M19.2 26V8" stroke="currentColor"/><ellipse cx="28" cy="21.5" rx="3.4" ry="2.4" fill="currentColor" transform="rotate(-20 28 21.5)"/><path d="M31.2 21V5" stroke="currentColor"/></svg>', chord: '<svg viewBox="0 0 44 44"><path d="M4 12h36M4 17h36M4 22h36M4 27h36M4 32h36" stroke="currentColor" stroke-width=".8"/><ellipse cx="22" cy="29.5" rx="3.4" ry="2.4" fill="currentColor"/><ellipse cx="22" cy="24.5" rx="3.4" ry="2.4" fill="currentColor"/><ellipse cx="22" cy="19.5" rx="3.4" ry="2.4" fill="currentColor"/><path d="M25.3 29V7" stroke="currentColor"/></svg>', circle: '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" fill="none" stroke="currentColor"/><circle cx="22" cy="22" r="10" fill="none" stroke="currentColor" stroke-width=".7"/><path d="M22 5v6M22 33v6M5 22h6M33 22h6M10 10l4 4M30 30l4 4M34 10l-4 4M10 34l4-4" stroke="currentColor" stroke-width=".8"/></svg>', clock: '<svg viewBox="0 0 44 44"><path d="M14 38h16l-3-28h-10z" fill="none" stroke="currentColor"/><path d="M22 34l6-20" stroke="currentColor"/><circle cx="28" cy="14" r="1.6" fill="currentColor"/></svg>', quill: '<svg viewBox="0 0 44 44"><path d="M36 6C22 8 14 18 10 34l3 1C18 22 26 14 36 6z" fill="none" stroke="currentColor"/><path d="M8 38l4-4" stroke="currentColor"/></svg>', ear: '<svg viewBox="0 0 44 44"><path d="M14 18a9 9 0 0 1 18 0c0 6-6 7-6 13a5 5 0 0 1-9 2" fill="none" stroke="currentColor"/><path d="M19 19a4 4 0 0 1 8 0c0 3-3 3-3 6" fill="none" stroke="currentColor"/></svg>', hand: '<svg viewBox="0 0 44 44"><path d="M14 36V18M14 18v-8a2 2 0 0 1 4 0v14M18 10V7a2 2 0 0 1 4 0v17M22 9a2 2 0 0 1 4 0v15M26 12a2 2 0 0 1 4 0v14c0 6-4 10-10 10h-2c-3 0-5-2-7-5l-4-7a2 2 0 0 1 3-2l4 4" fill="none" stroke="currentColor"/></svg>', pedal: '<svg viewBox="0 0 44 44"><path d="M8 30h28M14 30c0-8 4-14 8-14s8 6 8 14" fill="none" stroke="currentColor"/><rect x="18" y="30" width="8" height="6" fill="none" stroke="currentColor"/></svg>', form: '<svg viewBox="0 0 44 44"><rect x="5" y="12" width="9" height="20" fill="none" stroke="currentColor"/><rect x="17.5" y="12" width="9" height="20" fill="currentColor" fill-opacity=".25" stroke="currentColor"/><rect x="30" y="12" width="9" height="20" fill="none" stroke="currentColor"/><text x="9.5" y="26" font-size="8" text-anchor="middle" fill="currentColor">A</text><text x="22" y="26" font-size="8" text-anchor="middle" fill="currentColor">B</text><text x="34.5" y="26" font-size="8" text-anchor="middle" fill="currentColor">A</text></svg>' };
  function vWissen() {
    const open = CUR.folios.filter(f => !f.after || isDone(f.after));
    const closed = CUR.folios.length - open.length;
    let h = img('renoir1', 'short', 'Wissen', 'Alles, was du gelernt hast – auf einen Blick, zum Nachschlagen und Wiederholen.', 'Bibliothek');
    h += `<section class="card"><div class="row-between"><h2>Folien</h2><a class="btn sm ghost" href="#glossar">Fachbegriffe A–Z</a></div><p class="small muted">${open.length} freigeschaltet${closed ? ` · ${closed} warten noch im Lernpfad` : ''}.</p><ul class="folios">${CUR.folios.map(f => { const o = !f.after || isDone(f.after); return o ? `<li><a class="folio" href="#folie-${f.id}"><span class="fi">${FICON[f.icon] || FICON.staff}</span><span><b>${esc(f.title)}</b><br><small>${esc(f.sub || '')}</small></span></a></li>` : `<li><span class="folio locked"><span class="fi">${SEAL}</span><span><b>${esc(f.title)}</b><br><small>nach Lektion ${esc(f.after)}</small></span></span></li>`; }).join('')}</ul></section>`;
    return h;
  }
  function vFolio(id) {
    const f = FBY[id]; if (!f) return '<p>Folie nicht gefunden.</p>';
    if (f.after && !isDone(f.after)) return `<nav class="crumb"><a href="#wissen">← Wissen</a></nav><section class="card"><div class="locknote">${SEAL}<p>Diese Folie öffnet sich mit Lektion ${esc(f.after)}.</p></div></section>`;
    const lessons = (f.lessons || [f.after]).filter(Boolean);
    return `<nav class="crumb"><a href="#wissen">← Wissen</a></nav><section class="card framed"><p class="eyebrow">Folie</p><h1>${esc(f.title)}</h1><p class="lead">${esc(f.sub || '')}</p>${FLOUR}<div class="body">${bodyWithFigs(f.body, f.figs || [])}</div>${lessons.length ? `<p class="small muted">Ausführlich in ${lessons.map(x => LBY[x] ? `<a href="#lektion-${x}">Lektion ${x}</a>` : x).join(', ')}.</p>` : ''}</section>`;
  }
  const GL = { q: '' };
  function vGloss() {
    const open = CUR.gloss.filter(g => !g.after || isDone(g.after));
    const list = open.filter(g => !GL.q || (g.term + ' ' + g.def).toLowerCase().includes(GL.q.toLowerCase())).sort((a, b) => a.term.localeCompare(b.term, 'de'));
    const letters = [...new Set(list.map(g => g.term[0].toUpperCase()))];
    return `<nav class="crumb"><a href="#wissen">← Wissen</a></nav><section class="card framed"><p class="eyebrow">Glossar</p><h1>Fachbegriffe</h1><p class="lead">${open.length} von ${CUR.gloss.length} Begriffen gelernt.</p><input type="text" id="gl-q" placeholder="Suchen, z. B. legato" value="${esc(GL.q)}" aria-label="Begriffe durchsuchen"></section><section class="card"><div class="alpha">${letters.map(L => `<a href="#glossar" data-a="gl-jump" data-l="${L}">${L}</a>`).join('')}</div><ul class="gloss">${list.map(g => `<li id="g-${g.id}" data-l="${g.term[0].toUpperCase()}"><b>${esc(g.term)}</b><span class="cat">${esc(g.cat)}</span><div>${g.def}</div></li>`).join('') || '<li class="muted">Nichts gefunden.</li>'}</ul></section>`;
  }

  /* =====================================================================
     WINTERBALL
     ===================================================================== */
  const LIB = [];
  (typeof SONGS_HAND !== 'undefined' ? SONGS_HAND : []).forEach(s0 => LIB.push({ id: s0.id, title: s0.title, sub: s0.sub, key: s0.key, time: s0.time, bpm: s0.bpm, kind: 'hand', song: s0, why: s0.why, lhTxt: s0.lh }));
  (C2.XMAS || []).forEach(x => LIB.push({ id: x.id, title: x.title, sub: x.sub, key: x.key, time: x.time, bpm: x.bpm, kind: 'gen', song: x, src: x.src }));
  const LIBY = {}; LIB.forEach(x => LIBY[x.id] = x);
  const SG = { lvl: 1, aid: 'kbd', hand: '' };
  const SONG_ST = [['rh', 'Rechte Hand sicher'], ['l1', 'Mit Grundtönen (Stufe 1)'], ['l2', 'Mit Griffen (Stufe 2)'], ['ped', 'Mit Muster + Pedal (Stufe 3)'], ['lead', 'Aus dem Lead Sheet (nur Symbole)'], ['ready', 'Vorspielreif (3× ohne Anhalten)']];
  function songMeasures(it, lvl) {
    if (it.kind === 'gen') return C2.buildLH(it.song, lvl);
    if (lvl === 0) return it.song.levels[0].map(m => { const o = { r: m.r, chords: (m.chords || []).map(([t, sy]) => [t, C2.deSym(sy)]) }; if (m.end) o.end = m.end; return o; });
    return it.song.levels[lvl - 1].map(m => Object.assign({}, m, { chords: (m.chords || []).map(([t, sy]) => [t, C2.deSym(sy)]) }));
  }
  const bestBlitz = id => { const l = S.blitz.filter(b => b.id === id); return l.length ? Math.min(...l.map(b => b.min)) : null; };
  function vBall() {
    const bd = ballDays();
    let h = img('menzel', '', bd == null ? 'Winterball' : bd > 0 ? `Winterball in ${bd} Tagen` : bd === 0 ? 'Heute ist der Ball' : 'Winterball', 'Dein Weihnachtsprogramm – aus echten Noten, mit Akkord-Begleitung in drei Stufen.', 'Auftritt');
    if (!ballOpen()) {
      return h + `<section class="card framed"><div class="locknote">${SEAL}<div><h2>Noch versiegelt</h2><p>Der Winterball öffnet sich nach der <b>Kapitelprüfung II</b> – dann kannst du Melodien in beiden Schlüsseln lesen und im Takt spielen. Damit lernst du die Lieder in einem Bruchteil der Zeit.</p><p class="small muted">Falls der Ball früher ist: Er öffnet sich automatisch 3 Wochen vor dem Termin.</p></div></div><label style="margin-top:10px">Datum des Balls<input type="date" data-f="ball" value="${esc(S.settings.ball)}"></label></section>`;
    }
    const set = S.wbSet || ['jingle', 'wish', 'silent'];
    h += `<section class="card framed"><h2>Programm</h2><p class="small muted">Häkchen = kommt ins Programm. Drei sichere Lieder sind besser als sechs wackelige.</p>${!S.settings.ball ? `<label>Datum des Balls<input type="date" data-f="ball" value=""></label>` : ''}<ul class="wbset">${LIB.map(x => { const st = S.songs[x.id] || {}; const on = set.includes(x.id); return `<li class="${on ? 'on' : ''}"><label class="tick"><input type="checkbox" data-f="wbset" data-id="${x.id}"${on ? ' checked' : ''}><span>${esc(x.title)}</span></label><span class="dots">${SONG_ST.map(([k]) => `<i class="${st[k] ? 'on' : ''}"></i>`).join('')}</span><a class="btn sm ghost" href="#lied-${x.id}">Üben</a></li>`; }).join('')}</ul></section>`;
    const steps = [[6, 'Jingle Bells rechts aus Noten'], [5, 'Jingle Bells beide Hände Stufe 1 · We Wish You rechts · ein Bonus-Lied per Blitz-Lernen'], [4, 'Jingle Bells Stufe 2 · We Wish You Stufe 1'], [3, 'Jingle Bells mit Pedal · Stille Nacht rechts · We Wish You Stufe 2'], [2, 'Alle Programm-Lieder durchspielbar · Generalprobe 1 am Flügel (mit Aufnahme)'], [1, 'Nichts Neues mehr · 2 Generalproben vor Publikum · Anfang und Ende extra'], [0, 'Auftritt']];
    h += `<section class="card"><h2>Countdown</h2>${bd == null ? '<p class="muted small">Trag das Datum ein, dann siehst du, wo du stehen solltest.</p>' : ''}<ol class="cd">${steps.map(([wk, t]) => { const due = S.settings.ball ? addDays(S.settings.ball, -wk * 7) : null; const now = bd != null && bd <= wk * 7 && bd > (wk - 1) * 7; const id = 'wb' + wk; return `<li class="${now ? 'now' : ''}"><label><input type="checkbox" data-f="wb" data-id="${id}"${S.wb[id] ? ' checked' : ''}><span><b class="num">${wk === 0 ? 'Ball' : 'T−' + wk + ' Wo.'}</b>${due ? ` <span class="muted small">bis ${fmtD(due)}</span>` : ''} – ${esc(t)}</span></label></li>`; }).join('')}</ol></section>`;
    h += `<section class="card"><h2>Auftritt vorbereiten</h2><ul class="body small"><li><b>Am Instrument proben:</b> ab drei Wochen vorher einmal pro Woche am Flügel in der Schule – Anschlag und Pedal fühlen sich dort anders an.</li><li><b>Generalprobe wie echt:</b> Aufnahme an, einmal durch, nicht anhalten.</li><li><b>Fehler überspielen:</b> weiter, beim nächsten Takt einsteigen. Die linke Hand halten ist wichtiger als jede Melodienote.</li><li><b>Tempo:</b> am Ball etwas langsamer als zu Hause. Nervosität macht schneller.</li><li><b>Fallende Noten:</b> höchstens für ein Bonus-Stück, und nur mit den Noten daneben.</li></ul></section>`;
    h += `<p class="small muted">Alle Lieder sind gemeinfrei. Nicht gemeinfrei sind z. B. „Last Christmas“, „White Christmas“ oder „In der Weihnachtsbäckerei“ – dafür offizielle Noten kaufen.</p>`;
    return h;
  }
  const BL = { id: null, t0: 0, int: null };
  function vSong(id) {
    if (!ballOpen()) return vBall();
    const it = LIBY[id]; if (!it) return `<p>Lied nicht gefunden. <a href="#ball">Zurück</a></p>`;
    const st = S.songs[id] || {}; const lvl = SG.lvl;
    const ms = songMeasures(it, lvl);
    const staves = lvl === 0 ? ['treble'] : ['treble', 'bass'];
    let h = `<nav class="crumb"><a href="#ball">← Winterball</a></nav><section class="card framed"><p class="eyebrow">${esc(it.sub || '')}</p><h1>${esc(it.title)}</h1>${it.why ? `<p class="lead">${esc(it.why)}</p>` : ''}</section><section class="card"><div class="ctrls"><div class="seg">${[0, 1, 2, 3].map(l => `<button class="${lvl === l ? 'on' : ''}" data-a="sg-lvl" data-l="${l}">${l === 0 ? 'Lead Sheet' : 'Links ' + l}</button>`).join('')}</div><div class="seg">${[['all', 'Namen + Tasten'], ['kbd', 'Tasten'], ['none', 'nur Noten']].map(([k, t]) => `<button class="${SG.aid === k ? 'on' : ''}" data-a="sg-aid" data-k="${k}">${t}</button>`).join('')}</div>${staves.length > 1 ? `<div class="seg">${[['', 'beide'], ['treble', 'rechts'], ['bass', 'links']].map(([k, t]) => `<button class="${SG.hand === k ? 'on' : ''}" data-a="sg-hand" data-k="${k}">${t}</button>`).join('')}</div>` : ''}</div><p class="small muted">${esc(it.kind === 'hand' && lvl > 0 ? it.lhTxt[lvl - 1] : C2.LVL_TXT[lvl])}</p>`;
    h += scoreBox({ staves, key: it.key, time: it.time, measures: ms, names: SG.aid === 'all' ? 'all' : false }, { play: true, bpm: it.bpm, kbd: SG.aid !== 'none' ? {} : null, speed: true, speedDef: 0.6, countIn: true, hand: SG.hand || null, noKeys: SG.aid === 'none', loopable: true, barTop: true, metro: true });
    h += `</section>`;
    const runs = S.blitz.filter(b => b.id === id);
    h += BL.id === id ? `<section class="card gold"><h2>⚡ Blitz-Lernen läuft</h2><p class="bigtime" id="bl-time">0:00</p><ol class="small"><li>Tonart, Takt, Akkorde überfliegen</li><li>Melodie rechts</li><li>Links Stufe ${SG.lvl || 1} dazu</li><li>Einmal ohne Anhalten durch – dann „Geschafft“</li></ol><div class="btnrow"><button class="btn" data-a="bl-done">Geschafft</button><button class="btn ghost" data-a="bl-cancel">Abbrechen</button></div></section>` : `<section class="card"><div class="row-between"><h2>⚡ Blitz-Lernen</h2><button class="btn sm" data-a="bl-start">Start</button></div><p class="small muted">Stoppuhr an und das Lied so schnell wie möglich lernen – bis zum ersten Durchlauf ohne Anhalten. Diese Zeit sinkt von Lied zu Lied: der Messwert für „Noten sehen, schnell lernen“.</p>${runs.length ? `<p class="small">Deine Zeiten: ${runs.slice(-5).map(b => `<span class="num">${b.min.toFixed(1)} Min. (Stufe ${b.lvl})</span>`).join(' · ')}</p>` : ''}</section>`;
    h += `<section class="card"><h2>Stand</h2><ul class="checks">${SONG_ST.map(([k, t]) => `<li><label><input type="checkbox" data-f="song" data-s="${id}" data-k="${k}"${st[k] ? ' checked' : ''}><span>${t}</span></label></li>`).join('')}</ul>${it.src ? `<p class="small muted">Quelle: ${esc(it.src)}</p>` : ''}</section>`;
    return h;
  }

  /* =====================================================================
     PROFIL, WERKZEUGE
     ===================================================================== */
  function weekMins(offset = 0) { let m = 0, d = 0; for (let i = 0; i < 7; i++) { const r = S.days[addDays(today(), -i - offset * 7)]; if (r && (r.min || Object.keys(r.items || {}).length)) { d++; m += r.min || 0; } } return { m, d }; }
  function streak() { let n = 0; for (let i = 0; i < 400; i++) { const r = S.days[addDays(today(), -i)]; if (r && (r.min || Object.keys(r.items || {}).length)) n++; else if (i > 0) break; } return n; }
  function report() {
    const c = curChapter(); const w = weekMins(); const done = LES.filter(l => isDone(l.id));
    const last7 = done.filter(l => diffDays(today(), S.done[l.id].d) < 7);
    const q7 = S.quiz.filter(x => diffDays(today(), x.d) < 7);
    const acc = q7.length ? Math.round(q7.filter(x => x.ok).length / q7.length * 100) : null;
    const pieces = PIECES.filter(p => pDone(p.id) > 0).map(p => `${p.title}: ${pDone(p.id)}/8${(S.pieces[p.id] || {}).bpm ? ` · ♩ ${S.pieces[p.id].bpm}/${S.pieces[p.id].target || p.bpm}` : ''}`);
    const sr = S.sight.filter(x => diffDays(today(), x.d) < 7);
    const nl = nextLesson();
    const byG = {}; q7.forEach(x => { const g = byG[x.g] = byG[x.g] || [0, 0]; g[0] += x.ok ? 1 : 0; g[1]++; });
    const weak = Object.entries(byG).filter(([, v]) => v[1] >= 3 && v[0] / v[1] < 0.85).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).slice(0, 4).map(([g, v]) => `${g} ${v[0]}/${v[1]}`);
    const ex = CH.filter(x => S.exams[x.id]).map(x => `${x.id} ${Math.round((S.exams[x.id].score || 0) * 100)} %${S.exams[x.id].pass ? '' : ' (nicht bestanden)'}`);
    return [`Notenweg-Wochenbericht (${fmtD(addDays(today(), -6))}–${fmtD(today())}) · App ${window.NW_BUILD || ''}`, `Kapitel ${c.id} (${c.title}) · Lektionen bestanden: ${done.length}/${LES.length} · diese Woche: ${last7.map(l => `${l.id}${S.done[l.id].skip ? ' (Abkürzung)' : S.done[l.id].score != null ? ' ' + Math.round(S.done[l.id].score * 100) + ' %' : ''}`).join(', ') || 'keine'}`, nl ? `Als Nächstes: Lektion ${nl.id} „${nl.title}“, Schritt ${Math.min((S.stepAt[nl.id] || 0) + 1, nl.steps.length)} von ${nl.steps.length}` : '', ex.length ? `Kapitelprüfungen: ${ex.join(', ')}` : '', `Übetage: ${w.d}/7 · Minuten: ${w.m} (Vorwoche: ${weekMins(1).d} Tage, ${weekMins(1).m} Min.)`, `Aufgaben diese Woche: ${q7.length}${acc != null ? ` · Trefferquote ${acc} %` : ''}${weak.length ? ` · schwach: ${weak.join(', ')}` : ''}`, `Wiederholungen fällig: ${dueList().length}${dueList().length ? ' (' + dueList().join(', ') + ')' : ''}`, `Blattspiel: ${sr.length} Stücke, davon ${sr.filter(x => x.ok).length} ohne Anhalten`, `Stücke: ${pieces.join(' | ') || 'noch keins begonnen'}`, S.blitz.length ? `Blitz-Lernen: ${S.blitz.slice(-3).map(b => b.min.toFixed(1) + ' Min.').join(', ')}` : '', S.settings.ball ? `Winterball: ${ballDays()} Tage` : ''].filter(Boolean).join('\n');
  }
  function vProfil() {
    const done = LES.filter(l => isDone(l.id)).length; const w = weekMins();
    const exams = CH.filter(examPassed).length;
    const ready = PIECES.filter(p => pAtLeast(p.id, 'reif')).length;
    let h = `<section class="card framed"><p class="eyebrow">Fortschritt</p><h1>Dein Stand</h1>${FLOUR}<div class="kpis"><div class="kpi"><b>${done}</b><span>von ${LES.length} Lektionen</span></div><div class="kpi"><b>${exams}</b><span>von ${CH.length} Kapiteln</span></div><div class="kpi"><b>${streak()}</b><span>Tage in Folge</span></div><div class="kpi"><b>${w.m}</b><span>Minuten (7 Tage)</span></div><div class="kpi"><b>${ready}</b><span>Stücke vorspielreif</span></div><div class="kpi"><b>${S.sight.filter(x => x.ok).length}</b><span>Blattspiel-Stücke</span></div></div></section>`;
    h += `<section class="card"><h2>Wochenbericht für deinen Coach</h2><p class="small muted">Kopieren und in einen Chat mit Claude einfügen – dann bekommst du eine Auswertung und den Plan für die nächste Woche.</p><textarea rows="8" readonly id="rep">${esc(report())}</textarea><div class="btnrow" style="margin-top:8px"><button class="btn sm" data-a="copy-rep">Kopieren</button></div></section>`;
    h += `<section class="card"><h2>Einstellungen</h2><div class="grid2"><label>Datum des Winterballs<input type="date" data-f="ball" value="${esc(S.settings.ball)}"></label></div></section>`;
    h += `<section class="card"><h2>Werkzeuge</h2><div class="btnrow"><a class="btn ghost" href="#werkzeuge">Metronom</a><a class="btn ghost" href="#blatt">Blattspiel</a><a class="btn ghost" href="#training">Freies Training</a><a class="btn ghost" href="#stuecke">Alle Stücke</a></div></section>`;
    h += `<section class="card"><h3>Gesund üben</h3><p class="small">Blöcke von 20–30 Minuten, dazwischen 3–5 Minuten Pause. Nie länger als 60 Minuten ohne Pause. Pro Tag höchstens etwa 2,5–3 Stunden aktives Spielen, deutlich unter 20 Stunden pro Woche. Schmerz, Taubheit oder Kribbeln: sofort aufhören und bei anhaltenden Beschwerden ärztlich abklären lassen (Musikermedizin).</p></section>`;
    h += `<section class="card"><h3>Quellen</h3><p class="small">Notentexte (Quelle und Lizenz stehen bei jedem Stück): Mutopia Project (gemeinfrei bzw. CC-Lizenzen); Craig Stuart Sapp, Humdrum-Editionen von Beethoven, Mozart, Haydn, Scarlatti, Chopin und Joplin (kernScores, Stanford CCARH, CC BY-NC-SA 4.0); Fryderyk-Chopin-Institut, digitale Erstausgaben (CC BY 4.0); Digital and Cognitive Musicology Lab der EPFL, DCML-Korpora zu Schumann, Tschaikowsky, Grieg, Debussy und Liszt (CC BY-NC-SA 4.0). Vorschlagsnoten kann der Notensatz noch nicht zeigen; wo welche fehlen, steht es beim Stück. Gemälde: Michael Ancher, Pierre-Auguste Renoir, Adolph Menzel, Caspar David Friedrich – gemeinfrei, Reproduktionen über Standard Ebooks. Fingersätze in Lektionen sind Vorschläge.</p></section>`;
    h += dataHTML();
    return h;
  }
  function dataHTML() {
    return `<section class="card" id="daten"><h2>Deine Daten</h2><p class="small muted" id="syncnote"></p>
      <div class="btnrow"><button class="btn" data-a="exp-do">Sicherung exportieren</button><label class="btn ghost filebtn">Sicherung importieren<input type="file" accept="application/json,.json,text/plain" data-f="imp-file" hidden></label></div>
      <div id="imp-confirm"></div>
      <p class="small muted" style="margin-top:10px">Die Sicherung ist eine kleine Datei. Leg sie in „Dateien“ ab, dann kannst du deinen Stand jederzeit zurückholen oder auf ein neues Gerät mitnehmen.</p>
      <details class="more"><summary>Alles zurücksetzen</summary><p class="small">Löscht deinen gesamten Fortschritt auf diesem Gerät. Exportiere vorher eine Sicherung, wenn du ihn behalten willst.</p><button class="btn sm ghost" data-a="reset-ask">Zurücksetzen …</button><span id="reset-confirm"></span></details>
      <p class="small muted" style="margin-top:12px">Notenweg · Version ${esc(window.NW_BUILD || '')}</p></section>`;
  }
  /* ----- Export / Import ----- */
  const IMP = { data: null };
  function exportFile() {
    flush();
    const body = JSON.stringify({ app: 'notenweg', format: 1, exportedAt: new Date().toISOString(), state: S }, null, 1);
    const name = `notenweg-sicherung-${today()}.json`;
    let file = null; try { file = new File([body], name, { type: 'application/json' }); } catch (e) { }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Notenweg-Sicherung' }).then(() => toast('Sicherung exportiert.')).catch(e => { if (e && e.name !== 'AbortError') dl(); });
    } else dl();
    function dl() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('Sicherung gespeichert.'); }
  }
  /* Strenge Prüfung: nur echte Notenweg-Sicherungen werden angenommen. */
  function checkImport(txt) {
    let o; try { o = JSON.parse(txt); } catch (e) { return { err: 'Die Datei ist kein gültiges JSON. Wähle eine Datei, die Notenweg exportiert hat.' }; }
    if (o && o.app === 'notenweg' && o.state) o = o.state;
    else if (o && o.app && o.app !== 'notenweg') return { err: 'Das ist eine Sicherung einer anderen App (' + esc(String(o.app)) + ').' };
    const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
    if (!isObj(o) || typeof o.v !== 'number' || o.v < 3 || o.v > 99) return { err: 'In der Datei steckt kein Notenweg-Fortschritt.' };
    for (const k of ['done', 'stepAt', 'srs']) if (o[k] != null && !isObj(o[k])) return { err: 'Die Sicherung ist beschädigt (Feld „' + k + '“).' };
    for (const k of ['quiz', 'sight', 'blitz']) if (o[k] != null && !Array.isArray(o[k])) return { err: 'Die Sicherung ist beschädigt (Feld „' + k + '“).' };
    for (const [id, d] of Object.entries(o.done || {})) if (!isObj(d) || !/^\d+\.\d+$/.test(id)) return { err: 'Die Sicherung ist beschädigt (Lektion „' + esc(id) + '“).' };
    return { state: fill(JSON.parse(JSON.stringify(o))) };
  }
  function importSummary(st) {
    const n = Object.keys(st.done || {}).length; const ex = Object.values(st.exams || {}).filter(x => x && x.pass).length;
    const days = Object.keys(st.days || {}).sort(); const last = days[days.length - 1];
    return `${n} Lektion${n === 1 ? '' : 'en'} bestanden · ${ex} Kapitel · ${Object.keys(st.pieces || {}).length} Stücke begonnen${last ? ' · zuletzt geübt am ' + fmtD(last) : ''}`;
  }
  function vTools() {
    return `<nav class="crumb"><a href="#profil">← Fortschritt</a></nav><section class="card framed"><p class="eyebrow">Werkzeug</p><h1>Metronom</h1>${metronomeHTML()}</section><section class="card"><h2>Begleiter</h2><p class="small muted">Die linke Hand in Schleife – Tonart, Akkordfolge und Muster wählen und rechts dazu improvisieren.</p>${bgHTML()}</section><section class="card"><h3>Tempo-Treppe</h3><p class="small">Start bei 55 % des Zieltempos. Dreimal hintereinander fehlerfrei → +4. Ein Fehler → eine Stufe zurück. So wird es schnell, ohne dass sich Fehler einschleifen.</p></section>`;
  }
  /* ----- Begleiter: linke Hand in Schleife, rechts improvisieren ----- */
  const BG = { n: 0, minor: false, prog: 'pop', pat: 'neo', bpm: 72, on: false };
  const BG_PROGS = {
    maj: [['pop', 'I – V – vi – IV (Pop)', [0, 4, 5, 3]], ['sad', 'vi – IV – I – V (Neoklassik)', [5, 3, 0, 4]], ['cad', 'I – IV – V – I (Kadenz)', [0, 3, 4, 0]], ['canon', 'Kanon (Pachelbel)', [0, 4, 5, 2, 3, 0, 3, 4]], ['jazz', 'ii – V – I – I', [1, 4, 0, 0]]],
    min: [['minor', 'i – VI – III – VII', [0, 5, 2, 6]], ['mcad', 'i – iv – V – i', [0, 3, 4, 0]], ['epic', 'i – VII – VI – V', [0, 6, 5, 4]]]
  };
  const BG_PATS = [['neo', 'Neoklassik 1-5-8-10'], ['b158', 'Gebrochen 1-5-8'], ['alberti', 'Alberti'], ['block', 'Blockakkorde'], ['walzer', 'Walzer (3/4)']];
  function bgChords() {
    const list = BG_PROGS[BG.minor ? 'min' : 'maj']; let pr = list.find(p => p[0] === BG.prog); if (!pr) { pr = list[0]; BG.prog = pr[0]; }
    return pr[2].map(d => { const c = TH.degreeChord(BG.n, BG.minor, d, d === 4); return Object.assign({ deg: TH.romOf(d, c.type) }, c); });
  }
  function bgEvents(chords) {
    const ev = [], ped = []; let t = 0, prev = null; const bar = BG.pat === 'walzer' ? 3 : 4;
    chords.forEach((c, ci) => {
      const ms = c.notes.map(TH.midiOf); let root = ms[0]; while (root > 51) root -= 12; while (root < 40) root += 12;
      const third = (ms[1] - ms[0] + 120) % 12, fifth = (ms[2] - ms[0] + 120) % 12;
      // Griff in nächster Lage (zwischen etwa c und e¹)
      let best = null, bd = 1e9;
      for (let inv = 0; inv < 3; inv++) { let v = ms.slice(inv).concat(ms.slice(0, inv).map(x => x + 12)); while (v[0] < 48) v = v.map(x => x + 12); while (v[0] > 59) v = v.map(x => x - 12); const d = prev ? v.reduce((a, x, i) => a + Math.abs(x - prev[i]), 0) : Math.abs(v[0] - 52); if (d < bd) { bd = d; best = v; } }
      prev = best;
      const add = (dt, m, d) => ev.push({ t: t + dt, m, d, ci });
      ped.push({ t, k: ci === 0 ? 'd' : 'c' });
      if (BG.pat === 'neo') [0, fifth, 12, 12 + third, 12, fifth, 12, fifth].forEach((iv, i) => add(i * 0.5, [root + iv], 0.48));
      else if (BG.pat === 'b158') [0, fifth, 12, fifth, 0, fifth, 12, fifth].forEach((iv, i) => add(i * 0.5, [root + iv], 0.48));
      else if (BG.pat === 'alberti') [0, 2, 1, 2, 0, 2, 1, 2].forEach((ix, i) => add(i * 0.5, [best[ix]], 0.48));
      else if (BG.pat === 'block') { add(0, [root - 12 >= 28 ? root - 12 : root].concat(best), 3.9); }
      else { add(0, [root], 0.95); add(1, best, 0.9); add(2, best, 0.9); }
      t += bar;
    });
    return { ev, ped, len: t };
  }
  function bgHTML() {
    const ch = bgChords();
    const [l, a] = TH.keyOfN(BG.n, BG.minor); const sc = TH.scale(l, a, BG.minor, BG.minor ? 'harm' : 'nat', 4).map(x => TH.midiOf(x) % 12);
    const pcs = new Set(sc); const marks = {}; for (let m = 60; m <= 84; m++) if (pcs.has(m % 12)) marks[m] = { cls: 'hl2' };
    const keys = []; [false, true].forEach(mi => { for (let n = -4; n <= 4; n++) keys.push([n + '|' + (mi ? 1 : 0), TH.keyLabel(n, mi)]); });
    return `<div class="bgtool"><div class="grid3"><label>Tonart<select data-f="bg-key">${keys.map(([v, t]) => `<option value="${v}"${v === BG.n + '|' + (BG.minor ? 1 : 0) ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
      <label>Akkordfolge<select data-f="bg-prog">${BG_PROGS[BG.minor ? 'min' : 'maj'].map(p => `<option value="${p[0]}"${BG.prog === p[0] ? ' selected' : ''}>${esc(p[1])}</option>`).join('')}</select></label>
      <label>Muster<select data-f="bg-pat">${BG_PATS.map(([k, t]) => `<option value="${k}"${BG.pat === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label></div>
      <div class="bgchords">${ch.map((c, i) => `<div class="bgc" data-ci="${i}"><b>${esc(c.sym)}</b><span class="small muted">${esc(c.deg)}</span></div>`).join('')}</div>
      <div class="kbdbox" id="bgkbd">${Kbd.render({ from: 36, to: 84, width: 760, labels: 'c', marks })}</div>
      <div class="btnrow" style="justify-content:space-between;align-items:center"><button class="btn" data-a="bg-play">${BG.on ? '■ Stopp' : '▶︎ Start'}</button><label class="small">Tempo <select data-f="bg-bpm">${[50, 60, 72, 84, 96, 108].map(b => `<option${BG.bpm === b ? ' selected' : ''}>${b}</option>`).join('')}</select></label></div>
      <p class="small muted">${esc(TH.keyLabel(BG.n, BG.minor))} · blau markiert: die Töne der Tonleiter für die rechte Hand. Tipp: lange Töne, Akkordtöne auf Schlag 1, Pausen lassen.</p></div>`;
  }
  function bgPlay() {
    const btn = () => $('[data-a="bg-play"]');
    if (BG.on) { BG.on = false; stopPlay(true); if (btn()) btn().textContent = '▶︎ Start'; return; }
    BG.on = true; if (btn()) btn().textContent = '■ Stopp';
    const run = () => {
      if (!BG.on || !$('#bgkbd')) { BG.on = false; return; }
      const one = bgEvents(bgChords()); const ev = [], ped = [];
      for (let r = 0; r < 4; r++) { one.ev.forEach(e => ev.push(Object.assign({}, e, { t: e.t + r * one.len, v: 0.5 }))); one.ped.forEach(p2 => ped.push({ t: p2.t + r * one.len, k: r === 0 || p2.k !== 'd' ? p2.k : 'c' })); }
      play(ev, { bpm: BG.bpm, pedals: ped, onNote: (e, on) => { if (on) $$('.bgc').forEach(x => x.classList.toggle('on', +x.dataset.ci === e.ci)); e.m.forEach(m => $$(`#bgkbd [data-m="${m}"]`).forEach(k => k.classList.toggle('on-lh', on))); }, onEnd: man => { $$('#bgkbd .on-lh').forEach(k => k.classList.remove('on-lh')); if (!man && BG.on) run(); else { BG.on = false; if (btn()) btn().textContent = '▶︎ Start'; } } });
    };
    run();
  }
  function toolHTML(tool, s) {
    if (tool === 'metro') return metronomeHTML();
    if (tool === 'circle') return `<div style="color:var(--ink)">${circleSVG(-1)}</div>`;
    if (tool === 'begleiter') return bgHTML();
    return '';
  }

  /* =====================================================================
     NACH DEM RENDERN & EREIGNISSE
     ===================================================================== */
  function afterMount(h) {
    setSync();
    if ($('#quiz')) {
      if (h.startsWith('lektion-')) { const l = LBY[h.slice(8)]; if (l) { if (LV.mode === 'skiptest') { if (!QZ.run) { QZ.start({ kind: 'test', items: lessonTestItems(l), pass: 0.9 }); } } else { const s = l.steps[LV.step]; if (s && ['ex', 'mix', 'test'].includes(s.t) && (!stepComplete(l, LV.step) || LV.again) && !QZ.run) startStepQuiz(l, LV.step); LV.again = false; } } }
      if (h.startsWith('pruefung-') && !QZ.run) { const c = CH.find(x => x.id === h.slice(9)); if (c) startExam(c, EX.phase === 'placement'); }
      if (h === 'wdh' && RV.phase === 'run' && !QZ.run) startReview();
      if (h === 'training' && !QZ.run) startFree();
      drawQuiz();
    }
    if (h.startsWith('lektion-') && LV.mode !== 'intro') { const el = $('.stepcard'); }
  }
  function lessonTestItems(l) { const ts = l.steps.filter(s => s.t === 'test'); return ts.length ? ts.flatMap(t => t.gens) : (l.review || []).map(it => [it[0], it[1] || {}, 2]); }

  // Klick-Aktionen
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-a]');
    if (t) { const a = t.dataset.a; if (ACT[a]) { e.preventDefault(); ACT[a](t, e); } return; }
    // Taste auf der Quiz-Tastatur
    const key = e.target.closest('.tapkbd .key');
    if (key) { onKeyTap(key); return; }
    // Note antippen -> hören
    const nt = e.target.closest('.score .nt');
    if (nt) { const box = nt.closest('.scorebox'); const r = box && REG[box.dataset.k]; if (r && r.res) { const ev = r.res.events.find(x => x.ids.includes(nt.id)); if (ev) play([{ t: 0, m: ev.midis, d: 1 }], { bpm: 60 }); } }
    const kk = e.target.closest('.kbd .key');
    if (kk && !kk.closest('.tapkbd')) { const m = +kk.dataset.m; play([{ t: 0, m: [m], d: 1 }], { bpm: 60 }); }
  });
  function onKeyTap(key) {
    const q = QZ.cur(); const run = QZ.run; if (!q || !run || run.answered) return;
    const m = +key.dataset.m;
    Sound.init(); play([{ t: 0, m: [m], d: 0.8 }], { bpm: 60 });
    if (q.input === 'key') {
      const ok = q.answer.midi != null ? m === q.answer.midi : ((m % 12) + 12) % 12 === q.answer.pc;
      key.classList.add(ok ? 'good' : 'bad');
      if (!ok) { const box = key.closest('.kbdbox'); $$('.key', box).forEach(k2 => { const mm = +k2.dataset.m; if (q.answer.midi != null ? mm === q.answer.midi : ((mm % 12) + 12) % 12 === q.answer.pc) k2.classList.add('good'); }); }
      QZ.answer(ok); showFb(q, ok);
    } else if (q.input === 'keys') {
      if (run.sel.has(m)) { run.sel.delete(m); key.classList.remove('sel'); } else { run.sel.add(m); key.classList.add('sel'); }
    }
  }
  function showFb(q, ok, extra) { const fb = $('#qfb'); if (fb) { fb.innerHTML = feedbackHTML(q, ok, extra || ''); const nb = $('#qnext'); if (nb) nb.focus({ preventScroll: true }); } $$('.ans').forEach(b => b.disabled = true); if (q.play && ok && !q.listen && q.input !== 'tap') play(q.play, { bpm: 72 }); }
  /* Klopf-Aufgabe */
  const TAP = { t0: 0, taps: [], timer: null, on: false };
  function tapStart(q) {
    const ctx = Sound.init(); if (!ctx) return;
    const a = q.answer; const spb = 60 / a.bpm; const L = a.bar;
    const startAudio = ctx.currentTime + 0.15; const firstBeat = startAudio + L * spb;
    for (let b = 0; b < L + Math.ceil(a.total); b++) Sound.click(startAudio + b * spb, b % L === 0);
    TAP.t0 = performance.now() + (firstBeat - ctx.currentTime) * 1000; TAP.taps = []; TAP.on = true;
    const btn = $('#tapbtn'); if (btn) btn.textContent = 'Zähl mit … dann klopfen';
    clearTimeout(TAP.timer);
    TAP.timer = setTimeout(() => tapEval(q), (firstBeat - ctx.currentTime + (a.total + 0.6) * spb) * 1000);
  }
  function tapEval(q) {
    TAP.on = false; const a = q.answer; const spb = 60 / a.bpm * 1000;
    const taps = TAP.taps.map(x => (x - TAP.t0) / spb);
    const used = new Set(); let hit = 0; const marks = [];
    a.onsets.forEach(o => { let best = -1, bd = 1e9; taps.forEach((x, i) => { if (used.has(i)) return; const d = Math.abs(x - o); if (d < bd) { bd = d; best = i; } }); if (best >= 0 && bd <= 0.22) { used.add(best); hit++; marks.push(true); } else marks.push(false); });
    const extra = taps.length - used.size;
    const ok = hit / a.onsets.length >= 0.8 && extra <= 1;
    const res = $('#tapres'); if (res) res.innerHTML = marks.map((m, i) => `<i class="${m ? 'ok' : 'no'}">${i + 1}</i>`).join('');
    const btn = $('#tapbtn'); if (btn) { btn.textContent = ok ? 'Im Takt!' : 'Nochmal hören?'; btn.disabled = true; }
    QZ.answer(ok); showFb(q, ok, `<div class="small">${hit} von ${a.onsets.length} Noten getroffen${extra > 0 ? `, ${extra} Schlag zu viel` : ''}.</div>`);
  }
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('#tapbtn'); if (!b) return;
    const q = QZ.cur(); if (!q || q.input !== 'tap' || QZ.run.answered) return;
    e.preventDefault();
    if (!TAP.on) { tapStart(q); return; }
    TAP.taps.push(performance.now()); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 90);
  });

  const ACT = {
    'bg-play': () => bgPlay(),
    'score-play': t => playScore(t.dataset.k, t),
    'q-ans': t => { const q = QZ.cur(); if (!q || QZ.run.answered) return; const c = q.choices[+t.dataset.i]; t.classList.add(c.ok ? 'ok' : 'no'); if (!c.ok) $$('.ans').forEach((b, i) => { if (q.choices[i].ok) b.classList.add('ok'); }); QZ.answer(c.ok); showFb(q, c.ok); },
    'q-check': () => { const q = QZ.cur(); const run = QZ.run; if (!q || run.answered) return; const pcs = [...new Set([...run.sel].map(m => ((m % 12) + 12) % 12))].sort((a, b) => a - b); const want = [...new Set(q.answer.pcs)].sort((a, b) => a - b); const ok = pcs.join() === want.join(); $$('.tapkbd .key').forEach(k => { const m = +k.dataset.m; const pc = ((m % 12) + 12) % 12; if (run.sel.has(m)) k.classList.add(want.includes(pc) ? 'good' : 'bad'); }); if (!ok) { const box = $('.tapkbd'); const from = +box.dataset.from; want.forEach(pc => { const m0 = $$('.key', box).map(k => +k.dataset.m).find(m => ((m % 12) + 12) % 12 === pc && m >= 60) || $$('.key', box).map(k => +k.dataset.m).find(m => ((m % 12) + 12) % 12 === pc); const el = $(`.key[data-m="${m0}"]`, box); if (el && !run.sel.has(m0)) el.classList.add('good'); }); } if (run.sel.size) play([{ t: 0, m: [...run.sel], d: 1.4 }], { bpm: 60 }); QZ.answer(ok); showFb(q, ok); },
    'q-clear': () => { const run = QZ.run; if (!run) return; run.sel.clear(); $$('.tapkbd .key').forEach(k => k.classList.remove('sel')); },
    'q-next': () => { QZ.next(); drawQuiz(); const box = $('#quiz'); if (box) { const r = box.getBoundingClientRect(); if (r.top < 70 || r.top > window.innerHeight * 0.6) box.scrollIntoView({ block: 'start', behavior: 'smooth' }); } },
    'q-listen': () => { const q = QZ.cur(); if (q && q.listen) play(q.listen, { bpm: q.listenBpm || 72, countIn: q.countIn || 0 }); },
    'q-play': () => { const q = QZ.cur(); if (q && q.play) play(q.play, { bpm: 72 }); },
    'tap-hit': () => { },
    'test-retry': () => { const h = location.hash; QZ.reset(); if (h.startsWith('#pruefung-')) { EX.phase = EX.phase === 'placement' ? 'placement' : 'theory'; } rerender(); },
    'ex-start': () => { LV.again = true; QZ.reset(); rerender(); },
    'l-begin': () => { LV.started = true; LV.mode = 'steps'; LV.step = Math.min(S.stepAt[LV.id] || 0, LBY[LV.id].steps.length - 1); rerender(); },
    'l-skip': () => { LV.mode = 'skiptest'; QZ.reset(); rerender(); },
    'l-go': t => { LV.step = +t.dataset.i; LV.mode = 'steps'; LV.started = true; QZ.reset(); route(); },
    'l-prev': () => { LV.step = Math.max(0, LV.step - 1); QZ.reset(); route(); },
    'l-next': () => {
      const l = LBY[LV.id]; if (!l) return;
      if (!stepComplete(l, LV.step)) return;
      const s = l.steps[LV.step];
      if (s.t === 'read' || s.t === 'sum' || s.t === 'piece' || s.t === 'tool' || s.t === 'listen' || s.t === 'piano') { S.stepAt[l.id] = Math.max(S.stepAt[l.id] || 0, LV.step + 1); dayRec().items.lern = true; save(); }
      if (LV.step >= l.steps.length - 1) {
        if (!isDone(l.id)) { const sc = QZ.run && QZ.run.done ? QZ.run.done.score : null; completeLesson(l, sc); }
        QZ.reset(); $('#view').innerHTML = `<nav class="crumb"><a href="#pfad">← Lernpfad</a></nav>` + lessonDoneHTML(l); window.scrollTo(0, 0); return;
      }
      LV.step++; QZ.reset(); route();
    },
    'ch-toggle': t => { const id = t.dataset.c; CHOPEN[id] = !CHOPEN[id]; rerender(); },
    'einstufung': t => { location.hash = '#pruefung-' + t.dataset.c; EX.ch = t.dataset.c; EX.phase = 'placement'; QZ.reset(); setTimeout(rerender, 0); },
    'exam-play': () => { EX.phase = 'play'; QZ.reset(); rerender(); },
    'exam-theory': () => { EX.phase = 'theory'; QZ.reset(); rerender(); },
    'rv-start': () => { RV.phase = 'run'; QZ.reset(); rerender(); },
    'free-mode': t => { FREE.mode = t.dataset.k; QZ.reset(); rerender(); },
    'sr-lv': t => { SR.lv = +t.dataset.v; SR.cur = null; rerender(); },
    'sr-ok': t => sightDone(true, t.dataset.c), 'sr-no': t => sightDone(false, t.dataset.c),
    'pv-hand': t => { PV.hand = t.dataset.k; rerender(); },
    'pv-range': () => { const p = PBY[PV.id]; const N = p.measures.length; let a = Math.max(1, Math.min(N, +$('#pv-a').value || 1)), b = Math.max(1, Math.min(N, +$('#pv-b').value || N)); if (b < a) [a, b] = [b, a]; PV.range = [a - 1, b - 1]; rerender(); },
    'pv-all': () => { PV.range = null; rerender(); },
    'p-today': t => { const id = t.dataset.p; const d = dayRec(); d.items['p:' + id] = !d.items['p:' + id]; save(); rerender(); },
    'p-metro': () => { const el = $('#pmetro'); if (el) el.innerHTML = el.innerHTML ? '' : `<div style="margin-top:12px">${metronomeHTML()}</div>`; },
    'sg-lvl': t => { SG.lvl = +t.dataset.l; rerender(); }, 'sg-aid': t => { SG.aid = t.dataset.k; rerender(); }, 'sg-hand': t => { SG.hand = t.dataset.k; rerender(); },
    'bl-start': () => { const id = location.hash.slice(6); BL.id = id; BL.t0 = Date.now(); clearInterval(BL.int); BL.int = setInterval(() => { const el = $('#bl-time'); if (!el) return; const s = Math.floor((Date.now() - BL.t0) / 1000); el.textContent = `${Math.floor(s / 60)}:${pad2(s % 60)}`; }, 500); rerender(); },
    'bl-done': () => { const min = (Date.now() - BL.t0) / 60000; S.blitz.push({ d: today(), id: BL.id, min: Math.round(min * 10) / 10, lvl: SG.lvl }); clearInterval(BL.int); BL.id = null; save(); toast(`${min.toFixed(1)} Minuten – eingetragen.`); rerender(); },
    'bl-cancel': () => { clearInterval(BL.int); BL.id = null; rerender(); },
    'mt-toggle': () => mtToggle(), 'mt-step': t => mtSet(MT.bpm + +t.dataset.d), 'mt-beats': t => { MT.beats = +t.dataset.v; const was = MT.on; if (was) mtToggle(); const el = t.closest('.metro'); if (el) el.outerHTML = metronomeHTML(); if (was) mtToggle(); },
    'mt-tap': () => { const n = performance.now(); MT.taps = MT.taps.filter(x => n - x < 3000); MT.taps.push(n); if (MT.taps.length >= 3) { const d = (MT.taps[MT.taps.length - 1] - MT.taps[0]) / (MT.taps.length - 1); mtSet(60000 / d); } },
    'sess': () => sessToggle(),
    'copy-rep': () => { const el = $('#rep'); try { navigator.clipboard.writeText(el.value).then(() => toast('Kopiert.')).catch(() => { el.select(); toast('Markiert – jetzt kopieren.'); }); } catch (e) { el.select(); } },
    'reset-ask': () => { $('#reset-confirm').innerHTML = ` <button class="btn sm" data-a="reset-do" style="background:var(--bad);border-color:var(--bad)">Ja, alles löschen</button>`; },
    'reset-do': () => { S = DEF(); save(); flush(); toast('Zurückgesetzt.'); location.hash = '#pfad'; route(); },
    'exp-do': () => exportFile(),
    'imp-do': () => { if (!IMP.data) return; S = IMP.data; IMP.data = null; save(); flush(); toast('Sicherung übernommen.'); location.hash = '#pfad'; route(); },
    'imp-no': () => { IMP.data = null; const el = $('#imp-confirm'); if (el) el.innerHTML = ''; },
    'gl-jump': t => { const el = $(`.gloss li[data-l="${t.dataset.l}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  function sightDone(ok, ctx) {
    S.sight.push({ d: today(), lv: SR.cur ? SR.cur.lv : 1, ok: ok ? 1 : 0 }); SR.n++; if (ok) SR.ok++;
    if (ctx === 'free' && SR.n >= 3) { dayRec().items.blatt = true; }
    if (ctx === 'l') { const l = LBY[LV.id]; if (l && SR.ok >= 3) markStep(l, LV.step); }
    save(); const keepN = SR.n, keepOk = SR.ok; SR.cur = TH.sightRead(SR.lvSet || 1); SR.n = keepN; SR.ok = keepOk; rerender();
  }
  // Eingaben
  document.addEventListener('change', e => {
    const t = e.target; const f = t.dataset.f; if (!f) return;
    if (f === 'pchk') { S.pchk = S.pchk || {}; const k = t.dataset.l + ':' + t.dataset.s; const arr = S.pchk[k] = S.pchk[k] || []; arr[+t.dataset.k] = t.checked; save(); const l = LBY[t.dataset.l]; const btn = $('[data-a="l-next"]'); if (btn && l) { btn.disabled = !stepComplete(l, +t.dataset.s); } }
    else if (f === 'pstep') { const p = S.pieces[t.dataset.p] = S.pieces[t.dataset.p] || {}; p.steps = p.steps || {}; p.steps[t.dataset.k] = t.checked; if (t.dataset.k === 'reif' && t.checked) { S.srs['p:' + t.dataset.p] = S.srs['p:' + t.dataset.p] || { stage: 1, next: addDays(today(), 1) }; } save(); updateTop(); }
    else if (f === 'pbpm' || f === 'ptarget' || f === 'pnote') { const p = S.pieces[t.dataset.p] = S.pieces[t.dataset.p] || {}; p[f === 'pbpm' ? 'bpm' : f === 'ptarget' ? 'target' : 'note'] = t.value; save(); }
    else if (f === 'pv-kbd') { PV.kbd = t.checked; rerender(); }
    else if (f === 'pv-names') { PV.names = t.checked; rerender(); }
    else if (f === 'song') { const s = S.songs[t.dataset.s] = S.songs[t.dataset.s] || {}; s[t.dataset.k] = t.checked; save(); }
    else if (f === 'wbset') { const set = S.wbSet || ['jingle', 'wish', 'silent']; const id = t.dataset.id; S.wbSet = t.checked ? [...new Set([...set, id])] : set.filter(x => x !== id); save(); rerender(); }
    else if (f === 'wb') { S.wb[t.dataset.id] = t.checked; save(); }
    else if (f === 'ball') { S.settings.ball = t.value; save(); rerender(); }
    else if (f === 'bg-key') { const [n, mi] = t.value.split('|'); const wasOn = BG.on; if (wasOn) bgPlay(); BG.n = +n; BG.minor = mi === '1'; const box = t.closest('.bgtool'); if (box) box.outerHTML = bgHTML(); if (wasOn) bgPlay(); }
    else if (f === 'bg-prog' || f === 'bg-pat' || f === 'bg-bpm') { const wasOn = BG.on; if (wasOn) bgPlay(); if (f === 'bg-prog') BG.prog = t.value; else if (f === 'bg-pat') BG.pat = t.value; else BG.bpm = +t.value; const box = t.closest('.bgtool'); if (box) box.outerHTML = bgHTML(); if (wasOn) bgPlay(); }
    else if (f === 'examchk') { const all = $$('[data-f="examchk"]'); const b = $('#exam-go'); if (b) b.disabled = !all.every(x => x.checked); }
    else if (f === 'mt-range') { mtSet(+t.value); }
    else if (f === 'imp-file') {
      const file = t.files && t.files[0]; t.value = ''; if (!file) return;
      const box = $('#imp-confirm');
      if (file.size > 5e6) { box.innerHTML = '<p class="err small">Die Datei ist zu groß für eine Notenweg-Sicherung.</p>'; return; }
      file.text().then(txt => {
        const r = checkImport(txt);
        if (r.err) { IMP.data = null; box.innerHTML = `<p class="err small">${r.err}</p>`; return; }
        IMP.data = r.state;
        box.innerHTML = `<div class="card quiet" style="margin-top:10px"><p><b>Diese Sicherung übernehmen?</b></p><p class="small">${esc(importSummary(r.state))}</p><p class="small muted">Dein jetziger Stand auf diesem Gerät wird dabei ersetzt.</p><div class="btnrow"><button class="btn sm" data-a="imp-do">Ersetzen</button><button class="btn sm ghost" data-a="imp-no">Abbrechen</button></div></div>`;
      }).catch(() => { box.innerHTML = '<p class="err small">Die Datei konnte nicht gelesen werden. Versuch es noch einmal.</p>'; });
    }
  });
  let noteT = null;
  document.addEventListener('input', e => { const tf = e.target.dataset && e.target.dataset.f; if (tf === 'pnote' || tf === 'pbpm' || tf === 'ptarget') { const t = e.target; clearTimeout(noteT); noteT = setTimeout(() => { const p = S.pieces[t.dataset.p] = S.pieces[t.dataset.p] || {}; p[tf === 'pbpm' ? 'bpm' : tf === 'ptarget' ? 'target' : 'note'] = t.value; save(); }, 500); } if (e.target.id === 'gl-q') { GL.q = e.target.value; clearTimeout(GL.t); GL.t = setTimeout(() => { const pos = e.target.selectionStart; rerender(); const el = $('#gl-q'); if (el) { el.focus(); el.setSelectionRange(pos, pos); } }, 250); } if (e.target.dataset.f === 'mt-range') mtSet(+e.target.value); });
  window.addEventListener('hashchange', () => { QZ.reset(); if (!location.hash.startsWith('#lektion-')) { LV.id = null; } if (!location.hash.startsWith('#pruefung-')) EX.ch = null; if (location.hash !== '#wdh') RV.phase = 'list'; route(); });

  function boot() { route(); sessDraw(); }
  return { route, boot, LES, LBY, CH, PBY, isDone, lessonOpen, report };
})();
window.APP = APP;
READY.then(() => { APP.boot(); if (window.NW_SHELL) NW_SHELL.start(); });
