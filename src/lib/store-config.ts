import type { CartItem, Product, ProductVariant } from "@/lib/product";
import {
  DEFAULT_PRODUCT_STOCK_STATUS,
  type ProductStockStatus,
} from "@/lib/product-stock";
import {
  PRODUCTS as FALLBACK_PRODUCTS,
  REVIEWS as FALLBACK_REVIEWS,
  type OrderLineItem,
} from "@/lib/product";

export const DEFAULT_SHIPPING_FEE = 49;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 1000;

export type ConfigProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  /** Buyer-selectable strength/spec options (e.g. ["10 mg", "20 mg"]). */
  strengths?: string[];
  /** @deprecated Legacy single label — migrated to strengths on read. */
  sizeLabel?: string;
  status: ProductStockStatus;
};

/** Split comma-separated admin input into trimmed strength options. */
export function parseStrengthsInput(input: string): string[] {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/** Join strengths for admin text input display. */
export function formatStrengthsInput(
  strengths: string[] | undefined,
  sizeLabel?: string,
): string {
  if (strengths?.length) return strengths.join(", ");
  return sizeLabel?.trim() ?? "";
}

/** Resolve strengths from stored array or legacy sizeLabel field. */
export function resolveConfigStrengths(
  entry: Pick<ConfigProduct, "strengths" | "sizeLabel">,
): string[] {
  if (Array.isArray(entry.strengths) && entry.strengths.length > 0) {
    return entry.strengths.map((value) => String(value).trim()).filter(Boolean);
  }
  if (entry.sizeLabel?.trim()) {
    return parseStrengthsInput(entry.sizeLabel);
  }
  return [];
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

export type BannerConfig = {
  activeLines: string[];
  style: BannerStyle;
  countdownEnabled: boolean;
  /** ISO datetime target when countdown is enabled */
  countdownEndsAt: string;
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

export type ConfigFaq = {
  id: string;
  question: string;
  answer: string;
};

export type StoreConfig = {
  siteSettings: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    logoPath: string;
  };
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

export const DEFAULT_DISCOUNTS: ConfigDiscount[] = [
  {
    id: "discount-simpli10",
    code: "SIMPLI10",
    type: "percent",
    value: 10,
    productScope: "all",
    usageLimit: 0,
    usageCount: 0,
  },
  {
    id: "discount-rabatt100",
    code: "RABATT100",
    type: "flat",
    value: 100,
    productScope: "all",
    usageLimit: 0,
    usageCount: 0,
  },
];

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
};

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
  siteSettings: {
    heroBadge: "I lager · Premium kvalitet",
    heroTitle: "Skönhet i sin enklaste form",
    heroSubtitle:
      "Upptäck vår kuraterade kollektion av premium wellness-produkter — utformade för klarhet, lyster och självsäkerhet i vardagen.",
    logoPath: "/logo.png",
  },
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
  discounts: DEFAULT_DISCOUNTS,
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

function configProductToCatalogEntry(
  entry: ConfigProduct,
  config: StoreConfig,
): Product {
  const fallback = FALLBACK_PRODUCTS.find((product) => product.id === entry.id);
  const variants: ProductVariant[] = fallback?.variants ?? [
    { mg: 10, price: entry.price },
  ];

  const strengths = resolveConfigStrengths(entry);
  const sizeLabel = strengths[0] || entry.sizeLabel?.trim() || undefined;

  return {
    id: entry.id as Product["id"],
    image: entry.image,
    badge: resolveProductBadge(config, entry.id),
    strengths: strengths.length > 0 ? strengths : undefined,
    sizeLabel,
    status: entry.status ?? DEFAULT_PRODUCT_STOCK_STATUS,
    variants: variants.map((variant) => ({
      ...variant,
      price: fallback ? variant.price : entry.price,
    })),
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

export function getConfigReviews(config: StoreConfig): ConfigReview[] {
  if (config.reviews.length === 0) {
    return DEFAULT_REVIEWS;
  }
  return config.reviews;
}

export function getProductTitle(config: StoreConfig, productId: string): string {
  const entry = config.products.find((product) => product.id === productId);
  if (entry) return entry.title;
  return productId;
}

export function getProductLineLabelFromConfig(
  config: StoreConfig,
  productId: string,
  variantMg: number,
  selectedStrength?: string,
): string {
  const title = getProductTitle(config, productId);
  const entry = config.products.find((product) => product.id === productId);
  const strengths = entry ? resolveConfigStrengths(entry) : [];
  const trimmedStrength = selectedStrength?.trim();

  if (trimmedStrength) {
    return `${title} (${trimmedStrength})`;
  }
  if (strengths.length === 1) {
    return `${title} (${strengths[0]})`;
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
): string {
  const entry = config.products.find((product) => product.id === productId);
  return entry?.description ?? "";
}

export function isValidStoreCartItem(
  config: StoreConfig,
  item: CartItem,
): boolean {
  const catalog = getCatalogProducts(config);
  const product = catalog.find((entry) => entry.id === item.productId);
  if (!product) return false;
  if (product.status !== "i_lager") return false;
  if (!product.variants.some((variant) => variant.mg === item.variantMg)) {
    return false;
  }
  const strengths = product.strengths ?? [];
  if (strengths.length > 1) {
    const selected = item.selectedStrength?.trim();
    if (!selected || !strengths.includes(selected)) {
      return false;
    }
  } else if (
    item.selectedStrength?.trim() &&
    strengths.length === 1 &&
    item.selectedStrength.trim() !== strengths[0]
  ) {
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
    const product =
      catalog.find((entry) => entry.id === item.productId) ?? catalog[0];
    const variant =
      product.variants.find((entry) => entry.mg === item.variantMg) ??
      product.variants[0];
    const unitPrice = variant.price;

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
