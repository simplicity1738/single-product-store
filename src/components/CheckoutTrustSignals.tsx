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
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 shadow-sm backdrop-blur-md">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0085CA]">
        <svg
          className="h-3.5 w-3.5 text-[#FFCC00]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v1H8v-1zm0 2h6v1H8v-1z" />
        </svg>
      </div>
      <span className="text-[11px] font-semibold tracking-tight text-white">
        PostNord
      </span>
    </div>
  );
}

type CheckoutTrustSignalsProps = {
  className?: string;
};

/** Compact ONDO 2×2 trust grid + PostNord — for dark checkout summary only. */
export default function CheckoutTrustSignals({
  className = "",
}: CheckoutTrustSignalsProps) {
  const { t } = useLanguage();

  const signals = [
    { key: "shipping" as const, ...t.trust.shipping },
    { key: "support" as const, ...t.trust.support },
    { key: "payment" as const, ...t.trust.payment },
    { key: "quality" as const, ...t.trust.quality },
  ];

  return (
    <div
      className={`mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className}`}
    >
      <div className="grid grid-cols-2 gap-3">
        {signals.map((signal) => (
          <div key={signal.key} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#ECE5D8]/10 text-[#ECE5D8]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                {trustIcons[signal.key]}
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">{signal.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#CFC4BD]">
                {signal.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
        <p className="text-[10px] uppercase tracking-widest text-[#A89A92]">
          {t.trust.shipWith}:
        </p>
        <PostNordBadge />
      </div>
    </div>
  );
}
