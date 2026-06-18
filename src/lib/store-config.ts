import type { Locale } from "@/lib/i18n/translations";
import {
  getCampaignAddonLabel,
  resolveAddonByCartId,
} from "@/lib/campaign-addons";
import { DEFAULT_HERO_SITE_SETTINGS, type HeroFontFamily } from "@/lib/hero-settings";
import type { CampaignTheme } from "@/lib/campaign-theme";
import type { SiteNavigation } from "@/lib/site-navigation";
import { DEFAULT_SITE_NAVIGATION } from "@/lib/site-navigation";
import {
  getLocalizedProductDescription,
  getLocalizedProductName,
} from "@/lib/product-localization";
import {
  ADMIN_DEPOSIT_WALLETS,
  type PaymentNetwork,
} from "@/lib/payment-wallets";
import {
  DEFAULT_PRODUCT_STOCK_STATUS,
  type ProductStockStatus,
} from "@/lib/product-stock";
import {
  calculateSalePrice,
  type ProductSaleSettings,
} from "@/lib/product-sale";
import {
  PRODUCTS as FALLBACK_PRODUCTS,
  REVIEWS as FALLBACK_REVIEWS,
  CAMPAIGN_ADDON_PRODUCT_ID,
  type CartItem,
  type OrderLineItem,
  type Product,
  type ProductVariant,
} from "@/lib/product";

export const DEFAULT_SHIPPING_FEE = 49;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 1000;

export type ConfigProductVariant = {
  name: string;
  price: number;
};

export type ConfigProduct = {
  id: string;
  name_sv: string;
  name_en: string;
  description_sv: string;
  description_en: string;
  /** @deprecated Legacy alias synced from name_sv */
  title?: string;
  /** @deprecated Legacy alias synced from description_sv */
  description?: string;
  price: number;
  image: string;
  /** Buyer-selectable variants with per-option pricing. */
  variants?: ConfigProductVariant[];
  /** @deprecated Migrated to variants on read. */
  strengths?: string[];
  /** @deprecated Legacy single label — migrated to variants on read. */
  sizeLabel?: string;
  /** Optional included items shown as "Medföljer" on the storefront. */
  includedItems?: string;
  status: ProductStockStatus;
  isOnSale?: boolean;
  saleType?: "procent" | "fixed";
  saleValue?: number;
};

/** Parse admin input like "10 mg:550, 20 mg:850" into structured variants. */
export function parseVariantsInput(
  input: string,
  fallbackPrice = 0,
): ConfigProductVariant[] {
  return input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colonIndex = part.indexOf(":");
      if (colonIndex === -1) {
        const name = part.trim();
        return name
          ? { name, price: Math.max(0, Math.round(fallbackPrice)) }
          : null;
      }

      const name = part.slice(0, colonIndex).trim();
      const parsedPrice = Number(part.slice(colonIndex + 1).trim());
      const price = Number.isFinite(parsedPrice)
        ? Math.max(0, Math.round(parsedPrice))
        : Math.max(0, Math.round(fallbackPrice));

      return name ? { name, price } : null;
    })
    .filter((entry): entry is ConfigProductVariant => entry !== null);
}

/** Format structured variants for admin text input. */
export function formatVariantsInput(
  variants: ConfigProductVariant[] | undefined,
): string {
  return variants?.map((entry) => `${entry.name}:${entry.price}`).join(", ") ?? "";
}

/** Resolve variants from stored data or legacy strength/sizeLabel fields. */
export function resolveConfigVariants(entry: ConfigProduct): ConfigProductVariant[] {
  if (Array.isArray(entry.variants) && entry.variants.length > 0) {
    return entry.variants
      .map((variant) => ({
        name: String(variant.name ?? "").trim(),
        price: Number.isFinite(variant.price)
          ? Math.max(0, Math.round(Number(variant.price)))
          : Math.max(0, Math.round(entry.price)),
      }))
      .filter((variant) => variant.name);
  }

  if (Array.isArray(entry.strengths) && entry.strengths.length > 0) {
    return entry.strengths
      .map((name) => String(name).trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        price: Math.max(0, Math.round(entry.price)),
      }));
  }

  if (entry.sizeLabel?.trim()) {
    return parseVariantsInput(entry.sizeLabel, entry.price);
  }

  return [];
}

export function getVariantBasePrice(
  product: Pick<Product, "variants"> & { variantLabels?: string[] },
  variantMg: number,
  selectedStrength?: string,
): number {
  const labels = product.variantLabels ?? [];
  if (labels.length > 0 && selectedStrength?.trim()) {
    const index = labels.indexOf(selectedStrength.trim());
    if (index >= 0) {
      return product.variants[index]?.price ?? product.variants[0]?.price ?? 0;
    }
  }

  return (
    product.variants.find((variant) => variant.mg === variantMg)?.price ??
    product.variants[0]?.price ??
    0
  );
}

export function getVariantPrice(
  product: Pick<Product, "variants"> &
    ProductSaleSettings & { variantLabels?: string[] },
  variantMg: number,
  selectedStrength?: string,
): number {
  const basePrice = getVariantBasePrice(product, variantMg, selectedStrength);
  return calculateSalePrice(basePrice, product);
}

export type ConfigReview = {
  id: string;
  sv: { heading: string; quote: string; author: string };
  en: { heading: string; quote: string; author: string };
};

export type ConfigDiscountType = "percent" | "flat";

export type ConfigDiscount = {
  id: string;
  code: string;
  type: ConfigDiscountType;
  value: number;
  /** "all" for store-wide; otherwise a product id from inventory */
  productScope: "all" | string;
  /** 0 = unlimited uses */
  usageLimit: number;
  usageCount: number;
};

export type CryptoWallets = {
  tron: string;
  bsc: string;
  bitcoin: string;
  ethereum: string;
};

export type SystemIntegration = {
  telegramBotToken: string;
  telegramChatId: string;
};

export type BannerStyle =
  | "clean-minimalist"
  | "flash-sale-pulse"
  | "urgent-alert";

export type BannerTimeDisplayMode = "countdown" | "staticDate";

export type BannerConfig = {
  activeLines: string[];
  style: BannerStyle;
  countdownEnabled: boolean;
  /** ISO datetime target when countdown is enabled */
  countdownEndsAt: string;
  /** How end time is shown when countdown is enabled */
  timeDisplayMode: BannerTimeDisplayMode;
  /** Optional override for static end-date copy (e.g. "Söndag kl 23:59") */
  customDateString: string;
};

export type MarketingTracking = {
  googleAnalyticsId: string;
  tiktokPixelId: string;
};

export type InfluencerPartner = {
  id: string;
  handle: string;
  promoCode: string;
  /** Commission tier in percent (e.g. 15 = 15%). */
  commissionPercent: number;
};

export type CampaignAddon = {
  id: string;
  label: string;
  price: number;
};

export type ConfigFaq = {
  id: string;
  question: string;
  answer: string;
};

export type StoreConfig = {
  siteSettings: {
    logoPath: string;
    heroEyebrow: string;
    heroBadge: string;
    heroUseLogoImage: boolean;
    heroLogoPath: string;
    heroBrandText: string;
    heroBrandFontSize: string;
    heroBrandFontFamily: HeroFontFamily;
    heroTitle: string;
    heroTitleFontSize: string;
    heroTitleFontFamily: HeroFontFamily;
    heroTagline: string;
    heroTaglineFontSize: string;
    heroTaglineFontFamily: HeroFontFamily;
    heroSubtitle: string;
    heroDescriptionFontSize: string;
    heroDescriptionFontFamily: HeroFontFamily;
    campaignTag: string;
    campaignHeadline: string;
    campaignDiscountBadge: string;
    campaignFeaturedProductId: string;
    showAddons: boolean;
    campaignAddons: CampaignAddon[];
    campaignTickerText: string;
    campaignProgressPercent: number;
    campaignTheme: CampaignTheme;
  };
  /** Editable labels and visibility for storefront navigation and widgets. */
  siteNavigation: SiteNavigation;
  banner: BannerConfig;
  marketingTracking: MarketingTracking;
  influencers: InfluencerPartner[];
  shippingFee: number;
  freeShippingThreshold: number;
  telegramHandle: string;
  /** Store contact email shown on the storefront and used for customer communication. */
  contactEmail: string;
  cryptoWallets: CryptoWallets;
  systemIntegration: SystemIntegration;
  products: ConfigProduct[];
  reviews: ConfigReview[];
  discounts: ConfigDiscount[];
  /** Product IDs manually marked as bestsellers (Bästsäljare). */
  bestSellerProductIds: string[];
  /** Product IDs manually marked as premium. */
  premiumProductIds: string[];
  faqs: ConfigFaq[];
};

export const DEFAULT_REVIEWS: ConfigReview[] = FALLBACK_REVIEWS.map(
  (review) => ({
    id: review.id,
    sv: review.sv,
    en: review.en,
  }),
);

export const DEFAULT_BANNER: BannerConfig = {
  activeLines: [],
  style: "clean-minimalist",
  countdownEnabled: false,
  countdownEndsAt: "",
  timeDisplayMode: "countdown",
  customDateString: "",
};

type BannerConfigInput = Partial<BannerConfig> & {
  bannerTimeDisplayMode?: string;
  bannerCustomDateString?: string;
  campaignCountdownDate?: string;
};

export function normalizeBanner(
  entry: BannerConfigInput | undefined,
): BannerConfig {
  const style = entry?.style;
  const validStyle =
    style === "flash-sale-pulse" || style === "urgent-alert"
      ? style
      : "clean-minimalist";

  const rawDisplayMode =
    entry?.timeDisplayMode ?? entry?.bannerTimeDisplayMode;
  const timeDisplayMode =
    rawDisplayMode === "staticDate" ? "staticDate" : "countdown";

  const rawCustomDate =
    entry?.customDateString ?? entry?.bannerCustomDateString;

  const rawCountdownEndsAt =
    entry?.countdownEndsAt ?? entry?.campaignCountdownDate;

  return {
    activeLines: Array.isArray(entry?.activeLines)
      ? entry.activeLines.map((line) => String(line).trim()).filter(Boolean)
      : DEFAULT_BANNER.activeLines,
    style: validStyle,
    countdownEnabled: Boolean(entry?.countdownEnabled),
    countdownEndsAt:
      typeof rawCountdownEndsAt === "string" ? rawCountdownEndsAt : "",
    timeDisplayMode,
    customDateString:
      typeof rawCustomDate === "string" ? rawCustomDate.trim() : "",
  };
}

export const DEFAULT_MARKETING_TRACKING: MarketingTracking = {
  googleAnalyticsId: "",
  tiktokPixelId: "",
};

export const DEFAULT_INFLUENCERS: InfluencerPartner[] = [
  {
    id: "influencer-linn-beauty",
    handle: "@linn_beauty",
    promoCode: "",
    commissionPercent: 15,
  },
  {
    id: "influencer-melo-vibe",
    handle: "@melo_vibe",
    promoCode: "",
    commissionPercent: 10,
  },
];

export function normalizeInfluencerHandle(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function influencerHandleToRef(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  siteSettings: DEFAULT_HERO_SITE_SETTINGS,
  siteNavigation: DEFAULT_SITE_NAVIGATION,
  banner: DEFAULT_BANNER,
  marketingTracking: DEFAULT_MARKETING_TRACKING,
  influencers: DEFAULT_INFLUENCERS,
  shippingFee: DEFAULT_SHIPPING_FEE,
  freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
  telegramHandle: "@simplicity",
  contactEmail: "hello@simplicity.se",
  cryptoWallets: {
    tron: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    bsc: "0x0000000000000000000000000000000000000000",
    bitcoin: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ethereum: "0x0000000000000000000000000000000000000000",
  },
  systemIntegration: {
    telegramBotToken: "",
    telegramChatId: "",
  },
  products: [],
  reviews: DEFAULT_REVIEWS,
  discounts: [],
  bestSellerProductIds: [],
  premiumProductIds: [],
  faqs: [],
};

export function normalizeTelegramHandle(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function telegramHandleToUrl(handle: string): string {
  const username = handle.trim().replace(/^@/, "");
  if (!username) return "https://t.me/";
  return `https://t.me/${username}`;
}

export function normalizeDiscountCode(code: string): string {
  return code.trim().toUpperCase();
}

export function findStoreDiscount(
  config: StoreConfig,
  codeInput: string,
): ConfigDiscount | undefined {
  const normalized = normalizeDiscountCode(codeInput);
  if (!normalized) return undefined;
  return config.discounts.find(
    (entry) => normalizeDiscountCode(entry.code) === normalized,
  );
}

export type DiscountValidationReason =
  | "not_found"
  | "usage_exhausted"
  | "product_not_in_cart";

export type DiscountValidationResult =
  | { valid: true; discount: ConfigDiscount }
  | { valid: false; reason: DiscountValidationReason };

export function validateStoreDiscount(
  config: StoreConfig,
  codeInput: string,
  cart: CartItem[],
): DiscountValidationResult {
  const discount = findStoreDiscount(config, codeInput);
  if (!discount) {
    return { valid: false, reason: "not_found" };
  }

  if (
    discount.usageLimit > 0 &&
    discount.usageCount >= discount.usageLimit
  ) {
    return { valid: false, reason: "usage_exhausted" };
  }

  if (discount.productScope !== "all") {
    const hasProduct = cart.some(
      (item) => item.productId === discount.productScope,
    );
    if (!hasProduct) {
      return { valid: false, reason: "product_not_in_cart" };
    }
  }

  return { valid: true, discount };
}

export function calculateStoreDiscountAmount(
  discount: ConfigDiscount,
  lineItems: OrderLineItem[],
  shipping: number,
): number {
  const applicableSubtotal =
    discount.productScope === "all"
      ? lineItems.reduce((sum, item) => sum + item.lineSubtotal, 0)
      : lineItems
          .filter((item) => item.productId === discount.productScope)
          .reduce((sum, item) => sum + item.lineSubtotal, 0);

  if (applicableSubtotal <= 0) return 0;

  if (discount.type === "percent") {
    return Math.round(applicableSubtotal * (discount.value / 100));
  }

  if (discount.productScope === "all") {
    return Math.min(discount.value, applicableSubtotal + shipping);
  }

  return Math.min(discount.value, applicableSubtotal);
}

export function resolveProductBadge(
  config: StoreConfig,
  productId: string,
): Product["badge"] {
  if (config.premiumProductIds.includes(productId)) return "premium";
  if (config.bestSellerProductIds.includes(productId)) return "popular";
  return undefined;
}

function configProductSaleFields(entry: ConfigProduct): ProductSaleSettings {
  return {
    isOnSale: entry.isOnSale,
    saleType: entry.saleType,
    saleValue: entry.saleValue,
  };
}

function configProductToCatalogEntry(
  entry: ConfigProduct,
  config: StoreConfig,
): Product {
  const fallback = FALLBACK_PRODUCTS.find((product) => product.id === entry.id);
  const optionVariants = resolveConfigVariants(entry);
  const saleFields = configProductSaleFields(entry);

  if (optionVariants.length > 0) {
    return {
      id: entry.id as Product["id"],
      image: entry.image,
      badge: resolveProductBadge(config, entry.id),
      variants: optionVariants.map((variant, index) => ({
        mg: index,
        price: variant.price,
      })),
      variantLabels: optionVariants.map((variant) => variant.name),
      sizeLabel: optionVariants[0].name,
      status: entry.status ?? DEFAULT_PRODUCT_STOCK_STATUS,
      ...saleFields,
    };
  }

  const variants: ProductVariant[] = fallback?.variants ?? [
    { mg: 10, price: entry.price },
  ];
  const sizeLabel = entry.sizeLabel?.trim() || undefined;

  return {
    id: entry.id as Product["id"],
    image: entry.image,
    badge: resolveProductBadge(config, entry.id),
    sizeLabel,
    status: entry.status ?? DEFAULT_PRODUCT_STOCK_STATUS,
    variants: variants.map((variant) => ({
      ...variant,
      price: fallback ? variant.price : entry.price,
    })),
    ...saleFields,
  };
}

export function getCatalogProducts(config: StoreConfig): Product[] {
  if (config.products.length === 0) {
    return FALLBACK_PRODUCTS.map((product) => ({
      ...product,
      badge: resolveProductBadge(config, product.id),
      status: DEFAULT_PRODUCT_STOCK_STATUS,
    }));
  }

  return config.products.map((entry) =>
    configProductToCatalogEntry(entry, config),
  );
}

export function resolveCampaignFeaturedProduct(config: StoreConfig): Product | null {
  const catalog = getCatalogProducts(config);
  if (catalog.length === 0) return null;

  const selectedId = config.siteSettings.campaignFeaturedProductId.trim();
  if (selectedId) {
    return catalog.find((product) => product.id === selectedId) ?? catalog[0];
  }

  return catalog[0];
}

export function getConfigReviews(config: StoreConfig): ConfigReview[] {
  if (config.reviews.length === 0) {
    return DEFAULT_REVIEWS;
  }
  return config.reviews;
}

export function getProductTitle(
  config: StoreConfig,
  productId: string,
  locale: Locale = "sv",
): string {
  const entry = config.products.find((product) => product.id === productId);
  return getLocalizedProductName(entry, productId, locale);
}

export function getProductLineLabelFromConfig(
  config: StoreConfig,
  productId: string,
  variantMg: number,
  selectedStrength?: string,
  locale: Locale = "sv",
  campaignAddonId?: string,
): string {
  if (productId === CAMPAIGN_ADDON_PRODUCT_ID && campaignAddonId) {
    return getCampaignAddonLabel(config.siteSettings, campaignAddonId);
  }

  const title = getProductTitle(config, productId, locale);
  const entry = config.products.find((product) => product.id === productId);
  const variants = entry ? resolveConfigVariants(entry) : [];
  const trimmedStrength = selectedStrength?.trim();

  if (trimmedStrength) {
    return `${title} (${trimmedStrength})`;
  }
  if (variants.length === 1) {
    return `${title} (${variants[0].name})`;
  }
  return `${title} (${variantMg} mg)`;
}

export function getLowestCatalogPrice(config: StoreConfig): number {
  const catalog = getCatalogProducts(config);
  if (catalog.length === 0) {
    return Math.min(
      ...FALLBACK_PRODUCTS.flatMap((product) =>
        product.variants.map((variant) => variant.price),
      ),
    );
  }
  return Math.min(
    ...catalog.flatMap((product) =>
      product.variants.map((variant) => variant.price),
    ),
  );
}

export function getProductDescription(
  config: StoreConfig,
  productId: string,
  locale: Locale = "sv",
): string {
  const entry = config.products.find((product) => product.id === productId);
  return getLocalizedProductDescription(entry, productId, locale);
}

export function getProductIncludedItems(
  config: StoreConfig,
  productId: string,
): string {
  const entry = config.products.find((product) => product.id === productId);
  return entry?.includedItems?.trim() ?? "";
}

export function resolveNetworkWalletInput(
  config: StoreConfig,
  network: PaymentNetwork,
): string {
  const value = config.cryptoWallets[network]?.trim() ?? "";
  if (!value) return "";
  if (value === ADMIN_DEPOSIT_WALLETS[network].address) return "";
  return value;
}

export function isValidStoreCartItem(
  config: StoreConfig,
  item: CartItem,
): boolean {
  if (item.productId === CAMPAIGN_ADDON_PRODUCT_ID) {
    if (!item.campaignAddonId) return false;
    const addon = resolveAddonByCartId(config.siteSettings, item.campaignAddonId);
    if (!addon || !addon.label.trim()) return false;
    const expectedPrice = addon.price;
    if (
      item.unitPrice !== undefined &&
      Math.round(item.unitPrice) !== Math.round(expectedPrice)
    ) {
      return false;
    }
    if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return false;
    }
    return true;
  }

  const catalog = getCatalogProducts(config);
  const product = catalog.find((entry) => entry.id === item.productId);
  if (!product) return false;
  if (product.status !== "i_lager") return false;

  const labels = product.variantLabels ?? [];
  if (labels.length > 0) {
    const selected = item.selectedStrength?.trim() || labels[0];
    if (labels.length > 1) {
      if (!item.selectedStrength?.trim() || !labels.includes(item.selectedStrength.trim())) {
        return false;
      }
    }

    const variantIndex = labels.indexOf(selected);
    if (variantIndex < 0 || product.variants[variantIndex]?.mg !== item.variantMg) {
      return false;
    }

    const expectedPrice = getVariantPrice(product, item.variantMg, selected);
    if (
      item.unitPrice !== undefined &&
      Math.round(item.unitPrice) !== Math.round(expectedPrice)
    ) {
      return false;
    }
  } else if (!product.variants.some((variant) => variant.mg === item.variantMg)) {
    return false;
  }

  if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
    return false;
  }
  return true;
}

export function resolveShippingFee(config: StoreConfig): number {
  return Number.isFinite(config.shippingFee)
    ? Math.max(0, config.shippingFee)
    : DEFAULT_SHIPPING_FEE;
}

export function resolveFreeShippingThreshold(config: StoreConfig): number {
  return Number.isFinite(config.freeShippingThreshold)
    ? Math.max(0, config.freeShippingThreshold)
    : DEFAULT_FREE_SHIPPING_THRESHOLD;
}

export function calculateStoreShipping(
  config: StoreConfig,
  basketSubtotal: number,
): number {
  if (basketSubtotal <= 0) return 0;
  if (basketSubtotal >= resolveFreeShippingThreshold(config)) return 0;
  return resolveShippingFee(config);
}

export function calculateStoreOrderTotal(
  config: StoreConfig,
  cart: CartItem[],
  discountCodeInput?: string | null,
) {
  if (cart.length === 0) {
    return {
      subtotal: 0,
      shipping: 0,
      discount: 0,
      appliedDiscountCode: null,
      total: 0,
      totalQuantity: 0,
      lineItems: [] as OrderLineItem[],
      discountValidation: null,
    };
  }

  const catalog = getCatalogProducts(config);

  const lineItems: OrderLineItem[] = cart.map((item) => {
    if (item.productId === CAMPAIGN_ADDON_PRODUCT_ID && item.campaignAddonId) {
      const addon = resolveAddonByCartId(config.siteSettings, item.campaignAddonId);
      const unitPrice = addon?.price ?? 0;
      return {
        ...item,
        unitPrice,
        lineSubtotal: unitPrice * item.quantity,
      };
    }

    const product =
      catalog.find((entry) => entry.id === item.productId) ?? catalog[0];
    const unitPrice = getVariantPrice(
      product,
      item.variantMg,
      item.selectedStrength,
    );

    return {
      ...item,
      unitPrice,
      lineSubtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  const preliminaryShipping = calculateStoreShipping(config, subtotal);

  const validation = discountCodeInput
    ? validateStoreDiscount(config, discountCodeInput, cart)
    : null;

  const discountEntry =
    validation?.valid === true ? validation.discount : undefined;

  const discount = discountEntry
    ? calculateStoreDiscountAmount(discountEntry, lineItems, preliminaryShipping)
    : 0;

  const basketSubtotal = Math.max(0, subtotal - discount);
  const shipping = calculateStoreShipping(config, basketSubtotal);
  const appliedDiscountCode = discountEntry?.code ?? null;
  const total = Math.max(0, basketSubtotal + shipping);

  return {
    subtotal,
    shipping,
    discount,
    appliedDiscountCode,
    total,
    totalQuantity,
    lineItems,
    discountValidation: validation,
  };
}
