/* ===== Notenweg 3 · Lernpfad Teil A: Hilfen + Kapitel I–II ===== */
const F = (() => {
  const toMidi = x => typeof x === 'number' ? x : MU.parsePitch(x).midi;
  const s = (m, o = {}) => {
    const st = o.grand ? ['treble', 'bass'] : [o.clef === 'bass' ? 'bass' : 'treble'];
    const measures = Array.isArray(m) ? m : [{ [o.clef === 'bass' ? 'l' : 'r']: m }];
    return { kind: 'score', spec: Object.assign({ staves: st, key: o.key || 'C', time: o.time === undefined ? null : o.time, measures, names: o.names || false, final: o.final !== false, numbers: !!o.numbers, justifyLast: o.justify !== false, clefInit: o.clefInit }, o.spec || {}), play: o.play !== false, bpm: o.bpm || 80, s: o.s || 11, cap: o.cap, kbd: o.kbd || null, countIn: !!o.countIn, metro: !!o.metro, speed: !!o.speed, loopable: !!o.loop, voiced: !!o.voiced };
  };
  const k = (from, to, marks = {}, o = {}) => { const mm = {}; Object.entries(marks).forEach(([key, v]) => { mm[toMidi(key)] = typeof v === 'string' ? { cls: v } : v; }); return { kind: 'kbd', from: toMidi(from), to: toMidi(to), marks: mm, labels: o.labels || 'none', spans: (o.spans || []).map(x => ({ a: toMidi(x[0]), b: toMidi(x[1]), t: x[2] })), cap: o.cap, w: o.w || 640 }; };
  const fin = (list, cls = 'hl') => { const o = {}; list.forEach(([n, f, lab]) => { o[n] = { cls, fin: f, lab }; }); return o; };
  const html = (h, cap) => ({ kind: 'html', html: h, cap });
  const merk = t => `<div class="merk">${t}</div>`;
  const warn = t => `<div class="warn">${t}</div>`;
  return { s, k, fin, html, merk, warn };
})();

/* Hände mit Fingernummern (SVG) */
const HANDS_SVG = (() => {
  const hand = (x, mirror, label) => {
    const fingers = [[-34, 30, 26, 'Daumen'], [-17, 8, 40], [0, 2, 46], [17, 8, 41], [32, 20, 32]];
    let s = `<g transform="translate(${x},0) scale(${mirror ? -1 : 1},1)">`;
    s += `<path d="M-40 70 Q-44 120 -20 150 L22 150 Q44 120 42 72 Z" fill="var(--gold-soft)" stroke="var(--gold)" stroke-width="1.5"/>`;
    fingers.forEach(([fx, fy, len], i) => { const w = i === 0 ? 15 : 13; const top = 70 - len - fy + (i === 0 ? 34 : 0); s += `<rect x="${fx - w / 2}" y="${top}" width="${w}" height="${len + (i === 0 ? 10 : 6)}" rx="${w / 2}" fill="var(--paper)" stroke="var(--gold)" stroke-width="1.5" transform="${i === 0 ? `rotate(-28 ${fx} ${top + len})` : ''}"/>`; });
    s += `</g>`;
    fingers.forEach(([fx, fy, len], i) => { const top = 70 - len - fy + (i === 0 ? 34 : 0); const cx = x + (mirror ? -fx : fx) + (i === 0 ? (mirror ? 10 : -10) : 0); s += `<text x="${cx}" y="${top + 16}" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="700" font-size="17" fill="var(--gold-lo)">${i + 1}</text>`; });
    s += `<text x="${x}" y="176" text-anchor="middle" font-family="EB Garamond, serif" font-size="14" fill="currentColor">${label}</text>`;
    return s;
  };
  return `<svg viewBox="0 0 360 186" style="max-width:420px;width:100%;display:block;margin:auto;color:var(--ink)" role="img" aria-label="Linke und rechte Hand mit Fingernummern 1 bis 5">${hand(95, true, 'linke Hand')}${hand(265, false, 'rechte Hand')}</svg>`;
})();

const CUR = { chapters: [], folios: [], gloss: [], pools: {} };

/* =========================================================================
   KAPITEL I · Das Fundament
   ========================================================================= */
CUR.chapters.push({
  id: 'I', title: 'Das Fundament', sub: 'Tastatur, Hand, Notenwerte, beide Schlüssel – lesen statt nachahmen.', img: 'ancher',
  warm: ['Schultern kreisen, Arme ausschütteln, Hände 10 Sekunden locker hängen lassen.', 'Rechts Fünftonlage C (c¹–g¹): c–d–e–f–g–f–e–d–c, langsam und gebunden, 3×.', 'Links Fünftonlage C (c–g, Finger 5 auf c): dasselbe, 3×.', 'Jeder Finger viermal auf derselben Taste – die anderen Finger bleiben ruhig liegen.'],
  must: ['lesestuecke'], more: [],
  exam: { n: 18, pass: 0.85, items: [['keyName', { black: true }, 2], ['accName', {}, 2], ['halfWhole', {}, 1], ['enharm', {}, 1], ['noteValue', { set: ['w', 'h', 'q'] }, 1], ['measureFill', { set: ['w', 'h', 'q'] }, 2], ['noteName', { clef: 'treble', range: ['C4', 'G5'] }, 3], ['noteName', { clef: 'bass', range: ['F2', 'C4'] }, 3], ['noteKey', { clef: 'treble' }, 1], ['stepSkip', {}, 1], ['ivSize', { max: 5 }, 1], ['finger', {}, 1], ['pool', { id: 'grund' }, 2]] },
  lessons: [
    {
      id: '1.1', title: 'Die Tastatur verstehen', sub: 'Schwarze Gruppen, Stammtöne, das mittlere C.', min: 25,
      goals: ['jede weiße Taste blind über die schwarzen Gruppen finden', 'die sieben Stammtöne c d e f g a h benennen – und wissen, warum es in Deutschland „h“ heißt', 'das mittlere C (c¹) finden und Oktaven benennen'],
      steps: [
        { t: 'read', h: '88 Tasten – aber nur ein Muster', body: `<p>Ein Klavier hat 88 Tasten: 52 weiße und 36 schwarze. Das wirkt viel, ist aber nur <b>ein einziges Muster aus 12 Tasten</b>, das sich immer wiederholt – sieben weiße und fünf schwarze.</p><p>Die schwarzen Tasten liegen nie einzeln, sondern immer in <b>Zweiergruppen und Dreiergruppen</b>, abwechselnd. Diese Gruppen sind deine Landkarte: Du findest jede Taste, ohne zu zählen, nur durch ihre Lage zu einer Gruppe.</p>[[0]]<p>Probier es mit den Augen: In dem Bild sind zwei Wiederholungen des Musters zu sehen. Zähle die Gruppen: 2 – 3 – 2 – 3.</p>`, figs: [F.k('C3', 'B4', {}, { spans: [['C#3', 'D#3', '2er'], ['F#3', 'A#3', '3er'], ['C#4', 'D#4', '2er'], ['F#4', 'A#4', '3er']], cap: 'Zwei Oktaven: Zweier- und Dreiergruppen der schwarzen Tasten wechseln sich ab.' })] },
        { t: 'read', h: 'Die sieben Stammtöne', body: `<p>Die weißen Tasten heißen <b>Stammtöne</b>: <b>c d e f g a h</b> – danach beginnt es wieder mit c. Merke dir zwei Anker:</p><ul><li><b>C</b> liegt direkt <b>links neben der Zweiergruppe</b>.</li><li><b>F</b> liegt direkt <b>links neben der Dreiergruppe</b>.</li></ul><p>Alles andere ergibt sich: D liegt <i>zwischen</i> den zwei schwarzen Tasten, E rechts daneben. G und A liegen in der Dreiergruppe, H ganz rechts davon.</p>[[0]]${F.merk('<b>Wichtig für Deutschland:</b> Was international „B“ heißt, nennen wir <b>H</b>. Unser „B“ ist die schwarze Taste links neben dem H (international B♭). In englischen Noten und Akkordsymbolen steht also B, wo wir H sagen. Das lernst du in Lektion 1.3 genauer.')}`, figs: [F.k('C4', 'B4', { C4: { cls: 'hl', lab: 'c' }, D4: { lab: 'd' }, E4: { lab: 'e' }, F4: { cls: 'hl2', lab: 'f' }, G4: { lab: 'g' }, A4: { lab: 'a' }, B4: { lab: 'h' } }, { cap: 'Eine Oktave: c (links neben der Zweiergruppe) und f (links neben der Dreiergruppe) sind deine Anker.' })] },
        { t: 'ex', h: 'Übung: Tasten finden', gen: 'keyFind', o: { from: 48, to: 83 }, n: 10, need: 8, body: '<p>Tippe auf die genannte Taste – egal in welcher Oktave. Orientier dich an den schwarzen Gruppen, nicht am Zählen.</p>' },
        { t: 'read', h: 'Das mittlere C und die Oktaven', body: `<p>Weil sich das Muster wiederholt, gibt es jedes C mehrmals. Damit klar ist, welches gemeint ist, haben die Oktaven Namen. Der wichtigste Ton ist das <b>mittlere C</b>, ungefähr in der Mitte der Tastatur, meist unter dem Markennamen. Es heißt <b>c¹</b> („eingestrichenes c“), international <b>C4</b>.</p>[[0]]<ul><li>Von c¹ aufwärts bis h¹ ist die <b>eingestrichene Oktave</b>, darüber c² (zweigestrichen), c³ …</li><li>Darunter liegt die <b>kleine Oktave</b> (c bis h, kleine Buchstaben ohne Strich), dann die <b>große Oktave</b> (C bis H, Großbuchstaben), dann die Kontra-Oktave (C₁).</li></ul>${F.merk('<b>Faustregel:</b> Kleinbuchstabe mit Strichen = hoch, Großbuchstabe = tief. In vielen Apps und Videos siehst du die internationale Schreibweise: C4 = c¹, C5 = c², C3 = c, C2 = C.')}`, figs: [F.k('C2', 'C7', { C2: { cls: 'hl2', lab: 'C' }, C3: { cls: 'hl2', lab: 'c' }, C4: { cls: 'hl', lab: 'c¹' }, C5: { cls: 'hl2', lab: 'c²' }, C6: { cls: 'hl2', lab: 'c³' }, C7: { cls: 'hl2', lab: 'c⁴' } }, { cap: 'Alle C von der großen bis zur viergestrichenen Oktave. c¹ ist das mittlere C.', w: 720 })] },
        { t: 'ex', h: 'Übung: Welche Oktave?', gen: 'octName', o: { cOnly: true }, n: 6, need: 5 },
        { t: 'read', h: 'Hoch und tief hören', body: `<p>Rechts klingt es höher, links tiefer. Physikalisch schwingt die Saite schneller, je höher der Ton. Der Stimmton <b>a¹</b> schwingt 440-mal pro Sekunde; das a² eine Oktave darüber genau doppelt so schnell (880). Deshalb klingen Oktaven so „gleich“: Sie passen perfekt ineinander.</p><p>Hör dir die drei C an: c, c¹ und c². Gleicher Name, gleiche „Farbe“, nur höher.</p>[[0]]`, figs: [F.s([{ r: 'x/h C4/h', l: 'C3/h x/h' }, { r: 'C5/w', l: 'x/w' }], { grand: true, names: 'all', cap: 'c – c¹ – c²: zum Anhören auf ▶︎ tippen. Jede Note kannst du auch einzeln antippen.' })] },
        { t: 'piano', h: 'Am Klavier: Orientierung', body: '<p>Jetzt an dein Instrument. Spiel mit dem dritten Finger, locker aus dem Arm.</p>', checks: ['Alle C von ganz links nach ganz rechts gespielt und laut benannt (C₁, C, c, c¹ …).', 'Alle F gefunden und gespielt.', 'Von c¹ aufwärts c–d–e–f–g–a–h–c² gespielt und jede Taste laut benannt.', 'Augen zu: Ein C nur durch Ertasten der Zweiergruppe gefunden – dreimal.'] },
        { t: 'ex', h: 'Übung: Wie heißt die Taste?', gen: 'keyName', o: { from: 48, to: 83 }, n: 8, need: 7 },
        { t: 'test', h: 'Abschlusstest', gens: [['keyFind', { from: 48, to: 83 }, 3], ['keyName', { from: 48, to: 83 }, 3], ['octName', { cOnly: true }, 2], ['pool', { id: 'tastatur' }, 2]], pass: 0.8, body: '<p>10 Aufgaben. Ab 80 % bestanden – und jede falsche Antwort reparierst du mit einer neuen, ähnlichen Aufgabe.</p>' }
      ],
      review: [['keyFind', { from: 48, to: 83 }], ['keyName', { from: 48, to: 83 }], ['octName', { cOnly: true }], ['pool', { id: 'tastatur' }]]
    },
    {
      id: '1.2', title: 'Sitzen, Hand und Finger', sub: 'Haltung, Fingernummern, Fünftonlage, legato.', min: 25,
      goals: ['richtig sitzen – Höhe, Abstand, Gewicht', 'die Fingernummern beider Hände sicher kennen', 'in der Fünftonlage C gebunden (legato) spielen'],
      steps: [
        { t: 'read', h: 'Die Sitzposition', body: `<p>Gute Haltung ist kein Benimm, sondern Technik: Sie entscheidet, ob Kraft aus dem ganzen Arm kommt oder nur aus verkrampften Fingern.</p><ul><li><b>Höhe:</b> Wenn die Finger auf den Tasten liegen, sind die <b>Unterarme etwa waagerecht</b> und die Ellbogen auf Tastenhöhe oder knapp darüber. Zu tief = Handgelenke knicken, zu hoch = Schultern ziehen hoch.</li><li><b>Abstand:</b> So weit weg, dass die Ellbogen <b>leicht vor dem Körper</b> sind und frei schwingen können. Die Arme sollen nie am Körper kleben.</li><li><b>Sitzfläche:</b> nur auf der vorderen Hälfte der Bank. Füße flach auf dem Boden, der rechte etwas vor (Pedal).</li><li><b>Mitte:</b> Dein Körper sitzt vor c¹ – so erreichst du beide Enden.</li><li><b>Rücken:</b> aufrecht, aber nicht steif. Leicht nach vorne geneigt, als würdest du dem Klavier zuhören.</li></ul>${F.warn('<b>Gesund bleiben:</b> Schmerz, Ziehen oder Taubheit sind ein Stopp-Signal – nie durchspielen. Lieber 3 × 20 Minuten als einmal 60 Minuten.')}` },
        { t: 'read', h: 'Die Hand', body: `<p>Stell dir vor, du hältst einen Apfel locker in der Hand. Diese <b>runde Form</b> ist die Grundstellung:</p><ul><li><b>Finger gebogen</b>, du spielst mit den <b>Fingerkuppen</b> (nicht mit flachen Fingern, nicht mit den Nägeln).</li><li><b>Daumen</b> spielt mit der <b>Außenkante</b>, nicht flach.</li><li><b>Handgelenk</b> locker, etwa auf Höhe der Tasten – nicht abknicken, nicht anheben.</li><li>Der Ton entsteht durch <b>Gewicht</b>: Der Arm „hängt“ an der Fingerkuppe, statt dass die Finger drücken. Teste es: Lass den entspannten Arm auf den dritten Finger fallen und fange ihn auf der Taste ab – das ist ein runder, voller Ton ohne Kraft.</li></ul>` },
        { t: 'read', h: 'Die Fingernummern', body: `<p>In Noten stehen kleine Zahlen über oder unter den Noten. Das ist der <b>Fingersatz</b>. In <b>beiden</b> Händen gilt: Daumen = 1, Zeigefinger = 2, Mittelfinger = 3, Ringfinger = 4, kleiner Finger = 5.</p>[[0]]<p>Ein guter Fingersatz ist halbe Arbeit: Er sorgt dafür, dass du jede Stelle jedes Mal gleich spielst. Darum gilt ab heute: <b>Fingersatz einmal festlegen, dann nie wieder ändern.</b></p>`, figs: [F.html(HANDS_SVG, 'Beide Hände sind gleich nummeriert: vom Daumen (1) nach außen bis zum kleinen Finger (5).')] },
        { t: 'ex', h: 'Übung: Fingernummern', gen: 'finger', n: 6, need: 5 },
        { t: 'read', h: 'Die Fünftonlage', body: `<p>Legst du fünf Finger auf fünf benachbarte weiße Tasten, entsteht eine <b>Fünftonlage</b> (Lage = feste Handposition). In ihr kannst du spielen, ohne die Hand zu bewegen – deshalb beginnen fast alle ersten Stücke hier.</p><p><b>C-Lage rechts:</b> Daumen (1) auf c¹, dann 2 auf d¹, 3 auf e¹, 4 auf f¹, 5 auf g¹.<br><b>C-Lage links:</b> kleiner Finger (5) auf c, 4 auf d, 3 auf e, 2 auf f, Daumen (1) auf g. Links ist alles gespiegelt: Der Daumen zeigt immer zur Mitte.</p>[[0]][[1]]`, figs: [F.k('C4', 'B4', F.fin([['C4', 1], ['D4', 2], ['E4', 3], ['F4', 4], ['G4', 5]]), { cap: 'Rechte Hand, C-Lage: 1 auf c¹.' }), F.k('C3', 'B3', F.fin([['C3', 5], ['D3', 4], ['E3', 3], ['F3', 2], ['G3', 1]], 'hl2'), { cap: 'Linke Hand, C-Lage: 5 auf c, 1 auf g.' })] },
        { t: 'read', h: 'Legato – gebunden spielen', body: `<p><b>Legato</b> (italienisch „gebunden“) heißt: Die Töne gehen nahtlos ineinander über – ohne Lücke und ohne Überlappung. Der Trick: Die nächste Taste geht <b>genau in dem Moment</b> runter, in dem die vorige hochkommt. Wie Gehen: Ein Fuß ist immer am Boden, aber nie beide lange.</p><p>Hör genau hin: Entsteht eine Mini-Pause zwischen zwei Tönen? Dann war der Finger zu früh oben. Klingen zwei Töne kurz gleichzeitig? Dann zu spät.</p>[[0]]`, figs: [F.s('C4/q!f1!( D4/q!f2 E4/q!f3 F4/q!f4 G4/q!f5 F4/q E4/q D4/q C4/w!)', { time: 'C', cap: 'Die Fünftonlage auf- und abwärts, legato (der Bogen über den Noten heißt: gebunden).', bpm: 72 })] },
        { t: 'piano', h: 'Am Klavier: Erste Töne', body: '<p>Langsam, locker, mit Gewicht. Hör dir selbst zu.</p>', checks: ['Höhe und Abstand eingestellt: Unterarme waagerecht, Ellbogen frei.', 'Gewichtsübung: Arm 5× locker auf den 3. Finger fallen lassen und abfangen.', 'Rechts C-Lage: c–d–e–f–g–f–e–d–c legato, 3× ohne Lücke.', 'Links C-Lage: dasselbe, 3×.', 'Jeder Finger 4× auf seiner Taste, während die anderen ruhig liegen bleiben (beide Hände).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['finger', {}, 4], ['pool', { id: 'haltung' }, 6]], pass: 0.8 }
      ],
      review: [['finger', {}], ['pool', { id: 'haltung' }]]
    },
    {
      id: '1.3', title: 'Halbton, Ganzton, schwarze Tasten', sub: '♯, ♭, ♮ und die deutschen Tonnamen.', min: 30,
      goals: ['Halbton- und Ganztonschritte auf der Tastatur erkennen', 'Töne mit ♯ und ♭ richtig benennen – inklusive der Sonderfälle es, as, b', 'erklären, warum ein Ton zwei Namen haben kann'],
      steps: [
        { t: 'read', h: 'Der kleinste Schritt: der Halbton', body: `<p>Von einer Taste zur <b>direkt benachbarten</b> Taste – egal ob weiß oder schwarz – ist es ein <b>Halbton</b>. Zwei Halbtöne ergeben einen <b>Ganzton</b>. Eine Oktave hat 12 Halbtöne.</p>[[0]]<p>Zwischen den meisten weißen Tasten liegt eine schwarze – dort ist der Abstand ein Ganzton (c–d, d–e, f–g, g–a, a–h). Aber an zwei Stellen fehlt die schwarze Taste: <b>e–f</b> und <b>h–c</b>. Dort liegen zwei weiße Tasten nur einen Halbton auseinander.</p>${F.merk('<b>Merksatz:</b> e–f und h–c sind die natürlichen Halbtöne. Das ist der Grund für das ganze Zweier-Dreier-Muster.')}`, figs: [F.k('C4', 'C5', { E4: 'hl', F4: 'hl', B4: 'hl2', C5: 'hl2' }, { spans: [['C4', 'D4', 'Ganzton'], ['E4', 'F4', 'Halbton'], ['B4', 'C5', 'Halbton']], cap: 'Ganzton c–d (eine schwarze Taste dazwischen), Halbton e–f und h–c (keine dazwischen).' })] },
        { t: 'ex', h: 'Übung: Halbton oder Ganzton?', gen: 'halfWhole', o: {}, n: 8, need: 7 },
        { t: 'read', h: 'Kreuz, B und Auflösungszeichen', body: `<p>Drei Zeichen verändern Töne:</p><ul><li><b>♯ (Kreuz)</b> erhöht um einen Halbton. Im Namen wird <b>-is</b> angehängt: c → <b>cis</b>, f → <b>fis</b>, g → <b>gis</b>.</li><li><b>♭ (B)</b> erniedrigt um einen Halbton. Im Namen wird <b>-es</b> angehängt: d → <b>des</b>, g → <b>ges</b>.</li><li><b>♮ (Auflösungszeichen)</b> hebt ♯ oder ♭ auf – der Stammton gilt wieder.</li></ul><p>Drei Sonderfälle, weil es sonst komisch klingt:</p><ul><li>e + ♭ = <b>es</b> (nicht „ees“)</li><li>a + ♭ = <b>as</b> (nicht „aes“)</li><li>h + ♭ = <b>b</b> (nicht „hes“) – daher hat das deutsche „b“ seinen Namen.</li></ul>[[0]]`, figs: [F.k('C4', 'B4', { 'C#4': { cls: 'hl', lab: 'cis' }, 'D#4': { cls: 'hl', lab: 'es' }, 'F#4': { cls: 'hl', lab: 'fis' }, 'G#4': { cls: 'hl', lab: 'as' }, 'A#4': { cls: 'hl', lab: 'b' } }, { cap: 'Jede schwarze Taste hat zwei Namen, hier je einer: cis (= des), es (= dis), fis (= ges), as (= gis), b (= ais).' })] },
        { t: 'ex', h: 'Übung: Namen mit ♯ und ♭', gen: 'accName', o: {}, n: 8, need: 7 },
        { t: 'read', h: 'Ein Ton, zwei Namen', body: `<p>Die schwarze Taste zwischen c und d ist <b>cis</b> (c erhöht) – und gleichzeitig <b>des</b> (d erniedrigt). Gleiche Taste, gleicher Klang, zwei Namen. Das nennt man <b>enharmonische Verwechslung</b>.</p><p>Auch weiße Tasten können andere Namen haben: <b>eis</b> = f, <b>his</b> = c, <b>fes</b> = e, <b>ces</b> = h. Das kommt in Stücken mit vielen Vorzeichen vor – zum Beispiel in deiner Mondscheinsonate (cis-Moll), wo „his“ eine wichtige Rolle spielt.</p><p>Warum nicht einfach immer denselben Namen? Weil der Name verrät, <i>woher</i> der Ton kommt und wohin er will. In welcher Tonart welcher Name richtig ist, lernst du in Kapitel III.</p>` },
        { t: 'ex', h: 'Übung: Enharmonik', gen: 'enharm', o: { special: true }, n: 6, need: 5 },
        { t: 'ex', h: 'Übung: Alle Tasten benennen', gen: 'keyName', o: { from: 48, to: 83, black: true }, n: 10, need: 8 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel mit dem 3. Finger und sprich jeden Ton laut aus.</p>', checks: ['Chromatisch (jede Taste) von c¹ bis c² aufwärts gespielt und jede benannt: c, cis, d, dis, e, f, fis, g, gis, a, ais, h, c.', 'Abwärts mit ♭-Namen: c, h, b, a, as, g, ges, f, e, es, d, des, c.', 'Alle fis auf der Tastatur gefunden.', 'Die Ganztonleiter c–d–e–fis–gis–ais–c gespielt und angehört (klingt schwebend, wie Traum-Musik im Film).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['halfWhole', {}, 3], ['accName', {}, 3], ['enharm', { special: true }, 2], ['keyName', { from: 48, to: 83, black: true }, 2], ['keyFind', { from: 48, to: 83, black: true }, 2]], pass: 0.8 }
      ],
      review: [['halfWhole', {}], ['accName', {}], ['enharm', {}], ['keyName', { from: 48, to: 83, black: true }]]
    },
    {
      id: '1.4', title: 'Puls, Takt und Notenwerte', sub: 'Ganze, Halbe, Viertel – zählen und klopfen.', min: 30,
      goals: ['ganze, halbe und Viertelnoten erkennen und richtig lang spielen', 'einen 4/4-Takt füllen und laut zählen', 'einen Rhythmus nach Noten klopfen'],
      steps: [
        { t: 'read', h: 'Puls und Rhythmus', body: `<p>Musik läuft auf einem gleichmäßigen <b>Puls</b> – wie ein Herzschlag oder Schritte beim Gehen. Die <b>Notenwerte</b> sagen, wie viele Pulsschläge ein Ton dauert. Der <b>Rhythmus</b> ist das Muster aus langen und kurzen Tönen über diesem Puls.</p><p>Der wichtigste Satz dieser Lektion: <b>Der Puls hält nie an.</b> Auch wenn du einen langen Ton spielst oder eine schwierige Stelle kommt – der Puls läuft weiter. Darum zählst du ab heute laut mit.</p>` },
        { t: 'read', h: 'Ganze, Halbe, Viertel', body: `<p>Die Grundeinheit ist meistens die <b>Viertelnote</b> = ein Schlag.</p><ul><li><b>Viertelnote</b>: ausgefüllter Kopf mit Hals – <b>1 Schlag</b>.</li><li><b>Halbe Note</b>: hohler Kopf mit Hals – <b>2 Schläge</b>.</li><li><b>Ganze Note</b>: hohler Kopf ohne Hals – <b>4 Schläge</b>.</li></ul>[[0]]<p>Ob der Hals nach oben oder unten zeigt, ist egal für die Dauer. Er zeigt nach unten, wenn die Note in der oberen Hälfte des Systems steht – einfach, damit es ordentlich aussieht.</p>`, figs: [F.s([{ r: 'B4/w!t=1_2_3_4' }, { r: 'B4/h!t=1_2 B4/h!t=3_4' }, { r: 'B4/q!t=1 B4/q!t=2 B4/q!t=3 B4/q!t=4' }], { time: 'C', cap: 'Ganze (4 Schläge) – zwei Halbe (je 2) – vier Viertel (je 1). Unter den Noten: gezählt wird immer im Puls.', bpm: 76, metro: true })] },
        { t: 'ex', h: 'Übung: Wie lang ist die Note?', gen: 'noteValue', o: { set: ['w', 'h', 'q'] }, n: 6, need: 5 },
        { t: 'read', h: 'Der Takt', body: `<p>Damit man sich nicht verzählt, werden die Schläge in <b>Takte</b> gruppiert. Die senkrechten Linien heißen <b>Taktstriche</b>. Ein Doppelstrich mit dickem Strich (𝄂) beendet das Stück.</p><p>Am Anfang steht die <b>Taktangabe</b>: <b>4/4</b> bedeutet „vier Viertel pro Takt“. Statt 4/4 steht oft ein großes <b>C</b> (für „common time“). Jeder 4/4-Takt muss zusammen genau 4 Schläge ergeben.</p>[[0]]<p>Der <b>erste Schlag</b> jedes Takts ist der Schwerpunkt („EINS“), der dritte leicht betont: <b>EINS</b> zwei <b>drei</b> vier.</p>`, figs: [F.s([{ r: 'C4/h D4/h' }, { r: 'E4/q F4/q G4/h' }, { r: 'G4/q F4/q E4/q D4/q' }, { r: 'C4/w', end: '|.' }], { time: 'C', cap: 'Vier Takte im 4/4-Takt. Zähl mit: 1-2-3-4 | 1-2-3-4 …', bpm: 80, metro: true })] },
        { t: 'ex', h: 'Übung: Was fehlt im Takt?', gen: 'measureFill', o: { time: '4/4', set: ['w', 'h', 'q'] }, n: 6, need: 5 },
        { t: 'read', h: 'Zählen beim Spielen', body: `<p>So zählst du richtig: Jeder Schlag bekommt seine Zahl, auch wenn gerade kein neuer Ton kommt. Bei einer halben Note sagst du „eins – zwei“ und hältst dabei die Taste. Bei einer ganzen „eins – zwei – drei – vier“.</p><ul><li>Zähle <b>laut</b>. Leise im Kopf zählen klappt erst, wenn es laut sicher sitzt.</li><li>Nimm das <b>Metronom</b> als Puls. Es ist kein Feind, sondern der Dirigent, der nie müde wird.</li><li>Typischer Anfängerfehler: lange Noten zu kurz halten. Der nächste Ton kommt erst auf seine Zahl.</li></ul>` },
        { t: 'ex', h: 'Übung: Klopfen', gen: 'tap', o: { set: ['w', 'h', 'q'], bars: 2, bpm: 72 }, n: 4, need: 3, body: '<p>Tippe auf „Start“. Das Metronom zählt einen Takt vor, dann klopfst du bei jeder Note einmal auf die große Fläche. Halte lange Noten aus, indem du einfach wartest.</p>' },
        { t: 'ex', h: 'Übung: Rhythmus hören', gen: 'rhythmHear', o: { set: ['w', 'h', 'q'] }, n: 4, need: 3 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Metronom auf 72. Spiel auf c¹ (rechts, Finger 1 oder 3).</p>[[0]]', figs: [F.s([{ r: 'C4/q C4/q C4/h' }, { r: 'C4/h C4/q C4/q' }, { r: 'C4/q C4/q C4/q C4/q' }, { r: 'C4/w', end: '|.' }], { time: 'C', bpm: 72, metro: true, cap: 'Rhythmusübung auf einem Ton.' })], checks: ['Mit Metronom gespielt und laut gezählt – ohne den Puls zu verlieren.', 'Dieselbe Übung geklatscht, dann gespielt.', 'Die Übung aus der Lektion „Der Takt“ (c–d–e–f–g) mit Zählen gespielt.'], metro: true },
        { t: 'test', h: 'Abschlusstest', gens: [['noteValue', { set: ['w', 'h', 'q'] }, 3], ['measureFill', { time: '4/4', set: ['w', 'h', 'q'] }, 3], ['rhythmHear', { set: ['w', 'h', 'q'] }, 2], ['pool', { id: 'rhythmus1' }, 2]], pass: 0.8 }
      ],
      review: [['noteValue', { set: ['w', 'h', 'q'] }], ['measureFill', { time: '4/4', set: ['w', 'h', 'q'] }], ['rhythmHear', { set: ['w', 'h', 'q'] }]]
    },
    {
      id: '1.5', title: 'Das Notensystem und der Violinschlüssel', sub: 'Linien, Zwischenräume und vier Anker.', min: 35,
      goals: ['jede Note von c¹ bis g² im Violinschlüssel sofort benennen', 'Noten über Ankertöne statt über Abzählen lesen', 'eine Note aus den Noten direkt auf der richtigen Taste finden'],
      steps: [
        { t: 'read', h: 'Fünf Linien', body: `<p>Noten stehen auf einem <b>Notensystem</b> aus fünf Linien. Gezählt wird <b>von unten nach oben</b>: unterste Linie = 1. Linie, oberste = 5. Linie. Dazwischen liegen vier <b>Zwischenräume</b>.</p><p>Eine Note sitzt entweder <b>auf einer Linie</b> (die Linie geht durch den Kopf) oder <b>in einem Zwischenraum</b>. Je höher sie steht, desto höher der Ton. Von einer Linie zum nächsten Zwischenraum ist es genau ein Stammton weiter (c → d → e …).</p><p>Reicht das System nicht, bekommen Noten kleine Extra-Linien: <b>Hilfslinien</b>.</p>[[0]]`, figs: [F.s('E4/q G4/q B4/q D5/q F5/q', { cap: 'Noten auf den fünf Linien, von unten nach oben.', names: false, play: true })] },
        { t: 'read', h: 'Der Violinschlüssel', body: `<p>Erst der <b>Schlüssel</b> am Anfang verrät, welcher Ton auf welcher Linie liegt. Der <b>Violinschlüssel</b> ist ein verschnörkeltes G: Seine Spirale kreist um die <b>2. Linie</b> – dort liegt <b>g¹</b>. Deshalb heißt er auch G-Schlüssel. Er gilt meist für die rechte Hand.</p>[[0]]<ul><li><b>Linien</b> von unten: e¹ – g¹ – h¹ – d² – f²</li><li><b>Zwischenräume</b> von unten: f¹ – a¹ – c² – e²</li><li>Unter dem System, auf der ersten Hilfslinie: <b>c¹</b> (das mittlere C).</li></ul>`, figs: [F.s('C4/q D4/q E4/q F4/q G4/q A4/q B4/q C5/q D5/q E5/q F5/q G5/q', { names: 'all', cap: 'Von c¹ bis g² – mit Namen. Tipp auf ▶︎ oder einzelne Noten.', bpm: 100 })] },
        { t: 'read', h: 'Vier Anker statt Abzählen', body: `<p>Profis zählen keine Linien ab. Sie kennen ein paar <b>Ankertöne</b> auswendig und lesen den Rest als „einen drüber, einen drunter“:</p><ul><li><b>c¹</b> – erste Hilfslinie unter dem System (Mitte der Tastatur).</li><li><b>g¹</b> – 2. Linie, um die sich der Schlüssel wickelt.</li><li><b>c²</b> – 3. Zwischenraum (eine Oktave über c¹).</li><li><b>g²</b> – direkt über der 5. Linie.</li></ul>[[0]]${F.merk('<b>So liest du ab heute:</b> Note sehen → nächsten Anker finden → Schritte zählen. Nach ein paar Tagen erkennst du die meisten Noten direkt, ohne Umweg. Genau dafür sind die Übungen da.')}`, figs: [F.s('C4/h!hl=hl G4/h!hl=hl C5/h!hl=hl G5/h!hl=hl', { names: 'all', cap: 'Die vier Anker im Violinschlüssel: c¹, g¹, c², g².' })] },
        { t: 'ex', h: 'Übung: c¹ bis g¹', gen: 'noteName', o: { clef: 'treble', range: ['C4', 'G4'] }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: bis c²', gen: 'noteName', o: { clef: 'treble', range: ['C4', 'C5'] }, n: 10, need: 8 },
        { t: 'ex', h: 'Übung: Note → Taste', gen: 'noteKey', o: { clef: 'treble', range: ['C4', 'C5'] }, n: 8, need: 6, body: '<p>Jetzt verbindest du Notenbild und Tastatur – genau das, was beim Spielen passiert.</p>' },
        { t: 'ex', h: 'Übung: der ganze Bereich', gen: 'noteName', o: { clef: 'treble', range: ['C4', 'G5'] }, n: 12, need: 10 },
        { t: 'piano', h: 'Am Klavier: Lesestück 1', body: '<p>Dein erstes Stück aus Noten – rechte Hand, C-Lage (Daumen auf c¹). Erst die Noten laut benennen, dann im Rhythmus sprechen, dann spielen.</p>[[0]]', figs: [F.s([{ r: 'C4/q!f1 D4/q E4/q F4/q' }, { r: 'G4/h!f5 G4/h' }, { r: 'F4/q!f4 E4/q D4/q E4/q' }, { r: 'C4/w!f1' }, { r: 'E4/q!f3 F4/q G4/q E4/q' }, { r: 'D4/h!f2 F4/h!f4' }, { r: 'E4/q!f3 D4/q C4/q D4/q' }, { r: 'C4/w!f1', end: '|.' }], { time: 'C', bpm: 72, metro: true, speed: true, cap: 'Lesestück 1 „Schritte“ (Notenweg). Fingersätze stehen über den Noten.' })], checks: ['Noten laut benannt (ohne Klavier).', 'Rhythmus laut gezählt und geklatscht.', 'Langsam gespielt, ohne anzuhalten – Fehler sind erlaubt, Stoppen nicht.', 'Zweiter Durchgang mit Metronom ♩ = 72.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['noteName', { clef: 'treble', range: ['C4', 'G5'] }, 6], ['noteKey', { clef: 'treble', range: ['C4', 'G5'] }, 3], ['pool', { id: 'system' }, 2]], pass: 0.85 }
      ],
      review: [['noteName', { clef: 'treble', range: ['C4', 'G5'] }], ['noteKey', { clef: 'treble', range: ['C4', 'G5'] }], ['pool', { id: 'system' }]]
    },
    {
      id: '1.6', title: 'Schritte und Sprünge', sub: 'Muster lesen statt Noten buchstabieren.', min: 30,
      goals: ['Schritte, Sprünge und Wiederholungen auf einen Blick sehen', 'Intervalle bis zur Quinte zählen', 'Melodien als Bewegung lesen – die Grundlage für schnelles Blattspiel'],
      steps: [
        { t: 'read', h: 'Die Form der Melodie', body: `<p>Schnelle Leser buchstabieren keine Noten. Sie sehen die <b>Bewegung</b>: Geht es hoch, runter, bleibt es gleich, ist es ein Schritt oder ein Sprung? Die erste Note bestimmst du über einen Anker, die nächsten liest du als Abstand.</p><ul><li><b>Wiederholung:</b> gleiche Höhe – gleiche Taste.</li><li><b>Schritt:</b> von einer Linie in den direkt benachbarten Zwischenraum (oder umgekehrt) – der Nachbarton.</li><li><b>Sprung:</b> von Linie zu Linie oder Zwischenraum zu Zwischenraum – mindestens eine Taste wird übersprungen.</li></ul>[[0]]`, figs: [F.s('E4/q E4/q F4/q G4/q G4/q E4/q C4/h', { time: 'C', cap: 'Wiederholung (e–e), Schritte (e–f–g), Wiederholung (g–g), Sprünge (g–e–c).', bpm: 80 })] },
        { t: 'ex', h: 'Übung: Schritt, Sprung, Wiederholung', gen: 'stepSkip', o: {}, n: 10, need: 8 },
        { t: 'read', h: 'Intervalle: Abstände mit Namen', body: `<p>Den Abstand zweier Töne nennt man <b>Intervall</b>. Gezählt wird mit lateinischen Ordnungszahlen – und zwar <b>beide Töne mitgezählt</b>:</p><table><tr><th>Abstand</th><th>Name</th><th>Notenbild</th></tr><tr><td>gleicher Ton</td><td>Prime</td><td>gleiche Stelle</td></tr><tr><td>c–d</td><td>Sekunde</td><td>Linie ↔ Zwischenraum</td></tr><tr><td>c–e</td><td>Terz</td><td>Linie → nächste Linie</td></tr><tr><td>c–f</td><td>Quarte</td><td>Linie → übernächster Zwischenraum</td></tr><tr><td>c–g</td><td>Quinte</td><td>Linie → übernächste Linie</td></tr></table><p>Ungerade Intervalle (Prime, Terz, Quinte) bleiben auf Linien <i>oder</i> in Zwischenräumen, gerade (Sekunde, Quarte) wechseln.</p>[[0]]`, figs: [F.s('C4/h D4/h C4/h E4/h C4/h F4/h C4/h G4/h', { cap: 'Sekunde, Terz, Quarte, Quinte – jeweils von c¹ aus.' })] },
        { t: 'ex', h: 'Übung: Intervalle bis zur Quinte', gen: 'ivSize', o: { max: 5 }, n: 10, need: 8 },
        { t: 'read', h: 'Hand und Intervall', body: `<p>In der Fünftonlage passen Intervalle perfekt zu den Fingern: Sekunde = Nachbarfinger, Terz = einen Finger überspringen (1–3), Quarte = 1–4, Quinte = 1–5. Wenn du eine Terz siehst, weiß deine Hand schon, welcher Finger dran ist – ohne den Tonnamen zu denken.</p><p>Genau so lesen Profis vom Blatt: <b>Anker → Intervall → Finger.</b></p>` },
        { t: 'piano', h: 'Am Klavier: Lesestücke 2 und 3', body: '<p>Erst die Bewegung ansagen („hoch, Sprung, runter …“), dann spielen.</p>[[0]][[1]]', figs: [F.s([{ r: 'C4/q!f1 E4/q!f3 G4/q!f5 E4/q' }, { r: 'F4/q!f4 D4/q!f2 E4/h!f3' }, { r: 'G4/q!f5 E4/q C4/q E4/q' }, { r: 'D4/w!f2' }, { r: 'C4/q!f1 E4/q G4/q E4/q' }, { r: 'F4/q D4/q G4/h' }, { r: 'E4/q!f3 D4/q F4/q D4/q' }, { r: 'C4/w!f1', end: '|.' }], { time: 'C', bpm: 72, metro: true, speed: true, cap: 'Lesestück 2 „Terzen“ (Notenweg).' }), F.s([{ r: 'G4/q!f5 F4/q E4/q D4/q' }, { r: 'C4/h!f1 E4/h!f3' }, { r: 'D4/q!f2 F4/q E4/q G4/q' }, { r: 'C4/w!f1' }, { r: 'E4/h!f3 G4/h!f5' }, { r: 'F4/q!f4 D4/q C4/q D4/q' }, { r: 'E4/h!f3 D4/h!f2' }, { r: 'C4/w!f1', end: '|.' }], { time: 'C', bpm: 72, metro: true, speed: true, cap: 'Lesestück 3 „Abwärts“ (Notenweg).' })], checks: ['Lesestück 2: Bewegung angesagt, dann ohne Anhalten gespielt.', 'Lesestück 3: dasselbe.', 'Beide mit Metronom ♩ = 72.'] },
        { t: 'sight', h: 'Blattspiel', lv: 1, body: '<p>Jetzt drei Melodien, die du noch nie gesehen hast. 30 Sekunden ansehen (Anfangston, Bewegung), dann einmal ohne Anhalten spielen. Danach anhören und vergleichen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['stepSkip', {}, 4], ['ivSize', { max: 5 }, 4], ['noteName', { clef: 'treble', range: ['C4', 'G5'] }, 2]], pass: 0.8 }
      ],
      review: [['stepSkip', {}], ['ivSize', { max: 5 }]]
    },
    {
      id: '1.7', title: 'Der Bassschlüssel', sub: 'Die linke Hand bekommt ihre eigene Landkarte.', min: 35,
      goals: ['jede Note von F bis c¹ im Bassschlüssel benennen', 'die Anker des Bassschlüssels kennen', 'mit der linken Hand aus Noten spielen'],
      steps: [
        { t: 'read', h: 'Der F-Schlüssel', body: `<p>Für tiefe Töne – meist die linke Hand – gibt es den <b>Bassschlüssel</b>. Er ist ein verschnörkeltes F: Seine zwei Punkte umschließen die <b>4. Linie</b>. Dort liegt das <b>kleine f</b>. Darum heißt er auch F-Schlüssel.</p>[[0]]<ul><li><b>Linien</b> von unten: G – H – d – f – a</li><li><b>Zwischenräume</b> von unten: A – c – e – g</li><li>Über dem System, auf der ersten Hilfslinie: <b>c¹</b> – dasselbe mittlere C wie unter dem Violinschlüssel!</li></ul>${F.warn('<b>Achtung, Falle:</b> Gleiche Stelle, anderer Ton. Die unterste Linie ist im Violinschlüssel e¹, im Bassschlüssel aber G. Lerne den Bassschlüssel als eigene Landkarte mit eigenen Ankern – nicht als „umgerechneten“ Violinschlüssel.')}`, figs: [F.s('G2/q A2/q B2/q C3/q D3/q E3/q F3/q G3/q A3/q B3/q C4/q', { clef: 'bass', names: 'all', cap: 'Von G bis c¹ im Bassschlüssel – mit Namen.', bpm: 100 })] },
        { t: 'read', h: 'Die Anker im Bass', body: `<ul><li><b>f</b> – 4. Linie, zwischen den Punkten des Schlüssels.</li><li><b>c</b> – 2. Zwischenraum (das „kleine c“, eine Oktave unter c¹).</li><li><b>G</b> – unterste Linie.</li><li><b>c¹</b> – erste Hilfslinie oben.</li><li><b>C</b> (großes C) – zweite Hilfslinie unten.</li></ul>[[0]]<p>Die C-Lage der linken Hand (c bis g) liegt bequem im System: c im 2. Zwischenraum, g im 4. Zwischenraum.</p>`, figs: [F.s('C2/h!hl=hl G2/h!hl=hl C3/h!hl=hl F3/h!hl=hl C4/h!hl=hl', { clef: 'bass', names: 'all', cap: 'Anker im Bassschlüssel: C, G, c, f, c¹.' })] },
        { t: 'ex', h: 'Übung: die C-Lage links (c–g)', gen: 'noteName', o: { clef: 'bass', range: ['C3', 'G3'] }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: F bis c¹', gen: 'noteName', o: { clef: 'bass', range: ['F2', 'C4'] }, n: 12, need: 10 },
        { t: 'ex', h: 'Übung: Note → Taste (links)', gen: 'noteKey', o: { clef: 'bass', range: ['F2', 'C4'] }, n: 8, need: 6 },
        { t: 'piano', h: 'Am Klavier: Lesestück 4 (linke Hand)', body: '<p>Linke Hand in der C-Lage: kleiner Finger (5) auf c, Daumen (1) auf g.</p>[[0]]', figs: [F.s([{ l: 'C3/q!f5 D3/q E3/q F3/q' }, { l: 'G3/h!f1 E3/h!f3' }, { l: 'F3/q!f2 E3/q D3/q F3/q' }, { l: 'E3/w!f3' }, { l: 'G3/q!f1 F3/q E3/q D3/q' }, { l: 'C3/h!f5 E3/h!f3' }, { l: 'D3/q!f4 G3/q!f1 F3/q D3/q' }, { l: 'C3/w!f5', end: '|.' }], { clef: 'bass', time: 'C', bpm: 72, metro: true, speed: true, cap: 'Lesestück 4 „Links“ (Notenweg).' })], checks: ['Noten links laut benannt.', 'Langsam ohne Anhalten gespielt.', 'Mit Metronom ♩ = 72.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['noteName', { clef: 'bass', range: ['F2', 'C4'] }, 7], ['noteKey', { clef: 'bass', range: ['F2', 'C4'] }, 3], ['pool', { id: 'bass' }, 2]], pass: 0.85 }
      ],
      review: [['noteName', { clef: 'bass', range: ['F2', 'C4'] }], ['noteKey', { clef: 'bass', range: ['F2', 'C4'] }]]
    },
    {
      id: '1.8', title: 'Das Klaviersystem: beide Hände', sub: 'Akkolade, vertikal lesen, erstes Zusammenspiel.', min: 40,
      goals: ['beide Systeme gleichzeitig lesen', 'verstehen, welche Noten zusammen erklingen', 'ein kurzes Stück mit beiden Händen aus Noten spielen'],
      steps: [
        { t: 'read', h: 'Die Akkolade', body: `<p>Klaviernoten haben zwei Systeme, verbunden durch eine geschweifte Klammer – die <b>Akkolade</b>. Oben Violinschlüssel (meist rechte Hand), unten Bassschlüssel (meist linke Hand). Taktstriche gehen durch beide Systeme.</p><p>Das <b>c¹</b> liegt genau dazwischen: im oberen System auf der ersten Hilfslinie unten, im unteren auf der ersten Hilfslinie oben. Gleicher Ton, zwei Schreibweisen.</p>[[0]]`, figs: [F.s([{ r: 'C4/w', l: 'x/w' }, { r: 'x/w', l: 'C4/w' }], { grand: true, names: 'all', cap: 'Zweimal c¹: oben im Violin-, unten im Bassschlüssel.' })] },
        { t: 'read', h: 'Senkrecht lesen', body: `<p>Was <b>übereinander</b> steht, erklingt <b>gleichzeitig</b>. Was nebeneinander steht, nacheinander. Bei zwei Händen liest du deshalb in Spalten: oben und unten an derselben Stelle gehören zusammen.</p><p>Die Methode für jedes neue Stück mit zwei Händen:</p><ol><li><b>Rechts allein</b>, bis es fließt.</li><li><b>Links allein</b>, bis es fließt.</li><li><b>Zusammen ganz langsam</b>, Takt für Takt. Erst die Stellen, wo beide Hände gleichzeitig anschlagen, bewusst „einrasten“ lassen.</li></ol>${F.merk('Langsam genug ist, wenn du nicht anhalten musst. Das kann am Anfang sehr langsam sein – das ist richtig so.')}` },
        { t: 'mix', h: 'Übung: beide Systeme gemischt', gens: [['noteName', { clef: 'treble', range: ['C4', 'G5'], grand: true }], ['noteName', { clef: 'bass', range: ['F2', 'C4'], grand: true }]], n: 12, need: 10 },
        { t: 'piano', h: 'Am Klavier: Lesestück 5 (Frage und Antwort)', body: '<p>Die Hände wechseln sich ab – rechts fragt, links antwortet.</p>[[0]]', figs: [F.s([{ r: 'C4/q!f1 D4/q E4/q F4/q', l: 'x/w' }, { r: 'G4/w!f5', l: 'x/w' }, { r: 'x/w', l: 'G3/q!f1 F3/q E3/q D3/q' }, { r: 'x/w', l: 'C3/w!f5' }, { r: 'E4/q!f3 G4/q E4/q C4/q', l: 'x/w' }, { r: 'D4/w!f2', l: 'x/w' }, { r: 'x/w', l: 'E3/q!f3 G3/q!f1 F3/q D3/q' }, { r: 'x/w', l: 'C3/w!f5', end: '|.' }], { grand: true, time: 'C', bpm: 72, metro: true, speed: true, cap: 'Lesestück 5 (Notenweg): die Hände wechseln sich ab.' })], checks: ['Rechts allein, links allein, dann abwechselnd ohne Pause beim Wechsel.', 'Mit Metronom ♩ = 72.'] },
        { t: 'piano', h: 'Am Klavier: Lesestück 6 (gleichzeitig)', body: '<p>Jetzt spielen beide Hände gleichzeitig. Die linke Hand hält lange Töne, die rechte bewegt sich.</p>[[0]]', figs: [F.s([{ r: 'E4/q!f3 F4/q G4/q E4/q', l: 'C3/w!f5' }, { r: 'D4/q!f2 E4/q F4/q D4/q', l: 'G3/w!f1' }, { r: 'C4/q!f1 E4/q G4/q E4/q', l: 'C3/w' }, { r: 'D4/w!f2', l: 'G3/w' }, { r: 'E4/q!f3 F4/q G4/q E4/q', l: 'C3/h E3/h' }, { r: 'F4/q!f4 E4/q D4/q F4/q', l: 'F3/h!f2 D3/h!f4' }, { r: 'E4/h!f3 D4/h!f2', l: 'G3/h!f1 G3/h' }, { r: 'C4/w!f1', l: 'C3/w!f5', end: '|.' }], { grand: true, time: 'C', bpm: 66, metro: true, speed: true, cap: 'Lesestück 6 (Notenweg): beide Hände zusammen.' })], checks: ['Hände getrennt sicher.', 'Zusammen ganz langsam (♩ = 50), ohne anzuhalten.', 'Zusammen mit ♩ = 66.'] },
        { t: 'piece', h: 'Deine ersten Kapitelstücke', id: 'lesestuecke', body: '<p>Alle sechs Lesestücke findest du hier als ein Stück zum Üben. Alternativ kannst du das Thema der <b>Ode an die Freude</b> von Beethoven nehmen. Eines davon bringst du bis „Zusammen langsam“ – dann öffnet sich die Kapitelprüfung.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['noteName', { clef: 'treble', range: ['C4', 'G5'], grand: true }, 4], ['noteName', { clef: 'bass', range: ['F2', 'C4'], grand: true }, 4], ['pool', { id: 'grand' }, 2]], pass: 0.85 }
      ],
      review: [['noteName', { clef: 'treble', range: ['C4', 'G5'], grand: true }], ['noteName', { clef: 'bass', range: ['F2', 'C4'], grand: true }]]
    }
  ]
});

/* =========================================================================
   KAPITEL II · Rhythmus und Takt
   ========================================================================= */
CUR.chapters.push({
  id: 'II', title: 'Rhythmus und Takt', sub: 'Pausen, Achtel, Punktierung, Taktarten – und richtig üben.', img: 'renoir2',
  warm: ['Fünftonlage C beide Hände gleichzeitig (parallel, eine Oktave Abstand), legato.', 'Dasselbe in Achteln gegen ein Metronom auf ♩ = 60 – „1 und 2 und“ laut zählen.', 'Staccato-Viertel auf c–g: kurz und locker aus dem Handgelenk.', 'Fünftonlage G (g¹–d², rechts) und G (G–d, links) einmal auf und ab.'],
  must: ['menuett-g', 'mozart-k2'], more: ['traellerliedchen', 'czerny-821-1', 'ode'],
  exam: { n: 18, pass: 0.85, items: [['noteValue', { set: ['w', 'h', 'q', '8', 'h.', 'q.'], rests: true }, 2], ['measureFill', { time: '4/4', set: ['h', 'q', '8', 'q.'] }, 2], ['measureFill', { time: '3/4', set: ['h', 'q', '8', 'h.'] }, 1], ['counting', { time: '4/4', set: ['q', '8', 'h'] }, 2], ['timeSig', { set: ['4/4', '3/4', '2/4'] }, 2], ['rhythmHear', { set: ['h', 'q', '8'] }, 2], ['symbol', { set: ['tie', 'slur', 'st', 'fe'] }, 2], ['term', { cats: ['Tempo'] }, 2], ['pool', { id: 'methode' }, 3]] },
  lessons: [
    {
      id: '2.1', title: 'Pausen', sub: 'Stille hat einen Wert – und einen Platz im Takt.', min: 25,
      goals: ['ganze, halbe und Viertelpausen erkennen', 'Pausen exakt aushalten', 'Takte mit Noten und Pausen füllen'],
      steps: [
        { t: 'read', h: 'Stille zählt mit', body: `<p>Eine <b>Pause</b> ist ein Notenwert ohne Ton. Sie dauert genauso lange wie die entsprechende Note – und der Puls läuft weiter. Pausen sind keine Erholung, sondern Musik: Wer sie zu kurz macht, zerstört den Rhythmus.</p><table><tr><th>Pause</th><th>Aussehen</th><th>Dauer</th></tr><tr><td>Ganze Pause</td><td>Balken <b>hängt unter</b> der 4. Linie</td><td>4 Schläge (oder ein ganzer Takt)</td></tr><tr><td>Halbe Pause</td><td>Balken <b>liegt auf</b> der 3. Linie</td><td>2 Schläge</td></tr><tr><td>Viertelpause</td><td>Zickzack</td><td>1 Schlag</td></tr></table>[[0]]${F.merk('<b>Eselsbrücke:</b> Die ganze Pause ist schwer und hängt runter. Die halbe ist leichter und sitzt oben drauf – wie ein Hut.')}`, figs: [F.s([{ r: 'r/w' }, { r: 'r/h r/h' }, { r: 'r/q r/q r/q r/q' }], { time: 'C', cap: 'Ganze Pause – zwei halbe Pausen – vier Viertelpausen.', play: false })] },
        { t: 'ex', h: 'Übung: Pausenwerte', gen: 'noteValue', o: { set: ['w', 'h', 'q'], rests: true }, n: 8, need: 7 },
        { t: 'read', h: 'Ganztaktpause und Pausen beim Spielen', body: `<p>Ein Sonderfall: Die ganze Pause mitten in einem Takt bedeutet immer „der ganze Takt ist still“ – auch im 3/4-Takt, wo ein Takt nur drei Schläge hat.</p><p>Beim Spielen heißt Pause: <b>Taste loslassen</b>. Die Hand bleibt aber über den Tasten bereit. Pausen sind der perfekte Moment, den nächsten Ton schon anzuschauen.</p>[[0]]`, figs: [F.s([{ r: 'C4/q D4/q E4/q r/q' }, { r: 'E4/q D4/q C4/h' }, { r: 'r/q G4/q G4/q r/q' }, { r: 'G4/q E4/q C4/h', end: '|.' }], { time: 'C', bpm: 76, metro: true, cap: 'Hör auf die Stille: Die Pausen sind genauso lang wie die Noten daneben.' })] },
        { t: 'ex', h: 'Übung: Takte mit Pausen füllen', gen: 'measureFill', o: { time: '4/4', set: ['w', 'h', 'q'] }, n: 6, need: 5 },
        { t: 'ex', h: 'Übung: Klopfen mit Pausen', gen: 'tap', o: { set: ['h', 'q', 'w'], bars: 2, bpm: 72 }, n: 3, need: 2 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel das Beispiel oben (rechts, C-Lage) mit Metronom ♩ = 76. Zähl laut, auch in den Pausen.</p>', checks: ['Pausen hörbar still – Taste wirklich losgelassen.', 'Kein Abbremsen nach der Pause.'], metro: true },
        { t: 'test', h: 'Abschlusstest', gens: [['noteValue', { set: ['w', 'h', 'q'], rests: true }, 4], ['measureFill', { time: '4/4', set: ['w', 'h', 'q'] }, 4], ['pool', { id: 'pausen' }, 2]], pass: 0.8 }
      ],
      review: [['noteValue', { set: ['w', 'h', 'q'], rests: true }], ['measureFill', { time: '4/4', set: ['w', 'h', 'q'] }]]
    },
    {
      id: '2.2', title: 'Achtelnoten', sub: 'Balken, Fähnchen und „1 und 2 und“.', min: 30,
      goals: ['Achtelnoten und Achtelpausen erkennen', 'mit „und“ zählen', 'Achtel gleichmäßig spielen'],
      steps: [
        { t: 'read', h: 'Der halbe Schlag', body: `<p>Eine <b>Achtelnote</b> dauert einen <b>halben Schlag</b>: Zwei Achtel passen in eine Viertel. Sie sieht aus wie eine Viertel mit <b>Fähnchen</b>. Stehen mehrere Achtel nebeneinander, werden die Fähnchen zu einem <b>Balken</b> verbunden – das macht es übersichtlicher.</p>[[0]]<p>Die <b>Achtelpause</b> sieht aus wie eine kleine 7 mit Punkt.</p>`, figs: [F.s([{ r: 'B4/8 r/8 B4/8 B4/8 B4/8 B4/8 B4/q' }], { time: 'C', cap: 'Einzelne Achtel mit Fähnchen, Achtelpause, Achtel mit Balken.', bpm: 76 })] },
        { t: 'read', h: 'Zählen mit „und“', body: `<p>Zwischen die Zahlen kommt ein <b>„und“</b>: <b>1 und 2 und 3 und 4 und</b>. Die Zahl ist der Schlag (Viertel), das „und“ genau die Mitte dazwischen. Achtel auf der Zahl und auf dem „und“ müssen exakt gleich lang sein.</p>[[0]]${F.merk('Klatsche Viertel mit der Hand und sag dazu „1 und 2 und“. Die Hand trifft immer die Zahl, die Stimme füllt die Mitte.')}`, figs: [F.s([{ r: 'C4/8!t=1 C4/8!t=und D4/8!t=2 D4/8!t=und E4/q!t=3 E4/q!t=4' }, { r: 'G4/q!t=1 F4/8!t=2 E4/8!t=und D4/8!t=3 E4/8!t=und C4/q!t=4' }], { time: 'C', bpm: 72, metro: true, cap: 'Unter den Noten: die Zählzeiten.' })] },
        { t: 'ex', h: 'Übung: Auf welcher Zählzeit?', gen: 'counting', o: { time: '4/4', set: ['q', '8', 'h'] }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Rhythmus hören', gen: 'rhythmHear', o: { set: ['h', 'q', '8'] }, n: 5, need: 4 },
        { t: 'ex', h: 'Übung: Klopfen mit Achteln', gen: 'tap', o: { set: ['h', 'q', '8'], bars: 2, bpm: 66 }, n: 4, need: 3 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Rechts, C-Lage, Metronom ♩ = 66.</p>[[0]]', figs: [F.s([{ r: 'C4/8!f1 D4/8 E4/8 F4/8 G4/q!f5 G4/q' }, { r: 'A4/8!f5 G4/8 F4/8 E4/8 D4/h!f2' }, { r: 'E4/8!f3 F4/8 G4/8 E4/8 F4/8 D4/8 E4/8 C4/8' }, { r: 'D4/q!f2 G4/q!f5 C4/h!f1', end: '|.' }], { time: 'C', bpm: 66, metro: true, speed: true, cap: 'Achtel-Etüde (Notenweg). Takt 2 beginnt mit a¹ – die Hand streckt sich kurz mit dem 5. Finger.' })], checks: ['Laut gezählt mit „und“.', 'Achtel ganz gleichmäßig – kein Hinken.', 'Mit Metronom ♩ = 66, dann ♩ = 80.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['counting', { time: '4/4', set: ['q', '8', 'h'] }, 3], ['measureFill', { time: '4/4', set: ['h', 'q', '8'] }, 3], ['rhythmHear', { set: ['h', 'q', '8'] }, 2], ['noteValue', { set: ['h', 'q', '8'], rests: true }, 2]], pass: 0.8 }
      ],
      review: [['counting', { time: '4/4', set: ['q', '8', 'h'] }], ['rhythmHear', { set: ['h', 'q', '8'] }], ['measureFill', { time: '4/4', set: ['h', 'q', '8'] }]]
    },
    {
      id: '2.3', title: 'Punkte und Bögen', sub: 'Punktierte Noten, Haltebogen, Legatobogen.', min: 30,
      goals: ['punktierte Halbe und punktierte Viertel richtig lang spielen', 'Haltebogen und Legatobogen unterscheiden', 'den Rhythmus „lang – kurz“ sicher zählen'],
      steps: [
        { t: 'read', h: 'Der Punkt verlängert um die Hälfte', body: `<p>Ein <b>Punkt hinter einer Note</b> verlängert sie um die Hälfte ihres Werts:</p><ul><li><b>Punktierte Halbe</b> = 2 + 1 = <b>3 Schläge</b></li><li><b>Punktierte Viertel</b> = 1 + ½ = <b>1½ Schläge</b> – fast immer gefolgt von einer Achtel, zusammen 2 Schläge: der typische Rhythmus <b>„lang – kurz“</b>.</li></ul>[[0]]<p>So zählst du die punktierte Viertel: „<b>1</b> (und) 2 <b>und</b>“ – der Ton beginnt auf 1, hält über das „und“ und die 2, die Achtel kommt auf „2 und“.</p>`, figs: [F.s([{ r: 'B4/h.!t=1_2_3 B4/q!t=4' }, { r: 'B4/q.!t=1_(und)_2 B4/8!t=und B4/h!t=3_4' }], { time: 'C', bpm: 72, metro: true, cap: 'Punktierte Halbe (3 Schläge) und punktierte Viertel + Achtel (lang – kurz).' })] },
        { t: 'ex', h: 'Übung: punktierte Werte', gen: 'noteValue', o: { set: ['h.', 'q.', 'h', 'q', '8'] }, n: 8, need: 7 },
        { t: 'read', h: 'Zwei Bögen, zwei Bedeutungen', body: `<p>Bögen sehen ähnlich aus, bedeuten aber Verschiedenes:</p><ul><li><b>Haltebogen</b> verbindet <b>zwei gleiche Töne</b>. Du schlägst nur den ersten an und hältst ihn für beide Werte zusammen. So entstehen Längen über den Taktstrich hinweg.</li><li><b>Legatobogen</b> (Bindebogen) spannt sich über <b>verschiedene Töne</b>. Er bedeutet: gebunden spielen (legato). Am Ende eines Legatobogens hebst du die Hand leicht ab – wie Atemholen.</li></ul>[[0]]`, figs: [F.s([{ r: 'G4/h G4/h!~' }, { r: 'G4/q E4/q!( F4/q D4/q!)' }, { r: 'C4/w', end: '|.' }], { time: 'C', bpm: 72, cap: 'Takt 1–2: Haltebogen (g¹ läuft 5 Schläge). Takt 2: Legatobogen über e–f–d.' })] },
        { t: 'ex', h: 'Übung: Zeichen erkennen', gen: 'symbol', o: { set: ['tie', 'slur', 'st', 'fe'] }, n: 6, need: 5 },
        { t: 'ex', h: 'Übung: Takte füllen', gen: 'measureFill', o: { time: '4/4', set: ['h', 'q', '8', 'q.', 'h.'] }, n: 6, need: 5 },
        { t: 'ex', h: 'Übung: Klopfen lang–kurz', gen: 'tap', o: { set: ['h', 'q', '8', 'q.'], bars: 2, bpm: 66 }, n: 4, need: 3 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Rechts, C-Lage. Takt 4 und 8: lang – kurz.</p>[[0]]', figs: [F.s([{ r: 'E4/q!f3 E4/q F4/q G4/q' }, { r: 'G4/q F4/q E4/q D4/q' }, { r: 'C4/q!f1 C4/q D4/q E4/q' }, { r: 'E4/q.!f3 D4/8!f2 D4/h' }, { r: 'E4/q!f3 E4/q F4/q G4/q' }, { r: 'G4/q F4/q E4/q D4/q' }, { r: 'C4/q!f1 C4/q D4/q E4/q' }, { r: 'D4/q.!f2 C4/8!f1 C4/h', end: '|.' }], { time: 'C', bpm: 80, metro: true, speed: true, cap: 'Ludwig van Beethoven: Thema der „Ode an die Freude“ (9. Sinfonie, 1824). Die punktierten Viertel in Takt 4 und 8 geben dem Thema seinen Schwung.' })], checks: ['Rhythmus geklatscht und gezählt, besonders Takt 4 und 8.', 'Gespielt mit Metronom ♩ = 80, ohne Anhalten.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['noteValue', { set: ['h.', 'q.', 'h', 'q', '8'] }, 3], ['measureFill', { time: '4/4', set: ['h', 'q', '8', 'q.', 'h.'] }, 3], ['symbol', { set: ['tie', 'slur'] }, 2], ['rhythmHear', { set: ['h', 'q', '8', 'q.'] }, 2]], pass: 0.8 }
      ],
      review: [['noteValue', { set: ['h.', 'q.', 'h', 'q', '8'] }], ['symbol', { set: ['tie', 'slur'] }], ['measureFill', { time: '4/4', set: ['h', 'q', '8', 'q.'] }]]
    },
    {
      id: '2.4', title: 'Taktarten und Auftakt', sub: '3/4, 2/4 und der Anlauf vor der Eins.', min: 30,
      goals: ['3/4- und 2/4-Takt zählen und betonen', 'die Taktart aus den Noten erkennen', 'Stücke mit Auftakt richtig beginnen'],
      steps: [
        { t: 'read', h: 'Nicht jeder Takt hat vier Schläge', body: `<p>Die obere Zahl der Taktangabe sagt, <b>wie viele</b> Schläge ein Takt hat, die untere, <b>welcher Notenwert</b> ein Schlag ist (4 = Viertel, 8 = Achtel, 2 = Halbe).</p><ul><li><b>3/4</b>: drei Viertel. Betonung <b>EINS</b> zwei drei – der Walzer- und Menuett-Takt.</li><li><b>2/4</b>: zwei Viertel. <b>EINS</b> zwei – Marsch, Polka.</li><li><b>4/4</b>: <b>EINS</b> zwei <b>drei</b> vier.</li></ul>[[0]]`, figs: [F.s([{ r: 'C4/h. ' }, { r: 'E4/q G4/q E4/q' }, { r: 'D4/q F4/q D4/q' }, { r: 'C4/h.', end: '|.' }], { time: '3/4', bpm: 100, metro: true, cap: 'Ein 3/4-Takt: Die punktierte Halbe füllt genau einen Takt.' })] },
        { t: 'ex', h: 'Übung: Welche Taktart?', gen: 'timeSig', o: { set: ['4/4', '3/4', '2/4'] }, n: 6, need: 5 },
        { t: 'ex', h: 'Übung: 3/4-Takte füllen', gen: 'measureFill', o: { time: '3/4', set: ['h', 'q', '8', 'h.'] }, n: 6, need: 5 },
        { t: 'read', h: 'Der Auftakt', body: `<p>Viele Melodien beginnen <b>vor der ersten Eins</b> – mit einem Anlauf, dem <b>Auftakt</b>. Der erste Takt ist dann unvollständig, zum Beispiel nur eine Viertel. Dafür ist der <b>letzte Takt</b> des Stücks entsprechend kürzer: Auftakt + Schlusstakt ergeben zusammen einen ganzen Takt.</p><p>Beim Zählen startest du mit den fehlenden Zahlen: Bei einem Viertel-Auftakt im 3/4-Takt zählst du „<i>(1 2)</i> <b>3</b> | 1 2 3 …“ und spielst den Auftakt auf der 3.</p>[[0]]${F.merk('„We Wish You a Merry Christmas“, „O Tannenbaum“ und viele Menuette beginnen mit Auftakt. Taktnummern zählen erst ab dem ersten vollen Takt.')}`, figs: [F.s([{ r: 'G4/q!t=3' }, { r: 'C5/q!t=1 C5/8 D5/8 C5/8 B4/8' }, { r: 'A4/q A4/q A4/q' }, { r: 'D5/q D5/8 E5/8 D5/8 C5/8' }, { r: 'B4/q G4/q G4/q' }], { time: '3/4', bpm: 110, metro: true, cap: '„We Wish You a Merry Christmas“ (traditionell): Auftakt auf der 3.' })] },
        { t: 'ex', h: 'Übung: Zählzeiten im 3/4-Takt', gen: 'counting', o: { time: '3/4', set: ['q', '8', 'h'] }, n: 6, need: 5 },
        { t: 'piece', h: 'Dein erstes echtes Stück', id: 'menuett-g', body: '<p>Jetzt bist du bereit für das <b>Menuett G-Dur</b> aus dem Notenbüchlein für Anna Magdalena Bach – eines der berühmtesten ersten Stücke überhaupt. 3/4-Takt, Achtel, beide Hände. Neu: die Vorzeichnung mit einem ♯ (fis). Das heißt: Jedes f wird als fis gespielt. Mehr dazu in Kapitel III – für jetzt reicht: f = fis.</p><p>Alternativ das <b>Menuett F-Dur KV 2</b>, das Mozart mit sechs Jahren komponiert hat.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['timeSig', { set: ['4/4', '3/4', '2/4'] }, 3], ['measureFill', { time: '3/4', set: ['h', 'q', '8', 'h.'] }, 3], ['counting', { time: '3/4', set: ['q', '8', 'h'] }, 2], ['pool', { id: 'takt' }, 2]], pass: 0.8 }
      ],
      review: [['timeSig', { set: ['4/4', '3/4', '2/4'] }], ['measureFill', { time: '3/4', set: ['h', 'q', '8', 'h.'] }], ['pool', { id: 'takt' }]]
    },
    {
      id: '2.5', title: 'Sechzehntel und punktierte Achtel', sub: 'Schnelle Werte, ohne zu hetzen.', min: 30,
      goals: ['Sechzehntel erkennen und mit „1 e und e“ zählen', 'punktierte Achtel + Sechzehntel spielen', 'schnelle Noten gleichmäßig verteilen'],
      steps: [
        { t: 'read', h: 'Vier pro Schlag', body: `<p>Eine <b>Sechzehntel</b> ist halb so lang wie eine Achtel – vier passen in eine Viertel. Sie hat zwei Fähnchen bzw. zwei Balken. Gezählt wird: <b>1 e und e 2 e und e …</b></p>[[0]]<p>Der häufigste Rhythmus mit Sechzehnteln ist die <b>punktierte Achtel + Sechzehntel</b> – ein „hüpfendes“ lang–kurz auf einem Schlag. Die punktierte Achtel dauert ¾ des Schlags, die Sechzehntel kommt erst auf dem letzten „e“. Du kennst ihn aus „Stille Nacht“.</p>[[1]]`, figs: [F.s([{ r: 'B4/16!t=1 B4/16!t=e B4/16!t=und B4/16!t=e B4/8!t=2 B4/8!t=und B4/q!t=3 B4/q!t=4' }], { time: 'C', bpm: 60, metro: true, cap: 'Vier Sechzehntel, zwei Achtel, zwei Viertel.' }), F.s([{ r: 'G4/8. A4/16 G4/8 E4/q.' }, { r: 'G4/8. A4/16 G4/8 E4/q.' }], { time: '6/8', bpm: 50, cap: '„Stille Nacht“ (Franz Xaver Gruber, 1818): punktierte Achtel + Sechzehntel. Das Stück steht im 6/8-Takt – den lernst du in Kapitel VI.' })] },
        { t: 'ex', h: 'Übung: Werte', gen: 'noteValue', o: { set: ['q', '8', '16', '8.', 'q.'] }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Takte füllen', gen: 'measureFill', o: { time: '4/4', set: ['h', 'q', '8', '16'] }, n: 6, need: 5 },
        { t: 'ex', h: 'Übung: Rhythmus hören', gen: 'rhythmHear', o: { set: ['q', '8', '16', 'h'], bpm: 70 }, n: 5, need: 4 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Schnelle Noten sind eine Frage des Tempos: Erst so langsam, dass jede Sechzehntel kontrolliert ist.</p>[[0]]', figs: [F.s([{ r: 'C4/16!f1 D4/16 E4/16 F4/16 G4/q!f5 G4/16 F4/16 E4/16 D4/16 C4/q!f1' }, { r: 'E4/8.!f3 F4/16 G4/8. E4/16 D4/h!f2' }, { r: 'C4/16!f1 E4/16 D4/16 F4/16 E4/16 G4/16 F4/16 D4/16 C4/h!f1', end: '|.' }], { time: 'C', bpm: 60, metro: true, speed: true, cap: 'Sechzehntel-Etüde (Notenweg).' })], checks: ['Mit Metronom ♩ = 50 und laut „1 e und e“ gezählt.', 'Takt 2 punktiert: hüpfend, nicht wie Triolen.', 'Mit ♩ = 66 ohne Anhalten.'], metro: true },
        { t: 'test', h: 'Abschlusstest', gens: [['noteValue', { set: ['q', '8', '16', '8.', 'q.'] }, 3], ['measureFill', { time: '4/4', set: ['h', 'q', '8', '16'] }, 3], ['rhythmHear', { set: ['q', '8', '16', 'h'], bpm: 70 }, 2], ['counting', { time: '4/4', set: ['q', '8', 'h'] }, 2]], pass: 0.8 }
      ],
      review: [['noteValue', { set: ['q', '8', '16', '8.', 'q.'] }], ['rhythmHear', { set: ['q', '8', '16', 'h'], bpm: 70 }]]
    },
    {
      id: '2.6', title: 'Tempo und Metronom', sub: 'Von Largo bis Presto – und die Tempo-Treppe.', min: 25,
      goals: ['die wichtigsten italienischen Tempobezeichnungen kennen', 'Metronomzahlen lesen (♩ = 80)', 'mit der Tempo-Treppe sicher schneller werden'],
      steps: [
        { t: 'read', h: 'Tempo auf Italienisch', body: `<p>Über dem ersten Takt steht fast immer eine <b>Tempobezeichnung</b>, meist italienisch:</p><table><tr><th>Bezeichnung</th><th>Bedeutung</th><th>ca. ♩ pro Minute</th></tr><tr><td>Largo</td><td>breit, sehr langsam</td><td>40–60</td></tr><tr><td>Adagio</td><td>langsam, ruhig</td><td>55–75</td></tr><tr><td>Andante</td><td>gehend</td><td>75–100</td></tr><tr><td>Moderato</td><td>mäßig</td><td>95–115</td></tr><tr><td>Allegro</td><td>schnell, fröhlich</td><td>115–150</td></tr><tr><td>Presto</td><td>sehr schnell</td><td>über 160</td></tr></table><p>Die Zahlen sind Richtwerte – Komponisten meinten damit eher einen Charakter als eine exakte Zahl. Dazu kommen Zusätze: <b>molto</b> (sehr), <b>poco</b> (etwas), <b>ma non troppo</b> (aber nicht zu sehr), <b>sostenuto</b> (getragen). „Adagio sostenuto“ steht über deiner Mondscheinsonate.</p>` },
        { t: 'read', h: 'Das Metronom', body: `<p>Eine Angabe wie <b>♩ = 80</b> heißt: 80 Viertel pro Minute. Das Metronom (oben im Menü unter <i>Fortschritt → Werkzeuge</i> und in jedem Stück) schlägt genau dieses Tempo.</p><p><b>Die Tempo-Treppe</b> – so wirst du schneller, ohne Fehler einzuschleifen:</p><ol><li>Zieltempo kennen (z. B. ♩ = 100).</li><li>Starten bei etwa <b>55 %</b> (♩ = 56).</li><li>Dreimal hintereinander <b>fehlerfrei</b> → Metronom <b>+4</b>.</li><li>Ein Fehler → eine Stufe zurück.</li></ol>${F.merk('Dein Gehirn speichert, was du wiederholst – auch die Fehler. Langsam und richtig ist schneller am Ziel als schnell und falsch.')}` },
        { t: 'ex', h: 'Übung: Tempobezeichnungen', gen: 'term', o: { cats: ['Tempo'] }, n: 8, need: 7 },
        { t: 'tool', h: 'Probier das Metronom', tool: 'metro', body: '<p>Stell nacheinander Largo (50), Andante (88), Allegro (132) ein und hör den Unterschied.</p>' },
        { t: 'piano', h: 'Am Klavier: Tempo-Treppe', body: '<p>Nimm das Lesestück 6 aus Lektion 1.8 (beide Hände) mit Ziel ♩ = 100.</p>', checks: ['Start bei ♩ = 56.', 'Mindestens fünf Stufen geschafft (+4 nach je 3 fehlerfreien Durchgängen).', 'Erreichtes Tempo notiert.'], metro: true },
        { t: 'test', h: 'Abschlusstest', gens: [['term', { cats: ['Tempo'] }, 6], ['pool', { id: 'tempo' }, 4]], pass: 0.8 }
      ],
      review: [['term', { cats: ['Tempo'] }], ['pool', { id: 'tempo' }]]
    },
    {
      id: '2.7', title: 'Richtig üben', sub: 'Was die Forschung über schnelles Lernen am Instrument weiß.', min: 25,
      goals: ['eine Übe-Einheit sinnvoll aufbauen', 'Fehler gezielt reparieren statt sie zu wiederholen', 'die fünf wirksamsten Übe-Strategien anwenden'],
      steps: [
        { t: 'read', h: 'Fehlerfrei zählt, nicht oft', body: `<p>Eine bekannte Studie (Duke, Simmons & Cash, 2009) hat Klavierstudierende beim Üben gefilmt. Die Besten haben nicht am längsten geübt. Sie hatten etwas anderes gemeinsam: <b>Sie reparierten Fehler sofort an der Stelle</b>, spielten die Stelle dann langsamer und mehrmals richtig, bevor sie weitermachten. Wer immer wieder von vorne durchspielt und an derselben Stelle hängen bleibt, übt den Fehler.</p><p><b>Das Fehlerprotokoll</b> (benutzt es ab heute bei jeder schweren Stelle):</p><ol><li>Stelle markieren – nur die 1–2 Takte, wo es hakt.</li><li>Mit einer Note davor und danach isolieren.</li><li>So langsam, dass der erste Versuch fehlerfrei ist.</li><li><b>Dreimal hintereinander fehlerfrei</b>. Fehler → Zähler auf null.</li><li>Wieder in den Zusammenhang einbauen. Tempo erst danach erhöhen.</li></ol>` },
        { t: 'read', h: 'Fünf Strategien mit Wirkung', body: `<ol><li><b>Verteilt statt geballt:</b> 4 × 15 Minuten über den Tag bringen mehr als 60 Minuten am Stück. Zwischen den Einheiten arbeitet das Gehirn weiter.</li><li><b>Schlaf:</b> Bewegungsabläufe werden im Schlaf gefestigt. Was abends nicht klappt, geht morgens oft plötzlich.</li><li><b>Abwechseln:</b> Neue Stellen erst blockweise üben, sobald sie halbwegs sitzen, abwechselnd mit anderen Stellen (A, B, C, A, C, B …). Fühlt sich schwerer an – hält aber länger.</li><li><b>Mental üben:</b> Noten anschauen und das Stück innerlich hören und die Finger „fühlen“ – ohne Klavier. Funktioniert nachweislich, besonders als Ergänzung (z. B. in der Satzpause beim Training).</li><li><b>Abrufen statt wiederlesen:</b> Wissen abfragen statt nachlesen. Darum hat Notenweg Tests und Wiederholungen nach 1, 3, 7, 14, 30 Tagen.</li></ol>` },
        { t: 'read', h: 'Deine tägliche Einheit', body: `<p>Die Seite <b>Lernpfad → Heute</b> führt dich jeden Tag durch diese Reihenfolge. Aufwärmen (Hände lockern, Tonleitern) machst du davor selbst, ohne etwas abzuhaken.</p><table><tr><th>Block</th><th>Minuten</th><th>Warum</th></tr><tr><td>Wiederholen</td><td>5–10</td><td>Gelerntes festigen, bevor Neues kommt</td></tr><tr><td>Lektion</td><td>20–30</td><td>Neues verstehen und direkt anwenden</td></tr><tr><td>Stück</td><td>15–20</td><td>Spielen lernen – das eigentliche Ziel</td></tr><tr><td>Blattspiel</td><td>5</td><td>Täglich neue Noten = schneller lesen</td></tr></table><p>Nach etwa 25–30 Minuten eine kurze Pause (aufstehen, Hände ausschütteln). Nie über 60 Minuten ohne Pause.</p>` },
        { t: 'ex', h: 'Übung: Was ist hier die beste Strategie?', gen: 'pool', o: { id: 'methode' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier: Fehlerprotokoll ausprobieren', body: '<p>Nimm dein Kapitelstück (Menuett G-Dur oder Menuett KV 2) und die schwerste Stelle darin.</p>', checks: ['Schwerste Stelle markiert (1–2 Takte).', 'Isoliert und so langsam gespielt, dass es sofort klappt.', 'Dreimal hintereinander fehlerfrei.', 'Wieder in den Zusammenhang eingebaut.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'methode' }, 8]], pass: 0.85 }
      ],
      review: [['pool', { id: 'methode' }]]
    }
  ]
});

/* ===== Notenweg 3 · Lernpfad Teil B: Kapitel III–IV ===== */
const SONG = id => (C2.XMAS || []).find(x => x.id === id);

/* =========================================================================
   KAPITEL III · Tonleitern und Tonarten
   ========================================================================= */
CUR.chapters.push({
  id: 'III', title: 'Tonleitern und Tonarten', sub: 'Der Bauplan von Dur und Moll, Vorzeichen, Quintenzirkel, Intervalle, Gehör.', img: 'renoir1',
  warm: ['C-Dur-Tonleiter, jede Hand allein, eine Oktave, ♩ = 60 in Vierteln, mit Fingersatz 1-2-3-1-2-3-4-5.', 'G-Dur-Tonleiter: rechts 1-2-3-1-2-3-4-5, links 5-4-3-2-1-3-2-1.', 'a-Moll harmonisch, langsam – hör auf den Schritt f–gis.', 'Dreiklänge in C-Lage: c-e-g, d-f-a, e-g-h … mit 1-3-5, gebunden.'],
  must: ['menuett-gm', 'arabeske'], more: ['praeludium-c', 'clementi-1', 'musette', 'soldatenmarsch', 'stueckchen', 'clementi-3'],
  exam: { n: 20, pass: 0.85, items: [['scaleDegree', { max: 4 }, 2], ['scaleNotes', { max: 4, mode: 'both' }, 2], ['keySig', { max: 5, mode: 'both' }, 3], ['keyAcc', { max: 5, mode: 'both' }, 2], ['keyNote', { max: 3 }, 2], ['circle', {}, 2], ['minorKind', {}, 1], ['ivQual', {}, 3], ['ivEar', { set: ['g2', 'g3', 'r4', 'r5', 'r8'] }, 1], ['triadEar', { types: ['', 'm'] }, 1], ['pool', { id: 'fingersatz' }, 1]] },
  lessons: [
    {
      id: '3.1', title: 'Der Bauplan der Dur-Tonleiter', sub: 'Ganz – Ganz – Halb – Ganz – Ganz – Ganz – Halb.', min: 30,
      goals: ['erklären, warum C-Dur nur weiße Tasten hat', 'jede Dur-Tonleiter aus dem Bauplan selbst bauen', 'die Stufen einer Tonleiter benennen'],
      steps: [
        { t: 'read', h: 'Eine Treppe aus acht Stufen', body: `<p>Eine <b>Tonleiter</b> ist eine Treppe aus Tönen: Sie beginnt auf dem <b>Grundton</b> und steigt Stufe für Stufe bis zur Oktave. Die Stufen werden mit Zahlen (oder römischen Zahlen) benannt: 1, 2, 3 … 8 (= wieder 1).</p><p>Das Besondere an Dur: Die Stufen sind <b>nicht</b> alle gleich groß. Es gibt Ganztöne und genau zwei Halbtöne – immer an derselben Stelle:</p>${F.merk('<b>Dur-Bauplan:</b> Ganz – Ganz – <b>Halb</b> – Ganz – Ganz – Ganz – <b>Halb</b>. Die Halbtöne liegen zwischen der 3. und 4. und zwischen der 7. und 8. Stufe.')}[[0]]<p>Bei C-Dur passen die natürlichen Halbtöne e–f und h–c genau an diese Stellen. Deshalb braucht C-Dur keine einzige schwarze Taste.</p>`, figs: [F.k('C4', 'C5', { C4: { cls: 'hl', lab: '1' }, D4: { lab: '2' }, E4: { cls: 'hl2', lab: '3' }, F4: { cls: 'hl2', lab: '4' }, G4: { lab: '5' }, A4: { lab: '6' }, B4: { cls: 'hl2', lab: '7' }, C5: { cls: 'hl', lab: '8' } }, { spans: [['C4', 'D4', 'G'], ['D4', 'E4', 'G'], ['E4', 'F4', 'H'], ['F4', 'G4', 'G'], ['G4', 'A4', 'G'], ['A4', 'B4', 'G'], ['B4', 'C5', 'H']], cap: 'C-Dur: Die Halbtöne (H) liegen von Natur aus zwischen 3–4 (e–f) und 7–8 (h–c).' })] },
        { t: 'read', h: 'Jede Dur-Tonleiter selbst bauen', body: `<p>Mit dem Bauplan kannst du auf <b>jedem</b> Ton eine Dur-Tonleiter bauen. Beispiel <b>G-Dur</b>:</p><ul><li>g → a: Ganzton ✓</li><li>a → h: Ganzton ✓</li><li>h → c: Halbton ✓ (3–4)</li><li>c → d, d → e: Ganztöne ✓</li><li>e → f: nur ein Halbton – wir brauchen aber einen Ganzton! Also wird f erhöht: <b>e → fis</b> ✓</li><li>fis → g: Halbton ✓ (7–8)</li></ul><p>G-Dur braucht also genau ein Vorzeichen: <b>fis</b>. Genauso bekommt D-Dur zwei Kreuze (fis, cis) und F-Dur ein ♭ (b statt h, damit 3–4 ein Halbton ist).</p>[[0]][[1]]`, figs: [F.s('G4/q A4/q B4/q C5/q D5/q E5/q F#5/q G5/q', { names: 'all', cap: 'G-Dur: Die 7. Stufe muss fis sein.', bpm: 96 }), F.s('F4/q G4/q A4/q Bb4/q C5/q D5/q E5/q F5/q', { names: 'all', cap: 'F-Dur: Die 4. Stufe muss b sein.', bpm: 96 })] },
        { t: 'ex', h: 'Übung: Stufen bestimmen', gen: 'scaleDegree', o: { max: 2 }, n: 8, need: 7, body: '<p>Bau die Tonleiter im Kopf (oder am Klavier) nach dem Bauplan und bestimme die gefragte Stufe.</p>' },
        { t: 'read', h: 'Warum Dur so klingt', body: `<p>Die 7. Stufe liegt nur einen Halbton unter dem Grundton. Dieser Ton heißt <b>Leitton</b> – er „leitet“ zum Grundton, das Ohr will die Auflösung. Spiel die Tonleiter und halte auf der 7. Stufe an: Es fühlt sich unfertig an.</p><p>Die 1., 3. und 5. Stufe bilden zusammen den <b>Dur-Dreiklang</b> (c–e–g) – den Ruhepol der Tonart. Die 5. Stufe heißt <b>Dominante</b>, die 4. <b>Subdominante</b>. Das wird in Kapitel IV wichtig.</p>[[0]]`, figs: [F.s('C4/q D4/q E4/q F4/q G4/q A4/q B4/h!fe C5/w', { time: null, cap: 'Hör auf das h vor dem Schluss: der Leitton.', bpm: 88 })] },
        { t: 'piano', h: 'Am Klavier: Tonleitern entdecken', body: '<p>Spiel mit einem Finger und sag laut „Ganz“ oder „Halb“ bei jedem Schritt.</p>', checks: ['C-Dur aufwärts mit Ganz/Halb-Ansage.', 'G-Dur nach Bauplan selbst gefunden – nur eine schwarze Taste (fis).', 'D-Dur selbst gefunden (fis, cis).', 'F-Dur selbst gefunden (b).', 'Eine Tonleiter auf einem beliebigen anderen Ton gebaut (z. B. A-Dur oder Es-Dur).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['scaleDegree', { max: 3 }, 5], ['pool', { id: 'dur' }, 5]], pass: 0.8 }
      ],
      review: [['scaleDegree', { max: 3 }], ['pool', { id: 'dur' }]]
    },
    {
      id: '3.2', title: 'Tonleitern spielen: Fingersatz und Daumenuntersatz', sub: 'Acht Töne mit fünf Fingern – ohne Holpern.', min: 30,
      goals: ['C-, G-, D-, A-, E- und F-Dur mit korrektem Fingersatz spielen', 'Daumenuntersatz und Übersatz sauber und unhörbar ausführen', 'verstehen, warum Tonleitern die beste Technikübung sind'],
      steps: [
        { t: 'read', h: 'Fünf Finger, acht Töne', body: `<p>Eine Oktave hat acht Töne, die Hand nur fünf Finger. Der Trick: Der <b>Daumen geht unter der Hand durch</b> (Daumenuntersatz), und auf dem Rückweg kreuzt der 3. oder 4. Finger über den Daumen (Übersatz). So wird die Tonleiter zu einer einzigen fließenden Linie.</p><p><b>C-Dur, rechte Hand aufwärts:</b> 1–2–3, dann Daumen unter dem 3. Finger durch auf f, weiter 1–2–3–4–5.<br><b>Linke Hand aufwärts:</b> 5–4–3–2–1, dann 3 über den Daumen auf a, weiter 2–1.</p>[[0]]`, figs: [F.s([{ r: 'C4/8!f1 D4/8!f2 E4/8!f3 F4/8!f1 G4/8!f2 A4/8!f3 B4/8!f4 C5/8!f5', l: 'C3/8!f5 D3/8!f4 E3/8!f3 F3/8!f2 G3/8!f1 A3/8!f3 B3/8!f2 C4/8!f1' }, { r: 'C5/8!f5 B4/8!f4 A4/8!f3 G4/8!f2 F4/8!f1 E4/8!f3 D4/8!f2 C4/8!f1', l: 'C4/8!f1 B3/8!f2 A3/8!f3 G3/8!f1 F3/8!f2 E3/8!f3 D3/8!f4 C3/8!f5' }], { grand: true, time: 'C', bpm: 60, metro: true, cap: 'C-Dur, beide Hände, auf und ab – mit Fingersätzen.' })] },
        { t: 'read', h: 'So klingt der Untersatz unhörbar', body: `<ul><li>Der Daumen bewegt sich <b>früh</b>: Sobald er seine Taste verlassen hat, wandert er schon unter der Hand Richtung Ziel.</li><li><b>Handgelenk ruhig</b> und waagerecht – kein Abknicken, kein Hochziehen des Ellbogens.</li><li>Der Unterarm gleitet mit, wie ein Auto, das gleichmäßig fährt, während die Finger „aussteigen“.</li><li>Kein Akzent auf dem Daumen: Hör genau hin, ob der Ton nach dem Untersatz lauter ist.</li></ul>${F.merk('Übung für den Daumen: Finger 2 und 3 halten c¹–d¹ fest, der Daumen pendelt locker unter ihnen hin und her (c¹ ↔ f¹). 10×, entspannt.')}` },
        { t: 'read', h: 'Die Fingersätze der ersten Tonleitern', body: `<div class="tablewrap"><table><tr><th>Tonleiter</th><th>Rechts (auf)</th><th>Links (auf)</th></tr><tr><td>C, G, D, A, E</td><td>1 2 3 · 1 2 3 4 5</td><td>5 4 3 2 1 · 3 2 1</td></tr><tr><td>F-Dur</td><td>1 2 3 4 · 1 2 3 4</td><td>5 4 3 2 1 · 3 2 1</td></tr><tr><td>a-, e-, d-Moll</td><td>1 2 3 · 1 2 3 4 5</td><td>5 4 3 2 1 · 3 2 1</td></tr></table></div><p>Bei F-Dur rechts liegt das b auf dem 4. Finger – der Daumen soll nämlich <b>nie auf eine schwarze Taste</b>, wenn es sich vermeiden lässt.</p><p>Über zwei Oktaven: Rechts nach der 8. Stufe nicht mit 5, sondern mit 1 weiter (1 2 3 1 2 3 4 · 1 2 3 1 2 3 4 5).</p>` },
        { t: 'ex', h: 'Übung: Fingersatz-Wissen', gen: 'pool', o: { id: 'fingersatz' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier: Tonleiter-Routine', body: '<p>Ab heute gehört das in dein eigenes Aufwärmen. Metronom ♩ = 60, erst Viertel, dann Achtel.</p>', checks: ['C-Dur rechts und links getrennt, je 3× fehlerfrei.', 'C-Dur beide Hände zusammen (eine Oktave Abstand), langsam.', 'G-Dur und D-Dur getrennt.', 'F-Dur rechts mit 4. Finger auf b.', 'Gegenbewegung C-Dur: beide Daumen auf c¹, Hände laufen auseinander und zurück.'], metro: true },
        { t: 'piece', h: 'Neue Stücke für dich', id: 'clementi-1', body: '<p>Die <b>Sonatine op. 36 Nr. 1</b> von Clementi besteht zu großen Teilen aus Tonleiter-Läufen und Dreiklängen in C-Dur – die perfekte Anwendung. Auch das <b>Kleine Präludium C-Dur</b> von Bach ist jetzt offen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'fingersatz' }, 6], ['scaleDegree', { max: 3 }, 4]], pass: 0.8 }
      ],
      review: [['pool', { id: 'fingersatz' }]]
    },
    {
      id: '3.3', title: 'Vorzeichnung und Versetzungszeichen', sub: 'Was am Zeilenanfang steht – und was im Takt gilt.', min: 30,
      goals: ['Vorzeichnungen bis drei Vorzeichen lesen', 'wissen, wie lange ein Versetzungszeichen gilt', 'in einer Tonart sicher die richtigen Töne spielen'],
      steps: [
        { t: 'read', h: 'Die Vorzeichnung', body: `<p>Damit nicht vor jedem fis ein Kreuz stehen muss, schreibt man die Vorzeichen einer Tonart einmal an den Anfang jeder Zeile – direkt hinter den Schlüssel. Das ist die <b>Vorzeichnung</b>. Sie gilt <b>für das ganze Stück und für jede Oktave</b>.</p>[[0]]<ul><li><b>G-Dur</b>: fis · <b>D-Dur</b>: fis, cis · <b>A-Dur</b>: fis, cis, gis</li><li><b>F-Dur</b>: b · <b>B-Dur</b>: b, es · <b>Es-Dur</b>: b, es, as</li></ul><p>Die Vorzeichen stehen immer an derselben Stelle im System und in derselben Reihenfolge – das macht sie auf einen Blick erkennbar.</p>`, figs: [[F.s([{ r: 'x/w' }], { key: 'G', play: false, cap: 'G-Dur / e-Moll: fis' }), F.s([{ r: 'x/w' }], { key: 'D', play: false, cap: 'D-Dur / h-Moll: fis, cis' }), F.s([{ r: 'x/w' }], { key: 'F', play: false, cap: 'F-Dur / d-Moll: b' }), F.s([{ r: 'x/w' }], { key: 'Bb', play: false, cap: 'B-Dur / g-Moll: b, es' })]] },
        { t: 'ex', h: 'Übung: Vorzeichnung lesen', gen: 'keySig', o: { max: 3, mode: 'major' }, n: 8, need: 7 },
        { t: 'read', h: 'Versetzungszeichen im Takt', body: `<p>Steht mitten im Stück ein ♯, ♭ oder ♮ vor einer Note, ist das ein <b>Versetzungszeichen</b> (Akzidens). Es gilt:</p><ul><li>für diese Note <b>und alle folgenden gleichen Noten im selben Takt</b>,</li><li><b>bis zum nächsten Taktstrich</b> – dann gilt wieder die Vorzeichnung,</li><li>ein Haltebogen über den Taktstrich trägt es in den nächsten Takt hinein.</li></ul><p>Ein ♮ hebt auch ein Vorzeichen der Vorzeichnung für den Rest des Takts auf. Gute Ausgaben setzen nach einem Taktstrich oft ein „Erinnerungszeichen“ (in Klammern) – musst du aber nicht erwarten.</p>[[0]]`, figs: [F.s([{ r: 'F#4/q G4/q F4/q E4/q' }, { r: 'F4/q G4/h.' }], { key: 'C', time: 'C', names: 'all', cap: 'Takt 1: Das ♮ vor dem zweiten f braucht es, weil das fis bis Taktende gilt. Takt 2: neuer Takt – f ohne Zeichen ist f.', bpm: 84 })] },
        { t: 'ex', h: 'Übung: Was gilt im Takt?', gen: 'keyNote', o: { max: 2 }, n: 10, need: 8 },
        { t: 'read', h: 'Der Lese-Trick', body: `<p>Bevor du ein Stück spielst: <b>Vorzeichnung laut aussprechen</b> („D-Dur: fis und cis“) und die betroffenen Tasten einmal antippen. Viele Fehler beim Blattspiel sind vergessene Vorzeichen – nicht falsch gelesene Noten.</p><p>Noch besser: Spiel vorher kurz die Tonleiter der Tonart. Dann liegen die Finger schon „in der Tonart“.</p>` },
        { t: 'piece', h: 'Neue Stücke', id: 'musette', body: '<p>Die <b>Musette D-Dur</b> (fis, cis) und der <b>Soldatenmarsch</b> in G-Dur sind jetzt offen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['keySig', { max: 3, mode: 'major' }, 3], ['keyAcc', { max: 3, mode: 'major' }, 2], ['keyNote', { max: 3 }, 4], ['pool', { id: 'vorzeichen' }, 2]], pass: 0.8 }
      ],
      review: [['keySig', { max: 3, mode: 'major' }], ['keyNote', { max: 3 }], ['keyAcc', { max: 3, mode: 'major' }]]
    },
    {
      id: '3.4', title: 'Der Quintenzirkel', sub: 'Alle Tonarten auf einer Uhr.', min: 30,
      goals: ['den Quintenzirkel aus dem Kopf aufzeichnen', 'zu jeder Vorzeichnung die Dur-Tonart finden – und umgekehrt', 'die Reihenfolge der Kreuze und Bs kennen'],
      steps: [
        { t: 'read', h: 'Eine Quinte weiter, ein Kreuz mehr', body: `<p>Baust du auf der 5. Stufe (Quinte) von C-Dur eine neue Dur-Tonleiter, bekommst du G-Dur – mit genau <b>einem Kreuz mehr</b>. Auf der Quinte von G liegt D-Dur (zwei Kreuze), dann A-Dur (drei) … Ordnest du alle Tonarten so im Kreis an, entsteht der <b>Quintenzirkel</b>.</p>[[0]]<ul><li><b>Im Uhrzeigersinn</b> (Quinte aufwärts): C – G – D – A – E – H – Fis … jeweils ein ♯ mehr.</li><li><b>Gegen den Uhrzeigersinn</b> (Quinte abwärts): C – F – B – Es – As – Des – Ges … jeweils ein ♭ mehr.</li><li>Unten treffen sich Fis-Dur (6♯) und Ges-Dur (6♭) – dieselben Tasten, enharmonisch verwechselt.</li></ul>`, figs: [{ kind: 'circle', cap: 'Außen Dur, innen die parallelen Moll-Tonarten, ganz außen die Anzahl der Vorzeichen.' }] },
        { t: 'read', h: 'Die Reihenfolge der Vorzeichen', body: `<p><b>Kreuze</b> kommen immer in dieser Reihenfolge dazu: <b>fis – cis – gis – dis – ais – eis – his</b>. Jedes neue Kreuz ist der <b>Leitton</b> (7. Stufe) der neuen Tonart.</p><p><b>Bs</b> kommen umgekehrt: <b>b – es – as – des – ges – ces – fes</b>. Jedes neue ♭ ist die 4. Stufe der neuen Tonart.</p>${F.merk('<b>Tonart aus der Vorzeichnung:</b><br>Kreuze: letztes Kreuz + Halbton = Dur-Grundton (fis → G-Dur, cis → D-Dur).<br>Bs: das vorletzte ♭ ist der Dur-Grundton (b, es → B-Dur). Ausnahme: ein ♭ = F-Dur.')}<p>Merksätze helfen: Für die Kreuz-Tonarten <b>G D A E H Fis</b> – „<b>G</b>eh <b>D</b>u <b>A</b>lter <b>E</b>sel <b>H</b>ole <b>Fis</b>ch“. Und ein schöner Trick: Die Reihenfolge der Bs (b es as des ges ces fes) ist genau die Reihenfolge der Kreuze (fis cis gis dis ais eis his) <b>rückwärts gelesen</b> – nur mit ♭ statt ♯.</p>` },
        { t: 'ex', h: 'Übung: Tonart aus der Vorzeichnung', gen: 'keySig', o: { max: 5, mode: 'major' }, n: 10, need: 8 },
        { t: 'ex', h: 'Übung: Vorzeichen einer Tonart', gen: 'keyAcc', o: { max: 5, mode: 'major' }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Nachbarn im Zirkel', gen: 'circle', o: {}, n: 8, need: 7 },
        { t: 'read', h: 'Wozu der Zirkel gut ist', body: `<p>Nachbarn im Quintenzirkel teilen sich sechs von sieben Tönen. Darum klingen Wechsel zwischen ihnen natürlich – Musik wandert am liebsten zu Nachbar-Tonarten (Modulation, Kapitel VII). Und die drei wichtigsten Akkorde einer Tonart – I, IV und V – sind genau die Tonart selbst und ihre beiden Nachbarn: In C-Dur sind das <b>C, F und G</b>. Mit diesen drei Akkorden kannst du Tausende Lieder begleiten.</p>` },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel den Quintenzirkel als Grundtöne mit der linken Hand: C – G – D – A – E – H – Fis/Ges – Des – As – Es – B – F – C. Sag dabei die Vorzeichen.</p>', checks: ['Quintenzirkel einmal komplett als Bassnoten mit Ansage gespielt.', 'A-Dur und E-Dur Tonleiter rechts (Fingersatz wie C-Dur).', 'B-Dur und Es-Dur Tonleiter rechts (Daumen nicht auf schwarze Tasten – Fingersatz in Ruhe ausprobieren).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['keySig', { max: 5, mode: 'major' }, 3], ['keyAcc', { max: 5, mode: 'major' }, 3], ['circle', {}, 3], ['pool', { id: 'quinten' }, 3]], pass: 0.8 }
      ],
      review: [['keySig', { max: 5, mode: 'major' }], ['keyAcc', { max: 5, mode: 'major' }], ['circle', {}], ['pool', { id: 'quinten' }]]
    },
    {
      id: '3.5', title: 'Moll', sub: 'Natürlich, harmonisch, melodisch – und die Paralleltonart.', min: 35,
      goals: ['die drei Moll-Formen bauen und am Notenbild erkennen', 'zu jeder Dur-Tonart die parallele Moll-Tonart finden', 'in Stücken erkennen, ob sie in Dur oder Moll stehen'],
      steps: [
        { t: 'read', h: 'Der andere Bauplan', body: `<p>Spiel die weißen Tasten von <b>a bis a</b>. Das klingt dunkler, trauriger – das ist <b>a-Moll</b>. Der Bauplan von natürlichem Moll:</p>${F.merk('<b>Moll (natürlich):</b> Ganz – <b>Halb</b> – Ganz – Ganz – <b>Halb</b> – Ganz – Ganz. Halbtöne zwischen 2–3 und 5–6.')}[[0]]<p>Der entscheidende Unterschied zu Dur ist die <b>kleine Terz</b> über dem Grundton (a–c statt a–cis). Sie macht den Moll-Charakter.</p>`, figs: [F.s('A3/q B3/q C4/q D4/q E4/q F4/q G4/q A4/q', { names: 'all', cap: 'a-Moll natürlich – nur weiße Tasten.', bpm: 88 })] },
        { t: 'read', h: 'Paralleltonarten', body: `<p>a-Moll hat dieselben Töne wie C-Dur – also auch dieselbe Vorzeichnung (keine). Solche Paare heißen <b>Paralleltonarten</b>. Der Moll-Grundton liegt immer <b>eine kleine Terz (3 Halbtöne) unter</b> dem Dur-Grundton:</p><ul><li>C-Dur ↔ a-Moll · G-Dur ↔ e-Moll · D-Dur ↔ h-Moll</li><li>F-Dur ↔ d-Moll · B-Dur ↔ g-Moll · Es-Dur ↔ c-Moll</li></ul><p>Dagegen heißen C-Dur und <b>c</b>-Moll <b>Varianttonarten</b>: gleicher Grundton, anderes Geschlecht.</p><p>Wie erkennst du, ob ein Stück mit einem ♯ in G-Dur oder e-Moll steht? Schau auf den <b>letzten Basston</b> und auf <b>Versetzungszeichen</b>: Taucht oft ein dis auf (der Leitton von e-Moll), ist es e-Moll.</p>` },
        { t: 'ex', h: 'Übung: Paralleltonarten', gen: 'circle', o: {}, n: 6, need: 5 },
        { t: 'read', h: 'Harmonisch und melodisch', body: `<p>Natürlichem Moll fehlt der Leitton: a-Moll endet g → a (Ganzton). Damit es genauso „heimkommt“ wie Dur, erhöht man oft die 7. Stufe:</p><ul><li><b>Harmonisches Moll</b>: 7. Stufe erhöht (a-Moll: <b>gis</b>). Zwischen 6 und 7 entsteht ein Sprung von drei Halbtönen (f–gis, eine übermäßige Sekunde) – der „orientalische“ Klang.</li><li><b>Melodisches Moll</b>: aufwärts 6. <b>und</b> 7. Stufe erhöht (fis, gis), damit die Melodie glatt läuft; abwärts wieder natürlich.</li></ul>[[0]][[1]]<p>Diese erhöhten Töne stehen nie in der Vorzeichnung, sondern immer als Versetzungszeichen im Stück – ein sicheres Erkennungszeichen für Moll.</p>`, figs: [F.s('A3/q B3/q C4/q D4/q E4/q F4/q G#4/q A4/q', { names: 'all', cap: 'a-Moll harmonisch: gis.', bpm: 88 }), F.s('A3/q B3/q C4/q D4/q E4/q F#4/q G#4/q A4/q G4/q F4/q E4/q D4/q C4/q B3/q A3/h', { names: 'all', cap: 'a-Moll melodisch: aufwärts fis und gis, abwärts natürlich.', bpm: 96 })] },
        { t: 'ex', h: 'Übung: Welche Moll-Form?', gen: 'minorKind', o: {}, n: 6, need: 5 },
        { t: 'ex', h: 'Übung: Moll-Tonarten an der Vorzeichnung', gen: 'keySig', o: { max: 3, mode: 'minor' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Fingersatz wie C-Dur (rechts 1 2 3 1 2 3 4 5, links 5 4 3 2 1 3 2 1).</p>', checks: ['a-Moll in allen drei Formen, rechts.', 'e-Moll und d-Moll harmonisch, rechts und links.', 'C-Dur und a-Moll direkt nacheinander gespielt und den Unterschied gehört.'] },
        { t: 'piece', h: 'Moll-Stücke', id: 'arabeske', body: '<p>Jetzt sind deine Kapitel-Pflichtstücke offen: die <b>Arabeske</b> (a-Moll) und das <b>Menuett g-Moll</b>. Achte im Menuett auf das fis – den Leitton von g-Moll.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['minorKind', {}, 2], ['keySig', { max: 4, mode: 'both' }, 3], ['circle', {}, 2], ['scaleNotes', { max: 3, mode: 'minor', kind: 'harm' }, 2], ['pool', { id: 'moll' }, 3]], pass: 0.8 }
      ],
      review: [['minorKind', {}], ['keySig', { max: 4, mode: 'both' }], ['scaleNotes', { max: 3, mode: 'minor', kind: 'harm' }], ['pool', { id: 'moll' }]]
    },
    {
      id: '3.6', title: 'Intervalle genau bestimmen', sub: 'Groß, klein, rein – mit Halbtönen zählen.', min: 30,
      goals: ['jedes Intervall bis zur Oktave mit Größe und Art benennen', 'Intervalle über die Dur-Tonleiter schnell prüfen', 'den Tritonus kennen'],
      steps: [
        { t: 'read', h: 'Größe ist nicht alles', body: `<p>c–e und c–es sind beide Terzen – aber sie klingen völlig verschieden (Dur- bzw. Moll-Farbe). Darum hat jedes Intervall eine <b>Größe</b> (Terz) und eine <b>Art</b> (groß, klein, rein …). Die Art hängt an der Zahl der Halbtöne:</p><div class="tablewrap"><table><tr><th>Intervall</th><th>Halbtöne</th><th>Beispiel von c</th></tr><tr><td>kleine Sekunde</td><td>1</td><td>c–des</td></tr><tr><td>große Sekunde</td><td>2</td><td>c–d</td></tr><tr><td>kleine Terz</td><td>3</td><td>c–es</td></tr><tr><td>große Terz</td><td>4</td><td>c–e</td></tr><tr><td>reine Quarte</td><td>5</td><td>c–f</td></tr><tr><td>Tritonus (überm. Quarte / verm. Quinte)</td><td>6</td><td>c–fis / c–ges</td></tr><tr><td>reine Quinte</td><td>7</td><td>c–g</td></tr><tr><td>kleine Sexte</td><td>8</td><td>c–as</td></tr><tr><td>große Sexte</td><td>9</td><td>c–a</td></tr><tr><td>kleine Septime</td><td>10</td><td>c–b</td></tr><tr><td>große Septime</td><td>11</td><td>c–h</td></tr><tr><td>reine Oktave</td><td>12</td><td>c–c</td></tr></table></div><p><b>Rein</b> gibt es nur bei Prime, Quarte, Quinte und Oktave. Sekunden, Terzen, Sexten und Septimen sind <b>groß oder klein</b>.</p>` },
        { t: 'read', h: 'Der schnelle Weg über Dur', body: `<p>Statt Halbtöne zu zählen, nutze die Dur-Tonleiter des <b>unteren</b> Tons: Alle Töne dieser Tonleiter bilden mit dem Grundton <b>große</b> oder <b>reine</b> Intervalle.</p><p>Beispiel: d–f? D-Dur hat fis. Also wäre d–fis die große Terz. f ist einen Halbton tiefer → <b>kleine Terz</b>.</p>${F.merk('Ein Halbton weniger als groß = klein. Ein Halbton weniger als rein (oder klein) = vermindert. Ein Halbton mehr als groß oder rein = übermäßig.')}[[0]]`, figs: [F.s('(D4 F#4)/h (D4 F4)/h (E4 B4)/h (E4 Bb4)/h', { cap: 'd–fis große Terz, d–f kleine Terz · e–h reine Quinte, e–b verminderte Quinte (Tritonus).' })] },
        { t: 'ex', h: 'Übung: Intervalle von Stammtönen', gen: 'ivQual', o: { set: ['k2', 'g2', 'k3', 'g3', 'r4', 'r5', 'k6', 'g6', 'k7', 'g7', 'r8'] }, n: 12, need: 10 },
        { t: 'ex', h: 'Übung: mit Vorzeichen', gen: 'ivQual', o: { acc: true, set: ['k2', 'g2', 'k3', 'g3', 'r4', 'ue4', 'v5', 'r5', 'k6', 'g6', 'k7', 'g7'] }, n: 10, need: 8 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Greif jedes Intervall von c¹ aus und hör den Charakter: Sekunden reiben, Terzen und Sexten klingen weich, Quarten und Quinten leer und offen, Septimen gespannt.</p>', checks: ['Alle Intervalle von c¹ aus gespielt, erst nacheinander, dann zusammen.', 'Dasselbe von g¹ aus (mit fis für die große Septime!).', 'Den Tritonus c–fis gespielt – das „Teufelsintervall“.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['ivQual', { acc: true }, 8], ['pool', { id: 'intervall' }, 3]], pass: 0.8 }
      ],
      review: [['ivQual', { acc: true }], ['pool', { id: 'intervall' }]]
    },
    {
      id: '3.7', title: 'Hören: Intervalle, Dur und Moll', sub: 'Was du hörst, kannst du schneller spielen.', min: 30,
      goals: ['Sekunde, Terz, Quarte, Quinte und Oktave nach Gehör erkennen', 'Dur und Moll sicher unterscheiden', 'Liedanfänge als Eselsbrücke nutzen'],
      steps: [
        { t: 'read', h: 'Warum Gehörbildung', body: `<p>Gute Leser hören die Musik <b>innerlich</b>, bevor sie sie spielen – und merken sofort, wenn etwas falsch klingt. Das Ohr ist dein Korrektor, dein Lehrer, wenn keiner da ist, und die Grundlage zum Improvisieren und Begleiten.</p><p>Der leichteste Einstieg: Jedes Intervall mit einem <b>Liedanfang</b> verknüpfen, den du schon kennst.</p><div class="tablewrap"><table><tr><th>Intervall</th><th>Aufwärts klingt wie …</th></tr><tr><td>kleine Sekunde</td><td>Für Elise (e–dis), „Der weiße Hai“</td></tr><tr><td>große Sekunde</td><td>Alle meine Entchen (Al–le), Happy Birthday (py–Birth)</td></tr><tr><td>kleine Terz</td><td>Smoke on the Water · abwärts: Hänschen klein (Hän–schen)</td></tr><tr><td>große Terz</td><td>Oh When the Saints (Oh–when)</td></tr><tr><td>reine Quarte</td><td>O Tannenbaum (O–Tan), Hochzeitsmarsch aus Lohengrin</td></tr><tr><td>Tritonus</td><td>Maria (West Side Story)</td></tr><tr><td>reine Quinte</td><td>Morgen kommt der Weihnachtsmann (kommt–der), Star Wars</td></tr><tr><td>große Sexte</td><td>My Bonnie Is Over the Ocean</td></tr><tr><td>Oktave</td><td>Somewhere over the Rainbow (Some–where)</td></tr></table></div>` },
        { t: 'ex', h: 'Übung: große Schritte (Terz, Quinte, Oktave)', gen: 'ivEar', o: { set: ['g3', 'r5', 'r8'] }, n: 8, need: 6 },
        { t: 'ex', h: 'Übung: Sekunde bis Oktave', gen: 'ivEar', o: { set: ['g2', 'g3', 'r4', 'r5', 'r8'] }, n: 10, need: 7 },
        { t: 'read', h: 'Dur oder Moll?', body: `<p>Der wichtigste Unterschied im ganzen Hören: <b>Dur</b> klingt hell, offen, stabil – <b>Moll</b> dunkler, weicher, nachdenklich. Der Unterschied steckt nur in der Terz: große Terz (Dur) oder kleine Terz (Moll).</p><p>Hör dir beide an und achte nur auf das Gefühl, nicht auf die Töne.</p>[[0]]`, figs: [F.s('(C4 E4 G4)/h (C4 Eb4 G4)/h (A3 C#4 E4)/h (A3 C4 E4)/h', { cap: 'C-Dur – c-Moll – A-Dur – a-Moll.', bpm: 60 })] },
        { t: 'ex', h: 'Übung: Dur oder Moll?', gen: 'triadEar', o: { types: ['', 'm'] }, n: 10, need: 8 },
        { t: 'piano', h: 'Am Klavier: nach Gehör', body: '<p>Gehör und Hände verbinden – die ersten Schritte zum Nachspielen nach Gehör.</p>', checks: ['„Alle meine Entchen“ ab c¹ nach Gehör gefunden.', '„Morgen kommt der Weihnachtsmann“ ab c¹ nach Gehör gefunden.', 'Ein Lied deiner Wahl: die ersten 4 Töne nach Gehör gefunden.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['ivEar', { set: ['g2', 'g3', 'r4', 'r5', 'r8'] }, 6], ['triadEar', { types: ['', 'm'] }, 4]], pass: 0.75 }
      ],
      review: [['ivEar', { set: ['g2', 'g3', 'r4', 'r5', 'r8'] }], ['triadEar', { types: ['', 'm'] }]]
    }
  ]
});

/* =========================================================================
   KAPITEL IV · Akkorde
   ========================================================================= */
CUR.chapters.push({
  id: 'IV', title: 'Akkorde', sub: 'Der Schlüssel zum schnellen Lernen: Dreiklänge, Umkehrungen, Symbole, Stufen, Begleitung.', img: 'renoir2',
  warm: ['Dreiklänge in C-Dur auf jeder Stufe (C Dm Em F G Am H°), rechts 1-3-5, links 5-3-1.', 'C-Dur-Akkord durch alle Umkehrungen auf und ab (Grundstellung – Sextakkord – Quartsextakkord).', 'Kadenz I–IV–V–I in C, G und F, Griffe in nächster Lage.', 'Tonleiter des Tages (aus Kapitel III) beide Hände.'],
  must: ['bwv846', 'morgengebet'], more: ['melodie', 'choral', 'prelude-c', 'landmann', 'innocence'],
  exam: { n: 20, pass: 0.85, items: [['triadQual', { types: ['', 'm', 'dim', 'aug'], acc: true }, 3], ['triadBuild', { types: ['', 'm'], acc: true }, 2], ['inversion', {}, 2], ['symNotes', { types: ['', 'm', '7'] }, 2], ['notesSym', { types: ['', 'm'], inv: true }, 2], ['degree', { max: 3 }, 3], ['func', {}, 2], ['prog', { set: ['pop', 'sad', 'cad'] }, 2], ['triadEar', { types: ['', 'm', 'dim'] }, 1], ['pool', { id: 'begleitung' }, 1]] },
  lessons: [
    {
      id: '4.1', title: 'Dreiklänge: Dur und Moll', sub: 'Drei Töne, zwei Terzen – das Grundmaterial der Musik.', min: 30,
      goals: ['Dur- und Moll-Dreiklänge auf jedem Ton bauen', 'Dreiklänge im Notenbild als „Schneemann“ erkennen', 'Dur und Moll sicher hören'],
      steps: [
        { t: 'read', h: 'Terzen stapeln', body: `<p>Ein <b>Dreiklang</b> entsteht, wenn man auf einen Grundton zwei Terzen stapelt: Grundton – Terz – Quinte. Im Notenbild sieht das aus wie ein kleiner Schneemann: drei Noten auf drei Linien übereinander (oder in drei Zwischenräumen).</p>[[0]]<p>Je nachdem, welche Terzen man stapelt, entsteht ein anderer Klang:</p><ul><li><b>Dur</b>: unten große Terz (4 Halbtöne), oben kleine Terz (3) – zusammen die reine Quinte. Beispiel C-Dur: c – e – g.</li><li><b>Moll</b>: unten kleine Terz (3), oben große Terz (4). Beispiel c-Moll: c – es – g.</li></ul>${F.merk('Dur und Moll unterscheiden sich nur im <b>mittleren Ton</b>. Grundton und Quinte bleiben gleich.')}`, figs: [F.s('(C4 E4 G4)/h (C4 Eb4 G4)/h (D4 F#4 A4)/h (D4 F4 A4)/h', { cap: 'C-Dur – c-Moll – D-Dur – d-Moll: nur die Terz wandert.', bpm: 60 })] },
        { t: 'ex', h: 'Übung: Dur oder Moll im Notenbild', gen: 'triadQual', o: { types: ['', 'm'] }, n: 10, need: 8 },
        { t: 'read', h: 'Bauen in drei Sekunden', body: `<p>So greifst du jeden Dreiklang:</p><ol><li>Grundton greifen (Finger 1 rechts / 5 links).</li><li><b>Große Terz</b> = 4 Halbtöne höher (Finger 3). Für Moll einen Halbton tiefer.</li><li><b>Quinte</b> = 7 Halbtöne über dem Grundton (Finger 5 rechts / 1 links).</li></ol><p>Muster zum Merken: Die Dur-Dreiklänge auf C, F und G haben nur weiße Tasten. D, E und A haben die Terz auf einer schwarzen Taste (fis, gis, cis). Bei Moll ist es genau umgekehrt: Dm, Em und Am sind weiß.</p>[[0]]`, figs: [F.k('C4', 'B5', { C4: 'hl', E4: 'hl', G4: 'hl', A4: 'hl2', 'C#5': 'hl2', E5: 'hl2' }, { cap: 'C-Dur (weiß) und A-Dur (Terz cis schwarz).' })] },
        { t: 'ex', h: 'Übung: Akkorde greifen', gen: 'triadBuild', o: { types: ['', 'm'] }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Dur oder Moll hören', gen: 'triadEar', o: { types: ['', 'm'] }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier: Dreiklänge auf allen Stufen', body: '<p>Spiel auf jeder weißen Taste von c¹ bis h¹ einen Dreiklang nur aus weißen Tasten (Finger 1-3-5) und sag, ob er Dur oder Moll klingt.</p>[[0]]', figs: [F.s('(C4 E4 G4)/q (D4 F4 A4)/q (E4 G4 B4)/q (F4 A4 C5)/q (G4 B4 D5)/q (A4 C5 E5)/q (B4 D5 F5)/q (C5 E5 G5)/q', { names: false, cap: 'Die Dreiklänge der C-Dur-Tonleiter. Welche sind Dur, welche Moll – und was ist mit dem auf h?', bpm: 60 })], checks: ['Alle sieben Dreiklänge gespielt und Dur/Moll angesagt.', 'Ergebnis: C, F, G = Dur · Dm, Em, Am = Moll · der auf h klingt anders (nächste Lektion).', 'Dieselben Dreiklänge mit der linken Hand (5-3-1).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['triadQual', { types: ['', 'm'], acc: true }, 4], ['triadBuild', { types: ['', 'm'], acc: true }, 3], ['triadEar', { types: ['', 'm'] }, 3]], pass: 0.8 }
      ],
      review: [['triadQual', { types: ['', 'm'], acc: true }], ['triadBuild', { types: ['', 'm'], acc: true }], ['triadEar', { types: ['', 'm'] }]]
    },
    {
      id: '4.2', title: 'Vermindert und übermäßig', sub: 'Die zwei Spannungsakkorde.', min: 25,
      goals: ['verminderte und übermäßige Dreiklänge bauen und erkennen', 'wissen, wo sie in der Tonart vorkommen', 'ihren Klang zuordnen'],
      steps: [
        { t: 'read', h: 'Zwei gleiche Terzen', body: `<p>Stapelst du zwei <b>gleiche</b> Terzen, entstehen die beiden selteneren Dreiklänge:</p><ul><li><b>Vermindert</b> (°): kleine + kleine Terz, z. B. h – d – f. Die Quinte ist um einen Halbton zu klein (verminderte Quinte, Tritonus). Klang: eng, gespannt, unruhig.</li><li><b>Übermäßig</b> (+): große + große Terz, z. B. c – e – gis. Die Quinte ist zu groß. Klang: schwebend, unheimlich, wie im Traum.</li></ul>[[0]]<p>Der verminderte Dreiklang steht in Dur auf der <b>7. Stufe</b> (in C-Dur: h° = h–d–f). Er klingt wie ein Dominant-Akkord ohne Grundton und will sich nach C auflösen. Übermäßige Dreiklänge kommen meist als Durchgang vor – in Filmmusik gern für Magie und Rätsel.</p>`, figs: [F.s('(C4 E4 G4)/h (C4 Eb4 G4)/h (B3 D4 F4)/h (C4 E4 G#4)/h', { cap: 'Dur – Moll – vermindert (h°) – übermäßig (c+).', bpm: 56 })] },
        { t: 'ex', h: 'Übung: alle vier Dreiklänge', gen: 'triadQual', o: { types: ['', 'm', 'dim', 'aug'] }, n: 10, need: 8 },
        { t: 'ex', h: 'Übung: hören', gen: 'triadEar', o: { types: ['', 'm', 'dim', 'aug'], broken: true }, n: 8, need: 6 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Verwandle einen Akkord Schritt für Schritt: C-Dur → c-Moll (Terz runter) → c° (Quinte auch runter) → zurück → C+ (Quinte rauf).</p>', checks: ['Die Verwandlung auf c, f und g gespielt.', 'h° → C mehrmals gespielt und die Auflösung gehört (h → c, f → e).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['triadQual', { types: ['', 'm', 'dim', 'aug'], acc: true }, 6], ['triadEar', { types: ['', 'm', 'dim', 'aug'], broken: true }, 2], ['pool', { id: 'dreiklang' }, 2]], pass: 0.8 }
      ],
      review: [['triadQual', { types: ['', 'm', 'dim', 'aug'], acc: true }], ['pool', { id: 'dreiklang' }]]
    },
    {
      id: '4.3', title: 'Umkehrungen', sub: 'Gleicher Akkord, anderer Ton unten.', min: 30,
      goals: ['Grundstellung, Sextakkord und Quartsextakkord erkennen', 'den Grundton in jeder Umkehrung finden', 'Akkordwechsel mit minimaler Handbewegung spielen'],
      steps: [
        { t: 'read', h: 'Den untersten Ton nach oben', body: `<p>Legst du den untersten Ton eines Dreiklangs eine Oktave höher, bleibt es derselbe Akkord – nur in anderer Anordnung. Das nennt man <b>Umkehrung</b>:</p><ul><li><b>Grundstellung</b>: Grundton unten (c–e–g). Zwei Terzen – „Schneemann“.</li><li><b>1. Umkehrung (Sextakkord)</b>: Terz unten (e–g–c). Unten eine Terz, oben eine Quarte.</li><li><b>2. Umkehrung (Quartsextakkord)</b>: Quinte unten (g–c–e). Unten eine Quarte, oben eine Terz.</li></ul>[[0]]${F.merk('<b>Grundton finden:</b> Er sitzt immer <b>über der Quarte</b>. Findest du keine Quarte, ist es die Grundstellung – dann ist der unterste Ton der Grundton.')}`, figs: [F.s('(C4 E4 G4)/h (E4 G4 C5)/h (G4 C5 E5)/h (C5 E5 G5)/h', { cap: 'C-Dur: Grundstellung – Sextakkord – Quartsextakkord – Grundstellung.', bpm: 60 })] },
        { t: 'ex', h: 'Übung: Welche Stellung?', gen: 'inversion', o: {}, n: 10, need: 8 },
        { t: 'read', h: 'Warum Umkehrungen so wichtig sind', body: `<p>Wechselst du von C nach F nach G immer in Grundstellung, springt die Hand jedes Mal. Mit Umkehrungen bleibt sie fast still, weil die Akkorde <b>gemeinsame Töne</b> haben:</p>[[0]]<p>Das nennt man <b>Stimmführung</b>: Jeder Finger geht den kürzesten Weg. Genau so spielen Pianisten Begleitungen – und genau so lernst du Lieder in Minuten statt Stunden (Lektion 4.7).</p><p>In Akkordsymbolen schreibt man eine Umkehrung mit Schrägstrich: <b>C/E</b> heißt „C-Dur mit e im Bass“.</p>`, figs: [F.s([{ r: '(C4 E4 G4)/h (C4 F4 A4)/h' }, { r: '(B3 D4 G4)/h (C4 E4 G4)/h' }], { time: 'C', cap: 'I–IV–V–I in C: C (Grundstellung) – F (Quartsext) – G (Sext) – C. Die Hand bleibt in einer Lage.', bpm: 66 })] },
        { t: 'ex', h: 'Übung: Akkord trotz Umkehrung erkennen', gen: 'notesSym', o: { types: ['', 'm'], inv: true }, n: 10, need: 8 },
        { t: 'piece', h: 'Bach: Präludium C-Dur', id: 'bwv846', body: '<p>Jetzt verstehst du eines der berühmtesten Stücke überhaupt: Jeder Takt im <b>Präludium C-Dur</b> ist ein gebrochener Akkord – oft in Umkehrung. Lerne es so: erst jeden Takt als Blockgriff, dann gebrochen.</p>' },
        { t: 'piano', h: 'Am Klavier', body: '<p>Akkorde mit Umkehrungen in nächster Lage – die wichtigste Begleit-Technik.</p>', checks: ['C-Dur durch alle Umkehrungen auf- und abwärts (rechts).', 'I–IV–V–I in C wie im Beispiel, dann in G-Dur (G – C/G – D/Fis – G) und F-Dur.', 'Präludium C-Dur: Takt 1–4 als Blockakkorde gespielt.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['inversion', {}, 4], ['notesSym', { types: ['', 'm'], inv: true }, 4], ['pool', { id: 'umkehrung' }, 2]], pass: 0.8 }
      ],
      review: [['inversion', {}], ['notesSym', { types: ['', 'm'], inv: true }], ['pool', { id: 'umkehrung' }]]
    },
    {
      id: '4.4', title: 'Akkordsymbole lesen', sub: 'Am, G7, Cmaj7, Dsus4, C/E – und die B/H-Falle.', min: 30,
      goals: ['alle gängigen Akkordsymbole lesen und greifen', 'internationale und deutsche Schreibweise unterscheiden', 'aus Noten das passende Symbol bestimmen'],
      steps: [
        { t: 'read', h: 'Die Kurzschrift der Begleitung', body: `<p>In Liederbüchern, Pop-Noten und Lead Sheets stehen über der Melodie nur <b>Akkordsymbole</b>. Der Buchstabe ist der Grundton, der Zusatz die Art:</p><div class="tablewrap"><table><tr><th>Symbol</th><th>Bedeutung</th><th>Beispiel</th></tr><tr><td>C</td><td>Dur</td><td>c e g</td></tr><tr><td>Cm (auch Cmi, c)</td><td>Moll</td><td>c es g</td></tr><tr><td>C7</td><td>Dur + kleine Septime</td><td>c e g b</td></tr><tr><td>Cmaj7 (CΔ)</td><td>Dur + große Septime</td><td>c e g h</td></tr><tr><td>Cm7</td><td>Moll + kleine Septime</td><td>c es g b</td></tr><tr><td>C° / Cdim</td><td>vermindert</td><td>c es ges</td></tr><tr><td>C+ / Caug</td><td>übermäßig</td><td>c e gis</td></tr><tr><td>Csus4 / Csus2</td><td>Terz ersetzt durch Quarte / Sekunde</td><td>c f g / c d g</td></tr><tr><td>Cadd9</td><td>Dur + None (d eine Oktave höher)</td><td>c e g d</td></tr><tr><td>C/E</td><td>C-Dur mit e im Bass</td><td>e – c e g</td></tr></table></div>` },
        { t: 'read', h: 'Die B/H-Falle', body: `<p>Fast alle Noten, Lead Sheets und Apps sind international beschriftet. Dort heißt der Ton, den wir <b>H</b> nennen, <b>B</b> – und unser b heißt <b>B♭ (Bb)</b>.</p>${F.warn('<b>In internationalen Akkordsymbolen ist „B“ = H-Dur</b> (h dis fis) und „Bb“ = B-Dur (b d f). „Bm“ ist h-Moll. Prüf bei jedem Liederbuch, welche Schreibweise es benutzt!')}<p>Notenweg zeigt Akkordsymbole in deutscher Schreibweise (H, B), weil du so die Töne direkt benennst. Wenn du aus englischen Noten spielst: B → H umdenken.</p>` },
        { t: 'ex', h: 'Übung: Symbol → Töne', gen: 'symNotes', o: { types: ['', 'm', '7'] }, n: 10, need: 8 },
        { t: 'ex', h: 'Übung: Töne → Symbol', gen: 'notesSym', o: { types: ['', 'm'] }, n: 8, need: 7 },
        { t: 'read', h: 'sus, add9 und Slash: die Neoklassik-Farben', body: `<p>Viele moderne Klavierstücke (Einaudi, Tony Ann, Filmmusik) leben von Akkorden <b>ohne klare Terz</b> oder mit Zusatztönen:</p><ul><li><b>sus2 / sus4</b>: Die Terz wird durch die Sekunde oder Quarte ersetzt. Der Akkord ist weder Dur noch Moll – offen, schwebend. sus4 will sich oft zur Terz auflösen.</li><li><b>add9</b>: Dur oder Moll mit zusätzlicher None (der Sekunde eine Oktave höher). Hell und modern.</li><li><b>Slash-Akkorde</b> (Am/G, F/C): Der Bass bewegt sich, der Akkord bleibt – so entstehen die typischen absteigenden Basslinien.</li></ul>[[0]]`, figs: [F.s('(C4 F4 G4)/h (C4 E4 G4)/h (C4 D4 G4)/h (A3 C4 E4 B4)/h', { cap: 'Csus4 → C · Csus2 · Am(add9).', bpm: 56 })] },
        { t: 'piano', h: 'Am Klavier', body: '<p>Lies die Symbole und greif sie mit der rechten Hand, links den Grundton.</p>[[0]]', figs: [F.s([{ r: 'x/w', chords: [[0, 'Am']] }, { r: 'x/w', chords: [[0, 'F']] }, { r: 'x/w', chords: [[0, 'C']] }, { r: 'x/w', chords: [[0, 'G']] }], { time: 'C', play: false, cap: 'Am – F – C – G: die berühmteste Pop-Folge (vi–IV–I–V).' })], checks: ['Am – F – C – G als Griffe gespielt, links Grundtöne.', 'Dieselbe Folge in nächster Lage (möglichst wenig Bewegung).', 'Dsus4 → D und Asus2 → A gespielt.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['symNotes', { types: ['', 'm', '7', 'maj7'] }, 4], ['notesSym', { types: ['', 'm'], inv: true }, 3], ['pool', { id: 'symbole' }, 3]], pass: 0.8 }
      ],
      review: [['symNotes', { types: ['', 'm', '7', 'maj7'] }], ['notesSym', { types: ['', 'm'], inv: true }], ['pool', { id: 'symbole' }]]
    },
    {
      id: '4.5', title: 'Stufen und Funktionen', sub: 'Welche Akkorde zu einer Tonart gehören – und was sie tun.', min: 30,
      goals: ['die Stufenakkorde jeder Dur-Tonart bilden', 'Tonika, Subdominante und Dominante erkennen', 'römische Stufenzahlen lesen'],
      steps: [
        { t: 'read', h: 'Sieben Akkorde pro Tonart', body: `<p>Baust du auf jeder Stufe einer Tonleiter einen Dreiklang – nur aus Tönen der Tonart –, bekommst du die <b>Stufenakkorde</b>. In jeder Dur-Tonart gilt dasselbe Muster:</p>${F.merk('<b>Dur:</b> I (Dur) · ii (Moll) · iii (Moll) · IV (Dur) · V (Dur) · vi (Moll) · vii° (vermindert)')}<p>Große römische Zahlen = Dur, kleine = Moll. In C-Dur: <b>C · Dm · Em · F · G · Am · H°</b>. In G-Dur: G · Am · Hm · C · D · Em · Fis°.</p>[[0]]<p><b>Moll</b> (mit dem Leitton aus harmonisch Moll): i (Moll) · ii° · III (Dur) · iv (Moll) · <b>V (Dur!)</b> · VI (Dur) · vii°. In a-Moll: Am · H° · C · Dm · <b>E</b> · F · Gis°.</p>`, figs: [F.s([{ r: '(C4 E4 G4)/q (D4 F4 A4)/q (E4 G4 B4)/q (F4 A4 C5)/q', chords: [[0, 'I'], [1, 'ii'], [2, 'iii'], [3, 'IV']] }, { r: '(G4 B4 D5)/q (A4 C5 E5)/q (B4 D5 F5)/q (C5 E5 G5)/q', chords: [[0, 'V'], [1, 'vi'], [2, 'vii°'], [3, 'I']] }], { time: 'C', cap: 'Die Stufenakkorde von C-Dur mit römischen Zahlen.', bpm: 66 })] },
        { t: 'ex', h: 'Übung: Stufenakkorde', gen: 'degree', o: { max: 3 }, n: 10, need: 8 },
        { t: 'read', h: 'Tonika, Subdominante, Dominante', body: `<p>Drei Stufen sind die Hauptdarsteller. Ihre Rolle nennt man <b>Funktion</b>:</p><ul><li><b>Tonika (T, I)</b> – Zuhause, Ruhe. Stücke beginnen und enden fast immer hier.</li><li><b>Dominante (D, V)</b> – Spannung. Sie enthält den Leitton und drängt zurück zur Tonika.</li><li><b>Subdominante (S, IV)</b> – Aufbruch, Weg von zu Hause, oft Vorbereitung der Dominante.</li></ul><p>Die Moll-Stufen vertreten oft die Hauptfunktionen: vi (Am in C) ist die „Moll-Schwester“ der Tonika, ii (Dm) die der Subdominante.</p>[[0]]`, figs: [F.s([{ r: '(E4 G4 C5)/h (F4 A4 C5)/h', l: 'C3/h F3/h', chords: [[0, 'T'], [2, 'S']] }, { r: '(D4 G4 B4)/h (E4 G4 C5)/h', l: 'G2/h C3/h', chords: [[0, 'D'], [2, 'T']] }], { grand: true, time: 'C', cap: 'T – S – D – T: Heimat – Aufbruch – Spannung – Heimkehr.', bpm: 60 })] },
        { t: 'ex', h: 'Übung: Funktionen', gen: 'func', o: {}, n: 8, need: 7 },
        { t: 'piece', h: 'Choräle', id: 'morgengebet', body: '<p>Tschaikowskys <b>Morgengebet</b> und Schumanns <b>Choral</b> sind vierstimmige Akkordsätze – such darin I, IV und V und schau, wie die Phrasen enden.</p>' },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel in C-, G- und F-Dur die Stufenakkorde auf und ab und sag die römischen Zahlen.</p>', checks: ['C-Dur: I bis vii° und zurück.', 'G-Dur und F-Dur dasselbe – achte auf fis bzw. b.', 'a-Moll mit E-Dur als V (gis!).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['degree', { max: 4 }, 5], ['func', {}, 3], ['degree', { max: 2, minor: true }, 2], ['pool', { id: 'stufen' }, 2]], pass: 0.8 }
      ],
      review: [['degree', { max: 4 }], ['func', {}], ['pool', { id: 'stufen' }]]
    },
    {
      id: '4.6', title: 'Kadenzen und Akkordfolgen', sub: 'Die Muster hinter Tausenden von Stücken.', min: 35,
      goals: ['die wichtigsten Akkordfolgen in jeder Tonart spielen', 'Folgen in römischen Zahlen denken und transponieren', 'sie in Liedern und Filmmusik wiedererkennen'],
      steps: [
        { t: 'read', h: 'Die Kadenz', body: `<p>Die Folge <b>I – IV – V – I</b> heißt <b>Kadenz</b> (von lateinisch „fallen“): Sie definiert eine Tonart vollständig – alle sieben Töne kommen vor. Hörst du sie, weißt du, wo „zu Hause“ ist.</p>[[0]]<p>Weil sie in römischen Zahlen gedacht wird, funktioniert sie in jeder Tonart gleich: In G-Dur ist sie G – C – D – G, in F-Dur F – B – C – F (deutsch B = b-d-f!).</p>`, figs: [F.s([{ r: '(E4 G4 C5)/h (F4 A4 C5)/h', l: 'C3/h F3/h', chords: [[0, 'C'], [2, 'F']] }, { r: '(D4 G4 B4)/h (E4 G4 C5)/h', l: 'G2/h C3/h', chords: [[0, 'G'], [2, 'C']] }], { grand: true, time: 'C', cap: 'Kadenz in C-Dur.', bpm: 66 })] },
        { t: 'read', h: 'Die berühmten Folgen', body: `<div class="tablewrap"><table><tr><th>Folge</th><th>in C-Dur / a-Moll</th><th>klingt nach</th></tr><tr><td>I – V – vi – IV</td><td>C – G – Am – F</td><td>Pop-Hymne (Let It Be, unzählige Charts)</td></tr><tr><td>vi – IV – I – V</td><td>Am – F – C – G</td><td>melancholischer Pop, Neoklassik</td></tr><tr><td>I – vi – IV – V</td><td>C – Am – F – G</td><td>50er-Jahre, „Stand by Me“-Gefühl</td></tr><tr><td>ii – V – I</td><td>Dm – G – C</td><td>Jazz, elegante Schlüsse</td></tr><tr><td>Pachelbel</td><td>C – G – Am – Em – F – C – F – G</td><td>Kanon in D, Hochzeiten</td></tr><tr><td>i – VI – III – VII (Moll)</td><td>Am – F – C – G</td><td>Filmmusik, episch</td></tr></table></div><p>Fällt dir etwas auf? Die Pop-Folge und die Moll-Folge benutzen dieselben vier Akkorde – nur der Startpunkt (und damit das Zuhause) ist anders. Genau mit diesen Folgen arbeiten Einaudi, Tony Ann und viele Filmkomponisten.</p>` },
        { t: 'ex', h: 'Übung: Folgen in anderen Tonarten', gen: 'prog', o: { set: ['pop', 'sad', 'cad', 'twofive'] }, n: 8, need: 7 },
        { t: 'tool', h: 'Der Begleiter', tool: 'begleiter', body: '<p>Wähle Tonart, Folge und Muster. Der Begleiter spielt die linke Hand – du spielst rechts die Akkorde mit oder improvisierst mit den markierten Tönen.</p>' },
        { t: 'piano', h: 'Am Klavier', body: '<p>Jede Folge erst als Griffe in nächster Lage (rechts), links der Grundton.</p>', checks: ['I–V–vi–IV in C, G und D.', 'vi–IV–I–V in C und G.', 'Die Moll-Folge i–VI–III–VII in a-Moll und e-Moll.', 'Mit dem Begleiter 2 Minuten rechts frei improvisiert (nur Töne der Tonart).'] },
        { t: 'piece', h: 'Chopin in 13 Takten', id: 'prelude-c', body: '<p>Das <b>Prélude c-Moll</b> von Chopin besteht nur aus Akkorden – und ist trotzdem überwältigend. Bestimme die Akkorde der ersten vier Takte.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['prog', { set: ['pop', 'sad', 'cad', 'twofive', 'minor'] }, 6], ['degree', { max: 4 }, 2], ['pool', { id: 'folgen' }, 3]], pass: 0.8 }
      ],
      review: [['prog', { set: ['pop', 'sad', 'cad', 'twofive', 'minor'] }], ['pool', { id: 'folgen' }]]
    },
    {
      id: '4.7', title: 'Die Lead-Sheet-Methode', sub: 'Melodie + Akkordsymbole = ein Lied in Minuten.', min: 35,
      goals: ['aus einem Lead Sheet eine Begleitung in drei Stufen erzeugen', 'Griffe immer in der nächsten Lage wählen', 'ein neues Lied in unter 15 Minuten spielbar machen'],
      steps: [
        { t: 'read', h: 'Was ist ein Lead Sheet?', body: `<p>Ein <b>Lead Sheet</b> enthält nur die Melodie (eine Zeile) und darüber die Akkordsymbole. Die linke Hand erfindest du selbst. So arbeiten Jazz-, Pop- und Barpianisten – und so lernst du Lieder unvergleichlich schneller als Note für Note.</p>[[0]]`, figs: [F.s(C2.buildLH(SONG('morgen'), 0), { time: SONG('morgen').time, cap: '„Morgen kommt der Weihnachtsmann“ als Lead Sheet (Melodie aus „Ah! vous dirai-je, maman“, gemeinfrei).', bpm: 100 })] },
        { t: 'read', h: 'Drei Stufen für die linke Hand', body: `<ol><li><b>Grundton</b>: Bei jedem Akkordwechsel nur den Grundton des Symbols, lang aushalten.</li><li><b>Griff</b>: den ganzen Akkord als Block – immer in der <b>nächsten Lage</b> zum vorigen (Umkehrungen!).</li><li><b>Muster</b>: den Akkord rhythmisch auflösen – Walzer, Alberti, gebrochen (Lektion 4.8) – mit Pedal.</li></ol>[[0]][[1]]${F.merk('<b>Die Methode für jedes neue Lied:</b> Tonart und Takt ansehen → Akkorde einmal als Griffe spielen → Melodie rechts → zusammen mit Stufe 1 → Stufe 2 → Stufe 3.')}`, figs: [F.s(C2.buildLH(SONG('morgen'), 1).slice(0, 4), { grand: true, time: SONG('morgen').time, cap: 'Stufe 1: Grundtöne.', bpm: 100 }), F.s(C2.buildLH(SONG('morgen'), 2).slice(0, 4), { grand: true, time: SONG('morgen').time, cap: 'Stufe 2: Griffe in nächster Lage.', bpm: 100 })] },
        { t: 'ex', h: 'Übung: Symbole schnell lesen', gen: 'symNotes', o: { types: ['', 'm', '7'] }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier: Blitz-Lernen', body: '<p>Stoppuhr an: Lerne „Morgen kommt der Weihnachtsmann“ nach dem Lead Sheet oben, bis du es einmal ohne Anhalten spielen kannst (Stufe 2 links). Notiere die Zeit.</p>', checks: ['Akkorde einmal als Griffe in nächster Lage gespielt.', 'Melodie rechts aus den Noten.', 'Zusammen mit Stufe 1, dann Stufe 2 – einmal ohne Anhalten.', 'Zeit notiert (sie wird bei jedem Lied kürzer).'] },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'leadsheet' }, 5], ['symNotes', { types: ['', 'm', '7'] }, 3], ['notesSym', { types: ['', 'm'], inv: true }, 2]], pass: 0.8 }
      ],
      review: [['pool', { id: 'leadsheet' }], ['symNotes', { types: ['', 'm', '7'] }]]
    },
    {
      id: '4.8', title: 'Begleitmuster', sub: 'Walzer, Alberti, gebrochen, Neoklassik-Arpeggio.', min: 35,
      goals: ['fünf Begleitmuster aus jedem Akkordsymbol spielen', 'das passende Muster zu Taktart und Stil wählen', 'das Neoklassik-Arpeggio 1-5-8-10 beherrschen'],
      steps: [
        { t: 'read', h: 'Ein Akkord, viele Rhythmen', body: `<p>Ein <b>Begleitmuster</b> verwandelt einen stillen Griff in Bewegung. Die wichtigsten:</p><ul><li><b>Grundton + Akkord</b> (Walzer im 3/4: Bass – Akkord – Akkord; Marsch im 2/4: Bass – Akkord)</li><li><b>Alberti-Bass</b>: unten – oben – Mitte – oben (c–g–e–g). Klassik pur – Mozart, Clementi.</li><li><b>Gebrochen 1-5-8</b>: Grundton – Quinte – Oktave – Quinte. Weich, fließend.</li><li><b>Neoklassik 1-5-8-10</b>: Grundton – Quinte – Oktave – Dezime (Terz eine Oktave höher). Der Einaudi-Klang – weit, mit Pedal.</li></ul>[[0]][[1]]`, figs: [F.s([{ l: 'C3/8 G3/8 E3/8 G3/8 C3/8 G3/8 E3/8 G3/8' }, { l: 'C3/8 G3/8 C4/8 E4/8 C4/8 G3/8 C4/8 G3/8' }], { clef: 'bass', time: 'C', cap: 'Alberti-Bass und Neoklassik-Arpeggio (1-5-8-10) auf C.', bpm: 76 }), F.s([{ l: 'C3/q (E3 G3)/q (E3 G3)/q' }, { l: 'B2/q (D3 G3)/q (D3 G3)/q' }], { clef: 'bass', time: '3/4', cap: 'Walzer: Bass – Akkord – Akkord.', bpm: 110 })] },
        { t: 'tool', h: 'Probier die Muster', tool: 'begleiter', body: '<p>Wähle verschiedene Muster und höre, wie dieselbe Akkordfolge ihren Charakter ändert.</p>' },
        { t: 'read', h: 'Welches Muster wann?', body: `<ul><li><b>3/4-Takt</b> → Walzer. <b>2/4</b> → Marsch/Polka.</li><li><b>Klassik</b> (Mozart-Stil) → Alberti, leise und gleichmäßig.</li><li><b>Ruhige Lieder, Balladen</b> → gebrochen 1-5-8 mit Pedal.</li><li><b>Neoklassik, Filmmusik</b> → 1-5-8-10 oder 1-5-8-9 (mit None), Pedal pro Akkord, große Bögen.</li></ul><p>Pedal ist hier dein Freund – genaue Technik folgt in Lektion 5.4. Für jetzt: Pedal genau beim Akkordwechsel kurz hoch und wieder runter.</p>` },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm die Folge Am – F – C – G und spiel jedes Muster eine Minute lang. Rechts erst nur den obersten Akkordton, dann eine eigene Melodie.</p>', checks: ['Alberti-Bass über die Folge.', 'Gebrochen 1-5-8 mit Pedal.', 'Neoklassik 1-5-8-10 mit Pedal – langsam, große Bewegung aus dem Arm.', 'Walzer mit einer 3/4-Folge (C – G – G – C).'] },
        { t: 'piece', h: 'Melodie im Bass', id: 'landmann', body: '<p>Im <b>Fröhlichen Landmann</b> liegt die Melodie links und die Akkorde rechts – das umgedrehte Muster. Auch <b>Innocence</b> von Burgmüller (Walzerbegleitung) ist jetzt offen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'begleitung' }, 6], ['prog', { set: ['pop', 'sad', 'minor'] }, 2], ['degree', { max: 3 }, 2]], pass: 0.8 }
      ],
      review: [['pool', { id: 'begleitung' }], ['prog', { set: ['pop', 'sad', 'minor'] }]]
    }
  ]
});

/* ===== Notenweg 3 · Lernpfad Teil C: Kapitel V–VI ===== */

/* =========================================================================
   KAPITEL V · Ausdruck
   ========================================================================= */
CUR.chapters.push({
  id: 'V', title: 'Ausdruck', sub: 'Dynamik, Anschlag, Pedal, Melodie über Begleitung, Phrasierung – aus Noten Musik machen.', img: 'ancher',
  warm: ['Fünftonlage C: einmal pp, einmal mf, einmal f – derselbe Klang, nur Gewicht und Tempo des Tastendrucks ändern sich.', 'Crescendo über c–d–e–f–g, decrescendo zurück.', 'Staccato und legato im Wechsel (2 Töne gebunden, 2 kurz).', 'Synkopisches Pedal: C – F – G – C als Griffe, Pedal nach jedem Anschlag wechseln.'],
  must: ['prelude-e', 'franz-weise'], more: ['mondschein', 'waisenkind', 'wilder-reiter', 'ballade', 'erster-verlust'],
  exam: { n: 18, pass: 0.85, items: [['dynOrder', {}, 2], ['term', { cats: ['Dynamik'] }, 3], ['term', { cats: ['Vortrag'] }, 3], ['symbol', {}, 3], ['pool', { id: 'pedal' }, 3], ['pool', { id: 'voicing' }, 2], ['pool', { id: 'phrase' }, 2]] },
  lessons: [
    {
      id: '5.1', title: 'Dynamik', sub: 'Von pianissimo bis fortissimo – und wie man es macht.', min: 25,
      goals: ['alle Lautstärkezeichen lesen und unterscheiden', 'Lautstärke über Gewicht und Tastengeschwindigkeit steuern', 'Crescendo und Decrescendo planen'],
      steps: [
        { t: 'read', h: 'Die Lautstärke-Leiter', body: `<p>Die Lautstärke heißt in der Musik <b>Dynamik</b>. Die Zeichen sind italienische Abkürzungen:</p><div class="tablewrap"><table><tr><th>Zeichen</th><th>Name</th><th>Bedeutung</th></tr><tr><td class="dyn">pp</td><td>pianissimo</td><td>sehr leise</td></tr><tr><td class="dyn">p</td><td>piano</td><td>leise</td></tr><tr><td class="dyn">mp</td><td>mezzopiano</td><td>halbleise</td></tr><tr><td class="dyn">mf</td><td>mezzoforte</td><td>halblaut</td></tr><tr><td class="dyn">f</td><td>forte</td><td>laut</td></tr><tr><td class="dyn">ff</td><td>fortissimo</td><td>sehr laut</td></tr></table></div><p>Dazu: <b>cresc.</b> (crescendo, lauter werden) und <b>decresc.</b> / <b>dim.</b> (leiser werden) – auch als Gabeln (&lt; und &gt;) geschrieben. <b>sf</b> (sforzato) = plötzlich stark betont, <b>fp</b> = laut, sofort leise, <b>subito</b> = plötzlich.</p>[[0]]`, figs: [F.s([{ r: 'C4/q!d=p D4/q!h=< E4/q F4/q' }, { r: 'G4/h!d=f!h=. G4/h!h=>' }, { r: 'F4/q E4/q D4/q E4/q!h=.' }, { r: 'C4/w!d=pp', end: '|.' }], { time: 'C', bpm: 84, cap: 'p – crescendo – f – decrescendo – pp.' })] },
        { t: 'ex', h: 'Übung: Reihenfolge', gen: 'dynOrder', n: 6, need: 5 },
        { t: 'ex', h: 'Übung: Zeichen und Bedeutung', gen: 'term', o: { cats: ['Dynamik'] }, n: 8, need: 7 },
        { t: 'read', h: 'Laut heißt nicht hart', body: `<p>Die Lautstärke entsteht durch die <b>Geschwindigkeit</b>, mit der die Taste nach unten geht – nicht durch Druck, wenn sie schon unten ist. Darum:</p><ul><li><b>Leise</b>: Finger ganz nah an der Taste, langsam und gleichmäßig nach unten, wenig Armgewicht.</li><li><b>Laut</b>: mehr Armgewicht, schnellere Bewegung – aber das Handgelenk bleibt elastisch, sonst wird der Klang hart und es tut weh.</li><li>Dynamik ist <b>relativ</b>: ff in einem Kinderstück ist nicht ff in Rachmaninow. Entscheidend sind die Unterschiede.</li></ul>${F.merk('<b>Plane ein Crescendo:</b> Beginne es leiser, als du denkst, sonst bist du nach zwei Takten schon oben. Der Höhepunkt ist meist nur ein Ton.')}` },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel das Beispiel oben mit genau der notierten Dynamik. Nimm dich auf und hör nach: Ist der Unterschied zwischen p und f wirklich hörbar?</p>', checks: ['Fünftonlage in pp, p, mf, f, ff – fünf klar verschiedene Stufen.', 'Crescendo über vier Takte gleichmäßig verteilt.', 'Aufnahme angehört: Dynamik deutlich?'] },
        { t: 'test', h: 'Abschlusstest', gens: [['dynOrder', {}, 2], ['term', { cats: ['Dynamik'] }, 6], ['pool', { id: 'dynamik' }, 2]], pass: 0.8 }
      ],
      review: [['dynOrder', {}], ['term', { cats: ['Dynamik'] }]]
    },
    {
      id: '5.2', title: 'Artikulation und Anschlag', sub: 'Legato, Staccato, Tenuto, Akzent – die Aussprache der Musik.', min: 30,
      goals: ['alle Artikulationszeichen lesen', 'Staccato aus dem Handgelenk und aus den Fingern spielen', 'Artikulation als Charakter einsetzen'],
      steps: [
        { t: 'read', h: 'Wie lang, wie betont?', body: `<p><b>Artikulation</b> sagt, wie ein Ton beginnt und endet – wie die Aussprache bei Worten.</p><div class="tablewrap"><table><tr><th>Zeichen</th><th>Name</th><th>Bedeutung</th></tr><tr><td>Bogen</td><td>legato</td><td>gebunden</td></tr><tr><td>Punkt</td><td>staccato</td><td>kurz, abgesetzt (ca. halbe Dauer)</td></tr><tr><td>Keil</td><td>staccatissimo</td><td>sehr kurz</td></tr><tr><td>Strich</td><td>tenuto</td><td>voll aushalten, leicht gewichtet</td></tr><tr><td>Punkt + Bogen</td><td>portato</td><td>leicht getrennt, getragen</td></tr><tr><td>&gt;</td><td>Akzent</td><td>betont</td></tr><tr><td>^</td><td>marcato</td><td>stark betont</td></tr></table></div>[[0]]<p>Steht nichts da, spielst du im Zweifel <b>non legato</b> (leicht getrennt) in barocker Musik und <b>legato</b> in romantischer.</p>`, figs: [F.s([{ r: 'C4/q!( D4/q E4/q F4/q!)' }, { r: 'G4/q!st G4/q!st G4/q!tn G4/q!ac' }, { r: 'C5/h!ac C5/h!fe', end: '|.' }], { time: 'C', bpm: 84, cap: 'Legato – staccato – tenuto – Akzent – Fermate.' })] },
        { t: 'ex', h: 'Übung: Zeichen erkennen', gen: 'symbol', o: { set: ['st', 'tn', 'ac', 'fe', 'slur', 'tie'] }, n: 8, need: 7 },
        { t: 'read', h: 'Staccato richtig', body: `<ul><li><b>Handgelenk-Staccato</b> (für Akkorde und laute Stellen): Die Hand federt aus dem lockeren Handgelenk, wie beim Dribbeln eines Balls.</li><li><b>Finger-Staccato</b> (für schnelle, leise Stellen): Die Fingerkuppe „kratzt“ kurz zur Handfläche hin – wie ein Krümel von der Tischdecke schnippen.</li><li>Staccato heißt <b>kurz, nicht laut</b>. Viele spielen es versehentlich mit Akzent.</li></ul>` },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm die C-Dur-Tonleiter und spiel sie viermal: legato, staccato (Handgelenk), staccato (Finger), und abwechselnd zwei gebunden – zwei kurz.</p>', checks: ['Tonleiter in vier Artikulationen.', 'Akkorde C–F–G–C im Handgelenk-Staccato, locker federnd.', 'In deinem aktuellen Stück alle Artikulationszeichen markiert und umgesetzt.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['symbol', { set: ['st', 'tn', 'ac', 'fe', 'slur', 'tie'] }, 5], ['term', { cats: ['Artikulation'] }, 3], ['pool', { id: 'artikulation' }, 2]], pass: 0.8 }
      ],
      review: [['symbol', { set: ['st', 'tn', 'ac', 'fe', 'slur', 'tie'] }], ['term', { cats: ['Artikulation'] }]]
    },
    {
      id: '5.3', title: 'Vortragsbezeichnungen', sub: 'Dolce, cantabile, rit., a tempo – was der Komponist sich wünscht.', min: 25,
      goals: ['die 30 häufigsten Vortragsbezeichnungen verstehen', 'Tempoänderungen (rit., accel., a tempo) umsetzen', 'aus Bezeichnungen den Charakter eines Stücks ableiten'],
      steps: [
        { t: 'read', h: 'Charakter-Wörter', body: `<p>Neben Tempo und Dynamik schreiben Komponisten, <b>wie</b> etwas klingen soll:</p><div class="tablewrap"><table><tr><th>Wort</th><th>Bedeutung</th></tr><tr><td>dolce</td><td>süß, zart</td></tr><tr><td>cantabile</td><td>singend</td></tr><tr><td>espressivo (espr.)</td><td>ausdrucksvoll</td></tr><tr><td>leggiero</td><td>leicht</td></tr><tr><td>grazioso</td><td>anmutig</td></tr><tr><td>maestoso</td><td>majestätisch</td></tr><tr><td>con brio</td><td>mit Schwung, Feuer</td></tr><tr><td>agitato</td><td>aufgeregt</td></tr><tr><td>tranquillo</td><td>ruhig</td></tr><tr><td>sempre</td><td>immer (sempre pp = durchgehend pp)</td></tr><tr><td>più / meno</td><td>mehr / weniger</td></tr><tr><td>subito</td><td>plötzlich</td></tr></table></div>` },
        { t: 'read', h: 'Das Tempo verändern', body: `<div class="tablewrap"><table><tr><th>Wort</th><th>Bedeutung</th></tr><tr><td>ritardando (rit.), rallentando (rall.)</td><td>langsamer werden</td></tr><tr><td>accelerando (accel.)</td><td>schneller werden</td></tr><tr><td>a tempo</td><td>zurück zum Grundtempo</td></tr><tr><td>Tempo primo (Tempo I)</td><td>zurück zum Anfangstempo</td></tr><tr><td>rubato</td><td>frei im Tempo, atmend</td></tr><tr><td>morendo, smorzando</td><td>ersterbend, verlöschend (leiser und langsamer)</td></tr><tr><td>poco a poco</td><td>nach und nach</td></tr><tr><td>Fermate (𝄐)</td><td>Ton oder Pause länger aushalten</td></tr></table></div>${F.merk('Ein Ritardando ist ein gleichmäßiges Bremsen – nicht plötzlich halbes Tempo. Und es beginnt erst dort, wo es steht.')}` },
        { t: 'ex', h: 'Übung: Bezeichnungen', gen: 'term', o: { cats: ['Vortrag'] }, n: 10, need: 8 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm ein Stück, das du kannst (z. B. das Menuett oder die Mondscheinsonate) und spiel den Schluss einmal ohne und einmal mit ritardando.</p>', checks: ['Schluss mit gleichmäßigem Ritardando gespielt.', 'In deinem Pflichtstück alle Vortragsbezeichnungen gefunden und übersetzt.'] },
        { t: 'piece', h: 'Ausdrucksstücke', id: 'ballade', body: '<p>Burgmüllers <b>Ballade</b> (dramatisch, mit Dur-Mittelteil) und Schumanns <b>Armes Waisenkind</b> sind Schulen des Ausdrucks.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['term', { cats: ['Vortrag'] }, 8], ['term', { cats: ['Tempo'] }, 2]], pass: 0.8 }
      ],
      review: [['term', { cats: ['Vortrag'] }]]
    },
    {
      id: '5.4', title: 'Das Pedal', sub: 'Synkopiert wechseln, nach Harmonie hören.', min: 35,
      goals: ['die drei Pedale und ihre Wirkung kennen', 'das synkopierte Pedal sauber beherrschen', 'Pedalzeichen lesen und Pedal nach Gehör setzen'],
      steps: [
        { t: 'read', h: 'Was das Pedal macht', body: `<p>Über jeder Saite liegt ein Filzdämpfer. Lässt du eine Taste los, fällt er auf die Saite und der Ton endet. Das <b>rechte Pedal</b> (Haltepedal, Fortepedal) hebt <b>alle</b> Dämpfer auf einmal: Töne klingen weiter, und alle Saiten schwingen mit – der Klang wird voll und warm.</p><ul><li><b>Rechts: Haltepedal</b> – das wichtigste, 95 % deiner Pedalarbeit.</li><li><b>Links: una corda</b> (Leisepedal) – leiser und weicher. Notiert als „una corda“, aufgehoben mit „tre corde“.</li><li><b>Mitte</b> (nicht bei jedem Klavier): beim Flügel das Sostenuto-Pedal (hält nur die gerade gedrückten Töne), bei vielen Klavieren ein Übungsdämpfer.</li></ul>${F.merk('„senza sordino“ (ohne Dämpfer) am Anfang der Mondscheinsonate heißt: mit Pedal.')}` },
        { t: 'read', h: 'Das synkopierte Pedal', body: `<p>Der häufigste Fehler: Pedal und Taste gleichzeitig wechseln. Dann bleibt ein Loch – oder der alte Klang verschmiert in den neuen. Richtig ist das <b>synkopierte Pedal</b> (Legato-Pedal):</p><ol><li>Neue Taste(n) <b>anschlagen</b>.</li><li><b>Genau danach</b> Pedal hoch …</li><li>… und sofort wieder runter.</li></ol><p>Der Fuß ist also immer einen Moment <b>nach</b> der Hand. Denk: „Spielen – hoch-runter“. Die Ferse bleibt am Boden, nur der Fußballen bewegt sich.</p>[[0]]<p>Notation: <b>Ped.</b> = runter, <b>✱</b> = hoch; moderne Ausgaben zeigen Klammern mit Knick beim Wechsel. Oft steht gar nichts – dann entscheidet dein Ohr: <b>Wechseln, wenn sich die Harmonie ändert.</b></p>`, figs: [F.s([{ r: '(E4 G4 C5)/h!pd (F4 A4 C5)/h!pc', l: 'C3/h F3/h' }, { r: '(D4 G4 B4)/h!pc (E4 G4 C5)/h!pc!pu', l: 'G2/h C3/h', end: '|.' }], { grand: true, time: 'C', bpm: 60, cap: 'Pedal bei jedem Akkord neu – direkt nach dem Anschlag.' })] },
        { t: 'ex', h: 'Übung: Pedal-Wissen', gen: 'pool', o: { id: 'pedal' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier: Pedal-Training', body: '<p>Erst ohne Hände nur den Fuß üben: hoch–runter im Metronom-Takt, lautlos. Dann mit Akkorden.</p>', checks: ['Fuß allein: 20× lautlos hoch–runter, Ferse am Boden.', 'Akkorde C – F – G – C mit synkopiertem Pedal: kein Loch, kein Verschmieren.', 'Eine Tonleiter mit Pedal pro Ton (sehr langsam) – nach jedem Anschlag wechseln.', 'Prélude e-Moll (Chopin) oder Mondscheinsonate: Pedal bei jedem Harmoniewechsel.'] },
        { t: 'piece', h: 'Pedalstücke', id: 'prelude-e', body: '<p>Chopins <b>Prélude e-Moll</b> ist das perfekte Pedal-Stück: Die Akkorde links verändern sich langsam, und bei jeder Veränderung wechselt das Pedal. Und die <b>Mondscheinsonate</b> steht jetzt in echten Noten bereit – du kannst sie, also kannst du dich hier ganz auf Pedal und Klang konzentrieren.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'pedal' }, 8], ['symbol', { set: ['ped', 'fe', 'st', 'tn'] }, 1]], pass: 0.8 }
      ],
      review: [['pool', { id: 'pedal' }]]
    },
    {
      id: '5.5', title: 'Melodie und Begleitung', sub: 'Voicing: die Melodie singen lassen.', min: 30,
      goals: ['Melodie und Begleitung in verschiedenen Lautstärken spielen', 'innerhalb einer Hand einen Ton hervorheben', 'Klavierstücke wie ein Sänger mit Band hören'],
      steps: [
        { t: 'read', h: 'Ein Klavier, viele Instrumente', body: `<p>Fast jedes Klavierstück besteht aus <b>Schichten</b>: eine Melodie (der Sänger), eine Begleitung (die Band), ein Bass (das Fundament). Das Ohr hört gerne <b>eine</b> klare Hauptstimme. Spielst du alles gleich laut, klingt es wie eine Wand.</p><p><b>Voicing</b> heißt: Jeder Schicht ihre eigene Lautstärke geben. Faustregel: <b>Melodie zwei Stufen lauter</b> als die Begleitung (Melodie mf, Begleitung p).</p>` },
        { t: 'read', h: 'So geht es technisch', body: `<ul><li><b>Zwischen den Händen</b> (Melodie rechts, Begleitung links): leicht – die linke Hand nimmt weniger Gewicht, spielt näher an den Tasten.</li><li><b>In einer Hand</b> (Melodie oben, Begleitung darunter): Das Gewicht wird zum Melodiefinger (meist 4 oder 5) „gelehnt“, die anderen Finger berühren ihre Tasten nur leicht.</li><li><b>Übe-Trick</b>: Melodie forte spielen, Begleitung nur „antippen“ (fast ohne Ton) – dann schrittweise die Begleitung hörbar machen.</li><li>Noch ein Trick: Melodie allein singen, dann spielen – und genau diese Phrasierung beibehalten, wenn die Begleitung dazukommt.</li></ul>[[0]]`, figs: [F.s([{ r: 'G4/h.!d=mf A4/q', l: 'C3/8!d=p G3/8 E4/8 G3/8 C3/8 G3/8 E4/8 G3/8' }, { r: 'G4/q F4/q E4/h', l: 'G2/8 G3/8 D4/8 G3/8 C3/8 G3/8 E4/8 G3/8', end: '|.' }], { grand: true, time: 'C', bpm: 66, cap: 'Melodie mf über leiser Begleitung (p).', voiced: true })] },
        { t: 'ex', h: 'Übung: Voicing-Wissen', gen: 'pool', o: { id: 'voicing' }, n: 6, need: 5 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm Schumanns „Melodie“ oder die Mondscheinsonate (Takt 5–9: Melodie über den Triolen).</p>', checks: ['Melodie allein gesungen, dann gespielt.', 'Begleitung allein ganz leise.', 'Zusammen: Melodie klar hörbar, Begleitung im Hintergrund.', 'Übung in einer Hand: Akkorde c-e-g, oberer Ton laut, untere leise.'] },
        { t: 'piece', h: 'Melodie über Begleitung', id: 'franz-weise', body: '<p>Tschaikowskys <b>Alte französische Weise</b> ist dein Pflichtstück für dieses Thema: eine singende Melodie über einer ruhigen Begleitung.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'voicing' }, 6]], pass: 0.8 }
      ],
      review: [['pool', { id: 'voicing' }]]
    },
    {
      id: '5.6', title: 'Phrasierung', sub: 'Musik spricht in Sätzen.', min: 30,
      goals: ['Phrasen im Notenbild finden', 'jeder Phrase einen Höhepunkt und ein Ende geben', 'zwischen Phrasen „atmen“'],
      steps: [
        { t: 'read', h: 'Musikalische Sätze', body: `<p>Musik ist wie Sprache in <b>Phrasen</b> gegliedert – meist 2, 4 oder 8 Takte lang. Eine Phrase hat einen Anfang, einen <b>Höhepunkt</b> und ein Ende, wie ein gesprochener Satz.</p><ul><li><b>Phrasenbögen</b> (lange Bögen über mehreren Takten) zeigen sie an.</li><li>Ohne Bögen: Achte auf Ruhepunkte – lange Noten, Kadenzen, Pausen.</li><li>Oft antwortet eine Phrase auf die vorige (<b>Frage – Antwort</b>, Vordersatz – Nachsatz).</li></ul>` },
        { t: 'read', h: 'Spannung und Entspannung', body: `<ul><li>Phrasen steigen meist zum Höhepunkt (oft der höchste oder längste Ton, oder eine dissonante Harmonie) und fallen danach.</li><li>Das <b>Phrasenende</b> wird leiser und ein wenig weicher – wie die Stimme am Satzende.</li><li>Zwischen zwei Phrasen ein winziges <b>Atmen</b>: Hand kurz leicht heben, ohne den Puls zu unterbrechen.</li><li><b>Seufzer</b> (zwei Töne abwärts, der erste gebunden auf schwerer Zeit): betont – leicht.</li></ul>${F.merk('Die beste Phrasierungs-Schule ist Singen. Sing die Melodie – wo du atmest, ist das Phrasenende. Wo du lauter wirst, ist der Höhepunkt.')}[[0]]`, figs: [F.s([{ r: 'E4/q!(!d=p F4/q G4/q!h=< A4/q' }, { r: 'B4/q C5/q!h=. D5/q!h=> C5/q' }, { r: 'B4/q A4/q G4/q F4/q' }, { r: 'E4/h.!h=. r/q!)', end: '|.' }], { time: 'C', bpm: 80, cap: 'Eine Phrase: Aufstieg – Höhepunkt (d²) – Abstieg – Ruhe.' })] },
        { t: 'ex', h: 'Übung: Phrasierung', gen: 'pool', o: { id: 'phrase' }, n: 6, need: 5 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm dein Pflichtstück und zeichne (auf Papier oder im Kopf) die Phrasen ein: Wo beginnen sie, wo ist der Höhepunkt, wo endet jede?</p>', checks: ['Phrasen des Pflichtstücks bestimmt.', 'Eine Phrase gesungen und genauso gespielt.', 'Aufnahme: Klingen die Phrasenenden wie Satzenden?'] },
        { t: 'piece', h: 'Kleine Dramen', id: 'erster-verlust', body: '<p>Schumanns <b>Erster Verlust</b> ist ein Lehrstück für Seufzer und Höhepunkte.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'phrase' }, 5], ['term', { cats: ['Vortrag', 'Dynamik'] }, 3]], pass: 0.8 }
      ],
      review: [['pool', { id: 'phrase' }]]
    }
  ]
});

/* =========================================================================
   KAPITEL VI · Lesen wie ein Profi
   ========================================================================= */
CUR.chapters.push({
  id: 'VI', title: 'Lesen wie ein Profi', sub: 'Hilfslinien, Sprungzeichen, mehrere Stimmen, Triolen, neue Tonarten, Verzierungen, Blattspiel.', img: 'renoir1',
  warm: ['Tonleiter des Tages über zwei Oktaven (A-, E-, B- oder Es-Dur).', 'Dreiklangsbrechungen über zwei Oktaven in der Tonart des Tages.', 'Triolen gegen Achtel: links Achtel, rechts Triolen auf c–e–g.', '5 Minuten Blattspiel auf deiner Stufe.'],
  must: ['fuer-elise', 'k545-1'], more: ['op49-2-2', 'op49-2-1', 'prelude-a', 'invention1', 'kuhlau', 'jaegerlied'],
  exam: { n: 20, pass: 0.85, items: [['noteName', { clef: 'treble', range: ['G3', 'C7'], oct: true }, 3], ['noteName', { clef: 'bass', range: ['C1', 'G4'], oct: true }, 3], ['repeatOrder', {}, 3], ['measureFill', { time: '6/8', set: ['q.', 'q', '8', 'h.'] }, 2], ['timeSig', { set: ['4/4', '3/4', '2/4', '6/8'] }, 1], ['keySig', { max: 6, mode: 'both' }, 2], ['keyOfMelody', {}, 2], ['symbol', { set: ['mord', 'prall', 'tr', 'turn'] }, 2], ['pool', { id: 'blattspiel' }, 2]] },
  lessons: [
    {
      id: '6.1', title: 'Hilfslinien und Oktavierung', sub: 'Ganz hoch und ganz tief lesen.', min: 30,
      goals: ['Noten auf bis zu drei Hilfslinien sicher lesen', '8va, 8vb und loco verstehen', 'neue Anker für die äußeren Lagen kennen'],
      steps: [
        { t: 'read', h: 'Neue Anker über und unter dem System', body: `<p>Mit drei Hilfslinien kommst du fast überall hin. Auch hier gilt: Anker statt Abzählen.</p><ul><li><b>Violinschlüssel oben:</b> 1. Hilfslinie = <b>a²</b>, 2. Hilfslinie = <b>c³</b>, 3. = e³.</li><li><b>Violinschlüssel unten:</b> 1. Hilfslinie = <b>c¹</b>, 2. = <b>a</b>, 3. = f.</li><li><b>Bassschlüssel oben:</b> 1. Hilfslinie = <b>c¹</b>, 2. = <b>e¹</b>, 3. = g¹.</li><li><b>Bassschlüssel unten:</b> 1. Hilfslinie = <b>E</b>, 2. = <b>C</b>, 3. = A₁.</li></ul>[[0]][[1]]`, figs: [F.s('A5/q C6/q E6/q A3/q C4/q', { names: 'all', cap: 'Violinschlüssel: a², c³, e³ oben – a, c¹ unten.', bpm: 90 }), F.s('C4/q E4/q G4/q E2/q C2/q', { clef: 'bass', names: 'all', cap: 'Bassschlüssel: c¹, e¹, g¹ oben – E, C unten.', bpm: 90 })] },
        { t: 'ex', h: 'Übung: hoch im Violinschlüssel', gen: 'noteName', o: { clef: 'treble', range: ['E5', 'E6'], oct: true }, n: 10, need: 8 },
        { t: 'ex', h: 'Übung: tief im Bassschlüssel', gen: 'noteName', o: { clef: 'bass', range: ['A1', 'G2'], oct: true }, n: 10, need: 8 },
        { t: 'read', h: '8va, 8vb, 15ma', body: `<p>Damit nicht zu viele Hilfslinien nötig sind, gibt es <b>Oktavierungszeichen</b>:</p><ul><li><b>8va</b> (ottava) mit gestrichelter Linie <b>über</b> den Noten: eine Oktave <b>höher</b> spielen als notiert.</li><li><b>8vb</b> (ottava bassa) <b>unter</b> den Noten: eine Oktave <b>tiefer</b>.</li><li><b>15ma</b>: zwei Oktaven höher.</li><li><b>loco</b> (oder Ende der Linie): wieder normal.</li></ul>${F.warn('Beim Blattspiel übersieht man 8va leicht – die Noten sehen ganz normal aus. Vor dem Spielen nach gestrichelten Linien suchen!')}` },
        { t: 'ex', h: 'Übung: gemischt mit Oktave', gen: 'noteName', o: { clef: 'treble', range: ['G3', 'C7'], oct: true }, n: 10, need: 8 },
        { t: 'piece', h: 'Chopin in A-Dur', id: 'prelude-a', body: '<p>Das kurze <b>Prélude A-Dur</b> von Chopin hat in Takt 12 einen riesigen Akkord über viele Hilfslinien – jetzt kannst du ihn lesen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['noteName', { clef: 'treble', range: ['G3', 'C7'], oct: true }, 4], ['noteName', { clef: 'bass', range: ['C1', 'G4'], oct: true }, 4], ['pool', { id: 'hilfslinien' }, 2]], pass: 0.8 }
      ],
      review: [['noteName', { clef: 'treble', range: ['G3', 'C7'], oct: true }], ['noteName', { clef: 'bass', range: ['C1', 'G4'], oct: true }]]
    },
    {
      id: '6.2', title: 'Wiederholungen und Sprungzeichen', sub: 'Volta, D.C., D.S., Fine, Coda – den Weg durch die Noten finden.', min: 30,
      goals: ['Wiederholungszeichen und Klammern richtig befolgen', 'D.C., D.S., Fine und Coda verstehen', 'vor dem Spielen den Weg durch ein Stück planen'],
      steps: [
        { t: 'read', h: 'Wiederholungszeichen', body: `<p>Um Platz zu sparen, werden Teile nicht doppelt gedruckt:</p><ul><li><b>|: … :|</b> – alles dazwischen wird wiederholt. Fehlt das Anfangszeichen, geht es zurück zum Anfang des Stücks.</li><li><b>Klammern (Volta)</b>: Beim ersten Durchgang die <b>1. Klammer</b> spielen, dann zurück; beim zweiten Mal die 1. Klammer <b>überspringen</b> und gleich die <b>2. Klammer</b> spielen.</li></ul>[[0]]`, figs: [F.s([{ r: 'C4/q D4/q E4/q F4/q', begin: '|:', label: 'A' }, { r: 'G4/w', label: 'B', volta: '1.', end: ':|' }, { r: 'C5/w', label: 'C', volta: '2.', voltaOpen: true, end: '|.' }], { time: 'C', cap: 'Gespielt wird: A – B – A – C.', bpm: 90 })] },
        { t: 'read', h: 'Die großen Sprünge', body: `<div class="tablewrap"><table><tr><th>Zeichen</th><th>Bedeutung</th></tr><tr><td><b>D.C.</b> (Da Capo)</td><td>zurück zum Anfang</td></tr><tr><td><b>D.S.</b> (Dal Segno)</td><td>zurück zum Zeichen 𝄋</td></tr><tr><td><b>Fine</b></td><td>hier ist Schluss (beim zweiten Durchgang)</td></tr><tr><td><b>al Fine</b></td><td>… und spielen bis „Fine“</td></tr><tr><td><b>al Coda</b></td><td>… bis zum Coda-Zeichen 𝄌, dann zur Coda springen</td></tr><tr><td><b>Coda</b> 𝄌</td><td>der Schlussteil</td></tr></table></div><p>Beispiel <b>D.C. al Fine</b>: Spiel bis zum D.C., spring zum Anfang und spiel bis „Fine“. Bei D.C. werden Wiederholungen normalerweise nicht noch einmal gespielt (in alten Ausgaben steht oft „senza repetizione“).</p>${F.merk('<b>Vor dem Spielen:</b> Mit dem Finger einmal den Weg durch die Noten fahren – wie eine Route auf der Karte.')}` },
        { t: 'ex', h: 'Übung: Spielreihenfolge', gen: 'repeatOrder', n: 8, need: 7 },
        { t: 'piece', h: 'Für Elise – das ganze Stück', id: 'fuer-elise', body: '<p>Jetzt ist <b>Für Elise</b> offen – vollständig, nicht nur der bekannte Anfang. Es ist ein Rondo: Der A-Teil kommt dreimal, mit Wiederholungen und zwei Klammern. Fahr erst den Weg durch die Noten, dann lern Teil für Teil. Auch das Menuett aus Beethovens <b>Sonate op. 49 Nr. 2</b> ist jetzt offen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['repeatOrder', {}, 6], ['pool', { id: 'sprung' }, 4]], pass: 0.8 }
      ],
      review: [['repeatOrder', {}], ['pool', { id: 'sprung' }]]
    },
    {
      id: '6.3', title: 'Mehrere Stimmen in einer Hand', sub: 'Halsrichtung lesen, Töne halten, Linien hören.', min: 30,
      goals: ['zwei Stimmen in einem System auseinanderhalten', 'Haltetöne gegen bewegte Stimmen aushalten', 'polyphone Musik (Bach) lesen'],
      steps: [
        { t: 'read', h: 'Zwei Stimmen, ein System', body: `<p>Oft spielt eine Hand zwei Linien gleichzeitig. Man erkennt sie an der <b>Halsrichtung</b>: Die obere Stimme hat Hälse nach <b>oben</b>, die untere nach <b>unten</b>. Jede Stimme hat ihren eigenen, vollständigen Rhythmus – manchmal mit eigenen Pausen.</p>[[0]]<p>Das Schwierige: Ein Finger hält einen langen Ton, während andere Finger der gleichen Hand sich bewegen. Den langen Ton darfst du nicht loslassen!</p>`, figs: [F.s([{ r: 'G4/h. G4/q', r2: 'E4/q D4/q C4/q E4/q' }, { r: 'A4/h G4/h', r2: 'F4/q E4/q D4/h', end: '|.' }], { time: 'C', cap: 'Oben: g¹ hält drei Schläge (Hals nach oben). Unten bewegt sich die zweite Stimme (Hals nach unten).', bpm: 72 })] },
        { t: 'read', h: 'So übst du Mehrstimmigkeit', body: `<ol><li>Jede Stimme <b>einzeln</b> spielen (mit dem richtigen Fingersatz!).</li><li>Eine Stimme spielen, die andere singen.</li><li>Zusammen – und dabei bewusst die Haltetöne <b>aushalten</b>.</li><li>Eine Stimme etwas lauter (meist die obere).</li></ol><p>Bach hat seine <b>Inventionen</b> genau dafür geschrieben: Zwei gleichberechtigte Stimmen, die sich ein Motiv zuwerfen. Wer sie spielt, lernt, in Linien zu denken statt in Griffen.</p>` },
        { t: 'ex', h: 'Übung: Lese-Fragen', gen: 'pool', o: { id: 'stimmen' }, n: 6, need: 5 },
        { t: 'piece', h: 'Bach: Invention Nr. 1', id: 'invention1', body: '<p>Die <b>Invention C-Dur</b>: Finde zuerst das Motiv (die ersten acht Sechzehntel) und markiere jedes Mal, wenn es wiederkommt – auch umgedreht und in der anderen Hand.</p>' },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel das Beispiel oben: obere Stimme allein, untere allein, zusammen.</p>', checks: ['Beide Stimmen einzeln.', 'Zusammen, Haltetöne wirklich gehalten.', 'Invention Nr. 1: Takt 1–2 jede Hand einzeln gelesen.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'stimmen' }, 6], ['noteName', { clef: 'treble', range: ['C4', 'C6'] }, 2], ['noteName', { clef: 'bass', range: ['C2', 'C4'] }, 2]], pass: 0.8 }
      ],
      review: [['pool', { id: 'stimmen' }]]
    },
    {
      id: '6.4', title: 'Triolen und zusammengesetzte Takte', sub: '3 statt 2 – und der 6/8-Takt.', min: 30,
      goals: ['Triolen gleichmäßig spielen', '6/8, 9/8, 12/8 und 3/8 richtig zählen und betonen', 'Triolen gegen Achtel koordinieren'],
      steps: [
        { t: 'read', h: 'Triolen', body: `<p>Eine <b>Triole</b> sind drei Noten in der Zeit von zwei gleichen Noten – markiert durch eine kleine <b>3</b>. Achtel-Triolen: drei Achtel auf einen Viertelschlag. Gezählt: <b>1-ta-te 2-ta-te …</b> (oder „Ana-nas“).</p>[[0]]<p>Kennst du schon: Die ganze Mondscheinsonate läuft in Achtel-Triolen. Und der erste Satz von Beethovens Sonate op. 49 Nr. 2 wechselt ständig zwischen Triolen und normalen Achteln.</p>`, figs: [F.s([{ r: 'C4/8!3( E4/8 G4/8!3) C5/8!3( G4/8 E4/8!3) C4/8 E4/8 G4/8 C5/8' }], { time: '2/4', bpm: 66, cap: 'Erst zwei Triolen, dann normale Achtel – hör den Unterschied.' })] },
        { t: 'read', h: 'Der 6/8-Takt', body: `<p><b>6/8</b> sieht aus wie 3/4 (sechs Achtel = drei Viertel), fühlt sich aber völlig anders an: Er hat <b>zwei Schläge</b>, jeder ist eine punktierte Viertel (drei Achtel). Betonung: <b>EINS</b>-zwei-drei-<b>VIER</b>-fünf-sechs.</p><ul><li><b>3/8</b>: ein Schlag pro Takt (schnelle Walzer, Clementi-Sonatine III).</li><li><b>9/8</b>: drei Schläge zu je drei Achteln.</li><li><b>12/8</b>: vier Schläge zu je drei Achteln (Blues, langsame Balladen).</li></ul>[[0]]${F.merk('Solche Taktarten heißen <b>zusammengesetzt</b>: Der Schlag ist dreigeteilt – wie Triolen ohne Triolenzeichen.')}`, figs: [F.s([{ r: 'C4/8 D4/8 E4/8 F4/q.' }, { r: 'G4/q G4/8 A4/q A4/8' }, { r: 'G4/q. E4/q.', end: '|.' }], { time: '6/8', bpm: 60, cap: '6/8: zwei schwingende Schläge pro Takt.', metro: true })] },
        { t: 'ex', h: 'Übung: 6/8-Takte füllen', gen: 'measureFill', o: { time: '6/8', set: ['q.', 'q', '8', 'h.'] }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Taktart erkennen', gen: 'timeSig', o: { set: ['4/4', '3/4', '2/4', '6/8'] }, n: 6, need: 5 },
        { t: 'piano', h: 'Am Klavier: Triolen gegen Achtel', body: '<p>Die klassische Koordinationsübung: links zwei Achtel, rechts drei Triolen-Achtel auf denselben Schlag. Die erste Note fällt zusammen, die anderen verzahnen sich.</p>', checks: ['Klatschen: rechte Hand 3, linke Hand 2 auf den gleichen Schlag – langsam.', 'Am Klavier auf c–e–g (rechts Triolen) gegen c–g (links Achtel).', 'Jägerliedchen (Schumann) oder Sonate op. 49/2 I angefangen.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['measureFill', { time: '6/8', set: ['q.', 'q', '8', 'h.'] }, 4], ['timeSig', { set: ['4/4', '3/4', '2/4', '6/8'] }, 2], ['pool', { id: 'triolen' }, 4]], pass: 0.8 }
      ],
      review: [['measureFill', { time: '6/8', set: ['q.', 'q', '8', 'h.'] }], ['pool', { id: 'triolen' }]]
    },
    {
      id: '6.5', title: 'Alle Tonarten und die Tonart eines Stücks', sub: 'Bis sieben Vorzeichen – und Dur oder Moll erkennen.', min: 30,
      goals: ['alle Vorzeichnungen sicher lesen', 'aus Vorzeichnung, Schluss und Leitton die Tonart bestimmen', 'Tonleitern bis vier Vorzeichen spielen'],
      steps: [
        { t: 'read', h: 'Alle 24 Tonarten', body: `<p>Mit dem Quintenzirkel kennst du alle Tonarten. Jetzt geht es um Tempo: Profis erkennen eine Vorzeichnung so schnell wie ein Wort. Zwei Hilfen:</p><ul><li>Kreuze: letztes Kreuz + Halbton = Dur (z. B. vier Kreuze, letztes dis → E-Dur).</li><li>Bs: vorletztes ♭ = Dur (z. B. vier Bs: b es <b>as</b> des → As-Dur).</li></ul><p>Dann eine kleine Terz runter für die Parallele in Moll: E-Dur → cis-Moll (deine Mondscheinsonate!), As-Dur → f-Moll.</p>` },
        { t: 'read', h: 'Dur oder Moll? Detektivarbeit', body: `<p>Jede Vorzeichnung passt zu zwei Tonarten. So entscheidest du:</p><ol><li><b>Schluss</b>: Der letzte Basston (und Akkord) ist fast immer der Grundton.</li><li><b>Anfang</b>: Die ersten Takte umspielen meist den Tonika-Dreiklang.</li><li><b>Leitton</b>: Tauchen immer wieder Versetzungszeichen auf, die genau einen Halbton unter dem Moll-Grundton liegen (gis in a-Moll, dis in e-Moll, his in cis-Moll), ist es Moll.</li></ol>` },
        { t: 'ex', h: 'Übung: alle Vorzeichnungen', gen: 'keySig', o: { max: 7, mode: 'both' }, n: 10, need: 8 },
        { t: 'ex', h: 'Übung: Tonart einer Melodie', gen: 'keyOfMelody', n: 8, need: 6 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Tonleitern mit mehr Vorzeichen. Tipp: Bei vielen schwarzen Tasten liegt der Daumen auf den weißen.</p>', checks: ['A-Dur und E-Dur zwei Oktaven.', 'B-Dur und Es-Dur rechts (Fingersatz: Daumen auf c und f).', 'h-Moll und fis-Moll harmonisch.'] },
        { t: 'piece', h: 'Mozart: Sonata facile', id: 'k545-1', body: '<p>Jetzt ist der 1. Satz von <b>Mozarts Sonate C-Dur KV 545</b> offen – dein zweites Pflichtstück neben Für Elise. Achte auf die Reprise: Sie beginnt überraschend in F-Dur.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['keySig', { max: 7, mode: 'both' }, 5], ['keyOfMelody', {}, 3], ['keyAcc', { max: 6, mode: 'both' }, 2]], pass: 0.8 }
      ],
      review: [['keySig', { max: 7, mode: 'both' }], ['keyOfMelody', {}], ['keyAcc', { max: 6, mode: 'both' }]]
    },
    {
      id: '6.6', title: 'Verzierungen', sub: 'Vorschlag, Mordent, Pralltriller, Triller, Doppelschlag.', min: 30,
      goals: ['alle gängigen Verzierungszeichen erkennen', 'sie stilgerecht ausführen', 'Verzierungen erst weglassen und dann einbauen'],
      steps: [
        { t: 'read', h: 'Die kleinen Zeichen', body: `<p>Verzierungen (Ornamente) schmücken einen Ton aus. Sie werden nicht ausgeschrieben, sondern als Zeichen notiert:</p><ul><li><b>Pralltriller</b> (kurze Zickzacklinie): Hauptnote – obere Nebennote – Hauptnote, schnell.</li><li><b>Mordent</b> (Zickzack mit senkrechtem Strich): Hauptnote – <b>untere</b> Nebennote – Hauptnote.</li><li><b>Triller</b> (tr): schneller, wiederholter Wechsel mit der oberen Nebennote. Im Barock beginnt er meist auf der oberen Nebennote, ab der Klassik oft auf der Hauptnote.</li><li><b>Doppelschlag</b> (liegendes S): obere Nebennote – Hauptnote – untere Nebennote – Hauptnote.</li><li><b>Vorschlag</b>: kleine Note vor der Hauptnote. Mit Querstrich (Acciaccatura) ganz kurz, „davor gequetscht“; ohne Strich (Appoggiatura) oft lang, nimmt der Hauptnote Zeit weg.</li><li><b>Arpeggio</b> (Wellenlinie vor einem Akkord): Akkord von unten nach oben brechen, wie eine Harfe.</li></ul>[[0]]`, figs: [F.s([{ r: 'C5/q!o=prall C5/q!o=mord C5/h!o=tr' }, { r: 'C5/q!o=turn r/q C5/h', end: '|.' }], { time: 'C', play: false, cap: 'Pralltriller – Mordent – Triller – Doppelschlag.' }), F.s([{ r: 'C5/32 D5/32 C5/8. C5/32 B4/32 C5/8. D5/32 C5/32 D5/32 C5/32 D5/32 C5/32 D5/32 C5/32 C5/q' }], { time: 'C', bpm: 60, cap: 'So klingen sie ausgeschrieben (langsam): Pralltriller, Mordent, Triller (ab der oberen Nebennote).' })] },
        { t: 'ex', h: 'Übung: Zeichen erkennen', gen: 'symbol', o: { set: ['mord', 'prall', 'tr', 'turn'] }, n: 6, need: 5 },
        { t: 'read', h: 'So übst du Verzierungen', body: `<ol><li>Stück erst <b>ohne</b> Verzierungen lernen.</li><li>Verzierung langsam ausgeschrieben üben – im Rhythmus der Hauptnote.</li><li>Einbauen, wenn die Stelle sicher sitzt.</li><li>Verzierungen sind Schmuck: leicht, nie lauter als die Melodie.</li></ol><p>Die Nebennoten richten sich nach der Tonart: In G-Dur ist der Pralltriller auf e ein e–fis–e, nicht e–f–e.</p>` },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm das Menuett G-Dur (Lektion 2.4) und spiel die Mordente in Takt 3 und 5 – erst langsam, dann im Tempo.</p>', checks: ['Pralltriller und Mordent auf c² langsam und dann schnell.', 'Triller 2–3 (Finger) über zwei Schläge, gleichmäßig.', 'Mordente im Menuett G-Dur eingebaut.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['symbol', { set: ['mord', 'prall', 'tr', 'turn'] }, 5], ['pool', { id: 'verzierung' }, 5]], pass: 0.8 }
      ],
      review: [['symbol', { set: ['mord', 'prall', 'tr', 'turn'] }], ['pool', { id: 'verzierung' }]]
    },
    {
      id: '6.7', title: 'Blattspiel-Strategien', sub: 'Noten sehen, sofort spielen – die Technik dahinter.', min: 35,
      goals: ['in 30 Sekunden ein unbekanntes Stück vorab analysieren', 'beim Spielen vorauslesen statt mitlesen', 'nach Fehlern sofort weiterspielen'],
      steps: [
        { t: 'read', h: 'Was Blattspieler anders machen', body: `<p>Gute Blattspieler sind keine Genies, sondern haben drei Gewohnheiten:</p><ol><li><b>Sie lesen Muster</b>: Tonleiterstücke, Dreiklänge, Akkordgriffe, Sequenzen (das gleiche Motiv auf anderer Stufe) – statt einzelner Noten.</li><li><b>Sie schauen voraus</b>: Die Augen sind schon einen Takt weiter als die Hände. Studien mit Eyetracking zeigen, dass bessere Leser weiter vorausschauen.</li><li><b>Sie halten nie an</b>: Der Puls ist heilig. Lieber eine Note auslassen als den Rhythmus brechen.</li></ol>` },
        { t: 'read', h: 'Der 30-Sekunden-Check', body: `<p>Bevor du eine unbekannte Seite spielst:</p><ul><li><b>Tonart</b> (Vorzeichnung, Schluss) und <b>Taktart</b>.</li><li><b>Tempo</b> wählen, das du ohne Anhalten schaffst – lieber zu langsam.</li><li><b>Höchster und tiefster Ton</b>: Wohin müssen die Hände?</li><li><b>Wiederholungen, Sprünge, 8va</b>.</li><li><b>Schwierige Stellen</b> (Läufe, Sprünge, Vorzeichen) kurz ansehen – nicht üben.</li><li><b>Muster</b>: Welche Akkorde? Welche Sequenzen?</li></ul>${F.merk('<b>Vereinfachen ist erlaubt:</b> Beim Blattspiel darfst du in der linken Hand nur den Basston spielen oder Verzierungen weglassen. Hauptsache, die Musik läuft weiter.')}` },
        { t: 'ex', h: 'Übung: Strategien', gen: 'pool', o: { id: 'blattspiel' }, n: 6, need: 5 },
        { t: 'sight', h: 'Blattspiel Stufe 4', lv: 4, body: '<p>Drei unbekannte Stücke mit beiden Händen. Erst der 30-Sekunden-Check, dann ohne Anhalten.</p>' },
        { t: 'piano', h: 'Tägliche Gewohnheit', body: '<p>Ab heute gehört Blattspiel jeden Tag dazu – fünf Minuten reichen. Die Menge macht es: Je mehr verschiedene Noten du gesehen hast, desto mehr Muster erkennst du.</p>', checks: ['Blattspiel des Tages heute gemacht.', 'Eine Seite aus einem fremden Stück (z. B. IMSLP, Kinderalbum) einmal vom Blatt gespielt.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'blattspiel' }, 6], ['keyOfMelody', {}, 2], ['repeatOrder', {}, 2]], pass: 0.8 }
      ],
      review: [['pool', { id: 'blattspiel' }]]
    }
  ]
});

/* ===== Notenweg 3 · Lernpfad Teil D: Kapitel VII–VIII ===== */

/* Ausschnitt aus einem Stück der Bibliothek als Abbildung (echte Noten, mit Akkordbeschriftung) */
F.p = (id, from, to, o = {}) => {
  const p = (typeof PIECES !== 'undefined' ? PIECES : []).find(x => x.id === id);
  if (!p) return F.html('<p class="small muted">(Noten nicht gefunden)</p>');
  const ms = p.measures.slice(from, to).map((m, i) => Object.assign({}, m, o.chords && o.chords[i] ? { chords: o.chords[i] } : {}, { end: i === to - from - 1 ? (o.end || '|') : m.end, volta: undefined, label: undefined }));
  return F.s(ms, { grand: true, key: p.key, time: p.time, bpm: o.bpm || p.bpm || 72, cap: o.cap, s: o.s || 10, final: false, spec: Object.assign({ clefInit: p.clefInit, tupletsUntil: p.tupletsUntil, numbers: true, numOffset: from + (p.pickup ? 0 : 0) }, o.spec || {}) });
};

/* =========================================================================
   KAPITEL VII · Harmonie verstehen
   ========================================================================= */
CUR.chapters.push({
  id: 'VII', title: 'Harmonie verstehen', sub: 'Septakkorde, Schlüsse, Zwischendominanten, Modulation, besondere Akkorde – und echte Stücke analysieren.', img: 'renoir2',
  warm: ['Kadenz I – IV – V7 – I in C, G, F und D-Dur (beide Hände, enge Lage).', 'Dominantseptakkorde: G7 → C, D7 → G, A7 → D, E7 → A – jeweils auflösen.', 'Verminderter Septakkord auf gis, auflösen nach a-Moll.', 'Ein Akkordmuster deiner Wahl über I – vi – IV – V mit Pedal.'],
  must: ['pathetique-2', 'prelude-b'], more: ['k545-2', 'brahms15', 'moment3', 'januar', 'reverie', 'clair-de-lune', 'notturno', 'oktober'],
  exam: { n: 20, pass: 0.85, items: [['seventh', {}, 3], ['cadence', {}, 3], ['secDom', {}, 3], ['degree', { max: 4, minor: true, degs: [0, 1, 3, 4, 5] }, 2], ['prog', { set: ['pop', 'sad', 'cad', 'twofive', 'minor'] }, 2], ['pool', { id: 'sonder' }, 3], ['pool', { id: 'analyse' }, 2], ['pool', { id: 'modulation' }, 2]] },
  lessons: [
    {
      id: '7.1', title: 'Septakkorde', sub: 'Vier Töne, fünf Farben.', min: 35,
      goals: ['die fünf wichtigen Septakkorde bauen und benennen', 'Symbole wie G7, Cmaj7, Am7, Hm7♭5, H°7 lesen', 'Septakkorde auf den Stufen einer Dur-Tonleiter kennen'],
      steps: [
        { t: 'read', h: 'Noch eine Terz obendrauf', body: `<p>Setzt du auf einen Dreiklang noch eine Terz, entsteht ein <b>Septakkord</b>: Grundton, Terz, Quinte, <b>Septime</b>. Die Septime ist sieben Stammtöne über dem Grundton. Es gibt sie groß (11 Halbtöne, c–h) oder klein (10 Halbtöne, c–b).</p><div class="tablewrap"><table><tr><th>Symbol</th><th>Name</th><th>Bauplan</th><th>Klang</th></tr><tr><td><b>C7</b></td><td>Dominantseptakkord</td><td>Dur + kleine Septime (c e g b)</td><td>gespannt, will weiter</td></tr><tr><td><b>Cmaj7</b></td><td>großer Durseptakkord</td><td>Dur + große Septime (c e g h)</td><td>weich, schwebend, jazzig</td></tr><tr><td><b>Cm7</b></td><td>Mollseptakkord</td><td>Moll + kleine Septime (c es g b)</td><td>warm, weich</td></tr><tr><td><b>Cm7♭5</b> (Cø)</td><td>halbverminderter</td><td>vermindert + kleine Septime (c es ges b)</td><td>dunkel, fragend</td></tr><tr><td><b>C°7</b></td><td>verminderter Septakkord</td><td>nur kleine Terzen (c es ges heses)</td><td>dramatisch, unheimlich</td></tr></table></div>[[0]]`, figs: [F.s([{ r: '(C4 E4 G4 Bb4)/w', chords: [[0, 'C7']] }, { r: '(C4 E4 G4 B4)/w', chords: [[0, 'Cmaj7']] }, { r: '(C4 Eb4 G4 Bb4)/w', chords: [[0, 'Cm7']] }, { r: '(C4 Eb4 Gb4 Bb4)/w', chords: [[0, 'Cm7♭5']] }, { r: '(B3 D4 F4 Ab4)/w', chords: [[0, 'H°7']] }], { bpm: 50, cap: 'Vier Septakkorde auf c – und der verminderte auf h (in c-Moll der wichtigste).' })] },
        { t: 'ex', h: 'Übung: Septakkorde erkennen', gen: 'seventh', o: { types: ['7', 'maj7', 'm7'] }, n: 8, need: 7 },
        { t: 'read', h: 'Septakkorde auf den Stufen', body: `<p>Baust du auf jeder Stufe der Dur-Tonleiter einen Vierklang nur aus Tönen der Tonart, entstehen immer dieselben Typen. In C-Dur:</p><div class="tablewrap"><table><tr><th>Stufe</th><th>I</th><th>ii</th><th>iii</th><th>IV</th><th>V</th><th>vi</th><th>vii</th></tr><tr><td>Akkord</td><td>Cmaj7</td><td>Dm7</td><td>Em7</td><td>Fmaj7</td><td><b>G7</b></td><td>Am7</td><td>Hm7♭5</td></tr></table></div><p>Nur auf der <b>V. Stufe</b> entsteht der Dominantseptakkord – deshalb heißt er so. Er ist der stärkste Wegweiser zur Tonika: Seine Terz (h) ist der Leitton, der nach c will, seine Septime (f) will einen Schritt abwärts nach e.</p>${F.merk('<b>G7 → C:</b> h geht hoch nach c, f geht runter nach e. Diese zwei Halbtonschritte sind der Grund, warum sich Dominante → Tonika wie „Ankommen“ anfühlt.')}` },
        { t: 'ex', h: 'Übung: alle Typen', gen: 'seventh', o: {}, n: 10, need: 8 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel auf jedem weißen Ton von c bis h den passenden Vierklang aus C-Dur und sag den Namen laut.</p>', checks: ['Cmaj7 – Dm7 – Em7 – Fmaj7 – G7 – Am7 – Hm7♭5 – Cmaj7 gespielt und benannt.', 'G7 → C, D7 → G, C7 → F: aufgelöst, Leitton hoch, Septime runter.', 'Den Unterschied C7 / Cmaj7 / Cm7 hörend erkannt.'] },
        { t: 'piece', h: 'Mozart, langsam und gesungen', id: 'k545-2', body: '<p>Der langsame Satz der <b>Sonate KV 545</b> und Brahms’ <b>Walzer op. 39 Nr. 15</b> sind jetzt offen – beide voller Dominantseptakkorde, die du ab heute hörst.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['seventh', {}, 6], ['pool', { id: 'sept' }, 4]], pass: 0.8 },
        { t: 'test', h: 'Zweiter Test: gemischt mit Dreiklängen', gens: [['seventh', {}, 4], ['triadQual', { acc: true, inv: true }, 3], ['symNotes', { types: ['', 'm', '7'] }, 3]], pass: 0.8 }
      ],
      review: [['seventh', {}], ['pool', { id: 'sept' }]]
    },
    {
      id: '7.2', title: 'Dominante und Schlüsse', sub: 'Ganzschluss, Halbschluss, plagal, Trugschluss – die Satzzeichen der Musik.', min: 30,
      goals: ['die vier Schlussformen erkennen (Noten und Gehör)', 'den Quartsextvorhalt verstehen', 'Schlüsse in echten Stücken finden'],
      steps: [
        { t: 'read', h: 'Schlüsse sind Satzzeichen', body: `<p>Eine <b>Kadenz</b> im engeren Sinn ist ein Schluss: die Akkorde am Ende einer Phrase. Sie wirken wie Satzzeichen.</p><div class="tablewrap"><table><tr><th>Schluss</th><th>Akkorde</th><th>wirkt wie</th></tr><tr><td><b>Ganzschluss</b> (authentisch)</td><td>V → I</td><td>Punkt</td></tr><tr><td><b>Halbschluss</b></td><td>… → V (endet auf der Dominante)</td><td>Komma, Doppelpunkt</td></tr><tr><td><b>Plagalschluss</b></td><td>IV → I</td><td>„Amen“, sanfter Punkt</td></tr><tr><td><b>Trugschluss</b></td><td>V → vi</td><td>Überraschung: „…und dann?“</td></tr></table></div>[[0]]`, figs: [F.s([{ r: '(D4 G4 B4)/h (C4 E4 C5)/h', l: 'G2/h C3/h', chords: [[0, 'V'], [2, 'I']] }, { r: '(C4 F4 A4)/h (D4 G4 B4)/h', l: 'F2/h G2/h', chords: [[0, 'IV'], [2, 'V']] }, { r: '(C4 F4 A4)/h (C4 E4 G4)/h', l: 'F2/h C3/h', chords: [[0, 'IV'], [2, 'I']] }, { r: '(D4 G4 B4)/h (C4 E4 A4)/h', l: 'G2/h A2/h', chords: [[0, 'V'], [2, 'vi']], end: '|.' }], { grand: true, time: 'C', bpm: 60, cap: 'Ganzschluss – Halbschluss – Plagalschluss – Trugschluss (C-Dur).' })] },
        { t: 'ex', h: 'Übung: Schlüsse bestimmen', gen: 'cadence', n: 8, need: 7 },
        { t: 'read', h: 'Der Quartsextvorhalt', body: `<p>Vor dem Ganzschluss steht in der Klassik oft ein besonderer Akkord: die Tonika in der zweiten Umkehrung (Quartsextakkord, I⁶₄) über dem <b>Basston der Dominante</b>. Er klingt wie eine Dominante, deren Oberstimmen sich noch nicht gesetzt haben – ein <b>Vorhalt</b>. Erst danach kommt V7, dann I.</p><p>In Ziffern: <b>I⁶₄ – V7 – I</b>. In C: C/G – G7 – C. Du findest ihn am Ende fast jeder Mozart-Phrase – und in Takt 4 der Mondscheinsonate (gis – cis – e über gis im Bass).</p>[[0]]`, figs: [F.s([{ r: '(E4 G4 C5)/h (D4 F4 B4)/h', l: 'G2/h G2/h', chords: [[0, 'C/G (I⁶₄)'], [2, 'G7']] }, { r: '(C4 E4 C5)/w', l: 'C3/w', chords: [[0, 'C']], end: '|.' }], { grand: true, time: 'C', bpm: 60, cap: 'Quartsextvorhalt: Der Bass steht schon auf g, oben klingt noch C-Dur.' })] },
        { t: 'ex', h: 'Übung: Funktionen', gen: 'func', n: 6, need: 5 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel alle vier Schlüsse in C, G und F – und den Quartsextvorhalt.</p>', checks: ['Vier Schlüsse in C-Dur gespielt und laut benannt.', 'Dasselbe in G- und F-Dur.', 'I⁶₄ – V7 – I in C und G.', 'In deinem aktuellen Stück einen Ganz- und einen Halbschluss gefunden.'] },
        { t: 'piece', h: 'Chopin: Prélude h-Moll', id: 'prelude-b', body: '<p>Im <b>Prélude h-Moll</b> singt die linke Hand die Melodie – und die Phrasen enden auf deutlichen Halb- und Ganzschlüssen. Dein erstes Pflichtstück dieses Kapitels.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['cadence', {}, 6], ['pool', { id: 'schluss' }, 4]], pass: 0.8 },
        { t: 'test', h: 'Zweiter Test', gens: [['cadence', {}, 3], ['func', {}, 3], ['degree', { max: 4, degs: [0, 3, 4, 5] }, 2], ['pool', { id: 'schluss' }, 2]], pass: 0.8 }
      ],
      review: [['cadence', {}], ['pool', { id: 'schluss' }]]
    },
    {
      id: '7.3', title: 'Zwischendominanten und Modulation', sub: 'Fremde Töne mit System – und der Weg in neue Tonarten.', min: 35,
      goals: ['Zwischendominanten bilden und im Notentext erkennen', 'verstehen, wie eine Modulation funktioniert', 'die typischen Ziel-Tonarten kennen'],
      steps: [
        { t: 'read', h: 'Jeder Akkord kann eine Dominante haben', body: `<p>Die Dominante (V7) macht die Tonika zum Ziel. Dieser Trick funktioniert mit <b>jedem</b> Dur- oder Moll-Akkord der Tonart: Stellst du seinen eigenen Dominantseptakkord davor, wird er für einen Moment zum Ziel. Das nennt man <b>Zwischendominante</b>, geschrieben z. B. <b>V7/ii</b> („Dominante der zweiten Stufe“).</p><p>So findest du sie: Zielakkord → eine Quinte höher → Dur mit kleiner Septime.</p><div class="tablewrap"><table><tr><th>in C-Dur</th><th>Ziel</th><th>Zwischendominante</th><th>fremder Ton</th></tr><tr><td>V7/ii</td><td>Dm</td><td>A7</td><td>cis</td></tr><tr><td>V7/iii</td><td>Em</td><td>H7</td><td>dis</td></tr><tr><td>V7/IV</td><td>F</td><td>C7</td><td>b</td></tr><tr><td>V7/V</td><td>G</td><td>D7</td><td>fis</td></tr><tr><td>V7/vi</td><td>Am</td><td>E7</td><td>gis</td></tr></table></div>[[0]]${F.merk('<b>Faustregel beim Lesen:</b> Ein Kreuz, das nicht zur Tonart gehört und dann einen Halbton aufwärts geht, ist fast immer der Leitton einer Zwischendominante.')}`, figs: [F.s([{ r: '(E4 G4 C5)/h (E4 G4 C#5)/h', l: 'C3/h A2/h', chords: [[0, 'C'], [2, 'A7']] }, { r: '(D4 F4 A4)/h (D4 F4 B4)/h', l: 'D3/h G2/h', chords: [[0, 'Dm'], [2, 'G7']] }, { r: '(C4 E4 C5)/w', l: 'C3/w', chords: [[0, 'C']], end: '|.' }], { grand: true, time: 'C', bpm: 60, cap: 'C – A7 – Dm – G7 – C: A7 ist die Zwischendominante zu Dm (cis → d).' })] },
        { t: 'ex', h: 'Übung: Zwischendominanten', gen: 'secDom', n: 8, need: 7 },
        { t: 'read', h: 'Modulation: die Tonart wechseln', body: `<p>Bleibt eine Zwischendominante nicht kurz, sondern bestätigt sich mit einem Ganzschluss in der neuen Tonart, hat das Stück <b>moduliert</b>. Der Weg ist fast immer derselbe:</p><ol><li>Ein <b>gemeinsamer Akkord</b>, der in beiden Tonarten vorkommt (Drehpunkt). Am in C-Dur (vi) = Am in G-Dur (ii).</li><li>Die <b>Dominante der neuen Tonart</b> (D7 mit fis).</li><li>Der <b>Ganzschluss</b> in der neuen Tonart (G).</li></ol>[[0]]<p><b>Typische Ziele</b> (eng verwandte Tonarten):</p><ul><li>Dur-Stücke → <b>Dominanttonart</b> (C → G). Fast jeder Mozart-Sonatensatz moduliert so.</li><li>Moll-Stücke → <b>Paralleltonart</b> (a-Moll → C-Dur).</li><li>Außerdem: Subdominante (C → F), Parallelen dieser Tonarten.</li><li>Romantik: auch weite, überraschende Wege – z. B. eine große Terz entfernt (C → E).</li></ul>`, figs: [F.s([{ r: '(E4 G4 C5)/h (E4 A4 C5)/h', l: 'C3/h A2/h', chords: [[0, 'C: I'], [2, 'vi = G: ii']] }, { r: '(D4 F#4 C5)/h (D4 G4 B4)/h', l: 'D3/h G2/h', chords: [[0, 'D7 = G: V7'], [2, 'G: I']], end: '|.' }], { grand: true, time: 'C', bpm: 60, cap: 'Modulation von C nach G über den gemeinsamen Akkord a-Moll.' })] },
        { t: 'ex', h: 'Übung: Modulation', gen: 'pool', o: { id: 'modulation' }, n: 6, need: 5 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel die beiden Beispiele oben, dann selbst gebaut: C → F (mit C7) und a-Moll → C-Dur (mit G7).</p>', checks: ['C – A7 – Dm – G7 – C gespielt; das cis gehört.', 'Modulation C → G gespielt.', 'Modulation C → F selbst gebaut (C – C7 – F – B♭ – C7 – F).', 'Im Walzer von Brahms oder im Moment musical eine Zwischendominante gefunden.'] },
        { t: 'piece', h: 'Schubert und Tschaikowsky', id: 'moment3', body: '<p><b>Schuberts Moment musical Nr. 3</b> (f-Moll, mit Ausflügen nach As-Dur) und <b>Tschaikowskys „Januar“</b> aus den Jahreszeiten sind voller Zwischendominanten und Modulationen – jetzt kannst du sie lesen und verstehen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['secDom', {}, 5], ['pool', { id: 'modulation' }, 5]], pass: 0.8 }
      ],
      review: [['secDom', {}], ['pool', { id: 'modulation' }]]
    },
    {
      id: '7.4', title: 'Besondere Akkorde', sub: 'Verminderter Septakkord, Neapolitaner, Orgelpunkt – und die Mondscheinsonate verstanden.', min: 35,
      goals: ['den verminderten Septakkord als „Dominante ohne Grundton“ verstehen', 'den neapolitanischen Sextakkord erkennen', 'Orgelpunkt und Vorhalt erkennen', 'die ersten Takte der Mondscheinsonate harmonisch erklären'],
      steps: [
        { t: 'read', h: 'Der verminderte Septakkord', body: `<p>Der <b>verminderte Septakkord</b> besteht nur aus kleinen Terzen (z. B. gis – h – d – f). Er klingt dramatisch und kommt in Moll auf der VII. Stufe vor. Man kann ihn als <b>Dominante ohne Grundton</b> verstehen: gis-h-d-f ist E7 (e-gis-h-d) mit kleiner None (f) und ohne e. Darum löst er sich wie eine Dominante auf – nach a-Moll.</p><p>Weil alle Abstände gleich sind, gibt es nur <b>drei verschiedene</b> verminderte Septakkorde – jeder kann sich in vier Richtungen auflösen. Romantiker nutzen ihn deshalb als Tür in ferne Tonarten.</p>[[0]]`, figs: [F.s([{ r: '(G#4 B4 D5 F5)/h (A4 C5 E5)/h', l: 'G#2/h A2/h', chords: [[0, 'Gis°7'], [2, 'Am']], end: '|.' }], { grand: true, time: 'C', bpm: 56, cap: 'Gis°7 → a-Moll: Alle Stimmen gehen in kleinen Schritten zum Ziel.' })] },
        { t: 'read', h: 'Der Neapolitaner', body: `<p>Der <b>neapolitanische Sextakkord</b> (N⁶) ist ein Dur-Akkord auf der <b>tiefalterierten II. Stufe</b> in Moll, meist als Sextakkord (erste Umkehrung, Terz im Bass). In c-Moll: Des-Dur über f. Er steht vor der Dominante und klingt dunkel und schmerzlich – ein Lieblingsakkord für tragische Momente.</p>[[0]]` , figs: [F.s([{ r: '(G4 C5 Eb5)/q (Ab4 Db5 F5)/q (G4 B4 F5)/q (G4 C5 Eb5)/q', l: 'C3/q F2/q G2/q C3/q', chords: [[0, 'i'], [1, 'N⁶'], [2, 'V7'], [3, 'i']], end: '|.' }], { grand: true, key: 'Eb', time: 'C', bpm: 56, cap: 'c-Moll: i – N⁶ (Des/F) – V7 – i.' })] },
        { t: 'read', h: 'Orgelpunkt und Vorhalt', body: `<ul><li><b>Orgelpunkt</b>: Der Bass bleibt lange auf einem Ton (meist Tonika oder Dominante), während sich darüber die Harmonien ändern. Wirkung: Spannung oder Ruhe, je nach Ton. Neoklassik (Einaudi, Tiersen) lebt davon.</li><li><b>Vorhalt</b>: Ein Ton des vorigen Akkords bleibt hängen und löst sich erst danach in den richtigen Akkordton auf – meist einen Schritt abwärts. Bekanntestes Beispiel: der Quartvorhalt (sus4 → 3): Gsus4 → G.</li><li><b>Durchgangs- und Wechselnoten</b>: Töne, die nicht zum Akkord gehören, aber schrittweise zwischen Akkordtönen vermitteln.</li></ul>` },
        { t: 'read', h: 'Analyse: Mondscheinsonate, Takt 1–5', body: `<p>Jetzt verstehst du, warum der Anfang so berührt. cis-Moll, vier Kreuze:</p>[[0]]<div class="tablewrap"><table><tr><th>Takt</th><th>Bass</th><th>Akkord</th><th>Funktion</th></tr><tr><td>1</td><td>Cis</td><td>cis-Moll</td><td>i – Tonika</td></tr><tr><td>2</td><td>H</td><td>cis-Moll über h</td><td>i mit Septime im Bass: Der Bass beginnt eine Linie abwärts</td></tr><tr><td>3</td><td>A → Fis</td><td>A-Dur → D-Dur/fis</td><td>VI → <b>Neapolitaner</b> (N⁶)</td></tr><tr><td>4</td><td>Gis</td><td>Gis7 (unvollständig) → cis/gis → Gis(sus4) → Gis7</td><td>Dominante mit Quartsextvorhalt und Quartvorhalt</td></tr><tr><td>5</td><td>Cis</td><td>cis-Moll</td><td>i – Ganzschluss; die Melodie beginnt (gis, punktiert)</td></tr></table></div><p>Die ganze Einleitung ist also eine einzige, gedehnte Kadenz <b>i – VI – N⁶ – V – i</b>, über einem Bass, der Schritt für Schritt absteigt (cis – h – a – fis – gis – cis).</p>`, figs: [F.p('mondschein', 0, 5, { chords: [[[0, 'i']], [[0, 'i/H']], [[0, 'VI'], [2, 'N⁶']], [[0, 'V7'], [1, 'i⁶₄'], [2, 'V4-3']], [[0, 'i']]], cap: 'Mondscheinsonate, Takt 1–5 – mit Funktionen.' })] },
        { t: 'ex', h: 'Übung: besondere Akkorde', gen: 'pool', o: { id: 'sonder' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel die Einleitung der Mondscheinsonate nur als Akkordgriffe (ein Griff pro halber Takt) und sag die Funktion laut.</p>', checks: ['Mondschein T. 1–5 als Griffe, Funktionen benannt.', 'Gis°7 → Am und H°7 → Cm aufgelöst.', 'i – N⁶ – V7 – i in c-Moll und a-Moll (B-Dur/d → E7 → Am).'] },
        { t: 'piece', h: 'Beethoven: Pathétique, 2. Satz', id: 'pathetique-2', body: '<p>Das <b>Adagio cantabile</b> der Pathétique ist dein zweites Pflichtstück: Melodie und Begleitung in einer Hand (Kapitel V!), Orgelpunkte, Zwischendominanten und im Mittelteil verminderte Akkorde.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'sonder' }, 6], ['seventh', { types: ['7', 'dim7', 'm7b5'] }, 2], ['cadence', {}, 2]], pass: 0.8 }
      ],
      review: [['pool', { id: 'sonder' }], ['seventh', { types: ['7', 'dim7', 'm7b5'] }]]
    },
    {
      id: '7.5', title: 'Analyse in der Praxis', sub: 'Ein Stück verstehen, bevor man es spielt.', min: 40,
      goals: ['ein Stück in fünf Schritten analysieren', 'aus Arpeggien die Akkorde herauslesen', 'Bachs Präludium C-Dur harmonisch verstehen'],
      steps: [
        { t: 'read', h: 'Die Analyse in fünf Schritten', body: `<ol><li><b>Rahmen</b>: Tonart, Taktart, Tempo, Charakter.</li><li><b>Form</b>: Wo wiederholt sich etwas? Teile mit Buchstaben benennen (A, B, A′).</li><li><b>Phrasen und Schlüsse</b>: Wo enden die Phrasen – Ganz- oder Halbschluss?</li><li><b>Harmonien</b>: Takt für Takt den Akkord bestimmen (Arpeggien zu Griffen zusammenschieben!). Stufen darunter schreiben.</li><li><b>Besonderheiten</b>: Modulationen, Zwischendominanten, Orgelpunkte, Höhepunkt.</li></ol>${F.merk('Analysierte Stücke lernst du doppelt so schnell und behältst sie viel länger: Du merkst dir 8 Akkorde statt 128 Noten. Das ist das Geheimnis, wie Profis Stücke auswendig spielen.')}` },
        { t: 'read', h: 'Bach: Präludium C-Dur, Takt 1–11', body: `<p>Das ganze Präludium ist eine Akkordfolge, in einem gleichbleibenden Muster gebrochen. Schiebst du jeden Takt zu einem Griff zusammen, erhältst du:</p>[[0]]<div class="tablewrap"><table><tr><th>Takt</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr><tr><td>Akkord</td><td>C</td><td>Dm7/C</td><td>G7/H</td><td>C</td><td>Am/C</td><td>D7/C</td><td>G/H</td><td>Cmaj7/H</td><td>Am7</td><td>D7</td><td>G</td></tr><tr><td>Funktion</td><td>I</td><td>ii⁴₂</td><td>V⁶₅</td><td>I</td><td>vi⁶</td><td>V⁴₂/V</td><td>V⁶</td><td>…</td><td>ii⁷ von G</td><td>V7/V</td><td>V = G: I</td></tr></table></div><p>Takt 1–4: eine Kadenz über dem Orgelpunkt c. Ab Takt 5 wandert die Musik mit D7 (fis!) zur <b>Dominanttonart G-Dur</b> und kommt in Takt 11 dort an – eine Modulation, genau wie in Lektion 7.3. Danach führt Bach über viele Zwischendominanten und einen langen Orgelpunkt auf g zurück nach C.</p>`, figs: [F.p('bwv846', 0, 4, { chords: [[[0, 'C']], [[0, 'Dm7/C']], [[0, 'G7/H']], [[0, 'C']]], cap: 'Präludium C-Dur, Takt 1–4: Jeder Takt ist ein gebrochener Akkord.' })] },
        { t: 'ex', h: 'Übung: Analyse-Wissen', gen: 'pool', o: { id: 'analyse' }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Akkorde aus Noten', gen: 'notesSym', o: { types: ['', 'm', '7'], inv: true }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Analysier eines deiner Stücke schriftlich (Papier und Bleistift, Akkorde über die Noten).</p>', checks: ['Präludium C-Dur, Takt 1–11 als Griffe gespielt.', 'Ein eigenes Stück: Form, Schlüsse und Akkorde aufgeschrieben.', 'Das analysierte Stück einmal nur aus den Akkorden (ohne Noten) nachgespielt.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'analyse' }, 5], ['notesSym', { types: ['', 'm', '7'], inv: true }, 3], ['cadence', {}, 2]], pass: 0.8 }
      ],
      review: [['pool', { id: 'analyse' }], ['notesSym', { types: ['', 'm', '7'], inv: true }]]
    },
    {
      id: '7.6', title: 'Harmonik der Neoklassik', sub: 'Einaudi, Tony Ann, Gibran Alcocer – wie dieser Klang gebaut ist.', min: 35,
      goals: ['die typischen Bausteine moderner Klavierballaden kennen', 'add9-, sus- und Slash-Akkorde spielen', 'verwandte Stücke mit Noten finden und einordnen'],
      steps: [
        { t: 'read', h: 'Woraus der Klang besteht', body: `<p>Neoklassische Klaviermusik (Ludovico Einaudi, Yiruma, Tony Ann, Gibran Alcocer, Ólafur Arnalds) nutzt eine kleine Zahl von Mitteln – sehr wirkungsvoll:</p><ul><li><b>Wenige Akkorde, oft wiederholt</b> – häufig vi – IV – I – V (Am – F – C – G), also die Pop-Folge, nur in Moll begonnen.</li><li><b>Ostinato</b>: Ein Begleitmuster in der linken Hand läuft unverändert weiter, oft weit gebrochen (Grundton – Quinte – None/Terz).</li><li><b>Farbtöne</b> statt Septimen: <b>add9</b> (C mit d), <b>sus2/sus4</b> (Terz ersetzt), <b>Slash-Akkorde</b> (F/A, C/E) für einen schrittweisen Bass.</li><li><b>Orgelpunkte</b> und lange Pedalflächen.</li><li><b>Dynamik als Form</b>: dasselbe Muster, immer voller und lauter, dann zurück ins Leise.</li></ul>[[0]]`, figs: [F.s([{ r: 'E5/h. D5/q', l: 'A2/8 E3/8 B3/8 C4/8 B3/8 E3/8 A2/8 E3/8', chords: [[0, 'Am(add9)']] }, { r: 'C5/w', l: 'F2/8 C3/8 G3/8 A3/8 G3/8 C3/8 F2/8 C3/8', chords: [[0, 'Fmaj7/add9']] }, { r: 'G4/h. E4/q', l: 'C3/8 G3/8 D4/8 E4/8 D4/8 G3/8 C3/8 G3/8', chords: [[0, 'C(add9)']] }, { r: 'D5/w', l: 'G2/8 D3/8 A3/8 B3/8 A3/8 D3/8 G2/8 D3/8', chords: [[0, 'G(add9)']], end: '|.' }], { grand: true, time: 'C', bpm: 72, cap: 'Ein neoklassisches Ostinato: Grundton – Quinte – None – Terz, über vi – IV – I – V.', voiced: true })] },
        { t: 'ex', h: 'Übung: Neoklassik', gen: 'pool', o: { id: 'neoklassik' }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Pop-Folgen in allen Tonarten', gen: 'prog', o: { set: ['pop', 'sad', 'minor'] }, n: 6, need: 5 },
        { t: 'read', h: 'Verwandte Stücke mit Noten', body: `<p>Einaudi, Tony Ann und Gibran Alcocer sind urheberrechtlich geschützt – ihre Noten gibt es nur zu kaufen. Aber ihr Klang hat Vorfahren, und die stehen hier mit Noten:</p><ul><li>Wie <b>Una Mattina</b>: An der Wiege (Grieg), Mai – Weiße Nächte (Tschaikowsky), Heimweh (Grieg).</li><li>Wie <b>Nuvole Bianche</b>: Rêverie (Debussy), Oktober – Herbstlied (Tschaikowsky), Notturno (Grieg).</li><li>Wie <b>Icarus</b>: Zug der Zwerge (Grieg), Kobold (Grieg), November – Troika (Tschaikowsky).</li><li>Wie <b>Idea 10</b>: Einsamer Wanderer, Elegie, Walzer op. 12 Nr. 2 (alle Grieg).</li></ul><p>Und <b>Clair de lune</b> von Debussy – der Urgroßvater der ruhigen Klaviermusik. Alle findest du unter „Alle Stücke“.</p><p>Bevor du eines davon übst: Analysier zuerst die Akkordfolge der ersten Zeile (Lektion 7.5).</p>` },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel das Ostinato oben, dann in d-Moll und e-Moll. Dann erfinde eine eigene Melodie darüber.</p>', checks: ['Ostinato vi – IV – I – V (Am–F–C–G) mit Pedal, 2 Minuten ohne Fehler.', 'Dasselbe in e-Moll (Em – C – G – D).', 'Eigene Melodie darüber improvisiert.', 'Eines der verwandten Stücke ausgewählt und die Akkorde der ersten Zeile bestimmt.'] },
        { t: 'tool', h: 'Werkzeug: Begleiter', tool: 'begleiter', body: '<p>Lass den Begleiter Akkordfolgen in verschiedenen Mustern spielen, und improvisier rechts dazu.</p>' },
        { t: 'piece', h: 'Debussy: Rêverie', id: 'reverie', body: '<p>Der Nuvole-Bianche-Klang, über hundert Jahre früher: ein wiegendes Muster links, eine träumerische Melodie rechts. Bestimm zuerst die Akkorde der ersten acht Takte.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'neoklassik' }, 6], ['prog', { set: ['pop', 'sad', 'minor'] }, 2], ['symNotes', { types: ['', 'm', 'sus4', 'sus2'] }, 2]], pass: 0.8 }
      ],
      review: [['pool', { id: 'neoklassik' }], ['prog', { set: ['pop', 'sad', 'minor'] }]]
    }
  ]
});

/* =========================================================================
   KAPITEL VIII · Form, Stil, Interpretation
   ========================================================================= */
CUR.chapters.push({
  id: 'VIII', title: 'Form, Stil und Bühne', sub: 'Wie Stücke gebaut sind, wie jede Epoche klingt, und wie du sie schnell lernst, auswendig spielst und vorträgst.', img: 'friedrich',
  warm: ['Tonleiter des Tages (alle Dur bis 4 Vorzeichen, im Wechsel), zwei Oktaven, ♩ = 80 in Sechzehnteln.', 'Kadenz mit Quartsextvorhalt in der Tonart des Tages.', 'Arpeggien über vier Oktaven (C, G, Am).', 'Ein Stück aus dem Gedächtnis, ohne Noten, einmal durch.'],
  must: ['alla-turca', 'entertainer'], more: ['mondschein-2', 'invention8', 'mazurka-g', 'consolation3', 'maple'],
  exam: { n: 20, pass: 0.85, items: [['term', { cats: ['Form'] }, 4], ['pool', { id: 'form' }, 3], ['pool', { id: 'epochen' }, 4], ['pool', { id: 'rubato' }, 2], ['pool', { id: 'rekord' }, 2], ['pool', { id: 'auswendig' }, 2], ['pool', { id: 'vorspiel' }, 2], ['cadence', {}, 1]] },
  lessons: [
    {
      id: '8.1', title: 'Musikalische Formen', sub: 'Liedform, Rondo, Menuett, Sonatensatz, Variation, Fuge.', min: 40,
      goals: ['die wichtigsten Formen benennen und am Notenbild erkennen', 'den Sonatensatz in seine Teile zerlegen', 'die Form jedes deiner Stücke angeben'],
      steps: [
        { t: 'read', h: 'Bausteine: A und B', body: `<p>Formen beschreibt man mit Buchstaben: gleicher Buchstabe = gleiche Musik, ein Strich (A′) = leicht verändert.</p><ul><li><b>Zweiteilige Form</b> (A B, oft |: A :|: B :|): Barocktänze, das Menuett G-Dur.</li><li><b>Dreiteilige Liedform</b> (A B A): Melodie – Kontrast – Rückkehr. Viele romantische Stücke (Pathétique II, Schumann).</li><li><b>Menuett mit Trio</b>: Menuett – Trio – Menuett (D.C.). Ein großes A B A.</li><li><b>Rondo</b> (A B A C A …): Ein Refrain kehrt immer wieder. Für Elise (A B A C A), Rondo alla turca.</li><li><b>Variation</b>: Ein Thema, dann mehrere Veränderungen (der 1. Satz der Sonate KV 331, deren 3. Satz du als Alla turca kennst).</li><li><b>Fuge / Invention</b>: Ein Thema wandert durch die Stimmen, imitiert, umgekehrt, verarbeitet.</li></ul>`, figs: [] },
        { t: 'read', h: 'Der Sonatensatz', body: `<p>Die wichtigste Form der Klassik (Kopfsatz fast jeder Sonate, Sinfonie, jedes Konzerts):</p><div class="tablewrap"><table><tr><th>Teil</th><th>Was passiert</th><th>Tonart (in Dur)</th></tr><tr><td><b>Exposition</b></td><td>1. Thema – Überleitung – 2. Thema – Schlussgruppe; meist wiederholt</td><td>I → V</td></tr><tr><td><b>Durchführung</b></td><td>Themen werden zerlegt und durch viele Tonarten geführt – die spannendste Stelle</td><td>wechselnd</td></tr><tr><td><b>Reprise</b></td><td>Exposition kommt wieder, aber das 2. Thema jetzt in der Grundtonart</td><td>I → I</td></tr><tr><td><b>Coda</b> (optional)</td><td>Schlussbekräftigung</td><td>I</td></tr></table></div><p>Beispiel <b>Mozart KV 545, 1. Satz</b>: Thema in C, Tonleiter-Überleitung, 2. Thema in G; kurze Durchführung in Moll; Reprise beginnt – ungewöhnlich – in F-Dur und kehrt dann nach C zurück. In Moll-Stücken steht das 2. Thema meist in der Paralleltonart (z. B. Pathétique I: c-Moll → Es-Dur/es-Moll).</p>` },
        { t: 'ex', h: 'Übung: Formbegriffe', gen: 'term', o: { cats: ['Form'] }, n: 8, need: 7 },
        { t: 'ex', h: 'Übung: Formen erkennen', gen: 'pool', o: { id: 'form' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Bestimme die Form aller Stücke, die du kannst, und schreib sie mit Taktzahlen auf.</p>', checks: ['Für Elise: A–B–A–C–A mit Taktzahlen.', 'Sonate KV 545, 1. Satz: Exposition, Durchführung, Reprise gefunden.', 'Menuett G-Dur und ein Schumann-Stück: Form bestimmt.'] },
        { t: 'piece', h: 'Alla turca', id: 'alla-turca', body: '<p>Das <b>Rondo alla turca</b> (Mozart, KV 331, 3. Satz) – ganz, im Original. Ein Rondo mit a-Moll-Refrain und dem berühmten A-Dur-„Janitscharen“-Teil. Dein erstes Pflichtstück in diesem Kapitel. Und auch der 2. Satz der Mondscheinsonate und Bachs Invention F-Dur sind jetzt offen.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['term', { cats: ['Form'] }, 5], ['pool', { id: 'form' }, 5]], pass: 0.8 }
      ],
      review: [['term', { cats: ['Form'] }], ['pool', { id: 'form' }]]
    },
    {
      id: '8.2', title: 'Stilepochen', sub: 'Barock, Klassik, Romantik, Impressionismus, Moderne – und wie man sie spielt.', min: 35,
      goals: ['die Epochen zeitlich und klanglich einordnen', 'für jede Epoche die Spielweise kennen (Artikulation, Pedal, Tempo)', 'deine Stücke ihrer Epoche zuordnen'],
      steps: [
        { t: 'read', h: 'Fünf Epochen in einer Tabelle', body: `<div class="tablewrap"><table><tr><th>Epoche</th><th>Zeit</th><th>Komponisten</th><th>Klang</th><th>So spielst du es</th></tr><tr><td><b>Barock</b></td><td>ca. 1600–1750</td><td>Bach, Händel, Scarlatti</td><td>mehrstimmig, gleichmäßiger Puls, Verzierungen</td><td>wenig oder kein Pedal, klare Artikulation (oft non legato), Terrassendynamik (Stufen statt Crescendi)</td></tr><tr><td><b>Klassik</b></td><td>ca. 1750–1820</td><td>Haydn, Mozart, Beethoven (früh), Clementi</td><td>Melodie + Begleitung, klare Phrasen, Kadenzen</td><td>leicht, elegant, sparsames Pedal, Alberti-Bass leise, Phrasen wie Sätze</td></tr><tr><td><b>Romantik</b></td><td>ca. 1820–1900</td><td>Schubert, Chopin, Schumann, Liszt, Brahms, Tschaikowsky</td><td>Gefühl, weite Harmonik, große Klangfarben</td><td>viel Pedal, singende Melodie, Rubato, große Dynamik</td></tr><tr><td><b>Impressionismus</b></td><td>ca. 1890–1920</td><td>Debussy, Ravel, Satie</td><td>Farben, Klangflächen, Ganztonleiter, Pentatonik</td><td>Pedal als Klangwolke, weicher Anschlag, wenig Akzente</td></tr><tr><td><b>Moderne / Neoklassik</b></td><td>20.–21. Jh.</td><td>Ragtime (Joplin), Einaudi, Tony Ann, Alcocer</td><td>von wild bis minimal; Neoklassik: einfache Harmonik, Ostinati</td><td>je nach Stil: Ragtime streng im Takt, Neoklassik mit langen Pedalflächen und Dynamikbögen</td></tr></table></div>` },
        { t: 'read', h: 'Beethoven, die Brücke', body: `<p><b>Ludwig van Beethoven</b> (1770–1827) steht genau an der Grenze: Seine frühen Sonaten (op. 49, Pathétique) sind klassisch gebaut, aber voller romantischem Ausdruck. Die Mondscheinsonate (1801) mit ihrem Pedal-Klang über dem ganzen Satz war revolutionär. Darum spielt man Beethoven mit klassischer Klarheit <b>und</b> großer Dynamik – nie „nur hübsch“.</p><p><b>Mozart</b> dagegen verlangt Leichtigkeit: Jeder Ton muss perfekt sitzen, Pedal nur sparsam, Läufe wie Perlen. <b>Bach</b> verlangt Unabhängigkeit der Hände und klare Linien. <b>Chopin</b> verlangt Gesang und Pedal-Kunst.</p>` },
        { t: 'ex', h: 'Übung: Epochen', gen: 'pool', o: { id: 'epochen' }, n: 10, need: 8 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Spiel nacheinander ein Barock-, ein Klassik- und ein Romantik-Stück und übertreib den Stil bewusst.</p>', checks: ['Bach (Präludium oder Invention): kein Pedal, klare Linien.', 'Mozart (KV 545): leicht, Alberti-Bass leise.', 'Chopin oder Schumann: singend, mit Pedal und Rubato.'] },
        { t: 'piece', h: 'Ragtime: The Entertainer', id: 'entertainer', body: '<p>Scott Joplins <b>The Entertainer</b> (1902) – dein zweites Pflichtstück. Ragtime ist <b>streng im Takt</b>: Die linke Hand springt gleichmäßig zwischen Basston und Akkord, die rechte spielt synkopiert darüber. Joplin schrieb dazu: „Not fast“ – nicht schnell!</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'epochen' }, 10]], pass: 0.8 }
      ],
      review: [['pool', { id: 'epochen' }]]
    },
    {
      id: '8.3', title: 'Rubato und Agogik', sub: 'Zeit formen, ohne den Puls zu verlieren.', min: 25,
      goals: ['Rubato stilgerecht einsetzen', 'Agogik (kleine Tempoverschiebungen) bewusst gestalten', 'Unterschied zwischen frei und unruhig hören'],
      steps: [
        { t: 'read', h: 'Gestohlene Zeit', body: `<p><b>Rubato</b> (italienisch „geraubt“) heißt: Das Tempo darf atmen. Vor einem Höhepunkt etwas drängen, am Höhepunkt kurz verweilen, am Phrasenende sich Zeit nehmen.</p><ul><li>Chopin beschrieb es so: Die linke Hand ist der Dirigent und bleibt im Takt, die rechte Hand singt frei darüber.</li><li><b>Agogik</b> sind die ganz kleinen Verschiebungen: ein winziges Zögern vor einem wichtigen Ton, ein leichtes Dehnen eines Seufzers.</li><li>Rubato ist ein <b>Ausgleich</b>: Was du an einer Stelle an Zeit nimmst, gibst du an einer anderen zurück. Der Gesamtfluss bleibt.</li><li>Stilfrage: viel in Chopin, Schumann, Tschaikowsky, Neoklassik; sehr wenig in Bach, Mozart und im Ragtime.</li></ul>${F.warn('Rubato ist nie Ausrede für Unsicherheit. Erst wenn ein Stück streng im Metronom sitzt, darfst du es frei gestalten.')}` },
        { t: 'ex', h: 'Übung: Rubato', gen: 'pool', o: { id: 'rubato' }, n: 6, need: 5 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm Liszts <b>Consolation Nr. 3</b> oder Chopins Prélude e-Moll.</p>', checks: ['Einmal streng mit Metronom.', 'Einmal frei: Höhepunkte und Phrasenenden gestaltet.', 'Beide Aufnahmen verglichen: Klingt die freie Version natürlich, nicht holprig?'] },
        { t: 'piece', h: 'Liszt: Consolation Nr. 3', id: 'consolation3', body: '<p>Die dritte <b>Consolation</b> ist eines der schönsten romantischen Stücke für das mittlere Niveau – mit langen Pedalflächen, singender Melodie in der Mitte der Hand und viel Raum für Rubato.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'rubato' }, 5], ['term', { cats: ['Vortrag', 'Tempo'] }, 3]], pass: 0.8 }
      ],
      review: [['pool', { id: 'rubato' }]]
    },
    {
      id: '8.4', title: 'Ein Stück in Rekordzeit', sub: 'Die Profi-Methode zum Einstudieren.', min: 35,
      goals: ['ein neues Stück mit System statt Wiederholung lernen', 'Abschnitte, Hände, Tempo und Ziele planen', 'Übe-Techniken für schwierige Stellen kennen'],
      steps: [
        { t: 'read', h: 'Der Plan für jedes neue Stück', body: `<ol><li><b>Hören und ansehen</b> (Tag 1): Aufnahme hören, Noten mitlesen, Analyse (Lektion 7.5): Form, Tonart, Akkorde, schwierige Stellen markieren.</li><li><b>Fingersatz festlegen</b> – einmal, schriftlich, und dann nie mehr ändern. Ein wechselnder Fingersatz ist der häufigste Grund für Fehler, die nicht weggehen.</li><li><b>Schwerste Stellen zuerst</b>, nicht der Anfang. Sonst kannst du am Ende den Anfang perfekt und den Rest nie.</li><li><b>Kleine Abschnitte</b> (1–4 Takte), Hände einzeln, dann zusammen, langsam (Tempo-Treppe, Lektion 2.6).</li><li><b>Verketten</b>: Abschnitte mit einem Ton Überlappung verbinden (Takt 1–4, dann 4–8, dann 1–8).</li><li><b>Durchspielen</b> erst, wenn alle Teile sitzen – dann langsam das Tempo erhöhen.</li></ol>` },
        { t: 'read', h: 'Werkzeuge für schwierige Stellen', body: `<ul><li><b>Rhythmusvarianten</b>: Schnelle Läufe punktiert üben (lang-kurz, dann kurz-lang). Danach klingt der gerade Lauf plötzlich leicht.</li><li><b>Stopp-Methode</b>: Gruppen von 4 Tönen blitzschnell, dann Pause (die nächste Gruppe im Kopf vorbereiten).</li><li><b>Rückwärts-Verketten</b>: Den letzten Takt zuerst, dann die letzten zwei, … So ist das Ende immer am sichersten.</li><li><b>Sprünge</b>: Erst ohne Ton zur Zieltaste springen und berühren, dann spielen. Blick zum Ziel, bevor die Hand losfliegt.</li><li><b>Verteiltes Üben</b>: Dreimal 15 Minuten über den Tag verteilt bringen mehr als 45 Minuten am Stück – das Gehirn festigt Bewegungen in den Pausen und im Schlaf.</li><li><b>Abwechseln</b> (interleaved practice): Mehrere Stellen im Wechsel üben, statt eine Stelle 30-mal hintereinander.</li></ul>${F.merk('<b>Die drei goldenen Regeln:</b> Langsam genug, dass es fehlerfrei ist. Fingersatz immer gleich. Jede Übe-Einheit mit einem kleinen, klaren Ziel beginnen („Takt 9–12 beidhändig ♩ = 60“).')}` },
        { t: 'ex', h: 'Übung: Übe-Methoden', gen: 'pool', o: { id: 'rekord' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier: Das Experiment', body: '<p>Wähle ein neues Stück aus diesem Kapitel (z. B. Maple Leaf Rag oder Invention F-Dur) und lern es konsequent nach dem Plan. Notiere im Stück-Protokoll jeden Tag den Stand.</p>', checks: ['Analyse und Fingersatz für das neue Stück aufgeschrieben.', 'Schwerste Stelle zuerst geübt (mit Rhythmusvarianten).', 'Nach einer Woche: Wie viele Takte sitzen? Im Protokoll notiert.'] },
        { t: 'piece', h: 'Maple Leaf Rag', id: 'maple', body: '<p>Joplins <b>Maple Leaf Rag</b> ist anspruchsvoller als der Entertainer: Oktavsprünge links, synkopierte Akkorde rechts. Perfekt, um die Methode auszuprobieren.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'rekord' }, 6], ['pool', { id: 'methode' }, 4]], pass: 0.8 }
      ],
      review: [['pool', { id: 'rekord' }]]
    },
    {
      id: '8.5', title: 'Auswendig spielen', sub: 'Vier Gedächtnisse – damit es auch unter Druck hält.', min: 30,
      goals: ['die vier Arten des musikalischen Gedächtnisses kennen', 'ein Stück auf mehreren Wegen sicher auswendig lernen', 'Einstiegspunkte festlegen'],
      steps: [
        { t: 'read', h: 'Vier Gedächtnisse', body: `<ol><li><b>Fingergedächtnis</b> (motorisch): kommt von allein durch Wiederholung – aber es ist das unzuverlässigste. Unter Nervosität reißt es als Erstes.</li><li><b>Hörgedächtnis</b>: Du weißt, wie es klingen muss, und kannst die Melodie singen.</li><li><b>Visuelles Gedächtnis</b>: Du siehst die Notenseite oder die Tastatur vor dir.</li><li><b>Analytisches Gedächtnis</b>: Du weißt, welche Akkorde, welche Form, welche Tonart – das sicherste von allen.</li></ol><p>Pianisten, die auswendig nie hängen bleiben, haben alle vier aufgebaut. Darum war Lektion 7.5 so wichtig.</p>` },
        { t: 'read', h: 'So lernst du auswendig', body: `<ul><li><b>Von Anfang an</b> in kleinen Abschnitten auswendig – nicht erst „wenn es sitzt“.</li><li><b>Einstiegspunkte</b>: Alle 4–8 Takte eine Stelle markieren, an der du jederzeit neu einsetzen kannst. Übe, an jeder davon zu beginnen. Bleibst du beim Vorspielen hängen, springst du zum nächsten.</li><li><b>Mentales Üben</b>: Das Stück im Kopf spielen, mit Noten, Klang und Fingern – ohne Klavier. Wo es im Kopf unklar wird, ist es auch in den Fingern unsicher.</li><li><b>Hände einzeln</b> auswendig spielen können – das ist der Härtetest.</li><li><b>Langsam auswendig</b>: Sehr langsames Spielen schaltet das Fingergedächtnis ab und zeigt, was du wirklich weißt.</li><li>Am Tag nach dem Lernen prüfen – Schlaf festigt das Gedächtnis.</li></ul>` },
        { t: 'ex', h: 'Übung: Gedächtnis', gen: 'pool', o: { id: 'auswendig' }, n: 6, need: 5 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Nimm die Mondscheinsonate (oder ein anderes Stück, das du auswendig kannst) und mach den Härtetest.</p>', checks: ['Linke Hand allein auswendig.', 'Ganz langsam (halbes Tempo) auswendig.', 'An drei verschiedenen Einstiegspunkten begonnen.', 'Einmal komplett im Kopf gespielt, ohne Klavier.'] },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'auswendig' }, 6]], pass: 0.8 }
      ],
      review: [['pool', { id: 'auswendig' }]]
    },
    {
      id: '8.6', title: 'Vorspielen und Lampenfieber', sub: 'Vom Übezimmer auf die Bühne – Winterball inklusive.', min: 30,
      goals: ['Vorspielen gezielt üben', 'mit Lampenfieber umgehen', 'mit Fehlern auf der Bühne souverän umgehen'],
      steps: [
        { t: 'read', h: 'Vorspielen ist eine eigene Fähigkeit', body: `<p>Zu Hause gelingt ein Stück, auf der Bühne nicht? Das ist normal: Unter Adrenalin spielt man schneller, die Hände zittern, das Fingergedächtnis wackelt. Du kennst das schon vom Vorspiel vor 250 Leuten. Darum übt man Vorspielen – wie alles andere.</p><ul><li><b>Probe-Vorspiele</b>: vor Familie, Freunden, per Video-Anruf. Oder: Handy-Kamera an, „Aufnahme läuft“ – das erzeugt schon etwas Druck.</li><li><b>Einmal-Regel</b>: Bei jedem Übe-Tag einmal das ganze Stück „wie im Konzert“: ohne Anhalten, egal was passiert.</li><li><b>Kalt spielen</b>: Ohne Einspielen direkt das Stück – so wie auf der Bühne oft.</li><li><b>Fremde Klaviere</b>: Wenn möglich auf einem anderen Instrument proben (Tastengewicht, Pedal sind überall anders).</li></ul>` },
        { t: 'read', h: 'Lampenfieber und Fehler', body: `<ul><li>Lampenfieber ist <b>Energie</b>, kein Zeichen von Schwäche. Fast alle Profis haben es.</li><li><b>Atmen</b>: Vor dem Spielen langsam ausatmen (länger aus als ein, z. B. 4 ein – 6 aus). Das beruhigt den Puls.</li><li><b>Ritual</b>: Bank einstellen, Hände in den Schoß, das Anfangstempo im Kopf singen, erst dann anfangen. Immer gleich.</li><li><b>Tempo</b>: Unter Nervosität wird man schneller – bewusst etwas langsamer beginnen.</li><li><b>Fehler</b>: Weiterspielen! Das Publikum merkt die meisten Fehler nicht – aber es merkt jedes Anhalten. Niemals zurückgehen, nie das Gesicht verziehen.</li><li><b>Hängen geblieben</b>: Zum nächsten Einstiegspunkt springen (Lektion 8.5), oder linke Hand mit Akkorden weiter, bis die Melodie wiederkommt.</li><li>Nach dem Spielen: verbeugen, lächeln. Danke sagen ist Teil des Vortrags.</li></ul>${F.merk('Für den Winterball: Plane drei Probe-Vorspiele vor dem Termin. Das letzte genau eine Woche davor, im Ball-Outfit, mit „Bühnenritual“.')}` },
        { t: 'ex', h: 'Übung: Bühne', gen: 'pool', o: { id: 'vorspiel' }, n: 8, need: 7 },
        { t: 'piano', h: 'Am Klavier', body: '<p>Gib ein kleines Hauskonzert: drei Stücke aus verschiedenen Epochen, ohne Anhalten, vor mindestens einer Person oder vor der Kamera.</p>', checks: ['Programm mit drei Stücken festgelegt (Barock/Klassik/Romantik oder Neoklassik).', 'Ritual geübt (Bank, Atmen, Tempo singen).', 'Hauskonzert gegeben oder aufgenommen.', 'Aufnahme angehört und drei Dinge notiert, die gut waren.'] },
        { t: 'piece', h: 'Chopin: Mazurka g-Moll', id: 'mazurka-g', body: '<p>Zum Abschluss eine Chopin-<b>Mazurka</b> (op. 67 Nr. 2): ein polnischer Tanz im 3/4-Takt mit Betonung oft auf der zweiten oder dritten Zählzeit, melancholisch und stolz – ein schönes Konzertstück.</p>' },
        { t: 'test', h: 'Abschlusstest', gens: [['pool', { id: 'vorspiel' }, 6], ['pool', { id: 'auswendig' }, 2], ['pool', { id: 'rubato' }, 2]], pass: 0.8 },
        { t: 'test', h: 'Großer Wiederholungstest', gens: [['keySig', { max: 7, mode: 'both' }, 2], ['ivQual', {}, 2], ['seventh', {}, 2], ['cadence', {}, 2], ['secDom', {}, 1], ['term', {}, 4], ['repeatOrder', {}, 1], ['pool', { id: 'form' }, 2], ['pool', { id: 'epochen' }, 2], ['noteName', { clef: 'bass', range: ['C1', 'G4'], oct: true }, 2]], pass: 0.85 }
      ],
      review: [['pool', { id: 'vorspiel' }]]
    }
  ]
});

/* ===== Notenweg 3 · Wissensfragen Kapitel III–IV ===== */
Object.assign(CUR.pools, {
  dur: [
    { q: 'Wie lautet der Bauplan der Dur-Tonleiter?', a: 'Ganz – Ganz – Halb – Ganz – Ganz – Ganz – Halb', w: ['Ganz – Halb – Ganz – Ganz – Halb – Ganz – Ganz', 'Ganz – Ganz – Ganz – Halb – Ganz – Ganz – Halb', 'Halb – Ganz – Ganz – Ganz – Halb – Ganz – Ganz'], e: 'G G H G G G H. Die Halbtöne liegen zwischen der 3./4. und der 7./8. Stufe.' },
    { q: 'Zwischen welchen Stufen liegen in Dur die Halbtonschritte?', a: '3–4 und 7–8', w: ['2–3 und 5–6', '3–4 und 6–7', '4–5 und 7–8'], e: 'In C-Dur: e–f (3–4) und h–c (7–8).' },
    { q: 'Warum braucht G-Dur ein fis?', a: 'damit zwischen der 6. und 7. Stufe ein Ganzton und zwischen 7 und 8 ein Halbton liegt', w: ['weil G-Dur immer ein Kreuz hat, ohne Grund', 'damit die Tonleiter lauter klingt', 'weil f auf dem Klavier fehlt'], e: 'e–f wäre ein Halbton, f–g ein Ganzton – genau falsch herum. Mit fis stimmt es: e–fis Ganzton, fis–g Halbton.' },
    { q: 'Warum braucht F-Dur ein b?', a: 'damit zwischen der 3. und 4. Stufe (a–b) ein Halbton liegt', w: ['damit das Stück trauriger klingt', 'weil h und f nicht zusammenpassen', 'damit zwischen 7 und 8 ein Ganzton liegt'], e: 'a–h wäre ein Ganzton; die 3.–4. Stufe muss ein Halbton sein. Also b.' },
    { q: 'Wie heißt der 7. Ton einer Dur-Tonleiter, der einen Halbton unter dem Grundton liegt?', a: 'Leitton', w: ['Grundton', 'Dominante', 'Mediante'], e: 'Der Leitton „leitet“ zum Grundton – h in C-Dur, fis in G-Dur.' },
    { q: 'Wie viele verschiedene Töne hat eine Dur-Tonleiter (ohne die Oktave)?', a: '7', w: ['8', '5', '12'], e: 'Sieben Töne; der achte ist die Oktave des Grundtons.' },
    { q: 'Welche Töne hat D-Dur?', a: 'd e fis g a h cis d', w: ['d e f g a h c d', 'd e fis g a h c d', 'd e fis gis a h cis d'], e: 'D-Dur hat zwei Kreuze: fis und cis.' },
    { q: 'Welche Töne hat B-Dur?', a: 'b c d es f g a b', w: ['b c d e f g a b', 'b c des es f g a b', 'b c d es f ges a b'], e: 'B-Dur hat zwei Bs: b und es.' },
    { q: 'Was ist ein Tetrachord?', a: 'eine Gruppe von vier Tönen (G–G–H); jede Dur-Tonleiter besteht aus zwei gleichen davon', w: ['ein Akkord aus vier Tönen', 'eine Tonleiter mit vier Vorzeichen', 'ein Taktteil mit vier Schlägen'], e: 'Die Dur-Tonleiter = zwei Tetrachorde (G–G–H) mit einem Ganzton dazwischen.' },
    { q: 'Was haben alle Dur-Tonleitern gemeinsam?', a: 'denselben Bauplan von Ganz- und Halbtönen', w: ['dieselben schwarzen Tasten', 'denselben Fingersatz', 'dieselbe Anzahl Kreuze'], e: 'Nur der Startton ändert sich – der Bauplan bleibt. Darum klingen alle Dur-Tonleitern „gleich“, nur höher oder tiefer.' }
  ],
  fingersatz: [
    { q: 'Wo setzt in der C-Dur-Tonleiter (rechts, aufwärts) der Daumen unter?', a: 'nach dem 3. Finger auf e – Daumen auf f', w: ['nach dem 4. Finger auf f – Daumen auf g', 'nach dem 2. Finger auf d – Daumen auf e', 'gar nicht, man springt'], e: 'Rechts: 1 2 3 – 1 2 3 4 5. Nach e (3) kommt der Daumen auf f.' },
    { q: 'Wie lautet der Standard-Fingersatz für C-Dur rechts über eine Oktave?', a: '1 2 3 1 2 3 4 5', w: ['1 2 3 4 1 2 3 4', '1 2 3 4 5 1 2 3', '1 2 1 2 3 1 2 3'], e: 'Daumen – Zeige – Mittel, untersetzen, dann 1 2 3 4 5.' },
    { q: 'Wie lautet der Standard-Fingersatz für C-Dur links aufwärts?', a: '5 4 3 2 1 3 2 1', w: ['1 2 3 1 2 3 4 5', '5 4 3 2 1 4 3 2', '4 3 2 1 4 3 2 1'], e: 'Links aufwärts: 5 4 3 2 1, dann kreuzt der 3. Finger über den Daumen.' },
    { q: 'Was passiert beim Daumenuntersatz mit der Hand?', a: 'Die Hand bleibt ruhig und waagerecht, der Daumen gleitet unter der Handfläche durch', w: ['Der Ellbogen hebt sich stark nach außen', 'Das Handgelenk knickt nach unten', 'Die ganze Hand springt'], e: 'Der Daumen bereitet sich früh vor und gleitet unter; Ellbogen und Handgelenk bleiben ruhig.' },
    { q: 'Warum übt man Tonleitern?', a: 'für gleichmäßige Finger, Daumenuntersatz und Orientierung in allen Tonarten', w: ['nur damit die Finger stärker werden', 'weil sie in Prüfungen verlangt werden – sonst nutzlos', 'damit man keine Stücke üben muss'], e: 'Tonleitern stecken in fast jedem Stück; wer sie kann, liest und spielt Passagen viel schneller.' },
    { q: 'Wann setzt der Daumen in Tonleitern mit vielen schwarzen Tasten an?', a: 'auf weißen Tasten – der Daumen meidet die schwarzen', w: ['immer auf der ersten schwarzen Taste', 'immer auf dem Grundton', 'abwechselnd weiß und schwarz'], e: 'Der kurze Daumen gehört auf weiße Tasten; deshalb haben z. B. B-Dur und Es-Dur besondere Fingersätze.' },
    { q: 'Wo liegt der 4. Finger rechts in G-Dur?', a: 'auf fis', w: ['auf f', 'auf g', 'auf c'], e: 'G-Dur rechts: 1 2 3 1 2 3 4 5 – der 4. Finger fällt auf fis.' },
    { q: 'Wo liegt der 4. Finger rechts in F-Dur?', a: 'auf b', w: ['auf a', 'auf c', 'auf e'], e: 'F-Dur rechts: 1 2 3 4 1 2 3 4 – der 4. Finger auf b, dann Daumen auf c.' },
    { q: 'Was ist beim Tonleiter-Üben am wichtigsten?', a: 'gleichmäßige Töne in Lautstärke und Rhythmus, langsam mit Metronom', w: ['möglichst schnell spielen', 'möglichst laut spielen', 'mit Pedal spielen'], e: 'Gleichmäßigkeit vor Tempo: Jeder Ton gleich laut und gleich lang.' },
    { q: 'Was ist ein Fingerübersatz?', a: 'ein Finger (meist 3 oder 4) kreuzt über den Daumen', w: ['der Daumen geht unter die Hand', 'zwei Finger spielen dieselbe Taste', 'Wechsel von links nach rechts'], e: 'Abwärts (rechts) und aufwärts (links) wird ein Finger über den Daumen gesetzt.' }
  ],
  vorzeichen: [
    { q: 'Wie lange gilt ein Versetzungszeichen im Takt?', a: 'bis zum Taktende, für diesen Ton in dieser Oktave', w: ['nur für die eine Note', 'bis zum Ende des Stücks', 'bis zum nächsten Doppelstrich'], e: 'Ein ♯, ♭ oder ♮ im Takt gilt bis zum Taktstrich – für dieselbe Tonhöhe.' },
    { q: 'Was hebt ein Auflösungszeichen (♮) auf?', a: 'Kreuz oder B – der Stammton gilt wieder', w: ['nur Kreuze', 'nur Bs', 'die Taktart'], e: 'Das ♮ macht jede Erhöhung oder Erniedrigung rückgängig.' },
    { q: 'Wo stehen die Vorzeichen der Tonart (Vorzeichnung)?', a: 'am Anfang jeder Zeile, direkt nach dem Schlüssel', w: ['nur am Anfang des Stücks', 'vor jeder betroffenen Note', 'am Ende jeder Zeile'], e: 'Die Vorzeichnung wird in jeder Zeile wiederholt und gilt für alle Oktaven.' },
    { q: 'Ein fis steht in der Vorzeichnung. Was gilt für ein f in einer anderen Oktave?', a: 'Es wird auch als fis gespielt', w: ['Es bleibt f', 'Nur in der Oktave der Vorzeichnung', 'Nur im ersten Takt'], e: 'Die Vorzeichnung gilt für alle Oktaven.' },
    { q: 'Was ist ein Doppelkreuz?', a: 'eine Erhöhung um zwei Halbtöne (z. B. fisis)', w: ['zwei Kreuze in der Vorzeichnung', 'eine Erhöhung um eine Oktave', 'ein Zeichen für Wiederholung'], e: 'Doppelkreuz (𝄪) erhöht um zwei Halbtöne: fisis klingt wie g.' },
    { q: 'Was ist ein Warnungs- oder Erinnerungsvorzeichen?', a: 'ein Vorzeichen in Klammern, das nur zur Sicherheit erinnert', w: ['ein Vorzeichen, das doppelt gilt', 'ein Vorzeichen, das man ignorieren muss', 'ein Zeichen für Fehler'], e: 'Nach einem Takt mit Versetzungszeichen erinnert der Herausgeber oft, dass jetzt wieder die Vorzeichnung gilt.' },
    { q: 'Im Takt steht ein cis, danach in der gleichen Oktave ein c ohne Zeichen. Was spielst du?', a: 'cis', w: ['c', 'ces', 'ein beliebiges c'], e: 'Das Versetzungszeichen gilt bis zum Taktende.' },
    { q: 'Gilt ein Versetzungszeichen über den Taktstrich hinaus, wenn die Note übergebunden ist?', a: 'Ja, für die übergebundene Note', w: ['Nein, nie', 'Ja, für den ganzen nächsten Takt', 'Nur bei Bs'], e: 'Ein Haltebogen trägt die Tonhöhe mit – danach gilt im neuen Takt wieder die Vorzeichnung.' },
    { q: 'Welche Tonart hat ein Kreuz (fis)?', a: 'G-Dur (oder e-Moll)', w: ['D-Dur (oder h-Moll)', 'F-Dur (oder d-Moll)', 'C-Dur (oder a-Moll)'], e: 'Ein Kreuz: G-Dur / e-Moll.' },
    { q: 'Welche Tonart hat ein b?', a: 'F-Dur (oder d-Moll)', w: ['B-Dur (oder g-Moll)', 'G-Dur (oder e-Moll)', 'Es-Dur (oder c-Moll)'], e: 'Ein b: F-Dur / d-Moll.' }
  ],
  quinten: [
    { q: 'Was zeigt der Quintenzirkel?', a: 'alle Tonarten, geordnet nach der Zahl ihrer Vorzeichen', w: ['alle Akkorde eines Stücks', 'die Tasten des Klaviers', 'die Tempi von langsam bis schnell'], e: 'Im Uhrzeigersinn je eine Quinte höher und ein Kreuz mehr; gegen den Uhrzeigersinn ein b mehr.' },
    { q: 'Was passiert im Quintenzirkel einen Schritt im Uhrzeigersinn?', a: 'eine Quinte höher, ein Kreuz mehr', w: ['eine Quarte höher, ein b mehr', 'ein Halbton höher', 'eine Terz tiefer'], e: 'C → G → D → A → E → H → Fis.' },
    { q: 'Welche Tonart folgt im Quintenzirkel auf D-Dur (im Uhrzeigersinn)?', a: 'A-Dur', w: ['G-Dur', 'E-Dur', 'H-Dur'], e: 'C G D A E H Fis – nach D kommt A.' },
    { q: 'Welche Tonart folgt im Quintenzirkel auf F-Dur (gegen den Uhrzeigersinn)?', a: 'B-Dur', w: ['C-Dur', 'Es-Dur', 'As-Dur'], e: 'C F B Es As Des Ges – nach F kommt B.' },
    { q: 'In welcher Reihenfolge kommen die Kreuze?', a: 'fis cis gis dis ais eis his', w: ['fis gis cis dis ais eis his', 'cis fis gis dis eis ais his', 'fis cis dis gis ais his eis'], e: 'Jedes neue Kreuz liegt eine Quinte über dem vorigen.' },
    { q: 'In welcher Reihenfolge kommen die Bs?', a: 'b es as des ges ces fes', w: ['b as es des ges fes ces', 'es b as ges des ces fes', 'b es des as ges fes ces'], e: 'Genau die Kreuz-Reihe rückwärts, mit ♭ statt ♯.' },
    { q: 'Wie findest du bei Kreuz-Tonarten den Dur-Grundton?', a: 'einen Halbton über dem letzten Kreuz', w: ['das letzte Kreuz selbst', 'eine Quinte unter dem ersten Kreuz', 'das vorletzte Kreuz'], e: 'Letztes Kreuz dis → E-Dur.' },
    { q: 'Wie findest du bei B-Tonarten den Dur-Grundton (ab 2 Bs)?', a: 'das vorletzte b', w: ['das letzte b', 'einen Halbton über dem letzten b', 'eine Quinte über dem ersten b'], e: 'b es as → vorletztes ist es → Es-Dur.' },
    { q: 'Welche Tonarten stehen sich unten im Quintenzirkel gegenüber und klingen gleich?', a: 'Fis-Dur und Ges-Dur', w: ['C-Dur und Fis-Dur', 'H-Dur und B-Dur', 'Es-Dur und E-Dur'], e: 'Fis-Dur (6♯) und Ges-Dur (6♭) sind enharmonisch gleich – gleiche Tasten, andere Namen.' },
    { q: 'Wie viele Vorzeichen hat E-Dur?', a: '4 Kreuze', w: ['3 Kreuze', '5 Kreuze', '4 Bs'], e: 'fis cis gis dis.' },
    { q: 'Wie viele Vorzeichen hat As-Dur?', a: '4 Bs', w: ['3 Bs', '5 Bs', '4 Kreuze'], e: 'b es as des.' },
    { q: 'Was sind „verwandte“ Tonarten?', a: 'Nachbarn im Quintenzirkel (und ihre Parallelen) – sie unterscheiden sich nur in einem Vorzeichen', w: ['Tonarten mit gleichem Grundton', 'Tonarten, die gleich viele Kreuze und Bs haben', 'nur Dur und Moll mit gleichem Namen'], e: 'C-Dur ist eng verwandt mit G, F, a, e und d. Dorthin modulieren Stücke am häufigsten.' }
  ],
  moll: [
    { q: 'Wie lautet der Bauplan der natürlichen Moll-Tonleiter?', a: 'Ganz – Halb – Ganz – Ganz – Halb – Ganz – Ganz', w: ['Ganz – Ganz – Halb – Ganz – Ganz – Ganz – Halb', 'Ganz – Halb – Ganz – Ganz – Ganz – Ganz – Halb', 'Halb – Ganz – Ganz – Halb – Ganz – Ganz – Ganz'], e: 'a-Moll: a h c d e f g a – Halbtöne bei 2–3 und 5–6.' },
    { q: 'Was ist die Paralleltonart?', a: 'Dur und Moll mit denselben Vorzeichen (Moll liegt eine kleine Terz tiefer)', w: ['Dur und Moll mit demselben Grundton', 'zwei Tonarten im Abstand einer Quinte', 'die Tonart des zweiten Themas'], e: 'C-Dur ↔ a-Moll, G-Dur ↔ e-Moll, E-Dur ↔ cis-Moll.' },
    { q: 'Was wird bei harmonisch Moll verändert?', a: 'die 7. Stufe wird erhöht (Leitton)', w: ['die 3. Stufe wird erhöht', 'die 6. und 7. Stufe werden erniedrigt', 'nichts'], e: 'a-Moll harmonisch: a h c d e f gis a.' },
    { q: 'Was ist das Besondere an melodisch Moll?', a: 'aufwärts sind 6. und 7. Stufe erhöht, abwärts natürlich', w: ['es hat nur fünf Töne', 'es ist identisch mit Dur', 'die 3. Stufe ist erhöht'], e: 'a-Moll melodisch aufwärts: a h c d e fis gis a, abwärts: a g f e d c h a.' },
    { q: 'Warum erhöht man in Moll oft die 7. Stufe?', a: 'damit ein Leitton entsteht, der zum Grundton zieht', w: ['damit es fröhlicher klingt', 'weil die Tonleiter sonst zu kurz ist', 'damit man weniger schwarze Tasten spielt'], e: 'Ohne gis klingt e–a in a-Moll schwach; mit gis entsteht die starke Dominante E-Dur.' },
    { q: 'Welches Intervall entsteht in harmonisch Moll zwischen 6. und 7. Stufe?', a: 'übermäßige Sekunde (3 Halbtöne)', w: ['große Sekunde', 'kleine Sekunde', 'reine Quarte'], e: 'f–gis in a-Moll: der „orientalische“ Klang.' },
    { q: 'Was ist die Varianttonart (gleichnamige Tonart)?', a: 'Dur und Moll mit gleichem Grundton (C-Dur ↔ c-Moll)', w: ['Dur und Moll mit gleichen Vorzeichen', 'die Tonart eine Quinte höher', 'die Tonart mit einem Kreuz mehr'], e: 'C-Dur und c-Moll: gleicher Grundton, unterschiedliche Vorzeichen (0 und 3 ♭).' },
    { q: 'Was ist die Paralleltonart von F-Dur?', a: 'd-Moll', w: ['f-Moll', 'a-Moll', 'g-Moll'], e: 'Eine kleine Terz unter f liegt d.' },
    { q: 'Was ist die Paralleltonart von e-Moll?', a: 'G-Dur', w: ['E-Dur', 'C-Dur', 'D-Dur'], e: 'Eine kleine Terz über e liegt g.' },
    { q: 'In welcher Tonart steht der 1. Satz der Mondscheinsonate?', a: 'cis-Moll', w: ['c-Moll', 'E-Dur', 'a-Moll'], e: 'cis-Moll, 4 Kreuze – die Parallele von E-Dur.' },
    { q: 'Welcher Unterschied macht Dur oder Moll hörbar?', a: 'die Terz über dem Grundton (groß in Dur, klein in Moll)', w: ['die Quinte über dem Grundton', 'das Tempo', 'die Lautstärke'], e: 'c–e (große Terz) = Dur, c–es (kleine Terz) = Moll.' }
  ],
  intervall: [
    { q: 'Wie viele Halbtöne hat eine große Terz?', a: '4', w: ['3', '5', '2'], e: 'c–e: c-cis-d-dis-e = 4 Halbtöne.' },
    { q: 'Wie viele Halbtöne hat eine kleine Terz?', a: '3', w: ['4', '2', '5'], e: 'c–es = 3 Halbtöne.' },
    { q: 'Wie viele Halbtöne hat eine reine Quinte?', a: '7', w: ['6', '8', '5'], e: 'c–g = 7 Halbtöne.' },
    { q: 'Wie viele Halbtöne hat eine reine Quarte?', a: '5', w: ['4', '6', '7'], e: 'c–f = 5 Halbtöne.' },
    { q: 'Was ist ein Tritonus?', a: 'drei Ganztöne = 6 Halbtöne (übermäßige Quarte / verminderte Quinte)', w: ['drei Töne gleichzeitig', 'eine Quinte mit drei Halbtönen', 'ein dreistimmiger Akkord'], e: 'f–h oder h–f: genau eine halbe Oktave. Er steckt in jedem Dominantseptakkord.' },
    { q: 'Welche Intervalle heißen „rein“?', a: 'Prime, Quarte, Quinte, Oktave', w: ['Sekunde, Terz, Sexte, Septime', 'nur die Oktave', 'alle Intervalle in C-Dur'], e: 'Die anderen (2, 3, 6, 7) sind groß oder klein.' },
    { q: 'Was passiert, wenn man ein Intervall umkehrt (unteren Ton eine Oktave hoch)?', a: 'Die Zahlen ergeben zusammen 9; groß wird klein, rein bleibt rein', w: ['Die Zahl bleibt gleich', 'Es wird immer zur Oktave', 'groß bleibt groß'], e: 'große Terz ↔ kleine Sexte (3+6=9), reine Quarte ↔ reine Quinte.' },
    { q: 'Was ist c–gis?', a: 'übermäßige Quinte', w: ['kleine Sexte', 'reine Quinte', 'verminderte Quinte'], e: 'Fünf Stammtöne (c-d-e-f-g) und 8 Halbtöne: übermäßige Quinte. Klingt wie c–as (kleine Sexte), heißt aber anders.' },
    { q: 'Was ist e–c (aufwärts)?', a: 'kleine Sexte', w: ['große Sexte', 'reine Quinte', 'kleine Septime'], e: 'e-f-g-a-h-c = sechs Stammtöne, 8 Halbtöne: kleine Sexte.' },
    { q: 'Was ist d–f?', a: 'kleine Terz', w: ['große Terz', 'reine Quarte', 'große Sekunde'], e: 'd–e–f: drei Stammtöne, 3 Halbtöne.' },
    { q: 'Was ist h–f?', a: 'verminderte Quinte', w: ['reine Quinte', 'reine Quarte', 'kleine Sexte'], e: 'h-c-d-e-f = fünf Stammtöne, aber nur 6 Halbtöne: vermindert.' },
    { q: 'Welche Methode zum Intervall-Bestimmen ist richtig?', a: 'erst Stammtöne zählen (Größe), dann Halbtöne (Art)', w: ['nur Halbtöne zählen', 'nur die Tasten zählen', 'nach dem Klang raten'], e: 'Die Zahl kommt von den Stammtönen; ob groß, klein, rein, vermindert oder übermäßig, entscheiden die Halbtöne.' }
  ],
  dreiklang: [
    { q: 'Woraus besteht ein Dur-Dreiklang?', a: 'große Terz unten, kleine Terz oben', w: ['kleine Terz unten, große Terz oben', 'zwei große Terzen', 'zwei kleine Terzen'], e: 'C-Dur: c–e (groß) + e–g (klein).' },
    { q: 'Woraus besteht ein Moll-Dreiklang?', a: 'kleine Terz unten, große Terz oben', w: ['große Terz unten, kleine oben', 'zwei kleine Terzen', 'zwei große Terzen'], e: 'a-Moll: a–c (klein) + c–e (groß).' },
    { q: 'Woraus besteht ein verminderter Dreiklang?', a: 'zwei kleinen Terzen', w: ['zwei großen Terzen', 'einer großen und einer kleinen Terz', 'einer Quarte und einer Terz'], e: 'h–d–f: kleine + kleine Terz, Rahmen ist die verminderte Quinte.' },
    { q: 'Woraus besteht ein übermäßiger Dreiklang?', a: 'zwei großen Terzen', w: ['zwei kleinen Terzen', 'einer großen und einer kleinen Terz', 'drei Ganztönen'], e: 'c–e–gis: groß + groß, Rahmen ist die übermäßige Quinte.' },
    { q: 'Welcher Ton ist bei Dur und Moll gleich weit vom Grundton entfernt?', a: 'die Quinte', w: ['die Terz', 'die Sexte', 'die Septime'], e: 'Dur und Moll haben beide eine reine Quinte; nur die Terz unterscheidet sie.' },
    { q: 'Wie wird aus C-Dur c-Moll?', a: 'die Terz e wird zu es', w: ['die Quinte g wird zu ges', 'der Grundton c wird zu cis', 'man fügt ein b hinzu'], e: 'Die Terz einen Halbton tiefer: Dur → Moll.' },
    { q: 'Auf welcher Stufe der Dur-Tonleiter steht ein verminderter Dreiklang?', a: 'VII', w: ['II', 'V', 'IV'], e: 'In C-Dur: h–d–f auf der 7. Stufe.' },
    { q: 'Welche Dreiklänge sind in C-Dur Dur-Akkorde?', a: 'C, F, G', w: ['C, D, E', 'C, E, A', 'D, G, A'], e: 'I, IV und V sind Dur; ii, iii, vi sind Moll; vii ist vermindert.' },
    { q: 'Wie heißen die drei Töne eines Dreiklangs in Grundstellung (von unten)?', a: 'Grundton, Terz, Quinte', w: ['Bass, Mitte, Oben', 'Prime, Sekunde, Terz', 'Tonika, Dominante, Subdominante'], e: 'Grundton – Terz (3 Stammtöne höher) – Quinte (5 Stammtöne höher).' },
    { q: 'Welche Töne hat E-Dur?', a: 'e gis h', w: ['e g h', 'e gis his', 'e g b'], e: 'Große Terz über e = gis, reine Quinte = h.' },
    { q: 'Welche Töne hat d-Moll?', a: 'd f a', w: ['d fis a', 'd f as', 'd e a'], e: 'Kleine Terz über d = f, reine Quinte = a.' }
  ],
  umkehrung: [
    { q: 'Was ist eine Umkehrung?', a: 'derselbe Akkord, aber ein anderer Akkordton liegt unten', w: ['ein Akkord, rückwärts gespielt', 'ein Akkord eine Oktave höher', 'ein Moll-Akkord statt Dur'], e: 'C-Dur bleibt C-Dur – egal ob c, e oder g unten liegt.' },
    { q: 'Was liegt beim Sextakkord (1. Umkehrung) unten?', a: 'die Terz', w: ['die Quinte', 'der Grundton', 'die Septime'], e: 'e–g–c: Terz unten. Zwischen e und c liegt eine Sexte – daher der Name.' },
    { q: 'Was liegt beim Quartsextakkord (2. Umkehrung) unten?', a: 'die Quinte', w: ['die Terz', 'der Grundton', 'die Sexte'], e: 'g–c–e: Quinte unten; Quarte (g–c) und Sexte (g–e) über dem Bass.' },
    { q: 'Wie findest du in einer Umkehrung den Grundton?', a: 'Töne in Terzen schichten – der unterste ist dann der Grundton; in der Umkehrung liegt er oft über der Quarte', w: ['es ist immer der unterste Ton', 'es ist immer der oberste Ton', 'es ist immer der mittlere Ton'], e: 'Bei e–g–c: Lücke g–c ist eine Quarte; der obere Ton der Quarte (c) ist der Grundton.' },
    { q: 'Wozu sind Umkehrungen beim Begleiten gut?', a: 'Die Hand bleibt nah beieinander, Akkordwechsel werden kleine Bewegungen', w: ['sie klingen immer lauter', 'man braucht dann kein Pedal', 'sie ersetzen die Melodie'], e: 'C – F/C – G/H – C: Kaum Bewegung, schöner gebundener Klang („nächste Lage“).' },
    { q: 'Was bedeutet C/E?', a: 'C-Dur mit e im Bass', w: ['C-Dur oder E-Dur', 'C-Dur gefolgt von E-Dur', 'C mit e als Melodieton'], e: 'Slash-Akkord: links vom Strich der Akkord, rechts der Basston.' },
    { q: 'Welche Umkehrung ist e–g–c?', a: '1. Umkehrung (Sextakkord) von C-Dur', w: ['Grundstellung von e-Moll', '2. Umkehrung von C-Dur', 'Grundstellung von C-Dur'], e: 'Terz e unten → Sextakkord.' },
    { q: 'Welche Umkehrung ist c–f–a?', a: '2. Umkehrung (Quartsextakkord) von F-Dur', w: ['Grundstellung von a-Moll', '1. Umkehrung von F-Dur', 'Grundstellung von C-Dur'], e: 'Schichten: f–a–c. Unten liegt c = Quinte → Quartsextakkord.' },
    { q: 'Welche Umkehrung ist h–d–g?', a: '1. Umkehrung (Sextakkord) von G-Dur', w: ['Grundstellung von h-Moll', '2. Umkehrung von G-Dur', 'Grundstellung von D-Dur'], e: 'Schichten: g–h–d. Unten h = Terz → Sextakkord.' },
    { q: 'Wie viele Umkehrungen hat ein Septakkord?', a: '3', w: ['2', '4', '1'], e: 'Grundstellung, 1., 2. und 3. Umkehrung (Septime im Bass).' }
  ],
  symbole: [
    { q: 'Was bedeutet das Symbol „Am“?', a: 'a-Moll-Dreiklang', w: ['A-Dur-Dreiklang', 'a-Moll-Tonleiter', 'A mit Septime'], e: 'Kleines „m“ = Moll.' },
    { q: 'Was bedeutet das Symbol „G7“?', a: 'G-Dur mit kleiner Septime (g h d f)', w: ['G-Dur mit großer Septime', 'g-Moll mit Septime', 'G-Dur in der 7. Lage'], e: '„7“ allein = kleine Septime, der Dominantseptakkord.' },
    { q: 'Was bedeutet „Cmaj7“?', a: 'C-Dur mit großer Septime (c e g h)', w: ['C-Dur mit kleiner Septime', 'c-Moll mit Septime', 'C-Dur, sieben Takte lang'], e: 'maj7 = große Septime.' },
    { q: 'Was bedeutet „Dsus4“?', a: 'D-Akkord, bei dem die Quarte (g) die Terz ersetzt: d g a', w: ['D-Dur mit zusätzlicher Quarte: d fis g a', 'd-Moll mit Quarte', 'D-Dur in der 4. Umkehrung'], e: 'sus = suspended: Die Terz ist „aufgehängt“, ersetzt durch die Quarte.' },
    { q: 'Was bedeutet das Symbol „B“ in internationalen Noten (Pop, Jazz)?', a: 'den deutschen Ton H (H-Dur-Akkord)', w: ['den deutschen Ton B', 'immer B-Dur', 'Bass'], e: 'Die B/H-Falle: International ist B = deutsches H, B♭ = deutsches B.' },
    { q: 'Was bedeutet „Bb“ oder „B♭“ in internationalen Noten?', a: 'den deutschen Ton B (B-Dur-Akkord)', w: ['den deutschen Ton H', 'Bes', 'b-Moll'], e: 'International B♭ = deutsch B.' },
    { q: 'Was bedeutet „F#m“?', a: 'fis-Moll', w: ['F-Dur mit Kreuz-Melodie', 'Fis-Dur', 'f-Moll'], e: '# = Kreuz am Grundton, m = Moll.' },
    { q: 'Was bedeutet „C°“ oder „Cdim“?', a: 'verminderter Dreiklang c es ges', w: ['C-Dur ohne Terz', 'c-Moll mit Septime', 'übermäßiger Dreiklang'], e: '° = vermindert.' },
    { q: 'Was bedeutet „C+“ oder „Caug“?', a: 'übermäßiger Dreiklang c e gis', w: ['C-Dur mit Septime', 'C-Dur besonders laut', 'C-Dur mit Quarte'], e: '+ = übermäßig.' },
    { q: 'Was bedeutet „Cadd9“?', a: 'C-Dur mit hinzugefügter None (d): c e g d', w: ['C-Dur in der 9. Lage', 'C mit Septime und None', 'C-Dur ohne Quinte'], e: 'add9 = nur die None dazu, ohne Septime. Typisch für Neoklassik und Pop.' },
    { q: 'Was bedeutet „Am/G“?', a: 'a-Moll mit g im Bass', w: ['a-Moll oder G-Dur', 'a-Moll, dann G-Dur', 'a-Moll mit g als Melodie'], e: 'Slash-Akkord: Akkord / Basston.' }
  ],
  stufen: [
    { q: 'Wie nennt man die I. Stufe?', a: 'Tonika', w: ['Dominante', 'Subdominante', 'Mediante'], e: 'Tonika = Ruhepunkt, Zuhause.' },
    { q: 'Wie nennt man die V. Stufe?', a: 'Dominante', w: ['Tonika', 'Subdominante', 'Leitton'], e: 'Dominante = Spannung, will zur Tonika.' },
    { q: 'Wie nennt man die IV. Stufe?', a: 'Subdominante', w: ['Dominante', 'Tonika', 'Parallele'], e: 'Subdominante = Aufbruch, Weg weg vom Zuhause.' },
    { q: 'Warum schreibt man ii, iii, vi in kleinen römischen Zahlen?', a: 'weil auf diesen Stufen Moll-Akkorde stehen', w: ['weil sie unwichtig sind', 'weil sie leise gespielt werden', 'weil sie nur in Moll vorkommen'], e: 'Groß = Dur, klein = Moll, ° = vermindert.' },
    { q: 'Welcher Akkord ist die VI. Stufe in C-Dur?', a: 'a-Moll', w: ['A-Dur', 'F-Dur', 'e-Moll'], e: 'Auf a nur mit Tönen aus C-Dur: a c e = a-Moll.' },
    { q: 'Welcher Akkord ist die V. Stufe in G-Dur?', a: 'D-Dur', w: ['C-Dur', 'd-Moll', 'E-Dur'], e: 'Fünfter Ton von G-Dur ist d: d fis a.' },
    { q: 'Welcher Akkord ist die IV. Stufe in F-Dur?', a: 'B-Dur', w: ['C-Dur', 'b-Moll', 'H-Dur'], e: 'Vierter Ton von F-Dur ist b: b d f.' },
    { q: 'Welche Stufen sind die „Hauptstufen“?', a: 'I, IV, V', w: ['I, II, III', 'II, V, VI', 'I, III, V'], e: 'Mit I, IV und V kann man fast jedes einfache Lied begleiten.' },
    { q: 'Warum wird die V. Stufe in Moll meistens zu Dur?', a: 'weil der Leitton (erhöhte 7. Stufe) die Dominante zu Dur macht', w: ['weil Moll sonst zu traurig ist', 'aus Versehen', 'weil es in Moll keine V. Stufe gibt'], e: 'a-Moll: e g h wird mit gis zu E-Dur – starke Dominante.' },
    { q: 'Was ist die Parallele der Tonika in Dur?', a: 'die VI. Stufe (vi)', w: ['die V. Stufe', 'die II. Stufe', 'die IV. Stufe'], e: 'C-Dur → a-Moll (vi), sie teilen zwei Töne (c und e).' }
  ],
  folgen: [
    { q: 'Welche Akkordfolge ist die berühmte „Pop-Folge“?', a: 'I – V – vi – IV', w: ['I – IV – V – I', 'ii – V – I', 'I – ii – iii – IV'], e: 'In C: C – G – Am – F. Tausende Popsongs basieren darauf.' },
    { q: 'Wie heißt die Folge I – IV – V – I?', a: 'Kadenz', w: ['Sequenz', 'Rondo', 'Modulation'], e: 'Die Grundkadenz: Zuhause – Aufbruch – Spannung – Ankommen.' },
    { q: 'Was ist „ii – V – I“?', a: 'die wichtigste Akkordfolge im Jazz', w: ['eine Tonleiter', 'ein Begleitmuster', 'die Pop-Folge'], e: 'In C: Dm7 – G7 – Cmaj7.' },
    { q: 'Welche Akkorde hat I – V – vi – IV in G-Dur?', a: 'G – D – Em – C', w: ['G – C – D – G', 'G – D – E – C', 'G – Em – C – D'], e: 'I = G, V = D, vi = Em, IV = C.' },
    { q: 'Was ist der Pachelbel-Kanon harmonisch?', a: 'eine Folge von acht Akkorden: I – V – vi – iii – IV – I – IV – V', w: ['nur zwei Akkorde im Wechsel', 'eine chromatische Tonleiter', 'eine Folge nur aus Moll-Akkorden'], e: 'In D: D – A – Hm – Fism – G – D – G – A.' },
    { q: 'Was bewirkt die Dominante vor der Tonika?', a: 'Spannung, die sich in der Tonika löst', w: ['Ruhe', 'einen Tonartwechsel', 'eine Pause'], e: 'V → I ist der stärkste Schritt in der Harmonik.' },
    { q: 'Was bedeutet „Akkorde in nächster Lage“?', a: 'beim Wechsel so wenig wie möglich bewegen; gemeinsame Töne liegen bleiben', w: ['alle Akkorde in Grundstellung', 'jeder Akkord eine Oktave höher', 'Akkorde schnell nacheinander'], e: 'C (c e g) → F (c f a): c bleibt liegen, e→f, g→a.' },
    { q: 'Welche Folge klingt typisch traurig-episch (Pop-Folge ab Moll)?', a: 'vi – IV – I – V', w: ['I – IV – V – I', 'V – I – V – I', 'I – ii – I – ii'], e: 'Am – F – C – G: dieselben Akkorde wie die Pop-Folge, aber in Moll begonnen.' },
    { q: 'Was ist eine Sequenz?', a: 'ein Motiv oder eine Akkordfolge, die auf anderer Stufe wiederholt wird', w: ['eine Wiederholung auf derselben Stufe', 'eine Pause', 'ein Schlussakkord'], e: 'Sequenzen findest du überall bei Bach und Vivaldi – und sie erleichtern das Lesen enorm.' },
    { q: 'Welcher Akkord ist in a-Moll die Dominante?', a: 'E-Dur (mit gis)', w: ['e-Moll', 'G-Dur', 'D-Dur'], e: 'Mit Leitton gis wird die V. Stufe zu E-Dur.' }
  ],
  leadsheet: [
    { q: 'Was steht in einem Lead Sheet?', a: 'die Melodie und darüber Akkordsymbole', w: ['nur die Begleitung', 'beide Hände ausgeschrieben', 'nur Fingersätze'], e: 'Die linke Hand wird aus den Symbolen selbst gestaltet.' },
    { q: 'Wo wechselt der Akkord in einem Lead Sheet?', a: 'genau dort, wo ein neues Symbol steht – bis dahin gilt das alte', w: ['in jedem Takt', 'auf jeder Note', 'nur am Zeilenanfang'], e: 'Ein Symbol gilt, bis das nächste kommt.' },
    { q: 'Was ist Stufe 1 der linken Hand bei der Lead-Sheet-Methode?', a: 'nur den Grundton des Akkords', w: ['den ganzen Akkord gebrochen', 'die Melodie verdoppeln', 'Oktaven im Achtelrhythmus'], e: 'Erst Grundtöne – dann Griffe – dann Muster.' },
    { q: 'Was macht man zuerst, wenn man ein neues Lied aus einem Lead Sheet lernt?', a: 'Tonart und Takt ansehen, dann die Akkorde einmal als Griffe spielen', w: ['sofort beidhändig im Tempo spielen', 'die Melodie auswendig lernen', 'nur die schwierigste Stelle üben'], e: 'Die Akkorde sind das Gerüst – wer sie kennt, findet sich sofort zurecht.' },
    { q: 'Im Lead Sheet steht „N.C.“. Was heißt das?', a: 'No Chord – keine Begleitung', w: ['Neuer Chorus', 'Nur C-Dur', 'Noch einmal'], e: 'Hier schweigt die Begleitung (oft bei Breaks).' },
    { q: 'Was macht die rechte Hand beim Lead-Sheet-Spiel?', a: 'die Melodie (später auch mit Akkordtönen darunter)', w: ['immer Akkorde', 'nur Bassnoten', 'nichts'], e: 'Fortgeschritten: rechts Melodie plus ein bis zwei Akkordtöne darunter, links Bass.' },
    { q: 'Warum ist die Lead-Sheet-Methode so schnell?', a: 'Man merkt sich wenige Akkorde statt Hunderter Noten', w: ['weil man keine Noten lesen muss', 'weil sie nur für einfache Lieder geht', 'weil man schneller spielt'], e: 'Ein ganzes Weihnachtslied besteht oft aus 3–5 Akkorden.' },
    { q: 'Ein Lied steht in F-Dur. Welche drei Akkorde kommen fast sicher vor?', a: 'F, B, C', w: ['F, G, A', 'F, C, G', 'F, Bb, D'], e: 'I – IV – V in F-Dur: F, B (B♭), C.' }
  ],
  begleitung: [
    { q: 'Wie geht ein Walzer-Begleitmuster im 3/4-Takt?', a: 'Bass auf 1, Akkord auf 2 und 3', w: ['Akkord auf 1, Bass auf 2 und 3', 'Bass auf allen drei Schlägen', 'nur Akkorde auf 1'], e: 'Um-pa-pa: Grundton tief, dann zweimal der Akkord.' },
    { q: 'Was ist ein Alberti-Bass?', a: 'ein gebrochener Akkord im Muster tief – hoch – mitte – hoch', w: ['ein Bass in Oktaven', 'ein Akkord als Block', 'ein absteigender Bass'], e: 'c–g–e–g: typisch für Mozart und Clementi.' },
    { q: 'Wie sollte ein Alberti-Bass klingen?', a: 'leise und gleichmäßig, als Teppich unter der Melodie', w: ['laut und betont', 'staccato und hart', 'mit Akzent auf jedem Ton'], e: 'Die Melodie gehört in den Vordergrund.' },
    { q: 'Was ist ein typisches Neoklassik-Arpeggio in der linken Hand?', a: 'weit gebrochen: Grundton – Quinte – None/Terz, mit Pedal', w: ['enge Blockakkorde', 'Oktaven im Staccato', 'nur Grundtöne'], e: 'Wie in Una Mattina oder Nuvole Bianche: weit, fließend, über eine Dezime.' },
    { q: 'Wann wechselt man das Pedal bei gebrochenen Akkorden?', a: 'bei jedem Akkordwechsel', w: ['nie', 'auf jedem Ton', 'nur am Ende des Stücks'], e: 'Neue Harmonie – neues Pedal (synkopiert).' },
    { q: 'Was ist ein „Stride“- oder Ragtime-Muster?', a: 'Basston auf 1 und 3, Akkord in der Mitte auf 2 und 4', w: ['nur gebrochene Akkorde', 'Bass und Akkord gleichzeitig', 'Akkorde nur auf 1'], e: 'Die linke Hand springt: Bass – Akkord – Bass – Akkord.' },
    { q: 'Welches Begleitmuster passt zu einem langsamen Weihnachtslied im 4/4-Takt?', a: 'gebrochene Akkorde in Achteln mit Pedal', w: ['Walzer-Muster', 'Alberti-Bass in Sechzehnteln', 'Staccato-Akkorde'], e: 'Ruhig fließende Achtel tragen eine langsame Melodie am besten.' },
    { q: 'Was ist das wichtigste beim Begleiten einer Melodie?', a: 'Begleitung leiser als die Melodie, gleichmäßig im Puls', w: ['Begleitung lauter als die Melodie', 'möglichst viele Töne', 'jede Note betonen'], e: 'Die Begleitung ist die Band, die Melodie der Sänger.' }
  ]
});

/* ===== Notenweg 3 · Wissensfragen Kapitel V–VIII ===== */
Object.assign(CUR.pools, {
  dynamik: [
    { q: 'Wodurch entsteht am Klavier die Lautstärke?', a: 'durch die Geschwindigkeit, mit der die Taste nach unten geht', w: ['durch Drücken, wenn die Taste schon unten ist', 'durch das Pedal', 'durch die Länge des Tons'], e: 'Der Hammer fliegt schneller oder langsamer gegen die Saite. Nachdrücken bewirkt nichts.' },
    { q: 'Was ist bei einem Crescendo über vier Takte am wichtigsten?', a: 'leise genug beginnen und gleichmäßig steigern', w: ['sofort laut werden', 'nur den letzten Ton laut spielen', 'schneller werden'], e: 'Wer zu laut beginnt, hat keinen Raum mehr nach oben.' },
    { q: 'Was bedeutet „subito p“?', a: 'plötzlich leise', w: ['nach und nach leise', 'etwas leiser', 'leise und langsam'], e: 'subito = plötzlich, ohne Übergang.' },
    { q: 'Was bedeutet „fp“?', a: 'laut anschlagen, sofort leise weiter', w: ['fast piano', 'forte, dann crescendo', 'Fermate auf piano'], e: 'fortepiano: Akzent, dann sofort zurück ins p.' },
    { q: 'Was bedeutet „sf“ oder „sfz“?', a: 'eine einzelne Note plötzlich stark betonen', w: ['sehr fein', 'das ganze Stück forte', 'leise werden'], e: 'sforzato: ein starker Akzent auf genau dieser Note.' },
    { q: 'Wie spielt man ein schönes pianissimo?', a: 'Finger nah an der Taste, langsam und gleichmäßig nach unten', w: ['Taste nur halb drücken', 'mit gestreckten Fingern', 'mit dem linken Pedal allein'], e: 'Kontakt zur Taste halten und die Bewegung kontrollieren.' },
    { q: 'Ist Dynamik absolut oder relativ?', a: 'relativ – entscheidend sind die Unterschiede innerhalb eines Stücks', w: ['absolut – f ist immer gleich laut', 'nur in der Romantik relativ', 'sie hängt nur vom Instrument ab'], e: 'f bei Mozart ist nicht f bei Rachmaninow.' },
    { q: 'Was bedeutet die Gabel, die sich nach rechts öffnet (<)?', a: 'crescendo – lauter werden', w: ['decrescendo – leiser werden', 'Akzent', 'schneller werden'], e: '< = cresc., > = decresc.' },
    { q: 'Was bedeutet „dim.“?', a: 'diminuendo – leiser werden', w: ['dimension – größer werden', 'Dominante', 'gedämpft (mit Pedal)'], e: 'diminuendo und decrescendo bedeuten dasselbe.' },
    { q: 'Was ist „Terrassendynamik“?', a: 'Lautstärke in Stufen statt allmählich, typisch für den Barock', w: ['eine Dynamik nur im Forte', 'Crescendo über das ganze Stück', 'Dynamik nur in der linken Hand'], e: 'Cembalo und Orgel konnten nicht crescendieren – darum Stufen (f – p – f).' }
  ],
  artikulation: [
    { q: 'Wie lang ist ein Staccato-Ton ungefähr?', a: 'etwa halb so lang wie notiert', w: ['doppelt so lang', 'genau notierte Länge', 'so kurz wie möglich, immer'], e: 'Staccato = abgesetzt; der Rest des Notenwerts ist Stille.' },
    { q: 'Was bedeutet ein Strich über der Note (Tenuto)?', a: 'voll aushalten, leicht gewichtet', w: ['kurz spielen', 'sehr laut', 'nicht spielen'], e: 'tenuto = gehalten.' },
    { q: 'Was ist Portato?', a: 'leicht getrennt, aber getragen (Punkte unter einem Bogen)', w: ['sehr kurz und spitz', 'völlig gebunden', 'mit Pedal und laut'], e: 'Zwischen legato und staccato, singend getrennt.' },
    { q: 'Welches Staccato nimmt man für Akkorde im forte?', a: 'Handgelenk-Staccato', w: ['Finger-Staccato', 'Arm-Legato', 'gar keins'], e: 'Die Hand federt aus dem lockeren Handgelenk.' },
    { q: 'Welches Staccato nimmt man für schnelle, leise Tonfolgen?', a: 'Finger-Staccato', w: ['Handgelenk-Staccato', 'Arm-Staccato', 'Pedal-Staccato'], e: 'Die Fingerkuppe zieht kurz zur Handfläche – leicht und schnell.' },
    { q: 'Was ist der häufigste Fehler beim Staccato?', a: 'Es wird versehentlich laut und akzentuiert', w: ['Es wird zu kurz', 'Es klingt zu weich', 'Man vergisst das Pedal'], e: 'Staccato heißt kurz – nicht laut.' },
    { q: 'Wie spielt man Barockmusik ohne Artikulationsangaben meist?', a: 'non legato – leicht getrennt, Bögen nur wo sinnvoll', w: ['immer legato mit Pedal', 'immer staccato', 'immer mit Akzenten'], e: 'Barocke Tasteninstrumente klangen deutlich getrennt; Achtel oft leicht abgesetzt.' },
    { q: 'Was bedeutet das Zeichen ^ (Marcato)?', a: 'stark betont, kräftiger als ein normaler Akzent', w: ['sehr leise', 'nach oben oktavieren', 'kurz und leise'], e: 'marcato = markiert.' },
    { q: 'Wie endet eine gebundene Zweiergruppe (Seufzer) richtig?', a: 'erste Note mit Gewicht, zweite leiser und etwas kürzer, Hand abheben', w: ['beide Noten gleich laut', 'zweite Note betont', 'beide staccato'], e: 'Der Bogenende-Ton wird leicht „abgesetzt“, wie das Ausatmen.' },
    { q: 'Was bedeutet ein Keil über der Note?', a: 'staccatissimo – sehr kurz', w: ['tenuto', 'Akzent ohne Kürzung', 'Fermate'], e: 'Keil = noch kürzer als der Punkt.' }
  ],
  pedal: [
    { q: 'Was macht das rechte Pedal?', a: 'Es hebt alle Dämpfer – Töne klingen weiter und Saiten schwingen mit', w: ['Es macht das Klavier leiser', 'Es hält nur den tiefsten Ton', 'Es verändert die Tonhöhe'], e: 'Haltepedal (Fortepedal): alle Dämpfer weg.' },
    { q: 'Was ist das synkopierte Pedal?', a: 'erst anschlagen, dann Pedal hoch und sofort wieder runter', w: ['Pedal und Taste genau gleichzeitig wechseln', 'Pedal vor dem Anschlag wechseln', 'Pedal nur auf schwachen Zählzeiten'], e: 'Der Fuß folgt der Hand – so entsteht kein Loch und kein Verschmieren.' },
    { q: 'Wann wechselt man das Pedal in der Regel?', a: 'wenn sich die Harmonie ändert', w: ['in jedem Takt auf 1', 'nie', 'nach jeder Phrase'], e: 'Neue Harmonie = neues Pedal. Bei Melodietönen außerhalb des Akkords manchmal öfter.' },
    { q: 'Was bedeutet „Ped.“ im Notentext?', a: 'Pedal treten', w: ['Pedal loslassen', 'Pedal halb treten', 'linkes Pedal'], e: 'Ped. = runter, ✱ = hoch.' },
    { q: 'Was bedeutet das Sternchen ✱ unter den Noten?', a: 'Pedal loslassen', w: ['Pedal treten', 'Akzent', 'Wiederholung'], e: 'Das Sternchen (oder das Ende der Pedalklammer) = Fuß hoch.' },
    { q: 'Was bewirkt das linke Pedal (una corda)?', a: 'leiserer, weicherer Klang', w: ['Töne klingen länger', 'nur die Bässe klingen', 'eine Oktave tiefer'], e: 'Beim Flügel verschiebt es die Mechanik, sodass der Hammer weniger Saiten trifft.' },
    { q: 'Was heißt „tre corde“?', a: 'linkes Pedal wieder loslassen', w: ['mit drei Fingern spielen', 'drei Töne gleichzeitig', 'dreimal wiederholen'], e: 'una corda = eine Saite (linkes Pedal), tre corde = drei Saiten (aus).' },
    { q: 'Was bedeutet „senza sordino“ am Anfang der Mondscheinsonate?', a: 'ohne Dämpfer – also mit Haltepedal', w: ['ohne Pedal', 'sehr leise', 'ohne Wiederholung'], e: 'Beethoven verlangt, dass die Dämpfer gehoben bleiben (heute: Pedal nach Harmonie wechseln).' },
    { q: 'Was macht das Sostenuto-Pedal (Mitte beim Flügel)?', a: 'hält nur die Töne, deren Tasten beim Treten gerade gedrückt sind', w: ['hält alle Töne', 'macht leiser', 'wiederholt Töne'], e: 'Für lange Basstöne, während darüber ohne Pedal gespielt wird.' },
    { q: 'Wie bleibt der Fuß beim Pedalspielen?', a: 'Ferse am Boden, nur der Fußballen bewegt sich', w: ['ganzer Fuß hebt sich', 'Fuß stampft auf das Pedal', 'Fuß bleibt in der Luft'], e: 'Leise, kontrollierte Bewegung, das Pedal nie loslassen und hochknallen lassen.' },
    { q: 'Was ist ein Halbpedal?', a: 'das Pedal nur teilweise loslassen, damit nur ein Teil des Klangs gedämpft wird', w: ['das linke und rechte Pedal zugleich', 'das Pedal in jedem zweiten Takt', 'Pedal nur für die linke Hand'], e: 'Fortgeschrittene Technik: Bass klingt weiter, Oberstimmen werden klarer.' },
    { q: 'Was passiert, wenn man in Bach-Präludien zu viel Pedal nimmt?', a: 'Die Linien verschwimmen und die Mehrstimmigkeit geht verloren', w: ['Es klingt barocker', 'Nichts', 'Es wird leiser'], e: 'Barock: sparsam oder gar kein Pedal, Klarheit kommt von den Fingern.' }
  ],
  voicing: [
    { q: 'Was bedeutet „Voicing“?', a: 'verschiedene Stimmen unterschiedlich laut spielen, damit die Melodie hervortritt', w: ['mitsingen', 'Akkorde umkehren', 'nur mit einer Hand spielen'], e: 'Melodie vorne, Begleitung im Hintergrund.' },
    { q: 'Faustregel: Wie viel lauter als die Begleitung sollte die Melodie sein?', a: 'etwa zwei Dynamikstufen (z. B. mf über p)', w: ['gleich laut', 'zehnmal so laut', 'leiser'], e: 'Damit das Ohr eine klare Hauptstimme hört.' },
    { q: 'Wie hebt man in einer Hand den oberen Ton hervor?', a: 'Gewicht zum Melodiefinger lehnen, die anderen Finger berühren nur leicht', w: ['den oberen Ton später spielen', 'alle Finger gleich stark', 'das Pedal treten'], e: 'Der Melodiefinger (meist 4 oder 5) bekommt mehr Gewicht.' },
    { q: 'Welcher Übe-Trick hilft beim Voicing?', a: 'Melodie forte, Begleitung nur antippen – dann langsam hörbar machen', w: ['Begleitung laut, Melodie leise', 'beide Hände gleichzeitig staccato', 'das Stück schneller spielen'], e: 'Das Ohr gewöhnt sich an die Hierarchie, die Hände an die Gewichtsverteilung.' },
    { q: 'In der Mondscheinsonate liegt die Melodie wo?', a: 'im 5. Finger der rechten Hand, über den Triolen', w: ['im Daumen links', 'in den Triolen', 'im Bass'], e: 'Die Triolen sind Begleitung; die Melodie (gis…) singt oben.' },
    { q: 'Warum klingt ein Stück ohne Voicing oft „wie eine Wand“?', a: 'weil alle Töne gleich laut sind und das Ohr keine Hauptstimme findet', w: ['weil zu wenig Pedal da ist', 'weil es zu langsam ist', 'weil die Noten falsch sind'], e: 'Hierarchie schafft Klarheit.' },
    { q: 'Was hilft, eine Melodie wirklich „singend“ zu spielen?', a: 'sie zuerst selbst singen und die Phrasierung übernehmen', w: ['jeden Ton gleich betonen', 'Melodietöne staccato spielen', 'möglichst schnell spielen'], e: 'Die Stimme zeigt dir Atem, Höhepunkt und Bögen.' },
    { q: 'Bei Bach-Inventionen: Welche Stimme ist lauter?', a: 'die Stimme, die gerade das Thema spielt', w: ['immer die rechte Hand', 'immer die linke Hand', 'beide immer gleich'], e: 'In Polyphonie wechselt die Hauptrolle zwischen den Stimmen.' }
  ],
  phrase: [
    { q: 'Was ist eine Phrase?', a: 'ein musikalischer Satz, meist 2, 4 oder 8 Takte', w: ['ein einzelner Ton', 'ein ganzes Stück', 'ein Akkord'], e: 'Mit Anfang, Höhepunkt und Ende – wie ein gesprochener Satz.' },
    { q: 'Wie endet eine Phrase meist?', a: 'leiser und weicher, wie die Stimme am Satzende', w: ['mit einem Akzent', 'plötzlich laut', 'schneller'], e: 'Kein „Hammer“ auf den letzten Ton.' },
    { q: 'Was ist ein Phrasenbogen?', a: 'ein langer Bogen über mehrere Takte, der zeigt, was zusammengehört', w: ['ein Haltebogen', 'ein Wiederholungszeichen', 'ein Pedalzeichen'], e: 'Er zeigt den Atem der Musik, nicht unbedingt strenges Legato.' },
    { q: 'Wo liegt der Höhepunkt einer Phrase oft?', a: 'beim höchsten oder längsten Ton oder bei einer spannungsvollen Harmonie', w: ['immer auf dem ersten Ton', 'immer auf dem letzten Ton', 'immer in der Mitte'], e: 'Finde ihn und baue die Phrase dorthin.' },
    { q: 'Was bedeutet „Frage – Antwort“ (Vordersatz – Nachsatz)?', a: 'eine Phrase endet offen (Halbschluss), die nächste antwortet geschlossen (Ganzschluss)', w: ['ein Duett mit Sänger', 'zwei Hände spielen abwechselnd', 'eine Pause zwischen zwei Teilen'], e: 'Typisch in der Klassik: 4 Takte Frage, 4 Takte Antwort = Periode.' },
    { q: 'Was bedeutet zwischen zwei Phrasen „atmen“?', a: 'Hand kurz leicht heben, ohne den Puls zu unterbrechen', w: ['eine Pause von einem Takt machen', 'das Tempo halbieren', 'das Pedal halten'], e: 'Ein minimaler Abstand gliedert die Musik.' },
    { q: 'Was ist ein „Seufzer“?', a: 'zwei gebundene Töne abwärts, der erste betont, der zweite leicht', w: ['ein langer Triller', 'ein Akkord mit Pedal', 'eine Pause mit Fermate'], e: 'Ein typisches Ausdrucksmotiv vom Barock bis zur Romantik.' },
    { q: 'Was ist die beste Methode, Phrasen zu finden?', a: 'die Melodie singen und beobachten, wo man atmet', w: ['Takte zählen und nach jedem Takt absetzen', 'nur auf Pedalzeichen achten', 'auf die linke Hand hören'], e: 'Singen macht Phrasen sofort hörbar.' },
    { q: 'Was ist eine Periode?', a: 'zwei Phrasen, die sich wie Frage und Antwort ergänzen (oft 4 + 4 Takte)', w: ['ein Takt mit vier Schlägen', 'ein wiederholter Akkord', 'eine Tempoangabe'], e: 'Die Ode an die Freude ist eine Periode: Frage endet auf d, Antwort auf c.' }
  ],
  hilfslinien: [
    { q: 'Welcher Ton liegt im Violinschlüssel auf der 2. Hilfslinie oben?', a: 'c³', w: ['a²', 'e³', 'h²'], e: '1. Hilfslinie oben = a², 2. = c³, 3. = e³.' },
    { q: 'Welcher Ton liegt im Violinschlüssel auf der 1. Hilfslinie oben?', a: 'a²', w: ['g²', 'c³', 'h²'], e: 'Direkt über dem System (g²) folgt die 1. Hilfslinie a².' },
    { q: 'Welcher Ton liegt im Bassschlüssel auf der 2. Hilfslinie unten?', a: 'C (großes C)', w: ['E', 'A₁', 'D'], e: '1. Hilfslinie unten = E, 2. = C.' },
    { q: 'Welcher Ton liegt im Bassschlüssel auf der 1. Hilfslinie oben?', a: 'c¹', w: ['h', 'e¹', 'a'], e: 'Das mittlere C – derselbe Ton wie die 1. Hilfslinie unten im Violinschlüssel.' },
    { q: 'Was bedeutet „8va“ über den Noten?', a: 'eine Oktave höher spielen als notiert', w: ['eine Oktave tiefer', 'acht Takte wiederholen', 'achtmal spielen'], e: 'ottava alta.' },
    { q: 'Was bedeutet „8vb“ unter den Noten?', a: 'eine Oktave tiefer spielen als notiert', w: ['eine Oktave höher', 'mit acht Fingern', 'langsamer'], e: 'ottava bassa.' },
    { q: 'Was bedeutet „loco“?', a: 'wieder in normaler Lage spielen', w: ['schneller werden', 'langsam', 'an Ort und Stelle wiederholen'], e: 'Hebt eine Oktavierung auf.' },
    { q: 'Was bedeutet „15ma“?', a: 'zwei Oktaven höher', w: ['15 Takte Pause', 'fünfzehnmal wiederholen', 'eine Oktave höher'], e: 'quindicesima: 15 Stammtöne = zwei Oktaven.' },
    { q: 'Warum gibt es Oktavierungszeichen?', a: 'damit nicht zu viele Hilfslinien nötig sind und man besser lesen kann', w: ['damit Stücke kürzer werden', 'weil man sonst falsche Töne spielt', 'aus Tradition, ohne Nutzen'], e: 'Mehr als 3–4 Hilfslinien sind schwer zu lesen.' },
    { q: 'Was ist die Gefahr bei 8va im Blattspiel?', a: 'Man übersieht die gestrichelte Linie und spielt eine Oktave zu tief', w: ['Man spielt zu laut', 'Man verliert den Takt', 'Keine'], e: 'Vor dem Spielen nach 8va-Linien suchen.' }
  ],
  sprung: [
    { q: 'Was bedeutet „D.C. al Fine“?', a: 'zurück zum Anfang und bis „Fine“ spielen', w: ['bis zum Ende weiterspielen', 'zum Zeichen 𝄋 springen', 'den letzten Teil wiederholen'], e: 'Da Capo = vom Kopf (Anfang).' },
    { q: 'Was bedeutet „D.S. al Coda“?', a: 'zum Zeichen 𝄋 zurück, bis zum Coda-Zeichen, dann zur Coda springen', w: ['zum Anfang, dann Ende', 'zur Coda springen und wiederholen', 'langsam bis zum Ende'], e: 'Dal Segno = vom Zeichen.' },
    { q: 'Was ist eine Coda?', a: 'der Schlussteil eines Stücks', w: ['der Anfang', 'ein Zwischenspiel', 'eine Verzierung'], e: 'Coda = Schwanz (italienisch).' },
    { q: 'Was bedeutet „Fine“?', a: 'Ende – nach dem Sprung hier aufhören', w: ['fein spielen', 'leise werden', 'Anfang'], e: 'Fine gilt erst beim zweiten Durchgang (nach D.C. oder D.S.).' },
    { q: 'Werden nach D.C. die Wiederholungen normalerweise nochmal gespielt?', a: 'Nein, meist nicht (außer es steht „con repetizione“)', w: ['Ja, immer', 'Nur die erste', 'Nur in Moll-Stücken'], e: 'Konvention: beim Da Capo ohne Wiederholungen.' },
    { q: 'Was passiert beim zweiten Durchgang mit der 1. Klammer (Volta)?', a: 'Sie wird übersprungen; man spielt die 2. Klammer', w: ['Sie wird nochmal gespielt', 'Man spielt beide Klammern', 'Man hört auf'], e: '1. Klammer nur beim ersten Mal.' },
    { q: 'Was bedeutet „Menuetto da capo“ nach einem Trio?', a: 'das Menuett noch einmal spielen (meist ohne Wiederholungen)', w: ['das Trio wiederholen', 'ein neues Menuett', 'aufhören'], e: 'Menuett – Trio – Menuett.' },
    { q: 'Warum fährt man vor dem Spielen „den Weg“ durch die Noten?', a: 'damit man bei Sprüngen und Wiederholungen nicht die Orientierung verliert', w: ['um die Noten auswendig zu lernen', 'um das Tempo zu bestimmen', 'aus Aberglauben'], e: 'Wie eine Route auf der Karte – vorher planen.' },
    { q: 'Ein Wiederholungszeichen :| hat kein passendes |: davor. Wohin geht es zurück?', a: 'zum Anfang des Stücks', w: ['zum vorigen Takt', 'zur letzten Doppellinie', 'gar nicht'], e: 'Fehlt das Anfangszeichen, ist der Anfang gemeint.' },
    { q: 'Was bedeutet „senza repetizione“?', a: 'ohne Wiederholungen', w: ['mit allen Wiederholungen', 'ohne Pedal', 'ohne Verzierungen'], e: 'Beim Da Capo die Wiederholungen weglassen.' }
  ],
  stimmen: [
    { q: 'Woran erkennst du zwei Stimmen in einem System?', a: 'an der Halsrichtung: obere Stimme Hälse nach oben, untere nach unten', w: ['an der Farbe', 'an der Größe der Noten', 'an den Fingersätzen'], e: 'Jede Stimme hat ihren eigenen Rhythmus.' },
    { q: 'Was musst du bei einem Halteton in einer Stimme tun, während die andere sich bewegt?', a: 'den Ton mit dem Finger wirklich halten', w: ['ihn kurz spielen und loslassen', 'Pedal statt Finger', 'ihn wiederholen'], e: 'Sonst geht die Linie verloren.' },
    { q: 'Wie übt man ein zweistimmiges Stück am besten?', a: 'jede Stimme einzeln, dann eine spielen und die andere singen, dann zusammen', w: ['sofort beide Hände im Tempo', 'nur die Oberstimme', 'mit viel Pedal'], e: 'So hörst du beide Linien.' },
    { q: 'Was ist eine Invention von Bach?', a: 'ein zweistimmiges Stück, in dem ein Motiv zwischen den Stimmen wandert', w: ['eine Etüde für Tonleitern', 'ein Tanz im 3/4-Takt', 'eine Sonate'], e: '15 zweistimmige Inventionen schrieb Bach als Lehrwerk.' },
    { q: 'Was ist Imitation?', a: 'eine Stimme wiederholt das Motiv der anderen, versetzt', w: ['eine Stimme spielt lauter', 'zwei Stimmen spielen dasselbe gleichzeitig', 'eine Verzierung'], e: 'Wie ein Kanon – Grundprinzip der Polyphonie.' },
    { q: 'Was bedeutet „Polyphonie“?', a: 'Mehrstimmigkeit mit gleichberechtigten Stimmen', w: ['eine Melodie mit Begleitung', 'sehr laute Musik', 'ein Akkord mit vielen Tönen'], e: 'Gegenteil: Homophonie (Melodie + Begleitung).' },
    { q: 'Wie heißt ein Motiv, das umgekehrt erscheint (auf statt ab)?', a: 'Umkehrung', w: ['Krebs', 'Sequenz', 'Augmentation'], e: 'Umkehrung: Intervalle gespiegelt. Krebs: rückwärts.' },
    { q: 'Eine Note hat zwei Hälse (nach oben und unten). Was heißt das?', a: 'beide Stimmen spielen diesen Ton gemeinsam', w: ['zweimal anschlagen', 'eine Oktave verdoppeln', 'ein Fehler im Druck'], e: 'Die Stimmen treffen sich auf demselben Ton.' }
  ],
  triolen: [
    { q: 'Was ist eine Achteltriole?', a: 'drei Achtel in der Zeit von zwei Achteln (einem Viertel)', w: ['drei Viertel in einem Takt', 'drei Achtel in der Zeit von vier', 'eine Achtel mit drei Punkten'], e: 'Markiert mit einer kleinen 3.' },
    { q: 'Wie viele Schläge hat ein 6/8-Takt?', a: 'zwei punktierte Viertel', w: ['sechs Viertel', 'drei Viertel', 'vier Achtel'], e: '6/8 schwingt in zwei Gruppen zu je drei Achteln.' },
    { q: 'Wo liegen die Betonungen im 6/8-Takt?', a: 'auf 1 (stark) und 4 (mittel)', w: ['auf 1, 3, 5', 'auf allen sechs', 'auf 2 und 5'], e: 'EINS-zwei-drei-VIER-fünf-sechs.' },
    { q: 'Was unterscheidet 6/8 von 3/4?', a: '6/8 hat zwei dreigeteilte Schläge, 3/4 drei zweigeteilte', w: ['Nichts, sie sind gleich', '6/8 ist doppelt so lang', '3/4 ist immer schneller'], e: 'Gleiche Länge, völlig anderes Gefühl.' },
    { q: 'Wie viele Schläge hat ein 12/8-Takt?', a: 'vier punktierte Viertel', w: ['zwölf Achtel einzeln', 'drei', 'sechs'], e: 'Vier dreigeteilte Schläge – typisch für Blues und Balladen.' },
    { q: 'Was ist ein „zusammengesetzter“ Takt?', a: 'ein Takt, dessen Schläge dreigeteilt sind (6/8, 9/8, 12/8)', w: ['ein Takt mit Pausen', 'zwei Takte hintereinander', 'ein Takt mit Akkorden'], e: 'Einfache Takte (2/4, 3/4, 4/4) haben zweigeteilte Schläge.' },
    { q: 'Wie zählt man Achteltriolen?', a: '1-ta-te 2-ta-te …', w: ['1 und 2 und', '1-e-und-e', '1 2 3 4 5 6'], e: 'Oder mit Silben wie „A-na-nas“.' },
    { q: 'Was ist bei „drei gegen zwei“ (Triolen gegen Achtel) richtig?', a: 'Die erste Note fällt zusammen, die anderen verzahnen sich', w: ['Alle Noten fallen zusammen', 'Die Triolen beginnen später', 'Die Achtel werden zu Triolen'], e: 'Langsam klatschen: „nice cup of tea“ – bei „nice“ zusammen.' },
    { q: 'Welches bekannte Stück läuft durchgehend in Achteltriolen?', a: 'Mondscheinsonate, 1. Satz', w: ['Für Elise', 'Menuett G-Dur', 'Ode an die Freude'], e: 'Die Triolen sind die Begleitung unter der Melodie.' },
    { q: 'Was ist 3/8?', a: 'ein Takt mit drei Achteln, meist ein Schlag pro Takt', w: ['drei Viertel', 'eine Triole', 'ein halber 6/8-Takt mit zwei Schlägen'], e: 'Schnelle Walzer oder Scherzi stehen oft in 3/8.' }
  ],
  verzierung: [
    { q: 'Was ist ein Pralltriller?', a: 'Hauptnote – obere Nebennote – Hauptnote, schnell', w: ['Hauptnote – untere Nebennote – Hauptnote', 'ein langer Triller', 'ein gebrochener Akkord'], e: 'Kurze Zickzacklinie über der Note.' },
    { q: 'Was ist ein Mordent?', a: 'Hauptnote – untere Nebennote – Hauptnote, schnell', w: ['Hauptnote – obere Nebennote – Hauptnote', 'vier Töne um die Hauptnote', 'ein Vorschlag von oben'], e: 'Zickzacklinie mit senkrechtem Strich.' },
    { q: 'Womit beginnt ein Triller im Barock meist?', a: 'mit der oberen Nebennote', w: ['mit der Hauptnote', 'mit der unteren Nebennote', 'mit einer Pause'], e: 'Ab der Klassik beginnt man häufiger auf der Hauptnote.' },
    { q: 'Was ist ein Doppelschlag?', a: 'obere Nebennote – Hauptnote – untere Nebennote – Hauptnote', w: ['zweimal dieselbe Note', 'ein Triller mit beiden Händen', 'ein Akkord, doppelt angeschlagen'], e: 'Zeichen: liegendes S.' },
    { q: 'Was ist eine Acciaccatura (Vorschlag mit Querstrich)?', a: 'ein ganz kurzer Vorschlag, fast gleichzeitig mit der Hauptnote', w: ['ein langer Vorschlag, der die halbe Dauer nimmt', 'eine Note, die man weglässt', 'ein Triller'], e: '„Gequetscht“ – so kurz wie möglich.' },
    { q: 'Was ist eine Appoggiatura (Vorschlag ohne Strich)?', a: 'ein betonter Vorschlag, der der Hauptnote Zeit wegnimmt', w: ['ein ganz kurzer Vorschlag', 'eine Pause', 'ein Doppelschlag'], e: 'Oft die Hälfte des Werts der Hauptnote.' },
    { q: 'Welche Nebennoten nimmt ein Pralltriller auf e in G-Dur?', a: 'e – fis – e', w: ['e – f – e', 'e – d – e', 'e – dis – e'], e: 'Die Nebennoten richten sich nach der Tonart.' },
    { q: 'Wie übt man Verzierungen?', a: 'erst ohne, dann langsam ausgeschrieben, dann einbauen', w: ['sofort im Tempo', 'gar nicht – man lässt sie weg', 'nur mit Pedal'], e: 'Erst sitzt die Musik, dann kommt der Schmuck.' },
    { q: 'Was bedeutet eine Wellenlinie senkrecht vor einem Akkord?', a: 'Arpeggio: Akkord von unten nach oben brechen', w: ['Triller auf allen Tönen', 'sehr leise', 'Akkord wiederholen'], e: 'Wie eine Harfe.' },
    { q: 'Wie laut sollten Verzierungen sein?', a: 'leicht, nie lauter als die Melodie', w: ['lauter als die Melodie', 'immer forte', 'so leise, dass man sie nicht hört'], e: 'Schmuck soll glänzen, nicht übertönen.' }
  ],
  blattspiel: [
    { q: 'Was ist beim Blattspiel das Wichtigste?', a: 'nicht anhalten – der Puls ist heilig', w: ['jede Note richtig spielen, auch wenn man anhält', 'schnell spielen', 'mit Pedal spielen'], e: 'Lieber eine Note weglassen als den Rhythmus brechen.' },
    { q: 'Wohin schauen gute Blattspieler?', a: 'voraus – die Augen sind schon im nächsten Takt', w: ['auf die Hände', 'genau auf die Note, die gerade klingt', 'auf das Pedal'], e: 'Vorauslesen ist die wichtigste Technik.' },
    { q: 'Was gehört zum 30-Sekunden-Check vor dem Blattspiel?', a: 'Tonart, Taktart, Tempo, Lage, Sprünge und schwierige Stellen ansehen', w: ['das Stück einmal üben', 'nur den ersten Takt lesen', 'den Fingersatz für jede Note eintragen'], e: 'Kurzer Überblick, dann spielen.' },
    { q: 'Was darfst du beim Blattspiel vereinfachen?', a: 'z. B. links nur Basstöne, Verzierungen weglassen', w: ['nichts, alles muss exakt sein', 'das Tempo ständig ändern', 'die rechte Hand weglassen'], e: 'Hauptsache, die Musik läuft weiter.' },
    { q: 'Welches Tempo wählst du beim Blattspiel?', a: 'eins, das du ohne Anhalten schaffst – lieber zu langsam', w: ['das Originaltempo', 'so schnell wie möglich', 'egal, man kann ja anhalten'], e: 'Ein gleichmäßig langsames Tempo klingt besser als ein holpriges schnelles.' },
    { q: 'Was erkennen geübte Blattspieler statt einzelner Noten?', a: 'Muster: Tonleitern, Dreiklänge, Akkordgriffe, Sequenzen', w: ['nur Notennamen', 'nur Rhythmen', 'nur Fingersätze'], e: 'Muster lesen ist wie Wörter lesen statt Buchstaben.' },
    { q: 'Wie wird man im Blattspiel besser?', a: 'täglich viele verschiedene, leichte Stücke vom Blatt spielen', w: ['ein Stück immer wieder üben', 'nur Theorie lernen', 'Noten abschreiben'], e: 'Menge und Vielfalt bauen den Musterschatz auf.' },
    { q: 'Du machst beim Blattspiel einen Fehler. Was tust du?', a: 'weiterspielen und den nächsten Schlag treffen', w: ['zurückgehen und korrigieren', 'von vorne anfangen', 'aufhören'], e: 'Im Ensemble oder auf der Bühne wartet niemand.' },
    { q: 'Wie schwer sollte Blattspiel-Material sein?', a: 'deutlich leichter als die Stücke, die du übst', w: ['genauso schwer', 'schwerer, damit es eine Herausforderung ist', 'egal'], e: 'Etwa zwei Stufen leichter – dann klappt das Ohne-Anhalten.' }
  ],
  sept: [
    { q: 'Wie entsteht ein Septakkord?', a: 'ein Dreiklang plus eine weitere Terz (die Septime)', w: ['ein Dreiklang plus Oktave', 'vier gleiche Töne', 'sieben Töne übereinander'], e: 'Grundton – Terz – Quinte – Septime.' },
    { q: 'Auf welcher Stufe einer Dur-Tonleiter entsteht der Dominantseptakkord?', a: 'auf der V. Stufe', w: ['auf der I. Stufe', 'auf der IV. Stufe', 'auf der VII. Stufe'], e: 'In C-Dur: G7 = g h d f.' },
    { q: 'Welche Töne hat G7?', a: 'g h d f', w: ['g h d fis', 'g b d f', 'g h dis f'], e: 'G-Dur + kleine Septime f.' },
    { q: 'Welche Töne hat Cmaj7?', a: 'c e g h', w: ['c e g b', 'c es g b', 'c e gis h'], e: 'C-Dur + große Septime h.' },
    { q: 'Welche Töne hat Am7?', a: 'a c e g', w: ['a cis e g', 'a c e gis', 'a c es g'], e: 'a-Moll + kleine Septime g.' },
    { q: 'Was ist ein halbverminderter Septakkord (m7♭5)?', a: 'verminderter Dreiklang + kleine Septime (z. B. h d f a)', w: ['verminderter Dreiklang + verminderte Septime', 'Moll + große Septime', 'Dur + kleine Septime'], e: 'Er steht in Dur auf der VII. Stufe.' },
    { q: 'Wohin will sich die Septime eines Dominantseptakkords bewegen?', a: 'einen Schritt abwärts', w: ['einen Schritt aufwärts', 'eine Oktave hoch', 'sie bleibt liegen'], e: 'In G7 → C: f geht nach e.' },
    { q: 'Wohin will die Terz des Dominantseptakkords (der Leitton)?', a: 'einen Halbton aufwärts zum Grundton der Tonika', w: ['abwärts', 'zur Quinte', 'nirgendwohin'], e: 'In G7 → C: h geht nach c.' },
    { q: 'Wie klingt ein maj7-Akkord?', a: 'weich, schwebend, jazzig', w: ['dramatisch und unheimlich', 'hart und gespannt', 'leer'], e: 'Typisch für Jazz, Bossa Nova und Neoklassik.' },
    { q: 'Welcher Septakkord besteht nur aus kleinen Terzen?', a: 'der verminderte Septakkord', w: ['der Dominantseptakkord', 'der Mollseptakkord', 'der große Septakkord'], e: 'z. B. gis h d f.' }
  ],
  schluss: [
    { q: 'Welche Akkorde bilden einen Ganzschluss?', a: 'V → I', w: ['IV → I', 'I → V', 'V → vi'], e: 'Authentischer Schluss – wie ein Punkt.' },
    { q: 'Was ist ein Halbschluss?', a: 'eine Phrase endet auf der Dominante', w: ['eine Phrase endet auf der Tonika', 'ein Schluss in der Mitte des Takts', 'IV → I'], e: 'Wie ein Komma: es geht weiter.' },
    { q: 'Was ist ein Trugschluss?', a: 'V → vi statt V → I', w: ['IV → I', 'V → I mit Pedal', 'I → IV'], e: 'Das Ohr erwartet die Tonika und wird überrascht.' },
    { q: 'Was ist ein Plagalschluss?', a: 'IV → I', w: ['V → I', 'ii → V', 'I → vi'], e: 'Der „Amen“-Schluss in Kirchenliedern.' },
    { q: 'Was ist ein Quartsextvorhalt?', a: 'die Tonika in 2. Umkehrung über dem Dominant-Bass, vor V → I', w: ['ein Akkord mit Quarte statt Terz am Ende', 'eine Pause vor dem Schluss', 'der Schlussakkord in Moll'], e: 'I⁶₄ – V7 – I: typisch für Mozart.' },
    { q: 'Ganzschluss in G-Dur: welche Akkorde?', a: 'D (D7) → G', w: ['C → G', 'G → D', 'D → Em'], e: 'V = D, I = G.' },
    { q: 'Trugschluss in C-Dur: welche Akkorde?', a: 'G → Am', w: ['G → C', 'F → C', 'C → G'], e: 'V → vi.' },
    { q: 'Wie wirkt ein Halbschluss?', a: 'offen, fragend – die Musik muss weitergehen', w: ['endgültig', 'überraschend traurig', 'wie eine Wiederholung'], e: 'Die Frage im Frage-Antwort-Paar.' },
    { q: 'Wo stehen Schlüsse in einem Stück?', a: 'am Ende von Phrasen und Teilen', w: ['nur ganz am Schluss', 'nur am Anfang', 'in jedem Takt'], e: 'Sie gliedern die Musik wie Satzzeichen.' },
    { q: 'Was macht einen Ganzschluss besonders stark (perfekt)?', a: 'Bass V → I in Grundstellung und Grundton in der Oberstimme', w: ['möglichst viel Pedal', 'Umkehrungen in beiden Akkorden', 'ein Ritardando allein'], e: 'Grundstellung + Grundton oben = vollkommener Ganzschluss.' }
  ],
  modulation: [
    { q: 'Was ist eine Modulation?', a: 'ein Wechsel in eine neue Tonart, bestätigt durch einen Schluss', w: ['ein Tempowechsel', 'eine Wiederholung', 'ein Wechsel der Taktart'], e: 'Nur kurz berührt = Ausweichung, mit Schluss bestätigt = Modulation.' },
    { q: 'Was ist ein „Drehpunktakkord“?', a: 'ein Akkord, der in beiden Tonarten vorkommt', w: ['der letzte Akkord eines Stücks', 'ein verminderter Akkord', 'ein Akkord mit Pedal'], e: 'Am ist vi in C und ii in G – er verbindet beide.' },
    { q: 'Wohin moduliert ein Dur-Stück am häufigsten?', a: 'in die Dominanttonart (eine Quinte höher)', w: ['in die Varianttonart (Dur → Moll)', 'einen Halbton höher', 'in die Subdominante der Subdominante'], e: 'C-Dur → G-Dur: Standard im Sonatensatz.' },
    { q: 'Wohin moduliert ein Moll-Stück am häufigsten?', a: 'in die Paralleltonart (Dur)', w: ['in die Dominante (Moll)', 'einen Ganzton höher', 'nirgendwohin'], e: 'a-Moll → C-Dur.' },
    { q: 'Woran erkennst du im Notentext eine Modulation von C nach G?', a: 'an häufigen fis und einem Schluss D(7) → G', w: ['an vielen b', 'an einem Taktwechsel', 'an einer Fermate'], e: 'Das neue Vorzeichen (fis) taucht immer wieder auf.' },
    { q: 'Was ist eine Zwischendominante?', a: 'die Dominante eines anderen Akkords als der Tonika, kurz eingeschoben', w: ['die Dominante der Tonika', 'ein Akkord ohne Funktion', 'ein Schlussakkord'], e: 'A7 vor Dm in C-Dur = V7/ii.' },
    { q: 'Welche Zwischendominante führt in C-Dur zu a-Moll?', a: 'E7', w: ['A7', 'G7', 'D7'], e: 'Eine Quinte über a liegt e; E7 enthält gis.' },
    { q: 'Was bedeutet „V7/V“?', a: 'die Dominante der Dominante (in C: D7)', w: ['zweimal die Dominante', 'die fünfte Umkehrung', 'Dominante mit fünf Tönen'], e: 'Dominante von G ist D – D7 mit fis.' },
    { q: 'Welche Tonarten sind mit C-Dur eng verwandt?', a: 'G-Dur, F-Dur, a-Moll, e-Moll, d-Moll', w: ['Fis-Dur und Des-Dur', 'Cis-Dur und H-Dur', 'nur c-Moll'], e: 'Nachbarn im Quintenzirkel und ihre Parallelen.' },
    { q: 'Wo moduliert die Reprise in Mozarts KV 545 (1. Satz) hin, ungewöhnlich?', a: 'sie beginnt in F-Dur (Subdominante)', w: ['sie beginnt in G-Dur', 'sie beginnt in c-Moll', 'sie moduliert nicht'], e: 'Mozart beginnt die Reprise in F und kommt dann nach C zurück.' }
  ],
  sonder: [
    { q: 'Was ist der neapolitanische Sextakkord in c-Moll?', a: 'Des-Dur mit f im Bass', w: ['D-Dur mit fis im Bass', 'As-Dur', 'G-Dur mit h im Bass'], e: 'Dur-Akkord auf der tiefalterierten II. Stufe, als Sextakkord.' },
    { q: 'Wo steht der Neapolitaner meistens?', a: 'vor der Dominante', w: ['ganz am Anfang', 'nach der Tonika am Schluss', 'nur in Dur-Stücken'], e: 'i – N⁶ – V – i.' },
    { q: 'Wie kann man den verminderten Septakkord verstehen?', a: 'als Dominante ohne Grundton (mit kleiner None)', w: ['als Moll-Akkord mit Septime', 'als Tonika mit Vorhalt', 'als zufälligen Klang'], e: 'gis-h-d-f = E7♭9 ohne e → löst sich nach a-Moll.' },
    { q: 'Wie viele verschiedene verminderte Septakkorde gibt es (klanglich)?', a: '3', w: ['12', '7', '1'], e: 'Weil alle Abstände gleich (kleine Terz) sind, wiederholen sie sich nach drei Halbtonschritten.' },
    { q: 'Was ist ein Orgelpunkt?', a: 'ein lange gehaltener Basston, über dem sich die Harmonien ändern', w: ['ein Ton auf der Orgel', 'eine Fermate', 'ein Akkord mit vielen Tönen'], e: 'Meist auf Tonika oder Dominante.' },
    { q: 'Was ist ein Vorhalt?', a: 'ein Ton des vorigen Akkords bleibt hängen und löst sich danach in den Akkordton auf', w: ['eine Pause vor dem Akkord', 'eine Verzierung mit Triller', 'ein Akkord, der vorher angekündigt wird'], e: 'z. B. sus4 → 3: Gsus4 → G.' },
    { q: 'Welcher Akkord steht in Takt 3 der Mondscheinsonate auf dem Bass fis?', a: 'D-Dur – der Neapolitaner', w: ['fis-Moll', 'Fis-Dur', 'H-Dur'], e: 'In cis-Moll ist D-Dur die tiefalterierte II. Stufe.' },
    { q: 'Was ist eine Durchgangsnote?', a: 'ein akkordfremder Ton, der schrittweise zwischen zwei Akkordtönen vermittelt', w: ['ein Ton, den man weglässt', 'ein Ton in der Pause', 'der Grundton'], e: 'c – d – e über C-Dur: d ist Durchgangsnote.' },
    { q: 'Was ist ein übermäßiger Dreiklang?', a: 'zwei große Terzen (z. B. c e gis)', w: ['zwei kleine Terzen', 'Dur mit Septime', 'Moll mit Sexte'], e: 'Er klingt schwebend, unaufgelöst.' },
    { q: 'Wie klingt der verminderte Septakkord?', a: 'dramatisch, gespannt, unheimlich', w: ['ruhig und hell', 'leer und offen', 'fröhlich'], e: 'Lieblingsakkord für dramatische Momente – Stummfilm-Bösewicht.' }
  ],
  analyse: [
    { q: 'Womit beginnt eine Analyse?', a: 'mit dem Rahmen: Tonart, Taktart, Tempo, Charakter', w: ['mit dem schwierigsten Takt', 'mit dem Fingersatz', 'mit dem Schluss'], e: 'Erst der Überblick, dann die Details.' },
    { q: 'Wie findest du den Akkord in einem gebrochenen Takt (Arpeggio)?', a: 'alle Töne des Takts zu einem Griff zusammenschieben und in Terzen ordnen', w: ['den ersten Ton nehmen', 'den höchsten Ton nehmen', 'nur den Bass ansehen'], e: 'Bach C-Dur Takt 2: c d f a d f → Dm7 über c.' },
    { q: 'Welcher Akkord ist Takt 2 von Bachs Präludium C-Dur?', a: 'Dm7 über c (Dm7/C)', w: ['C-Dur', 'G7', 'F-Dur'], e: 'c – d – a – d – f: d-Moll mit Septime c im Bass.' },
    { q: 'Wohin moduliert Bachs Präludium C-Dur in den ersten 11 Takten?', a: 'nach G-Dur (Dominante)', w: ['nach a-Moll', 'nach F-Dur', 'gar nicht'], e: 'Über D7 (fis) nach G in Takt 11.' },
    { q: 'Warum lernt man analysierte Stücke schneller?', a: 'Man merkt sich wenige Akkorde und Muster statt vieler einzelner Noten', w: ['weil man nicht mehr üben muss', 'weil die Noten dann einfacher werden', 'weil man schneller liest'], e: 'Das analytische Gedächtnis ist das zuverlässigste.' },
    { q: 'Wie bezeichnet man gleiche Teile in einer Formanalyse?', a: 'mit gleichen Buchstaben (A … A)', w: ['mit Zahlen', 'mit Farben', 'mit Taktzahlen allein'], e: 'Leicht verändert: A′.' },
    { q: 'Was markiert man bei einer Analyse zusätzlich zu den Akkorden?', a: 'Schlüsse, Modulationen, Höhepunkte und Wiederholungen', w: ['nur die Dynamik', 'nur Fingersätze', 'nur die erste Note'], e: 'So entsteht eine Landkarte des Stücks.' },
    { q: 'Was ist eine harmonische Reduktion?', a: 'das Stück auf seine Akkordgriffe vereinfacht', w: ['das Stück langsamer gespielt', 'nur die Melodie', 'das Stück transponiert'], e: 'Einmal die Griffe spielen – und du verstehst den Bauplan.' },
    { q: 'Was zeigen die Zahlen ⁶₅ in „V⁶₅“?', a: 'eine Umkehrung des Septakkords (Terz im Bass)', w: ['das Tempo', 'den Fingersatz', 'die Lautstärke'], e: 'Generalbass-Ziffern: ⁶₅ = 1. Umkehrung, ⁴₃ = 2., ⁴₂ = 3.' },
    { q: 'Was ist der Nutzen, die Phrasenenden zu bestimmen?', a: 'Man weiß, wo man atmen und gestalten muss', w: ['Man kann sie weglassen', 'Man muss dort Pedal treten', 'Keiner'], e: 'Form und Phrasierung hängen zusammen.' }
  ],
  neoklassik: [
    { q: 'Was ist ein Ostinato?', a: 'ein Begleitmuster, das sich unverändert wiederholt', w: ['eine Melodie, die nie wiederkommt', 'ein lauter Schlussakkord', 'ein langsames Tempo'], e: 'Grundlage vieler Neoklassik-Stücke.' },
    { q: 'Welche Akkordfolge ist in neoklassischer Klaviermusik besonders häufig?', a: 'vi – IV – I – V (z. B. Am – F – C – G)', w: ['I – ii – iii – iv', 'nur verminderte Akkorde', 'ii – V – I im Jazz-Stil'], e: 'Die Pop-Folge, in Moll begonnen.' },
    { q: 'Was bedeutet „add9“?', a: 'zum Dreiklang wird die None (Sekunde eine Oktave höher) hinzugefügt', w: ['neun Töne gleichzeitig', 'neun Takte lang halten', 'mit Septime und None'], e: 'Cadd9 = c e g d.' },
    { q: 'Was ist ein sus2-Akkord?', a: 'die Terz wird durch die Sekunde ersetzt (c d g)', w: ['zwei Akkorde gleichzeitig', 'ein Dur-Akkord mit Septime', 'ein Akkord, zweimal gespielt'], e: 'Weder Dur noch Moll – offen, schwebend.' },
    { q: 'Wie wird in Neoklassik oft Spannung aufgebaut?', a: 'dasselbe Muster wird immer voller und lauter, dann zurück ins Leise', w: ['durch häufige Tonartwechsel', 'durch Dissonanzen in jedem Takt', 'durch ständige Tempowechsel'], e: 'Dynamik als Formprinzip.' },
    { q: 'Wie weit ist ein typisches neoklassisches Arpeggio links?', a: 'weit, oft über eine Dezime (Grundton – Quinte – None/Terz)', w: ['ganz eng in einer Hand-Position', 'nur zwei Töne', 'nur Oktaven'], e: 'Mit Pedal entsteht eine breite Klangfläche.' },
    { q: 'Was ist bei Originalnoten von Einaudi zu beachten?', a: 'Sie sind urheberrechtlich geschützt – man kauft sie bei offiziellen Verlagen', w: ['Sie sind gemeinfrei', 'Es gibt nur Easy-Versionen', 'Man darf sie frei kopieren'], e: 'Die Originalnoten erscheinen bei Chester Music / Wise Music.' },
    { q: 'Was macht man zuerst, bevor man ein neues Neoklassik-Stück übt?', a: 'die Akkordfolge des Ostinatos bestimmen', w: ['das Tempo erhöhen', 'die Melodie auswendig lernen', 'das Pedal festlegen'], e: 'Meist sind es nur 4–8 Akkorde.' },
    { q: 'Welches Mittel nutzt Neoklassik statt komplexer Harmonik oft?', a: 'Orgelpunkte, Wiederholung und Klangfarben (add9, sus)', w: ['Zwölftontechnik', 'Fugen', 'schnelle Modulationen'], e: 'Wenige Mittel, große Wirkung.' },
    { q: 'Was ist ein Slash-Akkord wie F/A?', a: 'F-Dur mit a im Bass – für schrittweise Basslinien', w: ['F-Dur oder a-Moll', 'F-Dur mit a als Melodieton', 'ein Fehler'], e: 'C – G/H – Am – F/A: der Bass läuft c h a a.' }
  ],
  form: [
    { q: 'Welche Form hat ein Rondo?', a: 'A B A C A …', w: ['A B', 'A A B B', 'A B C D'], e: 'Ein Refrain (A) kehrt immer wieder.' },
    { q: 'Welche Form hat „Für Elise“?', a: 'Rondo (A B A C A)', w: ['Sonatensatz', 'Fuge', 'Variation'], e: 'Der bekannte A-Teil kommt dreimal.' },
    { q: 'Was sind die drei Hauptteile eines Sonatensatzes?', a: 'Exposition, Durchführung, Reprise', w: ['Thema, Variation, Coda', 'Menuett, Trio, Menuett', 'Präludium, Fuge, Coda'], e: 'Plus optional Einleitung und Coda.' },
    { q: 'In welcher Tonart steht in Dur-Sonaten meist das 2. Thema der Exposition?', a: 'in der Dominanttonart', w: ['in der Tonika', 'in der Varianttonart', 'in der Subdominante'], e: 'C-Dur → G-Dur.' },
    { q: 'Was passiert in der Reprise mit dem 2. Thema?', a: 'Es erscheint in der Grundtonart', w: ['Es wird weggelassen', 'Es bleibt in der Dominante', 'Es erscheint in Moll'], e: 'So endet der Satz in der Grundtonart.' },
    { q: 'Was passiert in der Durchführung?', a: 'Themen werden zerlegt und durch verschiedene Tonarten geführt', w: ['die Themen werden zum ersten Mal vorgestellt', 'das Stück endet', 'es wird ein neues Stück begonnen'], e: 'Die spannendste, unruhigste Stelle.' },
    { q: 'Welche Form hat ein Menuett mit Trio?', a: 'Menuett – Trio – Menuett (A B A)', w: ['A B A C A', 'Exposition – Durchführung – Reprise', 'Thema mit Variationen'], e: 'Nach dem Trio steht „Menuetto da capo“.' },
    { q: 'Was ist eine Variation?', a: 'ein Thema wird mehrfach verändert wiederholt', w: ['ein Stück ohne Thema', 'eine Modulation', 'eine Kadenz'], e: 'Melodie, Rhythmus, Harmonie oder Charakter ändern sich.' },
    { q: 'Was ist eine Fuge?', a: 'ein mehrstimmiges Stück, in dem ein Thema nacheinander in allen Stimmen einsetzt', w: ['ein schneller Tanz', 'ein Lied mit Begleitung', 'eine Improvisation'], e: 'Bachs Wohltemperiertes Klavier: 48 Präludien und Fugen.' },
    { q: 'Was ist die dreiteilige Liedform?', a: 'A B A – Melodie, Kontrast, Rückkehr', w: ['A B C', 'A A A', 'A B'], e: 'Sehr häufig in romantischen Charakterstücken.' },
    { q: 'Welche Form hat der 3. Satz von Mozarts KV 331 (Alla turca)?', a: 'Rondo-artig mit wiederkehrendem Refrain', w: ['Fuge', 'Sonatensatz', 'Variation'], e: 'Der A-Dur-Teil kehrt als Refrain wieder.' },
    { q: 'Was ist eine Coda?', a: 'ein abschließender Teil nach der eigentlichen Form', w: ['der Anfang', 'ein Mittelteil', 'eine Wiederholung der Exposition'], e: 'Sie bekräftigt den Schluss.' }
  ],
  epochen: [
    { q: 'Wann war ungefähr der Barock?', a: '1600–1750', w: ['1750–1820', '1820–1900', '1450–1600'], e: 'Endet mit Bachs Tod 1750.' },
    { q: 'Wann war ungefähr die Klassik?', a: '1750–1820', w: ['1600–1750', '1820–1900', '1900–1950'], e: 'Haydn, Mozart, früher Beethoven.' },
    { q: 'Wann war ungefähr die Romantik?', a: '1820–1900', w: ['1750–1820', '1600–1750', '1950–2000'], e: 'Schubert, Chopin, Schumann, Liszt, Brahms, Tschaikowsky.' },
    { q: 'Zu welcher Epoche gehört Johann Sebastian Bach?', a: 'Barock', w: ['Klassik', 'Romantik', 'Impressionismus'], e: '1685–1750.' },
    { q: 'Zu welcher Epoche gehört Mozart?', a: 'Klassik', w: ['Barock', 'Romantik', 'Moderne'], e: '1756–1791.' },
    { q: 'Zu welcher Epoche gehört Chopin?', a: 'Romantik', w: ['Klassik', 'Barock', 'Impressionismus'], e: '1810–1849.' },
    { q: 'Zu welcher Epoche gehört Debussy?', a: 'Impressionismus', w: ['Romantik', 'Barock', 'Klassik'], e: '1862–1918: Klangfarben, Ganztonleiter.' },
    { q: 'Welcher Komponist gilt als Brücke zwischen Klassik und Romantik?', a: 'Beethoven', w: ['Bach', 'Debussy', 'Händel'], e: '1770–1827.' },
    { q: 'Wie spielt man Barockmusik typischerweise?', a: 'wenig Pedal, klare Artikulation, gleichmäßiger Puls', w: ['viel Pedal und Rubato', 'nur laut', 'mit vielen Tempowechseln'], e: 'Linien sollen klar hörbar bleiben.' },
    { q: 'Wie spielt man Mozart typischerweise?', a: 'leicht, elegant, sparsames Pedal, klare Phrasen', w: ['schwer und dramatisch mit viel Pedal', 'frei im Tempo', 'immer forte'], e: 'Jeder Ton muss perfekt sitzen.' },
    { q: 'Wie spielt man romantische Musik (Chopin, Schumann)?', a: 'singend, mit Pedal und Rubato, große Dynamik', w: ['streng im Metronom, ohne Pedal', 'nur staccato', 'ohne Dynamik'], e: 'Ausdruck und Klangfarbe stehen im Mittelpunkt.' },
    { q: 'Was ist typisch für Ragtime?', a: 'synkopierte Melodie über einer streng gleichmäßigen „Bass – Akkord“-Begleitung', w: ['viel Rubato', 'langsame Akkordflächen', 'zwölftönige Melodien'], e: 'Scott Joplin: „Not fast“.' },
    { q: 'Wer schrieb „The Entertainer“?', a: 'Scott Joplin', w: ['George Gershwin', 'Erik Satie', 'Frédéric Chopin'], e: '1902, Ragtime.' },
    { q: 'Was ist „Terrassendynamik“ und wann ist sie typisch?', a: 'Lautstärke in Stufen – Barock', w: ['allmähliches Crescendo – Romantik', 'nur pianissimo – Impressionismus', 'Dynamik nach Gefühl – Moderne'], e: 'Cembalo und Orgel kannten kein Crescendo.' },
    { q: 'Welches Instrument war Bachs Haupt-Tasteninstrument (neben der Orgel)?', a: 'Cembalo (und Clavichord)', w: ['moderner Flügel', 'E-Piano', 'Harfe'], e: 'Der Hammerflügel setzte sich erst später durch.' },
    { q: 'Was ist typisch für den Impressionismus?', a: 'Klangfarben, Pedalwolken, Ganztonleiter und Pentatonik', w: ['strenge Fugen', 'Alberti-Bässe', 'Ragtime-Synkopen'], e: 'Debussy: „Clair de lune“.' }
  ],
  rubato: [
    { q: 'Was bedeutet „Rubato“ wörtlich?', a: 'geraubt (gestohlene Zeit)', w: ['rot', 'rund', 'schnell'], e: 'Zeit wird an einer Stelle genommen, an anderer zurückgegeben.' },
    { q: 'Wie beschrieb Chopin das Rubato sinngemäß?', a: 'Die linke Hand bleibt im Takt, die rechte singt frei', w: ['Beide Hände spielen frei', 'Die linke Hand spielt frei', 'Man soll es nie verwenden'], e: 'Die Begleitung ist der Dirigent.' },
    { q: 'Was ist Agogik?', a: 'kleine, bewusste Tempoverschiebungen zur Gestaltung', w: ['Lautstärkeänderungen', 'Pedaltechnik', 'Fingertechnik'], e: 'Ein winziges Zögern vor einem wichtigen Ton.' },
    { q: 'Wann darf man Rubato einsetzen?', a: 'wenn das Stück streng im Takt schon sicher sitzt', w: ['um schwierige Stellen langsamer zu spielen', 'immer, wenn man unsicher ist', 'nie bei Chopin'], e: 'Rubato ist Gestaltung, keine Ausrede.' },
    { q: 'In welcher Musik nutzt man wenig Rubato?', a: 'Bach, Mozart, Ragtime', w: ['Chopin', 'Tschaikowsky', 'Liszt'], e: 'Hier trägt der gleichmäßige Puls.' },
    { q: 'Wo nimmt man sich typischerweise Zeit?', a: 'am Höhepunkt und am Phrasenende', w: ['in jedem Takt auf der 1', 'bei leichten Stellen', 'bei Pausen nie'], e: 'Vor dem Höhepunkt drängen, am Höhepunkt verweilen.' },
    { q: 'Was unterscheidet gutes Rubato von holprigem Spiel?', a: 'Gutes Rubato ist geplant und gleicht sich aus, der Fluss bleibt', w: ['Gutes Rubato ist immer langsamer', 'Es gibt keinen Unterschied', 'Holpriges Spiel ist lauter'], e: 'Der Hörer spürt Atem, nicht Stolpern.' },
    { q: 'Was bedeutet „a tempo“ nach einem Rubato oder Ritardando?', a: 'zurück zum Grundtempo', w: ['schneller als vorher', 'frei weiterspielen', 'aufhören'], e: 'Das Grundtempo gilt wieder.' }
  ],
  rekord: [
    { q: 'Was macht man als Erstes mit einem neuen Stück?', a: 'anhören, Noten mitlesen und analysieren', w: ['sofort durchspielen', 'nur die erste Seite üben', 'Pedal festlegen'], e: 'Verstehen spart Übezeit.' },
    { q: 'Warum soll man den Fingersatz einmal festlegen und nicht mehr ändern?', a: 'weil wechselnde Fingersätze ständige Fehler verursachen', w: ['weil es Vorschrift ist', 'weil es schneller klingt', 'egal, man kann ihn ändern'], e: 'Die Hand lernt einen Weg – nicht drei.' },
    { q: 'Mit welchen Stellen fängt man beim Üben an?', a: 'mit den schwersten', w: ['immer mit dem Anfang', 'mit den leichtesten', 'mit dem Schluss, egal wie schwer'], e: 'Sonst kann man am Ende nur den Anfang.' },
    { q: 'Was bringt das Üben mit Rhythmusvarianten (punktiert)?', a: 'gleichmäßigere, sichere schnelle Läufe', w: ['nichts', 'mehr Lautstärke', 'besseres Pedal'], e: 'Lang-kurz und kurz-lang trainieren jeden Übergang.' },
    { q: 'Was ist Rückwärts-Verketten?', a: 'den letzten Abschnitt zuerst lernen, dann den davor dazu …', w: ['das Stück rückwärts spielen', 'die Hände tauschen', 'langsamer werden'], e: 'Das Ende wird zum sichersten Teil.' },
    { q: 'Was ist verteiltes Üben?', a: 'mehrere kurze Einheiten über den Tag statt einer langen', w: ['mit mehreren Personen üben', 'jede Hand an einem anderen Tag', 'nur am Wochenende üben'], e: 'Das Gehirn festigt Bewegungen in den Pausen und im Schlaf.' },
    { q: 'Was ist „interleaved practice“?', a: 'mehrere Stellen im Wechsel üben statt eine Stelle sehr oft am Stück', w: ['zwei Stücke gleichzeitig spielen', 'üben mit Kopfhörern', 'nur mit Metronom üben'], e: 'Wirkt sich langfristig besser auf das Behalten aus.' },
    { q: 'Wie übt man große Sprünge?', a: 'erst stumm zur Zieltaste springen und sie berühren, Blick vorab zum Ziel', w: ['mit geschlossenen Augen', 'so schnell wie möglich', 'mit Pedal'], e: 'Die Bewegung lernen, bevor der Ton zählt.' },
    { q: 'Wann spielt man ein Stück zum ersten Mal ganz durch?', a: 'wenn alle Abschnitte einzeln sicher sitzen', w: ['am ersten Tag', 'nie', 'nach genau einer Woche'], e: 'Durchspielen ist ein Test, keine Übe-Methode.' },
    { q: 'Was ist ein gutes Ziel für eine Übe-Einheit?', a: 'klein und messbar, z. B. „Takt 9–12 beidhändig ♩ = 60“', w: ['„das Stück können“', '„eine Stunde üben“', '„besser werden“'], e: 'Klare Ziele machen Fortschritt sichtbar.' }
  ],
  auswendig: [
    { q: 'Welches Gedächtnis ist beim Auswendigspielen am unzuverlässigsten?', a: 'das Fingergedächtnis (motorisch)', w: ['das analytische Gedächtnis', 'das Hörgedächtnis', 'das visuelle Gedächtnis'], e: 'Unter Nervosität reißt es als Erstes.' },
    { q: 'Welches Gedächtnis ist am zuverlässigsten?', a: 'das analytische (Akkorde, Form, Tonarten wissen)', w: ['das Fingergedächtnis', 'das Muskelgedächtnis der Füße', 'das Kurzzeitgedächtnis'], e: 'Wer weiß, was er spielt, findet immer zurück.' },
    { q: 'Was sind Einstiegspunkte?', a: 'markierte Stellen, an denen man jederzeit neu einsetzen kann', w: ['die ersten Töne des Stücks', 'Stellen mit Pedal', 'Pausen'], e: 'Alle 4–8 Takte – beim Hängenbleiben springt man zum nächsten.' },
    { q: 'Was ist mentales Üben?', a: 'das Stück im Kopf spielen – Noten, Klang und Bewegung vorstellen', w: ['Noten abschreiben', 'Aufnahmen hören beim Einschlafen', 'Fingerübungen auf dem Tisch'], e: 'Wo es im Kopf unklar wird, ist es auch in den Fingern unsicher.' },
    { q: 'Warum ist sehr langsames Spielen ein guter Auswendig-Test?', a: 'weil es das Fingergedächtnis ausschaltet und zeigt, was man wirklich weiß', w: ['weil man dann keine Fehler macht', 'weil es schöner klingt', 'es ist kein guter Test'], e: 'Im Zeitlupentempo trägt kein Automatismus.' },
    { q: 'Wann sollte man anfangen, auswendig zu lernen?', a: 'von Anfang an, in kleinen Abschnitten', w: ['erst, wenn das Stück perfekt sitzt', 'nie', 'einen Tag vor dem Vorspiel'], e: 'Lesen und Auswendiglernen gehen Hand in Hand.' },
    { q: 'Was ist der Härtetest fürs Auswendigspielen?', a: 'jede Hand allein auswendig spielen können', w: ['schneller spielen als nötig', 'mit Pedal spielen', 'mit geschlossenen Augen improvisieren'], e: 'Besonders die linke Hand ist oft nur „mitgelaufen“.' },
    { q: 'Warum am nächsten Tag prüfen?', a: 'weil das Gedächtnis sich im Schlaf festigt – erst dann zeigt sich, was wirklich sitzt', w: ['weil die Finger dann ausgeruht sind', 'weil es Tradition ist', 'gar nicht nötig'], e: 'Schlaf ist Teil des Übens.' }
  ],
  vorspiel: [
    { q: 'Was tust du, wenn du auf der Bühne einen Fehler machst?', a: 'weiterspielen, ohne Reaktion', w: ['zurückgehen und korrigieren', 'von vorne beginnen', 'sich entschuldigen'], e: 'Das Publikum merkt die meisten Fehler nicht – aber jedes Anhalten.' },
    { q: 'Wie beruhigst du den Puls vor dem Vorspiel?', a: 'langsam und länger aus- als einatmen (z. B. 4 ein, 6 aus)', w: ['schnell atmen', 'Kaffee trinken', 'Hände kalt waschen'], e: 'Langes Ausatmen aktiviert die Entspannung.' },
    { q: 'Was passiert unter Nervosität oft mit dem Tempo?', a: 'man wird schneller', w: ['man wird langsamer', 'es bleibt gleich', 'man spielt im Takt des Publikums'], e: 'Bewusst etwas langsamer beginnen.' },
    { q: 'Was ist ein Bühnenritual?', a: 'immer gleicher Ablauf: Bank einstellen, Hände in den Schoß, Tempo im Kopf singen, dann beginnen', w: ['ein Glücksbringer', 'ein Lied vor dem Konzert', 'eine Verbeugung vor dem Spielen'], e: 'Rituale geben Sicherheit.' },
    { q: 'Wie übt man das Vorspielen?', a: 'Probe-Vorspiele vor Menschen oder Kamera, ohne Anhalten', w: ['nur allein und mit Pausen', 'gar nicht – es ergibt sich', 'nur Tonleitern'], e: 'Vorspielen ist eine eigene Fähigkeit.' },
    { q: 'Was ist „kalt spielen“?', a: 'ein Stück ohne Einspielen sofort vortragen', w: ['im kalten Raum spielen', 'ohne Gefühl spielen', 'nur mit Pedal'], e: 'So wie auf der Bühne oft – vorher üben!' },
    { q: 'Ist Lampenfieber ein schlechtes Zeichen?', a: 'Nein – es ist normale Energie, fast alle Profis haben es', w: ['Ja, man ist nicht vorbereitet', 'Ja, man sollte nicht auftreten', 'Nur bei Anfängern'], e: 'Die Energie kann man für Ausdruck nutzen.' },
    { q: 'Du bist hängen geblieben. Was ist die beste Lösung?', a: 'zum nächsten Einstiegspunkt springen oder mit der linken Hand weiterbegleiten', w: ['aufhören und gehen', 'neu anfangen', 'improvisieren bis zum Ende'], e: 'Weiter im Puls – die Musik geht weiter.' },
    { q: 'Warum auf einem fremden Klavier proben?', a: 'Tastengewicht, Klang und Pedal sind überall anders', w: ['weil es lauter ist', 'es ist unnötig', 'weil man dann besser liest'], e: 'Vor dem Ball möglichst auf dem dortigen Instrument spielen.' },
    { q: 'Was gehört zum Ende eines Vortrags?', a: 'kurz innehalten, aufstehen, verbeugen, lächeln', w: ['sofort weggehen', 'Fehler erklären', 'nochmal spielen'], e: 'Der Applaus gehört zum Vortrag.' }
  ]
});

/* ===== Notenweg 3 · Wissen Teil 2: Glossar und Folien für Kapitel III–VIII ===== */
CUR.gloss.push(
  ...[
    // III Tonleitern
    ['tonleiter', 'Tonleiter', 'Stufenweise Folge der Töne einer Tonart vom Grundton bis zur Oktave.', 'Tonleiter', '3.1', 'Töne einer Tonart der Reihe nach'],
    ['tonart', 'Tonart', 'Der Tonvorrat eines Stücks, bestimmt durch Grundton und Tongeschlecht (Dur/Moll), z. B. G-Dur.', 'Tonleiter', '3.1', 'Grundton + Dur/Moll eines Stücks'],
    ['leitton', 'Leitton', 'Die 7. Stufe, einen Halbton unter dem Grundton; sie strebt zum Grundton (h in C-Dur).', 'Tonleiter', '3.1', '7. Stufe, Halbton unter dem Grundton'],
    ['tetrachord', 'Tetrachord', 'Gruppe aus vier Tönen; die Dur-Tonleiter besteht aus zwei gleichen Tetrachorden (G–G–H).', 'Tonleiter', '3.1', 'Viertongruppe (Ganz – Ganz – Halb)'],
    ['daumenuntersatz', 'Daumenuntersatz', 'Der Daumen gleitet unter der Hand durch, damit eine Tonleiter ohne Lücke weiterläuft.', 'Technik', '3.2', 'Daumen gleitet unter der Hand durch'],
    ['vorzeichnung', 'Vorzeichnung', 'Die Vorzeichen der Tonart am Anfang jeder Zeile; sie gelten für alle Oktaven.', 'Zeichen', '3.3', 'Vorzeichen am Zeilenanfang'],
    ['versetzungszeichen', 'Versetzungszeichen (Akzidens)', 'Ein ♯, ♭ oder ♮ im Takt; gilt bis zum Taktende für diese Tonhöhe.', 'Zeichen', '3.3', 'Vorzeichen im Takt, gilt bis Taktende'],
    ['doppelkreuz', 'Doppelkreuz', 'Erhöht um zwei Halbtöne (fisis).', 'Zeichen', '3.3', 'erhöht um zwei Halbtöne'],
    ['quintenzirkel', 'Quintenzirkel', 'Kreis aller Tonarten im Quintabstand, geordnet nach Zahl der Vorzeichen.', 'Tonleiter', '3.4', 'alle Tonarten im Quintabstand'],
    ['paralleltonart', 'Paralleltonart', 'Dur und Moll mit denselben Vorzeichen; Moll liegt eine kleine Terz tiefer (C-Dur – a-Moll).', 'Tonleiter', '3.5', 'Dur/Moll mit gleichen Vorzeichen'],
    ['varianttonart', 'Varianttonart', 'Dur und Moll mit gleichem Grundton (C-Dur – c-Moll).', 'Tonleiter', '3.5', 'Dur/Moll mit gleichem Grundton'],
    ['harmonisch-moll', 'harmonisch Moll', 'Moll mit erhöhter 7. Stufe (Leitton): a h c d e f gis a.', 'Tonleiter', '3.5', 'Moll mit erhöhter 7. Stufe'],
    ['melodisch-moll', 'melodisch Moll', 'Moll mit erhöhter 6. und 7. Stufe aufwärts, abwärts natürlich.', 'Tonleiter', '3.5', 'aufwärts 6. und 7. Stufe erhöht'],
    ['tritonus', 'Tritonus', 'Intervall aus drei Ganztönen (6 Halbtöne), z. B. f–h.', 'Harmonik', '3.6', 'drei Ganztöne, 6 Halbtöne'],
    ['rein', 'reine Intervalle', 'Prime, Quarte, Quinte und Oktave; sie sind nie groß oder klein.', 'Harmonik', '3.6', 'Prime, Quarte, Quinte, Oktave'],
    // IV Akkorde
    ['dreiklang', 'Dreiklang', 'Akkord aus drei Tönen in Terzen: Grundton, Terz, Quinte.', 'Harmonik', '4.1', 'drei Töne in Terzen geschichtet'],
    ['vermindert', 'verminderter Dreiklang', 'Zwei kleine Terzen (h d f).', 'Harmonik', '4.2', 'zwei kleine Terzen'],
    ['uebermaessig', 'übermäßiger Dreiklang', 'Zwei große Terzen (c e gis).', 'Harmonik', '4.2', 'zwei große Terzen'],
    ['umkehrung', 'Umkehrung', 'Akkord, bei dem nicht der Grundton, sondern Terz (Sextakkord) oder Quinte (Quartsextakkord) unten liegt.', 'Harmonik', '4.3', 'anderer Akkordton im Bass'],
    ['sextakkord', 'Sextakkord', '1. Umkehrung: die Terz liegt unten.', 'Harmonik', '4.3', 'Terz im Bass'],
    ['quartsextakkord', 'Quartsextakkord', '2. Umkehrung: die Quinte liegt unten.', 'Harmonik', '4.3', 'Quinte im Bass'],
    ['akkordsymbol', 'Akkordsymbol', 'Kurzschrift für Akkorde über der Melodie: Am, G7, Cmaj7, C/E.', 'Harmonik', '4.4', 'Kurzschrift wie Am, G7'],
    ['slash', 'Slash-Akkord', 'Akkord mit anderem Basston, z. B. C/E = C-Dur mit e im Bass.', 'Harmonik', '4.4', 'Akkord / Basston'],
    ['sus', 'sus-Akkord', 'Terz ersetzt durch Quarte (sus4) oder Sekunde (sus2).', 'Harmonik', '4.4', 'Terz durch Quarte oder Sekunde ersetzt'],
    ['stufe', 'Stufe', 'Akkord auf einem Ton der Tonleiter, mit römischen Zahlen bezeichnet (I–VII).', 'Harmonik', '4.5', 'Akkord auf einem Tonleiterton (I–VII)'],
    ['tonika', 'Tonika', 'Akkord der I. Stufe – der Ruhepunkt.', 'Harmonik', '4.5', 'I. Stufe, Ruhepunkt'],
    ['dominante', 'Dominante', 'Akkord der V. Stufe – Spannung, die zur Tonika will.', 'Harmonik', '4.5', 'V. Stufe, Spannung'],
    ['subdominante', 'Subdominante', 'Akkord der IV. Stufe – Aufbruch.', 'Harmonik', '4.5', 'IV. Stufe, Aufbruch'],
    ['kadenz', 'Kadenz', 'Akkordfolge, die eine Tonart bestätigt, z. B. I – IV – V – I; auch: Schlusswendung einer Phrase.', 'Harmonik', '4.6', 'I – IV – V – I, Schlusswendung'],
    ['leadsheet', 'Lead Sheet', 'Notenblatt mit Melodie und Akkordsymbolen; die Begleitung gestaltet man selbst.', 'Notation', '4.7', 'Melodie + Akkordsymbole'],
    ['alberti', 'Alberti-Bass', 'Gebrochener Akkord im Muster tief – hoch – mitte – hoch (c g e g).', 'Technik', '4.8', 'Begleitung c–g–e–g'],
    ['arpeggio', 'Arpeggio', 'Gebrochener Akkord – Töne nacheinander statt gleichzeitig.', 'Technik', '4.8', 'gebrochener Akkord'],
    // V Ausdruck
    ['pp', 'pianissimo (pp)', 'Sehr leise.', 'Dynamik', '5.1', 'sehr leise'],
    ['p', 'piano (p)', 'Leise.', 'Dynamik', '5.1', 'leise'],
    ['mp', 'mezzopiano (mp)', 'Halbleise.', 'Dynamik', '5.1', 'halbleise'],
    ['mf', 'mezzoforte (mf)', 'Halblaut.', 'Dynamik', '5.1', 'halblaut'],
    ['f', 'forte (f)', 'Laut.', 'Dynamik', '5.1', 'laut'],
    ['ff', 'fortissimo (ff)', 'Sehr laut.', 'Dynamik', '5.1', 'sehr laut'],
    ['crescendo', 'crescendo (cresc., <)', 'Allmählich lauter werden.', 'Dynamik', '5.1', 'lauter werden'],
    ['decrescendo', 'decrescendo / diminuendo (>)', 'Allmählich leiser werden.', 'Dynamik', '5.1', 'leiser werden'],
    ['sforzato', 'sforzato (sf, sfz)', 'Einzelne Note plötzlich stark betont.', 'Dynamik', '5.1', 'plötzlich stark betont'],
    ['fortepiano', 'fortepiano (fp)', 'Laut anschlagen, sofort leise weiter.', 'Dynamik', '5.1', 'laut, sofort leise'],
    ['staccato', 'staccato', 'Kurz, abgesetzt (Punkt über/unter der Note).', 'Artikulation', '5.2', 'kurz, abgesetzt'],
    ['tenuto', 'tenuto', 'Voll aushalten, leicht gewichtet (Strich).', 'Artikulation', '5.2', 'voll aushalten'],
    ['portato', 'portato', 'Leicht getrennt, aber getragen (Punkte unter Bogen).', 'Artikulation', '5.2', 'getragen-getrennt'],
    ['staccatissimo', 'staccatissimo', 'Sehr kurz (Keil).', 'Artikulation', '5.2', 'sehr kurz'],
    ['marcato', 'marcato', 'Stark betont (^).', 'Artikulation', '5.2', 'stark betont'],
    ['akzent', 'Akzent', 'Betonte Note (>).', 'Artikulation', '5.2', 'betont'],
    ['non-legato', 'non legato', 'Nicht gebunden, leicht getrennt.', 'Artikulation', '5.2', 'leicht getrennt'],
    ['dolce', 'dolce', 'Süß, zart.', 'Vortrag', '5.3', 'süß, zart'],
    ['cantabile', 'cantabile', 'Singend.', 'Vortrag', '5.3', 'singend'],
    ['espressivo', 'espressivo (espr.)', 'Ausdrucksvoll.', 'Vortrag', '5.3', 'ausdrucksvoll'],
    ['leggiero', 'leggiero', 'Leicht.', 'Vortrag', '5.3', 'leicht'],
    ['grazioso', 'grazioso', 'Anmutig.', 'Vortrag', '5.3', 'anmutig'],
    ['maestoso', 'maestoso', 'Majestätisch.', 'Vortrag', '5.3', 'majestätisch'],
    ['con-brio', 'con brio', 'Mit Schwung, mit Feuer.', 'Vortrag', '5.3', 'mit Feuer'],
    ['agitato', 'agitato', 'Aufgeregt, unruhig.', 'Vortrag', '5.3', 'aufgeregt'],
    ['tranquillo', 'tranquillo', 'Ruhig.', 'Vortrag', '5.3', 'ruhig'],
    ['sempre', 'sempre', 'Immer (sempre pp = durchgehend pp).', 'Vortrag', '5.3', 'immer'],
    ['subito', 'subito', 'Plötzlich.', 'Vortrag', '5.3', 'plötzlich'],
    ['ritardando', 'ritardando (rit.)', 'Allmählich langsamer werden.', 'Vortrag', '5.3', 'langsamer werden'],
    ['accelerando', 'accelerando (accel.)', 'Allmählich schneller werden.', 'Vortrag', '5.3', 'schneller werden'],
    ['a-tempo', 'a tempo', 'Zurück zum Grundtempo.', 'Vortrag', '5.3', 'zurück zum Grundtempo'],
    ['morendo', 'morendo', 'Ersterbend – leiser und langsamer werdend.', 'Vortrag', '5.3', 'ersterbend'],
    ['poco-a-poco', 'poco a poco', 'Nach und nach.', 'Vortrag', '5.3', 'nach und nach'],
    ['fermate', 'Fermate', 'Ton oder Pause länger aushalten als notiert.', 'Zeichen', '5.3', 'länger aushalten'],
    ['haltepedal', 'Haltepedal', 'Rechtes Pedal: hebt alle Dämpfer, Töne klingen weiter.', 'Technik', '5.4', 'rechtes Pedal, hebt Dämpfer'],
    ['synkopiertes-pedal', 'synkopiertes Pedal', 'Erst anschlagen, dann Pedal hoch und sofort wieder runter.', 'Technik', '5.4', 'Pedal nach dem Anschlag wechseln'],
    ['una-corda', 'una corda', 'Linkes Pedal: leiser, weicher; aufgehoben mit „tre corde“.', 'Technik', '5.4', 'linkes Pedal, leiser'],
    ['voicing', 'Voicing', 'Stimmen unterschiedlich laut spielen, damit die Melodie hervortritt.', 'Technik', '5.5', 'Melodie lauter als Begleitung'],
    ['phrase', 'Phrase', 'Musikalischer Satz, meist 2, 4 oder 8 Takte, mit Anfang, Höhepunkt und Ende.', 'Form', '5.6', 'musikalischer Satz'],
    ['periode', 'Periode', 'Zwei Phrasen als Frage (Halbschluss) und Antwort (Ganzschluss).', 'Form', '5.6', 'Frage + Antwort'],
    // VI Lesen
    ['ottava', '8va / 8vb', 'Eine Oktave höher (8va) bzw. tiefer (8vb) spielen als notiert.', 'Zeichen', '6.1', 'Oktave höher/tiefer'],
    ['loco', 'loco', 'Wieder in normaler Lage spielen.', 'Zeichen', '6.1', 'wieder normal'],
    ['volta', 'Volta (Klammer)', '1. Klammer nur beim ersten Durchgang, 2. Klammer beim zweiten.', 'Zeichen', '6.2', 'erste und zweite Klammer'],
    ['da-capo', 'Da Capo (D.C.)', 'Zurück zum Anfang.', 'Zeichen', '6.2', 'zurück zum Anfang'],
    ['dal-segno', 'Dal Segno (D.S.)', 'Zurück zum Zeichen 𝄋.', 'Zeichen', '6.2', 'zurück zum Zeichen'],
    ['fine', 'Fine', 'Ende (nach einem Sprung hier aufhören).', 'Zeichen', '6.2', 'Ende'],
    ['coda', 'Coda', 'Schlussteil; „al Coda“ = bis zum Coda-Zeichen, dann springen.', 'Form', '6.2', 'Schlussteil'],
    ['polyphonie', 'Polyphonie', 'Mehrstimmigkeit mit gleichberechtigten Stimmen (Bach).', 'Form', '6.3', 'gleichberechtigte Stimmen'],
    ['invention', 'Invention', 'Zweistimmiges Lehrstück von Bach, ein Motiv wandert durch beide Stimmen.', 'Form', '6.3', 'zweistimmiges Bach-Stück'],
    ['triole', 'Triole', 'Drei Noten in der Zeit von zwei gleichen (kleine 3).', 'Rhythmus', '6.4', 'drei statt zwei'],
    ['sechsachtel', '6/8-Takt', 'Zwei Schläge zu je drei Achteln (punktierte Viertel).', 'Rhythmus', '6.4', 'zwei dreigeteilte Schläge'],
    ['pralltriller', 'Pralltriller', 'Hauptnote – obere Nebennote – Hauptnote, schnell.', 'Zeichen', '6.6', 'Haupt – obere – Haupt'],
    ['mordent', 'Mordent', 'Hauptnote – untere Nebennote – Hauptnote, schnell.', 'Zeichen', '6.6', 'Haupt – untere – Haupt'],
    ['triller', 'Triller (tr)', 'Schneller Wechsel mit der oberen Nebennote.', 'Zeichen', '6.6', 'schneller Wechsel mit oberer Nebennote'],
    ['doppelschlag', 'Doppelschlag', 'Obere Nebennote – Hauptnote – untere – Hauptnote.', 'Zeichen', '6.6', 'obere – Haupt – untere – Haupt'],
    ['vorschlag', 'Vorschlag', 'Kleine Note vor der Hauptnote; mit Strich kurz (Acciaccatura), ohne oft lang (Appoggiatura).', 'Zeichen', '6.6', 'kleine Note davor'],
    ['blattspiel', 'Blattspiel (prima vista)', 'Unbekannte Noten direkt spielen, ohne Anhalten.', 'Üben', '6.7', 'unbekannte Noten direkt spielen'],
    // VII Harmonie
    ['septakkord', 'Septakkord', 'Vierklang: Dreiklang plus Septime.', 'Harmonik', '7.1', 'Dreiklang + Septime'],
    ['dominantseptakkord', 'Dominantseptakkord', 'Dur-Dreiklang + kleine Septime auf der V. Stufe (G7 in C).', 'Harmonik', '7.1', 'V7, Dur + kleine Septime'],
    ['maj7', 'großer Septakkord (maj7)', 'Dur-Dreiklang + große Septime (Cmaj7 = c e g h).', 'Harmonik', '7.1', 'Dur + große Septime'],
    ['ganzschluss', 'Ganzschluss', 'V → I, wirkt wie ein Punkt.', 'Harmonik', '7.2', 'V → I'],
    ['halbschluss', 'Halbschluss', 'Phrase endet auf V, wirkt wie ein Komma.', 'Harmonik', '7.2', 'endet auf V'],
    ['trugschluss', 'Trugschluss', 'V → vi statt V → I.', 'Harmonik', '7.2', 'V → vi'],
    ['plagalschluss', 'Plagalschluss', 'IV → I, „Amen“-Schluss.', 'Harmonik', '7.2', 'IV → I'],
    ['zwischendominante', 'Zwischendominante', 'Dominante eines anderen Akkords als der Tonika (A7 vor Dm in C).', 'Harmonik', '7.3', 'Dominante eines Nebenakkords'],
    ['modulation', 'Modulation', 'Wechsel in eine neue Tonart, bestätigt durch einen Schluss.', 'Harmonik', '7.3', 'Tonartwechsel'],
    ['neapolitaner', 'Neapolitanischer Sextakkord', 'Dur-Akkord auf der tiefalterierten II. Stufe in Moll, als Sextakkord (Des/F in c-Moll).', 'Harmonik', '7.4', 'Dur auf tiefer II. Stufe'],
    ['orgelpunkt', 'Orgelpunkt', 'Lang gehaltener Basston unter wechselnden Harmonien.', 'Harmonik', '7.4', 'liegender Basston'],
    ['vorhalt', 'Vorhalt', 'Ton des vorigen Akkords, der sich verspätet in den Akkordton auflöst.', 'Harmonik', '7.4', 'verspätete Auflösung'],
    ['ostinato', 'Ostinato', 'Sich ständig wiederholendes Muster, oft in der Begleitung.', 'Form', '7.6', 'wiederholtes Muster'],
    ['add9', 'add9', 'Dreiklang plus None (Cadd9 = c e g d).', 'Harmonik', '7.6', 'Dreiklang + None'],
    // VIII Form & Stil
    ['rondo', 'Rondo', 'Form mit wiederkehrendem Refrain: A B A C A.', 'Form', '8.1', 'A B A C A'],
    ['sonatensatz', 'Sonatensatz', 'Form aus Exposition, Durchführung, Reprise (und Coda).', 'Form', '8.1', 'Exposition – Durchführung – Reprise'],
    ['exposition', 'Exposition', 'Vorstellung der Themen im Sonatensatz (1. Thema in I, 2. Thema meist in V).', 'Form', '8.1', 'Vorstellung der Themen'],
    ['durchfuehrung', 'Durchführung', 'Verarbeitung der Themen durch viele Tonarten.', 'Form', '8.1', 'Verarbeitung der Themen'],
    ['reprise', 'Reprise', 'Wiederkehr der Exposition, 2. Thema jetzt in der Grundtonart.', 'Form', '8.1', 'Wiederkehr, alles in I'],
    ['variation', 'Variation', 'Ein Thema wird mehrfach verändert wiederholt.', 'Form', '8.1', 'verändertes Thema'],
    ['fuge', 'Fuge', 'Mehrstimmiges Stück, ein Thema setzt nacheinander in allen Stimmen ein.', 'Form', '8.1', 'Thema wandert durch alle Stimmen'],
    ['liedform', 'dreiteilige Liedform', 'A B A: Melodie – Kontrast – Rückkehr.', 'Form', '8.1', 'A B A'],
    ['trio', 'Trio', 'Mittelteil eines Menuetts oder Scherzos.', 'Form', '8.1', 'Mittelteil des Menuetts'],
    ['barock', 'Barock', 'Epoche ca. 1600–1750: Bach, Händel. Polyphonie, Verzierungen, Terrassendynamik.', 'Stil', '8.2', 'ca. 1600–1750'],
    ['klassik', 'Klassik', 'Epoche ca. 1750–1820: Haydn, Mozart, Beethoven. Klare Phrasen, Melodie + Begleitung.', 'Stil', '8.2', 'ca. 1750–1820'],
    ['romantik', 'Romantik', 'Epoche ca. 1820–1900: Chopin, Schumann, Liszt. Ausdruck, Pedal, Rubato.', 'Stil', '8.2', 'ca. 1820–1900'],
    ['impressionismus', 'Impressionismus', 'Epoche ca. 1890–1920: Debussy, Ravel. Klangfarben, Ganztonleiter.', 'Stil', '8.2', 'ca. 1890–1920'],
    ['ragtime', 'Ragtime', 'Amerikanischer Klavierstil um 1900 (Joplin): synkopierte Melodie über gleichmäßiger Bass-Akkord-Begleitung.', 'Stil', '8.2', 'Joplin, synkopiert, um 1900'],
    ['rubato', 'Rubato', 'Freie, atmende Gestaltung des Tempos.', 'Vortrag', '8.3', 'frei im Tempo'],
    ['agogik', 'Agogik', 'Kleine, bewusste Tempoverschiebungen.', 'Vortrag', '8.3', 'kleine Tempoverschiebungen'],
    ['einstiegspunkt', 'Einstiegspunkt', 'Markierte Stelle, an der man beim Auswendigspielen jederzeit neu einsetzen kann.', 'Üben', '8.5', 'Neu-Einstiegsstelle'],
    ['verteiltes-ueben', 'verteiltes Üben', 'Mehrere kurze Übe-Einheiten statt einer langen.', 'Üben', '8.4', 'kurze Einheiten über den Tag']
  ].map(([id, term, def, cat, after, short]) => ({ id, term, def, cat, after, short }))
);

CUR.folios.push(
  { id: 'dur', title: 'Die Dur-Tonleiter', sub: 'Bauplan und Fingersatz', icon: 'staff', after: '3.2', lessons: ['3.1', '3.2'], body: `<p><b>Ganz – Ganz – Halb – Ganz – Ganz – Ganz – Halb.</b> Halbtöne zwischen 3–4 und 7–8.</p>[[0]]<table><tr><th>Tonleiter</th><th>Rechts</th><th>Links (aufwärts)</th></tr><tr><td>C, G, D, A, E</td><td>1 2 3 1 2 3 4 5</td><td>5 4 3 2 1 3 2 1</td></tr><tr><td>F</td><td>1 2 3 4 1 2 3 4</td><td>5 4 3 2 1 3 2 1</td></tr><tr><td>H</td><td>1 2 3 1 2 3 4 5</td><td>4 3 2 1 4 3 2 1</td></tr></table><p><b>Daumen nie auf schwarze Tasten.</b> Hand ruhig, Daumen gleitet früh unter.</p>`, figs: [F.s('C4/8!f1 D4/8!f2 E4/8!f3 F4/8!f1 G4/8!f2 A4/8!f3 B4/8!f4 C5/8!f5', { time: 'C', bpm: 90, cap: 'C-Dur rechts mit Fingersatz.' })] },
  { id: 'quintenzirkel', title: 'Der Quintenzirkel', sub: 'Alle Tonarten und Vorzeichen', icon: 'circle', after: '3.4', lessons: ['3.3', '3.4'], body: `[[0]]<table><tr><th>♯</th><th>Dur</th><th>Moll</th><th>♭</th><th>Dur</th><th>Moll</th></tr><tr><td>1</td><td>G</td><td>e</td><td>1</td><td>F</td><td>d</td></tr><tr><td>2</td><td>D</td><td>h</td><td>2</td><td>B</td><td>g</td></tr><tr><td>3</td><td>A</td><td>fis</td><td>3</td><td>Es</td><td>c</td></tr><tr><td>4</td><td>E</td><td>cis</td><td>4</td><td>As</td><td>f</td></tr><tr><td>5</td><td>H</td><td>gis</td><td>5</td><td>Des</td><td>b</td></tr><tr><td>6</td><td>Fis</td><td>dis</td><td>6</td><td>Ges</td><td>es</td></tr></table><p>Kreuze: <b>fis cis gis dis ais eis his</b>. Bs: dieselbe Reihe rückwärts. Dur-Grundton: letztes Kreuz + Halbton / vorletztes b.</p>`, figs: [{ kind: 'circle' }] },
  { id: 'moll', title: 'Moll', sub: 'Drei Formen und die Parallele', icon: 'staff', after: '3.5', body: `<table><tr><th>Form</th><th>a-Moll</th><th>Merkmal</th></tr><tr><td>natürlich</td><td>a h c d e f g a</td><td>G H G G H G G</td></tr><tr><td>harmonisch</td><td>a h c d e f <b>gis</b> a</td><td>Leitton, übermäßige Sekunde f–gis</td></tr><tr><td>melodisch</td><td>a h c d e <b>fis gis</b> a</td><td>aufwärts; abwärts natürlich</td></tr></table><p><b>Parallele</b>: gleiche Vorzeichen, kleine Terz tiefer (C → a). <b>Variante</b>: gleicher Grundton (C → c).</p>[[0]]`, figs: [F.s('A3/8 B3/8 C4/8 D4/8 E4/8 F4/8 G#4/8 A4/8', { time: 'C', bpm: 90, cap: 'a-Moll harmonisch.' })] },
  { id: 'intervalle-2', title: 'Intervalle genau', sub: 'Halbtöne zählen', icon: 'staff', after: '3.6', lessons: ['3.6', '3.7'], body: `<table><tr><th>Intervall</th><th>Halbtöne</th><th>Beispiel</th><th>Hör-Anker</th></tr><tr><td>kleine Sekunde</td><td>1</td><td>e–f</td><td>Der weiße Hai</td></tr><tr><td>große Sekunde</td><td>2</td><td>c–d</td><td>Alle meine Entchen</td></tr><tr><td>kleine Terz</td><td>3</td><td>a–c</td><td>Kuckuck (abwärts)</td></tr><tr><td>große Terz</td><td>4</td><td>c–e</td><td>Oh, when the saints</td></tr><tr><td>reine Quarte</td><td>5</td><td>c–f</td><td>Oh Tannenbaum</td></tr><tr><td>Tritonus</td><td>6</td><td>f–h</td><td>Maria (West Side Story)</td></tr><tr><td>reine Quinte</td><td>7</td><td>c–g</td><td>Star Wars</td></tr><tr><td>kleine Sexte</td><td>8</td><td>e–c</td><td>Love Story (Where do I begin)</td></tr><tr><td>große Sexte</td><td>9</td><td>c–a</td><td>My Bonnie</td></tr><tr><td>kleine Septime</td><td>10</td><td>c–b</td><td>Star Trek (Originalserie)</td></tr><tr><td>große Septime</td><td>11</td><td>c–h</td><td>Take on Me (Refrain)</td></tr><tr><td>Oktave</td><td>12</td><td>c–c</td><td>Somewhere over the Rainbow</td></tr></table><p>Erst Stammtöne zählen (Zahl), dann Halbtöne (Art). Umkehrung: Zahlen ergeben 9, groß ↔ klein, rein bleibt rein.</p>` },
  { id: 'akkorde', title: 'Dreiklänge und Umkehrungen', sub: 'Dur, Moll, vermindert, übermäßig', icon: 'chord', after: '4.3', lessons: ['4.1', '4.2', '4.3'], body: `<table><tr><th>Typ</th><th>Terzen</th><th>auf c</th></tr><tr><td>Dur</td><td>groß + klein</td><td>c e g</td></tr><tr><td>Moll</td><td>klein + groß</td><td>c es g</td></tr><tr><td>vermindert</td><td>klein + klein</td><td>c es ges</td></tr><tr><td>übermäßig</td><td>groß + groß</td><td>c e gis</td></tr></table>[[0]]<p><b>Umkehrungen:</b> Grundstellung (Grundton unten) – Sextakkord (Terz unten) – Quartsextakkord (Quinte unten). Grundton finden: in Terzen schichten.</p>`, figs: [F.s([{ r: '(C4 E4 G4)/h (E4 G4 C5)/h' }, { r: '(G4 C5 E5)/h (C5 E5 G5)/h', end: '|.' }], { time: 'C', bpm: 60, cap: 'C-Dur: Grundstellung – Sextakkord – Quartsextakkord – Grundstellung.' })] },
  { id: 'symbole', title: 'Akkordsymbole', sub: 'Am, G7, Cmaj7, Dsus4, C/E', icon: 'chord', after: '4.4', body: `<table><tr><th>Symbol</th><th>Bedeutung</th><th>Töne</th></tr><tr><td>C</td><td>Dur</td><td>c e g</td></tr><tr><td>Cm</td><td>Moll</td><td>c es g</td></tr><tr><td>C7</td><td>Dur + kleine Septime</td><td>c e g b</td></tr><tr><td>Cmaj7</td><td>Dur + große Septime</td><td>c e g h</td></tr><tr><td>Cm7</td><td>Moll + kleine Septime</td><td>c es g b</td></tr><tr><td>C° / Cdim</td><td>vermindert</td><td>c es ges</td></tr><tr><td>C+ / Caug</td><td>übermäßig</td><td>c e gis</td></tr><tr><td>Csus4 / Csus2</td><td>Quarte / Sekunde statt Terz</td><td>c f g / c d g</td></tr><tr><td>Cadd9</td><td>Dur + None</td><td>c e g d</td></tr><tr><td>C/E</td><td>C mit e im Bass</td><td>e – c e g</td></tr></table>${F.warn('<b>B/H-Falle:</b> International ist B = deutsches H, B♭ (Bb) = deutsches B.')}` },
  { id: 'stufen', title: 'Stufen und Funktionen', sub: 'Die Akkorde einer Tonart', icon: 'chord', after: '4.5', body: `<table><tr><th>Stufe</th><th>I</th><th>ii</th><th>iii</th><th>IV</th><th>V</th><th>vi</th><th>vii°</th></tr><tr><td>C-Dur</td><td>C</td><td>Dm</td><td>Em</td><td>F</td><td>G</td><td>Am</td><td>H°</td></tr><tr><td>G-Dur</td><td>G</td><td>Am</td><td>Hm</td><td>C</td><td>D</td><td>Em</td><td>Fis°</td></tr><tr><td>F-Dur</td><td>F</td><td>Gm</td><td>Am</td><td>B</td><td>C</td><td>Dm</td><td>E°</td></tr><tr><td>a-Moll</td><td>Am</td><td>H°</td><td>C</td><td>Dm</td><td><b>E</b></td><td>F</td><td>G (Gis°)</td></tr></table><p><b>Tonika</b> (I) = Ruhe · <b>Subdominante</b> (IV) = Aufbruch · <b>Dominante</b> (V) = Spannung → Tonika.</p>` },
  { id: 'folgen', title: 'Akkordfolgen', sub: 'Kadenz, Pop, Jazz, Kanon', icon: 'chord', after: '4.6', body: `<table><tr><th>Name</th><th>Stufen</th><th>in C</th></tr><tr><td>Kadenz</td><td>I – IV – V – I</td><td>C F G C</td></tr><tr><td>Pop</td><td>I – V – vi – IV</td><td>C G Am F</td></tr><tr><td>Pop in Moll begonnen</td><td>vi – IV – I – V</td><td>Am F C G</td></tr><tr><td>Jazz</td><td>ii – V – I</td><td>Dm7 G7 Cmaj7</td></tr><tr><td>Kanon (Pachelbel)</td><td>I V vi iii IV I IV V</td><td>C G Am Em F C F G</td></tr><tr><td>Moll-Pop</td><td>i – VI – III – VII</td><td>Am F C G</td></tr></table><p><b>Nächste Lage:</b> gemeinsame Töne liegen lassen, die anderen kleinstmöglich bewegen.</p>` },
  { id: 'leadsheet', title: 'Lead Sheet und Begleitmuster', sub: 'Lieder aus Akkordsymbolen spielen', icon: 'quill', after: '4.8', lessons: ['4.7', '4.8'], body: `<p><b>Methode:</b> Tonart/Takt → Akkorde als Griffe → Melodie → zusammen: Stufe 1 Grundton · Stufe 2 Griff · Stufe 3 Muster.</p><table><tr><th>Muster</th><th>So geht es</th><th>passt zu</th></tr><tr><td>Walzer</td><td>Bass – Akkord – Akkord</td><td>3/4</td></tr><tr><td>Alberti</td><td>tief – hoch – mitte – hoch</td><td>Klassik</td></tr><tr><td>gebrochen</td><td>1 – 5 – 8 – 10 (Achtel)</td><td>Balladen</td></tr><tr><td>Stride</td><td>Bass – Akkord – Bass – Akkord</td><td>Ragtime, Swing</td></tr><tr><td>Neoklassik</td><td>1 – 5 – 9 – 10, Pedal</td><td>Einaudi & Co.</td></tr></table>` },
  { id: 'ausdruck', title: 'Dynamik und Artikulation', sub: 'Lautstärke und Aussprache', icon: 'quill', after: '5.2', lessons: ['5.1', '5.2'], body: `<p class="dyn" style="font-size:1.3em;text-align:center">pp · p · mp · mf · f · ff</p><table><tr><th>Zeichen</th><th>Bedeutung</th></tr><tr><td>cresc. / &lt;</td><td>lauter werden</td></tr><tr><td>dim. / decresc. / &gt;</td><td>leiser werden</td></tr><tr><td>sf, sfz</td><td>einzeln stark betont</td></tr><tr><td>fp</td><td>laut, sofort leise</td></tr><tr><td>Punkt</td><td>staccato</td></tr><tr><td>Strich</td><td>tenuto</td></tr><tr><td>&gt;</td><td>Akzent</td></tr><tr><td>^</td><td>marcato</td></tr><tr><td>Bogen</td><td>legato</td></tr></table><p>Lautstärke = Geschwindigkeit der Taste, nicht Druck. Staccato = kurz, nicht laut.</p>` },
  { id: 'vortrag', title: 'Vortragsbezeichnungen', sub: 'Charakter und Tempoänderungen', icon: 'quill', after: '5.3', body: `<table><tr><th>Wort</th><th>Bedeutung</th><th>Wort</th><th>Bedeutung</th></tr><tr><td>dolce</td><td>zart</td><td>rit./rall.</td><td>langsamer</td></tr><tr><td>cantabile</td><td>singend</td><td>accel.</td><td>schneller</td></tr><tr><td>espressivo</td><td>ausdrucksvoll</td><td>a tempo</td><td>Grundtempo</td></tr><tr><td>leggiero</td><td>leicht</td><td>Tempo I</td><td>Anfangstempo</td></tr><tr><td>grazioso</td><td>anmutig</td><td>rubato</td><td>frei</td></tr><tr><td>maestoso</td><td>majestätisch</td><td>morendo</td><td>ersterbend</td></tr><tr><td>con brio</td><td>mit Feuer</td><td>sempre</td><td>immer</td></tr><tr><td>agitato</td><td>aufgeregt</td><td>subito</td><td>plötzlich</td></tr><tr><td>tranquillo</td><td>ruhig</td><td>poco a poco</td><td>nach und nach</td></tr></table>` },
  { id: 'pedal', title: 'Das Pedal', sub: 'Synkopiert nach Harmonie', icon: 'pedal', after: '5.4', body: `<ol><li>Anschlagen.</li><li>Direkt danach Pedal hoch …</li><li>… und sofort wieder runter.</li></ol><p><b>Wechseln, wenn sich die Harmonie ändert.</b> Ferse am Boden.</p>[[0]]<table><tr><th>Pedal</th><th>Wirkung</th><th>Zeichen</th></tr><tr><td>rechts</td><td>Halten, Mitschwingen</td><td>Ped. … ✱</td></tr><tr><td>links</td><td>leiser, weicher</td><td>una corda … tre corde</td></tr><tr><td>Mitte (Flügel)</td><td>hält nur gedrückte Töne</td><td>Sost. Ped.</td></tr></table>`, figs: [F.s([{ r: '(E4 G4 C5)/h!pd (F4 A4 C5)/h!pc', l: 'C3/h F3/h' }, { r: '(D4 G4 B4)/h!pc (E4 G4 C5)/h!pc!pu', l: 'G2/h C3/h', end: '|.' }], { grand: true, time: 'C', bpm: 60, cap: 'Pedal bei jedem Akkord neu.' })] },
  { id: 'gestaltung', title: 'Melodie, Voicing, Phrase', sub: 'Aus Noten Musik machen', icon: 'ear', after: '5.6', lessons: ['5.5', '5.6'], body: `<ul><li><b>Voicing:</b> Melodie ca. zwei Stufen lauter als Begleitung. In einer Hand: Gewicht zum Melodiefinger.</li><li><b>Phrase:</b> 2/4/8 Takte, Anfang – Höhepunkt – Ende. Ende leiser.</li><li><b>Periode:</b> Frage (Halbschluss) + Antwort (Ganzschluss).</li><li><b>Atmen</b> zwischen Phrasen, ohne den Puls zu brechen.</li><li><b>Seufzer:</b> betont – leicht.</li><li><b>Werkzeug:</b> Melodie singen – wo du atmest, endet die Phrase.</li></ul>` },
  { id: 'lesen-profi', title: 'Lesen wie ein Profi', sub: 'Hilfslinien, Sprünge, Stimmen', icon: 'staff', after: '6.3', lessons: ['6.1', '6.2', '6.3'], body: `<table><tr><th>Anker</th><th>Violinschlüssel</th><th>Bassschlüssel</th></tr><tr><td>1. Hilfslinie oben</td><td>a²</td><td>c¹</td></tr><tr><td>2. Hilfslinie oben</td><td>c³</td><td>e¹</td></tr><tr><td>1. Hilfslinie unten</td><td>c¹</td><td>E</td></tr><tr><td>2. Hilfslinie unten</td><td>a</td><td>C</td></tr></table><p><b>8va</b> = Oktave höher, <b>8vb</b> = tiefer, <b>loco</b> = normal.</p><table><tr><th>Zeichen</th><th>Bedeutung</th></tr><tr><td>|: :|</td><td>wiederholen</td></tr><tr><td>1. / 2. Klammer</td><td>erst 1., beim zweiten Mal 2.</td></tr><tr><td>D.C. al Fine</td><td>zum Anfang, bis Fine</td></tr><tr><td>D.S. al Coda</td><td>zum 𝄋, bis 𝄌, dann Coda</td></tr></table><p><b>Zwei Stimmen:</b> Hälse oben = obere Stimme, unten = untere. Haltetöne halten!</p>` },
  { id: 'rhythmus2', title: 'Triolen und 6/8', sub: 'Dreigeteilte Schläge', icon: 'clock', after: '6.4', body: `<table><tr><th>Takt</th><th>Schläge</th><th>Zählen</th></tr><tr><td>6/8</td><td>2 × ♩.</td><td><b>1</b> 2 3 <b>4</b> 5 6</td></tr><tr><td>9/8</td><td>3 × ♩.</td><td><b>1</b>-2-3 <b>4</b>-5-6 <b>7</b>-8-9</td></tr><tr><td>12/8</td><td>4 × ♩.</td><td>vier Dreiergruppen</td></tr><tr><td>3/8</td><td>1 × ♩.</td><td><b>1</b> 2 3</td></tr></table><p><b>Triole</b>: drei in der Zeit von zwei – „1-ta-te“. <b>Drei gegen zwei</b>: Die erste Note fällt zusammen.</p>[[0]]`, figs: [F.s([{ r: 'C4/8!3( E4/8 G4/8!3) C5/8!3( G4/8 E4/8!3)', l: 'C3/8 G3/8 C3/8 G3/8' }], { grand: true, time: '2/4', bpm: 60, cap: 'Drei gegen zwei.' })] },
  { id: 'verzierungen', title: 'Verzierungen', sub: 'Pralltriller, Mordent, Triller, Doppelschlag', icon: 'quill', after: '6.6', body: `[[0]]<table><tr><th>Zeichen</th><th>ausgeführt (auf c²)</th></tr><tr><td>Pralltriller</td><td>c – d – c</td></tr><tr><td>Mordent</td><td>c – h – c</td></tr><tr><td>Triller</td><td>(d) c d c d … (Barock: oben beginnen)</td></tr><tr><td>Doppelschlag</td><td>d – c – h – c</td></tr><tr><td>Vorschlag mit Strich</td><td>ganz kurz davor</td></tr><tr><td>Vorschlag ohne Strich</td><td>betont, nimmt Zeit weg</td></tr><tr><td>Wellenlinie</td><td>Arpeggio von unten</td></tr></table><p>Erst ohne Verzierung lernen, dann ausgeschrieben üben, dann einbauen. Nebennoten folgen der Tonart.</p>`, figs: [F.s([{ r: 'C5/q!o=prall C5/q!o=mord C5/q!o=tr C5/q!o=turn', end: '|.' }], { time: 'C', play: false })] },
  { id: 'blattspiel', title: 'Blattspiel', sub: 'Der 30-Sekunden-Check', icon: 'ear', after: '6.7', body: `<ol><li>Tonart und Taktart</li><li>Tempo wählen – lieber zu langsam</li><li>Lage: höchster und tiefster Ton</li><li>Wiederholungen, Sprünge, 8va</li><li>Schwierige Stellen ansehen</li><li>Muster finden: Tonleitern, Dreiklänge, Sequenzen</li></ol><p><b>Beim Spielen:</b> vorausschauen, nie anhalten, vereinfachen erlaubt.</p>` },
  { id: 'septakkorde', title: 'Septakkorde', sub: 'Fünf Typen und ihre Stufen', icon: 'chord', after: '7.1', body: `[[0]]<table><tr><th>Symbol</th><th>Bauplan</th><th>Stufe in Dur</th></tr><tr><td>maj7</td><td>Dur + große Septime</td><td>I, IV</td></tr><tr><td>m7</td><td>Moll + kleine Septime</td><td>ii, iii, vi</td></tr><tr><td>7</td><td>Dur + kleine Septime</td><td>V</td></tr><tr><td>m7♭5 (ø)</td><td>vermindert + kleine Septime</td><td>vii</td></tr><tr><td>°7</td><td>nur kleine Terzen</td><td>vii in Moll</td></tr></table><p><b>V7 → I:</b> Leitton hoch, Septime runter.</p>`, figs: [F.s([{ r: '(C4 E4 G4 B4)/q (C4 Eb4 G4 Bb4)/q (C4 E4 G4 Bb4)/q (C4 Eb4 Gb4 Bb4)/q', chords: [[0, 'maj7'], [1, 'm7'], [2, '7'], [3, 'm7♭5']] }], { time: 'C', bpm: 50 })] },
  { id: 'schluesse', title: 'Schlüsse und Kadenzen', sub: 'Die Satzzeichen der Musik', icon: 'chord', after: '7.2', body: `<table><tr><th>Schluss</th><th>Akkorde</th><th>wirkt wie</th></tr><tr><td>Ganzschluss</td><td>V → I</td><td>Punkt</td></tr><tr><td>Halbschluss</td><td>→ V</td><td>Komma</td></tr><tr><td>Plagalschluss</td><td>IV → I</td><td>Amen</td></tr><tr><td>Trugschluss</td><td>V → vi</td><td>Überraschung</td></tr><tr><td>mit Quartsextvorhalt</td><td>I⁶₄ – V7 – I</td><td>klassischer Schluss</td></tr></table>` },
  { id: 'harmonik-weiter', title: 'Zwischendominanten und Modulation', sub: 'Fremde Töne mit System', icon: 'circle', after: '7.3', body: `<table><tr><th>in C</th><th>V7/ii</th><th>V7/iii</th><th>V7/IV</th><th>V7/V</th><th>V7/vi</th></tr><tr><td>Akkord</td><td>A7</td><td>H7</td><td>C7</td><td>D7</td><td>E7</td></tr><tr><td>fremder Ton</td><td>cis</td><td>dis</td><td>b</td><td>fis</td><td>gis</td></tr></table><p><b>Modulation:</b> Drehpunktakkord → Dominante der neuen Tonart → Ganzschluss. Dur → Dominante, Moll → Parallele.</p>` },
  { id: 'sonderakkorde', title: 'Besondere Akkorde', sub: '°7, Neapolitaner, Orgelpunkt, Vorhalt', icon: 'chord', after: '7.4', body: `<ul><li><b>Verminderter Septakkord</b> (gis h d f): Dominante ohne Grundton; nur 3 verschiedene.</li><li><b>Neapolitaner N⁶</b>: Dur auf tiefer II in Moll, Terz im Bass (c-Moll: Des/F), steht vor V.</li><li><b>Orgelpunkt</b>: liegender Bass unter wechselnden Akkorden.</li><li><b>Vorhalt</b>: verspätete Auflösung (sus4 → 3, I⁶₄ → V).</li></ul><p><b>Mondscheinsonate T. 1–5:</b> i – i/H – VI – N⁶ – V – i, Bass cis h a fis gis cis.</p>` },
  { id: 'analyse', title: 'Analyse in fünf Schritten', sub: 'Erst verstehen, dann spielen', icon: 'form', after: '7.5', body: `<ol><li>Rahmen: Tonart, Takt, Tempo, Charakter</li><li>Form: A, B, A′ …</li><li>Phrasen und Schlüsse</li><li>Harmonien Takt für Takt (Arpeggien zu Griffen)</li><li>Besonderheiten: Modulation, Orgelpunkt, Höhepunkt</li></ol><p><b>Bach, Präludium C-Dur T. 1–11:</b> C – Dm7/C – G7/H – C – Am/C – D7/C – G/H – Cmaj7/H – Am7 – D7 – G.</p>` },
  { id: 'neoklassik', title: 'Neoklassik', sub: 'Einaudi, Tony Ann, Alcocer', icon: 'ear', after: '7.6', body: `<ul><li>Wenige Akkorde, oft <b>vi – IV – I – V</b></li><li><b>Ostinato</b> links, weit gebrochen (1 – 5 – 9 – 10)</li><li>Farben: <b>add9, sus2, sus4</b>, Slash-Akkorde</li><li>Orgelpunkte, lange Pedalflächen</li><li>Dynamik als Form: anschwellen und zurück</li></ul><p>Originalnoten kaufen, keine Easy-Versionen. Vor dem Üben: Ostinato-Akkorde bestimmen.</p>` },
  { id: 'formen', title: 'Musikalische Formen', sub: 'Von A B A bis Sonatensatz', icon: 'form', after: '8.1', body: `<table><tr><th>Form</th><th>Schema</th><th>Beispiel</th></tr><tr><td>zweiteilig</td><td>|: A :|: B :|</td><td>Menuett G-Dur</td></tr><tr><td>Liedform</td><td>A B A</td><td>Pathétique II</td></tr><tr><td>Menuett + Trio</td><td>M – T – M</td><td>Sonatinen</td></tr><tr><td>Rondo</td><td>A B A C A</td><td>Für Elise</td></tr><tr><td>Variation</td><td>A A′ A″ …</td><td>KV 331, 1. Satz</td></tr><tr><td>Sonatensatz</td><td>Exposition – Durchführung – Reprise</td><td>KV 545, 1. Satz</td></tr><tr><td>Fuge/Invention</td><td>Thema durch alle Stimmen</td><td>Bach</td></tr></table>` },
  { id: 'epochen', title: 'Stilepochen', sub: 'Und wie man sie spielt', icon: 'form', after: '8.2', body: `<table><tr><th>Epoche</th><th>Zeit</th><th>Spielweise</th></tr><tr><td>Barock</td><td>1600–1750</td><td>klar, kaum Pedal, Terrassendynamik</td></tr><tr><td>Klassik</td><td>1750–1820</td><td>leicht, elegant, klare Phrasen</td></tr><tr><td>Romantik</td><td>1820–1900</td><td>singend, Pedal, Rubato</td></tr><tr><td>Impressionismus</td><td>1890–1920</td><td>Farben, Pedalwolken</td></tr><tr><td>Ragtime</td><td>um 1900</td><td>streng im Takt, synkopiert</td></tr><tr><td>Neoklassik</td><td>heute</td><td>Ostinato, Pedalflächen, Dynamikbögen</td></tr></table>` },
  { id: 'buehne', title: 'Üben, Auswendig, Bühne', sub: 'Die Profi-Methoden', icon: 'hand', after: '8.6', lessons: ['8.3', '8.4', '8.5', '8.6'], body: `<p><b>Neues Stück:</b> Analyse → Fingersatz fest → schwerste Stellen zuerst → kleine Abschnitte → verketten → durchspielen.</p><p><b>Werkzeuge:</b> Rhythmusvarianten · Stopp-Methode · Rückwärts-Verketten · Sprünge stumm · verteiltes und abwechselndes Üben.</p><p><b>Auswendig:</b> Finger, Ohr, Auge, Analyse · Einstiegspunkte · mentales Üben · jede Hand allein.</p><p><b>Bühne:</b> Probe-Vorspiele · Ritual · Atmen 4 ein / 6 aus · langsamer beginnen · bei Fehlern weiter.</p>` }
);

/* ===== Notenweg 3 · Wissensfragen (Pools). Jede Frage hat eine richtige Antwort (a) und plausible Distraktoren (w). ===== */
Object.assign(CUR.pools, {
  tastatur: [
    { q: 'Wie viele Tasten hat ein normales Klavier?', a: '88', w: ['76', '64', '96', '100'], e: '88 Tasten: 52 weiße und 36 schwarze.' },
    { q: 'Wo liegt jedes C?', a: 'direkt links neben der Zweiergruppe schwarzer Tasten', w: ['direkt links neben der Dreiergruppe', 'zwischen den zwei schwarzen Tasten', 'direkt rechts neben der Dreiergruppe'], e: 'C: links neben der Zweiergruppe. F: links neben der Dreiergruppe.' },
    { q: 'Wo liegt jedes F?', a: 'direkt links neben der Dreiergruppe', w: ['direkt links neben der Zweiergruppe', 'in der Mitte der Dreiergruppe', 'direkt rechts neben der Zweiergruppe'], e: 'F liegt links neben der Dreiergruppe, E rechts neben der Zweiergruppe.' },
    { q: 'Wie heißt der Ton, der international „B“ genannt wird, auf Deutsch?', a: 'H', w: ['B', 'Bes', 'Hes'], e: 'Deutsch H = international B. Das deutsche b ist international B♭.' },
    { q: 'Wie heißt das mittlere C in deutscher Schreibweise?', a: 'c¹ (eingestrichenes c)', w: ['C (großes C)', 'c (kleines c)', 'c² (zweigestrichenes c)'], e: 'Das mittlere C ist c¹, international C4.' },
    { q: 'Wie viele Halbtöne hat eine Oktave?', a: '12', w: ['7', '8', '10'], e: '7 weiße + 5 schwarze Tasten = 12 Halbtöne.' },
    { q: 'Was ist international „C5“ in deutscher Schreibweise?', a: 'c²', w: ['c¹', 'c³', 'C'], e: 'C4 = c¹, also C5 = c² (eine Oktave höher).' },
    { q: 'Welche Reihenfolge haben die Stammtöne?', a: 'c d e f g a h', w: ['c d e f g h a', 'a b c d e f g', 'c d e f g a b'], e: 'Deutsche Reihenfolge: c d e f g a h – dann wieder c.' },
    { q: 'Welcher Ton liegt zwischen den beiden Tasten der Zweiergruppe?', a: 'd', w: ['c', 'e', 'g'], e: 'Zweiergruppe: c – (cis) – d – (dis) – e. d sitzt genau in der Mitte.' },
    { q: 'Was bedeutet die Zahl beim Stimmton „a¹ = 440 Hz“?', a: 'Die Saite schwingt 440-mal pro Sekunde.', w: ['Das Klavier hat 440 Saiten.', 'Der Ton ist 440 Millisekunden lang.', 'So laut ist der Ton in Dezibel.'], e: 'Hertz = Schwingungen pro Sekunde. Eine Oktave höher (a²) = doppelt so viele.' }
  ],
  haltung: [
    { q: 'Wie sollen die Unterarme beim Spielen ungefähr liegen?', a: 'etwa waagerecht, Ellbogen auf Tastenhöhe', w: ['deutlich nach oben zu den Tasten', 'steil nach unten hängend', 'an den Körper gepresst'], e: 'Waagerechte Unterarme lassen das Armgewicht frei in die Tasten fließen.' },
    { q: 'Womit spielt der Finger die Taste?', a: 'mit der Fingerkuppe, Finger gebogen', w: ['mit dem flachen Finger', 'mit dem Fingernagel', 'mit dem ganzen Finger ausgestreckt'], e: 'Runde Hand, gebogene Finger, Kuppen.' },
    { q: 'Woher kommt ein runder, voller Ton?', a: 'aus dem Gewicht des Arms', w: ['aus möglichst viel Fingerkraft', 'aus einem steifen Handgelenk', 'aus dem Schultern-Hochziehen'], e: 'Gewicht statt Druck: Der Arm hängt an der Fingerkuppe.' },
    { q: 'Was tust du, wenn beim Üben Hand oder Unterarm ziehen oder schmerzen?', a: 'sofort aufhören und Pause machen', w: ['kurz weiterspielen, das vergeht', 'langsamer, aber weiterspielen', 'mit mehr Kraft spielen'], e: 'Schmerz ist ein Stopp-Signal. Bei anhaltenden Beschwerden ärztlich abklären lassen.' },
    { q: 'Wo sitzt du auf der Klavierbank?', a: 'auf der vorderen Hälfte', w: ['ganz hinten angelehnt', 'auf der Kante, Füße unter der Bank', 'egal, Hauptsache bequem'], e: 'Vordere Hälfte, Füße flach am Boden – so ist der Rücken frei beweglich.' },
    { q: 'Wie spielt der Daumen?', a: 'mit der Außenkante', w: ['flach mit der ganzen Unterseite', 'mit der Spitze des Nagels', 'gar nicht, der Daumen ruht'], e: 'Der Daumen spielt seitlich mit der Außenkante.' },
    { q: 'Wie viel Abstand zum Klavier?', a: 'so, dass die Ellbogen leicht vor dem Körper frei schwingen können', w: ['so nah, dass die Ellbogen den Bauch berühren', 'so weit, dass die Arme ganz gestreckt sind', 'egal'], e: 'Freie Ellbogen = freie Bewegung.' },
    { q: 'Was bedeutet „legato“?', a: 'gebunden, ohne Lücke zwischen den Tönen', w: ['kurz und abgehackt', 'sehr laut', 'langsam werden'], e: 'Legato: Die nächste Taste geht runter, wenn die vorige hochkommt.' },
    { q: 'Rechte Hand in der C-Lage: Welcher Finger liegt auf c¹?', a: '1 (Daumen)', w: ['5', '3', '2'], e: 'Rechts: 1 auf c¹ bis 5 auf g¹.' },
    { q: 'Linke Hand in der C-Lage (c bis g): Welcher Finger liegt auf c?', a: '5 (kleiner Finger)', w: ['1', '3', '4'], e: 'Links gespiegelt: 5 auf c, 1 auf g.' },
    { q: 'Wie lange am Stück sollte man höchstens ohne Pause üben?', a: 'etwa 60 Minuten – besser nach 25–30 Minuten kurz unterbrechen', w: ['3 Stunden', 'so lange es Spaß macht, ohne Pause', '10 Minuten'], e: 'Kurze Pausen schützen die Hände und helfen beim Behalten.' }
  ],
  rhythmus1: [
    { q: 'Wie viele Viertel passen in eine ganze Note?', a: '4', w: ['2', '3', '8'], e: 'Ganze = 4 Viertel.' },
    { q: 'Was bedeutet das große C statt einer Taktangabe?', a: '4/4-Takt', w: ['3/4-Takt', 'C-Dur', 'Crescendo'], e: 'C (common time) = 4/4.' },
    { q: 'Wie zählt man eine halbe Note, die auf Schlag 3 beginnt?', a: '„drei – vier“, Taste gehalten', w: ['nur „drei“', '„drei – vier – eins“', 'gar nicht, sie ist kurz'], e: 'Halbe = 2 Schläge: 3 und 4.' },
    { q: 'Was passiert mit dem Puls, wenn eine lange Note kommt?', a: 'Er läuft gleichmäßig weiter.', w: ['Er wird langsamer.', 'Er bleibt kurz stehen.', 'Er wird schneller.'], e: 'Der Puls hält nie an.' },
    { q: 'Welcher Schlag ist im 4/4-Takt am stärksten betont?', a: 'der erste', w: ['der zweite', 'der vierte', 'alle gleich'], e: 'EINS zwei drei vier – Schwerpunkt auf 1, leichter auf 3.' },
    { q: 'Was zeigt der Doppelstrich mit dickem zweiten Strich?', a: 'das Ende des Stücks', w: ['eine Wiederholung', 'eine Pause', 'den Anfang'], e: 'Schlussstrich.' }
  ],
  system: [
    { q: 'Wie werden die Linien des Notensystems gezählt?', a: 'von unten nach oben, 1 bis 5', w: ['von oben nach unten', 'von links nach rechts', 'nur die Zwischenräume werden gezählt'], e: 'Unterste Linie = 1. Linie.' },
    { q: 'Um welche Linie wickelt sich der Violinschlüssel?', a: 'um die 2. Linie – dort liegt g¹', w: ['um die 3. Linie – dort liegt h¹', 'um die 4. Linie – dort liegt f', 'um die 1. Linie – dort liegt e¹'], e: 'G-Schlüssel: Spirale um die 2. Linie = g¹.' },
    { q: 'Welche Töne liegen im Violinschlüssel auf den fünf Linien (von unten)?', a: 'e¹ g¹ h¹ d² f²', w: ['f¹ a¹ c² e²', 'g¹ h¹ d² f² a²', 'c¹ e¹ g¹ h¹ d²'], e: 'Linien: e g h d f. Zwischenräume: f a c e.' },
    { q: 'Welche Töne liegen in den Zwischenräumen des Violinschlüssels (von unten)?', a: 'f¹ a¹ c² e²', w: ['e¹ g¹ h¹ d²', 'g¹ h¹ d² f²', 'a¹ c² e² g²'], e: 'f – a – c – e.' },
    { q: 'Wo steht c¹ im Violinschlüssel?', a: 'auf der ersten Hilfslinie unter dem System', w: ['im 3. Zwischenraum', 'auf der 1. Linie', 'über dem System'], e: 'c¹: erste Hilfslinie unten. c² liegt im 3. Zwischenraum.' },
    { q: 'Was sind Hilfslinien?', a: 'kurze Zusatzlinien für Töne über oder unter dem System', w: ['Linien, die das Stück in Abschnitte teilen', 'Linien für den Fingersatz', 'die Taktstriche'], e: 'Hilfslinien verlängern das System nach oben und unten.' },
    { q: 'Eine Note sitzt im 3. Zwischenraum (Violinschlüssel). Welcher Anker ist das?', a: 'c²', w: ['g¹', 'c¹', 'g²'], e: 'Anker: c¹, g¹, c², g².' }
  ],
  bass: [
    { q: 'Welche Linie umschließen die zwei Punkte des Bassschlüssels?', a: 'die 4. Linie – dort liegt f', w: ['die 3. Linie – dort liegt d', 'die 2. Linie – dort liegt H', 'die 5. Linie – dort liegt a'], e: 'F-Schlüssel: Punkte um die 4. Linie = kleines f.' },
    { q: 'Welche Töne liegen im Bassschlüssel auf den Linien (von unten)?', a: 'G H d f a', w: ['A c e g', 'E G H d f', 'F A c e g'], e: 'Linien G H d f a, Zwischenräume A c e g.' },
    { q: 'Wo steht c¹ im Bassschlüssel?', a: 'auf der ersten Hilfslinie über dem System', w: ['im 2. Zwischenraum', 'auf der 5. Linie', 'auf der ersten Hilfslinie unten'], e: 'c¹ liegt zwischen den Systemen: im Bass oben, im Violinschlüssel unten.' },
    { q: 'Welcher Ton liegt im 2. Zwischenraum des Bassschlüssels?', a: 'c (kleines c)', w: ['c¹', 'C (großes C)', 'e'], e: 'c im 2. Zwischenraum ist ein wichtiger Anker – Start der C-Lage links.' },
    { q: 'Welcher Ton liegt auf der untersten Linie des Bassschlüssels?', a: 'G (großes G)', w: ['E', 'F', 'A'], e: 'Unterste Linie: G.' }
  ],
  grand: [
    { q: 'Was erklingt bei zwei übereinanderstehenden Noten (oben und unten in der Akkolade)?', a: 'beide gleichzeitig', w: ['erst oben, dann unten', 'erst unten, dann oben', 'nur die obere'], e: 'Senkrecht = gleichzeitig, waagerecht = nacheinander.' },
    { q: 'Wie heißt die Klammer, die die beiden Systeme verbindet?', a: 'Akkolade', w: ['Fermate', 'Legatobogen', 'Volta'], e: 'Akkolade = die zusammengehörigen Systeme mit der geschweiften Klammer.' },
    { q: 'Wie übst du ein neues Stück mit zwei Händen am besten?', a: 'rechts allein, links allein, dann zusammen sehr langsam', w: ['sofort zusammen im Originaltempo', 'nur die rechte Hand, die linke ergibt sich', 'zusammen schnell, Fehler korrigieren sich'], e: 'Getrennt, dann zusammen langsam – Abschnitt für Abschnitt.' },
    { q: 'Wo steht das mittlere C in der Akkolade?', a: 'zwischen den Systemen – je eine Hilfslinie', w: ['auf der Mittellinie des oberen Systems', 'auf der untersten Linie unten', 'nur im Bassschlüssel'], e: 'c¹ kann in beiden Systemen geschrieben werden.' }
  ],
  grund: [
    { q: 'Was ist eine Fünftonlage?', a: 'fünf Finger auf fünf benachbarten Tasten, ohne die Hand zu bewegen', w: ['eine Tonleiter mit fünf Tönen', 'fünf Töne gleichzeitig', 'ein Stück mit fünf Takten'], e: 'Lage = feste Handposition.' },
    { q: 'Was bedeutet ♮?', a: 'Auflösungszeichen: ♯ oder ♭ gilt nicht mehr', w: ['Kreuz', 'B', 'Pause'], e: '♮ stellt den Stammton wieder her.' },
    { q: 'Wo gibt es zwischen zwei weißen Tasten keine schwarze?', a: 'zwischen e–f und h–c', w: ['zwischen c–d und f–g', 'zwischen a–h und d–e', 'nirgends'], e: 'Die natürlichen Halbtöne.' },
    { q: 'Wie viele Schläge hat eine ganze Note im 4/4-Takt?', a: '4', w: ['1', '2', '3'], e: 'Ganze = 4.' },
    { q: 'Was zählt beim Bestimmen eines Intervalls mit?', a: 'beide Töne – c bis e ist eine Terz', w: ['nur die Töne dazwischen', 'nur der obere Ton', 'nur die schwarzen Tasten'], e: 'c (1) – d (2) – e (3) = Terz.' },
    { q: 'Was liest ein guter Notenleser zuerst?', a: 'einen Ankerton – dann die Bewegung (Schritt/Sprung)', w: ['jeden Notennamen einzeln von unten abgezählt', 'nur die Fingersätze', 'die Taktnummern'], e: 'Anker → Intervall → Finger.' }
  ],
  pausen: [
    { q: 'Wie sieht die ganze Pause aus?', a: 'ein Balken, der unter der 4. Linie hängt', w: ['ein Balken, der auf der 3. Linie liegt', 'ein Zickzack', 'eine kleine 7'], e: 'Ganze Pause hängt, halbe Pause sitzt.' },
    { q: 'Was bedeutet eine ganze Pause mitten in einem 3/4-Takt?', a: 'der ganze Takt ist still', w: ['vier Schläge Pause', 'eine Fermate', 'das Stück ist zu Ende'], e: 'Die ganze Pause steht auch für eine Ganztaktpause in jeder Taktart.' },
    { q: 'Was macht die Hand in einer Pause?', a: 'Taste loslassen, Hand bleibt bereit über den Tasten', w: ['Taste weiter halten', 'Hand in den Schoß legen', 'schon den nächsten Ton spielen'], e: 'Stille ist hörbar – und der nächste Ton wird vorbereitet.' },
    { q: 'Wie lange dauert eine Viertelpause?', a: '1 Schlag', w: ['½ Schlag', '2 Schläge', '4 Schläge'], e: 'Gleich lang wie eine Viertelnote.' }
  ],
  takt: [
    { q: 'Was sagt die untere Zahl der Taktangabe 3/4?', a: 'Ein Schlag ist eine Viertel.', w: ['Es gibt vier Takte.', 'Jeder Takt hat vier Schläge.', 'Das Tempo ist 4.'], e: 'Oben: Anzahl, unten: Notenwert eines Schlags.' },
    { q: 'Was ist ein Auftakt?', a: 'unvollständiger erster Takt – die Melodie beginnt vor der ersten Eins', w: ['der erste volle Takt', 'eine Pause am Anfang', 'das Vorspiel des Pianisten'], e: 'Auftakt + letzter Takt = ein ganzer Takt.' },
    { q: 'Wie wird der 3/4-Takt betont?', a: 'EINS zwei drei', w: ['eins ZWEI drei', 'eins zwei DREI', 'alle gleich laut'], e: 'Schwerpunkt auf 1 – der Walzer-Schwung.' },
    { q: 'Welche Taktart passt zu einem Marsch?', a: '2/4', w: ['3/4', '6/8', '5/4'], e: 'Marsch: links-rechts, EINS zwei.' },
    { q: 'Wo beginnt man die Taktnummern bei einem Stück mit Auftakt zu zählen?', a: 'beim ersten vollen Takt', w: ['beim Auftakt', 'beim letzten Takt', 'gar nicht'], e: 'Der Auftakt bekommt die Nummer 0 bzw. keine.' }
  ],
  tempo: [
    { q: 'Was bedeutet ♩ = 80?', a: '80 Viertelnoten pro Minute', w: ['80 Takte pro Minute', 'Das Stück dauert 80 Sekunden.', 'Lautstärke 80'], e: 'Metronomangabe: Schläge pro Minute.' },
    { q: 'Bei welchem Anteil des Zieltempos beginnt die Tempo-Treppe?', a: 'etwa 55 %', w: ['100 %', '10 %', '80 %'], e: '55 %, dann +4 nach drei fehlerfreien Durchgängen.' },
    { q: 'Tempo-Treppe: Wann darfst du das Metronom erhöhen?', a: 'nach drei fehlerfreien Durchgängen hintereinander', w: ['nach jedem Durchgang', 'wenn es sich gut anfühlt', 'nach zehn Minuten'], e: '3× sauber → +4. Ein Fehler → eine Stufe zurück.' },
    { q: 'Was bedeutet „ma non troppo“?', a: 'aber nicht zu sehr', w: ['sehr viel', 'mit Pedal', 'langsamer werden'], e: 'Allegro ma non troppo = schnell, aber nicht zu schnell.' },
    { q: 'Was bedeutet „molto“?', a: 'sehr', w: ['etwas', 'weniger', 'gebunden'], e: 'Molto allegro = sehr schnell.' },
    { q: 'Welche Reihenfolge ist von langsam nach schnell richtig?', a: 'Largo – Adagio – Andante – Allegro – Presto', w: ['Adagio – Largo – Allegro – Andante – Presto', 'Andante – Largo – Adagio – Presto – Allegro', 'Presto – Allegro – Andante – Adagio – Largo'], e: 'Largo ist am langsamsten, Presto am schnellsten.' }
  ],
  methode: [
    { q: 'Du verspielst dich immer an derselben Stelle. Was hilft am meisten?', a: 'Stelle isolieren, langsam, 3× hintereinander fehlerfrei, dann wieder einbauen', w: ['jedes Mal von vorne beginnen', 'schneller drüberspielen, dann fällt es nicht auf', 'die Stelle weglassen'], e: 'Fehlerprotokoll: an der Stelle reparieren.' },
    { q: 'Was bringt mehr: 1 × 60 Minuten oder 4 × 15 Minuten über den Tag?', a: '4 × 15 Minuten (verteiltes Üben)', w: ['1 × 60 Minuten am Stück', 'beides genau gleich', 'nur am Wochenende 4 Stunden'], e: 'Verteiltes Üben festigt besser.' },
    { q: 'Warum klappt eine Stelle oft am nächsten Morgen besser?', a: 'Im Schlaf werden Bewegungsabläufe gefestigt.', w: ['Das Klavier ist morgens besser gestimmt.', 'Zufall.', 'Weil man morgens schneller spielt.'], e: 'Schlaf ist Teil des Übens.' },
    { q: 'Wie langsam übst du eine schwere Stelle?', a: 'so langsam, dass der erste Versuch fehlerfrei ist', w: ['im Originaltempo', 'so schnell wie möglich', 'mit geschlossenen Augen'], e: 'Langsam und richtig speichert das Richtige.' },
    { q: 'Was ist „mentales Üben“?', a: 'das Stück in Gedanken hören und die Bewegungen vorstellen, ohne Klavier', w: ['beim Üben an etwas anderes denken', 'nur Theorie lesen', 'Videos anschauen'], e: 'Wirkt nachweislich – besonders als Ergänzung.' },
    { q: 'Was zählt beim Üben einer Stelle?', a: 'fehlerfreie Durchgänge', w: ['möglichst viele Durchgänge, egal wie', 'die Uhrzeit', 'wie laut man spielt'], e: 'Nicht Wiederholungen zählen, sondern fehlerfreie.' },
    { q: 'Zwei Stellen sitzen halbwegs. Wie übst du weiter?', a: 'abwechselnd (A, B, A, B …) statt jede 20× am Stück', w: ['nur noch die leichtere', 'jede 50× hintereinander', 'gar nicht mehr, sie sitzen ja'], e: 'Abwechselndes Üben fühlt sich schwerer an, hält aber länger.' },
    { q: 'Was ist der beste Zeitpunkt für Wiederholungen von Gelerntem?', a: 'nach 1, 3, 7, 14 und 30 Tagen – mit wachsenden Abständen', w: ['nie, einmal gelernt reicht', 'jeden Tag gleich oft für immer', 'nur vor Prüfungen'], e: 'Wachsende Abstände (Spacing) bringen Wissen ins Langzeitgedächtnis.' },
    { q: 'Du hast Lust, ein Stück einfach durchzuspielen, obwohl zwei Stellen hängen. Sinnvoll?', a: 'Einmal zum Spaß ja – dann gezielt an den zwei Stellen arbeiten.', w: ['Ja, zehnmal hintereinander durchspielen.', 'Nein, nie durchspielen.', 'Nur mit geschlossenen Augen.'], e: 'Durchspielen zeigt den Stand, repariert aber nichts.' },
    { q: 'Was tust du nach etwa 25–30 Minuten Üben?', a: 'kurze Pause: aufstehen, Hände ausschütteln', w: ['schneller spielen', 'die Bank höher stellen', 'nichts, durchhalten'], e: 'Kurze Pausen schützen Hände und Konzentration.' },
    { q: 'Was ist das Ziel beim Blattspiel?', a: 'ohne Anhalten durchkommen – Fehler sind erlaubt', w: ['jeden Ton richtig, notfalls anhalten', 'so schnell wie möglich', 'nur die rechte Hand'], e: 'Blattspiel trainiert das Weiterlesen.' },
    { q: 'Was bringt „abrufen“ (Test) im Vergleich zu „nochmal lesen“?', a: 'Abrufen festigt Wissen deutlich stärker.', w: ['Nochmal lesen ist besser.', 'Beides bringt nichts.', 'Kein Unterschied.'], e: 'Der Testeffekt: Sich erinnern müssen ist das Training.' }
  ]
});

/* ===== Notenweg 3 · Wissen: Folien und Glossar ===== */
CUR.folios.push(
  { id: 'tastatur', title: 'Die Tastatur', sub: 'Gruppen, Stammtöne, Oktaven', icon: 'keys', after: '1.1', body: `<p><b>12 Tasten</b> wiederholen sich: 7 weiße (Stammtöne <b>c d e f g a h</b>), 5 schwarze in Gruppen zu 2 und 3.</p>[[0]]<table><tr><th>Anker</th><th>Lage</th></tr><tr><td>c</td><td>links neben der Zweiergruppe</td></tr><tr><td>f</td><td>links neben der Dreiergruppe</td></tr><tr><td>d</td><td>in der Zweiergruppe</td></tr><tr><td>g, a</td><td>in der Dreiergruppe</td></tr></table><h4>Oktaven</h4><p>… C (groß) – c (klein) – <b>c¹ = mittleres C (C4)</b> – c² (C5) – c³ (C6) …</p><p>Deutsch <b>H</b> = international B. Deutsch <b>b</b> = international B♭.</p>`, figs: [F.k('C3', 'B4', { C3: { cls: 'hl', lab: 'c' }, F3: { cls: 'hl2', lab: 'f' }, C4: { cls: 'hl', lab: 'c¹' }, F4: { cls: 'hl2', lab: 'f¹' } })] },
  { id: 'haltung', title: 'Haltung und Hand', sub: 'Sitzen, Finger, Gewicht', icon: 'hand', after: '1.2', body: `[[0]]<ul><li><b>Unterarme</b> etwa waagerecht, Ellbogen frei vor dem Körper.</li><li><b>Vordere Hälfte</b> der Bank, Füße flach, Körpermitte vor c¹.</li><li><b>Runde Hand</b>, gebogene Finger, Kuppen. Daumen mit der Außenkante.</li><li><b>Gewicht statt Druck</b>: Der Arm hängt an der Fingerkuppe.</li><li><b>Fingersätze</b>: 1 = Daumen … 5 = kleiner Finger, beide Hände gleich.</li><li><b>C-Lage</b>: rechts 1 auf c¹; links 5 auf c.</li><li><b>Legato</b>: nächste Taste runter, wenn die vorige hochkommt.</li></ul>${F.warn('Schmerz = Stopp. Pausen nach 25–30 Minuten, nie über 60 Minuten am Stück.')}`, figs: [F.html(HANDS_SVG)] },
  { id: 'vorzeichen-namen', title: 'Halbtöne und Tonnamen', sub: '♯ ♭ ♮ und die deutschen Namen', icon: 'keys', after: '1.3', body: `<p><b>Halbton</b> = Nachbartaste. <b>Ganzton</b> = 2 Halbtöne. Natürliche Halbtöne: <b>e–f</b> und <b>h–c</b>.</p><table><tr><th>Zeichen</th><th>Wirkung</th><th>Name</th></tr><tr><td>♯ Kreuz</td><td>+ Halbton</td><td>-is: cis, dis, fis, gis, ais (eis, his)</td></tr><tr><td>♭ B</td><td>− Halbton</td><td>-es: des, es, ges, as, b (ces, fes)</td></tr><tr><td>♮ Auflösung</td><td>zurück zum Stammton</td><td>–</td></tr></table><p><b>Sonderfälle:</b> e♭ = <b>es</b>, a♭ = <b>as</b>, h♭ = <b>b</b>.</p><p><b>Enharmonik:</b> cis = des, dis = es, fis = ges, gis = as, ais = b, eis = f, his = c.</p>[[0]]`, figs: [F.k('C4', 'B4', { 'C#4': { cls: 'hl', lab: 'cis' }, 'D#4': { cls: 'hl', lab: 'dis' }, 'F#4': { cls: 'hl', lab: 'fis' }, 'G#4': { cls: 'hl', lab: 'gis' }, 'A#4': { cls: 'hl', lab: 'b' } })] },
  { id: 'notenwerte', title: 'Notenwerte und Pausen', sub: 'Von der Ganzen bis zur Sechzehntel', icon: 'clock', after: '2.5', lessons: ['1.4', '2.1', '2.2', '2.3', '2.5'], body: `<table><tr><th>Wert</th><th>Schläge (♩ = 1)</th><th>Zählen</th></tr><tr><td>Ganze</td><td>4</td><td>1 2 3 4</td></tr><tr><td>Punktierte Halbe</td><td>3</td><td>1 2 3</td></tr><tr><td>Halbe</td><td>2</td><td>1 2</td></tr><tr><td>Punktierte Viertel</td><td>1½</td><td>1 (und) 2</td></tr><tr><td>Viertel</td><td>1</td><td>1</td></tr><tr><td>Achtel</td><td>½</td><td>1 und</td></tr><tr><td>Sechzehntel</td><td>¼</td><td>1 e und e</td></tr></table>[[0]][[1]]<p><b>Punkt</b> = + die Hälfte. <b>Haltebogen</b> verbindet gleiche Töne (nur einmal anschlagen). <b>Legatobogen</b> verbindet verschiedene Töne (gebunden).</p>`, figs: [F.s([{ r: 'B4/w' }, { r: 'B4/h B4/h' }, { r: 'B4/q B4/q B4/q B4/q' }, { r: 'B4/8 B4/8 B4/8 B4/8 B4/16 B4/16 B4/16 B4/16 B4/q' }], { time: 'C', cap: 'Ganze, Halbe, Viertel, Achtel und Sechzehntel.' }), F.s([{ r: 'r/w' }, { r: 'r/h r/q r/8 r/16 r/16' }], { time: 'C', play: false, cap: 'Pausen: ganze (hängt), halbe (sitzt), Viertel, Achtel, Sechzehntel.' })] },
  { id: 'violin', title: 'Violinschlüssel', sub: 'Linien, Zwischenräume, Anker', icon: 'staff', after: '1.5', body: `<p>Spirale um die 2. Linie = <b>g¹</b>.</p><p>Linien: <b>e¹ g¹ h¹ d² f²</b> · Zwischenräume: <b>f¹ a¹ c² e²</b></p><p>Anker: <b>c¹</b> (1. Hilfslinie unten), <b>g¹</b>, <b>c²</b> (3. Zwischenraum), <b>g²</b> (über dem System).</p>[[0]]`, figs: [F.s('C4/q D4/q E4/q F4/q G4/q A4/q B4/q C5/q D5/q E5/q F5/q G5/q A5/q', { names: 'all', bpm: 110 })] },
  { id: 'bass', title: 'Bassschlüssel', sub: 'Linien, Zwischenräume, Anker', icon: 'staff', after: '1.7', body: `<p>Punkte um die 4. Linie = <b>f</b>.</p><p>Linien: <b>G H d f a</b> · Zwischenräume: <b>A c e g</b></p><p>Anker: <b>C</b> (2. Hilfslinie unten), <b>G</b> (unterste Linie), <b>c</b> (2. Zwischenraum), <b>f</b>, <b>c¹</b> (1. Hilfslinie oben).</p>[[0]]`, figs: [F.s('C2/q E2/q G2/q A2/q B2/q C3/q D3/q E3/q F3/q G3/q A3/q B3/q C4/q', { clef: 'bass', names: 'all', bpm: 110 })] },
  { id: 'intervalle-1', title: 'Intervalle: Größen', sub: 'Prime bis Oktave lesen', icon: 'staff', after: '1.6', body: `<p>Beide Töne mitzählen. Ungerade Intervalle: Linie→Linie (oder Raum→Raum). Gerade: Wechsel.</p><table><tr><th>Intervall</th><th>Beispiel</th><th>Finger (Lage)</th></tr><tr><td>Prime</td><td>c–c</td><td>gleicher</td></tr><tr><td>Sekunde</td><td>c–d</td><td>Nachbar</td></tr><tr><td>Terz</td><td>c–e</td><td>1–3</td></tr><tr><td>Quarte</td><td>c–f</td><td>1–4</td></tr><tr><td>Quinte</td><td>c–g</td><td>1–5</td></tr><tr><td>Sexte</td><td>c–a</td><td>Lage verlassen</td></tr><tr><td>Septime</td><td>c–h</td><td>Lage verlassen</td></tr><tr><td>Oktave</td><td>c–c'</td><td>1–5 gespreizt</td></tr></table>[[0]]`, figs: [F.s('(C4 D4)/h (C4 E4)/h (C4 F4)/h (C4 G4)/h (C4 A4)/h (C4 B4)/h (C4 C5)/h', { cap: 'Sekunde bis Oktave über c¹.' })] },
  { id: 'akkolade', title: 'Das Klaviersystem', sub: 'Zwei Systeme lesen', icon: 'staff', after: '1.8', body: `<p>Oben Violinschlüssel (meist rechts), unten Bassschlüssel (meist links). <b>Übereinander = gleichzeitig.</b></p>[[0]]<p><b>Neues Stück:</b> rechts allein → links allein → zusammen sehr langsam, Abschnitt für Abschnitt.</p>`, figs: [F.s([{ r: 'E4/q F4/q G4/q E4/q', l: 'C3/w' }, { r: 'D4/w', l: 'G3/w', end: '|.' }], { grand: true, time: 'C' })] },
  { id: 'taktarten', title: 'Taktarten und Auftakt', sub: '4/4, 3/4, 2/4 und der Anlauf', icon: 'clock', after: '2.4', body: `<table><tr><th>Takt</th><th>Schläge</th><th>Betonung</th><th>typisch</th></tr><tr><td>4/4 (C)</td><td>4 Viertel</td><td>EINS zwei DREI vier</td><td>fast alles</td></tr><tr><td>3/4</td><td>3 Viertel</td><td>EINS zwei drei</td><td>Walzer, Menuett</td></tr><tr><td>2/4</td><td>2 Viertel</td><td>EINS zwei</td><td>Marsch, Polka</td></tr><tr><td>𝄵 (alla breve)</td><td>2 Halbe</td><td>EINS zwei</td><td>schnelle Sätze, Mondscheinsonate</td></tr></table><p><b>Auftakt:</b> Melodie beginnt vor der ersten Eins. Auftakt + Schlusstakt = 1 Takt. Taktnummern zählen ab dem ersten vollen Takt.</p>` },
  { id: 'tempo', title: 'Tempo', sub: 'Bezeichnungen, Metronom, Tempo-Treppe', icon: 'clock', after: '2.6', body: `<table><tr><th>Bezeichnung</th><th>Bedeutung</th><th>♩ ca.</th></tr><tr><td>Largo</td><td>breit</td><td>40–60</td></tr><tr><td>Adagio</td><td>langsam</td><td>55–75</td></tr><tr><td>Andante</td><td>gehend</td><td>75–100</td></tr><tr><td>Moderato</td><td>mäßig</td><td>95–115</td></tr><tr><td>Allegro</td><td>schnell</td><td>115–150</td></tr><tr><td>Presto</td><td>sehr schnell</td><td>160+</td></tr></table><p>Zusätze: <b>molto</b> sehr · <b>poco</b> etwas · <b>ma non troppo</b> aber nicht zu sehr · <b>sostenuto</b> getragen · <b>con moto</b> mit Bewegung.</p>${F.merk('<b>Tempo-Treppe:</b> 55 % → 3× fehlerfrei → +4 → … Ein Fehler → eine Stufe zurück.')}` },
  { id: 'ueben', title: 'Richtig üben', sub: 'Die Strategien, die wirken', icon: 'quill', after: '2.7', body: `<ol><li><b>Fehlerprotokoll:</b> Stelle isolieren → langsam → 3× fehlerfrei → einbauen.</li><li><b>Verteilt:</b> mehrere kurze Einheiten statt einer langen.</li><li><b>Schlaf</b> festigt Bewegungen.</li><li><b>Abwechseln</b>, sobald Stellen halbwegs sitzen.</li><li><b>Mental üben</b>: Noten lesen, Stück innerlich hören.</li><li><b>Abrufen</b> statt nachlesen: Tests, Wiederholungen nach 1-3-7-14-30 Tagen.</li></ol><h4>Tägliche Einheit</h4><p>Aufwärmen 5–8 · Wiederholen 5–10 · Lektion 20–30 · Stück 15–20 · Blattspiel 5 Minuten.</p>` }
);

CUR.gloss.push(
  ...[
    ['stammton', 'Stammton', 'Die sieben Grundtöne auf den weißen Tasten: c d e f g a h.', 'Grundlagen', '1.1'],
    ['oktave', 'Oktave', 'Abstand von acht Stammtönen (z. B. c¹–c²); der obere Ton schwingt doppelt so schnell. Auch: ein Tastaturabschnitt von c bis h.', 'Grundlagen', '1.1'],
    ['c1', 'c¹ (mittleres C)', 'Das C in der Mitte der Tastatur, international C4.', 'Grundlagen', '1.1'],
    ['fingersatz', 'Fingersatz', 'Zahlen 1–5 an den Noten, die angeben, welcher Finger spielt. 1 = Daumen.', 'Technik', '1.2'],
    ['lage', 'Lage (Fünftonlage)', 'Feste Handposition, bei der fünf Finger auf fünf benachbarten Tasten liegen.', 'Technik', '1.2'],
    ['legato', 'legato', 'Gebunden: Töne gehen ohne Lücke ineinander über.', 'Artikulation', '1.2', 'gebunden, ohne Lücke'],
    ['halbton', 'Halbton', 'Kleinster Tonabstand auf dem Klavier: zur direkt benachbarten Taste.', 'Grundlagen', '1.3'],
    ['ganzton', 'Ganzton', 'Zwei Halbtöne, z. B. c–d.', 'Grundlagen', '1.3'],
    ['kreuz', 'Kreuz (♯)', 'Erhöht einen Ton um einen Halbton; Name + „-is“.', 'Zeichen', '1.3'],
    ['be', 'B (♭)', 'Erniedrigt einen Ton um einen Halbton; Name + „-es“ (Ausnahmen: es, as, b).', 'Zeichen', '1.3'],
    ['aufloesung', 'Auflösungszeichen (♮)', 'Hebt ein ♯ oder ♭ auf; es gilt wieder der Stammton.', 'Zeichen', '1.3'],
    ['enharmonik', 'enharmonische Verwechslung', 'Ein Ton mit zwei Namen, z. B. fis = ges.', 'Grundlagen', '1.3'],
    ['puls', 'Puls (Schlag)', 'Der gleichmäßige Grundschlag der Musik.', 'Rhythmus', '1.4'],
    ['takt', 'Takt', 'Gruppe von Schlägen zwischen zwei Taktstrichen; Anzahl laut Taktangabe.', 'Rhythmus', '1.4'],
    ['taktangabe', 'Taktangabe', 'Bruch am Anfang (z. B. 3/4): oben die Zahl der Schläge, unten der Notenwert eines Schlags.', 'Rhythmus', '1.4'],
    ['notensystem', 'Notensystem', 'Fünf Linien mit vier Zwischenräumen, von unten gezählt.', 'Notation', '1.5'],
    ['hilfslinie', 'Hilfslinie', 'Kurze Zusatzlinie über oder unter dem System.', 'Notation', '1.5'],
    ['violinschluessel', 'Violinschlüssel', 'G-Schlüssel, Spirale um die 2. Linie = g¹. Meist rechte Hand.', 'Notation', '1.5'],
    ['intervall', 'Intervall', 'Abstand zwischen zwei Tönen, gezählt inklusive beider Töne (Prime, Sekunde, Terz …).', 'Harmonik', '1.6'],
    ['bassschluessel', 'Bassschlüssel', 'F-Schlüssel, Punkte um die 4. Linie = f. Meist linke Hand.', 'Notation', '1.7'],
    ['akkolade', 'Akkolade', 'Zusammengehörige Notensysteme, verbunden durch eine geschweifte Klammer.', 'Notation', '1.8'],
    ['pause', 'Pause', 'Notenwert ohne Ton; zählt genauso wie eine Note.', 'Rhythmus', '2.1'],
    ['balken', 'Balken', 'Verbindet die Fähnchen mehrerer Achtel oder Sechzehntel.', 'Notation', '2.2'],
    ['punktierung', 'Punktierung', 'Ein Punkt hinter der Note verlängert sie um die Hälfte ihres Werts.', 'Rhythmus', '2.3'],
    ['haltebogen', 'Haltebogen', 'Verbindet zwei gleiche Töne: nur einmal anschlagen, beide Werte aushalten.', 'Notation', '2.3'],
    ['legatobogen', 'Legatobogen (Bindebogen)', 'Bogen über verschiedenen Tönen: gebunden spielen.', 'Notation', '2.3'],
    ['auftakt', 'Auftakt', 'Unvollständiger erster Takt; die Melodie beginnt vor der ersten Eins.', 'Rhythmus', '2.4'],
    ['alla-breve', 'alla breve (𝄵)', 'Takt mit zwei halben Schlägen statt vier Vierteln.', 'Rhythmus', '2.4'],
    ['largo', 'Largo', 'Breit, sehr langsam.', 'Tempo', '2.6', 'breit, sehr langsam'],
    ['adagio', 'Adagio', 'Langsam, ruhig.', 'Tempo', '2.6', 'langsam, ruhig'],
    ['andante', 'Andante', 'Gehend, in ruhigem Schritttempo.', 'Tempo', '2.6', 'gehend'],
    ['moderato', 'Moderato', 'Mäßig schnell.', 'Tempo', '2.6', 'mäßig'],
    ['allegro', 'Allegro', 'Schnell, lebhaft (wörtlich: fröhlich).', 'Tempo', '2.6', 'schnell, lebhaft'],
    ['presto', 'Presto', 'Sehr schnell.', 'Tempo', '2.6', 'sehr schnell'],
    ['allegretto', 'Allegretto', 'Etwas langsamer als Allegro, leicht bewegt.', 'Tempo', '2.6', 'leicht bewegt, etwas langsamer als Allegro'],
    ['lento', 'Lento', 'Langsam.', 'Tempo', '2.6', 'langsam'],
    ['vivace', 'Vivace', 'Lebhaft.', 'Tempo', '2.6', 'lebhaft'],
    ['molto', 'molto', 'Sehr (z. B. molto allegro).', 'Tempo', '2.6', 'sehr'],
    ['poco', 'poco', 'Etwas, ein wenig.', 'Tempo', '2.6', 'etwas, ein wenig'],
    ['ma-non-troppo', 'ma non troppo', 'Aber nicht zu sehr.', 'Tempo', '2.6', 'aber nicht zu sehr'],
    ['sostenuto', 'sostenuto', 'Getragen, gehalten.', 'Tempo', '2.6', 'getragen'],
    ['metronom', 'Metronom', 'Taktgeber; ♩ = 80 heißt 80 Viertel pro Minute.', 'Tempo', '2.6', 'Taktgeber, zeigt Schläge pro Minute'],
    ['tempotreppe', 'Tempo-Treppe', 'Übe-Methode: ab 55 % des Zieltempos, nach drei fehlerfreien Durchgängen +4.', 'Üben', '2.6'],
    ['fehlerprotokoll', 'Fehlerprotokoll', 'Stelle isolieren, langsam, dreimal fehlerfrei, dann wieder einbauen.', 'Üben', '2.7'],
    ['mentales-ueben', 'mentales Üben', 'Üben in Gedanken: Noten lesen, Klang und Bewegung vorstellen.', 'Üben', '2.7']
  ].map(([id, term, def, cat, after, short]) => ({ id, term, def, cat, after, short }))
);

/* ===== Notenweg 3 · Zusatzfragen, damit Ersatzaufgaben nie dieselben sind ===== */
(() => {
  const more = {
    phrase: [
      { q: 'Wie lang ist eine typische klassische Phrase?', a: '4 Takte', w: ['1 Takt', '13 Takte', 'immer das ganze Stück'], e: '2, 4 oder 8 Takte – am häufigsten 4.' },
      { q: 'Was hörst du am Ende einer gut gespielten Phrase?', a: 'ein leiseres, weiches Ausklingen – wie ein Satzende', w: ['einen lauten Akzent', 'ein plötzliches Tempo-Anziehen', 'gar nichts Besonderes'], e: 'Die letzte Note ist meist leichter als die vorletzte.' }
    ],
    blattspiel: [
      { q: 'Worauf achtest du beim Blattspiel bei Vorzeichen besonders?', a: 'auf die Vorzeichnung und Versetzungszeichen, die bis Taktende gelten', w: ['gar nicht, das Ohr korrigiert', 'nur auf Kreuze', 'nur auf den ersten Takt'], e: 'Vor dem Spielen die Vorzeichnung laut nennen: „Zwei Kreuze: fis, cis“.' },
      { q: 'Was hilft beim Blattspiel mit beiden Händen?', a: 'zuerst den Bass als Fundament sichern, die Melodie darüber', w: ['nur die rechte Hand ansehen', 'die Hände nacheinander spielen', 'jeden Takt zweimal spielen'], e: 'Ein stabiler Bass hält die Musik zusammen; Mittelstimmen dürfen wegfallen.' }
    ],
    grand: [
      { q: 'Welche Hand spielt normalerweise das obere System?', a: 'die rechte', w: ['die linke', 'beide abwechselnd', 'immer die stärkere'], e: 'Oben (Violinschlüssel) meist rechts, unten (Bassschlüssel) meist links – Ausnahmen werden mit r.H./l.H. (oder m.d./m.s.) markiert.' },
      { q: 'Was bedeutet „l.H.“ über einer Note im oberen System?', a: 'diese Note spielt die linke Hand', w: ['leise und hoch', 'loslassen', 'langsam halten'], e: 'r.H. = rechte Hand, l.H. = linke Hand (italienisch m.d./m.s., englisch R.H./L.H.).' },
      { q: 'Wie liest man eine Akkolade am schnellsten?', a: 'senkrecht: was übereinandersteht, gehört zusammen', w: ['erst das ganze obere System, dann das untere', 'nur die Melodie', 'rückwärts'], e: 'Das Auge springt im Rhythmus der Schläge von oben nach unten.' },
      { q: 'Wo stehen die Taktstriche in der Akkolade?', a: 'durchgehend durch beide Systeme', w: ['nur im oberen System', 'nur im unteren System', 'gar nicht'], e: 'Die durchgehenden Taktstriche zeigen: beide Hände teilen sich den Takt.' }
    ],
    pausen: [
      { q: 'Wie sieht die halbe Pause aus?', a: 'ein Balken, der auf der 3. Linie liegt', w: ['ein Balken, der unter der 4. Linie hängt', 'ein Zickzack', 'eine kleine 7'], e: 'Halbe Pause „sitzt“ wie ein Hut, ganze Pause „hängt“.' },
      { q: 'Wie sieht die Achtelpause aus?', a: 'wie eine kleine 7 mit Punkt', w: ['wie ein Zickzack', 'wie ein hängender Balken', 'wie ein Komma'], e: 'Achtelpause: ein Fähnchen; Sechzehntelpause: zwei.' },
      { q: 'Wie lange dauert eine punktierte Viertelpause?', a: '1½ Schläge', w: ['1 Schlag', '2 Schläge', '¾ Schlag'], e: 'Der Punkt verlängert auch Pausen um die Hälfte.' },
      { q: 'Warum muss man Pausen zählen?', a: 'damit der nächste Ton genau auf seinen Schlag kommt', w: ['damit man sich ausruhen kann', 'weil sie leise sind', 'muss man nicht'], e: 'Pausen sind Musik – sie haben genau festgelegte Längen.' }
    ],
    tempo: [
      { q: 'Was bedeutet „Andante“?', a: 'gehend, ruhig fließend', w: ['sehr schnell', 'sehr langsam, breit', 'fröhlich schnell'], e: 'Andante kommt von „andare“ = gehen.' },
      { q: 'Was bedeutet „Allegro“?', a: 'schnell, munter', w: ['langsam', 'gehend', 'sehr langsam'], e: 'Allegro = fröhlich, schnell.' },
      { q: 'Was bedeutet „Presto“?', a: 'sehr schnell', w: ['schnell', 'mäßig', 'langsam'], e: 'Presto ist schneller als Allegro.' },
      { q: 'Warum übt man mit Metronom?', a: 'um gleichmäßig zu spielen und das Tempo messbar zu steigern', w: ['damit es lauter wird', 'weil es Pflicht ist', 'damit man nicht zählen muss'], e: 'Das Metronom zeigt unbestechlich, wo man eilt oder schleppt.' }
    ],
    fingersatz: [
      { q: 'Wo setzt der Daumen links in der C-Dur-Tonleiter abwärts unter?', a: 'nach dem 3. Finger auf a – Daumen auf g', w: ['nach dem 4. Finger auf h – Daumen auf a', 'nach dem 2. Finger auf d – Daumen auf c', 'nie'], e: 'Links abwärts: 1 2 3 – 1 2 3 4 5 (c h a – g f e d c).' },
      { q: 'Wie übt man den Daumenuntersatz isoliert?', a: 'c–d–e–f langsam wiederholen, der Daumen wandert früh unter den 3. Finger', w: ['nur schnelle Tonleitern', 'Daumen und kleinen Finger abwechselnd', 'mit gestreckter Hand'], e: 'Kleine Bausteine langsam – dann zur ganzen Tonleiter verbinden.' },
      { q: 'Wie spielt man zwei Oktaven Tonleiter rechts in C-Dur?', a: '1 2 3 1 2 3 4 1 2 3 1 2 3 4 5', w: ['1 2 3 1 2 3 4 5 1 2 3 1 2 3 4', '1 2 3 4 1 2 3 4 1 2 3 4 1 2 3', '1 2 3 1 2 3 1 2 3 1 2 3 1 2 3'], e: 'Am Ende der ersten Oktave kommt statt 5 der Daumen auf c².' }
    ],
    begleitung: [
      { q: 'Was ist ein „Bass – Akkord“-Muster im 4/4-Takt?', a: 'Grundton auf 1 und 3, Akkord auf 2 und 4', w: ['Akkord auf allen vier Schlägen', 'nur Grundton auf 1', 'Grundton auf 2 und 4'], e: 'Typisch für Marsch, Ragtime und Polka.' },
      { q: 'Woraus besteht ein gebrochenes 1-5-8-Muster in C?', a: 'c – g – c¹ (Grundton, Quinte, Oktave)', w: ['c – e – g', 'c – f – a', 'c – d – e'], e: 'Ohne Terz klingt es offen; die Terz bringt die Melodie.' },
      { q: 'Warum ist ein weit gebrochener Akkord (über eine Dezime) mit Pedal so klangvoll?', a: 'weil viele Saiten mitschwingen und der Klang breit wird', w: ['weil er lauter gespielt wird', 'weil er schneller ist', 'weil die Melodie dann wegfällt'], e: 'Weite Lagen und Pedal = großer, warmer Klang.' }
    ],
    voicing: [
      { q: 'Was hilft, wenn die Begleitung in einer Hand zu laut ist?', a: 'die Begleittöne nur mit „flachen“, leichten Fingern berühren', w: ['mehr Pedal', 'schneller spielen', 'die Begleitung staccato spielen'], e: 'Weniger Gewicht, geringere Tastengeschwindigkeit.' },
      { q: 'Woran merkst du in einer Aufnahme gutes Voicing?', a: 'Die Melodie ist mühelos mitsingbar, die Begleitung trägt im Hintergrund', w: ['alles klingt gleich laut', 'die Begleitung ist am deutlichsten', 'es klingt lauter'], e: 'Anhören ist der beste Test.' },
      { q: 'Wie behandelt man den Bass beim Voicing meist?', a: 'etwas kräftiger als die Mittelstimmen – er trägt die Harmonie', w: ['so leise wie möglich', 'lauter als die Melodie', 'gar nicht spielen'], e: 'Melodie > Bass > Mittelstimmen ist eine gute Grundordnung.' }
    ],
    stimmen: [
      { q: 'Wie heißt Musik mit Melodie und untergeordneter Begleitung?', a: 'Homophonie', w: ['Polyphonie', 'Monophonie', 'Kanon'], e: 'Monophonie = einstimmig, Polyphonie = gleichberechtigte Stimmen.' },
      { q: 'Was ist ein Kanon?', a: 'mehrere Stimmen singen/spielen dieselbe Melodie zeitversetzt', w: ['eine Melodie mit Akkorden', 'ein langsamer Satz', 'eine Tonleiter'], e: 'Die strengste Form der Imitation („Bruder Jakob“).' },
      { q: 'Welcher Fingersatz-Trick hilft bei Haltetönen?', a: 'stummer Fingerwechsel auf der gehaltenen Taste', w: ['Pedal statt Finger', 'den Ton neu anschlagen', 'den Ton weglassen'], e: 'Ein anderer Finger übernimmt die Taste, ohne sie loszulassen – so wird der erste frei.' }
    ],
    sonder: [
      { q: 'Wohin löst sich H°7 (h d f as) normalerweise auf?', a: 'nach c-Moll (oder C-Dur)', w: ['nach G-Dur', 'nach a-Moll', 'nach E-Dur'], e: 'Der Leitton h geht nach c.' },
      { q: 'Was ist eine Wechselnote?', a: 'ein akkordfremder Nachbarton, der zum Ausgangston zurückkehrt', w: ['eine Note, die in eine andere Tonart wechselt', 'ein Akkordton', 'eine Pause'], e: 'e – f – e über C-Dur: f ist Wechselnote.' },
      { q: 'Welcher Neapolitaner gehört zu a-Moll?', a: 'B-Dur (mit d im Bass)', w: ['H-Dur', 'D-Dur', 'F-Dur'], e: 'Tiefe II. Stufe von a = b → B-Dur, als Sextakkord über d.' }
    ],
    analyse: [
      { q: 'Wie bezeichnet man eine leicht veränderte Wiederkehr von A?', a: 'A′ (A-Strich)', w: ['B', 'A2', 'C'], e: 'A′ = ähnlich, aber verändert.' },
      { q: 'Was ist der erste Schritt, um Akkorde in einem Alberti-Bass zu finden?', a: 'die vier Töne jeder Gruppe zu einem Griff zusammenschieben', w: ['nur den höchsten Ton nehmen', 'die Melodie analysieren', 'die Pausen zählen'], e: 'c g e g → c e g = C-Dur.' },
      { q: 'Was bedeuten die Generalbass-Ziffern ⁴₂?', a: '3. Umkehrung des Septakkords (Septime im Bass)', w: ['Grundstellung', '1. Umkehrung', 'Dreiklang in 2. Umkehrung'], e: 'Dm7/C in Bachs Präludium ist ein ii⁴₂.' }
    ],
    neoklassik: [
      { q: 'Wer komponierte „Nuvole Bianche“?', a: 'Ludovico Einaudi', w: ['Yiruma', 'Tony Ann', 'Erik Satie'], e: 'Aus dem Album „Una Mattina“ (2004).' },
      { q: 'Was ist für die rechte Hand in neoklassischen Stücken typisch?', a: 'einfache, oft wiederholte Melodien, manchmal in Oktaven', w: ['schnelle Läufe in Zweiunddreißigsteln', 'Fugen', 'ständige Triller'], e: 'Die Wirkung entsteht durch Wiederholung und Steigerung.' },
      { q: 'Welche Rolle spielt das Pedal in der Neoklassik?', a: 'es schafft lange, verschwimmende Klangflächen – gewechselt bei Harmoniewechsel', w: ['es wird nie benutzt', 'es wird nur am Schluss benutzt', 'es ersetzt die linke Hand'], e: 'Sauber nach Harmonie wechseln, sonst wird es Matsch.' }
    ],
    rubato: [
      { q: 'Was ist ein „Tempo rubato“ in der Romantik typischerweise nicht?', a: 'ein dauerhaftes Langsamerwerden', w: ['freies Atmen im Tempo', 'Verweilen am Höhepunkt', 'Ausgleich zwischen Drängen und Nachgeben'], e: 'Rubato pendelt um das Grundtempo herum.' },
      { q: 'Was hilft, Rubato natürlich klingen zu lassen?', a: 'die Melodie singen und das Tempo der Stimme folgen lassen', w: ['an jedem Taktanfang bremsen', 'zufällige Tempowechsel', 'das Metronom laut stellen'], e: 'Die Stimme atmet von selbst richtig.' },
      { q: 'Was bedeutet „Tempo giusto“?', a: 'im angemessenen, strengen Tempo', w: ['frei im Tempo', 'langsamer werden', 'schneller werden'], e: 'Gegenteil von rubato.' }
    ],
    rekord: [
      { q: 'Wie lange sollte eine fokussierte Übe-Einheit ungefähr dauern?', a: 'etwa 20–30 Minuten, dann kurze Pause', w: ['mindestens drei Stunden', 'zwei Minuten', 'so lange, bis die Hände schmerzen'], e: 'Konzentration lässt nach – kurze Pausen halten die Qualität hoch.' },
      { q: 'Was tust du, wenn eine Stelle nach vielen Versuchen nicht klappt?', a: 'langsamer werden und den Abschnitt verkleinern', w: ['schneller üben', 'das Stück aufgeben', 'nur noch durchspielen'], e: 'Zu schwer = zu groß oder zu schnell.' }
    ],
    auswendig: [
      { q: 'Wie hilft das Hörgedächtnis beim Auswendigspielen?', a: 'Man hört innerlich, was als Nächstes kommt, und findet so zurück', w: ['gar nicht', 'man muss dann nicht üben', 'es ersetzt die Analyse'], e: 'Wer die Musik singen kann, verliert sich seltener.' },
      { q: 'Was ist ein Risiko, wenn man nur das Fingergedächtnis nutzt?', a: 'Nach einem kleinen Fehler weiß man nicht, wo man weitermachen soll', w: ['Man spielt zu leise', 'Man wird zu langsam', 'Keins'], e: 'Darum Einstiegspunkte und Analyse.' },
      { q: 'Wie prüfst du das visuelle Gedächtnis?', a: 'Die Notenseite im Kopf vorstellen und beschreiben können', w: ['die Augen beim Spielen schließen', 'die Noten abfotografieren', 'Noten schneller lesen'], e: 'Wo steht welcher Takt auf der Seite?' }
    ],
    vorspiel: [
      { q: 'Was ist eine gute Vorbereitung am Tag des Vorspiels?', a: 'nur ruhig anspielen, nichts Neues mehr üben', w: ['stundenlang alles durchspielen', 'neue Fingersätze ausprobieren', 'gar nicht spielen und nicht daran denken'], e: 'Am Tag selbst festigt man nur noch, man lernt nichts Neues.' },
      { q: 'Wann sollte das letzte Probe-Vorspiel stattfinden?', a: 'etwa eine Woche vorher, unter echten Bedingungen', w: ['am Abend davor bis spät in die Nacht', 'gar nicht', 'einen Monat vorher'], e: 'Genug Zeit, um Schwachstellen noch zu verbessern.' }
    ]
  };
  for (const k in more) CUR.pools[k] = (CUR.pools[k] || []).concat(more[k]);
})();

/* Tabellen auf schmalen Bildschirmen seitlich scrollbar machen */
(() => {
  const wrap = h => typeof h === 'string' ? h.replace(/(<div class="tablewrap">)?(<table[\s\S]*?<\/table>)/g, (m, w, t) => w ? m : '<div class="tablewrap">' + t + '</div>') : h;
  CUR.folios.forEach(f => { f.body = wrap(f.body); });
  CUR.chapters.forEach(c => c.lessons.forEach(l => l.steps.forEach(s => { s.body = wrap(s.body); })));
})();
