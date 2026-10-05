"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { THEME_STORAGE_KEY as STORAGE_KEY, THEME_OPTIONS as OPTIONS, applyTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState("system");

  // نرجع آخر اختيار محفوظ
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (OPTIONS.includes(saved)) setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}

    // بوضع "تلقائي": إذا غيّر المستخدم وضع الجهاز، الموقع بيتغيّر معه
    if (theme !== "system") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <div
      role="radiogroup"
      aria-label={t("theme")}
      className="flex shrink-0 rounded-lg border border-stone-300 bg-white p-0.5 text-sm dark:border-stone-700 dark:bg-stone-900"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={theme === option}
          onClick={() => setTheme(option)}
          className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
            theme === option
              ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          }`}
        >
          {t(`theme.${option}`)}
        </button>
      ))}
    </div>
  );
}
