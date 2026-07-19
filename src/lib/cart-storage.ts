import type { CartItem } from "@/lib/product";

export const CART_STORAGE_KEY = "simplicity-cart";
export const AGE_VERIFIED_KEY = "age-verified";

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(cart: CartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore quota or privacy-mode errors.
  }
}

export function isAgeVerified(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AGE_VERIFIED_KEY) === "true";
}

export function setAgeVerified(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AGE_VERIFIED_KEY, "true");
}
