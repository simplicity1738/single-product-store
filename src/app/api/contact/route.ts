import { NextResponse } from "next/server";
import { translations } from "@/lib/i18n/translations";

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

    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: messages.requiredFields },
        { status: 400 },
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

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
