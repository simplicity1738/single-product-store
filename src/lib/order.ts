import type { CartItem, ProductId } from "@/lib/product";
import {
  ADMIN_DEPOSIT_WALLETS,
  type PaymentNetwork,
  type PaymentToken,
} from "@/lib/payment-wallets";

export const ADMIN_CRYPTO_WALLETS = ADMIN_DEPOSIT_WALLETS;

export type CryptoPaymentMethod = keyof typeof ADMIN_CRYPTO_WALLETS;

export type PaymentWalletInfo =
  (typeof ADMIN_CRYPTO_WALLETS)[CryptoPaymentMethod];

export type OrderFormData = {
  items: CartItem[];
  discountCode?: string | null;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  paymentNetwork?: PaymentNetwork;
  paymentToken?: PaymentToken;
  cryptoTotal?: string;
};

export type OrderLineReceipt = CartItem & {
  productName: string;
  unitPrice: number;
  lineSubtotal: number;
};

export type OrderReceipt = Omit<OrderFormData, "items"> & {
  orderId: string;
  items: OrderLineReceipt[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  placedAt: string;
  paymentMethod?: "stripe" | "bitcoin";
  stripeSessionId?: string;
};

export const ORDER_STORAGE_KEY = "simplicity-store-order";
export const LANGUAGE_STORAGE_KEY = "simplicity-locale";

export type { ProductId, PaymentNetwork, PaymentToken };
