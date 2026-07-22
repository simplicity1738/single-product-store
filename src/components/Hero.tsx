"use client";

import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { resolveCampaignAddons } from "@/lib/campaign-addons";
import { formatMgOption } from "@/lib/i18n/translations";
import {
  getLocalizedProductDescription,
  getLocalizedProductName,
} from "@/lib/product-localization";
import { formatCurrency, type Product } from "@/lib/product";
import { isProductPurchasable, resolveEffectiveProductStockStatus } from "@/lib/product-stock";
import type { ConfigProduct, StoreConfig } from "@/lib/store-config";
import { getVariantBasePrice, getVariantPrice } from "@/lib/store-config";
import ProductSalePrice, { ProductSaleBadge } from "@/components/ProductSalePrice";
import StockStatusBadge from "@/components/StockStatusBadge";
import IncludedItemsBadge from "@/components/IncludedItemsBadge";
import HeroThemeDecorations, {
  HeroSupportBadge,
} from "@/components/HeroThemeDecorations";
import VariantStockLabel, {
  isVariantPurchasableWithStock,
} from "@/components/VariantStockLabel";
import {
  getVariantLabelForSelection,
  resolveVariantStockDisplay,
} from "@/lib/stock-management";

const heroDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

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

function HeroShowcase({ alt }: { alt: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [14, 0, -10],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [8, 0, -6],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.92, 1.04, 0.96],
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [36, -8, -28],
  );

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-[320px] items-center justify-center [perspective:1400px] sm:min-h-[420px] lg:min-h-[560px]"
    >
      {/* Soft spotlight / god-ray */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -right-8 top-[-10%] bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,255,255,0.55)_0%,rgba(255,241,242,0.18)_38%,transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 bottom-6 h-16 rounded-[100%] bg-rose-900/10 blur-2xl"
      />

      <motion.div
        style={{
          rotateY,
          rotateX,
          scale,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-full max-w-xl will-change-transform lg:max-w-none"
      >
        <div className="relative aspect-[5/4] w-full">
          <Image
            src="/simplicity-hero-showcase.png"
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-contain object-center drop-shadow-[0_28px_50px_rgba(87,40,55,0.18)]"
          />
        </div>
      </motion.div>
    </div>
  );
}

function HeroTrustPill({
  stats,
  badgeLabel,
}: {
  stats: {
    purity: { label: string; value: string };
    shipping: { label: string; value: string };
    support: { label: string; value: string };
  };
  badgeLabel: string;
}) {
  const items = [
    { label: stats.purity.label, value: stats.purity.value },
    { label: stats.shipping.label, value: stats.shipping.value },
    { label: stats.support.label, value: stats.support.value },
  ];
  const trimmedBadge = badgeLabel.trim();

  return (
    <div className="inline-flex max-w-full flex-col gap-2">
      <div className="inline-flex max-w-full items-stretch overflow-x-auto rounded-full border border-white/50 bg-white/35 shadow-[0_8px_40px_rgba(87,40,55,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`flex shrink-0 items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 ${
              index > 0 ? "border-l border-rose-200/50" : ""
            }`}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-rose-500 shadow-sm ring-1 ring-rose-100/80"
              aria-hidden
            >
              {index === 0 ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ) : index === 1 ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a49.902 49.902 0 00-2.659-.753M18.75 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402" />
                </svg>
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {item.label}
              </p>
              <p className="text-xs font-semibold tracking-wide text-zinc-800 sm:text-[13px]">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {trimmedBadge ? (
        <div className="pl-1">
          <HeroSupportBadge label={trimmedBadge} />
        </div>
      ) : null}
    </div>
  );
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
  const { stockManagement } = useStoreConfig();
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
  const variantLabel = featuredProduct
    ? getVariantLabelForSelection(featuredProduct, variantMg, featuredProduct.variantLabels?.[0])
    : "";
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
  const stockDisplay = featuredProduct
    ? resolveVariantStockDisplay(
        stockManagement,
        featuredProduct.id,
        variantLabel,
      )
    : { visible: false, quantity: 0, isLow: false, isSoldOut: false };
  const effectiveStatus = featuredProduct
    ? resolveEffectiveProductStockStatus(featuredProduct.status, stockDisplay)
    : "ej_i_lager";
  const purchasable = Boolean(
    featuredProduct &&
      isVariantPurchasableWithStock(
        isProductPurchasable(featuredProduct.status),
        stockDisplay,
        featuredProduct.status,
      ),
  );

  const variantSummary = featuredProduct
    ? featuredProduct.variantLabels && featuredProduct.variantLabels.length > 0
      ? featuredProduct.variantLabels.join(" · ")
      : featuredProduct.variants
          .map((variant) => formatMgOption(variant.mg))
          .join(" · ")
    : "";

  const campaignTag = siteSettings.campaignTag.trim();
  const campaignHeadline = siteSettings.campaignHeadline.trim();
  const hasHeroCopy = Boolean(campaignTag || campaignHeadline);
  const showcaseAlt = productName
    ? `${t.brand} — ${productName}`
    : `${t.brand} showcase`;

  return (
    <section className="relative min-h-[min(92vh,920px)] overflow-hidden border-b border-rose-100/60 bg-[linear-gradient(135deg,#f7eef1_0%,#f3e7ea_28%,#efe6e2_58%,#f8f4f1_100%)]">
      {/* Atmospheric depth + soft vignette (ONDO-inspired, rose-warm) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_40%,rgba(255,255,255,0.55)_0%,transparent_42%),radial-gradient(ellipse_at_88%_12%,rgba(255,255,255,0.42)_0%,transparent_40%),linear-gradient(180deg,rgba(87,40,55,0.06)_0%,transparent_38%,rgba(87,40,55,0.04)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-rose-200/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-[520px] w-[520px] rounded-full bg-white/50 blur-3xl"
      />

      <HeroThemeDecorations theme={campaignTheme} />

      <div className="relative z-10 mx-auto flex min-h-[min(92vh,920px)] max-w-7xl flex-col px-4 pb-28 pt-14 sm:px-6 sm:pb-32 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
          {/* Left: CMS-bound copy + campaign purchase */}
          <div className="relative z-10 flex flex-col text-left lg:py-6">
            <div className="relative z-10 max-w-xl">
              {hasHeroCopy ? (
                <div className="flex flex-col gap-5 sm:gap-6">
                  {campaignTag ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-500/90">
                      {campaignTag}
                    </p>
                  ) : null}

                  {campaignHeadline ? (
                    <h1
                      className={`${heroDisplay.className} max-w-[14ch] text-balance text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.01em] text-zinc-900 sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]`}
                    >
                      {campaignHeadline}
                    </h1>
                  ) : null}
                </div>
              ) : null}

              <div
                className={`flex flex-wrap items-center gap-3 ${hasHeroCopy ? "mt-8 sm:mt-10" : ""}`}
              >
                <a
                  href="#products"
                  className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-white px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-900 shadow-[0_10px_30px_rgba(87,40,55,0.12)] transition hover:bg-rose-50"
                >
                  {t.hero.ctaCampaign}
                  <span
                    aria-hidden
                    className="translate-x-0 transition group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </a>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-rose-200/80 bg-white/40 px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-800/90 backdrop-blur-sm transition hover:border-rose-300 hover:bg-white/70"
                >
                  {t.hero.ctaSecondary}
                </a>
              </div>

              {shippingMessage ? (
                <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                  {shippingMessage}
                </p>
              ) : null}
            </div>

            {/* Featured campaign product — all admin bindings preserved */}
            <div className="relative mt-8 max-w-xl lg:mt-10">
              {featuredProduct ? (
                <article className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_18px_50px_rgba(87,40,55,0.08)] backdrop-blur-xl sm:p-6">
                  {siteSettings.campaignDiscountBadge.trim() ? (
                    <div
                      className="absolute -left-2 -top-2 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 p-2 text-center text-[10px] font-extrabold leading-tight text-white shadow-lg sm:-left-3 sm:-top-3 sm:h-20 sm:w-20 sm:text-[11px]"
                      aria-label={siteSettings.campaignDiscountBadge}
                    >
                      {siteSettings.campaignDiscountBadge.trim()}
                    </div>
                  ) : null}

                  <ProductSaleBadge
                    basePrice={basePrice}
                    saleSettings={featuredProduct}
                    className="left-auto right-3 top-3"
                  />

                  <div className="space-y-3 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className={`${heroDisplay.className} text-2xl font-semibold text-zinc-900`}>
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
                      status={effectiveStatus}
                      label={t.products.stockStatus[effectiveStatus]}
                    />

                    {includedItems ? (
                      <IncludedItemsBadge items={includedItems} />
                    ) : null}

                    {variantSummary ? (
                      <p className="text-sm font-medium text-rose-600">
                        {variantSummary}
                      </p>
                    ) : null}

                    <p className="text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
                      {productDescription}
                    </p>

                    {siteSettings.showAddons && siteSettings.campaignAddons.length > 0 ? (
                      <div className="space-y-2 border-t border-rose-100/80 pt-4">
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
                                    : "border-rose-100/80 bg-white/60 hover:border-rose-200 hover:bg-rose-50/40"
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
                      <div className="flex items-center justify-between rounded-xl bg-rose-50/70 px-3 py-2">
                        <span className="text-sm font-medium text-zinc-700">
                          Paket totalt
                        </span>
                        <span className="text-base font-bold text-zinc-900">
                          {formatCurrency(bundleTotal, localeCode)}
                        </span>
                      </div>
                    ) : null}

                    {purchasable ||
                    (stockDisplay.visible && stockDisplay.quantity <= 0) ||
                    effectiveStatus === "ej_i_lager" ? (
                      <>
                        <VariantStockLabel
                          display={stockDisplay}
                          className="mt-2 text-center"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            purchasable
                              ? addToCart(
                                  featuredProduct.id,
                                  variantMg,
                                  featuredProduct.variantLabels?.[0],
                                )
                              : undefined
                          }
                          disabled={!purchasable}
                          className="mt-1 w-full rounded-full bg-zinc-900 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:hover:bg-zinc-300"
                        >
                          {purchasable
                            ? t.products.addToCart
                            : t.products.soldOut}
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              ) : (
                <div className="flex min-h-[120px] items-center justify-center rounded-3xl border border-dashed border-rose-200/80 bg-white/50 p-6 text-center text-sm text-zinc-500 backdrop-blur-sm">
                  {t.hero.featuredLabel}: ingen produkt vald
                </div>
              )}
            </div>

            {campaignProgressPercent > 0 ? (
              <div className="relative mt-6 max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-white/50">
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
                  {siteSettings.campaignTickerText.trim() ? (
                    <p className="text-xs font-medium text-rose-700/90 sm:text-sm">
                      {siteSettings.campaignTickerText.trim()}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: 3D scroll showcase */}
          <div className="relative z-10">
            <HeroShowcase alt={showcaseAlt} />
          </div>
        </div>

        {/* Glassmorphic trust badges — pinned bottom-left of hero */}
        <div className="pointer-events-none absolute inset-x-4 bottom-6 z-20 sm:inset-x-6 lg:inset-x-8 lg:bottom-8">
          <div className="pointer-events-auto max-w-7xl">
            <HeroTrustPill
              stats={t.hero.stats}
              badgeLabel={siteSettings.heroBadge}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
