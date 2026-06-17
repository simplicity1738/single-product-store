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
  "mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

const labelClassName =
  "text-xs font-semibold uppercase tracking-wide text-zinc-500";

export default function ProductSaleFields({
  values,
  onChange,
}: ProductSaleFieldsProps) {
  function patch(partial: Partial<ProductSaleFormValues>) {
    onChange({ ...values, ...partial });
  }

  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
        Produkt-Rea
      </p>

      <label className="mt-3 flex items-start gap-3">
        <input
          type="checkbox"
          checked={values.isOnSale}
          onChange={(event) => patch({ isOnSale: event.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
        />
        <span className="text-sm font-medium text-zinc-800">
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
