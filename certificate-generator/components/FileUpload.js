"use client";

import { useState } from "react";
import { parseParticipants } from "@/lib/parseFile";
import { useLanguage } from "@/components/LanguageProvider";

// أخطاء بنعرف نترجمها؛ أي خطأ غيرها (مثلاً ملف تالف) بيطلع رسالة عامة
const KNOWN_ERRORS = ["errEmptyFile", "errNoNames"];

export default function FileUpload({ onLoaded }) {
  const { t } = useLanguage();
  const [error, setError] = useState(""); // مفتاح ترجمة، عشان يتغيّر مع اللغة
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setError("");
    try {
      const result = await parseParticipants(file);
      if (result.rows.length === 0) throw new Error("errNoNames");
      setFileName(file.name);
      onLoaded(result);
    } catch (e) {
      setError(KNOWN_ERRORS.includes(e.message) ? e.message : "errReadFile");
    }
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
          dragging
            ? "border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/40"
            : "border-stone-300 hover:border-stone-400 bg-white dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-500"
        }`}
      >
        <span className="text-3xl" aria-hidden="true">📄</span>
        <span className="font-semibold">
          {fileName ? t("fileLoaded", { name: fileName }) : t("dropHint")}
        </span>
        <span className="text-sm text-stone-500 dark:text-stone-400">{t("nameColumnHint")}</span>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{t(error)}</p>}

      <a href="/sample-participants.xlsx" download className="mt-2 inline-block text-sm text-amber-700 underline dark:text-amber-400">
        {t("sampleFile")}
      </a>
    </div>
  );
}
