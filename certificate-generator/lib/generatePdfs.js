import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { drawCertificate, ensureFontsLoaded, CERT_WIDTH, CERT_HEIGHT } from "./drawCertificate";

// مقاس A4 بالعرض بوحدة PDF (points)
const PAGE_W = 842;
const PAGE_H = 595;

// بيجمع إعدادات الشهادة مع بيانات المشارك
export function buildCertData(row, settings, index) {
  return {
    ...settings,
    name: row.name,
    course: row.course || settings.course,
    certId: settings.idPrefix
      ? `${settings.idPrefix}-${String(index + 1).padStart(4, "0")}`
      : "",
  };
}

function canvasToPng(canvas) {
  return new Promise((resolve) =>
    canvas.toBlob(async (blob) => resolve(new Uint8Array(await blob.arrayBuffer())), "image/png")
  );
}

async function renderPng(data) {
  const canvas = document.createElement("canvas");
  canvas.width = CERT_WIDTH;
  canvas.height = CERT_HEIGHT;
  drawCertificate(canvas.getContext("2d"), data);
  return canvasToPng(canvas);
}

async function addPage(pdf, png) {
  const image = await pdf.embedPng(png);
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  page.drawImage(image, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
}

function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "").trim() || "certificate";
}

// ملف ZIP فيه PDF منفصل لكل مشارك
export async function generateZip(rows, settings, onProgress) {
  await ensureFontsLoaded(settings.font);
  const zip = new JSZip();

  for (let i = 0; i < rows.length; i++) {
    const data = buildCertData(rows[i], settings, i);
    const pdf = await PDFDocument.create();
    await addPage(pdf, await renderPng(data));
    zip.file(`${i + 1}-${safeFileName(rows[i].name)}.pdf`, await pdf.save());
    onProgress?.(i + 1, rows.length);
  }

  return zip.generateAsync({ type: "blob" });
}

// ملف PDF واحد، كل شهادة بصفحة (مناسب للطباعة)
export async function generateCombinedPdf(rows, settings, onProgress) {
  await ensureFontsLoaded(settings.font);
  const pdf = await PDFDocument.create();

  for (let i = 0; i < rows.length; i++) {
    await addPage(pdf, await renderPng(buildCertData(rows[i], settings, i)));
    onProgress?.(i + 1, rows.length);
  }

  return new Blob([await pdf.save()], { type: "application/pdf" });
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
