import type { StoreConfig } from "@/lib/store-config";

export type HeroFontFamily = "sans" | "serif" | "mono";

export type SiteSettings = StoreConfig["siteSettings"];

export const HERO_FONT_SIZE_OPTIONS = [
  { value: "text-xs", label: "XS" },
  { value: "text-sm", label: "S" },
  { value: "text-base", label: "Base" },
  { value: "text-lg", label: "LG" },
  { value: "text-xl", label: "XL" },
  { value: "text-2xl", label: "2XL" },
  { value: "text-3xl", label: "3XL" },
  { value: "text-4xl", label: "4XL" },
  { value: "text-5xl", label: "5XL" },
  { value: "text-6xl", label: "6XL" },
] as const;

export const HERO_FONT_FAMILY_OPTIONS = [
  { value: "sans" as const, label: "Sans (Inter)" },
  { value: "serif" as const, label: "Serif" },
  { value: "mono" as const, label: "Mono" },
];

export const HERO_FONT_SIZE_CLASSES: Record<
  (typeof HERO_FONT_SIZE_OPTIONS)[number]["value"],
  string
> = {
  "text-xs": "text-xs",
  "text-sm": "text-sm",
  "text-base": "text-base",
  "text-lg": "text-lg",
  "text-xl": "text-xl",
  "text-2xl": "text-2xl",
  "text-3xl": "text-3xl",
  "text-4xl": "text-4xl",
  "text-5xl": "text-5xl",
  "text-6xl": "text-6xl",
};

const VALID_FONT_SIZES = new Set(Object.keys(HERO_FONT_SIZE_CLASSES));

const VALID_FONT_FAMILIES = new Set<HeroFontFamily>(["sans", "serif", "mono"]);

export const HERO_FONT_FAMILY_CLASSES: Record<HeroFontFamily, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export const HERO_LOGO_DEFAULT_PATH = "/hero-logo.png";

export const DEFAULT_HERO_SITE_SETTINGS: SiteSettings = {
  logoPath: "/logo.png",
  heroEyebrow: "NOGGRANT UTVALT SORTIMENT",
  heroBadge: "SUPPORT 24/7",
  heroUseLogoImage: true,
  heroLogoPath: HERO_LOGO_DEFAULT_PATH,
  heroBrandText: "SimpliCity",
  heroBrandFontSize: "text-4xl",
  heroBrandFontFamily: "sans",
  heroTitle: "Kvalitet utan kompromisser",
  heroTitleFontSize: "text-2xl",
  heroTitleFontFamily: "sans",
  heroTagline: "Renhet och kvalitet i fokus",
  heroTaglineFontSize: "text-xl",
  heroTaglineFontFamily: "sans",
  heroSubtitle:
    "SimpliCity är byggt för kunder som förväntar sig mer — noggrant utvalda peptider, verifierad renhet och en premiumupplevelse utan kompromisser.",
  heroDescriptionFontSize: "text-lg",
  heroDescriptionFontFamily: "sans",
  campaignTag: "Säsongskampanj",
  campaignHeadline: "Gör dig redo för sommar!",
  campaignDiscountBadge: "Upp till 25%",
  campaignFeaturedProductId: "tirzepatide",
};

function normalizeFontSize(
  value: unknown,
  fallback: string,
): string {
  const size = typeof value === "string" ? value.trim() : "";
  return VALID_FONT_SIZES.has(size as (typeof HERO_FONT_SIZE_OPTIONS)[number]["value"])
    ? size
    : fallback;
}

function normalizeFontFamily(
  value: unknown,
  fallback: HeroFontFamily,
): HeroFontFamily {
  return typeof value === "string" &&
    VALID_FONT_FAMILIES.has(value as HeroFontFamily)
    ? (value as HeroFontFamily)
    : fallback;
}

function normalizeText(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

export function normalizeSiteSettings(
  input?: Partial<SiteSettings> | null,
): SiteSettings {
  const defaults = DEFAULT_HERO_SITE_SETTINGS;

  return {
    logoPath: normalizeText(input?.logoPath, defaults.logoPath),
    heroEyebrow: normalizeText(input?.heroEyebrow, defaults.heroEyebrow),
    heroBadge: normalizeText(input?.heroBadge, defaults.heroBadge),
    heroUseLogoImage: Boolean(input?.heroUseLogoImage),
    heroLogoPath: normalizeText(input?.heroLogoPath, defaults.heroLogoPath),
    heroBrandText: normalizeText(input?.heroBrandText, defaults.heroBrandText),
    heroBrandFontSize: normalizeFontSize(
      input?.heroBrandFontSize,
      defaults.heroBrandFontSize,
    ),
    heroBrandFontFamily: normalizeFontFamily(
      input?.heroBrandFontFamily,
      defaults.heroBrandFontFamily,
    ),
    heroTitle: normalizeText(input?.heroTitle, defaults.heroTitle),
    heroTitleFontSize: normalizeFontSize(
      input?.heroTitleFontSize,
      defaults.heroTitleFontSize,
    ),
    heroTitleFontFamily: normalizeFontFamily(
      input?.heroTitleFontFamily,
      defaults.heroTitleFontFamily,
    ),
    heroTagline: normalizeText(input?.heroTagline, defaults.heroTagline),
    heroTaglineFontSize: normalizeFontSize(
      input?.heroTaglineFontSize,
      defaults.heroTaglineFontSize,
    ),
    heroTaglineFontFamily: normalizeFontFamily(
      input?.heroTaglineFontFamily,
      defaults.heroTaglineFontFamily,
    ),
    heroSubtitle: normalizeText(input?.heroSubtitle, defaults.heroSubtitle),
    heroDescriptionFontSize: normalizeFontSize(
      input?.heroDescriptionFontSize,
      defaults.heroDescriptionFontSize,
    ),
    heroDescriptionFontFamily: normalizeFontFamily(
      input?.heroDescriptionFontFamily,
      defaults.heroDescriptionFontFamily,
    ),
    campaignTag: normalizeText(input?.campaignTag, defaults.campaignTag),
    campaignHeadline: normalizeText(
      input?.campaignHeadline,
      defaults.campaignHeadline,
    ),
    campaignDiscountBadge: normalizeText(
      input?.campaignDiscountBadge,
      defaults.campaignDiscountBadge,
    ),
    campaignFeaturedProductId: normalizeText(
      input?.campaignFeaturedProductId,
      defaults.campaignFeaturedProductId,
    ),
  };
}

export function resolveHeroLogoSrc(
  siteSettings: Pick<
    SiteSettings,
    "heroUseLogoImage" | "heroLogoPath" | "logoPath"
  >,
): string {
  if (siteSettings.heroUseLogoImage) {
    return (
      siteSettings.heroLogoPath.trim() || HERO_LOGO_DEFAULT_PATH
    );
  }

  return (
    siteSettings.heroLogoPath.trim() ||
    siteSettings.logoPath.trim() ||
    HERO_LOGO_DEFAULT_PATH
  );
}

export function heroTypographyClass(
  fontSize: string,
  fontFamily: HeroFontFamily,
): string {
  const sizeClass =
    HERO_FONT_SIZE_CLASSES[
      fontSize as keyof typeof HERO_FONT_SIZE_CLASSES
    ] ?? HERO_FONT_SIZE_CLASSES["text-base"];
  return `${sizeClass} ${HERO_FONT_FAMILY_CLASSES[fontFamily]}`.trim();
}
