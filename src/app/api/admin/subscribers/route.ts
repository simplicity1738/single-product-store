import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import {
  readSubscribers,
  removeSubscriber,
} from "@/lib/subscribers.server";
import { sanitizeEmail } from "@/lib/sanitize";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const subscribers = await readSubscribers();
  return NextResponse.json({ subscribers });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email ? sanitizeEmail(body.email) : null;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "E-postadress saknas." },
        { status: 400 },
      );
    }

    const subscribers = await removeSubscriber(email);

    return NextResponse.json({
      success: true,
      message: "Prenumerant borttagen.",
      subscribers,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte ta bort prenumeranten." },
      { status: 500 },
    );
  }
}
