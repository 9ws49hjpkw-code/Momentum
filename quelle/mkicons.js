const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const html = fs.readFileSync(path.join(__dirname, 'icon.html'), 'utf8');
  const out = process.argv[2] || path.join(__dirname, '..');
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update'] });
  for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await p.setContent(html);
    await p.evaluate(s => { document.getElementById('tile').style.transform = 'scale(' + s / 512 + ')'; }, size);
    await p.screenshot({ path: path.join(out, name) });
    await p.close();
  }
  await b.close();
})();
