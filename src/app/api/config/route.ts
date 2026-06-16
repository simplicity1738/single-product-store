import { NextResponse } from "next/server";
import { readStoreConfig } from "@/lib/store-config.server";

export async function GET() {
  const config = await readStoreConfig();

  return NextResponse.json(
    {
      siteSettings: config.siteSettings,
      banner: config.banner,
      marketingTracking: config.marketingTracking,
      shippingFee: config.shippingFee,
      freeShippingThreshold: config.freeShippingThreshold,
      telegramHandle: config.telegramHandle,
      contactEmail: config.contactEmail,
      cryptoWallets: config.cryptoWallets,
      btcWalletInput: config.btcWalletInput,
      ethWalletInput: config.ethWalletInput,
      products: config.products,
      reviews: config.reviews,
      discounts: config.discounts,
      faqs: config.faqs,
      bestSellerProductIds: config.bestSellerProductIds,
      premiumProductIds: config.premiumProductIds,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
