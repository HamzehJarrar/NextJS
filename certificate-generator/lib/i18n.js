// كل نصوص الواجهة بالعربي والإنجليزي.
// لإضافة نص جديد: ضيف نفس المفتاح بـ ar و en، واستخدمه بـ t("key").

export const LANGS = {
  ar: { dir: "rtl", locale: "ar-EG", switchLabel: "English", switchTo: "en" },
  en: { dir: "ltr", locale: "en-GB", switchLabel: "العربية", switchTo: "ar" },
};

export const DICT = {
  ar: {
    appTitle: "مولّد الشهادات",
    appDescription: "ارفع ملف الأسماء، صمّم الشهادة، ونزّل شهادة لكل مشارك بضغطة وحدة.",

    theme: "المظهر",
    "theme.light": "فاتح",
    "theme.dark": "داكن",
    "theme.system": "تلقائي",

    step1: "1. ملف المشاركين",
    step2: "2. تصميم الشهادة",
    step3: "3. التنزيل",

    prev: "→ السابق",
    next: "التالي ←",
    previewCounter: "{current} من {total}:",

    uploadFirst: "ارفع ملف المشاركين أول عشان تقدر تنزّل الشهادات.",
    downloadZip: "ZIP: ملف PDF لكل واحد ({count})",
    downloadPdf: "PDF واحد للطباعة",
    generating: "عم نجهّز {done} من {total}…",

    dropHint: "اسحب ملف Excel أو CSV هون، أو اضغط لتختار",
    fileLoaded: "تم تحميل: {name}",
    nameColumnHint: "لازم يكون فيه عمود اسمه “الاسم” أو “name”",
    sampleFile: "نزّل ملف مثال",
    errNoNames: "ما لقينا أسماء بالملف",
    errEmptyFile: "الملف فاضي أو ما فيه صفوف",
    errReadFile: "صار خطأ بقراءة الملف",

    template: "القالب",
    "template.classic": "كلاسيكي",
    "template.modern": "عصري",
    "template.minimal": "بسيط",
    certFont: "خط الشهادة",
    certFontHint: "بيتغيّر بالمعاينة والـ PDF",
    "fontStyle.kufi": "كوفي",
    "fontStyle.naskh": "نسخ",
    "fontStyle.ruqaa": "رقعة",
    "fontStyle.system": "خط النظام",
    color: "اللون",
    logo: "اللوغو (اختياري)",
    removeLogo: "شيل اللوغو",
    fieldTitle: "عنوان الشهادة",
    fieldSubtitle: "السطر فوق الاسم",
    fieldBody: "النص تحت الاسم",
    fieldBodyHint: "استخدم {course} لاسم الدورة و {date} للتاريخ",
    fieldCourse: "اسم الدورة",
    fieldCourseHint: "إذا الملف فيه عمود للدورة، بنستخدمه بداله",
    fieldSignerName: "اسم الموقّع",
    fieldSignerTitle: "صفة الموقّع",
    fieldDate: "التاريخ",
    fieldDateLabel: "كلمة “التاريخ” عالشهادة",
    fieldIdPrefix: "بادئة رقم الشهادة",
    fieldIdPrefixHint: "مثلاً CERT-2026 (فاضي = بدون رقم)",
  },

  en: {
    appTitle: "Certificate Generator",
    appDescription: "Upload a list of names, design the certificate, and download one for every participant in one click.",

    theme: "Appearance",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",

    step1: "1. Participants file",
    step2: "2. Certificate design",
    step3: "3. Download",

    prev: "← Previous",
    next: "Next →",
    previewCounter: "{current} of {total}:",

    uploadFirst: "Upload the participants file first to download certificates.",
    downloadZip: "ZIP: one PDF per person ({count})",
    downloadPdf: "Single PDF for printing",
    generating: "Preparing {done} of {total}…",

    dropHint: "Drag an Excel or CSV file here, or click to choose",
    fileLoaded: "Loaded: {name}",
    nameColumnHint: "It needs a column called “name” or “الاسم”",
    sampleFile: "Download a sample file",
    errNoNames: "No names found in the file",
    errEmptyFile: "The file is empty or has no rows",
    errReadFile: "Couldn't read the file. Check it's a valid .xlsx, .xls or .csv",

    template: "Template",
    "template.classic": "Classic",
    "template.modern": "Modern",
    "template.minimal": "Minimal",
    certFont: "Certificate font",
    certFontHint: "Applies to the preview and the PDF",
    "fontStyle.kufi": "Kufi",
    "fontStyle.naskh": "Naskh",
    "fontStyle.ruqaa": "Ruqaa",
    "fontStyle.system": "system font",
    color: "Color",
    logo: "Logo (optional)",
    removeLogo: "Remove logo",
    fieldTitle: "Certificate title",
    fieldSubtitle: "Line above the name",
    fieldBody: "Text below the name",
    fieldBodyHint: "Use {course} for the course name and {date} for the date",
    fieldCourse: "Course name",
    fieldCourseHint: "If the file has a course column, that's used instead",
    fieldSignerName: "Signer name",
    fieldSignerTitle: "Signer title",
    fieldDate: "Date",
    fieldDateLabel: "“Date” label on the certificate",
    fieldIdPrefix: "Certificate ID prefix",
    fieldIdPrefixHint: "e.g. CERT-2026 (empty = no ID)",
  },
};

// بيرجع النص المترجم وبيعبّي المتغيرات زي {count}
export function translate(lang, key, vars = {}) {
  const text = DICT[lang]?.[key] ?? DICT.ar[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
}

// نصوص الشهادة الافتراضية بكل لغة
export function certDefaults(lang) {
  const date = new Date().toLocaleDateString(LANGS[lang].locale, { year: "numeric", month: "long", day: "numeric" });
  if (lang === "en") {
    return {
      title: "Certificate of Appreciation",
      subtitle: "This certificate is proudly presented to",
      body: "for successfully completing the {course} course",
      course: "Web Development with Next.js",
      signerName: "Ahmad Khaled",
      signerTitle: "Program Director",
      date,
      dateLabel: "Date",
      sampleName: "Participant Name",
    };
  }
  return {
    title: "شهادة تقدير",
    subtitle: "تُمنح هذه الشهادة إلى",
    body: "وذلك لإتمامه بنجاح دورة {course}",
    course: "تطوير الويب باستخدام Next.js",
    signerName: "أحمد خالد",
    signerTitle: "مدير البرنامج",
    date,
    dateLabel: "التاريخ",
    sampleName: "اسم المشارك",
  };
}
