export type ProductStockStatus = "i_lager" | "ej_i_lager" | "kommer_snart";

export const DEFAULT_PRODUCT_STOCK_STATUS: ProductStockStatus = "i_lager";

export const PRODUCT_STOCK_STATUS_OPTIONS: {
  value: ProductStockStatus;
  label: string;
}[] = [
  { value: "i_lager", label: "I lager" },
  { value: "ej_i_lager", label: "Ej i lager" },
  { value: "kommer_snart", label: "Kommer snart" },
];

export function normalizeProductStockStatus(
  value: unknown,
): ProductStockStatus {
  if (value === "ej_i_lager" || value === "kommer_snart") return value;
  return DEFAULT_PRODUCT_STOCK_STATUS;
}

export function isProductPurchasable(status: ProductStockStatus): boolean {
  return status === "i_lager";
}

/**
 * Prefer live variant counts over the product-level status badge so
 * "Endast X kvar" never appears alongside an out-of-stock badge.
 */
export function resolveEffectiveProductStockStatus(
  productStatus: ProductStockStatus,
  stockDisplay: {
    visible: boolean;
    quantity: number;
    isSoldOut: boolean;
  },
): ProductStockStatus {
  if (productStatus === "kommer_snart") return "kommer_snart";
  if (stockDisplay.visible) {
    return stockDisplay.quantity > 0 && !stockDisplay.isSoldOut
      ? "i_lager"
      : "ej_i_lager";
  }
  return productStatus;
}

export function getStockStatusBadgeClassName(
  status: ProductStockStatus,
): string {
  switch (status) {
    case "ej_i_lager":
      return "bg-red-50 text-red-700 ring-red-200";
    case "kommer_snart":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
}
