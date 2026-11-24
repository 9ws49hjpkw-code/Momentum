// node view.js piece.json out.png [von] [bis] [breite]
const fs = require('fs'), vm = require('vm');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const Q = '/home/claude/momentum/notenweg/quelle';
const [, , pf, out, a = 0, b = 9999, w = 900] = process.argv;
const ctx = { console, Math, JSON }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(Q + '/src/glyphs.js', 'utf8') + '\n' + fs.readFileSync(Q + '/src/engine.js', 'utf8') + '\n;this.Engrave=Engrave;', ctx);
const p = JSON.parse(fs.readFileSync(pf, 'utf8'));
const ms = p.measures.slice(+a, +b);
const r = ctx.Engrave.render({ staves: ['treble', 'bass'], key: (ms[0] && ms[0].key) || p.key, time: p.time, measures: ms, width: +w, s: 9, clefInit: p.clefInit, prefix: 'v' });
fs.writeFileSync('/tmp/v.html', `<html><body style="margin:10px;background:#fff;color:#000"><div style="width:${w}px">${r.svg}</div></body></html>`);
(async () => { const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] }); const pg = await br.newPage({ viewport: { width: +w + 20, height: 400 } }); await pg.goto('file:///tmp/v.html'); await pg.screenshot({ path: out, fullPage: true }); await br.close(); console.log('ok', r.events.length, 'Ereignisse'); })();
