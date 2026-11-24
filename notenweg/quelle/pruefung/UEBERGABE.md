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

## Abgeschlossen (24.11.2026, Build 12 / 5.1, nach main gemergt)
1. consolation3: Die App war falsch – Haltebögen in Akkorden fehlten (T21, 22, 25, 26, 31, 33, 39, 42, 50, 51, 57, 60).
   Der Leser übersah Richtungs-Haltebögen `_~`/`^~` (lyref.py korrigiert). Jetzt Note für Note gleich.
2. Vorschläge ergänzt mit `graces.py` (aus lyref.py, Folgeton per Einsatz + Tonhöhe zugeordnet, `\acciaccatura` → `!gs=`):
   moment3 47, januar 5 (zusätzlich gegen DCML bestätigt), fuer-elise 3, bwv933 3, bwv934 2, jaegerlied 2, menuett-g 1. Alle gleich der Quelle.
3. bwv939 entfernt (= praeludium-c, Takte identisch); fill() übernimmt alten Fortschritt. Text praeludium-c präzisiert (Orgelpunkt nur T1–3).
4. Eigene Sätze: Taktlängen aller Lesestücke, Ode und Winterball-Lieder (alle Stufen) korrekt; Melodien gegen Quellen
   (Essen/Böhme: tanne, jahre, froehlich, zion, kinder; Mutopia: himmel, joy, adeste, noel, wenceslas) – einzige Abweichung
   „O du fröhliche“ T4/T8/T16, an Böhme angepasst. Ohne maschinenlesbare Quelle (nach Gehör/Standardfassung geprüft): morgen, deck,
   jingle, wish, silent, ode.
5. PROJEKT.md, Build 12, Tests grün, Render-Regression: nur die geänderten Stücke rendern anders.
