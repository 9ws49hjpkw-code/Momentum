const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png' };
const os = require('os');
const APP = process.env.MOMENTUM_DIR || path.join(__dirname, '..', '..');
const TMP = path.join(os.tmpdir(), 'momentum-test'); fs.mkdirSync(TMP, { recursive: true });
const SHOTS = path.join(__dirname, '..', 'shots');

function serve(dir, port) {
  const state = { dir, online: true };
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith('/momentum/')) { if (p === '/momentum') { res.writeHead(301, { Location: '/momentum/' }); return res.end(); } res.writeHead(404); return res.end('nf'); }
    p = p.slice('/momentum/'.length);
    if (p === '') p = 'index.html';
    const f = path.join(state.dir, p);
    if (!f.startsWith(state.dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
    const body = fs.readFileSync(f);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'max-age=600', 'ETag': '"' + body.length + '-' + fs.statSync(f).mtimeMs + '"' });
    res.end(body);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r({ srv, state, url: 'http://127.0.0.1:' + port + '/momentum/' })));
}

const CHROME = `
:root{--sat:59px!important;--sab:34px!important}
#__sb{position:fixed;left:0;right:0;top:0;height:59px;z-index:9999;pointer-events:none;font:600 16px Inter,sans-serif;color:#fff}
#__sb b{position:absolute;left:52px;top:20px;letter-spacing:-.01em}
#__sb i{position:absolute;left:50%;top:11px;width:124px;height:36px;margin-left:-62px;border-radius:20px;background:#000}
#__sb u{position:absolute;right:34px;top:23px;width:26px;height:12px;border-radius:4px;border:1.2px solid rgba(255,255,255,.5)}
#__sb u::after{content:"";position:absolute;inset:1.5px;right:6px;border-radius:2px;background:#fff}
#__hi{position:fixed;left:50%;bottom:8px;width:138px;height:5px;margin-left:-69px;border-radius:3px;background:rgba(255,255,255,.9);z-index:9999;pointer-events:none}
#__kb{position:fixed;left:0;right:0;bottom:0;z-index:9998;pointer-events:none;background:#1c1f26;display:none;border-top:1px solid #2c313b;color:#8a93a3;font:500 14px Inter,sans-serif;text-align:center;padding-top:18px}
`;
async function decorate(page) {
  await page.addStyleTag({ content: CHROME });
  await page.evaluate(() => {
    if (document.getElementById('__sb')) return;
    const sb = document.createElement('div'); sb.id = '__sb'; sb.innerHTML = '<b>9:41</b><i></i><u></u>';
    const hi = document.createElement('div'); hi.id = '__hi';
    const kb = document.createElement('div'); kb.id = '__kb'; kb.textContent = 'Tastatur';
    document.body.append(sb, hi, kb);
  });
}
// Simuliert die iOS-Tastatur: Layout-Viewport bleibt, der sichtbare Bereich schrumpft.
async function fakeKeyboard(page, h) {
  await page.evaluate(h => {
    const r = document.documentElement;
    r.style.setProperty('--kb', h + 'px');
    r.style.setProperty('--vvh', (r.clientHeight - h) + 'px');
    document.body.classList.toggle('kb-open', h > 0);
    const kb = document.getElementById('__kb'); if (kb) { kb.style.display = h ? 'block' : 'none'; kb.style.height = h + 'px'; }
  }, h);
}
async function launch() {
  return chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--font-render-hinting=none', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--disable-features=OptimizationHints,MediaRouter'] });
}
// Ersetzt visualViewport durch eine steuerbare Attrappe und blendet bei Textfeld-Fokus eine "Tastatur" ein,
// so wie iOS es tut: Layout-Viewport bleibt, sichtbarer Bereich schrumpft.
const VV = `(() => {
  const ls = { resize: [], scroll: [] };
  const fake = { height: window.innerHeight, width: window.innerWidth, offsetTop: 0, offsetLeft: 0, pageTop: 0, pageLeft: 0, scale: 1,
    addEventListener(t, f) { (ls[t] = ls[t] || []).push(f); }, removeEventListener() {} };
  Object.defineProperty(window, 'visualViewport', { value: fake, configurable: true });
  window.__kbH = 336;
  window.__vv = fake;
  window.__vvFire = t => (ls[t] || []).forEach(f => f(new Event(t)));
  window.__setKb = h => {
    fake.height = document.documentElement.clientHeight - h;
    ls.resize.forEach(f => f(new Event('resize')));
    const kb = document.getElementById('__kb'); if (kb) { kb.style.display = h ? 'block' : 'none'; kb.style.height = h + 'px'; }
  };
  const isField = e => e && (e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && ['text', 'search'].includes(e.type)));
  let t;
  document.addEventListener('focusin', e => { if (isField(e.target) && !e.target.readOnly) { clearTimeout(t); t = setTimeout(() => window.__setKb(window.__kbH), 220); } }, true);
  document.addEventListener('focusout', () => { clearTimeout(t); t = setTimeout(() => { if (!isField(document.activeElement)) window.__setKb(0); }, 60); }, true);
})();`;
async function ctx(browser, extra) {
  const c = await _ctx(browser, extra);
  await c.addInitScript(VV);
  return c;
}
async function _ctx(browser, extra) {
  return browser.newContext(Object.assign({
    viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', acceptDownloads: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
  }, extra || {}));
}
function watch(page, log) {
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') log.push('[console.' + m.type() + '] ' + m.text()); });
  page.on('pageerror', e => log.push('[pageerror] ' + e.message));
  page.on('requestfailed', r => log.push('[requestfailed] ' + r.url() + ' ' + (r.failure() || {}).errorText));
}
async function shot(page, name) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); }
async function swipe(page, sel, dx, opts) {
  opts = opts || {};
  const box = await page.locator(sel).first().boundingBox();
  const cdp = await page.context().newCDPSession(page);
  const x0 = box.x + (opts.fromX || 90), y = box.y + box.height / 2, steps = opts.steps || 12;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * i / steps, y: y + (opts.dy || 0) * i / steps }] });
    await page.waitForTimeout(opts.stepMs || 14);
  }
  if (opts.hold) { await opts.hold(); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
// Echter Fingertipp an der Stelle des Elements (trifft, was dort wirklich oben liegt)
async function tap(page, sel, n) {
  const loc = page.locator(sel).nth(n || 0);
  await loc.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  // Ohne Playwrights Stabilitäts-Warten: die App schwebt absichtlich minimal (Dauer-Schwingung)
  await loc.evaluate(e => {
    if (e.scrollIntoViewIfNeeded) e.scrollIntoViewIfNeeded(true); else e.scrollIntoView({ block: 'center' });
    const r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (hit && !e.contains(hit) && !hit.contains(e)) e.scrollIntoView({ block: 'center' });
  }, null, { timeout: 30000 }).catch(() => {});
  const box = await loc.boundingBox();
  if (!box) throw new Error('nicht sichtbar: ' + sel);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
module.exports = { tap, serve, launch, ctx, watch, shot, swipe, decorate, fakeKeyboard, sleep, SHOTS, APP, TMP };
