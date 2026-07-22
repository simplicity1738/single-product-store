import { formatCurrency } from "@/lib/product";
import {
  calculateSalePrice,
  formatSaleBadgeLabel,
  isProductOnSale,
  type ProductSaleSettings,
} from "@/lib/product-sale";

type ProductSalePriceProps = {
  basePrice: number;
  saleSettings: ProductSaleSettings;
  locale?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: { sale: "text-sm font-semibold", original: "text-xs" },
  md: { sale: "text-base font-semibold", original: "text-xs" },
  lg: { sale: "text-xl font-semibold", original: "text-sm" },
};

export default function ProductSalePrice({
  basePrice,
  saleSettings,
  locale = "sv-SE",
  size = "md",
}: ProductSalePriceProps) {
  const onSale = isProductOnSale(saleSettings);
  const salePrice = calculateSalePrice(basePrice, saleSettings);
  const classes = sizeClasses[size];

  if (!onSale || salePrice >= basePrice) {
    return (
      <p className={`${classes.sale} text-[#ECE5D8]`}>
        {formatCurrency(basePrice, locale)}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`${classes.original} font-normal text-neutral-500 line-through`}
      >
        {formatCurrency(basePrice, locale)}
      </span>
      <span className={`${classes.sale} text-[#ECE5D8]`}>
        {formatCurrency(salePrice, locale)}
      </span>
    </div>
  );
}

export function ProductSaleBadge({
  basePrice,
  saleSettings,
  className = "",
}: {
  basePrice: number;
  saleSettings: ProductSaleSettings;
  className?: string;
}) {
  if (!isProductOnSale(saleSettings)) return null;

  const label = formatSaleBadgeLabel(basePrice, saleSettings);
  if (!label) return null;

  return (
    <span
      className={`absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white ${className}`}
    >
      {label}
    </span>
  );
}
