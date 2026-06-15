"use client";

import { useMemo } from "react";
import ProductImage from "@/components/ProductImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  formatCurrency,
  getProductVariant,
  shouldShowSizeLabel,
} from "@/lib/product";
import type { Product } from "@/lib/product";
import { formatMgOption } from "@/lib/i18n/translations";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";
import { isProductPurchasable } from "@/lib/product-stock";
import StockStatusBadge from "@/components/StockStatusBadge";

const selectClassName =
  "mt-2 w-full appearance-none rounded-xl border border-rose-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-zinc-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200";

type DisplayProduct = Product & {
  displayName: string;
  displayDescription: string;
};

export default function Products() {
  const { locale, t } = useLanguage();
  const { products: configProducts, catalogProducts } = useStoreConfig();
  const { cardVariants, setCardVariantMg, addToCart } = useProductSelection();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const displayProducts = useMemo<DisplayProduct[]>(() => {
    return catalogProducts.map((product) => {
      const entry = configProducts.find((item) => item.id === product.id);
      return {
        ...product,
        displayName: entry?.title ?? product.id,
        displayDescription: entry?.description ?? "",
      };
    });
  }, [catalogProducts, configProducts]);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section id="products" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            {t.products.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t.products.title}
          </h2>
          <p className="mt-4 text-lg text-zinc-600">{t.products.subtitle}</p>
        </div>

        <div
          aria-label={t.products.title}
          className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {displayProducts.map((product) => {
            const variantMg =
              cardVariants[product.id] ?? product.variants[0].mg;
            const activeVariant =
              getProductVariant(product.id, variantMg) ?? product.variants[0];
            const hasMultipleVariants = product.variants.length > 1;
            const purchasable = isProductPurchasable(product.status);
            const buttonLabel =
              product.status === "kommer_snart"
                ? t.products.comingSoonButton
                : product.status === "ej_i_lager"
                  ? t.products.soldOut
                  : t.products.addToCart;

            return (
              <article
                key={product.id}
                className="group relative flex flex-col rounded-2xl border border-rose-100 bg-rose-50/30 p-5 text-left transition hover:border-rose-200 hover:bg-rose-50 hover:shadow-md sm:p-6"
              >
                {product.badge && (
                  <span className="absolute right-4 top-4 z-10 rounded-full bg-rose-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {t.products.badges[product.badge]}
                  </span>
                )}

                <div className="mb-4 flex items-center justify-end gap-2">
                  <StockStatusBadge
                    status={product.status}
                    label={t.products.stockStatus[product.status]}
                  />
                </div>

                <div
                  className={`relative mb-5 flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-rose-100 ${PRODUCT_IMAGE_FRAME_CLASS}`}
                >
                  <ProductImage
                    src={product.image}
                    alt={product.displayName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-contain p-4 mix-blend-multiply transition duration-300 group-hover:scale-105"
                  />
                </div>

                <h3 className="text-base font-semibold leading-snug text-zinc-900 sm:text-lg">
                  {product.displayName}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
                  {product.displayDescription}
                </p>

                {hasMultipleVariants ? (
                  <div className="relative mt-4">
                    <label
                      htmlFor={`variant-${product.id}`}
                      className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                    >
                      {t.products.variantLabel}
                    </label>
                    <select
                      id={`variant-${product.id}`}
                      value={variantMg}
                      onChange={(event) =>
                        setCardVariantMg(product.id, Number(event.target.value))
                      }
                      className={selectClassName}
                    >
                      {product.variants.map((variant) => (
                        <option key={variant.mg} value={variant.mg}>
                          {formatMgOption(variant.mg)} —{" "}
                          {formatCurrency(variant.price, localeCode)}
                        </option>
                      ))}
                    </select>
                    <span
                      className="pointer-events-none absolute bottom-3 right-3 text-zinc-400"
                      aria-hidden
                    >
                      ▾
                    </span>
                  </div>
                ) : shouldShowSizeLabel(product.sizeLabel) ? (
                  <p className="mt-4 text-sm font-medium text-rose-600">
                    {product.sizeLabel!.trim()}
                  </p>
                ) : null}

                <div className="mt-5 flex items-end justify-between gap-3 border-t border-rose-100 pt-5">
                  <div>
                    <p className="text-xl font-bold text-zinc-900">
                      {formatCurrency(activeVariant.price, localeCode)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(product.id, variantMg)}
                    disabled={!purchasable}
                    className="rounded-full bg-rose-400 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:hover:bg-zinc-300"
                  >
                    {buttonLabel}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const featureIcons = [
  "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a49.902 49.902 0 00-2.659-.753M18.75 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15",
];

export function Features() {
  const { t } = useLanguage();

  return (
    <>
      <section id="features" className="scroll-mt-24 bg-rose-50/50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
              {t.features.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {t.features.title}
            </h2>
            <p className="mt-4 text-lg text-zinc-600">{t.features.subtitle}</p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((feature, index) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-rose-100 bg-white p-6 transition hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-400 text-white transition group-hover:bg-rose-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={featureIcons[index]}
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="quality"
        className="scroll-mt-24 border-y border-rose-900/20 bg-zinc-900 py-20 text-white sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-400">
              {t.quality.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.quality.title}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-300">
              {t.quality.description}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-700 bg-zinc-800/50 p-8">
            <ul className="space-y-5">
              {t.quality.checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-400/20 text-rose-400">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed text-zinc-200">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
