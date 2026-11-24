"""MuseScore 3 (.mscx, z. B. DCML-Korpora) -> Notenweg-Stückformat.

Liest Noten, Pausen, Triolen, Haltebögen, Bögen, Dynamik, Gabeln, Pedal, Artikulation, Fermaten,
Fingersätze, Schlüssel-, Tonart- und Taktwechsel, Wiederholungen und Volten. Vorschläge werden
weggelassen und gezählt. Oktavierungslinien (8va) werden klingend notiert.
Das eigentliche Setzen in Takte/Stimmen übernimmt kern2nw.build().
Aufruf: python3 mscx2nw.py datei.mscx ausgabe.json
"""
import re, sys, json
import xml.etree.ElementTree as ET
from fractions import Fraction as F

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from kern2nw import KNote, build, MAJ_BY_N
from ly2nw import LyError

DT = {'longa': F(16), 'breve': F(8), 'whole': F(4), 'half': F(2), 'quarter': F(1), 'eighth': F(1, 2), '16th': F(1, 4),
      '32nd': F(1, 8), '64th': F(1, 16), '128th': F(1, 32)}
TPC_LET = 'FCGDAEB'
DYNS = {'ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff', 'sf', 'sfz', 'fz', 'fp', 'rf', 'rfz', 'sfp', 'sff'}


def spell(pitch, tpc):
    i = tpc + 1                      # tpc 13 = F ... 19 = B (natürlich), -1 = Fbb
    let = TPC_LET[i % 7]
    alter = (i // 7) - 2
    octv = (pitch - alter) // 12 - 1
    acc = {-2: 'bb', -1: 'b', 0: '', 1: '#', 2: '##'}[alter]
    return f'{let}{acc}{octv}'


def frac(s):
    if s is None: return F(0)
    return F(s)


def dur_of(el, tup):
    dt = el.findtext('durationType')
    if dt == 'measure': return None
    d = DT[dt]
    dots = int(el.findtext('dots') or 0)
    add = d
    for _ in range(dots): add /= 2; d += add
    for (n, a) in tup: d = d * F(n, a)
    return d


def convert(path):
    root = ET.parse(path).getroot()
    score = root.find('Score')
    staves = [s for s in score.findall('Staff') if s.find('Measure') is not None]
    if len(staves) > 2: raise LyError('mehr als 2 Systeme')
    notes, dyns, peds, bars, clefs, keys, times = [], [], [], [], {}, [], []
    warn = []; graces = 0; ottava = 0; gkept = 0; pend = {}
    mstarts = []; mlens = []; repinfo = []
    title = None
    for t in score.iter('Text'):
        if t.findtext('style') == 'Title' and (t.findtext('text') or '').strip(): title = t.findtext('text').strip(); break
    for si, staff in enumerate(staves):
        sid = si + 1
        T0 = F(0); sig = F(4)
        open_slur = {}
        for mi, meas in enumerate(staff.findall('Measure')):
            # Taktlänge
            ts = None
            for v in meas.findall('voice'):
                tsel = v.find('TimeSig')
                if tsel is not None: ts = (int(tsel.findtext('sigN')), int(tsel.findtext('sigD')))
            if ts:
                sig = F(4 * ts[0], ts[1])
                if sid == 1: times.append((T0, f'{ts[0]}/{ts[1]}'))
            L = F(meas.get('len')) * 4 if meas.get('len') else sig
            if sid == 1:
                mstarts.append(T0); mlens.append(L)
                rep = {'start': meas.find('startRepeat') is not None, 'end': meas.find('endRepeat') is not None,
                       'times': int(meas.findtext('endRepeat') or 2) if meas.find('endRepeat') is not None else 0}
                repinfo.append(rep)
            for vi, v in enumerate(meas.findall('voice')):
                pos = F(0); tup = []; ferm = False
                for el in v:
                    tag = el.tag
                    if tag == 'location':
                        pos += frac(el.findtext('fractions')) * 4
                        if el.findtext('measures'): raise LyError('location über Taktgrenze')
                        continue
                    T = T0 + pos
                    if tag == 'Tuplet':
                        tup.append((int(el.findtext('normalNotes')), int(el.findtext('actualNotes'))))
                    elif tag == 'endTuplet':
                        if tup: tup.pop()
                    elif tag == 'KeySig' and sid == 1:
                        n = int(el.findtext('accidental') or el.findtext('concertKey') or 0)
                        keys.append((T, MAJ_BY_N[n]))
                    elif tag == 'Clef':
                        ct = el.findtext('concertClefType') or el.findtext('subtype') or 'G'
                        clefs.setdefault(sid, []).append((T, 'bass' if ct.startswith('F') else 'treble'))
                    elif tag == 'Dynamic':
                        st = el.findtext('subtype')
                        if st in DYNS: dyns.append((T, sid, st))
                    elif tag == 'Spanner':
                        typ = el.get('type'); start = el.find('next') is not None
                        if typ == 'HairPin':
                            if start:
                                hp = el.find('HairPin'); sub = hp.findtext('subtype') if hp is not None else '0'
                                dyns.append((T, sid, '<' if sub in ('0', '2') else '>'))
                            else: dyns.append((T, sid, ']'))
                        elif typ == 'Pedal':
                            peds.append((T, sid, 'd' if start else 'u'))
                        elif typ == 'Ottava' and start: ottava += 1
                    elif tag in ('Chord', 'Rest'):
                        if tag == 'Chord' and any(el.find(g) is not None for g in ('grace8after', 'grace16after', 'grace32after')):
                            graces += 1; continue          # Nachschläge (selten) weiterhin weglassen
                        if tag == 'Chord' and any(el.find(g) is not None for g in ('acciaccatura', 'appoggiatura', 'grace4', 'grace16', 'grace32')):
                            gps = [spell(int(nt.findtext('pitch')), int(nt.findtext('tpc'))) for nt in el.findall('Note')]
                            pend.setdefault((sid, vi), []).append(('&'.join(gps), el.find('acciaccatura') is not None))
                            gkept += 1; continue
                        d = dur_of(el, tup)
                        if d is None: d = L                       # Ganztaktpause
                        if tag == 'Rest':
                            hidden = el.findtext('visible') == '0'
                            notes.append(KNote(t=T, dur=d, pitches=[], rest=True, hidden=hidden, mods={}, staff=sid, layer=vi, tie=None, line=mi))
                        else:
                            ps = []; ties = []; mods = {}; fing = []
                            for nt in el.findall('Note'):
                                ps.append(spell(int(nt.findtext('pitch')), int(nt.findtext('tpc'))))
                                tie = any(sp.get('type') == 'Tie' and sp.find('next') is not None for sp in nt.findall('Spanner'))
                                ties.append(tie)
                                fg = nt.find('Fingering')
                                fing.append((ps[-1], (fg.findtext('text') or '').strip() if fg is not None else ''))
                            for sp in el.findall('Spanner'):
                                if sp.get('type') == 'Slur':
                                    if sp.find('next') is not None: mods['('] = mods.get('(', 0) + 1
                                    if sp.find('prev') is not None: mods[')'] = mods.get(')', 0) + 1
                            for ar in el.findall('Articulation'):
                                s = ar.findtext('subtype') or ''
                                if 'Staccat' in s: mods['st'] = True
                                if 'Accent' in s or 'Marcato' in s: mods['ac'] = True
                                if 'Tenuto' in s and 'Staccato' not in s: mods['tn'] = True
                                if s == 'ornamentTrill': mods['o'] = 'tr'
                                if s in ('ornamentMordent', 'ornamentMordentInverted'): mods['o'] = 'mord'
                                if s in ('ornamentShortTrill', 'ornamentPrall'): mods['o'] = 'prall'
                                if s in ('ornamentTurn', 'ornamentTurnInverted'): mods['o'] = 'turn'
                            if el.find('Fermata') is not None or ferm: mods['fe'] = True; ferm = False
                            if fing and all(f for _, f in fing) and all(re.fullmatch(r'[1-5]', f) for _, f in fing):
                                fs = [f for _, f in sorted(fing, key=lambda x: pitch_order(x[0]))]
                                mods['f'] = ''.join(fs)
                            gl = pend.pop((sid, vi), None)
                            if gl: mods['gs' if (len(gl) == 1 and gl[0][1]) else 'g'] = '+'.join(g for g, _ in gl)
                            notes.append(KNote(t=T, dur=d, pitches=ps, rest=False, hidden=False, mods=mods, staff=sid, layer=vi, tie=bool(ties) and all(ties), line=mi, ptie=({p for p, t in zip(ps, ties) if t} if any(ties) and not all(ties) else None)))
                        pos += d
                    elif tag == 'Fermata':
                        ferm = True
            T0 += L
        total = T0
    # Fermaten auf Stimmenebene (MS3: <Fermata> vor dem Akkord)
    for staff_i, staff in enumerate(staves):
        pass
    # Taktstriche für build(): Ende jedes Takts, Wiederholungszeichen
    for i, (t, L) in enumerate(zip(mstarts, mlens)):
        tok = '='
        if repinfo[i]['end']: tok += ':|'
        if i + 1 < len(repinfo) and repinfo[i + 1]['start']: tok += '|:'
        bars.append((t + L, tok))
    if graces: warn.append(f'{graces} Nachschläge weggelassen')
    if pend: graces += sum(len(v) for v in pend.values()); warn.append('Vorschläge ohne Folgenote weggelassen')
    if gkept: warn.append(f'{gkept} Vorschlagsnoten übernommen')
    if ottava: warn.append(f'{ottava} Oktavierungslinien klingend notiert')
    r = build(notes, dyns, peds, bars, clefs, keys, times, [], None, None, total, warn)
    r['order'] = play_order(repinfo, voltas(staves[0]))
    for mi, num in voltas(staves[0]).items():
        if mi < len(r['measures']): r['measures'][mi]['volta'] = f'{num}.'
    r['title'] = title
    r['graces'] = graces
    return r


def pitch_order(p):
    m = re.match(r'([A-G])(##|#|bb|b)?(-?\d)', p)
    return int(m.group(3)) * 7 + 'CDEFGAB'.index(m.group(1))


def voltas(staff):
    """Taktindex -> Nummer der Volta (1, 2 …) für Takte unter einer Volta-Klammer."""
    out = {}; open_v = None
    for mi, meas in enumerate(staff.findall('Measure')):
        for v in meas.findall('voice'):
            for sp in v.findall('Spanner'):
                if sp.get('type') != 'Volta': continue
                if sp.find('next') is not None:
                    vo = sp.find('Volta'); ends = (vo.findtext('endings') if vo is not None else '1') or '1'
                    open_v = int(re.findall(r'\d+', ends)[0])
                    nxt = sp.find('next/location'); n = int(nxt.findtext('measures') or 1) if nxt is not None else 1
                    for k in range(n): out[mi + k] = open_v
    return out


def play_order(rep, volta):
    """Einfache Wiederholungs-Auflösung: |: … :| mit Volten."""
    n = len(rep); order = []; i = 0; start = 0; done = set(); passno = {}
    guard = 0
    while i < n and guard < 5000:
        guard += 1
        if rep[i]['start']: start = i
        v = volta.get(i)
        p = passno.get(start, 1)
        if v is not None and v != p:
            i += 1; continue
        order.append(i)
        if rep[i]['end'] and (i not in done):
            times = rep[i]['times'] or 2
            if p < times:
                passno[start] = p + 1
                if p + 1 >= times: done.add(i)
                i = start; continue
            start = i + 1
        i += 1
    return order


if __name__ == '__main__':
    r = convert(sys.argv[1])
    json.dump(r, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
    print('Takte', len(r['measures']), 'Tonart', r['key'], 'Takt', r['time'], 'Auftakt', r['pickup'], 'fehlerhaft', [b + 1 for b in r['bad']][:20], 'Vorschläge', r['graces'])
    for w in r['warn'][:12]: print('WARN', w)
