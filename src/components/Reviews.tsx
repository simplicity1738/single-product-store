"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";

export default function Reviews() {
  const { locale, t } = useLanguage();
  const { reviews } = useStoreConfig();

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section id="reviews" className="scroll-mt-24 border-t border-rose-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
            {t.reviews.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t.reviews.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {reviews.map((review) => {
            const content = review[locale];

            return (
              <article key={review.id} className="flex flex-col">
                <h3 className="text-base font-bold leading-snug text-zinc-900 sm:text-lg">
                  {content.heading}
                </h3>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">
                  &ldquo;{content.quote}&rdquo;
                </blockquote>
                <p className="mt-5 text-sm text-zinc-400">
                  — {content.author}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
