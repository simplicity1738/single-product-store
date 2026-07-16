"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export type CheckoutPaymentChoice = "stripe" | "bitcoin";

type CheckoutMethodSelectorProps = {
  selected: CheckoutPaymentChoice | null;
  onSelect: (method: CheckoutPaymentChoice) => void;
  onBack: () => void;
  onContinue: () => void;
  disabled?: boolean;
};

export default function CheckoutMethodSelector({
  selected,
  onSelect,
  onBack,
  onContinue,
  disabled = false,
}: CheckoutMethodSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
      >
        {t.checkoutMethod.backToDetails}
      </button>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
          {t.checkoutMethod.eyebrow}
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.checkoutMethod.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {t.checkoutMethod.subtitle}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("stripe")}
          className={`rounded-2xl border p-5 text-left transition ${
            selected === "stripe"
              ? "border-rose-400 bg-rose-50 shadow-sm shadow-rose-100"
              : "border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50/40"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-zinc-900">
                {t.checkoutMethod.stripe.title}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {t.checkoutMethod.stripe.subtitle}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              {t.checkoutMethod.stripe.badge}
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            {t.checkoutMethod.stripe.note}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect("bitcoin")}
          className={`rounded-2xl border p-5 text-left transition ${
            selected === "bitcoin"
              ? "border-rose-400 bg-rose-50 shadow-sm shadow-rose-100"
              : "border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50/40"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-zinc-900">
                {t.checkoutMethod.bitcoin.title}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {t.checkoutMethod.bitcoin.subtitle}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              {t.checkoutMethod.bitcoin.badge}
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            {t.checkoutMethod.bitcoin.note}
          </p>
        </button>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected || disabled}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t.checkoutMethod.continue}
      </button>
    </div>
  );
}
