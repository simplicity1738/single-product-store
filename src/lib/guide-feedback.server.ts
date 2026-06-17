import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";

export type GuideFeedbackVote = "positive" | "negative";

export type GuideFeedbackStats = {
  positive: number;
  negative: number;
};

const DEFAULT_STATS: GuideFeedbackStats = {
  positive: 0,
  negative: 0,
};

async function readGuideFeedbackStats(): Promise<GuideFeedbackStats> {
  return readKvData<GuideFeedbackStats>(
    KV_KEYS.GUIDE_FEEDBACK,
    "guide-feedback.json",
    DEFAULT_STATS,
    { seedFromJson: false },
  );
}

export async function incrementGuideFeedback(
  vote: GuideFeedbackVote,
): Promise<GuideFeedbackStats> {
  const stats = await readGuideFeedbackStats();
  const next: GuideFeedbackStats = {
    ...stats,
    [vote === "positive" ? "positive" : "negative"]:
      stats[vote === "positive" ? "positive" : "negative"] + 1,
  };
  await writeKvData(KV_KEYS.GUIDE_FEEDBACK, "guide-feedback.json", next);
  return next;
}

export async function getGuideFeedbackStats(): Promise<GuideFeedbackStats> {
  return readGuideFeedbackStats();
}
