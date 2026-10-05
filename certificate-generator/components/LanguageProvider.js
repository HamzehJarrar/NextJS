"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LANGS, translate } from "@/lib/i18n";

const LanguageContext = createContext(null);
const STORAGE_KEY = "lang";

// بيمسك لغة الموقع، وبيغيّر اتجاه الصفحة (rtl/ltr) وبيحفظ الاختيار بالمتصفح
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("ar");

  // أول ما الصفحة تفتح، بنرجع آخر لغة اختارها المستخدم
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved in LANGS) setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
    document.title = translate(lang, "appTitle");
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const t = (key, vars) => translate(lang, key, vars);

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
