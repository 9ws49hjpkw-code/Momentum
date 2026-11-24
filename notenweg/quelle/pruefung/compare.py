import json, sys, bisect
from collections import Counter, defaultdict
sys.path.insert(0, '/home/claude/verify')
import refs, mapping
app = json.load(open('/home/claude/verify/app.json'))
ENH = lambda n: n.replace('##', 'x')
def measure_of(a, on):
    i = bisect.bisect_right(a['mstart'], on + 1e-6) - 1; return max(i, 0)
def compare(a, ref, shift=0.0):
    key = lambda on, m: (round(on, 3), m)
    A = defaultdict(list); R = defaultdict(list)
    for n in a['notes']: A[key(n[0], n[1])].append(n)
    for n in ref: R[key(n[0] + shift, n[1])].append(n)
    miss = []; extra = []; durd = []; spell = []
    for k in set(A) | set(R):
        x, y = sorted(A.get(k, []), key=lambda n: n[2]), sorted(R.get(k, []), key=lambda n: n[2])
        for j in range(max(len(x), len(y))):
            if j >= len(x): miss.append(y[j]); continue
            if j >= len(y): extra.append(x[j]); continue
            if abs(x[j][2] - y[j][2]) > 1e-3: durd.append((x[j], y[j]))
            if x[j][5] != y[j][3]: spell.append((x[j], y[j]))
    return miss, extra, durd, spell
def run(ids, verbose=False):
    rows = []
    for i in ids:
        a = app[i]
        for role, kind, path in mapping.refs(i):
            if kind == 'ly': continue
            try: ref, g = getattr(refs, {'dcml': 'dcml', 'kern': 'kern', 'xml': 'musicxml'}[kind])(path)
            except Exception as e: rows.append((i, role, kind, 'FEHLER ' + str(e)[:60])); continue
            best = None
            for shift in sorted({0.0, round(a['notes'][0][0] - ref[0][0], 4) if ref and a['notes'] else 0.0}):
                r = compare(a, ref, shift)
                sc = len(r[0]) + len(r[1]) + len(r[2])
                if best is None or sc < best[0]: best = (sc, shift, r, g)
            sc, shift, (miss, extra, durd, spell), g = best
            ms = sorted({measure_of(a, n[0] + shift) + 1 for n in miss} | {n[3] + 1 for n in extra} | {x[3] + 1 for x, y in durd})
            rows.append((i, role, kind, f"Ref {len(ref)} App {len(a['notes'])} | fehlt {len(miss)} zuviel {len(extra)} Dauer {len(durd)} Schreibw {len(spell)} | Vorschl. ref {g} app {a['graces']} | Takte {ms[:12]}{'…' if len(ms) > 12 else ''}" + (f' | Versatz {shift}' if shift else '')))
            if verbose:
                for n in sorted(miss)[:8]: print('  fehlt', i, 'T', measure_of(a, n[0] + shift) + 1, n)
                for n in sorted(extra)[:8]: print('  zuviel', i, 'T', n[3] + 1, n)
                for x, y in sorted(durd)[:8]: print('  dauer', i, 'T', x[3] + 1, x, '<>', y)
                for x, y in sorted(spell)[:8]: print('  schreibw', i, 'T', x[3] + 1, x[5], '<>', y[3])
    return rows
if __name__ == '__main__':
    ids = sys.argv[1:] or list(app)
    v = len(sys.argv[1:]) > 0 and len(ids) <= 3
    for r in run(ids, v): print(f'{r[0]:20s} {r[1]:6s} {r[2]:5s} {r[3]}')
