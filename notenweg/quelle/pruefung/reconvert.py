"""Alle Stücke mit kern-/DCML-Quelle neu konvertieren (Vorschläge, einzelne Haltebögen, 3 Stimmen, N-tolen).
Texte und Felder bleiben, nur Notendaten werden ersetzt. Patches aus den Skripten werden wieder angewendet."""
import json, sys, re, os
sys.path.insert(0, '/home/claude/momentum/notenweg/quelle/tools'); sys.path.insert(0, '/home/claude/verify')
import kern2nw, mscx2nw, mapping
Q = '/home/claude/momentum/notenweg/quelle/src/stuecke/'
PATCH = {'therese': {4: {'time': 'C'}}, 'fantaisie-impromptu': {2: {'l': 'C#3/8!(!3( G#3/8 C#4/8 E4/8 C#4/8 G#3/8!) C#3/8!( G#3/8 C#4/8 E4/8 C#4/8 G#3/8!)!3)', 'l2': 'C#2/8 x/8 x/h.'}}}
def convert(i):
    rs = mapping.refs(i)
    if not rs or rs[0][0] != 'quelle' or rs[0][1] not in ('kern', 'dcml'): return None
    _, kind, path = rs[0]
    if kind == 'kern': return kern2nw.convert(path)
    ms = path.replace('/notes/', '/MS3/').replace('.notes.tsv', '.mscx').replace('.tsv', '.mscx')
    return mscx2nw.convert(ms)
def apply(i, dry=False):
    p = json.load(open(Q + i + '.json')); r = convert(i)
    if r is None: return None
    ms = r['measures']
    for mi, ch in PATCH.get(i, {}).items():
        for k, v in ch.items():
            if v is None: ms[mi].pop(k, None)
            else: ms[mi][k] = v
    bad = [b for b in r.get('bad', []) if b not in PATCH.get(i, {})]
    for m in ms:
        for k in ('r2', 'l2', 'r3', 'l3'):
            if k in m and not m[k]: del m[k]
    info = dict(bad=bad, n_old=len(p['measures']), n_new=len(ms), order_changed=(p.get('order') != (r.get('order') or list(range(len(ms))))),
                key=(p.get('key'), r.get('key')), time=(p.get('time'), r.get('time')), pickup=(p.get('pickup'), r.get('pickup')))
    if not dry and not bad:
        p['measures'] = ms; p['key'] = r.get('key') or p['key']; p['time'] = r.get('time') or p['time']; p['pickup'] = float(r.get('pickup') or 0)
        if r.get('clefInit'): p['clefInit'] = r['clefInit']
        else: p.pop('clefInit', None)
        p['order'] = r.get('order') or list(range(len(ms)))
        json.dump(p, open(Q + i + '.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    return info
if __name__ == '__main__':
    dry = '--dry' in sys.argv
    ids = [a for a in sys.argv[1:] if not a.startswith('--')] or json.load(open(Q + '_reihenfolge.json'))
    for i in ids:
        try:
            info = apply(i, dry)
            if info is None: continue
            flag = [k for k in ('order_changed',) if info[k]] + (['BAD %s' % info['bad'][:8]] if info['bad'] else []) + \
                   [f'{k} {info[k]}' for k in ('key', 'time', 'pickup') if info[k][0] != info[k][1] and not (k == 'pickup' and float(info[k][0] or 0) == float(info[k][1] or 0))] + \
                   ([f"Takte {info['n_old']}->{info['n_new']}"] if info['n_old'] != info['n_new'] else [])
            print(f'{i:22s}', 'ok' if not flag else ' | '.join(flag))
        except Exception as e: print(f'{i:22s} FEHLER {e}')
