export const SESSION_COOKIE_NAME = "simplicity_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const DEFAULT_ADMIN_PASSWORD = "Bestallning01";

type SessionPayload = {
  exp: number;
  iat: number;
};

export function getAdminPassword(): string {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  return configured || DEFAULT_ADMIN_PASSWORD;
}

export function validateAdminPassword(password: string): boolean {
  return password.trim() === getAdminPassword();
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signPayload(payloadB64: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAdminPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifyPayloadSignature(
  payloadB64: string,
  signatureB64: string,
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getAdminPassword()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signatureB64) as Uint8Array<ArrayBuffer>,
      new TextEncoder().encode(payloadB64),
    );
  } catch {
    return false;
  }
}

export async function createSessionToken(): Promise<string> {
  const payload: SessionPayload = {
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signatureB64 = await signPayload(payloadB64);

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) return false;

    const signatureValid = await verifyPayloadSignature(
      payloadB64,
      signatureB64,
    );
    if (!signatureValid) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64)),
    ) as SessionPayload;

    return typeof payload.exp === "number" && Date.now() <= payload.exp;
  } catch {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}
