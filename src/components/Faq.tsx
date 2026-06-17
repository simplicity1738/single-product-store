"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import TeacherBot from "@/components/TeacherBot";

const INTERACTION_DURATION_MS = 480;

export default function Faq() {
  const { t } = useLanguage();
  const { faqs } = useStoreConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsInteracting(false);
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
        interactionTimeoutRef.current = null;
      }
      return;
    }

    setIsInteracting(true);
    interactionTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      setIsInteracting(false);
      interactionTimeoutRef.current = null;
    }, INTERACTION_DURATION_MS);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {isOpen && (
        <div
          className="pointer-events-auto fixed bottom-[9.5rem] right-4 w-[22.5rem] max-h-[590px] overflow-y-auto rounded-2xl border border-rose-100 bg-white p-4 shadow-2xl shadow-rose-200/40 sm:right-6 sm:w-[24rem]"
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
                        <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
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
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={t.faq.helperLabel}
        className="pointer-events-auto fixed bottom-0 right-2 overflow-visible pb-1 pr-1 transition hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 sm:right-4"
      >
        <TeacherBot isActive={isOpen || isInteracting} tagLabel={t.faq.teacherTag} />
      </button>
    </div>
  );
}
