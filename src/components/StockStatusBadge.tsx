import type { ProductStockStatus } from "@/lib/product-stock";
import { getStockStatusBadgeClassName } from "@/lib/product-stock";

type StockStatusBadgeProps = {
  status: ProductStockStatus;
  label: string;
};

export default function StockStatusBadge({
  status,
  label,
}: StockStatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${getStockStatusBadgeClassName(status)}`}
    >
      {label}
    </span>
  );
}
