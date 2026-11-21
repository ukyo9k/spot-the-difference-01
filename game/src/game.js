// Game logic for Lantern Lane: state, input, timer, scoring, hints and the
// markers drawn over the two pictures. The scenes themselves live in
// scenes.js and the level data in levels.js; this file only runs the hunt.

import { LEVELS } from './levels.js';
import { SCENES, W, H } from './scenes.js';
import {
  setSoundEnabled,
  isSoundEnabled,
  playFound,
  playMiss,
  playHint,
  playLevelClear,
  playGameComplete,
  playTick,
} from './audio.js';

const FIND_POINTS = 100;
const MISS_POINTS = 10;
const MISS_SECONDS = 5;
const HINT_POINTS = 25;
const HINTS_PER_LEVEL = 3;

const canvasA = document.getElementById('canvasA');
const canvasB = document.getElementById('canvasB');
const ctxA = canvasA.getContext('2d');
const ctxB = canvasB.getContext('2d');

const el = (id) => document.getElementById(id);
const levelNameEl = el('levelName');
const foundCounterEl = el('foundCounter');
const remainCounterEl = el('remainCounter');
const timeLeftEl = el('timeLeft');
const scoreValueEl = el('scoreValue');
const hintValueEl = el('hintValue');
const messageEl = el('message');
const overlayEl = el('overlay');
const overlayTitleEl = el('overlayTitle');
const overlayTextEl = el('overlayText');
const overlayStatsEl = el('overlayStats');
const overlayBtnEl = el('overlayBtn');
const hintBtnEl = el('hintBtn');
const restartBtnEl = el('restartBtn');
const soundBtnEl = el('soundBtn');

const state = {
  screen: 'title', // title | playing | levelClear | gameOver | gameComplete
  levelIndex: 0,
  found: new Set(),
  timeLeft: 150,
  score: 0,
  totalFound: 0,
  hintsLeft: HINTS_PER_LEVEL,
  misses: [], // {panel, x, y, until}
  hintPulse: null, // {key, until}
  cursor: { panel: 'A', x: W / 2, y: H / 2, visible: false },
  timerId: null,
  lastTickSecond: -1,
};

function level() {
  return LEVELS[state.levelIndex];
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function setMessage(text, kind) {
  messageEl.textContent = text;
  messageEl.className = kind || '';
}

function updateHud() {
  const lv = level();
  levelNameEl.textContent = `${state.levelIndex + 1} · ${lv.name}`;
  foundCounterEl.textContent = `${state.found.size} / ${lv.differences.length}`;
  remainCounterEl.textContent = String(lv.differences.length - state.found.size);
  timeLeftEl.textContent = formatTime(state.timeLeft);
  timeLeftEl.classList.toggle('low', state.timeLeft <= 30 && state.screen === 'playing');
  scoreValueEl.textContent = String(state.score);
  hintValueEl.textContent = String(state.hintsLeft);
  hintBtnEl.disabled = state.screen !== 'playing' || state.hintsLeft <= 0;
  restartBtnEl.disabled = state.screen !== 'playing';
}

// --- Rendering -------------------------------------------------------------

function drawMarkers(ctx, panel) {
  const now = performance.now();
  const lv = level();
  for (const key of state.found) {
    const d = lv.differences.find((x) => x.key === key);
    if (!d) continue;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r + 4, 0, Math.PI * 2);
    ctx.stroke();
    // Check mark inside the ring.
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(d.x - 9, d.y);
    ctx.lineTo(d.x - 2, d.y + 8);
    ctx.lineTo(d.x + 11, d.y - 8);
    ctx.stroke();
  }
  if (state.hintPulse && now < state.hintPulse.until) {
    const d = lv.differences.find((x) => x.key === state.hintPulse.key);
    if (d) {
      const pulse = 1 + 0.12 * Math.sin(now / 130);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(d.x, d.y, (d.r + 8) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  for (const m of state.misses) {
    if (m.panel !== panel || now >= m.until) continue;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const s = 10;
    ctx.beginPath();
    ctx.moveTo(m.x - s, m.y - s); ctx.lineTo(m.x + s, m.y + s);
    ctx.moveTo(m.x + s, m.y - s); ctx.lineTo(m.x - s, m.y + s);
    ctx.stroke();
  }
  if (state.screen === 'playing' && state.cursor.visible && state.cursor.panel === panel) {
    const { x, y } = state.cursor;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 19, y); ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y); ctx.lineTo(x + 19, y);
    ctx.moveTo(x, y - 19); ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 19);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
}

function render() {
  const lv = level();
  const painter = SCENES[lv.scene];
  const rightDiffs = new Set(lv.differences.map((d) => d.key));
  painter(ctxA, new Set());
  painter(ctxB, rightDiffs);
  drawMarkers(ctxA, 'A');
  drawMarkers(ctxB, 'B');
  updateHud();
}

function renderLoop() {
  if (state.screen === 'playing') render();
  requestAnimationFrame(renderLoop);
}

// --- Timer -----------------------------------------------------------------

function startTimer() {
  stopTimer();
  state.lastTickSecond = -1;
  state.timerId = setInterval(() => {
    if (state.screen !== 'playing') return;
    state.timeLeft -= 0.1;
    const whole = Math.ceil(state.timeLeft);
    if (whole <= 10 && whole !== state.lastTickSecond && whole > 0) {
      state.lastTickSecond = whole;
      playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      gameOver();
      return;
    }
    updateHud();
  }, 100);
}

function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

// --- Overlays ---------------------------------------------------------------

function showOverlay(title, text, stats, buttonLabel, onButton) {
  overlayTitleEl.textContent = title;
  overlayTextEl.textContent = text;
  overlayStatsEl.textContent = stats;
  overlayBtnEl.textContent = buttonLabel;
  overlayEl.classList.remove('hidden');
  overlayBtnEl.onclick = onButton;
  overlayBtnEl.focus();
}

function hideOverlay() {
  overlayEl.classList.add('hidden');
}

function showTitle() {
  state.screen = 'title';
  stopTimer();
  state.levelIndex = 0;
  state.found = new Set();
  state.score = 0;
  state.totalFound = 0;
  state.timeLeft = level().timeLimit;
  state.hintsLeft = HINTS_PER_LEVEL;
  render();
  showOverlay(
    'Lantern Lane',
    'Three hand-drawn scenes. Two pictures in each — find all 7 differences before the clock runs out. Click a difference on either picture, or steer the crosshair with the arrow keys and press Enter.',
    '3 levels · 7 differences each · 2:30 per level',
    'Start playing',
    startLevel,
  );
  setMessage('Welcome! Press Start playing, then hunt the differences.');
}

function startLevel() {
  hideOverlay();
  state.screen = 'playing';
  state.found = new Set();
  state.timeLeft = level().timeLimit;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.misses = [];
  state.hintPulse = null;
  render();
  setMessage(`${level().name} — ${level().blurb} Find ${level().differences.length} differences!`);
  startTimer();
}

function levelClear() {
  stopTimer();
  const bonus = Math.round(state.timeLeft) * 2;
  state.score += bonus;
  state.screen = 'levelClear';
  playLevelClear();
  render();
  const last = state.levelIndex === LEVELS.length - 1;
  showOverlay(
    last ? 'All scenes cleared!' : `Level clear — ${level().name}`,
    last
      ? 'You found every difference in all three scenes. The lane is yours.'
      : `Every difference in ${level().name} found. ${LEVELS[state.levelIndex + 1].name} is next: ${LEVELS[state.levelIndex + 1].blurb}`,
    `Time bonus +${bonus} · Score ${state.score} · ${state.totalFound} differences found`,
    last ? 'See your final score' : 'Next level',
    () => {
      hideOverlay();
      if (last) {
        gameComplete();
      } else {
        state.levelIndex += 1;
        startLevel();
      }
    },
  );
}

function gameComplete() {
  state.screen = 'gameComplete';
  playGameComplete();
  showOverlay(
    'You finished Lantern Lane!',
    'All 21 differences found across Lantern Lane, the Tea Garden and Lighthouse Cove. Thank you for playing.',
    `Final score ${state.score} · 21 / 21 differences`,
    'Play again',
    () => {
      hideOverlay();
      state.levelIndex = 0;
      state.score = 0;
      state.totalFound = 0;
      startLevel();
    },
  );
}

function gameOver() {
  stopTimer();
  state.screen = 'gameOver';
  playMiss();
  showOverlay(
    'Out of time!',
    `The clock ran out in ${level().name} with ${level().differences.length - state.found.size} differences still hiding.`,
    `Score ${state.score} · ${state.totalFound} differences found so far`,
    'Try this level again',
    () => {
      hideOverlay();
      startLevel();
    },
  );
}

// --- Playing ----------------------------------------------------------------

function scenePoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  };
}

function checkSpot(panel, x, y) {
  if (state.screen !== 'playing') return;
  const lv = level();
  const hit = lv.differences.find(
    (d) => !state.found.has(d.key) && Math.hypot(d.x - x, d.y - y) <= d.r + 8,
  );
  if (hit) {
    state.found.add(hit.key);
    state.totalFound += 1;
    state.score += FIND_POINTS;
    playFound();
    const remain = lv.differences.length - state.found.size;
    setMessage(
      remain === 0 ? `Found it — ${hit.label}!` : `Found it — ${hit.label}! ${remain} still hiding.`,
      'good',
    );
    render();
    if (remain === 0) levelClear();
  } else {
    state.score = Math.max(0, state.score - MISS_POINTS);
    state.timeLeft = Math.max(0, state.timeLeft - MISS_SECONDS);
    state.misses.push({ panel, x, y, until: performance.now() + 700 });
    playMiss();
    setMessage(`Not a difference — minus 5 seconds, minus 10 points.`, 'bad');
    render();
    if (state.timeLeft <= 0) gameOver();
  }
}

function useHint() {
  if (state.screen !== 'playing' || state.hintsLeft <= 0) return;
  const lv = level();
  const remaining = lv.differences.filter((d) => !state.found.has(d.key));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - HINT_POINTS);
  state.hintPulse = { key: pick.key, until: performance.now() + 2000 };
  playHint();
  setMessage('Hint: look inside the golden ring — 25 points well spent?', '');
  render();
}

function bindCanvas(canvas, panel) {
  canvas.addEventListener('click', (event) => {
    const p = scenePoint(canvas, event.clientX, event.clientY);
    state.cursor = { panel, x: p.x, y: p.y, visible: false };
    checkSpot(panel, p.x, p.y);
  });
  canvas.addEventListener('mousemove', (event) => {
    const p = scenePoint(canvas, event.clientX, event.clientY);
    state.cursor = { panel, x: p.x, y: p.y, visible: false };
  });
}

bindCanvas(canvasA, 'A');
bindCanvas(canvasB, 'B');

hintBtnEl.addEventListener('click', useHint);
restartBtnEl.addEventListener('click', () => {
  if (state.screen === 'playing') startLevel();
});
soundBtnEl.addEventListener('click', () => {
  setSoundEnabled(!isSoundEnabled());
  soundBtnEl.textContent = `Sound: ${isSoundEnabled() ? 'on' : 'off'} (M)`;
  soundBtnEl.setAttribute('aria-pressed', String(isSoundEnabled()));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'm' || event.key === 'M') {
    soundBtnEl.click();
    return;
  }
  if (state.screen !== 'playing') {
    if (event.key === 'Enter' && !overlayEl.classList.contains('hidden')) overlayBtnEl.click();
    return;
  }
  const step = event.shiftKey ? 4 : 14;
  const c = state.cursor;
  if (event.key === 'ArrowLeft') { c.x = Math.max(0, c.x - step); c.visible = true; event.preventDefault(); }
  else if (event.key === 'ArrowRight') { c.x = Math.min(W, c.x + step); c.visible = true; event.preventDefault(); }
  else if (event.key === 'ArrowUp') { c.y = Math.max(0, c.y - step); c.visible = true; event.preventDefault(); }
  else if (event.key === 'ArrowDown') { c.y = Math.min(H, c.y + step); c.visible = true; event.preventDefault(); }
  else if (event.key === 'Enter' || event.key === ' ') { checkSpot(c.panel, c.x, c.y); event.preventDefault(); }
  else if (event.key === 'h' || event.key === 'H') { useHint(); }
  else if (event.key === 'r' || event.key === 'R') { startLevel(); }
  else if (event.key === 'Tab') {
    c.panel = c.panel === 'A' ? 'B' : 'A';
    c.visible = true;
    event.preventDefault();
  }
});

// --- Demo mode (for screenshots) -------------------------------------------
// ?level=2&found=3 starts level 2 with its first 3 differences already
// found, so the screenshots can show a mid-hunt board. Not a cheat: it is
// the same game state a player reaches by finding them.
function applyDemoParams() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('level') && !params.has('found')) return false;
  const li = Math.min(Math.max(parseInt(params.get('level') || '1', 10) - 1, 0), LEVELS.length - 1);
  const count = Math.min(Math.max(parseInt(params.get('found') || '0', 10), 0), LEVELS[li].differences.length);
  state.levelIndex = li;
  state.screen = 'playing';
  state.found = new Set(LEVELS[li].differences.slice(0, count).map((d) => d.key));
  state.totalFound = count;
  state.score = count * FIND_POINTS;
  state.timeLeft = LEVELS[li].timeLimit - count * 7;
  state.hintsLeft = HINTS_PER_LEVEL;
  hideOverlay();
  render();
  const remain = LEVELS[li].differences.length - count;
  setMessage(`${count} of ${LEVELS[li].differences.length} found in ${LEVELS[li].name} — ${remain} still hiding.`);
  startTimer();
  return true;
}

// A small read-only handle for automated play-testing.
window.__lanternLane = {
  state,
  levels: LEVELS,
  checkSpot,
  useHint,
  startLevel,
};

// --- Boot --------------------------------------------------------------------
requestAnimationFrame(renderLoop);
if (!applyDemoParams()) showTitle();
