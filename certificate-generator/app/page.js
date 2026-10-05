"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FileUpload from "@/components/FileUpload";
import SettingsForm from "@/components/SettingsForm";
import CertificatePreview from "@/components/CertificatePreview";
import { useLanguage } from "@/components/LanguageProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { LANGS, certDefaults } from "@/lib/i18n";
import { buildCertData, generateZip, generateCombinedPdf, downloadBlob } from "@/lib/generatePdfs";

const DEFAULT_SETTINGS = {
  template: "classic",
  font: "cairo",
  primaryColor: "#b08d3a",
  logo: null,
  ...certDefaults("ar"),
  idPrefix: "CERT-2026",
};

// نصوص الشهادة اللي بتتبدّل لما تتغيّر اللغة (إذا المستخدم ما عدّلها)
const CERT_TEXT_KEYS = ["title", "subtitle", "body", "course", "signerName", "signerTitle", "date", "dateLabel"];

export default function Home() {
  const { lang, setLang, t } = useLanguage();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [rows, setRows] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [progress, setProgress] = useState(null); // { done, total }

  // لما تتغيّر اللغة: أي نص بالشهادة لسا على القيمة الافتراضية بنترجمه،
  // وأي نص المستخدم كتبه بإيده بنتركه زي ما هو
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current === lang) return;
    const oldDefaults = certDefaults(prevLang.current);
    const newDefaults = certDefaults(lang);
    setSettings((s) => {
      const next = { ...s };
      for (const key of CERT_TEXT_KEYS) {
        if (s[key] === oldDefaults[key]) next[key] = newDefaults[key];
      }
      return next;
    });
    prevLang.current = lang;
  }, [lang]);

  const previewRow = rows[previewIndex] || { name: certDefaults(lang).sampleName, course: "" };
  const previewData = useMemo(
    () => buildCertData(previewRow, settings, previewIndex),
    [previewRow, settings, previewIndex]
  );

  async function handleGenerate(kind) {
    if (rows.length === 0) return;
    setProgress({ done: 0, total: rows.length });
    const onProgress = (done, total) => setProgress({ done, total });
    try {
      if (kind === "zip") {
        downloadBlob(await generateZip(rows, settings, onProgress), "certificates.zip");
      } else {
        downloadBlob(await generateCombinedPdf(rows, settings, onProgress), "certificates.pdf");
      }
    } finally {
      setProgress(null);
    }
  }

  const busy = progress !== null;

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">
            <span aria-hidden="true">🎓 </span>
            {t("appTitle")}
          </h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">{t("appDescription")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setLang(LANGS[lang].switchTo)}
            lang={LANGS[lang].switchTo}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600 dark:hover:bg-stone-800"
          >
            {LANGS[lang].switchLabel}
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* العمود الأول: الخطوات */}
        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-stone-900 dark:shadow-none dark:ring-1 dark:ring-stone-800">
            <h2 className="mb-3 text-lg font-bold">{t("step1")}</h2>
            <FileUpload
              onLoaded={({ rows }) => {
                setRows(rows);
                setPreviewIndex(0);
              }}
            />
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-stone-900 dark:shadow-none dark:ring-1 dark:ring-stone-800">
            <h2 className="mb-3 text-lg font-bold">{t("step2")}</h2>
            <SettingsForm settings={settings} onChange={setSettings} />
          </div>
        </section>

        {/* العمود الثاني: المعاينة والتنزيل */}
        <section className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <CertificatePreview data={previewData} />

          {rows.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-stone-900 dark:shadow-none dark:ring-1 dark:ring-stone-800">
              <button
                onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                disabled={previewIndex === 0}
                className="rounded-lg px-3 py-1 font-semibold hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-stone-800"
              >
                {t("prev")}
              </button>
              <span className="text-sm text-stone-600 dark:text-stone-400">
                {t("previewCounter", { current: previewIndex + 1, total: rows.length })} <b>{previewRow.name}</b>
              </span>
              <button
                onClick={() => setPreviewIndex((i) => Math.min(rows.length - 1, i + 1))}
                disabled={previewIndex === rows.length - 1}
                className="rounded-lg px-3 py-1 font-semibold hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-stone-800"
              >
                {t("next")}
              </button>
            </div>
          )}

          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-stone-900 dark:shadow-none dark:ring-1 dark:ring-stone-800">
            <h2 className="mb-3 text-lg font-bold">{t("step3")}</h2>
            {rows.length === 0 ? (
              <p className="text-stone-500 dark:text-stone-400">{t("uploadFirst")}</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleGenerate("zip")}
                  disabled={busy}
                  className="rounded-lg bg-amber-700 px-5 py-2.5 font-bold text-white hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-600 dark:text-stone-950 dark:hover:bg-amber-500"
                >
                  {t("downloadZip", { count: rows.length })}
                </button>
                <button
                  onClick={() => handleGenerate("pdf")}
                  disabled={busy}
                  className="rounded-lg border border-amber-700 px-5 py-2.5 font-bold text-amber-800 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/40"
                >
                  {t("downloadPdf")}
                </button>
              </div>
            )}

            {busy && (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    className="h-full bg-amber-600 transition-all"
                    style={{ width: `${(progress.done / progress.total) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  {t("generating", { done: progress.done, total: progress.total })}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
