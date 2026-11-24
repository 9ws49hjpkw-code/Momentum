"""Taktweiser Vergleich App-Quelle gegen weitere Ausgaben (kern): je Takt Tonmenge (Einsatz im Takt, Tonhöhe)."""
import json, sys, bisect
from collections import Counter
sys.path.insert(0, '/home/claude/verify')
import refs, mapping, compare
def bars_of_kern(path):
    ref, g = refs.kern(path); B = [b for b in refs.LAST_BARS]
    if not B or B[0] != 0: B = [0] + B
    return ref, B
def per_bar(notes, B):
    d = {}
    for n in notes:
        i = bisect.bisect_right(B, n[0] + 1e-6) - 1
        d.setdefault(i, Counter())[(round(n[0] - B[i], 3), n[1])] += 1
    return d
def run(i):
    a = compare.app[i]
    srcs = [r for r in mapping.refs(i) if r[1] == 'kern']
    if len(srcs) < 2: return None
    A = per_bar(a['notes'], a['mstart'])
    others = []
    for role, kind, path in srcs:
        if role == 'quelle': continue
        ref, B = bars_of_kern(path); others.append(per_bar(ref, B))
    flagged = []
    for b in sorted(set(A) | set().union(*[set(o) for o in others])):
        mine = A.get(b, Counter())
        agree = [o.get(b, Counter()) == mine for o in others]
        if not any(agree): flagged.append(b + 1)
    return flagged, len(others), len(A)
if __name__ == '__main__':
    ids = sys.argv[1:] or [i for i in compare.app if len([r for r in mapping.refs(i) if r[1] == 'kern']) >= 2]
    for i in ids:
        r = run(i)
        if r: print(f'{i:22s} {len(r[0]):3d}/{r[2]} Takte ohne Bestätigung (Ausgaben: {r[1]}): {r[0][:25]}')
