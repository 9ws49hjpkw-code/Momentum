"""LilyPond (Mutopia subset) -> Notenweg engine measures.

Interprets the \\score block: variables, \\relative, chords, tuplets, << \\\\ >> voices,
\\change Staff, repeats with alternatives, grace notes (dropped), dynamics, fingering,
articulations, ties/slurs, pedal. Produces per-measure token strings for the
two piano staves (r/l) with an optional second voice (r2/l2).
Every unsupported construct raises, so nothing is silently guessed."""
import re, sys, json
from fractions import Fraction as F

LETTERS = 'cdefgab'
SCI = {'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'}
ALT = {'': 0, 'is': 1, 'isis': 2, 'es': -1, 'eses': -2, 's': -1, 'ses': -2}
DYN = {'ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'}
DYN_OTHER = {'sf', 'sfz', 'fp', 'sp', 'spp', 'rfz', 'fz', 'sff'}
IGNORE_CMDS = {'stemUp', 'stemDown', 'stemNeutral', 'slurUp', 'slurDown', 'slurNeutral', 'phrasingSlurUp', 'phrasingSlurDown',
               'phrasingSlurNeutral', 'tieUp', 'tieDown', 'tieNeutral', 'dynamicUp', 'dynamicDown', 'dynamicNeutral', 'oneVoice',
               'autoBeamOff', 'autoBeamOn', 'break', 'pageBreak', 'noBreak', 'cadenzaOn', 'cadenzaOff', 'once', 'tupletUp',
               'tupletDown', 'tupletNeutral', 'arpeggio', 'arpeggioArrowUp', 'arpeggioNeutral', 'hideNotes', 'unHideNotes',
               'mergeDifferentlyHeadedOn', 'mergeDifferentlyDottedOn', 'shiftOn', 'shiftOff', 'shiftOnn', 'textLengthOn',
               'textLengthOff', 'compressFullBarRests', 'expandFullBarRests', 'normalsize', 'small', 'tiny', 'teeny', 'large',
               'showStaffSwitch', 'hideStaffSwitch', 'crossStaff', 'startTextSpan', 'stopTextSpan', 'startTrillSpan', 'stopTrillSpan',
               'cresc', 'decresc', 'dim', 'crescTextCresc', 'dimTextDim', 'crescHairpin', 'dimHairpin', 'laissezVibrer',
               'repeatTie', 'glissando', 'breathe', 'noBeam', 'default', 'major', 'minor', 'dorian', 'mixolydian', 'harmonicsOn',
               'harmonicsOff', 'sostenutoOn', 'sostenutoOff', 'unaCorda', 'treCorde', 'mark', 'markLengthOn', 'markLengthOff',
               'stopStaff', 'startStaff', 'easyHeadsOn', 'easyHeadsOff', 'improvisationOn', 'improvisationOff', 'bracketOpenSymbol',
               'deadNote', 'xNote', 'parenthesize', 'staffHighlight', 'ignore', 'omit', 'hide', 'undo', 'temporary', 'partCombineApart'}
ART = {'.': 'st', '>': 'ac', '-': 'tn', '^': 'mc', '!': 'st', '_': 'tn', '+': None}
ORN = {'trill': 'tr', 'mordent': 'mord', 'prall': 'prall', 'turn': 'turn', 'prallprall': 'prall', 'upprall': 'prall', 'prallmordent': 'prall', 'reverseturn': 'turn'}
ARTCMD = {'staccato': 'st', 'staccatissimo': 'st', 'accent': 'ac', 'tenuto': 'tn', 'marcato': 'mc', 'portato': 'tn', 'fermata': 'fe', 'shortfermata': 'fe', 'longfermata': 'fe'}


class LyError(Exception):
    pass


def strip_comments(src):
    src = re.sub(r'%\{.*?%\}', ' ', src, flags=re.S)
    out = []
    for line in src.split('\n'):
        # % starts a comment unless inside a string
        res = ''; ins = False; i = 0
        while i < len(line):
            c = line[i]
            if c == '"' and (i == 0 or line[i - 1] != '\\'): ins = not ins
            if c == '%' and not ins: break
            res += c; i += 1
        out.append(res)
    return '\n'.join(out)


TOK = re.compile(r'''
  (?P<str>"(?:[^"\\]|\\.)*")
 |(?P<scheme>\#)
 |(?P<sim><<|>>)
 |(?P<vsep>\\\\)
 |(?P<pcmd>\\[()<>!])
 |(?P<cmd>\\[a-zA-Z]+(?:-[a-zA-Z]+)*)
 |(?P<brace>[{}])
 |(?P<note>(?:[a-g](?:isis|eses|ses|is|es|s)?|r|s|R|q)(?![a-zA-Z])[',]*[!?]?(?:(?:\d+|\\breve|\\longa)\.*)?(?:\*\d+(?:/\d+)?)*)
 |(?P<dur>\d+\.*(?:\*\d+(?:/\d+)?)*)
 |(?P<word>[a-zA-Z][a-zA-Z\-\.]*)
 |(?P<sym>[<>~()\[\]|=\-^_.+!*/,:'])
''', re.X)


ACC_EN = {'': '', 's': 'is', 'sharp': 'is', 'ss': 'isis', 'x': 'isis', 'sharpsharp': 'isis', 'f': 'es', 'flat': 'es', 'ff': 'eses', 'flatflat': 'eses'}
NOTE_EN = re.compile(r"(?:([a-g])(sharpsharp|flatflat|sharp|flat|ss|ff|x|s|f)?|r|s|R|q)(?![a-zA-Z])[',]*[!?]?(?:(?:\d+|\\breve|\\longa)\.*)?(?:\*\d+(?:/\d+)?)*")


def tokenize(src, english=False):
    toks = []; i = 0; n = len(src)
    while i < n:
        if src[i].isspace(): i += 1; continue
        if english and src[i] in 'abcdefgrsRq':
            me = NOTE_EN.match(src, i)
            if me and me.group(0) and (me.end() >= n or not src[me.end()].isalpha()):
                txt = me.group(0)
                if me.group(1):
                    txt = me.group(1) + ACC_EN[me.group(2) or ''] + txt[1 + len(me.group(2) or ''):]
                toks.append(('note', txt)); i = me.end(); continue
        m = TOK.match(src, i)
        if not m:
            i += 1; continue
        kind = m.lastgroup; text = m.group(0)
        if kind == 'scheme':
            # scheme expression: #(...), #'(...), #'sym, #"str", ##t, #-5, #'sym-name
            j = m.end()
            if j < n and src[j] == '#': j += 1
            if j < n and src[j] == "'": j += 1
            if j < n and src[j] == '(':
                depth = 0
                while j < n:
                    if src[j] == '(': depth += 1
                    elif src[j] == ')':
                        depth -= 1
                        if depth == 0: j += 1; break
                    elif src[j] == '"':
                        j += 1
                        while j < n and src[j] != '"': j += 2 if src[j] == '\\' else 1
                    j += 1
            elif j < n and src[j] == '"':
                j += 1
                while j < n and src[j] != '"': j += 2 if src[j] == '\\' else 1
                j += 1
            else:
                while j < n and not src[j].isspace() and src[j] not in '{}<>)': j += 1
            toks.append(('scheme', src[i:j])); i = j; continue
        if kind == 'note' and text[0] in 'abcdefgrsRq':
            # disambiguate words like "bass", "major", "treble" (followed by letters) -> handled by (?![a-zA-Z])
            pass
        toks.append((kind, text)); i = m.end()
    return toks


def parse_dur(s):
    """'4.', '8*2/3', '1*4', '\\breve' -> (Fraction quarters, scale Fraction)"""
    m = re.match(r'(\d+|\\breve|\\longa)(\.*)((?:\*\d+(?:/\d+)?)*)$', s)
    if not m: raise LyError('bad duration ' + s)
    b = m.group(1)
    base = F(8) if b == '\\breve' else F(16) if b == '\\longa' else F(4, int(b))
    d = base; add = base
    for _ in m.group(2): add /= 2; d += add
    mult = F(1)
    for part in re.findall(r'\*(\d+)(?:/(\d+))?', m.group(3)):
        mult *= F(int(part[0]), int(part[1]) if part[1] else 1)
    return d, mult, base, len(m.group(2))


class P:
    """pitch: letter c..b, alter, octave (scientific)."""
    __slots__ = ('l', 'a', 'o')
    def __init__(s, l, a, o): s.l, s.a, s.o = l, a, o
    @property
    def dia(s): return s.o * 7 + LETTERS.index(s.l)
    def name(s):
        acc = '#' * s.a if s.a > 0 else 'b' * (-s.a)
        return f'{SCI[s.l]}{acc}{s.o}'
    @property
    def midi(s): return 12 * (s.o + 1) + [0, 2, 4, 5, 7, 9, 11][LETTERS.index(s.l)] + s.a


class Ev:
    def __init__(s, **k):
        s.__dict__.update(k)


class Interp:
    def __init__(s, src):
        s.src = strip_comments(src)
        english = bool(re.search(r'\\language\s+"english"|\\include\s+"english\.ly"', s.src))
        s.toks = tokenize(s.src, english)
        s.vars = {}
        s.events = []
        s.staff_names = []  # in order of appearance
        s.key = None; s.time = None; s.partial = None
        s.repeats = []  # (start, end, alts:[(s,e)], count)
        s.warn = []
        s.clefs = {}
        s.parse_toplevel()

    # ---------- top level ----------
    def parse_toplevel(s):
        t = s.toks; i = 0; s.score = None
        while i < len(t):
            k, v = t[i]
            if k in ('word',) and i + 1 < len(t) and t[i + 1] == ('sym', '='):
                name = v; j = i + 2
                j2 = s.skip_expr(j)
                s.vars[name] = (j, j2)
                i = j2; continue
            if k == 'cmd' and v in ('\\header', '\\paper', '\\layout', '\\midi', '\\book', '\\bookpart'):
                if v in ('\\book', '\\bookpart'):
                    i += 1; continue
                i = s.skip_expr(i + 1); continue
            if k == 'cmd' and v == '\\score':
                s.score = (i + 1, s.skip_expr(i + 1)); i = s.score[1]; continue
            if k == 'cmd' and v in ('\\version', '\\include', '\\language'):
                i += 2; continue
            if k == 'scheme': i += 1; continue
            if k == 'brace' and v == '}': i += 1; continue
            i += 1
        if not s.score: raise LyError('no \\score')

    def skip_expr(s, i):
        """return index after one expression starting at i (braces / << >> / command with block / scheme / string / token)."""
        t = s.toks
        while i < len(t) and t[i][0] == 'cmd' and t[i][1] in ('\\relative', '\\fixed', '\\new', '\\context', '\\markup', '\\transpose', '\\with', '\\times', '\\tuplet', '\\repeat'):
            c = t[i][1]
            if c == '\\relative' or c == '\\fixed':
                i += 1
                if t[i][0] == 'note': i += 1
                continue
            if c in ('\\new', '\\context'):
                i += 2
                if i < len(t) and t[i] == ('sym', '='): i += 2
                continue
            if c == '\\with': i = s.skip_expr(i + 1); continue
            if c == '\\markup': i += 1; continue
            if c in ('\\times', '\\tuplet'):
                i += 2
                if t[i][0] == 'dur': i += 1
                continue
            if c == '\\repeat':
                j = s.skip_expr(i + 3)
                if j < len(t) and t[j] == ('cmd', '\\alternative'): j = s.skip_expr(j + 1)
                return j
            if c == '\\transpose': i += 3; continue
        if i >= len(t): return i
        k, v = t[i]
        if k == 'brace' and v == '{':
            d = 0
            while i < len(t):
                if t[i] == ('brace', '{'): d += 1
                elif t[i] == ('brace', '}'):
                    d -= 1
                    if d == 0: return i + 1
                i += 1
            raise LyError('unbalanced {')
        if k == 'sim' and v == '<<':
            d = 0
            while i < len(t):
                if t[i] == ('sim', '<<'): d += 1
                elif t[i] == ('sim', '>>'):
                    d -= 1
                    if d == 0: return i + 1
                i += 1
            raise LyError('unbalanced <<')
        return i + 1

    # ---------- interpretation ----------
    def run(s):
        ctx = dict(rel=None, dur=F(1), scale=F(1), staff=None, voice=1, t=F(0), grace=False, trip=False, dynctx=False)
        s.cur_staff_for_voice = {}
        a, b = s.score
        s.walk(a, b, ctx)
        return s

    def note_rel(s, ctx, l, octmarks, absolute_oct=None):
        if ctx['rel'] is None:
            o = 3 + octmarks.count("'") - octmarks.count(',')
            return o
        rl, ro = ctx['rel']
        best = None
        for o in (ro - 1, ro, ro + 1):
            dist = abs((o * 7 + LETTERS.index(l)) - (ro * 7 + LETTERS.index(rl)))
            if best is None or dist < best[0]: best = (dist, o)
        o = best[1] + octmarks.count("'") - octmarks.count(',')
        return o

    def walk(s, i, end, ctx):
        """interpret tokens[i:end] sequentially; returns ctx (time advanced)."""
        t = s.toks
        pending_post_target = None
        while i < end:
            k, v = t[i]
            if k == 'brace' and v == '{':
                j = s.skip_expr(i)
                s.walk(i + 1, j - 1, ctx)
                i = j; continue
            if k == 'brace' and v == '}': i += 1; continue
            if k == 'sim' and v == '<<':
                j = s.skip_expr(i)
                s.simultaneous(i + 1, j - 1, ctx)
                i = j; continue
            if k == 'sim' and v == '>>': i += 1; continue
            if k == 'vsep': raise LyError('stray \\\\')
            if k == 'cmd':
                i = s.command(i, end, ctx); continue
            if k == 'note' or (k == 'sym' and v == '<'):
                i = s.event(i, end, ctx); continue
            if k == 'dur':
                # duration alone after chord repetition etc.
                raise LyError('unexpected duration %s near: %s' % (v, ' '.join(x[1] for x in t[max(0, i - 8):i + 3])))
            if k == 'sym' and v in ('|', '~', '[', ']', '(', ')'):
                if v in ('~', '(', ')') and s.events:
                    s.attach_post(ctx, v)
                i += 1; continue
            if k == 'scheme' or k == 'str' or k == 'word': i += 1; continue
            if k == 'sym' and v in ('-', '^', '_'):
                i = s.post_events(i, end, ctx, s.last_event(ctx)); continue
            if k == 'pcmd':
                s.attach_post(ctx, v); i += 1; continue
            i += 1
        return ctx

    def last_event(s, ctx):
        for e in reversed(s.events):
            if e.voicekey == (ctx['staffkey'], ctx['voice']) and e.kind != 'grace':
                return e
        return None

    def attach_post(s, ctx, v):
        e = s.last_event(ctx)
        if e is None: return
        if v == '~': e.mods['~'] = True
        elif v == '(' or v == '\\(': e.mods['('] = True
        elif v == ')' or v == '\\)': e.mods[')'] = True
        elif v == '\\<': e.mods['h'] = '<'
        elif v == '\\>': e.mods['h'] = '>'
        elif v == '\\!': e.mods['hend'] = True

    def simultaneous(s, i, end, ctx):
        """<< A \\ B >> or << A B >>: children."""
        t = s.toks
        children = []; cur = []; j = i; seps = False
        while j < end:
            if t[j][0] == 'vsep':
                seps = True; children.append(('seq', cur)); cur = []; j += 1; continue
            if t[j][0] in ('brace', 'sim') and t[j][1] in ('{', '<<') or (t[j][0] == 'cmd' and t[j][1] in ('\\new', '\\context', '\\relative', '\\fixed', '\\times', '\\tuplet', '\\repeat')):
                k2 = s.skip_expr(j)
                cur.append((j, k2)); j = k2; continue
            if t[j][0] == 'cmd' and t[j][1] in s.vars_names():
                cur.append((j, j + 1)); j += 1; continue
            cur.append((j, j + 1)); j += 1
        children.append(('seq', cur))
        start_t = ctx['t']; maxt = start_t
        rel0 = ctx['rel']; dur0 = ctx['dur']
        after_rel = None
        if seps:
            for ci, (_, parts) in enumerate(children):
                c2 = dict(ctx); c2['t'] = start_t; c2['rel'] = rel0
                c2['voice'] = 1 if ci == 0 else 2
                for (a, b) in parts: s.walk(a, b, c2)
                maxt = max(maxt, c2['t'])
                if ci == 0: after_rel = c2['rel']; after_dur = c2['dur']
        else:
            # each top-level item is a parallel branch; settings (\key, \time, \clef, \set) apply to all
            parts = children[0][1]
            branches = []; common = []
            for (a, b) in parts:
                tk = t[a]
                if tk[0] == 'cmd' and tk[1] in ('\\key', '\\time', '\\clef', '\\set', '\\override', '\\partial'):
                    common.append((a, b)); continue
                branches.append((a, b))
            # a branch may be split over several tokens (cmd + arg); regroup: commands without block consume following tokens
            bi = 0; first = True
            for (a, b) in common:
                pass
            # execute common commands first on ctx
            for (a, b) in common:
                s.walk(a, s.cmd_extent(a), ctx)
            nb = 0
            idx = 0
            while idx < len(branches):
                a, b = branches[idx]
                # gather a full expression: if token is a command needing args, take subsequent tokens
                endx = s.cmd_extent(a) if t[a][0] == 'cmd' else b
                while idx + 1 < len(branches) and branches[idx + 1][0] < endx: idx += 1
                c2 = dict(ctx); c2['t'] = start_t; c2['rel'] = rel0
                if nb > 0 and not c2.get('newstaff_pending'):
                    if not s.is_staff_expr(a): c2['voice'] = 2
                s.walk(a, max(endx, b), c2)
                if nb == 0: after_rel = c2['rel']; after_dur = c2['dur']
                maxt = max(maxt, c2['t']); nb += 1; idx += 1
        ctx['t'] = maxt
        if after_rel is not None: ctx['rel'] = after_rel

    def vars_names(s):
        return {'\\' + n for n in s.vars}

    def is_staff_expr(s, a):
        t = s.toks
        return t[a][0] == 'cmd' and t[a][1] in ('\\new', '\\context') and t[a + 1][1] in ('Staff', 'PianoStaff', 'GrandStaff', 'Dynamics', 'StaffGroup')

    def cmd_extent(s, i):
        """end index of a command with its arguments (for non-music commands)."""
        t = s.toks; c = t[i][1]
        if c in ('\\key',): return i + 3
        if c in ('\\time', '\\partial', '\\clef', '\\bar', '\\ottava', '\\tempo'):
            if c == '\\tempo':
                j = i + 1
                if t[j][0] == 'str': j += 1
                if j < len(t) and t[j][0] in ('dur', 'note') and j + 1 < len(t) and t[j + 1] == ('sym', '='): j += 3
                return j
            return i + 2
        if c in ('\\set', '\\override'):
            j = i + 1
            while t[j] != ('sym', '='): j += 1
            if t[j + 1] == ('cmd', '\\markup'): return s.skip_expr(j + 2)
            return j + 2
        return s.skip_expr(i)

    def command(s, i, end, ctx):
        t = s.toks; c = t[i][1]; name = c[1:]
        if name in s.vars:
            a, b = s.vars[name]
            # music function defined in scheme: consume its scheme args
            if s.toks[a][0] == 'scheme':
                j = i + 1
                while j < end and t[j][0] in ('scheme', 'str'): j += 1
                return j
            # music variable: interpret with fresh relative unless \relative inside
            saved_rel = ctx['rel']
            s.walk(a, b, ctx)
            return i + 1
        if c == '\\relative':
            j = i + 1; ref = ('c', 3)
            if t[j][0] == 'note':
                m = re.match(r"([a-g])(?:isis|eses|is|es|s)?([',]*)", t[j][1])
                ref = (m.group(1), 3 + m.group(2).count("'") - m.group(2).count(','))
                j += 1
            else:
                ref = ('f', 3)  # LilyPond default for \relative without pitch
            k2 = s.skip_expr(j)
            saved = ctx['rel']; ctx['rel'] = ref
            s.walk(j, k2, ctx)
            ctx['rel'] = saved
            return k2
        if c == '\\fixed':
            raise LyError('\\fixed not supported')
        if c in ('\\new', '\\context'):
            typ = t[i + 1][1]; j = i + 2; nm = None
            if j < end and t[j] == ('sym', '='):
                nm = t[j + 1][1].strip('"'); j += 2
            if j < end and t[j] == ('cmd', '\\with'): j = s.skip_expr(j + 1)
            k2 = s.skip_expr(j)
            if typ == 'Staff':
                if nm is None and t[i][1] == '\\context' and ctx.get('staffkey') not in (None, '__dyn'):
                    s.walk(j, k2, ctx); return k2
                if nm is None: nm = 'staff%d' % len(s.staff_names)
                if nm not in s.staff_names: s.staff_names.append(nm)
                c2 = dict(ctx); c2['staff'] = nm; c2['staffkey'] = nm; c2['voice'] = 1
                s.walk(j, k2, c2); ctx['t'] = max(ctx['t'], c2['t'])
                return k2
            if typ == 'Dynamics':
                c2 = dict(ctx); c2['dynctx'] = True; c2['staffkey'] = '__dyn'; c2['staff'] = '__dyn'
                s.walk(j, k2, c2)
                return k2
            if typ == 'Voice':
                c2 = dict(ctx)
                s.walk(j, k2, c2); ctx['t'] = c2['t']; ctx['rel'] = c2['rel']; ctx['dur'] = c2['dur']
                return k2
            # PianoStaff, GrandStaff, StaffGroup etc.
            s.walk(j, k2, ctx)
            return k2
        if c in ('\\times', '\\tuplet'):
            frac = t[i + 1][1] if t[i + 1][0] != 'note' else t[i + 1][1]
            j = i + 1
            # fraction tokens: dur '2' sym '/' dur '3'
            num = t[j][1]; assert t[j + 1] == ('sym', '/'), t[j:j + 3]; den = t[j + 2][1]; j += 3
            if c == '\\times': fac = F(int(num), int(den))
            else: fac = F(int(den), int(num))
            if j < end and t[j][0] == 'dur': j += 1  # tuplet span duration
            k2 = s.skip_expr(j)
            saved = ctx['scale']; ctx['scale'] = saved * fac
            savedtrip = ctx['trip']; ctx['trip'] = True
            s.walk(j, k2, ctx)
            ctx['scale'] = saved; ctx['trip'] = savedtrip
            return k2
        if c == '\\repeat':
            kind = t[i + 1][1].strip('"'); count = int(t[i + 2][1]); j = i + 3
            k2 = s.skip_expr(j)
            if kind == 'unfold':
                alts = []
                k3 = k2
                if k2 < end and t[k2] == ('cmd', '\\alternative'):
                    a0 = k2 + 1; a1 = s.skip_expr(a0); q = a0 + 1
                    while q < a1 - 1:
                        q2 = s.skip_expr(q); alts.append((q, q2)); q = q2
                    k3 = a1
                for r_ in range(count):
                    s.walk(j, k2, ctx)
                    if alts:
                        a, b = alts[min(r_, len(alts) - 1)] if r_ >= count - len(alts) else alts[0]
                        a, b = alts[max(0, len(alts) - (count - r_))]
                        s.walk(a, b, ctx)
                return k3
            if kind != 'volta': raise LyError('repeat ' + kind)
            st = ctx['t']; s.walk(j, k2, ctx); en = ctx['t']
            alts = []
            if k2 < end and t[k2] == ('cmd', '\\alternative'):
                a0 = k2 + 1; a1 = s.skip_expr(a0)
                # inside braces: list of alternative expressions
                q = a0 + 1
                while q < a1 - 1:
                    q2 = s.skip_expr(q)
                    as_ = ctx['t']; s.walk(q, q2, ctx); alts.append((as_, ctx['t']))
                    q = q2
                k2 = a1
            if ctx.get('staffkey') == s.first_staff_key():
                s.repeats.append(dict(start=st, end=en, alts=alts, count=count))
            return k2
        if c == '\\alternative': raise LyError('stray alternative')
        if c in ('\\grace', '\\acciaccatura', '\\appoggiatura', '\\slashedGrace'):
            j = i + 1; k2 = s.skip_expr(j)
            c2 = dict(ctx); c2['grace'] = True
            s.walk(j, k2, c2); ctx['rel'] = c2['rel']
            s.warn.append('grace notes dropped at %s' % ctx['t'])
            return k2
        if c == '\\afterGrace':
            j = i + 1
            if t[j][0] == 'scheme': j += 1
            # main note then grace expr
            j2 = s.event(j, end, ctx) if (t[j][0] == 'note' or t[j] == ('sym', '<')) else s.skip_expr(j)
            k2 = s.skip_expr(j2)
            c2 = dict(ctx); c2['grace'] = True; c2['t'] = ctx['t']
            s.walk(j2, k2, c2); ctx['rel'] = c2['rel']
            s.warn.append('after-grace dropped at %s' % ctx['t'])
            return k2
        if c == '\\key':
            p = t[i + 1][1]; mode = t[i + 2][1]
            if ctx.get('dynctx'): return i + 3
            k = (p, mode)
            if s.key and s.key != k and ctx['t'] > 0: raise LyError('key change at %s' % ctx['t'])
            if not s.key: s.key = k
            return i + 3
        if c == '\\time':
            v = t[i + 1][1]; j = i + 2
            if t[i + 2] == ('sym', '/'): v = v + '/' + t[i + 3][1]; j = i + 4
            if s.time and s.time != v and ctx['t'] > 0: raise LyError('time change to %s at %s' % (v, ctx['t']))
            s.time = s.time or v
            return j
        if c == '\\partial':
            d, mult, _, _ = parse_dur(t[i + 1][1]); s.partial = d * mult
            return i + 2
        if c == '\\clef':
            cl = t[i + 1][1].strip('"')
            key = ctx.get('staffkey')
            if key not in s.clefs: s.clefs[key] = []
            s.clefs[key].append((ctx['t'], cl))
            return i + 2
        if c == '\\bar': return i + 2
        if c == '\\tupletSpan': return i + 2
        if c == '\\ottava':
            val = t[i + 1][1]
            if val not in ('#0',): s.warn.append('ottava %s at %s (pitches kept as sounding)' % (val, ctx['t']))
            return i + 2
        if c == '\\tempo': return s.cmd_extent(i)
        if c in ('\\set', '\\override'): return s.cmd_extent(i)
        if c == '\\revert':
            j = i + 1
            while j < end and t[j][0] in ('word', 'scheme', 'sym') and t[j][1] not in ('{', '}'):
                if t[j][0] == 'word' or t[j][0] == 'scheme' or t[j][1] == '.': j += 1
                else: break
            return j
        if c == '\\tweak': return i + 3
        if c in ('\\change',):
            nm = t[i + 3][1].strip('"')
            ctx['staff'] = nm
            return i + 4
        if c in ('\\voiceOne', '\\voiceThree'): ctx['voice'] = 1; return i + 1
        if c in ('\\voiceTwo', '\\voiceFour'): ctx['voice'] = 2; return i + 1
        if c == '\\markup': return s.skip_expr(i + 1)
        if c in ('\\layout', '\\midi', '\\header', '\\paper', '\\with'): return s.skip_expr(i + 1)
        if c in ('\\transpose', '\\partcombine', '\\partCombine'): raise LyError(c + ' not supported')
        if c in ('\\sustainOn', '\\sustainOff', '\\fermata') or name in DYN or name in DYN_OTHER or name in ORN or name in ARTCMD:
            e = s.last_event(ctx)
            if e is not None: s.apply_cmd_post(e, name)
            return i + 1
        if c == '\\skip':
            d, mult, _, _ = parse_dur(t[i + 1][1]); ctx['t'] += d * mult * ctx['scale']; return i + 2
        if name in IGNORE_CMDS: return i + 1
        if c in ('\\clef',): return i + 2
        if c == '\\autochange': raise LyError('autochange')
        if c in ('\\mergeDifferentlyHeadedOn',): return i + 1
        s.warn.append('ignored command ' + c)
        return i + 1

    def first_staff_key(s):
        return s.staff_names[0] if s.staff_names else None

    def apply_cmd_post(s, e, name):
        if name in DYN: e.mods['d'] = name
        elif name in DYN_OTHER:
            if name in ('sf', 'sfz', 'fz', 'rfz'): e.mods['ac'] = True
            else: e.mods.setdefault('t', name)
        elif name in ORN: e.mods['o'] = ORN[name]
        elif name in ARTCMD: e.mods[ARTCMD[name]] = True
        elif name == 'sustainOn': e.mods['pon'] = True
        elif name == 'sustainOff': e.mods['poff'] = True

    def post_events(s, i, end, ctx, e):
        """after a note: articulation tokens beginning with - ^ _ ."""
        t = s.toks
        while i < end:
            k, v = t[i]
            if k == 'sym' and v in ('-', '^', '_'):
                if i + 1 >= end: break
                k2, v2 = t[i + 1]
                if k2 == 'sym' and v2 in ART:
                    if e is not None and ART[v2]: e.mods[ART[v2]] = True
                    i += 2; continue
                if k2 == 'dur' and re.match(r'^\d+$', v2):
                    if e is not None and not ctx['grace']:
                        e.fing.append(v2[0])
                    i += 2; continue
                if k2 == 'str':
                    txt = v2.strip('"')
                    m = re.match(r'^\s*(\d)', txt)
                    if m and re.match(r'^[\d\s\-–]+$', txt):
                        if e is not None: e.fing.append(m.group(1))
                    elif e is not None and txt.strip(): e.mods.setdefault('t', txt.strip().replace(' ', '_'))
                    i += 2; continue
                if k2 == 'cmd':
                    nm = v2[1:]
                    if nm == 'markup': i = s.skip_expr(i + 2); continue
                    if e is not None: s.apply_cmd_post(e, nm)
                    i += 2; continue
                if k2 == 'pcmd':
                    s.attach_post(ctx, v2); i += 2; continue
                if k2 == 'sym' and v2 in '()~':
                    s.attach_post(ctx, v2); i += 2; continue
                i += 1; continue
            if k == 'sym' and v in ('~', '(', ')', '[', ']'):
                if v in '~()': s.attach_post(ctx, v)
                i += 1; continue
            if k == 'pcmd': s.attach_post(ctx, v); i += 1; continue
            if k == 'cmd':
                nm = v[1:]
                if nm in DYN or nm in DYN_OTHER or nm in ORN or nm in ARTCMD or nm in ('sustainOn', 'sustainOff'):
                    if e is not None: s.apply_cmd_post(e, nm)
                    i += 1; continue
                if nm in ('arpeggio', 'laissezVibrer', 'repeatTie', 'glissando', 'noBeam', 'startTrillSpan', 'stopTrillSpan', 'startTextSpan', 'stopTextSpan', 'cresc', 'decresc', 'dim', 'breathe'):
                    i += 1; continue
                if nm == 'rest': i += 1; continue
                break
            break
        return i

    def event(s, i, end, ctx):
        t = s.toks
        pitches = []; fing_chord = []
        if t[i] == ('sym', '<'):
            j = i + 1; ref = ctx['rel']; first_ref = None
            while t[j] != ('sym', '>'):
                k, v = t[j]
                if k == 'note':
                    m = re.match(r"([a-g])(isis|eses|ses|is|es|s)?([',]*)[!?]?$", v)
                    if not m: raise LyError('bad chord note ' + v)
                    l = m.group(1); a = ALT[m.group(2) or '']
                    if ctx['rel'] is not None:
                        c2 = dict(ctx); c2['rel'] = ref; o = s.note_rel(c2, l, m.group(3))
                        ref = (l, o)
                        if first_ref is None: first_ref = ref
                    else: o = 3 + m.group(3).count("'") - m.group(3).count(',')
                    pitches.append(P(l, a, o)); j += 1
                    # per-note fingering inside chord
                    while t[j][0] == 'sym' and t[j][1] in ('-', '^', '_'):
                        if t[j + 1][0] == 'dur': fing_chord.append((len(pitches) - 1, t[j + 1][1][0])); j += 2
                        elif t[j + 1][0] == 'str':
                            mm = re.match(r'^"\s*(\d)', t[j + 1][1]);
                            if mm: fing_chord.append((len(pitches) - 1, mm.group(1)))
                            j += 2
                        else: j += 2
                    continue
                if k == 'cmd' and v == '\\tweak': j += 3; continue
                if k in ('scheme',): j += 1; continue
                j += 1
            j += 1
            if ctx['rel'] is not None and first_ref is not None: ctx['rel'] = first_ref
            durtok = t[j][1] if j < end and t[j][0] == 'dur' else None
            if durtok: j += 1
            if not pitches and not durtok:
                # leerer Akkord <> : nimmt keine Zeit ein, trägt nur Dynamik -> an nächste Note hängen
                tmp = Ev(kind='space', t=ctx['t'], dur=F(0), pitches=[], mods={}, fing=[], staff=ctx['staff'], voice=ctx['voice'], voicekey=(ctx.get('staffkey'), ctx['voice']), trip=False, dyn=True, rcount=None)
                j2 = s.post_events(j, end, ctx, tmp)
                if tmp.mods: s.events.append(tmp)
                return j2
            s.last_chord = pitches
            kind = 'note'
        else:
            v = t[i][1]
            m = re.match(r"([a-g](?:isis|eses|ses|is|es|s)?|r|s|R|q)([',]*)([!?]?)((?:\d+|\\breve|\\longa)\.*(?:\*\d+(?:/\d+)?)*)?$", v)
            if not m: raise LyError('bad note ' + v)
            p, octm, _, durtok = m.groups()
            j = i + 1
            if not durtok and j < end and t[j][0] == 'dur':
                durtok = t[j][1]; j += 1
            if p in ('r', 'R'): kind = 'rest'
            elif p == 's': kind = 'space'
            elif p == 'q':
                kind = 'note'; pitches = [P(x.l, x.a, x.o) for x in s.last_chord]
            else:
                l = p[0]; a = ALT[p[1:]]
                o = s.note_rel(ctx, l, octm)
                if ctx['rel'] is not None: ctx['rel'] = (l, o)
                pitches = [P(l, a, o)]; kind = 'note'
                if j < end and t[j] == ('cmd', '\\rest'): kind = 'rest'; j += 1
        if durtok:
            d, mult, base, dots = parse_dur(durtok)
            ctx['dur'] = d; ctx['mult'] = mult
        else:
            d = ctx['dur']; mult = F(1) if 'mult' not in ctx else ctx.get('mult', F(1))
            if not durtok: mult = ctx.get('mult', F(1)) if False else F(1)
        dur = ctx['dur'] * (mult if durtok else F(1)) * ctx['scale']
        isTrip = ctx['trip'] or (durtok and '*' in durtok and mult != int(mult))
        e = Ev(kind=kind if not ctx['grace'] else 'grace', t=ctx['t'], dur=dur, pitches=pitches, mods={}, fing=[], staff=ctx['staff'],
               voice=ctx['voice'], voicekey=(ctx.get('staffkey'), ctx['voice']), trip=bool(isTrip), notated=ctx['dur'] * (mult if durtok and mult == int(mult) else 1),
               dyn=ctx.get('dynctx', False), rcount=None)
        if durtok and p_is_multimeasure(t[i][1]): e.mm = True
        if fing_chord:
            fing_chord.sort(); e.fing = [f for _, f in fing_chord]
        s.events.append(e)
        if not ctx['grace']: ctx['t'] += dur
        j = s.post_events(j, end, ctx, e)
        return j


def p_is_multimeasure(v):
    return v.startswith('R')


# ---------- measures & tokens ----------
DURS = [(F(4), 'w'), (F(3), 'h.'), (F(2), 'h'), (F(3, 2), 'q.'), (F(1), 'q'), (F(3, 4), '8.'), (F(1, 2), '8'), (F(3, 8), '16.'), (F(1, 4), '16'), (F(1, 8), '32'), (F(7, 2), 'h..'), (F(7, 4), 'q..'), (F(7, 8), '8..')]
DUR_OF = {k: v for k, v in DURS}


def split_notatable(d):
    out = []
    for v, _ in sorted(DURS, key=lambda x: -x[0]):
        while d >= v and v in (F(4), F(3), F(2), F(3, 2), F(1), F(3, 4), F(1, 2), F(3, 8), F(1, 4), F(1, 8)):
            out.append(v); d -= v
    if d != 0: raise LyError('cannot split duration remainder %s' % d)
    return out


def build(interp, keymap=None):
    I = interp
    if not I.time: I.time = '4/4'
    a, b = I.time.split('/') if '/' in I.time else ('4', '4')
    bar = F(int(a) * 4, int(b))
    # map staff names to r/l
    names = [n for n in I.staff_names]
    if len(names) != 2: raise LyError('expected 2 staves, got %s' % names)
    slot = {names[0]: 'r', names[1]: 'l'}
    evs = [e for e in I.events if e.kind != 'grace']
    dyn_evs = [e for e in evs if e.dyn]
    evs = [e for e in evs if not e.dyn]
    total = max((e.t + e.dur for e in evs), default=F(0))
    pick = I.partial or F(0)
    # measure starts
    starts = []; tt = F(0)
    if pick: starts.append(F(0)); tt = pick
    while tt < total: starts.append(tt); tt += bar
    starts.append(tt)
    def mlen(mi): return starts[mi + 1] - starts[mi]
    nM = len(starts) - 1
    # voice timelines: key (slot, voiceIndex) ; voice index from staff change: notes moved to another staff go to voice 2
    def lane_of(e):
        sl = slot.get(e.staff)
        if sl is None: raise LyError('unknown staff ' + str(e.staff))
        home = slot.get(e.voicekey[0])
        v = e.voice
        if home is not None and sl != home: v = 'm%d' % e.voice
        return sl, v
    def mindex(tq):
        return max(i for i in range(nM) if starts[i] <= tq)
    # too many voices in one staff/measure: send the smallest cross-staff lane back to its home staff
    for _ in range(4):
        occ = {}
        for e in evs:
            if e.kind == 'space': continue
            sl, v = lane_of(e)
            occ.setdefault((sl, mindex(e.t)), {}).setdefault(v, []).append(e)
        changed = False
        for (sl, mi), d in occ.items():
            if len(d) <= 2: continue
            moved = [k for k in d if str(k).startswith('m')]
            if not moved: continue
            k = min(moved, key=lambda q: len(d[q]))
            for e in d[k]: e.staff = e.voicekey[0]
            I.warn.append('measure %d: cross-staff notes kept in home staff' % (mi + 1)); changed = True
        if not changed: break
    lanes = {}
    for e in evs:
        lanes.setdefault(lane_of(e), []).append(e)
    # dynamics context: attach to treble notes at same onset (else nearest following note of either staff)
    for d in dyn_evs:
        if not d.mods: continue
        cands = [e for e in evs if e.kind == 'note' and e.t >= d.t]
        if not cands: continue
        best = min(cands, key=lambda e: (e.t - d.t, 0 if slot.get(e.staff) == 'r' else 1))
        for k, val in d.mods.items():
            if k in ('d', 'h', 'hend', 't'): best.mods.setdefault(k, val)
    out = [dict() for _ in range(nM)]; lane_bad = set()
    for (sl, v), lane in lanes.items():
        lane.sort(key=lambda e: e.t)
        # check overlaps within a lane
        for x, y in zip(lane, lane[1:]):
            if y.t < x.t + x.dur - F(1, 1000) and not (x.kind == 'space' or y.kind == 'space'):
                lane_bad.add(int(y.t // bar)); I.warn.append('overlap in lane %s %s at %s' % (sl, v, float(y.t)))
        per = [[] for _ in range(nM)]
        for e in lane:
            if e.kind == 'space': continue
            st = e.t; rem = e.dur
            first = True
            while rem > 0:
                mi = max(i for i in range(nM) if starts[i] <= st)
                room = starts[mi + 1] - st
                take = min(room, rem)
                per[mi].append((st - starts[mi], take, e, first, rem - take > 0))
                st += take; rem -= take; first = False
        def lane_measure(mi, sl=sl, v=v, per=per):
                items = sorted(per[mi], key=lambda x: x[0])
                toks = []; pos = F(0); content = False
                L = mlen(mi)
                trip_open = False
                for (o, d, e, first, cont) in items:
                    if o > pos:
                        for g in split_notatable(o - pos): toks.append('x/' + DUR_OF[g])
                        pos = o
                    if o < pos: lane_bad.add(mi); continue
                    content = True
                    if e.trip:
                        base = d * F(3, 2)
                        if base not in DUR_OF: raise LyError('triplet duration %s' % d)
                        parts = [base]
                    else:
                        parts = split_notatable(d) if d not in DUR_OF else [d]
                    for pi, pd in enumerate(parts):
                        if e.kind == 'rest':
                            tok = 'r/' + DUR_OF[pd]
                        else:
                            ps = [p.name() for p in sorted(e.pitches, key=lambda p: (p.dia, p.a))]
                            tok = (ps[0] if len(ps) == 1 else '(' + ' '.join(ps) + ')') + '/' + DUR_OF[pd]
                        mods = []
                        if first and pi == 0:
                            if e.fing and e.kind == 'note':
                                fs = ''.join(e.fing)
                                if len(e.fing) == 1 and len(e.pitches) > 1:
                                    fs = e.fing[0]
                                mods.append('!f' + fs)
                            mm = e.mods
                            for k in ('st', 'ac', 'tn', 'mc', 'fe'):
                                if mm.get(k): mods.append('!' + k)
                            if mm.get('o'): mods.append('!o=' + mm['o'])
                            if mm.get('d'): mods.append('!d=' + mm['d'])
                            if mm.get('h'): mods.append('!h=' + mm['h'])
                            elif mm.get('hend'): mods.append('!h=.')
                            if mm.get('('): mods.append('!(')
                            if mm.get('t'): mods.append('!t=' + mm['t'].replace(' ', '_'))
                            if mm.get('pon') and mm.get('poff'): mods.append('!pc')
                            elif mm.get('pon'): mods.append('!pd')
                            elif mm.get('poff'): mods.append('!pu0')
                        last_part = pi == len(parts) - 1
                        if e.kind == 'note' and ((not last_part) or cont or (last_part and e.mods.get('~'))):
                            mods.append('!~')
                        if last_part and not cont and e.mods.get(')'): mods.append('!)')
                        toks.append(tok + ''.join(mods))
                        if e.trip:
                            toks[-1] += '!T'
                    pos += d
                if pos < L:
                    for g in split_notatable(L - pos): toks.append('x/' + DUR_OF[g])
                # triplet markers: wrap consecutive !T tokens into 3( 3) per group of beat
                toks = mark_trips(toks)
                ms = [p.midi for (o, d, e, f1, c1) in items if e.kind == 'note' for p in e.pitches]
                return (toks, any(e.kind in ('note', 'rest') for (o, d, e, f1, c1) in items), sum(ms) / len(ms) if ms else None)
        for mi in range(nM):
            try: out[mi][(sl, v)] = lane_measure(mi)
            except LyError as ex:
                lane_bad.add(mi); I.warn.append("measure %d lane %s%s: %s" % (mi + 1, sl, v, ex))
    # pedal-off handling: '!pu0' means release at that note's start -> move to previous note in same staff as !pu
    meas = []; bad = []
    for mi in range(nM):
        m = {}
        for sl in ('r', 'l'):
            full = split_notatable(mlen(mi))
            empty = ' '.join(('r/' if len(full) == 1 else 'x/') + DUR_OF[g] for g in full)
            L = {k: out[mi].get((sl, k)) for k in (1, 2, 'm1', 'm2')}
            act = [k for k in (1, 2, 'm1', 'm2') if L[k] and L[k][1]]
            if len(act) > 2:
                bad.append(mi); m[sl] = empty; continue
            if not act: m[sl] = empty
            elif len(act) == 1: m[sl] = ' '.join(L[act[0]][0])
            else:
                a_, b_ = act
                if (a_ in (1, 2)) != (b_ in (1, 2)) or (a_ not in (1, 2) and b_ not in (1, 2)):
                    am = L[a_][2] or 0; ao = L[b_][2] or 0
                    up, dn = (a_, b_) if am >= ao else (b_, a_)
                else: up, dn = 1, 2
                m[sl] = ' '.join(L[up][0]); m[sl + '2'] = ' '.join(L[dn][0])
        meas.append(m)
    fix_pedal_offs(meas)
    clefInit = {}
    for key, lst in I.clefs.items():
        sl = slot.get(key)
        if sl is None: continue
        default = 'treble' if sl == 'r' else 'bass'
        cur = default
        for (tq, c) in sorted(lst, key=lambda x: x[0]):
            c = {'G': 'treble', 'violin': 'treble', 'F': 'bass'}.get(c, c)
            if c not in ('treble', 'bass'): raise LyError('clef ' + c)
            if tq == 0:
                if c != default: clefInit['treble' if sl == 'r' else 'bass'] = c
                cur = c; continue
            if c == cur: continue
            mi = max(i for i in range(nM) if starts[i] <= tq)
            loc = tq - starts[mi]
            meas[mi].setdefault('clef', {}).setdefault(sl, []).append([float(loc), c])
            cur = c
    # repeats -> barline marks and play order
    order = list(range(nM))
    def mi_at(tq):
        for i in range(nM + 1):
            if starts[i] == tq: return i
        raise LyError('repeat boundary not on barline: %s' % tq)
    if I.repeats:
        order = []
        cursor = 0
        reps = sorted(I.repeats, key=lambda r: r['start'])
        for r in reps:
            a0 = mi_at(r['start']); a1 = mi_at(r['end'])
            order += list(range(cursor, a0))
            if a0 > 0: meas[a0]['begin'] = '|:'
            if r['alts']:
                alts = [(mi_at(x), mi_at(y)) for x, y in r['alts']]
                for k, (x, y) in enumerate(alts):
                    for q in range(x, y): meas[q]['volta'] = '%d.' % (k + 1)
                    if k < len(alts) - 1: meas[y - 1]['end'] = ':|'
                    else: meas[x]['voltaOpen'] = True if y - x == 1 else meas[x].get('voltaOpen')
                    if k == len(alts) - 1:
                        for q in range(x, y): meas[q]['voltaOpen'] = True
                # play order: body + alt1, body + alt2 ...
                for k, (x, y) in enumerate(alts):
                    order += list(range(a0, a1)) + list(range(x, y))
                cursor = alts[-1][1]
            else:
                meas[a1 - 1]['end'] = ':|'
                for _ in range(r['count']): order += list(range(a0, a1))
                cursor = a1
        order += list(range(cursor, nM))
    keyname = None
    if I.key:
        keyname = keysig_name(I.key)
    return dict(clefInit=clefInit, bad=sorted(set(bad) | lane_bad), key=keyname, time=lilytime(I.time), pickup=float(pick), measures=meas, order=order, warn=I.warn, clefs={str(slot.get(k, k)): [(float(a), b) for a, b in v] for k, v in I.clefs.items()})


def lilytime(t):
    return t


def mark_trips(toks):
    out = []; run = []
    def flush():
        if not run: return
        run[0] = run[0].replace('!T', '!3(', 1) if len(run) > 1 else run[0].replace('!T', '!3(!3)', 1)
        if len(run) > 1: run[-1] = run[-1].replace('!T', '!3)', 1)
        for k in range(1, len(run) - 1): run[k] = run[k].replace('!T', '', 1)
        out.extend(run); run.clear()
    for tk in toks:
        if '!T' in tk: run.append(tk)
        else: flush(); out.append(tk)
    flush()
    return out


def tok_split(x):
    return re.findall(r'\([^)]*\)\S*|\S+', x)


def fix_pedal_offs(meas):
    """'!pu0' (release at this note's start) -> '!pu' on the previous visible item of the same staff (release after it ends)."""
    for sl in ('r', 'l'):
        flat = []
        for mi, m in enumerate(meas):
            for ti, tk in enumerate(tok_split(m[sl])): flat.append((mi, ti))
        for idx, (mi, ti) in enumerate(flat):
            toks = tok_split(meas[mi][sl])
            if '!pu0' in toks[ti]:
                toks[ti] = toks[ti].replace('!pu0', ''); meas[mi][sl] = ' '.join(toks)
                k = idx - 1
                while k >= 0:
                    m2, t2 = flat[k]; tt = tok_split(meas[m2][sl])
                    if not tt[t2].startswith('x/'):
                        tt[t2] += '!pu'; meas[m2][sl] = ' '.join(tt); break
                    k -= 1


KEYS_MAJ = {('c', 0): 'C', ('g', 0): 'G', ('d', 0): 'D', ('a', 0): 'A', ('e', 0): 'E', ('b', 0): 'B', ('fis', 0): 'F#', ('cis', 0): 'C#',
            ('f', 0): 'F', ('bes', 0): 'Bb', ('es', 0): 'Eb', ('ees', 0): 'Eb', ('as', 0): 'Ab', ('aes', 0): 'Ab', ('des', 0): 'Db', ('ges', 0): 'Gb', ('ces', 0): 'Cb'}
REL_MIN = {'a': 'C', 'e': 'G', 'b': 'D', 'fis': 'A', 'cis': 'E', 'gis': 'B', 'dis': 'F#', 'ais': 'C#', 'd': 'F', 'g': 'Bb', 'c': 'Eb', 'f': 'Ab', 'bes': 'Db', 'es': 'Gb', 'ees': 'Gb', 'as': 'Cb', 'aes': 'Cb'}


def keysig_name(k):
    p, mode = k
    if mode == '\\major': return KEYS_MAJ[(p, 0)]
    if mode == '\\minor': return REL_MIN[p]
    raise LyError('mode ' + mode)


def convert(path):
    src = open(path, encoding='utf-8', errors='replace').read()
    I = Interp(src).run()
    return build(I)


if __name__ == '__main__':
    r = convert(sys.argv[1])
    json.dump(r, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
    print('measures', len(r['measures']), 'key', r['key'], 'time', r['time'], 'pickup', r['pickup'])
    for w in r['warn'][:20]: print('WARN', w)
    print('clefs', r['clefs'])
