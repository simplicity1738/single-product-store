"use client";

import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { formatCurrency } from "@/lib/product";
import {
  formatBundleUnitBreakdown,
  getPresentationBundle,
} from "@/lib/presentation-bundle";

const bundleDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function BundleSection() {
  const { locale, t } = useLanguage();
  const { siteSettings, catalogProducts } = useStoreConfig();
  const { addPresentationBundle } = useProductSelection();
  const bundle = getPresentationBundle(siteSettings);
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  if (!bundle.enabled) {
    return null;
  }

  const selectedCount =
    bundle.productIds.length > 0
      ? bundle.productIds.filter((id) =>
          catalogProducts.some((product) => product.id === id),
        ).length
      : 5;
  const unitBreakdown =
    bundle.unitBreakdown.trim() ||
    formatBundleUnitBreakdown(bundle.price, selectedCount || 5);

  return (
    <section
      id="presentation-set"
      className="scroll-mt-24 bg-[#0F0C0B]"
      aria-labelledby="bundle-title"
    >
      <div className="mx-auto mt-8 mb-16 max-w-7xl px-4 sm:px-6 md:mt-12">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-[#1A1513] text-white shadow-2xl lg:grid-cols-2">
          <div className="relative flex h-[380px] w-full items-center justify-center overflow-hidden bg-[#1A1614] lg:h-[500px]">
            <Image
              src={bundle.imagePath || "/simplicity-presentation-set.png"}
              alt={t.bundle.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              priority={false}
            />
          </div>

          <div className="relative flex flex-col justify-between bg-[#181312] p-8 text-white md:p-12">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#ECE5D8]">
                {bundle.eyebrow}
              </p>
              <h2
                id="bundle-title"
                className={`${bundleDisplay.className} mb-4 text-3xl font-serif leading-tight text-white md:text-4xl lg:text-5xl`}
              >
                {bundle.title}
              </h2>
              <p className="mb-6 text-xs text-[#CFC4BD] md:text-sm">
                {bundle.subtitle}
              </p>

              <div className="flex flex-wrap items-baseline">
                <span
                  className={`${bundleDisplay.className} text-3xl font-bold text-white md:text-4xl`}
                >
                  {formatCurrency(bundle.price, localeCode)}
                </span>
                {bundle.originalPrice > bundle.price ? (
                  <span
                    className={`${bundleDisplay.className} ml-2 text-sm text-[#9A8F87] line-through`}
                  >
                    {formatCurrency(bundle.originalPrice, localeCode)}
                  </span>
                ) : null}
              </div>
              <p className="my-2 text-xs text-[#CFC4BD]">{unitBreakdown}</p>

              <button
                type="button"
                onClick={addPresentationBundle}
                className="mt-4 w-full rounded-xl bg-[#ECE5D8] py-4 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
              >
                {bundle.ctaLabel}
              </button>
            </div>

            <p className="mt-6 border-t border-white/10 pt-4 text-[10px] text-[#A89A92]">
              {bundle.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
