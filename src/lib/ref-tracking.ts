export const REF_COOKIE_NAME = "simplicity_ref";

export function normalizeRefHandle(ref: string): string {
  return ref.trim().replace(/^@/, "").toLowerCase();
}
