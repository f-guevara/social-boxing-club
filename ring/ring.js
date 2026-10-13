// Ring Quest — el juego de entrenamiento de Social Boxing Club.
// v1: todo vive en este teléfono (localStorage). Sin cuentas, sin servidor, sin datos personales.

const WA = '50378694928'; // +503 7869 4928 (número publicado por el club)
const KEY = 'ringquest.v1';

/* ---------- Configuración del juego ---------- */
const XP = { club: 50, mission: 15, perfect: 25, fight: 100, round: 5, roundCapDay: 60, gameCapDay: 30 };
const RANKS = [
  { name: 'Novato', xp: 0, color: '#c9c4bb' },
  { name: 'Amateur', xp: 400, color: '#4cc9f0' },
  { name: 'Contendiente', xp: 1200, color: '#ff5a1f' },
  { name: 'Profesional', xp: 2500, color: '#b388ff' },
  { name: 'Campeón', xp: 5000, color: '#ffc933' }
];
const MISSIONS = [
  { id: 'sombra', t: '3 rounds de sombra', d: 'Boxeo al aire, con el temporizador de la pestaña Rounds.', auto: 'rounds' },
  { id: 'combos', t: 'Juega una ronda de combos', d: 'En la pestaña Combos. La cabeza también se entrena.', auto: 'game' },
  { id: 'saltos', t: '3 minutos de saltos', d: 'Con cuerda o sin cuerda, en el lugar.' },
  { id: 'sentadillas', t: '3 series de 15 sentadillas', d: 'Espalda recta, a tu ritmo.' },
  { id: 'flexiones', t: '3 series de flexiones', d: 'De rodillas también vale. Calidad antes que cantidad.' },
  { id: 'abdomen', t: '3 series de abdominales', d: 'Las que te enseñaron en el club.' },
  { id: 'guardia', t: '5 minutos de guardia y pasos', d: 'Frente a un espejo: guardia arriba, mentón abajo, pies firmes.' },
  { id: 'estirar', t: 'Estira 10 minutos', d: 'Hombros, piernas y espalda. Suave, sin rebotes.' },
  { id: 'caminar', t: 'Camina o trota 20 minutos', d: 'Suma cardio fuera del ring.' },
  { id: 'agua', t: 'Lleva tu botella de agua todo el día', d: 'Hidratarte también es entrenar.' },
  { id: 'mochila', t: 'Prepara tu mochila de entrenamiento', d: 'Vendas, agua, toalla y ropa lista.' },
  { id: 'respira', t: '2 minutos de respiración', d: 'Inhala 4 segundos por la nariz, exhala 6. Ideal antes de dormir.' }
];
const RIVALS = ['Kid Excusas', 'El Sofá Pesado', 'Don Mañana Lo Hago', 'La Pantalla Infinita', 'Lunes Perezoso', 'Mr. Cinco Minutos Más', 'El Bostezo Salvaje', 'Capitán Pretexto'];
const PUNCHES = [null, ['Jab', 'izq'], ['Recto', 'der'], ['Gancho', 'izq'], ['Gancho', 'der'], ['Upper', 'izq'], ['Upper', 'der']];
const GAME_SECONDS = 30;
const ICON = {
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3.5-1 5-2.5 7C8 11 7 12.5 7 15a5 5 0 0 0 10 0c0-2-1-3.5-2-5 .1 1.5-.6 2.4-1.5 2.9C14 9.5 13.5 5 12 2Z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  belt: '<svg viewBox="0 0 48 32" fill="currentColor"><rect x="0" y="11" width="48" height="10" rx="3" opacity=".55"/><ellipse cx="24" cy="16" rx="12" ry="13"/><circle cx="24" cy="16" r="7" fill="#0b0b0c" opacity=".35"/><path d="M24 10.5l1.6 3.4 3.7.4-2.8 2.5.8 3.7L24 18.6l-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z" fill="#0b0b0c" opacity=".55"/></svg>',
  glove: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h7a5 5 0 0 1 5 5v4a4 4 0 0 1-2 3.5V19a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2.3A5 5 0 0 1 4 12V6a3 3 0 0 1 3-3Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 14.6 9l6.9.6-5.2 4.5 1.6 6.7-6-3.6-6 3.6 1.6-6.7L2.5 9.6 9.4 9 12 2.5Z"/></svg>'
};

/* ---------- Utilidades ---------- */
const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dparse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => dkey(new Date());
const addDays = (k, n) => { const d = dparse(k); d.setDate(d.getDate() + n); return dkey(d); };
const weekStart = k => { const d = dparse(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dkey(d); };
const isSunday = k => dparse(k).getDay() === 0;
const mmss = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

function seedRand(str) {
  let h = 2166136261;
  for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
}
const rivalFor = ws => RIVALS[Math.floor(dparse(ws).getTime() / 6048e5 + 0.5) % RIVALS.length];

/* ---------- Estado (solo en este teléfono) ---------- */
const blank = () => ({ v: 1, setup: false, apodo: '', meta: 3, start: today(), days: {}, weekMeta: {}, gameBest: 0, games: 0, sound: true, timer: { rounds: 3, work: 120, rest: 60 } });
function load() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (o && o.v === 1 && o.days && typeof o.days === 'object') return Object.assign(blank(), o);
  } catch (e) { /* sin almacenamiento: se juega igual, sin guardar */ }
  return blank();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* modo privado */ } }
let S = load();
let tab = 'hoy';
const dayOf = k => (S.days[k] ||= { c: false, m: [], r: 0, g: 0, gp: 0 });

function missionsFor(k) {
  const r = seedRand('rq' + k), pool = MISSIONS.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3);
}
function missionDone(m, d) {
  if (!d) return false;
  if (m.auto === 'game') return d.gp > 0;
  return d.m.includes(m.id) || (m.auto === 'rounds' && d.r >= 3);
}

/* ---------- Estadísticas (todo se deriva de los datos guardados) ---------- */
function stats() {
  const t = today(), wsNow = weekStart(t);
  let xp = 0, clubDays = 0, missions = 0, perfectDays = 0, rounds = 0;
  const active = new Set();
  for (const [k, d] of Object.entries(S.days)) {
    const n = missionsFor(k).filter(m => missionDone(m, d)).length;
    if (d.c) { xp += XP.club; clubDays++; }
    xp += n * XP.mission; missions += n;
    if (n === 3) { xp += XP.perfect; perfectDays++; }
    xp += Math.min(d.r * XP.round, XP.roundCapDay); rounds += d.r;
    xp += d.g || 0;
    if (d.c || n > 0 || d.r > 0) active.add(k);
  }
  // Pelea semanal: cada día de club es un golpe; ganas al llegar a tu meta de la semana.
  const ws0 = weekStart(S.start);
  let wins = 0, losses = 0, cur = null;
  for (let ws = ws0; ws <= wsNow; ws = addDays(ws, 7)) {
    const meta = S.weekMeta[ws] || S.meta;
    let hits = 0;
    for (let i = 0; i < 7; i++) { const d = S.days[addDays(ws, i)]; if (d && d.c) hits++; }
    const won = hits >= meta;
    if (won) { wins++; xp += XP.fight; } else if (ws !== wsNow && ws !== ws0) losses++;
    if (ws === wsNow) cur = { ws, meta, hits, won, rival: rivalFor(ws) };
  }
  // Racha con escudo: el domingo (club cerrado) no rompe la racha; 1 escudo por semana perdona un día.
  let run = 0, best = 0;
  const used = new Set(), keys = [...active].sort();
  if (keys.length) {
    const end = active.has(t) ? t : addDays(t, -1);
    for (let k = keys[0]; k <= end; k = addDays(k, 1)) {
      if (active.has(k)) run++;
      else if (isSunday(k)) { /* descanso */ }
      else if (run > 0 && !used.has(weekStart(k))) used.add(weekStart(k));
      else run = 0;
      best = Math.max(best, run);
    }
  }
  let ri = 0;
  RANKS.forEach((r, i) => { if (xp >= r.xp) ri = i; });
  const next = RANKS[ri + 1];
  const pct = next ? Math.round((xp - RANKS[ri].xp) / (next.xp - RANKS[ri].xp) * 100) : 100;
  const st = { xp, clubDays, missions, perfectDays, rounds, wins, losses, cur, run, best, shield: !used.has(wsNow), ri, rank: RANKS[ri], next, pct };
  st.badges = badgeList(st);
  return st;
}
function badgeList(st) {
  const b = (id, name, desc, on) => ({ id, name, desc, on });
  return [
    b('club1', 'Primer día', 'Entrena por primera vez en el club', st.clubDays >= 1),
    b('club10', 'Diez entrenos', '10 días entrenando en el club', st.clubDays >= 10),
    b('club30', 'Del club de verdad', '30 días entrenando en el club', st.clubDays >= 30),
    b('perf1', 'Día perfecto', 'Completa las 3 misiones de un día', st.perfectDays >= 1),
    b('run3', 'Racha de 3', '3 días seguidos', st.best >= 3),
    b('run7', 'Racha de 7', '7 días seguidos', st.best >= 7),
    b('run30', 'Racha de 30', '30 días seguidos', st.best >= 30),
    b('ko1', 'Primer KO', 'Gana tu primera pelea semanal', st.wins >= 1),
    b('ko5', 'Invicto en casa', 'Gana 5 peleas semanales', st.wins >= 5),
    b('r10', 'Diez rounds', '10 rounds con el temporizador', st.rounds >= 10),
    b('r100', 'Cien rounds', '100 rounds con el temporizador', st.rounds >= 100),
    b('fast', 'Manos rápidas', '500 puntos en Combos', S.gameBest >= 500),
    b('rk2', 'Contendiente', 'Llega al rango Contendiente', st.ri >= 2),
    b('rk4', 'Campeón', 'Llega al rango Campeón', st.ri >= 4)
  ];
}

/* ---------- Efectos ---------- */
function toast(msg, kind, sub) {
  const el = document.createElement('div');
  el.className = 'rq-toast' + (kind ? ' rq-toast--' + kind : '');
  el.innerHTML = esc(msg) + (sub ? `<small>${esc(sub)}</small>` : '');
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3600);
}
function burst() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fx = $('#fx'), cols = ['#ff5a1f', '#ffc933', '#f5f3ef', '#e04a12'];
  for (let i = 0; i < 44; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--c', cols[i % cols.length]);
    p.style.setProperty('--x', (35 + Math.random() * 30) + '%');
    p.style.setProperty('--dx', (Math.random() * 560 - 280) + 'px');
    p.style.setProperty('--dy', (Math.random() * 480 - 300) + 'px');
    p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    fx.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}
function openModal(html) {
  $('#modalBox').innerHTML = html;
  $('#modal').hidden = false;
  const f = $('#modalBox').querySelector('input,textarea,button');
  if (f) f.focus();
}
function closeModal() { $('#modal').hidden = true; }

function snapshot() { const s = stats(); return { xp: s.xp, ri: s.ri, wins: s.wins, perfect: s.perfectDays, badges: new Set(s.badges.filter(b => b.on).map(b => b.id)), names: Object.fromEntries(s.badges.map(b => [b.id, b.name])) }; }
// Toda acción que da XP pasa por aquí: guarda, celebra y vuelve a pintar.
function act(fn) {
  const before = snapshot();
  fn();
  save();
  const after = snapshot();
  if (after.wins > before.wins) { toast('¡Ganaste la pelea de la semana por KO!', 'gold', `+${XP.fight} XP`); burst(); }
  if (after.perfect > before.perfect) { toast('Día perfecto', 'gold', `+${XP.perfect} XP`); burst(); }
  after.badges.forEach(id => { if (!before.badges.has(id)) toast(`Insignia: ${after.names[id]}`, 'gold'); });
  if (after.xp > before.xp) toast(`+${after.xp - before.xp} XP`);
  render();
  if (after.ri > before.ri) {
    const r = RANKS[after.ri];
    burst();
    openModal(`<div class="rq-belt rq-belt--big" style="--rc:${r.color}">${ICON.belt}</div><h3>¡Ahora eres ${esc(r.name)}!</h3><p class="rq-muted">Subiste de rango. Lo que repites cada semana pesa más que un día épico aislado.</p><div class="rq-modal__actions"><button class="btn btn--primary" data-action="close">Seguir entrenando</button></div>`);
  }
}

/* ---------- Sonido (campana, aviso de 10 s, golpes) ---------- */
let AC = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(freq, dur, when = 0, type = 'sine', vol = 0.4) {
  if (!S.sound) return;
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + when;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function bell(n) { for (let i = 0; i < n; i++) { tone(880, 1.3, i * 0.38, 'sine', 0.5); tone(1320, 0.9, i * 0.38, 'sine', 0.18); } buzz(n === 1 ? 300 : [200, 100, 200, 100, 200]); }
function clap() { tone(1500, 0.05, 0, 'square', 0.12); tone(1500, 0.05, 0.16, 'square', 0.12); buzz([60, 80, 60]); }
function buzz(p) { if (S.sound && navigator.vibrate) navigator.vibrate(p); }

/* ---------- Temporizador de rounds ---------- */
const T = { phase: 'idle', round: 0, endsAt: 0, dur: 0, left: 0, paused: false, iv: null, warned: false, lock: null };
const PHASE_LABEL = { idle: 'Listo', prep: '¡En guardia!', work: 'Round', rest: 'Descanso', done: '¡Terminaste!' };

function tSet(phase, secs) { T.phase = phase; T.dur = secs; T.left = secs; T.endsAt = Date.now() + secs * 1000; T.warned = false; }
function tStart() {
  ac();
  T.round = 1; T.paused = false;
  tSet('prep', 10);
  clearInterval(T.iv);
  T.iv = setInterval(tTick, 200);
  wakeLock(true);
  renderView();
}
function tTick() {
  if (T.paused || T.phase === 'idle' || T.phase === 'done') return;
  T.left = Math.max(0, (T.endsAt - Date.now()) / 1000);
  if (T.phase === 'work' && T.dur > 20 && T.left <= 10 && !T.warned) { T.warned = true; clap(); }
  // while: si el teléfono pausó la pestaña, se ponen al día todas las fases vencidas.
  while (T.left <= 0 && T.phase !== 'done') {
    const over = (Date.now() - T.endsAt) / 1000;
    if (T.phase === 'prep') { bell(1); tSet('work', S.timer.work); }
    else if (T.phase === 'work') {
      act(() => { dayOf(today()).r++; });
      if (T.round >= S.timer.rounds) { bell(3); T.phase = 'done'; T.left = 0; clearInterval(T.iv); wakeLock(false); break; }
      bell(2); tSet('rest', S.timer.rest);
    } else if (T.phase === 'rest') { T.round++; bell(1); tSet('work', S.timer.work); }
    T.endsAt -= over * 1000;
    T.left = Math.max(0, (T.endsAt - Date.now()) / 1000);
  }
  paintTimer();
}
function tPause() {
  if (T.paused) { T.endsAt = Date.now() + T.left * 1000; T.paused = false; wakeLock(true); }
  else { T.left = Math.max(0, (T.endsAt - Date.now()) / 1000); T.paused = true; wakeLock(false); }
  renderView();
}
function tReset() { clearInterval(T.iv); T.phase = 'idle'; T.round = 0; T.paused = false; wakeLock(false); renderView(); }
async function wakeLock(on) {
  try {
    if (on && !T.lock && 'wakeLock' in navigator) { T.lock = await navigator.wakeLock.request('screen'); T.lock.addEventListener('release', () => { T.lock = null; }); }
    if (!on && T.lock) { await T.lock.release(); T.lock = null; }
  } catch (e) { /* no disponible: la pantalla puede apagarse */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && T.iv && !T.paused && T.phase !== 'done' && T.phase !== 'idle') { wakeLock(true); tTick(); }
});
function paintTimer() {
  const box = $('#timer'); if (!box) return;
  const shown = T.phase === 'idle' ? S.timer.work : T.left;
  const frac = T.phase === 'idle' ? 1 : T.phase === 'done' ? 0 : T.left / T.dur;
  box.className = 'rq-card rq-timer is-' + T.phase + (T.paused ? ' is-paused' : '');
  box.style.setProperty('--p', (frac * 100).toFixed(2));
  $('#tClock').textContent = T.phase === 'done' ? '✔' : mmss(Math.ceil(shown - 0.001));
  $('#tPhase').textContent = T.phase === 'work' ? `Round ${T.round} de ${S.timer.rounds}` : T.phase === 'rest' ? `Descanso · sigue el round ${T.round + 1}` : PHASE_LABEL[T.phase];
}

/* ---------- Mini-juego de combos ---------- */
const G = { on: false, endsAt: 0, score: 0, streak: 0, combos: 0, seq: [], pos: 0, iv: null, last: null };
function newCombo() {
  const len = G.combos < 3 ? 2 : G.combos < 7 ? 3 : G.combos < 12 ? 4 : 5;
  const seq = [Math.random() < 0.6 ? 1 : 2];
  while (seq.length < len) {
    // Solo el jab se repite (doble jab), y nunca tres seguidos.
    const prev = seq[seq.length - 1], prev2 = seq[seq.length - 2];
    let n; do { n = 1 + Math.floor(Math.random() * 6); } while (n === prev && (n !== 1 || prev2 === 1));
    seq.push(n);
  }
  G.seq = seq; G.pos = 0;
}
function gStart() {
  ac();
  Object.assign(G, { on: true, score: 0, streak: 0, combos: 0, last: null, endsAt: Date.now() + GAME_SECONDS * 1000 });
  newCombo();
  clearInterval(G.iv);
  G.iv = setInterval(gTick, 100);
  renderView();
  $('.rq-game').scrollIntoView({ block: 'end', behavior: 'smooth' }); // que se vean los 6 golpes
}
function gTick() {
  const left = Math.max(0, (G.endsAt - Date.now()) / 1000);
  const el = $('#gTime'); if (el) el.textContent = Math.ceil(left);
  if (left <= 0) gEnd();
}
function gHit(n) {
  if (!G.on) return;
  const btn = document.querySelector(`[data-punch="${n}"]`);
  if (n === G.seq[G.pos]) {
    G.pos++;
    tone(220 + n * 40, 0.08, 0, 'triangle', 0.3);
    flash(btn, 'is-hit');
    if (G.pos >= G.seq.length) {
      G.streak++; G.combos++;
      G.score += Math.round(10 * G.seq.length * (1 + Math.min(G.streak, 5) * 0.2));
      newCombo();
    }
  } else {
    G.streak = 0; G.pos = 0;
    tone(110, 0.2, 0, 'sawtooth', 0.2);
    buzz(80);
    flash(btn, 'is-miss');
    flash($('#gSeq'), 'is-shake');
  }
  paintGame();
}
function gEnd() {
  clearInterval(G.iv);
  G.on = false;
  const score = G.score;
  let earned = 0, record = false;
  act(() => {
    const d = dayOf(today());
    earned = Math.max(0, Math.min(XP.gameCapDay - (d.g || 0), Math.round(score / 20)));
    d.g = (d.g || 0) + earned;
    d.gp = (d.gp || 0) + 1;
    S.games++;
    if (score > S.gameBest) { S.gameBest = score; record = score > 0; }
  });
  bell(1);
  G.last = { score, earned, record };
  renderView();
}
function flash(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function paintGame() {
  const s = $('#gScore'); if (s) s.textContent = G.score;
  const k = $('#gStreak'); if (k) k.textContent = G.streak > 1 ? `x${G.streak} seguidos` : '';
  const q = $('#gSeq');
  if (q) q.innerHTML = G.seq.map((n, i) => `<span class="rq-seq__p ${i < G.pos ? 'is-done' : i === G.pos ? 'is-next' : ''}"><b>${n}</b><small>${PUNCHES[n][0]}</small></span>`).join('');
}

/* ---------- Vistas ---------- */
function render() { renderHud(); renderTabs(); renderView(); }

function renderHud() {
  const st = stats();
  const who = S.apodo ? esc(S.apodo) : 'Atleta';
  $('#hud').innerHTML = `<div class="rq-hud">
    <div class="rq-belt" style="--rc:${st.rank.color}" aria-hidden="true">${ICON.belt}</div>
    <div class="rq-xp">
      <div class="rq-xp__top"><strong>${who} · <span style="color:${st.rank.color}">${st.rank.name}</span></strong><span>${st.xp} XP</span></div>
      <div class="rq-bar" role="progressbar" aria-valuenow="${st.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avance al siguiente rango"><i style="width:${st.pct}%;background:${st.rank.color}"></i></div>
      <small>${st.next ? `${st.next.xp - st.xp} XP para <b>${st.next.name}</b>` : 'Rango máximo alcanzado. ¡Campeón!'}</small>
    </div>
    <div class="rq-chips">
      <div class="rq-chip rq-chip--fire ${st.run ? '' : 'is-off'}" title="Racha de días">${ICON.flame}<div>${st.run}<small>racha</small></div></div>
      <div class="rq-chip rq-chip--shield ${st.shield ? '' : 'is-off'}" title="Escudo: perdona un día perdido por semana">${ICON.shield}<div>${st.shield ? 1 : 0}<small>escudo</small></div></div>
    </div>
  </div>`;
}

function renderTabs() {
  const tabs = [['hoy', 'Hoy'], ['rounds', 'Rounds'], ['combos', 'Combos'], ['logros', 'Logros']];
  $('#tabs').innerHTML = tabs.map(([id, label]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? 'is-on' : ''}" data-action="tab" data-tab="${id}">${label}</button>`).join('');
}

function renderView() {
  const v = $('#view');
  if (tab === 'hoy') v.innerHTML = viewHoy();
  else if (tab === 'rounds') { v.innerHTML = viewRounds(); paintTimer(); }
  else if (tab === 'combos') { v.innerHTML = viewCombos(); paintGame(); }
  else v.innerHTML = viewLogros();
}

function viewHoy() {
  const t = today(), d = S.days[t], st = stats(), f = st.cur;
  const ms = missionsFor(t);
  // Días de club que quedan esta semana (lunes a sábado; el domingo el club cierra).
  let left = 0;
  for (let k = t; k <= addDays(f.ws, 5); k = addDays(k, 1)) if (!(k === t && d && d.c)) left++;
  const hp = Math.max(0, f.meta - f.hits);
  const fightMsg = f.won ? `<p class="rq-win">¡Ganaste por KO! +${XP.fight} XP</p>`
    : f.hits + left < f.meta ? `<p class="rq-muted">Esta semana se complicó. ¡La revancha es el lunes!</p>`
    : `<p class="rq-muted">Te faltan <b>${hp}</b> ${hp === 1 ? 'golpe' : 'golpes'} · quedan ${left} ${left === 1 ? 'día' : 'días'} de club esta semana.</p>`;
  const club = d && d.c;
  const nDone = ms.filter(m => missionDone(m, d)).length;
  return `<div class="rq-grid">
    <article class="rq-card rq-club ${club ? 'is-on' : ''}">
      <p class="eyebrow">Entrenamiento del día</p>
      <h3>${club ? '¡Entrenaste hoy en el club!' : '¿Fuiste a entrenar al club hoy?'}</h3>
      ${club ? `<p class="rq-muted">+${XP.club} XP y un golpe al rival de la semana.</p><button class="link" data-action="club">Me equivoqué, deshacer</button>`
        : `<button class="btn btn--primary btn--lg btn--block" data-action="club">${ICON.glove} Sí, entrené hoy · +${XP.club} XP</button>`}
    </article>
    <article class="rq-card rq-fight ${f.won ? 'is-won' : ''}">
      <p class="eyebrow">Pelea de la semana</p>
      <h3>Tú vs. ${esc(f.rival)}</h3>
      <div class="rq-hp"><span>Vida del rival</span><div class="rq-hp__bar">${Array.from({ length: f.meta }, (_, i) => `<i class="${i < f.hits ? 'is-hit' : ''}"></i>`).join('')}</div></div>
      ${fightMsg}
      <p class="rq-small">Cada día que entrenas en el club es un golpe. Tu meta: ${f.meta} días por semana. Récord: <b>${st.wins} G – ${st.losses} P</b></p>
    </article>
    <article class="rq-card rq-missions">
      <p class="eyebrow">Misiones de hoy · ${nDone}/3</p>
      <ul>${ms.map(m => {
        const done = missionDone(m, d);
        const btn = m.auto === 'game'
          ? (done ? `<span class="rq-check is-on">${ICON.check}</span>` : `<button class="btn btn--ghost btn--sm" data-action="tab" data-tab="combos">Jugar</button>`)
          : `<button class="rq-check ${done ? 'is-on' : ''}" data-action="mission" data-id="${m.id}" aria-pressed="${done}" aria-label="${done ? 'Desmarcar' : 'Marcar como hecha'}: ${esc(m.t)}" ${m.auto === 'rounds' && d && d.r >= 3 ? 'disabled' : ''}>${ICON.check}</button>`;
        return `<li class="${done ? 'is-done' : ''}">${btn}<div><b>${esc(m.t)}</b><small>${esc(m.d)}</small></div><span class="rq-xptag">+${XP.mission}</span></li>`;
      }).join('')}</ul>
      <p class="rq-small">Completa las 3 y ganas <b>Día perfecto</b> (+${XP.perfect} XP). Mañana tendrás misiones nuevas.</p>
    </article>
  </div>
  <p class="rq-note">Juego de honor: marca solo lo que hiciste de verdad. Entrena a tu ritmo y sigue siempre las indicaciones de tu entrenador; si algo duele, para.</p>`;
}

function viewRounds() {
  const running = T.phase !== 'idle' && T.phase !== 'done';
  const d = S.days[today()], todayR = d ? d.r : 0;
  const opt = (key, val, label) => `<button class="${S.timer[key] === val ? 'is-on' : ''}" data-action="tcfg" data-key="${key}" data-val="${val}" ${running ? 'disabled' : ''}>${label}</button>`;
  const controls = T.phase === 'idle' || T.phase === 'done'
    ? `<button class="btn btn--primary btn--lg" data-action="tstart">${T.phase === 'done' ? 'Otra vez' : '¡Empezar!'}</button>`
    : `<button class="btn btn--primary btn--lg" data-action="tpause">${T.paused ? 'Seguir' : 'Pausa'}</button><button class="btn btn--ghost btn--lg" data-action="treset">Terminar</button>`;
  return `<div class="rq-grid rq-grid--timer">
    <article class="rq-card rq-timer" id="timer">
      <div class="rq-ring"><div><span id="tPhase"></span><strong id="tClock"></strong></div></div>
      <div class="rq-timer__ctl">${controls}</div>
    </article>
    <article class="rq-card">
      <p class="eyebrow">Arma tu sesión</p>
      <div class="rq-field"><span>Rounds</span><div class="rq-stepper"><button data-action="trounds" data-val="-1" aria-label="Menos rounds" ${running ? 'disabled' : ''}>−</button><b>${S.timer.rounds}</b><button data-action="trounds" data-val="1" aria-label="Más rounds" ${running ? 'disabled' : ''}>+</button></div></div>
      <div class="rq-field"><span>Duración del round</span><div class="rq-seg">${opt('work', 60, '1 min')}${opt('work', 120, '2 min')}${opt('work', 180, '3 min')}</div></div>
      <div class="rq-field"><span>Descanso</span><div class="rq-seg">${opt('rest', 30, '30 s')}${opt('rest', 60, '1 min')}</div></div>
      <div class="rq-field"><span>Sonido y vibración</span><div class="rq-seg"><button class="${S.sound ? 'is-on' : ''}" data-action="sound" data-val="1">Sí</button><button class="${S.sound ? '' : 'is-on'}" data-action="sound" data-val="0">No</button></div></div>
      <p class="rq-small">Campana al empezar y terminar cada round; doble aviso cuando quedan 10 segundos. <b>+${XP.round} XP por round</b> (hasta ${XP.roundCapDay / XP.round} rounds al día). Hoy llevas <b>${todayR}</b>.</p>
      <p class="rq-small">Ideal para sombra, saltos o costal en casa. Mantén la pantalla abierta mientras entrenas.</p>
    </article>
  </div>`;
}

function viewCombos() {
  const d = S.days[today()], xpLeft = XP.gameCapDay - (d ? d.g || 0 : 0);
  const pads = [1, 2, 3, 4, 5, 6].map(n => `<button class="rq-pad rq-pad--${PUNCHES[n][1]}" data-punch="${n}" ${G.on ? '' : 'disabled'}><b>${n}</b><small>${PUNCHES[n][0]} ${PUNCHES[n][1]}.</small></button>`).join('');
  const overlay = G.on ? '' : `<div class="rq-over">
      ${G.last ? `<p class="eyebrow">Fin del round</p><div class="rq-big">${G.last.score}</div><p>${G.last.record ? '¡Nuevo récord! ' : ''}${G.last.earned ? `+${G.last.earned} XP` : 'Ya ganaste el XP de combos de hoy, pero el récord sigue contando.'}</p>`
        : `<p class="eyebrow">Mini-juego</p><h3>Combos</h3><p class="rq-muted">Aparece un combo con números. Tócalos en orden lo más rápido que puedas. ${GAME_SECONDS} segundos. Si fallas, se reinicia el combo.</p>`}
      <button class="btn btn--primary btn--lg" data-action="gstart">${G.last ? 'Jugar otra vez' : '¡A pelear!'}</button>
    </div>`;
  return `<div class="rq-grid rq-grid--game">
    <article class="rq-card rq-game">
      <div class="rq-game__top"><div><small>Puntos</small><b id="gScore">0</b></div><div><small>Tiempo</small><b id="gTime">${GAME_SECONDS}</b></div><div><small>Récord</small><b>${S.gameBest}</b></div></div>
      <div class="rq-seq" id="gSeq"></div>
      <p class="rq-streak" id="gStreak"></p>
      <div class="rq-pads">${pads}</div>
      ${overlay}
    </article>
    <article class="rq-card">
      <p class="eyebrow">Los números del boxeo</p>
      <ul class="rq-legend">${[1, 2, 3, 4, 5, 6].map(n => `<li><b>${n}</b> ${PUNCHES[n][0]} de ${PUNCHES[n][1] === 'izq' ? 'izquierda' : 'derecha'}</li>`).join('')}</ul>
      <p class="rq-small">Es la numeración clásica para guardia de diestro. Si eres zurdo, tu entrenador te dirá cómo cambia.</p>
      <p class="rq-small">XP: 1 por cada 20 puntos, hasta ${XP.gameCapDay} XP al día (hoy te quedan ${Math.max(0, xpLeft)}). En computadora puedes usar las teclas 1 a 6.</p>
    </article>
  </div>`;
}

function viewLogros() {
  const st = stats();
  const stat = (n, l) => `<div><b>${n}</b><small>${l}</small></div>`;
  return `<div class="rq-grid">
    <article class="rq-card rq-span">
      <p class="eyebrow">Tu carrera</p>
      <div class="rq-stats">${stat(st.clubDays, 'días en el club')}${stat(`${st.wins}–${st.losses}`, 'récord de peleas')}${stat(st.best, 'mejor racha')}${stat(st.rounds, 'rounds')}${stat(st.missions, 'misiones')}${stat(S.gameBest, 'récord en combos')}</div>
    </article>
    <article class="rq-card">
      <p class="eyebrow">Rangos</p>
      <ol class="rq-ranks">${RANKS.map((r, i) => `<li class="${i === st.ri ? 'is-on' : i < st.ri ? 'is-past' : ''}" style="--rc:${r.color}"><span class="rq-belt rq-belt--sm">${ICON.belt}</span><b>${r.name}</b><small>${r.xp} XP</small></li>`).join('')}</ol>
    </article>
    <article class="rq-card">
      <p class="eyebrow">Cómo ganar XP</p>
      <ul class="rq-howto">
        <li><span>Entrenar en el club</span><b>+${XP.club}</b></li>
        <li><span>Cada misión del día</span><b>+${XP.mission}</b></li>
        <li><span>Día perfecto (3 misiones)</span><b>+${XP.perfect}</b></li>
        <li><span>Ganar la pelea de la semana</span><b>+${XP.fight}</b></li>
        <li><span>Cada round con el temporizador</span><b>+${XP.round}</b></li>
        <li><span>Combos (máx. al día)</span><b>+${XP.gameCapDay}</b></li>
      </ul>
      <p class="rq-small">El domingo el club descansa y tu racha también: no se rompe. Y cada semana tienes 1 escudo que perdona un día perdido.</p>
    </article>
    <article class="rq-card rq-span">
      <p class="eyebrow">Insignias · ${st.badges.filter(b => b.on).length}/${st.badges.length}</p>
      <div class="rq-badges">${st.badges.map(b => `<div class="rq-badge ${b.on ? 'is-on' : ''}">${ICON.star}<b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`).join('')}</div>
    </article>
    <article class="rq-card rq-span">
      <p class="eyebrow">Ajustes</p>
      <div class="rq-settings">
        <button class="btn btn--ghost btn--sm" data-action="profile">Cambiar apodo o meta semanal</button>
        <button class="btn btn--ghost btn--sm" data-action="backup">Copiar código de respaldo</button>
        <button class="btn btn--ghost btn--sm" data-action="restore">Restaurar respaldo</button>
        <button class="btn btn--ghost btn--sm rq-danger" data-action="wipe">Borrar mi progreso</button>
      </div>
      <p class="rq-small">¿Cambias de teléfono? Copia tu código de respaldo, guárdalo (por ejemplo, mándatelo a ti mismo) y restáuralo en el nuevo.</p>
    </article>
  </div>`;
}

/* ---------- Perfil (apodo y meta) ---------- */
function profileModal(first) {
  const metas = [2, 3, 4, 5, 6].map(n => `<button type="button" class="${S.meta === n ? 'is-on' : ''}" data-action="pickmeta" data-val="${n}">${n}</button>`).join('');
  openModal(`<form id="profileForm">
    ${first ? `<div class="rq-belt rq-belt--big" style="--rc:${RANKS[0].color}">${ICON.belt}</div><h3>Te damos la bienvenida al Ring Quest</h3>
      <p class="rq-muted">Convierte tu entrenamiento en un juego: misiones diarias, rachas, una pelea cada semana y rangos de Novato a Campeón.</p>` : '<h3>Tu perfil</h3>'}
    <label class="rq-label">Tu apodo de boxeo (opcional)<input name="apodo" maxlength="20" autocomplete="off" placeholder="Ej.: Rayo" value="${esc(S.apodo)}"></label>
    <p class="rq-small">Usa un apodo, no tu nombre completo. Se guarda solo en este teléfono.</p>
    <span class="rq-label">¿Cuántos días por semana vas a entrenar en el club?</span>
    <div class="rq-seg rq-seg--wide" id="metaSeg">${metas}</div>
    <p class="rq-small">Esa es tu meta para ganar la pelea de cada semana. Puedes cambiarla cuando quieras.</p>
    <div class="rq-modal__actions">${first ? '' : '<button type="button" class="btn btn--ghost" data-action="close">Cancelar</button>'}<button type="submit" class="btn btn--primary">${first ? '¡Al ring!' : 'Guardar'}</button></div>
  </form>`);
  let meta = S.meta;
  $('#metaSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-val]'); if (!b) return;
    meta = Number(b.dataset.val);
    $('#metaSeg').querySelectorAll('button').forEach(x => x.classList.toggle('is-on', x === b));
  });
  $('#profileForm').addEventListener('submit', e => {
    e.preventDefault();
    act(() => {
      S.apodo = e.target.apodo.value.replace(/\s+/g, ' ').trim().slice(0, 20);
      S.meta = meta;
      const ws = weekStart(today()), f = stats().cur;
      if (!f.won) S.weekMeta[ws] = meta; // una pelea ya ganada no cambia
      S.setup = true;
    });
    closeModal();
  });
}

/* ---------- Respaldo ---------- */
function backupCode() { return 'RQ1.' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function parseBackup(code) {
  const raw = String(code).trim().replace(/^RQ1\./, '');
  const o = JSON.parse(decodeURIComponent(escape(atob(raw))));
  if (!o || o.v !== 1 || !o.days || typeof o.days !== 'object') throw new Error('formato');
  return Object.assign(blank(), o, { setup: true });
}

/* ---------- Acciones ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-action]');
  if (!b) { if (e.target.id === 'modal' && S.setup) closeModal(); return; }
  const a = b.dataset.action, t = today();
  if (a === 'tab') { if (G.on) return; tab = b.dataset.tab; renderTabs(); renderView(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (a === 'club') act(() => { const d = dayOf(t); d.c = !d.c; });
  else if (a === 'mission') act(() => { const d = dayOf(t), id = b.dataset.id; d.m = d.m.includes(id) ? d.m.filter(x => x !== id) : [...d.m, id]; });
  else if (a === 'tstart') tStart();
  else if (a === 'tpause') tPause();
  else if (a === 'treset') tReset();
  else if (a === 'trounds') { S.timer.rounds = Math.min(12, Math.max(1, S.timer.rounds + Number(b.dataset.val))); save(); renderView(); }
  else if (a === 'tcfg') { S.timer[b.dataset.key] = Number(b.dataset.val); save(); renderView(); }
  else if (a === 'sound') { S.sound = b.dataset.val === '1'; save(); renderView(); if (S.sound) tone(880, 0.4); }
  else if (a === 'gstart') gStart();
  else if (a === 'close') closeModal();
  else if (a === 'profile') profileModal(false);
  else if (a === 'backup') {
    const code = backupCode();
    try { await navigator.clipboard.writeText(code); toast('Código copiado', null, 'Guárdalo en un lugar seguro'); }
    catch (err) { openModal(`<h3>Tu código de respaldo</h3><p class="rq-small">Cópialo y guárdalo.</p><textarea class="rq-code" readonly>${esc(code)}</textarea><div class="rq-modal__actions"><button class="btn btn--primary" data-action="close">Listo</button></div>`); }
  }
  else if (a === 'restore') {
    openModal(`<h3>Restaurar respaldo</h3><p class="rq-small">Pega aquí tu código. Reemplaza el progreso de este teléfono.</p><textarea class="rq-code" id="restoreCode" placeholder="RQ1...."></textarea><p class="rq-err" id="restoreErr" hidden>Ese código no es válido. Revisa que esté completo.</p><div class="rq-modal__actions"><button class="btn btn--ghost" data-action="close">Cancelar</button><button class="btn btn--primary" data-action="dorestore">Restaurar</button></div>`);
  }
  else if (a === 'dorestore') {
    try { S = parseBackup($('#restoreCode').value); save(); closeModal(); render(); toast('Progreso restaurado', 'gold'); }
    catch (err) { $('#restoreErr').hidden = false; }
  }
  else if (a === 'wipe') {
    openModal(`<h3>¿Borrar todo tu progreso?</h3><p class="rq-muted">Se borran tu XP, rachas, peleas e insignias de este teléfono. No se puede deshacer.</p><div class="rq-modal__actions"><button class="btn btn--ghost" data-action="close">Cancelar</button><button class="btn btn--primary rq-danger-fill" data-action="dowipe">Sí, borrar</button></div>`);
  }
  else if (a === 'dowipe') { tReset(); S = blank(); save(); closeModal(); tab = 'hoy'; render(); profileModal(true); }
});
document.addEventListener('pointerdown', e => {
  const p = e.target.closest('[data-punch]');
  if (p && G.on) { e.preventDefault(); gHit(Number(p.dataset.punch)); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').hidden && S.setup) closeModal();
  if (tab === 'combos' && G.on && /^[1-6]$/.test(e.key)) gHit(Number(e.key));
});

/* ---------- Arranque ---------- */
document.querySelectorAll('[data-wa]').forEach(el => { el.href = waLink(el.dataset.wa); el.target = '_blank'; el.rel = 'noopener'; });
function boot() {
  const ws = weekStart(today());
  if (!S.weekMeta[ws]) { S.weekMeta[ws] = S.meta; save(); } // congela la meta de cada semana
  render();
}
boot();
if (!S.setup) profileModal(true);
// Si la pestaña queda abierta pasada la medianoche, refresca las misiones.
let lastDay = today();
setInterval(() => { if (today() !== lastDay && !G.on && T.phase === 'idle') { lastDay = today(); boot(); } }, 60000);
