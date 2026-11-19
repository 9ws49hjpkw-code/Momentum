// Friert eine Momentum-Version ein: versionen/<x.y.z>/ (zum Anschauen und Ausprobieren) und baut versionen/index.html neu.
//
//   node quelle/archiv.js "Ein Satz, was neu ist"                       → archiviert die gerade gebaute App im Root
//   node quelle/archiv.js --quelle <ordner> --datum JJJJ-MM-TT "Satz"    → archiviert eine ältere Version (z. B. aus git archive)
//   node quelle/archiv.js --nur-liste                                    → baut nur versionen/index.html neu
//
// Eine archivierte Kopie ist bewusst abgekapselt, damit sie die echte App nie berührt:
// eigene Datenbank „momentum-archiv-<x.y.z>“, kein Service Worker, keine Update-Prüfung, kein Manifest, kein Installieren-Hinweis.
// Schon archivierte Versionen werden nie überschrieben.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'versionen');
const LIST = path.join(__dirname, 'versionen.json');
const ICONS = ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = k => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
const onlyList = flag('--nur-liste');
const src = path.resolve(opt('--quelle') || ROOT);
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
const date = opt('--datum') || today;
const text = args.join(' ').trim();

const list = fs.existsSync(LIST) ? JSON.parse(fs.readFileSync(LIST, 'utf8')) : [];
const fail = m => { console.error('✗ ' + m); process.exit(1); };

function patch(html, v) {
  const steps = [
    ['<link rel="manifest" href="manifest.json">\n', ''],
    ["const NAME = 'momentum',", `const NAME = 'momentum-archiv-${v}',`],
    ["if (!('serviceWorker' in navigator)", "if (true || !('serviceWorker' in navigator)"],
    ['const sw = navigator.serviceWorker && navigator.serviceWorker.controller;', 'const sw = null;'],
    ["const inSafariTab = ('standalone' in navigator) && !navigator.standalone;", 'const inSafariTab = false;'],
    ['<title>Momentum</title>', `<title>Momentum ${v} · Archiv</title>\n<meta name="robots" content="noindex">`],
  ];
  for (const [a, b] of steps) {
    const n = html.split(a).length - 1;
    if (n !== 1) fail(`Archiv-Anpassung passt nicht (${n}× gefunden): ${a.trim()}`);
    html = html.replace(a, b);
  }
  return html;
}

if (!onlyList) {
  if (!text) fail('Bitte einen Satz angeben, was in dieser Version neu ist.');
  const html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
  const m = html.match(/<meta name="momentum-build" content="([^"]+)">/);
  if (!m) fail('Keine Build-Nummer in index.html gefunden.');
  const v = m[1], out = path.join(DIR, v);
  if (fs.existsSync(out) || list.some(e => e.version === v)) fail(`Version ${v} ist schon archiviert, sie bleibt unverändert.`);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), patch(html, v));
  for (const f of ICONS) if (fs.existsSync(path.join(src, f))) fs.copyFileSync(path.join(src, f), path.join(out, f));
  list.push({ version: v, datum: date, text });
  list.sort((a, b) => cmp(a.version, b.version));
  fs.writeFileSync(LIST, JSON.stringify(list, null, 2) + '\n');
  console.log(`✓ Version ${v} eingefroren: versionen/${v}/`);
}

function cmp(a, b) { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const de = d => { const [y, mo, da] = d.split('-'); return `${+da}. ${['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][+mo - 1]} ${y}`; };

const items = list.slice().reverse().map((e, i, all) => {
  const badge = i === 0 ? '<span class="badge now">Neueste</span>' : (i === all.length - 1 ? '<span class="badge first">Der Anfang</span>' : '');
  return `<a class="v" href="${esc(e.version)}/"><i class="dot"></i><div class="card"><div class="top"><b>${esc(e.version)}</b>${badge}</div><time>${esc(de(e.datum))}</time><p>${esc(e.text)}</p><span class="go">Ausprobieren →</span></div></a>`;
}).join('\n');

const page = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Momentum · Versionen</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#04070C">
<meta name="color-scheme" content="dark">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<style>
*{box-sizing:border-box;margin:0;-webkit-tap-highlight-color:transparent}
html{background:#04070C}
body{min-height:100vh;color:#E8F1F8;font:16px/1.45 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;
  padding:calc(env(safe-area-inset-top) + 34px) 20px calc(env(safe-area-inset-bottom) + 40px);
  background:radial-gradient(120% 60% at 100% 0%,rgba(98,217,255,.16),transparent 60%),radial-gradient(90% 50% at 0% 100%,rgba(140,110,255,.10),transparent 60%),#04070C;background-attachment:fixed}
main{max-width:520px;margin:0 auto}
h1{font-size:34px;font-weight:700;letter-spacing:-.02em}
h1 span{color:#7FE0FF;text-shadow:0 0 18px rgba(98,217,255,.6)}
.sub{color:#8A9BAD;margin:8px 0 26px;font-size:15px}
.live{display:flex;align-items:center;justify-content:space-between;min-height:54px;padding:0 18px;margin-bottom:30px;border-radius:18px;
  color:#04070C;font-weight:600;text-decoration:none;background:linear-gradient(90deg,#7FE0FF,#B5EEFF);box-shadow:0 0 28px rgba(98,217,255,.35)}
.line{position:relative;padding-left:26px}
.line::before{content:"";position:absolute;left:6px;top:10px;bottom:10px;width:1.5px;background:linear-gradient(#7FE0FF,rgba(127,224,255,.08));box-shadow:0 0 10px rgba(98,217,255,.5)}
.v{position:relative;display:block;margin-bottom:16px;color:inherit;text-decoration:none}
.dot{position:absolute;left:-25px;top:22px;width:11px;height:11px;border-radius:50%;background:#04070C;border:1.5px solid #7FE0FF;box-shadow:0 0 10px rgba(98,217,255,.8)}
.v:first-child .dot{background:#7FE0FF}
.card{padding:16px 18px;border-radius:20px;background:rgba(255,255,255,.045);border:1px solid rgba(127,224,255,.14);
  -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);transition:transform .35s cubic-bezier(.3,1.4,.5,1),border-color .2s}
.v:active .card{transform:scale(.97);border-color:rgba(127,224,255,.5)}
.top{display:flex;align-items:center;gap:10px}
.top b{font-size:24px;font-weight:600;letter-spacing:-.01em}
.badge{font-size:12px;font-weight:600;padding:3px 9px;border-radius:99px;border:1px solid rgba(127,224,255,.45);color:#7FE0FF}
.badge.first{border-color:rgba(255,200,120,.45);color:#FFD08A}
time{display:block;color:#6F8193;font-size:13px;margin-top:2px}
p{margin-top:8px;color:#C9D6E2;font-size:15px}
.go{display:inline-block;margin-top:10px;color:#7FE0FF;font-size:14px;font-weight:500}
.note{color:#5E6E7E;font-size:13px;margin-top:22px}
@media (prefers-reduced-motion:reduce){.card{transition:none}}
</style>
</head>
<body>
<main>
<h1>Momentum <span>·</span> Versionen</h1>
<p class="sub">Jede Version, eingefroren. Zum Anschauen und Ausprobieren. Deine echten Daten in der App bleiben dabei unberührt.</p>
<a class="live" href="../">Zur aktuellen App<span>→</span></a>
<div class="line">
${items}
</div>
<p class="note">Jede Version hat hier ihren eigenen, leeren Speicher. Was du darin einträgst, bleibt in dieser Version.</p>
</main>
</body>
</html>
`;
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, 'index.html'), page);
console.log(`✓ Versionsliste: ${list.length} Versionen`);
