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
measures[{ r, l, r2?, l2?, r3?, l3?, clef?, key?, time?, label?, volta?, begin?, end? }], order[] }`
Stimmen pro System: `r`/`l` (Hälse oben), `r2`/`l2` (Hälse unten), `r3`/`l3` (Mittelstimme, Hälse oben, bei Kollision nach rechts versetzt; Pausen meist unsichtbar `x/`).
Token: `C#4/8!f3` (Tonhöhe/Dauer w h q 8 16 32 64 mit Punkten), Akkord `(C4 E4 G4)/q`, Pause `r/q`, unsichtbar `x/q`.
Modifikatoren: `!f3` Finger, `!(` `!)` Bogen, `!~` Haltebogen (am Akkord: alle Töne; einzelne Akkordtöne: `(C4~ E4)/h` hält nur C4; Haltebögen gehen auch über Stimmen hinweg), `!3(` … `!3)` Triole, `!N(=7:4` … `!N)` beliebige N-tole (a Noten in der Zeit von b), `!st` staccato, `!ac` Akzent,
`!d=p` Dynamik, `!g=D5+E5` Vorschläge vor dem Schlag (`&` = Vorschlagsakkord), `!gs=D5` Acciaccatura mit Strich, `!h=<` / `!h=>` / `!h=.` Gabel, `!pd` `!pc` `!pu` Pedal, `!o=tr|prall|mord|turn`, `!fe` Fermate, `!t=Text`.
Höchstens drei Stimmen pro System. kern2nw schreibt Quintolen, Septolen, 11er-Gruppen usw. als `!N(` (seit 5.0).
Konverter melden Takte mit mehr als drei Stimmen als „bad“ – solche Stücke nicht übernehmen (oder gezielt per `patch` reparieren, siehe neue_stuecke_2026_11c.py).
mscx2nw übernimmt Vorschläge (seit 5.0); Nachschläge werden weiter weggelassen und gemeldet.
Alle Stücke sind seit 5.1 mit Vorschlagsnoten konvertiert (Hinweise „nicht dargestellt“ gibt es nicht mehr). ly2nw lässt Vorschläge weiter weg:
nach dem Konvertieren `pruefung/graces.py -w <id>` laufen lassen (setzt `!g=`/`!gs=` aus der LilyPond-Quelle, Fingersätze bleiben).

## Neue Stücke hinzufügen
1. Quelle klonen (GitHub), mit tools/kern2nw.py, mscx2nw.py oder ly2nw.py konvertieren, „bad“ muss leer sein.
2. Rendern und ansehen; DCML-Stücke gegen notes/*.tsv prüfen.
3. Eintrag mit Texten in einer neue_stuecke_*.py ergänzen und ausführen (schreibt src/stuecke/ + _reihenfolge.json).
Ideen für später: Nachschläge; Stücke mit vier Stimmen in einer Hand (Chopin op. 9/3, 15/1, 15/2, 48/2, Schumann „Von fremden Ländern“).
Kapitel-Zuordnung (Pflicht/Kür) steht in lernpfad.js (`must`, `more`); neue Stücke ohne Kapitel erscheinen unter „Alle Stücke“.

## Prüfung „Richtig oder gar nicht“ (5.1, Werkzeuge in `quelle/pruefung/`)
Jedes Stück wird Note für Note gegen seine Quelle geprüft, mit Lesern, die unabhängig von den Konvertern geschrieben sind:
`app_notes.js` (Noten so, wie die Engine sie spielt) gegen `refs.py` (kern, DCML-TSV, MusicXML) bzw. `lyref.py` (LilyPond/Mutopia);
`compare.py` und `lyapp.py` melden fehlende/zusätzliche Töne, Dauern, Schreibweisen und Vorschläge pro Takt. Wo es eine zweite
unabhängige Ausgabe gibt (DCML, ASAP, Chopin-Erstausgaben), wird auch dagegen verglichen (`mapping.py`).
Winterball-Lieder: `lieder_dump.js` (Taktlängen) und `liedcmp.py` (Melodie gegen Böhme/Essen-Sammlung bzw. Mutopia).
Abweichungen werden nur mit Beleg korrigiert. Die Werkzeuge erwarten `/home/claude/verify` und die Quellen unter `/home/claude/src/`
(siehe UEBERGABE.md). Achtung: die Skripte `tools/neue_stuecke_*.py` würden korrigierte Stücke beim erneuten Ausführen überschreiben.

## Urheberrecht
Nur gemeinfreie Werke mit freien Notenausgaben (Mutopia, kernScores/CCARH, DCML CC BY-NC-SA). Quelle pro Stück in `src`.
Geschützte Stücke (Einaudi, Tony Ann, Alcocer …) nur mit Kauflink (`inApp: false`).

## Ablauf bei Änderungen
1. Nur in `quelle/` ändern. 2. BUILD in build.py erhöhen. 3. `python3 notenweg/quelle/build.py`.
4. Tests: `node notenweg/quelle/test/e2e.js && node notenweg/quelle/test/monkey.js && node notenweg/quelle/test/metronom.js` – alles grün, keine Konsolenfehler.
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
- 4.4 (Build 5): Jeder „Am Klavier“-Schritt, der ein Metronom erwähnt, hat ein eigenes Metronom (Tempo aus „♩ = …“ vorgewählt).
- 4.5 (Build 6): Metronom stoppt automatisch bei Seitenwechsel, „Weiter“, zugeklapptem Bereich und beim Verlassen der App.
- 4.6 (Build 7): Goldene Knöpfe als Link (z. B. „Weiter: …“ nach einer Lektion) hatten im Dark Mode Gold auf Gold – jetzt Mitternachtsblau.
- 4.7 (Build 8): „Kann ich schon → direkt zum Test“ bleibt; nach einem nicht bestandenen Test gibt es „Doch lieber: Lektion von vorne“. Dabei behoben: der Knopf startete den Test bei neuen Lektionen gar nicht.
- 4.8 (Build 9): Blattspiel (des Tages und in Lektionen) hat ein eigenes Metronom zum Aufklappen, Tempo und Takt des Stücks vorgewählt; bleibt beim nächsten Stück aufgeklappt.
- 4.9 (Build 10): Metronom/Ton startete auf dem iPad nach App-Wechsel nicht (Audio-Kontext hing „interrupted“, Uhr stand). Jetzt wird beim nächsten Tippen ein frischer Kontext gebaut; das Metronom erkennt eine stehende Audio-Uhr und meldet sich.
- 5.0 (Build 11): Notensatz und Wiedergabe mit **drei Stimmen pro System** und **Vorschlagsnoten** (engine.js; alte Stücke rendern bitgleich).
  Die vier Kauflink-Einträge (Una Mattina, Nuvole Bianche, Icarus, Idea 10) entfernt; dafür 12 verwandte gemeinfreie Stücke mit Noten
  und **Clair de lune** (tools/neue_stuecke_2026_11b.py). Lektion 7.6 zeigt jetzt die verwandten Stücke; Kapitel VII Kür angepasst.
  Konverter: Tonart ohne Vorzeichen am Anfang wird nicht mehr von einem späteren Tonartwechsel überschrieben.
  Dazu beliebige N-tolen und 64stel im Notensatz; 41 weitere Stücke (tools/neue_stuecke_2026_11c.py): 15 Chopin-Nocturnes, 5 Walzer,
  Fantaisie-Impromptu, 2 Etüden, Berceuse, 5 Préludes (u. a. Regentropfen), Träumerei und Kinderszenen 12/13, Debussy (3× Children's Corner,
  La plus que lente, Page d'album), Tschaikowsky März, Grieg op. 12/3, 12/7, 38/1. Jetzt 166 Stücke.
- 5.1 (Build 12, 24.11.2026): **Notenprüfung aller Stücke** („Richtig oder gar nicht“). Engine: Haltebögen für einzelne Akkordtöne `(C4~ E4)`
  und über Stimmen hinweg. kern- und DCML-Stücke neu konvertiert (Vorschläge, Teil-Haltebögen, 3 Stimmen, Tonart, N-tolen) und Note für Note
  bestätigt; Préludes nach der Erstausgabe (Catelin 1839); Handkorrekturen mit Beleg (Therese, Mondschein, Entertainer, Maple Leaf, Invention 13,
  Consolation 3: fehlende Haltebögen in Akkorden). Vorschlagsnoten ergänzt (Moment musical 3, Januar, Für Elise, BWV 933/934, Jägerliedchen,
  Menuett G). Entfernt: Nocturne op. 48/1 und das Duplikat „bwv939“ (= Kleines Präludium C-Dur;
  Fortschritt wird übernommen). „O du fröhliche“ an die Quelle angepasst (Takte 4, 8, 16). Jetzt 164 Stücke.
