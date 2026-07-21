"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import {
  CAMPAIGN_ADDON_PRODUCT_ID,
  getCampaignAddonPrice,
  isKnownCampaignAddonId,
} from "@/lib/campaign-addons";
import {
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart-storage";
import { getVariantPrice } from "@/lib/store-config";
import {
  getCartItemKey,
  type CartItem,
  type ProductId,
} from "@/lib/product";
import { isProductPurchasable } from "@/lib/product-stock";
import {
  getMaxOrderableQuantity,
  getVariantLabelForSelection,
  isVariantSoldOutByStock,
} from "@/lib/stock-management";

type ProductContextValue = {
  cart: CartItem[];
  cardVariants: Record<string, number>;
  setCardVariantMg: (productId: string, mg: number) => void;
  getCardVariantMg: (productId: string) => number;
  addToCart: (productId: string, variantMg?: number, selectedStrength?: string) => void;
  setCampaignAddonSelected: (addonId: string, selected: boolean) => void;
  isCampaignAddonSelected: (addonId: string) => boolean;
  updateCartQuantity: (
    productId: string,
    variantMg: number,
    quantity: number,
    selectedStrength?: string,
    campaignAddonId?: string,
  ) => void;
  cartItemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const ProductContext = createContext<ProductContextValue | null>(null);

function cartItemMatchesKey(
  item: CartItem,
  key: string,
): boolean {
  return (
    getCartItemKey(
      item.productId,
      item.variantMg,
      item.selectedStrength,
      item.campaignAddonId,
    ) === key
  );
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { catalogProducts, siteSettings, stockManagement } = useStoreConfig();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cardVariantOverrides, setCardVariantOverrides] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    setCart(loadCartFromStorage());
    setIsCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!isCartHydrated) return;
    saveCartToStorage(cart);
  }, [cart, isCartHydrated]);

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

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const addToCart = useCallback(
    (productId: string, variantMg?: number, selectedStrength?: string) => {
      const product = catalogProducts.find((entry) => entry.id === productId);
      if (!product || !isProductPurchasable(product.status)) return;

      const labels = product.variantLabels ?? [];
      const mg =
        variantMg ??
        (labels.length > 0
          ? (product.variants[0]?.mg ?? 0)
          : (product.variants[0]?.mg ?? 0));
      const strength =
        selectedStrength?.trim() ||
        (labels.length > 0 ? labels[mg] ?? labels[0] : undefined);
      const variantLabel = getVariantLabelForSelection(product, mg, strength);
      if (
        isVariantSoldOutByStock(stockManagement, productId, variantLabel)
      ) {
        return;
      }
      const maxQuantity = getMaxOrderableQuantity(
        stockManagement,
        productId,
        variantLabel,
      );
      if (maxQuantity <= 0) return;
      const unitPrice = getVariantPrice(product, mg, strength);

      setCart((current) => {
        const key = getCartItemKey(
          productId as ProductId,
          mg,
          strength,
        );
        const existingIndex = current.findIndex((item) =>
          cartItemMatchesKey(item, key),
        );

        if (existingIndex >= 0) {
          return current.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  quantity: Math.min(maxQuantity, item.quantity + 1),
                  unitPrice,
                }
              : item,
          );
        }

        return [
          ...current,
          {
            productId: productId as ProductId,
            variantMg: mg,
            quantity: 1,
            unitPrice,
            ...(strength ? { selectedStrength: strength } : {}),
          },
        ];
      });

      setIsCartOpen(true);
    },
    [catalogProducts, stockManagement],
  );

  const setCampaignAddonSelected = useCallback(
    (addonId: string, selected: boolean) => {
      if (!isKnownCampaignAddonId(siteSettings, addonId)) return;

      const unitPrice = getCampaignAddonPrice(siteSettings, addonId);

      const key = getCartItemKey(
        CAMPAIGN_ADDON_PRODUCT_ID,
        0,
        undefined,
        addonId,
      );

      setCart((current) => {
        const existingIndex = current.findIndex((item) =>
          cartItemMatchesKey(item, key),
        );

        if (selected) {
          if (existingIndex >= 0) return current;
          return [
            ...current,
            {
              productId: CAMPAIGN_ADDON_PRODUCT_ID,
              variantMg: 0,
              quantity: 1,
              unitPrice,
              campaignAddonId: addonId,
            },
          ];
        }

        if (existingIndex < 0) return current;
        return current.filter((item) => !cartItemMatchesKey(item, key));
      });
    },
    [siteSettings],
  );

  const isCampaignAddonSelected = useCallback(
    (addonId: string) =>
      cart.some(
        (item) =>
          item.productId === CAMPAIGN_ADDON_PRODUCT_ID &&
          item.campaignAddonId === addonId,
      ),
    [cart],
  );

  const updateCartQuantity = useCallback(
    (
      productId: string,
      variantMg: number,
      quantity: number,
      selectedStrength?: string,
      campaignAddonId?: string,
    ) => {
      const key = getCartItemKey(
        productId as CartItem["productId"],
        variantMg,
        selectedStrength,
        campaignAddonId,
      );

      setCart((current) => {
        if (quantity <= 0) {
          return current.filter((item) => !cartItemMatchesKey(item, key));
        }

        let maxQuantity = 99;
        if (productId !== CAMPAIGN_ADDON_PRODUCT_ID) {
          const product = catalogProducts.find(
            (entry) => entry.id === productId,
          );
          if (product) {
            const variantLabel = getVariantLabelForSelection(
              product,
              variantMg,
              selectedStrength,
            );
            maxQuantity = getMaxOrderableQuantity(
              stockManagement,
              productId,
              variantLabel,
            );
          }
        }

        const nextQuantity = Math.min(maxQuantity, quantity);
        if (nextQuantity <= 0) {
          return current.filter((item) => !cartItemMatchesKey(item, key));
        }

        return current.map((item) =>
          cartItemMatchesKey(item, key)
            ? { ...item, quantity: nextQuantity }
            : item,
        );
      });
    },
    [catalogProducts, stockManagement],
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
      setCampaignAddonSelected,
      isCampaignAddonSelected,
      updateCartQuantity,
      cartItemCount,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [
      cart,
      cardVariants,
      setCardVariantMg,
      getCardVariantMg,
      addToCart,
      setCampaignAddonSelected,
      isCampaignAddonSelected,
      updateCartQuantity,
      cartItemCount,
      isCartOpen,
      openCart,
      closeCart,
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
