"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/product";
import { ORDER_STORAGE_KEY, type OrderFormData } from "@/lib/order";
import type { calculateStoreOrderTotal } from "@/lib/store-config";
import { useStoreConfig } from "@/contexts/StoreConfigContext";

type OrderSummary = ReturnType<typeof calculateStoreOrderTotal>;

type StripeCheckoutStepProps = {
  orderTotal: number;
  payload: OrderFormData;
  summary: OrderSummary;
  onBack: () => void;
};

export default function StripeCheckoutStep({
  orderTotal,
  payload,
  summary,
  onBack,
}: StripeCheckoutStepProps) {
  const { locale, t } = useLanguage();
  const { getLineLabel } = useStoreConfig();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.checkoutUrl) {
        throw new Error(data.message ?? t.checkoutMethod.stripe.errors.submitFailed);
      }

      const receiptItems = summary.lineItems.map((line) => ({
        productId: line.productId,
        variantMg: line.variantMg,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineSubtotal: line.lineSubtotal,
        selectedStrength: line.selectedStrength,
        productName: getLineLabel(
          line.productId,
          line.variantMg,
          line.selectedStrength,
          line.campaignAddonId,
        ),
      }));

      sessionStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify({
          ...payload,
          items: receiptItems,
          orderId: data.orderId,
          subtotal: data.subtotal,
          shipping: data.shipping,
          discount: data.discount,
          total: data.total,
          placedAt: data.placedAt,
          paymentMethod: "stripe",
          stripeSessionId: data.sessionId,
        }),
      );

      window.location.href = data.checkoutUrl;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : t.checkoutMethod.stripe.errors.submitFailed,
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
      >
        {t.checkoutMethod.stripe.backToMethod}
      </button>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
          {t.checkoutMethod.stripe.eyebrow}
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.checkoutMethod.stripe.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {t.checkoutMethod.stripe.description}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50/40 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">{t.checkoutMethod.stripe.orderTotal}</span>
          <span className="text-xl font-bold text-zinc-900">
            {formatCurrency(orderTotal, localeCode)}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          {t.checkoutMethod.stripe.secureNote}
        </p>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={isSubmitting}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? t.checkoutMethod.stripe.processing
          : t.checkoutMethod.stripe.checkoutButton}
      </button>
    </div>
  );
}
