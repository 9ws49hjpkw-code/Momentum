# Momentum – Arbeitsregeln für Claude

Persönliche To-do-PWA fürs iPhone. Projektstand und Aufbau: `quelle/PROJEKT.md` (zuerst lesen).
Der Nutzer hat keinen Computer. Claude ändert, testet und veröffentlicht selbst. Antworten kurz, auf Deutsch.

## Ablauf bei jeder Änderung
1. Nur in `quelle/src/` ändern. Die Dateien im Root nie von Hand bearbeiten, sie werden gebaut.
2. `BUILD` in `quelle/build.js` erhöhen.
3. `node quelle/build.js` (und `node quelle/mkicons.js`, wenn sich das Icon ändert).
4. Alle Tests: `for t in t1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 monkey; do node quelle/test/$t.js; done`. Kein ✗, keine Konsolenfehler.
5. Commit auf `main` und pushen. GitHub Pages veröffentlicht in ca. 1 Minute.
   Auf dem iPhone erscheint dann „Neue Version bereit“ → „Aktualisieren“.

## Daten dürfen nie verloren gehen
- Daten liegen nur auf dem Gerät (IndexedDB „momentum“). Sie hängen an der Adresse
  https://9ws49hjpkw-code.github.io/Momentum/ – Repo-Name, Pfad und Root-Struktur nie ändern.
- Store-Namen und Schlüssel nie ändern, Felder nur ergänzen. Neuer Store = höhere DB-Version mit onupgradeneeded.
- Alte Datensätze ohne neue Felder müssen weiter funktionieren (Standardwerte beim Lesen).
- Export/Import-Format „momentum“ bleibt lesbar; neue Felder sind optional.
- `sw.js`: nur eigene, gültige Antworten cachen; neue Version anbieten, nicht erzwingen.
