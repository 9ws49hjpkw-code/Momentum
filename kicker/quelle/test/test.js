const KL = require('../src/logic.js');
let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } };

console.log('=== PUNKTE-PARTY ===');
console.log('N  k  Partien  2xHintereinander  maxPartner  partnerWdh  maxGegner  maxWarten  ms');
for (let n = 4; n <= 16; n++) {
  for (let k = 1; k <= 8; k++) {
    if (!KL.partyValid(n, k)) continue;
    const t0 = Date.now();
    const ms = KL.partyBuild(n, k);
    const dt = Date.now() - t0;
    const s = KL.partyStats(n, ms);
    ok(ms.length === n * k / 4, `n${n}k${k} Anzahl`);
    ok(s.games.every(g => g === k), `n${n}k${k} jeder exakt k: ${s.games}`);
    for (const m of ms) ok(new Set([...m.a, ...m.b]).size === 4, `n${n}k${k} doppelt in Partie`);
    if (n >= 10) ok(s.b2b === 0, `n${n}k${k} b2b=${s.b2b}`);
    if (n >= 8) ok(s.triple === 0, `n${n}k${k} triple=${s.triple}`);
    if ([8, 10, 11, 12].includes(n) || k === 4)
      console.log(String(n).padEnd(3), String(k).padEnd(3), String(ms.length).padEnd(8), String(s.b2b).padEnd(5),
        String(s.maxPartner).padEnd(11), String(s.partnerRep).padEnd(11), String(s.maxOpp).padEnd(10), String(s.maxWait).padEnd(10), dt);
  }
}
// ungültige Kombis -> Vorschlag
for (const [n, k] of [[11, 3], [11, 5], [10, 3], [13, 2], [9, 6]])
  console.log(`Vorschlag n=${n} k=${k} -> ${KL.partyNearestValid(n, k)}`);

console.log('\n=== TURNIER (Double Elimination) ===');
function simulate(T, rnd, withEdits) {
  const br = KL.cupBuild(T);
  const seeds = KL.shuffle([...Array(T).keys()], rnd);
  let results = {};
  let last = [];
  let steps = 0;
  while (true) {
    const { info, champ } = KL.cupResolve(br, seeds, results);
    if (champ !== null) {
      const { losses } = KL.cupLosses(br, info, T);
      const played = Object.values(info).filter(x => x.exists && x.played).length;
      ok(played === 2 * T - 2 || played === 2 * T - 1, `T${T} Spiele=${played}`);
      ok(losses[champ] <= 1, `T${T} Champion hat ${losses[champ]} Niederlagen`);
      ok(losses.filter((l, i) => i !== champ).every(l => l === 2), `T${T} alle anderen 2 Niederlagen: ${losses}`);
      return played;
    }
    const id = KL.cupPick(br, info, last);
    ok(id, `T${T} kein Spiel verfügbar, aber kein Champion`);
    if (!id) return -1;
    const it = info[id];
    ok(it.a !== it.b && it.a >= 0 && it.b >= 0, `T${T} ungültige Paarung`);
    const winner = rnd() < .5 ? it.a : it.b;
    results[id] = { a: it.a, b: it.b, winner };
    last = [it.a, it.b];
    // Korrektur simulieren: zufällig ein früheres Ergebnis drehen
    if (withEdits && rnd() < 0.15) {
      const keys = Object.keys(results);
      const kk = keys[Math.floor(rnd() * keys.length)];
      const r = results[kk];
      results[kk] = { ...r, winner: r.winner === r.a ? r.b : r.a };
      results = KL.cupSanitize(br, seeds, results).results;
    }
    if (++steps > 500) { ok(false, `T${T} Endlosschleife`); return -1; }
  }
}
for (let T = 2; T <= 8; T++) {
  let mn = 99, mx = 0;
  for (let i = 0; i < 3000; i++) {
    const p = simulate(T, Math.random, i % 2 === 1);
    mn = Math.min(mn, p); mx = Math.max(mx, p);
  }
  const br = KL.cupBuild(T);
  console.log(`T=${T} Teams (${T * 2}/${T * 2 + 1} Spieler): ${mn}–${mx} Spiele, Bracket ${br.S}, Freilose ${br.S - T}`);
}
// Back-to-back Analyse für 5 und 6 Teams
for (const T of [4, 5, 6]) {
  let b2b = 0, games = 0;
  for (let i = 0; i < 500; i++) {
    const br = KL.cupBuild(T); const seeds = [...Array(T).keys()];
    let results = {}, last = [];
    while (true) {
      const { info, champ } = KL.cupResolve(br, seeds, results);
      if (champ !== null) break;
      const id = KL.cupPick(br, info, last); const it = info[id];
      if (last.includes(it.a) || last.includes(it.b)) b2b++;
      games++;
      results[id] = { a: it.a, b: it.b, winner: Math.random() < .5 ? it.a : it.b }; last = [it.a, it.b];
    }
  }
  console.log(`T=${T}: Anteil Spiele, in denen ein Team direkt wieder ran muss: ${(100 * b2b / games).toFixed(1)}%`);
}
console.log(fails ? `\n${fails} FEHLER` : '\nAlle Tests bestanden ✔');
