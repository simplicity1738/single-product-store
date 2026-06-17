import type { Locale } from "@/lib/i18n/translations";
import type { StoreConfig } from "@/lib/store-config";

type HeroTranslations = {
  badge: string;
  title: string;
  tagline: string;
  subtitle: string;
};

type HeroSiteSettings = Pick<
  StoreConfig["siteSettings"],
  "heroBadge" | "heroTitle" | "heroTagline" | "heroSubtitle"
>;

export function resolveHeroContent(
  locale: Locale,
  siteSettings: HeroSiteSettings,
  hero: HeroTranslations,
): HeroTranslations {
  if (locale === "en") {
    return {
      badge: hero.badge,
      title: hero.title,
      tagline: hero.tagline,
      subtitle: hero.subtitle,
    };
  }

  return {
    badge: siteSettings.heroBadge || hero.badge,
    title: siteSettings.heroTitle || hero.title,
    tagline: siteSettings.heroTagline || hero.tagline,
    subtitle: siteSettings.heroSubtitle || hero.subtitle,
  };
}
