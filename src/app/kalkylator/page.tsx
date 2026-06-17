"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReconstitutionCalculator from "@/components/ReconstitutionCalculator";
import GuideFeedback from "@/components/GuideFeedback";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CalculatorPage() {
  const { t } = useLanguage();
  const c = t.calculator;

  return (
    <div className="min-h-full bg-gradient-to-b from-[#FDF3F3]/80 via-rose-50/40 to-white text-zinc-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            {c.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {c.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
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
