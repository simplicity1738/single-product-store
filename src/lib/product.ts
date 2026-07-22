import type { ProductStockStatus } from "@/lib/product-stock";
import { CAMPAIGN_ADDON_PRODUCT_ID, getCampaignAddonPriceWithDefaults, isKnownCampaignAddonId } from "@/lib/campaign-addons";
import { DEFAULT_HERO_SITE_SETTINGS } from "@/lib/hero-settings";
import {
  PRESENTATION_BUNDLE_PRODUCT_ID,
  DEFAULT_PRESENTATION_BUNDLE,
} from "@/lib/presentation-bundle";

export { CAMPAIGN_ADDON_PRODUCT_ID, PRESENTATION_BUNDLE_PRODUCT_ID };
export type { ProductSaleType, ProductSaleSettings } from "@/lib/product-sale";

/** SimpliCity sells one-time purchases only — no subscriptions or recurring billing. */
export const PURCHASE_MODEL = "one-time" as const;

export const CURRENCY = "SEK" as const;

export const SHIPPING_FLAT = 49;
export const FREE_SHIPPING_THRESHOLD = 2;

export type ProductId =
  | "melo-spray"
  | "melanotan-vial"
  | "retatrutide"
  | "tirzepatide";

export type ProductVariant = {
  mg: number;
  price: number;
};

export type Product = {
  id: ProductId;
  image: string;
  variants: ProductVariant[];
  badge?: "popular" | "premium";
  /** Admin-defined strength/spec label (e.g. "10 mg", "5 ml", "Kit"). Hidden when blank or "0". */
  sizeLabel?: string;
  /** Parallel labels for indexed variants from admin (e.g. ["10 mg", "20 mg"]). */
  variantLabels?: string[];
  status: ProductStockStatus;
  isOnSale?: boolean;
  saleType?: "procent" | "fixed";
  saleValue?: number;
};

/** Returns true when a custom size/strength label should appear on product cards. */
export function shouldShowSizeLabel(sizeLabel?: string): boolean {
  if (!sizeLabel) return false;
  const trimmed = sizeLabel.trim();
  if (!trimmed) return false;
  const normalized = trimmed.toLowerCase();
  return normalized !== "0" && normalized !== "0 mg";
}

export type CartItem = {
  productId:
    | ProductId
    | typeof CAMPAIGN_ADDON_PRODUCT_ID
    | typeof PRESENTATION_BUNDLE_PRODUCT_ID;
  variantMg: number;
  quantity: number;
  /** Selected variant label when product has named options. */
  selectedStrength?: string;
  /** Price captured for the selected variant at add-to-cart time. */
  unitPrice?: number;
  /** Campaign cross-sell add-on from the hero showcase. */
  campaignAddonId?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "melo-spray",
    image: "/melo-spray.png",
    status: "i_lager",
    variants: [{ mg: 10, price: 550 }],
  },
  {
    id: "melanotan-vial",
    image: "/melanotan-vial.png",
    status: "i_lager",
    variants: [{ mg: 10, price: 550 }],
  },
  {
    id: "retatrutide",
    image: "/retatrutide.png",
    status: "i_lager",
    variants: [
      { mg: 10, price: 1800 },
      { mg: 20, price: 2400 },
      { mg: 30, price: 2700 },
    ],
  },
  {
    id: "tirzepatide",
    image: "/tirzepatide.png",
    status: "i_lager",
    variants: [
      { mg: 5, price: 900 },
      { mg: 10, price: 1600 },
      { mg: 15, price: 2200 },
      { mg: 30, price: 2500 },
    ],
  },
];

export const DEFAULT_PRODUCT_ID: ProductId = "tirzepatide";

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function getDefaultVariantMg(productId: ProductId): number {
  const product = getProduct(productId);
  return product?.variants[0]?.mg ?? 0;
}

export function getProductVariant(
  productId: ProductId,
  mg: number,
): ProductVariant | undefined {
  const product = getProduct(productId);
  return product?.variants.find((variant) => variant.mg === mg);
}

export function isValidVariant(productId: string, mg: number): boolean {
  return getProductVariant(productId as ProductId, mg) !== undefined;
}

export function getCartItemKey(
  productId: CartItem["productId"],
  variantMg: number,
  selectedStrength?: string,
  campaignAddonId?: string,
): string {
  if (productId === PRESENTATION_BUNDLE_PRODUCT_ID) {
    return PRESENTATION_BUNDLE_PRODUCT_ID;
  }
  if (productId === CAMPAIGN_ADDON_PRODUCT_ID && campaignAddonId) {
    return `${productId}:${campaignAddonId}`;
  }
  const strengthPart = selectedStrength?.trim()
    ? `:${selectedStrength.trim()}`
    : "";
  return `${productId}:${variantMg}${strengthPart}`;
}

export function getLowestPrice(): number {
  return Math.min(
    ...PRODUCTS.flatMap((product) => product.variants.map((variant) => variant.price)),
  );
}

export function formatCurrency(amount: number, locale = "sv-SE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMgLabel(mg: number): string {
  return `${mg} mg`;
}

export type OrderLineItem = CartItem & {
  unitPrice: number;
  lineSubtotal: number;
};

export function calculateOrderTotal(
  cart: CartItem[],
  discountCodeInput?: string | null,
) {
  const lineItems: OrderLineItem[] = cart.map((item) => {
    if (item.productId === PRESENTATION_BUNDLE_PRODUCT_ID) {
      const unitPrice =
        item.unitPrice ?? DEFAULT_PRESENTATION_BUNDLE.price;
      return {
        ...item,
        unitPrice,
        lineSubtotal: unitPrice * item.quantity,
      };
    }

    if (item.productId === CAMPAIGN_ADDON_PRODUCT_ID && item.campaignAddonId) {
      const unitPrice = getCampaignAddonPriceWithDefaults(item.campaignAddonId);
      return {
        ...item,
        unitPrice,
        lineSubtotal: unitPrice * item.quantity,
      };
    }

    const variant =
      getProductVariant(item.productId as ProductId, item.variantMg) ??
      getProduct(item.productId as ProductId)!.variants[0];
    const unitPrice = variant.price;

    return {
      ...item,
      unitPrice,
      lineSubtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping =
    totalQuantity >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

  const discountEntry = discountCodeInput
    ? findDiscountCode(discountCodeInput)
    : undefined;
  const discount = discountEntry
    ? calculateDiscountAmount(subtotal, shipping, discountEntry)
    : 0;
  const appliedDiscountCode = discountEntry?.code ?? null;
  const total = Math.max(0, subtotal + shipping - discount);

  return {
    subtotal,
    shipping,
    discount,
    appliedDiscountCode,
    total,
    totalQuantity,
    lineItems,
  };
}

export function isValidCartItem(item: CartItem): boolean {
  if (item.productId === PRESENTATION_BUNDLE_PRODUCT_ID) {
    if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return false;
    }
    return true;
  }

  if (item.productId === CAMPAIGN_ADDON_PRODUCT_ID) {
    if (
      !item.campaignAddonId ||
      !isKnownCampaignAddonId(DEFAULT_HERO_SITE_SETTINGS, item.campaignAddonId)
    ) {
      return false;
    }
    if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return false;
    }
    return true;
  }

  if (!getProduct(item.productId as ProductId)) return false;
  if (!isValidVariant(item.productId, item.variantMg)) return false;
  if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
    return false;
  }
  return true;
}

// ─── Customer reviews (edit copy here) ───────────────────────────────────────

export type LocalizedReview = {
  heading: string;
  quote: string;
  author: string;
};

export type Review = {
  id: string;
  sv: LocalizedReview;
  en: LocalizedReview;
};

export const REVIEWS: Review[] = [
  {
    id: "review-1",
    sv: {
      heading: "Snabb leverans och snygg paketering",
      quote:
        "Paketet kom fram snabbare än förväntat och var väldigt fint paketerat. Hela upplevelsen från beställning till leverans kändes professionell och genomtänkt.",
      author: "Anna S.",
    },
    en: {
      heading: "Fast delivery and beautiful packaging",
      quote:
        "The package arrived faster than expected and was beautifully packed. The whole experience from ordering to delivery felt professional and thoughtful.",
      author: "Anna S.",
    },
  },
  {
    id: "review-2",
    sv: {
      heading: "Enkel beställning och tydlig kommunikation",
      quote:
        "Jag uppskattade hur smidigt allt gick. Beställningen var enkel att lägga, och jag fick tydlig information hela vägen tills paketet var hos mig.",
      author: "Erik L.",
    },
    en: {
      heading: "Easy ordering and clear communication",
      quote:
        "I appreciated how smooth everything was. Placing the order was simple, and I received clear updates all the way until the package arrived.",
      author: "Erik L.",
    },
  },
  {
    id: "review-3",
    sv: {
      heading: "Hög kvalitet som märks direkt",
      quote:
        "Produkten kändes genomtänkt och väl hanterad från start till mål. Leveransen var snabb och helhetsintrycket matchade förväntningarna.",
      author: "Sara M.",
    },
    en: {
      heading: "High quality you notice right away",
      quote:
        "The product felt carefully handled from start to finish. Delivery was fast and the overall experience matched my expectations.",
      author: "Sara M.",
    },
  },
];

// ─── Discount codes ──────────────────────────────────────────────────────────

export type DiscountCodeType = "percent_subtotal" | "flat_total";

export type DiscountCode = {
  code: string;
  type: DiscountCodeType;
  /** Percentage (e.g. 10) or flat amount in SEK (e.g. 100). */
  value: number;
};

export const DISCOUNT_CODES: DiscountCode[] = [];

export function findDiscountCode(code: string): DiscountCode | undefined {
  const normalized = code.trim().toUpperCase();
  return DISCOUNT_CODES.find((entry) => entry.code === normalized);
}

export function calculateDiscountAmount(
  subtotal: number,
  shipping: number,
  discount: DiscountCode,
): number {
  if (discount.type === "percent_subtotal") {
    return Math.round(subtotal * (discount.value / 100));
  }

  return Math.min(discount.value, subtotal + shipping);
}
