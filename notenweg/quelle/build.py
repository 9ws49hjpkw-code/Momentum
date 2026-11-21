"""Notenweg bauen: quelle/src -> notenweg/ (index.html, manifest.json, sw.js, Icons).

Aufruf (aus dem Repo-Root):  python3 notenweg/quelle/build.py
Für jede neue Version BUILD erhöhen. Die App-Dateien in notenweg/ nie von Hand ändern.
"""
import base64, json, os, shutil, sys

BUILD = '5'
VERSION = '4.4'          # sichtbare Versionsnummer in der App (Fortschritt → Deine Daten)

Q = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(Q, 'src')
OUT = os.path.dirname(Q)          # notenweg/


def rd(*p):
    return open(os.path.join(SRC, *p), encoding='utf-8').read()


def pieces():
    order = json.load(open(os.path.join(SRC, 'stuecke', '_reihenfolge.json'), encoding='utf-8'))
    files = {f[:-5] for f in os.listdir(os.path.join(SRC, 'stuecke')) if f.endswith('.json') and not f.startswith('_')}
    missing = [i for i in order if i not in files]
    extra = sorted(files - set(order))
    if missing: sys.exit('Fehlt in stuecke/: ' + ', '.join(missing))
    if extra: sys.exit('Nicht in _reihenfolge.json eingetragen: ' + ', '.join(extra))
    out = []
    for i in order:
        p = json.load(open(os.path.join(SRC, 'stuecke', i + '.json'), encoding='utf-8'))
        if p.get('id') != i: sys.exit(f'{i}.json: id passt nicht ({p.get("id")})')
        out.append(p)
    return out


def fonts():
    faces = [('Cormorant Garamond', 'normal', 'CormorantGaramondwght.woff', '300 700'),
             ('Cormorant Garamond', 'italic', 'CormorantGaramond-Italicwght.woff', '300 700'),
             ('EB Garamond', 'normal', 'EBGaramondwght.woff', '400 800'),
             ('EB Garamond', 'italic', 'EBGaramond-Italicwght.woff', '400 800')]
    css = []
    for fam, style, f, w in faces:
        b = base64.b64encode(open(os.path.join(SRC, 'fonts', f), 'rb').read()).decode()
        css.append(f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{w};font-display:swap;src:url(data:font/woff;base64,{b}) format('woff');}}")
    return '\n'.join(css)


def main():
    P = pieces()
    pieces_js = 'const PIECES = ' + json.dumps(P, ensure_ascii=False, separators=(',', ':')) + ';'
    scripts = [
        f"window.NW_BUILD = '{VERSION} (Build {BUILD})';",
        rd('glyphs.js'), rd('engine.js'),
        pieces_js + '\n' + rd('lieder.js') + '\n' + rd('bilder.js'),
        rd('inhalt.js'), rd('lernpfad.js'), rd('shell.js'), rd('app.js'),
    ]
    for s in scripts:
        if '</script' in s.lower(): sys.exit('„</script“ in einer Quelldatei – bitte maskieren.')
    head = f'''<!doctype html>
<html lang="de" data-nw-app>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Notenweg</title>
<meta name="description" content="Klavier lernen mit echten Noten: ein Lernpfad, Wiederholung, Blattspiel und Originalstücke.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Notenweg">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#141821">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" type="image/png" href="icon-192.png">
<style>
{fonts()}
{rd('styles.css')}
{rd('app.css')}
</style>
</head>
<body>
{rd('body.html')}
'''
    html = head + ''.join(f'<script>\n{s}\n</script>\n' for s in scripts) + '</body>\n</html>\n'
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)
    json.dump({
        'name': 'Notenweg', 'short_name': 'Notenweg', 'id': './',
        'description': 'Klavier lernen mit echten Noten.',
        'lang': 'de', 'dir': 'ltr', 'start_url': './', 'scope': './',
        'display': 'standalone', 'orientation': 'any',
        'background_color': '#141821', 'theme_color': '#141821',
        'icons': [
            {'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
            {'src': 'icon-180.png', 'sizes': '180x180', 'type': 'image/png', 'purpose': 'any'}]
    }, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(os.path.join(OUT, 'sw.js'), 'w', encoding='utf-8').write(rd('sw.js').replace('__BUILD__', BUILD))
    for s in (180, 192, 512):
        shutil.copy(os.path.join(Q, 'icon', f'icon-{s}.png'), os.path.join(OUT, f'icon-{s}.png'))
    print(f'Notenweg {VERSION} Build {BUILD}: {len(html) // 1024} KB, {len(P)} Stücke')


if __name__ == '__main__':
    main()
