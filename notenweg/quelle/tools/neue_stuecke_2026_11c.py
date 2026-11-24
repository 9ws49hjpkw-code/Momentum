"""Notenweg 5.0, Teil 2 (24.11.2026): Stücke, die erst mit drei Stimmen, Vorschlägen und beliebigen N-tolen gehen.

Chopin-Nocturnes, -Walzer, Fantaisie-Impromptu, Etüden, Berceuse (NIFC-Erstausgaben, kern2nw), weitere Préludes
(craigsapp/chopin-preludes, kern2nw), Schumann Kinderszenen 7/12/13, Debussy (Children's Corner, La plus que lente,
Page d'album), Tschaikowsky März, Grieg op. 12/3, 12/7, 38/1 (DCML, mscx2nw).
Rohdaten: OUT/<datei>.json (Dateiname = Name der Quelldatei ohne Endung).
Aufruf: python3 neue_stuecke_2026_11c.py /pfad/zu/raw3
"""
import json, os, sys, urllib.parse

OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/raw3'
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'stuecke')
SAPP = 'Craig Stuart Sapp, Humdrum-Edition (kernScores / CCARH Stanford), CC BY-NC-SA 4.0'
NIFC = 'Fryderyk-Chopin-Institut, digitale Erstausgaben (chopinscores.org), CC BY 4.0'
DCML = 'Digital and Cognitive Musicology Lab (EPFL), DCML-Korpus, CC BY-NC-SA 4.0'
AFTER = {3: '5.4', 4: '6.6', 5: '7.6', 6: 'ch:VIII'}


def imslp(q):
    return ['IMSLP (Originalnoten, gratis)', 'https://imslp.org/index.php?title=Special:Search&search=' + urllib.parse.quote(q)]


def N(id, f, title, cat, keyde, lvl, bpm, why, focus, q, src=NIFC, composer='Frédéric Chopin', after=None, patch=None):
    return dict(id=id, f=f, title=title, cat=cat, keyde=keyde, lvl=lvl, bpm=bpm, why=why, focus=focus, q=q, src=src, composer=composer, after=after or AFTER[lvl], patch=patch)


NOCT = 'Nocturnes Chopin'
P = [
    # ---------------- Chopin: Nocturnes ----------------
    N('nocturne-9-1', '009-1b-Sm-001', 'Nocturne b-Moll op. 9 Nr. 1', 'Larghetto · Erstausgabe Schlesinger, Paris', 'b-Moll', 5, 76,
      'Das erste der drei Nocturnes op. 9: eine dunkle, singende Melodie über weit ausgebreiteten Begleitfiguren, dazwischen lange verzierte Läufe, die frei schweben.',
      ['Linke Hand zuerst allein, bis die weiten Sprünge sicher sind', 'Lange Läufe (11 oder mehr Töne) nicht abzählen, sondern auf die Zielnote hinspielen', 'Melodie singen wie eine Opernstimme'], NOCT),
    N('nocturne-9-2', '009-1b-Sm-002', 'Nocturne Es-Dur op. 9 Nr. 2', 'Andante · Erstausgabe Schlesinger, Paris', 'Es-Dur', 5, 66,
      'Das berühmteste Nocturne: links ein wiegender 12/8-Walzer, rechts eine Melodie, die bei jeder Wiederkehr reicher verziert wird. Hier lernst du, wie Chopin eine Melodie „singen“ lässt.',
      ['Linke Hand: Bass tief und weich, Akkorde leicht', 'Verzierungen erst weglassen, dann einzeln dazunehmen', 'Die Kadenz am Schluss frei, aber mit Ziel'], NOCT),
    N('nocturne-15-3', '015-1b-Sm-003', 'Nocturne g-Moll op. 15 Nr. 3', 'Lento · Erstausgabe Schlesinger, Paris', 'g-Moll', 4, 60,
      'Ein langsames, nachdenkliches Nocturne ohne virtuose Läufe. Zum Schluss wird es zu einem schlichten Choral, „religioso“.',
      ['Melodie und Begleitung in der rechten Hand trennen', 'Den Choral am Ende ganz gleichmäßig, wie eine Orgel', 'Langsames Tempo halten, nicht schleppen'], NOCT),
    N('nocturne-27-1', '027-1-BH-001', 'Nocturne cis-Moll op. 27 Nr. 1', 'Larghetto · Erstausgabe Breitkopf & Härtel', 'cis-Moll', 6, 54,
      'Unheimlich ruhig beginnt es, über weiten Arpeggien links. Dann bricht ein stürmischer Mittelteil los, bevor die Stille zurückkehrt und in Dur endet.',
      ['Linke Arpeggien weit und leise, wie ein Teppich', 'Mittelteil: erst langsam, Tempo-Treppe', 'Den Wechsel nach Dur am Ende bewusst hören'], NOCT),
    N('nocturne-27-2', '027-1-BH-002', 'Nocturne Des-Dur op. 27 Nr. 2', 'Lento sostenuto · Erstausgabe Breitkopf & Härtel', 'Des-Dur', 6, 50,
      'Ein langes Liebesduett: Die Melodie erscheint immer wieder, mal allein, mal in Terzen und Sexten, mal verziert. Eines der schönsten und anspruchsvollsten Nocturnes.',
      ['Linke Hand über die weiten Griffe locker führen', 'Doppelgriffe in Terzen und Sexten: oberen Ton etwas lauter', 'Jede Wiederkehr der Melodie etwas anders färben'], NOCT),
    N('nocturne-32-1', '032-1-Sm-001', 'Nocturne H-Dur op. 32 Nr. 1', 'Andante sostenuto · Erstausgabe Schlesinger, Paris', 'H-Dur', 5, 66,
      'Ein freundliches, schlichtes Nocturne mit einer Überraschung: Am Ende kippt es plötzlich in ein dramatisches Rezitativ in Moll.',
      ['Fünf Kreuze vorher ansehen', 'Melodie mit kleinen Atempausen zwischen den Phrasen', 'Das Rezitativ am Schluss frei, wie gesprochen'], NOCT),
    N('nocturne-32-2', '032-1-Sm-002', 'Nocturne As-Dur op. 32 Nr. 2', 'Lento · Erstausgabe Schlesinger, Paris', 'As-Dur', 5, 60,
      'Eine weit gespannte Melodie über gleichmäßigen Akkorden, mit einem aufgewühlten Mittelteil in Moll.',
      ['Begleitakkorde leise und gleichmäßig', 'Mittelteil kräftiger, aber nicht hart', 'Den Wiedereintritt des Anfangs leise vorbereiten'], NOCT),
    N('nocturne-37-1', '037-1-BH-001', 'Nocturne g-Moll op. 37 Nr. 1', 'Andante sostenuto · Erstausgabe Breitkopf & Härtel', 'g-Moll', 4, 60,
      'Eine klagende Melodie, dazwischen ein Choral in Es-Dur wie aus einer Kirche. Gut machbar und ein schöner Einstieg in die Nocturnes.',
      ['Melodie legato, Begleitung als ruhige Viertel', 'Choral: alle Töne eines Akkords gleichzeitig', 'Verzierungen leicht, nie auf Kosten des Takts'], NOCT),
    N('nocturne-37-2', '037-1-BH-002', 'Nocturne G-Dur op. 37 Nr. 2', 'Andantino · Erstausgabe Breitkopf & Härtel', 'G-Dur', 6, 108,
      'Wie eine Bootsfahrt: Wiegende Terzen und Sexten in der rechten Hand wechseln mit einem ruhigen Lied ab.',
      ['Doppelgriffe in Terzen langsam und mit festem Fingersatz', '6/8 in zwei Schlägen wiegen', 'Das ruhige Lied deutlich vom bewegten Teil absetzen'], NOCT),
    N('nocturne-48-1', '048-1-BH-001', 'Nocturne c-Moll op. 48 Nr. 1', 'Lento · Erstausgabe Breitkopf & Härtel', 'c-Moll', 6, 54,
      'Das dramatischste Nocturne: eine düstere Melodie, ein Choral, der sich zu gewaltigen Oktaven steigert, und eine aufgewühlte Rückkehr des Anfangs.',
      ['Anfangsmelodie schlicht und dunkel', 'Choral erst leise, Steigerung über viele Takte planen', 'Oktaven aus dem Arm, nicht aus den Fingern'], NOCT),
    N('nocturne-55-1', '055-1-BH-001', 'Nocturne f-Moll op. 55 Nr. 1', 'Andante · Erstausgabe Breitkopf & Härtel', 'f-Moll', 4, 66,
      'Eines der zugänglichsten Nocturnes: eine einfache, traurige Melodie über ruhiger Begleitung, ein bewegterer Mittelteil und ein Schluss voller Läufe.',
      ['Melodie singend, Begleitung leise', 'Mittelteil: Triolen gleichmäßig', 'Schlussläufe erst langsam in Gruppen'], NOCT),
    N('nocturne-55-2', '055-1-BH-002', 'Nocturne Es-Dur op. 55 Nr. 2', 'Lento sostenuto · Erstausgabe Breitkopf & Härtel', 'Es-Dur', 6, 54,
      'Ein spätes Nocturne, fast wie Bach: Zwei Melodien verflechten sich über fließenden Triolen.',
      ['Stimmen einzeln üben, dann zusammen', 'Triolen links gleichmäßig wie ein Fluss', 'Verzierungen in den Melodiefluss einbauen'], NOCT),
    N('nocturne-62-1', '062-1-BH-001', 'Nocturne H-Dur op. 62 Nr. 1', 'Andante · Erstausgabe Breitkopf & Härtel', 'H-Dur', 6, 60,
      'Eines der letzten Nocturnes: die Melodie kehrt am Ende in lauter Trillern wieder, wie in Licht getaucht.',
      ['Fünf Kreuze vorher sicher', 'Triller am Ende leicht und gleichmäßig', 'Mehrstimmige Stellen langsam auseinandernehmen'], NOCT),
    N('nocturne-62-2', '062-1-BH-002', 'Nocturne E-Dur op. 62 Nr. 2', 'Lento · Erstausgabe Breitkopf & Härtel', 'E-Dur', 6, 56,
      'Ruhig und warm beginnt es, wird im Mittelteil unruhig und mehrstimmig, und findet zum Schluss wieder Frieden.',
      ['Melodie im Anfang ganz schlicht', 'Mittelteil: Stimmen getrennt üben', 'Pedal sparsam, damit die Stimmen klar bleiben'], NOCT),
    N('nocturne-72-1', '072-1-MEIf-001-nocturne', 'Nocturne e-Moll op. 72 Nr. 1', 'Andante (posthum) · Erstausgabe Meissonnier fils, Paris', 'e-Moll', 4, 66,
      'Ein frühes Nocturne, posthum veröffentlicht: eine schlichte, traurige Melodie über fließenden Triolen links. Ein guter erster Schritt zu den Nocturnes.',
      ['Linke Triolen gleichmäßig, Hand locker über die weiten Lagen', 'Melodie leicht hervorheben', 'Die verzierten Läufe erst ohne Pedal üben'], NOCT),
    # ---------------- Chopin: Walzer, Impromptu, Etüden, Berceuse ----------------
    N('walzer-64-1', '064-1a-BH-001', 'Walzer Des-Dur op. 64 Nr. 1 („Minutenwalzer“)', 'Molto vivace · Erstausgabe Breitkopf & Härtel', 'Des-Dur', 5, 160,
      'Der „Minutenwalzer“: Rechts wirbelt eine Figur wie ein Hündchen, das seinem Schwanz nachjagt, links tanzt ein leichter Walzer. Dauert nicht wirklich nur eine Minute.',
      ['Wirbelfigur rechts erst langsam, Fingersatz fest', 'Linke Hand leicht, Bass auf 1 kurz', 'Mittelteil ruhiger und singend'], 'Waltzes Op.64 Chopin'),
    N('walzer-64-2', '064-1a-BH-002', 'Walzer cis-Moll op. 64 Nr. 2', 'Tempo giusto · Erstausgabe Breitkopf & Härtel', 'cis-Moll', 5, 132,
      'Melancholisch und elegant: drei Teile, die sich abwechseln – ein wehmütiger Walzer, ein schneller Wirbel und ein warmer Mittelteil in Des-Dur.',
      ['Jeder Teil hat sein eigenes Tempo – bewusst wechseln', 'Wirbel-Achtel gleichmäßig und leise', 'Des-Dur-Teil singend, mit Pedal'], 'Waltzes Op.64 Chopin'),
    N('walzer-69-1', '069-1a-Sam-001', 'Walzer As-Dur op. 69 Nr. 1 („Abschiedswalzer“)', 'Lento (posthum) · Erstausgabe Schlesinger, Berlin', 'As-Dur', 4, 108,
      'Ein langsamer, zärtlicher Walzer, den Chopin zum Abschied verschenkte. Zarte Melodie, kleine Verzierungen, wenig Virtuosität.',
      ['Walzer-Begleitung leicht, Melodie oben', 'Verzierungen locker, nicht hastig', 'Rubato erst, wenn der Takt sicher sitzt'], 'Waltzes Op.69 Chopin'),
    N('walzer-34-2', '034_2-1-BH-002', 'Walzer a-Moll op. 34 Nr. 2', 'Lento · Erstausgabe Breitkopf & Härtel', 'a-Moll', 4, 96,
      'Der traurigste Walzer: Die Melodie liegt zuerst in der linken Hand, tief und dunkel. Langsam, gut lesbar, sehr ausdrucksvoll.',
      ['Melodie links singen lassen, Akkorde rechts leise', 'Lange Form: Abschnitte markieren', 'Ruhiges Tempo durchhalten'], 'Waltzes Op.34 Chopin'),
    N('walzer-70-2', '070-1-Sam-002', 'Walzer f-Moll op. 70 Nr. 2', 'Tempo giusto (posthum) · Erstausgabe Schlesinger, Berlin', 'f-Moll', 4, 132,
      'Ein kurzer, wehmütiger Walzer mit fließender Melodie. Machbar und sehr dankbar zum Vorspielen.',
      ['Linke Hand: Bass und Akkorde sauber trennen', 'Melodie in langen Bögen', 'Wechsel zwischen Moll und Dur hören'], 'Waltzes Op.70 Chopin'),
    N('fantaisie-impromptu', '066-1-Sam', 'Fantaisie-Impromptu cis-Moll op. 66', 'Allegro agitato (posthum) · Erstausgabe Schlesinger, Berlin', 'cis-Moll', 6, 84,
      'Vier gegen drei: Rechts rasen Sechzehntel, links wogen Triolen. Dazwischen ein berühmter, singender Mittelteil in Des-Dur.',
      ['4 gegen 3 zuerst klopfen: „Nicht schwie-rig“ = rechts 4, links 3', 'Rechte Hand allein in Gruppen, Tempo-Treppe ab 50 %', 'Mittelteil ruhig und singend als Erholung'], 'Fantaisie-Impromptu Op.66 Chopin',
      src=NIFC + '. Takt 3: Der tiefe Oktav-Basston links ist hier als Akkord mit dem ersten Triolenton notiert.',
      patch={2: {'l': '(C#2 C#3)/8!(!3( G#3/8 C#4/8 E4/8 C#4/8 G#3/8!) C#3/8!( G#3/8 C#4/8 E4/8 C#4/8 G#3/8!)!3)', 'l2': None}}),
    N('etude-10-3', '010-1b-Sm-003', 'Etüde E-Dur op. 10 Nr. 3 („Tristesse“)', 'Lento ma non troppo · Erstausgabe Schlesinger, Paris', 'E-Dur', 6, 60,
      'Eine der schönsten Melodien Chopins, aber eine echte Etüde: Die rechte Hand spielt Melodie und Begleitung zugleich, der Mittelteil ist ein Sturm aus Doppelgriffen.',
      ['Melodie mit 4. und 5. Finger, Begleitung im selben Arm leise', 'Mittelteil sehr langsam, Doppelgriffe einzeln', 'Nicht zu langsam: „ma non troppo“'], 'Etudes Op.10 Chopin'),
    N('etude-25-1', '025-1b-LE-001', 'Etüde As-Dur op. 25 Nr. 1 („Äolsharfe“)', 'Allegro sostenuto · Erstausgabe Lemoine, Paris', 'As-Dur', 6, 104,
      'Wie eine Harfe im Wind: Beide Hände spielen weite Arpeggien, aus denen oben eine Melodie herausklingt.',
      ['Melodietöne (oberste Note) deutlich, alles andere wie ein Hauch', 'Arpeggien aus dem Handgelenk rollen', 'Pedal mit jeder Harmonie'], 'Etudes Op.25 Chopin'),
    N('berceuse', '057-2-BH', 'Berceuse Des-Dur op. 57', 'Andante · Erstausgabe Breitkopf & Härtel', 'Des-Dur', 6, 66,
      'Ein Wiegenlied: Die linke Hand wiegt das ganze Stück über dasselbe Muster, rechts entfalten sich immer feinere Verzierungen wie Spitze.',
      ['Linkes Muster muss völlig automatisch laufen', 'Rechte Figuren leicht und leise', 'Spannung halten, obwohl die Harmonie fast gleich bleibt'], 'Berceuse Op.57 Chopin'),
    # ---------------- Chopin: Préludes ----------------
    N('prelude-15', 'prelude28-15', 'Prélude Des-Dur („Regentropfen“)', 'op. 28 Nr. 15 · Sostenuto', 'Des-Dur', 4, 66,
      'Ein Ton tropft durch das ganze Stück: As, später Gis. Über ihm eine friedliche Melodie, im Mittelteil ein dunkler, anschwellender Gesang in cis-Moll.',
      ['Der wiederholte Ton ganz gleichmäßig und leise', 'Im Mittelteil die Steigerung langsam aufbauen', 'Pedal sauber wechseln, damit es nicht verschwimmt'], 'Preludes Op.28 Chopin', src=SAPP + '.'),
    N('prelude-17', 'prelude28-17', 'Prélude As-Dur', 'op. 28 Nr. 17 · Allegretto', 'As-Dur', 5, 116,
      'Ein warmes Lied über pulsierenden Akkorden. Am Ende schlägt ein tiefes As im Bass immer wieder wie eine Glocke.',
      ['Akkordbegleitung leise und gleichmäßig', 'Melodie oben herausholen', 'Die Glockentöne am Schluss tief und weich'], 'Preludes Op.28 Chopin', src=SAPP + '.'),
    N('prelude-13', 'prelude28-13', 'Prélude Fis-Dur', 'op. 28 Nr. 13 · Lento', 'Fis-Dur', 4, 60,
      'Ein ruhiges Nachtstück mit einer weiten, gleichmäßigen Begleitung links und einem stillen Mittelteil.',
      ['Sechs Kreuze vorher sicher', 'Linke Begleitung fließend', 'Melodie im Mittelteil zart'], 'Preludes Op.28 Chopin', src=SAPP + '.'),
    N('prelude-21', 'prelude28-21', 'Prélude B-Dur', 'op. 28 Nr. 21 · Cantabile', 'B-Dur', 5, 76,
      'Eine singende Melodie über einer Begleitung in Doppelgriffen, die sich zu einem großen Höhepunkt steigert.',
      ['Doppelgriffe links langsam einzeln üben', 'Melodie legato über alles', 'Steigerung über den ganzen Mittelteil'], 'Preludes Op.28 Chopin', src=SAPP + '.'),
    N('prelude-1', 'prelude28-01', 'Prélude C-Dur', 'op. 28 Nr. 1 · Agitato', 'C-Dur', 5, 120,
      'Der Auftakt der 24 Préludes: eine halbe Minute aufgeregter Wellen, aus denen eine kurze Melodie aufsteigt.',
      ['Wellenfigur rechts locker aus dem Handgelenk', 'Melodietöne (Daumen) hervorheben', 'Kurz, aber mit einem klaren Höhepunkt'], 'Preludes Op.28 Chopin', src=SAPP + '.'),
    # ---------------- Schumann: Kinderszenen ----------------
    N('traeumerei', 'n07', 'Träumerei', 'Kinderszenen op. 15 Nr. 7 (1838)', 'F-Dur', 4, 66,
      'Eines der berühmtesten Klavierstücke überhaupt: eine Melodie, die immer wieder aufsteigt und sich verliert, getragen von mehrstimmigen Akkorden.',
      ['Melodie oben, Mittelstimmen leise darunter', 'Jede Phrase als einen großen Bogen', 'Pedal oft wechseln, damit die Stimmen klar bleiben'], 'Kinderszenen Op.15', src=DCML + '.', composer='Robert Schumann'),
    N('einschlummern', 'n12', 'Kind im Einschlummern', 'Kinderszenen op. 15 Nr. 12 (1838)', 'e-Moll', 3, 60,
      'Ein Kind, das langsam einschläft: wiegende Akkorde, ein kurzer heller Moment, dann ein offenes Ende.',
      ['Wiegende Achtel gleichmäßig', 'Leise bleiben, auch im Mittelteil', 'Das offene Ende nicht auflösen wollen'], 'Kinderszenen Op.15', src=DCML + '.', composer='Robert Schumann'),
    N('dichter-spricht', 'n13', 'Der Dichter spricht', 'Kinderszenen op. 15 Nr. 13 (1838)', 'G-Dur', 4, 56,
      'Der Abschluss der Kinderszenen: ein Choral, eine freie, gesprochene Stelle wie ein Rezitativ und ein leises Ende.',
      ['Choral wie von einem Chor gesungen', 'Rezitativ frei, aber mit Ziel', 'Fermaten wirklich aushalten'], 'Kinderszenen Op.15', src=DCML + '.', composer='Robert Schumann'),
    # ---------------- Debussy ----------------
    N('jimbo', 'l113-02_childrens_jimbos', "Jimbo's Lullaby", "Children's Corner Nr. 2 (1908)", 'B-Dur', 4, 66,
      'Ein Wiegenlied für einen Stoffelefanten: schwere, tapsige Bässe, dazwischen ein Schlaflied. Debussy schrieb Children\'s Corner für seine Tochter.',
      ['Tiefe Bässe weich, nicht dumpf', 'Pianissimo wirklich leise', 'Pedal sparsam, damit es nicht verschwimmt'], "Children's Corner Debussy", src=DCML + '.', composer='Claude Debussy'),
    N('serenade-puppe', 'l113-03_childrens_serenade', 'Serenade for the Doll', "Children's Corner Nr. 3 (1908)", 'E-Dur', 4, 120,
      'Ein Ständchen für eine Puppe: leise, gezupfte Akkorde wie eine Gitarre, darüber eine zarte Melodie.',
      ['Staccato-Akkorde leicht wie gezupft', 'Fast alles leise – Unterschiede innerhalb des Piano', 'Pedal nur, wo es steht'], "Children's Corner Debussy", src=DCML + '.', composer='Claude Debussy'),
    N('snow-dancing', 'l113-04_childrens_snow', 'The Snow is Dancing', "Children's Corner Nr. 4 (1908)", 'd-Moll', 5, 132,
      'Schneeflocken vor dem Fenster: leise, gleichmäßige Sechzehntel, durch die eine traurige Melodie zieht.',
      ['Sechzehntel ganz gleichmäßig und leise', 'Hände wechseln sich ab – genau zählen', 'Melodie über dem Schneetreiben'], "Children's Corner Debussy", src=DCML + '.', composer='Claude Debussy'),
    N('plus-que-lente', 'l121_plus', 'La plus que lente', 'Valse L. 121 (1910)', 'Ges-Dur', 5, 92,
      'Ein Walzer „langsamer als langsam“: verträumt, mit viel Rubato und überraschenden Harmonien.',
      ['Rubato erst, wenn der Walzer-Puls sitzt', 'Sechs Be-Vorzeichen vorher sicher', 'Melodie zart, Begleitung im Hintergrund'], 'La plus que lente Debussy', src=DCML + '.', composer='Claude Debussy'),
    N('page-album', 'l133_page', "Page d'album", 'L. 133 (1915)', 'F-Dur', 3, 96,
      'Ein kurzes Albumblatt im Walzertakt, eines von Debussys letzten Klavierstücken: einfach gebaut, aber mit typischem Debussy-Klang.',
      ['Ruhiger Walzerpuls', 'Ungewohnte Harmonien bewusst hören', 'Leise und durchsichtig spielen'], "Page d'album Debussy", src=DCML + '.', composer='Claude Debussy'),
    # ---------------- Tschaikowsky ----------------
    N('maerz', 'op37a03', 'März – Lied der Lerche', 'Die Jahreszeiten op. 37a Nr. 3', 'g-Moll', 4, 66,
      'Eine Lerche über einer noch kahlen Landschaft: eine schlichte Moll-Melodie mit kleinen Trillern und Verzierungen.',
      ['Akkorde links ruhig und weich', 'Verzierungen wie Vogelrufe, leicht', 'Melodie mit langen Bögen'], 'The Seasons Op.37a Tchaikovsky', src=DCML + '.', composer='Pjotr Tschaikowsky'),
    # ---------------- Grieg ----------------
    N('waechterlied', 'op12n03', 'Wächterlied', 'Lyrische Stücke op. 12 Nr. 3', 'E-Dur', 3, 66,
      'Ein feierliches Lied eines Nachtwächters, mit einem geheimnisvollen Mittelteil voller Geisterrufe.',
      ['Akkorde gleichzeitig und ruhig', 'Mittelteil leise und unheimlich', 'Rückkehr des Lieds wieder feierlich'], 'Lyric Pieces Op.12 Grieg', src=DCML + '.', composer='Edvard Grieg'),
    N('albumblatt-grieg', 'op12n07', 'Albumblatt', 'Lyrische Stücke op. 12 Nr. 7', 'e-Moll', 3, 92,
      'Ein kurzes, wehmütiges Stück mit einer leichten, tanzenden Begleitung.',
      ['Begleitung leicht und kurz', 'Melodie in Zweierbögen', 'Auftakt bewusst zählen'], 'Lyric Pieces Op.12 Grieg', src=DCML + '.', composer='Edvard Grieg'),
    N('wiegenlied-grieg', 'op38n01', 'Wiegenlied', 'Lyrische Stücke op. 38 Nr. 1', 'G-Dur', 3, 72,
      'Ein ruhiges Wiegenlied: eine einfache Melodie über einer gleichmäßig wiegenden Begleitung.',
      ['Melodie hervorheben, Begleitung zurücknehmen', 'Wiegende Bewegung gleichmäßig halten', 'Ruhiges Tempo, nicht eilen'], 'Lyric Pieces Op.38 Grieg', src=DCML + '.', composer='Edvard Grieg'),
]


def main():
    order_file = os.path.join(DST, '_reihenfolge.json')
    order = json.load(open(order_file, encoding='utf-8'))
    for e in P:
        raw = json.load(open(os.path.join(OUT, e['f'] + '.json'), encoding='utf-8'))
        ms = raw['measures']
        for mi, ch in (e.get('patch') or {}).items():
            for k, v in ch.items():
                if v is None: ms[mi].pop(k, None)
                else: ms[mi][k] = v
        bad = [b for b in raw.get('bad', []) if b not in (e.get('patch') or {})]
        if bad: sys.exit(f"{e['id']}: fehlerhafte Takte {bad}")
        for m in ms:
            for k in ('r2', 'l2', 'r3', 'l3'):
                if k in m and not m[k]: del m[k]
        od = raw.get('order') or list(range(len(ms)))
        p = {'title': e['title'], 'composer': e['composer'], 'cat': e['cat'], 'keyde': e['keyde'], 'lvl': e['lvl'], 'bpm': e['bpm'],
             'after': e['after'], 'why': e['why'], 'focus': e['focus'], 'src': e['src'] if e['src'].endswith('.') else e['src'] + '.',
             'links': [imslp(e['q'])], 'id': e['id'],
             'key': raw.get('key') or 'C', 'time': raw.get('time') or 'C', 'pickup': float(raw.get('pickup') or 0), 'measures': ms, 'order': od}
        if raw.get('clefInit'): p['clefInit'] = raw['clefInit']
        json.dump(p, open(os.path.join(DST, e['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        if e['id'] not in order: order.append(e['id'])
    json.dump(order, open(order_file, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(P), 'Stücke geschrieben,', len(order), 'insgesamt')


if __name__ == '__main__':
    main()
