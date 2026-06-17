"use client";

import type { ConfigProduct, StoreConfig } from "@/lib/store-config";
import { getLocalizedProductName } from "@/lib/product-localization";

type HeroCampaignFormProps = {
  siteSettings: StoreConfig["siteSettings"];
  products: ConfigProduct[];
  onChange: (next: StoreConfig["siteSettings"]) => void;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

const labelClassName =
  "text-xs font-semibold uppercase tracking-wide text-zinc-500";

export default function HeroCampaignForm({
  siteSettings,
  products,
  onChange,
}: HeroCampaignFormProps) {
  function patch(partial: Partial<StoreConfig["siteSettings"]>) {
    onChange({ ...siteSettings, ...partial });
  }

  const activeProducts = products.filter(
    (product) => product.status !== "ej_i_lager",
  );
  const selectableProducts =
    activeProducts.length > 0 ? activeProducts : products;

  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
      <h2 className="text-sm font-bold text-zinc-900">
        Hjälte-Kampanj (Hero Showcase)
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Styr säsongskampanj, rubriker och utvald produkt på startsidans hero.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClassName}>Kampanjetikett</span>
          <input
            value={siteSettings.campaignTag}
            onChange={(event) => patch({ campaignTag: event.target.value })}
            placeholder="Säsongskampanj"
            className={inputClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>Kampanjrubrik</span>
          <input
            value={siteSettings.campaignHeadline}
            onChange={(event) =>
              patch({ campaignHeadline: event.target.value })
            }
            placeholder="Gör dig redo för sommar!"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Rabatt-badge</span>
          <input
            value={siteSettings.campaignDiscountBadge}
            onChange={(event) =>
              patch({ campaignDiscountBadge: event.target.value })
            }
            placeholder="Upp till 25%"
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Utvald produkt till startsidan</span>
          <select
            value={siteSettings.campaignFeaturedProductId}
            onChange={(event) =>
              patch({ campaignFeaturedProductId: event.target.value })
            }
            className={inputClassName}
          >
            {selectableProducts.length === 0 ? (
              <option value="">Inga produkter tillgängliga</option>
            ) : (
              selectableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {getLocalizedProductName(product, product.id, "sv")}
                </option>
              ))
            )}
          </select>
        </label>
      </div>
    </div>
  );
}
