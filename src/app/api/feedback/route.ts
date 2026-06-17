import { NextResponse } from "next/server";
import {
  incrementGuideFeedback,
  type GuideFeedbackVote,
} from "@/lib/guide-feedback.server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendGuideFeedbackNotification } from "@/lib/telegram";

function isValidVote(value: unknown): value is GuideFeedbackVote {
  return value === "positive" || value === "negative";
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`guide-feedback:${clientIp}`, 12, 60 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many feedback submissions." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as { vote?: unknown };
    if (!isValidVote(body.vote)) {
      return NextResponse.json(
        { success: false, message: "Invalid feedback vote." },
        { status: 400 },
      );
    }

    const stats = await incrementGuideFeedback(body.vote);
    void sendGuideFeedbackNotification({ vote: body.vote });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not record feedback." },
      { status: 500 },
    );
  }
}
