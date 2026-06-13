import { NextResponse } from "next/server";
import { readStoreConfig } from "@/lib/store-config.server";
import {
  findInfluencerByRef,
  incrementInfluencerVisit,
} from "@/lib/influencer-stats.server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ref?: string };
    const ref = body.ref?.trim();

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
