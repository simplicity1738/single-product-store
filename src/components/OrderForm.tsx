"use client";

import { useMemo, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { isSiteSectionVisible } from "@/lib/site-navigation";
import ProductImage from "@/components/ProductImage";
import PaymentStep from "@/components/PaymentStep";
import PaymentTrustBadges from "@/components/PaymentTrustBadges";
import CheckoutTrustSignals from "@/components/CheckoutTrustSignals";
import CheckoutMethodSelector, {
  type CheckoutPaymentChoice,
} from "@/components/CheckoutMethodSelector";
import StripeCheckoutStep from "@/components/StripeCheckoutStep";
import { formatCurrency } from "@/lib/product";
import type { OrderFormData } from "@/lib/order";
import { CAMPAIGN_ADDON_PRODUCT_ID } from "@/lib/campaign-addons";
import {
  getMaxOrderableQuantity,
  getVariantLabelForSelection,
} from "@/lib/stock-management";

const checkoutDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#ECE5D8] focus:outline-none";

const glassCardClassName =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white shadow-xl backdrop-blur-md sm:p-8";

type CheckoutStep = "details" | "method" | "payment";

export default function OrderForm() {
  const { locale, t } = useLanguage();
  const { cart, updateCartQuantity } = useProductSelection();
  const {
    calculateOrderTotal,
    getLineLabel,
    validateDiscount,
    catalogProducts,
    storeConfig,
    siteNavigation,
    stockManagement,
  } = useStoreConfig();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("details");
  const [paymentChoice, setPaymentChoice] = useState<CheckoutPaymentChoice | null>(
    null,
  );
  const [form, setForm] = useState<Omit<OrderFormData, "items" | "discountCode">>({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(
    null,
  );
  const [discountFeedback, setDiscountFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const summary = useMemo(
    () => calculateOrderTotal(cart, appliedDiscountCode),
    [cart, appliedDiscountCode, calculateOrderTotal],
  );

  const basketSubtotal = Math.max(0, summary.subtotal - summary.discount);
  const displayTotal = cart.length === 0 ? 0 : summary.total;
  const amountUntilFreeShipping = Math.max(
    0,
    storeConfig.freeShippingThreshold - basketSubtotal,
  );

  const orderPayload = useMemo<OrderFormData>(
    () => ({
      ...form,
      items: cart,
      discountCode: appliedDiscountCode,
    }),
    [form, cart, appliedDiscountCode],
  );

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleApplyDiscount() {
    const validation = validateDiscount(discountInput, cart);

    if (!validation.valid) {
      setAppliedDiscountCode(null);
      const message =
        validation.reason === "usage_exhausted"
          ? t.order.discount.expired
          : validation.reason === "product_not_in_cart"
            ? t.order.discount.productMismatch
            : t.order.discount.invalid;
      setDiscountFeedback({ type: "error", message });
      return;
    }

    setAppliedDiscountCode(validation.discount.code);
    setDiscountFeedback({
      type: "success",
      message: t.order.discount.applied,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError(t.order.errors.emptyCart);
      return;
    }

    setIsSubmitting(true);
    setCheckoutStep("method");
    setIsSubmitting(false);
  }

  function handleContinueFromMethod() {
    if (!paymentChoice) return;
    setCheckoutStep("payment");
  }

  function handleBackFromPayment() {
    setCheckoutStep("method");
  }

  function handleBackFromMethod() {
    setCheckoutStep("details");
  }

  if (!isSiteSectionVisible(siteNavigation, "bestall")) {
    return null;
  }

  return (
    <section id="checkout-form" className="scroll-mt-24 bg-[#0F0C0B] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8] opacity-80">
            {t.order.eyebrow}
          </p>
          <h2
            className={`${checkoutDisplay.className} mt-3 text-3xl font-serif tracking-tight text-white md:text-5xl`}
          >
            {t.order.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#CFC4BD] md:text-base">
            {t.order.subtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-10">
          {checkoutStep === "payment" && paymentChoice === "bitcoin" ? (
            <PaymentStep
              orderTotal={displayTotal}
              payload={orderPayload}
              summary={summary}
              onBack={handleBackFromPayment}
            />
          ) : checkoutStep === "payment" && paymentChoice === "stripe" ? (
            <StripeCheckoutStep
              orderTotal={displayTotal}
              payload={orderPayload}
              summary={summary}
              onBack={handleBackFromPayment}
            />
          ) : checkoutStep === "method" ? (
            <CheckoutMethodSelector
              selected={paymentChoice}
              onSelect={setPaymentChoice}
              onBack={handleBackFromMethod}
              onContinue={handleContinueFromMethod}
            />
          ) : (
            <form onSubmit={handleSubmit} className={glassCardClassName}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.order.name}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={inputClassName}
                    placeholder={t.order.placeholders.name}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.order.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={inputClassName}
                    placeholder={t.order.placeholders.email}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.order.address}
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className={inputClassName}
                    placeholder={t.order.placeholders.address}
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.order.city}
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    className={inputClassName}
                    placeholder={t.order.placeholders.city}
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.order.state}
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(event) => updateField("state", event.target.value)}
                    className={inputClassName}
                    placeholder={t.order.placeholders.state}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="zip"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.order.zip}
                  </label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    required
                    autoComplete="postal-code"
                    value={form.zip}
                    onChange={(event) => updateField("zip", event.target.value)}
                    className={inputClassName}
                    placeholder={t.order.placeholders.zip}
                  />
                </div>
              </div>

              {error ? (
                <p className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#CFC4BD]">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="mt-8 w-full rounded-xl bg-[#ECE5D8] py-4 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t.order.processing : t.order.continueToPayment}
              </button>

              <PaymentTrustBadges className="mt-6" variant="monochrome" />
            </form>
          )}

          <aside className="lg:sticky lg:top-24">
            <div className={glassCardClassName}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {t.order.summary}
                </h3>
                <a
                  href="#products"
                  className="text-xs font-semibold uppercase tracking-wider text-[#ECE5D8] hover:text-white"
                >
                  {t.order.addMore}
                </a>
              </div>

              {cart.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center text-sm text-[#A89A92]">
                  {t.order.emptyCart}
                </p>
              ) : (
                <ul className="mt-6 space-y-4 border-b border-white/10 pb-5">
                  {summary.lineItems.map((line) => {
                    const label = getLineLabel(
                      line.productId,
                      line.variantMg,
                      line.selectedStrength,
                      line.campaignAddonId,
                    );
                    const productImage =
                      catalogProducts.find(
                        (product) => product.id === line.productId,
                      )?.image ?? "/logo.png";
                    const catalogProduct = catalogProducts.find(
                      (product) => product.id === line.productId,
                    );
                    const maxQuantity =
                      line.productId === CAMPAIGN_ADDON_PRODUCT_ID ||
                      !catalogProduct
                        ? 99
                        : getMaxOrderableQuantity(
                            stockManagement,
                            line.productId,
                            getVariantLabelForSelection(
                              catalogProduct,
                              line.variantMg,
                              line.selectedStrength,
                            ),
                          );
                    const atMaxStock = line.quantity >= maxQuantity;

                    return (
                      <li
                        key={`${line.productId}-${line.variantMg}-${line.selectedStrength ?? ""}-${line.campaignAddonId ?? ""}`}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#181312]">
                          <ProductImage
                            src={productImage}
                            alt={label}
                            fill
                            framed={false}
                            sizes="56px"
                            className="object-contain p-1.5"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">{label}</p>
                          <p className="mt-0.5 text-xs text-[#A89A92]">
                            {formatCurrency(line.unitPrice, localeCode)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  line.productId,
                                  line.variantMg,
                                  line.quantity - 1,
                                  line.selectedStrength,
                                  line.campaignAddonId,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#ECE5D8] transition hover:bg-white/10"
                              aria-label={`${t.order.decreaseQty}: ${label}`}
                            >
                              −
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-semibold text-white">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  line.productId,
                                  line.variantMg,
                                  line.quantity + 1,
                                  line.selectedStrength,
                                  line.campaignAddonId,
                                )
                              }
                              disabled={atMaxStock}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#ECE5D8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`${t.order.increaseQty}: ${label}`}
                            >
                              +
                            </button>
                          </div>
                          {atMaxStock ? (
                            <p className="mt-1.5 text-xs font-medium text-[#CFC4BD]">
                              {t.cart.maxStockReached}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 font-semibold text-[#ECE5D8]">
                          {formatCurrency(line.lineSubtotal, localeCode)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-[#CFC4BD]">
                  <dt>{t.order.subtotal}</dt>
                  <dd className="font-medium text-white">
                    {formatCurrency(summary.subtotal, localeCode)}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-[#CFC4BD]">
                  <dt>{t.order.shipping}</dt>
                  <dd className="font-medium text-white">
                    {cart.length === 0 ? (
                      formatCurrency(0, localeCode)
                    ) : summary.shipping === 0 ? (
                      <span className="text-[#ECE5D8]">{t.order.free}</span>
                    ) : (
                      formatCurrency(summary.shipping, localeCode)
                    )}
                  </dd>
                </div>
                {cart.length > 0 && amountUntilFreeShipping > 0 ? (
                  <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-[#CFC4BD]">
                    {t.order.freeShippingHint.replace(
                      "{amount}",
                      String(amountUntilFreeShipping),
                    )}
                  </p>
                ) : null}
              </dl>

              <div className="mt-5 border-t border-white/10 pt-5">
                <label
                  htmlFor="discount-code"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                >
                  {t.order.discount.label}
                </label>
                <div className="flex gap-2">
                  <input
                    id="discount-code"
                    type="text"
                    value={discountInput}
                    onChange={(event) => {
                      setDiscountInput(event.target.value);
                      setDiscountFeedback(null);
                    }}
                    placeholder={t.order.discount.placeholder}
                    className={`${inputClassName} min-w-0 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={cart.length === 0 || !discountInput.trim()}
                    className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#ECE5D8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.order.discount.apply}
                  </button>
                </div>
                {discountFeedback ? (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      discountFeedback.type === "success"
                        ? "text-[#ECE5D8]"
                        : "text-[#CFC4BD]"
                    }`}
                  >
                    {discountFeedback.message}
                  </p>
                ) : null}
              </div>

              {summary.appliedCampaigns.length > 0 ? (
                <div className="mt-4 rounded-xl border border-[#ECE5D8]/25 bg-[#ECE5D8]/10 px-3 py-2 text-xs font-semibold text-[#ECE5D8]">
                  Kampanj:{" "}
                  {summary.appliedCampaigns
                    .map((campaign) => campaign.name)
                    .join(" · ")}
                </div>
              ) : null}

              {summary.campaignDiscount > 0 ? (
                <div className="mt-3 flex items-center justify-between text-sm text-[#ECE5D8]">
                  <span>Kampanjrabatt</span>
                  <span className="font-medium">
                    {formatCurrency(-summary.campaignDiscount, localeCode)}
                  </span>
                </div>
              ) : null}

              {summary.promoDiscount > 0 ? (
                <div className="mt-2 flex items-center justify-between text-sm text-[#ECE5D8]">
                  <span>
                    {t.order.discount.lineLabel}
                    {summary.appliedDiscountCode
                      ? ` (${summary.appliedDiscountCode})`
                      : ""}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(-summary.promoDiscount, localeCode)}
                  </span>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-base font-semibold text-white">
                  {t.order.total}
                </span>
                <span className="text-2xl font-bold text-[#ECE5D8]">
                  {formatCurrency(displayTotal, localeCode)}
                </span>
              </div>

              <CheckoutTrustSignals />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
