import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/subscribers.server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`newsletter:${clientIp}`, 8, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "För många försök. Försök igen senare." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email ? sanitizeEmail(body.email) : null;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Ange en giltig e-postadress." },
        { status: 400 },
      );
    }

    const subscribers = await addSubscriber(email);

    return NextResponse.json({
      success: true,
      message: "Tack! Du är nu prenumerant.",
      total: subscribers.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte spara prenumerationen." },
      { status: 500 },
    );
  }
}
