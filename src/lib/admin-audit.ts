import type { StoreConfig } from "@/lib/store-config";
import { SITE_NAV_KEYS } from "@/lib/site-navigation";

const MAX_LINES = 18;

function pushChange(lines: string[], label: string) {
  if (lines.length < MAX_LINES) {
    lines.push(`• ${label}`);
  }
}

export function summarizeStoreConfigChanges(
  before: StoreConfig,
  after: StoreConfig,
): string[] {
  const lines: string[] = [];

  for (const key of Object.keys(after.siteSettings) as Array<
    keyof StoreConfig["siteSettings"]
  >) {
    if (
      JSON.stringify(before.siteSettings[key]) !==
      JSON.stringify(after.siteSettings[key])
    ) {
      pushChange(lines, `Hero/sajt: ${String(key)}`);
    }
  }

  for (const key of SITE_NAV_KEYS) {
    const prev = before.siteNavigation[key];
    const next = after.siteNavigation[key];
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      pushChange(lines, `Navigation: ${key}`);
    }
  }

  if (JSON.stringify(before.banner) !== JSON.stringify(after.banner)) {
    pushChange(lines, "Banner / kampanjrad");
  }

  if (
    JSON.stringify(before.marketingTracking) !==
    JSON.stringify(after.marketingTracking)
  ) {
    pushChange(lines, "Marknadsföringsspårning");
  }

  if (before.shippingFee !== after.shippingFee) {
    pushChange(lines, "Fraktavgift");
  }

  if (before.freeShippingThreshold !== after.freeShippingThreshold) {
    pushChange(lines, "Gräns fri frakt");
  }

  if (before.telegramHandle !== after.telegramHandle) {
    pushChange(lines, "Telegram-handle");
  }

  if (before.contactEmail !== after.contactEmail) {
    pushChange(lines, "Kontakt-e-post");
  }

  if (JSON.stringify(before.cryptoWallets) !== JSON.stringify(after.cryptoWallets)) {
    pushChange(lines, "Kryptoplånböcker");
  }

  if (
    JSON.stringify(before.systemIntegration) !==
    JSON.stringify(after.systemIntegration)
  ) {
    pushChange(lines, "Systemintegration");
  }

  if (before.products.length !== after.products.length) {
    pushChange(
      lines,
      `Produkter (${before.products.length} → ${after.products.length})`,
    );
  } else {
    for (let index = 0; index < after.products.length; index += 1) {
      if (JSON.stringify(before.products[index]) !== JSON.stringify(after.products[index])) {
        const id = after.products[index]?.id ?? `index-${index}`;
        pushChange(lines, `Produkt: ${id}`);
      }
    }
  }

  if (before.discounts.length !== after.discounts.length) {
    pushChange(lines, "Rabattkoder (antal)");
  }

  if (before.faqs.length !== after.faqs.length) {
    pushChange(lines, "FAQ (antal)");
  }

  if (
    JSON.stringify(before.bestSellerProductIds) !==
    JSON.stringify(after.bestSellerProductIds)
  ) {
    pushChange(lines, "Bästsäljare-taggar");
  }

  if (
    JSON.stringify(before.premiumProductIds) !==
    JSON.stringify(after.premiumProductIds)
  ) {
    pushChange(lines, "Premium-taggar");
  }

  if (lines.length >= MAX_LINES) {
    lines.push("• … (fler ändringar)");
  }

  return lines;
}
