# Übergabe: Notenweg-Prüfung („Richtig oder gar nicht“)

Auftrag von Nils: Jedes Stück in Notenweg auf Richtigkeit prüfen. Fehler korrigieren; geht das nicht, Stück raus
oder App umbauen. Nichts vereinfachen. Sparsam mit dem Nutzungslimit: wenige, gebündelte Schritte, kurze Ausgaben.

## Wo alles liegt
- Branch `pruefung` (NICHT main): alle bisherigen Korrekturen, noch nicht gebaut/veröffentlicht.
  `git fetch origin pruefung && git checkout pruefung`
- Prüfwerkzeuge: `notenweg/quelle/pruefung/` (erwarten Pfade `/home/claude/verify`, `/home/claude/src/<repo>`,
  Repo unter `/home/claude/momentum` → ggf. kopieren bzw. per sed anpassen).
- Referenzquellen nach `/home/claude/src/` klonen (nur die nötigen, `--depth 1`):
  MutopiaProject/MutopiaProject (mutopia), fosfrancesco/asap-dataset (asap), DCMLab/tchaikovsky_seasons,
  übrige siehe `mapping.py` (craigsapp/*, humdrum-tools/*, pl-wnifc/*, DCMLab/*).

## Schon erledigt (auf Branch pruefung)
- Engine: Haltebögen pro Akkordton `(C4~ E4)`, Haltebögen über Stimmen hinweg (tiePool), Akkordtöne ohne eigene Dauer.
- kern2nw/mscx2nw: Vorschläge, Teil-Haltebögen, 3 Stimmen, Tonart-Fix, N-tolen; alle kern/DCML-Stücke neu konvertiert
  und Note für Note gegen eigene unabhängige Leser geprüft.
- Préludes jetzt aus NIFC-Erstausgabe Catelin 1839. nocturne-48-1 entfernt (165 Stücke).
- Handkorrekturen mit Beleg: therese T4, mondschein T12/37/63/65/67, entertainer T30, maple T45 (Faksimile), invention13 T15.
- lyref.py = unabhängiger LilyPond-Leser (an Inventionen + BWV 846 gegen kern/xml exakt bestätigt).
  lyapp.py: ALLE Mutopia-Stücke stimmen mit der App überein, außer den Punkten unten.

## Offen
1. consolation3: T21–55 Dauer-Abweichungen (gehaltene Oberstimme). Klären, ob Leser oder App falsch.
2. Fehlende Vorschlagsnoten ergänzen (`!g=`/`!gs=` am Folgeton): moment3 (47), januar (5), fuer-elise (3),
   bwv933 (3), bwv934 (2), jaegerlied (2), menuett-g (1). Weg: ly2nw um \grace/\acciaccatura/\appoggiatura
   erweitern und Vorschläge in bestehende JSON einsetzen (Fingersätze behalten), oder per Hand.
3. Duplikat praeludium-c = bwv939 (gleiches Stück) → eins entfernen oder bewusst behalten.
4. Notenweg-eigene Sätze prüfen: Lesestücke, Ode, Winterball-Lieder (lieder.js): Taktlängen, Melodie.
5. PROJEKT.md aktualisieren (Syntax `(C4~ E4)`, Prüfverfahren, Verlauf), BUILD 12 / VERSION 5.1,
   `python3 notenweg/quelle/build.py`, Tests e2e + monkey + metronom + Render-Regression,
   Branch nach main mergen, pushen (Freigabe liegt vor), Pages prüfen.
6. Ehrlicher Abschlussbericht an Nils: was geprüft (wie), was gefunden und korrigiert, was entfernt, wo Grenzen sind
   (Editionsvarianten zwischen Erstausgaben).
