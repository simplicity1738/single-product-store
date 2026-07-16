"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  buildCryptoWalletDeepLink,
  extractDisplayAddress,
} from "@/lib/crypto-payment-uri";
import {
  convertSekToBtc,
  fetchExchangeRates,
  formatCountdown,
  getRemainingLockSeconds,
  type LockedExchangeRates,
} from "@/lib/payment-rates";
import { ADMIN_DEPOSIT_WALLETS } from "@/lib/payment-wallets";
import { formatCurrency } from "@/lib/product";
import {
  calculateStoreOrderTotal,
  resolveNetworkWalletInput,
} from "@/lib/store-config";
import { ORDER_STORAGE_KEY, type OrderFormData } from "@/lib/order";

type OrderSummary = ReturnType<typeof calculateStoreOrderTotal>;

type PaymentStepProps = {
  orderTotal: number;
  payload: OrderFormData;
  summary: OrderSummary;
  onBack: () => void;
};

const NETWORK = "bitcoin" as const;
const TOKEN = "btc" as const;
const QR_SIZE = 220;
const QR_MARGIN = 2;

function clearQrCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function QrPlaceholder({
  message,
  size = QR_SIZE,
}: {
  message: string;
  size?: number;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-dashed border-rose-200 bg-white px-4 text-center text-xs leading-relaxed text-zinc-500"
      style={{ width: size, height: size }}
      role="img"
      aria-label={message}
    >
      {message}
    </div>
  );
}

function PaymentQrCode({ value, size = QR_SIZE }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const payload = value.trim();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!payload) {
      clearQrCanvas(canvas);
      return;
    }

    let cancelled = false;

    void QRCode.toCanvas(canvas, payload, {
      width: size,
      margin: QR_MARGIN,
      errorCorrectionLevel: "M",
      color: {
        dark: "#18181b",
        light: "#ffffff",
      },
    }).catch(() => {
      if (!cancelled) {
        clearQrCanvas(canvas);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  if (!payload) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-xl border border-rose-100 bg-white p-2 shadow-sm"
      role="img"
      aria-label="QR code"
    />
  );
}

export default function PaymentStep({
  orderTotal,
  payload,
  summary,
  onBack,
}: PaymentStepProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const { storeConfig, getLineLabel } = useStoreConfig();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const getWalletInput = useCallback(
    () => resolveNetworkWalletInput(storeConfig, NETWORK),
    [storeConfig],
  );

  const getDepositAddress = useCallback(() => {
    const walletInput = getWalletInput();
    return walletInput ? extractDisplayAddress(walletInput) : "";
  }, [getWalletInput]);

  const [rates, setRates] = useState<LockedExchangeRates | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addressGenerated, setAddressGenerated] = useState(false);
  const [depositAddress, setDepositAddress] = useState("");
  const [walletInput, setWalletInput] = useState("");
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

  const cryptoAmount = useMemo(() => {
    if (!rates || orderTotal <= 0) {
      return null;
    }

    return convertSekToBtc(orderTotal, rates.bitcoinSek);
  }, [rates, orderTotal]);

  const formattedCryptoAmount = useMemo(() => {
    if (cryptoAmount === null) return "—";

    const btc =
      cryptoAmount >= 0.0001
        ? cryptoAmount.toFixed(4)
        : cryptoAmount.toFixed(8);
    return `≈ ${btc} BTC`;
  }, [cryptoAmount]);

  const qrPaymentUri = useMemo(() => {
    const rawWallet =
      walletInput.trim() ||
      getWalletInput() ||
      storeConfig.cryptoWallets.bitcoin?.trim() ||
      "";
    return buildCryptoWalletDeepLink(
      rawWallet,
      NETWORK,
      cryptoAmount !== null ? { kind: "btc", value: cryptoAmount } : null,
    );
  }, [walletInput, cryptoAmount, getWalletInput, storeConfig.cryptoWallets.bitcoin]);

  async function handleGenerateAddress() {
    setError(null);

    const resolvedWalletInput = getWalletInput();
    if (!resolvedWalletInput) {
      setError(t.payment.errors.walletNotConfigured);
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
          paymentNetwork: NETWORK,
          paymentToken: TOKEN,
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
          line.campaignAddonId,
        ),
      }));

      const address =
        data.paymentWallets?.[NETWORK]?.address ?? getDepositAddress();

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
          paymentMethod: "bitcoin",
          payment: {
            token: TOKEN,
            network: NETWORK,
            address,
            cryptoAmount: formattedCryptoAmount,
          },
        }),
      );

      setWalletInput(resolvedWalletInput);
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

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
      >
        {t.payment.backToMethod}
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
              {ADMIN_DEPOSIT_WALLETS.bitcoin.label}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
            <div className="text-center">
              {qrPaymentUri ? (
                <PaymentQrCode value={qrPaymentUri} />
              ) : (
                <QrPlaceholder message={t.payment.qrUnavailable} />
              )}
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
              {qrPaymentUri ? (
                <a
                  href={qrPaymentUri}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-semibold text-white transition hover:bg-rose-500"
                >
                  {t.payment.openWallet}
                </a>
              ) : null}
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
