// Testhilfen für Notenweg: kleiner Server (wie GitHub Pages unter /Momentum/notenweg/), Browser, Screenshots.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png' };
const APP = path.join(__dirname, '..', '..');           // notenweg/
const SHOTS = path.join(__dirname, '..', 'shots');
const BASE = '/Momentum/notenweg/';

function serve(port) {
  const state = { dir: APP, online: true, override: {} };
  const srv = http.createServer((req, res) => {
    if (!state.online) { req.socket.destroy(); return; }
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith(BASE)) { res.writeHead(404); return res.end('nf'); }
    p = p.slice(BASE.length) || 'index.html';
    if (state.override[p]) { res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain', 'Cache-Control': 'no-cache' }); return res.end(state.override[p]); }
    const f = path.join(state.dir, p);
    if (!f.startsWith(state.dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'max-age=600' });
    res.end(fs.readFileSync(f));
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r({ srv, state, url: 'http://127.0.0.1:' + port + BASE })));
}
async function launch() {
  return chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--font-render-hinting=none', '--disable-background-networking', '--disable-component-update', '--no-first-run'] });
}
const DEV = {
  ipad: { viewport: { width: 834, height: 1194 }, ua: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
  ipadQuer: { viewport: { width: 1194, height: 834 }, ua: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
  iphoneSE: { viewport: { width: 375, height: 667 }, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' }
};
async function ctx(browser, dev = 'ipad', extra) {
  const d = DEV[dev];
  return browser.newContext(Object.assign({ viewport: d.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE', timezoneId: 'Europe/Berlin', acceptDownloads: true, userAgent: d.ua }, extra || {}));
}
function watch(page, log) {
  page.on('console', m => { if (m.type() === 'error') log.push('[console.error] ' + m.text()); });
  page.on('pageerror', e => log.push('[pageerror] ' + e.message));
}
async function shot(page, name) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); }
async function tap(page, sel, n) {
  const loc = page.locator(sel).nth(n || 0);
  await loc.scrollIntoViewIfNeeded({ timeout: 10000 });
  const box = await loc.boundingBox();
  if (!box) throw new Error('nicht sichtbar: ' + sel);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };
const done = () => { console.log(fails ? `\n${fails} FEHLER` : '\nalles grün'); process.exit(fails ? 1 : 0); };
module.exports = { serve, launch, ctx, watch, shot, tap, sleep, ok, done, APP, SHOTS };
