"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";

const options: { locale: Locale; label: string }[] = [
  { locale: "sv", label: "SV" },
  { locale: "en", label: "EN" },
];

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
};

export default function LanguageSwitcher({
  variant = "light",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const isDark = variant === "dark";

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${
        isDark
          ? "border border-white/15 bg-white/5"
          : "border border-stone-300/70 bg-white/50"
      }`}
    >
      {options.map((option) => {
        const isActive = locale === option.locale;

        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-wide transition ${
              isDark
                ? isActive
                  ? "bg-[#F5F1EA] text-[#1F1917] shadow-sm"
                  : "text-neutral-200 hover:bg-white/10 hover:text-white"
                : isActive
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
