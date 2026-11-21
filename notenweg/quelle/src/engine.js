/* ===== Notenweg engine: music utils, engraver (SVG strings), keyboard ===== */
/* GL (glyph outlines) is injected before this file. */

const MU = (() => {
  const LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const DE_SHARP = ['c', 'cis', 'd', 'dis', 'e', 'f', 'fis', 'g', 'gis', 'a', 'ais', 'h'];
  const DE_FLAT = ['c', 'des', 'd', 'es', 'e', 'f', 'ges', 'g', 'as', 'a', 'b', 'h'];
  const SUP = ['', '¹', '²', '³', '⁴', '⁵'];
  const SUB = ['', '₁', '₂'];
  function parsePitch(str) {
    const m = /^([A-G])(##|bb|#|b|n)?(-?\d)$/.exec(str);
    if (!m) throw new Error('bad pitch ' + str);
    const letter = m[1], acc = m[2] && m[2] !== 'n' ? m[2] : '', oct = +m[3];
    const alter = acc === '#' ? 1 : acc === '##' ? 2 : acc === 'b' ? -1 : acc === 'bb' ? -2 : 0;
    return { letter, acc, alter, oct, midi: (oct + 1) * 12 + SEMI[letter] + alter, dia: oct * 7 + LET.indexOf(letter) };
  }
  // German name of a spelled pitch: letter + accidental -> c, cis, des, es, as, b, h, eis, his, ces, fes
  function deSpelled(letter, alter) {
    const base = { C: 'c', D: 'd', E: 'e', F: 'f', G: 'g', A: 'a', B: 'h' }[letter];
    if (alter === 0) return base;
    if (alter === 1) return base + 'is';
    if (alter === 2) return base + 'isis';
    if (alter === -1) {
      if (letter === 'B') return 'b';
      if (letter === 'E') return 'es';
      if (letter === 'A') return 'as';
      return base + 'es';
    }
    if (alter === -2) { if (letter === 'B') return 'heses'; if (letter === 'E') return 'eses'; if (letter === 'A') return 'asas'; return base + 'eses'; }
    return base;
  }
  // Helmholtz octave decoration (scientific octave -> German style)
  function octDeco(name, sciOct) {
    if (sciOct >= 4) return name + SUP[sciOct - 3];
    if (sciOct === 3) return name;
    const cap = name.charAt(0).toUpperCase() + name.slice(1);
    if (sciOct === 2) return cap;
    return cap + SUB[2 - sciOct];
  }
  function deName(p, withOct = true) {
    const n = deSpelled(p.letter, p.alter);
    // octave of a spelled note follows its letter (e.g. Cb4 is "ces¹" though it sounds as h)
    return withOct ? octDeco(n, p.oct) : n;
  }
  function deMidi(midi, withOct = true, flats = false) {
    const pc = ((midi % 12) + 12) % 12, oct = Math.floor(midi / 12) - 1;
    const n = (flats ? DE_FLAT : DE_SHARP)[pc];
    return withOct ? octDeco(n, oct) : n;
  }
  function sciMidi(midi) {
    const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    return names[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
  }
  const isBlack = m => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
  const freq = m => 440 * Math.pow(2, (m - 69) / 12);
  return { parsePitch, deName, deMidi, deSpelled, octDeco, sciMidi, isBlack, freq, LET, SEMI };
})();

const KEYSIG = {
  C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7
};
const KS_POS = { treble: { s: [8, 5, 9, 6, 3, 7, 4], f: [4, 7, 3, 6, 2, 5, 1] } };
KS_POS.bass = { s: KS_POS.treble.s.map(p => p - 2), f: KS_POS.treble.f.map(p => p - 2) };
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
function keyAlters(key) {
  const n = KEYSIG[key] || 0, a = {};
  if (n > 0) SHARP_ORDER.slice(0, n).forEach(l => a[l] = 1);
  if (n < 0) FLAT_ORDER.slice(0, -n).forEach(l => a[l] = -1);
  return a;
}

const Engrave = (() => {
  const f = v => Math.round(v * 100) / 100;
  const DUR = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25, '32': 0.125 };
  const CLEF_BOTTOM_DIA = { treble: 30, bass: 18 }; // E4 / G2
  let uid = 0;

  // Place a glyph by its bounding box. opts: left|cx|right, top|cy|bottom, h (height) or w (width), sx (x-stretch)
  function G(name, o, cls) {
    const g = GL[name]; const [x0, y0, x1, y1] = g.b;
    const k = o.h != null ? o.h / (y1 - y0) : o.w / (x1 - x0);
    const ky = o.hy != null ? o.hy / (y1 - y0) : k;
    const kx = o.sx ? k * o.sx : k;
    const W = (x1 - x0) * kx, H = (y1 - y0) * ky;
    let left = o.left != null ? o.left : o.cx != null ? o.cx - W / 2 : o.right - W;
    let top = o.top != null ? o.top : o.cy != null ? o.cy - H / 2 : o.bottom - H;
    const tx = left - x0 * kx, ty = top + y1 * ky;
    const flip = o.flipY ? `translate(0,${f(top * 2 + H)}) scale(1,-1) ` : '';
    return { s: `<path${cls ? ` class="${cls}"` : ''} d="${g.d}" transform="${flip}translate(${f(tx)},${f(ty)}) scale(${f(kx * 1000) / 1000},${f(-ky * 1000) / 1000})"/>`, w: W, h: H, left, top };
  }

  function tokenize(str) {
    if (!str) return [];
    return (str.replace(/,/g, ' ').match(/\([^)]*\)\S*|\S+/g) || []);
  }
  function parseToken(tok) {
    const parts = tok.split('!');
    const main = parts[0]; const mods = {};
    parts.slice(1).forEach(p => {
      const eq = p.indexOf('=');
      if (eq > 0) mods[p.slice(0, eq)] = p.slice(eq + 1);
      else if (/^f\d+$/.test(p)) mods.f = p.slice(1);
      else mods[p] = true;
    });
    const sl = main.lastIndexOf('/');
    const pp = main.slice(0, sl), dd = main.slice(sl + 1);
    const dm = /^(w|h|q|8|16|32)(\.*)$/.exec(dd);
    if (!dm) throw new Error('bad duration ' + tok);
    const base = dm[1], dots = dm[2].length;
    let beats = DUR[base]; let add = beats; for (let i = 0; i < dots; i++) { add /= 2; beats += add; }
    const it = { base, dots, beats, mods, rest: false, pitches: [] };
    if (pp === 'r' || pp === 'x') { it.rest = true; it.hidden = pp === 'x'; }
    else {
      const list = pp.startsWith('(') ? pp.slice(1, -1).trim().split(/\s+/) : [pp];
      it.pitches = list.map(MU.parsePitch).sort((a, b) => a.dia - b.dia || a.midi - b.midi);
    }
    return it;
  }

  const timeLen = t => !t ? 0 : (t === 'C' || t === 'C|') ? 4 : (() => { const [a, b] = t.split('/').map(Number); return a * 4 / b; })();
  // spacing for an onset gap in quarter beats
  const gapW = (g, s) => s * (1.2 + 2.25 * Math.sqrt(Math.max(g, 0.125)));

  function parseVoice(str) {
    const items = tokenize(str).map(parseToken);
    let t = 0, inTrip = false;
    items.forEach(it => {
      if (it.mods['3(']) inTrip = true;
      it.trip = inTrip;
      it.t = t; it.len = it.trip ? it.beats * 2 / 3 : it.beats;
      t += it.len;
      if (it.mods['3)']) inTrip = false;
    });
    return { items, len: t };
  }

  function render(spec) {
    const s = spec.s || 10;
    const staves = spec.staves || ['treble'];
    const key = spec.key || 'C';
    const alters0 = keyAlters(key);
    const nKey = Math.abs(KEYSIG[key] || 0);
    const time = spec.time || null;
    // per-measure key / time (changes via m.key / m.time)
    const keyOf = [], timeOf = [];
    { let k = key, t = time; spec.measures.forEach((m, i) => { if (m.key && i > 0) k = m.key; if (m.time && i > 0) t = m.time; keyOf[i] = k; timeOf[i] = t; }); }
    const kwOf = k => { const n = Math.abs(KEYSIG[k] || 0); return n ? n * s * 1.05 + s * 0.6 : 0; };
    const keyChangeW = (from, to) => { const a = KEYSIG[from] || 0, b = KEYSIG[to] || 0; const nat = (a > 0 && b <= 0) || (a < 0 && b >= 0) ? Math.abs(a) : (Math.abs(b) < Math.abs(a) ? Math.abs(a) - Math.abs(b) : 0); return (nat + Math.abs(b)) * s * 1.05 + s * 1.2; };
    const W = Math.max(spec.width || 600, 200);
    const prefix = spec.prefix || ('n' + (++uid));
    const SW = s * 0.12; // stem width
    const headW = s * 1.18, wholeW = s * 1.62;
    const showNames = spec.names || false; // false | 'all' | 'treble' | 'bass'
    const isNamed = (st) => showNames === 'all' || showNames === st;
    const staffKey = st => st === 'treble' ? 'r' : 'l';

    // ---------- parse measures ----------
    const M = spec.measures.map((m, mi) => {
      const voices = {}, voices2 = {};
      staves.forEach(st => { voices[st] = parseVoice(m[staffKey(st)] || ''); const v2 = m[staffKey(st) + '2']; voices2[st] = v2 ? parseVoice(v2) : null; });
      let len = 0; staves.forEach(st => { len = Math.max(len, voices[st].len); if (voices2[st]) len = Math.max(len, voices2[st].len); });
      if (len === 0 && timeOf[mi]) len = timeLen(timeOf[mi]);
      const mAlters = keyAlters(keyOf[mi]);
      // onsets
      const set = new Set();
      staves.forEach(st => { voices[st].items.forEach(it => set.add(+it.t.toFixed(5))); if (voices2[st]) voices2[st].items.forEach(it => set.add(+it.t.toFixed(5))); });
      (m.chords || []).forEach(c => set.add(+(+c[0]).toFixed(5)));
      set.add(+len.toFixed(5));
      const on = [...set].filter(x => x <= len + 1e-6).sort((a, b) => a - b);
      // accidental display per staff (measure-local accidental memory)
      const accAt = {}, dotAt = {}, minGap = {};
      staves.forEach(st => {
        const mem = {};
        const merged = voices[st].items.concat(voices2[st] ? voices2[st].items : []).map((it, i) => [it, i]).sort((a, b) => a[0].t - b[0].t || a[1] - b[1]).map(x => x[0]);
        merged.forEach(it => {
          if (it.rest) { if (it.mods.t) { const kk0 = +it.t.toFixed(5); minGap[kk0] = Math.max(minGap[kk0] || 0, String(it.mods.t).length * s * 0.68 + s * 0.6); } return; }
          it.pitches.forEach(p => {
            const k = p.letter + p.oct;
            const cur = k in mem ? mem[k] : (mAlters[p.letter] || 0);
            p.show = cur !== p.alter ? p.alter : null; // null = no symbol, 0 = natural sign
            if (p.mods_forceAcc) p.show = p.alter;
            mem[k] = p.alter;
          });
          const kk = +it.t.toFixed(5);
          let tl = it.mods.t ? String(it.mods.t).length : 0;
          if ((showNames === 'all' || showNames === st || it.mods.n) && it.pitches.length) tl = Math.max(tl, it.pitches.map(p => MU.deName(p)).join('·').length);
          if (tl) minGap[kk] = Math.max(minGap[kk] || 0, tl * s * 0.68 + s * 0.6);
          if (it.pitches.some(p => p.show !== null)) accAt[kk] = 1;
          if (it.dots) dotAt[kk] = Math.max(dotAt[kk] || 0, it.dots);
        });
      });
      // natural widths
      const gaps = [];
      for (let i = 0; i < on.length - 1; i++) {
        let w = gapW(on[i + 1] - on[i], s);
        if (dotAt[on[i]]) w += s * 0.55 * dotAt[on[i]];
        if (minGap[on[i]]) w = Math.max(w, minGap[on[i]]);
        if (accAt[on[i + 1]]) w += s * 1.25;
        gaps.push(w);
      }
      let padL = s * 1.7 + (accAt[on[0]] ? s * 1.25 : 0);
      if (m.clef) staves.forEach(st => (m.clef[staffKey(st)] || []).forEach(([ct]) => { if (ct < 1e-6) padL += s * (mi === 0 ? 0 : 2.6); else { const ix = on.findIndex(o => Math.abs(o - ct) < 1e-5); if (ix > 0) gaps[ix - 1] += s * 2.6; } }));
      const padR = s * 1.0;
      let kx = 0;
      if (mi > 0 && m.key && keyOf[mi] !== keyOf[mi - 1]) { kx = keyChangeW(keyOf[mi - 1], keyOf[mi]); padL += kx; }
      if (mi > 0 && m.time && timeOf[mi] !== timeOf[mi - 1]) padL += s * 2.8;
      const wholeRest = staves.every(st => voices[st].items.length <= 1 && !voices2[st]) && staves.some(st => voices[st].items.length === 1 && voices[st].items[0].rest && voices[st].items[0].base === 'w');
      let natural = padL + padR + gaps.reduce((a, b) => a + b, 0);
      if (m.minW && m.minW * s > natural) { const extra = m.minW * s - natural; const sum = gaps.reduce((a, b) => a + b, 0) || 1; for (let i = 0; i < gaps.length; i++) gaps[i] += extra * gaps[i] / sum; natural = m.minW * s; }
      if (m.begin === '|:') natural += s * 1.8;
      if (m.end === ':|') natural += s * 1.4;
      return { m, mi, voices, voices2, len, on, gaps, padL, padR, natural, accAt, wholeRest, kx };
    });

    // ---------- line breaking ----------
    const clefW = s * 3.4;
    const keyW = nKey ? nKey * s * 1.05 + s * 0.6 : 0;
    const timeW = time ? s * 2.6 : 0;
    const braceW = staves.length > 1 ? s * 1.4 : 0;
    const lines = [];
    let cur = null;
    const startLine = mm => { if (mm.kx) { mm.natural -= mm.kx; mm.padL -= mm.kx; mm.kx = 0; mm.keyAtLineStart = true; } };
    M.forEach((mm, i) => {
      const pre = braceW + clefW + kwOf(keyOf[mm.mi]) + (lines.length === 0 && !cur ? timeW : 0);
      if (!cur) { cur = { measures: [], pre, used: pre }; startLine(mm); }
      const forceBreak = mm.m.breakBefore && cur.measures.length;
      if ((cur.used + mm.natural > W - 2 && cur.measures.length) || forceBreak) {
        lines.push(cur);
        startLine(mm);
        const pre2 = braceW + clefW + kwOf(keyOf[mm.mi]);
        cur = { measures: [], pre: pre2, used: pre2 };
      }
      cur.measures.push(mm); cur.used += mm.natural;
    });
    if (cur && cur.measures.length) lines.push(cur);

    // ---------- draw ----------
    const out = [];
    const events = [];
    const pedals = [];
    const noteRec = {}; // id -> record for ties/slurs
    let beatCursor = 0; const measureStart = [];
    M.forEach(mm => { measureStart[mm.mi] = beatCursor; beatCursor += mm.len; });
    const clefCh = {}; staves.forEach(st => { clefCh[st] = [[-1, (spec.clefInit && spec.clefInit[st]) || st]]; });
    M.forEach(mm => { if (mm.m.clef) staves.forEach(st => (mm.m.clef[staffKey(st)] || []).forEach(([ct, c]) => clefCh[st].push([measureStart[mm.mi] + ct, c]))); });
    const clefAt = (st, g) => { let c = clefCh[st][0][1]; for (const [g0, c0] of clefCh[st]) if (g0 <= g + 1e-6) c = c0; return c; };
    let yCursor = 0;
    let measureRects = [];
    const pedOpen = {}; const tieCarry = {};
    const lastLineIdx = lines.length - 1;

    lines.forEach((line, li) => {
      const isLast = li === lastLineIdx;
      const avail = W - line.pre - 1;
      const nat = line.measures.reduce((a, mm) => a + mm.natural, 0);
      let factor = avail / nat;
      if (isLast && factor > 1.25 && !spec.justifyLast) factor = Math.min(factor, 1.25);
      if (factor < 1) factor = Math.max(factor, 0.6);
      // staff-local drawing buffers
      const buf = {}; const ext = {}; const rows = {};
      staves.forEach(st => { buf[st] = []; ext[st] = { min: 0, max: 4 * s }; rows[st] = { names: [], fing: [], below: [], above: [], dyn: [], ped: [] }; });
      const trackY = (st, y1, y2) => { ext[st].min = Math.min(ext[st].min, y1, y2); ext[st].max = Math.max(ext[st].max, y1, y2); };
      const yPos = pos => (8 - pos) * s / 2;
      const lineNotes = [];
      const chordTexts = [];
      // prefix: clef, key, time
      staves.forEach(st => {
        const b = buf[st]; let x = braceW + s * 0.5;
        const lc = clefAt(st, measureStart[line.measures[0].mi]);
        if (lc === 'treble') {
          const g = G('gclef', { left: x, top: yPos(2) - 4.39 * s, h: 7.0 * s }); b.push(g.s); trackY(st, g.top, g.top + g.h);
        } else {
          const g = G('fclef', { left: x, top: yPos(6) - 1.0 * s, h: 3.5 * s }); b.push(g.s);
        }
        x = braceW + clefW;
        const n = KEYSIG[keyOf[line.measures[0].mi]] || 0;
        for (let i = 0; i < Math.abs(n); i++) {
          const pos = (n > 0 ? KS_POS[lc].s : KS_POS[lc].f)[i];
          const yy = yPos(pos);
          const g = n > 0 ? G('sharp', { left: x + i * s * 1.05, cy: yy, h: 2.75 * s }) : G('flat', { left: x + i * s * 1.05, bottom: yy + 0.72 * s, h: 2.45 * s });
          b.push(g.s);
        }
        if (time && li === 0) {
          const tx = braceW + clefW + kwOf(keyOf[line.measures[0].mi]) + s * 0.3;
          if (time === 'C' || time === 'C|') { const gc = G('common', { left: tx, cy: yPos(4), h: 2.1 * s }); b.push(gc.s); if (time === 'C|') b.push(`<rect x="${f(gc.left + gc.w * 0.52 - s * 0.07)}" y="${f(yPos(8) - s * 0.5)}" width="${f(s * 0.14)}" height="${f(5 * s)}"/>`); }
          else {
            const [a, d] = time.split('/');
            const dig = (str, cy) => {
              const ws = [...str].map(ch => { const gg = GL['n' + ch].b; return (gg[2] - gg[0]) / (gg[3] - gg[1]) * 1.95 * s; });
              const tot = ws.reduce((p, q) => p + q, 0) + (ws.length - 1) * s * 0.05;
              let xx = tx + s * 0.9 - tot / 2;
              [...str].forEach((ch, i) => { b.push(G('n' + ch, { left: xx, cy, h: 1.95 * s }).s); xx += ws[i] + s * 0.05; });
            };
            dig(a, yPos(6)); dig(d, yPos(2));
          }
        }
      });
      // measures
      let mx = line.pre;
      const barXs = [];
      line.measures.forEach((mm, k) => {
        const mW = mm.natural * factor;
        const x0 = mx;
        const beginRep = mm.m.begin === '|:';
        const innerL = x0 + (beginRep ? s * 1.8 : 0);
        // onset x map
        const onX = {};
        let xx = innerL + mm.padL * factor;
        mm.on.forEach((o, i) => { onX[+o.toFixed(5)] = xx; if (i < mm.gaps.length) xx += mm.gaps[i] * factor; });
        measureRects.push({ mi: mm.mi, x: x0, w: mW, li });
        // chord symbols (treble row)
        (mm.m.chords || []).forEach(c => { chordTexts.push({ x: onX[+(+c[0]).toFixed(5)] - s * 0.1, t: c[1] }); });
        if (mm.m.text) chordTexts.push({ x: x0 + s * 0.6, t: mm.m.text, it: true, row: 1 });
        if (mm.m.textEnd) chordTexts.push({ x: x0 + mW - s * 0.4, t: mm.m.textEnd, it: true, end: true, row: 1 });
        if (mm.m.volta) chordTexts.push({ volta: mm.m.volta, x: x0 + s * 0.2, w: mW - s * 0.8, open: mm.m.voltaOpen });
        if (mm.m.label) chordTexts.push({ x: x0 + s * 0.3, t: mm.m.label, row: 2, small: true });
        // draw voices
        staves.forEach(st => {
          const vlist = [['', mm.voices[st]]]; if (mm.voices2[st]) vlist.push(['2', mm.voices2[st]]);
          const two = vlist.length > 1; const v1At = {};
          const otherAt = { '': {}, '2': {} };
          if (two) vlist.forEach(([vk0, v0]) => v0.items.forEach(it0 => { if (it0.rest || !it0.pitches.length) return; const k0 = +it0.t.toFixed(5); const ds = it0.pitches.map(p => p.dia - CLEF_BOTTOM_DIA[clefAt(st, measureStart[mm.mi] + it0.t)]); const tgt = otherAt[vk0 === '' ? '2' : '']; const span = [it0.t, it0.t + it0.len]; tgt[k0] = tgt[k0] || []; tgt[k0].push({ lo: Math.min(...ds), hi: Math.max(...ds), span }); }));
          const otherRange = (vk0, t0, len0) => { let lo = Infinity, hi = -Infinity; Object.values(otherAt[vk0]).forEach(arr => arr.forEach(o => { if (o.span[0] < t0 + len0 - 1e-6 && o.span[1] > t0 + 1e-6) { lo = Math.min(lo, o.lo); hi = Math.max(hi, o.hi); } })); return lo === Infinity ? null : { lo, hi }; };
          // key / time change at the start of this measure
          let kxPos = innerL + s * 0.5;
          if (mm.mi > 0 && mm.m.key && keyOf[mm.mi] !== keyOf[mm.mi - 1] && !mm.keyAtLineStart) {
            const a = KEYSIG[keyOf[mm.mi - 1]] || 0, bb = KEYSIG[keyOf[mm.mi]] || 0;
            const lc = clefAt(st, measureStart[mm.mi]);
            const nats = [];
            if ((a > 0 && bb <= 0) || (a < 0 && bb >= 0)) { for (let i = 0; i < Math.abs(a); i++) nats.push((a > 0 ? KS_POS[lc].s : KS_POS[lc].f)[i]); }
            else if (Math.abs(bb) < Math.abs(a)) { for (let i = Math.abs(bb); i < Math.abs(a); i++) nats.push((a > 0 ? KS_POS[lc].s : KS_POS[lc].f)[i]); }
            nats.forEach(pos => { buf[st].push(G('natural', { left: kxPos, cy: yPos(pos), h: 2.7 * s }).s); kxPos += s * 1.05; });
            if (nats.length) kxPos += s * 0.3;
            for (let i = 0; i < Math.abs(bb); i++) {
              const pos = (bb > 0 ? KS_POS[lc].s : KS_POS[lc].f)[i]; const yy = yPos(pos);
              buf[st].push((bb > 0 ? G('sharp', { left: kxPos, cy: yy, h: 2.75 * s }) : G('flat', { left: kxPos, bottom: yy + 0.72 * s, h: 2.45 * s })).s);
              kxPos += s * 1.05;
            }
            kxPos += s * 0.4;
          }
          if (mm.mi > 0 && mm.m.time && timeOf[mm.mi] !== timeOf[mm.mi - 1]) {
            const tt = timeOf[mm.mi];
            if (tt === 'C' || tt === 'C|') { const gc = G('common', { left: kxPos, cy: yPos(4), h: 2.1 * s }); buf[st].push(gc.s); if (tt === 'C|') buf[st].push(`<rect x="${f(gc.left + gc.w * 0.52 - s * 0.07)}" y="${f(yPos(8) - s * 0.5)}" width="${f(s * 0.14)}" height="${f(5 * s)}"/>`); }
            else {
              const [ta, td] = tt.split('/');
              const dig2 = (str, cy) => { let xx = kxPos; [...str].forEach(ch => { const gg = GL['n' + ch].b; const w = (gg[2] - gg[0]) / (gg[3] - gg[1]) * 1.95 * s; buf[st].push(G('n' + ch, { left: xx, cy, h: 1.95 * s }).s); xx += w + s * 0.05; }); };
              dig2(ta, yPos(6)); dig2(td, yPos(2));
            }
          }
          if (mm.m.clef && mm.m.clef[staffKey(st)]) mm.m.clef[staffKey(st)].forEach(([ct, c]) => {
            if (ct < 1e-6 && k === 0) return;
            const cx0 = ct < 1e-6 ? innerL + s * 0.5 : onX[+(+ct).toFixed(5)] - s * 2.5;
            if (c === 'treble') buf[st].push(G('gclef', { left: cx0, top: yPos(2) - 4.39 * s * 0.75, h: 7.0 * s * 0.75 }).s);
            else buf[st].push(G('fclef', { left: cx0, top: yPos(6) - 1.0 * s * 0.75, h: 3.5 * s * 0.75 }).s);
          });
          vlist.forEach(([vk, v]) => {
          const b = buf[st];
          const bottomDia = CLEF_BOTTOM_DIA[st];
          const recs = [];
          const forced = two ? (vk === '' ? 1 : -1) : 0;
          const rSh = two ? (vk === '' ? -s : s) : 0;
          v.items.forEach((it, ii) => {
            const id = `${prefix}-${mm.mi}-${st[0]}${vk}${ii}`;
            const xh = mm.wholeRest && it.rest && it.base === 'w' ? x0 + mW / 2 - s * 0.6 : onX[+it.t.toFixed(5)];
            const rec = { id, it, x: xh, st, mi: mm.mi, li };
            if (it.rest) {
              if (it.hidden) { rec.hidden = true; recs.push(rec); return; }
              let rs = rSh * (it.base === 'w' || it.base === 'h' ? 2 : 1);
              if (two) { const orr = otherRange(vk, it.t, it.len); if (orr) { if (vk === '') { const need = orr.hi + (it.base === 'q' ? 5 : 4); const cur = 4 - rs * 2 / s; if (need > cur) rs = -(need - 4) * s / 2; } else { const need = orr.lo - (it.base === 'q' ? 5 : 4); const cur = 4 - rs * 2 / s; if (need < cur) rs = (4 - need) * s / 2; } rs = Math.round(rs / s) * s; } }
              b.push(`<g class="nt rest" id="${id}">`);
              if (it.base === 'w') { const y = yPos(6) + rs; b.push(`<rect x="${f(xh)}" y="${f(y)}" width="${f(s * 1.2)}" height="${f(s * 0.5)}"/>`); }
              else if (it.base === 'h') { const y = yPos(4) + rs; b.push(`<rect x="${f(xh)}" y="${f(y - s * 0.5)}" width="${f(s * 1.2)}" height="${f(s * 0.5)}"/>`); }
              else if (it.base === 'q') b.push(G('r4', { left: xh, cy: yPos(4) + rs, h: 2.9 * s }).s);
              else if (it.base === '8') b.push(G('r8', { left: xh, top: yPos(4) - 0.75 * s + rs, h: 1.75 * s }).s);
              else b.push(G('r16', { left: xh, top: yPos(4) - 0.75 * s + rs, h: 2.75 * s }).s);
              if (it.dots) b.push(`<circle cx="${f(xh + s * 1.6)}" cy="${f(yPos(5) + rs)}" r="${f(s * 0.2)}"/>`);
              trackY(st, yPos(6) + rs - s, yPos(2) + rs + s);
              b.push('</g>');
              recs.push(rec); return;
            }
            const bd = CLEF_BOTTOM_DIA[clefAt(st, measureStart[mm.mi] + it.t)];
            const ps = it.pitches.map(p => ({ p, pos: p.dia - bd }));
            rec.ps = ps;
            const tk = +it.t.toFixed(5);
            if (vk === '') v1At[tk] = rec;
            else { const o = v1At[tk]; if (o && o.ps && ps.some(q => o.ps.some(q1 => Math.abs(q1.pos - q.pos) === 1))) rec.x += headW * 1.05; }
            const minPos = ps[0].pos, maxPos = ps[ps.length - 1].pos;
            rec.minPos = minPos; rec.maxPos = maxPos;
            recs.push(rec);
          });
          // stem directions & beams grouping
          const beat = time === '6/8' || time === '9/8' || time === '12/8' || time === '3/8' ? 1.5 : 1;
          const groups = []; let g = null;
          recs.forEach(r => {
            const it = r.it;
            const beamable = !it.rest && !it.hidden && (it.base === '8' || it.base === '16' || it.base === '32') && !it.mods.nb;
            const bIdx = Math.floor((it.t + 1e-6) / beat);
            if (beamable && g && g.bIdx === bIdx && g.last === recs.indexOf(r) - 1) { g.notes.push(r); g.last = recs.indexOf(r); }
            else { if (g && g.notes.length > 1) groups.push(g); g = beamable ? { bIdx, notes: [r], last: recs.indexOf(r) } : null; }
          });
          if (g && g.notes.length > 1) groups.push(g);
          const inGroup = new Set(); groups.forEach(gg => gg.notes.forEach(n => inGroup.add(n)));
          const dirOf = (lo, hi) => {
            if (lo == null) return 1;
            const dUp = hi - 4, dDown = 4 - lo; // distance above / below middle line
            return dUp >= dDown ? -1 : 1; // -1 = stem down
          };
          recs.forEach(r => { if (r.ps) r.dir = r.it.mods.su ? 1 : r.it.mods.sd ? -1 : forced || dirOf(r.minPos, r.maxPos); });
          groups.forEach(gg => {
            let lo = Infinity, hi = -Infinity; gg.notes.forEach(n => { lo = Math.min(lo, n.minPos); hi = Math.max(hi, n.maxPos); });
            let d = forced || dirOf(lo, hi);
            if (gg.notes[0].it.mods.su) d = 1; if (gg.notes[0].it.mods.sd) d = -1;
            gg.notes.forEach(n => n.dir = d); gg.dir = d;
          });
          // draw notes
          recs.forEach(r => {
            if (!r.ps) return;
            const it = r.it; const xh = r.x;
            const isWhole = it.base === 'w';
            const hw = isWhole ? wholeW : headW;
            r.hw = hw;
            const cls = 'nt' + (it.mods.hl ? ' ' + it.mods.hl : (spec.hand ? ' ' + (st === 'treble' ? 'rh' : 'lh') : ''));
            b.push(`<g class="${cls}" id="${r.id}" data-m="${r.ps.map(q => q.p.midi).join(',')}">`);
            // ledger lines
            const ledgers = new Set();
            r.ps.forEach(q => {
              if (q.pos <= -2) for (let lp = -2; lp >= q.pos; lp -= 2) ledgers.add(lp);
              if (q.pos >= 10) for (let lp = 10; lp <= q.pos; lp += 2) ledgers.add(lp);
            });
            // second-interval offsets
            const off = r.ps.map(() => 0);
            for (let i = 1; i < r.ps.length; i++) {
              if (r.ps[i].pos - r.ps[i - 1].pos === 1 && off[i - 1] === 0) {
                if (r.dir === 1) off[i] = hw - SW; else off[i - 1] = -(hw - SW);
              }
            }
            const hasOff = off.some(o => o !== 0);
            ledgers.forEach(lp => {
              const y = yPos(lp);
              const extra = hasOff ? hw : 0;
              const lx = xh - s * 0.35 - (r.dir === -1 && hasOff ? extra : 0);
              b.push(`<rect x="${f(lx)}" y="${f(y - s * 0.07)}" width="${f(hw + s * 0.7 + extra)}" height="${f(s * 0.14)}"/>`);
              trackY(st, y, y);
            });
            // accidentals
            let accCol = 0;
            for (let i = r.ps.length - 1; i >= 0; i--) {
              const q = r.ps[i]; if (q.p.show === null || q.p.show === undefined) continue;
              const yy = yPos(q.pos);
              const ax = xh + Math.min(0, off[i]) - s * 0.25 - accCol * s * 1.0;
              let gg;
              if (q.p.show === 1) gg = G('sharp', { right: ax, cy: yy, h: 2.75 * s });
              else if (q.p.show === -1) gg = G('flat', { right: ax, bottom: yy + 0.72 * s, h: 2.45 * s });
              else gg = G('natural', { right: ax, cy: yy, h: 2.7 * s });
              b.push(gg.s); accCol++;
            }
            // heads
            r.ps.forEach((q, i) => {
              const yy = yPos(q.pos);
              const hx = xh + off[i];
              const name = isWhole ? 'whole' : (it.base === 'h' ? 'headV' : 'headB');
              b.push(G(name, { left: hx, cy: yy, h: 1.0 * s }).s);
              trackY(st, yy - s * 0.5, yy + s * 0.5);
            });
            // stem
            const yLo = yPos(r.minPos), yHi = yPos(r.maxPos);
            if (!isWhole) {
              let len = s * 3.5 + (it.base === '16' ? s * 0.5 : 0) + (it.base === '32' ? s * 1.1 : 0);
              if (r.dir === 1) {
                r.sx = xh + headW - SW / 2; r.sy0 = yLo - s * 0.15; r.tip = yHi - len;
                if (!two && r.tip > yPos(4)) r.tip = yPos(4);
              } else {
                r.sx = xh + SW / 2; r.sy0 = yHi + s * 0.15; r.tip = yLo + len;
                if (!two && r.tip < yPos(4)) r.tip = yPos(4);
              }
            }
            // dots
            if (it.dots) {
              const flagged = !inGroup.has(r) && (it.base === '8' || it.base === '16') && r.dir === 1;
              r.ps.forEach(q => {
                const dp = q.pos % 2 === 0 ? q.pos + 1 : q.pos;
                for (let dd = 0; dd < it.dots; dd++) {
                  const dx = xh + hw + Math.max(0, ...off) + s * (flagged ? 0.85 : 0.45) + dd * s * 0.55;
                  b.push(`<circle cx="${f(dx)}" cy="${f(yPos(dp))}" r="${f(s * 0.2)}"/>`);
                }
              });
            }
            b.push('</g>');
            r.headY = { lo: yLo, hi: yHi };
            lineNotes.push(r);
          });
          // beams (compute final tips) then stems
          groups.forEach(gg => {
            const n = gg.notes; const d = gg.dir;
            const x1 = n[0].sx, x2 = n[n.length - 1].sx;
            const nat1 = n[0].tip, nat2 = n[n.length - 1].tip;
            let slope = (nat2 - nat1) / Math.max(x2 - x1, 1);
            const maxSl = 0.18; slope = Math.max(-maxSl, Math.min(maxSl, slope));
            if (Math.abs(nat2 - nat1) < s * 0.3) slope = 0;
            let y1 = nat1;
            const minLen = s * 3.0;
            n.forEach(r => {
              const by = y1 + slope * (r.sx - x1);
              const need = d === 1 ? (r.sy0 - minLen) : (r.sy0 + minLen);
              if (d === 1 && by > need) y1 -= by - need;
              if (d === -1 && by < need) y1 += need - by;
              // keep beam at least as far as natural tip of extreme notes
            });
            const beamY = x => y1 + slope * (x - x1);
            n.forEach(r => { r.tip = beamY(r.sx); });
            const bt = s * 0.5, bgap = s * 0.75;
            const b = buf[n[0].st];
            const beamPoly = (xa, xb, level) => {
              const off2 = d === 1 ? level * bgap : -level * bgap;
              const ya = beamY(xa) + off2, yb = beamY(xb) + off2;
              const t = d === 1 ? bt : -bt;
              b.push(`<polygon class="bm" points="${f(xa)},${f(ya)} ${f(xb)},${f(yb)} ${f(xb)},${f(yb + t)} ${f(xa)},${f(ya + t)}"/>`);
              trackY(n[0].st, ya, yb + t);
            };
            beamPoly(x1 - SW / 2, x2 + SW / 2, 0);
            // secondary beams
            const lvl2 = r => r.it.base === '16' || r.it.base === '32';
            for (let i = 0; i < n.length; i++) {
              if (!lvl2(n[i])) continue;
              let j = i; while (j + 1 < n.length && lvl2(n[j + 1])) j++;
              if (j > i) beamPoly(n[i].sx - SW / 2, n[j].sx + SW / 2, 1);
              else {
                const stub = s * 1.15;
                if (i > 0) beamPoly(n[i].sx - stub, n[i].sx + SW / 2, 1);
                else beamPoly(n[i].sx - SW / 2, n[i].sx + stub, 1);
              }
              i = j;
            }
            const lvl3 = r => r.it.base === '32';
            for (let i = 0; i < n.length; i++) {
              if (!lvl3(n[i])) continue;
              let j = i; while (j + 1 < n.length && lvl3(n[j + 1])) j++;
              if (j > i) beamPoly(n[i].sx - SW / 2, n[j].sx + SW / 2, 2);
              else beamPoly(i > 0 ? n[i].sx - s * 1.0 : n[i].sx - SW / 2, i > 0 ? n[i].sx + SW / 2 : n[i].sx + s * 1.0, 2);
              i = j;
            }
            gg.beamMid = { x: (x1 + x2) / 2, y: beamY((x1 + x2) / 2) };
            if (n[0].it.trip && !(spec.tupletsUntil != null && n[0].mi >= spec.tupletsUntil)) {
              const ty = d === 1 ? gg.beamMid.y - s * 1.0 : gg.beamMid.y + s * 2.0;
              b.push(`<text class="tup" x="${f(gg.beamMid.x)}" y="${f(ty)}" text-anchor="middle" font-size="${f(s * 1.35)}" font-style="italic" font-weight="700">3</text>`);
              trackY(n[0].st, ty - s * 1.4, ty);
            }
          });
          // stems + flags
          recs.forEach(r => {
            if (!r.ps || r.it.base === 'w') return;
            const b2 = buf[st];
            const yA = Math.min(r.sy0, r.tip), yB = Math.max(r.sy0, r.tip);
            b2.push(`<rect class="stm" data-for="${r.id}" x="${f(r.sx - SW / 2)}" y="${f(yA)}" width="${f(SW)}" height="${f(yB - yA)}"/>`);
            trackY(st, yA, yB);
            if (!inGroup.has(r) && (r.it.base === '8' || r.it.base === '16')) {
              const nm = r.it.base === '8' ? 'flag8' : 'flag16';
              const hh = r.it.base === '8' ? 3.2 * s : 3.7 * s;
              if (r.dir === 1) b2.push(G(nm, { left: r.sx - SW / 2, top: r.tip, h: hh }).s);
              else b2.push(G(nm, { left: r.sx - SW / 2, top: r.tip - hh, h: hh, flipY: true }).s);
            }
          });
          // articulations, fingering, names, texts
          recs.forEach(r => {
            if (!r.ps) { if (r.it.mods.t) rows[st].below.push({ x: r.x + s * 0.6, t: String(r.it.mods.t).replace(/_/g, ' ') }); if (r.it.mods.Pu || r.it.mods.pu) rows[st].ped.push({ x: r.x, kind: r.it.mods.pu ? 'u' : 'U', r }); return; }
            const it = r.it; const b2 = buf[st];
            const cx = r.x + (r.hw || headW) / 2;
            const awayUp = r.dir === -1; // articulation side: opposite stem
            const artPos = () => {
              if (awayUp) { let p = r.maxPos + 2; if (p >= 0 && p <= 8 && p % 2 === 0) p += 1; return yPos(p); }
              let p = r.minPos - 2; if (p >= 0 && p <= 8 && p % 2 === 0) p -= 1; return yPos(p);
            };
            if (it.mods.st) { const y = artPos(); b2.push(`<circle cx="${f(cx)}" cy="${f(y)}" r="${f(s * 0.22)}"/>`); trackY(st, y, y); }
            if (it.mods.tn) { const y = artPos(); b2.push(`<rect x="${f(cx - s * 0.6)}" y="${f(y - s * 0.08)}" width="${f(s * 1.2)}" height="${f(s * 0.16)}"/>`); }
            if (it.mods.ac) {
              let y = artPos(); if (it.mods.st) y += awayUp ? -s : s;
              b2.push(`<polyline points="${f(cx - s * 0.6)},${f(y - s * 0.4)} ${f(cx + s * 0.6)},${f(y)} ${f(cx - s * 0.6)},${f(y + s * 0.4)}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.14)}"/>`);
              trackY(st, y - s * 0.5, y + s * 0.5);
            }
            if (it.mods.mc) {
              const y = Math.min(yPos(10), r.headY.hi - s * 1.3, (r.dir === 1 && r.tip != null ? r.tip : yPos(10)) - s * 1.0);
              b2.push(`<polyline points="${f(cx - s * 0.55)},${f(y + s * 0.4)} ${f(cx)},${f(y - s * 0.6)} ${f(cx + s * 0.55)},${f(y + s * 0.4)}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.18)}"/>`);
              trackY(st, y - s * 0.8, y);
            }
            if (it.mods.o) {
              const y = Math.min(yPos(10), r.headY.hi - s * 1.4, (r.dir === 1 && r.tip != null ? r.tip : yPos(10)) - s * 0.9);
              const sw = f(s * 0.17); const o = it.mods.o;
              if (o === 'prall' || o === 'mord') {
                const pts = []; for (let i = 0; i <= 4; i++) pts.push(`${f(cx - s * 0.9 + i * s * 0.45)},${f(y + (i % 2 ? -s * 0.32 : s * 0.32))}`);
                b2.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round"/>`);
                if (o === 'mord') b2.push(`<line x1="${f(cx)}" x2="${f(cx)}" y1="${f(y - s * 0.75)}" y2="${f(y + s * 0.75)}" stroke="currentColor" stroke-width="${sw}"/>`);
              } else if (o === 'turn') {
                b2.push(`<path d="M${f(cx - s * 0.95)},${f(y + s * 0.05)} C${f(cx - s * 0.95)},${f(y - s * 0.6)} ${f(cx - s * 0.25)},${f(y - s * 0.45)} ${f(cx)},${f(y)} C${f(cx + s * 0.25)},${f(y + s * 0.45)} ${f(cx + s * 0.95)},${f(y + s * 0.6)} ${f(cx + s * 0.95)},${f(y - s * 0.05)}" fill="none" stroke="currentColor" stroke-width="${sw}"/>`);
              } else if (o === 'tr') {
                b2.push(`<text x="${f(cx)}" y="${f(y + s * 0.45)}" text-anchor="middle" font-size="${f(s * 1.6)}" font-style="italic" font-weight="700" font-family="Georgia, 'Times New Roman', serif">tr</text>`);
              }
              trackY(st, y - s * 0.9, y + s * 0.5);
            }
            if (it.mods.fe) {
              const y = Math.min(yPos(10), r.headY.hi - s * 1.2, (r.dir === 1 && r.tip != null ? r.tip : yPos(10)) - s * 0.6);
              const g2 = G('fermata', { cx, bottom: y, w: 2.2 * s }); b2.push(g2.s); trackY(st, g2.top, y);
            }
            if (it.mods.f && spec.fingers !== false) {
              const digs = String(it.mods.f).split('');
              digs.forEach((dg, i) => rows[st].fing.push({ x: cx, t: dg, r, i, n: digs.length, below: st === 'bass' ? !(two && vk === '') : vk === '2' }));
            }
            if (isNamed(st) || it.mods.n) rows[st].names.push({ x: cx, t: r.ps.map(q => MU.deName(q.p)).join('·'), r, cls: st === 'treble' ? 'rh' : 'lh' });
            if (it.mods.t) rows[st].below.push({ x: cx, t: String(it.mods.t).replace(/_/g, ' ') });
            if (it.mods.d) rows[st].dyn.push({ x: r.x, t: it.mods.d });
            if (it.mods.h) rows[st].dyn.push({ x: r.x, hp: it.mods.h });
            [['pd', 'd'], ['Pd', 'D'], ['pc', 'c'], ['pu', 'u'], ['Pu', 'U']].forEach(([k, kind]) => { if (it.mods[k]) rows[st].ped.push({ x: r.x, kind, r }); });
          });
          // events for playback + note records (ties carry across barlines per staff/voice)
          let lastEv = tieCarry[st + vk] || null;
          recs.forEach(r => {
            const it = r.it;
            noteRec[r.id] = r;
            const sb = measureStart[mm.mi] + it.t;
            if (it.mods.pd || it.mods.Pd) pedals.push({ t: sb, k: 'd' });
            if (it.mods.pc) pedals.push({ t: sb, k: 'c' });
            if (it.mods.pu || it.mods.Pu) pedals.push({ t: sb + it.len, k: 'u' });
            if (r.ps) {
              const midis = r.ps.map(q => q.p.midi);
              const startBeat = measureStart[mm.mi] + it.t;
              if (lastEv && lastEv.tie && lastEv.midis.join() === midis.join() && Math.abs(lastEv.t + lastEv.dur - startBeat) < 1e-6) {
                lastEv.dur += it.len; lastEv.tie = !!it.mods['~']; lastEv.ids.push(r.id);
              } else {
                lastEv = { t: startBeat, dur: it.len, midis, ids: [r.id], st, tie: !!it.mods['~'], mi: mm.mi, dyn: it.mods.d || null, ped: it.mods.pd ? 'd' : it.mods.pc ? 'c' : null, pedUp: !!it.mods.pu, st2: it.mods.st, ac: it.mods.ac };
                events.push(lastEv);
              }
            } else if (!r.hidden) lastEv = null;
          });
          tieCarry[st + vk] = lastEv && lastEv.tie ? lastEv : null;
          mm['recs_' + st + vk] = recs;
          });
        });
        // barline
        mx += mW;
        const nxM = M[mm.mi + 1]; const keyChNext = nxM && nxM.m.key && keyOf[mm.mi + 1] !== keyOf[mm.mi];
        barXs.push({ x: mx, type: mm.m.end || (li === lastLineIdx && k === line.measures.length - 1 ? (spec.final === false ? '|' : '|.') : (keyChNext ? '||' : '|')), begin: beginRep ? x0 : null });
      });

      // ties & slurs (within all measures of this line; cross-line handled by half ties)
      const lineRecs = [];
      staves.forEach(st => ['', '2'].forEach(vk => { const list = []; line.measures.forEach(mm => { if (mm['recs_' + st + vk]) list.push(...mm['recs_' + st + vk].filter(r => !r.hidden)); }); if (list.length || vk === '') lineRecs.push({ st, vk, list }); }));
      lineRecs.forEach(({ st, vk, list }) => {
        const b = buf[st]; const lk = st + vk;
        const tieCurve = (xa, xb, y, down) => {
          const h = Math.min(s * 0.9, (xb - xa) * 0.25 + s * 0.2), th = s * 0.16;
          const sg = down ? 1 : -1; const mxp = (xa + xb) / 2;
          return `<path class="tie" d="M${f(xa)},${f(y)} Q${f(mxp)},${f(y + sg * h * 2)} ${f(xb)},${f(y)} Q${f(mxp)},${f(y + sg * (h * 2 - th * 2))} ${f(xa)},${f(y)}Z"/>`;
        };
        list.forEach((r, i) => {
          if (!r.ps || !r.it.mods['~']) return;
          let nx = list[i + 1]; if (nx && nx.mi - r.mi > 1) nx = null;
          const down = r.dir === 1;
          r.ps.forEach(q => {
            const yy = yPos(q.pos) + (down ? s * 0.55 : -s * 0.55);
            const xa = r.x + r.hw + s * 0.15;
            const xb = nx && nx.ps ? nx.x - s * 0.15 : (W - s * 0.6);
            b.push(tieCurve(xa, xb, yy, down)); trackY(st, yy - s, yy + s);
          });
          r._tieOpen = !nx;
        });
        // incoming half ties at line start
        if (li > 0) {
          const first = list.find(r => r.ps);
          const prevRecs = lines[li - 1]._lastRec && lines[li - 1]._lastRec[lk];
          if (first && prevRecs && prevRecs.ps && prevRecs.it.mods['~']) {
            const down = prevRecs.dir === 1;
            first.ps.forEach(q => {
              const yy = yPos(q.pos) + (down ? s * 0.55 : -s * 0.55);
              b.push(tieCurve(line.pre - s * 0.6, first.x - s * 0.15, yy, down));
            });
          }
        }
        line._lastRec = line._lastRec || {}; line._lastRec[lk] = [...list].reverse().find(r => !r.it.rest) || null;
        // slurs
        let open = null;
        list.forEach(r => {
          if (r.it.mods['('] && r.headY) open = r;
          if (r.it.mods[')'] && open && r.headY) {
            const a = open, z = r;
            const above = a.dir === -1 || z.dir === -1 ? true : false;
            const ya = above ? Math.min(a.headY.hi, a.dir === 1 && a.tip != null ? a.tip : a.headY.hi) - s * 0.8 : a.headY.lo + s * 0.9;
            const yz = above ? Math.min(z.headY.hi, z.dir === 1 && z.tip != null ? z.tip : z.headY.hi) - s * 0.8 : z.headY.lo + s * 0.9;
            const xa = a.x + headW / 2, xz = z.x + headW / 2;
            let peak = above ? Math.min(ya, yz) : Math.max(ya, yz);
            list.forEach(q => { if (q.ps && q.x > xa && q.x < xz) peak = above ? Math.min(peak, q.headY.hi - s * 0.9, q.dir === 1 && q.tip != null ? q.tip - s * 0.6 : peak) : Math.max(peak, q.headY.lo + s * 0.9); });
            const sg = above ? -1 : 1; const hgt = s * 1.0 + Math.min(s * 1.2, (xz - xa) * 0.04);
            const c1x = xa + (xz - xa) * 0.25, c2x = xa + (xz - xa) * 0.75;
            const cy = peak + sg * hgt; const th = s * 0.22;
            b.push(`<path class="slur" d="M${f(xa)},${f(ya)} C${f(c1x)},${f(cy)} ${f(c2x)},${f(cy)} ${f(xz)},${f(yz)} C${f(c2x)},${f(cy - sg * th)} ${f(c1x)},${f(cy - sg * th)} ${f(xa)},${f(ya)}Z"/>`);
            trackY(st, cy - s * 0.4, cy + s * 0.4);
            open = null;
          }
        });
      });

      // rows: fingering, names, below text, dynamics, pedal
      staves.forEach(st => {
        const b = buf[st]; const R = rows[st];
        const fs = s * 1.2;
        R.fing.forEach(o => {
          const r = o.r;
          if (!o.below) {
            const top = Math.min(r.headY.hi - s * 0.9, r.dir === 1 && r.tip != null ? r.tip - s * 0.5 : r.headY.hi - s * 0.9, yPos(9) - s * 0.2);
            const y = top - o.i * fs * 0.95;
            b.push(`<text class="fg" x="${f(o.x)}" y="${f(y)}" text-anchor="middle" font-size="${f(fs)}" font-weight="700">${o.t}</text>`); trackY(st, y - fs, y);
          } else {
            const bot = Math.max(r.headY.lo + s * 1.9, r.dir === -1 && r.tip != null ? r.tip + s * 1.4 : r.headY.lo + s * 1.9, yPos(-1) + s * 1.2);
            const yy = bot + (o.n - 1 - o.i) * fs * 0.95;
            b.push(`<text class="fg" x="${f(o.x)}" y="${f(yy)}" text-anchor="middle" font-size="${f(fs)}" font-weight="700">${o.t}</text>`); trackY(st, yy - fs, yy + s * 0.2);
          }
        });
        let low = ext[st].max;
        if (R.names.length) {
          const y = low + s * 1.9;
          R.names.forEach(o => { b.push(`<text class="nm ${o.cls}" x="${f(o.x)}" y="${f(y)}" text-anchor="middle" font-size="${f(s * 1.25)}">${o.t}</text>`); });
          trackY(st, y, y + s * 0.4); low = y + s * 0.4;
        }
        if (R.below.length) {
          const y = Math.max(ext[st].max, 4 * s) + s * 1.8;
          R.below.forEach(o => b.push(`<text class="cnt" x="${f(o.x)}" y="${f(y)}" text-anchor="middle" font-size="${f(s * 1.2)}">${o.t}</text>`));
          trackY(st, y, y + s * 0.4); low = y + s * 0.4;
        }
        if (R.dyn.length) {
          const y = Math.max(ext[st].max, 4 * s) + s * 2.2;
          let hp = null;
          R.dyn.forEach(o => {
            if (o.t) {
              let x = o.x - s * 0.2;
              [...o.t].forEach(ch => {
                const nm = { p: 'dp', m: 'dm', f: 'df' }[ch]; if (!nm) { b.push(`<text x="${f(x)}" y="${f(y)}" font-size="${f(s * 1.75)}" font-style="italic" font-weight="700" font-family="'Times New Roman', Georgia, serif">${ch}</text>`); x += s * (ch === 'r' ? 0.75 : 0.7); return; }
                const g = G(nm, { left: x, bottom: y + s * 0.0 + (ch === 'm' ? 0 : (GL[nm].b[1] < -100 ? (-GL[nm].b[1]) * (1.3 * s / 450) : 0)), h: (GL[nm].b[3] - GL[nm].b[1]) * (1.3 * s / 450) });
                b.push(g.s); x += g.w + s * 0.05;
              });
              trackY(st, y - s * 1.6, y + s * 0.6);
            } else if (o.hp === '<' || o.hp === '>') { const dynHere = R.dyn.find(q => q.t && Math.abs(q.x - o.x) < 0.5); hp = { x: o.x + (dynHere ? s * (dynHere.t.length * 1.3 + 0.6) : 0), k: o.hp }; }
            else if (o.hp === '.' && hp) {
              const x1 = hp.x, x2 = o.x + s * 0.8, yy = y - s * 0.55, h = s * 0.55;
              const pts = hp.k === '<' ? [[x2, yy - h], [x1, yy], [x2, yy + h]] : [[x1, yy - h], [x2, yy], [x1, yy + h]];
              b.push(`<polyline points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.13)}"/>`);
              trackY(st, yy - h, yy + h); hp = null;
            }
          });
          low = y + s * 0.6;
        }
        if (R.ped.length) {
          const y = Math.max(ext[st].max, 4 * s) + s * 2.4;
          let start = pedOpen[st] ? line.pre - s * 0.4 : null;
          R.ped.forEach(o => {
            if (o.kind === 'D') { b.push(G('ped', { left: o.x - s * 0.3, bottom: y, w: 2.6 * s }).s); }
            else if (o.kind === 'U') { b.push(G('pedup', { left: o.x + s * 0.6, bottom: y, h: 1.2 * s }).s); }
            else if (o.kind === 'd') { start = o.x; b.push(`<path class="ped" d="M${f(o.x)},${f(y - s * 1.1)} L${f(o.x)},${f(y)}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.13)}"/>`); }
            else if (o.kind === 'c' && start != null) {
              const cx = o.x;
              b.push(`<path class="ped" d="M${f(start)},${f(y)} L${f(cx - s * 0.45)},${f(y)} L${f(cx)},${f(y - s * 1.0)} L${f(cx + s * 0.45)},${f(y)}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.13)}"/>`);
              start = cx + s * 0.45;
            } else if (o.kind === 'u' && start != null) {
              const ex = o.x + (o.r.hw || headW) + s * 0.6;
              b.push(`<path class="ped" d="M${f(start)},${f(y)} L${f(ex)},${f(y)} L${f(ex)},${f(y - s * 1.1)}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.13)}"/>`);
              start = null;
            }
          });
          if (start != null) b.push(`<path class="ped" d="M${f(start)},${f(y)} L${f(Math.min(W - 1, (barXs.length ? barXs[barXs.length - 1].x : W)))},${f(y)}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.13)}"/>`);
          pedOpen[st] = start != null;
          trackY(st, y - s * 1.6, y + s * 0.3);
        } else if (pedOpen[st]) {
          const y = Math.max(ext[st].max, 4 * s) + s * 2.4;
          b.push(`<path class="ped" d="M${f(line.pre - s * 0.4)},${f(y)} L${f(Math.min(W - 1, (barXs.length ? barXs[barXs.length - 1].x : W)))},${f(y)}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.13)}"/>`);
          trackY(st, y - s * 1.6, y + s * 0.3);
        }
      });

      // chord symbols / texts above top staff
      const top = staves[0];
      if (chordTexts.length) {
        const baseY = Math.min(ext[top].min, 0) - s * 1.4;
        chordTexts.forEach(c => {
          if (c.volta) {
            const yv = baseY - s * 2.6;
            buf[top].push(`<path d="M${f(c.x)},${f(yv + s * 1.6)} L${f(c.x)},${f(yv)} L${f(c.x + c.w)},${f(yv)}${c.open ? '' : ` L${f(c.x + c.w)},${f(yv + s * 1.6)}`}" fill="none" stroke="currentColor" stroke-width="${f(s * 0.12)}"/>`);
            buf[top].push(`<text x="${f(c.x + s * 0.4)}" y="${f(yv + s * 1.4)}" font-size="${f(s * 1.3)}" font-weight="700">${c.volta}</text>`);
            trackY(top, yv - s * 0.2, yv);
            return;
          }
          const y = c.row === 1 ? baseY - s * 1.6 : c.row === 2 ? baseY - s * 3.2 : baseY;
          buf[top].push(`<text class="${c.it ? 'mk' : 'ch'}" x="${f(c.x)}" y="${f(y)}"${c.end ? ' text-anchor="end"' : ''} font-size="${f(c.small ? s * 1.15 : s * 1.45)}"${c.it ? ' font-style="italic" font-weight="700"' : ' font-weight="700"'}>${c.t}</text>`);
          trackY(top, y - s * 1.5, y);
        });
      }
      if (li > 0 && spec.numbers !== false) {
        buf[top].push(`<text class="mn" x="${f(braceW + s * 0.4)}" y="${f(Math.min(ext[top].min, 0) - s * 0.8)}" font-size="${f(s * 1.05)}">${line.measures[0].mi + 1 + (spec.numOffset || 0)}</text>`);
        trackY(top, Math.min(ext[top].min, 0) - s * 2, 0);
      }

      // ---------- stack staves ----------
      const pad = s * 0.8;
      const offs = {}; let y = yCursor + pad - ext[staves[0]].min;
      staves.forEach((st, i) => {
        if (i > 0) { const prev = staves[i - 1]; y = offs[prev] + ext[prev].max - ext[st].min + s * 1.6; y = Math.max(y, offs[prev] + 4 * s + s * 6); }
        offs[st] = y;
      });
      const lastSt = staves[staves.length - 1];
      const lineBottom = offs[lastSt] + ext[lastSt].max + pad;
      // staff lines (end at the last barline of the line)
      const lineEnd = Math.min(barXs.length ? barXs[barXs.length - 1].x : W, W - 1);
      staves.forEach(st => {
        out.push(`<g class="staff" transform="translate(0,${f(offs[st])})">`);
        for (let i = 0; i < 5; i++) out.push(`<rect class="sl" x="${f(braceW)}" y="${f(i * s - s * 0.05)}" width="${f(lineEnd - braceW)}" height="${f(s * 0.1)}"/>`);
        out.push(buf[st].join(''));
        out.push('</g>');
      });
      // measure hit rects (for highlighting a whole bar)
      measureRects.filter(r => r.li === li).forEach(r => {
        r.y = offs[staves[0]] - s * 0.6; r.h = offs[lastSt] + 4 * s + s * 0.6 - r.y;
        out.splice(0, 0, `<rect class="mbar" id="${prefix}-m${r.mi}" x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="${f(r.h)}" fill="transparent"/>`);
      });
      // barlines
      const yTop = offs[staves[0]], yBot = offs[lastSt] + 4 * s;
      const bl = (x, w) => out.push(`<rect class="bl" x="${f(x - w / 2)}" y="${f(yTop)}" width="${f(w)}" height="${f(yBot - yTop)}"/>`);
      const dots = (x) => staves.forEach(st => { [3, 5].forEach(p => out.push(`<circle cx="${f(x)}" cy="${f(offs[st] + yPos(p))}" r="${f(s * 0.22)}"/>`)); });
      bl(braceW + 0.5, s * 0.12);
      barXs.forEach(bx => {
        const x = Math.min(bx.x, W - 1);
        if (bx.begin != null) { bl(bx.begin + s * 0.25, s * 0.5); bl(bx.begin + s * 1.0, s * 0.12); dots(bx.begin + s * 1.5); }
        if (bx.type === '|.') { bl(x - s * 1.0, s * 0.12); bl(x - s * 0.25, s * 0.5); }
        else if (bx.type === '||') { bl(x - s * 0.6, s * 0.12); bl(x - s * 0.06, s * 0.12); }
        else if (bx.type === ':|') { dots(x - s * 1.5); bl(x - s * 1.0, s * 0.12); bl(x - s * 0.25, s * 0.5); }
        else bl(x - s * 0.06, s * 0.12);
      });
      if (staves.length > 1) {
        const hB = yBot - yTop;
        out.push(G('brace', { left: s * 0.1, top: yTop, hy: hB, h: hB, sx: 0.0 + (s * 1.1) / ((GL.brace.b[2] - GL.brace.b[0]) * hB / (GL.brace.b[3] - GL.brace.b[1])) }).s);
      }
      yCursor = lineBottom;
    });

    const H = Math.ceil(yCursor);
    const svg = `<svg class="score" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${H}" width="${f(W)}" height="${H}" fill="currentColor" role="img"${spec.label ? ` aria-label="${spec.label}"` : ''}>${out.join('')}</svg>`;
    const totalBeats = M.reduce((a, mm) => a + mm.len, 0);
    return { svg, events, pedals, totalBeats, measureStart, measures: M.map(mm => ({ mi: mm.mi, len: mm.len })), prefix };
  }
  return { render, parseToken, parseVoice };
})();

/* ---------- Keyboard (SVG string) ---------- */
const Kbd = (() => {
  const f = v => Math.round(v * 100) / 100;
  // opts: from, to (midi; should start/end on white keys), width, marks {midi:{cls, fin, lab}}, labels: 'c'|'all'|'none'|'oct', groups:bool
  function render(o) {
    const from = o.from, to = o.to;
    const whites = []; for (let m = from; m <= to; m++) if (!MU.isBlack(m)) whites.push(m);
    const W = o.width || 600; const u = W / whites.length; const H = o.height || Math.min(u * 4.6, 150);
    const bw = u * 0.6, bh = H * 0.62;
    const marks = o.marks || {};
    const out = [];
    const wx = {}; whites.forEach((m, i) => wx[m] = i * u);
    whites.forEach((m, i) => {
      const mk = marks[m];
      out.push(`<g class="key wk${mk ? ' ' + (mk.cls || 'hl') : ''}" data-m="${m}"><rect fill="#fbfaf7" stroke="#2a2d33" stroke-width="1" x="${f(i * u + 0.5)}" y="0.5" width="${f(u - 1)}" height="${f(H - 1)}" rx="${f(Math.min(4, u * 0.12))}"/>`);
      let lab = null;
      if (mk && mk.lab != null) lab = mk.lab;
      else if (o.labels === 'all') lab = MU.deMidi(m, false).toUpperCase().replace('H', 'H');
      else if (o.labels === 'oct') lab = MU.deMidi(m, true);
      else if (o.labels === 'c' && m % 12 === 0) lab = MU.deMidi(m, true);
      if (lab) out.push(`<text x="${f(i * u + u / 2)}" y="${f(H - Math.min(u * 0.35, 10))}" text-anchor="middle" font-size="${f(Math.min(u * 0.42, 13))}" class="klab">${lab}</text>`);
      if (mk && mk.fin) out.push(`<circle cx="${f(i * u + u / 2)}" cy="${f(H * 0.72)}" r="${f(Math.min(u * 0.32, 11))}" class="kfin"/><text x="${f(i * u + u / 2)}" y="${f(H * 0.72 + Math.min(u * 0.15, 5))}" text-anchor="middle" font-size="${f(Math.min(u * 0.4, 13))}" class="kfint">${mk.fin}</text>`);
      out.push('</g>');
    });
    for (let m = from; m <= to; m++) {
      if (!MU.isBlack(m)) continue;
      const left = wx[m - 1]; if (left == null) continue;
      const x = left + u - bw / 2;
      const mk = marks[m];
      out.push(`<g class="key bk${mk ? ' ' + (mk.cls || 'hl') : ''}" data-m="${m}"><rect fill="#1b1d22" x="${f(x)}" y="0" width="${f(bw)}" height="${f(bh)}" rx="${f(Math.min(3, u * 0.08))}"/>`);
      if (mk && mk.lab) out.push(`<text x="${f(x + bw / 2)}" y="${f(bh - Math.min(u * 0.25, 7))}" text-anchor="middle" font-size="${f(Math.min(u * 0.32, 11))}" class="klab bl">${mk.lab}</text>`);
      if (mk && mk.fin) out.push(`<circle cx="${f(x + bw / 2)}" cy="${f(bh * 0.55)}" r="${f(Math.min(u * 0.26, 9))}" class="kfin"/><text x="${f(x + bw / 2)}" y="${f(bh * 0.55 + Math.min(u * 0.12, 4))}" text-anchor="middle" font-size="${f(Math.min(u * 0.32, 11))}" class="kfint">${mk.fin}</text>`);
      out.push('</g>');
    }
    // arrows / spans
    (o.spans || []).forEach(sp => {
      const cx = mm => MU.isBlack(mm) ? wx[mm - 1] + u : wx[mm] + u / 2;
      const x1 = cx(sp.a), x2 = cx(sp.b), y = H + 14;
      out.push(`<path class="kspan" d="M${f(x1)},${f(H + 4)} L${f(x1)},${f(y)} L${f(x2)},${f(y)} L${f(x2)},${f(H + 4)}" fill="none" stroke-width="1.6"/><text x="${f((x1 + x2) / 2)}" y="${f(y + 15)}" text-anchor="middle" font-size="12" class="kspant">${sp.t}</text>`);
    });
    const HH = H + ((o.spans || []).length ? 34 : 2);
    return `<svg class="kbd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(HH)}" width="${f(W)}" height="${f(HH)}" role="img">${out.join('')}</svg>`;
  }
  return { render };
})();

if (typeof module !== 'undefined') module.exports = { MU, Engrave, Kbd, keyAlters, KEYSIG };
