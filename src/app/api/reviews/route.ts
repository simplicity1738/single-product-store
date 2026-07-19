import { NextResponse } from "next/server";
import { translations } from "@/lib/i18n/translations";
import {
  calculateReviewSummary,
  REVIEW_FIELD_LIMITS,
  REVIEW_STATUS,
} from "@/lib/customer-reviews";
import {
  appendReview,
  readApprovedReviews,
} from "@/lib/customer-reviews.server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizePlainText } from "@/lib/sanitize";
import { logServerError } from "@/lib/safe-log";
import { sendReviewPendingNotification } from "@/lib/telegram";

export async function GET() {
  try {
    const reviews = await readApprovedReviews();
    const summary = calculateReviewSummary(reviews);

    return NextResponse.json({
      success: true,
      reviews,
      summary,
    });
  } catch (error) {
    logServerError("reviews:get", error);
    return NextResponse.json(
      { success: false, message: "Kunde inte hämta recensioner." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`reviews:${clientIp}`, 6, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: translations.sv.api.serverError,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const locale =
      request.headers.get("accept-language")?.startsWith("en") ? "en" : "sv";
    const messages = translations[locale].reviews.form;

    const body = (await request.json()) as {
      name?: string;
      rating?: number;
      text?: string;
      productTag?: string;
    };

    const name = body.name
      ? sanitizePlainText(body.name, REVIEW_FIELD_LIMITS.name)
      : "";
    const text = body.text
      ? sanitizePlainText(body.text, REVIEW_FIELD_LIMITS.text)
      : "";
    const productTag = body.productTag
      ? sanitizePlainText(body.productTag, REVIEW_FIELD_LIMITS.productTag)
      : "";
    const rating = Number(body.rating);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: messages.nameRequired },
        { status: 400 },
      );
    }

    if (!text || text.length < 10) {
      return NextResponse.json(
        { success: false, message: messages.textRequired },
        { status: 400 },
      );
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: messages.ratingRequired },
        { status: 400 },
      );
    }

    if (!productTag) {
      return NextResponse.json(
        { success: false, message: messages.productRequired },
        { status: 400 },
      );
    }

    await appendReview({
      name,
      text,
      rating,
      productTag,
      isVerified: true,
      status: REVIEW_STATUS.PENDING,
    });

    try {
      await sendReviewPendingNotification(name);
    } catch (error) {
      logServerError("reviews:telegram", error);
    }

    return NextResponse.json({
      success: true,
      message: messages.success,
    });
  } catch (error) {
    logServerError("reviews:post", error);
    return NextResponse.json(
      { success: false, message: translations.sv.api.serverError },
      { status: 500 },
    );
  }
}
