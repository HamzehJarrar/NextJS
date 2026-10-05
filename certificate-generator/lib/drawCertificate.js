// هاد الملف مسؤول عن رسم الشهادة على canvas.
// بنرسم على canvas (مش مباشرة على PDF) لأنه المتصفح بيعرف يرسم العربي صح
// (الحروف المتصلة واتجاه الكتابة)، وبعدين بنحط الصورة جوّا الـ PDF.

export const CERT_WIDTH = 2000;
export const CERT_HEIGHT = 1414; // نفس نسبة A4 بالعرض

// الخطوط اللي بيقدر المستخدم يختار منها للشهادة.
// weights: الأوزان الموجودة فعلاً بالخط (إذا طلبنا وزن مش موجود، Google بيرجع خطأ)
// style: نوع الخط (بيترجم بالواجهة من lib/i18n.js)
// system: خط موجود على الجهاز، ما بنحمّله من Google
export const FONTS = [
  { id: "cairo", label: "Cairo", family: "Cairo", weights: [400, 700, 800] },
  { id: "tajawal", label: "Tajawal", family: "Tajawal", weights: [400, 700, 800] },
  { id: "almarai", label: "Almarai", family: "Almarai", weights: [400, 700, 800] },
  { id: "noto-kufi", label: "Noto Kufi", family: "Noto Kufi Arabic", weights: [400, 700, 800], style: "kufi" },
  { id: "changa", label: "Changa", family: "Changa", weights: [400, 700, 800] },
  { id: "el-messiri", label: "El Messiri", family: "El Messiri", weights: [400, 700] },
  { id: "reem-kufi", label: "Reem Kufi", family: "Reem Kufi", weights: [400, 700], style: "kufi" },
  { id: "amiri", label: "Amiri", family: "Amiri", weights: [400, 700], style: "naskh" },
  { id: "noto-naskh", label: "Noto Naskh", family: "Noto Naskh Arabic", weights: [400, 700], style: "naskh" },
  { id: "aref-ruqaa", label: "Aref Ruqaa", family: "Aref Ruqaa", weights: [400, 700], style: "ruqaa" },
  { id: "arial", label: "Arial", family: "Arial", weights: [400, 700], style: "system", system: true },
  { id: "times", label: "Times New Roman", family: "Times New Roman", weights: [400, 700], style: "system", system: true },
];

const getFont = (id) => FONTS.find((f) => f.id === id) || FONTS[0];

// اسم الخط المختار، وبعده Cairo وخطوط النظام كاحتياط
const fontStack = (id) => `"${getFont(id).family}", Cairo, 'Segoe UI', Tahoma, sans-serif`;

// أسماء القوالب بتنترجم بالواجهة: template.classic ...
export const TEMPLATES = [{ id: "classic" }, { id: "modern" }, { id: "minimal" }];

const isArabic = (text) => /[؀-ۿ]/.test(text);

// بيعبّي المتغيرات زي {name} و {course} بالقيم الحقيقية
export function fillPlaceholders(text, data) {
  return (text || "")
    .replaceAll("{name}", data.name || "")
    .replaceAll("{course}", data.course || "")
    .replaceAll("{date}", data.date || "");
}

function drawText(ctx, text, x, y, { size, weight = 400, color, maxWidth, font }) {
  if (!text) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = isArabic(text) ? "rtl" : "ltr";

  // إذا النص طويل، بنصغّر الخط لحد ما يزبط بالمساحة
  let fontSize = size;
  ctx.font = `${weight} ${fontSize}px ${font}`;
  while (maxWidth && ctx.measureText(text).width > maxWidth && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `${weight} ${fontSize}px ${font}`;
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

function line(ctx, x1, y1, x2, y2, color, width = 3) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// ---------- خلفيات القوالب ----------

function drawClassicBackground(ctx, color) {
  const W = CERT_WIDTH;
  const H = CERT_HEIGHT;
  ctx.fillStyle = "#fdfaf3";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = color;
  ctx.lineWidth = 22;
  ctx.strokeRect(45, 45, W - 90, H - 90);

  ctx.lineWidth = 4;
  ctx.strokeRect(90, 90, W - 180, H - 180);

  // زخرفة صغيرة بالزوايا
  ctx.fillStyle = color;
  for (const [x, y] of [
    [90, 90],
    [W - 90, 90],
    [90, H - 90],
    [W - 90, H - 90],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-18, -18, 36, 36);
    ctx.restore();
  }
}

function drawModernBackground(ctx, color) {
  const W = CERT_WIDTH;
  const H = CERT_HEIGHT;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // شكل مائل فوق
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(W, 0);
  ctx.lineTo(W - 520, 0);
  ctx.lineTo(W, 360);
  ctx.closePath();
  ctx.fill();

  // نفس الشكل تحت بشفافية
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(620, H);
  ctx.lineTo(0, H - 440);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // خط جانبي رفيع
  ctx.fillRect(W - 40, 360, 12, H - 460);
}

function drawMinimalBackground(ctx, color) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CERT_WIDTH, CERT_HEIGHT);
  ctx.fillStyle = color;
  ctx.fillRect(CERT_WIDTH / 2 - 120, 0, 240, 18);
}

const BACKGROUNDS = {
  classic: drawClassicBackground,
  modern: drawModernBackground,
  minimal: drawMinimalBackground,
};

// ---------- الدالة الرئيسية ----------

export function drawCertificate(ctx, data) {
  const W = CERT_WIDTH;
  const cx = W / 2;
  const color = data.primaryColor || "#b08d3a";
  const dark = "#1f2937";
  const gray = "#6b7280";
  const font = fontStack(data.font);
  const write = (text, x, y, opts) => drawText(ctx, text, x, y, { ...opts, font });

  (BACKGROUNDS[data.template] || drawClassicBackground)(ctx, color);

  // اللوغو (اختياري)
  let y = 230;
  if (data.logo) {
    const h = 150;
    const w = (data.logo.width / data.logo.height) * h;
    ctx.drawImage(data.logo, cx - w / 2, 120, w, h);
    y = 340;
  }

  write(data.title, cx, y + 60, {
    size: 110,
    weight: 800,
    color: data.template === "minimal" ? dark : color,
    maxWidth: 1600,
  });

  if (data.template === "minimal") {
    line(ctx, cx - 160, y + 150, cx + 160, y + 150, color, 4);
  }

  write(fillPlaceholders(data.subtitle, data), cx, y + 220, {
    size: 44,
    color: gray,
    maxWidth: 1500,
  });

  write(data.name, cx, y + 360, {
    size: 120,
    weight: 700,
    color: dark,
    maxWidth: 1500,
  });
  line(ctx, cx - 480, y + 450, cx + 480, y + 450, color, 3);

  write(fillPlaceholders(data.body, data), cx, y + 540, {
    size: 46,
    color: dark,
    maxWidth: 1500,
  });

  // التاريخ والتوقيع تحت
  const bottomY = 1150;
  const leftX = 480;
  const rightX = W - 480;

  // التوقيع (يمين)
  line(ctx, rightX - 220, bottomY - 30, rightX + 220, bottomY - 30, gray, 2);
  write(data.signerName, rightX, bottomY + 20, { size: 40, weight: 700, color: dark, maxWidth: 500 });
  write(data.signerTitle, rightX, bottomY + 75, { size: 32, color: gray, maxWidth: 500 });

  // التاريخ (يسار)
  line(ctx, leftX - 220, bottomY - 30, leftX + 220, bottomY - 30, gray, 2);
  write(data.date, leftX, bottomY + 20, { size: 40, weight: 700, color: dark, maxWidth: 500 });
  write(data.dateLabel, leftX, bottomY + 75, { size: 32, color: gray });

  // رقم الشهادة
  if (data.certId) {
    write(data.certId, cx, 1290, { size: 26, color: gray });
  }
}

// بنحمّل ملف CSS تبع الخط من Google Fonts مرة وحدة بس، أول ما المستخدم يختاره
const fontCssRequests = {};

function loadFontCss(font) {
  if (!fontCssRequests[font.id]) {
    fontCssRequests[font.id] = new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.family.replaceAll(" ", "+")}:wght@${font.weights.join(";")}&display=swap`;
      link.onload = resolve;
      link.onerror = resolve; // إذا فشل، بنكمل بالخط الاحتياطي
      document.head.appendChild(link);
    });
  }
  return fontCssRequests[font.id];
}

// بتتأكد إنه الخط المختار تحمّل قبل ما نرسم، وإلا رح يطلع الخط الافتراضي.
// بنمرّر نص عربي لـ load لأنه Google بيقسم الخط لملفات حسب اللغة،
// وبدون النص ممكن يتحمّل الجزء اللاتيني بس.
export async function ensureFontsLoaded(fontId) {
  if (typeof document === "undefined" || !document.fonts) return;
  const font = getFont(fontId);
  if (font.system) return;
  await loadFontCss(font);
  await Promise.all(
    font.weights.map((w) => document.fonts.load(`${w} 40px "${font.family}"`, "شهادة Certificate 0123"))
  ).catch(() => {});
}
