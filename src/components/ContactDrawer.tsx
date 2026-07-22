"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { CONTACT } from "@/lib/contact";
import { isSiteSectionVisible } from "@/lib/site-navigation";

const drawerDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#ECE5D8]";

type ContactDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function ContactDrawer({ open, onClose }: ContactDrawerProps) {
  const { locale, t } = useLanguage();
  const { telegramHandle, telegramUrl, contactEmail, siteNavigation } =
    useStoreConfig();
  const prefersReducedMotion = useReducedMotion();
  const [form, setForm] = useState({
    name: "",
    email: "",
    orderId: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const showContact = isSiteSectionVisible(siteNavigation, "kontakt");

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const orderNote = form.orderId.trim()
      ? `${t.contact.orderId}: ${form.orderId.trim()}\n\n`
      : "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: `${orderNote}${form.message}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? t.contact.errors.generic);
      }

      setSuccess(true);
      setForm({ name: "", email: "", orderId: "", message: "" });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t.contact.errors.generic,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!showContact) {
    return null;
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="contact-overlay"
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            key="contact-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-drawer-title"
            className="fixed inset-y-0 right-0 z-[80] flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-white/10 bg-[#181312] p-6 text-white shadow-2xl md:p-8"
            initial={prefersReducedMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? undefined : { x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="contact-drawer-title"
                  className={`${drawerDisplay.className} text-2xl font-serif text-white`}
                >
                  {t.contact.eyebrow}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-[#ECE5D8] transition hover:bg-white/10 hover:text-white"
                  aria-label={t.contact.close}
                >
                  ✕
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#CFC4BD]">
                {t.contact.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="contact-drawer-name"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.contact.name}
                  </label>
                  <input
                    id="contact-drawer-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder={t.contact.placeholders.name}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-drawer-email"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.contact.email}
                  </label>
                  <input
                    id="contact-drawer-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder={t.contact.placeholders.email}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-drawer-order"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.contact.orderId}
                  </label>
                  <input
                    id="contact-drawer-order"
                    name="orderId"
                    type="text"
                    autoComplete="off"
                    value={form.orderId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        orderId: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder={t.contact.placeholders.orderId}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-drawer-message"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A89A92]"
                  >
                    {t.contact.message}
                  </label>
                  <textarea
                    id="contact-drawer-message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    className={`${inputClassName} resize-none`}
                    placeholder={t.contact.placeholders.message}
                  />
                </div>

                {error ? (
                  <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#CFC4BD]">
                    {error}
                  </p>
                ) : null}

                {success ? (
                  <p className="rounded-xl border border-[#ECE5D8]/30 bg-[#ECE5D8]/10 px-4 py-3 text-sm text-[#ECE5D8]">
                    {t.contact.success}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#ECE5D8] py-3 text-xs font-medium uppercase tracking-wider text-[#0F0C0B] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? t.contact.sending : t.contact.send}
                </button>
              </form>
            </div>

            <div className="mt-10 space-y-4 border-t border-white/10 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A89A92]">
                {t.contact.directTitle}
              </p>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/25"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#ECE5D8]">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">
                    {t.contact.telegram}
                  </span>
                  <span className="block text-xs text-[#A89A92]">
                    {telegramHandle || CONTACT.telegramHandle}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${contactEmail || CONTACT.email}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/25"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#ECE5D8]">
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
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">
                    {t.contact.emailLink}
                  </span>
                  <span className="block text-xs text-[#A89A92]">
                    {contactEmail || CONTACT.email}
                  </span>
                </span>
              </a>

              <p className="text-xs leading-relaxed text-[#A89A92]">
                {t.contact.responseNotice}
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
