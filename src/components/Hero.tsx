"use client";

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { resolveHeroContent } from "@/lib/hero-content";

export default function Hero() {
  const { locale, t } = useLanguage();
  const { siteSettings } = useStoreConfig();

  const heroContent = useMemo(
    () => resolveHeroContent(locale, siteSettings, t.hero),
    [locale, siteSettings, t.hero],
  );

  const stats = [
    t.hero.stats.purity,
    t.hero.stats.shipping,
    t.hero.stats.support,
  ];

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            {heroContent.badge}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            {heroContent.title}
          </h1>

          <p className="mt-4 text-xl font-semibold text-zinc-700 sm:text-2xl">
            {heroContent.tagline}
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
            {heroContent.subtitle}
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

          <dl className="mt-10 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-rose-100 pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-zinc-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
