"use client";

import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { isProductPurchasable } from "@/lib/product-stock";

const bundleDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function BundleSection() {
  const { locale, t } = useLanguage();
  const { catalogProducts } = useStoreConfig();
  const { addToCart, openCart } = useProductSelection();

  function handleAddSet() {
    for (const product of catalogProducts) {
      if (isProductPurchasable(product.status)) {
        addToCart(product.id);
      }
    }
    openCart();
  }

  return (
    <section
      id="presentation-set"
      className="scroll-mt-24 bg-[#0F0C0B] px-4 sm:px-6"
      aria-labelledby="bundle-title"
    >
      <div className="mx-auto my-16 grid max-w-7xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:grid-cols-2">
        <div className="relative flex h-[380px] w-full items-center justify-center overflow-hidden bg-[#1A1614] lg:h-[500px]">
          <Image
            src="/simplicity-presentation-set.png"
            alt={t.bundle.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
            priority={false}
          />
        </div>

        <div className="relative flex flex-col justify-between bg-[#EFECE6] p-8 text-[#120E0D] md:p-12">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9E6B4B]">
              {t.bundle.eyebrow}
            </p>
            <h2
              id="bundle-title"
              className={`${bundleDisplay.className} mb-4 text-3xl font-serif leading-[1.15] text-[#120E0D] md:text-4xl lg:text-5xl`}
            >
              {t.bundle.title}
            </h2>
            <p className="mb-6 max-w-md text-xs leading-relaxed text-[#4A423D] md:text-sm">
              {t.bundle.subtitle}
            </p>

            <div className="flex flex-wrap items-baseline">
              <span
                className={`${bundleDisplay.className} text-3xl font-bold text-[#120E0D] md:text-4xl`}
              >
                {locale === "sv" ? t.bundle.priceCurrentSv : t.bundle.priceCurrentEn}
              </span>
              <span
                className={`${bundleDisplay.className} ml-3 inline-block text-lg text-[#9A8F87] line-through`}
              >
                {locale === "sv"
                  ? t.bundle.priceOriginalSv
                  : t.bundle.priceOriginalEn}
              </span>
            </div>
            <p className="my-2 text-xs font-medium text-[#38302B] md:text-sm">
              {locale === "sv" ? t.bundle.breakdownSv : t.bundle.breakdownEn}
            </p>

            <button
              type="button"
              onClick={handleAddSet}
              className="mt-4 w-full rounded-lg bg-[#1C1715] px-8 py-4 text-xs font-semibold uppercase tracking-widest text-[#ECE5D8] shadow-md transition-all hover:bg-black active:scale-95 sm:w-auto"
            >
              {t.bundle.cta}
            </button>
          </div>

          <p className="mt-6 border-t border-[#DCD5CB] pt-4 text-[10px] tracking-wide text-[#7A6F68] md:text-xs">
            {t.bundle.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
