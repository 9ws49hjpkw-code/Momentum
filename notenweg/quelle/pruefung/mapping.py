import re, glob, json, os
S = '/home/claude/src'
Q = '/home/claude/momentum/notenweg/quelle'
def fmap():
    m = {}
    for sc in sorted(glob.glob(Q + '/tools/neue_stuecke_*.py')):
        t = open(sc).read()
        for x in re.finditer(r"(?:dict\(id=|N\()'([^']+)',\s*(?:f=)?'([^']+)'", t): m[x.group(1)] = x.group(2)
    return m
def kp(repo, f): return ('kern', f'{S}/{repo}/kern/{f}.krn')
def dp(repo, f):
    a = f'{S}/{repo}/notes/{f}.notes.tsv'
    return ('dcml', a if os.path.exists(a) else f'{S}/{repo}/notes/{f}.tsv')
def xp(d): return ('xml', f'{S}/asap/{d}/xml_score.musicxml')
NEW_DCML = {'op': None}
def source_of(i, f):
    if f.startswith('kern/'):
        repo, fn = f[5:].split('__'); return kp(repo, fn)
    if f.startswith('dcml/'):
        repo, fn = f[5:].split('__'); return dp(repo, fn)
    if f.startswith('ly/') or f == 'gymno1': return ('ly', f)
    if re.match(r'op\d+n\d+', f): return dp('grieg_lyric_pieces', f)
    if re.match(r'op37a\d+', f): return dp('tchaikovsky_seasons', f)
    if f.startswith('l075'): return dp('debussy_suite_bergamasque', f)
    if f.startswith('l113'): return dp('debussy_childrens_corner', f)
    if re.match(r'l\d+_', f): return dp('debussy_other_piano_pieces', f)
    if re.match(r'n\d\d$', f): return dp('schumann_kinderszenen', f)
    if f.startswith('prelude28'): return kp('chopin-preludes', f)
    if re.match(r'\d{3}', f): return kp('humdrum-chopin-first-editions', f)
    raise KeyError(f)
ART = {  # Stücke aus der Artifact-Zeit (ohne Skript)
    'prelude-c': kp('chopin-preludes', 'prelude28-20'), 'prelude-e': kp('chopin-preludes', 'prelude28-04'),
    'prelude-a': kp('chopin-preludes', 'prelude28-07'), 'prelude-b': kp('chopin-preludes', 'prelude28-06'),
    'k545-1': kp('mozart-piano-sonatas', 'sonata15-1'), 'k545-2': kp('mozart-piano-sonatas', 'sonata15-2'),
    'op49-2-1': kp('beethoven-piano-sonatas', 'sonata20-1'), 'op49-2-2': kp('beethoven-piano-sonatas', 'sonata20-2'),
    'pathetique-2': kp('beethoven-piano-sonatas', 'sonata08-2'), 'alla-turca': kp('mozart-piano-sonatas', 'sonata11-3'),
    'mondschein-2': kp('beethoven-piano-sonatas', 'sonata14-2'), 'mazurka-g': kp('chopin-mazurkas', 'mazurka67-2'),
}
SECOND = {  # unabhängige Zweitausgaben
    'k545-1': [dp('mozart_piano_sonatas', 'K545-1')], 'k545-2': [dp('mozart_piano_sonatas', 'K545-2')],
    'alla-turca': [dp('mozart_piano_sonatas', 'K331-3'), xp('Mozart/Piano_Sonatas/11-3')],
    'k331-thema': [dp('mozart_piano_sonatas', 'K331-1')], 'k284-thema': [dp('mozart_piano_sonatas', 'K284-3')],
    'k282-menuett': [dp('mozart_piano_sonatas', 'K282-2')], 'kv457-1': [dp('mozart_piano_sonatas', 'K457-1')], 'kv576-3': [dp('mozart_piano_sonatas', 'K576-3')],
    'op49-2-1': [dp('beethoven_piano_sonatas', '20-1')], 'op49-2-2': [dp('beethoven_piano_sonatas', '20-2')],
    'pathetique-2': [dp('beethoven_piano_sonatas', '08-2'), xp('Beethoven/Piano_Sonatas/8-2')],
    'mondschein-2': [dp('beethoven_piano_sonatas', '14-2')], 'mondschein': [dp('beethoven_piano_sonatas', '14-1'), kp('beethoven-piano-sonatas', 'sonata14-1')],
    'op14-1-2': [dp('beethoven_piano_sonatas', '09-2')], 'op14-2-2': [dp('beethoven_piano_sonatas', '10-2')], 'op28-2': [dp('beethoven_piano_sonatas', '15-2')],
    'op31-3-menuett': [dp('beethoven_piano_sonatas', '18-3'), xp('Beethoven/Piano_Sonatas/18-3')],
    'appassionata-2': [dp('beethoven_piano_sonatas', '23-2')], 'appassionata-3': [dp('beethoven_piano_sonatas', '23-3')],
    'therese': [dp('beethoven_piano_sonatas', '24-1'), xp('Beethoven/Piano_Sonatas/24-1')], 'sturm-3': [dp('beethoven_piano_sonatas', '17-3'), xp('Beethoven/Piano_Sonatas/17-3')],
    'mazurka-g': [dp('chopin_mazurkas', 'BI167op67-2')], 'mazurka-33-3': [dp('chopin_mazurkas', 'BI115-3op33-3')], 'mazurka-63-3': [dp('chopin_mazurkas', 'BI162-3op63-3')],
    'mazurka-67-4': [dp('chopin_mazurkas', 'BI163op67-4')], 'mazurka-68-4': [dp('chopin_mazurkas', 'BI168op68-4')],
    'etude-10-3': [xp('Chopin/Etudes_op_10/3')], 'etude-25-1': [xp('Chopin/Etudes_op_25/1')], 'berceuse': [xp('Chopin/Berceuse_op_57')],
    'bwv846': [xp('Bach/Prelude/bwv_846'), kp('bach-wtc', 'wtc1p01')], 'moment3': [xp('Schubert/Moment_musical_no_3')],
    'januar': [dp('tchaikovsky_seasons', 'op37a01')], 'entertainer': [kp('joplin', 'entertainer')], 'maple': [kp('joplin', 'mapleleaf')],
    'invention1': [('kern', f'{S}/inventions/kern/inven01.krn')], 'invention8': [('kern', f'{S}/inventions/kern/inven08.krn')],
    'invention2': [('kern', f'{S}/inventions/kern/inven02.krn')], 'invention4': [('kern', f'{S}/inventions/kern/inven04.krn')],
    'invention10': [('kern', f'{S}/inventions/kern/inven10.krn')], 'invention13': [('kern', f'{S}/inventions/kern/inven13.krn')],
}

N = lambda f: kp('humdrum-chopin-first-editions', f)
PRE = {'prelude-c': 20, 'prelude-e': 4, 'prelude-a': 7, 'prelude-b': 6, 'prelude-9': 9, 'prelude-3': 3, 'prelude-14': 14, 'prelude-16': 16,
       'prelude-19': 19, 'prelude-24': 24, 'prelude-15': 15, 'prelude-17': 17, 'prelude-13': 13, 'prelude-21': 21, 'prelude-1': 1}
for _i, _n in PRE.items():
    SECOND.setdefault(_i, []).append(N('028-1-BH-%03d' % _n))
    SECOND[_i].append(N(('028_1-12-1a-C-%03d' if _n <= 12 else '028_13-24-1a-C-%03d') % _n))
for _i, _f in {'nocturne-9-1': '009-1-KI-001', 'nocturne-9-2': '009-1-KI-002', 'nocturne-15-3': '015-1a-BH-003', 'nocturne-27-1': '027-1-Sm-001',
               'nocturne-27-2': '027-1-Sm-002', 'nocturne-32-1': '032-1-W-001', 'nocturne-32-2': '032-1-W-002', 'nocturne-37-1': '037-1a-TR-001',
               'nocturne-37-2': '037-1a-TR-002', 'nocturne-48-1': '048_1-1a-Sm-001', 'nocturne-55-1': '055-1a-Sm-001', 'nocturne-55-2': '055-1a-Sm-002',
               'nocturne-62-1': '062-1-BR-001', 'nocturne-62-2': '062-1-BR-002', 'walzer-64-1': '064_1-1-BR-001', 'walzer-64-2': '064_2-1-BR-002',
               'walzer-69-1': '069-1-MEIf-001', 'walzer-69-2': '069-1a-Sam-002', 'walzer-34-2': '034_2-1-Sm-002', 'walzer-70-2': '070-1-MEIf-002',
               'etude-10-3': '010_1-6-1b-KI-003', 'etude-25-1': '025_1-6-1d-BH-001', 'berceuse': '057-1a-MEIj', 'fantaisie-impromptu': '066-1axx-COM',
               'ecossaise1': '072sep-1e-Sam-001-ecossaise'}.items():
    SECOND.setdefault(_i, []).append(N(_f))

OVERRIDE = {_i: N(('028_1-12-1a-C-%03d' if _n <= 12 else '028_13-24-1a-C-%03d') % _n) for _i, _n in PRE.items()}
for _i, _n in PRE.items():
    SECOND[_i] = [x for x in SECOND[_i] if '-1a-C-' not in x[1]] + [kp('chopin-preludes', 'prelude28-%02d' % _n)]

def refs(i):
    m = fmap(); out = []
    if i in OVERRIDE: out.append(('quelle',) + OVERRIDE[i])
    elif i in m: out.append(('quelle',) + source_of(i, m[i]))
    elif i in ART: out.append(('quelle',) + ART[i])
    for s in SECOND.get(i, []): out.append(('zweit',) + s)
    return out
