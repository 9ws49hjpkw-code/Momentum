const fs = require('fs'), vm = require('vm');
const Q = '/home/claude/momentum/notenweg/quelle/src/';
const ctx = { console, Math, JSON }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(Q + 'glyphs.js', 'utf8') + '\n' + fs.readFileSync(Q + 'engine.js', 'utf8') + '\n' + fs.readFileSync(Q + 'lieder.js', 'utf8') + '\n;this.Engrave=Engrave;this.X=XMAS_DATA;this.H=SONGS_HAND;', ctx);
const E = ctx.Engrave; const TL = t => t === 'C' || t === 'C|' ? 4 : (([a, b]) => a * 4 / b)(t.split('/').map(Number));
const strip = s => (s || '').replace(/,/g, ' ').match(/\([^)]*\)\S*|\S+/g).map(t => t.split('!')[0]).join(' ');
function check(name, time, pickup, ms, show) {
  const L = TL(time); const probs = [];
  ms.forEach((m, i) => { for (const k of ['r', 'l', 'r2', 'l2', 'r3', 'l3']) { if (!m[k]) continue; const len = E.parseVoice(m[k]).len;
    const want = (i === 0 && pickup) ? pickup : L; const last = i === ms.length - 1;
    if (Math.abs(len - want) > 1e-6 && !(last && pickup && Math.abs(len - (L - pickup)) < 1e-6)) probs.push(`T${i + 1}${k}=${len}`); } });
  console.log(`${name} [${time}${pickup ? ' Auftakt ' + pickup : ''}] ${probs.length ? 'TAKTFEHLER ' + probs.join(' ') : 'Takte ok'}`);
  if (show) console.log('   ' + ms.map(m => strip(m.r) + (m.chords ? ' {' + m.chords.map(c => c[1]).join(',') + '}' : '')).join(' | '));
}
const show = process.argv[2] === '-v';
if (process.argv[2] !== "-j") ctx.X.forEach(s => check(s.id + ' (' + s.key + ')', s.time, s.pickup, s.measures, show));
if (process.argv[2] !== "-j") ctx.H.forEach(s => s.levels.forEach((lv, j) => check(s.id + ' L' + (j + 1), s.time, s.bars.findIndex(b => b.ch) > 0 ? TL(s.time) * 0 + E.parseVoice(s.bars[0].r).len : 0, lv, show && j === 0)));
for (const id of ['lesestuecke', 'ode']) { const p = JSON.parse(fs.readFileSync(Q + 'stuecke/' + id + '.json')); check(id, p.time, p.pickup, p.measures, show); }
console.log(ctx.X.map(s => s.id + ': ' + s.src).join('\n'));
if (process.argv[2] === '-j') { const o = {}; const add = (id, ms, time) => { const tl = TL(time); let t = 0; const ev = [];
  ms.forEach(m => { const v = E.parseVoice(m.r); v.items.forEach(it => { if (!it.rest) { const top = it.pitches[it.pitches.length - 1]; const prev = ev[ev.length - 1];
    if (prev && prev.tie && prev[1] === top.midi) { prev[2] += it.len; prev.tie = !!it.mods['~']; } else { const e = [+(t + it.t).toFixed(4), top.midi, it.len]; e.tie = !!it.mods['~']; ev.push(e); } } }); t += v.len; });
  o[id] = ev.map(e => [e[0], e[1], e[2]]); };
  ctx.X.forEach(s => add(s.id, s.measures, s.time)); ctx.H.forEach(s => add(s.id, s.levels[0], s.time));
  const p = JSON.parse(fs.readFileSync(Q + 'stuecke/ode.json')); add('ode', p.measures, p.time);
  fs.writeFileSync('/home/claude/verify/lieder.json', JSON.stringify(o)); }
