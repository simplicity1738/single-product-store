"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

type LegalSection = {
  heading: string;
  body: string;
};

type LegalContent = {
  title: string;
  subtitle: string;
  sections: readonly LegalSection[];
  placeholder?: {
    title: string;
    body: string;
  };
};

type LegalPageLayoutProps = {
  content: LegalContent;
  showPlaceholder?: boolean;
  lastUpdated?: string;
};

const DEFAULT_LAST_UPDATED = "13 juni 2025 / 13 June 2025";

export default function LegalPageLayout({
  content,
  showPlaceholder = false,
  lastUpdated = DEFAULT_LAST_UPDATED,
}: LegalPageLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50/50 via-white to-white text-zinc-900">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            {t.brand}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            {content.subtitle}
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            {t.legal.lastUpdated}: {lastUpdated}
          </p>
        </div>

        <article className="mt-12 space-y-8 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-10">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-zinc-900">
                {section.heading}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                {section.body}
              </p>
            </section>
          ))}

          {showPlaceholder && content.placeholder && (
            <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/60 px-5 py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-rose-900">
                {content.placeholder.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-rose-800/80">
                {content.placeholder.body}
              </p>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
