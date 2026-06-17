"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8 text-center">
          <p className="text-lg font-medium text-zinc-700">{t.hero.intake}</p>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:whitespace-nowrap">
              <span className="font-extrabold tracking-wide text-rose-500">
                {t.brand}
              </span>
              {" – "}
              {t.hero.headline}
            </h1>

            <p className="text-xl font-semibold text-zinc-700 sm:text-2xl">
              {t.hero.tagline}
            </p>
          </div>

          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-rose-400 px-8 text-sm font-semibold text-white shadow-lg shadow-rose-400/25 transition hover:bg-rose-500"
              >
                {t.hero.ctaPrimary}
              </a>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-full border border-rose-200 bg-white px-8 text-sm font-semibold text-zinc-800 transition hover:border-rose-300 hover:bg-rose-50"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
              {t.hero.badge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
