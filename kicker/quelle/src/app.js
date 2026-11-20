/* ===== Kickerabend · App ===== */
(() => {
'use strict';
const BUILD = '__BUILD__';
document.documentElement.lang = 'de';
const KEY = 'kickerabend.v1';
const MIN_PER_GAME = 6;          // grobe Schätzung inkl. Wechsel
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Icons (Linien) ---------- */
const I = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>',
  dice: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r=".9"/><circle cx="15" cy="15" r=".9"/><circle cx="15" cy="9" r=".9"/><circle cx="9" cy="15" r=".9"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 4.6c1.1 1.7 2.3 2.7 4.3 2.7H21M3 17h3.5c1.4 0 2.4-.5 3.2-1.4M13.3 8.4C14.1 7.5 15.1 7 16.5 7H21M18 4l3 3-3 3M18 14l3 3-3 3"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  crown: '<svg viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>',
  trophy: '<svg viewBox="0 0 64 64"><path d="M20 10h24v14a12 12 0 0 1-24 0z"/><path d="M20 15h-7a7 7 0 0 0 7 9M44 15h7a7 7 0 0 1-7 9"/><path d="M32 36v10M24 54h16M26 46h12v8H26z"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>'
};
const ART_PARTY = `<svg viewBox="0 0 170 84" aria-hidden="true"><g fill="none" stroke-width="2" stroke-linecap="round">
  <path d="M33 20 C 80 20, 90 64, 137 64" stroke="#E4B76C"/><path d="M33 64 C 80 64, 90 20, 137 20" stroke="#5E6470"/>
  <circle cx="20" cy="20" r="11" stroke="#E4B76C"/><circle cx="20" cy="64" r="11" stroke="#9097A3"/>
  <circle cx="150" cy="20" r="11" stroke="#9097A3"/><circle cx="150" cy="64" r="11" stroke="#E4B76C"/>
  <circle cx="85" cy="42" r="5.5" fill="#F1EFEA" stroke="none"/></g></svg>`;
const ART_CUP = `<svg viewBox="0 0 170 84" aria-hidden="true"><g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 10h34v20H6M6 54h34v20H6M40 20h40v44H40" stroke="#5E6470"/>
  <path d="M6 30h34v-10h40v22h40" stroke="#E4B76C"/>
  <circle cx="140" cy="42" r="13" stroke="#E4B76C"/><path d="M135 42l3.5 3.5L146 38" stroke="#E4B76C"/></g></svg>`;

const TEAM_NAMES = ['Kurbelkönige', 'Stangenfieber', 'Torfabrik', 'Die Abstauber', 'Dynamo Doppelpass', 'Eintracht Eiskalt',
  'Bandenzauber', 'Die Konterkönige', 'Real Kicker', 'Abseits gibt’s nicht', 'Kickpiraten', 'FC Wackelstange',
  'Die Schnellschüsse', 'Ballverliebt', 'Tischfeuer', 'Die Puppenspieler', 'Rotation Rakete', 'Kurbelkartell',
  'Sporting Spin', 'Die Zauberkurbler', 'Olympique Ohnegnade', 'Inter Kurbel', 'Banana Flanke', 'Die Torjäger'];

/* ---------- Zustand ---------- */
function blank() {
  return { v: 1, view: 'home', roster: [], draft: null, party: null, cup: null, tab: { party: 'plan', cup: 'bracket' }, celebrated: {} };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 1) return Object.assign(blank(), s);
  } catch (e) { /* leer */ }
  return null;
}
let S = load() || blank();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* Speicher voll oder gesperrt */ } }
try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => {}); } catch (e) {}

// Ansicht passt nicht zum Zustand → Start
if ((S.view === 'party' && !S.party) || (S.view === 'cup' && !S.cup) ||
    (['names', 'partyCfg', 'teams'].includes(S.view) && !S.draft)) S.view = 'home';

const ui = { lastView: null, nowKey: null, reroll: false, modal: null };

/* ---------- Helfer ---------- */
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function duration(games) {
  const m = games * MIN_PER_GAME;
  if (m < 60) return `≈ ${m} Min`;
  const h = Math.floor(m / 60), r = m % 60;
  return `≈ ${h} Std${r ? ` ${r} Min` : ''}`;
}
function duoHTML(names) { return `${esc(names[0])} <span class="amp">&amp;</span> ${esc(names[1])}`; }
function randomTeamNames(count, taken = []) {
  const pool = KL.shuffle(TEAM_NAMES.filter(n => !taken.includes(n)));
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[i] || `Team ${taken.length + i + 1}`);
  return out;
}

/* =========================================================
   Rendering
   ========================================================= */
function shell({ title = '', sub = '', left = null, right = null, body = '', action = '' }) {
  const lb = left ? `<button class="iconbtn" data-act="${left.act}" aria-label="${left.label}">${I[left.icon]}</button>` : '';
  const rb = right ? `<button class="iconbtn" data-act="${right.act}" aria-label="${right.label}">${I[right.icon]}</button>` : '';
  return `<header class="topbar">${lb}<h1>${esc(title)}${sub ? ` <span class="sub">· ${esc(sub)}</span>` : ''}</h1>${rb}</header>
    <main class="main"><div class="content">${body}</div></main>
    ${action ? `<div class="actionbar"><div class="inner">${action}</div></div>` : ''}`;
}

function render() {
  const app = $('#app');
  const prevMain = $('.main');
  const sameView = ui.lastView === S.view;
  const keep = sameView && prevMain ? {
    top: prevMain.scrollTop,
    lefts: [...document.querySelectorAll('.bk-scroll')].map(e => e.scrollLeft)
  } : null;

  let html;
  switch (S.view) {
    case 'names': html = viewNames(); break;
    case 'partyCfg': html = viewPartyCfg(); break;
    case 'teams': html = viewTeams(); break;
    case 'party': html = viewParty(); break;
    case 'cup': html = viewCup(); break;
    default: html = viewHome();
  }
  app.innerHTML = html;
  const main = $('.main');
  if (!sameView) { main.firstElementChild.classList.add('view-enter'); main.scrollTop = 0; }
  else if (keep) {
    main.scrollTop = keep.top;
    document.querySelectorAll('.bk-scroll').forEach((e, i) => { if (keep.lefts[i] != null) e.scrollLeft = keep.lefts[i]; });
  }
  const bar = $('.topbar');
  const onScroll = () => bar.classList.toggle('scrolled', main.scrollTop > 4);
  main.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  ui.lastView = S.view;
  ui.reroll = false;
}

/* ---------- Start ---------- */
function viewHome() {
  let resume = '';
  if (S.party) {
    const P = S.party, done = Object.keys(P.results).length, M = P.matches.length;
    resume = resumeCard('Punkte-Party läuft', done >= M ? 'Alle Spiele gespielt · Siegerehrung wartet' : `Spiel ${done + 1} von ${M} · ${P.players.length} Spieler`, done / M, 'party');
  } else if (S.cup) {
    const ctx = cupCtx();
    const total = 2 * S.cup.teams.length - 1;
    resume = resumeCard('Turnier läuft', ctx.champ !== null ? `Sieger: ${S.cup.teams[ctx.champ].name}` : `${plural(ctx.playedCount, 'Spiel', 'Spiele')} gespielt · ${S.cup.teams.length} Teams`, ctx.champ !== null ? 1 : ctx.playedCount / total, 'cup');
  }
  const body = `<div class="wrap home">
    <div class="hero">
      <div class="eyebrow">Kicker · 2 gegen 2</div>
      <h2 class="h-xl">Kicker<span>abend.</span> <em class="by">by Nils</em></h2>
      <p class="lead">Modus wählen, Namen eintragen, losspielen. Wer gegen wen spielt, regelt die App.</p>
    </div>
    ${resume}
    <div class="modes">
      <button class="mode" data-act="start" data-mode="party">
        <div class="art">${ART_PARTY}</div>
        <h3>Punkte-Party</h3>
        <p>Jedes Spiel neue, zufällige Duos. Jeder sammelt die Tore seines Duos. Wer am Ende die meisten hat, gewinnt.</p>
        <div class="tags"><span class="tag">Einzelwertung</span><span class="tag">Jeder gleich oft</span></div>
        <span class="go">${I.arrow}</span>
      </button>
      <button class="mode" data-act="start" data-mode="cup">
        <div class="art">${ART_CUP}</div>
        <h3>Turnier</h3>
        <p>Feste Zweierteams. Wer verliert, spielt im Verlierer-Bracket weiter. Erst nach zwei Niederlagen ist man raus.</p>
        <div class="tags"><span class="tag">Teamwertung</span><span class="tag">Double Elimination</span></div>
        <span class="go">${I.arrow}</span>
      </button>
    </div>
    <div class="foot">Alles wird automatisch auf diesem Gerät gespeichert · Build ${BUILD}</div>
  </div>`;
  return shell({ body });
}
function resumeCard(title, text, frac, mode) {
  return `<button class="resume" data-act="resume" data-mode="${mode}">
    <div class="t"><b>${esc(title)}</b><span>${esc(text)}</span><div class="bar"><i style="width:${Math.round(Math.min(1, frac) * 100)}%"></i></div></div>
    <span class="btn btn-primary" style="min-height:48px;padding:0 20px">Weiter ${I.arrow}</span></button>`;
}

/* ---------- Schritt 1: Namen ---------- */
function viewNames() {
  const D = S.draft;
  const n = D.names.length;
  const fields = D.names.map((v, i) => nameField(i, v)).join('');
  const body = `<div class="narrow setup">
    <div><div class="eyebrow">Schritt 1 von 2</div><h2 class="h-lg">Wer spielt mit?</h2></div>
    <div class="stepper">
      <button data-act="count" data-d="-1" ${n <= 4 ? 'disabled' : ''} aria-label="Weniger">${I.minus}</button>
      <div class="val"><b class="num" id="cnt">${n}</b><small>Spieler</small></div>
      <button data-act="count" data-d="1" ${n >= 16 ? 'disabled' : ''} aria-label="Mehr">${I.plus}</button>
    </div>
    <div class="names" id="names">${fields}</div>
    <div class="errmsg" id="nameErr"></div>
  </div>`;
  return shell({
    title: D.mode === 'party' ? 'Punkte-Party' : 'Turnier', left: { act: 'go-home', icon: 'back', label: 'Zurück' }, body,
    action: `<button class="btn btn-primary" data-act="names-next">Weiter ${I.arrow}</button>`
  });
}
function nameField(i, v, isNew) {
  return `<label class="field${isNew ? ' new' : ''}" id="f${i}"><span class="idx">${i + 1}</span>
    <input id="name-${i}" data-name="${i}" value="${esc(v)}" placeholder="Spieler ${i + 1}" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false" enterkeyhint="next" maxlength="18"></label>`;
}

/* ---------- Schritt 2a: Spiele pro Person ---------- */
function viewPartyCfg() {
  const D = S.draft, n = D.names.length;
  if (!KL.partyValid(n, D.k)) D.k = KL.partyNearestValid(n, D.k || 4);
  const valid = [1, 2, 3, 4, 5, 6, 7, 8].filter(k => KL.partyValid(n, k));
  const chips = [1, 2, 3, 4, 5, 6, 7, 8].map(k => {
    const ok = KL.partyValid(n, k);
    return `<button class="chip num ${k === D.k ? 'on' : ''} ${ok ? '' : 'off'}" data-act="pick-k" data-k="${k}" aria-label="${k} Spiele">${k}</button>`;
  }).join('');
  const M = n * D.k / 4;
  let rule;
  if (valid.length === 8) rule = `Bei ${n} Spielern geht jede Anzahl auf.`;
  else rule = `Bei <b>${n} Spielern</b> geht nur ${valid.join(', ').replace(/, (\d+)$/, ' oder $1')}. Pro Partie stehen immer genau 4 Leute am Kicker, also muss Spieler × Spiele durch 4 teilbar sein (${n} × ${D.k} = ${n * D.k} → ${M} Partien). Sonst hätte am Ende jemand ein Spiel mehr oder weniger.`;
  const warn = D.kWarn ? `<div class="note" style="border-color:rgba(238,123,110,.35)">${I.info}<div><b>${D.kWarn} Spiele gehen bei ${n} Spielern nicht.</b> Dann hätte nicht jeder gleich oft gespielt. Ich habe ${D.k} ausgewählt.</div></div>` : '';
  const pauseN = n - 4;
  const body = `<div class="narrow setup">
    <div><div class="eyebrow">Schritt 2 von 2</div><h2 class="h-lg">Wie oft spielt jeder?</h2></div>
    <p class="lead">Jede Partie ist 2 gegen 2. Die Duos werden jedes Mal neu ausgelost, und jeder bekommt die Tore seines Duos gutgeschrieben.</p>
    <div class="chips">${chips}</div>
    ${warn}
    <div class="summary">
      <div class="stat"><b class="num">${M}</b><span>Partien</span></div>
      <div class="stat"><b class="num">${D.k}×</b><span>spielt jeder</span></div>
      <div class="stat"><b class="num">${duration(M).replace('≈ ', '')}</b><span>ungefähr (6 Min/Spiel)</span></div>
    </div>
    <div class="note">${I.info}<div>${rule}${pauseN > 0 ? ` Während einer Partie haben ${plural(pauseN, 'Person', 'Leute')} Pause.` : ' Bei 4 Leuten spielt jeder jede Partie, nur die Duos wechseln.'}</div></div>
  </div>`;
  return shell({
    title: 'Punkte-Party', left: { act: 'back-names', icon: 'back', label: 'Zurück' }, body,
    action: `<button class="btn btn-primary" data-act="party-create">${I.shuffle} Spielplan auslosen</button>`
  });
}

/* ---------- Schritt 2b: Teams ---------- */
function viewTeams() {
  const D = S.draft, n = D.names.length;
  const odd = n % 2 === 1;
  const used = new Set(D.teams.flatMap(t => t.m));
  const free = D.names.map((_, i) => i).filter(i => !used.has(i));
  const jokerIdx = D.teamMode === 'random' ? D.joker : (odd && free.length === 1 ? free[0] : null);
  const teamCards = D.teams.map((t, i) => `<div class="team" style="animation-delay:${i * 40}ms">
      <div class="row"><input id="team-${i}" data-team="${i}" value="${esc(t.name)}" placeholder="Team ${i + 1}" maxlength="24" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done">
        <button class="smallbtn" data-act="team-rename" data-i="${i}" aria-label="Neuer Name">${I.dice}</button>
        ${D.teamMode === 'manual' ? `<button class="smallbtn" data-act="team-split" data-i="${i}" aria-label="Team auflösen">${I.x}</button>` : ''}</div>
      <div class="members"><b>${esc(D.names[t.m[0]])}</b> &amp; <b>${esc(D.names[t.m[1]])}</b></div></div>`).join('');
  const jokerCard = jokerIdx != null ? `<div class="joker"><span class="jbadge">JOKER</span><div class="t"><b>${esc(D.names[jokerIdx])}</b>Springt jedes Spiel bei einem anderen Team ein. Wer dafür aussetzt, rotiert fair durch.</div></div>` : '';
  let manual = '';
  if (D.teamMode === 'manual') {
    const need = free.length - (odd ? 1 : 0);
    manual = `<div class="note">${I.info}<div>${need > 0 ? `<b>Tippe zwei Namen an</b>, um ein Team zu bilden.${odd ? ' Wer am Ende übrig bleibt, wird Joker.' : ''}` : '<b>Alle sind eingeteilt.</b> Mit × kannst du ein Team wieder auflösen.'}</div></div>
      ${need > 0 ? `<div class="pool">${free.map(i => `<button class="pchip ${D.sel === i ? 'sel' : ''}" data-act="pool" data-i="${i}">${esc(D.names[i])}</button>`).join('')}</div>` : ''}`;
  }
  const T = Math.floor(n / 2);
  const ready = D.teams.length === T && D.teams.length >= 2;
  const body = `<div class="narrow setup">
    <div><div class="eyebrow">Schritt 2 von 2</div><h2 class="h-lg">Feste Teams</h2></div>
    <div class="panel-head">
      <div class="segctl"><button class="seg ${D.teamMode === 'random' ? 'on' : ''}" data-act="team-mode" data-m="random">Zufällig</button><button class="seg ${D.teamMode === 'manual' ? 'on' : ''}" data-act="team-mode" data-m="manual">Selbst bilden</button></div>
      ${D.teamMode === 'random' ? `<button class="btn btn-ghost" data-act="team-shuffle">${I.shuffle} Neu mischen</button>` : ''}
    </div>
    ${manual}
    ${D.teams.length ? `<div class="teams">${teamCards}</div>` : ''}
    ${jokerCard}
    <div class="note">${I.info}<div><b>So läuft's:</b> ${T} Teams, Gewinner- und Verlierer-Bracket. Wer ein Spiel verliert, spielt im Verlierer-Bracket weiter, erst nach der zweiten Niederlage ist man raus. Das sind ${2 * T - 2} bis ${2 * T - 1} Spiele, ${duration(2 * T - 2)}.${(2 ** Math.ceil(Math.log2(T))) - T > 0 ? ` Weil ${T} keine Zweierpotenz ist, bekommen ${(2 ** Math.ceil(Math.log2(T))) - T} ausgeloste Teams in Runde 1 ein Freilos.` : ''}</div></div>
  </div>`;
  return shell({
    title: 'Turnier', left: { act: 'back-names', icon: 'back', label: 'Zurück' }, body,
    action: `<button class="btn btn-primary" data-act="cup-create" ${ready ? '' : 'disabled'}>Turnier starten ${I.arrow}</button>`
  });
}
function randomTeams() {
  const D = S.draft, n = D.names.length;
  const idx = KL.shuffle(D.names.map((_, i) => i));
  D.joker = n % 2 ? idx.pop() : null;
  const names = randomTeamNames(idx.length / 2);
  D.teams = [];
  for (let i = 0; i < idx.length; i += 2) D.teams.push({ m: [idx[i], idx[i + 1]], name: names[i / 2] });
}

/* ---------- Punkte-Party live ---------- */
function partyState() {
  const P = S.party, M = P.matches.length;
  const open = [];
  for (let i = 0; i < M; i++) if (!P.results[i]) open.push(i);
  return { P, M, cur: open.length ? open[0] : -1, nxt: open.length > 1 ? open[1] : -1, done: M - open.length };
}
function viewParty() {
  const { P, M, cur, nxt, done } = partyState();
  const nm = (i) => P.players[i];
  let left;
  if (cur >= 0) {
    const mt = P.matches[cur];
    const playing = new Set([...mt.a, ...mt.b]);
    const pause = P.players.map((p, i) => i).filter(i => !playing.has(i)).map(nm);
    const key = 'p' + cur;
    const swap = ui.nowKey !== key; ui.nowKey = key;
    left = `<section class="now ${swap ? 'swap' : ''}">
      <div class="top"><span class="live-dot"><i></i>Jetzt spielt</span><span class="count">Spiel ${cur + 1} / ${M}</span></div>
      <div class="versus">
        <div class="side"><div class="who">${duoHTML(mt.a.map(nm))}</div></div>
        <div class="vs">VS</div>
        <div class="side r"><div class="who">${duoHTML(mt.b.map(nm))}</div></div>
      </div>
      <div class="cta"><button class="btn btn-primary btn-block" data-act="party-result" data-i="${cur}">Ergebnis eintragen</button></div>
      ${pause.length ? `<div class="pause">Pause: <b>${pause.map(esc).join(', ')}</b></div>` : ''}
    </section>`;
    if (nxt >= 0) {
      const n2 = P.matches[nxt];
      const both = [...n2.a, ...n2.b].filter(p => playing.has(p)).length;
      left += `<section class="next"><div class="eyebrow">Als Nächstes · Spiel ${nxt + 1}</div>
        <div class="row"><span>${duoHTML(n2.a.map(nm))}</span><span class="v">VS</span><span>${duoHTML(n2.b.map(nm))}</span></div>
        <div class="muted" style="font-size:14px">${both ? `${plural(both, 'Person spielt', 'Leute spielen')} direkt weiter, die anderen machen sich schon bereit.` : 'Macht euch schon mal bereit.'}</div></section>`;
    } else left += `<section class="next"><div class="eyebrow">Letzte Partie</div><div class="muted">Danach steht die Siegerin oder der Sieger fest.</div></section>`;
  } else {
    ui.nowKey = 'pdone';
    const top = KL.partyTable(P.players.length, P.matches, P.results)[0];
    left = `<section class="now"><div class="top"><span class="live-dot">Fertig</span><span class="count">${M} / ${M}</span></div>
      <h2 class="h-lg">Alle Spiele gespielt.</h2>
      <p class="lead" style="margin-top:8px">Vorne: <b class="brass">${esc(nm(top.p))}</b> mit ${plural(top.goals, 'Tor', 'Toren')}.</p>
      <div class="cta"><button class="btn btn-primary btn-block" data-act="celebrate">Siegerehrung</button></div></section>`;
  }

  const tab = S.tab.party;
  let panel;
  if (tab === 'plan') {
    const st = P.stats;
    const facts = [`Jeder spielt genau ${P.k}×`,
      st.b2b === 0 ? 'niemand zweimal hintereinander' : (st.triple === 0 ? 'niemand dreimal hintereinander' : 'Pausen so fair wie möglich'),
      st.partnerRep === 0 ? 'kein Duo doppelt' : plural(st.partnerRep, 'Duo-Wiederholung', 'Duo-Wiederholungen')];
    panel = `<div class="panel-head"><div class="muted" style="font-size:14px">${facts.join(' · ')}</div>
        ${done === 0 ? `<button class="btn btn-ghost" data-act="party-reroll">${I.shuffle} Neu auslosen</button>` : ''}</div>
      <div class="plan ${ui.reroll ? 'reroll' : ''}">${P.matches.map((mt, i) => {
        const r = P.results[i];
        const wa = r && r.ga > r.gb, wb = r && r.gb > r.ga;
        return `<button class="pm ${i === cur ? 'cur' : ''} ${r ? 'done' : ''}" data-act="party-result" data-i="${i}" style="${ui.reroll ? `animation-delay:${i * 30}ms` : ''}">
          <span class="no">${i + 1}</span>
          <span class="duo"><span class="${wa ? 'w' : ''}">${duoHTML(mt.a.map(nm))}</span><span class="v">VS</span><span class="${wb ? 'w' : ''}">${duoHTML(mt.b.map(nm))}</span></span>
          <span class="res ${r ? 'num' : 'todo'}">${r ? `${r.ga}:${r.gb}` : (i === cur ? 'JETZT' : '')}</span></button>`;
      }).join('')}</div>`;
  } else {
    const rows = KL.partyTable(P.players.length, P.matches, P.results);
    panel = `<div class="th"><span>#</span><span>Spieler</span><span>S · U · N</span><span>Tore</span></div>
      <div class="table">${rows.map((r, i) => `<div class="tr ${r.place === 1 && done ? 'top1' : ''}" style="animation-delay:${i * 25}ms">
        <span class="pl">${r.place}</span><span class="nm">${esc(nm(r.p))}<small>${r.played} / ${r.total} gespielt</small></span>
        <span class="wdl">${r.w} · ${r.d} · ${r.l}</span><span class="gl">${r.goals}</span></div>`).join('')}</div>
      <div class="muted" style="font-size:13px;padding:4px 4px 0">Gewertet wird: Tore, dann Siege, dann Tordifferenz.</div>`;
  }
  const body = `<div class="wrap live"><div class="left">${left}</div>
    <div class="right"><div class="tabs"><button class="tab ${tab === 'plan' ? 'on' : ''}" data-act="tab" data-t="plan">Spielplan</button><button class="tab ${tab === 'table' ? 'on' : ''}" data-act="tab" data-t="table">Rangliste</button></div>${panel}</div></div>`;
  return shell({ title: 'Punkte-Party', sub: `${done}/${M}`, left: { act: 'go-home', icon: 'home', label: 'Start' }, right: { act: 'menu', icon: 'more', label: 'Menü' }, body });
}

/* ---------- Turnier: Kontext ---------- */
const brCache = {};
function cupCtx() {
  const C = S.cup, T = C.teams.length;
  const br = brCache[T] || (brCache[T] = KL.cupBuild(T));
  const res = KL.cupResolve(br, C.seeds, C.results);
  const { info } = res;
  // strukturelle Freilose
  const sb = {};
  const structBye = (src) => {
    if (src.t === 'seed') return src.i >= T;
    if (src.m === 'GF' || src.m === 'GF2') return false;
    const m = br.M[src.m];
    const b1 = structBye(m.s1), b2 = structBye(m.s2);
    return src.t === 'win' ? (b1 && b2) : (b1 || b2);
  };
  const isAuto = (id) => {
    if (id in sb) return sb[id];
    const m = br.M[id];
    return (sb[id] = id !== 'GF' && id !== 'GF2' && (structBye(m.s1) || structBye(m.s2)));
  };
  // Labels G1.., V1..
  const label = {}; let g = 0, v = 0;
  for (const id of br.order) {
    if (isAuto(id)) continue;
    const m = br.M[id];
    if (m.br === 'W') label[id] = 'G' + (++g);
    else if (m.br === 'L') label[id] = 'V' + (++v);
    else label[id] = id === 'GF' ? 'Finale' : 'Entscheidung';
  }
  const tname = (t) => C.teams[t].name;
  const placeholder = (src) => {
    if (src.t === 'seed') return src.i < T ? tname(C.seeds[src.i]) : 'Freilos';
    const p = res.part(src);
    if (p !== null && p !== KL.BYE) return tname(p);
    if (isAuto(src.m) && src.t === 'win') {
      const m = br.M[src.m];
      return placeholder(structBye(m.s1) ? m.s2 : m.s1);
    }
    return (src.t === 'win' ? 'Sieger ' : 'Verlierer ') + (label[src.m] || '');
  };
  const lbRoundNo = {}; let lbn = 0;
  for (let q = 1; q <= br.LR; q++) if (br.order.some(id => br.M[id].br === 'L' && br.M[id].round === q && !isAuto(id))) lbRoundNo[q] = ++lbn;
  const stage = (id) => {
    const m = br.M[id];
    if (m.br === 'W') return m.round === br.n ? (br.n === 1 ? 'Erstes Duell' : 'Gewinner-Finale') : `Gewinner · Runde ${m.round}`;
    if (m.br === 'L') return m.round === br.LR ? 'Verlierer-Finale' : `Verlierer · Runde ${lbRoundNo[m.round]}`;
    return id === 'GF' ? 'Großes Finale' : 'Entscheidungsspiel';
  };
  // gültige Historie
  const hist = C.history.filter(id => info[id] && info[id].played);
  const lastId = hist[hist.length - 1];
  const lastTeams = lastId ? [info[lastId].a, info[lastId].b] : [];
  const cur = res.champ === null ? KL.cupPick(br, info, lastTeams) : null;
  const { losses, wins, games } = KL.cupLosses(br, info, T);
  const playedCount = br.order.filter(id => info[id].exists && info[id].played).length;
  return { C, T, br, info, res, champ: res.champ, isAuto, label, placeholder, stage, cur, losses, wins, games, playedCount, hist, structBye, tname };
}

// Joker: Wer setzt in diesem Spiel aus?
function jokerOptions(ctx, id) {
  const C = ctx.C;
  if (C.joker == null) return null;
  const it = ctx.info[id];
  const four = [...C.teams[it.a].m, ...C.teams[it.b].m];
  const sit = {}, teamJ = {};
  let lastTeam = null;
  for (const hid of ctx.hist) {
    const r = C.results[hid];
    if (r && r.sub != null) {
      sit[r.sub] = (sit[r.sub] || 0) + 1;
      const tm = C.teams.findIndex(t => t.m.includes(r.sub));
      teamJ[tm] = (teamJ[tm] || 0) + 1; lastTeam = tm;
    }
  }
  const hash = (p) => ((p + 1) * 2654435761 + id.length * 97 + id.charCodeAt(id.length - 1) * 31) % 1000 / 1000;
  const scored = four.map(p => {
    const tm = C.teams.findIndex(t => t.m.includes(p));
    return { p, s: (sit[p] || 0) * 10 + (teamJ[tm] || 0) * 3 + (tm === lastTeam ? 2 : 0) + hash(p) };
  }).sort((a, b) => a.s - b.s).map(x => x.p);
  return [...scored, null]; // null = Joker pausiert
}
function jokerSub(ctx, id) {
  const opts = jokerOptions(ctx, id);
  if (!opts) return undefined;
  const k = (ctx.C.jokerPick[id] || 0) % opts.length;
  return opts[k];
}

function cupNextPreview(ctx) {
  const { br, info, cur } = ctx;
  if (!cur) return null;
  const it = info[cur];
  const id2 = KL.cupPick(br, info, [it.a, it.b], cur);
  if (id2) return { id: id2, a: ctx.tname(info[id2].a), b: ctx.tname(info[id2].b) };
  const dep = (src) => {
    const p = ctx.res.part(src);
    if (p !== null) return p === KL.BYE ? null : ctx.tname(p);
    if (src.t === 'seed') return null;
    if (src.m === cur) return src.t === 'win' ? 'Sieger von jetzt' : 'Verlierer von jetzt';
    if (ctx.isAuto(src.m) && src.t === 'win') { const m = br.M[src.m]; return dep(ctx.structBye(m.s1) ? m.s2 : m.s1); }
    return null;
  };
  const ids = br.order.slice().sort((x, y) => br.M[x].key - br.M[y].key);
  for (const id of ids) {
    if (id === cur || id === 'GF2' || ctx.isAuto(id)) continue;
    const x = info[id];
    if (!x.exists || x.outcome) continue;
    const a = dep(br.M[id].s1), b = dep(br.M[id].s2);
    if (a && b) return { id, a, b, ph: true };
  }
  if (cur === 'GF') return { gf2: true, lb: ctx.tname(info.GF.b) };
  return null;
}

/* ---------- Turnier live ---------- */
function viewCup() {
  const ctx = cupCtx();
  const { C, info, cur } = ctx;
  const members = (t) => C.teams[t].m.map(i => C.players[i]);
  let left;
  if (ctx.champ !== null) {
    ui.nowKey = 'cdone';
    left = `<section class="now"><div class="top"><span class="live-dot">Fertig</span><span class="count">${ctx.playedCount} Spiele</span></div>
      <div class="eyebrow">Turniersieger</div>
      <h2 class="h-lg brass" style="margin-top:8px">${esc(ctx.tname(ctx.champ))}</h2>
      <p class="lead" style="margin-top:6px">${duoHTML(members(ctx.champ))}</p>
      <div class="cta"><button class="btn btn-primary btn-block" data-act="celebrate">Siegerehrung</button></div></section>`;
  } else if (cur) {
    const it = info[cur];
    const key = 'c' + cur; const swap = ui.nowKey !== key; ui.nowKey = key;
    let jline = '';
    if (C.joker != null) {
      const sub = jokerSub(ctx, cur);
      const jn = esc(C.players[C.joker]);
      jline = `<div class="jline"><span class="jbadge">JOKER</span>${sub == null ? `<span><b>${jn}</b> setzt dieses Spiel aus</span>` : `<span><b>${jn}</b> spielt für <b>${esc(C.players[sub])}</b></span>`}
        <button data-act="joker-swap" data-id="${cur}">Tauschen</button></div>`;
    }
    const mem = (t) => {
      const sub = C.joker != null ? jokerSub(ctx, cur) : null;
      return C.teams[t].m.map(i => i === sub ? `<span class="jk">${esc(C.players[C.joker])}</span>` : esc(C.players[i])).join(' &amp; ');
    };
    left = `<section class="now ${swap ? 'swap' : ''}">
      <div class="top"><span class="live-dot"><i></i>Jetzt spielt</span><span class="count">${esc(ctx.stage(cur))}</span></div>
      <div class="versus">
        <div class="side"><div class="who">${esc(ctx.tname(it.a))}</div><div class="sm">${mem(it.a)}</div></div>
        <div class="vs">VS</div>
        <div class="side r"><div class="who">${esc(ctx.tname(it.b))}</div><div class="sm">${mem(it.b)}</div></div>
      </div>
      ${jline}
      <div class="cta"><button class="btn btn-primary btn-block" data-act="cup-result" data-id="${cur}">Sieger eintragen</button></div>
    </section>`;
    const nx = cupNextPreview(ctx);
    if (nx && nx.gf2) left += `<section class="next"><div class="eyebrow">Danach</div><div class="muted">Gewinnt <b style="color:var(--text)">${esc(nx.lb)}</b>, haben beide Teams eine Niederlage. Dann entscheidet ein letztes Spiel.</div></section>`;
    else if (nx) left += `<section class="next"><div class="eyebrow">Als Nächstes · ${esc(ctx.stage(nx.id))}</div>
        <div class="row"><span class="${nx.ph && nx.a.endsWith('von jetzt') ? 'ph' : ''}">${esc(nx.a)}</span><span class="v">VS</span><span class="${nx.ph && nx.b.endsWith('von jetzt') ? 'ph' : ''}">${esc(nx.b)}</span></div></section>`;
    else left += `<section class="next"><div class="eyebrow">Letztes Spiel</div><div class="muted">Danach steht der Turniersieger fest.</div></section>`;
  } else {
    left = `<section class="now"><div class="muted">Kein Spiel bereit.</div></section>`;
  }

  const tab = S.tab.cup;
  const panel = tab === 'bracket' ? bracketHTML(ctx) : teamsListHTML(ctx);
  const body = `<div class="wrap live"><div class="left">${left}</div>
    <div class="right"><div class="tabs"><button class="tab ${tab === 'bracket' ? 'on' : ''}" data-act="tab" data-t="bracket">Bracket</button><button class="tab ${tab === 'teams' ? 'on' : ''}" data-act="tab" data-t="teams">Teams</button></div>${panel}</div></div>`;
  return shell({ title: 'Turnier', sub: `${ctx.playedCount} gespielt`, left: { act: 'go-home', icon: 'home', label: 'Start' }, right: { act: 'menu', icon: 'more', label: 'Menü' }, body });
}

function bracketCard(ctx, id) {
  const { br, info, C } = ctx;
  const it = info[id], m = br.M[id];
  const r = C.results[id];
  const row = (src, p) => {
    if (p === null || p === undefined) return `<div class="t ph"><span>${esc(ctx.placeholder(src))}</span></div>`;
    const cls = it.played ? (it.outcome.w === p ? 'win' : 'lose') : '';
    const g = r && it.played && r.ga != null ? (p === r.a ? r.ga : r.gb) : '';
    return `<div class="t ${cls}"><span>${esc(ctx.tname(p))}</span><span class="g">${g}</span></div>`;
  };
  const clickable = it.played || it.ready;
  return `<${clickable ? 'button' : 'div'} class="bm ${id === ctx.cur ? 'cur' : ''}" ${clickable ? `data-act="cup-result" data-id="${id}"` : ''}>
    <div class="lab"><span>${esc(ctx.label[id])}</span><span>${id === ctx.cur ? '<span class="brass">Jetzt</span>' : (it.played ? '' : '')}</span></div>
    ${row(m.s1, it.a)}${row(m.s2, it.b)}</${clickable ? 'button' : 'div'}>`;
}
function bracketHTML(ctx) {
  const { br, C, T } = ctx;
  const col = (title, ids, extra = '') => `<div class="bk-col"><h4>${esc(title)}</h4><div class="bk-cards">${extra}${ids.map(id => bracketCard(ctx, id)).join('')}</div></div>`;
  // Gewinner-Bracket
  let wb = '';
  for (let r = 1; r <= br.n; r++) {
    const ids = br.order.filter(id => br.M[id].br === 'W' && br.M[id].round === r && !ctx.isAuto(id));
    let extra = '';
    if (r === 1) {
      // Teams mit Freilos: Gegner-Setzplatz ist leer (>= T)
      const byeTeams = [];
      const so = KL.seeding(br.S);
      for (let i = 0; i < T; i++) {
        const pos = so.indexOf(i + 1), mate = so[pos % 2 ? pos - 1 : pos + 1] - 1;
        if (mate >= T) byeTeams.push(C.seeds[i]);
      }
      extra = byeTeams.map(t => `<div class="bm byes"><div class="lab"><span>Freilos</span></div><div class="t"><span>${esc(ctx.tname(t))}</span></div></div>`).join('');
    }
    if (ids.length || extra) wb += col(br.n === 1 ? 'Erstes Duell' : (r === br.n ? 'Finale' : `Runde ${r}`), ids, extra);
  }
  let lb = '', shown = 0;
  for (let q = 1; q <= br.LR; q++) {
    const ids = br.order.filter(id => br.M[id].br === 'L' && br.M[id].round === q && !ctx.isAuto(id));
    if (ids.length) lb += col(q === br.LR ? 'Finale' : `Runde ${++shown}`, ids);
  }
  const finals = ['GF'].concat(ctx.info.GF2.exists ? ['GF2'] : []);
  const fin = col('Großes Finale', finals);
  return `<div class="bk-sec"><div class="eyebrow">Gewinner-Bracket</div><div class="bk-scroll"><div class="bk">${wb}</div></div></div>
    ${lb ? `<div class="bk-sec"><div class="eyebrow">Verlierer-Bracket · 1 Niederlage</div><div class="bk-scroll"><div class="bk">${lb}</div></div></div>` : ''}
    <div class="bk-sec"><div class="eyebrow">Finale</div><div class="bk-scroll"><div class="bk">${fin}</div></div>
    <div class="muted" style="font-size:13px">Gewinnt im Finale das Team aus dem Verlierer-Bracket, haben beide eine Niederlage, dann gibt's ein Entscheidungsspiel. Tippe ein Spiel an, um ein Ergebnis zu ändern.</div></div>`;
}
function teamGoals(ctx) {
  const goals = new Array(ctx.T).fill(0); let any = false;
  for (const id of ctx.hist) {
    const r = ctx.C.results[id];
    if (r && r.ga != null) { any = true; goals[r.a] += r.ga; goals[r.b] += r.gb; }
  }
  return { goals, any };
}
function teamsListHTML(ctx) {
  const { C, T, losses, wins } = ctx;
  const { goals, any } = teamGoals(ctx);
  const order = [...Array(T).keys()].sort((a, b) => (a === ctx.champ ? -1 : b === ctx.champ ? 1 : 0) || losses[a] - losses[b] || wins[b] - wins[a]);
  const rows = order.map((t, i) => {
    const l = Math.min(2, losses[t]);
    const out = l >= 2;
    const pill = t === ctx.champ ? '<span class="pill w">Champion</span>' : out ? '<span class="pill out">Raus</span>' : l === 1 ? '<span class="pill l">Noch 1 Leben</span>' : '<span class="pill w">Ungeschlagen</span>';
    return `<div class="tl ${out ? 'out' : ''}" style="animation:pop .4s ${i * 30}ms both var(--ease)">
      <div class="nm">${esc(C.teams[t].name)}<small>${C.teams[t].m.map(p => esc(C.players[p])).join(' &amp; ')} · ${wins[t]} S · ${losses[t]} N${any ? ` · ${goals[t]} Tore` : ''}</small></div>
      <div class="st"><span class="lives"><i class="${l >= 2 ? 'gone' : ''}"></i><i class="${l >= 1 ? 'gone' : ''}"></i></span>${pill}</div></div>`;
  }).join('');
  let joker = '';
  if (C.joker != null) {
    const n = ctx.hist.filter(id => C.results[id] && C.results[id].sub != null).length;
    joker = `<div class="joker"><span class="jbadge">JOKER</span><div class="t"><b>${esc(C.players[C.joker])}</b>${plural(n, 'Einsatz', 'Einsätze')} bisher</div></div>`;
  }
  return `<div class="tlist">${rows}</div>${joker}<div class="muted" style="font-size:13px">Die Punkte zeigen die Leben: Jedes Team hat zwei.</div>`;
}

/* =========================================================
   Sheets & Dialoge
   ========================================================= */
function openSheet(html, onClose) {
  closeSheet(true);
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  scrim.addEventListener('click', (e) => { if (e.target === scrim) closeSheet(); });
  document.body.appendChild(scrim);
  ui.modal = { el: scrim, onClose };
  return scrim;
}
function closeSheet(instant) {
  const m = ui.modal;
  if (!m) return;
  ui.modal = null;
  if (m.onClose) m.onClose();
  if (instant) { m.el.remove(); return; }
  m.el.classList.add('closing'); m.el.firstElementChild.classList.add('closing');
  setTimeout(() => m.el.remove(), 220);
}
function ask({ title, text, ok = 'OK', danger = false }) {
  return new Promise(resolve => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; resolve(v); };
    const el = openSheet(`<div class="head"><h3 class="h-md">${esc(title)}</h3></div>
      <p class="lead" style="margin:0">${text}</p>
      <div class="btns"><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ask="1">${esc(ok)}</button><button class="btn btn-ghost" data-ask="0">Abbrechen</button></div>`, () => finish(false));
    el.querySelectorAll('[data-ask]').forEach(b => b.addEventListener('click', () => { finish(b.dataset.ask === '1'); closeSheet(); }));
  });
}

/* ---------- Ergebnis Punkte-Party ---------- */
function partyResultSheet(i) {
  const P = S.party, mt = P.matches[i];
  const r = P.results[i];
  const st = { ga: r ? r.ga : 0, gb: r ? r.gb : 0, saving: false };
  const nm = (p) => P.players[p];
  const el = openSheet(`<div class="head"><div><div class="eyebrow">Spiel ${i + 1}</div><h3 class="h-md" style="margin-top:6px">${r ? 'Ergebnis ändern' : 'Wie ist es ausgegangen?'}</h3></div>
      <button class="iconbtn" data-x aria-label="Schließen">${I.x}</button></div>
    <div class="score">
      ${['a', 'b'].map(s => `<div class="sc" id="sc-${s}"><div class="who"><span>${duoHTML(mt[s].map(nm))}</span></div>
        <div class="big num" id="big-${s}">${st['g' + s]}</div>
        <div class="pm2"><button data-d="-1" data-s="${s}" aria-label="Tor weniger">${I.minus}</button><button class="plus" data-d="1" data-s="${s}" aria-label="Tor mehr">${I.plus}</button></div></div>`).join('')}
    </div>
    <div class="btns"><button class="btn btn-primary" data-save>Speichern</button>
      ${r ? '<button class="btn btn-quiet" data-del>Ergebnis löschen</button>' : ''}</div>`);
  const upd = (s, bump) => {
    const b = $('#big-' + s, el); b.textContent = st['g' + s];
    if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    $('#sc-a', el).classList.toggle('ahead', st.ga > st.gb);
    $('#sc-b', el).classList.toggle('ahead', st.gb > st.ga);
  };
  upd('a'); upd('b');
  el.querySelectorAll('.pm2 button').forEach(b => b.addEventListener('click', () => {
    const k = 'g' + b.dataset.s;
    st[k] = Math.max(0, Math.min(99, st[k] + Number(b.dataset.d)));
    upd(b.dataset.s, true);
  }));
  $('[data-x]', el).addEventListener('click', () => closeSheet());
  $('[data-save]', el).addEventListener('click', () => {
    if (st.saving) return; st.saving = true;
    const wasDone = partyState().cur === -1;
    P.results[i] = { ga: st.ga, gb: st.gb };
    save(); closeSheet(); render();
    if (!wasDone && partyState().cur === -1 && !S.celebrated.party) { S.celebrated.party = true; save(); setTimeout(celebrate, 450); }
  });
  const del = $('[data-del]', el);
  if (del) del.addEventListener('click', () => {
    if (st.saving) return; st.saving = true;
    delete P.results[i]; S.celebrated.party = false; save(); closeSheet(); render();
  });
}

/* ---------- Ergebnis Turnier ---------- */
function cupResultSheet(id) {
  const ctx = cupCtx();
  const { C, info } = ctx;
  const it = info[id];
  if (!it || !it.exists || (!it.ready && !it.played)) return;
  const r = C.results[id];
  const A = it.a, B = it.b;
  const st = {
    winner: r ? r.winner : null,
    ga: r && r.ga != null ? (r.a === A ? r.ga : r.gb) : 0,
    gb: r && r.ga != null ? (r.a === A ? r.gb : r.ga) : 0,
    goals: !!(r && r.ga != null), saving: false
  };
  const mem = (t) => C.teams[t].m.map(i => esc(C.players[i])).join(' &amp; ');
  const el = openSheet(`<div class="head"><div><div class="eyebrow">${esc(ctx.stage(id))}</div><h3 class="h-md" style="margin-top:6px">${r ? 'Ergebnis ändern' : 'Wer hat gewonnen?'}</h3></div>
      <button class="iconbtn" data-x aria-label="Schließen">${I.x}</button></div>
    <div class="pick">
      ${[A, B].map((t, k) => `<button class="pk" data-pick="${t}" id="pk-${k}"><span class="crown">${I.crown}</span><b>${esc(ctx.tname(t))}</b><small>${mem(t)}</small></button>`).join('')}
    </div>
    <details class="opt" ${st.goals ? 'open' : ''}><summary>${I.plus.replace('<svg', '<svg style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2"')} Tore eintragen (optional, nur Statistik)</summary>
      <div class="mini">${['a', 'b'].map(s => `<div class="ms"><button data-d="-1" data-s="${s}" aria-label="Tor weniger">${I.minus}</button><b class="num" id="g-${s}">${st['g' + s]}</b><button data-d="1" data-s="${s}" aria-label="Tor mehr">${I.plus}</button></div>`).join('')}</div>
    </details>
    <div class="btns"><button class="btn btn-primary" data-save ${st.winner == null ? 'disabled' : ''}>Speichern</button>
      ${r ? '<button class="btn btn-quiet" data-del>Ergebnis löschen</button>' : ''}</div>`);
  const sync = () => {
    [A, B].forEach((t, j) => {
      const on = st.winner === t;
      $('#pk-' + j, el).classList.toggle('on', on);
      $('#pk-' + j + ' small', el).innerHTML = on ? 'Gewinner' : mem(t);
    });
    $('#g-a', el).textContent = st.ga; $('#g-b', el).textContent = st.gb;
    $('[data-save]', el).disabled = st.winner == null;
  };
  sync();
  el.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { st.winner = Number(b.dataset.pick); sync(); }));
  el.querySelectorAll('.ms button').forEach(b => b.addEventListener('click', () => {
    const k = 'g' + b.dataset.s;
    st[k] = Math.max(0, Math.min(99, st[k] + Number(b.dataset.d)));
    st.goals = true;
    if (st.ga !== st.gb) st.winner = st.ga > st.gb ? A : B;
    sync();
  }));
  $('[data-x]', el).addEventListener('click', () => closeSheet());

  const apply = async (newRes) => {
    const next = { ...C.results };
    if (newRes) next[id] = newRes; else delete next[id];
    const san = KL.cupSanitize(ctx.br, C.seeds, next);
    const lost = san.removed.filter(x => x !== id).length;
    if (lost > 0) {
      closeSheet(true);
      const okk = await ask({ title: 'Turnierverlauf ändert sich', text: `Dadurch passen ${plural(lost, 'spätere Partie', 'spätere Partien')} nicht mehr. Deren Ergebnisse werden gelöscht und neu ausgespielt.`, ok: 'Trotzdem ändern', danger: true });
      if (!okk) { render(); return; }
    } else closeSheet();
    const wasChamp = ctx.champ !== null;
    C.results = san.results;
    if (newRes && !C.history.includes(id)) C.history.push(id);
    C.history = C.history.filter(x => C.results[x]);
    if (!newRes) delete C.jokerPick[id];
    const after = cupCtx();
    if (after.champ === null) S.celebrated.cup = false;
    save(); render();
    if (!wasChamp && after.champ !== null && !S.celebrated.cup) { S.celebrated.cup = true; save(); setTimeout(celebrate, 450); }
  };
  $('[data-save]', el).addEventListener('click', () => {
    if (st.saving || st.winner == null) return; st.saving = true;
    const sub = r ? r.sub : (C.joker != null ? jokerSub(ctx, id) : undefined);
    apply({ a: A, b: B, winner: st.winner, ga: st.goals ? st.ga : null, gb: st.goals ? st.gb : null, sub: sub === undefined ? null : sub });
  });
  const del = $('[data-del]', el);
  if (del) del.addEventListener('click', () => { if (st.saving) return; st.saving = true; apply(null); });
}

/* ---------- Menü ---------- */
function menuSheet() {
  const canReroll = S.view === 'party' && partyState().done === 0;
  const el = openSheet(`<div class="head"><h3 class="h-md">Menü</h3><button class="iconbtn" data-x aria-label="Schließen">${I.x}</button></div>
    <div class="menu">
      <button class="btn btn-ghost" data-m="home">${I.home} Zur Startseite</button>
      ${canReroll ? `<button class="btn btn-ghost" data-m="reroll">${I.shuffle} Spielplan neu auslosen</button>` : ''}
      <button class="btn btn-danger" data-m="reset">${I.x} Neuer Abend</button>
    </div>
    <div class="muted" style="font-size:13px">„Neuer Abend“ löscht das laufende Turnier. Die Namen bleiben zum schnellen Neustart gespeichert.</div>`);
  $('[data-x]', el).addEventListener('click', () => closeSheet());
  el.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', async () => {
    const m = b.dataset.m;
    closeSheet(true);
    if (m === 'home') { S.view = 'home'; save(); render(); }
    if (m === 'reroll') rerollParty();
    if (m === 'reset') {
      if (await ask({ title: 'Neuer Abend?', text: 'Das laufende Turnier und alle Ergebnisse werden gelöscht.', ok: 'Alles löschen', danger: true })) resetAll();
    }
  }));
}
function resetAll() { S.party = null; S.cup = null; S.draft = null; S.celebrated = {}; S.view = 'home'; save(); render(); }

/* =========================================================
   Siegerehrung
   ========================================================= */
function celebrate() {
  document.querySelectorAll('.win-ov').forEach(e => e.remove());
  let html = '';
  if (S.view === 'party' && S.party) {
    const P = S.party;
    const rows = KL.partyTable(P.players.length, P.matches, P.results);
    const nm = (r) => esc(P.players[r.p]);
    const first = rows.filter(r => r.place === 1);
    const pod = (r, cls, place) => r ? `<div class="pod ${cls}"><div class="nm">${nm(r)}</div><div class="pts">${plural(r.goals, 'Tor', 'Tore')}</div><div class="blk">${place}</div></div>` : '<div></div>';
    const mostWins = rows.slice().sort((a, b) => b.w - a.w)[0];
    let best = null;
    P.matches.forEach((mt, i) => { const r = P.results[i]; if (r && (!best || r.ga + r.gb > best.t)) best = { i, t: r.ga + r.gb, r }; });
    const total = Object.values(P.results).reduce((s, r) => s + r.ga + r.gb, 0);
    html = `<div class="trophy">${I.trophy}</div>
      <div><div class="eyebrow">Punkte-Party · Sieg${first.length > 1 ? ' geteilt' : ''}</div></div>
      <div class="champ">${first.map(nm).join(' &amp; ')}</div>
      <div class="champ-sub">${plural(first[0].goals, 'Tor', 'Tore')} gesammelt · ${first[0].w} Siege</div>
      <div class="podium">${pod(rows[1], 'p2', rows[1] ? rows[1].place : '')}${pod(rows[0], 'p1', rows[0].place)}${pod(rows[2], 'p3', rows[2] ? rows[2].place : '')}</div>
      <div class="facts">
        <div class="fact"><span>Meiste Siege</span><b>${nm(mostWins)} · ${mostWins.w}</b></div>
        ${best ? `<div class="fact"><span>Torreichstes Spiel</span><b>Spiel ${best.i + 1} · ${best.r.ga}:${best.r.gb}</b></div>` : ''}
        <div class="fact"><span>Tore an diesem Abend</span><b class="num">${total}</b></div>
      </div>`;
  } else if (S.view === 'cup' && S.cup) {
    const ctx = cupCtx();
    if (ctx.champ === null) return;
    const C = ctx.C;
    const mem = (t) => C.teams[t].m.map(i => esc(C.players[i])).join(' &amp; ');
    const pod = (t, cls, place) => t != null ? `<div class="pod ${cls}"><div class="nm">${esc(ctx.tname(t))}</div><div class="pts">${mem(t)}</div><div class="blk">${place}</div></div>` : '<div></div>';
    const { goals, any } = teamGoals(ctx);
    let top = null; if (any) top = [...Array(ctx.T).keys()].sort((a, b) => goals[b] - goals[a])[0];
    const jn = C.joker != null ? ctx.hist.filter(id => C.results[id] && C.results[id].sub != null).length : 0;
    html = `<div class="trophy">${I.trophy}</div>
      <div class="eyebrow">Turniersieger</div>
      <div class="champ">${esc(ctx.tname(ctx.champ))}</div>
      <div class="champ-sub">${mem(ctx.champ)} · ${plural(ctx.wins[ctx.champ], 'Sieg', 'Siege')}, ${plural(ctx.losses[ctx.champ], 'Niederlage', 'Niederlagen')}</div>
      <div class="podium">${pod(ctx.res.second, 'p2', 2)}${pod(ctx.champ, 'p1', 1)}${pod(ctx.res.third, 'p3', 3)}</div>
      <div class="facts">
        <div class="fact"><span>Gespielte Partien</span><b class="num">${ctx.playedCount}</b></div>
        ${any ? `<div class="fact"><span>Meiste Tore</span><b>${esc(ctx.tname(top))} · ${goals[top]}</b></div>` : ''}
        ${C.joker != null ? `<div class="fact"><span>Joker ${esc(C.players[C.joker])}</span><b>${plural(jn, 'Einsatz', 'Einsätze')}</b></div>` : ''}
      </div>`;
  } else return;
  const ov = document.createElement('div');
  ov.className = 'win-ov';
  ov.innerHTML = `<div class="win-box">${html}<div class="btns"><button class="btn btn-ghost" data-close>Schließen</button><button class="btn btn-primary" data-new>Neuer Abend</button></div></div>`;
  document.body.appendChild(ov);
  $('[data-close]', ov).addEventListener('click', () => ov.remove());
  $('[data-new]', ov).addEventListener('click', async () => {
    if (await ask({ title: 'Neuer Abend?', text: 'Das Turnier und alle Ergebnisse werden gelöscht. Die Namen bleiben gespeichert.', ok: 'Neu starten', danger: true })) { ov.remove(); resetAll(); }
  });
  confetti();
}

function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#confetti');
  c.hidden = false;
  const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  c.width = W * dpr; c.height = H * dpr;
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = ['#E4B76C', '#F3CF8E', '#C9974B', '#F1EFEA', '#8F95A0'];
  const ps = [];
  const burst = (x, y, n, dir) => { for (let i = 0; i < n; i++) ps.push({
    x, y, vx: dir * (4 + Math.random() * 10) + (dir === 0 ? (Math.random() - .5) * 16 : 0), vy: -(8 + Math.random() * 13),
    gr: .28 + Math.random() * .12, w: 5 + Math.random() * 6, h: 8 + Math.random() * 9, a: Math.random() * 6, va: (Math.random() - .5) * .35,
    c: cols[(Math.random() * cols.length) | 0] }); };
  burst(W / 2, H * .38, 120, 0); burst(0, H * .75, 70, 1); burst(W, H * .75, 70, -1);
  const t0 = performance.now();
  const frame = (t) => {
    g.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of ps) {
      p.vx *= .985; p.vy = p.vy * .985 + p.gr; p.x += p.vx; p.y += p.vy; p.a += p.va;
      if (p.y < H + 30) alive = true;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.scale(1, Math.cos(p.a * 1.7));
      g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
    }
    if (alive && t - t0 < 7000) requestAnimationFrame(frame);
    else { g.clearRect(0, 0, W, H); c.hidden = true; }
  };
  requestAnimationFrame(frame);
}

/* =========================================================
   Aktionen
   ========================================================= */
function startMode(mode) {
  const names = S.roster.length >= 4 ? S.roster.slice(0, 16) : new Array(8).fill('');
  S.draft = { mode, names, k: 4, kWarn: null, teamMode: 'random', teams: [], joker: null, sel: null };
  S.view = 'names'; save(); render();
}
function rerollParty() {
  const P = S.party;
  P.matches = KL.partyBuild(P.players.length, P.k);
  P.stats = KL.partyStats(P.players.length, P.matches);
  ui.reroll = true; ui.nowKey = null;
  save(); render();
}
function readNames() {
  const D = S.draft;
  const final = D.names.map((v, i) => (v || '').trim() || `Spieler ${i + 1}`);
  const seen = {}, dup = new Set();
  final.forEach((v, i) => { const k = v.toLocaleLowerCase('de'); if (k in seen) { dup.add(i); dup.add(seen[k]); } else seen[k] = i; });
  return { final, dup };
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || b.closest('.sheet')) return;
  const act = b.dataset.act;
  const D = S.draft;
  switch (act) {
    case 'start': {
      if ((S.party || S.cup) && !(await ask({ title: 'Neues Turnier starten?', text: 'Das laufende Turnier wird dabei beendet und gelöscht.', ok: 'Neu starten', danger: true }))) return;
      S.party = null; S.cup = null; S.celebrated = {};
      startMode(b.dataset.mode); break;
    }
    case 'resume': S.view = b.dataset.mode; save(); render(); break;
    case 'go-home': S.view = 'home'; save(); render(); break;
    case 'back-names': S.view = 'names'; save(); render(); break;
    case 'count': {
      const d = Number(b.dataset.d);
      const n = D.names.length + d;
      if (n < 4 || n > 16) return;
      if (d > 0) {
        D.names.push(S.roster[n - 1] && !D.names.includes(S.roster[n - 1]) ? S.roster[n - 1] : '');
        $('#names').insertAdjacentHTML('beforeend', nameField(n - 1, D.names[n - 1], true));
      } else { D.names.pop(); const f = $('#f' + n); if (f) f.remove(); }
      $('#cnt').textContent = n;
      const [mb, pb] = document.querySelectorAll('.stepper button');
      mb.disabled = n <= 4; pb.disabled = n >= 16;
      D.teams = []; D.sel = null;
      save(); break;
    }
    case 'names-next': {
      const { final, dup } = readNames();
      document.querySelectorAll('.field').forEach((f, i) => f.classList.toggle('err', dup.has(i)));
      if (dup.size) { $('#nameErr').textContent = 'Zwei Spieler heißen gleich. Bitte die Namen unterscheidbar machen, z. B. „Tim K.“ und „Tim S.“.'; return; }
      const changed = JSON.stringify(final) !== JSON.stringify(D.final || []);
      D.names = final; D.final = final; S.roster = final.slice();
      if (D.mode === 'party') { D.kWarn = null; S.view = 'partyCfg'; }
      else { if (changed || !D.teams.length) { D.teamMode = D.teamMode || 'random'; if (D.teamMode === 'random') randomTeams(); else { D.teams = []; D.sel = null; } } S.view = 'teams'; }
      save(); render(); break;
    }
    case 'pick-k': {
      const k = Number(b.dataset.k), n = D.names.length;
      if (KL.partyValid(n, k)) { D.k = k; D.kWarn = null; }
      else { D.kWarn = k; D.k = KL.partyNearestValid(n, k); }
      save(); render(); break;
    }
    case 'party-create': {
      const n = D.names.length;
      b.disabled = true;
      const matches = KL.partyBuild(n, D.k);
      S.party = { players: D.names.slice(), k: D.k, matches, stats: KL.partyStats(n, matches), results: {} };
      S.cup = null; S.celebrated = {}; S.tab.party = 'plan'; S.view = 'party';
      ui.reroll = true; ui.nowKey = null;
      save(); render(); break;
    }
    case 'party-reroll': {
      if (partyState().done) return;
      rerollParty(); break;
    }
    case 'party-result': partyResultSheet(Number(b.dataset.i)); break;
    case 'tab': {
      if (S.view === 'party') S.tab.party = b.dataset.t; else S.tab.cup = b.dataset.t;
      save(); render(); break;
    }
    case 'menu': menuSheet(); break;
    case 'celebrate': celebrate(); break;
    case 'team-mode': {
      const m = b.dataset.m;
      if (m === D.teamMode) return;
      D.teamMode = m; D.sel = null;
      if (m === 'random') randomTeams(); else { D.teams = []; D.joker = null; }
      save(); render(); break;
    }
    case 'team-shuffle': randomTeams(); save(); render(); break;
    case 'team-rename': {
      const i = Number(b.dataset.i);
      D.teams[i].name = randomTeamNames(1, D.teams.map(t => t.name))[0];
      const inp = $('#team-' + i); if (inp) { inp.value = D.teams[i].name; inp.parentElement.parentElement.animate?.([{ transform: 'scale(.98)' }, { transform: 'none' }], { duration: 250, easing: 'ease-out' }); }
      save(); break;
    }
    case 'team-split': D.teams.splice(Number(b.dataset.i), 1); save(); render(); break;
    case 'pool': {
      const i = Number(b.dataset.i);
      if (D.sel == null) D.sel = i;
      else if (D.sel === i) D.sel = null;
      else {
        D.teams.push({ m: [D.sel, i], name: randomTeamNames(1, D.teams.map(t => t.name))[0] });
        D.sel = null;
      }
      save(); render(); break;
    }
    case 'cup-create': {
      const n = D.names.length, T = Math.floor(n / 2);
      if (D.teams.length !== T || T < 2) return;
      const used = new Set(D.teams.flatMap(t => t.m));
      const left = D.names.map((_, i) => i).filter(i => !used.has(i));
      const teams = D.teams.map((t, i) => ({ name: (t.name || '').trim() || `Team ${i + 1}`, m: t.m.slice() }));
      S.cup = { players: D.names.slice(), teams, joker: left.length === 1 ? left[0] : null, seeds: KL.shuffle([...Array(T).keys()]), results: {}, history: [], jokerPick: {} };
      S.party = null; S.celebrated = {}; S.tab.cup = 'bracket'; S.view = 'cup'; ui.nowKey = null;
      save(); render(); break;
    }
    case 'cup-result': cupResultSheet(b.dataset.id); break;
    case 'joker-swap': {
      const id = b.dataset.id;
      S.cup.jokerPick[id] = (S.cup.jokerPick[id] || 0) + 1;
      save(); render(); break;
    }
  }
});

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.name != null && S.draft) {
    S.draft.names[Number(t.dataset.name)] = t.value;
    t.closest('.field').classList.remove('err');
    const err = $('#nameErr'); if (err) err.textContent = '';
    saveSoon();
  } else if (t.dataset.team != null && S.draft) {
    S.draft.teams[Number(t.dataset.team)].name = t.value;
    saveSoon();
  }
});
document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (e.key !== 'Enter' || t.tagName !== 'INPUT') return;
  e.preventDefault();
  if (t.dataset.name != null) {
    const nx = $('#name-' + (Number(t.dataset.name) + 1));
    if (nx) nx.focus(); else t.blur();
  } else t.blur();
});
let saveTimer = null;
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
addEventListener('pagehide', save);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });

/* ---------- Offline & Updates ---------- */
function toast(text, btn, onTap) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${esc(text)}</span>${btn ? `<button>${esc(btn)}</button>` : ''}`;
  if (btn) t.querySelector('button').addEventListener('click', () => { t.remove(); onTap(); });
  document.body.appendChild(t);
  return t;
}
if ('serviceWorker' in navigator && location.protocol === 'https:' && window.top === window && !document.documentElement.dataset.single) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    const offer = (w) => toast('Neue Version verfügbar', 'Aktualisieren', () => { w.postMessage('skipWaiting'); });
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
    });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; save(); location.reload(); } });
    setTimeout(() => reg.update().catch(() => {}), 3000);
  }).catch(() => {});
}

render();
window.__kicker = { get state() { return S; }, render, celebrate };
})();
