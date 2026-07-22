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
      className="relative mx-auto my-4 flex w-full max-w-[90%] items-center justify-center bg-transparent sm:max-w-[450px] lg:mx-0 lg:my-0 lg:h-full lg:max-h-[70vh] lg:max-w-none lg:justify-end [perspective:1400px]"
    >
      <motion.div
        style={{
          rotateY,
          rotateX,
          scale: motionScale,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 flex w-full items-center justify-center bg-transparent will-change-transform lg:h-full lg:justify-end"
      >
        <Image
          src="/simplicity-hero-showcase.png"
          alt={alt}
          width={1600}
          height={1280}
          priority
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 450px, 58vw"
          className="h-auto max-h-[320px] w-full object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:max-h-[420px] lg:max-h-full lg:scale-105 lg:object-right"
        />
      </motion.div>
    </div>
  );
}

export default function Hero({ siteSettings }: HeroProps) {
  const { t } = useLanguage();

  // CMS bindings preserved — admin siteSettings override i18n fallbacks
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
    <section className="relative w-full overflow-hidden bg-[#0F0C0B]">
      {/* ONDO cinematic lighting: dark left → warm top-right spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 80% 20%, rgba(175, 150, 132, 0.45) 0%, rgba(100, 80, 68, 0.25) 45%, rgba(15, 12, 11, 0.98) 80%),
            linear-gradient(90deg, #0A0807 0%, transparent 42%),
            #0F0C0B
          `,
        }}
      />

      <HeroThemeDecorations theme={campaignTheme} />

      {/* Mobile: natural scroll height · Desktop: viewport-fit under sand navbar */}
      <div className="relative z-10 flex h-auto min-h-[100dvh] w-full flex-col justify-between p-4 sm:p-6 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:p-12">
        {/*
          Mobile order via flex + contents:
          1 headline → 2 subtext → 3 showcase → 4 CTA
          Desktop: lg:grid left copy col-span-5 / right showcase col-span-7
        */}
        <div className="mx-auto my-auto flex w-full max-w-7xl flex-col items-center gap-2 lg:grid lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* contents on mobile so children participate in parent flex order */}
          <div className="contents w-full max-w-lg lg:col-span-5 lg:flex lg:flex-col lg:items-start">
            <h1
              className={`${heroDisplay.className} order-1 w-full text-3xl font-serif tracking-tight text-white leading-[1.1] sm:text-4xl md:text-6xl lg:text-7xl`}
            >
              {headline}
            </h1>

            <p className="order-2 mt-3 w-full max-w-md text-xs leading-relaxed text-[#D1C5BD] sm:text-sm md:text-base">
              {bodyCopy}
            </p>

            <a
              href="#products"
              className="order-4 my-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ECE5D8] px-6 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white sm:w-auto"
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </a>
          </div>

          {/* Showcase — order-3 on mobile (between subtext & CTA), right column on desktop */}
          <div className="relative order-3 w-full lg:col-span-7 lg:h-full lg:max-h-[70vh] lg:justify-end">
            <HeroShowcase alt={`${t.brand} product showcase`} />
          </div>
        </div>

        {/* 5th — Trust badges */}
        <div className="mt-6 flex w-full flex-row items-center justify-between gap-4 overflow-x-auto whitespace-nowrap border-t border-white/10 pt-4 text-[10px] uppercase tracking-widest text-[#A89A92] sm:gap-8 sm:text-[11px] lg:mt-auto lg:justify-start">
          {trustItems.map((item) => (
            <div key={item.key} className="flex shrink-0 items-center gap-2">
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
    </section>
  );
}
