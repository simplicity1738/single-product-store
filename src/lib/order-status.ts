export const ORDER_STATUS = {
  PENDING: "Väntar på betalning",
  APPROVED: "Godkänd",
  WAITING_PACK: "Väntar på packning",
  PACKED: "Packad",
  DELIVERED: "Levererad",
  COMPLETED: "Slutförd",
  REFUNDED: "Återbetald",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export function normalizeOrderStatus(status: string | undefined): OrderStatus {
  if (
    status === ORDER_STATUS.PENDING ||
    status === ORDER_STATUS.APPROVED ||
    status === ORDER_STATUS.WAITING_PACK ||
    status === ORDER_STATUS.PACKED ||
    status === ORDER_STATUS.DELIVERED ||
    status === ORDER_STATUS.COMPLETED ||
    status === ORDER_STATUS.REFUNDED
  ) {
    return status;
  }

  return ORDER_STATUS.PENDING;
}

/** Paid orders that still need packing (legacy "Godkänd" / "Slutförd" included). */
export function isWaitingForPackStatus(status: OrderStatus): boolean {
  return (
    status === ORDER_STATUS.APPROVED ||
    status === ORDER_STATUS.WAITING_PACK ||
    status === ORDER_STATUS.COMPLETED
  );
}

export function isFulfillmentStatus(status: OrderStatus): boolean {
  return (
    isWaitingForPackStatus(status) ||
    status === ORDER_STATUS.PACKED ||
    status === ORDER_STATUS.DELIVERED
  );
}

/** Badge label for the owner's packing / shipping workflow. */
export function getFulfillmentBadgeLabel(status: OrderStatus): string {
  if (status === ORDER_STATUS.PACKED) return ORDER_STATUS.PACKED;
  if (status === ORDER_STATUS.DELIVERED) return ORDER_STATUS.DELIVERED;
  if (isWaitingForPackStatus(status)) return ORDER_STATUS.WAITING_PACK;
  return status;
}

export function isApprovedOrderStatus(status: OrderStatus): boolean {
  return status === ORDER_STATUS.APPROVED || status === ORDER_STATUS.WAITING_PACK;
}

export function isRevenueCountedStatus(status: OrderStatus): boolean {
  return (
    status === ORDER_STATUS.APPROVED ||
    status === ORDER_STATUS.WAITING_PACK ||
    status === ORDER_STATUS.PACKED ||
    status === ORDER_STATUS.DELIVERED ||
    status === ORDER_STATUS.COMPLETED
  );
}
