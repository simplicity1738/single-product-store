import { translations, type Locale } from "@/lib/i18n/translations";

export type SiteNavKey =
  | "produkter"
  | "labbtester"
  | "fordelar"
  | "kvalitet"
  | "bestall"
  | "blogg"
  | "kalkylator"
  | "kontakt"
  | "faq";

export type SiteNavItem = {
  label_sv: string;
  label_en: string;
  visible: boolean;
};

export type SiteNavigation = Record<SiteNavKey, SiteNavItem>;

/** @deprecated Legacy visibility map — migrated into `siteNavigation` on read. */
export type NavVisibility = Record<
  Exclude<SiteNavKey, "faq">,
  boolean
>;

export const SITE_NAV_LABEL_MAX = 80;

export const SITE_NAV_KEYS: SiteNavKey[] = [
  "produkter",
  "labbtester",
  "fordelar",
  "kvalitet",
  "bestall",
  "blogg",
  "kalkylator",
  "kontakt",
  "faq",
];

export const SITE_NAV_HEADER_KEYS: Exclude<SiteNavKey, "faq">[] = [
  "produkter",
  "labbtester",
  "fordelar",
  "kvalitet",
  "bestall",
  "blogg",
  "kalkylator",
  "kontakt",
];

export const SITE_NAV_ROUTES: {
  key: Exclude<SiteNavKey, "faq">;
  href: string;
}[] = [
  { key: "produkter", href: "/#products" },
  { key: "labbtester", href: "/labbtester" },
  { key: "fordelar", href: "/#features" },
  { key: "kvalitet", href: "/#quality" },
  { key: "bestall", href: "/#checkout-form" },
  { key: "blogg", href: "/blogg" },
  { key: "kalkylator", href: "/kalkylator" },
  { key: "kontakt", href: "/#contact" },
];

export const SITE_NAV_ADMIN_META: Record<
  SiteNavKey,
  { title: string; hint: string }
> = {
  produkter: { title: "Produkter", hint: "Huvudmeny — sektionen #products" },
  labbtester: {
    title: "Labbtester",
    hint: "Huvudmeny och sidfot — /labbtester",
  },
  fordelar: { title: "Fördelar", hint: "Huvudmeny — sektionen #features" },
  kvalitet: { title: "Kvalitet", hint: "Huvudmeny — sektionen #quality" },
  bestall: { title: "Beställ", hint: "Huvudmeny — sektionen #checkout-form" },
  blogg: { title: "Blogg", hint: "Huvudmeny — /blogg" },
  kalkylator: {
    title: "Kalkylator",
    hint: "Huvudmeny — /kalkylator (t.ex. Doseringsguide)",
  },
  kontakt: { title: "Kontakt", hint: "Huvudmeny — sektionen #contact" },
  faq: {
    title: "FAQ",
    hint: "Flytande supportwidget (lärarroboten)",
  },
};

function trimLabel(value: string, fallback: string): string {
  const trimmed = value.trim().slice(0, SITE_NAV_LABEL_MAX);
  return trimmed || fallback;
}

export function buildDefaultSiteNavigation(): SiteNavigation {
  const sv = translations.sv;
  const en = translations.en;

  return {
    produkter: {
      label_sv: sv.nav.products,
      label_en: en.nav.products,
      visible: true,
    },
    labbtester: {
      label_sv: sv.nav.labTests,
      label_en: en.nav.labTests,
      visible: true,
    },
    fordelar: {
      label_sv: sv.nav.features,
      label_en: en.nav.features,
      visible: true,
    },
    kvalitet: {
      label_sv: sv.nav.quality,
      label_en: en.nav.quality,
      visible: true,
    },
    bestall: {
      label_sv: sv.nav.order,
      label_en: en.nav.order,
      visible: true,
    },
    blogg: {
      label_sv: sv.nav.blog,
      label_en: en.nav.blog,
      visible: true,
    },
    kalkylator: {
      label_sv: sv.nav.calculator,
      label_en: en.nav.calculator,
      visible: true,
    },
    kontakt: {
      label_sv: sv.nav.contact,
      label_en: en.nav.contact,
      visible: true,
    },
    faq: {
      label_sv: sv.faq.teacherTag,
      label_en: en.faq.teacherTag,
      visible: true,
    },
  };
}

export const DEFAULT_SITE_NAVIGATION = buildDefaultSiteNavigation();

function normalizeSiteNavItem(
  key: SiteNavKey,
  entry: Partial<SiteNavItem> | undefined,
  legacyVisible?: boolean,
): SiteNavItem {
  const defaults = DEFAULT_SITE_NAVIGATION[key];

  return {
    label_sv: trimLabel(String(entry?.label_sv ?? defaults.label_sv), defaults.label_sv),
    label_en: trimLabel(String(entry?.label_en ?? defaults.label_en), defaults.label_en),
    visible:
      typeof entry?.visible === "boolean"
        ? entry.visible
        : typeof legacyVisible === "boolean"
          ? legacyVisible
          : defaults.visible,
  };
}

export function normalizeSiteNavigation(
  siteNavigation: Partial<SiteNavigation> | undefined,
  legacyNavVisibility?: Partial<NavVisibility>,
): SiteNavigation {
  const normalized = buildDefaultSiteNavigation();

  for (const key of SITE_NAV_KEYS) {
    const legacyVisible =
      key !== "faq" && legacyNavVisibility
        ? legacyNavVisibility[key as Exclude<SiteNavKey, "faq">]
        : undefined;

    normalized[key] = normalizeSiteNavItem(
      key,
      siteNavigation?.[key],
      legacyVisible,
    );
  }

  return normalized;
}

export function isSiteNavVisible(
  siteNavigation: SiteNavigation,
  key: SiteNavKey,
): boolean {
  return siteNavigation[key]?.visible !== false;
}

export function getSiteNavLabel(
  siteNavigation: SiteNavigation,
  key: SiteNavKey,
  locale: Locale,
): string {
  const item = siteNavigation[key] ?? DEFAULT_SITE_NAVIGATION[key];
  const defaults = DEFAULT_SITE_NAVIGATION[key];

  if (locale === "en") {
    return item.label_en.trim() || item.label_sv.trim() || defaults.label_en;
  }

  return item.label_sv.trim() || defaults.label_sv;
}

/** @deprecated Use `isSiteNavVisible` with `siteNavigation` instead. */
export function isNavLinkVisible(
  navVisibility: NavVisibility,
  key: Exclude<SiteNavKey, "faq">,
): boolean {
  return navVisibility[key] !== false;
}

/** @deprecated Use `normalizeSiteNavigation` instead. */
export function normalizeNavVisibility(
  value: Partial<NavVisibility> | undefined,
): NavVisibility {
  const defaults = DEFAULT_SITE_NAVIGATION;
  const normalized = {} as NavVisibility;

  for (const key of SITE_NAV_HEADER_KEYS) {
    normalized[key] =
      typeof value?.[key] === "boolean" ? value[key]! : defaults[key].visible;
  }

  return normalized;
}
