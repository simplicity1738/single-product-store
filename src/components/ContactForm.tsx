"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { CONTACT } from "@/lib/contact";

const inputClassName =
  "w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200";

export default function ContactForm() {
  const { locale, t } = useLanguage();
  const { telegramHandle, telegramUrl } = useStoreConfig();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? t.contact.errors.generic);
      }

      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
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

  return (
    <section id="contact" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            {t.contact.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t.contact.title}
          </h2>
          <p className="mt-4 text-lg text-zinc-600">{t.contact.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6 shadow-sm sm:p-8"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  {t.contact.name}
                </label>
                <input
                  id="contact-name"
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
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  {t.contact.email}
                </label>
                <input
                  id="contact-email"
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
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  {t.contact.message}
                </label>
                <textarea
                  id="contact-message"
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
            </div>

            {error && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {t.contact.success}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t.contact.sending : t.contact.send}
            </button>
          </form>

          <aside className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-semibold text-zinc-900">
              {t.contact.directTitle}
            </h3>

            <div className="mt-6 space-y-4">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#229ED9] text-white">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t.contact.telegram}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {telegramHandle || CONTACT.telegramHandle}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-400 text-white">
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
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t.contact.emailLink}
                  </p>
                  <p className="text-sm text-zinc-500">{CONTACT.email}</p>
                </div>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
