export const ORDER_STATUS = {
  PENDING: "Väntar på betalning",
  APPROVED: "Godkänd",
  COMPLETED: "Slutförd",
  REFUNDED: "Återbetald",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export function normalizeOrderStatus(status: string | undefined): OrderStatus {
  if (
    status === ORDER_STATUS.PENDING ||
    status === ORDER_STATUS.APPROVED ||
    status === ORDER_STATUS.COMPLETED ||
    status === ORDER_STATUS.REFUNDED
  ) {
    return status;
  }

  return ORDER_STATUS.PENDING;
}

export function isApprovedOrderStatus(status: OrderStatus): boolean {
  return status === ORDER_STATUS.APPROVED;
}

export function isRevenueCountedStatus(status: OrderStatus): boolean {
  return isApprovedOrderStatus(status);
}
