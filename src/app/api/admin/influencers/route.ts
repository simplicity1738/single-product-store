import { NextResponse } from "next/server";
import { readStoreConfig } from "@/lib/store-config.server";
import { getInfluencersWithStats } from "@/lib/influencer-stats.server";

export async function GET() {
  const config = await readStoreConfig();
  const influencers = await getInfluencersWithStats(config.influencers);

  return NextResponse.json({ influencers });
}
