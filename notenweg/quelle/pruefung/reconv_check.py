import json, sys, subprocess
sys.path.insert(0, '/home/claude/momentum/notenweg/quelle/tools'); sys.path.insert(0, '/home/claude/verify')
import kern2nw, mscx2nw, mapping
Q = '/home/claude/momentum/notenweg/quelle/src/stuecke/'
def raw_for(i):
    r = mapping.refs(i)[0]
    _, kind, path = r
    if kind == 'kern': return kern2nw.convert(path)
    if kind == 'dcml':
        ms = path.replace('/notes/', '/MS3/').replace('.notes.tsv', '.mscx').replace('.tsv', '.mscx')
        return mscx2nw.convert(ms)
    return None
def diff(i):
    p = json.load(open(Q + i + '.json')); r = raw_for(i)
    if r is None: return None
    a, b = p['measures'], r['measures']
    clean = lambda m: {k: v for k, v in m.items() if v not in ('', None)}
    d = [k for k in range(max(len(a), len(b))) if k >= len(a) or k >= len(b) or clean(a[k]) != clean(b[k])]
    return len(a), len(b), d, r.get('bad')
if __name__ == '__main__':
    for i in sys.argv[1:]:
        try: print(i, diff(i))
        except Exception as e: print(i, 'FEHLER', e)
