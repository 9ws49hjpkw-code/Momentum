"""Satie, Gymnopédie Nr. 1 – Sonderkonverter für die Mutopia-Quelle (gymnopedie_1.ly, gemeinfrei).
Die Begleitakkorde wechseln in der Quelle zwischen den Systemen (\\change Staff); das löst dieser kleine,
nur auf diese Datei zugeschnittene Parser auf. Aufruf: python3 gymnopedie1.py quelle.ly ausgabe.json"""
import re, sys, json
from fractions import Fraction as F

STEPS = 'cdefgab'
LET = 'CDEFGAB'


def body(src, name):
    i = src.index(name + ' =')
    j = src.index('{', i); d = 0
    for k in range(j, len(src)):
        if src[k] == '{': d += 1
        elif src[k] == '}':
            d -= 1
            if d == 0: return src[j + 1:k]


class Rel:
    def __init__(s, ref): s.ref = ref            # (step index 0-6, octave)
    def pitch(s, name, marks, chord_inner=False):
        st = STEPS.index(name[0]); acc = name[1:]
        alter = {'': 0, 'is': 1, 'es': -1, 'isis': 2, 'eses': -2, 's': -1}[acc]
        rs, ro = s.ref
        best = None
        for o in (ro - 1, ro, ro + 1):
            dist = (o * 7 + st) - (ro * 7 + rs)
            if abs(dist) <= 3 and (best is None or abs(dist) < abs(best[1])): best = (o, dist)
        o = best[0] + marks.count("'") - marks.count(',')
        s.ref = (st, o)
        return (st, o, alter)


def name(p):
    st, o, a = p
    return LET[st] + {0: '', 1: '#', -1: 'b', 2: '##', -2: 'bb'}[a] + str(o)


TOK = re.compile(r"@O\{|\}@|<<|>>|\\change Staff=(\w+)|\\context Voice = \"\w+\"|\\(rest|pp|p|f|<|>|!)(?![a-zA-Z])|\\[a-zA-Z.]+(?:\s*#?[-\d.]+)?|\{|\}|<([^>]*)>(\d*\.*)|([a-gs]|R|r)(isis|eses|is|es|s)?([',]*)(\d*)(\.*)|~|\(|\)|\|")


def parse(text, ref):
    """-> Liste von Ereignissen: dict(t, dur, pitches, rest, mods, staff)"""
    text = re.sub(r'%.*', '', text)
    text = re.sub(r'\\markup\{[^}]*\}|\^\\markup\{[^}]*\}', '', text)
    text = re.sub(r'(\\once)?\\override\s+[\w.-]+\s*=\s*##?[-\w.]+', ' ', text)
    text = re.sub(r'\\barNumberCheck\s*#\d+|\\bar\s*"[^"]*"|\\repeat volta 2|\\alternative|\\(stemUp|stemDown|dynamicUp|slurUp)', ' ', text)
    rel = Rel(ref); t = F(0); dur = F(1); ev = []; staff = None; last = None; lane = 'm'; t_save = None
    for m in TOK.finditer(text):
        g = m.group(0)
        if g == '@O{': lane = 'o'; t_save = t; continue
        if g == '}@': lane = 'm'; t = t_save; continue
        if m.group(1): staff = m.group(1); continue
        if m.group(2):
            k = m.group(2)
            if k == 'rest' and last: last['rest'] = True; last['pitches'] = []; last['hidden'] = False
            elif last is not None:
                if k in ('pp', 'p', 'f'): last['mods']['d'] = k
                elif k == '<': last['mods']['h'] = '<'
                elif k == '>': last['mods']['h'] = '>'
                elif k == '!': last['mods']['end'] = True
            continue
        if g == '~' and last: last['mods']['~'] = True; continue
        if g == '(' and last: last['mods']['('] = True; continue
        if g == ')' and last: last['mods'][')'] = True; continue
        if m.group(3) is not None:                       # Akkord
            inner = m.group(3).split(); ps = []
            save = None
            for k, x in enumerate(inner):
                mm = re.match(r"([a-g])(isis|eses|is|es|s)?([',]*)", x)
                p = rel.pitch(mm.group(1) + (mm.group(2) or ''), mm.group(3))
                if k == 0: save = rel.ref
                ps.append(p)
            rel.ref = save
            if m.group(4): dur = dlen(m.group(4))
            last = dict(t=t, dur=dur, pitches=ps, rest=False, mods={}, staff=staff, lane=lane); ev.append(last); t += dur
            continue
        if m.group(5):
            n = m.group(5); d = m.group(8) + m.group(9)
            if d: dur = dlen(d)
            if n in ('r', 'R', 's'):
                last = dict(t=t, dur=dur, pitches=[], rest=True, hidden=n == 's', mods={}, staff=staff, lane=lane)
            else:
                p = rel.pitch(n + (m.group(6) or ''), m.group(7) or '')
                last = dict(t=t, dur=dur, pitches=[p], rest=False, mods={}, staff=staff, lane=lane)
            ev.append(last); t += dur
    return ev


def dlen(s):
    m = re.match(r'(\d+)(\.*)', s); d = F(4, int(m.group(1))); a = d
    for _ in m.group(2): a /= 2; d += a
    return d


DUR = {F(3): 'h.', F(2): 'h', F(1): 'q'}


def tok(e):
    if e['rest']: return ('x/' if e.get('hidden') else 'r/') + DUR[e['dur']]
    ps = sorted(e['pitches'], key=lambda p: (p[1] * 7 + p[0]))
    s = (name(ps[0]) if len(ps) == 1 else '(' + ' '.join(name(p) for p in ps) + ')') + '/' + DUR[e['dur']]
    mm = e['mods']
    if 'd' in mm: s += '!d=' + mm['d']
    if 'h' in mm: s += '!h=' + mm['h']
    elif mm.get('end'): s += '!h=.'
    if mm.get('('): s += '!('
    if mm.get('~'): s += '!~'
    if mm.get(')'): s += '!)'
    return s


def bars(ev, n=47):
    out = [[] for _ in range(n)]
    for e in ev:
        out[int(e['t'] // 3)].append(e)
    return out


def main(src, dst):
    s = open(src).read()
    top = bars(parse(body(s, 'top'), (0, 5)))
    mid_text = body(s, 'middle'); mid = bars(parse(mid_text, (0, 4)))
    bot_text = body(s, 'bottom')
    # Takt 37 und 45: zweite Bassstimme << \\context Voice = "othervoice" { … } … >>, relativ der Reihe nach wie LilyPond
    bot_text = re.sub(r'<<\s*\\context Voice = "othervoice"\s*\{([^}]*)\}\s*([^>]*)>>', r'@O{ \1 }@ \2', bot_text)
    allb = parse(bot_text, (0, 3))
    bot = bars([e for e in allb if e.get('lane') != 'o'])
    oth = bars([e for e in allb if e.get('lane') == 'o'])
    meas = []
    for i in range(47):
        r = ' '.join(tok(e) for e in top[i]); m2 = ' '.join(tok(e) for e in mid[i]); b = ' '.join(tok(e) for e in bot[i])
        in_bass = any(e['staff'] == 'bass' for e in mid[i]) or (18 <= i <= 30)
        M = {'r': r, 'l': b}
        if m2 and not all(e['rest'] and e.get('hidden') for e in mid[i]):
            if in_bass: M = {'r': r, 'l': m2, 'l2': b}
            else: M['r2'] = m2
        meas.append(M)
    for idx in (36, 44):
        meas[idx]['l2'] = meas[idx]['l']; meas[idx]['l'] = ' '.join(tok(e) for e in oth[idx])
    for k in (31, 39): meas[k]['volta'] = '1.' if k == 31 else '2.'
    for k in range(32, 39): meas[k]['volta'] = '1.'
    for k in range(40, 47): meas[k]['volta'] = '2.'
    meas[0]['begin'] = '|:'; meas[38]['end'] = ':|'; meas[46]['end'] = '|.'
    order = list(range(0, 39)) + list(range(0, 31)) + list(range(39, 47))
    json.dump({'key': 'D', 'time': '3/4', 'pickup': 0, 'measures': meas, 'order': order}, open(dst, 'w'), ensure_ascii=False, indent=0)
    for i, m in enumerate(meas[:12] + meas[17:22] + meas[35:40]): print(m)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
