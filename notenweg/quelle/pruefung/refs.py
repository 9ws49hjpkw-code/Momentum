BARS = []
LAST_BARS = []
"""Unabhängige Referenz-Notenlisten: DCML notes.tsv, Humdrum **kern (eigener, neuer Parser), MusicXML (ASAP).
Ausgabe je Stück: Liste (onset_qb, midi, dur_qb) in schriftlicher Reihenfolge, Haltebögen verschmolzen, ohne Vorschläge."""
import csv, re, sys, json
from fractions import Fraction as F
import xml.etree.ElementTree as ET

def merge_ties(evs):
    """evs: (onset, midi, dur, tie, key) mit tie in {None,'start','mid','end'} -> verschmolzen"""
    out = []; open_ = {}
    for on, midi, dur, tie, key, name in sorted(evs, key=lambda e: (e[0], e[1])):
        k = (key, midi)
        if tie in ('mid', 'end') and k in open_ and abs(open_[k][0] + open_[k][2] - on) < F(1, 1000):
            o = open_[k]; o[2] += dur
            if tie == 'end': del open_[k]
            continue
        n = [on, midi, dur, name]; out.append(n)
        if tie in ('start', 'mid'): open_[k] = n
    return [(float(a), b, float(c), d) for a, b, c, d in out]

def dcml(path):
    rows = list(csv.DictReader(open(path, encoding='utf-8'), delimiter='\t'))
    evs = []; graces = 0
    for r in rows:
        if r.get('gracenote') or F(r['duration_qb']) == 0: graces += 1; continue
        qb = r.get('quarterbeats_all_endings') or r['quarterbeats']
        on = F(qb); dur = F(r['duration_qb']); t = r['tied']
        tie = {'1': 'start', '0': 'mid', '-1': 'end'}.get(t)
        evs.append((on, int(r['midi']), dur, tie, r['staff'], r['name']))
    return merge_ties(evs), graces

# ---------- Humdrum **kern, eigener Parser ----------
PC = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}
def kdur(tok):
    m = re.search(r'(\d+)(%(\d+))?(\.*)', tok)
    if not m: return None
    n = int(m.group(1)); d = int(m.group(3)) if m.group(3) else 1
    base = F(4) * d / n if n != 0 else F(8)   # 0 = Brevis
    dots = len(m.group(4)); tot = base; add = base
    for _ in range(dots): add /= 2; tot += add
    return tot
def kname(tok):
    m = re.search(r'([a-gA-G])\1*', tok); s = m.group(0); L = s[0].upper()
    octv = 4 + (len(s) - 1) if s[0].islower() else 3 - (len(s) - 1)
    am = re.match(r'(#+|-+)?', tok[m.end():]); a = am.group(1) or ''
    return L + a.replace('-', 'b') + str(octv)
def kpitch(tok):
    m = re.search(r'([a-gA-G])\1*', tok)
    if not m: return None
    s = m.group(0); L = s[0].lower()
    octv = 4 + (len(s) - 1) if s[0].islower() else 3 - (len(s) - 1)
    rest = tok[m.end():]
    acc = 0
    am = re.match(r'(#+|-+|n)?', rest)
    if am and am.group(1):
        a = am.group(1); acc = len(a) if a[0] == '#' else -len(a) if a[0] == '-' else 0
    return (octv + 1) * 12 + PC[L] + acc
def kern(path, staves_from=None):
    global BARS
    BARS = []
    lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
    spines = None   # list of dict(kind, busy, id)
    T = F(0); evs = []; graces = 0; sid = 0
    for ln in lines:
        if not ln or ln.startswith('!!'): continue
        f = ln.split('\t')
        if ln.startswith('**'):
            spines = []
            for x in f: sid += 1; spines.append({'kind': x, 'busy': F(0), 'id': sid, 'root': sid})
            continue
        if spines is None: continue
        if ln.startswith('*'):
            new = []; i = 0; k = 0
            while i < len(f):
                x = f[i]; sp = spines[i]
                if x == '*^': new += [dict(sp), dict(sp, id=sp['id'] * 100 + 1)]
                elif x == '*v':
                    j = i
                    while j + 1 < len(f) and f[j + 1] == '*v': j += 1
                    new.append(dict(sp, busy=max(s['busy'] for s in spines[i:j + 1]))); i = j
                elif x == '*-': pass
                else: new.append(sp)
                i += 1
            if any(x == '*+' for x in f): raise ValueError('*+ nicht unterstützt')
            spines = new; continue
        if ln.startswith('!') : continue
        if ln.startswith('='):
            BARS.append(T); continue
        # Datenzeile
        starts = []
        for x, sp in zip(f, spines):
            if sp['kind'] != '**kern' or x == '.': continue
            first_d = None
            for sub in x.split(' '):
                if 'q' in sub or 'Q' in sub:
                    if re.search('[a-gA-G]', sub): graces += 1
                    continue
                d = kdur(sub)
                if d is None and first_d is not None and re.search('[a-gA-G]', sub): d = first_d
                if d is None: continue
                if first_d is None: first_d = d
                sp['busy'] = T + d; starts.append(d)
                if 'r' in sub: continue
                p = kpitch(sub)
                if p is None: continue
                tie = 'start' if '[' in sub else 'mid' if '_' in sub else 'end' if ']' in sub else None
                evs.append((T, p, d, tie, sp['root'], kname(sub)))
        # Zeitfortschritt: nächstes Ereignis = minimales busy > T
        # Zeilendauer = kleinste Restdauer aller **kern-Spuren (0, wenn eine Spur genau hier endet: Platzhalterzeile)
        cand = [sp['busy'] - T for sp in spines if sp['kind'] == '**kern']
        T = T + max(F(0), min(cand)) if cand else T
    global LAST_BARS
    LAST_BARS = sorted(set(BARS))
    return merge_ties(evs), graces

# ---------- MusicXML (ASAP) ----------
STEP = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def musicxml(path):
    root = ET.parse(path).getroot()
    evs = []; graces = 0
    for part in root.findall('part'):
        T = F(0); div = 1
        for meas in part.findall('measure'):
            t = T; mlen = F(0); last_on = T
            for el in meas:
                if el.tag == 'attributes':
                    d = el.findtext('divisions')
                    if d: div = int(d)
                elif el.tag == 'backup': t -= F(int(el.findtext('duration')), div)
                elif el.tag == 'forward': t += F(int(el.findtext('duration')), div); mlen = max(mlen, t - T)
                elif el.tag == 'note':
                    if el.find('grace') is not None:
                        if el.find('rest') is None: graces += 1
                        continue
                    dur = F(int(el.findtext('duration') or 0), div)
                    chord = el.find('chord') is not None
                    on = last_on if chord else t
                    if el.find('rest') is None and el.find('pitch') is not None:
                        p = el.find('pitch'); midi = (int(p.findtext('octave')) + 1) * 12 + STEP[p.findtext('step')] + int(float(p.findtext('alter') or 0))
                        ties = [x.get('type') for x in el.findall('tie')]
                        tie = 'mid' if ('start' in ties and 'stop' in ties) else 'start' if 'start' in ties else 'end' if 'stop' in ties else None
                        al = int(float(p.findtext('alter') or 0))
                        evs.append((on, midi, dur, tie, (part.get('id'), el.findtext('staff') or '1'), p.findtext('step') + {-2: 'bb', -1: 'b', 0: '', 1: '#', 2: '##'}[al] + p.findtext('octave')))
                    if not chord: last_on = t; t += dur
                    mlen = max(mlen, t - T)
            T += mlen
    return merge_ties(evs), graces

if __name__ == '__main__':
    kind, path = sys.argv[1], sys.argv[2]
    r, g = {'dcml': dcml, 'kern': kern, 'xml': musicxml}[kind](path)
    print(len(r), 'Noten,', g, 'Vorschläge'); print(r[:10])
