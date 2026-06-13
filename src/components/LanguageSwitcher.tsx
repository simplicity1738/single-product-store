"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";

const options: { locale: Locale; label: string; flag: string }[] = [
  { locale: "sv", label: "SV", flag: "🇸🇪" },
  { locale: "en", label: "EN", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50/80 p-1">
      {options.map((option) => {
        const isActive = locale === option.locale;

        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-rose-400 text-white shadow-sm"
                : "text-zinc-600 hover:bg-rose-100 hover:text-zinc-900"
            }`}
            aria-pressed={isActive}
            aria-label={`Switch to ${option.label}`}
          >
            <span aria-hidden>{option.flag}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
