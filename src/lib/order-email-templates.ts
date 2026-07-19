import {
  DEFAULT_ORDER_EMAIL_TEMPLATES,
  type OrderEmailTemplates,
} from "@/lib/store-config";

export type OrderEmailVariables = {
  orderId: string;
  customerName: string;
  total: string;
  subtotal?: string;
  shipping?: string;
  discount?: string;
  cartSummary?: string;
};

export function renderOrderEmailTemplate(
  template: string,
  variables: OrderEmailVariables,
): string {
  return template
    .replaceAll("{{orderId}}", variables.orderId)
    .replaceAll("{{customerName}}", variables.customerName)
    .replaceAll("{{total}}", variables.total)
    .replaceAll("{{subtotal}}", variables.subtotal ?? "")
    .replaceAll("{{shipping}}", variables.shipping ?? "")
    .replaceAll("{{discount}}", variables.discount ?? "")
    .replaceAll("{{cartSummary}}", variables.cartSummary ?? "");
}

export function resolveOrderEmailTemplates(
  templates?: Partial<OrderEmailTemplates>,
): OrderEmailTemplates {
  return {
    emailSubject:
      templates?.emailSubject?.trim() ||
      DEFAULT_ORDER_EMAIL_TEMPLATES.emailSubject,
    emailBody:
      templates?.emailBody?.trim() || DEFAULT_ORDER_EMAIL_TEMPLATES.emailBody,
  };
}
