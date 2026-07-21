export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export type CustomerReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  productTag: string;
  createdAt: string;
  isVerified: boolean;
  status: ReviewStatus;
  /** Optional — only set when the customer asked for a reply. Never expose on public storefront. */
  email?: string;
  adminReply?: string;
  repliedAt?: string;
};

/** Public-facing review shape without private contact details. */
export type PublicCustomerReview = Omit<CustomerReview, "email">;

export const REVIEW_FIELD_LIMITS = {
  name: 80,
  text: 1200,
  productTag: 120,
  email: 254,
  adminReply: 2000,
} as const;

export function normalizeReviewRating(value: unknown): number {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export function normalizeReviewStatus(status: unknown): ReviewStatus {
  return status === REVIEW_STATUS.APPROVED
    ? REVIEW_STATUS.APPROVED
    : REVIEW_STATUS.PENDING;
}

export function toPublicReview(review: CustomerReview): PublicCustomerReview {
  const { email: _email, ...publicReview } = review;
  return publicReview;
}

export function calculateReviewSummary(reviews: CustomerReview[]): {
  averageRating: number;
  totalApproved: number;
} {
  const approved = reviews.filter(
    (review) => review.status === REVIEW_STATUS.APPROVED,
  );

  if (approved.length === 0) {
    return { averageRating: 0, totalApproved: 0 };
  }

  const sum = approved.reduce((total, review) => total + review.rating, 0);
  return {
    averageRating: Math.round((sum / approved.length) * 10) / 10,
    totalApproved: approved.length,
  };
}
