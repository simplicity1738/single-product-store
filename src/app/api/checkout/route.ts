import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { formatCurrency } from "@/lib/product";
import { translations } from "@/lib/i18n/translations";
import { type OrderFormData } from "@/lib/order";
import {
  incrementDiscountUsage,
  readStoreConfig,
} from "@/lib/store-config.server";
import {
  getProductLineLabelFromConfig,
  isValidStoreCartItem,
  calculateStoreOrderTotal,
  validateStoreDiscount,
  influencerHandleToRef,
} from "@/lib/store-config";
import { REF_COOKIE_NAME } from "@/lib/ref-tracking";
import {
  appendOrder,
  generateOrderId,
  ORDER_STATUS,
  resolveAffiliateAttribution,
} from "@/lib/orders.server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { appendSystemLog } from "@/lib/system-logs.server";
import {
  CHECKOUT_FIELD_LIMITS,
  sanitizeEmail,
  sanitizePlainText,
} from "@/lib/sanitize";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logServerError } from "@/lib/safe-log";
import {
  findInfluencerByPromoCode,
  incrementInfluencerPurchase,
} from "@/lib/influencer-stats.server";
import { PAYMENT_METHOD } from "@/lib/order-payment";
import { isStripeConfigured } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe.server";

function getRequestOrigin(request: Request): string {
  const origin = request.headers.get("origin")?.trim();
  if (origin) return origin;

  const host = request.headers.get("host")?.trim();
  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

function sekToStripeAmount(value: number): number {
  return Math.round(value * 100);
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, message: "Stripe is not configured." },
        { status: 503 },
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`checkout:${clientIp}`, 12, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: translations.sv.api.serverError,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const body = (await request.json()) as Partial<OrderFormData>;
    const locale =
      request.headers.get("accept-language")?.startsWith("en") ? "en" : "sv";
    const messages = translations[locale].api;

    const items = body.items;
    const discountCode = body.discountCode
      ? sanitizePlainText(body.discountCode, CHECKOUT_FIELD_LIMITS.discountCode) ||
        null
      : null;
    const name = body.name
      ? sanitizePlainText(body.name, CHECKOUT_FIELD_LIMITS.name)
      : undefined;
    const email = body.email ? sanitizeEmail(body.email) : null;
    const address = body.address
      ? sanitizePlainText(body.address, CHECKOUT_FIELD_LIMITS.address)
      : undefined;
    const city = body.city
      ? sanitizePlainText(body.city, CHECKOUT_FIELD_LIMITS.city)
      : undefined;
    const state = body.state
      ? sanitizePlainText(body.state, CHECKOUT_FIELD_LIMITS.state)
      : undefined;
    const zip = body.zip
      ? sanitizePlainText(body.zip, CHECKOUT_FIELD_LIMITS.zip)
      : undefined;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: messages.emptyCart },
        { status: 400 },
      );
    }

    const storeConfig = await readStoreConfig();

    if (!items.every((item) => isValidStoreCartItem(storeConfig, item))) {
      return NextResponse.json(
        { success: false, message: messages.invalidCart },
        { status: 400 },
      );
    }

    if (discountCode) {
      const validation = validateStoreDiscount(storeConfig, discountCode, items);
      if (!validation.valid) {
        const message =
          validation.reason === "usage_exhausted"
            ? messages.discountExhausted
            : validation.reason === "product_not_in_cart"
              ? messages.discountProductMismatch
              : messages.invalidDiscount;

        return NextResponse.json(
          { success: false, message },
          { status: 400 },
        );
      }
    }

    if (!name || !email || !address || !city || !state || !zip) {
      return NextResponse.json(
        { success: false, message: messages.requiredFields },
        { status: 400 },
      );
    }

    const { subtotal, shipping, discount, total, lineItems } =
      calculateStoreOrderTotal(storeConfig, items, discountCode);

    if (total <= 0) {
      return NextResponse.json(
        { success: false, message: messages.invalidCart },
        { status: 400 },
      );
    }

    const basketSubtotal = Math.max(0, subtotal - discount);
    const cookieStore = await cookies();
    const refCookie =
      cookieStore.get(REF_COOKIE_NAME)?.value?.trim() || null;

    let affiliate = resolveAffiliateAttribution(
      refCookie,
      storeConfig.influencers,
      basketSubtotal,
    );

    if (discountCode) {
      await incrementDiscountUsage(discountCode);

      const influencer = findInfluencerByPromoCode(
        storeConfig.influencers,
        discountCode,
      );
      if (influencer) {
        await incrementInfluencerPurchase(influencer.id);

        if (!affiliate && influencer.commissionPercent > 0) {
          affiliate = resolveAffiliateAttribution(
            influencerHandleToRef(influencer.handle),
            storeConfig.influencers,
            basketSubtotal,
          );
        }
      }
    } else if (affiliate) {
      await incrementInfluencerPurchase(affiliate.influencerId);
    }

    const orderId = generateOrderId();
    const origin = getRequestOrigin(request);
    const localeCode = locale === "en" ? "en-US" : "sv-SE";

    const stripeLineItems = lineItems.map((line) => ({
      price_data: {
        currency: "sek",
        product_data: {
          name: getProductLineLabelFromConfig(
            storeConfig,
            line.productId,
            line.variantMg,
            line.selectedStrength,
            undefined,
            line.campaignAddonId,
          ),
        },
        unit_amount: sekToStripeAmount(line.unitPrice),
      },
      quantity: line.quantity,
    }));

    if (discount > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "sek",
          product_data: {
            name: "Rabatt",
          },
          unit_amount: -sekToStripeAmount(discount),
        },
        quantity: 1,
      });
    }

    if (shipping > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "sek",
          product_data: {
            name: "Frakt",
          },
          unit_amount: sekToStripeAmount(shipping),
        },
        quantity: 1,
      });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "sek",
      customer_email: email,
      payment_method_types: ["card", "klarna", "link"],
      line_items: stripeLineItems,
      shipping_address_collection: {
        allowed_countries: ["SE"],
      },
      metadata: {
        orderId,
        customerName: name,
        customerEmail: email,
        customerAddress: `${address}, ${zip} ${city}, ${state}, SE`.slice(0, 450),
        cartSummary: lineItems
          .map((line) => {
            const label = getProductLineLabelFromConfig(
              storeConfig,
              line.productId,
              line.variantMg,
              line.selectedStrength,
              undefined,
              line.campaignAddonId,
            );
            return `${label} × ${line.quantity}`;
          })
          .join(", ")
          .slice(0, 450),
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&paid=stripe`,
      cancel_url: `${origin}/#checkout-form`,
    });

    await appendOrder({
      id: orderId,
      total,
      placedAt: new Date().toISOString(),
      status: ORDER_STATUS.PENDING,
      paymentMethod: PAYMENT_METHOD.STRIPE,
      stripeSessionId: session.id,
      ...(affiliate
        ? {
            affiliateHandle: affiliate.handle,
            commissionSek: affiliate.commissionSek,
            commissionPercent: affiliate.commissionPercent,
          }
        : {}),
    });

    try {
      await sendOrderConfirmationEmail({
        orderId,
        customerEmail: email,
        customerName: name,
        lines: lineItems.map((line) => ({
          label: getProductLineLabelFromConfig(
            storeConfig,
            line.productId,
            line.variantMg,
            line.selectedStrength,
            undefined,
            line.campaignAddonId,
          ),
          quantity: line.quantity,
          lineSubtotal: line.lineSubtotal,
        })),
        subtotal,
        shipping,
        discount,
        total,
      });
    } catch {
      await appendSystemLog(
        `Orderbekräftelse via e-post misslyckades för ${orderId}.`,
        "email",
      );
    }

    if (!session.url) {
      return NextResponse.json(
        { success: false, message: messages.serverError },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      sessionId: session.id,
      checkoutUrl: session.url,
      subtotal,
      shipping,
      discount,
      total,
      placedAt: new Date().toISOString(),
      totalFormatted: formatCurrency(total, localeCode),
    });
  } catch (error) {
    logServerError("stripe-checkout", error);
    await appendSystemLog("Stripe checkout-fel: oväntat serverfel.", "checkout");

    return NextResponse.json(
      {
        success: false,
        message: translations.sv.api.serverError,
      },
      { status: 500 },
    );
  }
}
