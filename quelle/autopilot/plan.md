# Bauplan 19.11.2026  (Basis: main @ 2e90ce1)

15 Wünsche aus Notion (Runde 19.11.), 6 Fragen gestellt (F1–F6). Reihenfolge für die Nacht:
Antworten 19.11. (Notion): F1 A + OK Daten · F2 C · F3 A · F4 B · F5 C + OK Daten · F6 Kurzbefehle A+B.
A (Fehler) → B (größtes Paket, nur wenn F1–F3 beantwortet) → C → D (Design) → E (Ton). F wartet bewusst.
Ohne Antworten: A, C1, C2, D1–D4, E1 bauen. Versionsziel: 1.2.0 (neue Funktionen).

## Paket A: Fehler

### A1. Tastatur schiebt Sheet/Feld aus dem Bild  [offen]
Wunsch (Zitat): „wenn man auf eine Aufgabe klickt und dann auf den Text, wischt das Fenster nach oben und man sieht Nix mehr. Dann muss man noch oben wischen um wieder auf den Text zu kommen. Und wenn man Ideen oder Ziele eintippt bzw. Auf Sie tippt sieht man manchmal nicht was man da tippt, weil es oben ist.“
Verständnis: Bearbeiten-Sheet (openEntry aus editTask) und Ideen-/Ziel-Felder: Nach dem Fokus landet das Feld oberhalb des sichtbaren Bereichs. Vermutung: doppelte Kompensation – iOS verschiebt den Visual Viewport (vv.offsetTop > 0 bzw. window.scrollY) UND .sheet-pos wird um --kb hochgeschoben; zusätzlich schrumpft .sheet (max-height = --vvh) und sheet-body behält alten scrollTop. Bei Listenfeldern (Ideen/Ziele in .scroll) scrollt der focusin-Handler mit lastTouchY nach oben, auch wenn das Feld schon sichtbar ist, und mehrzeilige Felder werden nicht von revealField erfasst.
Umsetzung (ui.js initKeyboard/revealField/keepEndVisible, ggf. views.js openEntry):
- Während ein Feld fokussiert ist: window.scrollTo(0,0) bei vv 'scroll'/'resize', sobald vv.offsetTop>0 oder scrollY>0 (iOS-Eigenverschiebung neutralisieren; --kb dann aus lh - vv.height rechnen).
- Fokus programmatisch nur mit focus({preventScroll:true}).
- revealField auch für TEXTAREA: Caret-/Feldoberkante in den Bereich [top+8, bottom-16] holen, nie über den oberen Rand hinaus; nach Tastatur-Messung (450 ms) erneut.
- lastTouchY-Korrektur nur, wenn das Feld nach der Messung wirklich unter der Tastaturkante liegt (Rect des Felds statt Tippposition), und nie so weit, dass die Feldoberkante über die Scroll-Oberkante rutscht.
- Beim Öffnen der Tastatur im Sheet: sheet-body so scrollen, dass das fokussierte Feld oben sichtbar bleibt.
Prüfung: neuer Test t12.js (oder Erweiterung t8 – erst grep, welcher Test Tastatur prüft): visualViewport per Script simulieren (height verkleinern, offsetTop setzen), Aufgabe bearbeiten → Feld fokussieren → getBoundingClientRect des Felds liegt vollständig zwischen Sheet-Oberkante und Tastaturkante; dasselbe für Ideen-Textarea und Tagesziel-Feld. Ehrlich melden: nur simuliert.

## Paket B: Aufgaben-Seite als Zeit-Dashboard („Master Feature“)
Wünsche (Zitate, gekürzt): „Mehr Infos, Details, Extras zu Aufgaben hinzufügen. In Klammern. Im heute Menü nur die Aufgabe selbst … Wenn man drauf klickt … sollen sich die Details zur Aufgabe enthüllen.“ · „Die Aufgaben Page … fast sinnlos … soll das Master Feature werden … visuell … Dashboard … wie lange dauert die Aufgabe? Wann muss sie erledigt sein am Tag, was ist dafür notwendig?“ · „An Aufgaben und Ziele Notizen anfügen … Dort muss man die garnicht abhaken können.“ · „mehr die Zeit übersichtlich einbauen … sehen wie man sich immer mehr darauf zu bewegt“ · „Zeitplan … chronologischen zeitstrahl … 3 Main Pages wären zu viel“ · „immer wenn ich etwas eintrage, kommt ein Feld in dem ich den zeitrahmen eintrage … nach Zeit sortiert … Werd kreativ“ · „Die Aufgaben Page braucht … ein brand neues Design“

### B1. Neue Felder an Aufgaben/Zielen  [offen – F1: A, „OK Daten“]
Verständnis: optionale Felder task.note (Text), task.time ("HH:MM" oder null), task.dur (Minuten oder null); Ziel im Tagesplan: goal.note. Keine neue DB-Version, kein neuer Store (Felder nur ergänzen).
Umsetzung: core.js addTask/updateTask, normalizeImport (note ≤ 5000, time /^\d\d:\d\d$/, dur 5–720), Standardwerte beim Lesen (fehlend = null/''). Capture-Sheet (views.js openEntry/saveEntry, body.html): bei Aufgaben Zeile „Zeit“ (natives time-Feld + Dauer-Chips 15/30/60/90) – freiwillig, falls F1=A.
Prüfung: t7 (Update behält Daten) + neuer Test: alte Aufgabe ohne Felder rendert; Export→Import behält note/time/dur; Import ohne Felder klappt.

### B2. Details „in Klammern“ + Aufklappen auf Heute  [offen – F2: C]
Verständnis: Text in (…) wird beim Speichern als Detail abgetrennt (bei C: in note übernommen) bzw. nur in der Anzeige versteckt (bei A, ohne Datenänderung). Heute: Tippen auf row-main klappt Details auf (Notiz, Uhrzeit, Dauer, Thema), Knopf „Bearbeiten“ öffnet das Sheet. Kreis bleibt Abhaken.
Umsetzung: views.js taskRow/taskMeta, boot.js Aktion editTask → toggleDetails; CSS .row-detail mit Spring-Aufklappen, reduzierte Bewegung = sofort.
Prüfung: Test: Aufgabe „Drucken (Stundenliste)“ zeigt auf Heute nur „Drucken“; Tippen zeigt „Stundenliste“; Bearbeiten öffnet Sheet; Kreis hakt weiter ab.

### B3. Aufgaben-Seite neu: Zeitstrahl  [offen – F3: A]
Verständnis (Empfehlung A): oben wischbares Wochenband (Tage mit Lichtbalken nach Last = Summe Dauer bzw. Anzahl), darunter gewählter Tag als senkrechter Zeitstrahl: Blöcke nach time/dur, Fach „im Lauf des Tages“ für Aufgaben ohne Uhrzeit, leuchtende Jetzt-Linie, Überfälliges rot oben. Sortierung nach Zeit, nicht nach Prio. Kein Abhaken/Wischen dort, Tippen = Details/Bearbeiten. Themen-Filter bleibt. Neues Design im violetten Hologramm-Stil des Tabs.
Umsetzung: views.js renderTasks komplett neu (alte Gruppenlogik als Fallback „Später“ ab Tag 8), styles.css Abschnitt Aufgaben, Empty States.
Prüfung: t3/t4 anpassen (wo sie Gruppen der Aufgaben-Seite prüfen), neuer Test: Block-Position entspricht Uhrzeit, Wochenband wechselt Tag, kein Swipe-Abhaken auf Aufgaben-Seite; Screenshots via gallery.js ansehen, auch 375×667.

### B4. Folge-Erinnerung  [offen – F4: B]
Verständnis: „Drucken“ → zum Ende der geplanten Zeit erscheint „Stundenliste eintragen“ auf Heute. Kein Push/Hintergrund (tabu/unmöglich); bei offener App Toast + Ton zur Zeit.
Umsetzung je nach Antwort: A) task.after (Text) → beim Erreichen von time+dur (oder beim Abhaken) neue Aufgabe anlegen, einmalig (task.afterDone). B) Regeln in meta 'rules' [{word, then}] + Einstellungs-Abschnitt. Erzeugung idempotent (kein Doppel bei Neuladen).
Prüfung: Test mit gefakter Uhr: Folgeaufgabe genau einmal, auch nach Neuladen.

## Paket C: Überfällig soll wehtun
Wünsche (Zitate): „Wenn sie nicht erledigt wurden soll das richtig schmerzen. Unangenehm sein. … wenn überfällige Aufgaben sind, ein wenig rot mit einbauen? Oder in die Start Animation“ · „die Umrandung in der App rot leuchtend, wenn überfällige Aufgaben anstehen. Mehr leuchtend je mehr und aggressiver strahlend evtl. Bewegend, in die Mitte gerichtet, wenn wichtige und viele oder zb überfällige Tages Ziele anstehen.“

### C1. Roter Leuchtrand  [offen]
Umsetzung: fixes Overlay #alarm (pointer-events:none, über #app, unter Layern) mit inset box-shadow in Rot. Stärke aus Score = Σ überfällige Aufgaben (Hoch 3, Normal 2, Niedrig 1) + überfällige Ziele ×4, gedeckelt. Stufen: 0 aus; leicht = ruhiger dünner Rand; mittel = atmend; stark (Ziel überfällig oder Score ≥ 8) = Pulsieren nach innen (Rand-Glow wandert zur Mitte). Aktualisierung in renderAll/balance(). Reduzierte Bewegung: statisch. Nicht während Intro.
Prüfung: t10/t11 erweitern oder neuer Test: ohne Überfälliges kein #alarm-Glow (opacity 0); 1 Niedrig → Stufe 1; überfälliges Ziel → Stufe 3; nach Abhaken sinkt Stufe.

### C2. Rot in der Startanimation  [offen]
Umsetzung: ui.js FX.intro / #intro: bei Überfälligem färbt sich der Lichtkopf/das Randlicht beim Umlauf rot, Begrüßung ersetzt durch z. B. „3 überfällig. Zeit, sie zu erledigen.“ Icon bleibt unverändert (Wunsch).
Prüfung: t11: mit überfälliger Aufgabe hat body/#intro Klasse .over und Text nennt die Zahl; ohne bleibt alles wie bisher.

### C3. Verschieben wird unbequem + Zähler  [offen – F5: C, „OK Daten“]
Umsetzung: task.moved (Zahl, Standard 0) bei jeder Datumsänderung einer überfälligen Aufgabe +1; Bestätigungsdialog „Schon 2× verschoben. Wirklich?“; Anzeige „3× verschoben“ in Rot an der Zeile. normalizeImport ergänzen.

### C4. Roter Zähler am App-Icon  [offen – F5: C]
Umsetzung: navigator.setAppBadge(n) / clearAppBadge, nur wenn unterstützt; Erlaubnis-Anfrage einmalig per Knopf in den Einstellungen (iOS braucht Notification-Erlaubnis). Keine Mitteilungen senden.

## Paket D: Design & Bewegung
Wünsche (Zitate): „Leichte Balken oben (Balance) mehr leuchten lassen, präsenter, sichtbarer.“ · „Oben rechts das Leuchten schimmern um den Doppel linien 1/4 Kreis in der Ecke mehr sichtbar farbig leuchten“ · „ne coole Animation wenn man von Page zu Page wechselt im jarvis style“ · „die einzelnen Felder … minimal floatend bewegen … eine Art Schwingung allzeit anwesend … Farbfelder schwingen und wechseln minimal (oder die Linien drum rum leicht bewegen / leuchten)“
Hinweis: Der Nutzer wünscht ausdrücklich Daueranimation – Wunsch geht vor dem allgemeinen Standard. Minimal halten, nur transform/opacity (GPU), „Bewegung reduzieren“ = alles aus.

### D1. Lichtlinie (Balance) präsenter  [offen]
Umsetzung: styles.css .beam: Höhe 1→2px für erledigt/überfällig, stärkerer Glow (box-shadow in Bereichsfarbe), b-dot heller, Beschriftung etwas heller.
Prüfung: t10 läuft weiter; Screenshot ansehen.

### D2. Eck-Ringe oben rechts leuchten farbig  [offen]
Umsetzung: #ambient::before/::after: Ringfarbe in Bereichsfarbe (Variable je aktivem Tab), radial-gradient-Schimmer hinter den Ringen, langsames Schimmern (12–16 s). Bei Überfälligem leicht ins Rot (mit C1 koppeln).
Prüfung: Screenshot; reduzierte Bewegung = statisch.

### D3. Seitenwechsel im Jarvis-Stil  [offen]
Umsetzung: views.js go(): kurze HUD-Überblendung (~350 ms): Scanlinie fegt in Bereichsfarbe über den Bildschirm, neue Ansicht baut sich mit leichtem Glitch/Scan-Reveal (clip-path + opacity) auf, Lichtpunkt gleitet wie bisher. Darf Eingabe nicht blockieren, Doppeltipp auf Tabs sicher.
Prüfung: monkey.js (viele Tabwechsel) ohne Fehler; Test: nach Tabwechsel ist neue Ansicht nach ≤ 600 ms .active und klickbar.

### D4. Ständige leise Schwingung  [offen]
Umsetzung: Karten auf Heute (.card/.goal/.row-Gruppen): sehr langsames Schweben (translateY ±1.5px, 7–11 s, versetzte Phasen), Glas-Hintergründe mit sanft wanderndem Farbverlauf (background-position), Kantenlinien leicht atmend. Pausiert bei kb-open und offenen Layern (Akku/Ruhe beim Tippen).
Prüfung: Test: mit reduced motion keine laufende Animation (getAnimations().length auf Karten = 0); Screenshot.

## Paket E: Ton
Wunsch (Zitat): „Ton bei Aktionen. Zb App öffnen Animation = Ton, Aufgaben antippen = Ton, usw“

### E1. Töne bei Aktionen  [offen]
Umsetzung: Web Audio, synthetisch erzeugt (keine Dateien): Start-Klang zur Intro, kurzer Klick beim Antippen, heller Ton beim Abhaken (höher nach Prio), Akkord beim Tagesziel, weicher Ton beim Speichern. Leise (Gain ≤ 0.15). navigator.audioSession.type = 'ambient' wenn vorhanden (Stummschalter wird respektiert). AudioContext erst nach erster Berührung entsperren (Intro-Ton nur, wenn möglich – iOS erlaubt ohne Geste keinen Ton; ehrlich melden). Schalter „Töne“ in den Einstellungen, Speicherung in localStorage 'momentum.sound' (keine Datenänderung), Standard an.
Prüfung: Test: Schalter vorhanden, aus = keine AudioContext-Aufrufe (Spy), keine Konsolenfehler ohne Web Audio.

## Paket F: Kalender & Wecker
Wünsche (Zitate): „dass diese App mit dem Kalender zusammen arbeiten kann … wöchentlich geplante Ereignisse“ · „Dass sie auch in der Lage ist Wecker zu stellen, einen zu erinnern … Kurzbefehlen …“

### F1. Kurzbefehl-Brücke  [offen – F6: A+B, nach B1/B3]
Verständnis: Web-App kann Kalender nicht lesen und keine Wecker stellen. Weg: shortcuts://run-shortcut?name=…&input=text&text=… aus Momentum (Termin/Wecker anlegen); Rückweg über Zwischenablage („Aus Kalender einfügen“). Anleitung für die Kurzbefehle in Notion schreiben.
