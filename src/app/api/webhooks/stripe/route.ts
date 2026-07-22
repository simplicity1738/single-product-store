import { NextResponse } from "next/server";
import Stripe from "stripe";
import { formatCurrency } from "@/lib/product";
import {
  findOrderById,
  isRevenueCountedStatus,
  ORDER_STATUS,
  updateOrder,
} from "@/lib/orders.server";
import {
  normalizeStripePaymentType,
  PAYMENT_METHOD,
} from "@/lib/order-payment";
import { appendSystemLog } from "@/lib/system-logs.server";
import { env, isStripeConfigured } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe.server";
import { sendStripeOrderPaidNotification } from "@/lib/telegram";
import { logServerError } from "@/lib/safe-log";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { readStoreConfig } from "@/lib/store-config.server";

export const runtime = "nodejs";

async function resolveStripePaymentType(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<ReturnType<typeof normalizeStripePaymentType>> {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) {
    return normalizeStripePaymentType(session.payment_method_types?.[0]);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["payment_method"],
    });
    const paymentMethod = paymentIntent.payment_method;
    if (paymentMethod && typeof paymentMethod !== "string") {
      return normalizeStripePaymentType(paymentMethod.type);
    }
  } catch (error) {
    logServerError("stripe-webhook:payment-intent", error);
  }

  return normalizeStripePaymentType(session.payment_method_types?.[0]);
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (error) {
    logServerError("stripe-webhook:signature", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId?.trim();

  if (!orderId) {
    await appendSystemLog(
      "Stripe webhook: checkout.session.completed utan orderId i metadata.",
      "checkout",
    );
    return NextResponse.json({ received: true });
  }

  const existingOrder = await findOrderById(orderId);
  if (!existingOrder) {
    await appendSystemLog(
      `Stripe webhook: order ${orderId} hittades inte.`,
      "checkout",
    );
    return NextResponse.json({ received: true });
  }

  if (isRevenueCountedStatus(existingOrder.status)) {
    return NextResponse.json({ received: true });
  }

  const stripePaymentType = await resolveStripePaymentType(stripe, session);
  const customerDetails = session.customer_details;
  const shippingAddress = customerDetails?.address;

  await updateOrder(orderId, {
    status: ORDER_STATUS.WAITING_PACK,
    paymentMethod: PAYMENT_METHOD.STRIPE,
    stripeSessionId: session.id,
    stripePaymentType,
    customerName:
      customerDetails?.name ??
      session.metadata?.customerName ??
      existingOrder.customerName,
    customerEmail:
      customerDetails?.email ??
      session.metadata?.customerEmail ??
      existingOrder.customerEmail,
    shippingAddress:
      [
        shippingAddress?.line1,
        shippingAddress?.postal_code,
        shippingAddress?.city,
        shippingAddress?.state,
      ]
        .filter(Boolean)
        .join(", ") ||
      session.metadata?.customerAddress ||
      existingOrder.shippingAddress,
  });

  const totalSek = formatCurrency(existingOrder.total, "sv-SE");
  const metadataAddress = session.metadata?.customerAddress ?? "—";

  try {
    const telegramResult = await sendStripeOrderPaidNotification({
      orderId,
      name: customerDetails?.name ?? session.metadata?.customerName ?? "—",
      email: customerDetails?.email ?? session.metadata?.customerEmail ?? "—",
      address: shippingAddress?.line1 ?? metadataAddress,
      city: shippingAddress?.city ?? "—",
      state: shippingAddress?.state ?? "—",
      zip: shippingAddress?.postal_code ?? "—",
      cartSummary: session.metadata?.cartSummary ?? "—",
      totalSek,
      stripeSessionId: session.id,
      stripePaymentType,
      affiliateHandle: existingOrder.affiliateHandle,
      commissionSek: existingOrder.commissionSek,
      commissionPercent: existingOrder.commissionPercent,
    });

    if (!telegramResult.ok) {
      await appendSystemLog(
        `Telegram-notis misslyckades för betald Stripe-order ${orderId}.`,
        "telegram",
      );
    }
  } catch {
    await appendSystemLog(
      `Telegram-notis kraschade för betald Stripe-order ${orderId}.`,
      "telegram",
    );
  }

  const customerEmail =
    customerDetails?.email ??
    session.metadata?.customerEmail ??
    existingOrder.customerEmail ??
    "";
  const customerName =
    customerDetails?.name ??
    session.metadata?.customerName ??
    existingOrder.customerName ??
    "Kund";

  if (customerEmail) {
    try {
      const storeConfig = await readStoreConfig();
      const snapshot = existingOrder.emailSnapshot;
      await sendOrderConfirmationEmail({
        orderId,
        customerEmail,
        customerName,
        lines: snapshot?.lines ?? [],
        subtotal: snapshot?.subtotal ?? existingOrder.total,
        shipping: snapshot?.shipping ?? 0,
        discount: snapshot?.discount ?? 0,
        total: existingOrder.total,
        cartSummary:
          snapshot?.cartSummary || session.metadata?.cartSummary || "",
        templates: storeConfig.orderEmail,
      });
    } catch (error) {
      console.error("Order email failed:", error);
      await appendSystemLog(
        `Orderbekräftelse via e-post misslyckades för betald Stripe-order ${orderId}.`,
        "email",
      );
    }
  }

  await appendSystemLog(
    `Stripe-betalning bekräftad för order ${orderId}.`,
    "checkout",
  );

  return NextResponse.json({ received: true });
}
