"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";
import ProductSalePrice from "@/components/ProductSalePrice";
import StockStatusBadge from "@/components/StockStatusBadge";
import VariantStockLabel from "@/components/VariantStockLabel";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductSaleSettings } from "@/lib/product-sale";
import type { ProductStockStatus } from "@/lib/product-stock";
import type { VariantStockDisplay } from "@/lib/stock-management";

const drawerDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export type ProductDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  productName: string;
  description: string;
  doseLabel: string;
  includedItems: string;
  stockStatus: ProductStockStatus;
  stockLabel: string;
  stockDisplay: VariantStockDisplay;
  basePrice: number;
  saleSettings: ProductSaleSettings;
  localeCode: string;
  buttonLabel: string;
  purchasable: boolean;
  onAddToCart: () => void;
};

export default function ProductDetailsDrawer({
  open,
  onClose,
  productName,
  description,
  doseLabel,
  includedItems,
  stockStatus,
  stockLabel,
  stockDisplay,
  basePrice,
  saleSettings,
  localeCode,
  buttonLabel,
  purchasable,
  onAddToCart,
}: ProductDetailsDrawerProps) {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="product-details-overlay"
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            key="product-details-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-details-title"
            className="fixed inset-y-0 right-0 z-[80] flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#181312] p-6 text-white shadow-2xl md:p-8"
            initial={prefersReducedMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? undefined : { x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2
                  id="product-details-title"
                  className={`${drawerDisplay.className} text-2xl font-serif tracking-tight text-white md:text-3xl`}
                >
                  {productName}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {doseLabel ? (
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#D4C8C2]">
                      {doseLabel}
                    </span>
                  ) : null}
                  <StockStatusBadge status={stockStatus} label={stockLabel} />
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-[#ECE5D8] transition hover:bg-white/10 hover:text-white"
                aria-label={t.products.closeDetails}
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed text-[#CFC4BD] md:text-base">
                {description}
              </p>

              {includedItems ? (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A89A92]">
                    {t.products.includedLabel}
                  </p>
                  <p className="mt-2 text-sm text-[#ECE5D8]">{includedItems}</p>
                </div>
              ) : null}

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A89A92]">
                  {t.products.stockStatusLabel}
                </p>
                <div className="mt-2">
                  <VariantStockLabel display={stockDisplay} />
                  {!stockDisplay.visible ? (
                    <p className="text-sm text-[#D4C8C2]">{stockLabel}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-4">
                <ProductSalePrice
                  basePrice={basePrice}
                  saleSettings={saleSettings}
                  locale={localeCode}
                  size="lg"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddToCart();
                  onClose();
                }}
                disabled={!purchasable}
                className={
                  purchasable
                    ? "w-full rounded-xl bg-[#ECE5D8] py-3.5 text-xs font-medium uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
                    : "w-full cursor-not-allowed rounded-xl bg-white/10 py-3.5 text-xs font-medium uppercase tracking-wider text-neutral-400"
                }
              >
                {buttonLabel}
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
