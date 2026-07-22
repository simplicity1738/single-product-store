import type { ProductStockStatus } from "@/lib/product-stock";

type StockStatusBadgeProps = {
  status: ProductStockStatus;
  label: string;
};

/** ONDO muted cream stock pill — no bright green/red/pink. */
export default function StockStatusBadge({
  status,
  label,
}: StockStatusBadgeProps) {
  void status;

  return (
    <span className="rounded-full border border-white/10 bg-[#ECE5D8]/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#ECE5D8] backdrop-blur-md">
      {label}
    </span>
  );
}
