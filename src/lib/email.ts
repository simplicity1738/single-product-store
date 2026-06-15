import nodemailer from "nodemailer";
import { env, isSmtpConfigured } from "@/lib/env";
import { escapeHtml } from "@/lib/sanitize";

const NEWSLETTER_SUBJECT = "SimpliCity — Nyheter";

function formatNewsletterHtml(message: string): string {
  const safeBody = escapeHtml(message).replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${NEWSLETTER_SUBJECT}</title>
  </head>
  <body style="margin:0;padding:0;background:#fff7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #fecdd3;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 20px;border-bottom:2px solid #fda4af;">
                <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#e11d48;">SimpliCity</p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#18181b;">Nyheter från butiken</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;font-size:16px;line-height:1.7;color:#3f3f46;">
                ${safeBody}
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;font-size:12px;line-height:1.6;color:#71717a;">
                Du får detta mail eftersom du prenumererar på nyhetsbrevet från SimpliCity.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendBroadcastEmail(
  to: string,
  subject: string,
  text: string,
): Promise<{ ok: boolean; mock: boolean }> {
  if (!isSmtpConfigured()) {
    console.info("[email:mock]", { to, subject, text });
    return { ok: true, mock: true };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: 587,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  await transporter.sendMail({
    from: env.smtpUser,
    to,
    subject,
    text,
    html: formatNewsletterHtml(text),
  });

  return { ok: true, mock: false };
}

export async function broadcastToSubscribers(
  message: string,
  emails: string[],
): Promise<{ sent: number; failed: number; mock: boolean }> {
  let sent = 0;
  let failed = 0;
  const mock = !isSmtpConfigured();

  for (const email of emails) {
    try {
      const result = await sendBroadcastEmail(email, NEWSLETTER_SUBJECT, message);
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      console.error("[email:error]", email, error);
      failed += 1;
    }
  }

  return { sent, failed, mock };
}

export type OrderConfirmationLine = {
  label: string;
  quantity: number;
  lineSubtotal: number;
};

export type OrderConfirmationPayload = {
  orderId: string;
  customerEmail: string;
  customerName: string;
  lines: OrderConfirmationLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

function formatSekAmount(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatOrderConfirmationHtml(payload: OrderConfirmationPayload): string {
  const lineRows = payload.lines
    .map(
      (line) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #fecdd3;color:#3f3f46;font-size:14px;">
            ${escapeHtml(line.label)} × ${line.quantity}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #fecdd3;color:#18181b;font-size:14px;text-align:right;font-weight:600;">
            ${escapeHtml(formatSekAmount(line.lineSubtotal))}
          </td>
        </tr>`,
    )
    .join("");

  const discountRow =
    payload.discount > 0
      ? `<tr>
          <td style="padding:8px 0;color:#059669;font-size:14px;">Rabatt</td>
          <td style="padding:8px 0;color:#059669;font-size:14px;text-align:right;font-weight:600;">
            ${escapeHtml(formatSekAmount(-payload.discount))}
          </td>
        </tr>`
      : "";

  const shippingLabel =
    payload.shipping === 0 ? "Fri frakt" : formatSekAmount(payload.shipping);

  return `<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orderbekräftelse — SimpliCity</title>
  </head>
  <body style="margin:0;padding:0;background:#fff7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #fecdd3;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 20px;border-bottom:2px solid #fda4af;">
                <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#e11d48;">SimpliCity</p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#18181b;">Tack för din beställning!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;font-size:16px;line-height:1.7;color:#3f3f46;">
                <p style="margin:0 0 16px;">Hej ${escapeHtml(payload.customerName)},</p>
                <p style="margin:0 0 24px;">Vi har tagit emot din beställning. Spara ditt ordernummer för spårning:</p>
                <div style="margin:0 0 24px;padding:16px 20px;border-radius:14px;background:#fff1f2;border:1px solid #fecdd3;text-align:center;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e11d48;">Ordernummer</p>
                  <p style="margin:0;font-size:22px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#18181b;">${escapeHtml(payload.orderId)}</p>
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                  ${lineRows}
                  <tr>
                    <td style="padding:8px 0;color:#71717a;font-size:14px;">Delsumma</td>
                    <td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${escapeHtml(formatSekAmount(payload.subtotal))}</td>
                  </tr>
                  ${discountRow}
                  <tr>
                    <td style="padding:8px 0;color:#71717a;font-size:14px;">Frakt</td>
                    <td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${escapeHtml(shippingLabel)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#18181b;border-top:2px solid #fda4af;">Totalt</td>
                    <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#18181b;text-align:right;border-top:2px solid #fda4af;">${escapeHtml(formatSekAmount(payload.total))}</td>
                  </tr>
                </table>
                <p style="margin:0;font-size:14px;color:#71717a;">Vi återkommer när din betalning är bekräftad.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function formatOrderConfirmationText(payload: OrderConfirmationPayload): string {
  const lines = payload.lines
    .map(
      (line) =>
        `- ${line.label} × ${line.quantity}: ${formatSekAmount(line.lineSubtotal)}`,
    )
    .join("\n");

  return [
    `Hej ${payload.customerName},`,
    "",
    "Tack för din beställning hos SimpliCity!",
    "",
    `Ordernummer: ${payload.orderId}`,
    "",
    "Din beställning:",
    lines,
    "",
    `Delsumma: ${formatSekAmount(payload.subtotal)}`,
    payload.discount > 0 ? `Rabatt: ${formatSekAmount(-payload.discount)}` : null,
    `Frakt: ${payload.shipping === 0 ? "Fri frakt" : formatSekAmount(payload.shipping)}`,
    `Totalt: ${formatSekAmount(payload.total)}`,
    "",
    "Vi återkommer när din betalning är bekräftad.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export async function sendOrderConfirmationEmail(
  payload: OrderConfirmationPayload,
): Promise<{ ok: boolean; mock: boolean }> {
  const subject = `SimpliCity — Orderbekräftelse ${payload.orderId}`;
  const text = formatOrderConfirmationText(payload);

  if (!isSmtpConfigured()) {
    console.info("[email:order-confirmation:mock]", {
      to: payload.customerEmail,
      subject,
      text,
    });
    return { ok: true, mock: true };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: 587,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  await transporter.sendMail({
    from: env.smtpUser,
    to: payload.customerEmail,
    subject,
    text,
    html: formatOrderConfirmationHtml(payload),
  });

  return { ok: true, mock: false };
}
