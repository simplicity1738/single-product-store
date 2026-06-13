import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  validateAdminPassword,
} from "@/lib/admin-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
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

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password =
      typeof body.password === "string"
        ? body.password.trim().slice(0, 256)
        : "";
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
    await new Promise((resolve) => setTimeout(resolve, 750));
    return NextResponse.json(
      { success: false, message: "Invalid password." },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

  return response;
}
