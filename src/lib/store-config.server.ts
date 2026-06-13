import { env } from "@/lib/env";
import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";
import {
  DEFAULT_BANNER,
  DEFAULT_DISCOUNTS,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_INFLUENCERS,
  DEFAULT_MARKETING_TRACKING,
  DEFAULT_REVIEWS,
  DEFAULT_SHIPPING_FEE,
  DEFAULT_STORE_CONFIG,
  normalizeDiscountCode,
  normalizeInfluencerHandle,
  normalizeTelegramHandle,
  type BannerConfig,
  type ConfigDiscount,
  type InfluencerPartner,
  type StoreConfig,
} from "@/lib/store-config";

function normalizeDiscount(entry: Partial<ConfigDiscount>): ConfigDiscount {
  return {
    id: entry.id?.trim() || `discount-${Date.now()}`,
    code: normalizeDiscountCode(entry.code ?? ""),
    type: entry.type === "flat" ? "flat" : "percent",
    value: Number.isFinite(entry.value) ? Math.max(0, Number(entry.value)) : 0,
    productScope: entry.productScope?.trim() || "all",
    usageLimit: Number.isFinite(entry.usageLimit)
      ? Math.max(0, Math.floor(Number(entry.usageLimit)))
      : 0,
    usageCount: Number.isFinite(entry.usageCount)
      ? Math.max(0, Math.floor(Number(entry.usageCount)))
      : 0,
  };
}

function normalizeBanner(entry: Partial<BannerConfig> | undefined): BannerConfig {
  const style = entry?.style;
  const validStyle =
    style === "flash-sale-pulse" || style === "urgent-alert"
      ? style
      : "clean-minimalist";

  return {
    activeLines: Array.isArray(entry?.activeLines)
      ? entry.activeLines.map((line) => String(line).trim()).filter(Boolean)
      : DEFAULT_BANNER.activeLines,
    style: validStyle,
    countdownEnabled: Boolean(entry?.countdownEnabled),
    countdownEndsAt:
      typeof entry?.countdownEndsAt === "string" ? entry.countdownEndsAt : "",
  };
}

function normalizeInfluencer(entry: Partial<InfluencerPartner>): InfluencerPartner {
  return {
    id: entry.id?.trim() || `influencer-${Date.now()}`,
    handle: normalizeInfluencerHandle(entry.handle ?? ""),
    promoCode: normalizeDiscountCode(entry.promoCode ?? ""),
    commissionPercent: Number.isFinite(entry.commissionPercent)
      ? Math.min(100, Math.max(0, Number(entry.commissionPercent)))
      : 0,
  };
}

function normalizeShippingFee(value: unknown): number {
  return Number.isFinite(value)
    ? Math.max(0, Number(value))
    : DEFAULT_SHIPPING_FEE;
}

function normalizeFreeShippingThreshold(value: unknown): number {
  return Number.isFinite(value)
    ? Math.max(0, Number(value))
    : DEFAULT_FREE_SHIPPING_THRESHOLD;
}

function mergeStoreConfig(parsed: Partial<StoreConfig>): StoreConfig {
  return {
    siteSettings: {
      ...DEFAULT_STORE_CONFIG.siteSettings,
      ...parsed.siteSettings,
    },
    banner: normalizeBanner(parsed.banner),
    marketingTracking: {
      ...DEFAULT_MARKETING_TRACKING,
      ...parsed.marketingTracking,
    },
    influencers: Array.isArray(parsed.influencers)
      ? parsed.influencers.map((entry) => normalizeInfluencer(entry))
      : DEFAULT_INFLUENCERS,
    shippingFee: normalizeShippingFee(parsed.shippingFee),
    freeShippingThreshold: normalizeFreeShippingThreshold(
      parsed.freeShippingThreshold,
    ),
    telegramHandle: normalizeTelegramHandle(
      parsed.telegramHandle ?? DEFAULT_STORE_CONFIG.telegramHandle,
    ),
    cryptoWallets: {
      ...DEFAULT_STORE_CONFIG.cryptoWallets,
      ...parsed.cryptoWallets,
    },
    systemIntegration: {
      ...DEFAULT_STORE_CONFIG.systemIntegration,
      ...parsed.systemIntegration,
    },
    products: Array.isArray(parsed.products) ? parsed.products : [],
    reviews:
      Array.isArray(parsed.reviews) && parsed.reviews.length > 0
        ? parsed.reviews
        : DEFAULT_REVIEWS,
    discounts:
      Array.isArray(parsed.discounts) && parsed.discounts.length > 0
        ? parsed.discounts.map((entry) => normalizeDiscount(entry))
        : DEFAULT_DISCOUNTS,
  };
}

export async function readStoreConfig(): Promise<StoreConfig> {
  const parsed = await readKvData<Partial<StoreConfig>>(
    KV_KEYS.STORE_CONFIG,
    "store-config.json",
    DEFAULT_STORE_CONFIG,
  );
  return mergeStoreConfig(parsed);
}

export async function writeStoreConfig(config: StoreConfig): Promise<void> {
  const normalized: StoreConfig = {
    ...config,
    banner: normalizeBanner(config.banner),
    marketingTracking: {
      googleAnalyticsId: config.marketingTracking?.googleAnalyticsId?.trim() ?? "",
      tiktokPixelId: config.marketingTracking?.tiktokPixelId?.trim() ?? "",
    },
    influencers: Array.isArray(config.influencers)
      ? config.influencers.map((entry) => normalizeInfluencer(entry))
      : [],
    shippingFee: normalizeShippingFee(config.shippingFee),
    freeShippingThreshold: normalizeFreeShippingThreshold(
      config.freeShippingThreshold,
    ),
    telegramHandle: normalizeTelegramHandle(config.telegramHandle),
    reviews: Array.isArray(config.reviews) ? config.reviews : DEFAULT_REVIEWS,
    discounts: Array.isArray(config.discounts)
      ? config.discounts.map((entry) => normalizeDiscount(entry))
      : DEFAULT_DISCOUNTS,
  };
  await writeKvData(KV_KEYS.STORE_CONFIG, "store-config.json", normalized);
}

export async function incrementDiscountUsage(code: string): Promise<void> {
  const normalized = normalizeDiscountCode(code);
  if (!normalized) return;

  const config = await readStoreConfig();
  const index = config.discounts.findIndex(
    (entry) => normalizeDiscountCode(entry.code) === normalized,
  );
  if (index < 0) return;

  config.discounts[index] = {
    ...config.discounts[index],
    usageCount: config.discounts[index].usageCount + 1,
  };

  await writeStoreConfig(config);
}

export type TelegramCredentials = {
  botToken: string;
  chatId: string;
};

export async function getTelegramCredentials(): Promise<TelegramCredentials> {
  const config = await readStoreConfig();
  return {
    botToken:
      config.systemIntegration.telegramBotToken.trim() ||
      env.telegramBotToken,
    chatId:
      config.systemIntegration.telegramChatId.trim() ||
      env.telegramChatId,
  };
}

export function isTelegramConfiguredFromCredentials(
  credentials: TelegramCredentials,
): boolean {
  return Boolean(credentials.botToken && credentials.chatId);
}
