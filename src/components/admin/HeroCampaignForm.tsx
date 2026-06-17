"use client";

import type { CampaignAddon, ConfigProduct, StoreConfig } from "@/lib/store-config";
import { CAMPAIGN_THEME_OPTIONS } from "@/lib/campaign-theme";
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

  function updateCampaignAddons(next: CampaignAddon[]) {
    patch({ campaignAddons: next });
  }

  function updateAddon(
    id: string,
    field: keyof CampaignAddon,
    value: string | number,
  ) {
    updateCampaignAddons(
      siteSettings.campaignAddons.map((addon) =>
        addon.id === id ? { ...addon, [field]: value } : addon,
      ),
    );
  }

  function removeAddon(id: string) {
    updateCampaignAddons(
      siteSettings.campaignAddons.filter((addon) => addon.id !== id),
    );
  }

  function addAddon() {
    updateCampaignAddons([
      ...siteSettings.campaignAddons,
      {
        id: crypto.randomUUID(),
        label: "",
        price: 0,
      },
    ]);
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

        <label className="block sm:col-span-2">
          <span className={labelClassName}>
            Välj Kampanj-Tema (Bakgrundsdekorationer)
          </span>
          <select
            value={siteSettings.campaignTheme}
            onChange={(event) =>
              patch({
                campaignTheme: event.target.value as StoreConfig["siteSettings"]["campaignTheme"],
              })
            }
            className={inputClassName}
          >
            {CAMPAIGN_THEME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>Support-badge (under hero)</span>
          <input
            value={siteSettings.heroBadge}
            onChange={(event) => patch({ heroBadge: event.target.value })}
            placeholder="SUPPORT 24/7"
            className={inputClassName}
          />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-rose-100 bg-white/80 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-zinc-900">
          Kampanj-addons &amp; Tillbehör
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Bygg en obegränsad lista med tillbehör för kampanjkortet på startsidan.
        </p>

        <label className="mt-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3">
          <input
            type="checkbox"
            checked={siteSettings.showAddons}
            onChange={(event) => patch({ showAddons: event.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
          />
          <span className="text-sm leading-snug text-zinc-700">
            <span className="block font-semibold text-zinc-900">
              Aktivera merförsäljning (Add-ons) på startsidan
            </span>
          </span>
        </label>

        <div className="mt-4 space-y-3">
          {siteSettings.campaignAddons.length === 0 ? (
            <p className="rounded-xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-6 text-center text-xs text-zinc-500">
              Inga tillbehör ännu. Lägg till ditt första tillbehör nedan.
            </p>
          ) : (
            siteSettings.campaignAddons.map((addon, index) => (
              <div
                key={addon.id}
                className="rounded-xl border border-rose-100 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Tillbehör {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeAddon(addon.id)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                  >
                    🗑 Ta bort tillbehör
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_8rem]">
                  <label className="block">
                    <span className={labelClassName}>Namn</span>
                    <input
                      value={addon.label}
                      onChange={(event) =>
                        updateAddon(addon.id, "label", event.target.value)
                      }
                      placeholder="Lägg till extra BAC-vatten"
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClassName}>Pris (SEK)</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={addon.price}
                      onChange={(event) =>
                        updateAddon(
                          addon.id,
                          "price",
                          Number(event.target.value),
                        )
                      }
                      className={inputClassName}
                    />
                  </label>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={addAddon}
          className="mt-4 w-full rounded-full bg-rose-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          ➕ Lägg till nytt tillbehör
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-rose-100 bg-white/80 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-zinc-900">Urgency Ticker</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Text som visas vid nedräkningsmätaren under kampanjlayouten.
        </p>

        <label className="mt-4 block">
          <span className={labelClassName}>Kampanjmeddelande vid mätare</span>
          <input
            value={siteSettings.campaignTickerText}
            onChange={(event) =>
              patch({ campaignTickerText: event.target.value })
            }
            placeholder="🔥 Kampanjen slutar snart — begränsat lager kvar!"
            className={inputClassName}
          />
        </label>
      </div>
    </div>
  );
}
