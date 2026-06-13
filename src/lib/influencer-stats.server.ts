import {
  influencerHandleToRef,
  normalizeDiscountCode,
  type InfluencerPartner,
} from "@/lib/store-config";
import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";

export type InfluencerStatCounts = {
  visits: number;
  purchases: number;
};

export type InfluencerStatsMap = Record<string, InfluencerStatCounts>;

const EMPTY_STATS: InfluencerStatCounts = { visits: 0, purchases: 0 };

export async function readInfluencerStats(): Promise<InfluencerStatsMap> {
  const parsed = await readKvData<InfluencerStatsMap>(
    KV_KEYS.INFLUENCER_STATS,
    "influencer-stats.json",
    {},
  );
  return parsed && typeof parsed === "object" ? parsed : {};
}

async function writeInfluencerStats(stats: InfluencerStatsMap): Promise<void> {
  await writeKvData(KV_KEYS.INFLUENCER_STATS, "influencer-stats.json", stats);
}

function getCounts(stats: InfluencerStatsMap, id: string): InfluencerStatCounts {
  return stats[id] ?? EMPTY_STATS;
}

export async function incrementInfluencerVisit(influencerId: string): Promise<void> {
  const stats = await readInfluencerStats();
  const current = getCounts(stats, influencerId);
  stats[influencerId] = { ...current, visits: current.visits + 1 };
  await writeInfluencerStats(stats);
}

export async function incrementInfluencerPurchase(influencerId: string): Promise<void> {
  const stats = await readInfluencerStats();
  const current = getCounts(stats, influencerId);
  stats[influencerId] = { ...current, purchases: current.purchases + 1 };
  await writeInfluencerStats(stats);
}

export function findInfluencerByRef(
  influencers: InfluencerPartner[],
  ref: string,
): InfluencerPartner | undefined {
  const normalizedRef = ref.trim().replace(/^@/, "").toLowerCase();
  if (!normalizedRef) return undefined;

  return influencers.find(
    (entry) => influencerHandleToRef(entry.handle) === normalizedRef,
  );
}

export function findInfluencerByPromoCode(
  influencers: InfluencerPartner[],
  code: string,
): InfluencerPartner | undefined {
  const normalized = normalizeDiscountCode(code);
  if (!normalized) return undefined;

  return influencers.find(
    (entry) => normalizeDiscountCode(entry.promoCode) === normalized,
  );
}

export type InfluencerWithStats = InfluencerPartner & InfluencerStatCounts;

export async function getInfluencersWithStats(
  influencers: InfluencerPartner[],
): Promise<InfluencerWithStats[]> {
  const stats = await readInfluencerStats();

  return influencers.map((entry) => {
    const counts = getCounts(stats, entry.id);
    return {
      ...entry,
      visits: counts.visits,
      purchases: counts.purchases,
    };
  });
}
