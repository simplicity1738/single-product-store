"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";

const WINK_DURATION_MS = 320;

function RobotFace({ isWinking }: { isWinking: boolean }) {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <rect x="5" y="6.5" width="14" height="12.5" rx="3.5" />
      <line x1="12" y1="6.5" x2="12" y2="3.5" strokeLinecap="round" />
      <circle cx="12" cy="2.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="11.25" r="1.6" fill="currentColor" stroke="none" />
      {isWinking ? (
        <path
          d="M14.25 11.5 Q15.75 13.25 17.25 11.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <circle cx="15" cy="11.25" r="1.6" fill="currentColor" stroke="none" />
      )}
      <line x1="9.75" y1="15" x2="14.25" y2="15" strokeLinecap="round" />
    </svg>
  );
}

export default function Faq() {
  const { t } = useLanguage();
  const { faqs } = useStoreConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isWinking, setIsWinking] = useState(false);
  const winkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (winkTimeoutRef.current) {
        clearTimeout(winkTimeoutRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsWinking(false);
      if (winkTimeoutRef.current) {
        clearTimeout(winkTimeoutRef.current);
        winkTimeoutRef.current = null;
      }
      return;
    }

    setIsWinking(true);
    winkTimeoutRef.current = setTimeout(() => {
      setIsWinking(false);
      setIsOpen(true);
      winkTimeoutRef.current = null;
    }, WINK_DURATION_MS);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {isOpen && (
        <div
          className="pointer-events-auto fixed bottom-[6.75rem] right-6 w-[22.5rem] max-h-[590px] overflow-y-auto rounded-2xl border border-rose-100 bg-white p-4 shadow-2xl shadow-rose-200/40 sm:w-[24rem]"
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
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={t.faq.helperLabel}
        className="pointer-events-auto fixed bottom-6 right-6 flex h-[4.125rem] w-[4.125rem] items-center justify-center rounded-full border border-rose-200 bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-400/40 transition hover:scale-105 hover:shadow-xl hover:shadow-rose-400/50 active:scale-95"
      >
        <RobotFace isWinking={isWinking} />
      </button>
    </div>
  );
}
