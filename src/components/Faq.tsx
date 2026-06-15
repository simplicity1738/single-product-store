"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";

export default function Faq() {
  const { t } = useLanguage();
  const { faqs } = useStoreConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {isOpen && (
        <div
          className="pointer-events-auto fixed bottom-24 right-6 w-80 max-h-[500px] overflow-y-auto rounded-2xl border border-rose-100 bg-white p-4 shadow-2xl shadow-rose-200/40 sm:w-96"
          role="dialog"
          aria-label={t.faq.title}
        >
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-rose-100 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                {t.faq.eyebrow}
              </p>
              <h2 className="mt-1 text-base font-bold text-zinc-900">
                {t.faq.widgetTitle}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">{t.faq.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t.faq.close}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-sm font-semibold text-zinc-500 transition hover:border-rose-300 hover:bg-rose-100 hover:text-zinc-800"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {faqs.map((entry) => {
              const expanded = openId === entry.id;

              return (
                <article
                  key={entry.id}
                  className="overflow-hidden rounded-xl border border-rose-100 bg-rose-50/30 transition hover:border-rose-200"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId((current) =>
                        current === entry.id ? null : entry.id,
                      )
                    }
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-zinc-900">
                      {entry.question}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white text-xs text-rose-500 transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      expanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-rose-100 bg-white px-4 py-3">
                        <p className="text-sm leading-relaxed text-zinc-600">
                          {entry.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={t.faq.helperLabel}
        className="pointer-events-auto fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-rose-200 bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-400/40 transition hover:scale-105 hover:shadow-xl hover:shadow-rose-400/50 active:scale-95"
      >
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
          <circle cx="12" cy="9" r="2.25" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}
