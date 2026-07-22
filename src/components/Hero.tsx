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
    prefersReducedMotion ? [0, 0, 0] : [10, 0, -7],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [6, 0, -4],
  );
  const motionScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.97, 1.02, 0.98],
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [24, -8, -20],
  );

  return (
    <div
      ref={sectionRef}
      className="relative flex w-full max-w-none items-center justify-center bg-transparent [perspective:1600px]"
    >
      <motion.div
        style={{
          rotateY,
          rotateX,
          scale: motionScale,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-full max-w-none origin-center bg-transparent will-change-transform scale-105 lg:scale-110"
      >
        <Image
          src="/simplicity-hero-showcase.png"
          alt={alt}
          width={2000}
          height={1600}
          priority
          sizes="(max-width: 1024px) 100vw, 68vw"
          className="h-auto w-full max-w-none bg-transparent object-contain object-center drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
        />
      </motion.div>
    </div>
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
    <section className="relative overflow-x-clip overflow-y-visible bg-[#161114]">
      {/* Moody studio lighting — soft glow behind massive showcase */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 75% 35%, rgba(70, 48, 56, 0.45) 0%, rgba(22, 17, 20, 0.98) 75%),
            linear-gradient(90deg, #120E10 0%, transparent 40%),
            linear-gradient(180deg, transparent 50%, #0E0B0C 100%)
          `,
        }}
      />

      <HeroThemeDecorations theme={campaignTheme} />

      <div className="relative z-10 flex min-h-[min(90vh,960px)] flex-col justify-center py-10 sm:py-14 lg:py-8">
        {/* ONDO 38 / 62 proportions — showcase can overflow right edge */}
        <div className="flex w-full flex-col items-center lg:flex-row lg:items-center lg:justify-between">
          {/* Left ~38% — copy & CTA */}
          <div className="relative z-20 w-full shrink-0 px-4 sm:px-6 lg:w-[38%] lg:max-w-[38%] lg:pl-8 lg:pr-6 xl:pl-12 xl:pr-8">
            <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-none">
              <h1
                className={`${heroDisplay.className} text-5xl font-serif font-semibold tracking-tight text-white leading-[1.05] md:text-6xl lg:text-7xl`}
              >
                {headline}
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#E0D2D7] md:text-base">
                {bodyCopy}
              </p>

              <a
                href="#products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F7F4EF] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-[#161114] transition-all hover:bg-white"
              >
                {ctaLabel}
                <span aria-hidden>→</span>
              </a>

              <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-6 text-xs uppercase tracking-widest text-[#C9B8BF]">
                {trustItems.map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5">
                    <span className="text-[#C9B8BF]" aria-hidden>
                      {item.icon === "shield" ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                          />
                        </svg>
                      ) : item.icon === "trace" ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.31 48.31 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5"
                          />
                        </svg>
                      )}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right ~62–68% — massive showcase, bleeds to right edge */}
          <div className="relative z-10 mt-8 w-full max-w-none bg-transparent px-2 sm:px-4 lg:mt-0 lg:w-[62%] lg:max-w-none lg:shrink-0 lg:translate-x-4 lg:px-0 xl:w-[68%] xl:translate-x-8">
            <HeroShowcase alt={`${t.brand} product showcase`} />
          </div>
        </div>
      </div>
    </section>
  );
}
