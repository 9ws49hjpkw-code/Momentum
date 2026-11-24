import sys, json
sys.path.insert(0, '/home/claude/momentum/notenweg/quelle/tools')
import kern2nw
r = kern2nw.convert(sys.argv[1]); json.dump(r, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print('Takte', len(r['measures']), r['key'], r['time'], 'bad', r['bad'][:20]); [print('WARN', w) for w in r['warn'][:8]]
