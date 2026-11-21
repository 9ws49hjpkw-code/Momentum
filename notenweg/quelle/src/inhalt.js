/* ===== Notenweg content v2: chords, lead-sheet generator, library, repertoire ===== */
const C2 = (() => {
  const LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- chord theory ---------- */
  // intervals as [letter steps, semitones]
  const IV = { 1: [0, 0], b3: [2, 3], 3: [2, 4], 4: [3, 5], b5: [4, 6], 5: [4, 7], s5: [4, 8], 6: [5, 9], bb7: [6, 9], b7: [6, 10], 7: [6, 11], 9: [1, 2], 2: [1, 2] };
  const TYPES = {
    '': { name: 'Dur', iv: ['1', '3', '5'], de: 'Dur-Dreiklang: große Terz + kleine Terz (4 + 3 Halbtöne)' },
    m: { name: 'Moll', iv: ['1', 'b3', '5'], de: 'Moll-Dreiklang: kleine Terz + große Terz (3 + 4 Halbtöne)' },
    dim: { name: 'vermindert', iv: ['1', 'b3', 'b5'], de: 'zwei kleine Terzen (3 + 3 Halbtöne)' },
    aug: { name: 'übermäßig', iv: ['1', '3', 's5'], de: 'zwei große Terzen (4 + 4 Halbtöne)' },
    sus2: { name: 'sus2', iv: ['1', '2', '5'], de: 'Terz ersetzt durch die große Sekunde – offen, schwebend' },
    sus4: { name: 'sus4', iv: ['1', '4', '5'], de: 'Terz ersetzt durch die Quarte – will sich zur Terz auflösen' },
    7: { name: 'Dominantseptakkord', iv: ['1', '3', '5', 'b7'], de: 'Dur-Dreiklang + kleine Septime – will sich auflösen' },
    maj7: { name: 'großer Septakkord', iv: ['1', '3', '5', '7'], de: 'Dur-Dreiklang + große Septime – weich, filmisch' },
    m7: { name: 'Moll-Septakkord', iv: ['1', 'b3', '5', 'b7'], de: 'Moll-Dreiklang + kleine Septime – melancholisch-weich' },
    m7b5: { name: 'halbvermindert', iv: ['1', 'b3', 'b5', 'b7'], de: 'verminderter Dreiklang + kleine Septime' },
    dim7: { name: 'verminderter Septakkord', iv: ['1', 'b3', 'b5', 'bb7'], de: 'drei kleine Terzen übereinander – sehr gespannt' },
    add9: { name: 'add9', iv: ['1', '3', '5', '9'], de: 'Dur-Dreiklang + None (große Sekunde eine Oktave höher) – hell, typisch Neoklassik' },
    madd9: { name: 'Moll add9', iv: ['1', 'b3', '5', '9'], de: 'Moll-Dreiklang + None – der Neoklassik-Klang schlechthin' }
  };
  const TYPE_ORDER = ['', 'm', '7', 'maj7', 'm7', 'sus2', 'sus4', 'add9', 'madd9', 'dim', 'aug', 'm7b5', 'dim7'];
  const symSuffix = t => ({ '': '', m: 'm', dim: '°', aug: '+', sus2: 'sus2', sus4: 'sus4', 7: '7', maj7: 'maj7', m7: 'm7', m7b5: 'm7♭5', dim7: '°7', add9: 'add9', madd9: 'm(add9)' })[t];
  // spelled pitch from root {letter, alter} plus interval
  function addIv(root, ivKey) {
    const [st, sm] = IV[ivKey];
    const li = (LET.indexOf(root.letter) + st) % 7; const letter = LET[li];
    const rootPc = (SEMI[root.letter] + root.alter + 1200) % 12;
    const targetPc = (rootPc + sm) % 12;
    let alter = targetPc - SEMI[letter]; if (alter > 6) alter -= 12; if (alter < -6) alter += 12;
    return { letter, alter };
  }
  const accStr = a => a > 0 ? '#'.repeat(a) : a < 0 ? 'b'.repeat(-a) : '';
  // parse chord symbol like "F#m7", "Bb", "D7", "C/E", "Am(add9)"
  function parseSym(sym) {
    const m = /^([A-H])(#|b)?(m\(add9\)|madd9|maj7|m7b5|m7♭5|m7|dim7|°7|dim|°|aug|\+|sus2|sus4|add9|m|7)?(?:\/([A-H])(#|b)?)?$/.exec(sym);
    if (!m) return null;
    let letter = m[1]; let alter = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    if (letter === 'H') letter = 'B';
    let t = m[3] || '';
    t = ({ 'm(add9)': 'madd9', '°': 'dim', '+': 'aug', '°7': 'dim7', 'm7♭5': 'm7b5' })[t] || t;
    const bass = m[4] ? { letter: m[4] === 'H' ? 'B' : m[4], alter: m[5] === '#' ? 1 : m[5] === 'b' ? -1 : 0 } : null;
    return { root: { letter, alter }, type: t, bass };
  }
  function chordNotes(sym) {
    const c = typeof sym === 'string' ? parseSym(sym) : sym; if (!c) return null;
    return TYPES[c.type].iv.map(k => addIv(c.root, k));
  }
  const pcOf = n => (SEMI[n.letter] + n.alter + 1200) % 12;
  const deNote = n => MU.deSpelled(n.letter, n.alter);
  // German display of a chord symbol: H for B, B for Bb
  function deSym(sym) {
    const c = parseSym(sym); if (!c) return sym;
    const rn = c.root.letter === 'B' ? (c.root.alter === -1 ? 'B' : c.root.alter === 0 ? 'H' : 'H' + accStr(c.root.alter).replace('#', '♯')) : c.root.letter + (c.root.alter ? (c.root.alter > 0 ? '♯' : '♭') : '');
    let s = rn + symSuffix(c.type);
    if (c.bass) s += '/' + (c.bass.letter === 'B' ? (c.bass.alter === -1 ? 'B' : 'H') : c.bass.letter + (c.bass.alter ? (c.bass.alter > 0 ? '♯' : '♭') : ''));
    return s;
  }
  // concrete voicing: list of pitch strings near a target range (close position, given inversion)
  function voicing(sym, inv = 0, lowMidi = 60) {
    const ns = chordNotes(sym); if (!ns) return [];
    const ord = ns.slice(inv).concat(ns.slice(0, inv));
    const out = []; let prev = null;
    ord.forEach((n, i) => {
      let oct = 2; let midi;
      const base = SEMI[n.letter] + n.alter;
      do { midi = (oct + 1) * 12 + base; if (prev == null ? midi >= lowMidi : midi > prev) break; oct++; } while (oct < 8);
      prev = midi; out.push(n.letter + accStr(n.alter) + oct);
    });
    return out;
  }

  /* ---------- lead-sheet LH generator ---------- */
  const P = s => MU.parsePitch(s);
  const midiOf = s => P(s).midi;
  const DUR_TOK = [[4, 'w'], [3, 'h.'], [2, 'h'], [1.5, 'q.'], [1, 'q'], [0.75, '8.'], [0.5, '8'], [0.25, '16']];
  function splitDur(d) { const out = []; let r = d; for (const [v, t] of DUR_TOK) { while (r >= v - 1e-9) { out.push([v, t]); r -= v; } } return out; }
  const durTok = d => { const x = DUR_TOK.find(([v]) => Math.abs(v - d) < 1e-9); return x ? x[1] : null; };
  // candidate 3-note LH voicings for a chord between E2 and A3
  function lhCands(sym) {
    const ns = chordNotes(sym); if (!ns) return [];
    const sets = [];
    if (ns.length === 3) sets.push(ns);
    else { sets.push([ns[0], ns[1], ns[3]]); sets.push([ns[1], ns[2], ns[3]]); sets.push([ns[0], ns[1], ns[2]]); }
    const out = [];
    sets.forEach(set => {
      for (let inv = 0; inv < 3; inv++) {
        const ord = set.slice(inv).concat(set.slice(0, inv));
        for (let o = 2; o <= 3; o++) {
          let prev = null; const ps = [];
          ord.forEach((n, i) => {
            let oct = i === 0 ? o : prev.oct; let m;
            for (; oct < 6; oct++) { m = (oct + 1) * 12 + SEMI[n.letter] + n.alter; if (i === 0 || m > prev.m) break; }
            prev = { oct, m }; ps.push({ s: n.letter + accStr(n.alter) + oct, m });
          });
          if (ps[0].m >= 40 && ps[2].m <= 57 && ps[2].m - ps[0].m <= 9) out.push(ps);
        }
      }
    });
    return out;
  }
  function lhFinger(ps) { return '5' + (ps[1].m - ps[0].m >= 5 ? '2' : '3') + '1'; }
  function nearest(cands, prev, rootPc) {
    let best = null, bd = Infinity;
    cands.forEach(c => {
      let d = prev ? c.reduce((a, x, i) => a + Math.abs(x.m - prev[i].m), 0) : Math.abs(c[0].m - 48) + Math.abs(c[2].m - 55);
      if (prev == null && pcOfMidi(c[0].m) !== rootPc) d += 3;
      if (d < bd) { bd = d; best = c; }
    });
    return best;
  }
  const pcOfMidi = m => ((m % 12) + 12) % 12;
  // hand position for level 1 (five-finger position, finger 5 on lowNote)
  const POS = { C: 'C3', G: 'G2', F: 'F2', D: 'D3', Bb: 'Bb2', A: 'A2', E: 'E3' };
  function rootNote(sym, key) {
    const c = parseSym(sym); const r = c.root;
    const low = P(POS[key] || 'C3');
    // choose octave so that the root's diatonic index is within low..low+4, else nearest below/above
    let best = null;
    for (let o = 2; o <= 3; o++) {
      const p = P(r.letter + accStr(r.alter) + o); const d = p.dia - low.dia;
      const score = d >= 0 && d <= 4 ? 0 : Math.min(Math.abs(d), Math.abs(d - 4)) + 1;
      if (!best || score < best.score) best = { p, d, score, s: r.letter + accStr(r.alter) + o };
    }
    return { s: best.s, fin: best.d >= 0 && best.d <= 4 ? String(5 - best.d) : null };
  }
  function barLen(time) { if (time === 'C' || time === 'C|') return 4; const [a, b] = time.split('/').map(Number); return a * 4 / b; }
  // build LH level 1/2/3 (or 0 = lead sheet: no LH) for a song {key,time,pickup,measures:[{r,chords}]}
  function buildLH(song, lvl) {
    const bar = barLen(song.time); const out = [];
    let cur = null, prevV = null; const seenFing = new Set(); let pedOn = false;
    const total = song.measures.length;
    song.measures.forEach((m, i) => {
      const len = (i === 0 && song.pickup) ? song.pickup : (i === total - 1 && song.pickup ? bar - song.pickup : bar);
      const isPick = i === 0 && song.pickup;
      let chords = (m.chords || []).slice().sort((a, b) => a[0] - b[0]);
      const mm = { r: m.r, chords: (m.chords || []).map(([t, s]) => [t, deSym(s)]) };
      ['end', 'begin', 'volta', 'voltaOpen', 'label'].forEach(k => { if (m[k] != null) mm[k] = m[k]; });
      if (lvl === 0) { out.push(mm); return; }
      if (isPick && !chords.length) { mm.l = splitDur(len).map(([, t]) => 'r/' + t).join(' '); out.push(mm); return; }
      if (!chords.length || chords[0][0] > 0) chords = [[0, cur]].concat(chords);
      const toks = [];
      chords.forEach(([t0, sym], k) => {
        const t1 = k + 1 < chords.length ? chords[k + 1][0] : len;
        const d = t1 - t0; cur = sym;
        if (!sym) { splitDur(d).forEach(([, t]) => toks.push('r/' + t)); return; }
        const c = parseSym(sym);
        const firstSeen = !seenFing.has(sym + lvl); seenFing.add(sym + lvl);
        if (lvl === 1) {
          const rn = rootNote(sym, song.key);
          splitDur(d).forEach(([, t], j) => toks.push(rn.s + '/' + t + (j === 0 && firstSeen && rn.fin ? '!f' + rn.fin : '') + (j > 0 ? '' : '')));
          // tie split notes
          for (let q = toks.length - splitDur(d).length; q < toks.length - 1; q++) toks[q] += '!~';
          return;
        }
        const v = nearest(lhCands(sym), prevV, (SEMI[c.root.letter] + c.root.alter + 12) % 12) || lhCands(sym)[0];
        prevV = v;
        const ch = '(' + v.map(x => x.s).join(' ') + ')';
        const fin = firstSeen ? '!f' + lhFinger(v) : '';
        const ped = () => { const p = pedOn ? '!pc' : '!pd'; pedOn = true; return p; };
        if (lvl === 2 || !durTok(d)) {
          const parts = splitDur(d);
          parts.forEach(([, t], j) => toks.push(ch + '/' + t + (j === 0 ? fin + (lvl === 3 ? ped() : '') : '') + (j < parts.length - 1 ? '!~' : '')));
          return;
        }
        // level 3 patterns
        const [a, b, cc] = v.map(x => x.s);
        const up = `(${b} ${cc})`;
        let pat;
        if (song.time === '3/4') pat = d === 3 ? [`${a}/q`, `${up}/q`, `${up}/q`] : d === 2 ? [`${a}/q`, `${up}/q`] : [`${ch}/q`];
        else if (song.time === '6/8') pat = d === 3 ? [a, cc, b, cc, b, cc].map(x => x + '/8') : d === 1.5 ? [a, cc, b].map(x => x + '/8') : null;
        else if (song.time === '2/4') pat = d === 2 ? [`${a}/q`, `${up}/q`] : d === 1 ? [`${a}/8`, `${up}/8`] : null;
        else pat = d === 4 ? [a, cc, b, cc].map(x => x + '/q') : d === 2 ? [a, cc, b, cc].map(x => x + '/8') : d === 3 ? [a, cc, b].map(x => x + '/q') : d === 1 ? [`${a}/8`, `${up}/8`] : null;
        if (!pat) { splitDur(d).forEach(([, t], j) => toks.push(ch + '/' + t + (j === 0 ? ped() : ''))); return; }
        pat[0] += (firstSeen ? '!f' + lhFinger(v).charAt(0) : '') + ped();
        toks.push(...pat);
      });
      if (i === total - 1 && lvl === 3 && toks.length) toks[toks.length - 1] += '!pu';
      mm.l = toks.join(' ');
      out.push(mm);
    });
    return out;
  }

  /* ---------- song library ---------- */
  const LVL_TXT = {
    0: 'Lead Sheet: nur Melodie + Akkordsymbole. Die linke Hand liest du aus den Symbolen – so lernst du Lieder am schnellsten.',
    1: 'Grundtöne: links nur der Grundton jedes Akkords.',
    2: 'Griffe: links der ganze Akkord, nah beieinander (Umkehrungen).',
    3: 'Begleitmuster mit Pedal: gebrochene Akkorde, Pedal bei jedem Akkordwechsel.'
  };
  const XMAS = (typeof XMAS_DATA !== 'undefined' ? XMAS_DATA : []).map(s => ({
    id: s.id, title: s.title, sub: s.sub, key: s.key, time: s.time, bpm: s.bpm, pickup: s.pickup || 0, level: s.level, cat: 'xmas', lang: s.lang, src: s.src,
    measures: s.measures
  }));
  return { LET, SEMI, TYPES, TYPE_ORDER, symSuffix, parseSym, chordNotes, voicing, deSym, deNote, pcOf, addIv, accStr, buildLH, splitDur, barLen, lhCands, LVL_TXT, XMAS, pick, shuffle };
})();
if (typeof module !== 'undefined') module.exports = { C2 };

/* ===== Notenweg 3 · Musiktheorie-Kern + Aufgaben-Generatoren =====
   Jede Aufgabe wird frisch erzeugt. Falsch beantwortet -> der Generator liefert eine vergleichbare, aber andere Aufgabe.
   Abhängigkeiten: MU, KEYSIG, keyAlters (engine.js), C2 (content2.js, Akkordsymbole). */
const TH = (() => {
  const LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = a => [...new Set(a)];
  const accStr = a => a > 0 ? '#'.repeat(a) : a < 0 ? 'b'.repeat(-a) : '';
  const P = s => MU.parsePitch(s);
  const sci = (l, a, o) => l + accStr(a) + o;
  const fromDia = (dia, alter = 0) => { const o = Math.floor(dia / 7), l = LET[((dia % 7) + 7) % 7]; return sci(l, alter, o); };
  const midiOf = s => P(s).midi;
  const diaOf = s => P(s).dia;
  const pcOf = m => ((m % 12) + 12) % 12;
  // German names
  const de = (s, oct = false) => { const p = P(s); return MU.deName(p, oct); };
  const deL = (l, a) => MU.deSpelled(l, a);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const deKey = (l, a, minor) => minor ? deL(l, a) + '-Moll' : cap(deL(l, a)) + '-Dur';

  /* ---------- Intervalle ---------- */
  // [Stufen, Halbtöne, Kürzel, Name]
  const IVS = [
    [0, 0, 'r1', 'reine Prime'], [1, 1, 'k2', 'kleine Sekunde'], [1, 2, 'g2', 'große Sekunde'], [2, 3, 'k3', 'kleine Terz'], [2, 4, 'g3', 'große Terz'],
    [3, 5, 'r4', 'reine Quarte'], [3, 6, 'ue4', 'übermäßige Quarte'], [4, 6, 'v5', 'verminderte Quinte'], [4, 7, 'r5', 'reine Quinte'], [4, 8, 'ue5', 'übermäßige Quinte'],
    [5, 8, 'k6', 'kleine Sexte'], [5, 9, 'g6', 'große Sexte'], [6, 9, 'v7', 'verminderte Septime'], [6, 10, 'k7', 'kleine Septime'], [6, 11, 'g7', 'große Septime'], [7, 12, 'r8', 'reine Oktave'],
    [1, 3, 'ue2', 'übermäßige Sekunde']
  ];
  const IVK = {}; IVS.forEach(x => IVK[x[2]] = x);
  const SIZE = ['Prime', 'Sekunde', 'Terz', 'Quarte', 'Quinte', 'Sexte', 'Septime', 'Oktave'];
  function ivBetween(a, b) {
    const pa = P(a), pb = P(b); let lo = pa, hi = pb; if (pb.dia < pa.dia || (pb.dia === pa.dia && pb.midi < pa.midi)) { lo = pb; hi = pa; }
    const steps = hi.dia - lo.dia, semi = hi.midi - lo.midi;
    const x = IVS.find(v => v[0] === steps && v[1] === semi);
    return { steps, semi, size: steps <= 7 ? SIZE[steps] : null, name: x ? x[3] : null, k: x ? x[2] : null };
  }
  function addIv(s, k, down = false) {
    const [st, sm] = IVK[k]; const p = P(s);
    const dia = down ? p.dia - st : p.dia + st;
    const target = down ? p.midi - sm : p.midi + sm;
    const o = Math.floor(dia / 7), l = LET[((dia % 7) + 7) % 7];
    const nat = (o + 1) * 12 + SEMI[l];
    return sci(l, target - nat, o);
  }

  /* ---------- Tonarten ---------- */
  // Dur-Tonarten nach Vorzeichenzahl (Engine-Schlüssel = Dur-Grundton)
  const MAJ = { 0: ['C', 0], 1: ['G', 0], 2: ['D', 0], 3: ['A', 0], 4: ['E', 0], 5: ['B', 0], 6: ['F', 1], 7: ['C', 1], '-1': ['F', 0], '-2': ['B', -1], '-3': ['E', -1], '-4': ['A', -1], '-5': ['D', -1], '-6': ['G', -1], '-7': ['C', -1] };
  const MIN = { 0: ['A', 0], 1: ['E', 0], 2: ['B', 0], 3: ['F', 1], 4: ['C', 1], 5: ['G', 1], 6: ['D', 1], 7: ['A', 1], '-1': ['D', 0], '-2': ['G', 0], '-3': ['C', 0], '-4': ['F', 0], '-5': ['B', -1], '-6': ['E', -1], '-7': ['A', -1] };
  const engKey = n => { const [l, a] = MAJ[n]; return l + (a > 0 ? '#' : a < 0 ? 'b' : ''); };
  const keyLabel = (n, minor) => { const [l, a] = (minor ? MIN : MAJ)[n]; return deKey(l, a, minor); };
  const SHARPS = ['F', 'C', 'G', 'D', 'A', 'E', 'B'], FLATS = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
  const sigList = n => n > 0 ? SHARPS.slice(0, n).map(l => deL(l, 1)) : n < 0 ? FLATS.slice(0, -n).map(l => deL(l, -1)) : [];
  // Tonleiter (buchstabiert) ab Grundton in Oktave o
  function scale(l, a, minor = false, kind = 'nat', o = 4) {
    const pat = !minor ? [0, 2, 4, 5, 7, 9, 11] : kind === 'harm' ? [0, 2, 3, 5, 7, 8, 11] : kind === 'mel' ? [0, 2, 3, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
    const root = sci(l, a, o); const rp = P(root);
    return pat.map((sm, i) => { const dia = rp.dia + i; const oo = Math.floor(dia / 7), ll = LET[((dia % 7) + 7) % 7]; const nat = (oo + 1) * 12 + SEMI[ll]; return sci(ll, rp.midi + sm - nat, oo); });
  }
  const keyOfN = (n, minor) => (minor ? MIN : MAJ)[n];

  /* ---------- Akkorde ---------- */
  const TRI = { '': ['g3', 'r5'], m: ['k3', 'r5'], dim: ['k3', 'v5'], aug: ['g3', 'ue5'], sus2: ['g2', 'r5'], sus4: ['r4', 'r5'] };
  const TRI_DE = { '': 'Dur', m: 'Moll', dim: 'vermindert', aug: 'übermäßig', sus2: 'sus2 (Sekunde statt Terz)', sus4: 'sus4 (Quarte statt Terz)' };
  const SEV = { 7: ['g3', 'r5', 'k7'], maj7: ['g3', 'r5', 'g7'], m7: ['k3', 'r5', 'k7'], m7b5: ['k3', 'v5', 'k7'], dim7: ['k3', 'v5', 'v7'] };
  const SEV_DE = { 7: 'Dominantseptakkord (Dur + kleine Septime)', maj7: 'großer Septakkord (maj7)', m7: 'Moll-Septakkord (m7)', m7b5: 'halbverminderter Septakkord (m7♭5)', dim7: 'verminderter Septakkord (°7)' };
  function chord(rootSci, type) { const ivs = TRI[type] || SEV[type]; return [rootSci].concat(ivs.map(k => addIv(rootSci, k))); }
  function invert(notes, n) { let a = notes.slice(); for (let i = 0; i < n; i++) { const f = a.shift(); a.push(addIv(f, 'r8')); } return a; }
  const symDe = (l, a, type) => { const r = cap(deL(l, a)); const suf = { '': '', m: 'm', dim: '°', aug: '+', 7: '7', maj7: 'maj7', m7: 'm7', m7b5: 'm7♭5', dim7: '°7', sus2: 'sus2', sus4: 'sus4' }[type]; return r + suf; };
  // Stufenakkorde: Dur & harmonisch Moll
  const DEG_MAJ = ['', 'm', 'm', '', '', 'm', 'dim'];
  const DEG_MIN = ['m', 'dim', '', 'm', 'm', '', '']; // natürliches Moll; V wird in der Praxis meist Dur (harm.)
  const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const romOf = (i, type) => { const r = ROM[i]; return (type === 'm' || type === 'dim') ? r.toLowerCase() + (type === 'dim' ? '°' : '') : r; };
  function degreeChord(n, minor, deg, harm = true) {
    const [l, a] = keyOfN(n, minor);
    const sc = scale(l, a, minor, minor && harm && (deg === 4 || deg === 6) ? 'harm' : 'nat', 3);
    let type = (minor ? DEG_MIN : DEG_MAJ)[deg];
    if (minor && harm && deg === 4) type = '';
    if (minor && harm && deg === 6) type = 'dim';
    const root = sc[deg]; const p = P(root);
    return { root, type, sym: symDe(p.letter, p.alter, type), notes: chord(root, type) };
  }

  /* ---------- Figuren ---------- */
  const fig = {
    staff: (measures, o = {}) => ({ kind: 'score', spec: Object.assign({ staves: [o.clef === 'bass' ? 'bass' : 'treble'], key: o.key || 'C', time: o.time || null, measures, final: false, numbers: false }, o.grand ? { staves: ['treble', 'bass'] } : {}, o.spec || {}), w: o.w || 260, s: o.s || 11 }),
    kbd: (from, to, marks = {}, o = {}) => ({ kind: 'kbd', from, to, marks, labels: o.labels || 'none', tap: !!o.tap, w: o.w || 520 })
  };
  const tok = (notes, dur = 'w') => (notes.length === 1 ? notes[0] : '(' + notes.join(' ') + ')') + '/' + dur;

  /* ---------- Hilfen für Auswahl ---------- */
  function choices(correct, wrongs, n = 4) {
    const w = shuffle(uniq(wrongs.filter(x => x !== correct))).slice(0, n - 1);
    return shuffle([correct, ...w]).map(t => ({ t, ok: t === correct }));
  }
  const wkeysIn = (from, to) => { const out = []; for (let m = from; m <= to; m++) if (!MU.isBlack(m)) out.push(m); return out; };
  const allIn = (from, to) => { const out = []; for (let m = from; m <= to; m++) out.push(m); return out; };
  // Weiße Taste (MIDI) -> sci
  const whiteSci = m => { const pc = pcOf(m), o = Math.floor(m / 12) - 1; const l = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' }[pc]; return l + o; };
  const blackNames = m => { const pc = pcOf(m); return { 1: ['cis', 'des'], 3: ['dis', 'es'], 6: ['fis', 'ges'], 8: ['gis', 'as'], 10: ['ais', 'b'] }[pc]; };
  const keyLabelOf = m => MU.isBlack(m) ? blackNames(m).join(' / ') : deL(whiteSci(m)[0], 0);
  // Notenpool im Bereich (diatonisch, Stammtöne) für Schlüssel
  function poolWhite(fromSci, toSci) { const a = diaOf(fromSci), b = diaOf(toSci); const out = []; for (let d = a; d <= b; d++) out.push(fromDia(d)); return out; }

  /* ---------- Rhythmus ---------- */
  const RV = { w: 4, 'h.': 3, h: 2, 'q.': 1.5, q: 1, '8.': 0.75, '8': 0.5, '16': 0.25 };
  const RNAME = { w: 'ganze Note', 'h.': 'punktierte Halbe', h: 'halbe Note', 'q.': 'punktierte Viertel', q: 'Viertelnote', '8.': 'punktierte Achtel', '8': 'Achtelnote', '16': 'Sechzehntel' };
  const RREST = { w: 'ganze Pause', h: 'halbe Pause', q: 'Viertelpause', '8': 'Achtelpause', '16': 'Sechzehntelpause' };
  const barBeats = t => t === 'C' || t === '4/4' ? 4 : t === '3/4' ? 3 : t === '2/4' ? 2 : t === '6/8' ? 3 : t === '3/8' ? 1.5 : t === 'C|' ? 4 : 4;
  // zufälliger Rhythmus, der einen Takt füllt (Werte aus set). Gruppen: Achtel paarweise auf Schlag, Sechzehntel in 4ern
  function randRhythm(time, set, opt = {}) {
    const L = barBeats(time);
    for (let tries = 0; tries < 200; tries++) {
      const out = []; let t = 0;
      while (t < L - 1e-9) {
        const onBeat = Math.abs(t - Math.round(t)) < 1e-9;
        let cands = set.filter(v => RV[v] <= L - t + 1e-9);
        // punktierte Viertel nur auf Schlag, danach Achtel
        if (!onBeat) cands = cands.filter(v => v === '8' || v === '16' || v === '8.');
        if (time === '6/8') cands = cands.filter(v => { const pos = t % 1.5; return v === 'q.' ? pos < 1e-9 : v === 'q' ? (pos < 1e-9 || Math.abs(pos - 0.5) < 1e-9) && pos + RV[v] <= 1.5 + 1e-9 : true; });
        if (!cands.length) break;
        let v = pick(cands);
        if (v === '8' && onBeat && set.includes('8') && L - t >= 1 && time !== '6/8') { out.push('8', '8'); t += 1; continue; }
        if (v === '16' && onBeat && L - t >= 1) { out.push('16', '16', '16', '16'); t += 1; continue; }
        if (v === '8.' ) { if (L - t >= 1 && onBeat) { out.push('8.', '16'); t += 1; continue; } else continue; }
        if (v === 'q.' && time !== '6/8') { if (L - t >= 2 && onBeat && set.includes('8')) { out.push('q.', '8'); t += 2; continue; } else continue; }
        out.push(v); t += RV[v];
      }
      if (Math.abs(t - L) < 1e-9 && (!opt.min || out.length >= opt.min) && (!opt.max || out.length <= opt.max)) return out;
    }
    return time === '3/4' ? ['q', 'q', 'q'] : time === '2/4' ? ['q', 'q'] : time === '6/8' ? ['q.', 'q.'] : ['q', 'q', 'q', 'q'];
  }
  const rhythmTok = (vals, pitch = 'B4', rests = []) => vals.map((v, i) => (rests.includes(i) ? 'r' : pitch) + '/' + v).join(' ');
  const rhythmEvents = (vals, midi = 71) => { let t = 0; return vals.map(v => { const e = { t, m: [midi], d: RV[v] * 0.9 }; t += RV[v]; return e; }); };

  /* ---------- Glossar-Pool (wird von CUR.GLOSS befüllt) ---------- */
  let GLOSS = [];
  const setGloss = g => { GLOSS = g; };

  /* =====================================================================
     GENERATOREN – jeder liefert { q, fig?, choices? | input, answer, explain, play?, sig }
     ===================================================================== */
  const G = {};
  const Q = (o) => o;

  // --- Tastatur ---
  G.keyFind = (o = {}) => {
    const from = o.from || 48, to = o.to || 72;
    const black = !!o.black;
    const cands = allIn(from, to).filter(m => black ? true : !MU.isBlack(m));
    const m = pick(cands);
    const pc = pcOf(m);
    const name = MU.isBlack(m) ? pick(blackNames(m)) : deL(whiteSci(m)[0], 0);
    const withOct = !!o.oct;
    const lab = withOct ? MU.deMidi(m, true, ['des', 'es', 'ges', 'as', 'b'].includes(name)) : name;
    return Q({ q: withOct ? `Tippe genau auf <b>${lab}</b>.` : `Tippe auf ein <b>${cap(name) === 'B' ? 'B' : name.length > 1 ? name : name.toUpperCase()}</b> – egal in welcher Oktave.`, fig: fig.kbd(from, to, {}, { tap: true, labels: o.labels || 'none' }), input: 'key', answer: withOct ? { midi: m } : { pc }, explain: MU.isBlack(m) ? `${blackNames(m).join(' und ')} sind dieselbe schwarze Taste (enharmonisch gleich).` : `Orientierung über die schwarzen Gruppen: C liegt links neben der 2er-Gruppe, F links neben der 3er-Gruppe.`, sig: 'kf' + (withOct ? m : pc) });
  };
  G.keyName = (o = {}) => {
    const from = o.from || 48, to = o.to || 72;
    const cands = allIn(from, to).filter(m => o.black ? true : !MU.isBlack(m));
    const m = pick(cands);
    const right = keyLabelOf(m);
    const all = uniq(allIn(from, to).filter(x => o.black ? true : !MU.isBlack(x)).map(keyLabelOf));
    const sel = {}; sel[m] = { cls: 'hl' };
    return Q({ q: 'Wie heißt die markierte Taste?', fig: fig.kbd(from, to, sel), choices: choices(right, all, o.n || 4), explain: MU.isBlack(m) ? `Schwarze Tasten haben zwei Namen: ♯ macht aus dem linken Nachbarn „-is“, ♭ aus dem rechten Nachbarn „-es“.` : `Weiße Tasten: c d e f g a h. Merke die Lage zur 2er- bzw. 3er-Gruppe.`, sig: 'kn' + m });
  };
  G.octName = (o = {}) => {
    const lows = [24, 36, 48, 60, 72, 84];
    const base = pick(o.cOnly ? lows : lows.concat([31, 43, 55, 67, 79, 40, 52, 64, 76]));
    const m = base; const right = MU.deMidi(m, true);
    const pc = pcOf(m);
    const alts = [-24, -12, 12, 24].map(d => m + d).filter(x => x >= 24 && x <= 96).map(x => MU.deMidi(x, true));
    const sel = {}; sel[m] = { cls: 'hl' };
    return Q({ q: 'Welcher Name mit Oktavangabe passt zur markierten Taste?', fig: fig.kbd(24, 96, sel, { labels: 'c-mid', w: 640 }), choices: choices(right, alts.concat([MU.deMidi(m, false)])), explain: `Das mittlere C heißt c¹ (eingestrichen, international C4). Darüber c², darunter c (klein), C (groß), C₁ (Kontra).`, sig: 'on' + m + pc });
  };
  G.halfWhole = (o = {}) => {
    const from = o.from || 48, to = o.to || 72;
    let a = from + rnd(to - from - 3); const d = pick([1, 1, 2, 2, 3, 0].filter(x => o.withOther || x === 1 || x === 2)); const b = a + d;
    const right = d === 1 ? 'Halbtonschritt' : d === 2 ? 'Ganztonschritt' : 'weder noch';
    const sel = {}; sel[a] = { cls: 'hl' }; sel[b] = { cls: 'hl2' };
    const extra = d === 1 && !MU.isBlack(a) && !MU.isBlack(b) ? ' Zwei weiße Tasten ohne schwarze dazwischen – das gibt es nur bei e–f und h–c.' : '';
    return Q({ q: 'Welcher Abstand liegt zwischen den beiden markierten Tasten?', fig: fig.kbd(from, to, sel), choices: ['Halbtonschritt', 'Ganztonschritt'].concat(o.withOther ? ['weder noch'] : []).map(t => ({ t, ok: t === right })), explain: `Halbton = direkt benachbarte Taste (egal ob weiß oder schwarz). Ganzton = zwei Halbtöne.${extra}`, sig: 'hw' + a + '-' + d });
  };
  G.accName = (o = {}) => {
    const l = pick(LET); const a = pick(o.double ? [1, -1, 2, -2] : [1, -1]);
    const right = deL(l, a);
    const wrong = [deL(l, -a), l === 'B' ? 'hes' : l.toLowerCase() + (a > 0 ? 'es' : 'is'), l === 'E' && a < 0 ? 'ees' : (l === 'A' && a < 0 ? 'aes' : deL(LET[(LET.indexOf(l) + 1) % 7], a)), deL(l, 0)].filter(x => x !== right);
    const sym = a === 1 ? '♯' : a === -1 ? '♭' : a === 2 ? 'Doppelkreuz (𝄪)' : 'Doppel-♭ (𝄫)';
    const ex = l === 'B' && a === -1 ? 'Sonderfall: H mit ♭ heißt b (nicht „hes“).' : l === 'E' && a === -1 ? 'Sonderfall: aus „e-es“ wird „es“.' : l === 'A' && a === -1 ? 'Sonderfall: aus „a-es“ wird „as“.' : a > 0 ? '♯ hängt „-is“ an.' : '♭ hängt „-es“ an.';
    return Q({ q: `Wie heißt der Ton <b>${l === 'B' ? 'H' : l}</b> mit ${sym}?`, choices: choices(right, wrong), explain: ex, sig: 'an' + l + a });
  };
  G.enharm = (o = {}) => {
    const pairs = [['C', 1, 'D', -1], ['D', 1, 'E', -1], ['F', 1, 'G', -1], ['G', 1, 'A', -1], ['A', 1, 'B', -1]].concat(o.special ? [['E', 1, 'F', 0], ['B', 1, 'C', 0], ['F', -1, 'E', 0], ['C', -1, 'B', 0]] : []);
    const [l1, a1, l2, a2] = pick(pairs); const flip = rnd(2);
    const [x, y] = flip ? [[l2, a2], [l1, a1]] : [[l1, a1], [l2, a2]];
    const right = deL(y[0], y[1]);
    const wrongs = ['cis', 'des', 'dis', 'es', 'fis', 'ges', 'gis', 'as', 'ais', 'b', 'h', 'c', 'e', 'f'].filter(n => n !== right && n !== deL(x[0], x[1]));
    return Q({ q: `Welcher Ton klingt gleich wie <b>${deL(x[0], x[1])}</b> (gleiche Taste)?`, choices: choices(right, wrongs), explain: `${deL(x[0], x[1])} und ${right} sind enharmonisch verwechselt: gleiche Taste, anderer Name. Welcher Name richtig ist, hängt von der Tonart ab.`, sig: 'eh' + deL(x[0], x[1]) });
  };
  G.finger = (o = {}) => {
    const hand = pick(['rechte', 'linke']); const f = 1 + rnd(5);
    const names = ['Daumen', 'Zeigefinger', 'Mittelfinger', 'Ringfinger', 'kleiner Finger'];
    if (rnd(2)) return Q({ q: `Welche Nummer hat der <b>${names[f - 1]}</b> der ${hand}n Hand?`, choices: choices(String(f), ['1', '2', '3', '4', '5']), explain: 'In beiden Händen gilt: Daumen = 1 … kleiner Finger = 5.', sig: 'fi' + f + hand });
    return Q({ q: `Fingersatz <b>${f}</b> in der ${hand}n Hand – welcher Finger?`, choices: choices(names[f - 1], names), explain: 'Beide Hände sind gleich nummeriert, vom Daumen (1) nach außen.', sig: 'fi2' + f + hand });
  };

  // --- Noten lesen ---
  G.noteName = (o = {}) => {
    const clef = o.clef || 'treble';
    const range = o.range || (clef === 'treble' ? ['C4', 'G5'] : ['G2', 'C4']);
    let pool = poolWhite(range[0], range[1]);
    if (o.only) pool = pool.filter(s => o.only.includes(s));
    const s0 = pick(pool);
    let a = 0; if (o.acc && rnd(3) === 0) a = pick([1, -1]);
    const s = sci(s0[0], a, +s0.slice(1));
    const oct = !!o.oct;
    const right = oct ? de(s, true) : de(s);
    const near = [-2, -1, 1, 2, 7, -7].map(d => fromDia(diaOf(s0) + d, a)).map(x => oct ? de(x, true) : de(x));
    const wr = oct ? near.concat([de(s, false)]) : near.concat(['c', 'd', 'e', 'f', 'g', 'a', 'h']);
    const spec = { measures: [{ [clef === 'bass' ? 'l' : 'r']: s + '/w' }] };
    const f = o.grand ? fig.staff([{ r: clef === 'treble' ? s + '/w' : 'x/w', l: clef === 'bass' ? s + '/w' : 'x/w' }], { grand: true, w: 200, s: 9 }) : fig.staff(spec.measures, { clef, w: 170, s: 12 });
    // Ankerhilfe
    const anchors = clef === 'treble' ? 'Anker im Violinschlüssel: c¹ (1. Hilfslinie unten), g¹ (2. Linie, um die der Schlüssel kreist), c² (3. Zwischenraum), g² (über der 5. Linie).' : 'Anker im Bassschlüssel: f (4. Linie, zwischen den Punkten), c (2. Zwischenraum), C (2. Hilfslinie unten), c¹ (1. Hilfslinie oben).';
    return Q({ q: oct ? 'Wie heißt die Note – mit Oktave?' : 'Wie heißt diese Note?', fig: f, choices: choices(right, wr, o.n || 4), explain: anchors, sig: 'nn' + clef + s, play: [{ t: 0, m: [midiOf(s)], d: 1.2 }] });
  };
  G.noteKey = (o = {}) => {
    const clef = o.clef || 'treble';
    const range = o.range || (clef === 'treble' ? ['C4', 'G5'] : ['G2', 'C4']);
    const s = pick(poolWhite(range[0], range[1]));
    const m = midiOf(s);
    const from = Math.min(m - 7, clef === 'treble' ? 57 : 36), to = Math.max(m + 7, clef === 'treble' ? 81 : 62);
    let f0 = from; while (MU.isBlack(f0)) f0--; let t0 = to; while (MU.isBlack(t0)) t0++;
    return Q({ q: 'Tippe die Taste, die zu dieser Note gehört – in der richtigen Oktave.', fig: [fig.staff([{ [clef === 'bass' ? 'l' : 'r']: s + '/w' }], { clef, w: 150, s: 11 }), fig.kbd(f0, t0, { 60: { cls: 'c4mark' } }, { tap: true, labels: 'c' })], input: 'key', answer: { midi: m }, explain: `Das war ${de(s, true)}. c¹ (das mittlere C) ist auf der Tastatur markiert.`, sig: 'nk' + s });
  };
  G.stepSkip = (o = {}) => {
    const clef = o.clef || 'treble';
    const base = pick(poolWhite(clef === 'treble' ? 'D4' : 'B2', clef === 'treble' ? 'E5' : 'B3'));
    const d = pick([0, 1, -1, 1, -1, 2, -2, 3, -3, 4, -4]);
    const b = fromDia(diaOf(base) + d);
    const right = d === 0 ? 'Tonwiederholung' : Math.abs(d) === 1 ? (d > 0 ? 'Schritt aufwärts' : 'Schritt abwärts') : (d > 0 ? 'Sprung aufwärts' : 'Sprung abwärts');
    const k = clef === 'bass' ? 'l' : 'r';
    return Q({ q: 'Schritt, Sprung oder Wiederholung?', fig: fig.staff([{ [k]: `${base}/h ${b}/h` }], { clef, w: 190, s: 12 }), choices: ['Schritt aufwärts', 'Schritt abwärts', 'Sprung aufwärts', 'Sprung abwärts', 'Tonwiederholung'].map(t => ({ t, ok: t === right })), explain: 'Schritt = von Linie zu Zwischenraum (Nachbarton, Sekunde). Sprung = Linie zu Linie oder Zwischenraum zu Zwischenraum oder weiter (ab Terz).', sig: 'ss' + base + d, play: [{ t: 0, m: [midiOf(base)], d: 0.9 }, { t: 1, m: [midiOf(b)], d: 0.9 }] });
  };
  G.ivSize = (o = {}) => {
    const clef = o.clef || 'treble'; const max = o.max || 8;
    const base = pick(poolWhite(clef === 'treble' ? 'C4' : 'E2', clef === 'treble' ? 'C5' : 'E3'));
    const st = 1 + rnd(max - 1);
    const b = fromDia(diaOf(base) + st);
    const harm = o.harm != null ? o.harm : rnd(2) === 0;
    const k = clef === 'bass' ? 'l' : 'r';
    const right = SIZE[st];
    return Q({ q: harm ? 'Welches Intervall (zusammen klingend)?' : 'Welches Intervall?', fig: fig.staff([{ [k]: harm ? `(${base} ${b})/w` : `${base}/h ${b}/h` }], { clef, w: 180, s: 12 }), choices: choices(right, SIZE.slice(1, max + 1)), explain: 'Zähle beide Noten mit: von Linie zu Linie ist eine Terz, Linie zu übernächster Linie eine Quinte. Zwischenraum↔Linie: gerade Zahlen (Sekunde, Quarte, Sexte, Oktave).', sig: 'is' + base + st, play: harm ? [{ t: 0, m: [midiOf(base), midiOf(b)], d: 1.5 }] : [{ t: 0, m: [midiOf(base)], d: 0.9 }, { t: 1, m: [midiOf(b)], d: 0.9 }] });
  };
  G.ivQual = (o = {}) => {
    const set = o.set || ['k2', 'g2', 'k3', 'g3', 'r4', 'r5', 'k6', 'g6', 'k7', 'g7', 'r8'];
    const k = pick(set);
    let base, top; for (let i = 0; i < 40; i++) { const l = pick(LET); const a = o.acc ? pick([0, 0, 1, -1]) : 0; base = sci(l, a, 4); top = addIv(base, k); const pt = P(top); if (Math.abs(pt.alter) <= 1 && P(base).midi >= 60 && pt.midi <= 81) break; }
    const right = IVK[k][3];
    return Q({ q: 'Wie heißt dieses Intervall genau?', fig: fig.staff([{ r: `${base}/h ${top}/h` }], { w: 190, s: 12 }), choices: choices(right, set.map(x => IVK[x][3]).concat(IVS.filter(v => v[0] === IVK[k][0]).map(v => v[3]))), explain: `${right} = ${IVK[k][1]} Halbtöne. Erst die Größe zählen (Notenbild), dann die Halbtöne auf der Tastatur.`, sig: 'iq' + base + k, play: [{ t: 0, m: [midiOf(base)], d: 0.9 }, { t: 1, m: [midiOf(top)], d: 0.9 }, { t: 2.2, m: [midiOf(base), midiOf(top)], d: 1.4 }] });
  };
  G.ivEar = (o = {}) => {
    const set = o.set || ['g2', 'g3', 'r5', 'r8'];
    const k = pick(set); const base = 55 + rnd(12); const top = base + IVK[k][1];
    const harm = !!o.harm;
    const ev = harm ? [{ t: 0, m: [base, top], d: 1.6 }] : [{ t: 0, m: [base], d: 0.9 }, { t: 1, m: [top], d: 1.2 }];
    const tips = { k2: 'Für Elise (e–dis) oder der „Weiße Hai“', g2: 'Alle meine Entchen (Al–le) oder Happy Birthday (py–Birth)', k3: 'Hänschen klein (Hän–schen, abwärts) oder Smoke on the Water', g3: 'Oh When the Saints (Oh–when)', r4: 'O Tannenbaum (O–Tan) oder der Hochzeitsmarsch aus Lohengrin', ue4: 'Maria aus der West Side Story oder der Simpsons-Anfang', r5: 'Morgen kommt der Weihnachtsmann (kommt–der) oder das Star-Wars-Thema', k6: 'das Love-Story-Thema', g6: 'My Bonnie Is Over the Ocean (My–Bon)', k7: 'Somewhere aus der West Side Story (There\'s–a)', g7: 'klingt wie eine Oktave, die knapp danebenliegt – sehr scharf', r8: 'Somewhere over the Rainbow (Some–where)' };
    return Q({ q: harm ? 'Hör zu: Welches Intervall klingt zusammen?' : 'Hör zu: Welches Intervall?', listen: ev, choices: choices(IVK[k][3], set.map(x => IVK[x][3]), Math.min(set.length, 4)), explain: tips[k] ? `Eselsbrücke: ${tips[k]}.` : '', sig: 'ie' + k + base, play: ev });
  };

  // --- Rhythmus ---
  G.noteValue = (o = {}) => {
    const set = o.set || ['w', 'h', 'q'];
    const v = pick(set); const rest = o.rests && rnd(2) === 0 && RREST[v];
    const right = String(RV[v]).replace('.5', ',5').replace('0,5', '½').replace('0,25', '¼').replace('1,5', '1½').replace('0.75', '¾');
    const fmt = x => x === 0.5 ? '½' : x === 0.25 ? '¼' : x === 1.5 ? '1½' : x === 0.75 ? '¾' : String(x);
    const r = fmt(RV[v]);
    return Q({ q: `Wie viele Viertel-Schläge dauert ${rest ? 'diese Pause' : 'diese Note'} (im 4/4-Takt)?`, fig: fig.staff([{ r: (rest ? 'r' : 'B4') + '/' + v }], { w: 120, s: 12 }), choices: choices(r, ['4', '3', '2', '1½', '1', '½', '¼', '¾'].filter(x => set.map(y => fmt(RV[y])).includes(x) || rnd(2))), explain: `${rest ? RREST[v] : RNAME[v]} = ${r} Schl${r === '1' ? 'ag' : 'äge'}. Ein Punkt verlängert um die Hälfte.`, sig: 'nv' + v + (rest ? 'r' : '') });
  };
  G.measureFill = (o = {}) => {
    const time = o.time || pick(['4/4', '3/4']);
    const set = o.set || ['h', 'q', '8'];
    const vals = randRhythm(time, set, { min: 2 });
    const lastV = vals[vals.length - 1];
    let shown = vals.slice(0, -1);
    // ganzes Achtelpaar am Ende? dann nur das letzte weglassen
    const L = barBeats(time); const used = shown.reduce((a, v) => a + RV[v], 0); const miss = L - used;
    const opts = ['w', 'h.', 'h', 'q.', 'q', '8'].filter(v => RV[v] <= 4);
    const right = Object.keys(RV).find(k => Math.abs(RV[k] - miss) < 1e-9 && RNAME[k]);
    if (!right) return G.measureFill(o);
    const tokStr = shown.map(v => 'B4/' + v).join(' ') + ` x/${right}!t=?`;
    return Q({ q: `Im ${time === 'C' ? '4/4' : time}-Takt fehlt am Ende etwas. Welcher Notenwert füllt den Takt?`, fig: fig.staff([{ r: tokStr }], { time: time === '4/4' ? 'C' : time, w: 260, s: 11 }), choices: choices(RNAME[right], opts.map(v => RNAME[v])), explain: `Der Takt hat ${L} Viertel. Vorhanden sind ${used.toString().replace('.', ',')} – es fehlen ${miss.toString().replace('.', ',')}.`, sig: 'mf' + time + vals.join('') });
  };
  G.rhythmHear = (o = {}) => {
    const time = o.time || '4/4'; const set = o.set || ['h', 'q', '8'];
    const right = randRhythm(time, set);
    const others = []; for (let i = 0; i < 30 && others.length < 2; i++) { const r = randRhythm(time, set); if (r.join() !== right.join() && !others.some(x => x.join() === r.join())) others.push(r); }
    const opts = shuffle([right, ...others]);
    const ev = rhythmEvents(right);
    return Q({ q: 'Hör zu (vorher zählt das Metronom ein): Welcher Rhythmus war das?', listen: ev, listenBpm: o.bpm || 80, countIn: barBeats(time), choices: opts.map((r, i) => ({ t: 'abc'[i], ok: r === right, fig: fig.staff([{ r: rhythmTok(r) }], { time: time === '4/4' ? 'C' : time, w: 220, s: 9 }) })), explain: 'Zähl beim Hören mit („1 und 2 und …“). Lange Werte erkennst du an Pausen zwischen den Klicks.', sig: 'rh' + right.join(''), play: ev });
  };
  G.tap = (o = {}) => {
    const time = o.time || '4/4'; const set = o.set || ['h', 'q', '8'];
    const bars = o.bars || 2; const vals = []; for (let i = 0; i < bars; i++) vals.push(...randRhythm(time, set));
    const ms = []; let cur = []; let acc = 0; const L = barBeats(time);
    vals.forEach(v => { cur.push(v); acc += RV[v]; if (Math.abs(acc - L) < 1e-9) { ms.push({ r: rhythmTok(cur) }); cur = []; acc = 0; } });
    let t = 0; const onsets = vals.map(v => { const x = t; t += RV[v]; return x; });
    return Q({ q: 'Klopf den Rhythmus: Tippe nach dem Einzählen auf die große Taste – bei jeder Note einmal.', fig: fig.staff(ms, { time: time === '4/4' ? 'C' : time, w: 360, s: 10 }), input: 'tap', answer: { onsets, total: t, bar: L, bpm: o.bpm || 72 }, explain: 'Zähl laut mit und klopf genau auf die Zählzeit. Lange Noten = abwarten, nicht kürzer machen.', sig: 'tp' + vals.join('') });
  };
  G.timeSig = (o = {}) => {
    const time = pick(o.set || ['4/4', '3/4', '2/4']);
    const ms = [0, 1].map(() => ({ r: rhythmTok(randRhythm(time, (time === '6/8' ? ['q.', 'q', '8', 'h.'] : ['h', 'q', '8', 'h.']).filter(v => RV[v] <= barBeats(time)))) }));
    return Q({ q: 'Hier fehlt die Taktangabe. Welche passt?', fig: fig.staff(ms, { w: 320, s: 10 }), choices: choices(time, ['4/4', '3/4', '2/4', '6/8'].filter(t => (o.set || ['4/4', '3/4', '2/4']).includes(t) || t === '6/8' && o.set && o.set.includes('6/8'))), explain: 'Zähle die Viertel zwischen zwei Taktstrichen: 2 → 2/4, 3 → 3/4, 4 → 4/4. Gruppieren sich die Achtel in Dreiergruppen (zwei punktierte Viertel pro Takt), ist es 6/8.', sig: 'ts' + time + JSON.stringify(ms) });
  };
  G.counting = (o = {}) => {
    const time = o.time || '4/4'; const set = o.set || ['q', '8', 'h'];
    const vals = randRhythm(time, set, { min: 3 });
    const i = rnd(vals.length); let t = 0; for (let k = 0; k < i; k++) t += RV[vals[k]];
    const beat = Math.floor(t + 1e-9) + 1; const frac = t - Math.floor(t + 1e-9);
    const lab = frac < 1e-9 ? String(beat) : Math.abs(frac - 0.5) < 1e-9 ? `${beat} und` : Math.abs(frac - 0.25) < 1e-9 ? `${beat} e` : `${beat} e und` ;
    const toks = vals.map((v, k) => 'B4/' + v + (k === i ? '!hl=hlq' : ''));
    const allLabs = []; for (let b = 1; b <= barBeats(time); b++) allLabs.push(String(b), `${b} und`);
    return Q({ q: 'Auf welcher Zählzeit beginnt die markierte Note?', fig: fig.staff([{ r: toks.join(' ') }], { time: time === '4/4' ? 'C' : time, w: 300, s: 11 }), choices: choices(lab, allLabs), explain: 'Zähle jeden Schlag als Zahl und die Achtel dazwischen als „und“. Addiere die Notenwerte vor der markierten Note.', sig: 'ct' + vals.join('') + i });
  };

  G.keyNote = (o = {}) => {
    // Tonart mit Vorzeichnung, drei Noten im Takt; gefragt ist der tatsächlich klingende Name der letzten Note
    const max = o.max || 3; let n = 0; while (n === 0) n = (rnd(2) ? 1 : -1) * (1 + rnd(max));
    const alt = {}; (n > 0 ? SHARPS.slice(0, n) : FLATS.slice(0, -n)).forEach(l => alt[l] = n > 0 ? 1 : -1);
    const pool = poolWhite('E4', 'F5');
    const affected = pool.filter(x => alt[x[0]]);
    const target = pick(affected.length ? affected : pool); const L = target[0];
    const kind = pick(['sig', 'sig', 'acc', 'nat', 'bar']);
    const base = alt[L] || 0; let toks = [], shownAlter = base, ex = '';
    const filler = () => pick(pool.filter(x => x[0] !== L));
    const sc = (l, a, oct) => sci(l, a, oct);
    const oct = +target.slice(1);
    if (kind === 'sig') { toks = [filler() + '/q', filler() + '/q', target + '/h']; ex = `Die Vorzeichnung gilt für jedes ${deL(L, 0)} in jeder Oktave: Es klingt ${deL(L, base)}.`; }
    else if (kind === 'nat') { toks = [sc(L, 0, oct) + '/q', filler() + '/q', sc(L, 0, oct) + '/h']; shownAlter = 0; ex = `Das Auflösungszeichen vorne im Takt gilt bis zum Taktende – auch für die letzte Note: ${deL(L, 0)}.`; }
    else if (kind === 'acc') { const a2 = base === 1 ? 0 : base === -1 ? 0 : 1; toks = [sc(L, a2, oct) + '/q', filler() + '/q', sc(L, a2, oct) + '/h']; shownAlter = a2; ex = `Das Versetzungszeichen gilt bis zum Taktende: auch die letzte Note ist ${deL(L, a2)}.`; }
    else { const a2 = base === 0 ? 1 : 0; const m1 = { r: `${sc(L, a2, oct)}/q ${filler()}/q ${filler()}/h` }; const m2 = { r: `${target}/w` }; const f2 = fig.staff([m1, m2], { key: engKey(n), w: 300, s: 11 }); return Q({ q: 'Wie heißt die Note im <b>zweiten</b> Takt?', fig: f2, choices: choices(deL(L, base), [deL(L, a2), deL(L, base + 1), deL(L, base - 1), deL(L, 0)]), explain: `Der Taktstrich hebt das Versetzungszeichen auf. Im neuen Takt gilt wieder die Vorzeichnung: ${deL(L, base)}.`, sig: 'kn' + n + target + 'bar' }); }
    const right = deL(L, shownAlter);
    return Q({ q: 'Wie heißt die <b>letzte</b> Note im Takt – so wie sie klingt?', fig: fig.staff([{ r: toks.join(' ') }], { key: engKey(n), w: 260, s: 11 }), choices: choices(right, [deL(L, 0), deL(L, 1), deL(L, -1), deL(L, base)]), explain: ex, sig: 'kn' + n + target + kind, play: [{ t: 0, m: [midiOf(sc(L, shownAlter, oct))], d: 1 }] });
  };

  // --- Tonleitern & Tonarten ---
  G.keySig = (o = {}) => {
    const max = o.max || 4; const n = (rnd(2) ? 1 : -1) * rnd(max + 1);
    const minor = o.mode === 'minor' ? true : o.mode === 'both' ? rnd(2) === 0 : false;
    const right = keyLabel(n, minor);
    const wr = []; for (let k = -Math.min(max + 1, 7); k <= Math.min(max + 1, 7); k++) { if (k !== n) wr.push(keyLabel(k, minor)); }
    if (o.mode === 'both') wr.push(keyLabel(n, !minor));
    const clef = o.clef || 'treble';
    return Q({ q: `Welche ${o.mode === 'both' ? 'Tonart (Dur oder Moll)' : minor ? 'Moll-Tonart' : 'Dur-Tonart'} hat diese Vorzeichnung?`, fig: fig.staff([{ [clef === 'bass' ? 'l' : 'r']: 'x/w' }], { clef, key: engKey(n), w: 200, s: 12 }), choices: choices(right, wr), explain: n > 0 ? `Kreuz-Tonarten: Der Grundton liegt einen Halbton über dem letzten Kreuz (${sigList(n).slice(-1)[0]} → ${keyLabel(n, false)}). Moll liegt eine kleine Terz darunter (${keyLabel(n, true)}).` : n < 0 ? `B-Tonarten: Das vorletzte ♭ ist der Grundton (bei 1 ♭: F-Dur). Hier: ${keyLabel(n, false)}, parallel ${keyLabel(n, true)}.` : 'Keine Vorzeichen: C-Dur oder a-Moll.', sig: 'ks' + n + (minor ? 'm' : '') });
  };
  G.keyAcc = (o = {}) => {
    const max = o.max || 5; let n = 0; while (n === 0) n = (rnd(2) ? 1 : -1) * (1 + rnd(max));
    const minor = o.mode === 'minor' || (o.mode === 'both' && rnd(2) === 0);
    const right = sigList(n).join(', ');
    const wrongs = [sigList(n + (n > 0 ? 1 : -1)).join(', '), sigList(n - (n > 0 ? 1 : -1)).join(', ') || 'keine', sigList(-n).join(', '), (n > 0 ? SHARPS.slice(1, n + 1).map(l => deL(l, 1)) : FLATS.slice(1, -n + 1).map(l => deL(l, -1))).join(', ')];
    return Q({ q: `Welche Vorzeichen hat <b>${keyLabel(n, minor)}</b>?`, choices: choices(right, wrongs), explain: `Reihenfolge der Kreuze: fis cis gis dis ais eis his („Geh Du Alter Esel Hole Fisch“ ist die Dur-Reihe G D A E H Fis). Reihenfolge der Bs: b es as des ges ces fes.`, sig: 'ka' + n + minor });
  };
  G.scaleNotes = (o = {}) => {
    const max = o.max || 4; const n = (rnd(2) ? 1 : -1) * rnd(max + 1);
    const minor = o.mode === 'minor' || (o.mode === 'both' && rnd(2) === 0);
    const kind = minor ? (o.kind || 'nat') : 'nat';
    const [l, a] = keyOfN(n, minor);
    const sc = scale(l, a, minor, kind);
    const str = arr => arr.map(x => de(x)).join(' ');
    const right = str(sc);
    const wrongs = [];
    for (let i = 0; i < 6; i++) { const j = 1 + rnd(6); const c = sc.slice(); const p = P(c[j]); c[j] = sci(p.letter, p.alter + pick([1, -1]), p.oct); if (Math.abs(P(c[j]).alter) <= 1) wrongs.push(str(c)); }
    const lab = minor ? deKey(l, a, true) + (kind === 'harm' ? ' (harmonisch)' : kind === 'mel' ? ' (melodisch, aufwärts)' : ' (natürlich)') : deKey(l, a, false);
    return Q({ q: `Welche Tonleiter ist <b>${lab}</b>?`, choices: choices(right, wrongs), explain: minor ? 'Moll natürlich: G H G G H G G. Harmonisch: 7. Stufe erhöht (Leitton). Melodisch aufwärts: 6. und 7. Stufe erhöht.' : 'Dur: Ganz–Ganz–Halb–Ganz–Ganz–Ganz–Halb. Halbtöne zwischen 3–4 und 7–8.', sig: 'sn' + n + minor + kind });
  };
  G.scaleDegree = (o = {}) => {
    const max = o.max || 4; const n = (rnd(2) ? 1 : -1) * rnd(max + 1);
    const minor = !!o.minor && rnd(2) === 0;
    const [l, a] = keyOfN(n, minor); const sc = scale(l, a, minor);
    const d = 1 + rnd(6); const right = de(sc[d]);
    return Q({ q: `Welcher Ton ist die <b>${d + 1}. Stufe</b> von ${deKey(l, a, minor)}?`, choices: choices(right, sc.map(x => de(x)).concat(sc.map(x => { const p = P(x); return deL(p.letter, p.alter + 1); }))), explain: `${deKey(l, a, minor)}: ${sc.map(x => de(x)).join(' ')}.`, sig: 'sd' + n + minor + d });
  };
  G.circle = (o = {}) => {
    const kind = pick(['up', 'down', 'rel']);
    const n = -4 + rnd(9);
    if (kind === 'rel') { const minor = rnd(2) === 0; const right = keyLabel(n, !minor); return Q({ q: `Wie heißt die Paralleltonart von <b>${keyLabel(n, minor)}</b>?`, choices: choices(right, [keyLabel(n + 1, !minor), keyLabel(n - 1, !minor), keyLabel(n, minor), keyLabel(n + 3 > 7 ? n - 3 : n + 3, !minor)]), explain: 'Parallele Tonarten haben dieselben Vorzeichen. Moll liegt eine kleine Terz (3 Halbtöne) unter Dur: C-Dur ↔ a-Moll.', sig: 'cr' + n + minor }); }
    const m = kind === 'up' ? n + 1 : n - 1;
    const right = keyLabel(m, false);
    return Q({ q: kind === 'up' ? `Welche Dur-Tonart liegt im Quintenzirkel eine Quinte <b>über</b> ${keyLabel(n, false)} (ein ♯ mehr bzw. ein ♭ weniger)?` : `Welche Dur-Tonart liegt eine Quinte <b>unter</b> ${keyLabel(n, false)} (ein ♭ mehr bzw. ein ♯ weniger)?`, choices: choices(right, [keyLabel(n + 2, false), keyLabel(n - 2, false), keyLabel(kind === 'up' ? n - 1 : n + 1, false), keyLabel(n, true)]), explain: 'Im Uhrzeigersinn: jeweils eine Quinte höher und ein Kreuz mehr (C G D A E H Fis). Gegen den Uhrzeigersinn: Quarte höher/Quinte tiefer, ein B mehr (C F B Es As Des Ges).', sig: 'cc' + n + kind });
  };
  G.minorKind = (o = {}) => {
    const n = -2 + rnd(5); const [l, a] = keyOfN(n, true);
    const kind = pick(['nat', 'harm', 'mel']);
    const sc = scale(l, a, true, kind, 4).concat([sci(l, a, 5)]);
    const right = { nat: 'natürliches Moll', harm: 'harmonisches Moll', mel: 'melodisches Moll' }[kind];
    return Q({ q: `${deKey(l, a, true)} – welche Moll-Form ist das?`, fig: fig.staff([{ r: sc.map(x => x + '/q').join(' ') }], { key: engKey(n), w: 380, s: 10, spec: { time: null } }), choices: ['natürliches Moll', 'harmonisches Moll', 'melodisches Moll'].map(t => ({ t, ok: t === right })), explain: 'Schau auf die 6. und 7. Stufe: keine Erhöhung = natürlich; nur die 7. erhöht = harmonisch (übermäßige Sekunde!); 6. und 7. erhöht = melodisch.', sig: 'mk' + n + kind, play: sc.map((x, i) => ({ t: i * 0.6, m: [midiOf(x)], d: 0.55 })) });
  };

  // --- Akkorde ---
  const triRoots = (max = 3) => { const out = []; for (const l of LET) for (const a of [0, 1, -1]) { const s = sci(l, a, 4); if (Math.abs(a) && !['F', 'C', 'G', 'B', 'E', 'A', 'D'].includes(l)) continue; out.push(s); } return out.filter(s => { const p = P(s); return !(p.alter === 1 && ['E', 'B'].includes(p.letter)) && !(p.alter === -1 && ['F', 'C'].includes(p.letter)); }); };
  function goodTriad(root, type) { return chord(root, type).every(x => Math.abs(P(x).alter) <= 1); }
  G.triadQual = (o = {}) => {
    const types = o.types || ['', 'm']; let root, type, notes;
    for (let i = 0; i < 50; i++) { root = pick(o.acc ? triRoots() : LET.map(l => l + '4')); type = pick(types); if (goodTriad(root, type)) break; }
    notes = chord(root, type);
    const inv = o.inv ? rnd(3) : 0; const shown = invert(notes, inv);
    const right = TRI_DE[type];
    return Q({ q: 'Welcher Dreiklang ist das?', fig: fig.staff([{ r: tok(shown) }], { w: 150, s: 12 }), choices: types.map(t => ({ t: TRI_DE[t], ok: t === type })), explain: `Unten große Terz (4 Halbtöne) + kleine Terz (3) = Dur; kleine + große = Moll; zwei kleine = vermindert; zwei große = übermäßig. Das war ${symDe(P(root).letter, P(root).alter, type)}: ${notes.map(x => de(x)).join(' – ')}.`, sig: 'tq' + root + type + inv, play: [{ t: 0, m: shown.map(midiOf), d: 1.6 }] });
  };
  G.triadBuild = (o = {}) => {
    const types = o.types || ['', 'm']; let root, type;
    for (let i = 0; i < 50; i++) { root = pick(o.acc ? triRoots() : LET.map(l => l + '4')); type = pick(types); if (goodTriad(root, type)) break; }
    const notes = chord(root, type); const p = P(root);
    return Q({ q: `Greif <b>${symDe(p.letter, p.alter, type)}</b> (${cap(deL(p.letter, p.alter))}-${TRI_DE[type]}): Tippe alle drei Töne, dann „Prüfen“.`, fig: fig.kbd(48, 84, {}, { tap: true, labels: 'c' }), input: 'keys', answer: { pcs: notes.map(x => pcOf(midiOf(x))) }, explain: `${symDe(p.letter, p.alter, type)} = ${notes.map(x => de(x)).join(' – ')}. Grundton, dann ${type === 'm' || type === 'dim' ? 'kleine' : 'große'} Terz darauf, dann noch eine Terz.`, sig: 'tb' + root + type, play: [{ t: 0, m: notes.map(midiOf), d: 1.6 }] });
  };
  G.triadEar = (o = {}) => {
    const types = o.types || ['', 'm']; const type = pick(types);
    const base = 53 + rnd(9); const iv = { '': [4, 7], m: [3, 7], dim: [3, 6], aug: [4, 8] }[type];
    const m = [base, base + iv[0], base + iv[1]];
    const ev = o.broken ? [{ t: 0, m: [m[0]], d: 0.6 }, { t: 0.6, m: [m[1]], d: 0.6 }, { t: 1.2, m: [m[2]], d: 0.6 }, { t: 2, m, d: 1.6 }] : [{ t: 0, m, d: 1.8 }];
    return Q({ q: 'Hör zu: Welcher Dreiklang klingt?', listen: ev, choices: types.map(t => ({ t: TRI_DE[t], ok: t === type })), explain: 'Dur klingt hell/stabil, Moll dunkler/weicher, vermindert eng und gespannt, übermäßig schwebend-unheimlich.', sig: 'te' + type + base, play: ev });
  };
  G.inversion = (o = {}) => {
    let root, type; for (let i = 0; i < 50; i++) { root = pick(LET.map(l => l + '4')); type = pick(['', 'm']); if (goodTriad(root, type)) break; }
    const inv = rnd(3); const notes = invert(chord(root, type), inv);
    const names = ['Grundstellung', 'Sextakkord (1. Umkehrung)', 'Quartsextakkord (2. Umkehrung)'];
    const p = P(root);
    return Q({ q: 'Welche Stellung hat dieser Dreiklang?', fig: fig.staff([{ r: tok(notes) }], { w: 150, s: 12 }), choices: names.map((t, i) => ({ t, ok: i === inv })), explain: `Das ist ${symDe(p.letter, p.alter, type)}. Grundstellung: drei Noten Linie–Linie–Linie (Terzen). Sextakkord: Terz unten, oben eine Quarte. Quartsextakkord: Quinte unten, unten eine Quarte. Der Grundton sitzt immer über der Quarte.`, sig: 'in' + root + type + inv, play: [{ t: 0, m: notes.map(midiOf), d: 1.6 }] });
  };
  G.symNotes = (o = {}) => {
    const types = o.types || ['', 'm', '7'];
    let root, type; for (let i = 0; i < 50; i++) { root = pick(o.acc ? triRoots() : LET.map(l => l + '3')); type = pick(types); if (chord(root, type).every(x => Math.abs(P(x).alter) <= 1)) break; }
    const p = P(root); const notes = chord(root, type);
    const str = a => a.map(x => de(x)).join(' – ');
    const right = str(notes);
    const wrongs = []; const alt = types.filter(t => t !== type); alt.forEach(t => { if (TRI[t] || SEV[t]) wrongs.push(str(chord(root, t))); });
    const c2 = notes.slice(); const q = P(c2[1]); c2[1] = sci(q.letter, q.alter + (type === 'm' ? 1 : -1), q.oct); wrongs.push(str(c2));
    wrongs.push(str(chord(addIv(root, 'g2'), type)));
    return Q({ q: `Welche Töne hat <b>${symDe(p.letter, p.alter, type)}</b>?`, choices: choices(right, wrongs), explain: `Symbol lesen: Großbuchstabe = Grundton und Dur; „m“ = Moll; „7“ = kleine Septime dazu; „maj7“ = große Septime. ${symDe(p.letter, p.alter, type)} = ${right}.`, sig: 'sy' + root + type, play: [{ t: 0, m: notes.map(midiOf), d: 1.6 }] });
  };
  G.notesSym = (o = {}) => {
    const types = o.types || ['', 'm'];
    let root, type; for (let i = 0; i < 50; i++) { root = pick(o.acc ? triRoots() : LET.map(l => l + '4')); type = pick(types); if (chord(root, type).every(x => Math.abs(P(x).alter) <= 1)) break; }
    const inv = o.inv ? rnd(type in TRI ? 3 : 4) : 0; const notes = invert(chord(root, type), inv);
    const p = P(root); const right = symDe(p.letter, p.alter, type);
    const wr = types.map(t => symDe(p.letter, p.alter, t)).concat(LET.map(l => symDe(l, 0, type)));
    return Q({ q: 'Welches Akkordsymbol passt?', fig: fig.staff([{ r: tok(notes) }], { w: 150, s: 12 }), choices: choices(right, wr), explain: `Bring die Töne in Terzschichtung – der unterste Ton ist dann der Grundton. Hier: ${chord(root, type).map(x => de(x)).join(' – ')} = ${right}.`, sig: 'ns' + root + type + inv, play: [{ t: 0, m: notes.map(midiOf), d: 1.6 }] });
  };
  G.seventh = (o = {}) => {
    const types = o.types || ['7', 'maj7', 'm7', 'm7b5', 'dim7'];
    let root, type; for (let i = 0; i < 60; i++) { root = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B3']); type = pick(types); if (chord(root, type).every(x => Math.abs(P(x).alter) <= 1 || type === 'dim7')) break; }
    const notes = chord(root, type); const p = P(root);
    return Q({ q: 'Welcher Septakkord ist das?', fig: fig.staff([{ r: tok(notes) }], { w: 150, s: 12 }), choices: types.map(t => ({ t: SEV_DE[t], ok: t === type })), explain: `${symDe(p.letter, p.alter, type)} = ${notes.map(x => de(x)).join(' – ')}. Erst den Dreiklang bestimmen, dann die Septime: große Septime = 1 Halbton unter der Oktave, kleine = 2 Halbtöne darunter.`, sig: 'sv' + root + type, play: [{ t: 0, m: notes.map(midiOf), d: 1.8 }] });
  };
  G.degree = (o = {}) => {
    const max = o.max || 3; const n = (rnd(2) ? 1 : -1) * rnd(max + 1);
    const minor = o.minor ? rnd(2) === 0 : false;
    const degs = o.degs || [0, 3, 4, 5]; const d = pick(degs);
    const c = degreeChord(n, minor, d);
    const all = [0, 1, 2, 3, 4, 5, 6].map(i => degreeChord(n, minor, i).sym);
    return Q({ q: `${keyLabel(n, minor)}: Welcher Akkord steht auf der <b>${ROM[d]}. Stufe</b>?`, choices: choices(c.sym, all), explain: `Baue auf jedem Ton der Tonleiter einen Dreiklang nur aus Tönen der Tonart. ${keyLabel(n, minor)}: ${all.map((s, i) => romOf(i, degreeChord(n, minor, i).type) + ' = ' + s).join(' · ')}.${minor ? ' (In Moll ist V meist Dur – mit Leitton aus harmonisch Moll.)' : ''}`, sig: 'dg' + n + minor + d });
  };
  G.func = (o = {}) => {
    const n = -3 + rnd(7);
    const d = pick([0, 3, 4]);
    const c = degreeChord(n, false, d);
    const right = { 0: 'Tonika (I)', 3: 'Subdominante (IV)', 4: 'Dominante (V)' }[d];
    return Q({ q: `Welche Funktion hat <b>${c.sym}</b> in ${keyLabel(n, false)}?`, choices: ['Tonika (I)', 'Subdominante (IV)', 'Dominante (V)'].map(t => ({ t, ok: t === right })), explain: 'Tonika = Ruhe (I). Dominante = Spannung, will zur Tonika (V, liegt eine Quinte über I). Subdominante = Aufbruch, liegt eine Quinte unter I (IV).', sig: 'fn' + n + d });
  };
  const PROGS = { pop: [0, 4, 5, 3], sad: [5, 3, 0, 4], cad: [0, 3, 4, 0], twofive: [1, 4, 0, 0], canon: [0, 4, 5, 2, 3, 0, 3, 4], minor: [0, 5, 2, 6] };
  const PROG_DE = { pop: 'I – V – vi – IV', sad: 'vi – IV – I – V', cad: 'I – IV – V – I', twofive: 'ii – V – I', canon: 'Pachelbel: I – V – vi – iii – IV – I – IV – V', minor: 'i – VI – III – VII (Moll)' };
  G.prog = (o = {}) => {
    const name = pick(o.set || ['pop', 'sad', 'cad']); const minor = name === 'minor';
    const n = -3 + rnd(7);
    const degs = PROGS[name].slice(0, name === 'twofive' ? 3 : name === 'canon' ? 8 : 4);
    const syms = degs.map(d => minor ? degreeChord(n, true, d, false).sym : degreeChord(n, false, d).sym);
    const right = syms.join(' – ');
    const wrongs = [];
    for (let k = 0; k < 6; k++) { const s = syms.slice(); const j = rnd(s.length); const alt = minor ? degreeChord(n, true, (degs[j] + pick([1, 6, 3])) % 7, false).sym : degreeChord(n, false, (degs[j] + pick([1, 6, 3])) % 7).sym; s[j] = alt; wrongs.push(s.join(' – ')); }
    const rightN = n + (minor ? 0 : 0);
    wrongs.push(degs.map(d => minor ? degreeChord(n + 1, true, d, false).sym : degreeChord(n + 1, false, d).sym).join(' – '));
    return Q({ q: `Spiel die Folge <b>${PROG_DE[name]}</b> in <b>${keyLabel(n, minor)}</b> – welche Akkorde sind das?`, choices: choices(right, wrongs), explain: `Stufen in ${keyLabel(n, minor)}: ${[0, 1, 2, 3, 4, 5, 6].map(i => (minor ? degreeChord(n, true, i, false) : degreeChord(n, false, i)).sym).join(' ')}. Großbuchstaben-Stufe = Dur, klein = Moll.`, sig: 'pg' + name + n });
  };
  G.secDom = (o = {}) => {
    const n = -2 + rnd(5); const d = pick([1, 2, 3, 4, 5]);
    const tgt = degreeChord(n, false, d);
    const domRoot = addIv(tgt.root, 'r5'); const p = P(domRoot);
    const right = symDe(p.letter, p.alter, '7');
    const wr = [symDe(p.letter, p.alter, 'm7'), symDe(P(addIv(tgt.root, 'r4')).letter, P(addIv(tgt.root, 'r4')).alter, '7'), symDe(P(addIv(tgt.root, 'g2')).letter, P(addIv(tgt.root, 'g2')).alter, '7'), degreeChord(n, false, 4).sym + '7'];
    return Q({ q: `${keyLabel(n, false)}: Welcher Akkord ist die <b>Zwischendominante zu ${tgt.sym}</b> (V7/${romOf(d, DEG_MAJ[d])})?`, choices: choices(right, wr), explain: `Die Dominante eines Akkords liegt eine Quinte über seinem Grundton und ist immer Dur mit kleiner Septime: zu ${tgt.sym} gehört ${right}.`, sig: 'sd' + n + d });
  };
  G.cadence = (o = {}) => {
    const n = -2 + rnd(5);
    const kinds = [['V-I', [4, 0], 'Ganzschluss (authentisch)'], ['IV-I', [3, 0], 'plagaler Schluss („Amen“)'], ['I-V', [0, 4], 'Halbschluss'], ['V-vi', [4, 5], 'Trugschluss']];
    const [k, degs, right] = pick(kinds);
    const syms = degs.map(d => degreeChord(n, false, d).sym);
    const ev = degs.map((d, i) => ({ t: i * 1.5, m: degreeChord(n, false, d).notes.map(x => midiOf(x) - 12), d: 1.4 }));
    return Q({ q: `${keyLabel(n, false)}: Die Phrase endet mit <b>${syms.join(' → ')}</b>. Welcher Schluss ist das?`, listen: ev, choices: kinds.map(x => ({ t: x[2], ok: x[2] === right })), explain: 'V→I: Ganzschluss (fertig). IV→I: plagal, weich. Endet auf V: Halbschluss (Komma, nicht Punkt). V→vi: Trugschluss – das Ohr erwartet I und wird getäuscht.', sig: 'cd' + n + k, play: ev });
  };

  // --- Begriffe, Symbole ---
  G.term = (o = {}) => {
    const pool = GLOSS.filter(g => (!o.cats || o.cats.includes(g.cat)) && (!o.ids || o.ids.includes(g.id)) && (!o.lessons || o.lessons.includes(g.lesson)));
    if (pool.length < 2) return null;
    const g = pick(pool);
    const same = GLOSS.filter(x => x.cat === g.cat && x.id !== g.id);
    const dir = o.dir || (rnd(2) ? 'def' : 'term');
    if (dir === 'def') return Q({ q: `Was bedeutet <b>${g.term}</b>?`, choices: choices(g.short || g.def, same.map(x => x.short || x.def)), explain: `<b>${g.term}</b>: ${g.def}`, sig: 'tm' + g.id });
    return Q({ q: `Welcher Begriff passt: <i>${g.short || g.def}</i>?`, choices: choices(g.term, same.map(x => x.term)), explain: `<b>${g.term}</b>: ${g.def}`, sig: 'tt' + g.id });
  };
  G.symbol = (o = {}) => {
    const SYM = [
      ['st', 'Staccato', 'kurz, abgesetzt (etwa halbe Dauer)', 'B4/q!st'], ['tn', 'Tenuto', 'Note voll aushalten, leicht betont', 'B4/q!tn'], ['ac', 'Akzent', 'diese Note betonen', 'B4/q!ac'], ['fe', 'Fermate', 'anhalten – länger als notiert', 'B4/h!fe'],
      ['mord', 'Mordent', 'Hauptnote – untere Nebennote – Hauptnote, schnell', 'B4/q!o=mord'], ['prall', 'Pralltriller', 'Hauptnote – obere Nebennote – Hauptnote, schnell', 'B4/q!o=prall'], ['tr', 'Triller', 'schneller Wechsel mit der oberen Nebennote', 'B4/h!o=tr'], ['turn', 'Doppelschlag', 'obere Nebennote – Hauptnote – untere – Hauptnote', 'B4/q!o=turn'],
      ['tie', 'Haltebogen', 'zwei gleiche Töne verbunden: nur einmal anschlagen, zusammen aushalten', 'B4/h!~ B4/h'], ['slur', 'Legatobogen', 'verschiedene Töne gebunden spielen (legato)', 'B4/q!( C5/q D5/q E5/q!)'],
      ['ped', 'Pedalzeichen', 'Pedal treten (Ped.) und loslassen (*)', 'B4/q!Pd C5/q D5/q E5/q!Pu']
    ].filter(x => !o.set || o.set.includes(x[0]));
    const x = pick(SYM);
    const same = SYM.filter(y => y !== x);
    if (rnd(2)) return Q({ q: 'Wie heißt dieses Zeichen?', fig: fig.staff([{ r: x[3] }], { w: 200, s: 12 }), choices: choices(x[1], same.map(y => y[1])), explain: `${x[1]}: ${x[2]}.`, sig: 'sm' + x[0] });
    return Q({ q: 'Was verlangt dieses Zeichen?', fig: fig.staff([{ r: x[3] }], { w: 200, s: 12 }), choices: choices(x[2], same.map(y => y[2])), explain: `${x[1]}: ${x[2]}.`, sig: 'sm2' + x[0] });
  };
  G.dynOrder = (o = {}) => {
    const all = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];
    const k = 3 + rnd(2); const sel = shuffle(all).slice(0, k); const right = all.filter(x => sel.includes(x));
    const shownOrder = shuffle(sel);
    const wrongs = [right.slice().reverse().join(' < '), shuffle(right).join(' < '), shuffle(right).join(' < ')];
    return Q({ q: `Ordne von leise nach laut: ${shownOrder.map(x => `<b class="dyn">${x}</b>`).join(' ')}`, choices: choices(right.join(' < '), wrongs), explain: 'pp (pianissimo) < p (piano) < mp (mezzopiano) < mf (mezzoforte) < f (forte) < ff (fortissimo).', sig: 'do' + sel.sort().join('') });
  };
  G.repeatOrder = (o = {}) => {
    // Zufällige Formen mit Wiederholungen und Sprungzeichen; Reihenfolge wird simuliert.
    const L = 'ABCDEFGH';
    const type = pick(['rep', 'rep', 'volta', 'dcfine', 'dsfine', 'dccoda']);
    const n = type === 'dccoda' ? 5 + rnd(2) : 4 + rnd(3);
    const bars = Array.from({ length: n }, (_, i) => ({ label: L[i] }));
    let order = [], wr = [], ex = '';
    const seq = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
    const lin = seq(0, n - 1);
    if (type === 'rep') {
      const s0 = rnd(n - 2), e0 = s0 + 1 + rnd(Math.min(2, n - 2 - s0));
      const fromStart = s0 === 0 || rnd(3) === 0;
      if (!fromStart) bars[s0].begin = '|:'; bars[e0].end = ':|';
      const st = fromStart ? 0 : s0;
      order = seq(0, e0).concat(seq(st, e0), seq(e0 + 1, n - 1));
      wr.push(lin, seq(0, e0).concat(seq(0, e0), seq(e0 + 1, n - 1)), seq(0, e0).concat(seq(e0, e0), seq(e0 + 1, n - 1)), seq(0, e0).concat(seq(st, e0), seq(st, e0), seq(e0 + 1, n - 1)));
      ex = fromStart ? 'Ohne |: geht die Wiederholung zurück zum Anfang.' : 'Wiederholt wird nur der Abschnitt zwischen |: und :|.';
    } else if (type === 'volta') {
      const v1 = n - 2, v2 = n - 1; const s0 = rnd(2) ? 0 : 1;
      if (s0) bars[s0].begin = '|:'; bars[v1].volta = '1.'; bars[v1].end = ':|'; bars[v2].volta = '2.'; bars[v2].voltaOpen = true;
      order = seq(0, v1).concat(seq(s0, v1 - 1), [v2]);
      wr.push(seq(0, v1).concat(seq(s0, v1), [v2]), lin, seq(0, v1).concat(seq(0, v1 - 1), [v1, v2]), seq(0, v1).concat(seq(s0, v1 - 1)));
      ex = 'Erster Durchgang mit 1. Klammer, dann zurück; beim zweiten Mal die 1. Klammer überspringen und die 2. spielen.';
    } else if (type === 'dcfine') {
      const f = 1 + rnd(n - 2); bars[f].textEnd = 'Fine'; bars[n - 1].textEnd = 'D.C. al Fine';
      order = lin.concat(seq(0, f));
      wr.push(lin.concat(lin), lin, lin.concat(seq(0, f - 1)), lin.concat(seq(f + 1, n - 1)));
      ex = 'D.C. (da capo) = zurück zum Anfang, dann bis „Fine“.';
    } else if (type === 'dsfine') {
      const sg = 1 + rnd(n - 3); const f = sg + rnd(n - 1 - sg); bars[sg].text = '𝄋'; bars[f].textEnd = (bars[f].textEnd ? bars[f].textEnd + ' ' : '') + 'Fine'; bars[n - 1].textEnd = 'D.S. al Fine';
      order = lin.concat(seq(sg, f));
      wr.push(lin.concat(seq(0, f)), lin.concat(seq(sg, n - 1)), lin, lin.concat(seq(0, sg)));
      ex = 'D.S. (dal segno) = zurück zum Zeichen 𝄋, dann bis „Fine“.';
    } else {
      const dcAt = n - 2, tc = 1 + rnd(dcAt - 1); bars[tc].textEnd = 'zur Coda 𝄌'; bars[dcAt].textEnd = 'D.C. al Coda'; bars[dcAt].end = '||'; bars[n - 1].text = '𝄌 Coda';
      order = seq(0, dcAt).concat(seq(0, tc), [n - 1]);
      wr.push(seq(0, dcAt).concat(seq(0, dcAt), [n - 1]), lin, seq(0, dcAt).concat(seq(0, tc)), seq(0, dcAt).concat([n - 1]));
      ex = 'D.C. al Coda: zurück zum Anfang, bis zum Coda-Zeichen 𝄌 – dann direkt zur Coda springen.';
    }
    const str = a => a.map(i => L[i]).join(' ');
    const right = str(order);
    const wrongs = uniq(wr.map(str)).filter(x => x !== right);
    const ms = bars.map(b => Object.assign({ r: 'B4/w' }, b));
    return Q({ q: 'In welcher Reihenfolge werden die Takte gespielt?', fig: fig.staff(ms, { w: Math.min(520, 90 * n + 40), s: 9, spec: { final: true } }), choices: choices(right, wrongs), explain: ex, sig: 'ro' + type + JSON.stringify(bars) });
  };

  // --- Blattspiel / Tonart erkennen ---
  G.keyOfMelody = (o = {}) => {
    const n = -2 + rnd(5); const minor = rnd(2) === 0;
    const [l, a] = keyOfN(n, minor); const sc = scale(l, a, minor, 'harm', 4);
    const degs = minor ? [0, 2, 4, 6, 0] : [0, 2, 4, 3, 1, 0];
    const melody = [0, pick([2, 4]), pick([1, 3]), 6, 0].map(d => sc[d]);
    if (minor) melody[3] = sc[6]; // Leitton
    const right = keyLabel(n, minor);
    return Q({ q: 'In welcher Tonart steht diese Melodie? (Achte auf Vorzeichen, Schlusston und Leitton.)', fig: fig.staff([{ r: melody.slice(0, 4).map(x => x + '/q').join(' ') }, { r: melody[4] + '/w' }], { key: engKey(n), time: 'C', w: 300, s: 10 }), choices: choices(right, [keyLabel(n, !minor), keyLabel(n + 1, minor), keyLabel(n - 1, minor)]), explain: `Gleiche Vorzeichen haben ${keyLabel(n, false)} und ${keyLabel(n, true)}. Entscheidend: Schlusston und ${minor ? 'der erhöhte Leitton (' + de(sc[6]) + ')' : 'ob ein Leitton der Moll-Tonart vorkommt (hier nicht)'}.`, sig: 'km' + n + minor + melody.join(''), play: melody.map((x, i) => ({ t: i, m: [midiOf(x)], d: 0.9 })) });
  };

  // --- Pools mit festen Fragen (zufällige Auswahl, Reihenfolge, Distraktoren) ---
  let POOLS = {};
  const setPools = p => { POOLS = p; };
  G.pool = (o = {}) => {
    const list = (POOLS[o.id] || []);
    if (!list.length) return null;
    const it = pick(list);
    return Q({ q: it.q, choices: choices(it.a, it.w, Math.min(4, it.w.length + 1)), explain: it.e || '', sig: 'pl' + o.id + list.indexOf(it), fig: it.fig || null });
  };

  /* ---------- Blattspiel-Generator ---------- */
  function sightRead(lv = 1, seedRand) {
    // lv: 1 RH C-Lage Viertel/Halbe · 2 + Achtel · 3 beide Hände abwechselnd · 4 G/F-Dur, beide Hände · 5 bis 2 Vorzeichen, Sprünge, Punktierung · 6 bis 3 Vorzeichen, Akkorde links
    const L = Object.assign({ bars: 4, time: 'C', key: 0, rset: ['h', 'q'], span: 4, lh: 'none', leap: 2 }, [null,
      { rset: ['h', 'q', 'w'] }, { rset: ['h', 'q', '8'] }, { rset: ['h', 'q', '8'], lh: 'roots' }, { rset: ['h', 'q', '8', 'h.'], lh: 'roots', key: pick([0, 1, -1]), time: pick(['C', '3/4']) },
      { rset: ['h', 'q', '8', 'q.'], lh: 'fifths', key: pick([0, 1, -1, 2, -2]), time: pick(['C', '3/4']), span: 7, leap: 4 },
      { rset: ['h', 'q', '8', 'q.', '16'], lh: 'chords', key: pick([0, 1, -1, 2, -2, 3, -3]), time: pick(['C', '3/4', '6/8']), span: 8, leap: 5, bars: 8 }][Math.min(lv, 6)] || {});
    const n = L.key; const minor = lv >= 5 && rnd(3) === 0;
    const [kl, ka] = keyOfN(n, minor);
    const sc = scale(kl, ka, minor, minor ? 'harm' : 'nat', 4).concat(scale(kl, ka, minor, minor ? 'harm' : 'nat', 5));
    let deg = 0; const ms = [];
    const time = L.time; const tB = barBeats(time === 'C' ? '4/4' : time);
    for (let b = 0; b < L.bars; b++) {
      let rh = randRhythm(time === 'C' ? '4/4' : time, L.rset.filter(v => RV[v] <= tB));
      if (b === L.bars - 1) rh = time === '3/4' ? ['h.'] : time === '6/8' ? ['h.'] : ['w'];
      const toks = rh.map((v, i) => {
        if (b === L.bars - 1) deg = 0;
        else { const step = pick([-1, 1, 1, -1, 0, 2, -2].concat(L.leap > 2 ? [3, -3, 4, -4].slice(0, L.leap - 2) : [])); deg = Math.max(0, Math.min(L.span, deg + step)); }
        return sc[deg] + '/' + v;
      });
      const m = { r: toks.join(' ') };
      const chordDeg = b === L.bars - 1 ? 0 : b === L.bars - 2 ? 4 : pick([0, 3, 4, 5]);
      const dc = degreeChord(n, minor, chordDeg);
      const root3 = sci(P(dc.root).letter, P(dc.root).alter, 3);
      const full = time === '3/4' ? 'h.' : time === '6/8' ? 'h.' : 'w';
      if (L.lh === 'roots') m.l = root3 + '/' + full;
      else if (L.lh === 'fifths') m.l = `(${root3} ${addIv(root3, 'r5')})/${full}`;
      else if (L.lh === 'chords') { const nt = chord(root3, dc.type); m.l = time === '6/8' ? `${nt[0]}/8 ${nt[2]}/8 ${nt[1]}/8 ${nt[2]}/8 ${nt[1]}/8 ${nt[2]}/8` : time === '3/4' ? `${nt[0]}/q (${nt[1]} ${nt[2]})/q (${nt[1]} ${nt[2]})/q` : `${nt[0]}/q ${nt[2]}/q ${nt[1]}/q ${nt[2]}/q`; }
      if (b === L.bars - 1) m.end = '|.';
      ms.push(m);
    }
    const staves = L.lh === 'none' ? ['treble'] : ['treble', 'bass'];
    return { spec: { staves, key: engKey(n), time, measures: ms }, key: keyLabel(n, minor), bpm: lv <= 2 ? 60 : 72, lv };
  }

  return { G, LET, SEMI, P, de, deL, deKey, sci, midiOf, diaOf, fromDia, addIv, ivBetween, IVS, IVK, SIZE, scale, keyLabel, engKey, sigList, chord, invert, symDe, degreeChord, TRI_DE, SEV_DE, ROM, romOf, pick, shuffle, rnd, setGloss, setPools, sightRead, randRhythm, rhythmTok, RV, RNAME, barBeats, MAJ, MIN, keyOfN, fig, tok };
})();
if (typeof module !== 'undefined') module.exports = TH;
