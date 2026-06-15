"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import ProductImage from "@/components/ProductImage";
import PaymentStep from "@/components/PaymentStep";
import {
  formatCurrency,
} from "@/lib/product";
import type { OrderFormData } from "@/lib/order";

const inputClassName =
  "w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200";

type CheckoutStep = "details" | "payment";

export default function OrderForm() {
  const { locale, t } = useLanguage();
  const { cart, updateCartQuantity } = useProductSelection();
  const { calculateOrderTotal, getLineLabel, validateDiscount, catalogProducts, storeConfig } =
    useStoreConfig();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("details");
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
    setCheckoutStep("payment");
    setIsSubmitting(false);
  }

  return (
    <section id="checkout-form" className="scroll-mt-24 bg-rose-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            {t.order.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t.order.title}
          </h2>
          <p className="mt-4 text-lg text-zinc-600">{t.order.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {checkoutStep === "payment" ? (
            <PaymentStep
              orderTotal={displayTotal}
              payload={orderPayload}
              summary={summary}
              onBack={() => setCheckoutStep("details")}
            />
          ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                  className="mb-2 block text-sm font-medium text-zinc-700"
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

            {error && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t.order.processing : t.order.continueToPayment}
            </button>
          </form>
          )}

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {t.order.summary}
                </h3>
                <a
                  href="#products"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  {t.order.addMore}
                </a>
              </div>

              {cart.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-4 py-8 text-center text-sm text-zinc-500">
                  {t.order.emptyCart}
                </p>
              ) : (
                <ul className="mt-6 space-y-4 border-b border-rose-100 pb-5">
                  {summary.lineItems.map((line) => {
                    const label = getLineLabel(line.productId, line.variantMg);
                    const productImage =
                      catalogProducts.find(
                        (product) => product.id === line.productId,
                      )?.image ?? "/logo.png";

                    return (
                      <li
                        key={`${line.productId}-${line.variantMg}`}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-gradient-to-br from-[#FFF5F5] to-rose-50">
                          <ProductImage
                            src={productImage}
                            alt={label}
                            fill
                            sizes="56px"
                            className="object-contain p-1.5"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-zinc-900">{label}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
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
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-sm font-medium text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50"
                              aria-label={`${t.order.decreaseQty}: ${label}`}
                            >
                              −
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-semibold text-zinc-900">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  line.productId,
                                  line.variantMg,
                                  line.quantity + 1,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-sm font-medium text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50"
                              aria-label={`${t.order.increaseQty}: ${label}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <p className="shrink-0 font-semibold text-zinc-900">
                          {formatCurrency(line.lineSubtotal, localeCode)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-zinc-600">
                  <dt>{t.order.subtotal}</dt>
                  <dd className="font-medium text-zinc-900">
                    {formatCurrency(summary.subtotal, localeCode)}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <dt>{t.order.shipping}</dt>
                  <dd className="font-medium text-zinc-900">
                    {cart.length === 0 ? (
                      formatCurrency(0, localeCode)
                    ) : summary.shipping === 0 ? (
                      <span className="text-rose-600">{t.order.free}</span>
                    ) : (
                      formatCurrency(summary.shipping, localeCode)
                    )}
                  </dd>
                </div>
                {cart.length > 0 && amountUntilFreeShipping > 0 && (
                    <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      {t.order.freeShippingHint.replace(
                        "{amount}",
                        String(amountUntilFreeShipping),
                      )}
                    </p>
                  )}
              </dl>

              <div className="mt-5 border-t border-rose-100 pt-5">
                <label
                  htmlFor="discount-code"
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                    className="shrink-0 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.order.discount.apply}
                  </button>
                </div>
                {discountFeedback && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      discountFeedback.type === "success"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {discountFeedback.message}
                  </p>
                )}
              </div>

              {summary.discount > 0 && (
                <div className="mt-4 flex items-center justify-between text-sm text-emerald-700">
                  <span>
                    {t.order.discount.lineLabel}
                    {summary.appliedDiscountCode
                      ? ` (${summary.appliedDiscountCode})`
                      : ""}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(-summary.discount, localeCode)}
                  </span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-rose-100 pt-5">
                <span className="text-base font-semibold text-zinc-900">
                  {t.order.total}
                </span>
                <span className="text-2xl font-bold text-zinc-900">
                  {formatCurrency(displayTotal, localeCode)}
                </span>
              </div>

              <ul className="mt-6 space-y-2 text-xs text-zinc-500">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  {t.order.secureNote}
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  {t.order.shipsNote}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
