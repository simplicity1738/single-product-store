"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const legalLinks = [
    { href: "/privacy-policy", label: t.footer.privacy },
    { href: "/terms", label: t.footer.terms },
    { href: "/lab-tests", label: t.footer.labTests },
  ];

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
    <footer className="border-t border-rose-100 bg-white py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-rose-100 bg-rose-50/40 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            Nyhetsbrev
          </p>
          <h3 className="mt-2 text-xl font-bold text-zinc-900">
            Bli en del av SimpliCity
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
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
              className="flex-1 rounded-full border border-rose-200 bg-white px-5 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-rose-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
            >
              {isSubmitting ? "Skickar…" : "Prenumerera"}
            </button>
          </form>
          {newsletterStatus && (
            <p className="mt-3 text-sm text-zinc-600">{newsletterStatus}</p>
          )}
        </div>

        <nav className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-500 transition hover:text-rose-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
          </p>
          <p className="text-xs text-zinc-400">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
