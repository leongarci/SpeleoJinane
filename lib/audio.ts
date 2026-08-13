"use client";

let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let timer: number | null = null;
let started = false;

const MELODY = [
  [0, 0.18],
  [7, 0.18],
  [12, 0.24],
  [7, 0.18],
  [10, 0.18],
  [12, 0.36],
  [5, 0.18],
  [9, 0.18],
  [12, 0.24],
  [9, 0.18],
  [7, 0.18],
  [5, 0.36],
] as const;

function freq(semitone: number) {
  return 220 * Math.pow(2, semitone / 12);
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    ctx = new AudioContext();
    gain = ctx.createGain();
    gain.gain.value = 0.05;
    gain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMuted(muted: boolean) {
  if (!gain || !ctx) return;
  gain.gain.setTargetAtTime(muted ? 0 : 0.05, ctx.currentTime, 0.05);
}

export function startMusic() {
  unlockAudio();
  if (!ctx || !gain || started) return;
  started = true;

  const playLoop = () => {
    if (!ctx || !gain) return;
    let t = ctx.currentTime + 0.05;
    for (const [note, dur] of MELODY) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq(note);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.7, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);
      osc.connect(g);
      g.connect(gain);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
    const wait = (t - ctx.currentTime) * 1000 + 400;
    timer = window.setTimeout(playLoop, wait);
  };
  playLoop();
}

export function stopMusic() {
  if (timer) window.clearTimeout(timer);
  timer = null;
  started = false;
}

export function blip(up = true) {
  unlockAudio();
  if (!ctx || !gain) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = up ? 660 : 220;
  g.gain.value = 0.4;
  osc.connect(g);
  g.connect(gain);
  const now = ctx.currentTime;
  osc.frequency.exponentialRampToValueAtTime(up ? 990 : 110, now + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  osc.start(now);
  osc.stop(now + 0.15);
}
