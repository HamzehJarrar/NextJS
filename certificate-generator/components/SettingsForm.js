"use client";

import { TEMPLATES, FONTS } from "@/lib/drawCertificate";
import { useLanguage } from "@/components/LanguageProvider";

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-600 dark:border-stone-700 dark:bg-stone-950 dark:focus:border-amber-500"
      />
      {hint && <span className="text-xs text-stone-500 dark:text-stone-400">{hint}</span>}
    </label>
  );
}

export default function SettingsForm({ settings, onChange }) {
  const { t } = useLanguage();
  const set = (key) => (e) => onChange({ ...settings, [key]: e.target.value });

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => onChange({ ...settings, logo: img });
    img.src = URL.createObjectURL(file);
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">{t("template")}</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onChange({ ...settings, template: tpl.id })}
              className={`rounded-lg border px-3 py-2 font-semibold transition ${
                settings.template === tpl.id
                  ? "border-amber-600 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300"
                  : "border-stone-300 bg-white hover:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:hover:border-stone-500"
              }`}
            >
              {t(`template.${tpl.id}`)}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">{t("certFont")}</span>
        <select
          name="font"
          value={settings.font}
          onChange={set("font")}
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-amber-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-amber-500"
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.style ? `${f.label} (${t(`fontStyle.${f.style}`)})` : f.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-stone-500 dark:text-stone-400">{t("certFontHint")}</span>
      </label>

      <div className="flex items-end gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">{t("color")}</span>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={set("primaryColor")}
            className="mt-1 block h-10 w-16 cursor-pointer rounded border border-stone-300 dark:border-stone-700"
          />
        </label>

        <label className="block flex-1">
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">{t("logo")}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogo}
            className="mt-1 block w-full text-sm"
          />
        </label>
        {settings.logo && (
          <button
            type="button"
            onClick={() => onChange({ ...settings, logo: null })}
            className="text-sm text-red-600 underline dark:text-red-400"
          >
            {t("removeLogo")}
          </button>
        )}
      </div>

      <Field label={t("fieldTitle")} value={settings.title} onChange={set("title")} />
      <Field label={t("fieldSubtitle")} value={settings.subtitle} onChange={set("subtitle")} />
      <Field
        label={t("fieldBody")}
        value={settings.body}
        onChange={set("body")}
        hint={t("fieldBodyHint")}
      />
      <Field
        label={t("fieldCourse")}
        value={settings.course}
        onChange={set("course")}
        hint={t("fieldCourseHint")}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("fieldSignerName")} value={settings.signerName} onChange={set("signerName")} />
        <Field label={t("fieldSignerTitle")} value={settings.signerTitle} onChange={set("signerTitle")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("fieldDate")} value={settings.date} onChange={set("date")} />
        <Field label={t("fieldDateLabel")} value={settings.dateLabel} onChange={set("dateLabel")} />
      </div>

      <Field
        label={t("fieldIdPrefix")}
        value={settings.idPrefix}
        onChange={set("idPrefix")}
        hint={t("fieldIdPrefixHint")}
      />
    </div>
  );
}
