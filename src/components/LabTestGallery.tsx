"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getLabTestStats,
  isPdfReport,
  type LabTest,
} from "@/lib/lab-test";

type LabTestGalleryProps = {
  initialTests: LabTest[];
};

function formatTestDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAveragePurity(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}

export default function LabTestGallery({ initialTests }: LabTestGalleryProps) {
  const { t, locale } = useLanguage();
  const l = t.labTestsPage;

  const [activeTest, setActiveTest] = useState<LabTest | null>(null);
  const stats = getLabTestStats(initialTests);

  useEffect(() => {
    if (!activeTest) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveTest(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeTest]);

  return (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
          {l.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
          {l.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
          {l.subtitle}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-100 bg-white/90 px-5 py-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-rose-600">{stats.productCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {l.statProducts}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white/90 px-5 py-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">
            {formatAveragePurity(stats.averagePurity)}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {l.statPurity}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white/90 px-5 py-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-rose-600">{stats.labCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {l.statLabs}
          </p>
        </div>
      </div>

      {initialTests.length === 0 ? (
        <p className="mx-auto mt-12 max-w-lg rounded-2xl border border-dashed border-rose-200 bg-white/80 px-6 py-10 text-center text-sm text-zinc-500">
          {l.empty}
        </p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {initialTests.map((test) => (
            <article
              key={test.id}
              className="flex flex-col rounded-2xl border border-rose-100 bg-white p-6 shadow-sm shadow-rose-100/50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {test.purity}
                </span>
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                  {l.approved}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold text-zinc-900">{test.productName}</h2>
              <p className="mt-2 text-sm text-zinc-500">
                {l.batchLabel}: <span className="font-mono text-zinc-700">{test.batchNumber}</span>
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {l.labLabel}: {test.labName}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {l.testedLabel}: {formatTestDate(test.testDate, locale)}
              </p>

              <button
                type="button"
                onClick={() => setActiveTest(test)}
                disabled={!test.reportUrl}
                className="mt-6 rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {l.viewReport}
              </button>
            </article>
          ))}
        </div>
      )}

      <section className="mx-auto mt-16 max-w-3xl rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-[#FDF3F3] to-rose-50/70 p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900">{l.whyTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
          {l.whyBody}
        </p>
      </section>

      {activeTest && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={l.modalTitle}
          onClick={() => setActiveTest(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-rose-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  {activeTest.productName}
                </p>
                <h3 className="mt-1 text-lg font-bold text-zinc-900">{l.modalTitle}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {l.batchLabel}: {activeTest.batchNumber} · {activeTest.labName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTest(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-lg font-semibold text-zinc-500 transition hover:bg-rose-100"
                aria-label={l.closeModal}
              >
                ×
              </button>
            </div>

            <div className="overflow-auto bg-zinc-50 p-4 sm:p-6">
              {isPdfReport(activeTest.reportUrl) ? (
                <iframe
                  title={l.modalTitle}
                  src={activeTest.reportUrl}
                  className="h-[70vh] w-full rounded-xl border border-rose-100 bg-white"
                />
              ) : (
                <div className="relative mx-auto min-h-[60vh] w-full max-w-3xl overflow-hidden rounded-xl border border-rose-100 bg-white">
                  <Image
                    src={activeTest.reportUrl}
                    alt={`${activeTest.productName} ${l.modalTitle}`}
                    width={1600}
                    height={2200}
                    className="h-auto w-full object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="border-t border-rose-100 px-5 py-4 sm:px-6">
              <a
                href={activeTest.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                {l.openFullReport}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
