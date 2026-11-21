// Tiny sound effects for Lantern Lane, synthesized with WebAudio — no audio
// files, no network. A soft pop for a find, a low buzz for a miss, a little
// rising arpeggio for a cleared level and a fanfare for finishing the game.

let audioCtx = null;
let enabled = true;

export function setSoundEnabled(on) {
  enabled = on;
}

export function isSoundEnabled() {
  return enabled;
}

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(freq, startAt, dur, type, vol) {
  const ac = ctx();
  if (!ac || !enabled) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

export function playFound() {
  tone(880, 0, 0.16, 'sine', 0.22);
  tone(1318, 0.07, 0.2, 'sine', 0.18);
}

export function playMiss() {
  tone(160, 0, 0.18, 'sawtooth', 0.08);
}

export function playHint() {
  tone(660, 0, 0.12, 'triangle', 0.16);
  tone(990, 0.1, 0.16, 'triangle', 0.14);
}

export function playLevelClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.2));
}

export function playGameComplete() {
  [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.13, 0.26, 'triangle', 0.2));
}

export function playTick() {
  tone(1200, 0, 0.05, 'sine', 0.06);
}
