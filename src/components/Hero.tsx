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
    prefersReducedMotion ? [0, 0, 0] : [8, 0, -6],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [5, 0, -3],
  );
  const motionScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.98, 1.015, 0.99],
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [18, -6, -14],
  );

  return (
    <div
      ref={sectionRef}
      className="relative flex h-full w-full items-end justify-end bg-transparent [perspective:1400px]"
    >
      <motion.div
        style={{
          rotateY,
          rotateX,
          scale: motionScale,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 flex h-full w-full items-end justify-end bg-transparent will-change-transform"
      >
        <Image
          src="/simplicity-hero-showcase.png"
          alt={alt}
          width={1600}
          height={1280}
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="h-full w-full scale-105 bg-transparent object-contain object-right-bottom drop-shadow-[0_32px_64px_rgba(0,0,0,0.45)] lg:scale-110"
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
    <section className="relative overflow-hidden bg-[#120E0D]">
      {/* ONDO cinematic studio lighting: dark left → warm top-right beam → dark floor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 85% 15%, rgba(185, 162, 145, 0.45) 0%, rgba(120, 100, 88, 0.25) 45%, rgba(18, 14, 13, 0.98) 80%),
            linear-gradient(90deg, #0F0C0B 0%, transparent 42%),
            linear-gradient(180deg, transparent 55%, #0A0807 100%),
            #120E0D
          `,
        }}
      />

      <HeroThemeDecorations theme={campaignTheme} />

      <div className="relative z-10 mx-auto flex min-h-[min(88vh,900px)] max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-10">
        <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
          {/* Left — dark-aligned typography */}
          <div className="relative z-20 w-full lg:w-[42%] lg:shrink-0 lg:pb-6">
            <div className="max-w-xl">
              <h1
                className={`${heroDisplay.className} text-5xl font-serif tracking-tight text-white leading-[1.05] lg:text-7xl`}
              >
                {headline}
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#CFC4BD] md:text-base">
                {bodyCopy}
              </p>

              <a
                href="#products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#EAE3D5] px-7 py-3 text-xs font-medium uppercase tracking-wider text-[#120E0D] shadow-md transition-all hover:bg-white"
              >
                {ctaLabel}
                <span aria-hidden>→</span>
              </a>

              {/* Single-line trust badges — bottom left */}
              <div className="mt-10 flex flex-row items-center gap-8 whitespace-nowrap border-t border-white/10 pt-6 text-[11px] uppercase tracking-widest text-[#A89A92]">
                {trustItems.map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5">
                    <span className="text-[#A89A92]" aria-hidden>
                      {item.icon === "shield" ? (
                        <svg
                          className="h-3.5 w-3.5"
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
                          className="h-3.5 w-3.5"
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
                          className="h-3.5 w-3.5"
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

          {/* Right — cinematic tall showcase into warm light beam */}
          <div className="relative z-10 flex h-[580px] w-full items-end justify-end lg:h-[680px] lg:w-[58%]">
            <HeroShowcase alt={`${t.brand} product showcase`} />
          </div>
        </div>
      </div>
    </section>
  );
}
