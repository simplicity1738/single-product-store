"use client";

import type { ConfigProduct } from "@/lib/store-config";
import {
  formatBundleUnitBreakdown,
  type PresentationBundleSettings,
} from "@/lib/presentation-bundle";
import { getLocalizedProductName } from "@/lib/product-localization";

type BundleSettingsFormProps = {
  value: PresentationBundleSettings;
  products: ConfigProduct[];
  onChange: (next: PresentationBundleSettings) => void;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none";

const labelClassName =
  "text-xs font-semibold uppercase tracking-wider text-[#A89A92]";

export default function BundleSettingsForm({
  value,
  products,
  onChange,
}: BundleSettingsFormProps) {
  function patch(partial: Partial<PresentationBundleSettings>) {
    onChange({ ...value, ...partial });
  }

  function toggleProduct(productId: string) {
    const selected = new Set(value.productIds);
    if (selected.has(productId)) {
      selected.delete(productId);
    } else if (selected.size < 5) {
      selected.add(productId);
    }
    const productIds = Array.from(selected);
    const nextPrice = value.price;
    patch({
      productIds,
      unitBreakdown:
        value.unitBreakdown.trim() ||
        formatBundleUnitBreakdown(nextPrice, productIds.length || 5),
    });
  }

  return (
    <div className="space-y-5">
      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(event) => patch({ enabled: event.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
        />
        <span>
          <span className="block text-sm font-medium text-white">
            Visa paketsektion på startsidan
          </span>
          <span className="mt-0.5 block text-xs text-[#A89A92]">
            När avstängd döljs hela presentation-set-blocket för kunder.
          </span>
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClassName}>Kategoritag</span>
          <input
            value={value.eyebrow}
            onChange={(event) => patch({ eyebrow: event.target.value })}
            className={inputClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>Rubrik</span>
          <input
            value={value.title}
            onChange={(event) => patch({ title: event.target.value })}
            className={inputClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>Beskrivning</span>
          <textarea
            rows={3}
            value={value.subtitle}
            onChange={(event) => patch({ subtitle: event.target.value })}
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Paketpris (kr)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={value.price || ""}
            onChange={(event) =>
              patch({
                price: Number(event.target.value),
                unitBreakdown: formatBundleUnitBreakdown(
                  Number(event.target.value) || 0,
                  value.productIds.length || 5,
                ),
              })
            }
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Ordinarie pris (kr)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={value.originalPrice || ""}
            onChange={(event) =>
              patch({ originalPrice: Number(event.target.value) })
            }
            className={inputClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>Enhetspris-text</span>
          <input
            value={value.unitBreakdown}
            onChange={(event) => patch({ unitBreakdown: event.target.value })}
            className={inputClassName}
            placeholder="Blir 200 kr per flaska — dokumentation ingår."
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>CTA-knapp</span>
          <input
            value={value.ctaLabel}
            onChange={(event) => patch({ ctaLabel: event.target.value })}
            className={inputClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>Disclaimer</span>
          <input
            value={value.disclaimer}
            onChange={(event) => patch({ disclaimer: event.target.value })}
            className={inputClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>Bild-sökväg</span>
          <input
            value={value.imagePath}
            onChange={(event) => patch({ imagePath: event.target.value })}
            className={inputClassName}
            placeholder="/simplicity-presentation-set.png"
          />
        </label>
      </div>

      <div>
        <p className={labelClassName}>
          Välj upp till 5 lagerprodukter i paketet ({value.productIds.length}/5)
        </p>
        <p className="mt-1 text-xs text-[#A89A92]">
          Kunden kan inte välja själv — innehållet styrs här för
          lagerrensning.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {products.map((product) => {
            const checked = value.productIds.includes(product.id);
            const disabled = !checked && value.productIds.length >= 5;
            return (
              <label
                key={product.id}
                className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${
                  checked
                    ? "border-[#ECE5D8]/40 bg-[#ECE5D8]/10"
                    : "border-white/10 bg-white/[0.03]"
                } ${disabled ? "opacity-40" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleProduct(product.id)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-white">
                    {getLocalizedProductName(product, product.id, "sv")}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-[#A89A92]">
                    {product.id}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
