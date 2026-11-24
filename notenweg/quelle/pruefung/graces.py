import sys, json, subprocess, re
sys.path.insert(0, '/home/claude/verify')
from lyref import Ly
from lymap import LY, M
Q = '/home/claude/momentum/notenweg/quelle/src/stuecke/'
def plan(i):
    L = Ly(M + LY[i]); L.score = 0; evs, _ = L.run()
    pos = json.loads(subprocess.check_output(['node', '/home/claude/verify/tokpos.js', i]))
    app = json.load(open('/home/claude/verify/app.json'))[i]
    best = None
    for sh in {0.0, round(app['notes'][0][0] - float(evs[0][0]), 4)}:
        res = []; miss = []
        for g in L.gevents:
            t, midi, kind, seqs = g
            c = [p for p in pos if abs(p[3] - (float(t) + sh)) < 1e-3 and midi in p[4]]
            if len(c) == 1: res.append((c[0], kind, seqs))
            else: miss.append((g, len(c)))
        if best is None or len(miss) < len(best[1]): best = (res, miss, sh)
    return best, L.after
def apply(i, write=False):
    (res, miss, sh), after = plan(i)
    p = json.load(open(Q + i + '.json')); n = 0
    for (mi, k, j, t, mids, has), kind, seqs in res:
        v = p['measures'][mi][k]; sp = [x.span() for x in re.finditer(r'\([^)]*\)\S*|\S+', v.replace(',', ' '))]
        a, b = sp[j]; tok = v[a:b]
        assert not has and '!g' not in tok, (i, mi, tok)
        key = 'gs' if kind in ('\\acciaccatura', '\\slashedGrace') else 'g'
        tok += '!' + key + '=' + '+'.join('&'.join(c) for c in seqs)
        p['measures'][mi][k] = v[:a] + tok + v[b:]; n += sum(len(c) for c in seqs)
        print(f'  T{mi+1} {k}: {tok}')
    print(i, 'gesetzt', n, 'Töne in', len(res), 'Gruppen | nicht zugeordnet', miss, '| Nachschläge', after, '| shift', sh)
    if write and not miss:
        t = open(Q + i + '.json').read(); open(Q + i + '.json', 'w').write(json.dumps(p, ensure_ascii=False) + ('\n' if t.endswith('\n') else ''))
if __name__ == '__main__':
    w = sys.argv[1] == '-w'; ids = sys.argv[2:] if w else sys.argv[1:]
    for i in ids: apply(i, w)
