export function isRemoteImageUrl(src: string): boolean {
  return /^https?:\/\//i.test(src.trim());
}
