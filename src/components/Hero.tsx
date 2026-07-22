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
      className="relative flex min-h-[320px] items-center justify-center [perspective:1400px] sm:min-h-[460px] lg:min-h-[620px]"
    >
      {/* Soft pink radial glow behind product — no white card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, rgba(232,162,184,0.15) 0%, rgba(26,12,19,0) 70%)",
        }}
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
        <div className="relative aspect-[5/4] w-full bg-transparent">
          <Image
            src="/simplicity-hero-showcase.png"
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="bg-transparent object-contain object-center drop-shadow-[0_40px_80px_rgba(0,0,0,0.45)]"
          />
        </div>
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
    <section className="relative overflow-hidden bg-transparent">
      <HeroThemeDecorations theme={campaignTheme} />

      <div className="relative z-10 mx-auto flex min-h-[min(88vh,920px)] max-w-7xl flex-col px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-6">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          {/* Left — ONDO-scale copy */}
          <div className="relative z-10 flex max-w-xl flex-col justify-center lg:max-w-none">
            <h1
              className={`${heroDisplay.className} text-6xl font-serif font-semibold tracking-tight text-white leading-[1.05] md:text-7xl lg:text-8xl`}
            >
              {headline}
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-[#F0C2D1] md:text-lg">
              {bodyCopy}
            </p>

            <a
              href="#products"
              className="mt-8 inline-flex items-center gap-3 rounded-md bg-[#FFF8FA] px-8 py-4 text-xs font-semibold uppercase tracking-widest text-[#2D1720] transition-all hover:bg-[#FCE8EF]"
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </a>

            {/* Trust badges — ONDO bottom bar in pink */}
            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-12 text-xs uppercase tracking-widest text-[#E8A2B8]">
              {trustItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5">
                  <span className="text-[#E8A2B8]" aria-hidden>
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

          {/* Right — full-bleed showcase, no card */}
          <div className="relative z-10 lg:-mr-2 xl:-mr-4">
            <HeroShowcase alt={`${t.brand} product showcase`} />
          </div>
        </div>
      </div>
    </section>
  );
}
