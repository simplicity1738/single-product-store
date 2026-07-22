"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import type { PublicCustomerReview } from "@/lib/customer-reviews";
import { formatMgOption } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/product-localization";

const reviewDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

type ReviewSummary = {
  averageRating: number;
  totalApproved: number;
};

const formInputClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#ECE5D8]";

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
              className={`${sizeClass} text-amber-400 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60`}
            >
              <StarIcon filled={filled || value <= rating} />
            </button>
          );
        }

        return (
          <span key={value} className={`${sizeClass} text-amber-400`} aria-hidden>
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
      className={filled ? "text-amber-400" : "text-amber-400/40"}
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
  const carouselRef = useRef<HTMLDivElement>(null);
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

  function scrollCarousel(direction: "prev" | "next") {
    const node = carouselRef.current;
    if (!node) return;
    const amount = Math.max(280, Math.floor(node.clientWidth * 0.85));
    node.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

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
    <section id="reviews" className="scroll-mt-24 bg-[#0F0C0B] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8] opacity-80">
              {t.reviews.eyebrow}
            </p>
            <h2
              className={`${reviewDisplay.className} mt-3 text-3xl font-serif tracking-tight text-white lg:text-4xl`}
            >
              {t.reviews.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#CFC4BD]">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold tabular-nums text-[#ECE5D8]">
                  {summary.totalApproved > 0
                    ? summary.averageRating.toFixed(1)
                    : "—"}
                </span>
                <StarRating
                  rating={Math.round(summary.averageRating) || 0}
                  size="sm"
                />
              </div>
              <span className="text-xs uppercase tracking-wider text-[#A89A92]">
                {reviewCountLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm((current) => !current);
                setFormMessage(null);
              }}
              className="rounded-full bg-[#ECE5D8] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
            >
              {showForm ? t.reviews.cancel : t.reviews.writeReview}
            </button>
            {reviews.length > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCarousel("prev")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#ECE5D8] transition hover:bg-white/10 hover:text-white"
                  aria-label="Previous reviews"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel("next")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#ECE5D8] transition hover:bg-white/10 hover:text-white"
                  aria-label="Next reviews"
                >
                  →
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl sm:p-8"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="review-product"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#A89A92]"
                >
                  {t.reviews.form.productLabel}
                </label>
                <select
                  id="review-product"
                  value={productTag}
                  onChange={(event) => setProductTag(event.target.value)}
                  required
                  className={formInputClassName}
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
                  className="block text-xs font-semibold uppercase tracking-wider text-[#A89A92]"
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
                  className={formInputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="review-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#A89A92]"
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
                  className={formInputClassName}
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A89A92]">
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
                  className="block text-xs font-semibold uppercase tracking-wider text-[#A89A92]"
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
                  className={`${formInputClassName} resize-y`}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#ECE5D8] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "…" : t.reviews.submit}
              </button>
            </div>
          </form>
        )}

        {formMessage && (
          <p
            className={`mt-6 max-w-2xl rounded-xl border px-4 py-3 text-sm font-medium ${
              formMessage.type === "success"
                ? "border-[#ECE5D8]/30 bg-[#ECE5D8]/10 text-[#ECE5D8]"
                : "border-white/10 bg-white/5 text-[#CFC4BD]"
            }`}
            role="status"
          >
            {formMessage.text}
          </p>
        )}

        <div className="mt-10">
          {isLoading ? (
            <p className="text-center text-sm text-[#A89A92]">{t.reviews.loading}</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-sm text-[#A89A92]">{t.reviews.noReviews}</p>
          ) : (
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="flex min-w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl sm:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1rem)]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        {review.name}
                      </h3>
                      {review.productTag ? (
                        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-[#ECE5D8]">
                          {review.productTag}
                        </span>
                      ) : null}
                      {review.isVerified ? (
                        <span className="rounded-full border border-white/10 bg-[#ECE5D8]/10 px-2.5 py-1 text-[10px] font-medium uppercase text-[#ECE5D8]">
                          {t.reviews.verifiedPurchase}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2">
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="mt-2 text-[11px] text-[#A89A92]">
                      {formatReviewDate(review.createdAt, locale)}
                    </p>
                    <blockquote className="mt-3 text-xs leading-relaxed text-[#CFC4BD] sm:text-sm">
                      &ldquo;{review.text}&rdquo;
                    </blockquote>
                  </div>

                  {review.adminReply ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A89A92]">
                        {t.reviews.adminReplyLabel}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#CFC4BD]">
                        {review.adminReply}
                      </p>
                      {review.repliedAt ? (
                        <p className="mt-2 text-[11px] text-[#A89A92]">
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
