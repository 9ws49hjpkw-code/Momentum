import json, sys, difflib
sys.path.insert(0, '/home/claude/verify')
import refs
from lyref import lyref
from collections import defaultdict
B = '/home/claude/src/essen/europa/deutschl/boehme/'; M = '/home/claude/src/mutopia/ftp/'
SRC = {'tanne': B + 'deut2826.krn', 'jahre': B + 'deut2464.krn', 'froehlich': B + 'deut2940.krn', 'zion': B + 'deut2943.krn', 'kinder': B + 'deut2440.krn',
       'himmel': M + 'Anonymous/von_himmel_hoch/von_himmel_hoch.ly', 'joy': M + 'HandelGF/antioch/antioch.ly', 'adeste': M + 'WadeJF/adeste_fideles/adeste_fideles.ly',
       'adeste2': M + 'WadeJF/adeste/adeste.ly', 'noel': M + 'Traditional/first_noel/first_noel.ly', 'wenceslas': M + 'Anonymous/GoodKingWenceslas/GoodKingWenceslas.ly'}
NM = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
nm = lambda m: NM[m % 12] + str(m // 12 - 1)
def top(evs):
    by = defaultdict(list)
    for e in evs: by[round(float(e[0]), 4)].append(e)
    out = []
    for t in sorted(by):
        e = max(by[t], key=lambda x: x[1])
        if out and out[-1][0] + out[-1][2] > t + 1e-6 and out[-1][1] > e[1]: continue  # unter einer gehaltenen Oberstimme
        out.append((t, e[1], float(e[2])))
    return out
app = json.load(open('/home/claude/verify/lieder.json'))
for i, p in SRC.items():
    a = app[i.rstrip('2')]
    r = refs.kern(p)[0] if p.endswith('.krn') else lyref(p)[0]
    r = top(r)
    best = None
    for sc in (0.25, 0.5, 1, 2, 4):
        for sh in range(-14, 15):
            A = [(n[1], round(n[2], 3)) for n in a]; R = [(n[1] + sh, round(n[2] * sc, 3)) for n in r]
            sm = difflib.SequenceMatcher(None, A, R, autojunk=False); q = sm.ratio()
            if best is None or q > best[0]: best = (q, sc, sh, sm, A, R)
    q, sc, sh, sm, A, R = best
    print(f'{i:10s} app {len(A)} ref {len(R)} Übereinstimmung {q:.3f} (Dauer x{sc}, transp {sh:+d})')
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op != 'equal': print(f'   {op} app#{a1}-{a2} (T~{a[a1][0] if a1 < len(a) else "-"}) {[nm(x)+"/"+str(d) for x, d in A[a1:a2]]} <> ref {[nm(x)+"/"+str(d) for x, d in R[b1:b2]]}')
