// منطق الوضع الفاتح/الداكن. بملف عادي (مش "use client") عشان الـ layout
// (server component) يقدر يستورد themeInitScript كنص.

export const THEME_STORAGE_KEY = "theme";
export const THEME_OPTIONS = ["light", "dark", "system"];

export function applyTheme(theme) {
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

// بيشتغل بالـ <head> قبل ما الصفحة تنرسم، عشان ما يصير وميض أبيض
// لما يكون المستخدم مختار الوضع الداكن. لازم يضل نفس منطق applyTheme فوق.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
