import sys, json
sys.path.insert(0,'/home/claude/verify')
import refs, mapping, compare
from lyref import lyref
from lymap import LY, M
app = json.load(open('app.json'))
def cmp_lists(A, R):
    a = {'notes': [[n[0], n[1], n[2], 0, 0, n[3]] for n in A], 'mstart': [0]}
    best=None
    for sh in {0.0, round(A[0][0]-R[0][0],4) if A and R else 0.0}:
        r = compare.compare(a, R, sh); sc=len(r[0])+len(r[1])+len(r[2])
        if best is None or sc<best[0]: best=(sc,sh,r)
    return best
if __name__=='__main__':
    for i in sys.argv[1:]:
        try: L, g = lyref(M+LY[i])
        except Exception as e: print(i, 'LYFEHLER', repr(e)[:120]); continue
        for role, kind, path in mapping.refs(i):
            if kind=='ly': continue
            R, gr = getattr(refs, {'dcml':'dcml','kern':'kern','xml':'musicxml'}[kind])(path)
            sc, sh, (mi, ex, du, sp) = cmp_lists(L, R)
            print(f'{i:14s} ly-vs-{kind}: ly {len(L)} ref {len(R)} fehlt {len(mi)} zuviel {len(ex)} dauer {len(du)} schreibw {len(sp)} graces ly {g} ref {gr}')
def detail(i, k=0, n=8):
    L, g = lyref(M+LY[i]); kind,path = [(b,c) for a,b,c in mapping.refs(i) if b!='ly'][k]
    R, gr = getattr(refs, {'dcml':'dcml','kern':'kern','xml':'musicxml'}[kind])(path)
    sc, sh, (mi, ex, du, sp) = cmp_lists(L, R)
    for x in sorted(mi)[:n]: print(' fehlt', x)
    for x in sorted(ex)[:n]: print(' zuviel', x[:3], x[5])
    for x,y in sorted(du)[:n]: print(' dauer', x[:3], y[:3])
