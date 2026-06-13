"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const trustIcons = {
  shipping: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a49.902 49.902 0 00-2.659-.753M18.75 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  ),
  support: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
    />
  ),
  payment: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  ),
  quality: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  ),
};

function PostNordBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0085CA]">
        <svg
          className="h-5 w-5 text-[#FFCC00]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v1H8v-1zm0 2h6v1H8v-1z" />
        </svg>
      </div>
      <div className="text-left">
        <p className="text-sm font-bold tracking-tight text-[#0085CA]">
          PostNord
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Sverige
        </p>
      </div>
    </div>
  );
}

export default function TrustBar() {
  const { t } = useLanguage();

  const signals = [
    { key: "shipping" as const, ...t.trust.shipping },
    { key: "support" as const, ...t.trust.support },
    { key: "payment" as const, ...t.trust.payment },
    { key: "quality" as const, ...t.trust.quality },
  ];

  return (
    <section className="border-t border-rose-100 bg-gradient-to-b from-rose-50/80 to-white py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((signal) => (
            <div
              key={signal.key}
              className="flex items-start gap-4 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  {trustIcons[signal.key]}
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {signal.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  {signal.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-rose-100 pt-8 sm:flex-row sm:gap-6">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {t.trust.shipWith}
          </p>
          <PostNordBadge />
        </div>
      </div>
    </section>
  );
}
