# Momentum – Projektstand (17.11.2026)

Persönliche To-do/Organisations-PWA fürs iPhone (Nutzer: 20, nur iPhone, kein Computer, Deutsch).
Prinzip: Werkzeug, nicht Aufenthaltsort. Schnell rein, Kopf sortieren, wieder raus.

## Live
- Repo: github.com/9ws49hjpkw-code/Momentum  (GitHub Pages, Branch main, root)
- Auslieferung = 6 flache Dateien: index.html, manifest.json, sw.js, apple-touch-icon.png, icon-192.png, icon-512.png
- Claude ist per GitHub-App mit dem Repo verbunden und pusht Änderungen selbst auf main. Der Nutzer lädt nichts mehr hoch.
- Repo-Aufbau: Root = die 6 ausgelieferten Dateien (+ .nojekyll, CLAUDE.md). quelle/ = Quellcode, Tests, Build.
- Daten liegen lokal auf dem Gerät (IndexedDB "momentum"), nie auf GitHub. Updates dürfen Daten nie verlieren.

## Aufbau
- src/: core.js (Daten, Zeit, DB), ui.js (Layer, Gesten, Tastatur), views.js (Ansichten), boot.js (Start, Aktionen, Update), body.html, styles.css, sw.js, manifest.json
- build.js baut daraus die einzelne index.html (alles inline, keine Abhängigkeiten) direkt in den Repo-Root. Aufruf: node quelle/build.js
- mkicons.js + icon.html erzeugen die PNG-Icons (Playwright + Chrome) in den Repo-Root
- test/: Playwright-Tests t1–t9, monkey.js (Zufallstest), gallery.js (Screenshots, 393x852). Testen den gebauten Repo-Root (oder MOMENTUM_DIR). t7 prüft, dass ein Update die Daten behält.
- Wenn nur index.html vorliegt: sie ist selbst-enthalten und kann direkt bearbeitet werden.

## Features (Stand 1.0.0)
Tabs: Heute, Aufgaben, Ideen, Journal + zentrales "+" (Capture-Sheet). Einstellungen oben rechts auf Heute.
Aufgaben (Wann Pflicht, Priorität, Thema), Gruppen Überfällig/Heute/Demnächst/Später, Swipe = erledigt + Rückgängig.
Heute: max. 3 Tagesziele, "Tag planen", fällige Ideen ("Was wird daraus?": Angehen/Weiter parken/Verwerfen).
Journal: ein Eintrag pro Tag, 3 Felder, Suche, "Morgen planen?".
Themen: Klavier, Film/Foto, Sport (verwaltbar). Export/Import JSON.
Nicht bauen: Login, Cloud, Push, KI, Gamification, Statistik-Dashboards, Light Mode.

## Design
Dunkel, fast schwarz, Glas mit Blur, dünne Eisblau/Cyan-Linien sparsam, SF Pro, dünne Icons, Spring-Animationen,
"Bewegung reduzieren" respektieren, Touch-Ziele >= 44px, deutsche kurze persönliche Texte.

## Bekannte Grenzen
Nie auf echtem iPhone/Safari getestet worden (nur Chrome-Simulation 393x852): Tastatur, Datumsauswahl, Teilen/Export, Haptik zuerst prüfen.

## Arbeitsweise
Nutzer testet im Alltag und meldet Probleme/Lücken. Änderungen klein halten, Daten nie gefährden, vor Lieferung Tests laufen lassen,
BUILD-Nummer in build.js erhöhen, alle 6 Dateien neu liefern.
