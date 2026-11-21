"""Neue Originalstücke (Notenweg 4.1, 21.11.2026).

Liest die konvertierten Rohdaten (kern2nw / mscx2nw / ly2nw / hand/gymnopedie1.py) und schreibt sie mit
Texten und Freischaltung nach src/stuecke/. Rohdaten-Ordner: OUT (siehe unten). Quellen-Repos (alle auf GitHub):
  craigsapp/{beethoven,mozart,haydn}-piano-sonatas, craigsapp/scarlatti-keyboard-sonatas, craigsapp/chopin-preludes,
  craigsapp/chopin-mazurkas, craigsapp/joplin, pl-wnifc/humdrum-chopin-first-editions,
  DCMLab/{schumann_kinderszenen,tchaikovsky_seasons,grieg_lyric_pieces,debussy_suite_bergamasque,
  debussy_childrens_corner,liszt_pelerinage}, MutopiaProject/MutopiaProject (ftp/BachJS, ftp/SatieE).
Aufruf: python3 neue_stuecke_2026_11.py /pfad/zu/out
"""
import json, os, sys, urllib.parse

OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/out'
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'stuecke')

SAPP = 'Craig Stuart Sapp, Humdrum-Edition (kernScores / CCARH Stanford), CC BY-NC-SA 4.0'
NIFC = 'Fryderyk-Chopin-Institut, digitale Erstausgaben (chopinscores.org), CC BY 4.0'
DCML = 'Digital and Cognitive Musicology Lab (EPFL), DCML-Korpus, CC BY-NC-SA 4.0'
MUTO_BG = 'Mutopia Project nach der Bach-Gesellschaft-Ausgabe'


def imslp(q):
    return ['IMSLP (Originalnoten, gratis)', 'https://imslp.org/index.php?title=Special:Search&search=' + urllib.parse.quote(q)]


P = [
    # ---------------- Stufe 2 ----------------
    dict(id='bwv939', f='ly/bwv-939', title='Präludium C-Dur BWV 939', composer='Johann Sebastian Bach', cat='Fünf kleine Präludien', keyde='C-Dur', lvl=2, bpm=72, after='3.2',
         why='Sechzehn Takte, ein einziger Gedanke, der durch die Harmonien wandert. Solche kleinen Präludien waren Unterrichtsstücke – genau dafür sind sie da.',
         focus=['Gleichmäßige Notenwerte in beiden Händen', 'Harmonien erkennen: welcher Akkord steckt in jedem Takt?', 'Erst langsam mit Metronom, dann fließend'],
         src=MUTO_BG + ', Band 36 (1890); CC BY-SA 3.0.', q='BWV 939'),
    dict(id='bittendes-kind', f='dcml/schumann_kinderszenen__n04', title='Bittendes Kind', composer='Robert Schumann', cat='Kinderszenen op. 15 Nr. 4 (1838)', keyde='D-Dur', lvl=2, bpm=60, after='4.8',
         why='Eine kleine Bitte, die nie ganz aufgelöst wird: Das Stück endet auf einem offenen Septakkord. Kurz, leise und ein perfekter Einstieg in Schumanns Kinderszenen.',
         focus=['Oberstimme singen lassen, Begleitung in den Hintergrund', 'Leise spielen, ohne dass Töne ausfallen', 'Das offene Ende bewusst hören – nicht auflösen wollen'],
         src=DCML + '.', q='Kinderszenen Op.15'),
    dict(id='vaterlaendisch', f='dcml/grieg_lyric_pieces__op12n08', title='Vaterländisches Lied', composer='Edvard Grieg', cat='Lyrische Stücke op. 12 Nr. 8', keyde='Es-Dur', lvl=2, bpm=88, after='4.8',
         why='Ein Choral im Volkston: volle Akkorde in beiden Händen, feierlich und einfach gebaut. Ideal, um Akkordgriffe in den Noten schnell zu erkennen.',
         focus=['Akkorde wirklich gleichzeitig anschlagen', 'Oberstimme minimal lauter als die Mittelstimmen', 'Ruhiges, gleichmäßiges Tempo wie ein Chor'],
         src=DCML + '.', q='Lyric Pieces Op.12 Grieg'),
    # ---------------- Stufe 3 ----------------
    dict(id='gymnopedie1', f='gymno1', title='Gymnopédie Nr. 1', composer='Erik Satie', cat='Lent et douloureux (1888)', keyde='D-Dur', lvl=3, bpm=72, after='5.4',
         why='Das Urbild der ruhigen Klaviermusik, aus der später Neoklassik und Ambient wurden: links Basston und Akkord im Wechsel, rechts eine schwebende Melodie. Wenige Töne, viel Klang – alles hängt am Pedal und am Zuhören.',
         focus=['Linke Hand: Basston auf 1, Akkord auf 2 – der Akkord steht oft im oberen System, wird aber links gespielt', 'Pedal bei jedem Basston wechseln', 'Melodie leise, aber tragend; Tempo wirklich langsam halten'],
         src='Mutopia Project nach der Dover-Ausgabe (Reprint des Originals), gemeinfrei. Die Wiederholung ist als Klammer 1./2. notiert; Satie schrieb sie aus.', q='Gymnopédies Satie'),
    dict(id='bwv941', f='ly/bwv-941', title='Präludium e-Moll BWV 941', composer='Johann Sebastian Bach', cat='Fünf kleine Präludien', keyde='e-Moll', lvl=3, bpm=80, after='4.3',
         why='Ein kurzes Präludium im Dreiertakt, in dem die Hände sich Motive zuwerfen. Moll, aber nicht schwer – ein guter erster Schritt zu Bachs Zweistimmigkeit.',
         focus=['Jede Hand ist eine eigene Stimme: erst getrennt üben', 'Fis und Dis aus der Vorzeichnung bzw. als Leitton nicht vergessen', 'Phrasen zu zwei Takten denken'],
         src=MUTO_BG + ', Band 36 (1890); CC BY-SA 3.0.', q='BWV 941'),
    dict(id='bwv933', f='ly/bwv933', title='Präludium C-Dur BWV 933', composer='Johann Sebastian Bach', cat='Sechs kleine Präludien Nr. 1', keyde='C-Dur', lvl=3, bpm=72, after='4.6',
         why='Zwei Hälften mit Wiederholung, wie ein kleiner Tanz. Hier hörst du, wie Bach mit wenigen Akkorden Spannung baut.',
         focus=['Schnelle Notenwerte locker aus dem Handgelenk', 'Kadenzen am Ende jeder Hälfte hören', 'Wiederholung leicht anders gestalten (z. B. leiser)'],
         src=MUTO_BG + ', Band 36 (1890); CC BY-SA 3.0.', q='BWV 933'),
    dict(id='bwv934', f='ly/bwv-934', title='Präludium c-Moll BWV 934', composer='Johann Sebastian Bach', cat='Sechs kleine Präludien Nr. 2', keyde='c-Moll', lvl=3, bpm=84, after='4.6',
         why='Ein ernstes, fließendes Präludium im 3/4-Takt mit Wiederholungen. Gut, um Moll-Tonarten mit drei Be-Vorzeichen sicher zu lesen.',
         focus=['Hände getrennt, bis jede Linie allein trägt', 'Drei Be-Vorzeichen plus Auflösungen genau lesen', 'Schwerpunkt auf der Eins jedes Takts'],
         src=MUTO_BG + ', Band 36 (1890); CC BY-SA 3.0.', q='BWV 934'),
    dict(id='bwv937', f='ly/bwv-937', title='Präludium E-Dur BWV 937', composer='Johann Sebastian Bach', cat='Sechs kleine Präludien Nr. 5', keyde='E-Dur', lvl=3, bpm=72, after='5.6',
         why='Vier Kreuze, aber freundlich: ein helles, zweiteiliges Präludium. Der beste Weg, sich mit vielen Vorzeichen anzufreunden.',
         focus=['Vorzeichnung vor dem Spielen laut aufsagen: Fis, Cis, Gis, Dis', 'Schwierige Stellen in kleinen Gruppen üben', 'Hände getrennt sicher, dann zusammen langsam'],
         src=MUTO_BG + ', Band 36 (1890); CC BY-SA 3.0.', q='BWV 937'),
    dict(id='bwv942', f='ly/bwv-942', title='Präludium a-Moll BWV 942', composer='Johann Sebastian Bach', cat='Fünf kleine Präludien', keyde='a-Moll', lvl=3, bpm=56, after='6.4',
         why='Im 9/8-Takt: drei Gruppen zu drei Achteln, wiegend wie ein Lied. Eine gute Übung für zusammengesetzte Takte.',
         focus=['Drei Schläge pro Takt zählen, nicht neun', 'Gebrochene Akkorde gleichmäßig verteilen', 'Leittöne (Gis) bewusst hören'],
         src=MUTO_BG + ', Band 36 (1890); CC BY-SA 3.0.', q='BWV 942'),
    dict(id='k331-thema', f='kern/mozart-piano-sonatas__sonata11-1a', title='Thema „Andante grazioso“ aus KV 331', composer='Wolfgang Amadeus Mozart', cat='Sonate A-Dur KV 331, 1. Satz: Thema', keyde='A-Dur', lvl=3, bpm=60, after='6.6',
         why='Das Thema, das Mozart danach sechsmal variiert – aus derselben Sonate stammt das Rondo alla turca. Ein wiegender 6/8-Gesang, den man lange im Ohr behält.',
         focus=['6/8: in zwei großen Schlägen denken', 'Punktierte Rhythmen genau, aber nicht hart', 'Phrasenenden leiser werden lassen'],
         src=SAPP + '. Zwei Vorschlagsnoten sind hier nicht dargestellt – sieh sie im Original nach.', q='Piano Sonata No.11 K.331 Mozart'),
    dict(id='k284-thema', f='kern/mozart-piano-sonatas__sonata06-3a', title='Thema aus KV 284', composer='Wolfgang Amadeus Mozart', cat='Sonate D-Dur KV 284, 3. Satz: Thema (Andante)', keyde='D-Dur', lvl=3, bpm=72, after='6.2',
         why='Ein schlichtes, elegantes Thema, über das Mozart danach zwölf Variationen schreibt – hier lernst du die Ausgangsform.',
         focus=['Auftakt bewusst leicht', 'Zwei Halbe pro Takt (alla breve)', 'Wiederholungen mitspielen'],
         src=SAPP + '.', q='Piano Sonata No.6 K.284 Mozart'),
    dict(id='k282-menuett', f='kern/mozart-piano-sonatas__sonata04-2', title='Menuett I und II aus KV 282', composer='Wolfgang Amadeus Mozart', cat='Sonate Es-Dur KV 282, 2. Satz', keyde='B-Dur', lvl=3, bpm=120, after='6.2',
         why='Zwei Menuette hintereinander, das erste wird am Schluss wiederholt. Höfische Eleganz in klaren Phrasen – genau die Welt, die man aus Bridgerton kennt.',
         focus=['Dreiertakt mit leichter Betonung auf 1', 'Verzierungen sauber, nicht hastig', 'Form erkennen: Menuett I – Menuett II – Menuett I'],
         src=SAPP + '.', q='Piano Sonata No.4 K.282 Mozart'),
    dict(id='ecossaise1', f='kern/humdrum-chopin-first-editions__072-1-MEIf-003-ecossaise', title='Écossaise D-Dur', composer='Frédéric Chopin', cat='Drei Écossaisen op. 72 Nr. 3 (posthum) – Nr. 1', keyde='D-Dur', lvl=3, bpm=108, after='5.2',
         why='Ein Tanz im Zweiertakt, frech und schnell vorbei. Chopin schrieb ihn als Jugendlicher – ein spielerischer erster Chopin.',
         focus=['Staccato in der Begleitung kurz und leicht', 'Tempo erst langsam, dann vivace', 'Wiederholungen beachten'],
         src=NIFC + '.', q='Ecossaises Op.72 Chopin'),
    dict(id='mazurka-33-3', f='kern/chopin-mazurkas__mazurka33-3', title='Mazurka C-Dur op. 33 Nr. 3', composer='Frédéric Chopin', cat='Semplice', keyde='C-Dur', lvl=3, bpm=120, after='5.6',
         why='Eine schlichte Mazurka („semplice“) ohne Vorzeichen. Hier lernst du den typischen Mazurka-Schwung: Betonung oft auf der Zwei oder Drei statt auf der Eins.',
         focus=['Dreiertakt mit Akzent auf 2 oder 3, wo notiert', 'Linke Hand leicht, rechts singend', 'Kleines Rubato erst, wenn alles sicher sitzt'],
         src=SAPP + '.', q='Mazurkas Op.33 Chopin'),
    dict(id='gluekes-genug', f='dcml/schumann_kinderszenen__n05', title='Glückes genug', composer='Robert Schumann', cat='Kinderszenen op. 15 Nr. 5', keyde='D-Dur', lvl=3, bpm=72, after='5.5',
         why='Die Melodie wandert zwischen den Stimmen hin und her, wie zwei Menschen, die sich etwas zurufen. Zufriedene, warme Musik.',
         focus=['Melodie in der jeweils führenden Stimme hervorheben', 'Mehrere Stimmen in einer Hand ruhig halten', 'Pedal sparsam, damit es klar bleibt'],
         src=DCML + '. Eine Vorschlagsnote ist hier nicht dargestellt.', q='Kinderszenen Op.15'),
    dict(id='begebenheit', f='dcml/schumann_kinderszenen__n06', title='Wichtige Begebenheit', composer='Robert Schumann', cat='Kinderszenen op. 15 Nr. 6', keyde='A-Dur', lvl=3, bpm=96, after='5.3',
         why='Laut, stolz und ein bisschen übertrieben – so, wie Kinder etwas „Wichtiges“ verkünden. Kräftige Akkorde in beiden Händen.',
         focus=['Volle Akkorde mit Gewicht aus dem Arm, nicht hart', 'Punktierte Rhythmen markant', 'Mittelteil kontrastierend leiser'],
         src=DCML + '.', q='Kinderszenen Op.15'),
    dict(id='steckenpferd', f='dcml/schumann_kinderszenen__n09', title='Ritter vom Steckenpferd', composer='Robert Schumann', cat='Kinderszenen op. 15 Nr. 9', keyde='C-Dur', lvl=3, bpm=132, after='5.2',
         why='Ein galoppierender Ritt mit verschobenen Akzenten: Die Betonung sitzt oft auf dem letzten Schlag. Schnell, kurz, rhythmisch.',
         focus=['Synkopen-Akzente genau zählen', 'Staccato federnd', 'Gleichmäßiges Tempo trotz Akzenten'],
         src=DCML + '.', q='Kinderszenen Op.15'),
    dict(id='arietta', f='dcml/grieg_lyric_pieces__op12n01', title='Arietta', composer='Edvard Grieg', cat='Lyrische Stücke op. 12 Nr. 1', keyde='Es-Dur', lvl=3, bpm=60, after='5.6',
         why='Das erste der 66 Lyrischen Stücke: eine kurze, zarte Melodie über fließender Begleitung. Grieg zitiert sie Jahrzehnte später im allerletzten Stück („Erinnerungen“) – das findest du hier auch.',
         focus=['Begleitung in Sechzehnteln sehr leise und gleichmäßig', 'Melodie mit dem fünften Finger tragen', 'Pedal pro Harmonie'],
         src=DCML + '. Vier Vorschlagsnoten sind hier nicht dargestellt.', q='Lyric Pieces Op.12 Grieg', ok_bad=True),  # Schlusstakt geprüft: alle Töne gegen notes.tsv vollständig
    dict(id='volksweise', f='dcml/grieg_lyric_pieces__op38n02', title='Volksweise', composer='Edvard Grieg', cat='Lyrische Stücke op. 38 Nr. 2', keyde='G-Dur', lvl=3, bpm=88, after='6.2',
         why='Eine norwegisch gefärbte Melodie im Dreiertakt, schlicht harmonisiert. Gut, um Wiederholungszeichen und Phrasen über mehrere Takte zu üben.',
         focus=['Melodie wie gesungen phrasieren', 'Begleitakkorde leicht', 'Wiederholungen und Schluss genau lesen'],
         src=DCML + '.', q='Lyric Pieces Op.38 Grieg'),
    dict(id='prelude-9', f='kern/chopin-preludes__prelude28-09', title='Prélude E-Dur', composer='Frédéric Chopin', cat='op. 28 Nr. 9 · Largo', keyde='E-Dur', lvl=3, bpm=36, after='5.4',
         why='Zwölf Takte, feierlich wie ein Choral: volle Akkorde, punktierte Melodie, tiefe Oktaven. Ein großer Klang auf kleinem Raum.',
         focus=['Langsam: Largo heißt wirklich breit', 'Punktierte Rhythmen in der Melodie gegen die Triolen der Begleitung genau', 'Bassoktaven tief und satt'],
         src=SAPP + '.', q='Preludes Op.28 Chopin'),
    # ---------------- Stufe 4 ----------------
    dict(id='invention2', f='ly/bach-invention-02', title='Invention Nr. 2 c-Moll', composer='Johann Sebastian Bach', cat='BWV 773', keyde='c-Moll', lvl=4, bpm=72, after='6.3',
         why='Hier spielt Bach einen strengen Kanon: Die linke Hand wiederholt die rechte genau, nur zwei Takte später. Zwei gleichwertige Stimmen hören lernen – die Grundlage für alles Polyphone.',
         focus=['Jede Hand einzeln, bis sie allein „singt“', 'Den Kanon hören: links kommt dasselbe wie rechts', 'Verzierungen langsam ausüben'],
         src='Mutopia Project nach der Bach-Gesellschaft-Ausgabe, gemeinfrei.', q='Inventions BWV 772-786'),
    dict(id='invention4', f='ly/bach-invention-04', title='Invention Nr. 4 d-Moll', composer='Johann Sebastian Bach', cat='BWV 775', keyde='d-Moll', lvl=4, bpm=60, after='6.3',
         why='Schnelle Sechzehntel im 3/8-Takt, ein Motiv, das sich durch beide Hände jagt. Energisch und sehr beliebt im Unterricht.',
         focus=['Im Takt in Einer-Schlägen denken (ein Schlag pro Takt)', 'Lange Sechzehntelketten ohne Beschleunigen', 'Trillerfinger entspannt'],
         src='Mutopia Project, gemeinfrei.', q='Inventions BWV 772-786'),
    dict(id='invention10', f='ly/bach-invention-10', title='Invention Nr. 10 G-Dur', composer='Johann Sebastian Bach', cat='BWV 781', keyde='G-Dur', lvl=4, bpm=60, after='6.4',
         why='Gebrochene Akkorde im 9/8-Takt, die wie ein Gigue-Tanz springen. Fröhlich und gut, um Sprünge zwischen Lagen zu sichern.',
         focus=['Drei Schläge pro Takt', 'Sprünge vorher anschauen, dann blind treffen', 'Leicht und tänzerisch'],
         src='Mutopia Project nach der Bach-Gesellschaft-Ausgabe, gemeinfrei.', q='Inventions BWV 772-786'),
    dict(id='invention13', f='ly/bach-invention-13', title='Invention Nr. 13 a-Moll', composer='Johann Sebastian Bach', cat='BWV 784', keyde='a-Moll', lvl=4, bpm=66, after='6.3',
         why='Gebrochene Akkorde in Sechzehnteln, darunter eine klare Basslinie – fast schon romantisch im Klang. Eine der meistgespielten Inventionen.',
         focus=['Basslinie als eigene Melodie hören', 'Harmonien erkennen: Quintfallsequenzen', 'Gleichmäßige Sechzehntel ohne Pedal'],
         src='Mutopia Project nach der Bach-Gesellschaft-Ausgabe, gemeinfrei.', q='Inventions BWV 772-786'),
    dict(id='scarlatti-k146', f='kern/scarlatti-keyboard-sonatas__L349K146', title='Sonate G-Dur K. 146', composer='Domenico Scarlatti', cat='L. 349 · Allegretto', keyde='G-Dur', lvl=4, bpm=72, after='6.6',
         why='Scarlatti schrieb 555 einsätzige Sonaten für Cembalo, viele davon für die spanische Königin Maria Barbara. Diese hier funkelt mit Trillern und schnellen Läufen – Hofmusik pur.',
         focus=['Verzierungen (Pralltriller) leicht und schnell', 'Zweiteilige Form: jede Hälfte wird wiederholt', 'Ohne oder mit sehr wenig Pedal – klar wie ein Cembalo'],
         src=SAPP + ', nach der Longo-Ausgabe (Ricordi 1906–1913). Zwei Vorschlagsnoten sind hier nicht dargestellt.', q='Keyboard Sonata in G major, K.146 Scarlatti'),
    dict(id='scarlatti-k408', f='kern/scarlatti-keyboard-sonatas__L346K408', title='Sonate h-Moll K. 408', composer='Domenico Scarlatti', cat='L. 346 · Allegro', keyde='h-Moll', lvl=4, bpm=104, after='6.6',
         why='Ein drängendes Moll-Stück im Alla-breve mit dem spanischen Einschlag, den Scarlatti am Hof in Madrid aufnahm.',
         focus=['Alla breve: zwei Schläge pro Takt', 'Zweiteilige Form mit Wiederholungen', 'Klar und trocken, wenig Pedal'],
         src=SAPP + ', nach der Longo-Ausgabe (Ricordi 1906–1913). Zwei Vorschlagsnoten sind hier nicht dargestellt.', q='Keyboard Sonata in B minor, K.408 Scarlatti'),
    dict(id='scarlatti-k85', f='kern/scarlatti-keyboard-sonatas__L166K085', title='Sonate F-Dur K. 85', composer='Domenico Scarlatti', cat='L. 166 · (Allegro)', keyde='F-Dur', lvl=4, bpm=100, after='6.6',
         why='Ein lebhaftes Stück mit Laufwerk in beiden Händen. Gut, um Fingersätze für Läufe selbst zu finden.',
         focus=['Fingersatz für jeden Lauf festlegen und eintragen', 'Hände abwechselnd führend', 'Gleichmäßig, ohne zu eilen'],
         src=SAPP + ', nach der Longo-Ausgabe (Ricordi 1906–1913).', q='Keyboard Sonata in F major, K.85 Scarlatti'),
    dict(id='scarlatti-k60', f='kern/scarlatti-keyboard-sonatas__L013K060', title='Sonate g-Moll K. 60', composer='Domenico Scarlatti', cat='L. 13 · Allegretto', keyde='g-Moll', lvl=4, bpm=108, after='6.6',
         why='Ein melancholisches Stück im Dreiertakt, eher Tanz als Etüde. Weniger bekannt, aber genau die Art Musik, die in Kostümfilmen durch Ballsäle klingt.',
         focus=['Dreiertakt tänzerisch', 'Moll-Färbung hören: Fis als Leitton', 'Phrasen in Vier-Takt-Gruppen'],
         src=SAPP + ', nach der Longo-Ausgabe (Ricordi 1906–1913).', q='Keyboard Sonata in G minor, K.60 Scarlatti'),
    dict(id='haydn-51-finale', f='kern/haydn-piano-sonatas__sonata61-2', title='Sonate D-Dur Hob. XVI:51, Finale', composer='Joseph Haydn', cat='Finale: Presto', keyde='D-Dur', lvl=4, bpm=200, after='6.2',
         why='Haydn mit Humor: ein schneller Kehraus im Dreiertakt, voller Überraschungen. Spaß zu spielen, sobald die Finger sitzen.',
         focus=['Ein Schlag pro Takt fühlen', 'Pausen exakt halten', 'Erst langsam sicher, dann presto'],
         src=SAPP + ', nach der Universal Edition (1901).', q='Piano Sonata Hob.XVI:51 Haydn'),
    dict(id='haydn-27-finale', f='kern/haydn-piano-sonatas__sonata42-3', title='Sonate G-Dur Hob. XVI:27, Finale', composer='Joseph Haydn', cat='Finale: Presto', keyde='G-Dur', lvl=4, bpm=132, after='6.2',
         why='Ein heiteres Thema, das immer wiederkehrt und dazwischen verändert wird. Klassik in ihrer klarsten, freundlichsten Form.',
         focus=['Auftakt leicht', 'Wiederkehrendes Thema jedes Mal erkennen', 'Linke Hand nie lauter als die Melodie'],
         src=SAPP + ', nach der Universal Edition (1901). Drei Vorschlagsnoten sind hier nicht dargestellt.', q='Piano Sonata Hob.XVI:27 Haydn'),
    dict(id='op14-1-2', f='kern/beethoven-piano-sonatas__sonata09-2', title='Sonate op. 14 Nr. 1, 2. Satz', composer='Ludwig van Beethoven', cat='Allegretto', keyde='e-Moll', lvl=4, bpm=120, after='6.2',
         why='Ein leiser, etwas geheimnisvoller Tanzsatz in Moll mit einem warmen Dur-Mittelteil. Beethoven, bevor er stürmisch wird.',
         focus=['Dreiertakt fließend, nicht schwer', 'Trio (Mittelteil) als Kontrast gestalten', 'Wiederholungen beachten'],
         src=SAPP + '.', q='Piano Sonata No.9 Op.14 No.1 Beethoven'),
    dict(id='op14-2-2', f='kern/beethoven-piano-sonatas__sonata10-2', title='Sonate op. 14 Nr. 2, 2. Satz', composer='Ludwig van Beethoven', cat='Andante (Variationen)', keyde='C-Dur', lvl=4, bpm=88, after='6.3',
         why='Ein marschartiges Thema mit drei Variationen. Du lernst, wie aus demselben Gerüst ganz unterschiedliche Musik entsteht.',
         focus=['Thema staccato und gleichmäßig', 'In jeder Variation zuerst das Thema wiederfinden', 'Mehrere Stimmen in einer Hand ruhig halten'],
         src=SAPP + '. Zwei Vorschlagsnoten sind hier nicht dargestellt.', q='Piano Sonata No.10 Op.14 No.2 Beethoven'),
    dict(id='op28-2', f='kern/beethoven-piano-sonatas__sonata15-2', title='Sonate op. 28 „Pastorale“, 2. Satz', composer='Ludwig van Beethoven', cat='Andante', keyde='d-Moll', lvl=4, bpm=60, after='6.3',
         why='Ein schreitender Satz in Moll: links gleichmäßige Staccato-Bässe, rechts eine ernste Melodie. Ruhig, aber voller Spannung.',
         focus=['Bass staccato wie Schritte, Melodie legato', 'Zwei Anschlagsarten gleichzeitig – getrennt üben', 'Mittelteil in Dur leichter'],
         src=SAPP + '.', q='Piano Sonata No.15 Op.28 Beethoven'),
    dict(id='op31-3-menuett', f='kern/beethoven-piano-sonatas__sonata18-3', title='Sonate op. 31 Nr. 3, Menuetto', composer='Ludwig van Beethoven', cat='Menuetto: Moderato e grazioso', keyde='Es-Dur', lvl=4, bpm=120, after='7.2',
         why='Eines der schönsten Menuette Beethovens: weit gespannte Melodie, warme Harmonien. Das Trio mit seinen Akkordsprüngen ist eine kleine Mutprobe.',
         focus=['Melodie gesanglich über ganze Phrasen', 'Trio: Sprünge vorbereiten, Hand früh bewegen', 'Grazioso: nichts hart anschlagen'],
         src=SAPP + '.', q='Piano Sonata No.18 Op.31 No.3 Beethoven'),
    dict(id='walzer-69-2', f='kern/humdrum-chopin-first-editions__069-1-MEIf-002', title='Walzer h-Moll op. 69 Nr. 2', composer='Frédéric Chopin', cat='Moderato (komponiert 1829, posthum veröffentlicht)', keyde='h-Moll', lvl=4, bpm=132, after='6.5',
         why='Ein melancholischer Walzer, den Chopin mit 19 schrieb – Salonmusik mit Tränen. Links das typische Walzermuster, rechts eine singende Linie.',
         focus=['Linke Hand: Bass auf 1, Akkorde auf 2 und 3 leicht', 'Melodie mit Rubato, Begleitung im Takt', 'Dur-Teil heller und freier'],
         src=NIFC + '.', q='Waltzes Op.69 Chopin'),
    dict(id='mazurka-67-4', f='kern/chopin-mazurkas__mazurka67-4', title='Mazurka a-Moll op. 67 Nr. 4', composer='Frédéric Chopin', cat='Allegretto (posthum)', keyde='a-Moll', lvl=4, bpm=132, after='6.6',
         why='Eine wehmütige Mazurka mit ganz eigenem Schwung. Kurz genug, um sie wirklich gut zu lernen – und eine der bekanntesten.',
         focus=['Mazurka-Akzente auf 2 und 3', 'Verzierungen ins Tempo einbauen', 'A-Dur-Mittelteil als Lichtblick'],
         src=SAPP + '. Zwei Vorschlagsnoten sind hier nicht dargestellt.', q='Mazurkas Op.67 Chopin'),
    dict(id='mazurka-68-4', f='kern/chopin-mazurkas__mazurka68-4', title='Mazurka f-Moll op. 68 Nr. 4', composer='Frédéric Chopin', cat='Andantino (posthum)', keyde='f-Moll', lvl=4, bpm=112, after='7.3',
         why='Sie gilt als Chopins letzte Komposition, aus Skizzen rekonstruiert. Chromatische, fast schwebende Harmonien – Romantik am Rand der Auflösung.',
         focus=['Chromatische Linien langsam und bewusst lesen', 'Viele Versetzungszeichen: Takt für Takt', 'Leise, nach innen gekehrt'],
         src=SAPP + '. Eine Vorschlagsnote ist hier nicht dargestellt.', q='Mazurkas Op.68 Chopin'),
    dict(id='fuerchtenmachen', f='dcml/schumann_kinderszenen__n11', title='Fürchtenmachen', composer='Robert Schumann', cat='Kinderszenen op. 15 Nr. 11', keyde='G-Dur', lvl=4, bpm=88, after='6.3',
         why='Eine harmlose Melodie, die immer wieder von plötzlichen schnellen Schreckmomenten unterbrochen wird. Kontraste von Tempo und Charakter auf kleinstem Raum.',
         focus=['Wechsel zwischen ruhig und schnell ohne Zögern', 'Chromatische Mittelstimmen sauber', 'Die schnellen Stellen zuerst einzeln'],
         src=DCML + '.', q='Kinderszenen Op.15'),
    dict(id='april', f='dcml/tchaikovsky_seasons__op37a04', title='April – Schneeglöckchen', composer='Pjotr Iljitsch Tschaikowsky', cat='Die Jahreszeiten op. 37a Nr. 4', keyde='B-Dur', lvl=4, bpm=88, after='7.3',
         why='Tschaikowsky schrieb für jeden Monat ein Stück, für eine Zeitschrift. Der April ist ein zartes, helles Frühlingsstück im 6/8-Takt.',
         focus=['6/8 in zwei Schlägen wiegen', 'Melodie über den Begleitfiguren', 'Pedal pro Takt, bei Harmoniewechsel öfter'],
         src=DCML + '.', q='The Seasons Op.37a Tchaikovsky'),
    dict(id='juli', f='dcml/tchaikovsky_seasons__op37a07', title='Juli – Lied des Schnitters', composer='Pjotr Iljitsch Tschaikowsky', cat='Die Jahreszeiten op. 37a Nr. 7', keyde='Es-Dur', lvl=4, bpm=104, after='7.3',
         why='Ein kräftiges Arbeitslied mit vollen Akkorden. Russisch gefärbte Melodie, klarer Rhythmus.',
         focus=['Akkorde satt, aber nicht hart', 'Melodie in der Oberstimme der Akkorde führen', 'Gleichmäßiger Puls wie bei der Arbeit'],
         src=DCML + '.', q='The Seasons Op.37a Tchaikovsky'),
    dict(id='dankbarkeit', f='dcml/grieg_lyric_pieces__op62n02', title='Dankbarkeit', composer='Edvard Grieg', cat='Lyrische Stücke op. 62 Nr. 2', keyde='G-Dur', lvl=4, bpm=72, after='7.3',
         why='Eine warme Melodie über reichen Harmonien – Grieg in seiner innigsten Form. Viele Stimmen, aber ruhiges Tempo.',
         focus=['Melodie aus den Akkorden herausholen', 'Pedal genau mit den Harmonien', 'Spannungsbögen über acht Takte'],
         src=DCML + '.', q='Lyric Pieces Op.62 Grieg'),
    dict(id='erinnerungen', f='dcml/grieg_lyric_pieces__op71n07', title='Erinnerungen', composer='Edvard Grieg', cat='Lyrische Stücke op. 71 Nr. 7', keyde='Es-Dur', lvl=4, bpm=120, after='7.3',
         why='Das allerletzte Lyrische Stück: Grieg nimmt die Melodie der Arietta vom Anfang und macht daraus einen Walzer. Spiel beide nacheinander – du hörst 34 Jahre Komponistenleben.',
         focus=['Arietta-Melodie wiedererkennen', 'Walzerbegleitung leicht', 'Schluss verklingen lassen'],
         src=DCML + '.', q='Lyric Pieces Op.71 Grieg'),
    dict(id='little-shepherd', f='dcml/debussy_childrens_corner__l113-05_childrens_little', title='The Little Shepherd', composer='Claude Debussy', cat="Children's Corner Nr. 5 (1908)", keyde='A-Dur', lvl=4, bpm=60, after='7.4',
         why="Debussy schrieb Children's Corner für seine Tochter. Der kleine Hirte spielt eine freie, flötenartige Melodie – Pausen und Stille sind hier genauso wichtig wie Töne.",
         focus=['Freie Rhythmen genau zählen, dann natürlich klingen lassen', 'Fermaten und Pausen aushalten', 'Pianissimo-Klangfarben suchen'],
         src=DCML + '. Vier Vorschlagsnoten sind hier nicht dargestellt.', q="Children's Corner Debussy"),
    # ---------------- Stufe 5 ----------------
    dict(id='prelude-3', f='kern/chopin-preludes__prelude28-03', title='Prélude G-Dur', composer='Frédéric Chopin', cat='op. 28 Nr. 3 · Vivace', keyde='G-Dur', lvl=5, bpm=132, after='8.1',
         why='Die linke Hand läuft in schnellen Sechzehnteln wie ein Bach, rechts schwebt eine leichte Melodie darüber. Ein Stück für eine flinke linke Hand.',
         focus=['Linke Hand allein bis zur Mühelosigkeit', 'Rechte Hand leicht und spät eingesetzt', 'Sehr leise Läufe, nicht verwischen'],
         src=SAPP + '. Zwei Vorschlagsnoten sind hier nicht dargestellt.', q='Preludes Op.28 Chopin'),
    dict(id='prelude-14', f='kern/chopin-preludes__prelude28-14', title='Prélude es-Moll', composer='Frédéric Chopin', cat='op. 28 Nr. 14 · Allegro', keyde='es-Moll', lvl=5, bpm=150, after='8.1',
         why='Beide Hände im Unisono, eine Oktave auseinander, in dunklen Triolenwellen. Kurz und stürmisch.',
         focus=['Sechs Be-Vorzeichen vorher sicher', 'Hände exakt zusammen', 'Crescendo-Wellen gestalten'],
         src=SAPP + '.', q='Preludes Op.28 Chopin'),
    dict(id='prelude-19', f='kern/chopin-preludes__prelude28-19', title='Prélude Es-Dur', composer='Frédéric Chopin', cat='op. 28 Nr. 19 · Vivace', keyde='Es-Dur', lvl=5, bpm=150, after='8.2',
         why='Weite Sprünge in beiden Händen, leicht und schimmernd. Klingt mühelos, wenn man es kann – ein schönes Ziel für sichere Hände.',
         focus=['Sprünge mit der Hand vorausdenken', 'Melodie aus den oberen Tönen herausfiltern', 'Locker bleiben, Tempo langsam steigern'],
         src=SAPP + '.', q='Preludes Op.28 Chopin'),
    dict(id='mazurka-63-3', f='kern/chopin-mazurkas__mazurka63-3', title='Mazurka cis-Moll op. 63 Nr. 3', composer='Frédéric Chopin', cat='Allegretto', keyde='cis-Moll', lvl=5, bpm=126, after='8.1',
         why='Eine späte Mazurka mit einem kleinen Wunder am Ende: Die Melodie erscheint als Kanon zwischen den Händen. Elegant und traurig zugleich.',
         focus=['Kanon am Schluss: beide Stimmen gleich wichtig', 'Mazurka-Rhythmus fein, nicht derb', 'Vier Kreuze plus Versetzungszeichen genau'],
         src=SAPP + '.', q='Mazurkas Op.63 Chopin'),
    dict(id='appassionata-2', f='kern/beethoven-piano-sonatas__sonata23-2', title='Appassionata, 2. Satz', composer='Ludwig van Beethoven', cat='Sonate f-Moll op. 57 · Andante con moto', keyde='Des-Dur', lvl=5, bpm=60, after='8.1',
         why='Ein ruhiges, choralartiges Thema in tiefer Lage, dann drei Variationen, die immer bewegter werden. Die Ruhe zwischen zwei Stürmen.',
         focus=['Thema in tiefer Lage warm und dicht', 'Jede Variation schneller in den Notenwerten, nicht im Tempo', 'Übergang zum Finale (verminderte Akkorde) bewusst'],
         src=SAPP + '.', q='Piano Sonata No.23 Op.57 Beethoven'),
    dict(id='therese', f='kern/beethoven-piano-sonatas__sonata24-1', title='Sonate op. 78 „à Thérèse“, 1. Satz', composer='Ludwig van Beethoven', cat='Adagio cantabile – Allegro ma non troppo', keyde='Fis-Dur', lvl=5, bpm=120, after='8.1',
         why='Sechs Kreuze, aber ein sehr liebevoller Satz: Beethoven schätzte diese kleine Sonate selbst besonders. Gewidmet Therese von Brunsvik.',
         focus=['Vorzeichnung Fis-Dur sicher lesen (Eis!)', 'Kantable Einleitung sehr gesanglich', 'Allegro leicht, mit klaren Phrasen'],
         src=SAPP + '.', q='Piano Sonata No.24 Op.78 Beethoven'),
    dict(id='kv457-1', f='kern/mozart-piano-sonatas__sonata14-1', title='Sonate c-Moll KV 457, 1. Satz', composer='Wolfgang Amadeus Mozart', cat='Allegro', keyde='c-Moll', lvl=5, bpm=160, after='8.1',
         why='Mozart von seiner dramatischen Seite: harte Unisono-Aufschläge, dann zarte Antworten. Eine Sonate, die schon nach Beethoven klingt.',
         focus=['Kontrast forte/piano scharf', 'Sonatenform verfolgen: Exposition, Durchführung, Reprise', 'Läufe gleichmäßig'],
         src=SAPP + '. Zwei Vorschlagsnoten sind hier nicht dargestellt.', q='Piano Sonata No.14 K.457 Mozart'),
    dict(id='kv576-3', f='kern/mozart-piano-sonatas__sonata17-3', title='Sonate D-Dur KV 576, Finale', composer='Wolfgang Amadeus Mozart', cat='Allegretto (1789)', keyde='D-Dur', lvl=5, bpm=104, after='8.2',
         why='Aus Mozarts letzter Klaviersonate: ein heiteres Rondo, in dem plötzlich kontrapunktische Fäden auftauchen. Brillant und sehr klassisch.',
         focus=['Triolen und Sechzehntel sauber unterscheiden', 'Rondo-Thema bei jeder Wiederkehr erkennen', 'Leichtes Handgelenk'],
         src=SAPP + '.', q='Piano Sonata No.17 K.576 Mozart'),
    dict(id='juni', f='dcml/tchaikovsky_seasons__op37a06', title='Juni – Barcarole', composer='Pjotr Iljitsch Tschaikowsky', cat='Die Jahreszeiten op. 37a Nr. 6', keyde='g-Moll', lvl=5, bpm=76, after='8.3',
         why='Das bekannteste Stück der Jahreszeiten: ein Gondellied in Moll, wehmütig und filmreif. Der Mittelteil in Dur bringt plötzlich Bewegung.',
         focus=['Melodie in der Mitte der Hand singen lassen', 'Linke Hand wiegend, gleichmäßig', 'Dynamik in weiten Bögen'],
         src=DCML + '. Vier Vorschlagsnoten sind hier nicht dargestellt.', q='The Seasons Op.37a Tchaikovsky'),
    dict(id='dezember', f='dcml/tchaikovsky_seasons__op37a12', title='Dezember – Weihnachten', composer='Pjotr Iljitsch Tschaikowsky', cat='Die Jahreszeiten op. 37a Nr. 12', keyde='As-Dur', lvl=5, bpm=152, after='8.3',
         why='Ein eleganter Weihnachtswalzer, wie aus dem Nussknacker-Universum. Passt perfekt in die Winterzeit – und auf einen Ball.',
         focus=['Walzer: ein Schlag pro Takt fühlen', 'Begleitung leicht, Melodie tänzerisch', 'Übergänge zwischen den Teilen gestalten'],
         src=DCML + '.', q='The Seasons Op.37a Tchaikovsky'),
    dict(id='schmetterling', f='dcml/grieg_lyric_pieces__op43n01', title='Schmetterling', composer='Edvard Grieg', cat='Lyrische Stücke op. 43 Nr. 1', keyde='A-Dur', lvl=5, bpm=72, after='8.3',
         why='Flatternde chromatische Läufe, die nie stillstehen: Grieg malt einen Schmetterling. Leicht, schnell und fast schon impressionistisch.',
         focus=['Chromatische Läufe mit festem Fingersatz', 'Sehr leicht, fast ohne Gewicht', 'Pedal kurz, damit es nicht verschwimmt'],
         src=DCML + '.', q='Lyric Pieces Op.43 Grieg'),
    dict(id='elite', f='kern/joplin__elite', title='Elite Syncopations', composer='Scott Joplin', cat='Rag (1902)', keyde='F-Dur', lvl=5, bpm=88, after='8.4',
         why='Ein eleganter Rag mit vielen Synkopen und überraschenden Wendungen. Wenn dir The Entertainer gefällt, ist das der nächste Schritt.',
         focus=['Linke Hand: Bass-Akkord-Wechsel sicher', 'Synkopen rechts gegen den geraden Puls links', 'Nicht zu schnell – Joplin warnte ausdrücklich davor, Ragtime zu hetzen'],
         src=SAPP + '.', q='Elite Syncopations Joplin'),
    dict(id='weeping-willow', f='kern/joplin__weepingwillow', title='Weeping Willow', composer='Scott Joplin', cat='Rag (1903)', keyde='G-Dur', lvl=5, bpm=80, after='8.4',
         why='Ein ruhigerer, fast melancholischer Rag – die Trauerweide. Weniger bekannt, aber wunderschön.',
         focus=['Gelassenes Tempo', 'Sprünge der linken Hand sicher', 'Melodie über den Synkopen singen'],
         src=SAPP + '.', q='Weeping Willow Joplin'),
    dict(id='pastorale', f='dcml/liszt_pelerinage__160.03_Pastorale', title='Pastorale', composer='Franz Liszt', cat='Années de pèlerinage I (Suisse) Nr. 3', keyde='E-Dur', lvl=5, bpm=88, after='8.4',
         why='Ein kurzer, heller Hirtentanz aus Liszts Schweizer Reisetagebuch. Liszt ohne Donner: leicht, tänzerisch, im 12/8-Takt.',
         focus=['12/8: vier große Schläge', 'Leichte Akkordrepetitionen', 'Klangfarben wechseln zwischen den Abschnitten'],
         src=DCML + '.', q='Annees de pelerinage Liszt'),
    # ---------------- Stufe 6 ----------------
    dict(id='prelude-16', f='kern/chopin-preludes__prelude28-16', title='Prélude b-Moll', composer='Frédéric Chopin', cat='op. 28 Nr. 16 · Presto con fuoco', keyde='b-Moll', lvl=6, bpm=110, after='ch:VIII',
         why='Eines der schwersten Préludes: rasende Sechzehntel rechts über einem stampfenden Bass. Ein Ziel für die ferne Zukunft – mitlesen lohnt sich aber schon jetzt.',
         focus=['Abschnittweise, extrem langsam', 'Fingersatz vollständig eintragen', 'Tempo erst ganz am Schluss'],
         src=SAPP + '. Eine Vorschlagsnote ist hier nicht dargestellt.', q='Preludes Op.28 Chopin'),
    dict(id='prelude-24', f='kern/chopin-preludes__prelude28-24', title='Prélude d-Moll', composer='Frédéric Chopin', cat='op. 28 Nr. 24 · Allegro appassionato', keyde='d-Moll', lvl=6, bpm=120, after='ch:VIII',
         why='Das letzte Prélude: weite Bassfiguren links, leidenschaftliche Melodie rechts, am Ende drei tiefe Schläge. Großes Drama.',
         focus=['Linke Hand allein über weite Strecken', 'Läufe rechts in Gruppen üben', 'Kraft aus dem Arm, nicht aus den Fingern'],
         src=SAPP + '.', q='Preludes Op.28 Chopin'),
    dict(id='sturm-3', f='kern/beethoven-piano-sonatas__sonata17-3', title='Sturm-Sonate, 3. Satz', composer='Ludwig van Beethoven', cat='Sonate d-Moll op. 31 Nr. 2 · Allegretto', keyde='d-Moll', lvl=6, bpm=116, after='ch:VIII',
         why='Ein unaufhörlicher Strom aus Sechzehnteln, wie ein galoppierendes Pferd im Wind. Hypnotisch, filmisch – und eine echte Ausdauerprobe.',
         focus=['Gleichmäßige Bewegung ohne Ermüdung', 'Melodie aus dem Fluss heraushören', 'In großen Abschnitten denken'],
         src=SAPP + '.', q='Piano Sonata No.17 Op.31 No.2 Beethoven'),
    dict(id='appassionata-3', f='kern/beethoven-piano-sonatas__sonata23-3', title='Appassionata, 3. Satz', composer='Ludwig van Beethoven', cat='Sonate f-Moll op. 57 · Allegro ma non troppo', keyde='f-Moll', lvl=6, bpm=144, after='ch:VIII',
         why='Eines der wildesten Finales der Klavierliteratur, mit einer Presto-Coda am Schluss. Konzertrepertoire – dein großes Fernziel neben Interstellar.',
         focus=['Wirbelnde Sechzehntel locker halten', 'Coda erst ganz zum Schluss im Tempo', 'Kraft dosieren: ff ist kein Schlagen'],
         src=SAPP + '.', q='Piano Sonata No.23 Op.57 Beethoven'),
    dict(id='debussy-prelude', f='dcml/debussy_suite_bergamasque__l075-01_suite_prelude', title='Prélude aus der Suite bergamasque', composer='Claude Debussy', cat='Suite bergamasque Nr. 1', keyde='F-Dur', lvl=6, bpm=84, after='ch:VIII',
         why='Der Eröffnungssatz der Suite, deren dritter Satz Clair de lune ist. Prächtige Akkorde, fließende Läufe, alte Tanzformen in neuen Farben.',
         focus=['Freies Tempo (Rubato) erst nach sicherem Takt', 'Akkordflächen mit Pedal schichten', 'Läufe leicht wie Wellen'],
         src=DCML + '. Vier Vorschlagsnoten sind hier nicht dargestellt.', q='Suite bergamasque Debussy'),
    dict(id='au-bord', f='dcml/liszt_pelerinage__160.04_Au_Bord_dUne_Source', title="Au bord d'une source", composer='Franz Liszt', cat='Années de pèlerinage I (Suisse) Nr. 4', keyde='As-Dur', lvl=6, bpm=60, after='ch:VIII',
         why='Liszt malt eine plätschernde Quelle: perlende Figuren in der rechten Hand, darüber und darunter eine Melodie. Virtuos, aber zart – Wasser auf dem Klavier.',
         focus=['Perlende Figuren sehr leicht', 'Melodie mit dem Daumen bzw. fünften Finger hervorheben', 'Wechselnde Schlüssel links genau lesen'],
         src=DCML + '.', q='Annees de pelerinage Liszt'),
]


def play_order(meas):
    """Wiedergabe-Reihenfolge aus Wiederholungszeichen (|: … :|) und Volten."""
    n = len(meas); order = []; i = 0; start = 0; done = set(); passno = {}
    while i < n and len(order) < 4 * n:
        m = meas[i]
        if m.get('begin') == '|:': start = i
        v = m.get('volta'); p = passno.get(start, 1)
        if v and int(v[0]) != p: i += 1; continue
        order.append(i)
        if m.get('end') == ':|' and i not in done:
            if p < 2: passno[start] = 2; done.add(i); i = start; continue
            start = i + 1
        i += 1
    return order


def main():
    order_file = os.path.join(DST, '_reihenfolge.json')
    order = json.load(open(order_file, encoding='utf-8'))
    for e in P:
        raw = json.load(open(os.path.join(OUT, e['f'] + '.json'), encoding='utf-8'))
        if raw.get('bad') and not e.get('ok_bad'): sys.exit(f"{e['id']}: fehlerhafte Takte {raw['bad']}")
        ms = raw['measures']
        for m in ms:
            for k in ('r2', 'l2'):
                if k in m and not m[k]: del m[k]
        od = raw.get('order') or list(range(len(ms)))
        if e['f'].startswith('ly/'): od = play_order(ms)        # ly2nw verdoppelt Wiederholungen
        p = {'title': e['title'], 'composer': e['composer'], 'cat': e['cat'], 'keyde': e['keyde'], 'lvl': e['lvl'], 'bpm': e['bpm'],
             'after': e['after'], 'why': e['why'], 'focus': e['focus'], 'src': e['src'], 'links': [imslp(e['q'])], 'id': e['id'],
             'key': raw.get('key') or 'C', 'time': raw.get('time') or 'C', 'pickup': float(raw.get('pickup') or 0), 'measures': ms, 'order': od}
        if raw.get('clefInit'): p['clefInit'] = raw['clefInit']
        json.dump(p, open(os.path.join(DST, e['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        if e['id'] not in order: order.append(e['id'])
    json.dump(order, open(order_file, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(P), 'Stücke geschrieben,', len(order), 'insgesamt')


if __name__ == '__main__':
    main()
