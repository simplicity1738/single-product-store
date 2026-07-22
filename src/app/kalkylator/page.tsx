"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReconstitutionCalculator from "@/components/ReconstitutionCalculator";
import GuideFeedback from "@/components/GuideFeedback";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";

const calcDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function CalculatorPage() {
  const { t } = useLanguage();
  const c = t.calculator;

  return (
    <div className="min-h-full bg-[#0F0C0B] text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8]">
            {c.eyebrow}
          </p>
          <h1
            className={`${calcDisplay.className} mt-3 text-4xl font-serif tracking-tight text-white md:text-5xl`}
          >
            {c.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#CFC4BD] md:text-base">
            {c.subtitle}
          </p>
        </div>

        <div className="mt-10 sm:mt-12">
          <ReconstitutionCalculator />
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <GuideFeedback />
        </div>
      </main>
      <Footer />
    </div>
  );
}
