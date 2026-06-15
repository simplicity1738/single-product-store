import { NextResponse } from "next/server";
import { translations } from "@/lib/i18n/translations";
import { appendSystemLog } from "@/lib/system-logs.server";
import { sendContactNotification } from "@/lib/telegram";
import { clampText } from "@/lib/sanitize";

const CONTACT_FIELD_LIMITS = {
  name: 120,
  email: 254,
  message: 2000,
} as const;

export async function POST(request: Request) {
  try {
    const locale =
      request.headers.get("accept-language")?.startsWith("en") ? "en" : "sv";
    const messages = translations[locale].contact.errors;

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const name = body.name
      ? clampText(body.name, CONTACT_FIELD_LIMITS.name)
      : "";
    const email = body.email
      ? clampText(body.email, CONTACT_FIELD_LIMITS.email)
      : "";
    const message = body.message
      ? clampText(body.message, CONTACT_FIELD_LIMITS.message)
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
