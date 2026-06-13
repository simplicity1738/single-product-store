export const ORDER_STATUS = {
  PENDING: "Väntar på betalning",
  APPROVED: "Godkänd",
  COMPLETED: "Slutförd",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

const REVENUE_COUNTED_STATUSES = new Set<OrderStatus>([
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.COMPLETED,
]);

export function normalizeOrderStatus(status: string | undefined): OrderStatus {
  if (
    status === ORDER_STATUS.PENDING ||
    status === ORDER_STATUS.APPROVED ||
    status === ORDER_STATUS.COMPLETED
  ) {
    return status;
  }

  return ORDER_STATUS.PENDING;
}

export function isRevenueCountedStatus(status: OrderStatus): boolean {
  return REVENUE_COUNTED_STATUSES.has(status);
}
