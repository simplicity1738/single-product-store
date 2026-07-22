"use client";

import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { StoreConfig } from "@/lib/store-config";
import HeroThemeDecorations from "@/components/HeroThemeDecorations";

const heroDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

type HeroProps = {
  siteSettings: StoreConfig["siteSettings"];
};

function HeroShowcase({ alt }: { alt: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [12, 0, -8],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [7, 0, -5],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.94, 1.03, 0.97],
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [28, -6, -22],
  );

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-[300px] items-center justify-center [perspective:1400px] sm:min-h-[420px] lg:min-h-[560px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_18%,rgba(255,255,255,0.28)_0%,transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 bottom-4 h-14 rounded-[100%] bg-black/25 blur-2xl"
      />

      <motion.div
        style={{
          rotateY,
          rotateX,
          scale,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-full will-change-transform"
      >
        <div className="relative aspect-[5/4] w-full">
          <Image
            src="/simplicity-hero-showcase.png"
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-contain object-center drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
          />
        </div>
      </motion.div>
    </div>
  );
}

function TrustBadges({
  items,
}: {
  items: { key: string; label: string; icon: "shield" | "trace" | "flask" }[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-2.5">
          <span className="text-white/75" aria-hidden>
            {item.icon === "shield" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            ) : item.icon === "trace" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.31 48.31 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
              </svg>
            )}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 sm:text-[11px]">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Hero({ siteSettings }: HeroProps) {
  const { t } = useLanguage();

  const headline =
    siteSettings.campaignHeadline.trim() ||
    siteSettings.heroTitle.trim() ||
    t.hero.headline;

  const bodyCopy =
    siteSettings.heroSubtitle.trim() ||
    siteSettings.heroTagline.trim() ||
    t.hero.subtitle;

  const ctaLabel = t.hero.ctaPrimary;
  const campaignTheme = siteSettings.campaignTheme;

  const trustItems = [
    { key: "tested", label: t.hero.trust.tested, icon: "shield" as const },
    { key: "traceable", label: t.hero.trust.traceable, icon: "trace" as const },
    { key: "research", label: t.hero.trust.research, icon: "flask" as const },
  ];

  return (
    <section className="relative min-h-[min(92vh,900px)] overflow-hidden bg-[#5c4a45]">
      {/* Warm taupe atmosphere matching ONDO depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_18%,rgba(255,236,220,0.22)_0%,transparent_42%),linear-gradient(115deg,#3f322e_0%,#5c4a45_42%,#6d574f_72%,#4a3b37_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_70%,rgba(0,0,0,0.28)_0%,transparent_50%)]"
      />

      <HeroThemeDecorations theme={campaignTheme} />

      <div className="relative z-10 mx-auto flex min-h-[min(92vh,900px)] max-w-7xl flex-col px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-12">
          {/* Left — title, body, single CTA */}
          <div className="relative z-10 flex max-w-xl flex-col justify-center lg:max-w-[32rem] lg:pb-16">
            <h1
              className={`${heroDisplay.className} text-balance text-[2.85rem] font-semibold leading-[1.08] tracking-[-0.015em] text-white sm:text-5xl lg:text-[3.65rem] xl:text-[4rem]`}
            >
              {headline}
            </h1>

            <p className="mt-6 max-w-[28rem] text-[15px] leading-[1.7] text-white/70 sm:mt-7 sm:text-base sm:leading-[1.75]">
              {bodyCopy}
            </p>

            <div className="mt-9 sm:mt-10">
              <a
                href="#products"
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#F8F9FA] px-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C1917] shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition hover:bg-white"
              >
                {ctaLabel}
                <span aria-hidden className="transition group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Right — showcase only */}
          <div className="relative z-10 lg:-mr-4 xl:-mr-6">
            <HeroShowcase alt={`${t.brand} product showcase`} />
          </div>
        </div>

        {/* Bottom-left trust badges */}
        <div className="absolute inset-x-4 bottom-8 z-20 sm:inset-x-6 lg:inset-x-8 lg:bottom-10">
          <div className="max-w-7xl">
            <TrustBadges items={trustItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
