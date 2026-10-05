// Original soundtrack + SFX for the brag video. D major, 112 BPM, 10 bars (21.43s).
// Writes work/music.wav (48 kHz, stereo, 32-bit float). Timings mirror comp/main.js.
import fs from "node:fs";
import path from "node:path";

const SR = 48000;
const B = 60 / 112; // beat
const BAR = 4 * B;
const DUR = BAR * 10;
const N = Math.ceil(DUR * SR);
const CUT = { reveal: BAR * 1.5, upload: BAR * 3, design: BAR * 5, download: BAR * 7, outro: BAR * 8.5 };

const L = new Float32Array(N), R = new Float32Array(N); // dry bus
const SL = new Float32Array(N), SR_ = new Float32Array(N); // reverb send

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 12345;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

function mix(buf, start, gain, pan = 0, send = 0) {
  const i0 = Math.round(start * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  for (let i = 0; i < buf.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    L[j] += buf[i] * gl; R[j] += buf[i] * gr;
    if (send) { SL[j] += buf[i] * gl * send; SR_[j] += buf[i] * gr * send; }
  }
}

// RBJ biquad, applied in place
function biquad(buf, type, f, q = 0.707) {
  const w = (2 * Math.PI * f) / SR, cos = Math.cos(w), alpha = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === "lp") { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = (1 - cos) / 2; }
  else if (type === "hp") { b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = (1 + cos) / 2; }
  else { b0 = alpha; b1 = 0; b2 = -alpha; } // band-pass
  const a0 = 1 + alpha, a1 = -2 * cos, a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y; buf[i] = y;
  }
  return buf;
}

// ---------- instruments ----------
function pad(notes, dur) {
  const len = Math.ceil((dur + 0.8) * SR);
  const buf = new Float32Array(len);
  const oscs = [];
  for (const m of notes) for (const c of [-8, 0, 8]) oscs.push({ f: mtof(m) * Math.pow(2, c / 1200), ph: Math.random() });
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.35) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.8) : 1);
    let s = 0;
    for (const o of oscs) { o.ph += o.f / SR; s += 2 * (o.ph % 1) - 1; }
    buf[i] = (s / oscs.length) * env;
  }
  biquad(buf, "lp", 1100, 0.6);
  return biquad(buf, "lp", 1400, 0.6);
}

function pluck(m, len = 0.7) {
  const f = mtof(m), n = Math.ceil(len * SR), buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const mod = Math.sin(2 * Math.PI * 2 * f * t) * 1.1 * Math.exp(-t * 14);
    buf[i] = Math.sin(2 * Math.PI * f * t + mod) * Math.exp(-t * 5.5) * Math.min(1, t / 0.003);
  }
  return buf;
}

function bass(m, len) {
  const f = mtof(m), n = Math.ceil((len + 0.06) * SR), buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.006) * (0.75 + 0.25 * Math.exp(-t * 8)) * (t > len ? Math.max(0, 1 - (t - len) / 0.06) : 1);
    buf[i] = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env;
  }
  return biquad(buf, "lp", 600);
}

function kick() {
  const n = Math.ceil(0.35 * SR), buf = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (45 + 75 * Math.exp(-t * 35)) / SR;
    buf[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) + noise() * 0.15 * Math.exp(-t * 300);
  }
  return buf;
}

function clap() {
  const n = Math.ceil(0.2 * SR), buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const bursts = t < 0.025 ? Math.exp(-((t * 1000) % 8) * 0.5) : 1;
    buf[i] = noise() * Math.exp(-t * 22) * bursts;
  }
  return biquad(buf, "bp", 1500, 0.9);
}

function shaker() {
  const n = Math.ceil(0.06 * SR), buf = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; buf[i] = noise() * Math.exp(-t * 70) * Math.min(1, t / 0.004); }
  return biquad(buf, "hp", 7000);
}

// soft paper swish / transition whoosh: filtered noise swell
function swish(len, f0, f1, q = 1.4) {
  const n = Math.ceil(len * SR), buf = new Float32Array(n);
  for (let i = 0; i < n; i++) { const k = i / n; buf[i] = noise() * Math.sin(Math.PI * Math.pow(k, 0.7)); }
  // sweep by processing in chunks with rising center frequency
  const out = new Float32Array(n), chunk = 256;
  for (let c = 0; c < n; c += chunk) {
    const seg = buf.slice(Math.max(0, c - 512), Math.min(n, c + chunk));
    biquad(seg, "bp", f0 * Math.pow(f1 / f0, c / n), q);
    out.set(seg.subarray(seg.length - Math.min(chunk, n - c)), c);
  }
  return out;
}

// tuned UI click: tiny noise tick + short sine blip
function click(m) {
  const n = Math.ceil(0.12 * SR), buf = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    buf[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 45) * 0.8 + noise() * Math.exp(-t * 900) * 0.5;
  }
  return buf;
}

function thump() {
  const n = Math.ceil(0.3 * SR), buf = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; ph += (110 + 80 * Math.exp(-t * 40)) / SR; buf[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 14); }
  return buf;
}

function bell(m, len = 1.6) {
  const f = mtof(m), n = Math.ceil(len * SR), buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    buf[i] = (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6) + 0.2 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 12))
      * Math.exp(-t * 3) * Math.min(1, t / 0.002);
  }
  return buf;
}

// ---------- arrangement ----------
// [start bar, length in bars, pad voicing, bass root]
const D = [62, 66, 69], A = [61, 64, 69], Bm = [62, 66, 71], G = [62, 67, 71], Em = [64, 67, 71];
const CHORDS = [
  [0, 1, D, 38], [1, 1, A, 33], [2, 1, Bm, 35], [3, 1, G, 31],
  [4, 1, D, 38], [5, 1, A, 33], [6, 1, Bm, 35], [7, 1, G, 31],
  [8, 0.5, Em, 40], [8.5, 0.5, A, 33], [9, 1, D, 38],
];

for (const [bar, bars, notes, root] of CHORDS) {
  const t0 = bar * BAR, len = bars * BAR;
  const last = bar === 9;
  mix(pad(notes, last ? len - 0.4 : len), t0, last ? 0.2 : 0.13, 0, 0.35);

  // pluck arpeggio, 8th notes
  const tones = [...notes.map((n) => n + 12), notes[0] + 24];
  const pattern = [0, 1, 2, 1, 3, 2, 1, 2];
  const steps = Math.round(len / (B / 2));
  for (let s = 0; s < steps; s++) {
    const t = t0 + s * (B / 2);
    if (last && s > 0) break; // outro: one final pluck, then let it ring
    const accent = s % 2 === 0 ? 1 : 0.7;
    mix(pluck(tones[pattern[s % 8]], last ? 2.2 : 0.7), t, 0.075 * accent * (t < CUT.reveal ? 0.85 : 1), s % 2 ? 0.35 : -0.35, 0.45);
  }

  // bass from the reveal; root on 1, push on the "and" of 2, 5th on 4
  if (t0 + len > CUT.reveal) {
    const hits = last ? [[0, 3.6, root]] : [[0, 1.4, root], [1.5, 0.45, root], [2, 1, root], [3, 0.9, root + 7]];
    for (const [beat, l, m] of hits) {
      const t = t0 + beat * B;
      if (t < CUT.reveal - 0.01 || beat >= bars * 4) continue;
      mix(bass(m, l * B), t, 0.22, 0);
    }
  }
}

// intro bass: two soft notes under the hook
mix(bass(38, BAR * 0.9), 0, 0.12);
mix(bass(33, BAR * 0.45), BAR, 0.12);

// drums: from the reveal cut to the outro cut, then a kick on the final downbeat
for (let t = CUT.reveal; t < CUT.outro - 0.01; t += B) {
  const beat = Math.round(t / B) % 4;
  mix(kick(), t, 0.42);
  if (beat === 1 || beat === 3) mix(clap(), t, 0.12, 0.1, 0.5);
}
for (let t = CUT.reveal; t < CUT.outro - 0.01; t += B / 4) {
  const sub = Math.round(t / (B / 4)) % 4;
  mix(shaker(), t, sub === 2 ? 0.07 : 0.035, 0.3, 0.2);
}
mix(kick(), BAR * 9, 0.45);

// ---------- SFX (timings from comp/main.js) ----------
// hook: card deals
for (let i = 0; i < 10; i++) {
  const arrive = 0.08 + 1.55 * Math.sqrt(i / 9);
  const fromX = (((Math.sin(i * 127.1 + 4 * 311.7) * 43758.5453) % 1) + 1) % 1 - 0.5;
  mix(swish(0.2, 1800, 4200, 1.6), arrive, 0.11, fromX * 1.2, 0.3);
  mix(thump(), arrive + 0.3, 0.06, 0, 0.2);
}
// transition whooshes into each cut
for (const c of [CUT.reveal, CUT.upload, CUT.design, CUT.download, CUT.outro]) mix(swish(0.42, 500, 3500, 0.9), c - 0.36, 0.07, 0, 0.5);

// upload
const tGrab = CUT.upload + 0.5, tDrop = CUT.upload + 1.55;
mix(click(81), tGrab, 0.08, -0.2, 0.3); // A5
mix(thump(), tDrop, 0.16, 0, 0.35);
mix(click(74), tDrop, 0.07, 0, 0.4); // D5
[86, 90, 93, 98].forEach((m, i) => mix(click(m), tDrop + 0.3 + i * 0.16 + 0.08, 0.045, -0.4, 0.5)); // D6 F#6 A6 D7

// design: four control clicks
[CUT.design + 0.84, CUT.design + 1.54, CUT.design + 2.24, CUT.design + 2.94].forEach((t, i) => mix(click([81, 78, 81, 86][i]), t, 0.08, 0.35, 0.3));

// download: press, progress pops, success chime
const tClick = CUT.download + 0.72;
mix(click(74), tClick, 0.1, 0, 0.3);
[74, 78, 81, 86].forEach((m, i) => mix(click(m), tClick + 0.32 + i * 0.26, 0.07, (i - 1.5) * 0.25, 0.45));
[86, 90, 93, 98].forEach((m, i) => mix(bell(m), tClick + 0.32 + 3 * 0.26 + 0.14 + i * 0.05, 0.035, (i - 1.5) * 0.3, 0.6));

// outro: soft bell on the final chord
mix(bell(74, 2.2), BAR * 9, 0.05, 0, 0.6);

// ---------- reverb (Schroeder: 4 combs + 2 allpasses per side) ----------
function reverb(input, delays) {
  const out = new Float32Array(N);
  for (const d of delays.comb) {
    const n = Math.round(d * SR), line = new Float32Array(n);
    let idx = 0, lp = 0;
    for (let i = 0; i < N; i++) {
      const y = line[idx];
      lp = y * 0.7 + lp * 0.3;
      line[idx] = input[i] + lp * 0.8;
      out[i] += y / delays.comb.length;
      idx = (idx + 1) % n;
    }
  }
  for (const d of delays.ap) {
    const n = Math.round(d * SR), line = new Float32Array(n);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const buf = line[idx], x = out[i];
      out[i] = -x + buf;
      line[idx] = x + buf * 0.5;
      idx = (idx + 1) % n;
    }
  }
  return biquad(biquad(out, "hp", 300), "lp", 6000);
}
const wetL = reverb(SL, { comb: [0.0297, 0.0371, 0.0411, 0.0437], ap: [0.005, 0.0017] });
const wetR = reverb(SR_, { comb: [0.0301, 0.0367, 0.0423, 0.0449], ap: [0.0051, 0.0018] });

// ---------- master ----------
const out = new Float32Array(N * 2);
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (N - i) / (0.5 * SR)); // short fade on the final half second
  out[2 * i] = Math.tanh((L[i] + wetL[i] * 0.55) * 1.1) * fade;
  out[2 * i + 1] = Math.tanh((R[i] + wetR[i] * 0.55) * 1.1) * fade;
}

// WAV (IEEE float)
const data = Buffer.from(out.buffer);
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22);
h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34);
h.write("data", 36); h.writeUInt32LE(data.length, 40);
fs.writeFileSync(path.join(import.meta.dirname, "music.wav"), Buffer.concat([h, data]));
console.log("music.wav", DUR.toFixed(2), "s");
