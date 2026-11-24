// App-Seite: Noten so, wie die Engine sie spielt (Haltebögen verschmolzen) + Schreibweise aus dem Notenbild.
const fs = require('fs'), vm = require('vm');
const Q = '/home/claude/momentum/notenweg/quelle';
const ctx = { console, Math, JSON }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(Q + '/src/glyphs.js', 'utf8') + '\n' + fs.readFileSync(Q + '/src/engine.js', 'utf8') + '\n;this.Engrave=Engrave;', ctx);
const out = {};
const ids = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(fs.readFileSync(Q + '/src/stuecke/_reihenfolge.json'));
const ACC = { '-2': 'bb', '-1': 'b', '0': '', '1': '#', '2': '##' };
for (const id of ids) {
  const p = JSON.parse(fs.readFileSync(Q + '/src/stuecke/' + id + '.json')); if (!p.measures || !p.measures.length) continue;
  const r = ctx.Engrave.render({ staves: ['treble', 'bass'], key: p.key, time: p.time, measures: p.measures, width: 2000, s: 8, clefInit: p.clefInit, prefix: 'z' });
  const ms = r.measureStart; const spell = {}; let graces = 0; const bad = [];
  p.measures.forEach((m, mi) => { for (const k of ['r', 'r2', 'r3', 'l', 'l2', 'l3']) { if (!m[k]) continue; let v; try { v = ctx.Engrave.parseVoice(m[k]); } catch (e) { bad.push(mi + ':' + e.message); continue; }
    v.items.forEach(it => { if (it.rest) return; const on = +(ms[mi] + it.t).toFixed(4); it.pitches.forEach(pp => { spell[on + ':' + pp.midi] = pp.letter + (ACC[pp.alter] || '') + pp.oct; }); }); } });
  const notes = [];
  r.events.forEach(e => { if (e.grace) { graces += e.midis.length; return; } const on = +e.t.toFixed(4); e.midis.forEach(m => notes.push([on, m, +e.dur.toFixed(4), e.mi, e.st, spell[on + ':' + m] || '?'])); });
  out[id] = { mstart: ms.map(x => +x.toFixed(4)), mlen: r.measures.map(m => +m.len.toFixed(4)), notes, graces, order: p.order || null, n: p.measures.length, bad, key: p.key, time: p.time };
}
fs.writeFileSync(process.env.OUT || '/home/claude/verify/app.json', JSON.stringify(out));
console.log(Object.keys(out).length, 'Stücke');
