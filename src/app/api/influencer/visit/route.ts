import { NextResponse } from "next/server";
import { readStoreConfig } from "@/lib/store-config.server";
import {
  findInfluencerByRef,
  incrementInfluencerVisit,
} from "@/lib/influencer-stats.server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeIdentifier } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`influencer-visit:${clientIp}`, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { ref?: string };
    const ref = body.ref ? sanitizeIdentifier(body.ref, 64) : "";

    if (!ref) {
      return NextResponse.json(
        { success: false, message: "Missing ref parameter." },
        { status: 400 },
      );
    }

    const config = await readStoreConfig();
    const influencer = findInfluencerByRef(config.influencers, ref);

    if (!influencer) {
      return NextResponse.json({ success: true, tracked: false });
    }

    await incrementInfluencerVisit(influencer.id);

    return NextResponse.json({ success: true, tracked: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to track visit." },
      { status: 500 },
    );
  }
}
