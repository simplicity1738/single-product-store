"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import PaymentTrustBadges from "@/components/PaymentTrustBadges";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { getSiteNavLabel, isSiteNavLinkVisible } from "@/lib/site-navigation";

const footerDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function Footer() {
  const { locale, t } = useLanguage();
  const { siteNavigation } = useStoreConfig();
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const legalLinks = useMemo(() => {
    const links: { href: string; label: string }[] = [
      { href: "/privacy-policy", label: t.footer.privacy },
      { href: "/terms", label: t.footer.terms },
      { href: "/ansvarsfriskrivning", label: t.footer.disclaimerLink },
    ];

    if (isSiteNavLinkVisible(siteNavigation, "labbtester")) {
      links.push({
        href: "/labbtester",
        label: getSiteNavLabel(siteNavigation, "labbtester", locale),
      });
    }

    return links;
  }, [
    locale,
    siteNavigation,
    t.footer.disclaimerLink,
    t.footer.privacy,
    t.footer.terms,
  ]);

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNewsletterStatus(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Signup failed");
      }

      setNewsletterStatus(data.message);
      setEmail("");
    } catch (error) {
      setNewsletterStatus(
        error instanceof Error
          ? error.message
          : "Kunde inte spara prenumerationen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-white/10 bg-[#0B0908] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8]">
            Nyhetsbrev
          </p>
          <h3
            className={`${footerDisplay.className} mt-2 text-2xl font-serif text-white`}
          >
            Bli en del av SimpliCity
          </h3>
          <p className="mt-2 text-sm text-[#CFC4BD]">
            Få exklusiva uppdateringar och erbjudanden direkt i inkorgen.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="din@epost.se"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:opacity-60"
            >
              {isSubmitting ? "Skickar…" : "Prenumerera"}
            </button>
          </form>
          {newsletterStatus ? (
            <p className="mt-3 text-sm text-[#CFC4BD]">{newsletterStatus}</p>
          ) : null}
        </div>

        <PaymentTrustBadges className="mb-8 border-t border-white/10 pt-8" />

        <nav className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-[#A89A92] transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-center">
          <p className="text-xs text-[#A89A92]">
            © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
