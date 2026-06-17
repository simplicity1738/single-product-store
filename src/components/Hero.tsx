"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
            <p className="text-base font-semibold tracking-[0.28em] text-rose-600 sm:text-lg sm:tracking-[0.32em]">
              {t.brand}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
              {t.hero.badge}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:whitespace-nowrap">
            {t.hero.title}
          </h1>

          <p className="mt-4 text-xl font-semibold text-zinc-700 sm:text-2xl">
            {t.hero.tagline}
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
        </div>
      </div>
    </section>
  );
}
