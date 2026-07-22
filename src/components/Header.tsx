"use client";

import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  getSiteNavLabel,
  isSiteNavLinkVisible,
  SITE_NAV_ROUTES,
} from "@/lib/site-navigation";

const brandDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

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
    "text-[10px] font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-900 sm:text-[11px]";

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

function BrandMark({ name }: { name: string }) {
  return (
    <Link
      href="/"
      className="group flex flex-col items-center justify-center text-center"
      aria-label={name}
    >
      <span className="mb-0.5 text-rose-400/90" aria-hidden>
        <svg
          viewBox="0 0 28 14"
          className="h-3 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 8.5c-2.2-3.6-6.2-4.4-8.2-2.6C3.8 7.6 4.6 10.2 7 11c2.1.7 4.5-.2 7-2.5 2.5 2.3 4.9 3.2 7 2.5 2.4-.8 3.2-3.4 1.2-5.1C20.2 4.1 16.2 4.9 14 8.5z" />
          <path d="M14 8.5V12.5" />
        </svg>
      </span>
      <span
        className={`${brandDisplay.className} text-[1.35rem] font-semibold leading-none tracking-[0.04em] text-stone-900 transition group-hover:text-stone-700 sm:text-[1.55rem]`}
      >
        {name}
      </span>
    </Link>
  );
}

export default function Header() {
  const { locale, t } = useLanguage();
  const { siteSettings, banner, siteNavigation } = useStoreConfig();
  const { cartItemCount, openCart } = useProductSelection();

  const brandName = siteSettings.heroBrandText.trim() || t.brand;

  const visibleNavLinks = SITE_NAV_ROUTES.filter((route) =>
    isSiteNavLinkVisible(siteNavigation, route.key),
  ).map((route) => ({
    ...route,
    label: getSiteNavLabel(siteNavigation, route.key, locale),
  }));

  return (
    <>
      <AnnouncementBanner banner={banner} />
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#F7F4F0]/90 backdrop-blur-md">
        <div className="relative mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          {/* Left nav — CMS-bound */}
          <nav className="hidden min-w-0 items-center gap-4 overflow-x-auto lg:flex xl:gap-6">
            {visibleNavLinks.map((link) => (
              <NavLinkItem key={link.key} href={link.href} label={link.label} />
            ))}
          </nav>
          <div className="lg:hidden" />

          {/* Center brand */}
          <div className="flex justify-center">
            <BrandMark name={brandName} />
          </div>

          {/* Right icons */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-200/60 hover:text-stone-900 sm:h-10 sm:w-10"
              aria-label={t.cart.openCart}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-stone-800 px-1 text-[9px] font-bold text-white">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {visibleNavLinks.length > 0 && (
          <nav className="flex flex-wrap gap-x-4 gap-y-2 border-t border-stone-200/70 px-4 py-2.5 lg:hidden sm:px-6">
            {visibleNavLinks.map((link) => (
              <NavLinkItem key={link.key} href={link.href} label={link.label} />
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
