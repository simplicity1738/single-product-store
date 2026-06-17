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

/**
 * Avoid double-wrapping when a full payment URL was pasted in admin.
 * Returns trimmed input; http(s) links pass through unchanged.
 */
export function sanitizeWalletPaymentInput(walletInput: string): string {
  const trimmed = walletInput.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http")) return trimmed;
  return trimmed;
}

/** Extract a human-readable address from a URI or return the trimmed raw value. */
export function extractDisplayAddress(walletInput: string): string {
  const trimmed = sanitizeWalletPaymentInput(walletInput);
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

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const address = url.searchParams.get("address")?.trim();
      if (address) return address;
    } catch {
      // Fall through to raw trimmed value.
    }
  }

  return trimmed;
}

export function buildCryptoQrValue(
  walletInput: string,
  network: PaymentNetwork,
  cryptoAmount: CryptoAmount | null,
): string {
  const cleaned = sanitizeWalletPaymentInput(walletInput);
  if (!cleaned) return "";

  if (cleaned.startsWith("http")) {
    return cleaned;
  }

  if (isWalletPaymentUri(cleaned)) {
    return cleaned;
  }

  const address = cleaned;

  if (network === "bitcoin") {
    if (cryptoAmount?.kind === "btc") {
      return `bitcoin:${address}?amount=${formatUriAmount(cryptoAmount.value, 8)}`;
    }
    return `bitcoin:${address}`;
  }

  if (network === "ethereum") {
    if (cryptoAmount) {
      const amount =
        cryptoAmount.kind === "usdt"
          ? formatUriAmount(cryptoAmount.value, 6)
          : formatUriAmount(cryptoAmount.value, 8);
      return `ethereum:${address}?amount=${amount}`;
    }
    return `ethereum:${address}`;
  }

  if (network === "bsc") {
    const params = new URLSearchParams({
      asset: "c714",
      address,
    });
    if (cryptoAmount) {
      params.set("amount", formatUriAmount(cryptoAmount.value, 6));
    }
    return `https://link.trustwallet.com/send?${params.toString()}`;
  }

  if (network === "tron") {
    const params = new URLSearchParams({
      asset: "c195",
      address,
    });
    if (cryptoAmount) {
      params.set("amount", formatUriAmount(cryptoAmount.value, 6));
    }
    return `https://link.trustwallet.com/send?${params.toString()}`;
  }

  return address;
}

/** Same URI used for QR codes and mobile wallet deep links. */
export function buildCryptoWalletDeepLink(
  walletInput: string,
  network: PaymentNetwork,
  cryptoAmount: CryptoAmount | null,
): string {
  return buildCryptoQrValue(walletInput, network, cryptoAmount);
}
