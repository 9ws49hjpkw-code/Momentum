# Momentum – Projektstand (18.11.2026)

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

## Features (Stand 1.1.0)
Tabs: Heute, Aufgaben, Ideen, Journal + zentrales "+" (Capture-Sheet). Einstellungen oben rechts auf Heute.
Aufgaben (Wann Pflicht, Priorität, Thema), Gruppen Überfällig/Heute/Demnächst/Später, Swipe = erledigt + Rückgängig.
Heute: max. 3 Tagesziele, "Tag planen", fällige Ideen ("Was wird daraus?": Angehen/Weiter parken/Verwerfen).
Journal: ein Eintrag pro Tag, 3 Felder, Suche, "Morgen planen?".
Themen: Klavier, Film/Foto, Sport (verwaltbar). Export/Import JSON.

## Neu in 1.1 (17.11.2026)
- Lichtlinie unter jeder Überschrift = Tagesbilanz: blau erledigt, matt offen, rot überfällig, Beschriftung „x/y erledigt · n überfällig“.
  Lichtpunkt je Bereich an eigener Stelle (Heute links, Aufgaben 1/3, Ideen 2/3, Journal rechts), eigene Lichtfarbe
  (Heute Eisblau, Aufgaben Violett, Ideen Bernstein, Journal Mint), atmet leicht, gleitet beim Tabwechsel.
- Aufgaben-Tab: eigener Hologramm-Hintergrund (violettes Licht, feine Scanlinien). Ideen/Journal: leichte Tönung.
- Kreise: Hoch eisblau leuchtend, Normal strahlend weiß, Niedrig gedämpft. Überfällig: rot, nach Prio abgestuft, Gruppe rot umrahmt.
- Themenfarben neu (8 klar getrennte, kein Rot). Zeilen mit Thema farbig getönt + Farbstreifen links.
- Ideen: Enter = neue Zeile, kein Zeichenlimit (Aufgaben weiter einzeilig, 280). Import kürzt nicht mehr.
- Abhak-Licht (Canvas #fx): Ringe, Photonen, Blitz; stärker nach Prio; Tagesziel mit Schockwelle + Vibration; Überfällig rot → blau.
- Start-Animation (#intro, ca. 0,55 s): Komet-Ring zeichnet sich und löst sich auf.
- test/t10.js prüft das alles.

## Neu in 1.1.1 (18.11.2026)
- Überfällige Tagesziele: offene Ziele früherer Tage stehen im roten Feld „Ziele überfällig“ (Heute direkt unter den Tageszielen,
  Aufgaben ganz oben). Abhaken = erledigt (mit Rückgängig). Tippen = Dialog „Auf heute legen“ / „Verwerfen“ (bei Aufgaben-Zielen „Kein Ziel mehr“).
  Datenfelder nur ergänzt, am Ziel im Tagesplan: done/doneAt, moved (Tag), dropped. Import behält sie. Lichtlinie zählt offene Text-Ziele als überfällig.
- Farbstufen Überfällig: Ziel (3px, #FF2D55, Halo, pulsiert) > Hoch (2px, pulsiert, rote Leiste, fett) > Normal (ruhig) > Niedrig (gedämpft).
- Abhak-Licht: Niedrig/Normal so stark wie früher Hoch; Hoch mit zweiter Welle, Haken-Echo, Lichtpartikeln; Tagesziel mit Schockwellen
  über den Bildschirm, umlaufendem Randlicht, großem Haken, Lichtregen, 4x Haptik.
- Start (ca. 1,2 s + Auftritt, Tippen überspringt): HUD-Ringe, Komet-Ring mit Lichtkopf, Haken fliegt in zwei Teilen ein und rastet ein,
  Lichtimpuls, Licht umrundet den Bildschirmrand, MOMENTUM + Begrüßung nach Uhrzeit. Danach gleitet die App herein, Inhalte steigen gestaffelt auf,
  das Licht der Lichtlinie fegt einmal über die ganze Breite. Body-Klassen: intro → go → enter → live (Tests warten auf body.live).
- test/t11.js prüft das alles.

Nicht bauen: Login, Cloud, Push, KI, Gamification, Statistik-Dashboards, Light Mode.

## Design
Dunkel, fast schwarz, Glas mit Blur, dünne Eisblau/Cyan-Linien sparsam, SF Pro, dünne Icons, Spring-Animationen,
"Bewegung reduzieren" respektieren, Touch-Ziele >= 44px, deutsche kurze persönliche Texte.

## Bekannte Grenzen
Nie auf echtem iPhone/Safari getestet worden (nur Chrome-Simulation 393x852): Tastatur, Datumsauswahl, Teilen/Export, Haptik zuerst prüfen.

## Arbeitsweise
Nutzer testet im Alltag und meldet Probleme/Lücken. Änderungen klein halten, Daten nie gefährden, vor Lieferung Tests laufen lassen,
BUILD-Nummer in build.js erhöhen, alle 6 Dateien neu liefern.

## Autopilot (ab 19.11.2026)
Tägliche Weiterentwicklung über drei geplante Aufgaben und die Notion-Seite „Momentum – Wünsche“. Regeln und Ablauf: quelle/AUTOPILOT.md. Arbeitsbranch: autopilot.
