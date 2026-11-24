"""Notenweg 5.0 (24.11.2026): Ersatz für die vier Kauflink-Einträge (Una Mattina, Nuvole Bianche, Icarus, Idea 10)
durch je drei verwandte gemeinfreie Stücke mit Noten – plus Clair de lune (braucht die dritte Stimme und Vorschläge).

Rohdaten: mscx2nw.py auf die DCML-Korpora (GitHub: DCMLab/grieg_lyric_pieces, DCMLab/tchaikovsky_seasons,
DCMLab/debussy_other_piano_pieces, DCMLab/debussy_suite_bergamasque), Ausgabe nach OUT/<datei>.json.
Aufruf: python3 neue_stuecke_2026_11b.py /pfad/zu/raw2
"""
import json, os, sys, urllib.parse

OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/raw2'
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'stuecke')
DCML = 'Digital and Cognitive Musicology Lab (EPFL), DCML-Korpus, CC BY-NC-SA 4.0'
WEG = ['una-mattina', 'nuvole-bianche', 'icarus', 'idea-10']


def imslp(q):
    return ['IMSLP (Originalnoten, gratis)', 'https://imslp.org/index.php?title=Special:Search&search=' + urllib.parse.quote(q)]


P = [
    # ---- statt Una Mattina: ruhig kreisende Begleitung, eine einfache Melodie darüber ----
    dict(id='an-der-wiege', f='op68n05', title='An der Wiege', composer='Edvard Grieg', cat='Lyrische Stücke op. 68 Nr. 5', keyde='E-Dur', lvl=3, bpm=66, after='5.4',
         why='Wenn du Una Mattina magst: Ein Wiegenlied, bei dem die linke Hand gleichmäßig schaukelt und die Melodie darüber fast nur aus wenigen Tönen besteht. Ruhig, warm, mit viel Pedalklang.',
         focus=['Die schaukelnde Begleitung links zuerst allein, bis sie wie von selbst läuft', 'Melodie leise, aber immer über der Begleitung', 'Pedal mit jeder neuen Harmonie wechseln'],
         src=DCML + '.', q='Lyric Pieces Op.68 Grieg'),
    dict(id='mai', f='op37a05', title='Mai – Weiße Nächte', composer='Pjotr Tschaikowsky', cat='Die Jahreszeiten op. 37a Nr. 5', keyde='G-Dur', lvl=4, bpm=84, after='6.5',
         why='Wenn du Una Mattina magst: Eine helle Nacht im Norden, in der es nie ganz dunkel wird. Wiegende Achtel im 9/8-Takt, ein lebhafterer Mittelteil im 2/4-Takt, dann kehrt die Ruhe zurück.',
         focus=['9/8 in drei großen Schlägen fühlen, nicht in neun', 'Beim Taktwechsel zum 2/4 das Tempo bewusst neu setzen', 'Melodiebögen lang denken, Begleitung zurücknehmen'],
         src=DCML + '.', q='The Seasons Op.37a Tchaikovsky'),
    dict(id='heimweh', f='op57n06', title='Heimweh', composer='Edvard Grieg', cat='Lyrische Stücke op. 57 Nr. 6', keyde='e-Moll', lvl=4, bpm=72, after='6.5',
         why='Wenn du Una Mattina magst: Eine sehnsüchtige Moll-Melodie, dazwischen ein heller Teil in E-Dur wie eine Erinnerung an zu Hause. Wenig Noten, viel Gefühl.',
         focus=['Melodie singen, bevor du sie spielst', 'Beim Wechsel nach E-Dur die vier Kreuze vorher ansehen', 'Den Rückweg nach e-Moll bewusst leiser beginnen'],
         src=DCML + '.', q='Lyric Pieces Op.57 Grieg'),
    # ---- statt Nuvole Bianche: fließende Arpeggien, Steigerung, Rückkehr ins Leise ----
    dict(id='reverie', f='l068_reverie', title='Rêverie', composer='Claude Debussy', cat='L. 68 (1890)', keyde='F-Dur', lvl=4, bpm=76, after='7.5',
         why='Wenn du Nuvole Bianche magst: Ein wiegendes Achtel-Muster links, darüber eine träumerische Melodie, die sich langsam steigert und wieder ins Pianissimo zurückfällt. Fast schon Neoklassik, nur über hundert Jahre älter.',
         focus=['Das Achtel-Muster links gleichmäßig und leise wie ein Teppich', 'Melodie getragen, mit Pedal verbunden, aber nie verwischt', 'Steigerungen langsam aufbauen, den Höhepunkt nicht zu früh'],
         src=DCML + '. An vier Stellen spielt eine Hand drei Stimmen – die dritte (Mittelstimme) ist nach rechts versetzt.', q='Reverie Debussy'),
    dict(id='oktober', f='op37a10', title='Oktober – Herbstlied', composer='Pjotr Tschaikowsky', cat='Die Jahreszeiten op. 37a Nr. 10', keyde='d-Moll', lvl=4, bpm=60, after='6.6',
         why='Wenn du Nuvole Bianche magst: Das traurigste Stück der Jahreszeiten. Eine Melodie, die wie ein Gespräch zwischen zwei Stimmen klingt, über weichen Akkorden in d-Moll.',
         focus=['Die Antworten der zweiten Stimme (oft in der linken Hand) hörbar machen', 'Vorschlagsnoten leicht und kurz, kurz vor dem Schlag', 'Langsames Tempo wirklich halten, nicht eilen'],
         src=DCML + '.', q='The Seasons Op.37a Tchaikovsky'),
    dict(id='notturno', f='op54n04', title='Notturno', composer='Edvard Grieg', cat='Lyrische Stücke op. 54 Nr. 4', keyde='C-Dur', lvl=5, bpm=72, after='7.6',
         why='Wenn du Nuvole Bianche magst: Eine Sommernacht. Gebrochene Akkorde, eine schwebende Melodie, im Mittelteil zwitschernde Vogelrufe und eine große Steigerung, bevor alles wieder still wird.',
         focus=['Taktwechsel (9/8, 6/8, 3/8) vor dem Spielen markieren', 'Vogelrufe leicht und frei, wie hingetupft', 'Die Steigerung über viele Takte planen'],
         src=DCML + '.', q='Lyric Pieces Op.54 Grieg'),
    # ---- statt Icarus: treibend, dramatisch, viel Energie ----
    dict(id='zwerge', f='op54n03', title='Zug der Zwerge', composer='Edvard Grieg', cat='Lyrische Stücke op. 54 Nr. 3', keyde='d-Moll', lvl=5, bpm=152, after='8.1',
         why='Wenn du Icarus magst: Ein treibender Marsch der Trolle, der von ganz leise zu donnernd anwächst. Dazwischen ein ruhiger, singender Mittelteil, dann kommt der Zug zurück.',
         focus=['Staccato kurz und leicht, auch wenn es laut wird', 'Den Mittelteil wirklich ruhig spielen, als Kontrast', 'Tempo-Treppe: erst bei 60 % des Zieltempos sicher'],
         src=DCML + '.', q='Lyric Pieces Op.54 Grieg'),
    dict(id='kobold', f='op71n03', title='Kobold', composer='Edvard Grieg', cat='Lyrische Stücke op. 71 Nr. 3', keyde='es-Moll', lvl=5, bpm=160, after='8.1',
         why='Wenn du Icarus magst: Ein kleiner Troll, der durchs Haus huscht. Schnell, geheimnisvoll, mit sechs Be-Vorzeichen. Kurz, aber voller Energie.',
         focus=['Die sechs Be-Vorzeichen vorher laut aufsagen: b, es, as, des, ges, ces', 'Schnelle Figuren in kleine Gruppen teilen', 'Leise und schnell zugleich: Finger nah an den Tasten'],
         src=DCML + '.', q='Lyric Pieces Op.71 Grieg'),
    dict(id='troika', f='op37a11', title='November – Troika', composer='Pjotr Tschaikowsky', cat='Die Jahreszeiten op. 37a Nr. 11', keyde='E-Dur', lvl=5, bpm=112, after='8.1',
         why='Wenn du Icarus magst: Eine Schlittenfahrt mit Glöckchen, die immer schneller und strahlender wird. Volle Akkorde, ein großer Höhepunkt, dann verschwindet der Schlitten in der Ferne.',
         focus=['Melodie in den Akkorden oben herausholen', 'Glöckchen-Figuren leicht und hell', 'Die vielen Vorschläge locker, nie auf Kosten des Takts'],
         src=DCML + '.', q='The Seasons Op.37a Tchaikovsky'),
    # ---- statt Idea 10: schlicht, melancholisch, wenige Mittel ----
    dict(id='wanderer', f='op43n02', title='Einsamer Wanderer', composer='Edvard Grieg', cat='Lyrische Stücke op. 43 Nr. 2', keyde='h-Moll', lvl=3, bpm=90, after='6.4',
         why='Wenn du Idea 10 magst: Eine einzelne, einsame Melodie, kaum Begleitung, nur 30 Takte. Hier zählt jeder Ton.',
         focus=['6/8 in zwei Schlägen fühlen', 'Melodie wie gesungen, mit kleinen Atempausen', 'Leise bleiben, auch wenn es schwerfällt'],
         src=DCML + '.', q='Lyric Pieces Op.43 Grieg'),
    dict(id='elegie', f='op38n06', title='Elegie', composer='Edvard Grieg', cat='Lyrische Stücke op. 38 Nr. 6', keyde='a-Moll', lvl=3, bpm=80, after='5.4',
         why='Wenn du Idea 10 magst: Ein trauriges Lied ohne Worte in a-Moll. Schlichte Akkorde, eine Melodie, die immer wieder zum selben Gedanken zurückkehrt.',
         focus=['Akkorde links weich und gleichzeitig', 'Melodie über die Taktstriche hinweg denken', 'Wiederkehrende Stellen jedes Mal etwas anders färben'],
         src=DCML + '.', q='Lyric Pieces Op.38 Grieg'),
    dict(id='walzer-grieg', f='op12n02', title='Walzer', composer='Edvard Grieg', cat='Lyrische Stücke op. 12 Nr. 2', keyde='a-Moll', lvl=3, bpm=120, after='5.4',
         why='Wenn du Idea 10 magst: Ein wehmütiger Walzer in a-Moll mit einem hellen Mittelteil in A-Dur. Einfache Begleitung, eine Melodie mit kleinen Verzierungen.',
         focus=['Walzer-Begleitung: Bass auf 1 tief und kurz, Akkorde auf 2 und 3 leicht', 'Vorschläge kurz vor dem Schlag', 'Beim A-Dur-Teil die drei Kreuze beachten'],
         src=DCML + '.', q='Lyric Pieces Op.12 Grieg'),
    # ---- Wunschstück ----
    dict(id='clair-de-lune', f='l075-03_suite_clair', title='Clair de lune', composer='Claude Debussy', cat='Suite bergamasque Nr. 3', keyde='Des-Dur', lvl=5, bpm=60, after='7.6',
         why='Mondlicht in Tönen, benannt nach einem Gedicht von Paul Verlaine. Erst schwebende Akkorde in beiden Händen, dann der berühmte fließende Mittelteil mit Arpeggien links, ein großer Höhepunkt und ein leises Verklingen. Eines der bekanntesten Klavierstücke überhaupt.',
         focus=['Anfang: Akkorde ganz gleichmäßig und leise, beide Hände wie eine Hand', 'Mittelteil: Arpeggien links als Wellen, Melodie rechts darüber', 'Pedal sorgfältig wechseln, oft halb'],
         src=DCML + '. An mehreren Stellen spielt eine Hand drei Stimmen – die Mittelstimme ist nach rechts versetzt.', q='Suite bergamasque Debussy'),
]


def main():
    order_file = os.path.join(DST, '_reihenfolge.json')
    order = [i for i in json.load(open(order_file, encoding='utf-8')) if i not in WEG]
    for i in WEG:
        fp = os.path.join(DST, i + '.json')
        if os.path.exists(fp): os.remove(fp)
    for e in P:
        raw = json.load(open(os.path.join(OUT, e['f'] + '.json'), encoding='utf-8'))
        if raw.get('bad'): sys.exit(f"{e['id']}: fehlerhafte Takte {raw['bad']}")
        ms = raw['measures']
        for m in ms:
            for k in ('r2', 'l2', 'r3', 'l3'):
                if k in m and not m[k]: del m[k]
        od = raw.get('order') or list(range(len(ms)))
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
