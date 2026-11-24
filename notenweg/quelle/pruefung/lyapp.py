import sys, json
sys.path.insert(0,'/home/claude/verify')
import compare
from lyref import lyref
from lymap import LY, M
app = json.load(open('app.json'))
def run(i, verbose=False, n=10):
    a = app[i]
    L, g = lyref(M+LY[i])
    best=None
    for sh in {0.0, round(a['notes'][0][0]-L[0][0],4) if L else 0.0}:
        r = compare.compare(a, L, sh); sc=len(r[0])+len(r[1])+len(r[2])
        if best is None or sc<best[0]: best=(sc,sh,r)
    sc, sh, (mi, ex, du, sp) = best
    ms = sorted({compare.measure_of(a, x[0]+sh)+1 for x in mi} | {x[3]+1 for x in ex} | {x[3]+1 for x,y in du})
    print(f'{i:16s} ly {len(L):4d} app {len(a["notes"]):4d} | fehlt {len(mi)} zuviel {len(ex)} dauer {len(du)} schreibw {len(sp)} | vorschl ly {g} app {a["graces"]} | T {ms[:14]}' + (f' shift {sh}' if sh else ''))
    if verbose:
        for x in sorted(mi)[:n]: print('   fehlt T', compare.measure_of(a,x[0]+sh)+1, x)
        for x in sorted(ex)[:n]: print('   zuviel T', x[3]+1, x[:3], x[5])
        for x,y in sorted(du)[:n]: print('   dauer T', x[3]+1, x[:3], x[5], '<>', y[:3])
        for x,y in sorted(sp)[:n]: print('   schreibw T', x[3]+1, x[5], '<>', y[3])
if __name__=='__main__':
    ids = sys.argv[1:] or list(LY)
    for i in ids:
        try: run(i, len(sys.argv[1:])==1)
        except Exception as e: print(f'{i:16s} FEHLER {e!r}'[:150])
