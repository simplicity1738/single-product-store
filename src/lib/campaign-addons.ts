import type { CampaignAddon, StoreConfig } from "@/lib/store-config";
import { DEFAULT_HERO_SITE_SETTINGS } from "@/lib/hero-settings";

export const CAMPAIGN_ADDON_PRODUCT_ID = "campaign-addon" as const;

export type SiteSettings = StoreConfig["siteSettings"];

/** Legacy cart ids from earlier fixed-slot or hardcoded add-ons. */
const LEGACY_ADDON_INDEX: Record<string, number> = {
  addon1: 0,
  "bac-water": 0,
  addon2: 1,
  "sterile-kit": 1,
};

export function resolveAddonByCartId(
  settings: SiteSettings,
  id: string,
): CampaignAddon | undefined {
  const direct = settings.campaignAddons.find((addon) => addon.id === id);
  if (direct) return direct;

  const legacyIndex = LEGACY_ADDON_INDEX[id];
  if (legacyIndex === undefined) return undefined;

  const visible = resolveCampaignAddons(settings);
  return visible[legacyIndex];
}

export function resolveCampaignAddons(
  settings: Pick<SiteSettings, "showAddons" | "campaignAddons">,
): CampaignAddon[] {
  if (!settings.showAddons) return [];
  return settings.campaignAddons.filter((addon) => addon.label.trim());
}

export function getCampaignAddonLabel(
  settings: SiteSettings,
  id: string,
): string {
  return resolveAddonByCartId(settings, id)?.label ?? id;
}

export function getCampaignAddonPrice(
  settings: SiteSettings,
  id: string,
): number {
  const addon = resolveAddonByCartId(settings, id);
  if (!addon) return 0;
  return addon.price;
}

export function isKnownCampaignAddonId(
  settings: SiteSettings,
  id: string,
): boolean {
  return resolveAddonByCartId(settings, id) !== undefined;
}

export function getCampaignAddonPriceWithDefaults(id: string): number {
  return getCampaignAddonPrice(DEFAULT_HERO_SITE_SETTINGS, id);
}

export function getCampaignAddonLabelWithDefaults(id: string): string {
  return getCampaignAddonLabel(DEFAULT_HERO_SITE_SETTINGS, id);
}
