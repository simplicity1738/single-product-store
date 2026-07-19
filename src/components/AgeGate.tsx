"use client";

import { useEffect, useState } from "react";
import { isAgeVerified, setAgeVerified } from "@/lib/cart-storage";

export default function AgeGate() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isAgeVerified()) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleConfirm() {
    setAgeVerified();
    setIsClosing(true);
    window.setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "";
    }, 300);
  }

  function handleDecline() {
    window.location.href = "https://www.google.com";
  }

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" aria-hidden />

      <div
        className={`relative mx-4 w-full max-w-md rounded-2xl border border-pink-100 bg-white p-8 shadow-2xl transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <h2
          id="age-gate-title"
          className="text-2xl font-bold tracking-tight text-zinc-900"
        >
          Välkommen till SimpliCity
        </h2>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          <p className="font-semibold">⚠️ VIKTIG INFORMATION:</p>
          <p className="mt-1">
            Våra produkter säljs uteslutande för laboratorie- och
            forskningsändamål (Research Use Only). De är inte avsedda för
            mänsklig konsumtion.
          </p>
        </div>

        <p className="mt-6 text-base font-semibold text-zinc-800">
          Är du över 18 år?
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-rose-400 px-6 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Ja, jag är 18+
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-rose-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50"
          >
            Nej, lämna sidan
          </button>
        </div>
      </div>
    </div>
  );
}
