// Token-Positionen: je Takt und Stimme Token-Index, absoluter Einsatz, MIDI-Töne
const fs = require('fs'), vm = require('vm');
const Q = '/home/claude/momentum/notenweg/quelle';
const ctx = { console, Math, JSON }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(Q + '/src/glyphs.js', 'utf8') + '\n' + fs.readFileSync(Q + '/src/engine.js', 'utf8') + '\n;this.Engrave=Engrave;', ctx);
const id = process.argv[2]; const p = JSON.parse(fs.readFileSync(Q + '/src/stuecke/' + id + '.json'));
const r = ctx.Engrave.render({ staves: ['treble', 'bass'], key: p.key, time: p.time, measures: p.measures, width: 2000, s: 8, clefInit: p.clefInit, prefix: 'z' });
const out = [];
p.measures.forEach((m, mi) => { for (const k of ['r', 'r2', 'r3', 'l', 'l2', 'l3']) { if (!m[k]) continue; const v = ctx.Engrave.parseVoice(m[k]); const toks = m[k].replace(/,/g, ' ').match(/\([^)]*\)\S*|\S+/g) || [];
  if (toks.length !== v.items.length) throw new Error('tok mismatch ' + mi + k);
  v.items.forEach((it, j) => { if (!it.rest) out.push([mi, k, j, +(r.measureStart[mi] + it.t).toFixed(4), it.pitches.map(q => q.midi), !!it.grace]); }); } });
console.log(JSON.stringify(out));
