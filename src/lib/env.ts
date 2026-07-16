function readEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export const env = {
  telegramBotToken: readEnv("TELEGRAM_BOT_TOKEN"),
  telegramChatId: readEnv("TELEGRAM_CHAT_ID"),
  telegramWebhookSecret: readEnv("TELEGRAM_WEBHOOK_SECRET"),
  smtpHost: readEnv("SMTP_HOST"),
  smtpUser: readEnv("SMTP_USER"),
  smtpPass: readEnv("SMTP_PASS"),
  stripeSecretKey: readEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: readEnv("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey: readEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
};

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey);
}

export function isTelegramConfigured(): boolean {
  return Boolean(env.telegramBotToken && env.telegramChatId);
}

export function isSmtpConfigured(): boolean {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}
