import json, sys, os
sys.path.insert(0, '/home/claude/momentum/notenweg/quelle/tools'); sys.path.insert(0, '/home/claude/verify')
import ly2nw, lymap
Q = '/home/claude/momentum/notenweg/quelle/src/stuecke/'
clean = lambda m: {k: v for k, v in m.items() if v not in ('', None)}
for i, f in lymap.LY.items():
    p = json.load(open(Q + i + '.json')); path = lymap.M + f
    if not os.path.exists(path): print(i, 'Datei fehlt'); continue
    try: r = ly2nw.convert(path)
    except Exception as e: print(f'{i:18s} FEHLER {str(e)[:90]}'); continue
    if isinstance(r, list): r = r[0]
    a, b = p['measures'], r['measures']
    d = [k for k in range(max(len(a), len(b))) if k >= len(a) or k >= len(b) or clean(a[k]) != clean(b[k])]
    print(f'{i:18s} App {len(a):3d} neu {len(b):3d} bad {r.get("bad", [])[:5]} versch. {len(d):3d} {d[:12]}')
