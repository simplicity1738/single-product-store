"use client";

import type { ProductSaleType } from "@/lib/product-sale";

export type ProductSaleFormValues = {
  isOnSale: boolean;
  saleType: ProductSaleType;
  saleValue: number;
};

type ProductSaleFieldsProps = {
  values: ProductSaleFormValues;
  onChange: (next: ProductSaleFormValues) => void;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none";

const labelClassName =
  "text-xs font-semibold uppercase tracking-wider text-[#A89A92]";

export default function ProductSaleFields({
  values,
  onChange,
}: ProductSaleFieldsProps) {
  function patch(partial: Partial<ProductSaleFormValues>) {
    onChange({ ...values, ...partial });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-[#ECE5D8]">
        Produkt-Rea
      </p>

      <label className="mt-3 flex items-start gap-3">
        <input
          type="checkbox"
          checked={values.isOnSale}
          onChange={(event) => patch({ isOnSale: event.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
        />
        <span className="text-sm font-medium text-[#CFC4BD]">
          Aktivera direkt nedsatt pris (Rea)
        </span>
      </label>

      {values.isOnSale ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClassName}>Reatyp</span>
            <select
              value={values.saleType}
              onChange={(event) =>
                patch({ saleType: event.target.value as ProductSaleType })
              }
              className={inputClassName}
            >
              <option value="procent">Procent %</option>
              <option value="fixed">Fast SEK-belopp</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClassName}>
              Rea-värde (t.ex. 20 för 20% eller 150 för 150 kr rabatt)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={values.saleValue || ""}
              onChange={(event) =>
                patch({ saleValue: Number(event.target.value) })
              }
              className={inputClassName}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

export const emptyProductSaleFormValues = (): ProductSaleFormValues => ({
  isOnSale: false,
  saleType: "procent",
  saleValue: 0,
});
