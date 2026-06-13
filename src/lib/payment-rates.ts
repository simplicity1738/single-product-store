export const COINGECKO_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=sek,usd";

/** Safe static fallback — screen never renders blank if the public API is offline. */
export const FALLBACK_EXCHANGE_RATES = {
  tetherSek: 10.85,
  bitcoinSek: 985_000,
} as const;

export const PRICE_LOCK_DURATION_MS = 15 * 60 * 1000;

export type LockedExchangeRates = {
  tetherSek: number;
  bitcoinSek: number;
  lockedAt: number;
  expiresAt: number;
  source: "live" | "fallback";
};

export async function fetchExchangeRates(): Promise<LockedExchangeRates> {
  const now = Date.now();

  try {
    const response = await fetch(COINGECKO_PRICE_URL);

    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    const data = (await response.json()) as {
      bitcoin?: { sek?: number };
      tether?: { sek?: number };
    };

    const tetherSek = data.tether?.sek;
    const bitcoinSek = data.bitcoin?.sek;

    if (!tetherSek || !bitcoinSek || tetherSek <= 0 || bitcoinSek <= 0) {
      throw new Error("CoinGecko returned incomplete rate data");
    }

    return {
      tetherSek,
      bitcoinSek,
      lockedAt: now,
      expiresAt: now + PRICE_LOCK_DURATION_MS,
      source: "live",
    };
  } catch {
    return {
      tetherSek: FALLBACK_EXCHANGE_RATES.tetherSek,
      bitcoinSek: FALLBACK_EXCHANGE_RATES.bitcoinSek,
      lockedAt: now,
      expiresAt: now + PRICE_LOCK_DURATION_MS,
      source: "fallback",
    };
  }
}

export function getRemainingLockSeconds(expiresAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function convertSekToUsdt(totalSek: number, tetherSek: number): number {
  return totalSek / tetherSek;
}

export function convertSekToBtc(totalSek: number, bitcoinSek: number): number {
  return totalSek / bitcoinSek;
}
