import base64, json, re, os, zipfile
ROOT = os.path.dirname(os.path.abspath(__file__))
BUILD = '8'
src = open(f'{ROOT}/src/index.src.html').read()
logic = open(f'{ROOT}/src/logic.js').read()
app = open(f'{ROOT}/src/app.js').read().replace('__BUILD__', BUILD)
icon = base64.b64encode(open(f'{ROOT}/dist/icon-180.png', 'rb').read()).decode()
html = (src.replace('__ICON180__', f'data:image/png;base64,{icon}')
           .replace('__LOGIC__', logic).replace('__APP__', app))
D = f'{ROOT}/dist'
# GitHub-Pages-Version (mit Manifest + Offline)
gh = html.replace('<!--MANIFEST-->', '<link rel="manifest" href="manifest.json">')
open(f'{D}/index.html', 'w').write(gh)
json.dump({
  "name": "Kickerabend", "short_name": "Kicker", "start_url": "./", "scope": "./",
  "display": "standalone", "orientation": "any", "background_color": "#0D0F13", "theme_color": "#0D0F13",
  "lang": "de", "icons": [
    {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
}, open(f'{D}/manifest.json', 'w'), ensure_ascii=False, indent=2)
sw = open(f'{ROOT}/src/sw.js').read().replace('__BUILD__', BUILD)
open(f'{D}/sw.js', 'w').write(sw)
# Artifact-Version: ohne eigenes Dokument-Gerüst
head = re.search(r'<head>(.*)</head>', html, re.S).group(1)
body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>\s*', '', head)
head = re.sub(r'<meta name="viewport"[^>]*>\s*', '', head)
head = head.replace('<!--MANIFEST-->', '').replace('<title>Kickerabend</title>', '<title>Kickerabend</title>\n<meta name="claude:viewport-fit-sides" content="cover">')
open(f'{D}/artifact.html', 'w').write(head + body)
with zipfile.ZipFile(f'{D}/Kickerabend.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in ['index.html', 'manifest.json', 'sw.js', 'icon-180.png', 'icon-192.png', 'icon-512.png']:
        z.write(f'{D}/{f}', f)
print('built', len(gh) // 1024, 'KB')
