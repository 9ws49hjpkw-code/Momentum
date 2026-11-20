# Kickerabend

Kicker-Turnier-App (Punkte-Party + Double-Elimination-Turnier). Läuft unter
https://9ws49hjpkw-code.github.io/Momentum/kicker/

- Quelle: `quelle/src/` (logic.js = Spielplan/Bracket, app.js = Oberfläche, index.src.html = Styles)
- Bauen: `python3 quelle/build.py` (schreibt nach `quelle/dist/`, danach index.html, manifest.json, sw.js, Icons nach `kicker/` kopieren). Für eine neue Version BUILD in build.py erhöhen.
- Tests: `node quelle/test/test.js`
- Daten: localStorage-Schlüssel `kickerabend.v1`. Der Service Worker löscht nur Caches mit dem Präfix `kickerabend-`, weil Momentum auf derselben Domain liegt.
