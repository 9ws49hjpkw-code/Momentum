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
    const alt = $('#dlg-alt');
    alt.textContent = o.alt || '';
    alt.hidden = !o.alt;
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

/* ----- Haptik-Folge (Tagesziel vibriert mehrfach) ----- */
function haptics(n, gap) {
  if (navigator.vibrate) { const p = []; for (let i = 0; i < n; i++) p.push(i === n - 1 && n > 2 ? 22 : 10, gap || 70); try { navigator.vibrate(p); } catch (e) {} return; }
  for (let i = 0; i < n; i++) setTimeout(haptic, i * (gap || 70));
}

/* ----- Licht beim Abhaken: Photonen, Ringe, Blitz. Je wichtiger, desto mehr. ----- */
const FX = (() => {
  let cv = null, cx = null, raf = 0, dpr = 1, W = 0, H = 0;
  const parts = [];
  const C = { ice: [190, 240, 255], cyan: [98, 217, 255], white: [255, 255, 255], violet: [170, 150, 255], red: [255, 62, 86], gold: [255, 214, 140] };
  function size() { if (!cv) return; dpr = Math.min(3, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  function ensure() {
    if (cv) return !!cx;
    cv = document.createElement('canvas');
    cv.id = 'fx'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    try { cx = cv.getContext('2d'); } catch (e) { cx = null; }
    size();
    window.addEventListener('resize', size);
    return !!cx;
  }
  const mix = (a, b, k) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k));
  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
  const outE = k => 1 - Math.pow(1 - k, 3);
  const rnd = (a, b) => a + Math.random() * (b - a);
  function push(p) { p.t0 = performance.now() + (p.delay || 0); parts.push(p); }

  function draw(now) {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i], age = now - p.t0;
      if (age < 0) continue;
      const k = age / p.life;
      if (k >= 1) { parts.splice(i, 1); continue; }
      const col = p.to ? mix(p.c, p.to, Math.min(1, k * 1.6)) : p.c;
      if (p.type === 'flash') {
        const r = p.r0 + (p.r1 - p.r0) * outE(k), a = p.a * (1 - k) * (1 - k);
        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, rgba([255, 255, 255], a)); g.addColorStop(.25, rgba(col, a * .8)); g.addColorStop(1, rgba(col, 0));
        cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.fill();
      } else if (p.type === 'ring') {
        const r = p.r0 + (p.r1 - p.r0) * outE(k), a = p.a * (1 - k);
        cx.strokeStyle = rgba(col, a * .35); cx.lineWidth = p.w * 3.2 * (1 - k) + .5; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.stroke();
        cx.strokeStyle = rgba(col, a); cx.lineWidth = p.w * (1 - k * .7); cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.stroke();
      } else if (p.type === 'spark') {
        const dt = Math.min(age, p.life) / 1000, f = Math.exp(-p.drag * dt);
        const d = p.v * (1 - f) / p.drag, x = p.x + Math.cos(p.ang) * d, y = p.y + Math.sin(p.ang) * d - (p.rise || 0) * dt * dt * 60;
        const len = Math.max(1.5, p.v * f * .028), a = p.a * (1 - k * k);
        const tx = x - Math.cos(p.ang) * len, ty = y - Math.sin(p.ang) * len;
        cx.lineCap = 'round';
        cx.strokeStyle = rgba(col, a * .3); cx.lineWidth = p.w * 3; cx.beginPath(); cx.moveTo(tx, ty); cx.lineTo(x, y); cx.stroke();
        cx.strokeStyle = rgba(mix(col, [255, 255, 255], .55), a); cx.lineWidth = p.w; cx.beginPath(); cx.moveTo(tx, ty); cx.lineTo(x, y); cx.stroke();
      } else if (p.type === 'mote') {
        const dt = age / 1000, x = p.x + Math.sin(dt * p.wob + p.ph) * 6, y = p.y - p.v * dt;
        const a = p.a * Math.sin(Math.PI * k);
        const g = cx.createRadialGradient(x, y, 0, x, y, p.r);
        g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, p.r, 0, 6.283); cx.fill();
      } else if (p.type === 'sweep') {
        const e = outE(k), cxp = p.x + (p.w + 160) * e - 80, a = p.a * Math.sin(Math.PI * Math.min(1, k * 1.15));
        const g = cx.createLinearGradient(cxp - 90, 0, cxp + 90, 0);
        g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
        cx.save(); cx.beginPath();
        if (cx.roundRect) cx.roundRect(p.x, p.y, p.w, p.h, p.rad || 0); else cx.rect(p.x, p.y, p.w, p.h);
        cx.clip(); cx.fillStyle = g; cx.fillRect(p.x, p.y, p.w, p.h); cx.restore();
      } else if (p.type === 'edge') {
        /* Licht läuft am Bildschirmrand entlang, dazu leuchtet der ganze Rahmen kurz auf */
        const P = edgePath(), fa = p.frame * Math.sin(Math.PI * Math.min(1, k * (p.fk || 1)));
        if (fa > .004) {
          cx.strokeStyle = rgba(col, fa * .28); cx.lineWidth = 6; cx.stroke();
          cx.strokeStyle = rgba(col, fa); cx.lineWidth = 1.2; cx.stroke();
        }
        const e = p.lin ? k : outE(k), ra = p.a * (k < .78 ? 1 : (1 - k) / .22);
        for (const dir of p.dirs) {
          const head = ((p.start + dir * e * p.dist) % 1 + 1) % 1 * P;
          for (const L of [[p.seg * 2.4, .14, 7], [p.seg, .4, 3.2], [p.seg * .35, 1, 1.4]]) {
            const len = Math.min(P * .98, L[0]), from = dir > 0 ? head - len : head;
            cx.setLineDash([len, P - len]); cx.lineDashOffset = -from;
            cx.strokeStyle = rgba(L[1] === 1 ? mix(col, [255, 255, 255], .6) : col, ra * L[1]); cx.lineWidth = L[2]; cx.stroke();
          }
        }
        cx.setLineDash([]); cx.lineDashOffset = 0;
      } else if (p.type === 'glyph') {
        /* Großer Haken, der sich zeichnet, aufleuchtet und weitet */
        const pr = Math.min(1, k / .32), sc = p.s * (1 + (p.grow || .3) * outE(k)), a = p.a * (k < .5 ? 1 : (1 - k) / .5);
        const pts = [[-.42, .04], [-.1, .36], [.82, -.7]].map(q => [p.x + q[0] * sc, p.y + q[1] * sc]);
        const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
        let rem = pr * (l1 + l2);
        cx.beginPath(); cx.moveTo(pts[0][0], pts[0][1]);
        if (rem <= l1) cx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * rem / l1, pts[0][1] + (pts[1][1] - pts[0][1]) * rem / l1);
        else { rem -= l1; cx.lineTo(pts[1][0], pts[1][1]); cx.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * rem / l2, pts[1][1] + (pts[2][1] - pts[1][1]) * rem / l2); }
        cx.lineCap = 'round'; cx.lineJoin = 'round';
        cx.strokeStyle = rgba(col, a * .22); cx.lineWidth = p.w * 5; cx.stroke();
        cx.strokeStyle = rgba(col, a * .6); cx.lineWidth = p.w * 2.2; cx.stroke();
        cx.strokeStyle = rgba(mix(col, [255, 255, 255], .7), a); cx.lineWidth = p.w; cx.stroke();
      }
    }
  }
  /* Abgerundeter Bildschirmrand (iPhone-Ecken), gibt die Länge zurück */
  function edgePath() {
    const i = 1.5, w = W - 2 * i, hh = H - 2 * i, R = Math.min(52, w * .14);
    cx.beginPath();
    cx.moveTo(i + R, i); cx.lineTo(i + w - R, i); cx.arcTo(i + w, i, i + w, i + R, R);
    cx.lineTo(i + w, i + hh - R); cx.arcTo(i + w, i + hh, i + w - R, i + hh, R);
    cx.lineTo(i + R, i + hh); cx.arcTo(i, i + hh, i, i + hh - R, R);
    cx.lineTo(i, i + R); cx.arcTo(i, i, i + R, i, R);
    cx.closePath();
    return 2 * (w + hh) - 8 * R + 2 * Math.PI * R;
  }
  /* Position (0–1) auf dem Rand, die einem Punkt am nächsten liegt */
  function edgeAt(x, y) {
    const w = W - 3, hh = H - 3, P = 2 * (w + hh);
    const d = [y, w - x, hh - y, x], m = d.indexOf(Math.min.apply(null, d));
    const u = m === 0 ? x : m === 1 ? w + y : m === 2 ? w + hh + (w - x) : 2 * w + hh + (hh - y);
    return u / P;
  }
  function loop(now) {
    draw(now);
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = 0; cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); }
  }

  /* o: { prio 0–2, over: überfällig, goal: Tagesziel, rect: Zeile/Karte zum Überstreichen }
     Stufen: Niedrig und Normal schon kräftig, Hoch deutlich mehr, Tagesziel komplett eskaliert. */
  function burst(x, y, o) {
    o = o || {};
    const lvl = o.goal ? 3 : (o.prio == null ? 1 : o.prio);
    haptics(o.goal ? 4 : lvl === 2 ? 2 : 1, o.goal ? 80 : 75);
    if (reduced() || !ensure()) return;
    const base = lvl >= 2 ? C.cyan : lvl === 1 ? C.ice : C.ice;
    const from = o.over ? C.red : null;
    const sc = [1.3, 1.55, 2.4, 2.9][lvl];
    const col = c => from ? { c: from, to: c } : { c };
    push(Object.assign({ type: 'flash', x, y, r0: 6, r1: 16 + 18 * sc, a: .9, life: 260 + 90 * sc }, col(base)));
    push(Object.assign({ type: 'ring', x, y, r0: 12, r1: 24 + 22 * sc, w: 1.6 + .4 * sc, a: .9, life: 380 + 90 * sc }, col(base)));
    push(Object.assign({ type: 'ring', x, y, r0: 10, r1: 22 + 14 * sc, w: 1.2, a: .7, life: 420 + 80 * sc, delay: 90 }, col(C.white)));
    const n = Math.round(6 * sc + (lvl === 2 ? 4 : 0) + (o.goal ? 14 : 0));
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * 6.283 + rnd(-.25, .25), pick = Math.random() < .35 ? C.white : base;
      push(Object.assign({ type: 'spark', x, y, ang, v: rnd(150, 260) * Math.sqrt(sc), drag: rnd(5, 7.5), w: rnd(1, 1.7) + (lvl >= 2 ? .3 : 0), a: rnd(.7, 1), life: rnd(320, 460) * Math.sqrt(sc), delay: rnd(0, 40) }, col(pick)));
    }
    if (lvl === 2) {
      /* Hoch: zweite Welle, Haken-Echo und aufsteigendes Licht */
      push(Object.assign({ type: 'ring', x, y, r0: 16, r1: 110, w: 1.6, a: .6, life: 640, delay: 120 }, col(C.cyan)));
      push(Object.assign({ type: 'glyph', x: x + 2, y: y + 1, s: 22, grow: .9, w: 2, a: .95, life: 620, delay: 30 }, col(C.ice)));
      for (let i = 0; i < 7; i++) push(Object.assign({ type: 'mote', x: x + rnd(0, 160), y: y + rnd(-10, 10), v: rnd(30, 60), wob: rnd(3, 6), ph: rnd(0, 6), r: rnd(3, 6), a: rnd(.35, .6), life: rnd(700, 1000), delay: rnd(60, 220) }, col(C.cyan)));
    }
    if (o.goal) {
      /* Tagesziel: Schockwellen über den ganzen Bildschirm, Rand leuchtet, großer Haken, Lichtregen */
      const far = Math.hypot(W, H);
      push(Object.assign({ type: 'ring', x, y, r0: 14, r1: 170, w: 2.4, a: .85, life: 820, delay: 40 }, col(C.cyan)));
      push(Object.assign({ type: 'ring', x, y, r0: 8, r1: 110, w: 1.3, a: .65, life: 700, delay: 170 }, col(C.violet)));
      push(Object.assign({ type: 'ring', x, y, r0: 30, r1: far, w: 2, a: .5, life: 1100, delay: 90 }, col(C.ice)));
      push(Object.assign({ type: 'ring', x, y, r0: 20, r1: far * .8, w: 1, a: .35, life: 1250, delay: 260 }, col(C.violet)));
      push(Object.assign({ type: 'flash', x, y, r0: 20, r1: Math.max(W, H) * .9, a: .26, life: 650, delay: 30 }, col(C.cyan)));
      push(Object.assign({ type: 'edge', start: edgeAt(x, y), dist: .5, dirs: [1, -1], seg: 120, frame: .55, fk: 1, a: 1, life: 1150, delay: 60 }, col(C.cyan)));
      const r = o.rect;
      const gx = r ? r.left + r.width / 2 : x, gy = r ? r.top + r.height / 2 : y;
      push(Object.assign({ type: 'glyph', x: gx, y: gy, s: Math.min(78, (r ? r.height : 120) * .55), grow: .45, w: 3, a: 1, life: 1000, delay: 120 }, col(C.ice)));
      for (let i = 0; i < 18; i++) {
        const ang = rnd(0, 6.283);
        push(Object.assign({ type: 'spark', x, y, ang, v: rnd(420, 680), drag: 3.8, w: 1.2, a: .95, life: rnd(620, 900), delay: rnd(60, 200) }, col(Math.random() < .5 ? C.violet : C.white)));
      }
      for (let i = 0; i < 28; i++) {
        const sx = r ? r.left + rnd(0, r.width) : x + rnd(-120, 120), sy = r ? r.top + rnd(0, r.height) : y + rnd(-30, 30);
        push(Object.assign({ type: 'mote', x: sx, y: sy, v: rnd(40, 110), wob: rnd(2, 6), ph: rnd(0, 6), r: rnd(3, 9), a: rnd(.3, .65), life: rnd(900, 1500), delay: rnd(100, 520) }, col(Math.random() < .3 ? C.violet : Math.random() < .5 ? C.white : C.cyan)));
      }
    }
    if (o.over) {
      /* Erlösung: das Rot steigt als Licht auf und löst sich in Blau */
      const m = 5 + lvl * 3;
      for (let i = 0; i < m; i++) push({ type: 'mote', x: x + rnd(-14, 40), y: y + rnd(-8, 8), v: rnd(26, 52), wob: rnd(3, 6), ph: rnd(0, 6), r: rnd(4, 8), a: rnd(.35, .6), life: rnd(800, 1150), c: C.red, to: C.ice, delay: rnd(40, 220) });
    }
    if (o.rect) {
      const r = o.rect;
      push(Object.assign({ type: 'sweep', x: r.left, y: r.top, w: r.width, h: r.height, rad: o.goal ? 24 : 0, a: o.goal ? .3 : lvl === 2 ? .24 : lvl === 1 ? .15 : .11, life: o.goal ? 760 : 580, delay: 40 }, col(o.goal ? C.cyan : base)));
      if (o.goal) push(Object.assign({ type: 'sweep', x: r.left, y: r.top, w: r.width, h: r.height, rad: 24, a: .18, life: 760, delay: 330 }, col(C.violet)));
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }
  /* Start: ein Licht umrundet den Bildschirmrand, der Rahmen glimmt auf */
  function intro() {
    if (reduced() || !ensure()) return;
    push({ type: 'edge', start: .5, dist: 1, dirs: [1, -1], seg: 150, frame: .32, fk: 1, a: .9, life: 1450, c: C.cyan, to: C.ice, lin: false });
    if (!raf) raf = requestAnimationFrame(loop);
  }
  /* Der Haken rastet ein: Lichtimpuls aus der Mitte */
  function lock(x, y) {
    if (reduced() || !ensure()) return;
    push({ type: 'flash', x, y, r0: 10, r1: 150, a: .5, life: 520, c: C.cyan });
    push({ type: 'ring', x, y, r0: 40, r1: 190, w: 1.8, a: .8, life: 700, c: C.ice });
    push({ type: 'ring', x, y, r0: 30, r1: 130, w: 1, a: .55, life: 640, c: C.violet, delay: 80 });
    for (let i = 0; i < 22; i++) push({ type: 'spark', x, y, ang: i / 22 * 6.283 + rnd(-.1, .1), v: rnd(260, 420), drag: 4.5, w: rnd(1, 1.5), a: rnd(.6, .95), life: rnd(500, 700), c: Math.random() < .4 ? C.white : C.cyan, delay: rnd(0, 50) });
    if (!raf) raf = requestAnimationFrame(loop);
  }
  return { burst, intro, lock };
})();
/* Mitte des Abhak-Kreises einer Zeile */
function checkPoint(el) {
  const i = el && el.querySelector('.check i');
  const r = (i || el).getBoundingClientRect();
  return i ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: r.left + 29, y: r.top + r.height / 2 };
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
