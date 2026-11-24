"""Humdrum **kern (two-staff piano) -> Notenweg engine measures.

Reads only data (the .krn text). Handles spine splits/joins, chords, ties, slurs,
triplets, articulations, ornaments, fermatas, dynamics spine (**dynam), pedal (*ped/*Xped),
clef/key/time changes, repeats via expansion lists (*>[...]) incl. numbered endings.
Unsupported things (e.g. quintuplets) mark the measure as bad instead of guessing."""
import re, sys, json
from fractions import Fraction as F

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from ly2nw import DUR_OF, split_notatable, gap_tokens, mark_trips, LyError

DUR_OF = dict(DUR_OF); DUR_OF[F(6)] = 'w.'
NORMAL = {k for k in DUR_OF}

SHARPS = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
MAJ_BY_N = {0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#', -1: 'F', -2: 'Bb', -3: 'Eb', -4: 'Ab', -5: 'Db', -6: 'Gb', -7: 'Cb'}
DYNS = {'ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff', 'sf', 'sfz', 'fz', 'fp', 'rf', 'rfz', 'sfp', 'sff', 'ffff', 'pppp'}


class KNote:
    __slots__ = ('t', 'dur', 'pitches', 'rest', 'hidden', 'mods', 'staff', 'layer', 'trip', 'tie', 'grace', 'line')

    def __init__(s, **k):
        s.mods = {}; s.pitches = []; s.rest = False; s.hidden = False; s.trip = False; s.tie = None; s.grace = False
        for a, b in k.items(): setattr(s, a, b)


def parse_dur(tok):
    m = re.search(r'(\d+)(%(\d+))?(\.*)', tok)
    if not m: return None
    r = int(m.group(1)); den = int(m.group(3)) if m.group(3) else 1
    if r == 0: base = F(8)
    else: base = F(4 * den, r)
    d = base; add = base
    for _ in m.group(4): add /= 2; d += add
    return d


def parse_pitch(sub):
    m = re.search(r'([a-gA-G])\1*', sub)
    if not m: return None
    run = m.group(0); L = run[0]
    if L.islower(): octv = 3 + len(run)
    else: octv = 4 - len(run)
    rest = sub[m.end():]
    acc = re.match(r'(##|#|--|-|n)?', rest).group(1) or ''
    a = {'': '', '#': '#', '##': '##', '-': 'b', '--': 'bb', 'n': ''}[acc]
    return L.upper() + a + str(octv)


def parse_token(tok):
    """one **kern token (may be a chord) -> dict"""
    subs = tok.split(' ')
    out = dict(pitches=[], rest=False, hidden=False, dur=None, mods={}, tie=None, grace=False, durs=[])
    ties = []
    for sub in subs:
        if not sub or sub == '.': continue
        if 'q' in sub or 'Q' in sub:
            out['grace'] = True
        d = parse_dur(sub)
        if d is None and not out['grace']: continue
        out['durs'].append(d)
        if out['dur'] is None: out['dur'] = d
        if 'r' in sub:
            out['rest'] = True
            if 'yy' in sub or re.search(r'r[^ ]*y', sub): out['hidden'] = True
            continue
        p = parse_pitch(sub)
        if p is None: continue
        out['pitches'].append(p)
        ties.append('[' in sub or '_' in sub)
        if '(' in sub: out['mods']['('] = out['mods'].get('(', 0) + sub.count('(')
        if ')' in sub: out['mods'][')'] = out['mods'].get(')', 0) + sub.count(')')
        if "'" in sub or '`' in sub: out['mods']['st'] = True
        if '~' in sub: out['mods']['tn'] = True
        if '^' in sub: out['mods']['ac'] = True
        if ';' in sub: out['mods']['fe'] = True
        if re.search(r'[Tt]', sub.replace('yy', '')): out['mods']['o'] = 'tr'
        elif re.search(r'[Mm]', sub): out['mods']['o'] = 'mord'
        elif re.search(r'[Ww]', sub): out['mods']['o'] = 'prall'
        elif re.search(r'[S$]', sub): out['mods']['o'] = 'turn'
        if 'z' in sub: out['mods']['ac'] = True
    if ties and all(ties): out['tie'] = True
    return out


def to_beats_token(d):
    """duration in quarter beats -> (engine base, is_triplet) or None"""
    if d in NORMAL: return DUR_OF[d], False
    b = d * F(3, 2)
    if b in NORMAL: return DUR_OF[b], True
    return None


def convert(path, title=None):
    lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
    spines = []  # each: dict(kind, staff)
    T = F(0)
    ends = []  # per spine: end time of current event
    notes = []
    dyns = []  # (t, staff, token)
    peds = []  # (t, staff, 'd'|'u')
    bars = []  # (t, barline token)
    clefs = {}  # staff -> [(t, clef)]
    keys = []  # (t, keyname)
    times = []  # (t, 'a/b')
    labels = []  # (t, label)
    expansion = None
    tempo = None
    warn = []; graces = [0]
    started = False
    pending_ped = []
    for ln, line in enumerate(lines):
        if not line or line.startswith('!!'): continue
        toks = line.split('\t')
        if line.startswith('**'):
            spines = [dict(kind=t, staff=None) for t in toks]
            kidx = [i for i, t in enumerate(toks) if t == '**kern']
            for k, i in enumerate(kidx): spines[i]['staff'] = len(kidx) - k  # rightmost kern spine = top staff
            ends = [F(0)] * len(spines)
            continue
        if not spines: continue
        if len(toks) != len(spines):
            raise LyError('line %d: %d tokens for %d spines' % (ln + 1, len(toks), len(spines)))
        if toks[0].startswith('!'): continue
        if toks[0].startswith('*'):
            # manipulators
            if any(t in ('*^', '*v', '*-', '*+', '*x') for t in toks):
                ns = []; ne = []; i = 0
                while i < len(toks):
                    t = toks[i]
                    if t == '*^':
                        ns += [dict(spines[i]), dict(spines[i])]; ne += [ends[i], ends[i]]; i += 1
                    elif t == '*v':
                        j = i
                        while j < len(toks) and toks[j] == '*v': j += 1
                        ns.append(dict(spines[i])); ne.append(max(ends[i:j])); i = j
                    elif t == '*-':
                        i += 1
                    elif t == '*x':
                        if i + 1 < len(toks) and toks[i + 1] == '*x':
                            ns += [dict(spines[i + 1]), dict(spines[i])]; ne += [ends[i + 1], ends[i]]; i += 2
                        else: ns.append(spines[i]); ne.append(ends[i]); i += 1
                    elif t == '*+':
                        ns += [dict(spines[i]), dict(kind='**unknown', staff=None)]; ne += [ends[i], T]; i += 1
                    else:
                        ns.append(spines[i]); ne.append(ends[i]); i += 1
                spines = ns; ends = ne
                continue
            for i, t in enumerate(toks):
                sp = spines[i]
                m = re.match(r'\*staff(\d+)$', t)
                if m: sp['staff'] = int(m.group(1))
                if sp['kind'] == '**dynam':
                    m = re.match(r'\*staff(\d+)/(\d+)$', t)
                    if m: sp['staff'] = min(int(m.group(1)), int(m.group(2)))
                if sp['kind'] != '**kern': continue
                m = re.match(r'\*clef([GF])(v?)(\d)$', t)
                if m:
                    c = 'treble' if m.group(1) == 'G' else 'bass'
                    clefs.setdefault(sp['staff'], []).append((T, c))
                m = re.match(r'\*k\[(.*)\]$', t)
                if m and i == first_kern(spines):
                    s = m.group(1); n = s.count('#') - s.count('-')
                    keys.append((T, MAJ_BY_N[n]))
                m = re.match(r'\*M(\d+)/(\d+)$', t)
                if m and i == first_kern(spines): times.append((T, '%s/%s' % (m.group(1), m.group(2))))
                m = re.match(r'\*MM(\d+)', t)
                if m and tempo is None: tempo = int(m.group(1))
                if t == '*ped': peds.append((T, sp['staff'], 'd'))
                if t == '*Xped': peds.append((T, sp['staff'], 'u'))
                if i == first_kern(spines):
                    m = re.match(r'\*>\[(.*)\]$', t)
                    if m: expansion = m.group(1).split(',')
                    m = re.match(r'\*>([A-Za-z0-9_]+)$', t)
                    if m: labels.append((T, m.group(1)))
            continue
        if toks[0].startswith('='):
            bars.append((T, toks[first_kern(spines)]))
            continue
        # data line
        layer_ct = {}
        for i, t in enumerate(toks):
            sp = spines[i]
            if sp['kind'] == '**kern':
                st = sp['staff']
                layer = layer_ct.get(st, 0); layer_ct[st] = layer + 1
                if t == '.': continue
                info = parse_token(t)
                if info['grace']:
                    graces[0] += 1; continue
                if info['dur'] is None: continue
                if len(set(info['durs'])) > 1:
                    # chord with mixed durations: keep longest group in this layer, others as extra layer
                    groups = {}
                    for sub in t.split(' '):
                        d = parse_dur(sub)
                        groups.setdefault(d, []).append(sub)
                    first = True
                    for d, subs in sorted(groups.items(), key=lambda x: -x[0]):
                        inf2 = parse_token(' '.join(subs))
                        n = KNote(t=T, dur=d, pitches=inf2['pitches'], rest=inf2['rest'], hidden=inf2['hidden'], mods=inf2['mods'], staff=st, layer=layer if first else 9, tie=inf2['tie'], line=ln)
                        notes.append(n); first = False
                    ends[i] = T + max(info['durs'])
                    continue
                n = KNote(t=T, dur=info['dur'], pitches=info['pitches'], rest=info['rest'], hidden=info['hidden'], mods=info['mods'], staff=st, layer=layer, tie=info['tie'], line=ln)
                notes.append(n)
                ends[i] = T + info['dur']
            elif sp['kind'] == '**dynam':
                if t != '.': dyns.append((T, sp['staff'], t))
        # a kern spine whose note ends exactly now still owes a token at this time -> zero-duration line
        if any(sp['kind'] == '**kern' and e == T for e, sp in zip(ends, spines)):
            continue
        nxt = [e for e, sp in zip(ends, spines) if sp['kind'] == '**kern' and e > T]
        if nxt: T = min(nxt)
    total = T
    r = build(notes, dyns, peds, bars, clefs, keys, times, labels, expansion, tempo, total, warn)
    r['graces'] = graces[0]
    return r


def first_kern(spines):
    for i, s in enumerate(spines):
        if s['kind'] == '**kern': return i
    return 0


def build(notes, dyns, peds, bars, clefs, keys, times, labels, expansion, tempo, total, warn):
    staves = sorted({n.staff for n in notes if n.staff is not None})
    if len(staves) == 0:
        staves = [None]
    if len(staves) > 2: raise LyError('more than 2 staves %s' % staves)
    if len(staves) == 2: slot = {staves[0]: 'r', staves[1]: 'l'}
    else: slot = {staves[0]: 'r'}
    # measure starts from barlines
    starts = [F(0)]
    barinfo = {}
    for (t, b) in bars:
        if t > starts[-1]: starts.append(t)
        barinfo.setdefault(t, []).append(b)
    if total > starts[-1]: starts.append(total)
    nM = len(starts) - 1
    if nM <= 0: raise LyError('no measures')

    def mindex(t):
        lo = 0
        for i in range(nM):
            if starts[i] <= t: lo = i
        return lo
    # pickup
    time0 = times[0][1] if times else '4/4'
    a, b = map(int, time0.split('/')); barlen = F(a * 4, b)
    pickup = starts[1] - starts[0] if nM > 1 and starts[1] - starts[0] < barlen else F(0)
    # dynamics attach
    for (t, st, tok) in dyns:
        tok = tok.strip()
        kind = None
        if tok in DYNS: kind = ('d', tok)
        elif tok.startswith('<'): kind = ('h', '<')
        elif tok.startswith('>'): kind = ('h', '>')
        elif tok in ('[', ']', '(', ')', '[[', ']]'): kind = ('h', '.')
        if not kind: continue
        cands = [n for n in notes if not n.rest and n.t >= t - F(1, 1000)]
        if not cands: continue
        best = min(cands, key=lambda n: (n.t - t, 0 if slot.get(n.staff) == 'r' else 1, n.layer))
        if kind[0] == 'd': best.mods.setdefault('d', kind[1])
        else: best.mods.setdefault('h', kind[1])
    # pedal
    for (t, st, k) in peds:
        sn = [n for n in notes if n.staff == st and not n.rest]
        if not sn: sn = [n for n in notes if not n.rest]
        if k == 'd':
            c = [n for n in sn if n.t >= t]
            if not c: continue
            n = min(c, key=lambda n: (n.t, n.layer))
            has_up = any(abs(t2 - t) < F(1, 64) and k2 == 'u' for (t2, s2, k2) in peds)
            n.mods['pc' if has_up and n.t > 0 else 'pd'] = True
        else:
            if any(abs(t2 - t) < F(1, 64) and k2 == 'd' for (t2, s2, k2) in peds): continue
            c = [n for n in sn if n.t + n.dur <= t + F(1, 1000)]
            if not c: continue
            n = max(c, key=lambda n: (n.t + n.dur, -n.layer))
            n.mods['pu'] = True
    # assign voices per staff/measure
    meas = [dict() for _ in range(nM)]
    bad = set()
    for st in staves:
        sl = slot[st]
        for mi in range(nM):
            m0, m1 = starts[mi], starts[mi + 1]
            L = m1 - m0
            ev = [n for n in notes if n.staff == st and m0 <= n.t < m1]
            layers = {}
            for n in ev: layers.setdefault(n.layer, []).append(n)
            voices = [[], [], []]          # bis zu drei Stimmen pro System (die dritte: Mittelstimme, Schlüssel r3/l3)

            def fits(v, n):
                for o in v:
                    if n.t < o.t + o.dur and o.t < n.t + n.dur: return False
                return True
            def merge(n):
                if n.rest: return False
                for v in voices:
                    for o in v:
                        if o.t == n.t and o.dur == n.dur and not o.rest:
                            o.pitches = list(o.pitches) + [p for p in n.pitches if p not in o.pitches]
                            for k, val in n.mods.items(): o.mods.setdefault(k, val)
                            o.tie = bool(o.tie and n.tie)
                            return True
                return False
            for lay in sorted(layers):
                tgt = 0 if lay == 0 else 1
                for n in sorted(layers[lay], key=lambda n: n.t):
                    if n.rest and n.hidden: continue
                    if fits(voices[tgt], n): voices[tgt].append(n)
                    elif lay >= 2 and merge(n): pass
                    elif fits(voices[1 - tgt], n): voices[1 - tgt].append(n)
                    elif merge(n): pass
                    elif not n.rest and fits(voices[2], n): voices[2].append(n)
                    else:
                        # identical rest duplicates are fine to drop
                        if n.rest: continue
                        bad.add(mi); warn.append('bar idx %d staff %s: >2 voices at %s' % (mi, sl, float(n.t - m0)))
            # a voice of only rests that duplicates nothing: drop rests-only second voice
            if voices[1] and all(n.rest for n in voices[1]): voices[1] = []
            if not voices[0] and voices[1]: voices = [voices[1], [], voices[2]]
            if voices[2] and not voices[1]: voices = [voices[0], voices[2], []]   # dritte Stimme rückt nach, wenn die zweite fehlt
            for vi, v in enumerate(voices):
                if not v and vi >= 1: continue
                try:
                    toks = voice_tokens(v, m0, L)
                except LyError as ex:
                    bad.add(mi); warn.append('measure %d staff %s: %s' % (mi, sl, ex)); toks = gap_tokens(L) if L else []
                key = sl + ('2' if vi == 1 else '3' if vi == 2 else '')
                if vi == 2: toks = [('x/' + t[2:]) if t.startswith('r/') else t for t in toks]   # Pausen der Mittelstimme ausblenden
                meas[mi][key] = ' '.join(toks) if toks else ''
            # whole-measure empty voice 1 -> full rest
            if not voices[0]:
                full = split_notatable(L) if L in NORMAL or L else []
                meas[mi][sl] = ' '.join(('r/' if len(full) == 1 else 'x/') + DUR_OF[g] for g in full)
    for m in meas:
        for sl in set(slot.values()):
            m.setdefault(sl, '')
    # clefs
    clefInit = {}
    for st, lst in clefs.items():
        if st not in slot: continue
        sl = slot[st]; default = 'treble' if sl == 'r' else 'bass'; cur = default
        for (t, c) in lst:
            if t == 0:
                if c != default: clefInit['treble' if sl == 'r' else 'bass'] = c
                cur = c; continue
            if c == cur: continue
            mi = mindex(t); loc = t - starts[mi]
            meas[mi].setdefault('clef', {}).setdefault(sl, []).append([float(loc), c])
            cur = c
    # key & time changes
    if keys and keys[0][0] > 0: keys = [(F(0), 'C')] + list(keys)   # keine Vorzeichnung am Anfang = C-Dur/a-Moll
    key0 = keys[0][1] if keys else 'C'
    curk = key0
    for (t, k) in keys[1:]:
        if k == curk: continue
        mi = mindex(t)
        if t != starts[mi]: warn.append('key change mid-measure'); bad.add(mi)
        meas[mi]['key'] = k; curk = k
    curt = time0
    for (t, tt) in times[1:]:
        if tt == curt: continue
        mi = mindex(t)
        meas[mi]['time'] = disp_time(tt); curt = tt
    # barlines
    for i in range(nM):
        bl = barinfo.get(starts[i + 1], [])
        for b in bl:
            if ':|' in b: meas[i]['end'] = ':|'
            if '|:' in b and i + 1 < nM: meas[i + 1]['begin'] = '|:'
            if b.startswith('==') and i == nM - 1: pass
            elif '||' in b and 'end' not in meas[i]: meas[i]['end'] = '||'
    # play order from expansion list
    order = list(range(nM))
    if expansion and labels:
        sec = {}
        lab = sorted(labels, key=lambda x: x[0])
        for k, (t, name) in enumerate(lab):
            a0 = mindex(t) if t < total else nM
            if t not in starts: a0 = mindex(t) + 1  # label in pickup bar region
            a1 = nM
            if k + 1 < len(lab):
                t2 = lab[k + 1][0]; a1 = mindex(t2) if t2 < total else nM
                if t2 not in starts: a1 = mindex(t2) + 1
            a0 = mindex(t) if t in starts or t == 0 else a0
            sec[name] = (a0, a1)
        try:
            order = []
            for name in expansion:
                a0, a1 = sec[name]
                order += list(range(a0, a1))
            # numbered endings -> volta marks
            for name, (a0, a1) in sec.items():
                m = re.match(r'^([A-Za-z]+)(\d)$', name)
                if m and m.group(1) in sec:
                    for q in range(a0, a1): meas[q]['volta'] = m.group(2) + '.'
        except KeyError as ex:
            warn.append('expansion label missing %s' % ex); order = list(range(nM))
    return dict(clefInit=clefInit, bad=sorted(bad), key=key0, time=disp_time(time0), pickup=float(pickup), measures=meas,
                order=order, warn=warn, bpm=tempo)


def disp_time(t):
    return {'4/4': 'C', '2/2': 'C|'}.get(t, t)


TUP_BASES = [F(2), F(1), F(1, 2), F(1, 4), F(1, 8), F(1, 16)]


def tup_ratio(d):
    """Dauer, die weder normal noch Triole ist -> (Verhältnis r = notiert->klingend, Grundwert v), z. B. 1/7 -> (4/7, 1/4)"""
    for v in TUP_BASES:
        if v / 2 < d < v:
            r = d / v
            if r.denominator <= 32: return r, v
    return None


def note_tok(n, base):
    if n.rest:
        return ('x/' if n.hidden else 'r/') + base
    ps = sorted(set(n.pitches), key=pitch_key)
    if not ps: return 'x/' + base          # Akkord ohne sichtbare Töne
    tok = (ps[0] if len(ps) == 1 else '(' + ' '.join(ps) + ')') + '/' + base
    mods = []; mm = n.mods
    for k in ('st', 'ac', 'tn', 'fe'):
        if mm.get(k): mods.append('!' + k)
    if mm.get('f'): mods.append('!f' + str(mm['f']))
    if mm.get('o'): mods.append('!o=' + mm['o'])
    if mm.get('g'): mods.append('!g=' + mm['g'])
    if mm.get('gs'): mods.append('!gs=' + mm['gs'])
    if mm.get('d'): mods.append('!d=' + mm['d'])
    if mm.get('h'): mods.append('!h=' + mm['h'])
    if mm.get('('): mods.append('!(')
    if mm.get('pc'): mods.append('!pc')
    elif mm.get('pd'): mods.append('!pd')
    if mm.get('pu'): mods.append('!pu')
    if n.tie: mods.append('!~')
    if mm.get(')'): mods.append('!)')
    return tok + ''.join(mods)


def voice_tokens(v, m0, L):
    v = sorted(v, key=lambda n: n.t)
    toks = []; pos = F(0)
    tg = None   # offene N-tole: dict(r, a, b, span, acc, i0)

    def close():
        nonlocal tg
        if tg:
            toks[tg['i0']] += '!N(=%d:%d' % (tg['a'], tg['b']); toks[-1] += '!N)'
        tg = None
    for n in v:
        o = n.t - m0
        if o > pos:
            g = o - pos
            if tg and (g / tg['r']) in DUR_OF and tg['acc'] + g <= tg['span']:
                toks.append('x/' + DUR_OF[g / tg['r']]); tg['acc'] += g; pos = o
                if tg['acc'] == tg['span']: close()
            else:
                close(); toks.extend(gap_tokens(g)); pos = o
        if o < pos: raise LyError('overlap')
        if tg and (n.dur / tg['r']) in DUR_OF and tg['acc'] + n.dur <= tg['span']:
            toks.append(note_tok(n, DUR_OF[n.dur / tg['r']])); tg['acc'] += n.dur; pos = o + n.dur
            if tg['acc'] == tg['span']: close()
            continue
        close()
        bt = to_beats_token(n.dur)
        if bt is None:
            tr = tup_ratio(n.dur)
            if tr:
                r, vv = tr
                tg = dict(r=r, a=r.denominator, b=r.numerator, span=r.numerator * vv, acc=F(0), i0=len(toks))
                toks.append(note_tok(n, DUR_OF[vv])); tg['acc'] += n.dur; pos = o + n.dur
                if tg['acc'] == tg['span']: close()
                continue
            # nicht direkt notierbare Dauer (z. B. 9/4): in übergebundene Teile zerlegen, an Schlaggrenzen
            parts = split_tied(o, n.dur)
            if parts is None: raise LyError('duration %s' % n.dur)
            t0 = n.t
            for k, d in enumerate(parts):
                last = k == len(parts) - 1
                n2 = KNote(t=t0, dur=d, pitches=n.pitches, rest=n.rest, hidden=n.hidden,
                           mods=(dict(n.mods) if k == 0 else {}) if not last else ({kk: vv for kk, vv in n.mods.items() if kk in (')', 'pu')} if k > 0 else dict(n.mods)),
                           staff=n.staff, layer=n.layer, tie=(True if not last else n.tie), line=n.line)
                if k == 0 and not last: n2.mods.pop(')', None); n2.mods.pop('pu', None)
                sub = voice_tokens_one(n2)
                toks.append(sub); t0 += d
            pos = o + n.dur
            continue
        base, trip = bt
        tok = note_tok(n, base) if not n.rest else (('x/' if n.hidden else 'r/') + base + ('!pu' if n.mods.get('pu') else ''))
        if trip: tok += '!T'
        toks.append(tok)
        pos = o + n.dur
    close()
    if pos < L: toks.extend(gap_tokens(L - pos))
    if pos > L: raise LyError('voice longer than measure')
    return mark_trips(toks)


def pitch_key(p):
    m = re.match(r'([A-G])(##|#|bb|b)?(-?\d)', p)
    return int(m.group(3)) * 7 + 'CDEFGAB'.index(m.group(1)), {'': 0, '#': 1, '##': 2, 'b': -1, 'bb': -2}[m.group(2) or '']


if __name__ == '__main__':
    r = convert(sys.argv[1])
    json.dump(r, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
    print('measures', len(r['measures']), 'key', r['key'], 'time', r['time'], 'pickup', r['pickup'], 'bad', r['bad'][:20], 'bpm', r['bpm'])
    for w in r['warn'][:15]: print('WARN', w)


def split_tied(o, d):
    """Dauer d ab Position o (im Takt) in notierbare Stücke zerlegen: erst bis zur nächsten Schlaggrenze."""
    out = []; pos = o; rest = d
    while rest > 0:
        nxt = (pos // 1 + 1) - pos if pos % 1 else F(1)
        take = None
        for cand in sorted(NORMAL, reverse=True):
            if cand <= rest and (cand <= nxt or pos % 1 == 0) and (pos % 1 == 0 or cand <= nxt):
                take = cand; break
        if take is None: return None
        out.append(take); pos += take; rest -= take
    return out


def voice_tokens_one(n):
    """ein einzelnes Token ohne Triolen (für zerlegte Dauern)"""
    base = DUR_OF[n.dur]
    if n.rest: return ('x/' if n.hidden else 'r/') + base
    ps = sorted(set(n.pitches), key=pitch_key)
    tok = (ps[0] if len(ps) == 1 else '(' + ' '.join(ps) + ')') + '/' + base
    mm = n.mods; mods = []
    for k in ('st', 'ac', 'tn', 'fe'):
        if mm.get(k): mods.append('!' + k)
    if mm.get('f'): mods.append('!f' + str(mm['f']))
    if mm.get('o'): mods.append('!o=' + mm['o'])
    if mm.get('g'): mods.append('!g=' + mm['g'])
    if mm.get('gs'): mods.append('!gs=' + mm['gs'])
    if mm.get('d'): mods.append('!d=' + mm['d'])
    if mm.get('h'): mods.append('!h=' + mm['h'])
    if mm.get('('): mods.append('!(')
    if mm.get('pc'): mods.append('!pc')
    elif mm.get('pd'): mods.append('!pd')
    if mm.get('pu'): mods.append('!pu')
    if n.tie: mods.append('!~')
    if mm.get(')'): mods.append('!)')
    return tok + ''.join(mods)
