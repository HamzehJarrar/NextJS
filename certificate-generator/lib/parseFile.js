import * as XLSX from "xlsx";

// أسماء الأعمدة اللي بنتعرف عليها تلقائياً (عربي وإنجليزي)
const NAME_KEYS = ["name", "full name", "fullname", "الاسم", "اسم", "الاسم الكامل", "اسم المشارك"];
const EMAIL_KEYS = ["email", "e-mail", "mail", "الايميل", "الإيميل", "البريد", "البريد الإلكتروني", "البريد الالكتروني"];
const COURSE_KEYS = ["course", "الدورة", "الكورس", "البرنامج", "اسم الدورة"];

function findKey(headers, keys) {
  return headers.find((h) => keys.includes(String(h).trim().toLowerCase()));
}

// بتقرأ ملف Excel أو CSV وبترجع قائمة المشاركين
export async function parseParticipants(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", codepage: 65001 });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (raw.length === 0) {
    // بنرمي مفتاح الترجمة بدل النص، والواجهة بتترجمه للغة الحالية
    throw new Error("errEmptyFile");
  }

  const headers = Object.keys(raw[0]);
  // إذا ما لقينا عمود اسمه "الاسم"، بناخد أول عمود
  const nameKey = findKey(headers, NAME_KEYS) ?? headers[0];
  const emailKey = findKey(headers, EMAIL_KEYS);
  const courseKey = findKey(headers, COURSE_KEYS);

  const rows = raw
    .map((r) => ({
      name: String(r[nameKey] ?? "").trim(),
      email: emailKey ? String(r[emailKey] ?? "").trim() : "",
      course: courseKey ? String(r[courseKey] ?? "").trim() : "",
    }))
    .filter((r) => r.name);

  return { rows, columns: { nameKey, emailKey, courseKey } };
}
