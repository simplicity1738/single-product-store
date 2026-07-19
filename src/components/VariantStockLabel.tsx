"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { VariantStockDisplay } from "@/lib/stock-management";

type VariantStockLabelProps = {
  display: VariantStockDisplay;
  className?: string;
};

export default function VariantStockLabel({
  display,
  className = "",
}: VariantStockLabelProps) {
  const { t } = useLanguage();

  if (!display.visible) return null;

  const message = display.isSoldOut
    ? t.products.soldOut
    : display.isLow
      ? t.products.stockLow.replace("{{count}}", String(display.quantity))
      : t.products.stockAvailable.replace("{{count}}", String(display.quantity));

  return (
    <p
      className={`text-sm font-semibold ${
        display.isSoldOut
          ? "text-red-600"
          : display.isLow
            ? "text-orange-600 motion-safe:animate-pulse"
            : "text-emerald-700"
      } ${className}`}
    >
      {message}
    </p>
  );
}

export function isVariantPurchasableWithStock(
  basePurchasable: boolean,
  display: VariantStockDisplay,
): boolean {
  if (!display.visible) return basePurchasable;
  if (display.isSoldOut) return false;
  return basePurchasable;
}
