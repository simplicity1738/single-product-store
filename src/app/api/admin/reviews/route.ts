import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import {
  approveReview,
  deleteReview,
  readReviews,
} from "@/lib/customer-reviews.server";
import { sanitizeIdentifier } from "@/lib/sanitize";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const reviews = await readReviews();
  return NextResponse.json({
    success: true,
    reviews: reviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as { reviewId?: string };
    const reviewId = body.reviewId
      ? sanitizeIdentifier(body.reviewId, 32)
      : "";

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: "Recensions-ID saknas." },
        { status: 400 },
      );
    }

    const updatedReview = await approveReview(reviewId);
    if (!updatedReview) {
      return NextResponse.json(
        { success: false, message: "Recensionen hittades inte." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recensionen har godkänts.",
      review: updatedReview,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte godkänna recensionen." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as { reviewId?: string };
    const reviewId = body.reviewId
      ? sanitizeIdentifier(body.reviewId, 32)
      : "";

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: "Recensions-ID saknas." },
        { status: 400 },
      );
    }

    const deleted = await deleteReview(reviewId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Recensionen hittades inte." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recensionen har tagits bort.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte ta bort recensionen." },
      { status: 500 },
    );
  }
}
