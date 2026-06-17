"use client";

import { useEffect, useState } from "react";
import ProductImage from "@/components/ProductImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { resolveCampaignAddons } from "@/lib/campaign-addons";
import { formatMgOption } from "@/lib/i18n/translations";
import {
  getLocalizedProductDescription,
  getLocalizedProductName,
} from "@/lib/product-localization";
import { formatCurrency, type Product } from "@/lib/product";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";
import { isProductPurchasable } from "@/lib/product-stock";
import type { ConfigProduct, StoreConfig } from "@/lib/store-config";
import { getVariantBasePrice, getVariantPrice } from "@/lib/store-config";
import ProductSalePrice, { ProductSaleBadge } from "@/components/ProductSalePrice";
import StockStatusBadge from "@/components/StockStatusBadge";
import IncludedItemsBadge from "@/components/IncludedItemsBadge";
import HeroThemeDecorations, {
  HeroSupportBadge,
} from "@/components/HeroThemeDecorations";

type HeroProps = {
  siteSettings: StoreConfig["siteSettings"];
  featuredProduct: Product | null;
  featuredConfigProduct: ConfigProduct | null;
};

function useSameDayShippingMessage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setMessage(
      hour < 16
        ? "🚚 Beställ under dagen — skickas med PostNord idag!"
        : "🚚 Skickas nästkommande arbetsdag.",
    );
  }, []);

  return message;
}

function useCampaignProgressBar(targetPercent: number) {
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDisplayPercent(targetPercent);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [targetPercent]);

  return displayPercent;
}

export default function Hero({
  siteSettings,
  featuredProduct,
  featuredConfigProduct,
}: HeroProps) {
  const { locale, t } = useLanguage();
  const {
    addToCart,
    setCampaignAddonSelected,
    isCampaignAddonSelected,
  } = useProductSelection();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";
  const shippingMessage = useSameDayShippingMessage();
  const campaignProgressPercent =
    siteSettings.campaignProgressPercent ?? 85;
  const progressBarWidth = useCampaignProgressBar(campaignProgressPercent);
  const campaignTheme = siteSettings.campaignTheme;

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
  const basePrice = featuredProduct
    ? getVariantBasePrice(featuredProduct, variantMg, variantLabel)
    : 0;
  const displayPrice = featuredProduct
    ? getVariantPrice(featuredProduct, variantMg, variantLabel)
    : 0;

  const campaignAddons = resolveCampaignAddons(siteSettings);
  const selectedAddonTotal = campaignAddons.reduce(
    (sum, addon) =>
      isCampaignAddonSelected(addon.id) ? sum + addon.price : sum,
    0,
  );
  const bundleTotal = displayPrice + selectedAddonTotal;
  const purchasable =
    featuredProduct && isProductPurchasable(featuredProduct.status);

  const variantSummary = featuredProduct
    ? featuredProduct.variantLabels && featuredProduct.variantLabels.length > 0
      ? featuredProduct.variantLabels.join(" · ")
      : featuredProduct.variants
          .map((variant) => formatMgOption(variant.mg))
          .join(" · ")
    : "";

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <HeroThemeDecorations theme={campaignTheme} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative z-10 flex flex-col text-left lg:py-4">
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
                {siteSettings.campaignTag}
              </p>

              <h1 className="mt-5 max-w-xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {siteSettings.campaignHeadline}
              </h1>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                <a
                  href="#products"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-rose-400 px-8 text-sm font-semibold text-white shadow-lg shadow-rose-400/25 transition hover:bg-rose-500"
                >
                  {t.hero.ctaCampaign}
                </a>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-rose-200 bg-white px-8 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  {t.hero.ctaSecondary}
                </a>
              </div>

              <HeroSupportBadge label={siteSettings.heroBadge} />

              {shippingMessage ? (
                <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  {shippingMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 rounded-3xl border border-rose-100/30 bg-gradient-to-br from-rose-50/30 to-white/40 p-6 md:p-8">
            {featuredProduct ? (
              <article className="relative rounded-3xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/40 sm:p-8">
                <div
                  className="absolute -left-3 -top-3 z-10 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 p-2 text-center text-[11px] font-extrabold leading-tight text-white shadow-lg sm:-left-4 sm:-top-4 sm:h-24 sm:w-24 sm:text-xs"
                  aria-label={siteSettings.campaignDiscountBadge}
                >
                  {siteSettings.campaignDiscountBadge}
                </div>

                <ProductSaleBadge
                  basePrice={basePrice}
                  saleSettings={featuredProduct}
                  className="left-auto right-4 top-4"
                />

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
                    <ProductSalePrice
                      basePrice={basePrice}
                      saleSettings={featuredProduct}
                      locale={localeCode}
                      size="lg"
                    />
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

                  {siteSettings.showAddons && siteSettings.campaignAddons.length > 0 ? (
                    <div className="space-y-2 border-t border-rose-100 pt-4">
                      {siteSettings.campaignAddons
                        .filter((addon) => addon.label.trim())
                        .map((addon) => {
                          const checked = isCampaignAddonSelected(addon.id);
                          return (
                            <label
                              key={addon.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                                checked
                                  ? "border-rose-300 bg-rose-50/80"
                                  : "border-rose-100 bg-white hover:border-rose-200 hover:bg-rose-50/40"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) =>
                                  setCampaignAddonSelected(
                                    addon.id,
                                    event.target.checked,
                                  )
                                }
                                className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                              />
                              <span className="text-sm leading-snug text-zinc-700">
                                {addon.label}{" "}
                                <span className="font-semibold text-rose-600">
                                  (+{addon.price} kr)
                                </span>
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  ) : null}

                  {selectedAddonTotal > 0 ? (
                    <div className="flex items-center justify-between rounded-xl bg-rose-50/60 px-3 py-2">
                      <span className="text-sm font-medium text-zinc-700">
                        Paket totalt
                      </span>
                      <span className="text-base font-bold text-zinc-900">
                        {formatCurrency(bundleTotal, localeCode)}
                      </span>
                    </div>
                  ) : null}

                  {purchasable ? (
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(featuredProduct.id, variantMg, variantLabel)
                      }
                      className="mt-1 w-full rounded-full bg-rose-400 py-3 text-sm font-semibold text-white shadow-md shadow-rose-400/20 transition hover:bg-rose-500"
                    >
                      {t.products.addToCart}
                    </button>
                  ) : null}
                </div>
              </article>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-rose-200 bg-white/70 p-8 text-center text-sm text-zinc-500">
                {t.hero.featuredLabel}: ingen produkt vald
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-10 max-w-3xl lg:mt-12">
          {campaignProgressPercent > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-rose-100">
                <div
                  className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-[0_0_12px_rgba(251,113,133,0.45)] transition-all duration-1000 ease-out motion-safe:animate-progress-glow"
                  style={{ width: `${progressBarWidth}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(progressBarWidth)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={siteSettings.campaignTickerText}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent motion-safe:animate-progress-shimmer-wave" />
                </div>
              </div>
              <p className="text-xs font-medium text-rose-700 sm:text-sm">
                {siteSettings.campaignTickerText}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
