"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  heroTypographyClass,
  resolveHeroLogoSrc,
} from "@/lib/hero-settings";
import type { StoreConfig } from "@/lib/store-config";

type HeroProps = {
  siteSettings: StoreConfig["siteSettings"];
};

export default function Hero({ siteSettings }: HeroProps) {
  const { t } = useLanguage();

  const brandClass = heroTypographyClass(
    siteSettings.heroBrandFontSize,
    siteSettings.heroBrandFontFamily,
  );
  const titleClass = heroTypographyClass(
    siteSettings.heroTitleFontSize,
    siteSettings.heroTitleFontFamily,
  );
  const taglineClass = heroTypographyClass(
    siteSettings.heroTaglineFontSize,
    siteSettings.heroTaglineFontFamily,
  );
  const descriptionClass = heroTypographyClass(
    siteSettings.heroDescriptionFontSize,
    siteSettings.heroDescriptionFontFamily,
  );

  const heroLogoSrc = resolveHeroLogoSrc(siteSettings);

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {siteSettings.heroUseLogoImage ? (
            <div className="mb-6 flex justify-center">
              <Image
                src={heroLogoSrc}
                alt={siteSettings.heroBrandText}
                width={320}
                height={96}
                priority
                className="h-auto max-h-20 w-auto md:max-h-24"
              />
            </div>
          ) : (
            <p
              className={`${brandClass} mb-6 font-extrabold tracking-wide text-rose-500`}
            >
              {siteSettings.heroBrandText}
            </p>
          )}

          <div className="flex w-full flex-col items-center space-y-8">
            <div className="space-y-3">
              <h1
                className={`${titleClass} font-light tracking-tight text-slate-400/90`}
              >
                {siteSettings.heroTitle}
              </h1>

              <p
                className={`${taglineClass} font-medium text-rose-500/90 sm:text-rose-500`}
              >
                {siteSettings.heroTagline}
              </p>
            </div>

            <p
              className={`${descriptionClass} max-w-2xl font-normal leading-relaxed text-zinc-500`}
            >
              {siteSettings.heroSubtitle}
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
                <span
                  className="h-1.5 w-1.5 rounded-full bg-rose-400"
                  aria-hidden
                />
                {siteSettings.heroBadge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
