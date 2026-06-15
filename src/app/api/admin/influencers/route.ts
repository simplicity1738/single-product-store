import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { readStoreConfig } from "@/lib/store-config.server";
import { getInfluencersWithStats } from "@/lib/influencer-stats.server";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const config = await readStoreConfig();
  const influencers = await getInfluencersWithStats(config.influencers);

  return NextResponse.json({ influencers });
}
