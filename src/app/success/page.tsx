"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/product";
import { ORDER_STORAGE_KEY, type OrderReceipt } from "@/lib/order";

function readStoredOrder(): OrderReceipt | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(ORDER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OrderReceipt;
  } catch {
    return null;
  }
}

export default function SuccessReceipt() {
  const { locale, t } = useLanguage();
  const [order] = useState<OrderReceipt | null>(readStoredOrder);
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const placedDate = order
    ? new Date(order.placedAt).toLocaleString(localeCode, {
        dateStyle: "long",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 via-white to-rose-50/30">
      <header className="border-b border-rose-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={t.brand}
              width={100}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden text-xs font-medium uppercase tracking-wide text-rose-600 sm:inline">
              {t.success.confirmed}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t.success.title}
          </h1>
          <p className="mt-3 text-lg text-zinc-600">{t.success.subtitle}</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-xl shadow-rose-200/30">
          <div className="border-b border-rose-900/10 bg-zinc-900 px-6 py-5 text-white sm:px-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-rose-300">
                  {t.success.receipt}
                </p>
                <p className="mt-1 font-mono text-sm sm:text-base">
                  {order?.orderId ?? "—"}
                </p>
              </div>
              <p className="text-sm text-zinc-300">
                {placedDate ?? t.success.justNow}
              </p>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {order ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {t.success.customer}
                    </h2>
                    <p className="mt-2 font-medium text-zinc-900">
                      {order.name}
                    </p>
                    <p className="text-sm text-zinc-600">{order.email}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {t.success.shippingTo}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                      {order.address}
                      <br />
                      {order.city}, {order.state} {order.zip}
                    </p>
                  </div>
                </div>

                <div className="mt-8 overflow-hidden rounded-xl border border-rose-100">
                  <table className="w-full text-sm">
                    <thead className="bg-rose-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          {t.success.item}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {t.success.qty}
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          {t.success.amount}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr
                          key={`${item.productId}-${item.variantMg}`}
                          className="border-t border-rose-100"
                        >
                          <td className="px-4 py-4 font-medium text-zinc-900">
                            {item.productName}
                          </td>
                          <td className="px-4 py-4 text-zinc-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-zinc-900">
                            {formatCurrency(item.lineSubtotal, localeCode)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <dl className="mt-6 space-y-2 border-t border-rose-100 pt-6 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <dt>{t.success.subtotal}</dt>
                    <dd>{formatCurrency(order.subtotal, localeCode)}</dd>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <dt>{t.success.shipping}</dt>
                    <dd>
                      {order.shipping === 0
                        ? t.success.free
                        : formatCurrency(order.shipping, localeCode)}
                    </dd>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <dt>
                        {t.success.discount}
                        {order.discountCode ? ` (${order.discountCode})` : ""}
                      </dt>
                      <dd>{formatCurrency(-order.discount, localeCode)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-rose-100 pt-3 text-base font-semibold text-zinc-900">
                    <dt>{t.success.totalPaid}</dt>
                    <dd>{formatCurrency(order.total, localeCode)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-zinc-600">{t.success.noOrder}</p>
                <Link
                  href="/#order"
                  className="mt-4 inline-flex text-sm font-semibold text-rose-600 hover:text-rose-700"
                >
                  {t.success.placeNew}
                </Link>
              </div>
            )}
          </div>
        </div>

        {order && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-center sm:text-left">
            <p className="text-sm font-medium text-rose-900">
              {t.success.emailConfirm}{" "}
              <span className="font-semibold">{order.email}</span>
            </p>
            <p className="mt-1 text-sm text-rose-700">{t.success.delivery}</p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-rose-400 px-8 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            {t.success.continue}
          </Link>
        </div>
      </main>
    </div>
  );
}
