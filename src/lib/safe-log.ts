/** Avoid leaking stack traces, tokens, or env details in production logs. */
export function logServerError(scope: string, error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${scope}]`, error);
    return;
  }

  console.error(`[${scope}] request failed`);
}

export function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[redacted]";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}
