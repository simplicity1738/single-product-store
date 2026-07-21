import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { REVIEW_FIELD_LIMITS } from "@/lib/customer-reviews";
import { replyToReview } from "@/lib/customer-reviews.server";
import { sendReviewReplyEmail } from "@/lib/email";
import { sanitizeIdentifier, sanitizePlainText } from "@/lib/sanitize";
import { logServerError } from "@/lib/safe-log";

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      reviewId?: string;
      adminReply?: string;
    };

    const reviewId = body.reviewId
      ? sanitizeIdentifier(body.reviewId, 32)
      : "";
    const adminReply = body.adminReply
      ? sanitizePlainText(body.adminReply, REVIEW_FIELD_LIMITS.adminReply)
      : "";

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: "Recensions-ID saknas." },
        { status: 400 },
      );
    }

    if (!adminReply || adminReply.length < 2) {
      return NextResponse.json(
        { success: false, message: "Skriv ett svar (minst 2 tecken)." },
        { status: 400 },
      );
    }

    const updatedReview = await replyToReview(reviewId, adminReply);
    if (!updatedReview) {
      return NextResponse.json(
        { success: false, message: "Recensionen hittades inte." },
        { status: 404 },
      );
    }

    let emailSent = false;
    if (updatedReview.email) {
      try {
        const result = await sendReviewReplyEmail({
          customerEmail: updatedReview.email,
          customerName: updatedReview.name,
          reviewText: updatedReview.text,
          adminReply: updatedReview.adminReply ?? adminReply,
          productTag: updatedReview.productTag,
        });
        emailSent = result.ok;
      } catch (error) {
        logServerError("admin:reviews:reply:email", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Svar sparat och skickat till kundens e-post."
        : updatedReview.email
          ? "Svar sparat, men e-post kunde inte skickas."
          : "Svar sparat. Kunden lämnade ingen e-postadress.",
      review: updatedReview,
      emailSent,
    });
  } catch (error) {
    logServerError("admin:reviews:reply", error);
    return NextResponse.json(
      { success: false, message: "Kunde inte spara svaret." },
      { status: 500 },
    );
  }
}
