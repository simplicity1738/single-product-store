"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import type {
  BannerStyle,
  ConfigDiscount,
  ConfigFaq,
  ConfigProduct,
  InfluencerPartner,
  StoreConfig,
} from "@/lib/store-config";
import {
  ORDER_STATUS,
  type OrderStatus,
} from "@/lib/order-status";
import {
  formatVariantsInput,
  parseVariantsInput,
} from "@/lib/store-config";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";
import HeroSettingsForm from "@/components/admin/HeroSettingsForm";
import HeroCampaignForm from "@/components/admin/HeroCampaignForm";
import { normalizeSiteSettings } from "@/lib/hero-settings";
import {
  PRODUCT_STOCK_STATUS_OPTIONS,
  type ProductStockStatus,
} from "@/lib/product-stock";

type ProductDraft = {
  id: string;
  name_sv: string;
  name_en: string;
  description_sv: string;
  description_en: string;
  price: number;
  image: string;
  variantsInput: string;
  includedItems: string;
  status: ProductStockStatus;
};

type EditProductForm = Omit<ProductDraft, "id"> & {
  bestSeller: boolean;
  premium: boolean;
};

const emptyProduct = (): ProductDraft => ({
  id: "",
  name_sv: "",
  name_en: "",
  description_sv: "",
  description_en: "",
  price: 0,
  image: "/logo.png",
  variantsInput: "",
  includedItems: "",
  status: "i_lager",
});

type AdminOrder = {
  id: string;
  total: number;
  placedAt: string;
  status: OrderStatus;
  affiliateHandle?: string;
  commissionSek?: number;
  commissionPercent?: number;
};

const emptyDiscount = (): ConfigDiscount => ({
  id: "",
  code: "",
  type: "percent",
  value: 10,
  productScope: "all",
  usageLimit: 0,
  usageCount: 0,
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ToastState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const emptyFaq = (): ConfigFaq => ({
  id: "",
  question: "",
  answer: "",
});

const emptyInfluencer = (): InfluencerPartner => ({
  id: "",
  handle: "",
  promoCode: "",
  commissionPercent: 15,
});

type AnalyticsSummary = {
  totalRevenue: number;
  orderCount: number;
  subscriberCount: number;
  ordersToday: number;
  ordersThisWeek: number;
  signupsToday: number;
  signupsThisWeek: number;
};

type SystemLogEntry = {
  id: string;
  timestamp: string;
  message: string;
  source: string;
};

type InfluencerWithStats = InfluencerPartner & {
  visits: number;
  purchases: number;
};

type SubscriberEntry = {
  email: string;
  subscribedAt: string;
};

function formatSek(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSubscriberDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLogTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("sv-SE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatOrderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function orderStatusClassName(status: OrderStatus): string {
  switch (status) {
    case ORDER_STATUS.APPROVED:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case ORDER_STATUS.COMPLETED:
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

const BANNER_STYLE_OPTIONS: { value: BannerStyle; label: string }[] = [
  { value: "clean-minimalist", label: "Clean Minimalist" },
  { value: "flash-sale-pulse", label: "Flash Sale Pulse" },
  { value: "urgent-alert", label: "Urgent Alert" },
];

export default function AdminPage() {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [newProduct, setNewProduct] = useState<ProductDraft>(emptyProduct());
  const [newDiscount, setNewDiscount] = useState<ConfigDiscount>(emptyDiscount());
  const [toast, setToast] = useState<ToastState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalRevenue: 0,
    orderCount: 0,
    subscriberCount: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    signupsToday: 0,
    signupsThisWeek: 0,
  });
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);
  const [influencerStats, setInfluencerStats] = useState<InfluencerWithStats[]>(
    [],
  );
  const [newInfluencer, setNewInfluencer] = useState<InfluencerPartner>(
    emptyInfluencer(),
  );
  const [newBannerLine, setNewBannerLine] = useState("");
  const [subscribers, setSubscribers] = useState<SubscriberEntry[]>([]);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [newFaq, setNewFaq] = useState<ConfigFaq>(emptyFaq());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<EditProductForm | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (next?.type === "success") {
      window.setTimeout(() => setToast(null), 4000);
    }
  }, []);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/config");
      if (!response.ok) throw new Error("Failed to load");
      const data = (await response.json()) as StoreConfig;
      setConfig({
        ...data,
        siteSettings: normalizeSiteSettings(data.siteSettings),
      });
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte ladda konfigurationen.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const loadInfluencerStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/influencers");
      if (!response.ok) return;
      const data = (await response.json()) as {
        influencers: InfluencerWithStats[];
      };
      setInfluencerStats(
        Array.isArray(data.influencers) ? data.influencers : [],
      );
    } catch {
      // Influencer stats are optional — keep defaults on failure.
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) return;
      const data = (await response.json()) as AnalyticsSummary & {
        systemLogs?: SystemLogEntry[];
      };
      setAnalytics(data);
      setSystemLogs(Array.isArray(data.systemLogs) ? data.systemLogs : []);
    } catch {
      // Analytics are optional — keep defaults on failure.
    }
  }, []);

  const loadSubscribers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/subscribers");
      if (!response.ok) return;
      const data = (await response.json()) as { subscribers: SubscriberEntry[] };
      setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []);
    } catch {
      // Subscriber list is optional — keep defaults on failure.
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) return;
      const data = (await response.json()) as { orders: AdminOrder[] };
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      // Order list is optional — keep defaults on failure.
    }
  }, []);

  async function handleRemoveSubscriber(email: string) {
    setRemovingEmail(email);
    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Delete failed");
      }

      setSubscribers(
        Array.isArray(data.subscribers) ? data.subscribers : [],
      );
      setAnalytics((current) => ({
        ...current,
        subscriberCount: Array.isArray(data.subscribers)
          ? data.subscribers.length
          : current.subscriberCount,
      }));
      showToast({
        type: "success",
        message: data.message ?? "Prenumerant borttagen.",
      });
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte ta bort prenumeranten.",
      });
    } finally {
      setRemovingEmail(null);
    }
  }

  async function updateOrderStatus(
    orderId: string,
    action: "approve" | "revert",
  ) {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Status update failed");
      }

      const nextStatus =
        action === "approve" ? ORDER_STATUS.APPROVED : ORDER_STATUS.PENDING;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: nextStatus } : order,
        ),
      );
      if (typeof data.totalRevenue === "number") {
        setAnalytics((current) => ({
          ...current,
          totalRevenue: data.totalRevenue,
        }));
      } else {
        void loadAnalytics();
      }
      showToast({
        type: "success",
        message:
          data.message ??
          (action === "approve"
            ? "Order godkänd och markerad som betald."
            : "Godkännande hävt. Ordern väntar på betalning."),
      });
    } catch {
      showToast({
        type: "error",
        message:
          action === "approve"
            ? "Kunde inte godkänna ordern."
            : "Kunde inte återställa ordern.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleDeleteOrder(orderId: string) {
    setDeletingOrderId(orderId);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Delete failed");
      }

      setOrders((current) => current.filter((order) => order.id !== orderId));
      if (typeof data.totalRevenue === "number") {
        setAnalytics((current) => ({
          ...current,
          totalRevenue: data.totalRevenue,
          orderCount:
            typeof data.orderCount === "number"
              ? data.orderCount
              : current.orderCount - 1,
        }));
      } else {
        void loadAnalytics();
      }
      showToast({
        type: "success",
        message: data.message ?? "Order borttagen.",
      });
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte ta bort ordern.",
      });
    } finally {
      setDeletingOrderId(null);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadConfig();
      void loadAnalytics();
      void loadSubscribers();
      void loadInfluencerStats();
      void loadOrders();
    });
  }, [loadConfig, loadAnalytics, loadSubscribers, loadInfluencerStats, loadOrders]);

  async function handleSaveShipping() {
    if (!config) return;
    setIsSavingShipping(true);
    setToast(null);

    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save shipping settings");
      }

      showToast({
        type: "success",
        message: "Fraktinställningar sparade.",
      });
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte spara fraktinställningarna.",
      });
    } finally {
      setIsSavingShipping(false);
    }
  }

  async function handleSave() {
    if (!config) return;
    setIsSaving(true);
    setToast(null);

    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Save failed");
      }
      showToast({
        type: "success",
        message: data.message ?? "Ändringar sparade framgångsrikt!",
      });
      void loadInfluencerStats();
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte spara. Försök igen.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function updateBanner<K extends keyof StoreConfig["banner"]>(
    key: K,
    value: StoreConfig["banner"][K],
  ) {
    setConfig((current) =>
      current
        ? {
            ...current,
            banner: { ...current.banner, [key]: value },
          }
        : current,
    );
  }

  function updateMarketingTracking<
    K extends keyof StoreConfig["marketingTracking"],
  >(key: K, value: StoreConfig["marketingTracking"][K]) {
    setConfig((current) =>
      current
        ? {
            ...current,
            marketingTracking: {
              ...current.marketingTracking,
              [key]: value,
            },
          }
        : current,
    );
  }

  function addBannerLine() {
    const line = newBannerLine.trim();
    if (!line || !config) return;

    updateBanner("activeLines", [...config.banner.activeLines, line]);
    setNewBannerLine("");
  }

  function removeBannerLine(index: number) {
    if (!config) return;
    updateBanner(
      "activeLines",
      config.banner.activeLines.filter((_, i) => i !== index),
    );
  }

  function addInfluencer() {
    const handle = newInfluencer.handle.trim();
    const promoCode = newInfluencer.promoCode.trim();
    if (!handle) {
      showToast({
        type: "info",
        message: "Ange influencer-handle.",
      });
      return;
    }

    const entry: InfluencerPartner = {
      id: `influencer-${Date.now()}`,
      handle: handle.startsWith("@") ? handle : `@${handle}`,
      promoCode: promoCode.toUpperCase(),
      commissionPercent: Math.min(
        100,
        Math.max(0, Number(newInfluencer.commissionPercent) || 0),
      ),
    };

    setConfig((current) =>
      current
        ? { ...current, influencers: [...current.influencers, entry] }
        : current,
    );
    setNewInfluencer(emptyInfluencer());
    showToast({
      type: "info",
      message: "Influencer tillagd — spara för att publicera.",
    });
  }

  function removeInfluencer(id: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            influencers: current.influencers.filter(
              (entry) => entry.id !== id,
            ),
          }
        : current,
    );
  }

  function updateSiteSetting<K extends keyof StoreConfig["siteSettings"]>(
    key: K,
    value: StoreConfig["siteSettings"][K],
  ) {
    setConfig((current) =>
      current
        ? {
            ...current,
            siteSettings: { ...current.siteSettings, [key]: value },
          }
        : current,
    );
  }

  function updateShipping(
    key: "shippingFee" | "freeShippingThreshold",
    value: number,
  ) {
    setConfig((current) =>
      current
        ? {
            ...current,
            [key]: Number.isFinite(value) ? Math.max(0, value) : 0,
          }
        : current,
    );
  }

  function updateWallet(key: keyof StoreConfig["cryptoWallets"], value: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            cryptoWallets: { ...current.cryptoWallets, [key]: value },
          }
        : current,
    );
  }

  function updateSystemIntegration<
    K extends keyof StoreConfig["systemIntegration"],
  >(key: K, value: StoreConfig["systemIntegration"][K]) {
    setConfig((current) =>
      current
        ? {
            ...current,
            systemIntegration: {
              ...current.systemIntegration,
              [key]: value,
            },
          }
        : current,
    );
  }

  function openEditProduct(product: ConfigProduct) {
    if (!config) return;
    setEditingProductId(product.id);
    setEditProduct({
      name_sv: product.name_sv || product.title || "",
      name_en: product.name_en || "",
      description_sv: product.description_sv || product.description || "",
      description_en: product.description_en || "",
      price: product.price,
      image: product.image,
      variantsInput: formatVariantsInput(product.variants),
      includedItems: product.includedItems ?? "",
      bestSeller: config.bestSellerProductIds.includes(product.id),
      premium: config.premiumProductIds.includes(product.id),
      status: product.status ?? "i_lager",
    });
  }

  function closeEditProduct() {
    setEditingProductId(null);
    setEditProduct(null);
  }

  async function saveEditProduct() {
    if (!editProduct || !editingProductId) return;
    setIsSavingProduct(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProductId,
          name_sv: editProduct.name_sv,
          name_en: editProduct.name_en,
          description_sv: editProduct.description_sv,
          description_en: editProduct.description_en,
          price: editProduct.price,
          image: editProduct.image,
          variantsInput: editProduct.variantsInput,
          includedItems: editProduct.includedItems,
          bestSeller: editProduct.bestSeller,
          premium: editProduct.premium,
          status: editProduct.status,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Update failed");
      }

      setConfig((current) => {
        if (!current) return current;
        return {
          ...current,
          products: current.products.map((product) =>
            product.id === editingProductId ? data.product : product,
          ),
          bestSellerProductIds: Array.isArray(data.bestSellerProductIds)
            ? data.bestSellerProductIds
            : current.bestSellerProductIds,
          premiumProductIds: Array.isArray(data.premiumProductIds)
            ? data.premiumProductIds
            : current.premiumProductIds,
        };
      });

      closeEditProduct();
      showToast({
        type: "success",
        message: data.message ?? "Produkten uppdaterades.",
      });
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte spara produktändringarna.",
      });
    } finally {
      setIsSavingProduct(false);
    }
  }

  function removeProduct(id: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            products: current.products.filter((product) => product.id !== id),
            bestSellerProductIds: current.bestSellerProductIds.filter(
              (productId) => productId !== id,
            ),
            premiumProductIds: current.premiumProductIds.filter(
              (productId) => productId !== id,
            ),
          }
        : current,
    );
  }

  function toggleBestSeller(productId: string) {
    setConfig((current) => {
      if (!current) return current;
      const ids = current.bestSellerProductIds ?? [];
      const isSelected = ids.includes(productId);
      return {
        ...current,
        bestSellerProductIds: isSelected
          ? ids.filter((id) => id !== productId)
          : [...ids, productId],
      };
    });
  }

  function togglePremium(productId: string) {
    setConfig((current) => {
      if (!current) return current;
      const ids = current.premiumProductIds ?? [];
      const isSelected = ids.includes(productId);
      return {
        ...current,
        premiumProductIds: isSelected
          ? ids.filter((id) => id !== productId)
          : [...ids, productId],
      };
    });
  }

  function updateFaq(id: string, field: "question" | "answer", value: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            faqs: current.faqs.map((entry) =>
              entry.id === id ? { ...entry, [field]: value } : entry,
            ),
          }
        : current,
    );
  }

  function removeFaq(id: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            faqs: current.faqs.filter((entry) => entry.id !== id),
          }
        : current,
    );
  }

  function addFaq() {
    const question = newFaq.question.trim();
    const answer = newFaq.answer.trim();
    if (!question || !answer) {
      showToast({
        type: "info",
        message: "Ange både fråga och svar innan du lägger till.",
      });
      return;
    }

    const entry: ConfigFaq = {
      id: `faq-${Date.now()}`,
      question,
      answer,
    };

    setConfig((current) =>
      current ? { ...current, faqs: [...current.faqs, entry] } : current,
    );
    setNewFaq(emptyFaq());
    showToast({
      type: "info",
      message: "FAQ tillagd — spara för att publicera.",
    });
  }

  function addDiscount() {
    const code = newDiscount.code.trim();
    if (!code) {
      showToast({
        type: "info",
        message: "Ange ett kupongnamn innan du lägger till.",
      });
      return;
    }

    const entry: ConfigDiscount = {
      id: `discount-${Date.now()}`,
      code: code.toUpperCase(),
      type: newDiscount.type,
      value: Number(newDiscount.value) || 0,
      productScope: newDiscount.productScope || "all",
      usageLimit: Math.max(0, Number(newDiscount.usageLimit) || 0),
      usageCount: 0,
    };

    setConfig((current) =>
      current
        ? { ...current, discounts: [...current.discounts, entry] }
        : current,
    );
    setNewDiscount(emptyDiscount());
    showToast({
      type: "info",
      message: "Rabattkod tillagd — spara för att publicera.",
    });
  }

  function removeDiscount(id: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            discounts: current.discounts.filter(
              (discount) => discount.id !== id,
            ),
          }
        : current,
    );
  }

  function addProduct() {
    const name_sv = newProduct.name_sv.trim();
    if (!name_sv) {
      showToast({
        type: "info",
        message: "Ange ett produktnamn (SV) innan du lägger till.",
      });
      return;
    }

    const id = slugify(name_sv) || `product-${Date.now()}`;
    const variants = parseVariantsInput(
      newProduct.variantsInput ?? "",
      Number(newProduct.price) || 0,
    );
    const entry: ConfigProduct = {
      id,
      name_sv,
      name_en: newProduct.name_en.trim(),
      description_sv: newProduct.description_sv.trim(),
      description_en: newProduct.description_en.trim(),
      title: name_sv,
      description: newProduct.description_sv.trim(),
      price: Number(newProduct.price) || 0,
      image: newProduct.image.trim() || "/logo.png",
      status: newProduct.status ?? "i_lager",
      ...(newProduct.includedItems.trim()
        ? { includedItems: newProduct.includedItems.trim() }
        : {}),
      ...(variants.length > 0 ? { variants } : {}),
    };

    setConfig((current) =>
      current
        ? { ...current, products: [...current.products, entry] }
        : current,
    );
    setNewProduct(emptyProduct());
    showToast({
      type: "info",
      message: "Produkt tillagd i listan — spara för att publicera.",
    });
  }

  if (isLoading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50 text-zinc-600">
        Laddar adminpanel…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white text-zinc-900">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-500 text-white shadow-emerald-500/30"
              : toast.type === "error"
                ? "bg-red-500 text-white shadow-red-500/30"
                : "bg-zinc-800 text-white shadow-zinc-800/30"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {editingProductId && editProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Redigera produkt
                </p>
                <h2
                  id="edit-product-title"
                  className="mt-1 text-xl font-bold text-zinc-900"
                >
                  {editProduct.name_sv || "Produkt"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditProduct}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-lg font-semibold text-zinc-500 transition hover:bg-rose-100"
                aria-label="Stäng"
              >
                ×
              </button>
            </div>

            <div
              className={`relative mx-auto mt-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-rose-100 ${PRODUCT_IMAGE_FRAME_CLASS}`}
            >
              <ProductImage
                src={editProduct.image || "/logo.png"}
                alt={editProduct.name_sv || "Produkt"}
                fill
                sizes="144px"
                className="object-contain p-4"
              />
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Namn (SV)
                </span>
                <input
                  value={editProduct.name_sv}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, name_sv: event.target.value }
                        : current,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Namn (EN)
                </span>
                <input
                  value={editProduct.name_en}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, name_en: event.target.value }
                        : current,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Pris (kr)
                </span>
                <input
                  type="number"
                  min={0}
                  value={editProduct.price || ""}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, price: Number(event.target.value) }
                        : current,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Beskrivning (SV)
                </span>
                <textarea
                  value={editProduct.description_sv}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, description_sv: event.target.value }
                        : current,
                    )
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Beskrivning (EN)
                </span>
                <textarea
                  value={editProduct.description_en}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, description_en: event.target.value }
                        : current,
                    )
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Medföljer (t.ex. BAC-vatten ingår, lämna tomt om inget extra
                  medföljer)
                </span>
                <input
                  value={editProduct.includedItems}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, includedItems: event.target.value }
                        : current,
                    )
                  }
                  placeholder="BAC-vatten ingår"
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Bild-URL
                </span>
                <input
                  value={editProduct.image}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, image: event.target.value }
                        : current,
                    )
                  }
                  placeholder="/produkt.png"
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Styrka / Val
                </span>
                <input
                  value={editProduct.variantsInput}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? { ...current, variantsInput: event.target.value }
                        : current,
                    )
                  }
                  placeholder="10 mg:550, 20 mg:850, 50 mg:1200"
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  Ange varianter som namn:pris separerade med kommatecken (t.ex.
                  10 mg:550, 20 mg:850). Lämna tom om produkten saknar val.
                </p>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Lagerstatus
                </span>
                <select
                  value={editProduct.status}
                  onChange={(event) =>
                    setEditProduct((current) =>
                      current
                        ? {
                            ...current,
                            status: event.target.value as ProductStockStatus,
                          }
                        : current,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                >
                  {PRODUCT_STOCK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editProduct.bestSeller}
                    onChange={(event) =>
                      setEditProduct((current) =>
                        current
                          ? { ...current, bestSeller: event.target.checked }
                          : current,
                      )
                    }
                    className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                  />
                  Bästsäljare
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editProduct.premium}
                    onChange={(event) =>
                      setEditProduct((current) =>
                        current
                          ? { ...current, premium: event.target.checked }
                          : current,
                      )
                    }
                    className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                  />
                  Premium
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditProduct}
                className="rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-rose-50"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={() => void saveEditProduct()}
                disabled={isSavingProduct || !editProduct.name_sv.trim()}
                className="rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
              >
                {isSavingProduct ? "Sparar…" : "Spara ändringar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-rose-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              SimpliCity Admin
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Visuell butikspanel
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Server-skyddad session — åtkomst verifieras av middleware.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50"
          >
            ← Till butiken
          </Link>
        </div>
      </header>

      <section className="border-b border-rose-100 bg-gradient-to-r from-rose-50 via-white to-rose-50">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6">
          <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Total Omsättning (SEK)
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {formatSek(analytics.totalRevenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Antal Beställningar
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {analytics.orderCount}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Nyhetsbrevsprenumeranter
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {analytics.subscriberCount}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-rose-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h2 className="text-lg font-bold text-zinc-900">Systemhälsa</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Operativ överblick — försäljningstrender och prenumerationshastighet.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Beställningar idag
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {analytics.ordersToday}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Beställningar (7 dagar)
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {analytics.ordersThisWeek}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Nya prenumeranter idag
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {analytics.signupsToday}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Nya prenumeranter (7 dagar)
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {analytics.signupsThisWeek}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Orderhantering</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Granska inkommande beställningar och godkänn betalningar manuellt
            innan de räknas in i total omsättning.
          </p>

          {orders.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-8 text-center text-sm text-zinc-500">
              Inga beställningar ännu.
            </p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-rose-100">
              <table className="w-full text-sm">
                <thead className="bg-rose-50/80 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order-ID</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">
                      Datum
                    </th>
                    <th className="px-4 py-3 font-semibold">Belopp</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Åtgärd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...orders]
                    .sort(
                      (a, b) =>
                        new Date(b.placedAt).getTime() -
                        new Date(a.placedAt).getTime(),
                    )
                    .map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-rose-100 bg-white"
                      >
                        <td className="px-4 py-4 font-medium text-zinc-900">
                          <span className="font-mono text-xs">{order.id}</span>
                          <span className="mt-1 block text-xs text-zinc-500 md:hidden">
                            {formatOrderDate(order.placedAt)}
                          </span>
                        </td>
                        <td className="hidden px-4 py-4 text-zinc-500 md:table-cell">
                          {formatOrderDate(order.placedAt)}
                        </td>
                        <td className="px-4 py-4 font-semibold text-zinc-900">
                          {formatSek(order.total)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${orderStatusClassName(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            {order.status === ORDER_STATUS.PENDING ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void updateOrderStatus(order.id, "approve")
                                }
                                disabled={updatingOrderId === order.id}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                              >
                                {updatingOrderId === order.id
                                  ? "Godkänner…"
                                  : "Godkänn & Markera som betald"}
                              </button>
                            ) : order.status === ORDER_STATUS.APPROVED ||
                              order.status === ORDER_STATUS.COMPLETED ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void updateOrderStatus(order.id, "revert")
                                }
                                disabled={updatingOrderId === order.id}
                                className="rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
                              >
                                {updatingOrderId === order.id
                                  ? "Återställer…"
                                  : "Häv godkännande"}
                              </button>
                            ) : (
                              <span className="text-xs text-zinc-400">—</span>
                            )}
                            <button
                              type="button"
                              onClick={() => void handleDeleteOrder(order.id)}
                              disabled={deletingOrderId === order.id}
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                            >
                              {deletingOrderId === order.id
                                ? "Tar bort…"
                                : "Ta bort order"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">
            Nyhetsbrevsprenumeranter
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Alla e-postadresser som registrerats via nyhetsbrevet på startsidan.
          </p>

          {subscribers.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-8 text-center text-sm text-zinc-500">
              Inga prenumeranter ännu.
            </p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-rose-100">
              <table className="w-full text-sm">
                <thead className="bg-rose-50/80 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">E-post</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                      Prenumererade
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Åtgärd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.email}
                      className="border-t border-rose-100 bg-white"
                    >
                      <td className="px-4 py-4 font-medium text-zinc-900">
                        {subscriber.email}
                      </td>
                      <td className="hidden px-4 py-4 text-zinc-500 sm:table-cell">
                        {formatSubscriberDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            void handleRemoveSubscriber(subscriber.email)
                          }
                          disabled={removingEmail === subscriber.email}
                          className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          {removingEmail === subscriber.email
                            ? "Tar bort…"
                            : "Ta bort"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">
            Smarta Kampanjpaneler
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Konverteringsdriven global banner med roterande meddelanden, stil och
            nedräkning.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Aktiva banner-rader
              </span>
              {config.banner.activeLines.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-6 text-center text-sm text-zinc-500">
                  Inga aktiva rader — lägg till ditt första meddelande nedan.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {config.banner.activeLines.map((line, index) => (
                    <li
                      key={`${line}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-zinc-800">
                        {line}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBannerLine(index)}
                        className="shrink-0 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Ta bort
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex gap-2">
                <input
                  value={newBannerLine}
                  onChange={(event) => setNewBannerLine(event.target.value)}
                  placeholder="T.ex. Fri frakt med PostNord!"
                  className="flex-1 rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addBannerLine();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addBannerLine}
                  className="shrink-0 rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
                >
                  + Lägg till
                </button>
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Banner-stil
              </span>
              <select
                value={config.banner.style}
                onChange={(event) =>
                  updateBanner("style", event.target.value as BannerStyle)
                }
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              >
                {BANNER_STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.banner.countdownEnabled}
                onChange={(event) =>
                  updateBanner("countdownEnabled", event.target.checked)
                }
                className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
              />
              <span className="text-sm font-medium text-zinc-800">
                Visa nedräkningstimer i bannern
              </span>
            </label>

            {config.banner.countdownEnabled && (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Nedräkning slutar
                </span>
                <input
                  type="datetime-local"
                  value={
                    config.banner.countdownEndsAt
                      ? config.banner.countdownEndsAt.slice(0, 16)
                      : ""
                  }
                  onChange={(event) =>
                    updateBanner(
                      "countdownEndsAt",
                      event.target.value
                        ? new Date(event.target.value).toISOString()
                        : "",
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Site Settings</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Hero-typografi och header-logotyp styr den publika startsidan.
              </p>
            </div>
            <Link
              href="/admin/site-settings"
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Fullständig sajtinställning →
            </Link>
          </div>

          {config && (
            <div className="mt-6 space-y-6">
              <HeroCampaignForm
                siteSettings={config.siteSettings}
                products={config.products}
                onChange={(siteSettings) =>
                  setConfig((current) =>
                    current ? { ...current, siteSettings } : current,
                  )
                }
              />
              <HeroSettingsForm
                siteSettings={config.siteSettings}
                onChange={(siteSettings) =>
                  setConfig((current) =>
                    current ? { ...current, siteSettings } : current,
                  )
                }
              />
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Header Logo Path (bild-URL)
              </span>
              <input
                value={config?.siteSettings.logoPath ?? ""}
                onChange={(event) =>
                  updateSiteSetting("logoPath", event.target.value)
                }
                placeholder="/logo.png"
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <p className="mt-2 rounded-xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-6 text-center text-xs text-zinc-500">
                Logotyp-uppladdning: klistra in sökväg till fil i{" "}
                <code className="rounded bg-white px-1">/public</code> (t.ex.{" "}
                <code className="rounded bg-white px-1">/logo.png</code>)
              </p>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Butikens E-postadress
              </span>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? { ...current, contactEmail: event.target.value }
                      : current,
                  )
                }
                placeholder="hello@simplicity.se"
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Visas i kontaktsektionen och används för kundkommunikation.
              </p>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                TELEGRAM SUPPORT HANDLE (Boutique länk)
              </span>
              <input
                value={config.telegramHandle}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? { ...current, telegramHandle: event.target.value }
                      : current,
                  )
                }
                placeholder="@simplicity"
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Visas i kontaktsektionen och länkar till din Telegram-boutique.
              </p>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Fraktinställningar</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Styr standardfrakt och tröskelvärde för fri frakt i kassan.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Standard fraktavgift (SEK)
              </span>
              <input
                type="number"
                min={0}
                step={1}
                value={config.shippingFee}
                onChange={(event) =>
                  updateShipping("shippingFee", Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tröskel för fri frakt (SEK)
              </span>
              <input
                type="number"
                min={0}
                step={1}
                value={config.freeShippingThreshold}
                onChange={(event) =>
                  updateShipping(
                    "freeShippingThreshold",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSaveShipping}
            disabled={isSavingShipping}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingShipping ? "Sparar…" : "Spara ändringar"}
          </button>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Crypto Payout Wallets</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Dessa adresser används i kassan och i Telegram-betalningslänkar.
          </p>

          <div className="mt-6 grid gap-4">
            {(
              [
                ["tron", "TRON (TRC-20)"],
                ["bsc", "Binance Smart Chain (BEP-20)"],
                ["bitcoin", "Bitcoin"],
                ["ethereum", "Ethereum (ERC-20)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {label}
                </span>
                <input
                  value={config.cryptoWallets[key]}
                  onChange={(event) => updateWallet(key, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 font-mono text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Klistra in en rå adress eller full betalningslänk. Hemsidan genererar
            automatiskt en ren, högupplöst QR-kod anpassad för kameror och Trust
            Wallet.
          </p>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Products Manager</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Lägg till eller ta bort produkter som visas i butiken.
          </p>

          <div className="mt-6 space-y-4">
            {config.products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-rose-100 ${PRODUCT_IMAGE_FRAME_CLASS}`}
                >
                  <ProductImage
                    src={product.image}
                    alt={product.name_sv || product.title || product.id}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900">
                    {product.name_sv || product.title}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {product.description_sv || product.description}
                  </p>
                  <p className="text-xs text-zinc-400">
                    EN: {product.name_en || "—"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {product.price} SEK ·{" "}
                    {PRODUCT_STOCK_STATUS_OPTIONS.find(
                      (option) => option.value === product.status,
                    )?.label ?? "I lager"}{" "}
                    · {product.image}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <input
                        type="checkbox"
                        checked={config.bestSellerProductIds.includes(product.id)}
                        onChange={() => toggleBestSeller(product.id)}
                        className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                      />
                      Bästsäljare
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <input
                        type="checkbox"
                        checked={config.premiumProductIds.includes(product.id)}
                        onChange={() => togglePremium(product.id)}
                        className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                      />
                      Premium
                    </label>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditProduct(product)}
                    className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              Lägg till ny produkt
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={newProduct.name_sv}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    name_sv: event.target.value,
                  }))
                }
                placeholder="Namn (SV)"
                className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
              />
              <input
                value={newProduct.name_en}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    name_en: event.target.value,
                  }))
                }
                placeholder="Namn (EN)"
                className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
              />
              <input
                type="number"
                value={newProduct.price || ""}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    price: Number(event.target.value),
                  }))
                }
                placeholder="Pris (SEK)"
                className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
              />
              <input
                value={newProduct.image}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    image: event.target.value,
                  }))
                }
                placeholder="Bild-URL (t.ex. /produkt.png)"
                className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 sm:col-span-2"
              />
              <textarea
                value={newProduct.description_sv}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    description_sv: event.target.value,
                  }))
                }
                placeholder="Beskrivning (SV)"
                rows={2}
                className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 sm:col-span-2"
              />
              <textarea
                value={newProduct.description_en}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    description_en: event.target.value,
                  }))
                }
                placeholder="Beskrivning (EN)"
                rows={2}
                className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-product-included-items"
                  className="mb-1.5 block text-xs font-medium text-zinc-600"
                >
                  Medföljer (t.ex. BAC-vatten ingår, lämna tomt om inget extra
                  medföljer)
                </label>
                <input
                  id="new-product-included-items"
                  value={newProduct.includedItems}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      includedItems: event.target.value,
                    }))
                  }
                  placeholder="BAC-vatten ingår"
                  className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-product-size-label"
                  className="mb-1.5 block text-xs font-medium text-zinc-600"
                >
                  Styrka / Val
                </label>
                <input
                  id="new-product-size-label"
                  value={newProduct.variantsInput ?? ""}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      variantsInput: event.target.value,
                    }))
                  }
                  placeholder="10 mg:550, 20 mg:850, 50 mg:1200"
                  className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  Ange varianter som namn:pris separerade med kommatecken (t.ex.
                  10 mg:550, 20 mg:850). Lämna tom om produkten saknar val.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-product-status"
                  className="mb-1.5 block text-xs font-medium text-zinc-600"
                >
                  Lagerstatus
                </label>
                <select
                  id="new-product-status"
                  value={newProduct.status ?? "i_lager"}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      status: event.target.value as ProductStockStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                >
                  {PRODUCT_STOCK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={addProduct}
              className="mt-4 rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              + Lägg till produkt
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Rabatthanterare</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Skapa och hantera aktiva kampanjkoder med produktomfång och
            användningsgränser.
          </p>

          <div className="mt-6 space-y-4">
            {config.discounts.map((discount) => {
              const scopeLabel =
                discount.productScope === "all"
                  ? "Alla produkter"
                  : (config.products.find(
                      (product) => product.id === discount.productScope,
                    )?.title ?? discount.productScope);

              return (
                <div
                  key={discount.id}
                  className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {discount.code}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {discount.type === "percent"
                        ? `${discount.value}% rabatt`
                        : `${discount.value} SEK avdrag`}{" "}
                      · {scopeLabel}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Användning: {discount.usageCount}
                      {discount.usageLimit > 0
                        ? ` / ${discount.usageLimit}`
                        : " / ∞"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDiscount(discount.id)}
                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              Lägg till ny rabattkod
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Kupongnamn
                </span>
                <input
                  value={newDiscount.code}
                  onChange={(event) =>
                    setNewDiscount((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SUMMER20"
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                />
              </label>

              <div className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Rabatttyp
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["percent", "Procent %"],
                      ["flat", "Fast SEK-belopp"],
                    ] as const
                  ).map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setNewDiscount((current) => ({ ...current, type }))
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        newDiscount.type === type
                          ? "bg-rose-400 text-white"
                          : "border border-rose-200 bg-white text-zinc-700 hover:bg-rose-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Värde
                </span>
                <input
                  type="number"
                  min={0}
                  value={newDiscount.value || ""}
                  onChange={(event) =>
                    setNewDiscount((current) => ({
                      ...current,
                      value: Number(event.target.value),
                    }))
                  }
                  placeholder={newDiscount.type === "percent" ? "20" : "100"}
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Användningsgräns (0 = obegränsat)
                </span>
                <input
                  type="number"
                  min={0}
                  value={newDiscount.usageLimit || ""}
                  onChange={(event) =>
                    setNewDiscount((current) => ({
                      ...current,
                      usageLimit: Number(event.target.value),
                    }))
                  }
                  placeholder="0"
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Produktomfång
                </span>
                <select
                  value={newDiscount.productScope}
                  onChange={(event) =>
                    setNewDiscount((current) => ({
                      ...current,
                      productScope: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                >
                  <option value="all">Alla produkter</option>
                  {config.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name_sv || product.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={addDiscount}
              className="mt-4 rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              + Lägg till rabattkod
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">
            Influencer-samarbeten
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Spåra betalda TikTok-partnerskap via{" "}
            <code className="rounded bg-rose-50 px-1">?ref=handle</code> och
            kampanjkoder.
          </p>

          {config.influencers.length === 0 && influencerStats.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-8 text-center text-sm text-zinc-500">
              Inga influencers registrerade ännu.
            </p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-rose-100">
              <table className="w-full text-sm">
                <thead className="bg-rose-50/80 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Influencer</th>
                    <th className="px-4 py-3 font-semibold">Kampanjkod</th>
                    <th className="px-4 py-3 font-semibold">Provision</th>
                    <th className="px-4 py-3 font-semibold">Interaktioner</th>
                    <th className="px-4 py-3 font-semibold">Antal köp</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Åtgärd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {config.influencers.map((influencer) => {
                    const stats = influencerStats.find(
                      (entry) => entry.id === influencer.id,
                    );

                    return (
                      <tr
                        key={influencer.id}
                        className="border-t border-rose-100 bg-white"
                      >
                        <td className="px-4 py-4 font-medium text-zinc-900">
                          {influencer.handle}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-zinc-600">
                          {influencer.promoCode || "—"}
                        </td>
                        <td className="px-4 py-4 text-zinc-700">
                          {influencer.commissionPercent}%
                        </td>
                        <td className="px-4 py-4 text-zinc-700">
                          {stats?.visits ?? 0}
                        </td>
                        <td className="px-4 py-4 text-zinc-700">
                          {stats?.purchases ?? 0}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => removeInfluencer(influencer.id)}
                            className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Ta bort
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              Lägg till influencer
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Influencer Handle/Namn
                </span>
                <input
                  value={newInfluencer.handle}
                  onChange={(event) =>
                    setNewInfluencer((current) => ({
                      ...current,
                      handle: event.target.value,
                    }))
                  }
                  placeholder="@linn_beauty"
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Tilldelad kampanjkod
                </span>
                <select
                  value={newInfluencer.promoCode}
                  onChange={(event) =>
                    setNewInfluencer((current) => ({
                      ...current,
                      promoCode: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                >
                  <option value="">Välj rabattkod…</option>
                  {config.discounts.map((discount) => (
                    <option key={discount.id} value={discount.code}>
                      {discount.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Provision (%)
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={newInfluencer.commissionPercent}
                  onChange={(event) =>
                    setNewInfluencer((current) => ({
                      ...current,
                      commissionPercent: Number(event.target.value),
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={addInfluencer}
              className="mt-4 rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              + Lägg till influencer
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">
            System Integration Settings
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Telegram-botinställningar för ordernotiser. Sparas säkert i
            butikskonfigurationen — inget behov av att redigera .env manuellt.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Telegram Bot Token
              </span>
              <input
                type="password"
                value={config.systemIntegration.telegramBotToken}
                onChange={(event) =>
                  updateSystemIntegration(
                    "telegramBotToken",
                    event.target.value,
                  )
                }
                placeholder="123456789:ABCdefGHI..."
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 font-mono text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Telegram Chat ID
              </span>
              <input
                value={config.systemIntegration.telegramChatId}
                onChange={(event) =>
                  updateSystemIntegration("telegramChatId", event.target.value)
                }
                placeholder="123456789"
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 font-mono text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Ditt personliga chat-ID dit ordermeddelanden skickas vid
                checkout.
              </p>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">
            Marknadsföring &amp; Spårning
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Analyspixlar laddas automatiskt i butikens publika layout.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Google Analytics ID
              </span>
              <input
                value={config.marketingTracking.googleAnalyticsId}
                onChange={(event) =>
                  updateMarketingTracking(
                    "googleAnalyticsId",
                    event.target.value,
                  )
                }
                placeholder="G-XXXXXXXXXX"
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 font-mono text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                TikTok Pixel ID
              </span>
              <input
                value={config.marketingTracking.tiktokPixelId}
                onChange={(event) =>
                  updateMarketingTracking("tiktokPixelId", event.target.value)
                }
                placeholder="CXXXXXXXXXXXXXXX"
                className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 font-mono text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">FAQ-hantering</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Hantera frågor och svar som visas i accordionen på startsidan.
          </p>

          <div className="mt-6 space-y-4">
            {config.faqs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-8 text-center text-sm text-zinc-500">
                Inga FAQ-poster ännu.
              </p>
            ) : (
              config.faqs.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4"
                >
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Fråga
                    </span>
                    <input
                      value={entry.question}
                      onChange={(event) =>
                        updateFaq(entry.id, "question", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Svar
                    </span>
                    <textarea
                      value={entry.answer}
                      onChange={(event) =>
                        updateFaq(entry.id, "answer", event.target.value)
                      }
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeFaq(entry.id)}
                    className="mt-3 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              Lägg till ny FAQ
            </h3>
            <div className="mt-4 space-y-3">
              <input
                value={newFaq.question}
                onChange={(event) =>
                  setNewFaq((current) => ({
                    ...current,
                    question: event.target.value,
                  }))
                }
                placeholder="Fråga"
                className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
              />
              <textarea
                value={newFaq.answer}
                onChange={(event) =>
                  setNewFaq((current) => ({
                    ...current,
                    answer: event.target.value,
                  }))
                }
                placeholder="Svar"
                rows={3}
                className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400"
              />
            </div>
            <button
              type="button"
              onClick={addFaq}
              className="mt-4 rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              + Lägg till FAQ
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Systemloggar</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Senaste backend-fel från checkout och integrationer.
          </p>

          {systemLogs.length === 0 ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700">
              🟢 Alla system fungerar perfekt
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {systemLogs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-red-100 bg-red-50/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="font-mono">
                      {formatLogTimestamp(log.timestamp)}
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold uppercase tracking-wide text-red-700">
                      {log.source}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-zinc-800">
                    {log.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex justify-end pb-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-14 items-center justify-center rounded-full bg-rose-400 px-10 text-base font-bold text-white shadow-lg shadow-rose-400/30 transition hover:bg-rose-500 disabled:opacity-60"
          >
            {isSaving ? "Sparar…" : "Spara ändringar"}
          </button>
        </div>
      </main>
    </div>
  );
}
