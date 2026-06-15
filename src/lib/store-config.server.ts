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
  parseVariantsInput,
  resolveConfigVariants,
  type BannerConfig,
  type ConfigDiscount,
  type ConfigFaq,
  type ConfigProduct,
  type ConfigProductVariant,
  type InfluencerPartner,
  type StoreConfig,
} from "@/lib/store-config";
import {
  DEFAULT_PRODUCT_STOCK_STATUS,
  normalizeProductStockStatus,
  type ProductStockStatus,
} from "@/lib/product-stock";

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

function normalizeFaq(entry: Partial<ConfigFaq>): ConfigFaq {
  return {
    id: entry.id?.trim() || `faq-${Date.now()}`,
    question: String(entry.question ?? "").trim(),
    answer: String(entry.answer ?? "").trim(),
  };
}

function normalizeProductIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

type ConfigProductNormalizeInput = Partial<ConfigProduct> & {
  variantsInput?: string;
};

function normalizeConfigProduct(
  entry: ConfigProductNormalizeInput,
  id: string,
): ConfigProduct {
  const fallbackPrice = Number.isFinite(entry.price)
    ? Math.max(0, Number(entry.price))
    : 0;

  let variants: ConfigProductVariant[];
  if (entry.variantsInput !== undefined) {
    variants = parseVariantsInput(entry.variantsInput, fallbackPrice);
  } else if (entry.sizeLabel !== undefined) {
    variants = parseVariantsInput(entry.sizeLabel, fallbackPrice);
  } else {
    variants = resolveConfigVariants({
      ...entry,
      price: fallbackPrice,
    } as ConfigProduct);
  }

  return {
    id,
    title: String(entry.title ?? "").trim(),
    description: String(entry.description ?? "").trim(),
    price: fallbackPrice,
    image: String(entry.image ?? "").trim() || "/logo.png",
    status: normalizeProductStockStatus(entry.status),
    ...(variants.length > 0 ? { variants } : {}),
  };
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
    contactEmail:
      typeof parsed.contactEmail === "string" && parsed.contactEmail.trim()
        ? parsed.contactEmail.trim()
        : DEFAULT_STORE_CONFIG.contactEmail,
    cryptoWallets: {
      ...DEFAULT_STORE_CONFIG.cryptoWallets,
      ...parsed.cryptoWallets,
    },
    systemIntegration: {
      ...DEFAULT_STORE_CONFIG.systemIntegration,
      ...parsed.systemIntegration,
    },
    products: Array.isArray(parsed.products)
      ? parsed.products.map((entry) =>
          normalizeConfigProduct(
            entry,
            entry.id?.trim() || `product-${Date.now()}`,
          ),
        )
      : [],
    reviews:
      Array.isArray(parsed.reviews) && parsed.reviews.length > 0
        ? parsed.reviews
        : DEFAULT_REVIEWS,
    discounts:
      Array.isArray(parsed.discounts) && parsed.discounts.length > 0
        ? parsed.discounts.map((entry) => normalizeDiscount(entry))
        : DEFAULT_DISCOUNTS,
    bestSellerProductIds: normalizeProductIdList(parsed.bestSellerProductIds),
    premiumProductIds: normalizeProductIdList(parsed.premiumProductIds),
    faqs: Array.isArray(parsed.faqs)
      ? parsed.faqs.map((entry) => normalizeFaq(entry)).filter((entry) => entry.question)
      : [],
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
    contactEmail: config.contactEmail?.trim() || DEFAULT_STORE_CONFIG.contactEmail,
    reviews: Array.isArray(config.reviews) ? config.reviews : DEFAULT_REVIEWS,
    discounts: Array.isArray(config.discounts)
      ? config.discounts.map((entry) => normalizeDiscount(entry))
      : DEFAULT_DISCOUNTS,
    bestSellerProductIds: normalizeProductIdList(config.bestSellerProductIds),
    premiumProductIds: normalizeProductIdList(config.premiumProductIds),
    faqs: Array.isArray(config.faqs)
      ? config.faqs.map((entry) => normalizeFaq(entry)).filter((entry) => entry.question)
      : [],
    products: Array.isArray(config.products)
      ? config.products.map((entry) =>
          normalizeConfigProduct(entry, entry.id?.trim() || `product-${Date.now()}`),
        )
      : [],
  };
  await writeKvData(KV_KEYS.STORE_CONFIG, "store-config.json", normalized);
}

export type UpdateStoreProductResult = {
  product: ConfigProduct;
  bestSellerProductIds: string[];
  premiumProductIds: string[];
};

export async function updateStoreProduct(
  productId: string,
  updates: {
    title?: string;
    description?: string;
    price?: number;
    image?: string;
    variantsInput?: string;
    sizeLabel?: string;
    bestSeller?: boolean;
    premium?: boolean;
    status?: ProductStockStatus;
  },
): Promise<UpdateStoreProductResult | null> {
  const config = await readStoreConfig();
  const index = config.products.findIndex((product) => product.id === productId);
  if (index === -1) return null;

  const existing = config.products[index];
  const nextProduct = normalizeConfigProduct(
    {
      ...existing,
      ...updates,
    },
    productId,
  );

  config.products[index] = nextProduct;

  if (updates.bestSeller !== undefined) {
    const without = config.bestSellerProductIds.filter((id) => id !== productId);
    config.bestSellerProductIds = updates.bestSeller
      ? [...without, productId]
      : without;
  }

  if (updates.premium !== undefined) {
    const without = config.premiumProductIds.filter((id) => id !== productId);
    config.premiumProductIds = updates.premium
      ? [...without, productId]
      : without;
  }

  await writeStoreConfig(config);

  return {
    product: nextProduct,
    bestSellerProductIds: config.bestSellerProductIds,
    premiumProductIds: config.premiumProductIds,
  };
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
