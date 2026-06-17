"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            {t.hero.tagline}
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:whitespace-nowrap">
            <span className="font-extrabold tracking-wide text-rose-500">
              {t.brand}
            </span>
            {" – "}
            {t.hero.title}
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
            {t.hero.subtitle}
          </p>

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
        </div>
      </div>
    </section>
  );
}
