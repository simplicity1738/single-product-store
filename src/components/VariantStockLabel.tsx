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

  const message =
    display.quantity > 0
      ? display.isLow
        ? t.products.stockLow.replace("{{count}}", String(display.quantity))
        : t.products.stockAvailable.replace(
            "{{count}}",
            String(display.quantity),
          )
      : t.products.soldOut;

  return (
    <p className={`text-[11px] font-medium text-[#A89A92] ${className}`}>
      {message}
    </p>
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
