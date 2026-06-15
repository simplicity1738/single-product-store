import { NextResponse } from "next/server";
import {
  approveOrder,
  deleteOrder,
  getOrderAnalytics,
  ORDER_STATUS,
  readOrders,
  revertOrderToPending,
} from "@/lib/orders.server";

export async function GET() {
  const orders = await readOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      action?: "approve" | "revert";
    };
    const orderId = body.orderId?.trim();
    const action = body.action === "revert" ? "revert" : "approve";

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order-ID saknas." },
        { status: 400 },
      );
    }

    const updatedOrder =
      action === "revert"
        ? await revertOrderToPending(orderId)
        : await approveOrder(orderId);

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            action === "revert"
              ? "Ordern kunde inte återställas. Kontrollera att den är godkänd eller slutförd."
              : "Ordern kunde inte godkännas. Kontrollera att den finns och väntar på betalning.",
        },
        { status: 404 },
      );
    }

    const analytics = await getOrderAnalytics();

    return NextResponse.json({
      success: true,
      message:
        action === "revert"
          ? `Order ${orderId} återställd till ${ORDER_STATUS.PENDING}.`
          : `Order ${orderId} markerad som ${ORDER_STATUS.APPROVED}.`,
      order: updatedOrder,
      totalRevenue: analytics.totalRevenue,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte uppdatera orderstatus." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string };
    const orderId = body.orderId?.trim();

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
