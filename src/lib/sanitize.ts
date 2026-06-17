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

const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;

/** Remove ASCII control characters that can smuggle payloads or break parsers. */
export function stripControlCharacters(value: string): string {
  return value.replace(CONTROL_CHAR_PATTERN, "");
}

/** Trim and cap user-supplied text to a safe maximum length. */
export function clampText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

/** Clamp length and strip control characters from free-text user input. */
export function sanitizePlainText(value: string, maxLength: number): string {
  return clampText(stripControlCharacters(value), maxLength);
}

/** Like sanitizePlainText but preserves line breaks for markdown/multiline fields. */
export function sanitizeMultilineText(value: string, maxLength: number): string {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "");
  return normalized.trim().slice(0, maxLength);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize and validate an email address. Returns null when invalid. */
export function sanitizeEmail(value: string): string | null {
  const normalized = sanitizePlainText(value, CHECKOUT_FIELD_LIMITS.email).toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) return null;
  return normalized;
}

/** Restrict identifiers (order IDs, product IDs, refs) to a safe charset. */
export function sanitizeIdentifier(value: string, maxLength = 80): string {
  return sanitizePlainText(value, maxLength).replace(/[^a-zA-Z0-9:_-]/g, "");
}

export function sanitizeOrderId(value: string): string {
  return sanitizeIdentifier(value, 64);
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

export const CONTACT_FIELD_LIMITS = {
  name: 120,
  email: 254,
  message: 2000,
} as const;

export const ADMIN_PRODUCT_FIELD_LIMITS = {
  title: 160,
  description: 2000,
  image: 500,
  sizeLabel: 80,
  variantsInput: 300,
  includedItems: 200,
  productId: 80,
} as const;
