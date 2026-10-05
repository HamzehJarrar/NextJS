// /brag composition for مولّد الشهادات.
// Every certificate on screen is drawn by the app's own lib/drawCertificate.js.
// renderFrame(t) is a pure function of t (seconds); render.mjs calls it per frame.
import { drawCertificate, ensureFontsLoaded, CERT_WIDTH, CERT_HEIGHT } from "/lib/drawCertificate.js";
import { certDefaults } from "/lib/i18n.js";

export const FPS = 30;
const BAR = (60 / 112) * 4; // 2.142857s
export const DURATION = BAR * 10; // 21.43s
const CUT = { hook: 0, reveal: BAR * 1.5, upload: BAR * 3, design: BAR * 5, download: BAR * 7, outro: BAR * 8.5 };

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const p = (t, start, dur) => clamp((t - start) / dur);
const outCubic = (k) => 1 - Math.pow(1 - k, 3);
const inCubic = (k) => k * k * k;
const inOutCubic = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const outBack = (k, s = 1.4) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const $ = (id) => document.getElementById(id);

function place(el, { x = 0, y = 0, s = 1, r = 0, o = 1 } = {}) {
  el.style.opacity = o;
  el.style.visibility = o <= 0.001 ? "hidden" : "visible";
  el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
}

// ---------- certificate data (same shape the app builds in generatePdfs.buildCertData) ----------
const AR = certDefaults("ar");
const BASE = {
  template: "classic", font: "cairo", primaryColor: "#b08d3a", logo: null,
  title: AR.title, subtitle: AR.subtitle, body: AR.body, course: AR.course,
  signerName: AR.signerName, signerTitle: AR.signerTitle, date: AR.date, dateLabel: AR.dateLabel, idPrefix: "CERT-2026",
};
function certData(row, settings, index) {
  return {
    ...settings,
    name: row.name,
    course: row.course || settings.course,
    certId: settings.idPrefix ? `${settings.idPrefix}-${String(index + 1).padStart(4, "0")}` : "",
  };
}
function certCanvas(data, width) {
  const full = document.createElement("canvas");
  full.width = CERT_WIDTH;
  full.height = CERT_HEIGHT;
  drawCertificate(full.getContext("2d"), data);
  const c = document.createElement("canvas");
  c.width = width * 2; // 2x for crispness when scaled
  c.height = Math.round((width * 2 * CERT_HEIGHT) / CERT_WIDTH);
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(full, 0, 0, c.width, c.height);
  c.className = "cert";
  c.style.width = `${width}px`;
  c.style.height = `${(width * CERT_HEIGHT) / CERT_WIDTH}px`;
  c.style.left = "0px";
  c.style.top = "0px";
  return c;
}

// real rows from public/sample-participants.xlsx, then more names for the hook stack
const SAMPLE = [
  { name: "سارة محمود", course: "" },
  { name: "محمد علي", course: "" },
  { name: "ليان يوسف", course: "تصميم واجهات المستخدم" },
  { name: "Omar Hassan", course: "" },
];
const HOOK_NAMES = ["ريم الخطيب", "Nour Haddad", "يزن عبدالله", "هبة سليمان", "Karim Nasser", "جود العلي", "محمد علي", "ليان يوسف", "Omar Hassan", "سارة محمود"];

// deterministic pseudo-random
const rand = (i, salt) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const els = {};
const DESIGN_STEPS = [
  { at: 0, template: "classic", primaryColor: "#b08d3a", font: "cairo", fontLabel: "Cairo" },
  { at: CUT.design + 0.84, template: "modern", primaryColor: "#b08d3a", font: "cairo", fontLabel: "Cairo", click: "tplmodern" },
  { at: CUT.design + 1.54, template: "modern", primaryColor: "#7a2e3a", font: "cairo", fontLabel: "Cairo", click: "colorSwatch" },
  { at: CUT.design + 2.24, template: "modern", primaryColor: "#7a2e3a", font: "amiri", fontLabel: "Amiri (نسخ)", click: "fontSelect" },
  { at: CUT.design + 2.94, template: "modern", primaryColor: "#7a2e3a", font: "aref-ruqaa", fontLabel: "Aref Ruqaa (رقعة)", click: "fontSelect" },
];
const FINAL_DESIGN = DESIGN_STEPS[DESIGN_STEPS.length - 1];

export async function setup() {
  await document.fonts.ready;
  for (const id of ["cairo", "amiri", "aref-ruqaa"]) await ensureFontsLoaded(id);
  await document.fonts.load('800 80px Cairo', "شهادة");
  await document.fonts.load('500 40px "IBM Plex Sans Arabic"', "ملف");
  await document.fonts.load('600 40px "IBM Plex Sans Arabic"', "ملف");

  // hook stack: the classic default certificate, one per name
  const hookBox = $("hookCards");
  els.hook = HOOK_NAMES.map((name, i) => {
    const c = certCanvas(certData({ name }, BASE, i), 900);
    hookBox.appendChild(c);
    return c;
  });

  // design variants for ليان يوسف (row 3, the one with her own course)
  const designBox = $("designCerts");
  els.design = DESIGN_STEPS.map((step) => {
    const c = certCanvas(certData(SAMPLE[2], { ...BASE, ...step }, 2), 980);
    designBox.appendChild(c);
    return c;
  });

  // output PDFs, rendered with the final design
  const thumbBox = $("thumbs");
  els.thumbs = SAMPLE.map((row, i) => {
    const wrap = document.createElement("div");
    wrap.className = "thumb";
    const c = certCanvas(certData(row, { ...BASE, ...FINAL_DESIGN }, i), 380);
    c.style.position = "relative";
    wrap.appendChild(c);
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = "PDF";
    wrap.appendChild(badge);
    const name = document.createElement("div");
    name.className = "fname";
    name.dir = "ltr";
    name.textContent = `${i + 1}-${row.name}.pdf`;
    wrap.appendChild(name);
    thumbBox.appendChild(wrap);
    return wrap;
  });

  // parsed rows
  const rowsBox = $("rows");
  els.rows = SAMPLE.map((row, i) => {
    const r = document.createElement("div");
    r.className = "row abs";
    r.innerHTML = `<span class="check">✓</span><span dir="auto">${row.name}</span><span class="id">CERT-2026-${String(i + 1).padStart(4, "0")}</span>`;
    rowsBox.appendChild(r);
    return r;
  });

  // reveal subtitle, word by word
  const sub = $("revealSub");
  els.subWords = "من ملف Excel… لشهادة PDF لكل واحد".split(" ").map((w) => {
    const s = document.createElement("span");
    s.textContent = w + " ";
    s.style.display = "inline-block";
    s.style.whiteSpace = "pre";
    sub.appendChild(s);
    return s;
  });

  // scaled real-UI cards: measure native size once
  els.upload = { el: $("uploadCard"), s: 1.85 };
  els.settings = { el: $("settingsCard"), s: 1.55 };
  els.download = { el: $("downloadCard"), s: 1.75 };
  els.controls = { el: $("outroControls"), s: 2.0 };
  for (const k of ["upload", "settings", "download", "controls"]) {
    els[k].w = els[k].el.offsetWidth * els[k].s;
    els[k].h = els[k].el.offsetHeight * els[k].s;
  }
  window.__ready = true;
}

// screen-space center of an element inside a scaled card, given that card's current translate
function centerIn(card, id, cx, cy) {
  const el = $(id);
  const box = card.el.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  // positions relative to card's top-left, in screen units at the card's scale
  const relX = (r.left + r.width / 2 - box.left) / (box.width / card.w);
  const relY = (r.top + r.height / 2 - box.top) / (box.height / card.h);
  return [cx + relX, cy + relY];
}

function setTemplateButtons(active) {
  for (const id of ["classic", "modern", "minimal"]) {
    const b = $(`tpl${id}`);
    const on = id === active;
    b.classList.toggle("border-amber-600", on);
    b.classList.toggle("bg-amber-50", on);
    b.classList.toggle("text-amber-800", on);
    b.classList.toggle("border-stone-300", !on);
    b.classList.toggle("bg-white", !on);
  }
}

// cursor path helper: list of [time, x, y]; returns position at t
function cursorAt(t, keys) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, x0, y0] = keys[i - 1];
      const [t1, x1, y1] = keys[i];
      const k = inOutCubic((t - t0) / (t1 - t0));
      return [lerp(x0, x1, k), lerp(y0, y1, k) - Math.sin(k * Math.PI) * 40];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
}

export function renderFrame(t) {
  const show = (id, on) => ($(id).style.display = on ? "block" : "none");
  show("s1", t < CUT.reveal + 0.2);
  show("s2", t >= CUT.reveal - 0.1 && t < CUT.upload + 0.1);
  show("s3", t >= CUT.upload - 0.1 && t < CUT.design + 0.1);
  show("s4", t >= CUT.design - 0.1 && t < CUT.download + 0.1);
  show("s5", t >= CUT.download - 0.1 && t < CUT.outro + 0.1);
  show("s6", t >= CUT.outro - 0.1);

  let cursor = null; // [x, y]
  let ripple = null; // [x, y, k]
  const click = (at, xy) => {
    const k = p(t, at, 0.35);
    if (k > 0 && k < 1) ripple = [xy[0], xy[1], k];
  };

  // ---------------- 1 · HOOK ----------------
  if (t < CUT.reveal + 0.2) {
    const N = els.hook.length;
    const exit = p(t, CUT.reveal - 0.3, 0.45);
    els.hook.forEach((c, i) => {
      const arrive = 0.08 + 1.55 * Math.sqrt(i / (N - 1));
      const k = p(t, arrive, 0.38);
      const last = i === N - 1;
      const rx = last ? 0 : (rand(i, 1) - 0.5) * 90;
      const ry = last ? 0 : (rand(i, 2) - 0.5) * 40;
      const rr = last ? -1.2 : (rand(i, 3) - 0.5) * 10;
      const fromX = (rand(i, 4) - 0.5) * 900;
      const e = outBack(k, 1.1);
      const ex = inCubic(clamp(exit * 1.6 - (N - 1 - i) * 0.04));
      place(c, {
        x: 960 - 450 + lerp(fromX, rx, e),
        y: 700 - 318 + lerp(900, ry, e) + ex * 1100,
        r: lerp(rr + 24 * Math.sign(fromX || 1), rr, e) + ex * 8,
        o: k > 0 ? 1 : 0,
      });
    });
    const h1 = outCubic(p(t, 0.25, 0.4));
    const h2 = outCubic(p(t, 0.95, 0.4));
    const ho = 1 - outCubic(p(t, CUT.reveal - 0.3, 0.3));
    place($("hook1"), { y: lerp(40, 0, h1) - (1 - ho) * 40, o: h1 * ho });
    place($("hook2"), { y: lerp(40, 0, h2) - (1 - ho) * 40, o: h2 * ho });
  }

  // ---------------- 2 · REVEAL ----------------
  if (t >= CUT.reveal - 0.1 && t < CUT.upload + 0.1) {
    const t0 = CUT.reveal;
    const out = outCubic(p(t, CUT.upload - 0.3, 0.3));
    const k = p(t, t0 + 0.08, 0.5);
    place($("revealTitle"), { s: lerp(0.9, 1, outBack(k, 1.6)), y: -out * 50, o: clamp(k * 2.5) * (1 - out) });
    const lk = outCubic(p(t, t0 + 0.45, 0.4));
    $("revealLine").style.transform = `scaleX(${lk})`;
    $("revealLine").style.opacity = 1 - out;
    els.subWords.forEach((w, i) => {
      const wk = outCubic(p(t, t0 + 0.3 + i * 0.07, 0.35));
      w.style.opacity = wk * (1 - out);
      w.style.transform = `translateY(${lerp(26, 0, wk) - out * 50}px)`;
    });
  }

  // ---------------- 3 · UPLOAD ----------------
  if (t >= CUT.upload - 0.1 && t < CUT.design + 0.1) {
    const t0 = CUT.upload;
    const out = inCubic(p(t, CUT.design - 0.3, 0.32));
    const card = els.upload;
    const cIn = outCubic(p(t, t0 + 0.02, 0.4));
    const cx = 1920 - 130 - card.w + (1 - cIn) * 90;
    const cy = 540 - card.h / 2;
    place(card.el, { x: cx - out * 260, y: cy, s: card.s, o: cIn * (1 - out) });

    const zone = centerIn(card, "dropZone", cx, cy);
    const tGrab = t0 + 0.5, tDrop = t0 + 1.55;
    const chip = $("fileChip");
    const chipW = chip.offsetWidth, chipH = chip.offsetHeight;
    const start = [420, 880];
    const ck = inOutCubic(p(t, tGrab + 0.15, tDrop - tGrab - 0.15));
    const chipX = lerp(start[0], zone[0], ck);
    const chipY = lerp(start[1], zone[1], ck) - Math.sin(ck * Math.PI) * 90;
    const dropK = p(t, tDrop, 0.22);
    const chipIn = outCubic(p(t, t0 + 0.25, 0.3));
    place(chip, {
      x: chipX - chipW / 2,
      y: chipY - chipH / 2,
      s: lerp(1, 0.4, inCubic(dropK)) * lerp(1, 1.06, Math.sin(clamp(ck) * Math.PI)),
      r: lerp(-4, 0, ck),
      o: chipIn * (1 - dropK),
    });
    const over = t > tDrop - 0.4 && t < tDrop + 0.05;
    const dz = $("dropZone");
    dz.classList.toggle("border-amber-600", over);
    dz.classList.toggle("bg-amber-50", over);
    dz.classList.toggle("border-stone-300", !over);
    dz.classList.toggle("bg-white", !over);
    $("dropText").textContent = t >= tDrop + 0.05 ? "تم تحميل: sample-participants.xlsx" : "اسحب ملف Excel أو CSV هون، أو اضغط لتختار";

    if (t < tDrop + 0.5) {
      const pre = cursorAt(t, [[t0 + 0.2, 760, 1000], [tGrab, start[0] + 40, start[1] + 10]]);
      cursor = t < tGrab ? pre : [chipX + 40, chipY + 10];
      if (t > tDrop) cursor = [zone[0] + 40 + (t - tDrop) * 220, zone[1] + 10 + (t - tDrop) * 260];
    }
    click(tGrab, [start[0] + 40, start[1] + 10]);

    els.rows.forEach((r, i) => {
      const rk = outCubic(p(t, tDrop + 0.3 + i * 0.16, 0.38));
      const ro = inCubic(clamp(out * 1.4 - i * 0.08));
      place(r, { x: 110 + lerp(120, 0, rk) - ro * 300, y: 300 + i * 130, o: rk * (1 - ro) });
    });
  }

  // ---------------- 4 · DESIGN ----------------
  if (t >= CUT.design - 0.1 && t < CUT.download + 0.1) {
    const t0 = CUT.design;
    const out = inCubic(p(t, CUT.download - 0.3, 0.32));
    const inK = outCubic(p(t, t0 + 0.02, 0.42));
    const certX = 110, certY = 560 - 693 / 2 + 40;
    let active = 0;
    DESIGN_STEPS.forEach((s, i) => { if (t >= s.at) active = i; });
    els.design.forEach((c, i) => {
      let o = 0;
      if (i === active) o = 1;
      if (i === active && i > 0) o = outCubic(p(t, DESIGN_STEPS[i].at, 0.06));
      if (i === active - 1) o = 1;
      const bump = i === active && i > 0 ? Math.sin(p(t, DESIGN_STEPS[i].at, 0.3) * Math.PI) * 0.012 : 0;
      place(c, { x: certX - out * 200, y: certY + (1 - inK) * 60, s: 1 + bump, o: o * inK * (1 - out) });
      c.style.zIndex = i === active ? 2 : 1;
    });
    const capK = outCubic(p(t, t0 + 0.2, 0.4));
    place($("designCaption"), { y: lerp(30, 0, capK), o: capK * (1 - out) });

    const card = els.settings;
    const cx = 1920 - 110 - card.w + (1 - inK) * 90;
    const cy = certY + 40;
    place(card.el, { x: cx + out * 200, y: cy, s: card.s, o: inK * (1 - out) });
    const step = DESIGN_STEPS[active];
    setTemplateButtons(step.template);
    $("fontValue").textContent = step.fontLabel;
    $("colorFill").style.background = step.primaryColor;

    // cursor visits each control just before its change
    const keys = [[t0 + 0.4, 1500, 1040]];
    DESIGN_STEPS.slice(1).forEach((s) => {
      const [x, y] = centerIn(card, s.click, cx, cy);
      keys.push([s.at - 0.32, x + 10, y + 6], [s.at, x + 10, y + 6]);
    });
    if (t > t0 + 0.3 && t < CUT.download - 0.2) cursor = cursorAt(t, keys);
    DESIGN_STEPS.slice(1).forEach((s) => click(s.at, centerIn(card, s.click, cx, cy)));
  }

  // ---------------- 5 · DOWNLOAD ----------------
  if (t >= CUT.download - 0.1 && t < CUT.outro + 0.1) {
    const t0 = CUT.download;
    const out = inCubic(p(t, CUT.outro - 0.3, 0.32));
    const card = els.download;
    const inK = outCubic(p(t, t0 + 0.02, 0.4));
    const cx = 960 - card.w / 2;
    const cy = 90 + (1 - inK) * 50;
    place(card.el, { x: cx, y: cy - out * 120, s: card.s, o: inK * (1 - out) });

    const tClick = t0 + 0.72;
    const zip = centerIn(card, "zipBtn", cx, cy);
    if (t < tClick + 0.6) cursor = cursorAt(t, [[t0 + 0.25, 1300, 1000], [tClick, zip[0] + 30, zip[1] + 8]]);
    click(tClick, zip);
    const press = Math.sin(p(t, tClick, 0.16) * Math.PI);
    $("zipBtn").style.transform = `scale(${1 - press * 0.04})`;

    const doneTimes = [0, 1, 2, 3].map((i) => tClick + 0.32 + i * 0.26);
    const done = doneTimes.filter((d) => t >= d).length;
    const started = t >= tClick + 0.08;
    $("progressWrap").style.visibility = started ? "visible" : "hidden";
    const barK = clamp((t - (tClick + 0.08)) / (doneTimes[3] - tClick - 0.08));
    $("progressBar").style.width = `${barK * 100}%`;
    $("progressText").textContent = `عم نجهّز ${done} من 4…`;

    els.thumbs.forEach((th, i) => {
      const k = p(t, doneTimes[i], 0.36);
      const x = 960 - (4 * 380 + 3 * 46) / 2 + (3 - i) * (380 + 46); // RTL order: first file on the right
      const ro = inCubic(clamp(out * 1.4 - i * 0.06));
      place(th, { x, y: 560 + lerp(80, 0, outBack(k, 1.5)) + ro * 260, s: lerp(0.85, 1, outBack(k, 1.5)), o: clamp(k * 3) * (1 - ro) });
    });
  }

  // ---------------- 6 · OUTRO ----------------
  if (t >= CUT.outro - 0.1) {
    const t0 = CUT.outro;
    const k = p(t, t0 + 0.05, 0.5);
    place($("outroTitle"), { s: lerp(0.92, 1, outBack(k, 1.5)), o: clamp(k * 2.5) });
    $("outroLine").style.transform = `scaleX(${outCubic(p(t, t0 + 0.35, 0.4))})`;
    const sk = outCubic(p(t, t0 + 0.4, 0.4));
    place($("outroSub"), { y: lerp(26, 0, sk), o: sk });
    const ctl = els.controls;
    const ck = outCubic(p(t, t0 + 0.75, 0.4));
    place(ctl.el, { x: 960 - ctl.w / 2, y: 680 + lerp(26, 0, ck), s: ctl.s, o: ck });
  }

  // ---------------- cursor + click ripple ----------------
  if (cursor) place($("cursor"), { x: cursor[0], y: cursor[1] });
  else $("cursor").style.visibility = "hidden";
  if (ripple) place($("ripple"), { x: ripple[0], y: ripple[1], s: lerp(0.3, 1.3, outCubic(ripple[2])), o: 1 - ripple[2] });
  else $("ripple").style.visibility = "hidden";
}

window.renderFrame = renderFrame;
window.DURATION = DURATION;
window.FPS = FPS;
setup();
