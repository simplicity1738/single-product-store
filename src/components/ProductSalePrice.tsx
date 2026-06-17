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
  sm: { sale: "text-base font-bold", original: "text-xs" },
  md: { sale: "text-lg font-bold", original: "text-sm" },
  lg: { sale: "text-xl font-bold", original: "text-sm" },
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
      <p className={`${classes.sale} text-zinc-900`}>
        {formatCurrency(basePrice, locale)}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={`${classes.original} font-normal text-gray-400 line-through`}
      >
        {formatCurrency(basePrice, locale)}
      </span>
      <span className={`${classes.sale} text-rose-500`}>
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
      className={`absolute left-4 top-4 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md ${className}`}
    >
      {label}
    </span>
  );
}
