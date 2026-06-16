"use client";

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN SETTINGS — Paste your TRON, BSC, Bitcoin & Ethereum deposit wallet
// strings in src/lib/payment-wallets.ts before going live.
// ═══════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  convertSekToBtc,
  convertSekToUsdt,
  fetchExchangeRates,
  formatCountdown,
  getRemainingLockSeconds,
  type LockedExchangeRates,
} from "@/lib/payment-rates";
import {
  ADMIN_DEPOSIT_WALLETS,
  type PaymentNetwork,
  type PaymentToken,
} from "@/lib/payment-wallets";
import { formatCurrency } from "@/lib/product";
import { calculateStoreOrderTotal } from "@/lib/store-config";
import { ORDER_STORAGE_KEY, type OrderFormData } from "@/lib/order";

type OrderSummary = ReturnType<typeof calculateStoreOrderTotal>;

type PaymentStepProps = {
  orderTotal: number;
  payload: OrderFormData;
  summary: OrderSummary;
  onBack: () => void;
};

const NETWORK_ORDER: PaymentNetwork[] = [
  "tron",
  "bsc",
  "bitcoin",
  "ethereum",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function MockQRCode({ value, size = 192 }: { value: string; size?: number }) {
  const cells = 21;
  const seed = hashString(value);
  const cellSize = size / cells;

  const modules = useMemo(() => {
    const grid: boolean[][] = [];

    for (let row = 0; row < cells; row += 1) {
      const rowCells: boolean[] = [];
      for (let col = 0; col < cells; col += 1) {
        const inFinder =
          (row < 7 && col < 7) ||
          (row < 7 && col >= cells - 7) ||
          (row >= cells - 7 && col < 7);
        const finderBorder =
          inFinder &&
          (row === 0 ||
            row === 6 ||
            col === 0 ||
            col === 6 ||
            (row >= cells - 7 && (row === cells - 7 || row === cells - 1)) ||
            (col >= cells - 7 && (col === cells - 7 || col === cells - 1)) ||
            (row < 7 && col < 7 && row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
            (row < 7 &&
              col >= cells - 7 &&
              row >= 2 &&
              row <= 4 &&
              col >= cells - 5 &&
              col <= cells - 3) ||
            (row >= cells - 7 &&
              col < 7 &&
              row >= cells - 5 &&
              row <= cells - 3 &&
              col >= 2 &&
              col <= 4));

        if (finderBorder) {
          rowCells.push(true);
        } else if (inFinder) {
          rowCells.push(false);
        } else {
          rowCells.push(((seed + row * 17 + col * 31) % 5) < 2);
        }
      }
      grid.push(rowCells);
    }

    return grid;
  }, [seed]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm"
      role="img"
      aria-label="QR code"
    >
      <rect width={size} height={size} fill="white" rx={8} />
      {modules.map((row, rowIndex) =>
        row.map((filled, colIndex) =>
          filled ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * cellSize}
              y={rowIndex * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#18181b"
              rx={1}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function isNetworkEnabled(network: PaymentNetwork, token: PaymentToken): boolean {
  if (token === "btc") {
    return network === "bitcoin";
  }
  return network !== "bitcoin";
}

function defaultNetworkForToken(token: PaymentToken): PaymentNetwork {
  return token === "btc" ? "bitcoin" : "tron";
}

function formatUriAmount(value: number, maxDecimals: number): string {
  const fixed = value.toFixed(maxDecimals);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return trimmed || "0";
}

function buildQrPaymentUri(
  network: PaymentNetwork,
  address: string,
  cryptoAmount: { kind: "usdt" | "btc"; value: number } | null,
): string {
  if (!cryptoAmount || !address) return address;

  if (network === "bitcoin" && cryptoAmount.kind === "btc") {
    return `bitcoin:${address}?amount=${formatUriAmount(cryptoAmount.value, 8)}`;
  }

  if (network === "ethereum") {
    const amount =
      cryptoAmount.kind === "usdt"
        ? formatUriAmount(cryptoAmount.value, 6)
        : formatUriAmount(cryptoAmount.value, 8);
    return `ethereum:${address}?amount=${amount}`;
  }

  return address;
}

export default function PaymentStep({
  orderTotal,
  payload,
  summary,
  onBack,
}: PaymentStepProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const { cryptoWallets, getLineLabel } = useStoreConfig();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const getDepositAddress = useCallback(
    (networkId: PaymentNetwork) =>
      cryptoWallets[networkId] || ADMIN_DEPOSIT_WALLETS[networkId].address,
    [cryptoWallets],
  );

  const [token, setToken] = useState<PaymentToken>("usdt");
  const [network, setNetwork] = useState<PaymentNetwork>("tron");
  const [rates, setRates] = useState<LockedExchangeRates | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addressGenerated, setAddressGenerated] = useState(false);
  const [depositAddress, setDepositAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchExchangeRates().then((locked) => {
      if (!cancelled) {
        setRates(locked);
        setCountdown(getRemainingLockSeconds(locked.expiresAt));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!rates) return;

    const tick = () => {
      setCountdown(getRemainingLockSeconds(rates.expiresAt));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [rates]);

  const handleTokenChange = useCallback((next: PaymentToken) => {
    setToken(next);
    setNetwork(defaultNetworkForToken(next));
    setAddressGenerated(false);
    setCopied(false);
  }, []);

  const cryptoAmount = useMemo(() => {
    if (!rates || orderTotal <= 0) {
      return null;
    }

    if (token === "usdt") {
      return {
        kind: "usdt" as const,
        value: convertSekToUsdt(orderTotal, rates.tetherSek),
      };
    }

    return {
      kind: "btc" as const,
      value: convertSekToBtc(orderTotal, rates.bitcoinSek),
    };
  }, [rates, orderTotal, token]);

  const formattedCryptoAmount = useMemo(() => {
    if (!cryptoAmount) return "—";

    if (cryptoAmount.kind === "usdt") {
      return `≈ $${cryptoAmount.value.toFixed(2)} USDT`;
    }

    const btc =
      cryptoAmount.value >= 0.0001
        ? cryptoAmount.value.toFixed(4)
        : cryptoAmount.value.toFixed(8);
    return `≈ ${btc} BTC`;
  }, [cryptoAmount]);

  const qrPaymentUri = useMemo(
    () => buildQrPaymentUri(network, depositAddress, cryptoAmount),
    [network, depositAddress, cryptoAmount],
  );

  async function handleGenerateAddress() {
    setError(null);

    if (!isNetworkEnabled(network, token)) {
      setError(t.payment.errors.selectNetwork);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          ...payload,
          paymentNetwork: network,
          paymentToken: token,
          cryptoTotal: formattedCryptoAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? t.payment.errors.submitFailed);
      }

      const receiptItems = summary.lineItems.map((line) => ({
        productId: line.productId,
        variantMg: line.variantMg,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineSubtotal: line.lineSubtotal,
        selectedStrength: line.selectedStrength,
        productName: getLineLabel(
          line.productId,
          line.variantMg,
          line.selectedStrength,
        ),
      }));

      const address =
        data.paymentWallets?.[network]?.address ?? getDepositAddress(network);

      sessionStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify({
          ...payload,
          items: receiptItems,
          orderId: data.orderId,
          subtotal: data.subtotal,
          shipping: data.shipping,
          discount: data.discount,
          total: data.total,
          placedAt: data.placedAt,
          payment: {
            token,
            network,
            address,
            cryptoAmount: formattedCryptoAmount,
          },
        }),
      );

      setDepositAddress(address);
      setAddressGenerated(true);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : t.payment.errors.submitFailed,
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyAddress() {
    if (!depositAddress) return;

    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const networkCards = NETWORK_ORDER.map((networkId) => {
    const copy = t.payment.networks[networkId];
    const enabled = isNetworkEnabled(networkId, token);
    const selected = network === networkId;

    return (
      <button
        key={networkId}
        type="button"
        disabled={!enabled}
        onClick={() => {
          if (!enabled) return;
          setNetwork(networkId);
          setAddressGenerated(false);
          setCopied(false);
        }}
        className={`rounded-2xl border p-4 text-left transition ${
          selected
            ? "border-rose-400 bg-rose-50 shadow-sm shadow-rose-100"
            : enabled
              ? "border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50/40"
              : "cursor-not-allowed border-rose-100/60 bg-zinc-50 opacity-45"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-zinc-900">{copy.label}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{copy.standard}</p>
          </div>
          {selected && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-400 text-white">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </span>
          )}
        </div>
        <p className="mt-3 text-xs font-medium text-rose-600">{copy.fee}</p>
      </button>
    );
  });

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
      >
        {t.payment.backToDetails}
      </button>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
          {t.payment.eyebrow}
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.payment.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {t.payment.subtitle}
        </p>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-zinc-900">
          {t.payment.selectNetwork}
        </h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{networkCards}</div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-zinc-900">
          {t.payment.selectToken}
        </h4>
        <div className="mt-3 flex flex-wrap gap-3">
          {(["usdt", "btc"] as const).map((tokenId) => {
            const copy = t.payment.tokens[tokenId];
            const selected = token === tokenId;

            return (
              <button
                key={tokenId}
                type="button"
                onClick={() => handleTokenChange(tokenId)}
                className={`inline-flex min-w-[8.5rem] flex-col items-center rounded-2xl border px-6 py-4 transition ${
                  selected
                    ? "border-rose-400 bg-rose-50 shadow-sm shadow-rose-100"
                    : "border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50/40"
                }`}
              >
                <span className="text-base font-bold text-zinc-900">
                  {copy.label}
                </span>
                <span className="mt-0.5 text-xs text-zinc-500">
                  {copy.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <p className="text-sm leading-relaxed text-amber-900">
          {t.payment.walletWarning}
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 to-white">
        <div className="flex items-center justify-between border-b border-rose-100 px-5 py-4">
          <h4 className="text-sm font-semibold text-zinc-900">
            {t.payment.exchangeBoard.title}
          </h4>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t.payment.exchangeBoard.liveBadge}
          </span>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{t.payment.exchangeBoard.orderTotal}</span>
            <span className="font-semibold text-zinc-900">
              {formatCurrency(orderTotal, localeCode)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-rose-100 pt-4">
            <span className="text-sm text-zinc-500">
              {t.payment.exchangeBoard.youSend}
            </span>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              {formattedCryptoAmount}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-xl bg-white/80 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {t.payment.exchangeBoard.lockedRate}{" "}
              <span className="font-mono font-semibold text-rose-600">
                {formatCountdown(countdown)}
              </span>
            </span>
            <span>{t.payment.exchangeBoard.refreshNote}</span>
          </div>

          {rates?.source === "fallback" && (
            <p className="text-xs font-medium text-amber-700">
              {t.payment.exchangeBoard.fallbackNote}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!addressGenerated ? (
        <button
          type="button"
          onClick={handleGenerateAddress}
          disabled={isGenerating || !rates}
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? t.payment.generating : t.payment.generateAddress}
        </button>
      ) : (
        <div className="mt-8 space-y-6 rounded-2xl border border-rose-200 bg-rose-50/50 p-5 sm:p-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              {t.payment.paymentReady}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              {t.payment.sendExactly}{" "}
              <span className="font-bold text-zinc-900">
                {formattedCryptoAmount}
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {ADMIN_DEPOSIT_WALLETS[network].label} ·{" "}
              {t.payment.tokens[token].label}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
            <div className="text-center">
              <MockQRCode value={qrPaymentUri} />
              <p className="mt-2 text-xs text-zinc-500">{t.payment.qrLabel}</p>
            </div>

            <div className="w-full max-w-sm flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {t.payment.toAddress}
              </p>
              <p className="mt-2 break-all rounded-xl border border-rose-100 bg-white px-4 py-3 font-mono text-xs leading-relaxed text-zinc-800">
                {depositAddress}
              </p>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full border border-rose-200 bg-white text-sm font-semibold text-zinc-800 transition hover:border-rose-300 hover:bg-rose-50"
              >
                {copied ? t.payment.copied : t.payment.copyAddress}
              </button>
            </div>
          </div>

          <p className="rounded-xl border border-rose-100 bg-white px-4 py-3 text-center text-sm leading-relaxed text-zinc-600">
            {t.payment.confirmationNote}
          </p>

          <button
            type="button"
            onClick={() => router.push("/success")}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            {t.payment.viewReceipt}
          </button>
        </div>
      )}
    </div>
  );
}
