// Rendert alle Stücke mit Engrave.render und schreibt Hash pro Stück
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), path = require('path');
const Q = process.argv[2], OUT = process.argv[3];
const ctx = { console, Math, JSON }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(Q + '/src/glyphs.js', 'utf8') + '\n' + fs.readFileSync(Q + '/src/engine.js', 'utf8') + '\n;this.Engrave=Engrave;', ctx);
const dir = Q + '/src/stuecke'; const res = {};
for (const f of fs.readdirSync(dir)) {
  if (f.startsWith('_')) continue;
  const p = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); if (!p.measures || !p.measures.length) continue;
  const staves = ['treble', 'bass'];
  try {
    const r = ctx.Engrave.render({ staves, key: p.key, time: p.time, measures: p.measures, width: 760, s: 8, clefInit: p.clefInit, prefix: 'x' });
    const str = JSON.stringify({ svg: r.svg || r, ev: r.events, ped: r.pedals });
    res[p.id] = crypto.createHash('md5').update(str).digest('hex');
    if (process.argv[4] && p.id === process.argv[4]) fs.writeFileSync('/home/claude/one.svg', r.svg || r);
  } catch (e) { res[p.id] = 'ERR ' + e.message; }
}
fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); console.log(Object.keys(res).length, 'gerendert', Object.values(res).filter(v => v.startsWith('ERR')).length, 'Fehler');
