import { NextResponse } from "next/server";
import { getOrderAnalytics } from "@/lib/orders.server";
import { readSubscribers, getSubscriberVelocity } from "@/lib/subscribers.server";
import { readSystemLogs } from "@/lib/system-logs.server";

export async function GET() {
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
