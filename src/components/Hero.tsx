"use client";

import ProductImage from "@/components/ProductImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMgOption } from "@/lib/i18n/translations";
import {
  getLocalizedProductDescription,
  getLocalizedProductName,
} from "@/lib/product-localization";
import { formatCurrency, type Product } from "@/lib/product";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";
import type { ConfigProduct, StoreConfig } from "@/lib/store-config";
import { getVariantPrice } from "@/lib/store-config";
import StockStatusBadge from "@/components/StockStatusBadge";
import IncludedItemsBadge from "@/components/IncludedItemsBadge";

type HeroProps = {
  siteSettings: StoreConfig["siteSettings"];
  featuredProduct: Product | null;
  featuredConfigProduct: ConfigProduct | null;
};

export default function Hero({
  siteSettings,
  featuredProduct,
  featuredConfigProduct,
}: HeroProps) {
  const { locale, t } = useLanguage();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const configEntry = featuredConfigProduct ?? undefined;

  const productName = featuredProduct
    ? getLocalizedProductName(configEntry, featuredProduct.id, locale)
    : "";
  const productDescription = featuredProduct
    ? getLocalizedProductDescription(configEntry, featuredProduct.id, locale)
    : "";
  const includedItems = featuredConfigProduct?.includedItems?.trim() ?? "";

  const variantMg = featuredProduct?.variants[0]?.mg ?? 0;
  const variantLabel = featuredProduct?.variantLabels?.[0];
  const displayPrice = featuredProduct
    ? getVariantPrice(featuredProduct, variantMg, variantLabel)
    : 0;

  const variantSummary = featuredProduct
    ? featuredProduct.variantLabels && featuredProduct.variantLabels.length > 0
      ? featuredProduct.variantLabels.join(" · ")
      : featuredProduct.variants
          .map((variant) => formatMgOption(variant.mg))
          .join(" · ")
    : "";

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
              {siteSettings.campaignTag}
            </p>

            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {siteSettings.campaignHeadline}
            </h1>

            <div className="mt-8">
              <a
                href="#products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-rose-400 px-8 text-sm font-semibold text-white shadow-lg shadow-rose-400/25 transition hover:bg-rose-500"
              >
                {t.hero.ctaCampaign}
              </a>
            </div>
          </div>

          {featuredProduct ? (
            <article className="relative rounded-3xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/40 sm:p-8">
              <div
                className="absolute -left-3 -top-3 z-10 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 p-2 text-center text-[11px] font-extrabold leading-tight text-white shadow-lg sm:-left-4 sm:-top-4 sm:h-24 sm:w-24 sm:text-xs"
                aria-label={siteSettings.campaignDiscountBadge}
              >
                {siteSettings.campaignDiscountBadge}
              </div>

              <div
                className={`relative mx-auto mb-6 flex aspect-square max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 ${PRODUCT_IMAGE_FRAME_CLASS}`}
              >
                <ProductImage
                  src={featuredProduct.image}
                  alt={productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-6 mix-blend-multiply"
                />
              </div>

              <div className="space-y-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                    {productName}
                  </h2>
                  <p className="text-lg font-bold text-zinc-900">
                    {formatCurrency(displayPrice, localeCode)}
                  </p>
                </div>

                <StockStatusBadge
                  status={featuredProduct.status}
                  label={t.products.stockStatus[featuredProduct.status]}
                />

                {includedItems ? (
                  <IncludedItemsBadge items={includedItems} />
                ) : null}

                {variantSummary ? (
                  <p className="text-sm font-medium text-rose-600">
                    {variantSummary}
                  </p>
                ) : null}

                <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
                  {productDescription}
                </p>
              </div>
            </article>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-rose-200 bg-white/70 p-8 text-center text-sm text-zinc-500">
              {t.hero.featuredLabel}: ingen produkt vald
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center lg:mt-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
            {siteSettings.heroBadge}
          </span>
        </div>
      </div>
    </section>
  );
}
