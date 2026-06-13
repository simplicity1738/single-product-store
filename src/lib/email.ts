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
