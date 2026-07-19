import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";
import {
  normalizeReviewRating,
  normalizeReviewStatus,
  REVIEW_STATUS,
  type CustomerReview,
  type ReviewStatus,
} from "@/lib/customer-reviews";

function normalizeReview(review: CustomerReview): CustomerReview {
  return {
    ...review,
    rating: normalizeReviewRating(review.rating),
    status: normalizeReviewStatus(review.status),
    isVerified: review.isVerified !== false,
    productTag:
      typeof review.productTag === "string" ? review.productTag.trim() : "",
  };
}

export function generateReviewId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `REV-${suffix}`;
}

export async function readReviews(): Promise<CustomerReview[]> {
  const parsed = await readKvData<CustomerReview[]>(
    KV_KEYS.REVIEWS,
    "reviews.json",
    [],
  );
  return Array.isArray(parsed) ? parsed.map(normalizeReview) : [];
}

async function writeReviews(reviews: CustomerReview[]): Promise<void> {
  await writeKvData(KV_KEYS.REVIEWS, "reviews.json", reviews);
}

export async function readApprovedReviews(): Promise<CustomerReview[]> {
  const reviews = await readReviews();
  return reviews
    .filter((review) => review.status === REVIEW_STATUS.APPROVED)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function appendReview(
  review: Omit<CustomerReview, "id" | "createdAt" | "status"> & {
    id?: string;
    createdAt?: string;
    status?: ReviewStatus;
  },
): Promise<CustomerReview> {
  const reviews = await readReviews();
  const storedReview: CustomerReview = normalizeReview({
    id: review.id ?? generateReviewId(),
    name: review.name,
    rating: review.rating,
    text: review.text,
    productTag: review.productTag ?? "",
    createdAt: review.createdAt ?? new Date().toISOString(),
    isVerified: review.isVerified ?? true,
    status: review.status ?? REVIEW_STATUS.PENDING,
  });

  await writeReviews([storedReview, ...reviews]);
  return storedReview;
}

export async function approveReview(
  reviewId: string,
): Promise<CustomerReview | null> {
  const reviews = await readReviews();
  const index = reviews.findIndex((review) => review.id === reviewId);
  if (index === -1) return null;

  const updatedReview: CustomerReview = {
    ...reviews[index],
    status: REVIEW_STATUS.APPROVED,
  };
  reviews[index] = updatedReview;
  await writeReviews(reviews);
  return updatedReview;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const reviews = await readReviews();
  const nextReviews = reviews.filter((review) => review.id !== reviewId);
  if (nextReviews.length === reviews.length) return false;
  await writeReviews(nextReviews);
  return true;
}
