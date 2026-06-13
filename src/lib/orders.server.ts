import type { InfluencerPartner } from "@/lib/store-config";
import { findInfluencerByRef } from "@/lib/influencer-stats.server";
import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";
import {
  isRevenueCountedStatus,
  normalizeOrderStatus,
  ORDER_STATUS,
  type OrderStatus,
} from "@/lib/order-status";

export { ORDER_STATUS, type OrderStatus } from "@/lib/order-status";

export type StoredOrder = {
  id: string;
  total: number;
  placedAt: string;
  status: OrderStatus;
  affiliateHandle?: string;
  commissionSek?: number;
  commissionPercent?: number;
};

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

export async function approveOrder(orderId: string): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return null;
  if (order.status !== ORDER_STATUS.PENDING) return null;

  return updateOrderStatus(orderId, ORDER_STATUS.APPROVED);
}

export async function revertOrderToPending(
  orderId: string,
): Promise<StoredOrder | null> {
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return null;
  if (
    order.status !== ORDER_STATUS.APPROVED &&
    order.status !== ORDER_STATUS.COMPLETED
  ) {
    return null;
  }

  return updateOrderStatus(orderId, ORDER_STATUS.PENDING);
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
  orderCount: number;
  ordersToday: number;
  ordersThisWeek: number;
}> {
  const orders = await readOrders();
  const totalRevenue = orders.reduce((sum, order) => {
    if (!isRevenueCountedStatus(order.status)) return sum;
    return sum + (Number.isFinite(order.total) ? order.total : 0);
  }, 0);

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  let ordersToday = 0;
  let ordersThisWeek = 0;

  for (const order of orders) {
    const placedAt = new Date(order.placedAt);
    if (Number.isNaN(placedAt.getTime())) continue;
    if (placedAt >= startOfToday) ordersToday += 1;
    if (placedAt >= startOfWeek) ordersThisWeek += 1;
  }

  return {
    totalRevenue,
    orderCount: orders.length,
    ordersToday,
    ordersThisWeek,
  };
}
