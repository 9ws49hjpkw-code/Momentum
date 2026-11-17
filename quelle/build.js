// Baut index.html aus den Quelldateien und legt alles flach in ../momentum
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'src'), OUT = path.join(__dirname, '..');
const BUILD = '1.1.0';
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

function spring(k, c, steps) {
  let x = 0, v = 0, t = 0; const dt = 1 / 1000, s = [];
  while (t < 2.5) {
    const a = -k * (x - 1) - c * v; v += a * dt; x += v * dt; t += dt; s.push(x);
    if (t > 0.15 && Math.abs(x - 1) < 0.0006 && Math.abs(v) < 0.006) break;
  }
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const idx = Math.min(s.length - 1, Math.round(i / steps * (s.length - 1)));
    pts.push(i === 0 ? 0 : i === steps ? 1 : +s[idx].toFixed(3));
  }
  return { css: 'linear(' + pts.join(',') + ')', dur: t.toFixed(2) + 's' };
}
const soft = spring(260, 26, 36), pop = spring(420, 24, 36);
const springs = '@supports (transition-timing-function:linear(0,1)){:root{--spring:' + soft.css + ';--spring-d:' + soft.dur + ';--pop:' + pop.css + ';--pop-d:' + pop.dur + '}}';

const css = read('styles.css').replace('/*SPRINGS*/', springs);
const js = ['core.js', 'ui.js', 'views.js', 'boot.js'].map(read).join('\n');
const html = `<!DOCTYPE html>
<!--
  Momentum ${BUILD} · eine einzige Datei, keine Abhängigkeiten.

  Für spätere Updates (damit keine Daten verloren gehen):
  - Daten liegen in IndexedDB "momentum", Version 1. Stores: tasks, ideas, topics (Schlüssel id),
    journal, days (Schlüssel date, JJJJ-MM-TT), meta (Schlüssel key). Diese Namen und Schlüssel nicht ändern;
    neue Felder nur ergänzen. Ein neuer Store braucht eine höhere DB-Version mit onupgradeneeded.
  - Export/Import: JSON mit app "momentum", format 1, data { tasks, ideas, journal, topics, days }.
  - Die App läuft unter derselben Adresse weiter. Der Service Worker (sw.js) hält index.html, manifest.json
    und die Icons im Cache "momentum-cache-v1" und übernimmt eine neue index.html, sobald sie sich
    vom Cache unterscheidet und rel="manifest" enthält.
-->
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Momentum</title>
<meta name="momentum-build" content="${BUILD}">
<meta name="description" content="Aufgaben, Ideen und Journal. Schnell rein, Kopf sortiert, wieder raus.">
<meta name="theme-color" content="#04070C">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Momentum">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<style>
${css}
</style>
</head>
<body class="intro">
${read('body.html')}
<noscript><div id="fatal"><div><h1>JavaScript fehlt</h1><p>Momentum braucht JavaScript. Bitte in den Safari-Einstellungen aktivieren.</p></div></div></noscript>
<script>
(function () {
'use strict';
${js}
})();
</script>
</body>
</html>
`;
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.copyFileSync(path.join(SRC, 'sw.js'), path.join(OUT, 'sw.js'));
fs.copyFileSync(path.join(SRC, 'manifest.json'), path.join(OUT, 'manifest.json'));
console.log('index.html', (html.length / 1024).toFixed(1) + ' KB', '| spring', soft.dur, '| pop', pop.dur);
