import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { formatCurrency } from "@/lib/product";
import { translations } from "@/lib/i18n/translations";
import { getPaymentWalletsFromConfig } from "@/lib/payment-wallets.server";
import { type OrderFormData } from "@/lib/order";
import {
  incrementDiscountUsage,
  readStoreConfig,
} from "@/lib/store-config.server";
import {
  getProductTitle,
  getProductLineLabelFromConfig,
  isValidStoreCartItem,
  calculateStoreOrderTotal,
  validateStoreDiscount,
  influencerHandleToRef,
} from "@/lib/store-config";
import { REF_COOKIE_NAME } from "@/lib/ref-tracking";
import { appendOrder, ORDER_STATUS, resolveAffiliateAttribution } from "@/lib/orders.server";
import { sendOrderNotification } from "@/lib/telegram";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { appendSystemLog } from "@/lib/system-logs.server";
import { CHECKOUT_FIELD_LIMITS, sanitizeEmail, sanitizePlainText } from "@/lib/sanitize";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logServerError } from "@/lib/safe-log";
import {
  findInfluencerByPromoCode,
  incrementInfluencerPurchase,
} from "@/lib/influencer-stats.server";

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let index = 0; index < 5; index += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SIMP-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`orders:${clientIp}`, 12, 60 * 60 * 1000);
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
    const paymentNetwork = body.paymentNetwork;
    const cryptoTotal = body.cryptoTotal
      ? sanitizePlainText(body.cryptoTotal, CHECKOUT_FIELD_LIMITS.cryptoTotal) ||
        "—"
      : "—";

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

        await appendSystemLog(
          `Ogiltig kupong "${discountCode}": ${validation.reason}`,
          "checkout",
        );

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

    await new Promise((resolve) => setTimeout(resolve, 900));

    const { subtotal, shipping, discount, total, lineItems } =
      calculateStoreOrderTotal(storeConfig, items, discountCode);

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

    const paymentWallets = await getPaymentWalletsFromConfig();
    const localeCode = locale === "en" ? "en-US" : "sv-SE";
    const totalSek = formatCurrency(total, localeCode);

    const cartSummary = lineItems
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
      .join(", ");

    const orderId = generateOrderId();

    await appendOrder({
      id: orderId,
      total,
      placedAt: new Date().toISOString(),
      status: ORDER_STATUS.PENDING,
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

    if (paymentNetwork && paymentWallets[paymentNetwork]) {
      const networkInfo = paymentWallets[paymentNetwork];

      try {
        const telegramResult = await sendOrderNotification({
          name,
          email,
          address,
          city,
          state,
          zip,
          cartSummary,
          totalSek,
          cryptoTotal,
          networkLabel: networkInfo.label,
          network: paymentNetwork,
          walletAddress: networkInfo.address,
          ...(affiliate
            ? {
                affiliateHandle: affiliate.handle,
                commissionSek: affiliate.commissionSek,
                commissionPercent: affiliate.commissionPercent,
              }
            : {}),
        });

        if (!telegramResult.ok) {
          await appendSystemLog(
            "Telegram-notis misslyckades — timeout eller nätverksfel.",
            "telegram",
          );
        }
      } catch {
        await appendSystemLog(
          "Telegram-notis kraschade — kontrollera bot-token och chat-ID.",
          "telegram",
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      subtotal,
      shipping,
      discount,
      total,
      placedAt: new Date().toISOString(),
      paymentWallets,
    });
  } catch (error) {
    logServerError("checkout", error);
    await appendSystemLog("Checkout-fel: oväntat serverfel.", "checkout");

    return NextResponse.json(
      {
        success: false,
        message: translations.sv.api.serverError,
      },
      { status: 500 },
    );
  }
}
