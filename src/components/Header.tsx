"use client";

import Image from "next/image";
import Link from "next/link";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  getSiteNavLabel,
  isSiteNavLinkVisible,
  SITE_NAV_ROUTES,
} from "@/lib/site-navigation";

function isStandalonePage(href: string) {
  return href.startsWith("/") && !href.includes("#");
}

function NavLinkItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const className =
    "text-sm font-medium text-zinc-600 transition-colors hover:text-rose-600";

  if (isStandalonePage(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

export default function Header() {
  const { locale, t } = useLanguage();
  const { siteSettings, banner, siteNavigation } = useStoreConfig();

  const visibleNavLinks = SITE_NAV_ROUTES.filter((route) =>
    isSiteNavLinkVisible(siteNavigation, route.key),
  ).map((route) => ({
    ...route,
    label: getSiteNavLabel(siteNavigation, route.key, locale),
  }));

  return (
    <>
      <AnnouncementBanner banner={banner} />
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-pink-200 bg-rose-50 shadow-md shadow-rose-100 sm:h-20 sm:w-20">
              <Image
                src={siteSettings.logoPath || "/logo.png"}
                alt={t.brand}
                width={200}
                height={200}
                className="h-[115%] w-[115%] object-cover object-center"
                priority
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
            {visibleNavLinks.map((link) => (
              <NavLinkItem key={link.key} href={link.href} label={link.label} />
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link
              href="/#checkout-form"
              className="inline-flex h-10 items-center justify-center rounded-full bg-rose-400 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 sm:px-5"
            >
              {t.nav.buyNow}
            </Link>
          </div>
        </div>

        {visibleNavLinks.length > 0 && (
          <nav className="flex flex-wrap gap-x-4 gap-y-2 border-t border-rose-100 px-4 py-3 lg:hidden sm:px-6">
            {visibleNavLinks.map((link) => (
              <NavLinkItem key={link.key} href={link.href} label={link.label} />
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
