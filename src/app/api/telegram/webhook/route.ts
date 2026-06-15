import { NextResponse } from "next/server";
import { broadcastToSubscribers } from "@/lib/email";
import { env } from "@/lib/env";
import { readSubscribers } from "@/lib/subscribers.server";
import { getTelegramCredentials } from "@/lib/store-config.server";
import { sendTelegramMessage } from "@/lib/telegram";
import { sanitizePlainText } from "@/lib/sanitize";
import { logServerError } from "@/lib/safe-log";

const BROADCAST_COMMAND_PATTERN = /^\/broadcast(?:@[A-Za-z0-9_]+)?\s+/;
const BROADCAST_BODY_LIMIT = 4000;

type TelegramUpdate = {
  message?: {
    chat?: { id: number };
    text?: string;
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
  if (!configuredSecret) return true;

  const headerSecret =
    request.headers.get("x-telegram-bot-api-secret-token")?.trim() ?? "";
  return headerSecret === configuredSecret;
}

export async function POST(request: Request) {
  try {
    if (!isWebhookAuthorized(request)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const update = (await request.json()) as TelegramUpdate;
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
