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
  hide_navbar: boolean;
  hide_section: boolean;
  /** @deprecated Migrated to hide_navbar / hide_section on read. */
  visible?: boolean;
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

export const SITE_NAV_HOMEPAGE_SECTION_KEYS: SiteNavKey[] = [
  "produkter",
  "fordelar",
  "kvalitet",
  "bestall",
  "kontakt",
  "faq",
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
  produkter: { title: "Produkter", hint: "Meny — sektionen #products på startsidan" },
  labbtester: {
    title: "Labbtester",
    hint: "Meny och sidfot — sidan /labbtester",
  },
  fordelar: { title: "Fördelar", hint: "Meny — sektionen #features på startsidan" },
  kvalitet: { title: "Kvalitet", hint: "Meny — sektionen #quality på startsidan" },
  bestall: { title: "Beställ", hint: "Meny — kassaformuläret #checkout-form" },
  blogg: { title: "Blogg", hint: "Meny — sidan /blogg" },
  kalkylator: {
    title: "Kalkylator",
    hint: "Meny — sidan /kalkylator",
  },
  kontakt: { title: "Kontakt", hint: "Meny — sektionen #contact på startsidan" },
  faq: {
    title: "FAQ",
    hint: "Flytande supportwidget (ingen menylänk)",
  },
};

function trimLabel(value: string, fallback: string): string {
  const trimmed = value.trim().slice(0, SITE_NAV_LABEL_MAX);
  return trimmed || fallback;
}

function buildDefaultSiteNavItem(
  label_sv: string,
  label_en: string,
): SiteNavItem {
  return {
    label_sv,
    label_en,
    hide_navbar: false,
    hide_section: false,
  };
}

export function buildDefaultSiteNavigation(): SiteNavigation {
  const sv = translations.sv;
  const en = translations.en;

  return {
    produkter: buildDefaultSiteNavItem(sv.nav.products, en.nav.products),
    labbtester: buildDefaultSiteNavItem(sv.nav.labTests, en.nav.labTests),
    fordelar: buildDefaultSiteNavItem(sv.nav.features, en.nav.features),
    kvalitet: buildDefaultSiteNavItem(sv.nav.quality, en.nav.quality),
    bestall: buildDefaultSiteNavItem(sv.nav.order, en.nav.order),
    blogg: buildDefaultSiteNavItem(sv.nav.blog, en.nav.blog),
    kalkylator: buildDefaultSiteNavItem(sv.nav.calculator, en.nav.calculator),
    kontakt: buildDefaultSiteNavItem(sv.nav.contact, en.nav.contact),
    faq: buildDefaultSiteNavItem(sv.faq.teacherTag, en.faq.teacherTag),
  };
}

export const DEFAULT_SITE_NAVIGATION = buildDefaultSiteNavigation();

function normalizeSiteNavItem(
  key: SiteNavKey,
  entry: Partial<SiteNavItem> | undefined,
  legacyVisible?: boolean,
): SiteNavItem {
  const defaults = DEFAULT_SITE_NAVIGATION[key];

  let hide_navbar = defaults.hide_navbar;
  let hide_section = defaults.hide_section;

  if (
    typeof entry?.hide_navbar === "boolean" ||
    typeof entry?.hide_section === "boolean"
  ) {
    hide_navbar = entry.hide_navbar ?? defaults.hide_navbar;
    hide_section = entry.hide_section ?? defaults.hide_section;
  } else if (typeof entry?.visible === "boolean") {
    hide_navbar = !entry.visible;
    hide_section = !entry.visible;
  } else if (typeof legacyVisible === "boolean") {
    hide_navbar = !legacyVisible;
    hide_section = !legacyVisible;
  }

  return {
    label_sv: trimLabel(String(entry?.label_sv ?? defaults.label_sv), defaults.label_sv),
    label_en: trimLabel(String(entry?.label_en ?? defaults.label_en), defaults.label_en),
    hide_navbar,
    hide_section,
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

/** True when the item should appear in the header / mobile navigation. */
export function isSiteNavLinkVisible(
  siteNavigation: SiteNavigation,
  key: SiteNavKey,
): boolean {
  return siteNavigation[key]?.hide_navbar !== true;
}

/** True when a homepage section (or FAQ widget) should render. */
export function isSiteSectionVisible(
  siteNavigation: SiteNavigation,
  key: SiteNavKey,
): boolean {
  return siteNavigation[key]?.hide_section !== true;
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

/** @deprecated Use `isSiteNavLinkVisible` or `isSiteSectionVisible`. */
export function isSiteNavVisible(
  siteNavigation: SiteNavigation,
  key: SiteNavKey,
): boolean {
  return isSiteNavLinkVisible(siteNavigation, key) && isSiteSectionVisible(siteNavigation, key);
}

/** @deprecated Use `isSiteNavLinkVisible` with `siteNavigation` instead. */
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
      typeof value?.[key] === "boolean"
        ? value[key]!
        : !defaults[key].hide_navbar;
  }

  return normalized;
}
