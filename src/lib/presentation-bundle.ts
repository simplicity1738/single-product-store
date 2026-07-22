export const PRESENTATION_BUNDLE_PRODUCT_ID = "presentation-bundle" as const;

export type PresentationBundleSettings = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  productIds: string[];
  imagePath: string;
  ctaLabel: string;
  disclaimer: string;
  unitBreakdown: string;
};

export const DEFAULT_PRESENTATION_BUNDLE: PresentationBundleSettings = {
  enabled: true,
  eyebrow: "Exklusivt paketerbjudande",
  title: "Varje substans. Ett förseglat set.",
  subtitle:
    "Alla fem SimpliCity-substanser i en exklusiv presentationstyp, där varje flaskas renhet är garanterad.",
  price: 1000,
  originalPrice: 1500,
  productIds: [],
  imagePath: "/simplicity-presentation-set.png",
  ctaLabel: "Lägg till paketet i varukorgen",
  disclaimer: "Skickas samma dag · För forskningsändamål",
  unitBreakdown: "Blir 200 kr per flaska — dokumentation ingår.",
};

function normalizeMoney(value: unknown, fallback: number): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0) return fallback;
  return Math.round(amount);
}

function normalizeText(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  return typeof value === "string" ? value.trim() : fallback;
}

export function normalizePresentationBundle(
  input?: Partial<PresentationBundleSettings> | null,
): PresentationBundleSettings {
  const defaults = DEFAULT_PRESENTATION_BUNDLE;
  const productIds = Array.isArray(input?.productIds)
    ? input.productIds
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        .map((id) => id.trim())
        .slice(0, 5)
    : defaults.productIds;

  return {
    enabled:
      input?.enabled === undefined ? defaults.enabled : Boolean(input.enabled),
    eyebrow: normalizeText(input?.eyebrow, defaults.eyebrow),
    title: normalizeText(input?.title, defaults.title),
    subtitle: normalizeText(input?.subtitle, defaults.subtitle),
    price: normalizeMoney(input?.price, defaults.price),
    originalPrice: normalizeMoney(input?.originalPrice, defaults.originalPrice),
    productIds,
    imagePath: normalizeText(input?.imagePath, defaults.imagePath),
    ctaLabel: normalizeText(input?.ctaLabel, defaults.ctaLabel),
    disclaimer: normalizeText(input?.disclaimer, defaults.disclaimer),
    unitBreakdown: normalizeText(input?.unitBreakdown, defaults.unitBreakdown),
  };
}

export function getPresentationBundle(settings: {
  presentationBundle?: PresentationBundleSettings | null;
}): PresentationBundleSettings {
  return normalizePresentationBundle(settings.presentationBundle);
}

export function formatBundleUnitBreakdown(
  price: number,
  productCount: number,
): string {
  const count = Math.max(1, productCount || 5);
  const perUnit = Math.round(price / count);
  return `Blir ${perUnit.toLocaleString("sv-SE")} kr per flaska — dokumentation ingår.`;
}
