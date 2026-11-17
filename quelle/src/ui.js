/* ===== Oberfläche: Toast, Ebenen, Dialog, Tastatur, Gesten ===== */

/* ----- Haptik (iOS: stiller Schalter-Trick, sonst Vibration) ----- */
function haptic() {
  try {
    if (navigator.vibrate) { navigator.vibrate(8); return; }
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    document.head.removeChild(label);
  } catch (e) {}
}

/* ----- Toast ----- */
let toastTimer = 0;
function hideToast() { clearTimeout(toastTimer); $('#toast').classList.remove('show'); }
function toast(msg, opt) {
  opt = opt || {};
  const t = $('#toast');
  clearTimeout(toastTimer);
  t.replaceChildren(h('span', null, msg));
  if (opt.action) t.appendChild(h('button', { type: 'button', onclick: () => { hideToast(); opt.onAction(); } }, opt.action));
  void t.offsetWidth;
  t.classList.add('show');
  toastTimer = setTimeout(hideToast, opt.ms || (opt.action ? 5200 : 2200));
}

/* ----- Ebenen (Sheets, Dialog) ----- */
const layers = [];
const topLayer = () => layers[layers.length - 1] || null;
function openLayer(id) {
  const L = $('#' + id);
  if (layers.indexOf(L) >= 0) return L;
  clearTimeout(L._hide);
  L._at = Date.now();
  L.hidden = false;
  L.style.zIndex = 50 + layers.length * 2;
  const sh = $('.sheet', L);
  if (sh) { sh.style.transform = ''; sh.style.transition = ''; sh.style.opacity = ''; }
  void L.offsetWidth;
  L.classList.add('open');
  layers.push(L);
  document.body.classList.add('layered');
  hideToast();
  return L;
}
function closeLayer(L) {
  if (typeof L === 'string') L = $('#' + L);
  const i = layers.indexOf(L);
  if (i < 0) return;
  layers.splice(i, 1);
  const a = document.activeElement;
  if (a && L.contains(a) && a.blur) a.blur();
  L.classList.remove('open');
  L._hide = setTimeout(() => { L.hidden = true; }, 400);
  if (!layers.length) document.body.classList.remove('layered');
  if (L._onClose) { const f = L._onClose; L._onClose = null; f(); }
}

/* Sheet am Griff nach unten ziehen, um es zu schließen */
function bindSheetDrag(L) {
  const sheet = $('.sheet', L);
  if (!sheet) return;
  let s = null;
  const start = e => {
    if (e.touches.length !== 1 || topLayer() !== L) { s = null; return; }
    if (e.target.closest('button')) { s = null; return; }
    s = { y: e.touches[0].clientY, dy: 0, t: e.timeStamp, v: 0, ly: e.touches[0].clientY, lt: e.timeStamp };
  };
  const move = e => {
    if (!s) return;
    const y = e.touches[0].clientY;
    s.dy = Math.max(0, y - s.y);
    const dt = e.timeStamp - s.lt;
    if (dt > 0) { s.v = (y - s.ly) / dt; s.ly = y; s.lt = e.timeStamp; }
    if (e.cancelable) e.preventDefault();
    sheet.style.transition = 'none';
    sheet.style.transform = 'translate3d(0,' + s.dy + 'px,0)';
  };
  const end = () => {
    if (!s) return;
    const close = s.dy > 110 || (s.v > 0.55 && s.dy > 30), dy = s.dy;
    s = null;
    if (close) {
      /* weiter nach unten aus dem Bild gleiten */
      sheet.style.transition = 'transform .24s cubic-bezier(.4,0,1,1), opacity .2s ease';
      sheet.style.transform = 'translate3d(0,' + (dy + 240) + 'px,0)';
      sheet.style.opacity = '0';
      closeLayer(L);
    } else { sheet.style.transition = ''; sheet.style.transform = ''; }
  };
  for (const g of $$('[data-drag]', L)) {
    g.addEventListener('touchstart', start, { passive: true });
    g.addEventListener('touchmove', move, { passive: false });
    g.addEventListener('touchend', end);
    g.addEventListener('touchcancel', end);
  }
}

/* ----- Dialog ----- */
let dlgResolve = null;
function dialog(o) {
  return new Promise(res => {
    if (dlgResolve) { dlgResolve(false); dlgResolve = null; }
    $('#dlg-title').textContent = o.title;
    $('#dlg-text').textContent = o.text || '';
    $('#dlg-text').hidden = !o.text;
    const ok = $('#dlg-ok'), cancel = $('#dlg-cancel');
    ok.textContent = o.ok || 'OK';
    ok.className = 'btn ' + (o.danger ? 'btn-warn' : 'btn-primary');
    cancel.textContent = o.cancel || 'Abbrechen';
    cancel.hidden = o.cancel === false;
    dlgResolve = res;
    const L = openLayer('L-dialog');
    L._onClose = () => { if (dlgResolve) { const r = dlgResolve; dlgResolve = null; r(false); } };
  });
}
function dialogAnswer(v) {
  const r = dlgResolve; dlgResolve = null;
  closeLayer('L-dialog');
  if (r) r(v);
}

/* ----- Tastatur: Sheets und Listen enden immer über der Tastatur ----- */
const KB = { h: 0, guess: false, timer: 0, hold: false };
const isField = e => !!e && !e.readOnly && (e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && ['text', 'search', 'email', 'number', 'url', 'tel', 'password'].indexOf(e.type) >= 0));
function layoutH() { return root.clientHeight || window.innerHeight; }
function applyKb(hgt, vvh) {
  KB.h = hgt;
  root.style.setProperty('--kb', hgt + 'px');
  root.style.setProperty('--vvh', Math.round(vvh) + 'px');
  document.body.classList.toggle('kb-open', hgt > 0);
}
function measureKb() {
  if (KB.hold) return;
  const vv = window.visualViewport, lh = layoutH();
  if (!vv) { applyKb(0, lh); return; }
  let k = Math.round(lh - vv.height - vv.offsetTop);
  if (k < 90) k = 0;
  if (k === 0 && KB.guess) return;
  if (k > 0) {
    KB.guess = false; clearTimeout(KB.timer);
    try { localStorage.setItem('momentum.kb', String(Math.round(lh - vv.height))); } catch (e) {}
  }
  applyKb(k, k > 0 ? vv.height : lh);
}
function guessKb() {
  if (!mqCoarse.matches || !window.visualViewport || KB.h > 0) return;
  let k = 0;
  try { k = +localStorage.getItem('momentum.kb') || 0; } catch (e) {}
  const lh = layoutH();
  if (k < 150 || k > lh * 0.6) k = lh >= 900 ? 346 : lh >= 780 ? 336 : lh >= 700 ? 301 : 260;
  KB.guess = true;
  applyKb(k, lh - k);
  clearTimeout(KB.timer);
  KB.timer = setTimeout(() => { KB.guess = false; measureKb(); }, 1500);
}
let lastTouchY = 0;
function initKeyboard() {
  applyKb(0, layoutH());
  const vv = window.visualViewport;
  let pending = false;
  const onVV = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; measureKb(); }); };
  if (vv) { vv.addEventListener('resize', onVV); vv.addEventListener('scroll', onVV); }
  window.addEventListener('resize', onVV);
  window.addEventListener('orientationchange', () => setTimeout(measureKb, 300));
  document.addEventListener('touchend', e => { const t = e.changedTouches[0]; if (t) lastTouchY = t.clientY; }, { passive: true, capture: true });
  document.addEventListener('touchstart', e => {
    if (KB.hold && e.target.type !== 'date') { KB.hold = false; setTimeout(measureKb, 60); }
  }, { passive: true, capture: true });
  document.addEventListener('focusin', e => {
    if (e.target.type === 'date') { if (KB.h > 0) { KB.hold = true; KB.guess = false; clearTimeout(KB.timer); } return; }
    if (!isField(e.target)) return;
    if (KB.h === 0) guessKb();
    if (e.target.tagName === 'INPUT') { const el = e.target; revealField(el); setTimeout(() => revealField(el), 480); }
    /* Feld in einer Liste: so weit scrollen, dass die Tippstelle über der Tastatur liegt */
    const sc = e.target.closest('.scroll');
    if (sc && KB.h > 0 && lastTouchY) {
      const limit = layoutH() - KB.h - 96;
      if (lastTouchY > limit) sc.scrollTop += lastTouchY - limit;
    }
    setTimeout(measureKb, 450);
  });
  document.addEventListener('focusout', e => {
    if (e.target && e.target.type === 'date') KB.hold = false;
    setTimeout(() => {
      if (isField(document.activeElement) || KB.hold) return;
      KB.guess = false; clearTimeout(KB.timer);
      measureKb();
      if (window.scrollY || (vv && vv.offsetTop)) window.scrollTo(0, 0);
    }, 120);
    setTimeout(() => { if (!isField(document.activeElement)) measureKb(); }, 500);
  });
}
/* Einzeiliges Feld ganz ins Sichtfeld über der Tastatur holen */
function revealField(el) {
  if (document.activeElement !== el) return;
  const sc = el.closest('.sheet-body, .scroll');
  if (!sc) return;
  const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect();
  if (r.bottom > b.bottom - 16) sc.scrollTop += r.bottom - (b.bottom - 16);
  else if (r.top < b.top + 8) sc.scrollTop -= b.top + 8 - r.top;
}
/* Beim Schreiben am Textende bleibt die letzte Zeile sichtbar */
function keepEndVisible(ta) {
  if (document.activeElement !== ta || ta.selectionEnd !== ta.value.length) return;
  const sc = ta.closest('.scroll, .sheet-body');
  if (!sc) return;
  const r = ta.getBoundingClientRect(), b = sc.getBoundingClientRect();
  const over = r.bottom + 18 - b.bottom;
  if (over > 0) sc.scrollTop += over;
}

/* ----- Animationen ----- */
function collapse(el) {
  if (reduced()) return Promise.resolve();
  const hgt = el.offsetHeight;
  el.style.height = hgt + 'px';
  el.style.overflow = 'hidden';
  void el.offsetHeight;
  el.style.transition = 'height .3s cubic-bezier(.3,.7,.2,1), opacity .22s ease, margin .3s cubic-bezier(.3,.7,.2,1)';
  el.style.height = '0px';
  el.style.opacity = '0';
  el.style.marginTop = '0px';
  el.style.marginBottom = '0px';
  return wait(310);
}
function nudge(el) {
  haptic();
  el.classList.remove('nudge');
  void el.offsetWidth;
  el.classList.add('nudge');
  setTimeout(() => el.classList.remove('nudge'), 460);
}
/* Wachsende Textfelder */
function bindGrow(wrap, ta) {
  const sync = () => { wrap.dataset.v = ta.value; };
  ta.addEventListener('input', sync);
  sync();
  return sync;
}

/* ----- Wischen nach rechts = erledigt ----- */
let suppressClick = 0;
function bindSwipe(container, onComplete) {
  const TH = 86;
  let s = null;
  const reset = (st, animate) => {
    st.w.classList.remove('armed');
    st.row.style.transition = animate ? 'transform var(--spring-d) var(--spring)' : '';
    st.row.style.transform = '';
    st.under.style.transition = 'opacity .2s ease';
    st.under.style.opacity = '';
    setTimeout(() => { st.w.classList.remove('swiping'); st.row.style.transition = ''; st.under.style.transition = ''; }, 520);
  };
  container.addEventListener('touchstart', e => {
    s = null;
    if (e.touches.length !== 1) return;
    const w = e.target.closest('.rw[data-swipe]');
    if (!w || w.dataset.busy) return;
    const p = e.touches[0];
    s = { w, under: w.children[0], row: w.children[1], x: p.clientX, y: p.clientY, dx: 0, lock: false, armed: false, lx: p.clientX, lt: e.timeStamp, v: 0 };
  }, { passive: true });
  container.addEventListener('touchmove', e => {
    if (!s) return;
    const p = e.touches[0], dx = p.clientX - s.x, dy = p.clientY - s.y;
    if (!s.lock) {
      if (dx > 10 && Math.abs(dx) > Math.abs(dy) * 1.25) { s.lock = true; s.w.classList.add('swiping'); s.row.style.transition = 'none'; s.under.style.transition = 'none'; }
      else if (Math.abs(dy) > 10 || dx < -10) { s = null; return; }
      else return;
    }
    if (e.cancelable) e.preventDefault();
    const dt = e.timeStamp - s.lt;
    if (dt > 0) { s.v = (p.clientX - s.lx) / dt; s.lx = p.clientX; s.lt = e.timeStamp; }
    s.dx = Math.max(0, dx - 10);
    s.row.style.transform = 'translate3d(' + s.dx + 'px,0,0)';
    s.under.style.opacity = String(Math.min(1, s.dx / 44));
    const armed = s.dx >= TH;
    if (armed !== s.armed) { s.armed = armed; s.w.classList.toggle('armed', armed); if (armed) haptic(); }
  }, { passive: false });
  const end = cancelled => {
    if (!s) return;
    const st = s; s = null;
    if (!st.lock) return;
    suppressClick = Date.now();
    if (!cancelled && (st.armed || (st.v > 0.6 && st.dx > 36))) {
      st.w.dataset.busy = '1';
      st.w.classList.add('armed');
      haptic();
      const fly = reduced() ? 0 : 240;
      st.row.style.transition = 'transform ' + fly + 'ms cubic-bezier(.3,0,.7,1), opacity ' + fly + 'ms ease';
      st.row.style.transform = 'translate3d(' + (st.w.offsetWidth + 24) + 'px,0,0)';
      st.row.style.opacity = '0';
      onComplete(st.w, fly);
    } else reset(st, true);
  };
  container.addEventListener('touchend', () => end(false));
  container.addEventListener('touchcancel', () => end(true));
}
