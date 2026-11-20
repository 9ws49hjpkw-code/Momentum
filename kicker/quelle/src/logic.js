/* ===== Kickerabend · Spiellogik (rein, ohne DOM) ===== */
const KL = (() => {

  /* ---------- Helfer ---------- */
  function shuffle(arr, rnd = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function matrix(n) { return Array.from({ length: n }, () => new Array(n).fill(0)); }

  /* =========================================================
     MODUS 1 · PUNKTE-PARTY (Rotations-Duo)
     ========================================================= */

  // Spiele pro Spieler sind nur gültig, wenn Spieler × Spiele durch 4 teilbar ist
  function partyValid(n, k) { return n >= 4 && k >= 1 && (n * k) % 4 === 0; }

  function partyNearestValid(n, k, max = 8) {
    let best = null;
    for (let c = 1; c <= max; c++) {
      if (!partyValid(n, c)) continue;
      if (best === null || Math.abs(c - k) < Math.abs(best - k) ||
         (Math.abs(c - k) === Math.abs(best - k) && c > best)) best = c;
    }
    return best;
  }

  // Ein Versuch: Spielplan gierig aufbauen
  function partyTry(n, k, rnd, b2bPen) {
    const M = n * k / 4;
    const rem = new Array(n).fill(k);
    const last = new Array(n).fill(-99);   // Index des letzten Spiels
    const last2 = new Array(n).fill(-99);  // Index des vorletzten Spiels
    const partner = matrix(n), opp = matrix(n);
    const matches = [];

    for (let m = 0; m < M; m++) {
      const left = M - m;
      // Wer genau so viele Spiele übrig hat wie Partien übrig sind, MUSS jetzt spielen
      // (das garantiert mathematisch, dass am Ende jeder exakt k Spiele hat)
      const chosen = [];
      for (let p = 0; p < n; p++) if (rem[p] === left) chosen.push(p);

      while (chosen.length < 4) {
        let bestP = -1, bestS = -Infinity;
        for (let p = 0; p < n; p++) {
          if (rem[p] <= 0 || chosen.includes(p)) continue;
          let s = 0;
          if (last[p] === m - 1) s -= (last2[p] === m - 2 ? 5000 : b2bPen); // 3x am Stück nie, 2x möglichst nicht
          else if (last[p] === m - 2) s -= 25;
          s += Math.min(m - last[p], 20) * 6;        // wer lange wartet, ist dran
          s += rem[p] * 10;                          // wer noch viele Spiele hat
          for (const c of chosen) s -= (partner[p][c] * 4 + opp[p][c] * 2) - (partner[p][c] + opp[p][c] === 0 ? 6 : 0);
          s += rnd() * 14;                           // Zufall
          if (s > bestS) { bestS = s; bestP = p; }
        }
        chosen.push(bestP);
      }

      // beste Aufteilung in 2 Duos
      const [a, b, c, d] = chosen;
      const splits = [[[a, b], [c, d]], [[a, c], [b, d]], [[a, d], [b, c]]];
      let best = null, bestC = Infinity;
      for (const [x, y] of splits) {
        let cost = (partner[x[0]][x[1]] ** 2 + partner[y[0]][y[1]] ** 2) * 10;
        for (const i of x) for (const j of y) cost += opp[i][j] ** 2 * 3;
        cost += rnd() * 2;
        if (cost < bestC) { bestC = cost; best = [x, y]; }
      }
      const [A, B] = best;
      partner[A[0]][A[1]]++; partner[A[1]][A[0]]++;
      partner[B[0]][B[1]]++; partner[B[1]][B[0]]++;
      for (const i of A) for (const j of B) { opp[i][j]++; opp[j][i]++; }
      for (const p of chosen) { rem[p]--; last2[p] = last[p]; last[p] = m; }
      matches.push({ a: rnd() < .5 ? A : B, b: null });
      matches[m].b = matches[m].a === A ? B : A;
    }
    return matches;
  }

  function partyStats(n, matches) {
    const M = matches.length;
    const partner = matrix(n), opp = matrix(n);
    const games = new Array(n).fill(0);
    const appear = Array.from({ length: n }, () => []);
    let b2b = 0, triple = 0;
    const met = matrix(n);
    matches.forEach((mt, i) => {
      const all = [...mt.a, ...mt.b];
      for (const p of all) { games[p]++; appear[p].push(i); }
      partner[mt.a[0]][mt.a[1]]++; partner[mt.a[1]][mt.a[0]]++;
      partner[mt.b[0]][mt.b[1]]++; partner[mt.b[1]][mt.b[0]]++;
      for (const x of mt.a) for (const y of mt.b) { opp[x][y]++; opp[y][x]++; }
      for (const x of all) for (const y of all) if (x !== y) met[x][y] = 1;
      if (i > 0) {
        const prev = [...matches[i - 1].a, ...matches[i - 1].b];
        const prev2 = i > 1 ? [...matches[i - 2].a, ...matches[i - 2].b] : [];
        for (const p of all) if (prev.includes(p)) { b2b++; if (prev2.includes(p)) triple++; }
      }
    });
    let partnerRep = 0, maxPartner = 0, oppSq = 0, maxOpp = 0, unmet = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (!met[i][j]) unmet++;
      partnerRep += Math.max(0, partner[i][j] - 1);
      maxPartner = Math.max(maxPartner, partner[i][j]);
      oppSq += opp[i][j] ** 2;
      maxOpp = Math.max(maxOpp, opp[i][j]);
    }
    // längste Wartezeit (Spiele ohne Einsatz am Stück)
    let maxWait = 0, waitSq = 0;
    for (let p = 0; p < n; p++) {
      const seq = [-1, ...appear[p], M];
      for (let i = 1; i < seq.length; i++) {
        const g = seq[i] - seq[i - 1] - 1;
        maxWait = Math.max(maxWait, g); waitSq += g * g;
      }
    }
    return { games, b2b, triple, unmet, partnerRep, maxPartner, oppSq, maxOpp, maxWait, waitSq };
  }

  // Bewertung eines Plans. Bei 8 Spielern würde "nie zweimal hintereinander" zwei geschlossene
  // Vierergruppen erzwingen – darum zählt dort Durchmischung mehr als Pause.
  function partyCost(s, n) {
    const w = n >= 10 ? 400 : 45;
    return s.triple * 3000 + s.b2b * w + s.unmet * 30 + s.partnerRep * 100 + s.maxPartner * 40 +
           s.oppSq * 2 + s.maxOpp * 10 + s.maxWait * 15 + s.waitSq * 0.5;
  }

  function partyBuild(n, k, attempts = 1000, rnd = Math.random) {
    if (!partyValid(n, k)) throw new Error('invalid');
    let best = null, bestC = Infinity;
    const pens = [1000, 200, 60, 20];
    for (let t = 0; t < attempts; t++) {
      const ms = partyTry(n, k, rnd, pens[t % pens.length]);
      const c = partyCost(partyStats(n, ms), n);
      if (c < bestC) { bestC = c; best = ms; }
    }
    return best;
  }

  /* Rangliste: Tore → Siege → Tordifferenz */
  function partyTable(n, matches, results) {
    const rows = Array.from({ length: n }, (_, i) => ({ p: i, goals: 0, against: 0, w: 0, d: 0, l: 0, played: 0, total: 0 }));
    matches.forEach((mt, i) => {
      for (const p of [...mt.a, ...mt.b]) rows[p].total++;
      const r = results[i];
      if (!r) return;
      const add = (side, gf, ga) => side.forEach(p => {
        const row = rows[p];
        row.goals += gf; row.against += ga; row.played++;
        if (gf > ga) row.w++; else if (gf < ga) row.l++; else row.d++;
      });
      add(mt.a, r.ga, r.gb); add(mt.b, r.gb, r.ga);
    });
    rows.sort((x, y) => y.goals - x.goals || y.w - x.w ||
      (y.goals - y.against) - (x.goals - x.against));
    let place = 0;
    rows.forEach((r, i) => {
      const prev = rows[i - 1];
      if (!prev || prev.goals !== r.goals || prev.w !== r.w ||
          (prev.goals - prev.against) !== (r.goals - r.against)) place = i + 1;
      r.place = place;
    });
    return rows;
  }

  /* =========================================================
     MODUS 2 · TURNIER (Double Elimination, feste Teams)
     ========================================================= */
  const BYE = -1;

  function seeding(S) {
    let arr = [1];
    while (arr.length < S) {
      const m = arr.length * 2 + 1;
      arr = arr.flatMap(x => [x, m - x]);
    }
    return arr; // Setzpositionen 1..S
  }

  // Struktur für T Teams. Freilose = Setzplätze >= T.
  function cupBuild(T) {
    const n = Math.max(1, Math.ceil(Math.log2(T)));
    const S = 2 ** n;
    const so = seeding(S);
    const M = {};      // id -> {id, br, round, idx, s1, s2}
    const order = [];
    const add = (id, br, round, idx, s1, s2, key) => { M[id] = { id, br, round, idx, s1, s2, key }; order.push(id); };

    for (let r = 1; r <= n; r++) {
      const cnt = S / 2 ** r;
      for (let i = 0; i < cnt; i++) {
        const s1 = r === 1 ? { t: 'seed', i: so[2 * i] - 1 } : { t: 'win', m: `W${r - 1}-${2 * i}` };
        const s2 = r === 1 ? { t: 'seed', i: so[2 * i + 1] - 1 } : { t: 'win', m: `W${r - 1}-${2 * i + 1}` };
        add(`W${r}-${i}`, 'W', r, i, s1, s2, 2 * r - 1);
      }
    }
    const LR = n >= 2 ? 2 * (n - 1) : 0;
    for (let q = 1; q <= LR; q++) {
      let cnt;
      if (q === 1) cnt = S / 4;
      else if (q % 2 === 0) cnt = S / 2 ** (q / 2 + 1);
      else cnt = S / 2 ** ((q - 1) / 2 + 2);
      for (let i = 0; i < cnt; i++) {
        let s1, s2;
        if (q === 1) {
          s1 = { t: 'lose', m: `W1-${2 * i}` }; s2 = { t: 'lose', m: `W1-${2 * i + 1}` };
        } else if (q % 2 === 0) {
          const j = q / 2;                       // Verlierer aus Gewinner-Runde j+1 kommen rein
          const wi = (j % 2 === 1) ? cnt - 1 - i : i; // gespiegelt, um frühe Revanchen zu vermeiden
          s1 = { t: 'win', m: `L${q - 1}-${i}` }; s2 = { t: 'lose', m: `W${j + 1}-${wi}` };
        } else {
          s1 = { t: 'win', m: `L${q - 1}-${2 * i}` }; s2 = { t: 'win', m: `L${q - 1}-${2 * i + 1}` };
        }
        add(`L${q}-${i}`, 'L', q, i, s1, s2, q + 1);
      }
    }
    const lbChamp = n >= 2 ? { t: 'win', m: `L${LR}-0` } : { t: 'lose', m: `W1-0` };
    add('GF', 'F', 1, 0, { t: 'win', m: `W${n}-0` }, lbChamp, 100);
    add('GF2', 'F', 2, 0, { t: 'win', m: 'GF' }, { t: 'lose', m: 'GF' }, 101);
    return { T, n, S, LR, M, order };
  }

  // Ergebnisse auswerten. seeds[i] = Team auf Setzplatz i. results[id] = {a,b,winner,...}
  function cupResolve(br, seeds, results) {
    const memo = {};
    const part = (src) => {
      if (src.t === 'seed') return src.i < br.T ? seeds[src.i] : BYE;
      const o = outcome(src.m);
      if (!o) return null;
      return src.t === 'win' ? o.w : o.l;
    };
    const outcome = (id) => {
      if (id in memo) return memo[id];
      memo[id] = null;
      const m = br.M[id];
      let res = null;
      if (id === 'GF2') {
        const g = outcome('GF');
        // Entscheidungsspiel nur, wenn der Verlierer-Bracket-Sieger das Finale gewinnt
        if (!g || g.auto || g.w !== part(br.M.GF.s2)) { memo[id] = { none: true }; return memo[id]; }
      }
      const a = part(m.s1), b = part(m.s2);
      if (a === null || b === null) { memo[id] = null; return null; }
      if (a === BYE && b === BYE) res = { w: BYE, l: BYE, auto: true, a, b };
      else if (a === BYE) res = { w: b, l: BYE, auto: true, a, b };
      else if (b === BYE) res = { w: a, l: BYE, auto: true, a, b };
      else {
        const r = results[id];
        if (r && ((r.a === a && r.b === b) || (r.a === b && r.b === a)) && (r.winner === a || r.winner === b)) {
          res = { w: r.winner, l: r.winner === a ? b : a, a, b, played: true };
        } else res = null;
      }
      memo[id] = res;
      return res;
    };
    const info = {};
    for (const id of br.order) {
      const m = br.M[id];
      const o = outcome(id);
      if (o && o.none) { info[id] = { id, exists: false }; continue; }
      info[id] = {
        id, exists: true,
        a: part(m.s1), b: part(m.s2),
        outcome: o,
        played: !!(o && o.played),
        auto: !!(o && o.auto),
        ready: !o && part(m.s1) !== null && part(m.s2) !== null
      };
    }
    // Champion
    let champ = null, second = null;
    const gf = info.GF, gf2 = info.GF2;
    if (gf.outcome && !gf.outcome.auto) {
      if (!gf2.exists) { champ = gf.outcome.w; second = gf.outcome.l; }
      else if (gf2.outcome) { champ = gf2.outcome.w; second = gf2.outcome.l; }
    } else if (gf.outcome && gf.outcome.auto) { champ = gf.outcome.w; }
    let third = null;
    if (br.LR > 0) {
      const lf = info[`L${br.LR}-0`];
      if (lf && lf.outcome && lf.outcome.played) third = lf.outcome.l;
    }
    return { info, champ, second, third, part };
  }

  // Ungültig gewordene Ergebnisse (nach Korrektur) entfernen
  function cupSanitize(br, seeds, results) {
    const clean = { ...results };
    let removed = [];
    for (let loop = 0; loop < 50; loop++) {
      const { info } = cupResolve(br, seeds, clean);
      let changed = false;
      for (const id of Object.keys(clean)) {
        const it = info[id];
        if (!it || !it.exists || !it.played) { removed.push(id); delete clean[id]; changed = true; }
      }
      if (!changed) break;
    }
    return { results: clean, removed };
  }

  function cupLosses(br, info, T) {
    const losses = new Array(T).fill(0), wins = new Array(T).fill(0), games = new Array(T).fill(0);
    for (const id of br.order) {
      const it = info[id];
      if (!it.exists || !it.played) continue;
      losses[it.outcome.l]++; wins[it.outcome.w]++;
      games[it.outcome.l]++; games[it.outcome.w]++;
    }
    return { losses, wins, games };
  }

  // Nächstes Spiel wählen: Runden-Reihenfolge, Pausen für Teams, die gerade gespielt haben
  function cupPick(br, info, lastTeams, exclude = null) {
    let best = null, bestS = Infinity;
    for (const id of br.order) {
      const it = info[id];
      if (!it.exists || !it.ready || id === exclude) continue;
      const m = br.M[id];
      let s = m.key * 10 + (m.br === 'L' ? 1 : 0) + m.idx * 0.01;
      if (lastTeams.includes(it.a) || lastTeams.includes(it.b)) s += 15;
      if (s < bestS) { bestS = s; best = id; }
    }
    return best;
  }

  return { shuffle, partyValid, partyNearestValid, partyBuild, partyStats, partyTable,
           BYE, cupBuild, cupResolve, cupSanitize, cupLosses, cupPick, seeding };
})();
if (typeof module !== 'undefined') module.exports = KL;
