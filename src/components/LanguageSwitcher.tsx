"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";

const options: { locale: Locale; label: string }[] = [
  { locale: "sv", label: "SV" },
  { locale: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-stone-300/70 bg-white/50 p-0.5">
      {options.map((option) => {
        const isActive = locale === option.locale;

        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-wide transition ${
              isActive
                ? "bg-stone-800 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-900"
            }`}
            aria-pressed={isActive}
            aria-label={`Switch to ${option.label}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
