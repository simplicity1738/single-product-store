import { NextResponse } from "next/server";
import { broadcastToSubscribers, sendOrderShippedEmail } from "@/lib/email";
import { env } from "@/lib/env";
import {
  findOrderById,
  markOrderDelivered,
  markOrderPacked,
} from "@/lib/orders.server";
import { ORDER_STATUS } from "@/lib/order-status";
import { sanitizeOrderId, sanitizePlainText } from "@/lib/sanitize";
import { logServerError } from "@/lib/safe-log";
import { readSubscribers } from "@/lib/subscribers.server";
import { getTelegramCredentials } from "@/lib/store-config.server";
import {
  answerTelegramCallbackQuery,
  markTelegramOrderPacked,
  markTelegramOrderShipped,
  sendTelegramMessage,
} from "@/lib/telegram";

const BROADCAST_COMMAND_PATTERN = /^\/broadcast(?:@[A-Za-z0-9_]+)?\s+/;
const BROADCAST_BODY_LIMIT = 4000;
const FULFILLMENT_CALLBACK_PATTERN = /^(pack|ship)_(.+)$/;

type TelegramUpdate = {
  message?: {
    chat?: { id: number };
    text?: string;
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: { id?: number };
    message?: {
      message_id?: number;
      chat?: { id: number };
      text?: string;
    };
  };
};

function extractBroadcastBody(text: string): string | null {
  if (!BROADCAST_COMMAND_PATTERN.test(text)) return null;
  return text.replace(BROADCAST_COMMAND_PATTERN, "").trim();
}

function buildBroadcastConfirmation(count: number): string {
  return [
    "🚀 <b>NYHETSBREV SKICKAT!</b>",
    `📬 Meddelandet har skickats ut till ${count} st prenumeranter.`,
  ].join("\n");
}

async function replyToOperator(chatId: string, text: string): Promise<void> {
  await sendTelegramMessage({ text, chatId });
}

function isWebhookAuthorized(request: Request): boolean {
  const configuredSecret = env.telegramWebhookSecret;
  if (!configuredSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const headerSecret =
    request.headers.get("x-telegram-bot-api-secret-token")?.trim() ?? "";
  return headerSecret === configuredSecret;
}

async function handleFulfillmentCallback(options: {
  callbackQueryId: string;
  data: string;
  chatId: string;
  messageId: number;
  originalText: string;
}): Promise<void> {
  const match = options.data.match(FULFILLMENT_CALLBACK_PATTERN);
  if (!match) {
    await answerTelegramCallbackQuery({
      callbackQueryId: options.callbackQueryId,
      text: "Okänd knapp.",
      showAlert: true,
    });
    return;
  }

  const action = match[1] as "pack" | "ship";
  const orderId = sanitizeOrderId(match[2] ?? "");
  if (!orderId) {
    await answerTelegramCallbackQuery({
      callbackQueryId: options.callbackQueryId,
      text: "Ogiltigt order-ID.",
      showAlert: true,
    });
    return;
  }

  const order = await findOrderById(orderId);
  if (!order) {
    await answerTelegramCallbackQuery({
      callbackQueryId: options.callbackQueryId,
      text: `Order ${orderId} hittades inte.`,
      showAlert: true,
    });
    return;
  }

  if (order.status === ORDER_STATUS.PENDING) {
    await answerTelegramCallbackQuery({
      callbackQueryId: options.callbackQueryId,
      text: "Ordern väntar fortfarande på betalning.",
      showAlert: true,
    });
    return;
  }

  if (order.status === ORDER_STATUS.REFUNDED) {
    await answerTelegramCallbackQuery({
      callbackQueryId: options.callbackQueryId,
      text: "Ordern är återbetald.",
      showAlert: true,
    });
    return;
  }

  if (action === "pack") {
    if (order.status === ORDER_STATUS.DELIVERED) {
      await answerTelegramCallbackQuery({
        callbackQueryId: options.callbackQueryId,
        text: "Ordern är redan levererad.",
        showAlert: true,
      });
      return;
    }

    if (order.status !== ORDER_STATUS.PACKED) {
      await markOrderPacked(orderId);
    }

    await markTelegramOrderPacked({
      chatId: options.chatId,
      messageId: options.messageId,
      originalText: options.originalText,
      orderId,
    });

    await answerTelegramCallbackQuery({
      callbackQueryId: options.callbackQueryId,
      text: `📦 ${orderId} markerad som Packad`,
    });
    return;
  }

  if (order.status !== ORDER_STATUS.DELIVERED) {
    await markOrderDelivered(orderId);
  }

  await markTelegramOrderShipped({
    chatId: options.chatId,
    messageId: options.messageId,
    originalText: options.originalText,
  });

  if (order.customerEmail) {
    try {
      await sendOrderShippedEmail({
        orderId: order.id,
        customerEmail: order.customerEmail,
        customerName: order.customerName ?? "Kund",
      });
    } catch (error) {
      logServerError("telegram:webhook:shipped-email", error);
    }
  }

  await answerTelegramCallbackQuery({
    callbackQueryId: options.callbackQueryId,
    text: `✅ ${orderId} markerad som Skickad / Levererad`,
  });
}

export async function POST(request: Request) {
  try {
    if (!isWebhookAuthorized(request)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const update = (await request.json()) as TelegramUpdate;

    if (update.callback_query) {
      const callback = update.callback_query;
      const chatId = callback.message?.chat?.id;
      const messageId = callback.message?.message_id;
      const data = callback.data?.trim() ?? "";
      const originalText = callback.message?.text ?? "";

      if (!chatId || !messageId || !data || !callback.id) {
        return NextResponse.json({ ok: true });
      }

      const { chatId: ownerChatId } = await getTelegramCredentials();
      if (!ownerChatId || String(chatId) !== ownerChatId) {
        await answerTelegramCallbackQuery({
          callbackQueryId: callback.id,
          text: "Otillåten chat.",
          showAlert: true,
        });
        return NextResponse.json({ ok: true });
      }

      await handleFulfillmentCallback({
        callbackQueryId: callback.id,
        data,
        chatId: String(chatId),
        messageId,
        originalText,
      });

      return NextResponse.json({ ok: true });
    }

    const chatId = update.message?.chat?.id;
    const text = update.message?.text?.trim() ?? "";

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    const broadcastBody = extractBroadcastBody(text);
    if (broadcastBody === null) {
      return NextResponse.json({ ok: true });
    }

    const { chatId: ownerChatId } = await getTelegramCredentials();
    if (!ownerChatId || String(chatId) !== ownerChatId) {
      return NextResponse.json({ ok: true });
    }

    const sanitizedBroadcastBody = sanitizePlainText(
      broadcastBody,
      BROADCAST_BODY_LIMIT,
    );

    if (!sanitizedBroadcastBody) {
      await replyToOperator(
        ownerChatId,
        "ℹ️ Använd: <code>/broadcast Ditt meddelande här</code>",
      );
      return NextResponse.json({ ok: true });
    }

    const subscribers = await readSubscribers();
    const emails = subscribers.map((entry) => entry.email);

    if (emails.length === 0) {
      await replyToOperator(
        ownerChatId,
        "📭 Inga prenumeranter hittades i nyhetsbrevslistan.",
      );
      return NextResponse.json({ ok: true });
    }

    const result = await broadcastToSubscribers(sanitizedBroadcastBody, emails);
    const deliveredCount = result.mock ? emails.length : result.sent;

    await replyToOperator(
      ownerChatId,
      buildBroadcastConfirmation(deliveredCount),
    );

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
      mock: result.mock,
    });
  } catch (error) {
    logServerError("telegram:webhook", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "SimpliCity Telegram webhook is active.",
  });
}
