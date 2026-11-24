import json
Q='/home/claude/momentum/notenweg/quelle/src/stuecke/'
app=json.load(open('app.json'))
def tl(t): return 4 if t in ('C','C|') else (lambda a,b: a*4/b)(*map(int,t.split('/')))
res={}
for i,a in app.items():
    p=json.load(open(Q+i+'.json')); cur=p['time']; odd=[]
    for k,m in enumerate(p['measures']):
        if m.get('time'): cur=m['time']
        L=a['mlen'][k]
        if abs(L-tl(cur))>1e-3 and k not in (0, len(p['measures'])-1): odd.append((k+1,L,tl(cur)))
    if odd: res[i]=odd
for i,o in res.items(): print(f'{i:22s}', len(o), o[:6])
