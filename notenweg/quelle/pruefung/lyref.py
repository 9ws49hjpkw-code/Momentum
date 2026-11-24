"""Eigenständiger, vereinfachter LilyPond-Leser NUR zur Gegenprüfung (unabhängig von ly2nw).
Liefert alle Noten (Einsatz in Viertel, MIDI, Dauer, Schreibweise) in schriftlicher Reihenfolge, Haltebögen verschmolzen."""
import re, sys
from fractions import Fraction as F
sys.path.insert(0, '/home/claude/verify')
from refs import merge_ties

LANGS = {
    'nederlands': {'c': (0, 0), 'd': (1, 0), 'e': (2, 0), 'f': (3, 0), 'g': (4, 0), 'a': (5, 0), 'b': (6, 0)},
}
SUFF_NL = [('isis', 2), ('eses', -2), ('ses', -2), ('is', 1), ('es', -1), ('s', -1)]
DE_SPECIAL = {'h': (6, 0), 'b': (6, -1), 'heses': (6, -2), 'his': (6, 1), 'hisis': (6, 2), 'as': (5, -1), 'asas': (5, -2), 'es': (2, -1), 'eses': (2, -2)}
SEMI = [0, 2, 4, 5, 7, 9, 11]
LET = 'CDEFGAB'

STRUCT = ('{', '<<', '\\new', '\\context', '\\relative', '\\fixed', '\\transpose')

CHAIN = True

def strip_comments(src):
    out = []; i = 0; n = len(src); instr = False
    while i < n:
        c = src[i]
        if instr:
            out.append(c)
            if c == '\\' and i + 1 < n: out.append(src[i + 1]); i += 2; continue
            if c == '"': instr = False
            i += 1; continue
        if c == '"': instr = True; out.append(c); i += 1; continue
        if c == '%':
            if i + 1 < n and src[i + 1] == '{':
                j = src.find('%}', i + 2); i = n if j < 0 else j + 2; out.append(' '); continue
            j = src.find('\n', i); i = n if j < 0 else j; out.append(' '); continue
        out.append(c); i += 1
    return ''.join(out)

class Ly:
    def __init__(s, path):
        src = open(path, encoding='utf-8', errors='replace').read()
        s.lang = 'nederlands'
        m = re.search(r'\\language\s+"(\w+)"', src) or re.search(r'\\include\s+"(deutsch|english|italiano|nederlands)\.ly"', src)
        if m: s.lang = m.group(1)
        vm = re.search(r'\\version\s+"(\d+)\.(\d+)', src)
        s.ver = (int(vm.group(1)), int(vm.group(2))) if vm else (2, 18)
        src = strip_comments(src)
        s.toks = s.tokenize(src)
        s.vars = {}
        s.parse_assignments()

    def tokenize(s, src):
        pat = re.compile(r'#"(?:\\.|[^"\\])*"|"(?:\\.|[^"\\])*"|<<|>>|\\\\|\\[A-Za-z]+|\\[<>!()\[\]~=]|#\'?\(|#[^\s{}()]*|[{}<>()\[\]~|=]|-[\-\.^_>!+]|[\^_\-]|\d+/\d+|[a-zA-Z]+[\',]*[!?]?(?:\d+\.*(?:\*\d+(?:/\d+)?)*)?|\d+\.*(?:\*\d+(?:/\d+)?)*|\S')
        out = []
        for m in pat.finditer(src):
            t = m.group(0)
            if t.startswith('#(') or t.startswith("#'("):
                # Scheme-Ausdruck bis zur schließenden Klammer überspringen
                depth = 0; i = m.start()
                j = src.index('(', i)
                k = j
                while k < len(src):
                    if src[k] == '(': depth += 1
                    elif src[k] == ')':
                        depth -= 1
                        if depth == 0: break
                    k += 1
                out.append(('#', src[i:k + 1])); continue
            out.append(t)
        # Nach dem Überspringen können Reste von Scheme-Ausdrücken in der Liste stehen -> erneut sauber tokenisieren
        clean = []; skip_until = -1
        res = []
        pos = 0
        for m in pat.finditer(src):
            if m.start() < skip_until: continue
            t = m.group(0)
            if t.startswith('#(') or t.startswith("#'("):
                depth = 0; j = src.index('(', m.start()); k = j
                while k < len(src):
                    if src[k] == '(': depth += 1
                    elif src[k] == ')':
                        depth -= 1
                        if depth == 0: break
                    k += 1
                res.append('#SCHEME'); skip_until = k + 1; continue
            if t.startswith('#'): res.append('#SCHEME'); continue
            res.append(t)
        return res

    def block_end(s, i):
        """i zeigt auf '{' oder '<<' -> Index nach dem passenden Ende"""
        o = s.toks[i]; c = '}' if o == '{' else '>>'
        depth = 0
        while i < len(s.toks):
            t = s.toks[i]
            if t in ('{', '<<'): depth += 1
            elif t in ('}', '>>'): depth -= 1
            if depth == 0: return i + 1
            i += 1
        return i

    def expr_end(s, i):
        """Ende eines Musikausdrucks ab i (Block, Variable, Kommando mit Ausdruck)"""
        t = s.toks[i]
        if t in ('{', '<<'): return s.block_end(i)
        if t in ('\\relative', '\\fixed'):
            j = i + 1
            if s.toks[j] not in ('{', '<<') and not s.toks[j].startswith('\\'): j += 1
            return s.expr_end(j)
        if t == '\\transpose': return s.expr_end(i + 3)
        if t in ('\\shape', '\\tweak'): return i + 3
        if t in ('\\markup', '\\markuplist'): return s.skip_markup(s.toks, i + 1)
        if t in ('\\new', '\\context'):
            j = i + 2
            if j < len(s.toks) and s.toks[j] == '=': j += 2
            if j < len(s.toks) and s.toks[j] == '\\with': j = s.block_end(j + 1)
            return s.expr_end(j)
        return i + 1

    def parse_assignments(s):
        t = s.toks; i = 0
        while i < len(t):
            if i + 2 < len(t) and re.match(r'^[A-Za-z]+$', t[i]) and t[i + 1] == '=' and (i == 0 or t[i - 1] in ('}', '>>') or not t[i - 1].startswith('\\') or True):
                # nur Zuweisungen auf oberster Ebene: davor steht kein \set/\override
                if i > 0 and t[i - 1] in ('\\set', '\\override', '\\unset') or (i > 1 and t[i - 2] in ('\\set', '\\override')):
                    i += 1; continue
                j = i + 2
                if t[j] in ('\\once', '\\override', '\\set', '\\revert', '\\unset', '\\tweak', '\\shape', '\\omit', '\\hide', '\\undo', '\\temporary'):
                    k = j + 1
                    while k < len(t):
                        if t[k] in ('\\score', '\\header', '\\paper', '\\layout', '\\book', '\\version', '{', '<<', '}', '>>'): break
                        if re.match(r'^[A-Za-z]+$', t[k]) and k + 1 < len(t) and t[k + 1] == '=' and t[k - 1] not in ('.', '-', '\\set', '\\override', '\\unset', '\\revert'): break
                        k += 1
                    s.vars[t[i]] = t[j:k]; i = k; continue
                if t[j] in ('{', '<<', '\\relative', '\\fixed', '\\transpose', '\\new', '\\context') or t[j].startswith('\\'):
                    try: k = s.expr_end(j)
                    except Exception: i += 1; continue
                    s.vars[t[i]] = t[j:k]; i = k; continue
            i += 1

    # ---------- Tonhöhen ----------
    def pitch(s, name):
        """Notenname -> (Stufe 0..6, Vorzeichen)"""
        if s.lang == 'deutsch':
            if name in DE_SPECIAL: return DE_SPECIAL[name]
            base = name[0]
            if base not in 'cdefga': return None
            rest = name[1:]
            acc = {'': 0, 'is': 1, 'isis': 2, 'es': -1, 'eses': -2, 's': -1}.get(rest)
            if acc is None: return None
            return ('cdefgah'.index(base) if base != 'h' else 6, acc)
        if s.lang == 'english':
            base = name[0]
            if base not in 'abcdefg': return None
            rest = name[1:]
            acc = {'': 0, 's': 1, 'ss': 2, 'x': 2, 'f': -1, 'ff': -2, 'sharp': 1, 'flat': -1, '-sharp': 1, '-flat': -1}.get(rest)
            if acc is None: return None
            return ('cdefgab'.index(base), acc)
        if s.lang == 'italiano':
            m = re.match(r'^(do|re|mi|fa|sol|la|si)(dd|bb|d|b|k)?$', name)
            if not m: return None
            return (['do', 're', 'mi', 'fa', 'sol', 'la', 'si'].index(m.group(1)), {None: 0, 'd': 1, 'dd': 2, 'b': -1, 'bb': -2}.get(m.group(2), 0))
        base = name[0]
        if base not in 'abcdefg': return None
        rest = name[1:]
        if rest == '': return ('cdefgab'.index(base), 0)
        if base in 'ae' and rest == 's': return ('cdefgab'.index(base), -1)
        for suf, a in SUFF_NL:
            if rest == suf and suf != 's': return ('cdefgab'.index(base), a)
        return None

    NOTE_RE = re.compile(r"^([a-zR]+?)([',]*)([!?]?)((?:\d+|\\breve)\.*(?:\*\d+(?:/\d+)?)*)?$")

    def parse_note(s, tok):
        m = s.NOTE_RE.match(tok)
        if not m: return None
        nm, octm, _, dur = m.groups()
        if nm in ('r', 'R', 's', 'q'): return (nm, octm, dur)
        p = s.pitch(nm)
        if p is None:
            # gierige Zerlegung: längster Name, der passt
            for k in range(len(tok), 0, -1):
                mm = re.match(r"^([a-z]+)([',]*)([!?]?)((?:\d+)\.*(?:\*\d+(?:/\d+)?)*)?$", tok)
            return None
        return (p, octm, dur)

    def dur_of(s, d):
        m = re.match(r'^(\d+)(\.*)((?:\*\d+(?:/\d+)?)*)$', d)
        base = F(4, int(m.group(1))) if int(m.group(1)) else F(8)
        tot = base; add = base
        for _ in m.group(2): add /= 2; tot += add
        for mul in re.findall(r'\*(\d+)(?:/(\d+))?', m.group(3)):
            tot *= F(int(mul[0]), int(mul[1]) if mul[1] else 1)
        return tot

    # ---------- Auswertung ----------
    def run(s):
        t = s.toks
        # \score suchen
        if '\\score' in t:
            idx = [k for k, x in enumerate(t) if x == '\\score']
            i = idx[min(s.score, len(idx) - 1)] + 1
            end = s.block_end(i)
            body = t[i + 1:end - 1]
        else:
            body = t
        s.events = []; s.graces = 0; s.vid = 0; s.tieopen = {}
        ctx = dict(rel=None, dur=F(1), scale=F(1), t=F(0), grace=False, voice=0, chord=None, transp=(0, 0))
        s.walk(s.expand(body), ctx)
        return merge_ties(s.events), s.graces

    def expand(s, toks, depth=0):
        out = []
        for x in toks:
            if x.startswith('\\') and x[1:] in s.vars and depth < 20:
                out.extend(s.expand(s.vars[x[1:]], depth + 1))
            else: out.append(x)
        return out

    def walk(s, toks, ctx):
        i = 0
        while i < len(toks):
            i = s.step(toks, i, ctx)
        return ctx

    def skip_markup(s, toks, j):
        while j < len(toks) and toks[j].startswith('\\') and toks[j] not in ('\\\\',):
            j += 1
            if j < len(toks) and toks[j] == '#SCHEME': j += 1
        if j < len(toks) and toks[j] == '{': return s.sub_end(toks, j)
        return min(j + 1, len(toks))

    def sub_end(s, toks, i):
        if i >= len(toks): return len(toks)
        t = toks[i]
        if t in ('{', '<<'):
            depth = 0
            while i < len(toks):
                if toks[i] in ('{', '<<'): depth += 1
                elif toks[i] in ('}', '>>'): depth -= 1
                if depth == 0: return i + 1
                i += 1
            return i
        if t in ('\\relative', '\\fixed'):
            j = i + 1
            if toks[j] not in ('{', '<<') and not toks[j].startswith('\\'): j += 1
            return s.sub_end(toks, j)
        if t == '\\transpose': return s.sub_end(toks, i + 3)
        if t in ('\\new', '\\context'):
            j = i + 2
            if j < len(toks) and toks[j] == '=': j += 2
            if j < len(toks) and toks[j] == '\\with': j = s.sub_end(toks, j + 1)
            return s.sub_end(toks, j)
        if t in ('\\times', '\\tuplet'): return s.sub_end(toks, i + 3 if (t == '\\tuplet' and i + 2 < len(toks) and re.match(r'^\d+\.*$', toks[i + 2])) else i + 2)
        if t in ('\\grace', '\\acciaccatura', '\\appoggiatura', '\\slashedGrace'): return s.sub_end(toks, i + 1)
        if t == '\\repeat': return s.sub_end(toks, i + 3)
        return i + 1

    def abs_pitch(s, p, octm, ctx):
        step, acc = p
        if ctx['rel'] is not None:
            rs, ro = ctx['rel']   # diatonische Stufe absolut
            cand = None
            base_oct = ro // 7
            best = None
            for o in range(base_oct - 2, base_oct + 3):
                d = o * 7 + step
                if best is None or abs(d - ro) < abs(best - ro): best = d
            d = best + 7 * (octm.count("'") - octm.count(','))
            return d, acc
        oct_ = 3 + octm.count("'") - octm.count(',')
        return oct_ * 7 + step, acc

    def emit(s, dia, acc, ctx, dur, tie, vid):
        step = dia % 7; octv = dia // 7
        ts, tc = ctx['transp']
        if ts or tc:
            dia2 = dia + ts
            midi0 = (octv + 1) * 12 + SEMI[step] + acc
            midi = midi0 + tc
            step, octv = dia2 % 7, dia2 // 7
            acc = midi - ((octv + 1) * 12 + SEMI[step])
        midi = (octv + 1) * 12 + SEMI[step] + acc
        name = LET[step] + {-2: 'bb', -1: 'b', 0: '', 1: '#', 2: '##'}.get(acc, '?') + str(octv)
        if ctx['grace']: s.graces += 1; return
        t0 = ctx['t']
        if s.tieopen.get(midi) == t0:
            tie = 'mid' if tie else 'end'
        s.tieopen.pop(midi, None)
        if tie in ('start', 'mid'): s.tieopen[midi] = t0 + dur
        s.events.append((t0, midi, dur, tie, 0, name))

    def step(s, toks, i, ctx):
        t = toks[i]
        if t == '{':
            j = s.sub_end(toks, i); s.walk(toks[i + 1:j - 1], ctx); return j
        if t == '<<':
            j = s.sub_end(toks, i); inner = toks[i + 1:j - 1]
            # Zweige: durch '\\' getrennte Stimmen oder parallele Ausdrücke
            parts = []; cur = []; depth = 0
            for x in inner:
                if x in ('{', '<<'): depth += 1
                if x in ('}', '>>'): depth -= 1
                if x == '\\\\' and depth == 0: parts.append(cur); cur = []; continue
                cur.append(x)
            parts.append(cur)
            branches = []
            for part in parts:
                # parallele Ausdrücke innerhalb eines Teils
                k = 0; exprs = []
                while k < len(part):
                    if part[k] in STRUCT:
                        e = s.sub_end(part, k); exprs.append(part[k:e]); k = e
                    else:
                        # loses Material: bis zum nächsten Ausdruck als ein Zweig
                        e = k
                        while e < len(part) and part[e] not in STRUCT: e += 1
                        exprs.append(part[k:e]); k = e
                branches.append(exprs)
            t0 = ctx['t']; tend = t0; rel = ctx['rel']; lastdur = ctx['dur']
            for bi, exprs in enumerate(branches):
                for ex in exprs:
                    c2 = dict(ctx); c2['t'] = t0; s.vid += 1; c2['voice'] = s.vid; c2['rel'] = rel
                    s.walk(ex, c2); tend = max(tend, c2['t']); lastdur = c2['dur']
                    if CHAIN: rel = c2['rel']
            ctx['t'] = tend; ctx['rel'] = rel
            if branches and any(branches): ctx['dur'] = lastdur
            return j
        if t in ('\\relative', '\\fixed'):
            j = i + 1; ref = None
            if toks[j] not in ('{', '<<') and not toks[j].startswith('\\'):
                pn = s.parse_note(toks[j])
                if pn and pn[0] not in ('r', 'R', 's', 'q'):
                    ref = (3 + pn[1].count("'") - pn[1].count(',')) * 7 + pn[0][0]
                j += 1
            e = s.sub_end(toks, j)
            c2 = dict(ctx)
            if t == '\\relative':
                if ref is None: ref = (4 * 7 + 0) if s.ver < (2, 18) else None
                c2['rel'] = (None, ref) if ref is not None else None
                if ref is None: c2['firstabs'] = True
            else:
                c2['rel'] = None; c2['fixed'] = ref
            s.walk(toks[j:e], c2)
            ctx['t'] = c2['t']; ctx['dur'] = c2['dur']
            return e
        if t == '\\transpose':
            a = s.parse_note(toks[i + 1]); b = s.parse_note(toks[i + 2])
            da = (3 + a[1].count("'") - a[1].count(',')) * 7 + a[0][0]
            db = (3 + b[1].count("'") - b[1].count(',')) * 7 + b[0][0]
            ma = (da // 7 + 1) * 12 + SEMI[da % 7] + a[0][1]; mb = (db // 7 + 1) * 12 + SEMI[db % 7] + b[0][1]
            e = s.sub_end(toks, i + 3)
            c2 = dict(ctx); c2['transp'] = (ctx['transp'][0] + db - da, ctx['transp'][1] + mb - ma)
            s.walk(toks[i + 3:e], c2); ctx['t'] = c2['t']; ctx['rel'] = c2['rel']; ctx['dur'] = c2['dur']
            return e
        if t in ('\\new', '\\context'):
            j = i + 2
            if j < len(toks) and toks[j] == '=': j += 2
            if j < len(toks) and toks[j] == '\\with': j = s.sub_end(toks, j + 1)
            if toks[i + 1] in ('Lyrics', 'ChordNames', 'FiguredBass', 'Dynamics'):
                return s.sub_end(toks, j)
            return j
        if t in ('\\times', '\\tuplet'):
            fr = toks[i + 1]; a, b = map(int, fr.split('/'))
            sc = F(a, b) if t == '\\times' else F(b, a)
            st = i + 2
            if t == '\\tuplet' and st < len(toks) and re.match(r'^\d+\.*$', toks[st]): st += 1
            e = s.sub_end(toks, st)
            c2 = dict(ctx); c2['scale'] = ctx['scale'] * sc
            s.walk(toks[st:e], c2); ctx['t'] = c2['t']; ctx['rel'] = c2['rel']; ctx['dur'] = c2['dur']; ctx['chord'] = c2['chord']
            return e
        if t in ('\\grace', '\\acciaccatura', '\\appoggiatura', '\\slashedGrace'):
            e = s.sub_end(toks, i + 1); c2 = dict(ctx); c2['grace'] = True
            s.walk(toks[i + 1:e], c2); ctx['rel'] = c2['rel']; ctx['dur'] = c2['dur']
            return e
        if t == '\\afterGrace':
            j = i + 1
            if toks[j] == '#SCHEME': j += 1
            e1 = s.sub_end(toks, j)
            # Hauptnote ist ein einzelnes Ereignis mit Dauer: bis zur nächsten Gruppe
            k = j
            while k < len(toks) and toks[k] not in ('{',): k += 1
            s.walk(toks[j:k], ctx)
            e2 = s.sub_end(toks, k); c2 = dict(ctx); c2['grace'] = True
            s.walk(toks[k:e2], c2); ctx['rel'] = c2['rel']
            return e2
        if t == '\\repeat':
            kind = toks[i + 1]; n = int(toks[i + 2]); e = s.sub_end(toks, i + 3)
            body = toks[i + 3:e]
            reps = n if kind in ('unfold', 'percent', 'tremolo') else 1
            alts = []; e2 = e
            if e < len(toks) and toks[e] == '\\alternative':
                e2 = s.sub_end(toks, e + 1); inner = toks[e + 2:e2 - 1]; k = 0
                while k < len(inner):
                    kk = s.sub_end(inner, k); alts.append(inner[k:kk]); k = kk
            if kind == 'unfold' and alts:
                for r in range(reps):
                    s.walk(body, ctx)
                    # LilyPond: bei weniger Alternativen als Wiederholungen wird die erste mehrfach genommen
                    ai = max(0, len(alts) - reps + r) if len(alts) < reps else r
                    s.walk(alts[ai], ctx)
                return e2
            for _ in range(reps): s.walk(body, ctx)
            for a in alts: s.walk(a, ctx)
            return e2
        if t == '\\alternative':
            e2 = s.sub_end(toks, i + 1); s.walk(toks[i + 2:e2 - 1], ctx); return e2
        if t in ('\\header', '\\paper', '\\layout', '\\midi', '\\with', '\\markup', '\\markuplist', '\\lyricmode', '\\lyricsto', '\\addlyrics', '\\figuremode', '\\chordmode'):
            j = i + 1
            if t == '\\lyricsto': j += 1
            while j < len(toks) and toks[j] not in ('{',) and t in ('\\markup', '\\markuplist') and toks[j].startswith('\\'): j += 1
            if j < len(toks) and toks[j] in ('{', '<<'): return s.sub_end(toks, j)
            return j + 1
        if t == '\\key': return i + 3
        if t in ('\\time', '\\clef', '\\partial', '\\ottava', '\\bar', '\\mark', '\\tempo', '\\change', '\\barNumberCheck', '\\label', '\\tag', '\\keepWithTag', '\\removeWithTag', '\\numericTimeSignature', '\\set', '\\override', '\\revert', '\\unset', '\\once', '\\tweak', '\\shape', '\\omit', '\\hide', '\\undo', '\\temporary', '\\breathe', '\\fermataMarkup', '\\footnote', '\\pointAndClickOff', '\\language', '\\include', '\\version'):
            if t in ('\\time', '\\clef', '\\partial', '\\ottava', '\\bar', '\\barNumberCheck', '\\label', '\\language', '\\include', '\\version'): return i + 2
            if t == '\\change': return i + 4 if toks[i + 2] == '=' else i + 2
            if t == '\\mark':
                return s.skip_markup(toks, i + 2) if toks[i + 1] == '\\markup' else i + 2
            if t == '\\tempo':
                j = i + 1
                if toks[j].startswith('"'): j += 1
                if j + 2 < len(toks) and toks[j + 1] == '=': j += 3
                elif j < len(toks) and toks[j] == '\\markup': j = s.skip_markup(toks, j + 1)
                return j
            if t in ('\\shape', '\\tweak'): return i + 3
            if t in ('\\omit', '\\hide'): return i + 2
            if t in ('\\set', '\\override', '\\unset', '\\revert', '\\undo', '\\temporary', '\\once'):
                j = i + 1
                if t in ('\\once', '\\undo', '\\temporary'): return j
                # Eigenschaft bis '=' bzw. bis zum Scheme-Wert
                while j < len(toks) and toks[j] not in ('=',) and toks[j] != '#SCHEME' and not (toks[j] in ('{', '}', '<<', '>>')): j += 1
                if j < len(toks) and toks[j] == '=': j += 1
                if j < len(toks) and toks[j] in ('#SCHEME',): j += 1
                elif j < len(toks) and toks[j] == '\\markup': j = s.skip_markup(toks, j + 1)
                elif j < len(toks) and toks[j] not in ('{', '}'): j += 1
                return j
            if t in ('\\tag', '\\keepWithTag', '\\removeWithTag'): return i + 2
            return i + 1
        if t.startswith('\\') or t.startswith('#') or t.startswith('"'): return i + 1
        if t in ('}', '>>', '|', '(', ')', '[', ']', '=', '\\\\'): return i + 1
        if t == '~':
            # Haltebogen an das letzte Ereignis dieser Stimme
            for k in range(len(s.events) - 1, -1, -1):
                e = s.events[k]
                if e[0] + e[2] == ctx['t']:
                    s.events[k] = e[:3] + ('start' if e[3] in (None, 'start') else 'mid',) + e[4:]
                    s.tieopen[e[1]] = ctx['t']
                elif e[0] + e[2] < ctx['t']: break
            return i + 1
        if t in ('-', '^', '_'):
            # Artikulation/Fingersatz/Text überspringen
            if i + 1 < len(toks) and toks[i + 1] == '\\markup': return s.skip_markup(toks, i + 2)
            return i + 2
        if t.startswith('-') and len(t) == 2: return i + 1
        if t == '<':
            # Akkord
            j = i + 1; notes = []; rel = ctx['rel']; first = None
            while toks[j] != '>':
                x = toks[j]
                pn = s.parse_note(x) if not x.startswith('\\') else None
                if pn and pn[0] not in ('r', 'R', 's', 'q'):
                    c2 = dict(ctx); c2['rel'] = rel
                    dia, acc = s.note_pitch(pn, c2)
                    if rel is not None: rel = (None, dia)
                    if first is None: first = dia
                    tie = j + 1 < len(toks) and toks[j + 1] == '~'
                    notes.append((dia, acc, tie))
                j += 1
            j += 1
            if not notes and toks[i + 1] == '>': return j   # <> leerer Akkord: keine Zeit
            d = None
            if j < len(toks) and re.match(r'^\d+\.*(\*\d+(/\d+)?)*$', toks[j]): d = toks[j]; j += 1
            if d: ctx['dur'] = s.dur_of(d)
            dur = ctx['dur'] * ctx['scale']
            alltie = j < len(toks) and toks[j] == '~'
            if ctx['rel'] is not None and first is not None: ctx['rel'] = (None, first)
            ctx['chord'] = [(a, b) for a, b, _ in notes]
            for dia, acc, tie in notes:
                s.emit(dia, acc, ctx, dur, 'start' if (tie or alltie) else None, ctx['voice'])
            if not ctx['grace']: ctx['t'] += dur
            if alltie: j += 1
            s.fix_tie_mid(ctx)
            return j
        pn = s.parse_note(t)
        if pn is None:
            if re.match(r'^\d+\.*(\*\d+(/\d+)?)*$', t):
                return i + 1   # Zahl ohne Note (z. B. Fingersatz-Rest) ignorieren
            return i + 1
        nm, octm, d = pn
        if d: ctx['dur'] = s.dur_of(d)
        dur = ctx['dur'] * ctx['scale']
        if i + 1 < len(toks) and toks[i + 1] == '\\rest' and nm not in ('r', 's', 'R', 'q'):
            dia, acc = s.note_pitch(pn, ctx)
            if ctx['rel'] is not None: ctx['rel'] = (None, dia)
            nm = 'r'
        if nm in ('r', 's', 'R'):
            if not ctx['grace']: ctx['t'] += dur
            return i + 1
        tie = i + 1 < len(toks) and toks[i + 1] == '~'
        if nm == 'q':
            for dia, acc in (ctx['chord'] or []): s.emit(dia, acc, ctx, dur, 'start' if tie else None, ctx['voice'])
        else:
            dia, acc = s.note_pitch(pn, ctx)
            if ctx['rel'] is not None: ctx['rel'] = (None, dia)
            s.emit(dia, acc, ctx, dur, 'start' if tie else None, ctx['voice'])
        if not ctx['grace']: ctx['t'] += dur
        s.fix_tie_mid(ctx)
        return i + (2 if tie else 1)

    def fix_tie_mid(s, ctx):
        pass

    def note_pitch(s, pn, ctx):
        p, octm, _ = pn
        if ctx.get('firstabs') and ctx['rel'] is None:
            dia = (3 + octm.count("'") - octm.count(',')) * 7 + p[0]
            ctx['firstabs'] = False; ctx['rel'] = (None, dia)
            return dia, p[1]
        if ctx['rel'] is not None:
            ro = ctx['rel'][1]; step = p[0]
            best = None
            for o in range(ro // 7 - 2, ro // 7 + 3):
                d = o * 7 + step
                if best is None or abs(d - ro) < abs(best - ro) or (abs(d - ro) == abs(best - ro) and d > best): best = d
            # Quarte aufwärts/abwärts: bei Gleichstand (Tritonus-Fall gibt es diatonisch nicht) gilt die kleinere Distanz
            return best + 7 * (octm.count("'") - octm.count(',')), p[1]
        base = ctx.get('fixed')
        if base is not None:
            return (base // 7 + octm.count("'") - octm.count(',')) * 7 + p[0], p[1]
        return (3 + octm.count("'") - octm.count(',')) * 7 + p[0], p[1]


def lyref(path, score=0):
    if '#' in path: path, score = path.split('#'); score = int(score)
    L = Ly(path); L.score = score
    evs, g = L.run()
    return evs, g

if __name__ == '__main__':
    r, g = lyref(sys.argv[1]); print(len(r), 'Noten', g, 'Vorschläge'); print(r[:12])
