/** Escape dynamic strings for Telegram HTML parse_mode. */
export function escapeTelegramHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape dynamic strings for HTML email bodies. */
export function escapeHtml(value: string): string {
  return escapeTelegramHtml(value);
}

/** Trim and cap user-supplied text to a safe maximum length. */
export function clampText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export const CHECKOUT_FIELD_LIMITS = {
  name: 120,
  email: 254,
  address: 200,
  city: 80,
  state: 80,
  zip: 20,
  cryptoTotal: 64,
  discountCode: 32,
} as const;
