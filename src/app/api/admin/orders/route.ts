import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { sendOrderShippedEmail } from "@/lib/email";
import {
  approveOrder,
  deleteOrder,
  getOrderAnalytics,
  markOrderDelivered,
  markOrderPacked,
  markOrderWaitingPack,
  ORDER_STATUS,
  readOrders,
  revertOrderToPending,
} from "@/lib/orders.server";
import { sanitizeOrderId } from "@/lib/sanitize";
import { sendOrderDeletedNotification } from "@/lib/telegram";
import { logServerError } from "@/lib/safe-log";

type OrderAction =
  | "approve"
  | "revert"
  | "pack"
  | "ship"
  | "waiting_pack";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const orders = await readOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      orderId?: string;
      action?: OrderAction;
    };
    const orderId = body.orderId ? sanitizeOrderId(body.orderId) : "";
    const action = body.action;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order-ID saknas." },
        { status: 400 },
      );
    }

    if (
      action !== "approve" &&
      action !== "revert" &&
      action !== "pack" &&
      action !== "ship" &&
      action !== "waiting_pack"
    ) {
      return NextResponse.json(
        { success: false, message: "Ogiltig åtgärd." },
        { status: 400 },
      );
    }

    let updatedOrder = null;
    let message = "";

    switch (action) {
      case "approve":
        updatedOrder = await approveOrder(orderId);
        message = `Order ${orderId} markerad som ${ORDER_STATUS.WAITING_PACK}.`;
        break;
      case "revert":
        updatedOrder = await revertOrderToPending(orderId);
        message = `Order ${orderId} återställd till ${ORDER_STATUS.PENDING}.`;
        break;
      case "pack":
        updatedOrder = await markOrderPacked(orderId);
        message = `Order ${orderId} markerad som ${ORDER_STATUS.PACKED}.`;
        break;
      case "ship":
        updatedOrder = await markOrderDelivered(orderId);
        message = `Order ${orderId} markerad som ${ORDER_STATUS.DELIVERED}.`;
        break;
      case "waiting_pack":
        updatedOrder = await markOrderWaitingPack(orderId);
        message = `Order ${orderId} markerad som ${ORDER_STATUS.WAITING_PACK}.`;
        break;
    }

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            action === "revert"
              ? "Ordern kunde inte återställas. Kontrollera att den är godkänd, packad eller väntar på packning."
              : action === "approve"
                ? "Ordern kunde inte godkännas. Kontrollera att den finns och väntar på betalning."
                : "Ordern kunde inte uppdateras. Kontrollera att den är betald.",
        },
        { status: 404 },
      );
    }

    if (action === "ship" && updatedOrder.customerEmail) {
      try {
        await sendOrderShippedEmail({
          orderId: updatedOrder.id,
          customerEmail: updatedOrder.customerEmail,
          customerName: updatedOrder.customerName ?? "Kund",
        });
      } catch (error) {
        logServerError("admin:orders:shipped-email", error);
      }
    }

    const analytics = await getOrderAnalytics();

    return NextResponse.json({
      success: true,
      message,
      order: updatedOrder,
      totalRevenue: analytics.totalRevenue,
      orderCount: analytics.orderCount,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte uppdatera orderstatus." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as { orderId?: string };
    const orderId = body.orderId ? sanitizeOrderId(body.orderId) : "";

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order-ID saknas." },
        { status: 400 },
      );
    }

    const deleted = await deleteOrder(orderId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Ordern hittades inte." },
        { status: 404 },
      );
    }

    try {
      await sendOrderDeletedNotification(orderId);
    } catch (error) {
      logServerError("admin:orders:delete:telegram", error);
    }

    const analytics = await getOrderAnalytics();

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} borttagen.`,
      totalRevenue: analytics.totalRevenue,
      orderCount: analytics.orderCount,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte ta bort ordern." },
      { status: 500 },
    );
  }
}
