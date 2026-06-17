"use client";

import ProductImage from "@/components/ProductImage";
import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { formatCurrency, getProductVariant } from "@/lib/product";
import { getLowestCatalogPrice, getProductIncludedItems } from "@/lib/store-config";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";
import StockStatusBadge from "@/components/StockStatusBadge";
import IncludedItemsBadge from "@/components/IncludedItemsBadge";
import { resolveHeroContent } from "@/lib/hero-content";

export default function Hero() {
  const { locale, t } = useLanguage();
  const { siteSettings, catalogProducts, storeConfig, getDisplayName } =
    useStoreConfig();

  const featuredProduct = useMemo(() => {
    if (catalogProducts.length === 0) return null;
    const preferred = catalogProducts.find(
      (product) => product.id === "tirzepatide",
    );
    return preferred ?? catalogProducts[0];
  }, [catalogProducts]);

  const featuredMg = featuredProduct?.variants[0]?.mg ?? 0;
  const featuredVariant = featuredProduct
    ? (getProductVariant(featuredProduct.id, featuredMg) ??
      featuredProduct.variants[0])
    : null;
  const productLineLabel = featuredProduct
    ? getDisplayName(featuredProduct.id)
    : t.hero.title;

  const lowestPrice = formatCurrency(
    getLowestCatalogPrice(storeConfig),
    locale === "sv" ? "sv-SE" : "en-US",
  );
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const featuredIncludedItems = featuredProduct
    ? getProductIncludedItems(storeConfig, featuredProduct.id)
    : "";

  const heroContent = useMemo(
    () => resolveHeroContent(locale, siteSettings, t.hero),
    [locale, siteSettings, t.hero],
  );

  const stats = [
    t.hero.stats.purity,
    t.hero.stats.shipping,
    t.hero.stats.support,
  ];

  return (
    <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            {heroContent.badge}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            {heroContent.title}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-600">
            {heroContent.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#products"
              className="inline-flex h-12 items-center justify-center rounded-full bg-rose-400 px-8 text-sm font-semibold text-white shadow-lg shadow-rose-400/25 transition hover:bg-rose-500"
            >
              {t.hero.ctaPrimary.replace("{price}", lowestPrice)}
            </a>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-rose-200 bg-white px-8 text-sm font-semibold text-zinc-800 transition hover:border-rose-300 hover:bg-rose-50"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-rose-100 pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-zinc-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {featuredProduct && featuredVariant && (
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-rose-200/50 via-transparent to-rose-100/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-8 shadow-xl shadow-rose-900/5">
              <div
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-rose-100 ${PRODUCT_IMAGE_FRAME_CLASS}`}
              >
                <ProductImage
                  src={featuredProduct.image}
                  alt={productLineLabel}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-6 mix-blend-multiply"
                  priority
                />
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {productLineLabel}
                  </p>
                  <div className="mt-1">
                    <StockStatusBadge
                      status={featuredProduct.status}
                      label={t.products.stockStatus[featuredProduct.status]}
                    />
                  </div>
                  <IncludedItemsBadge items={featuredIncludedItems} />
                </div>
                <p className="text-lg font-bold text-zinc-900">
                  {formatCurrency(featuredVariant.price, localeCode)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
