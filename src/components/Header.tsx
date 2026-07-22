"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ContactDrawer from "@/components/ContactDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  getSiteNavLabel,
  isSiteNavLinkVisible,
  isSiteSectionVisible,
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
    "cursor-pointer text-xs font-medium uppercase tracking-wider text-[#1A1513] transition-colors hover:opacity-75 md:text-sm";

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
      <span className="mb-0.5 text-[#1A1513]/70" aria-hidden>
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
        className={`${brandDisplay.className} text-[1.35rem] font-semibold leading-none tracking-wider text-[#1A1513] transition group-hover:text-black sm:text-[1.55rem]`}
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
  const [isContactOpen, setIsContactOpen] = useState(false);

  const brandName = siteSettings.heroBrandText.trim() || t.brand;
  const showContact = isSiteSectionVisible(siteNavigation, "kontakt");

  const visibleNavLinks = SITE_NAV_ROUTES.filter(
    (route) =>
      route.key !== "kontakt" &&
      isSiteNavLinkVisible(siteNavigation, route.key),
  ).map((route) => ({
    ...route,
    label: getSiteNavLabel(siteNavigation, route.key, locale),
  }));

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#contact" && showContact) {
        setIsContactOpen(true);
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [showContact]);

  return (
    <>
      <AnnouncementBanner banner={banner} />
      <header className="relative z-30 flex h-16 w-full shrink-0 items-center justify-between bg-[#ECE5D8] px-6 md:h-20 md:px-12">
        <nav className="hidden min-w-0 items-center gap-5 overflow-x-auto lg:flex xl:gap-7">
          {visibleNavLinks.map((link) => (
            <NavLinkItem key={link.key} href={link.href} label={link.label} />
          ))}
        </nav>
        <div className="lg:hidden" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <BrandMark name={brandName} />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {showContact ? (
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="hidden cursor-pointer text-xs font-medium uppercase tracking-wider text-[#1A1513] transition hover:opacity-75 sm:inline-flex md:text-sm"
            >
              {t.contact.eyebrow}
            </button>
          ) : null}
          <LanguageSwitcher variant="light" />
          <button
            type="button"
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#1A1513] transition hover:bg-black/5 hover:text-black sm:h-10 sm:w-10"
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
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#1A1513] px-1 text-[9px] font-bold text-[#ECE5D8]">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {(visibleNavLinks.length > 0 || showContact) && (
        <nav className="flex flex-wrap gap-x-4 gap-y-2 bg-[#ECE5D8] px-6 pb-3 lg:hidden md:px-12">
          {visibleNavLinks.map((link) => (
            <NavLinkItem key={link.key} href={link.href} label={link.label} />
          ))}
          {showContact ? (
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="cursor-pointer text-xs font-medium uppercase tracking-wider text-[#1A1513] transition hover:opacity-75 md:text-sm"
            >
              {t.contact.eyebrow}
            </button>
          ) : null}
        </nav>
      )}

      <ContactDrawer
        open={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
}
