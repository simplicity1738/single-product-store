import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import {
  findOrderById,
  getOrderAnalytics,
  ORDER_STATUS,
  readOrders,
  refundOrder,
} from "@/lib/orders.server";
import { PAYMENT_METHOD } from "@/lib/order-payment";
import { isStripeConfigured } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe.server";
import { sanitizeOrderId } from "@/lib/sanitize";
import { appendSystemLog } from "@/lib/system-logs.server";
import { logServerError } from "@/lib/safe-log";
import { sendRefundProcessedNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { success: false, message: "Stripe är inte konfigurerat." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      orderId?: string;
      stripeSessionId?: string;
    };

    const orderId = body.orderId ? sanitizeOrderId(body.orderId) : "";
    const stripeSessionId = body.stripeSessionId?.trim() ?? "";

    let order = orderId ? await findOrderById(orderId) : null;

    if (!order && stripeSessionId) {
      const orders = await readOrders();
      order =
        orders.find((entry) => entry.stripeSessionId === stripeSessionId) ??
        null;
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Ordern hittades inte." },
        { status: 404 },
      );
    }

    if (order.paymentMethod !== PAYMENT_METHOD.STRIPE) {
      return NextResponse.json(
        {
          success: false,
          message: "Endast Stripe-betalningar kan återbetalas via denna funktion.",
        },
        { status: 400 },
      );
    }

    if (order.status === ORDER_STATUS.REFUNDED) {
      return NextResponse.json(
        { success: false, message: "Ordern är redan återbetald." },
        { status: 409 },
      );
    }

    if (order.status !== ORDER_STATUS.APPROVED) {
      return NextResponse.json(
        {
          success: false,
          message: "Endast godkända Stripe-order kan återbetalas.",
        },
        { status: 400 },
      );
    }

    const sessionId = order.stripeSessionId ?? stripeSessionId;
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe Session ID saknas för ordern.",
        },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Kunde inte hitta Payment Intent för Stripe-sessionen.",
        },
        { status: 400 },
      );
    }

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    const updatedOrder = await refundOrder(order.id);
    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe-återbetalningen lyckades men orderstatus kunde inte uppdateras.",
        },
        { status: 500 },
      );
    }

    await appendSystemLog(
      `Stripe-återbetalning genomförd för order ${order.id}.`,
      "checkout",
    );

    try {
      await sendRefundProcessedNotification(order.id, order.total);
    } catch (error) {
      logServerError("admin:refund:telegram", error);
    }

    const analytics = await getOrderAnalytics();

    return NextResponse.json({
      success: true,
      message: `Order ${order.id} markerad som ${ORDER_STATUS.REFUNDED}.`,
      order: updatedOrder,
      totalRevenue: analytics.totalRevenue,
      orderCount: analytics.orderCount,
    });
  } catch (error) {
    logServerError("admin:refund", error);
    return NextResponse.json(
      {
        success: false,
        message: "Kunde inte genomföra Stripe-återbetalningen.",
      },
      { status: 500 },
    );
  }
}
