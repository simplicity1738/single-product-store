import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { getOrderAnalytics } from "@/lib/orders.server";
import { readSubscribers, getSubscriberVelocity } from "@/lib/subscribers.server";
import { readSystemLogs } from "@/lib/system-logs.server";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const [
    { totalRevenue, orderCount, ordersToday, ordersThisWeek },
    subscribers,
    { signupsToday, signupsThisWeek },
    systemLogs,
  ] = await Promise.all([
    getOrderAnalytics(),
    readSubscribers(),
    getSubscriberVelocity(),
    readSystemLogs(),
  ]);

  return NextResponse.json({
    totalRevenue,
    orderCount,
    subscriberCount: subscribers.length,
    ordersToday,
    ordersThisWeek,
    signupsToday,
    signupsThisWeek,
    systemLogs,
  });
}
