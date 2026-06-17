export type ProductSaleType = "procent" | "fixed";

export type ProductSaleSettings = {
  isOnSale?: boolean;
  saleType?: ProductSaleType;
  saleValue?: number;
};

export function isProductOnSale(settings: ProductSaleSettings): boolean {
  return Boolean(
    settings.isOnSale &&
      settings.saleValue !== undefined &&
      settings.saleValue > 0,
  );
}

export function calculateSalePrice(
  basePrice: number,
  settings: ProductSaleSettings,
): number {
  const base = Math.max(0, Math.round(basePrice));
  if (!isProductOnSale(settings)) return base;

  const value = Math.max(0, Math.round(settings.saleValue ?? 0));
  if (settings.saleType === "fixed") {
    return Math.max(0, base - value);
  }

  const discount = Math.round(base * (value / 100));
  return Math.max(0, base - discount);
}

export function formatSaleBadgeLabel(
  basePrice: number,
  settings: ProductSaleSettings,
): string {
  if (!isProductOnSale(settings)) return "";

  const value = Math.round(settings.saleValue ?? 0);
  if (settings.saleType === "procent") {
    return `-${value}%`;
  }

  if (basePrice > 0) {
    const pct = Math.round((value / basePrice) * 100);
    return pct > 0 ? `-${pct}%` : "SALE";
  }

  return "SALE";
}

export function normalizeProductSaleType(value: unknown): ProductSaleType {
  return value === "fixed" ? "fixed" : "procent";
}

export function normalizeProductSaleValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}
