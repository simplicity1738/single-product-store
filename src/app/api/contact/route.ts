import { NextResponse } from "next/server";
import { translations } from "@/lib/i18n/translations";
import { appendSystemLog } from "@/lib/system-logs.server";
import { sendContactNotification } from "@/lib/telegram";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  CONTACT_FIELD_LIMITS,
  sanitizeEmail,
  sanitizePlainText,
} from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`contact:${clientIp}`, 6, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: translations.sv.contact.errors.serverError },
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
    const messages = translations[locale].contact.errors;

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const name = body.name
      ? sanitizePlainText(body.name, CONTACT_FIELD_LIMITS.name)
      : "";
    const email = body.email ? sanitizeEmail(body.email) : null;
    const message = body.message
      ? sanitizePlainText(body.message, CONTACT_FIELD_LIMITS.message)
      : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: messages.requiredFields },
        { status: 400 },
      );
    }

    const telegramResult = await sendContactNotification({
      name,
      email,
      message,
    });

    if (!telegramResult.ok) {
      await appendSystemLog(
        "Kontaktformulär: Telegram-notis misslyckades.",
        "telegram",
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: translations.sv.contact.errors.serverError,
      },
      { status: 500 },
    );
  }
}
