const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function clampProgress(percent: number): number {
  return Math.max(5, Math.min(100, percent));
}

/** Hours remaining until local midnight. */
function msUntilLocalMidnight(now = Date.now()): number {
  const end = new Date();
  end.setHours(24, 0, 0, 0);
  return Math.max(0, end.getTime() - now);
}

/**
 * Progress bar fill: share of a 24h window still remaining.
 * Uses admin countdown when enabled; otherwise falls back to time left today.
 */
export function calculateCampaignCountdownProgress(
  countdownEndsAt: string,
  countdownEnabled: boolean,
  now = Date.now(),
): number {
  if (countdownEnabled && countdownEndsAt.trim()) {
    const end = new Date(countdownEndsAt).getTime();
    if (!Number.isNaN(end)) {
      const remaining = Math.max(0, end - now);
      return clampProgress((remaining / TWENTY_FOUR_HOURS_MS) * 100);
    }
  }

  const remainingToday = msUntilLocalMidnight(now);
  return clampProgress((remainingToday / TWENTY_FOUR_HOURS_MS) * 100);
}
