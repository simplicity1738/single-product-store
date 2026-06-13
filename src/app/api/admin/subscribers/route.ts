import { NextResponse } from "next/server";
import {
  readSubscribers,
  removeSubscriber,
} from "@/lib/subscribers.server";

export async function GET() {
  const subscribers = await readSubscribers();
  return NextResponse.json({ subscribers });
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim();

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
