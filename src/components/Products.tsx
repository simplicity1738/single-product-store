"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import ProductImage from "@/components/ProductImage";
import ProductDetailsDrawer from "@/components/ProductDetailsDrawer";
import StrengthSelector from "@/components/StrengthSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { isSiteSectionVisible } from "@/lib/site-navigation";
import { getVariantBasePrice, getVariantPrice } from "@/lib/store-config";
import ProductSalePrice, { ProductSaleBadge } from "@/components/ProductSalePrice";
import {
  getLocalizedProductDescription,
  getLocalizedProductName,
} from "@/lib/product-localization";
import {
  formatCurrency,
  shouldShowSizeLabel,
} from "@/lib/product";
import type { Product } from "@/lib/product";
import { formatMgOption } from "@/lib/i18n/translations";
import { isProductOnSale } from "@/lib/product-sale";
import { isProductPurchasable, resolveEffectiveProductStockStatus } from "@/lib/product-stock";
import StockStatusBadge from "@/components/StockStatusBadge";
import VariantStockLabel, {
  isVariantPurchasableWithStock,
} from "@/components/VariantStockLabel";
import {
  getVariantLabelForSelection,
  resolveVariantStockDisplay,
} from "@/lib/stock-management";

const carouselArrowClassName =
  "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-md transition-all hover:bg-[#ECE5D8] hover:text-[#0F0C0B]";

const variantFieldLabelClassName =
  "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#A89A92]";

const productDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const qualityDisplay = productDisplay;

const selectClassName =
  "w-full appearance-none rounded-xl border border-white/15 bg-[#181312] px-3 py-2.5 pr-9 text-sm font-medium text-[#ECE5D8] outline-none transition focus:border-[#ECE5D8]/40 focus:ring-1 focus:ring-[#ECE5D8]/20";

type DisplayProduct = Product & {
  displayName: string;
  displayDescription: string;
  displayIncludedItems: string;
};

export default function Products() {
  const { locale, t } = useLanguage();
  const { products: configProducts, catalogProducts, siteNavigation, stockManagement } =
    useStoreConfig();
  const { cardVariants, setCardVariantMg, addToCart } = useProductSelection();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  function scrollCarousel(direction: "left" | "right", distance = 800) {
    carouselRef.current?.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
  }

  const displayProducts = useMemo<DisplayProduct[]>(() => {
    return catalogProducts.map((product) => {
      const entry = configProducts.find((item) => item.id === product.id);
      return {
        ...product,
        displayName: getLocalizedProductName(entry, product.id, locale),
        displayDescription: getLocalizedProductDescription(
          entry,
          product.id,
          locale,
        ),
        displayIncludedItems: entry?.includedItems?.trim() ?? "",
      };
    });
  }, [catalogProducts, configProducts, locale]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    function updateActiveSlide() {
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0 || displayProducts.length <= 1) {
        setActiveSlide(0);
        return;
      }
      const progress = el.scrollLeft / maxScroll;
      setActiveSlide(Math.round(progress * (displayProducts.length - 1)));
    }

    updateActiveSlide();
    el.addEventListener("scroll", updateActiveSlide, { passive: true });
    window.addEventListener("resize", updateActiveSlide);

    return () => {
      el.removeEventListener("scroll", updateActiveSlide);
      window.removeEventListener("resize", updateActiveSlide);
    };
  }, [displayProducts.length]);

  const detailsProduct = useMemo(
    () => displayProducts.find((product) => product.id === detailsProductId) ?? null,
    [displayProducts, detailsProductId],
  );

  if (!isSiteSectionVisible(siteNavigation, "produkter")) {
    return null;
  }

  if (displayProducts.length === 0) {
    return null;
  }

  const detailsVariantLabels = detailsProduct?.variantLabels ?? [];
  const detailsHasNamedVariants = detailsVariantLabels.length > 0;
  const detailsVariantMg = detailsProduct
    ? detailsHasNamedVariants
      ? (cardVariants[detailsProduct.id] ?? detailsProduct.variants[0]?.mg ?? 0)
      : (cardVariants[detailsProduct.id] ?? detailsProduct.variants[0].mg)
    : 0;
  const detailsActiveStrength =
    detailsProduct && detailsHasNamedVariants
      ? (detailsVariantLabels[detailsVariantMg] ?? detailsVariantLabels[0] ?? "")
      : undefined;
  const detailsDosePill = detailsProduct
    ? detailsHasNamedVariants
      ? (detailsActiveStrength ?? detailsVariantLabels[0] ?? "")
      : shouldShowSizeLabel(detailsProduct.sizeLabel)
        ? detailsProduct.sizeLabel!.trim()
        : formatMgOption(detailsVariantMg)
    : "";
  const detailsBasePrice = detailsProduct
    ? getVariantBasePrice(
        detailsProduct,
        detailsVariantMg,
        detailsActiveStrength,
      )
    : 0;
  const detailsVariantLabel = detailsProduct
    ? getVariantLabelForSelection(
        detailsProduct,
        detailsVariantMg,
        detailsActiveStrength,
      )
    : "";
  const detailsStockDisplay = detailsProduct
    ? resolveVariantStockDisplay(
        stockManagement,
        detailsProduct.id,
        detailsVariantLabel,
      )
    : { visible: false, quantity: 0, isSoldOut: false, isLow: false };
  const detailsEffectiveStatus = detailsProduct
    ? resolveEffectiveProductStockStatus(
        detailsProduct.status,
        detailsStockDisplay,
      )
    : "i_lager";
  const detailsPurchasable = detailsProduct
    ? isVariantPurchasableWithStock(
        isProductPurchasable(detailsProduct.status),
        detailsStockDisplay,
        detailsProduct.status,
      )
    : false;
  const detailsButtonLabel = detailsProduct
    ? detailsEffectiveStatus === "kommer_snart"
      ? t.products.comingSoonButton
      : detailsStockDisplay.visible
        ? detailsStockDisplay.quantity > 0
          ? t.products.addToCart
          : t.products.soldOut
        : detailsEffectiveStatus === "ej_i_lager"
          ? t.products.soldOut
          : t.products.addToCart
    : t.products.addToCart;

  return (
    <section id="products" className="scroll-mt-24 bg-[#0F0C0B] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="mx-auto mb-6 max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8] opacity-80">
            {t.products.eyebrow}
          </p>
          <h2
            className={`${productDisplay.className} mt-3 text-3xl font-serif tracking-tight text-white md:text-5xl`}
          >
            {t.products.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#CFC4BD] md:text-base">
            {t.products.subtitle}
          </p>
        </div>

        <div
          ref={carouselRef}
          aria-label={t.products.title}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth py-4"
        >
          {displayProducts.map((product) => {
            const variantLabels = product.variantLabels ?? [];
            const hasNamedVariants = variantLabels.length > 0;
            const hasMultipleNamedVariants = variantLabels.length > 1;
            const hasMultipleMgVariants =
              !hasNamedVariants && product.variants.length > 1;

            const variantMg = hasNamedVariants
              ? (cardVariants[product.id] ?? product.variants[0]?.mg ?? 0)
              : (cardVariants[product.id] ?? product.variants[0].mg);
            const activeStrength = hasNamedVariants
              ? (variantLabels[variantMg] ?? variantLabels[0] ?? "")
              : undefined;
            const basePrice = getVariantBasePrice(
              product,
              variantMg,
              activeStrength,
            );
            const variantLabel = getVariantLabelForSelection(
              product,
              variantMg,
              activeStrength,
            );
            const stockDisplay = resolveVariantStockDisplay(
              stockManagement,
              product.id,
              variantLabel,
            );
            const effectiveStatus = resolveEffectiveProductStockStatus(
              product.status,
              stockDisplay,
            );
            const purchasable = isVariantPurchasableWithStock(
              isProductPurchasable(product.status),
              stockDisplay,
              product.status,
            );
            const buttonLabel =
              effectiveStatus === "kommer_snart"
                ? t.products.comingSoonButton
                : stockDisplay.visible
                  ? stockDisplay.quantity > 0
                    ? t.products.addToCart
                    : t.products.soldOut
                  : effectiveStatus === "ej_i_lager"
                    ? t.products.soldOut
                    : t.products.addToCart;

            const dosePill = hasNamedVariants
              ? (activeStrength ?? variantLabels[0] ?? "")
              : shouldShowSizeLabel(product.sizeLabel)
                ? product.sizeLabel!.trim()
                : formatMgOption(variantMg);
            const onSale = isProductOnSale(product);

            return (
              <article
                key={product.id}
                className="group relative flex w-[85%] min-w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 lg:w-[calc(25%-18px)]"
              >
                <div className="relative mb-4 flex h-[210px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#1C1715] p-4">
                  <ProductSaleBadge
                    basePrice={basePrice}
                    saleSettings={product}
                  />

                  {!onSale && product.badge ? (
                    <span className="absolute top-3 left-3 z-20 rounded-full bg-[#ECE5D8] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#0F0C0B] shadow-md">
                      {t.products.badges[product.badge]}
                    </span>
                  ) : null}

                  <div className="absolute top-3 right-3 z-20">
                    <StockStatusBadge
                      status={effectiveStatus}
                      label={t.products.stockStatus[effectiveStatus]}
                    />
                  </div>

                  <ProductImage
                    src={product.image}
                    alt={product.displayName}
                    fill
                    framed={false}
                    sizes="(max-width: 1024px) 85vw, 25vw"
                    className="h-full w-full object-contain p-4 brightness-[0.92] contrast-[1.05] drop-shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:brightness-100"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <h3
                    className={`${productDisplay.className} text-lg font-serif tracking-tight text-white`}
                  >
                    {product.displayName}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[#CFC4BD]">
                    {product.displayDescription}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDetailsProductId(product.id)}
                    className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#ECE5D8] underline underline-offset-4 hover:text-white"
                  >
                    {t.products.readMore}
                  </button>

                  <div className="my-3 flex flex-wrap gap-2">
                    {dosePill ? (
                      <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#D4C8C2]">
                        {dosePill}
                      </span>
                    ) : null}
                    {product.displayIncludedItems ? (
                      <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#D4C8C2]">
                        {t.products.includedLabel}: {product.displayIncludedItems}
                      </span>
                    ) : null}
                  </div>

                  {hasMultipleMgVariants ? (
                    <div className="relative">
                      <label
                        htmlFor={`variant-${product.id}`}
                        className={variantFieldLabelClassName}
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
                            {formatCurrency(
                              getVariantPrice(product, variant.mg),
                              localeCode,
                            )}
                          </option>
                        ))}
                      </select>
                      <span
                        className="pointer-events-none absolute bottom-3 right-3 text-[#A89A92]"
                        aria-hidden
                      >
                        ▾
                      </span>
                    </div>
                  ) : hasMultipleNamedVariants ? (
                    <StrengthSelector
                      productId={product.id}
                      strengths={variantLabels}
                      activeStrength={activeStrength ?? variantLabels[0]}
                      onSelect={(strength) => {
                        const index = variantLabels.indexOf(strength);
                        if (index >= 0) {
                          setCardVariantMg(product.id, index);
                        }
                      }}
                      label={t.products.variantLabel}
                    />
                  ) : null}

                  <div className="mt-auto pt-4">
                    <VariantStockLabel display={stockDisplay} />
                    <div className="mt-2 flex items-center gap-2 text-base font-semibold text-[#ECE5D8]">
                      <ProductSalePrice
                        basePrice={basePrice}
                        saleSettings={product}
                        locale={localeCode}
                        size="md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(
                          product.id,
                          variantMg,
                          hasNamedVariants ? activeStrength : undefined,
                        )
                      }
                      disabled={!purchasable}
                      className={
                        purchasable
                          ? "mt-4 w-full rounded-xl bg-[#ECE5D8] py-3 text-xs font-medium uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
                          : "mt-4 w-full cursor-not-allowed rounded-xl bg-white/10 py-3 text-xs font-medium uppercase tracking-wider text-neutral-400"
                      }
                    >
                      {buttonLabel}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {displayProducts.length > 1 ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2" aria-hidden>
              {displayProducts.map((product, index) => (
                <span
                  key={`dot-${product.id}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeSlide
                      ? "w-6 bg-[#ECE5D8]"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                className={carouselArrowClassName}
                aria-label="Scroll products left"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#ECE5D8] px-8 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-lg transition-all hover:bg-white"
              >
                {t.products.viewMoreProducts}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ProductDetailsDrawer
        open={Boolean(detailsProduct)}
        onClose={() => setDetailsProductId(null)}
        productName={detailsProduct?.displayName ?? ""}
        description={detailsProduct?.displayDescription ?? ""}
        doseLabel={detailsDosePill}
        includedItems={detailsProduct?.displayIncludedItems ?? ""}
        stockStatus={detailsEffectiveStatus}
        stockLabel={t.products.stockStatus[detailsEffectiveStatus]}
        stockDisplay={detailsStockDisplay}
        basePrice={detailsBasePrice}
        saleSettings={detailsProduct ?? {}}
        localeCode={localeCode}
        buttonLabel={detailsButtonLabel}
        purchasable={detailsPurchasable}
        onAddToCart={() => {
          if (!detailsProduct) return;
          addToCart(
            detailsProduct.id,
            detailsVariantMg,
            detailsHasNamedVariants ? detailsActiveStrength : undefined,
          );
        }}
      />
    </section>
  );
}

const featureIcons = [
  "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a49.902 49.902 0 00-2.659-.753M18.75 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15",
];

export function QualitySection() {
  const { t } = useLanguage();
  const { siteNavigation } = useStoreConfig();
  const showQuality = isSiteSectionVisible(siteNavigation, "kvalitet");

  if (!showQuality) {
    return null;
  }

  return (
    <section
      id="quality"
      className="scroll-mt-24 bg-[#0F0C0B] px-6 py-16 md:px-12 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8] opacity-80">
            {t.quality.eyebrow}
          </p>
          <h2
            className={`${qualityDisplay.className} mt-3 text-3xl font-serif tracking-tight text-white leading-[1.15] md:text-5xl`}
          >
            {t.quality.title}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#CFC4BD] md:text-base">
            {t.quality.description}
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md md:p-8">
            <ul className="space-y-4">
              {t.quality.checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium text-neutral-200 md:text-base"
                >
                  <span className="flex shrink-0 items-center justify-center rounded-full bg-[#ECE5D8]/15 p-1.5 text-[#ECE5D8]">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const { t } = useLanguage();
  const { siteNavigation } = useStoreConfig();
  const showFeatures = isSiteSectionVisible(siteNavigation, "fordelar");

  if (!showFeatures) {
    return null;
  }

  return (
    <section id="features" className="scroll-mt-24 bg-[#0F0C0B] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8] opacity-80">
            {t.features.eyebrow}
          </p>
          <h2
            className={`${qualityDisplay.className} mt-3 text-3xl font-serif tracking-tight text-white sm:text-4xl`}
          >
            {t.features.title}
          </h2>
          <p className="mt-4 text-base text-[#CFC4BD]">{t.features.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((feature, index) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/25"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECE5D8]/15 text-[#ECE5D8] transition group-hover:bg-[#ECE5D8]/25">
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
              <h3 className="text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#CFC4BD]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
