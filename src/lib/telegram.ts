import type { PaymentNetwork } from "@/lib/payment-wallets";
import { escapeTelegramHtml } from "@/lib/sanitize";
import { logServerError } from "@/lib/safe-log";
import {
  getTelegramCredentials,
  isTelegramConfiguredFromCredentials,
} from "@/lib/store-config.server";

const EXPLORER_URLS: Record<PaymentNetwork, (address: string) => string> = {
  tron: (address) => `https://tronscan.org/#/address/${address}`,
  bsc: (address) => `https://bscscan.com/address/${address}`,
  bitcoin: (address) => `https://blockstream.info/address/${address}`,
  ethereum: (address) => `https://etherscan.io/address/${address}`,
};

export function getExplorerUrl(
  network: PaymentNetwork,
  address: string,
): string {
  return EXPLORER_URLS[network](address);
}

type InlineKeyboard = {
  inline_keyboard: Array<Array<{ text: string; url: string }>>;
};

type SendMessageOptions = {
  text: string;
  replyMarkup?: InlineKeyboard;
  chatId?: string;
};

export async function sendTelegramMessage(
  options: SendMessageOptions,
): Promise<{ ok: boolean; mock: boolean }> {
  const { text, replyMarkup, chatId: targetChatId } = options;
  const credentials = await getTelegramCredentials();

  if (!isTelegramConfiguredFromCredentials(credentials)) {
    if (process.env.NODE_ENV === "development") {
      console.info("[telegram:mock] message queued");
    }
    return { ok: true, mock: true };
  }

  const chatId = targetChatId ?? credentials.chatId;

  const response = await fetch(
    `https://api.telegram.org/bot${credentials.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    },
  );

  if (!response.ok) {
    logServerError("telegram:sendMessage", new Error("Telegram API request failed"));
    return { ok: false, mock: false };
  }

  return { ok: true, mock: false };
}

export type OrderNotificationPayload = {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cartSummary: string;
  totalSek: string;
  cryptoTotal: string;
  networkLabel: string;
  network: PaymentNetwork;
  walletAddress: string;
  affiliateHandle?: string;
  commissionSek?: number;
  commissionPercent?: number;
};

export async function sendOrderNotification(
  payload: OrderNotificationPayload,
): Promise<{ ok: boolean; mock: boolean }> {
  const safeName = escapeTelegramHtml(payload.name);
  const safeEmail = escapeTelegramHtml(payload.email);
  const safeAddress = escapeTelegramHtml(payload.address);
  const safeZip = escapeTelegramHtml(payload.zip);
  const safeCity = escapeTelegramHtml(payload.city);
  const safeState = escapeTelegramHtml(payload.state);
  const safeCartSummary = escapeTelegramHtml(payload.cartSummary);
  const safeTotalSek = escapeTelegramHtml(payload.totalSek);
  const safeCryptoTotal = escapeTelegramHtml(payload.cryptoTotal);
  const safeNetworkLabel = escapeTelegramHtml(payload.networkLabel);
  const safeAffiliateHandle = payload.affiliateHandle
    ? escapeTelegramHtml(payload.affiliateHandle)
    : undefined;

  const fullAddress = `${safeAddress}, ${safeZip} ${safeCity}, ${safeState}, Sweden`;

  const text = [
    "🔔 NY BESTÄLLNING - SIMPLICITY STORE",
    "",
    "⚠️ UTSTÅENDE BETALNING (Kontrollera plånboken innan leverans!)",
    `Belopp: ${safeTotalSek} / ${safeCryptoTotal}`,
    "",
    `👤 Kund: ${safeName}`,
    `📧 E-post: ${safeEmail}`,
    `📦 Leveransadress: ${fullAddress}`,
    `🛒 Varukorg: ${safeCartSummary}`,
    `💰 Totalsumma: ${safeTotalSek} / ${safeCryptoTotal}`,
    `🔗 Betalnätverk: ${safeNetworkLabel}`,
    ...(safeAffiliateHandle &&
    payload.commissionSek !== undefined &&
    payload.commissionPercent !== undefined
      ? [
          "",
          "📢 <b>AFFILIATE-SÄLJ</b>",
          `👤 <b>Partner:</b> ${safeAffiliateHandle}`,
          `💸 <b>Provision:</b> ${payload.commissionSek} kr (${payload.commissionPercent}%)`,
        ]
      : []),
  ].join("\n");

  const explorerUrl = getExplorerUrl(payload.network, payload.walletAddress);

  return sendTelegramMessage({
    text,
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🔗 Verifiera Betalning", url: explorerUrl }],
      ],
    },
  });
}

export type ContactNotificationPayload = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactNotification(
  payload: ContactNotificationPayload,
): Promise<{ ok: boolean; mock: boolean }> {
  const safeName = escapeTelegramHtml(payload.name);
  const safeEmail = escapeTelegramHtml(payload.email);
  const safeMessage = escapeTelegramHtml(payload.message);

  const text = [
    "📩 NYTT MEDDELANDE FRÅN BUTIKEN",
    `👤 Namn: ${safeName}`,
    `✉️ E-post: ${safeEmail}`,
    "📝 Meddelande:",
    safeMessage,
  ].join("\n");

  return sendTelegramMessage({ text });
}

export type SecurityAlertPayload = {
  ip: string;
  userAgent: string;
  username: string;
};

export async function sendSecurityAlertNotification(
  payload: SecurityAlertPayload,
): Promise<{ ok: boolean; mock: boolean }> {
  const safeIp = escapeTelegramHtml(payload.ip);
  const safeUserAgent = escapeTelegramHtml(payload.userAgent);
  const safeUsername = escapeTelegramHtml(payload.username);

  const text = [
    "🚨 <b>SÄKERHETSLARM: MISSTÄNKT INLOGGNINGSFÖRSÖK</b>",
    `<b>IP-Adress:</b> ${safeIp}`,
    `<b>Enhet:</b> ${safeUserAgent}`,
    `<b>Försök mot:</b> ${safeUsername}`,
    "<b>Status:</b> IP-adressen har blockerats temporärt.",
  ].join("\n");

  return sendTelegramMessage({ text });
}

export async function sendAdminAuditNotification(
  changes: string[],
): Promise<{ ok: boolean; mock: boolean }> {
  if (changes.length === 0) {
    return { ok: true, mock: true };
  }

  const safeLines = changes.map((line) => escapeTelegramHtml(line));
  const text = [
    "🛠 <b>ADMIN: KONFIGURATION UPPDATERAD</b>",
    "",
    ...safeLines,
  ].join("\n");

  return sendTelegramMessage({ text });
}

export type GuideFeedbackNotificationPayload = {
  vote: "positive" | "negative";
};

export async function sendGuideFeedbackNotification(
  payload: GuideFeedbackNotificationPayload,
): Promise<{ ok: boolean; mock: boolean }> {
  const isPositive = payload.vote === "positive";
  const resultLine = isPositive
    ? "👍 Positiv (Användaren är nöjd med guiden!)"
    : "👎 Negativ (Användaren markerade missnöje)";

  const text = [
    "💬 <b>KUNDUTVÄRDERING INKOMMEN</b>",
    "<b>Typ:</b> Guide / Supportbetyg",
    `<b>Resultat:</b> ${escapeTelegramHtml(resultLine)}`,
  ].join("\n");

  return sendTelegramMessage({ text });
}
