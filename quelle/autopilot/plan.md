# Bauplan 20.11.2026  (Basis: main @ fa77f2b)

2 neue Wünsche aus Notion (Runde 20.11.), 2 Fragen gestellt (F1–F2). Keine Datenänderung nötig
(`doneAt` gibt es an Aufgaben schon, freie Tagesziele hängen an ihrem Tag in `days`).

## Paket A: Erledigtes sichtbar machen (Aufgaben-Seite)

### A0. Tagesziele bleiben durchgestrichen  [erledigt]
Wunsch (Zitat): „ist es gewollt, dass die Tages Ziele nach dem Erledigen noch zusehen sind nur durchgestrichen? Wenn ja, dann super, dann lassen wir das so.“
Verständnis: Nur eine Frage. Ja, gewollt (`.goal.is-done .goal-text` in styles.css). Nichts zu bauen, in Notion beantwortet.
Umsetzung: keine. Beim nächsten Release mit nach „Erledigt“ verschieben.

### A1. Erledigtes nach Tagen gruppiert  [erledigt]
Wunsch (Zitat): „Dazu gehörig wäre es ja auch gleich praktisch direkt alle schon erledigten sufgaben sich vor Augen halten zu können. Zb im Dashboard und dann nach Zeit sortiert. Dann man sich filtern kann“
Verständnis: Heute gibt es unten auf der Aufgaben-Seite einen eingeklappten Bereich „Erledigt“ (views.js `renderTasks`, `doneSec`,
sortiert nach `doneAt` absteigend, Themen-Filter greift schon). Er ist zu versteckt und eine flache Liste. Gewünscht: ein Rückblick
„was hab ich geschafft“, nach Zeit geordnet, filterbar. Passt zum Prinzip: kurzer Blick, Motivation, kein Verweilen.
Gilt in jeder Variante von F1 und wird darum auf jeden Fall gebaut:
Umsetzung: in views.js eine Funktion `doneChronicle(list)` – Gruppen je Tag (`dayOf(doneAt)`), Überschrift „Heute“, „Gestern“,
sonst `dueLabel`/`plainDate`, rechts Zähler „4 geschafft“. Innerhalb des Tages neueste zuerst. `doneLimit`/„Mehr anzeigen“ bleibt.
Karten weiter `tiCard(t, 'done')` (Tippen = Bearbeiten, darin „Wieder öffnen“ wie bisher).
Prüfung: neuer Test t18.js: 3 Aufgaben an verschiedenen Tagen erledigen (doneAt setzen) → drei Gruppen in richtiger Reihenfolge,
Zähler stimmen, Themen-Filter blendet fremde aus. t18 in die Testreihe von CLAUDE.md aufnehmen.

### A2. Wo der Rückblick sitzt  [wartet auf Antwort F1]
Empfehlung A: Umschalter oben auf Aufgaben „Geplant | Erledigt“ (Segment unter dem Themen-Filter, `ui.tview`), „Erledigt“ zeigt
statt Wochenband/Zeitstrahl die Chronik aus A1. Nicht gespeichert, beim App-Start immer „Geplant“.
B: wie jetzt unten, einklappbar, aber gruppiert. C: zusätzlich „Heute geschafft“ auf Heute.
Ohne Antwort: A1 kommt in den bestehenden unteren Bereich (das ist Variante B, weil sie nichts verschiebt).
Prüfung: t18: Umschalter tippen → Chronik sichtbar, Wochenband weg, zurück → Zeitstrahl wieder da. Screenshots via gallery.js.

### A3. Filter und Inhalt  [wartet auf Antwort F2]
Themen-Filter gilt bereits. Empfehlung: Zeitraum-Chips „7 Tage · 30 Tage · Alles“ (Standard 7 Tage) und erledigte freie
Tagesziele mit hinein (Ziel-Symbol, Datum = Tag des Ziels bzw. `doneAt` bei nachgeholten Zielen aus `days`).
Alternativen: Suche nach Text; oder nur Themen-Filter.
Prüfung: t18: Aufgabe vor 10 Tagen erledigt → bei „7 Tage“ unsichtbar, bei „30 Tage“ sichtbar; erledigtes Tagesziel erscheint mit Ziel-Symbol.
