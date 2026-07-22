import type { InfluencerPartner } from "@/lib/store-config";
import { findInfluencerByRef } from "@/lib/influencer-stats.server";
import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";
import {
  isRevenueCountedStatus,
  isWaitingForPackStatus,
  normalizeOrderStatus,
  ORDER_STATUS,
  type OrderStatus,
} from "@/lib/order-status";
import {
  PAYMENT_METHOD,
  type PaymentMethod,
  type StripePaymentType,
} from "@/lib/order-payment";

export {
  ORDER_STATUS,
  getFulfillmentBadgeLabel,
  isFulfillmentStatus,
  isRevenueCountedStatus,
  isWaitingForPackStatus,
  type OrderStatus,
} from "@/lib/order-status";

export type StoredOrderEmailSnapshot = {
  cartSummary: string;
  subtotal: number;
  shipping: number;
  discount: number;
  lines: Array<{
    label: string;
    quantity: number;
    lineSubtotal: number;
  }>;
};

export type StoredOrder = {
  id: string;
  total: number;
  placedAt: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  stripeSessionId?: string;
  stripePaymentType?: StripePaymentType;
  affiliateHandle?: string;
  commissionSek?: number;
  commissionPercent?: number;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
  /** Snapshot used to render confirmation email after payment. */
  emailSnapshot?: StoredOrderEmailSnapshot;
};

export function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let index = 0; index < 5; index += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SIMP-${suffix}`;
}

function normalizeOrder(order: StoredOrder): StoredOrder {
  return {
    ...order,
    status: normalizeOrderStatus(order.status),
  };
}

export type AffiliateAttribution = {
  handle: string;
  commissionPercent: number;
  commissionSek: number;
  influencerId: string;
};

export async function readOrders(): Promise<StoredOrder[]> {
  const parsed = await readKvData<StoredOrder[]>(KV_KEYS.ORDERS, "orders.json", []);
  return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
}

async function writeOrders(orders: StoredOrder[]): Promise<void> {
  await writeKvData(KV_KEYS.ORDERS, "orders.json", orders);
}

export async function appendOrder(
  order: Omit<StoredOrder, "status"> & { status?: OrderStatus },
): Promise<void> {
  const orders = await readOrders();
  const storedOrder: StoredOrder = {
    ...order,
    status: order.status ?? ORDER_STATUS.PENDING,
  };
  await writeOrders([...orders, storedOrder]);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  const updatedOrder: StoredOrder = {
    ...orders[index],
    status,
  };
  orders[index] = updatedOrder;
  await writeOrders(orders);
  return updatedOrder;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const orders = await readOrders();
  const nextOrders = orders.filter((order) => order.id !== orderId);
  if (nextOrders.length === orders.length) return false;
  await writeOrders(nextOrders);
  return true;
}

export async function findOrderById(
  orderId: string,
): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === orderId);
  return order ? normalizeOrder(order) : null;
}

export async function updateOrder(
  orderId: string,
  patch: Partial<
    Pick<
      StoredOrder,
      | "status"
      | "paymentMethod"
      | "stripeSessionId"
      | "stripePaymentType"
      | "customerName"
      | "customerEmail"
      | "shippingAddress"
    >
  >,
): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  const updatedOrder: StoredOrder = {
    ...orders[index],
    ...patch,
  };
  orders[index] = updatedOrder;
  await writeOrders(orders);
  return updatedOrder;
}

export async function approveOrder(orderId: string): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return null;
  if (order.status !== ORDER_STATUS.PENDING) return null;
  if (order.paymentMethod === PAYMENT_METHOD.STRIPE) return null;

  return updateOrderStatus(orderId, ORDER_STATUS.WAITING_PACK);
}

export async function revertOrderToPending(
  orderId: string,
): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return null;
  if (order.status === ORDER_STATUS.REFUNDED) return null;
  if (
    !isWaitingForPackStatus(order.status) &&
    order.status !== ORDER_STATUS.PACKED
  ) {
    return null;
  }

  return updateOrderStatus(orderId, ORDER_STATUS.PENDING);
}

export async function markOrderPacked(
  orderId: string,
): Promise<StoredOrder | null> {
  const order = await findOrderById(orderId);
  if (!order) return null;
  if (order.status === ORDER_STATUS.REFUNDED) return null;
  if (order.status === ORDER_STATUS.PENDING) return null;
  if (order.status === ORDER_STATUS.DELIVERED) return null;

  return updateOrderStatus(orderId, ORDER_STATUS.PACKED);
}

export async function markOrderDelivered(
  orderId: string,
): Promise<StoredOrder | null> {
  const order = await findOrderById(orderId);
  if (!order) return null;
  if (order.status === ORDER_STATUS.REFUNDED) return null;
  if (order.status === ORDER_STATUS.PENDING) return null;

  return updateOrderStatus(orderId, ORDER_STATUS.DELIVERED);
}

export async function markOrderWaitingPack(
  orderId: string,
): Promise<StoredOrder | null> {
  const order = await findOrderById(orderId);
  if (!order) return null;
  if (order.status === ORDER_STATUS.REFUNDED) return null;
  if (order.status === ORDER_STATUS.PENDING) return null;

  return updateOrderStatus(orderId, ORDER_STATUS.WAITING_PACK);
}

export async function refundOrder(orderId: string): Promise<StoredOrder | null> {
  const order = await findOrderById(orderId);
  if (!order) return null;
  if (
    !isWaitingForPackStatus(order.status) &&
    order.status !== ORDER_STATUS.PACKED
  ) {
    return null;
  }
  if (order.paymentMethod !== PAYMENT_METHOD.STRIPE) return null;

  return updateOrderStatus(orderId, ORDER_STATUS.REFUNDED);
}

export function calculateInfluencerCommission(
  basketSubtotal: number,
  commissionPercent: number,
): number {
  if (basketSubtotal <= 0 || commissionPercent <= 0) return 0;
  return Math.round(basketSubtotal * (commissionPercent / 100));
}

export function resolveAffiliateAttribution(
  ref: string | null | undefined,
  influencers: InfluencerPartner[],
  basketSubtotal: number,
): AffiliateAttribution | null {
  const influencer = ref ? findInfluencerByRef(influencers, ref) : undefined;
  if (!influencer || influencer.commissionPercent <= 0) return null;

  const commissionSek = calculateInfluencerCommission(
    basketSubtotal,
    influencer.commissionPercent,
  );

  return {
    handle: influencer.handle,
    commissionPercent: influencer.commissionPercent,
    commissionSek,
    influencerId: influencer.id,
  };
}

export async function getOrderAnalytics(): Promise<{
  totalRevenue: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  orderCount: number;
  ordersToday: number;
  ordersThisWeek: number;
}> {
  const orders = await readOrders();
  const approvedOrders = orders.filter((order) =>
    isRevenueCountedStatus(order.status),
  );

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let totalRevenue = 0;
  let revenueThisWeek = 0;
  let revenueThisMonth = 0;
  let revenueThisYear = 0;
  let ordersToday = 0;
  let ordersThisWeek = 0;

  for (const order of approvedOrders) {
    const total = Number.isFinite(order.total) ? order.total : 0;
    totalRevenue += total;

    const placedAt = new Date(order.placedAt);
    if (Number.isNaN(placedAt.getTime())) continue;

    if (placedAt >= startOfToday) ordersToday += 1;
    if (placedAt >= startOfWeek) {
      ordersThisWeek += 1;
      revenueThisWeek += total;
    }
    if (placedAt >= startOfMonth) revenueThisMonth += total;
    if (placedAt >= startOfYear) revenueThisYear += total;
  }

  return {
    totalRevenue,
    revenueThisWeek,
    revenueThisMonth,
    revenueThisYear,
    orderCount: approvedOrders.length,
    ordersToday,
    ordersThisWeek,
  };
}
