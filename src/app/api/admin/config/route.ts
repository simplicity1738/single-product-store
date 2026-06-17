import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { summarizeStoreConfigChanges } from "@/lib/admin-audit";
import { readStoreConfig, writeStoreConfig } from "@/lib/store-config.server";
import { sendAdminAuditNotification } from "@/lib/telegram";
import type { StoreConfig } from "@/lib/store-config";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const config = await readStoreConfig();
  return NextResponse.json(config);
}

async function saveConfig(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as StoreConfig;

    if (
      !body.siteSettings ||
      !body.cryptoWallets ||
      !body.systemIntegration ||
      !Array.isArray(body.products) ||
      !Array.isArray(body.reviews) ||
      !Array.isArray(body.discounts)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid configuration payload." },
        { status: 400 },
      );
    }

    const previousConfig = await readStoreConfig();
    await writeStoreConfig(body);

    const changes = summarizeStoreConfigChanges(previousConfig, body);
    if (changes.length > 0) {
      void sendAdminAuditNotification(changes);
    }

    return NextResponse.json({
      success: true,
      message: "Ändringar sparade framgångsrikt!",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save configuration." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return saveConfig(request);
}

export async function PUT(request: Request) {
  return saveConfig(request);
}
