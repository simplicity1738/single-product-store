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
};

export const REVIEW_FIELD_LIMITS = {
  name: 80,
  text: 1200,
  productTag: 120,
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
