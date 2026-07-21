"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import type { PublicCustomerReview } from "@/lib/customer-reviews";
import { formatMgOption } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/product-localization";

type ReviewSummary = {
  averageRating: number;
  totalApproved: number;
};

function StarRating({
  rating,
  size = "md",
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const sizeClass =
    size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5" role={interactive ? "group" : undefined}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= rating;

        if (interactive) {
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} stjärnor`}
              onClick={() => onChange?.(value)}
              className={`${sizeClass} transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60`}
            >
              <StarIcon filled={filled || value <= rating} />
            </button>
          );
        }

        return (
          <span key={value} className={sizeClass} aria-hidden>
            <StarIcon filled={filled} />
          </span>
        );
      })}
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={filled ? "text-amber-400" : "text-amber-300/70"}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function formatReviewDate(isoDate: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export default function Reviews() {
  const { locale, t } = useLanguage();
  const { catalogProducts, products: configProducts } = useStoreConfig();
  const [reviews, setReviews] = useState<PublicCustomerReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalApproved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [productTag, setProductTag] = useState("");
  const [email, setEmail] = useState("");

  const productOptions = useMemo(() => {
    return catalogProducts.flatMap((product) => {
      const configEntry = configProducts.find((entry) => entry.id === product.id);
      const productName = getLocalizedProductName(
        configEntry,
        product.id,
        locale,
      );

      if (product.variantLabels && product.variantLabels.length > 0) {
        return product.variantLabels.map((label) => {
          const tag = `${productName} ${label}`;
          return { value: tag, label: tag };
        });
      }

      if (product.variants.length > 1) {
        return product.variants.map((variant) => {
          const label = formatMgOption(variant.mg);
          const tag = `${productName} ${label}`;
          return { value: tag, label: tag };
        });
      }

      return [{ value: productName, label: productName }];
    });
  }, [catalogProducts, configProducts, locale]);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reviews");
      const data = (await response.json()) as {
        success?: boolean;
        reviews?: PublicCustomerReview[];
        summary?: ReviewSummary;
      };

      if (data.success) {
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setSummary(
          data.summary ?? { averageRating: 0, totalApproved: 0 },
        );
      }
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ name, rating, text, productTag, email }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        setFormMessage({
          type: "error",
          text: data.message ?? t.reviews.form.error,
        });
        return;
      }

      setFormMessage({
        type: "success",
        text: data.message ?? t.reviews.form.success,
      });
      setName("");
      setRating(5);
      setText("");
      setProductTag("");
      setEmail("");
      setShowForm(false);
    } catch {
      setFormMessage({
        type: "error",
        text: t.reviews.form.error,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const reviewCountLabel = t.reviews.reviewCount.replace(
    "{{count}}",
    String(summary.totalApproved),
  );

  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-t border-rose-100 bg-gradient-to-b from-white to-rose-50/30 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
            {t.reviews.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t.reviews.title}
          </h2>

          <div className="mt-8 inline-flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-white px-8 py-5 shadow-sm shadow-rose-100/50 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold tabular-nums text-zinc-900">
                {summary.totalApproved > 0
                  ? summary.averageRating.toFixed(1)
                  : "—"}
              </span>
              <div className="text-left">
                <StarRating
                  rating={Math.round(summary.averageRating) || 0}
                  size="md"
                />
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {t.reviews.averageLabel}
                </p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-rose-100 sm:block" aria-hidden />
            <p className="text-sm font-medium text-zinc-600">{reviewCountLabel}</p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setFormMessage(null);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            {showForm ? t.reviews.cancel : t.reviews.writeReview}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-2xl rounded-2xl border border-rose-100 bg-white p-6 shadow-lg shadow-rose-100/40 sm:p-8"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="review-product"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  {t.reviews.form.productLabel}
                </label>
                <select
                  id="review-product"
                  value={productTag}
                  onChange={(event) => setProductTag(event.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="">{t.reviews.form.productPlaceholder}</option>
                  {productOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="review-name"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  {t.reviews.form.nameLabel}
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.reviews.form.namePlaceholder}
                  maxLength={80}
                  required
                  className="mt-2 w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <div>
                <label
                  htmlFor="review-email"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  {t.reviews.form.emailLabel}
                </label>
                <input
                  id="review-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.reviews.form.emailPlaceholder}
                  maxLength={254}
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {t.reviews.form.ratingLabel}
                </p>
                <div className="mt-2">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-text"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  {t.reviews.form.textLabel}
                </label>
                <textarea
                  id="review-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={t.reviews.form.textPlaceholder}
                  rows={5}
                  maxLength={1200}
                  required
                  className="mt-2 w-full resize-y rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "…" : t.reviews.submit}
              </button>
            </div>
          </form>
        )}

        {formMessage && (
          <p
            className={`mx-auto mt-6 max-w-2xl rounded-xl px-4 py-3 text-center text-sm font-medium ${
              formMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
            role="status"
          >
            {formMessage.text}
          </p>
        )}

        <div className="mt-14">
          {isLoading ? (
            <p className="text-center text-sm text-zinc-500">{t.reviews.loading}</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">{t.reviews.noReviews}</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="flex flex-col rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:border-rose-200 hover:shadow-md hover:shadow-rose-100/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-900">
                          {review.name}
                        </h3>
                        {review.productTag && (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                            {review.productTag}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    {review.isVerified && (
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                        {t.reviews.verifiedPurchase}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs font-medium text-zinc-400">
                    {formatReviewDate(review.createdAt, locale)}
                  </p>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">
                    &ldquo;{review.text}&rdquo;
                  </blockquote>
                  {review.adminReply ? (
                    <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700">
                        {t.reviews.adminReplyLabel}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">
                        {review.adminReply}
                      </p>
                      {review.repliedAt ? (
                        <p className="mt-2 text-[11px] font-medium text-zinc-400">
                          {formatReviewDate(review.repliedAt, locale)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
