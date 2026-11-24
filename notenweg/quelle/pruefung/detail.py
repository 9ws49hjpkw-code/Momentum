import json, sys
sys.path.insert(0, '/home/claude/verify')
import compare, mapping, refs
i = sys.argv[1]; which = int(sys.argv[2]) if len(sys.argv) > 2 else 0
a = compare.app[i]; rs = [r for r in mapping.refs(i) if r[1] != 'ly']
role, kind, path = rs[which]
ref, g = getattr(refs, {'dcml': 'dcml', 'kern': 'kern', 'xml': 'musicxml'}[kind])(path)
miss, extra, durd, spell = compare.compare(a, ref)
P = json.load(open('/home/claude/momentum/notenweg/quelle/src/stuecke/' + i + '.json'))['measures']
shown = set()
for x in sorted(miss)[:6]: print('FEHLT', x, 'Takt', compare.measure_of(a, x[0]) + 1)
for x in sorted(extra)[:6]: print('ZUVIEL', x)
for x, y in sorted(durd)[:6]: print('DAUER app', x, 'ref', y)
ms = sorted({compare.measure_of(a, x[0]) for x in miss} | {x[3] for x in extra} | {x[3] for x, y in durd})
for m in ms[:int(sys.argv[3]) if len(sys.argv) > 3 else 3]:
    print('--- Takt', m + 1, P[m])
