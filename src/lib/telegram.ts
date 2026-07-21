import type { PaymentNetwork } from "@/lib/payment-wallets";
import { escapeTelegramHtml } from "@/lib/sanitize";
import { logServerError } from "@/lib/safe-log";
import {
  getTelegramCredentials,
  isTelegramConfiguredFromCredentials,
} from "@/lib/store-config.server";
import {
  formatPaymentMethodBadge,
  getStripeDashboardSessionUrl,
  type StripePaymentType,
} from "@/lib/order-payment";

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

type InlineKeyboardButton =
  | { text: string; url: string }
  | { text: string; callback_data: string };

type InlineKeyboard = {
  inline_keyboard: Array<Array<InlineKeyboardButton>>;
};

type SendMessageOptions = {
  text: string;
  replyMarkup?: InlineKeyboard;
  chatId?: string;
};

export function formatShippingAddressBlock(parts: {
  name: string;
  address: string;
  zip: string;
  city: string;
  state: string;
}): string {
  const lines = [
    parts.name.trim(),
    parts.address.trim(),
    `${parts.zip.trim()} ${parts.city.trim()}`.trim(),
    parts.state.trim() ? `${parts.state.trim()}, Sweden` : "Sweden",
  ].filter(Boolean);

  return `<pre>${escapeTelegramHtml(lines.join("\n"))}</pre>`;
}

export function buildFulfillmentKeyboard(orderId: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "📦 Packad", callback_data: `pack_${orderId}` },
        {
          text: "🚚 Skickad / Levererad",
          callback_data: `ship_${orderId}`,
        },
      ],
    ],
  };
}

export async function sendTelegramMessage(
  options: SendMessageOptions,
): Promise<{ ok: boolean; mock: boolean; messageId?: number; chatId?: string }> {
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

  try {
    const payload = (await response.json()) as {
      result?: { message_id?: number; chat?: { id?: number } };
    };
    return {
      ok: true,
      mock: false,
      messageId: payload.result?.message_id,
      chatId: payload.result?.chat?.id
        ? String(payload.result.chat.id)
        : chatId,
    };
  } catch {
    return { ok: true, mock: false, chatId };
  }
}

export async function editTelegramMessage(options: {
  chatId: string;
  messageId: number;
  text: string;
  replyMarkup?: InlineKeyboard | { inline_keyboard: [] };
}): Promise<{ ok: boolean; mock: boolean }> {
  const credentials = await getTelegramCredentials();

  if (!isTelegramConfiguredFromCredentials(credentials)) {
    if (process.env.NODE_ENV === "development") {
      console.info("[telegram:mock] editMessageText", options.messageId);
    }
    return { ok: true, mock: true };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${credentials.botToken}/editMessageText`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: options.chatId,
        message_id: options.messageId,
        text: options.text,
        parse_mode: "HTML",
        reply_markup: options.replyMarkup,
      }),
    },
  );

  if (!response.ok) {
    logServerError(
      "telegram:editMessageText",
      new Error("Telegram API request failed"),
    );
    return { ok: false, mock: false };
  }

  return { ok: true, mock: false };
}

export async function answerTelegramCallbackQuery(options: {
  callbackQueryId: string;
  text?: string;
  showAlert?: boolean;
}): Promise<void> {
  const credentials = await getTelegramCredentials();
  if (!isTelegramConfiguredFromCredentials(credentials)) return;

  try {
    await fetch(
      `https://api.telegram.org/bot${credentials.botToken}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: options.callbackQueryId,
          text: options.text,
          show_alert: options.showAlert ?? false,
        }),
      },
    );
  } catch (error) {
    logServerError("telegram:answerCallbackQuery", error);
  }
}

function appendStatusFooter(
  originalText: string,
  statusLine: string,
): string {
  const cleaned = originalText
    .replace(/\n\n✅ STATUS:[\s\S]*$/u, "")
    .replace(/\n\n📦 STATUS:[\s\S]*$/u, "")
    .replace(/\n\n✅ <b>STATUS:[\s\S]*$/u, "")
    .replace(/\n\n📦 <b>STATUS:[\s\S]*$/u, "")
    .trimEnd();
  return `${escapeTelegramHtml(cleaned)}\n\n${statusLine}`;
}

export function buildPackedStatusLine(timestamp: Date = new Date()): string {
  const formatted = timestamp.toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `📦 <b>STATUS: PACKAD</b> (${escapeTelegramHtml(formatted)})`;
}

export function buildShippedStatusLine(timestamp: Date = new Date()): string {
  const formatted = timestamp.toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `✅ <b>STATUS: SKICKAD / LEVERERAD</b> (${escapeTelegramHtml(formatted)})`;
}

export async function markTelegramOrderPacked(options: {
  chatId: string;
  messageId: number;
  originalText: string;
  orderId: string;
}): Promise<{ ok: boolean; mock: boolean }> {
  const text = appendStatusFooter(
    options.originalText,
    buildPackedStatusLine(),
  );

  return editTelegramMessage({
    chatId: options.chatId,
    messageId: options.messageId,
    text,
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: "🚚 Skickad / Levererad",
            callback_data: `ship_${options.orderId}`,
          },
        ],
      ],
    },
  });
}

export async function markTelegramOrderShipped(options: {
  chatId: string;
  messageId: number;
  originalText: string;
}): Promise<{ ok: boolean; mock: boolean }> {
  const text = appendStatusFooter(
    options.originalText,
    buildShippedStatusLine(),
  );

  return editTelegramMessage({
    chatId: options.chatId,
    messageId: options.messageId,
    text,
    replyMarkup: { inline_keyboard: [] },
  });
}

export type OrderNotificationPayload = {
  orderId: string;
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
  const safeOrderId = escapeTelegramHtml(payload.orderId);
  const safeName = escapeTelegramHtml(payload.name);
  const safeEmail = escapeTelegramHtml(payload.email);
  const safeCartSummary = escapeTelegramHtml(payload.cartSummary);
  const safeTotalSek = escapeTelegramHtml(payload.totalSek);
  const safeCryptoTotal = escapeTelegramHtml(payload.cryptoTotal);
  const safeNetworkLabel = escapeTelegramHtml(payload.networkLabel);
  const safeAffiliateHandle = payload.affiliateHandle
    ? escapeTelegramHtml(payload.affiliateHandle)
    : undefined;

  const addressBlock = formatShippingAddressBlock({
    name: payload.name,
    address: payload.address,
    zip: payload.zip,
    city: payload.city,
    state: payload.state,
  });

  const text = [
    "🔔 NY BESTÄLLNING - SIMPLICITY STORE",
    "",
    `Order: ${safeOrderId}`,
    "⚠️ UTSTÅENDE BETALNING (Kontrollera plånboken innan leverans!)",
    `Belopp: ${safeTotalSek} / ${safeCryptoTotal}`,
    "",
    `👤 Kund: ${safeName}`,
    `📧 E-post: ${safeEmail}`,
    "📦 Leveransadress (tryck för att kopiera):",
    addressBlock,
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
  const fulfillment = buildFulfillmentKeyboard(payload.orderId);

  return sendTelegramMessage({
    text,
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🔗 Verifiera Betalning", url: explorerUrl }],
        ...fulfillment.inline_keyboard,
      ],
    },
  });
}

export type StripeOrderPaidNotificationPayload = {
  orderId: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cartSummary: string;
  totalSek: string;
  stripeSessionId: string;
  stripePaymentType?: StripePaymentType;
  affiliateHandle?: string;
  commissionSek?: number;
  commissionPercent?: number;
};

export async function sendStripeOrderPaidNotification(
  payload: StripeOrderPaidNotificationPayload,
): Promise<{ ok: boolean; mock: boolean }> {
  const safeOrderId = escapeTelegramHtml(payload.orderId);
  const safeName = escapeTelegramHtml(payload.name);
  const safeEmail = escapeTelegramHtml(payload.email);
  const safeCartSummary = escapeTelegramHtml(payload.cartSummary);
  const safeTotalSek = escapeTelegramHtml(payload.totalSek);
  const paymentBadge = escapeTelegramHtml(
    formatPaymentMethodBadge("stripe", payload.stripePaymentType),
  );
  const safeAffiliateHandle = payload.affiliateHandle
    ? escapeTelegramHtml(payload.affiliateHandle)
    : undefined;

  const addressBlock = formatShippingAddressBlock({
    name: payload.name,
    address: payload.address,
    zip: payload.zip,
    city: payload.city,
    state: payload.state,
  });
  const dashboardUrl = getStripeDashboardSessionUrl(payload.stripeSessionId);
  const fulfillment = buildFulfillmentKeyboard(payload.orderId);

  const text = [
    "✅ BETALNING BEKRÄFTAD - SIMPLICITY STORE",
    "",
    `Order: ${safeOrderId}`,
    `Belopp: ${safeTotalSek}`,
    `Betalmetod: ${paymentBadge}`,
    "",
    `👤 Kund: ${safeName}`,
    `📧 E-post: ${safeEmail}`,
    "📦 Leveransadress (tryck för att kopiera):",
    addressBlock,
    `🛒 Varukorg: ${safeCartSummary}`,
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

  return sendTelegramMessage({
    text,
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🔗 Visa i Stripe", url: dashboardUrl }],
        ...fulfillment.inline_keyboard,
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

export async function sendReviewPendingNotification(
  customerName: string,
): Promise<{ ok: boolean; mock: boolean }> {
  const safeName = escapeTelegramHtml(customerName.trim() || "Okänd kund");
  const text = `📝 Ny recension väntar på godkännande från ${safeName}!`;
  return sendTelegramMessage({ text });
}

export async function sendRefundProcessedNotification(
  orderId: string,
  amountSek: number,
): Promise<{ ok: boolean; mock: boolean }> {
  const safeOrderId = escapeTelegramHtml(orderId);
  const formattedAmount = escapeTelegramHtml(
    new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(amountSek),
  );
  const text = `💸 Order ${safeOrderId} har blivit återbetald via Stripe. Belopp: ${formattedAmount} kr.`;
  return sendTelegramMessage({ text });
}

export async function sendOrderDeletedNotification(
  orderId: string,
): Promise<{ ok: boolean; mock: boolean }> {
  const safeOrderId = escapeTelegramHtml(orderId);
  const text = `🗑️ Order ${safeOrderId} raderades permanent från databasen.`;
  return sendTelegramMessage({ text });
}
