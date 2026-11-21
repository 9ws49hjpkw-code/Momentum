# Notenweg – Projektstand

Klavier-Lern-App (Lernpfad mit 8 Kapiteln / 55 Lektionen, Wiederholung 1-3-7-14-30, Blattspiel,
Wissensfolien, Originalstücke, Winterball). Läuft als eigenständige Web-App (PWA) unter
**https://9ws49hjpkw-code.github.io/Momentum/notenweg/** – Zielgerät: iPad (hoch und quer), geht auch auf dem iPhone.

Entstanden als Claude-Artifact (v3, Okt./Nov. 2026), seit 21.11.2026 eigenständig (v4).

## Aufbau
```
notenweg/
  index.html, manifest.json, sw.js, icon-*.png   ← GEBAUT, nie von Hand ändern
  quelle/
    build.py          BUILD/VERSION hier erhöhen; baut alles nach notenweg/
    src/
      styles.css      Regency-Salon-Design (Elfenbein, Tinte, Blattgold; Dark Mode automatisch)
      app.css         App-Hülle: Vollbild, kein Zoom, Hinweisleisten
      body.html       Kopfzeile, Navigation, #view
      glyphs.js       Noten-Glyphen (SVG-Pfade)
      engine.js       MU (Musik-Utils), Engrave (Notensatz als SVG), Kbd (Tastatur)
      stuecke/        ein JSON pro Stück + _reihenfolge.json (Reihenfolge = Reihenfolge in der App)
      lieder.js       Winterball-Lieder
      bilder.js       Gemälde (Base64)
      inhalt.js       Akkorde, Lead-Sheet-Generator, Theorie-Helfer (TH)
      lernpfad.js     Kapitel, Lektionen, Folien, Glossar, Fragen-Pools (CUR)
      shell.js        Service Worker, Update-Hinweis, Tageswechsel, Installations-Tipp
      app.js          Zustand/Speicher, Ton, Notenbilder, Aufgaben-Runner, alle Ansichten
      sw.js           Offline-Cache (Cache-Namen immer „notenweg-…“)
      fonts/          Cormorant Garamond + EB Garamond (OFL), Latin-Subset, eingebettet
    icon/             icon.svg + mkicons.js (node quelle/icon/mkicons.js)
    tools/            kern2nw.py (Humdrum **kern), mscx2nw.py (MuseScore/DCML), ly2nw.py (LilyPond/Mutopia),
                      hand/ (Sonderkonverter, z. B. Gymnopédie), neue_stuecke_*.py (Texte + Freischaltung neuer Stücke)
    test/             e2e.js, monkey.js, lib.js
```

## Daten (dürfen nie verloren gehen)
- IndexedDB „notenweg“, Store „kv“, Schlüssel „state“; Spiegel in localStorage „notenweg-v1“.
  Namen nie ändern. Felder nur ergänzen; `fill()` setzt Standardwerte für alte Stände.
- Zustand `S`: v:3, done, stepAt, exams, srs, pieces, songs, days, sight, quiz, wb, … plus
  zusätzliche Felder (exDone, pchk, tempo) – unbekannte Felder bleiben erhalten.
- Export/Import: `{ app: 'notenweg', format: 1, exportedAt, state }`. Import prüft streng und fragt nach.
- Daten hängen an der Adresse …/Momentum/notenweg/ – Repo-Name und Pfad nie ändern.

## Stückformat (stuecke/<id>.json)
`{ id, title, composer, cat, keyde, lvl (1–6), bpm, after ('2.4' = nach Lektion, 'ch:III' = nach Kapitelprüfung),
why, focus[], src, links[[Titel,URL]], key ('E' = Dur-Name der Vorzeichen), time ('C', 'C|', '3/4' …), pickup,
measures[{ r, l, r2?, l2?, clef?, key?, time?, label?, volta?, begin?, end? }], order[] }`
Token: `C#4/8!f3` (Tonhöhe/Dauer w h q 8 16 32 mit Punkten), Akkord `(C4 E4 G4)/q`, Pause `r/q`, unsichtbar `x/q`.
Modifikatoren: `!f3` Finger, `!(` `!)` Bogen, `!~` Haltebogen, `!3(` … `!3)` Triole, `!st` staccato, `!ac` Akzent,
`!d=p` Dynamik, `!h=<` / `!h=>` / `!h=.` Gabel, `!pd` `!pc` `!pu` Pedal, `!o=tr|prall|mord|turn`, `!fe` Fermate, `!t=Text`.
Nur Triolen als N-tolen; Vorschläge gibt es im Notensatz nicht; höchstens zwei Stimmen pro System.
Konverter melden Takte mit mehr als zwei Stimmen als „bad“ – solche Stücke nicht übernehmen (Ausnahme nur nach
Prüfung gegen eine Referenz, z. B. DCML notes.tsv). Bei Vorschlagsnoten den Hinweis in `src` setzen.

## Neue Stücke hinzufügen
1. Quelle klonen (GitHub), mit tools/kern2nw.py, mscx2nw.py oder ly2nw.py konvertieren, „bad“ muss leer sein.
2. Rendern und ansehen; DCML-Stücke gegen notes/*.tsv prüfen.
3. Eintrag mit Texten in einer neue_stuecke_*.py ergänzen und ausführen (schreibt src/stuecke/ + _reihenfolge.json).
Ideen für später: Notensatz um Vorschläge und eine dritte Stimme erweitern – dann gehen Clair de lune,
Träumerei und die Chopin-Nocturnes (Konvertierungen klappen schon, scheitern nur daran).
Kapitel-Zuordnung (Pflicht/Kür) steht in lernpfad.js (`must`, `more`); neue Stücke ohne Kapitel erscheinen unter „Alle Stücke“.

## Urheberrecht
Nur gemeinfreie Werke mit freien Notenausgaben (Mutopia, kernScores/CCARH, DCML CC BY-NC-SA). Quelle pro Stück in `src`.
Geschützte Stücke (Einaudi, Tony Ann, Alcocer …) nur mit Kauflink (`inApp: false`).

## Ablauf bei Änderungen
1. Nur in `quelle/` ändern. 2. BUILD in build.py erhöhen. 3. `python3 notenweg/quelle/build.py`.
4. Tests: `node notenweg/quelle/test/e2e.js && node notenweg/quelle/test/monkey.js` – alles grün, keine Konsolenfehler.
5. Commit auf main, push. GitHub Pages veröffentlicht in ca. 1 Minute; in der App erscheint „Neue Version bereit“.

## Verlauf
- 4.0 (Build 1, 21.11.2026): eigenständige App (IndexedDB, offline, eigenes Icon, Export/Import, Update-Hinweis),
  Schriften eingebettet, tägliches Aufwärmen aus „Heute“ entfernt (Lektionen unverändert).
- 4.1 (Build 2, 21.11.2026): 63 neue Originalstücke (Bach, Satie, Scarlatti, Haydn, Mozart, Beethoven, Chopin,
  Schumann, Tschaikowsky, Grieg, Debussy, Liszt, Joplin), jetzt 116; sf/fz/sfp/rfz werden korrekt gezeigt;
  Bogen-Absturz bei ganzen Noten mit zweiter Stimme behoben.
- 4.2 (Build 3, 21.11.2026): Wochenbericht ausführlicher (nächster Schritt, Prüfungen, Vorwoche, schwache
  Aufgabentypen, fällige Wiederholungen) – er ist jetzt die einzige Datenquelle für den Klavier-Coach in Claude.
- 4.3 (Build 4, 21.11.2026): Vorbereitungs-Haken (Noten laut benennen, Rhythmus klatschen/zählen) in allen
  „Am Klavier“-Checklisten ausgeblendet und nur als kleiner Hinweis gezeigt (Nutzerwunsch: „immer“, `isPrep` in app.js;
  Daten bleiben unverändert, die Haken zählen als erledigt). Beschriftungen im Notenkasten im Dark Mode lesbar,
  ▶ nicht mehr als Emoji.
