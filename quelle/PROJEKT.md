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

## Neu in 1.2.0 (20.11.2026, Autopilot)
- Tastatur: iOS-Eigenverschiebung des Fensters wird zurückgenommen (unshift), Felder landen zwischen oberem Rand und Tastatur (revealField, auch lange Textfelder an der Tippstelle). test/t12.js.
- Aufgaben: neue optionale Felder note (Text), time ("HH:MM"), dur (Minuten 5–720), moved (Zahl), followed (bool), src ('cal'). Ziele im Tagesplan: note.
  Alte Datensätze ohne Felder funktionieren (Standardwerte), Import prüft streng. Export enthält zusätzlich data.rules (optional).
- Text in Klammern wird beim Speichern Detail (note). Heute: Tippen auf eine Aufgabe/ein Ziel klappt Details auf, darin „Bearbeiten“ bzw. „Notiz“ (Ebene L-note). Kreis/Wischen bleibt Abhaken.
- Erfassen: Zeitzeile (Uhrzeit + Dauer 15/30/60/90/120) erscheint nach „Wann“, sofort ohne Gleiten. Bearbeiten: Details-Feld, „Wieder öffnen“ bei Erledigtem, „Kalender“/„Wecker“ bei Aufgaben mit Uhrzeit.
- Aufgaben-Seite = Zeit-Übersicht ohne Abhaken: Filter, Ziele überfällig, Überfällig (rot), Wochenband 14 Tage mit Lastbalken, gewählter Tag
  („Im Lauf des Tages“ + senkrechter Zeitstrahl mit Blöcken nach Uhrzeit/Dauer, Überschneidungen nebeneinander, Jetzt-Linie, läuft/vorbei), „Danach“ nach Tagen, „Später“, „Erledigt“. Tippen öffnet die Aufgabe. test/t13.js.
- Überfällig tut weh: #alarm-Rand in 3 Stufen (Score: Hoch 3, Normal 2, Niedrig 1, Ziel 4; Ziel oder ≥ 8 = Wellen zur Mitte, per transform/opacity),
  Startbild rot mit „n überfällig“, Verschieben überfälliger Aufgaben mit Rückfrage und Zähler „n× verschoben“, Icon-Badge (setAppBadge, Erlaubnis per Einstellungen). test/t14.js, t15.js.
- Folge-Aufgaben: Regeln in meta 'rules' [{id, word, then, since}]; Stichwort in einer Aufgabe → zum Ende ihrer Zeit (oder beim Abhaken) „then“ als Jetzt-Aufgabe, genau einmal (followed). Nur bei offener App.
- Kalender & Wecker über Kurzbefehle „Momentum Termin“, „Momentum Wecker“ (shortcuts://run-shortcut, JSON) und „Momentum Woche“ (Zwischenablage, Zeilen „JJJJ-MM-TT HH:MM | Minuten | Titel“, Kalender-Knopf auf Aufgaben, ohne Doppel). Anleitung in der App (L-help).
- Töne (Web Audio, synthetisch, leise, audioSession ambient, erst nach erster Berührung), Schalter in Einstellungen, localStorage 'momentum.sound'.
- Design: Lichtlinie 2–3 px mit mehr Glanz, Eck-Ringe in Bereichsfarbe mit Schimmer (body[data-area]), Seitenwechsel mit HUD-Scanlinie (#hud, .view.reveal),
  leise Dauer-Schwingung (drift über translate, Glanz, Kanten atmen), pausiert bei Tastatur/Sheets, aus bei „Bewegung reduzieren“. test/t16.js.
- Tests: lib.tap wartet nicht mehr auf Playwrights Stabilität (die App schwebt absichtlich), sondern auf Sichtbarkeit und das Ende des Auftritts.

## Neu in 1.2.1 (20.11.2026)
- Startbild mit Überfälligem bleibt ca. 2,9 s (Tippen überspringt erst nach 1,9 s).
- Roter Rand: Bewegung (Atmen, Welle zur Mitte) nur einmal beim Betreten der App, beim Zurückkehren und wenn die Stufe steigt (#alarm.pulse), sonst ruhig.
- Erfassen-Sheet: .fold mit minmax(0,1fr) – Chip-Zeilen machten das Sheet breiter, iOS schob es beim Markieren seitlich. Dazu Rücksetzen von scrollLeft bei .sheet-body/.scroll.
- Töne neu: weiche Glas-Pings, Luft, kleiner Raumhall, sehr leise. Start-Klang (iOS: kommt beim ersten Tippen nach, beim Zurückkehren „wake“). test/t17.js.

## Neu in 1.3.0 (21.11.2026, Autopilot)
- Aufgaben → „Erledigt“ (unten, einklappbar) ist jetzt ein Rückblick: Gruppen je Tag (Heute, Gestern, Wochentag + Datum), neueste zuerst, rechts „n geschafft“ für den ganzen Tag, an jeder Karte die Uhrzeit des Erledigens. Themen-Filter gilt. views.js `doneChronicle`, `tiMeta(t,'chron')`. test/t18.js.
- Offen (Fragen 20.11.): Umschalter „Geplant | Erledigt“ oben statt unten, Zeitraum-Knöpfe, erledigte Tagesziele im Rückblick.

## Neu in 1.3.1 (21.11.2026)
- Roter Rand etwa halb so stark (dünne Linie, wenig Glühen). Die Welle zur Mitte ist entfernt, beim Betreten nur noch einmal sanftes Atmen.
- Töne neu, wie Systemklänge: nur ein kurzer, trockener Klick beim Abhaken (Ziel: zwei), ein ganz leiser beim Speichern. Kein Start-Klang, keine Töne beim Navigieren, kein Nachhall. test/t17.js.

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

## Versionsarchiv (ab 19.11.2026)
- `versionen/` im Root: jede veröffentlichte Version eingefroren zum Ausprobieren, Liste unter `versionen/index.html`.
  Erzeugt mit `node quelle/archiv.js` (Daten der Liste: `quelle/versionen.json`). Archivkopien sind abgekapselt:
  eigene Datenbank „momentum-archiv-x.y.z“, kein Service Worker, keine Update-Prüfung, kein Manifest.
  Sie berühren die echten Daten nie. Bereits archivierte Versionen werden nie überschrieben.
- Commit-Nachrichten einer Version beginnen mit „x.y.z:“. (Git-Tags lassen sich aus Claude-Sitzungen nicht pushen.)
- `matze/`: von Hand geschriebener Türsteher („Heißt du Matze?“), der zu `versionen/1.1.1/` führt. Eingefroren.
