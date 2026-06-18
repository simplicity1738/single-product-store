import { NextResponse } from "next/server";
import {
  clearAdminLoginFailures,
  getAdminIpBlockExpiry,
  isAdminIpBlocked,
  recordAdminLoginFailure,
} from "@/lib/admin-security.server";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  isAdminPasswordConfigured,
  validateAdminPassword,
} from "@/lib/admin-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get("user-agent")?.trim().slice(0, 512) || "unknown";

  if (await isAdminIpBlocked(clientIp)) {
    const blockedUntil = await getAdminIpBlockExpiry(clientIp);
    const retryAfterSeconds = blockedUntil
      ? Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000))
      : 1800;

    return NextResponse.json(
      {
        success: false,
        message: "Too many failed login attempts. This IP is temporarily blocked.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  }

  const rateLimit = checkRateLimit(`admin-login:${clientIp}`, 8, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: "Admin login is not configured on this server.",
      },
      { status: 503 },
    );
  }

  let password = "";
  let username = "admin";

  try {
    const body = (await request.json()) as {
      password?: unknown;
      username?: unknown;
    };
    password =
      typeof body.password === "string"
        ? body.password.trim().slice(0, 256)
        : "";
    username =
      typeof body.username === "string" && body.username.trim()
        ? body.username.trim().slice(0, 128)
        : "admin";
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { success: false, message: "Password is required." },
      { status: 400 },
    );
  }

  if (!validateAdminPassword(password)) {
    const failure = await recordAdminLoginFailure(clientIp, username, userAgent);
    await new Promise((resolve) => setTimeout(resolve, 750));

    if (failure.blocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many failed login attempts. This IP is temporarily blocked.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid password." },
      { status: 401 },
    );
  }

  await clearAdminLoginFailures(clientIp);

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

  return response;
}
