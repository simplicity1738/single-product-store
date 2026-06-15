"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";

export default function Faq() {
  const { t } = useLanguage();
  const { faqs } = useStoreConfig();
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            {t.faq.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t.faq.title}
          </h2>
          <p className="mt-4 text-lg text-zinc-600">{t.faq.subtitle}</p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((entry) => {
            const isOpen = openId === entry.id;

            return (
              <article
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/20 transition hover:border-rose-200"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenId((current) =>
                      current === entry.id ? null : entry.id,
                    )
                  }
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span className="text-sm font-semibold text-zinc-900 sm:text-base">
                    {entry.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-rose-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
                    <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
                      {entry.answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
