import type { Product } from "@/lib/product";
import { resolveConfigVariants, type ConfigProduct, type StoreConfig } from "@/lib/store-config";
import { formatMgOption } from "@/lib/i18n/translations";

export type StockManagementConfig = {
  showStockToBuyers: boolean;
  lowStockThreshold: number;
  counts: Record<string, number>;
};

export const DEFAULT_STOCK_MANAGEMENT: StockManagementConfig = {
  showStockToBuyers: false,
  lowStockThreshold: 5,
  counts: {},
};

export function normalizeStockManagement(
  value: Partial<StockManagementConfig> | undefined,
): StockManagementConfig {
  const counts: Record<string, number> = {};

  if (value?.counts && typeof value.counts === "object") {
    for (const [key, rawQuantity] of Object.entries(value.counts)) {
      const quantity = Number(rawQuantity);
      if (!Number.isFinite(quantity)) continue;
      counts[key] = Math.max(0, Math.floor(quantity));
    }
  }

  const lowStockThreshold = Number(value?.lowStockThreshold);
  return {
    showStockToBuyers: value?.showStockToBuyers === true,
    lowStockThreshold: Number.isFinite(lowStockThreshold)
      ? Math.max(1, Math.floor(lowStockThreshold))
      : DEFAULT_STOCK_MANAGEMENT.lowStockThreshold,
    counts,
  };
}

export function variantStockKey(productId: string, variantLabel: string): string {
  return `${productId}::${variantLabel.trim().toLowerCase()}`;
}

export function getVariantLabelForSelection(
  product: Pick<Product, "variants" | "variantLabels">,
  variantMg: number,
  selectedStrength?: string,
): string {
  if (selectedStrength?.trim()) return selectedStrength.trim();
  if (product.variantLabels?.[variantMg]?.trim()) {
    return product.variantLabels[variantMg].trim();
  }
  return formatMgOption(variantMg);
}

export function getVariantStockQuantity(
  stock: StockManagementConfig,
  productId: string,
  variantLabel: string,
): number | undefined {
  const key = variantStockKey(productId, variantLabel);
  if (!(key in stock.counts)) return undefined;
  return stock.counts[key];
}

export function isVariantSoldOutByStock(
  stock: StockManagementConfig,
  productId: string,
  variantLabel: string,
): boolean {
  const quantity = getVariantStockQuantity(stock, productId, variantLabel);
  if (quantity === undefined) return false;
  return quantity <= 0;
}

/** Hard cart/checkout max for a tracked variant; falls back to absoluteMax when untracked. */
export function getMaxOrderableQuantity(
  stock: StockManagementConfig,
  productId: string,
  variantLabel: string,
  absoluteMax = 99,
): number {
  const quantity = getVariantStockQuantity(stock, productId, variantLabel);
  if (quantity === undefined) return absoluteMax;
  return Math.max(0, Math.min(absoluteMax, quantity));
}

export type VariantStockDisplay = {
  visible: boolean;
  quantity: number;
  isLow: boolean;
  isSoldOut: boolean;
};

export function resolveVariantStockDisplay(
  stock: StockManagementConfig,
  productId: string,
  variantLabel: string,
): VariantStockDisplay {
  if (!stock.showStockToBuyers) {
    return { visible: false, quantity: 0, isLow: false, isSoldOut: false };
  }

  const quantity = getVariantStockQuantity(stock, productId, variantLabel);
  if (quantity === undefined) {
    return { visible: false, quantity: 0, isLow: false, isSoldOut: false };
  }

  // quantity > 0 is never sold out — low-stock and sold-out are mutually exclusive
  const isSoldOut = quantity <= 0;
  const isLow = !isSoldOut && quantity <= stock.lowStockThreshold;

  return {
    visible: true,
    quantity,
    isLow,
    isSoldOut,
  };
}

export type AdminVariantStockRow = {
  productId: string;
  productName: string;
  variantLabel: string;
  key: string;
};

export function buildAdminVariantStockRows(
  config: StoreConfig,
): AdminVariantStockRow[] {
  const rows: AdminVariantStockRow[] = [];

  for (const product of config.products) {
    const variants = resolveConfigVariants(product);
    const productName =
      product.name_sv.trim() || product.name_en.trim() || product.id;

    if (variants.length === 0) {
      rows.push({
        productId: product.id,
        productName,
        variantLabel: "Standard",
        key: variantStockKey(product.id, "Standard"),
      });
      continue;
    }

    for (const variant of variants) {
      rows.push({
        productId: product.id,
        productName,
        variantLabel: variant.name,
        key: variantStockKey(product.id, variant.name),
      });
    }
  }

  return rows;
}

export function listProductVariantLabels(product: ConfigProduct): string[] {
  const variants = resolveConfigVariants(product);
  if (variants.length === 0) return ["Standard"];
  return variants.map((variant) => variant.name);
}
