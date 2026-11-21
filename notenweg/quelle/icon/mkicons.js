// Rendert icon.svg in die App-Icon-Größen. Aufruf: node quelle/icon/mkicons.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const s of [1024, 512, 192, 180]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<html><body style="margin:0;background:#0C1119">${svg.replace('width="1024" height="1024"', `width="${s}" height="${s}"`)}</body></html>`);
    await p.screenshot({ path: path.join(__dirname, `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
    await p.close();
  }
  await b.close();
})();
