export const PAYMENT_METHOD = {
  BITCOIN: "bitcoin",
  STRIPE: "stripe",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const STRIPE_PAYMENT_TYPE = {
  CARD: "card",
  KLARNA: "klarna",
  LINK: "link",
} as const;

export type StripePaymentType =
  (typeof STRIPE_PAYMENT_TYPE)[keyof typeof STRIPE_PAYMENT_TYPE];

export function formatPaymentMethodBadge(
  paymentMethod?: PaymentMethod,
  stripePaymentType?: StripePaymentType,
): string {
  if (paymentMethod === PAYMENT_METHOD.BITCOIN) {
    return "Bitcoin";
  }

  if (paymentMethod === PAYMENT_METHOD.STRIPE) {
    switch (stripePaymentType) {
      case STRIPE_PAYMENT_TYPE.KLARNA:
        return "Stripe - Klarna";
      case STRIPE_PAYMENT_TYPE.LINK:
        return "Stripe - Link";
      case STRIPE_PAYMENT_TYPE.CARD:
      default:
        return "Stripe - Card";
    }
  }

  return "Bitcoin";
}

export function getStripeDashboardSessionUrl(sessionId: string): string {
  const prefix = sessionId.startsWith("cs_test_")
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
  return `${prefix}/checkout/sessions/${sessionId}`;
}

export function normalizeStripePaymentType(
  value: string | null | undefined,
): StripePaymentType | undefined {
  if (value === STRIPE_PAYMENT_TYPE.KLARNA) return STRIPE_PAYMENT_TYPE.KLARNA;
  if (value === STRIPE_PAYMENT_TYPE.LINK) return STRIPE_PAYMENT_TYPE.LINK;
  if (value === STRIPE_PAYMENT_TYPE.CARD) return STRIPE_PAYMENT_TYPE.CARD;
  return undefined;
}
