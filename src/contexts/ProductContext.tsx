"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  getCartItemKey,
  type CartItem,
  type ProductId,
} from "@/lib/product";

type ProductContextValue = {
  cart: CartItem[];
  cardVariants: Record<string, number>;
  setCardVariantMg: (productId: string, mg: number) => void;
  getCardVariantMg: (productId: string) => number;
  addToCart: (productId: string, variantMg?: number) => void;
  updateCartQuantity: (
    productId: string,
    variantMg: number,
    quantity: number,
  ) => void;
  cartItemCount: number;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { catalogProducts } = useStoreConfig();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cardVariantOverrides, setCardVariantOverrides] = useState<
    Record<string, number>
  >({});

  const defaultCardVariants = useMemo(() => {
    const next: Record<string, number> = {};
    for (const product of catalogProducts) {
      next[product.id] = product.variants[0]?.mg ?? 0;
    }
    return next;
  }, [catalogProducts]);

  const cardVariants = useMemo(
    () => ({ ...defaultCardVariants, ...cardVariantOverrides }),
    [defaultCardVariants, cardVariantOverrides],
  );

  const setCardVariantMg = useCallback((productId: string, mg: number) => {
    setCardVariantOverrides((current) => ({ ...current, [productId]: mg }));
  }, []);

  const getCardVariantMg = useCallback(
    (productId: string) => cardVariants[productId] ?? 0,
    [cardVariants],
  );

  const addToCart = useCallback(
    (productId: string, variantMg?: number) => {
      const product = catalogProducts.find((entry) => entry.id === productId);
      const mg = variantMg ?? product?.variants[0]?.mg ?? 0;

      setCart((current) => {
        const key = getCartItemKey(productId as ProductId, mg);
        const existingIndex = current.findIndex(
          (item) =>
            getCartItemKey(item.productId, item.variantMg) === key,
        );

        if (existingIndex >= 0) {
          return current.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: Math.min(99, item.quantity + 1) }
              : item,
          );
        }

        return [
          ...current,
          { productId: productId as ProductId, variantMg: mg, quantity: 1 },
        ];
      });
    },
    [catalogProducts],
  );

  const updateCartQuantity = useCallback(
    (productId: string, variantMg: number, quantity: number) => {
      const key = getCartItemKey(productId as ProductId, variantMg);

      setCart((current) => {
        if (quantity <= 0) {
          return current.filter(
            (item) =>
              getCartItemKey(item.productId, item.variantMg) !== key,
          );
        }

        return current.map((item) =>
          getCartItemKey(item.productId, item.variantMg) === key
            ? { ...item, quantity: Math.min(99, quantity) }
            : item,
        );
      });
    },
    [],
  );

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      cardVariants,
      setCardVariantMg,
      getCardVariantMg,
      addToCart,
      updateCartQuantity,
      cartItemCount,
    }),
    [
      cart,
      cardVariants,
      setCardVariantMg,
      getCardVariantMg,
      addToCart,
      updateCartQuantity,
      cartItemCount,
    ],
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProductSelection() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductSelection must be used within ProductProvider");
  }
  return context;
}
