"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { resolveHeroLogoSrc } from "@/lib/hero-settings";
import type { StoreConfig } from "@/lib/store-config";

type HeroProps = {
  siteSettings: StoreConfig["siteSettings"];
};

export default function Hero({ siteSettings }: HeroProps) {
  const { t } = useLanguage();
  const heroLogoSrc = resolveHeroLogoSrc(siteSettings);

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {siteSettings.heroEyebrow ? (
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
              {siteSettings.heroEyebrow}
            </span>
          ) : null}

          {siteSettings.heroUseLogoImage ? (
            <div className="relative mx-auto mb-8 h-28 w-28 overflow-hidden rounded-full border border-rose-100/40 bg-transparent shadow-sm md:h-36 md:w-36">
              <Image
                src={heroLogoSrc}
                alt={siteSettings.heroBrandText}
                fill
                priority
                sizes="(max-width: 768px) 112px, 144px"
                className="object-contain p-3"
              />
            </div>
          ) : (
            <p className="mb-8 text-4xl font-extrabold tracking-wide text-rose-500">
              {siteSettings.heroBrandText}
            </p>
          )}

          <h1 className="mb-4 text-balance text-4xl font-extrabold uppercase tracking-tight text-slate-900 md:text-5xl lg:text-6xl lg:whitespace-nowrap">
            {siteSettings.heroTitle}
          </h1>

          <p className="mb-6 text-lg font-medium text-rose-500 md:text-xl">
            {siteSettings.heroTagline}
          </p>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {siteSettings.heroSubtitle}
          </p>

          <div className="flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-x-4">
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

            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
              <span
                className="h-1.5 w-1.5 rounded-full bg-rose-400"
                aria-hidden
              />
              {siteSettings.heroBadge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
