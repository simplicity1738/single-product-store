"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductStockStatus } from "@/lib/product-stock";
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

  // Never treat remaining units as sold out — low stock wins when quantity > 0
  const message =
    display.quantity > 0
      ? display.isLow
        ? t.products.stockLow.replace("{{count}}", String(display.quantity))
        : t.products.stockAvailable.replace(
            "{{count}}",
            String(display.quantity),
          )
      : t.products.soldOut;

  const tone =
    display.quantity > 0
      ? display.isLow
        ? "text-orange-600 motion-safe:animate-pulse"
        : "text-emerald-700"
      : "text-red-600";

  return (
    <p className={`text-sm font-semibold ${tone} ${className}`}>{message}</p>
  );
}

export function isVariantPurchasableWithStock(
  basePurchasable: boolean,
  display: VariantStockDisplay,
  productStatus?: ProductStockStatus,
): boolean {
  if (productStatus === "kommer_snart") return false;

  if (display.visible) {
    return display.quantity > 0 && !display.isSoldOut;
  }

  return basePurchasable;
}
