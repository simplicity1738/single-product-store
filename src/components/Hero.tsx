"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { heroTypographyClass } from "@/lib/hero-settings";
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

  const heroLogoSrc =
    siteSettings.heroLogoPath || siteSettings.logoPath || "/logo.png";

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8 text-center">
          {siteSettings.heroUseLogoImage ? (
            <div className="relative h-14 w-44 sm:h-16 sm:w-52">
              <Image
                src={heroLogoSrc}
                alt={siteSettings.heroBrandText}
                fill
                priority
                sizes="(max-width: 640px) 176px, 208px"
                className="object-contain"
              />
            </div>
          ) : (
            <p
              className={`${brandClass} font-extrabold tracking-wide text-rose-500`}
            >
              {siteSettings.heroBrandText}
            </p>
          )}

          <h1
            className={`${titleClass} font-bold tracking-tight text-zinc-900 lg:whitespace-nowrap`}
          >
            {siteSettings.heroTitle}
          </h1>

          <p
            className={`${taglineClass} font-semibold text-rose-500/90 sm:text-rose-500`}
          >
            {siteSettings.heroTagline}
          </p>

          <p
            className={`${descriptionClass} max-w-2xl leading-relaxed text-zinc-600`}
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
    </section>
  );
}
