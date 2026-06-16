import type { PaymentNetwork } from "@/lib/payment-wallets";

export type CryptoAmount = {
  kind: "usdt" | "btc";
  value: number;
};

function formatUriAmount(value: number, maxDecimals: number): string {
  const fixed = value.toFixed(maxDecimals);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return trimmed || "0";
}

/** True when the owner pasted a full URI rather than a raw address. */
export function isWalletPaymentUri(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
}

/** Extract a human-readable address from a URI or return the trimmed raw value. */
export function extractDisplayAddress(walletInput: string): string {
  const trimmed = walletInput.trim();
  if (!trimmed) return "";

  if (/^bitcoin:/i.test(trimmed)) {
    const withoutScheme = trimmed.replace(/^bitcoin:/i, "");
    const address = withoutScheme.split("?")[0]?.trim();
    return address || trimmed;
  }

  if (/^ethereum:/i.test(trimmed)) {
    const withoutScheme = trimmed.replace(/^ethereum:/i, "");
    const address = withoutScheme.split("?")[0]?.trim();
    return address || trimmed;
  }

  return trimmed;
}

export function buildCryptoQrValue(
  walletInput: string,
  network: PaymentNetwork,
  cryptoAmount: CryptoAmount | null,
): string {
  const cleaned = walletInput.trim();
  if (!cleaned) return "";

  if (isWalletPaymentUri(cleaned)) {
    return cleaned;
  }

  if (network === "bitcoin") {
    if (cryptoAmount?.kind === "btc") {
      return `bitcoin:${cleaned}?amount=${formatUriAmount(cryptoAmount.value, 8)}`;
    }
    return `bitcoin:${cleaned}`;
  }

  if (network === "ethereum") {
    if (cryptoAmount) {
      const amount =
        cryptoAmount.kind === "usdt"
          ? formatUriAmount(cryptoAmount.value, 6)
          : formatUriAmount(cryptoAmount.value, 8);
      return `ethereum:${cleaned}?amount=${amount}`;
    }
    return `ethereum:${cleaned}`;
  }

  return cleaned;
}
