"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/lib/product";
import {
  calculateStoreOrderTotal,
  DEFAULT_BANNER,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_MARKETING_TRACKING,
  DEFAULT_SHIPPING_FEE,
  getCatalogProducts,
  normalizeBanner,
  getConfigReviews,
  getProductLineLabelFromConfig,
  getProductTitle,
  telegramHandleToUrl,
  validateStoreDiscount,
  type BannerConfig,
  type ConfigDiscount,
  type ConfigFaq,
  type ConfigProduct,
  type ConfigReview,
  type CryptoWallets,
  type DiscountValidationResult,
  type InfluencerPartner,
  type MarketingTracking,
  type StoreConfig,
} from "@/lib/store-config";
import {
  DEFAULT_HERO_SITE_SETTINGS,
  normalizeSiteSettings,
} from "@/lib/hero-settings";
import {
  DEFAULT_SITE_NAVIGATION,
  normalizeSiteNavigation,
  type SiteNavigation,
} from "@/lib/site-navigation";

type SiteSettings = StoreConfig["siteSettings"];

const DEFAULT_SETTINGS: SiteSettings = DEFAULT_HERO_SITE_SETTINGS;

type PublicStoreConfig = {
  siteSettings: SiteSettings;
  siteNavigation: SiteNavigation;
  banner: BannerConfig;
  marketingTracking: MarketingTracking;
  shippingFee: number;
  freeShippingThreshold: number;
  telegramHandle: string;
  contactEmail: string;
  cryptoWallets: CryptoWallets;
  products: ConfigProduct[];
  reviews: ConfigReview[];
  discounts: ConfigDiscount[];
  faqs: ConfigFaq[];
  bestSellerProductIds: string[];
  premiumProductIds: string[];
};

type StoreConfigContextValue = {
  siteSettings: SiteSettings;
  siteNavigation: SiteNavigation;
  banner: BannerConfig;
  marketingTracking: MarketingTracking;
  shippingFee: number;
  freeShippingThreshold: number;
  telegramHandle: string;
  telegramUrl: string;
  contactEmail: string;
  cryptoWallets: CryptoWallets;
  products: ConfigProduct[];
  reviews: ConfigReview[];
  discounts: ConfigDiscount[];
  faqs: ConfigFaq[];
  catalogProducts: Product[];
  storeConfig: StoreConfig;
  isLoading: boolean;
  refresh: () => Promise<void>;
  getLineLabel: (
    productId: string,
    variantMg: number,
    selectedStrength?: string,
    campaignAddonId?: string,
  ) => string;
  getDisplayName: (productId: string) => string;
  validateDiscount: (
    code: string,
    cart: Parameters<typeof validateStoreDiscount>[2],
  ) => DiscountValidationResult;
  calculateOrderTotal: (
    cart: Parameters<typeof calculateStoreOrderTotal>[1],
    discountCode?: string | null,
  ) => ReturnType<typeof calculateStoreOrderTotal>;
};

const StoreConfigContext = createContext<StoreConfigContextValue | null>(null);

export function StoreConfigProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [siteNavigation, setSiteNavigation] = useState<SiteNavigation>(
    DEFAULT_SITE_NAVIGATION,
  );
  const [banner, setBanner] = useState<BannerConfig>(DEFAULT_BANNER);
  const [marketingTracking, setMarketingTracking] =
    useState<MarketingTracking>(DEFAULT_MARKETING_TRACKING);
  const [telegramHandle, setTelegramHandle] = useState("@simplicity");
  const [contactEmail, setContactEmail] = useState("hello@simplicity.se");
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallets>({
    tron: "",
    bsc: "",
    bitcoin: "",
    ethereum: "",
  });
  const [products, setProducts] = useState<ConfigProduct[]>([]);
  const [reviews, setReviews] = useState<ConfigReview[]>([]);
  const [discounts, setDiscounts] = useState<ConfigDiscount[]>([]);
  const [faqs, setFaqs] = useState<ConfigFaq[]>([]);
  const [bestSellerProductIds, setBestSellerProductIds] = useState<string[]>([]);
  const [premiumProductIds, setPremiumProductIds] = useState<string[]>([]);
  const [shippingFee, setShippingFee] = useState(DEFAULT_SHIPPING_FEE);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    DEFAULT_FREE_SHIPPING_THRESHOLD,
  );
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/config", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as PublicStoreConfig;
      setSiteSettings(normalizeSiteSettings(data.siteSettings));
      setSiteNavigation(normalizeSiteNavigation(data.siteNavigation));
      setBanner(normalizeBanner(data.banner));
      setMarketingTracking({
        ...DEFAULT_MARKETING_TRACKING,
        ...data.marketingTracking,
      });
      setTelegramHandle(data.telegramHandle || "@simplicity");
      setContactEmail(data.contactEmail || "hello@simplicity.se");
      setCryptoWallets(
        data.cryptoWallets ?? {
          tron: "",
          bsc: "",
          bitcoin: "",
          ethereum: "",
        },
      );
      setProducts(Array.isArray(data.products) ? data.products : []);
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setDiscounts(Array.isArray(data.discounts) ? data.discounts : []);
      setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
      setBestSellerProductIds(
        Array.isArray(data.bestSellerProductIds)
          ? data.bestSellerProductIds
          : [],
      );
      setPremiumProductIds(
        Array.isArray(data.premiumProductIds) ? data.premiumProductIds : [],
      );
      setShippingFee(
        Number.isFinite(data.shippingFee)
          ? Math.max(0, data.shippingFee)
          : DEFAULT_SHIPPING_FEE,
      );
      setFreeShippingThreshold(
        Number.isFinite(data.freeShippingThreshold)
          ? Math.max(0, data.freeShippingThreshold)
          : DEFAULT_FREE_SHIPPING_THRESHOLD,
      );
    } catch {
      // Keep defaults when config is unavailable.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => refresh());
  }, [refresh]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh]);

  const storeConfig = useMemo<StoreConfig>(
    () => ({
      siteSettings,
      siteNavigation,
      banner,
      marketingTracking,
      influencers: [] as InfluencerPartner[],
      shippingFee,
      freeShippingThreshold,
      telegramHandle,
      contactEmail,
      cryptoWallets,
      systemIntegration: { telegramBotToken: "", telegramChatId: "" },
      products,
      reviews,
      discounts,
      bestSellerProductIds,
      premiumProductIds,
      faqs,
    }),
    [
      siteSettings,
      siteNavigation,
      banner,
      marketingTracking,
      shippingFee,
      freeShippingThreshold,
      telegramHandle,
      contactEmail,
      cryptoWallets,
      products,
      reviews,
      discounts,
      bestSellerProductIds,
      premiumProductIds,
      faqs,
    ],
  );

  const catalogProducts = useMemo(
    () => getCatalogProducts(storeConfig),
    [storeConfig],
  );

  const resolvedReviews = useMemo(
    () => getConfigReviews(storeConfig),
    [storeConfig],
  );

  const telegramUrl = useMemo(
    () => telegramHandleToUrl(telegramHandle),
    [telegramHandle],
  );

  const getLineLabel = useCallback(
    (
      productId: string,
      variantMg: number,
      selectedStrength?: string,
      campaignAddonId?: string,
    ) =>
      getProductLineLabelFromConfig(
        storeConfig,
        productId,
        variantMg,
        selectedStrength,
        locale,
        campaignAddonId,
      ),
    [storeConfig, locale],
  );

  const getDisplayName = useCallback(
    (productId: string) => getProductTitle(storeConfig, productId, locale),
    [storeConfig, locale],
  );

  const validateDiscount = useCallback(
    (code: string, cart: Parameters<typeof validateStoreDiscount>[2]) =>
      validateStoreDiscount(storeConfig, code, cart),
    [storeConfig],
  );

  const calculateOrderTotal = useCallback(
    (
      cart: Parameters<typeof calculateStoreOrderTotal>[1],
      discountCode?: string | null,
    ) => calculateStoreOrderTotal(storeConfig, cart, discountCode),
    [storeConfig],
  );

  const value = useMemo(
    () => ({
      siteSettings,
      siteNavigation,
      banner,
      marketingTracking,
      shippingFee,
      freeShippingThreshold,
      telegramHandle,
      telegramUrl,
      contactEmail,
      cryptoWallets,
      products,
      reviews: resolvedReviews,
      discounts,
      faqs,
      catalogProducts,
      storeConfig,
      isLoading,
      refresh,
      getLineLabel,
      getDisplayName,
      validateDiscount,
      calculateOrderTotal,
    }),
    [
      siteSettings,
      siteNavigation,
      banner,
      marketingTracking,
      shippingFee,
      freeShippingThreshold,
      telegramHandle,
      telegramUrl,
      contactEmail,
      cryptoWallets,
      products,
      resolvedReviews,
      discounts,
      faqs,
      catalogProducts,
      storeConfig,
      isLoading,
      refresh,
      getLineLabel,
      getDisplayName,
      validateDiscount,
      calculateOrderTotal,
    ],
  );

  return (
    <StoreConfigContext.Provider value={value}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  const context = useContext(StoreConfigContext);
  if (!context) {
    throw new Error("useStoreConfig must be used within StoreConfigProvider");
  }
  return context;
}
