import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/subscribers.server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !EMAIL_PATTERN.test(email)) {
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
