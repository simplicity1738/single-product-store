"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import type {
  BannerAnimation,
  BannerStyle,
  BannerTimeDisplayMode,
  CampaignOfferType,
  CampaignRule,
  ConfigDiscount,
  ConfigFaq,
  ConfigProduct,
  InfluencerPartner,
  StoreConfig,
} from "@/lib/store-config";
import {
  getFulfillmentBadgeLabel,
  isFulfillmentStatus,
  isWaitingForPackStatus,
  ORDER_STATUS,
  type OrderStatus,
} from "@/lib/order-status";
import {
  getStripeDashboardSessionUrl,
  PAYMENT_METHOD,
  STRIPE_PAYMENT_TYPE,
  type PaymentMethod,
  type StripePaymentType,
} from "@/lib/order-payment";
import AdminPaymentMethodBadge from "@/components/admin/AdminPaymentMethodBadge";
import {
  formatCampaignRuleName,
  formatVariantsInput,
  parseVariantsInput,
} from "@/lib/store-config";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";
import HeroCampaignForm from "@/components/admin/HeroCampaignForm";
import ProductSaleFields, {
  emptyProductSaleFormValues,
} from "@/components/admin/ProductSaleFields";
import { normalizeSiteSettings } from "@/lib/hero-settings";
import {
  normalizeSiteNavigation,
  SITE_NAV_ADMIN_META,
  SITE_NAV_KEYS,
  SITE_NAV_LABEL_MAX,
  type SiteNavKey,
  type SiteNavigation,
} from "@/lib/site-navigation";
import {
  PRODUCT_STOCK_STATUS_OPTIONS,
  type ProductStockStatus,
} from "@/lib/product-stock";
import {
  REVIEW_STATUS,
  type CustomerReview,
} from "@/lib/customer-reviews";
import {
  buildAdminVariantStockRows,
  normalizeStockManagement,
  type StockManagementConfig,
} from "@/lib/stock-management";

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
  isOnSale: boolean;
  saleType: "procent" | "fixed";
  saleValue: number;
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
  ...emptyProductSaleFormValues(),
});

type AdminOrder = {
  id: string;
  total: number;
  placedAt: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  stripeSessionId?: string;
  stripePaymentType?: StripePaymentType;
  affiliateHandle?: string;
  commissionSek?: number;
  commissionPercent?: number;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
};

type OrderStatusFilter =
  | "all"
  | "approved"
  | "pending"
  | "packed"
  | "delivered"
  | "refunded";
type OrderPaymentFilter = "all" | "stripe_card" | "crypto";
type OrderSortOption = "newest" | "oldest" | "highest" | "lowest";
type OrderFulfillmentAction =
  | "approve"
  | "revert"
  | "pack"
  | "ship"
  | "waiting_pack";

const orderFilterClassName =
  "rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none";

function matchesOrderSearch(order: AdminOrder, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const fields = [
    order.id,
    order.customerName ?? "",
    order.customerEmail ?? "",
    order.shippingAddress ?? "",
  ];

  return fields.some((field) => field.toLowerCase().includes(needle));
}

function matchesOrderStatusFilter(
  order: AdminOrder,
  filter: OrderStatusFilter,
): boolean {
  switch (filter) {
    case "approved":
      return isWaitingForPackStatus(order.status);
    case "pending":
      return order.status === ORDER_STATUS.PENDING;
    case "packed":
      return order.status === ORDER_STATUS.PACKED;
    case "delivered":
      return order.status === ORDER_STATUS.DELIVERED;
    case "refunded":
      return order.status === ORDER_STATUS.REFUNDED;
    default:
      return true;
  }
}

function matchesOrderPaymentFilter(
  order: AdminOrder,
  filter: OrderPaymentFilter,
): boolean {
  switch (filter) {
    case "stripe_card":
      return (
        order.paymentMethod === PAYMENT_METHOD.STRIPE &&
        order.stripePaymentType !== STRIPE_PAYMENT_TYPE.KLARNA &&
        order.stripePaymentType !== STRIPE_PAYMENT_TYPE.LINK
      );
    case "crypto":
      return (
        order.paymentMethod === PAYMENT_METHOD.BITCOIN || !order.paymentMethod
      );
    default:
      return true;
  }
}

function sortOrders(orders: AdminOrder[], sort: OrderSortOption): AdminOrder[] {
  const sorted = [...orders];

  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
      );
    case "highest":
      return sorted.sort((a, b) => b.total - a.total);
    case "lowest":
      return sorted.sort((a, b) => a.total - b.total);
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
      );
  }
}

type DestructiveConfirmAction = {
  type: "refund" | "delete";
  orderId: string;
  amount: number;
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

const emptyCampaignRule = (): CampaignRule => ({
  id: "",
  name: "",
  type: "quantity_flat",
  active: true,
  productScope: "all",
  buyQuantity: 2,
  discountAmount: 100,
  bundleBuy: 3,
  bundlePay: 2,
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
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear: number;
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
    case ORDER_STATUS.WAITING_PACK:
    case ORDER_STATUS.COMPLETED:
      return "border-white/10 bg-white/5 text-neutral-400";
    case ORDER_STATUS.PACKED:
      return "border-sky-500/20 bg-sky-500/10 text-sky-300";
    case ORDER_STATUS.DELIVERED:
      return "border-white/10 bg-[#ECE5D8]/10 text-[#ECE5D8]";
    case ORDER_STATUS.REFUNDED:
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-white/10 bg-white/5 text-neutral-400";
  }
}

function orderStatusBadgeLabel(status: OrderStatus): string {
  if (isFulfillmentStatus(status)) {
    return getFulfillmentBadgeLabel(status);
  }
  return status;
}

const BANNER_STYLE_OPTIONS: { value: BannerStyle; label: string }[] = [
  { value: "clean-minimalist", label: "Clean Minimalist" },
  { value: "flash-sale-pulse", label: "Flash Sale Pulse" },
  { value: "urgent-alert", label: "Urgent Alert" },
];

const BANNER_ANIMATION_OPTIONS: { value: BannerAnimation; label: string }[] = [
  { value: "none", label: "🛑 Stilla (Ingen animering)" },
  { value: "pulse", label: "✨ Mjuk Pulsering (Andas elegant)" },
  { value: "slide", label: "➡️ Rullande text (Glider sidleds)" },
  { value: "shimmer", label: "⚡ Lyxigt Skimmer (Ljusvåg)" },
];

const BANNER_TIME_DISPLAY_OPTIONS: {
  value: BannerTimeDisplayMode;
  label: string;
}[] = [
  {
    value: "countdown",
    label: "⏱️ Live-nedräkningstimer (Tickar sekunder)",
  },
  {
    value: "staticDate",
    label: "📅 Statiskt datum (Visar endast sluttid)",
  },
];

type AdminTab =
  | "oversikt"
  | "kampanj"
  | "betalning"
  | "system"
  | "navigation"
  | "recensioner"
  | "lager";

const ADMIN_TABS: { id: AdminTab; label: string; hint: string }[] = [
  { id: "oversikt", label: "Översikt", hint: "Omsättning, ordrar och loggar" },
  { id: "kampanj", label: "Kampanj", hint: "Banner, hero, rabatter och produkter" },
  { id: "lager", label: "Lager", hint: "Lagerantal per variant och synlighet" },
  { id: "betalning", label: "Betalning", hint: "Crypto-plånböcker" },
  { id: "recensioner", label: "Recensioner", hint: "Godkänn och hantera kundrecensioner" },
  { id: "system", label: "System", hint: "Telegram och spårning" },
  { id: "navigation", label: "Navigation", hint: "Meny och synlighet" },
];

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [newProduct, setNewProduct] = useState<ProductDraft>(emptyProduct());
  const [newDiscount, setNewDiscount] = useState<ConfigDiscount>(emptyDiscount());
  const [newCampaignRule, setNewCampaignRule] = useState<CampaignRule>(
    emptyCampaignRule(),
  );
  const [toast, setToast] = useState<ToastState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalRevenue: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0,
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
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilter>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] =
    useState<OrderPaymentFilter>("all");
  const [orderSortOption, setOrderSortOption] =
    useState<OrderSortOption>("newest");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [destructiveConfirm, setDestructiveConfirm] =
    useState<DestructiveConfirmAction | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [newFaq, setNewFaq] = useState<ConfigFaq>(emptyFaq());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<EditProductForm | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("oversikt");
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [approvingReviewId, setApprovingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [savingReplyId, setSavingReplyId] = useState<string | null>(null);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (next?.type === "success" || next?.type === "info") {
      window.setTimeout(() => setToast(null), 3500);
    }
  }, []);

  async function copyShippingAddress(order: AdminOrder) {
    const lines = [
      order.customerName?.trim() || "",
      order.shippingAddress?.trim() || "",
    ].filter(Boolean);

    if (lines.length === 0) {
      showToast({
        type: "error",
        message: "Ingen leveransadress att kopiera.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      showToast({ type: "success", message: "Kopierad!" });
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte kopiera adressen.",
      });
    }
  }

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/config");
      if (!response.ok) throw new Error("Failed to load");
      const data = (await response.json()) as StoreConfig;
      setConfig({
        ...data,
        siteSettings: normalizeSiteSettings(data.siteSettings),
        campaignRules: Array.isArray(data.campaignRules)
          ? data.campaignRules
          : [],
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

  const loadReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const response = await fetch("/api/admin/reviews");
      if (!response.ok) throw new Error("Failed to load reviews");
      const data = (await response.json()) as { reviews?: CustomerReview[] };
      setCustomerReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte ladda recensioner.",
      });
    } finally {
      setIsLoadingReviews(false);
    }
  }, [showToast]);

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
    action: OrderFulfillmentAction,
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

      const nextStatus: OrderStatus =
        action === "approve" || action === "waiting_pack"
          ? ORDER_STATUS.WAITING_PACK
          : action === "pack"
            ? ORDER_STATUS.PACKED
            : action === "ship"
              ? ORDER_STATUS.DELIVERED
              : ORDER_STATUS.PENDING;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: (data.order?.status as OrderStatus | undefined) ?? nextStatus,
              }
            : order,
        ),
      );
      void loadAnalytics();
      showToast({
        type: "success",
        message: `Status uppdaterad för ${orderId}`,
      });
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte uppdatera orderstatus.",
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
      void loadAnalytics();
      setDestructiveConfirm(null);
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

  async function handleRefundOrder(orderId: string) {
    setIsRefunding(true);
    try {
      const response = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Refund failed");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: ORDER_STATUS.REFUNDED }
            : order,
        ),
      );
      void loadAnalytics();
      setDestructiveConfirm(null);
      showToast({
        type: "success",
        message: data.message ?? "Stripe-återbetalning genomförd.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte genomföra återbetalningen.",
      });
    } finally {
      setIsRefunding(false);
    }
  }

  async function handleApproveReview(reviewId: string) {
    setApprovingReviewId(reviewId);
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Approve failed");
      }

      setCustomerReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? { ...review, status: REVIEW_STATUS.APPROVED }
            : review,
        ),
      );
      showToast({
        type: "success",
        message: data.message ?? "Recensionen har godkänts.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte godkänna recensionen.",
      });
    } finally {
      setApprovingReviewId(null);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    setDeletingReviewId(reviewId);
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Delete failed");
      }

      setCustomerReviews((current) =>
        current.filter((review) => review.id !== reviewId),
      );
      showToast({
        type: "success",
        message: data.message ?? "Recensionen har tagits bort.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte ta bort recensionen.",
      });
    } finally {
      setDeletingReviewId(null);
    }
  }

  async function handleReplyToReview(reviewId: string) {
    const adminReply = (replyDrafts[reviewId] ?? "").trim();
    if (adminReply.length < 2) {
      showToast({
        type: "error",
        message: "Skriv ett svar (minst 2 tecken).",
      });
      return;
    }

    setSavingReplyId(reviewId);
    try {
      const response = await fetch("/api/admin/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, adminReply }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Reply failed");
      }

      const updated = data.review as CustomerReview | undefined;
      setCustomerReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                adminReply: updated?.adminReply ?? adminReply,
                repliedAt: updated?.repliedAt ?? new Date().toISOString(),
              }
            : review,
        ),
      );
      setReplyingReviewId(null);
      showToast({
        type: "success",
        message: data.message ?? "Svar sparat.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte spara svaret.",
      });
    } finally {
      setSavingReplyId(null);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadConfig();
      void loadAnalytics();
      void loadSubscribers();
      void loadInfluencerStats();
      void loadOrders();
      void loadReviews();
    });
  }, [
    loadConfig,
    loadAnalytics,
    loadSubscribers,
    loadInfluencerStats,
    loadOrders,
    loadReviews,
  ]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "recensioner") {
      setActiveTab("recensioner");
    }
  }, [searchParams]);

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

  function updateNavItem<K extends keyof SiteNavigation[SiteNavKey]>(
    key: SiteNavKey,
    field: K,
    value: SiteNavigation[SiteNavKey][K],
  ) {
    setConfig((current) =>
      current
        ? {
            ...current,
            siteNavigation: normalizeSiteNavigation({
              ...current.siteNavigation,
              [key]: {
                ...current.siteNavigation[key],
                [field]: value,
              },
            }),
          }
        : current,
    );
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

  function updateStockManagement<K extends keyof StockManagementConfig>(
    key: K,
    value: StockManagementConfig[K],
  ) {
    setConfig((current) =>
      current
        ? {
            ...current,
            stockManagement: normalizeStockManagement({
              ...current.stockManagement,
              [key]: value,
            }),
          }
        : current,
    );
  }

  function updateVariantStockCount(key: string, quantity: number) {
    setConfig((current) => {
      if (!current) return current;
      const counts = { ...current.stockManagement.counts };
      counts[key] = Math.max(0, Math.floor(quantity));
      return {
        ...current,
        stockManagement: normalizeStockManagement({
          ...current.stockManagement,
          counts,
        }),
      };
    });
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
      isOnSale: Boolean(product.isOnSale),
      saleType: product.saleType === "fixed" ? "fixed" : "procent",
      saleValue: product.saleValue ?? 0,
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
          isOnSale: editProduct.isOnSale,
          saleType: editProduct.saleType,
          saleValue: editProduct.saleValue,
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

  function addCampaignRule() {
    const type: CampaignOfferType =
      newCampaignRule.type === "bundle" ? "bundle" : "quantity_flat";
    const buyQuantity = Math.max(1, Number(newCampaignRule.buyQuantity) || 1);
    const discountAmount = Math.max(
      0,
      Math.round(Number(newCampaignRule.discountAmount) || 0),
    );
    const bundleBuy = Math.max(2, Number(newCampaignRule.bundleBuy) || 2);
    const bundlePay = Math.min(
      bundleBuy - 1,
      Math.max(1, Number(newCampaignRule.bundlePay) || bundleBuy - 1),
    );

    if (type === "quantity_flat" && discountAmount <= 0) {
      showToast({
        type: "info",
        message: "Ange ett rabattbelopp i kronor.",
      });
      return;
    }

    if (type === "bundle" && bundlePay >= bundleBuy) {
      showToast({
        type: "info",
        message: "För bundle måste antal att betala vara lägre än antal att köpa.",
      });
      return;
    }

    const entry: CampaignRule = {
      id: `campaign-${Date.now()}`,
      name: formatCampaignRuleName({
        type,
        buyQuantity,
        discountAmount,
        bundleBuy,
        bundlePay,
        name: newCampaignRule.name,
      }),
      type,
      active: newCampaignRule.active,
      productScope: newCampaignRule.productScope || "all",
      buyQuantity,
      discountAmount,
      bundleBuy,
      bundlePay,
    };

    setConfig((current) =>
      current
        ? {
            ...current,
            campaignRules: [...(current.campaignRules ?? []), entry],
          }
        : current,
    );
    setNewCampaignRule(emptyCampaignRule());
    showToast({
      type: "info",
      message: "Kampanjregel tillagd — spara för att publicera.",
    });
  }

  function toggleCampaignRule(id: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            campaignRules: (current.campaignRules ?? []).map((rule) =>
              rule.id === id ? { ...rule, active: !rule.active } : rule,
            ),
          }
        : current,
    );
  }

  function removeCampaignRule(id: string) {
    setConfig((current) =>
      current
        ? {
            ...current,
            campaignRules: (current.campaignRules ?? []).filter(
              (rule) => rule.id !== id,
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
      ...(newProduct.isOnSale
        ? {
            isOnSale: true,
            saleType: newProduct.saleType,
            saleValue: newProduct.saleValue,
          }
        : { isOnSale: false }),
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

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(
      (order) =>
        matchesOrderSearch(order, orderSearchQuery) &&
        matchesOrderStatusFilter(order, orderStatusFilter) &&
        matchesOrderPaymentFilter(order, orderPaymentFilter),
    );
    return sortOrders(filtered, orderSortOption);
  }, [
    orders,
    orderSearchQuery,
    orderStatusFilter,
    orderPaymentFilter,
    orderSortOption,
  ]);

  if (isLoading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0C0B] text-[#CFC4BD]">
        Laddar adminpanel…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0C0B] text-white">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-sm rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "bg-[#ECE5D8] text-[#0F0C0B] shadow-md"
              : toast.type === "error"
                ? "bg-red-500 text-white shadow-red-500/30"
                : "bg-zinc-800 text-white shadow-zinc-800/30"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {destructiveConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="destructive-confirm-title"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F0C0B] p-6 shadow-2xl"
          >
            <h2
              id="destructive-confirm-title"
              className="text-lg font-bold text-white"
            >
              Bekräfta åtgärd
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#CFC4BD]">
              Är du säker på att du vill genomföra{" "}
              {destructiveConfirm.type === "refund"
                ? "Återbetalning"
                : "Borttagning"}{" "}
              för order{" "}
              <span className="font-mono font-semibold text-white">
                {destructiveConfirm.orderId}
              </span>{" "}
              ({formatSek(destructiveConfirm.amount)})?
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDestructiveConfirm(null)}
                disabled={isRefunding || deletingOrderId !== null}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={() =>
                  void (destructiveConfirm.type === "refund"
                    ? handleRefundOrder(destructiveConfirm.orderId)
                    : handleDeleteOrder(destructiveConfirm.orderId))
                }
                disabled={isRefunding || deletingOrderId !== null}
                className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {destructiveConfirm.type === "refund"
                  ? isRefunding
                    ? "Återbetalar…"
                    : "Bekräfta"
                  : deletingOrderId
                    ? "Tar bort…"
                    : "Bekräfta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProductId && editProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0F0C0B] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#ECE5D8]">
                  Redigera produkt
                </p>
                <h2
                  id="edit-product-title"
                  className="mt-1 text-xl font-bold text-white"
                >
                  {editProduct.name_sv || "Produkt"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditProduct}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-[#A89A92] transition hover:bg-white/10 hover:text-white"
                aria-label="Stäng"
              >
                ×
              </button>
            </div>

            <div
              className={`relative mx-auto mt-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-white/10 ${PRODUCT_IMAGE_FRAME_CLASS}`}
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
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <ProductSaleFields
                values={{
                  isOnSale: editProduct.isOnSale,
                  saleType: editProduct.saleType,
                  saleValue: editProduct.saleValue,
                }}
                onChange={(saleValues) =>
                  setEditProduct((current) =>
                    current ? { ...current, ...saleValues } : current,
                  )
                }
              />

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-[#A89A92]">
                  Ange varianter som namn:pris separerade med kommatecken (t.ex.
                  10 mg:550, 20 mg:850). Lämna tom om produkten saknar val.
                </p>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                >
                  {PRODUCT_STOCK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-[#CFC4BD]">
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
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                  />
                  Bästsäljare
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-[#CFC4BD]">
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
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                  />
                  Premium
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditProduct}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={() => void saveEditProduct()}
                disabled={isSavingProduct || !editProduct.name_sv.trim()}
                className="rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:opacity-60"
              >
                {isSavingProduct ? "Sparar…" : "Spara ändringar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-white/10 bg-[#0B0908]/90 backdrop-blur">
        <div className="flex w-full max-w-none items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ECE5D8]">
              SimpliCity Admin
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Visuell butikspanel
            </h1>
            <p className="mt-1 text-sm text-[#A89A92]">
              Server-skyddad session — åtkomst verifieras av middleware.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white"
          >
            ← Till butiken
          </Link>
        </div>
      </header>

      <div className="mx-0 flex w-full max-w-none flex-col gap-3 px-2 py-4 sm:flex-row sm:gap-3 md:px-3">
        <aside className="mx-0 w-full shrink-0 px-0 sm:w-52">
          <nav
            aria-label="Admin-vyer"
            className="sticky top-6 space-y-0.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-xl"
          >
            {ADMIN_TABS.map((tab) => {
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-lg px-2.5 py-2 text-left transition ${
                    selected
                      ? "bg-[#ECE5D8] text-[#0F0C0B] font-semibold shadow-md"
                      : "text-[#CFC4BD] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="block text-sm font-semibold">{tab.label}</span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      selected ? "text-[#0F0C0B]/70" : "text-[#A89A92]"
                    }`}
                  >
                    {tab.hint}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 w-full flex-1 space-y-6 p-4 md:p-6">
          {activeTab === "oversikt" ? (
            <>
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-sm sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Total Omsättning (SEK)
                    </p>
                    <p className="mt-1 text-xs text-[#A89A92]">
                      Endast godkända order
                    </p>
                    <p className="mt-2 text-3xl font-serif tracking-tight text-white">
                      {formatSek(analytics.totalRevenue)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Denna vecka
                    </p>
                    <p className="mt-1 text-xs text-[#A89A92]">
                      Senaste 7 dagarna · godkända
                    </p>
                    <p className="mt-2 text-3xl font-serif tracking-tight text-white">
                      {formatSek(analytics.revenueThisWeek)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Denna månad
                    </p>
                    <p className="mt-1 text-xs text-[#A89A92]">
                      Innevarande månad · godkända
                    </p>
                    <p className="mt-2 text-3xl font-serif tracking-tight text-white">
                      {formatSek(analytics.revenueThisMonth)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Detta år
                    </p>
                    <p className="mt-1 text-xs text-[#A89A92]">
                      Innevarande år · godkända
                    </p>
                    <p className="mt-2 text-3xl font-serif tracking-tight text-white">
                      {formatSek(analytics.revenueThisYear)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Antal Beställningar
                    </p>
                    <p className="mt-1 text-xs text-[#A89A92]">
                      Endast godkända order
                    </p>
                    <p className="mt-2 text-3xl font-serif tracking-tight text-white">
                      {analytics.orderCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Nyhetsbrevsprenumeranter
                    </p>
                    <p className="mt-2 text-3xl font-serif tracking-tight text-white">
                      {analytics.subscriberCount}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
                <h2 className="text-lg font-bold text-white">Systemhälsa</h2>
                <p className="mt-1 text-sm text-[#A89A92]">
                  Operativ överblick — försäljningstrender och prenumerationshastighet.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Beställningar idag
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {analytics.ordersToday}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Beställningar (7 dagar)
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {analytics.ordersThisWeek}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Nya prenumeranter idag
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {analytics.signupsToday}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-wider text-[#A89A92]">
                      Nya prenumeranter (7 dagar)
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {analytics.signupsThisWeek}
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : null}

          <div className="space-y-8">
          {activeTab === "oversikt" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Orderhantering</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Granska inkommande beställningar och godkänn betalningar manuellt
            innan de räknas in i total omsättning.
          </p>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A89A92]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                type="search"
                value={orderSearchQuery}
                onChange={(event) => setOrderSearchQuery(event.target.value)}
                placeholder="Sök namn, e-post, order-ID eller adress…"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-xs text-white outline-none transition-all placeholder:text-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Status
                </span>
                <select
                  value={orderStatusFilter}
                  onChange={(event) =>
                    setOrderStatusFilter(event.target.value as OrderStatusFilter)
                  }
                  className={`${orderFilterClassName} w-full`}
                >
                  <option value="all">Alla</option>
                  <option value="pending">Väntar på betalning</option>
                  <option value="approved">Väntar på packning</option>
                  <option value="packed">Packad</option>
                  <option value="delivered">Levererad</option>
                  <option value="refunded">Återbetald</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Betalmetod
                </span>
                <select
                  value={orderPaymentFilter}
                  onChange={(event) =>
                    setOrderPaymentFilter(
                      event.target.value as OrderPaymentFilter,
                    )
                  }
                  className={`${orderFilterClassName} w-full`}
                >
                  <option value="all">Alla</option>
                  <option value="stripe_card">Stripe - Card</option>
                  <option value="crypto">Crypto / Bitcoin</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Sortera
                </span>
                <select
                  value={orderSortOption}
                  onChange={(event) =>
                    setOrderSortOption(event.target.value as OrderSortOption)
                  }
                  className={`${orderFilterClassName} w-full`}
                >
                  <option value="newest">Nyast först</option>
                  <option value="oldest">Äldst först</option>
                  <option value="highest">Högsta belopp</option>
                  <option value="lowest">Lägsta belopp</option>
                </select>
              </label>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-[#A89A92]">
              Inga beställningar ännu.
            </p>
          ) : filteredOrders.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-[#A89A92]">
              Inga beställningar matchar dina filter.
            </p>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-xl">
              <div className="block w-full min-w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-[11px] font-semibold uppercase tracking-widest text-[#ECE5D8] border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order-ID</th>
                    <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                      Kund
                    </th>
                    <th className="hidden whitespace-nowrap px-4 py-3 font-semibold md:table-cell">
                      Datum
                    </th>
                    <th className="px-4 py-3 font-semibold">Belopp</th>
                    <th className="hidden whitespace-nowrap px-4 py-3 font-semibold lg:table-cell">
                      Betalmetod
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Åtgärd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-white/5 text-xs text-[#CFC4BD] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-4 font-medium text-white">
                          <span className="font-mono text-xs">{order.id}</span>
                          <span className="mt-1 block text-xs text-[#A89A92] md:hidden">
                            {formatOrderDate(order.placedAt)}
                          </span>
                          {(order.customerName || order.customerEmail) && (
                            <span className="mt-1 block text-xs text-[#A89A92] lg:hidden">
                              {order.customerName ?? order.customerEmail}
                            </span>
                          )}
                        </td>
                        <td className="hidden px-4 py-4 lg:table-cell">
                          <p className="font-medium text-white">
                            {order.customerName ?? "—"}
                          </p>
                          {order.customerEmail && (
                            <p className="mt-0.5 text-xs text-[#A89A92]">
                              {order.customerEmail}
                            </p>
                          )}
                          {order.shippingAddress && (
                            <div className="mt-1 flex items-start gap-1.5">
                              <p className="line-clamp-2 min-w-0 flex-1 text-xs text-[#A89A92]">
                                {order.shippingAddress}
                              </p>
                              <button
                                type="button"
                                onClick={() => void copyShippingAddress(order)}
                                className="shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#A89A92] transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                                title="Kopiera namn och adress"
                                aria-label={`Kopiera leveransadress för ${order.id}`}
                              >
                                📋
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-[#A89A92] md:table-cell">
                          {formatOrderDate(order.placedAt)}
                        </td>
                        <td className="px-4 py-4 font-semibold text-white">
                          {formatSek(order.total)}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-4 lg:table-cell">
                          <AdminPaymentMethodBadge
                            paymentMethod={order.paymentMethod}
                            stripePaymentType={order.stripePaymentType}
                          />
                          {order.paymentMethod === PAYMENT_METHOD.STRIPE &&
                            order.stripeSessionId && (
                              <div className="mt-2 space-y-1">
                                <a
                                  href={getStripeDashboardSessionUrl(
                                    order.stripeSessionId,
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                  Visa i Stripe →
                                </a>
                                {(isWaitingForPackStatus(order.status) ||
                                  order.status === ORDER_STATUS.PACKED) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDestructiveConfirm({
                                        type: "refund",
                                        orderId: order.id,
                                        amount: order.total,
                                      })
                                    }
                                    disabled={isRefunding}
                                    className="block text-xs font-semibold text-red-300 hover:text-red-300 disabled:opacity-60"
                                  >
                                    Refund
                                  </button>
                                )}
                              </div>
                            )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${orderStatusClassName(order.status)}`}
                          >
                            {orderStatusBadgeLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            {order.status === ORDER_STATUS.PENDING &&
                            (order.paymentMethod === PAYMENT_METHOD.BITCOIN ||
                              !order.paymentMethod) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void updateOrderStatus(order.id, "approve")
                                }
                                disabled={updatingOrderId === order.id}
                                className="rounded-full border border-white/10 bg-[#ECE5D8]/10 px-2.5 py-1 text-[10px] font-medium uppercase whitespace-nowrap text-[#ECE5D8] transition hover:bg-[#ECE5D8]/20 disabled:opacity-60"
                              >
                                {updatingOrderId === order.id
                                  ? "Godkänner…"
                                  : "Godkänn BTC-betalning"}
                              </button>
                            ) : null}

                            {isFulfillmentStatus(order.status) ? (
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateOrderStatus(
                                      order.id,
                                      "waiting_pack",
                                    )
                                  }
                                  disabled={
                                    updatingOrderId === order.id ||
                                    isWaitingForPackStatus(order.status)
                                  }
                                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase whitespace-nowrap text-neutral-400 transition hover:bg-white/10 disabled:cursor-default disabled:opacity-50"
                                >
                                  Väntar på packning
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateOrderStatus(order.id, "pack")
                                  }
                                  disabled={
                                    updatingOrderId === order.id ||
                                    order.status === ORDER_STATUS.PACKED
                                  }
                                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase whitespace-nowrap text-neutral-400 transition hover:bg-white/10 disabled:cursor-default disabled:opacity-50"
                                >
                                  Packad
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateOrderStatus(order.id, "ship")
                                  }
                                  disabled={
                                    updatingOrderId === order.id ||
                                    order.status === ORDER_STATUS.DELIVERED
                                  }
                                  className="rounded-full border border-white/10 bg-[#ECE5D8]/10 px-2.5 py-1 text-[10px] font-medium uppercase whitespace-nowrap text-[#ECE5D8] transition hover:bg-[#ECE5D8]/20 disabled:cursor-default disabled:opacity-50"
                                >
                                  Levererad
                                </button>
                              </div>
                            ) : null}

                            {isWaitingForPackStatus(order.status) ||
                            order.status === ORDER_STATUS.PACKED ? (
                              order.paymentMethod === PAYMENT_METHOD.STRIPE ? (
                                <span className="text-xs text-[#A89A92]">
                                  Använd Refund
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateOrderStatus(order.id, "revert")
                                  }
                                  disabled={updatingOrderId === order.id}
                                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase whitespace-nowrap text-neutral-400 transition hover:bg-white/10 disabled:opacity-60"
                                >
                                  {updatingOrderId === order.id
                                    ? "Återställer…"
                                    : "Häv godkännande"}
                                </button>
                              )
                            ) : null}

                            {order.status === ORDER_STATUS.REFUNDED ? (
                              <span className="text-xs text-[#A89A92]">—</span>
                            ) : null}

                            <button
                              type="button"
                              onClick={() =>
                                setDestructiveConfirm({
                                  type: "delete",
                                  orderId: order.id,
                                  amount: order.total,
                                })
                              }
                              disabled={deletingOrderId === order.id}
                              className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
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
            </div>
          )}
        </section>
          )}

        {activeTab === "system" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            Nyhetsbrevsprenumeranter
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Alla e-postadresser som registrerats via nyhetsbrevet på startsidan.
          </p>

          {subscribers.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-[#A89A92]">
              Inga prenumeranter ännu.
            </p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-[11px] font-semibold uppercase tracking-widest text-[#ECE5D8] border-b border-white/10">
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
                      className="border-b border-white/5 text-xs text-[#CFC4BD] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-4 font-medium text-white">
                        {subscriber.email}
                      </td>
                      <td className="hidden px-4 py-4 text-[#A89A92] sm:table-cell">
                        {formatSubscriberDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            void handleRemoveSubscriber(subscriber.email)
                          }
                          disabled={removingEmail === subscriber.email}
                          className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
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
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            Smarta Kampanjpaneler
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Konverteringsdriven global banner med roterande meddelanden, stil och
            nedräkning.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Aktiva banner-rader
              </span>
              {config.banner.activeLines.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-[#A89A92]">
                  Inga aktiva rader — lägg till ditt första meddelande nedan.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {config.banner.activeLines.map((line, index) => (
                    <li
                      key={`${line}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <span className="text-sm font-medium text-white">
                        {line}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBannerLine(index)}
                        className="shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
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
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
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
                  className="shrink-0 rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
                >
                  + Lägg till
                </button>
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Banner-stil
              </span>
              <select
                value={config.banner.style}
                onChange={(event) =>
                  updateBanner("style", event.target.value as BannerStyle)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              >
                {BANNER_STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Text &amp; Bakgrunds-animering
              </span>
              <select
                value={config.banner.bannerAnimation}
                onChange={(event) =>
                  updateBanner(
                    "bannerAnimation",
                    event.target.value as BannerAnimation,
                  )
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              >
                {BANNER_ANIMATION_OPTIONS.map((option) => (
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
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
              />
              <span className="text-sm font-medium text-white">
                Visa nedräkningstimer i bannern
              </span>
            </label>

            <fieldset className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Tidsformat i bannern
              </legend>
              <div className="mt-2 space-y-2">
                {BANNER_TIME_DISPLAY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                      config.banner.timeDisplayMode === option.value
                        ? "border-white/20 bg-white/10 shadow-sm"
                        : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bannerTimeDisplayMode"
                      value={option.value}
                      checked={config.banner.timeDisplayMode === option.value}
                      onChange={() =>
                        updateBanner("timeDisplayMode", option.value)
                      }
                      className="mt-0.5 h-4 w-4 border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                    />
                    <span className="text-sm font-medium text-white">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Anpassad text för slutdatum (t.ex. &apos;Söndag 23:59&apos; —
                Lämna tom för att använda kalenderdatumet)
              </span>
              <input
                type="text"
                value={config.banner.customDateString}
                onChange={(event) =>
                  updateBanner("customDateString", event.target.value)
                }
                placeholder="Söndag kl 23:59"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>

            {config.banner.countdownEnabled && (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>
            )}
          </div>
        </section>
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Sajtkonfiguration</h2>
              <p className="mt-1 text-sm text-[#A89A92]">
                Kampanj-hero, header-logotyp och butikskontakt styr den publika
                startsidan.
              </p>
            </div>
            <Link
              href="/admin/site-settings"
              className="text-sm font-medium text-[#ECE5D8] hover:text-white"
            >
              Fullständig sajtinställning →
            </Link>
          </div>

          {config && (
            <div className="mt-6">
              <HeroCampaignForm
                siteSettings={config.siteSettings}
                products={config.products}
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
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Header Logo Path (bild-URL)
              </span>
              <input
                value={config?.siteSettings.logoPath ?? ""}
                onChange={(event) =>
                  updateSiteSetting("logoPath", event.target.value)
                }
                placeholder="/logo.png"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
              <p className="mt-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-xs text-[#A89A92]">
                Logotyp-uppladdning: klistra in sökväg till fil i{" "}
                <code className="rounded bg-white/10 px-1">/public</code> (t.ex.{" "}
                <code className="rounded bg-white/10 px-1">/logo.png</code>)
              </p>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
              <p className="mt-2 text-xs text-[#A89A92]">
                Visas i kontaktsektionen och används för kundkommunikation.
              </p>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
              <p className="mt-2 text-xs text-[#A89A92]">
                Visas i kontaktsektionen och länkar till din Telegram-boutique.
              </p>
            </label>
          </div>
        </section>
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Fraktinställningar</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Styr standardfrakt och tröskelvärde för fri frakt i kassan.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSaveShipping}
            disabled={isSavingShipping}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingShipping ? "Sparar…" : "Spara ändringar"}
          </button>
        </section>
          )}

        {activeTab === "betalning" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Crypto Payout Wallets</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
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
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  {label}
                </span>
                <input
                  value={config.cryptoWallets[key]}
                  onChange={(event) => updateWallet(key, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3 font-mono text-xs outline-none focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-[#A89A92]">
            Klistra in en rå adress eller full betalningslänk. Hemsidan genererar
            automatiskt en ren, högupplöst QR-kod anpassad för kameror och Trust
            Wallet.
          </p>
        </section>
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Products Manager</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Lägg till eller ta bort produkter som visas i butiken.
          </p>

          <div className="mt-6 space-y-4">
            {config.products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 ${PRODUCT_IMAGE_FRAME_CLASS}`}
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
                  <p className="font-semibold text-white">
                    {product.name_sv || product.title}
                  </p>
                  <p className="text-sm text-[#CFC4BD]">
                    {product.description_sv || product.description}
                  </p>
                  <p className="text-xs text-[#A89A92]">
                    EN: {product.name_en || "—"}
                  </p>
                  <p className="mt-1 text-xs text-[#A89A92]">
                    {product.price} SEK ·{" "}
                    {PRODUCT_STOCK_STATUS_OPTIONS.find(
                      (option) => option.value === product.status,
                    )?.label ?? "I lager"}{" "}
                    · {product.image}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#CFC4BD]">
                      <input
                        type="checkbox"
                        checked={config.bestSellerProductIds.includes(product.id)}
                        onChange={() => toggleBestSeller(product.id)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                      />
                      Bästsäljare
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#CFC4BD]">
                      <input
                        type="checkbox"
                        checked={config.premiumProductIds.includes(product.id)}
                        onChange={() => togglePremium(product.id)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                      />
                      Premium
                    </label>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditProduct(product)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white"
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">
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
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
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
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
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
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
              <div className="sm:col-span-2">
                <ProductSaleFields
                  values={{
                    isOnSale: newProduct.isOnSale,
                    saleType: newProduct.saleType,
                    saleValue: newProduct.saleValue,
                  }}
                  onChange={(saleValues) =>
                    setNewProduct((current) => ({ ...current, ...saleValues }))
                  }
                />
              </div>
              <input
                value={newProduct.image}
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    image: event.target.value,
                  }))
                }
                placeholder="Bild-URL (t.ex. /produkt.png)"
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none sm:col-span-2"
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
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none sm:col-span-2"
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
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-product-included-items"
                  className="mb-1.5 block text-xs font-medium text-[#CFC4BD]"
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-product-size-label"
                  className="mb-1.5 block text-xs font-medium text-[#CFC4BD]"
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-[#A89A92]">
                  Ange varianter som namn:pris separerade med kommatecken (t.ex.
                  10 mg:550, 20 mg:850). Lämna tom om produkten saknar val.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-product-status"
                  className="mb-1.5 block text-xs font-medium text-[#CFC4BD]"
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
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
              className="mt-4 rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
            >
              + Lägg till produkt
            </button>
          </div>
        </section>
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            Erbjudanden &amp; Kampanjregler
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Automatiska erbjudanden som &quot;3 för 2&quot; och &quot;Köp 2 få
            100 kr rabatt&quot;. Aktiveras direkt i varukorgen när kriterierna
            uppfylls.
          </p>

          <div className="mt-6 space-y-4">
            {(config.campaignRules ?? []).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-[#A89A92]">
                Inga kampanjregler ännu.
              </p>
            ) : (
              (config.campaignRules ?? []).map((rule) => {
                const scopeLabel =
                  rule.productScope === "all"
                    ? "Alla produkter"
                    : (config.products.find(
                        (product) => product.id === rule.productScope,
                      )?.name_sv ||
                      config.products.find(
                        (product) => product.id === rule.productScope,
                      )?.title ||
                      rule.productScope);
                const detail =
                  rule.type === "bundle"
                    ? `${rule.bundleBuy} för ${rule.bundlePay} (billigaste gratis)`
                    : `Köp ${rule.buyQuantity} st → ${rule.discountAmount} kr rabatt`;

                return (
                  <div
                    key={rule.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">{rule.name}</p>
                      <p className="text-sm text-[#CFC4BD]">
                        {detail} · {scopeLabel}
                      </p>
                      <p className="mt-1 text-xs text-[#A89A92]">
                        {rule.active ? "Aktiv" : "Inaktiv"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCampaignRule(rule.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          rule.active
                            ? "bg-[#ECE5D8] text-[#0F0C0B] hover:bg-white"
                            : "border border-white/10 bg-white/5 text-[#CFC4BD] hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {rule.active ? "På" : "Av"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCampaignRule(rule.id)}
                        className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">
              Lägg till ny kampanjregel
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Erbjudandetyp
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["quantity_flat", "Kvantitetsrabatt i kronor"],
                      ["bundle", "Bundle Deals (t.ex. 3 för 2)"],
                    ] as const
                  ).map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setNewCampaignRule((current) => ({
                          ...current,
                          type,
                          name: "",
                        }))
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        newCampaignRule.type === type
                          ? "bg-[#ECE5D8] text-white"
                          : "border border-white/10 bg-white/5 text-[#CFC4BD] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Visningsnamn (valfritt)
                </span>
                <input
                  value={newCampaignRule.name}
                  onChange={(event) =>
                    setNewCampaignRule((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder={
                    newCampaignRule.type === "bundle"
                      ? "3 för 2"
                      : "Köp 2 få 100 kr rabatt"
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              {newCampaignRule.type === "quantity_flat" ? (
                <>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                      Köp antal (X)
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={newCampaignRule.buyQuantity || ""}
                      onChange={(event) =>
                        setNewCampaignRule((current) => ({
                          ...current,
                          buyQuantity: Number(event.target.value),
                        }))
                      }
                      placeholder="2"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                      Rabatt i kronor (Y)
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={newCampaignRule.discountAmount || ""}
                      onChange={(event) =>
                        setNewCampaignRule((current) => ({
                          ...current,
                          discountAmount: Number(event.target.value),
                        }))
                      }
                      placeholder="100"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                      Köp antal (t.ex. 3)
                    </span>
                    <input
                      type="number"
                      min={2}
                      value={newCampaignRule.bundleBuy || ""}
                      onChange={(event) =>
                        setNewCampaignRule((current) => ({
                          ...current,
                          bundleBuy: Number(event.target.value),
                        }))
                      }
                      placeholder="3"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                      Betala för (t.ex. 2)
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={newCampaignRule.bundlePay || ""}
                      onChange={(event) =>
                        setNewCampaignRule((current) => ({
                          ...current,
                          bundlePay: Number(event.target.value),
                        }))
                      }
                      placeholder="2"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                    />
                  </label>
                </>
              )}

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Målprodukt
                </span>
                <select
                  value={newCampaignRule.productScope}
                  onChange={(event) =>
                    setNewCampaignRule((current) => ({
                      ...current,
                      productScope: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                >
                  <option value="all">Alla produkter</option>
                  {config.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name_sv || product.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={newCampaignRule.active}
                  onChange={(event) =>
                    setNewCampaignRule((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                />
                <span className="text-sm font-medium text-[#CFC4BD]">
                  Aktivera direkt när sparad
                </span>
              </label>
            </div>
            <button
              type="button"
              onClick={addCampaignRule}
              className="mt-4 rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
            >
              + Lägg till kampanjregel
            </button>
          </div>
        </section>
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Rabatthanterare</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
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
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {discount.code}
                    </p>
                    <p className="text-sm text-[#CFC4BD]">
                      {discount.type === "percent"
                        ? `${discount.value}% rabatt`
                        : `${discount.value} SEK avdrag`}{" "}
                      · {scopeLabel}
                    </p>
                    <p className="mt-1 text-xs text-[#A89A92]">
                      Användning: {discount.usageCount}
                      {discount.usageLimit > 0
                        ? ` / ${discount.usageLimit}`
                        : " / ∞"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDiscount(discount.id)}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    Ta bort
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">
              Lägg till ny rabattkod
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <div className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                          ? "bg-[#ECE5D8] text-white"
                          : "border border-white/10 bg-white/5 text-[#CFC4BD] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
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
              className="mt-4 rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
            >
              + Lägg till rabattkod
            </button>
          </div>
        </section>
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            Influencer-samarbeten
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Spåra betalda TikTok-partnerskap via{" "}
            <code className="rounded bg-white/10 px-1 text-[#ECE5D8]">?ref=handle</code> och
            kampanjkoder.
          </p>

          {config.influencers.length === 0 && influencerStats.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-[#A89A92]">
              Inga influencers registrerade ännu.
            </p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-[11px] font-semibold uppercase tracking-widest text-[#ECE5D8] border-b border-white/10">
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
                        className="border-b border-white/5 text-xs text-[#CFC4BD] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-4 font-medium text-white">
                          {influencer.handle}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#CFC4BD]">
                          {influencer.promoCode || "—"}
                        </td>
                        <td className="px-4 py-4 text-[#CFC4BD]">
                          {influencer.commissionPercent}%
                        </td>
                        <td className="px-4 py-4 text-[#CFC4BD]">
                          {stats?.visits ?? 0}
                        </td>
                        <td className="px-4 py-4 text-[#CFC4BD]">
                          {stats?.purchases ?? 0}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => removeInfluencer(influencer.id)}
                            className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
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

          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">
              Lägg till influencer
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
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
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={addInfluencer}
              className="mt-4 rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
            >
              + Lägg till influencer
            </button>
          </div>
        </section>
          )}

        {activeTab === "system" && (
        <>
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            System Integration Settings
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Telegram-botinställningar för ordernotiser. Sparas säkert i
            butikskonfigurationen — inget behov av att redigera .env manuellt.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3 font-mono text-xs outline-none focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Telegram Chat ID
              </span>
              <input
                value={config.systemIntegration.telegramChatId}
                onChange={(event) =>
                  updateSystemIntegration("telegramChatId", event.target.value)
                }
                placeholder="123456789"
                className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3 font-mono text-xs outline-none focus:border-[#ECE5D8] focus:outline-none"
              />
              <p className="mt-2 text-xs text-[#A89A92]">
                Ditt personliga chat-ID dit ordermeddelanden skickas vid
                checkout.
              </p>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            Marknadsföring &amp; Spårning
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Analyspixlar laddas automatiskt i butikens publika layout.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                TikTok Pixel ID
              </span>
              <input
                value={config.marketingTracking.tiktokPixelId}
                onChange={(event) =>
                  updateMarketingTracking("tiktokPixelId", event.target.value)
                }
                placeholder="CXXXXXXXXXXXXXXX"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>
          </div>
        </section>
        </>
          )}

        {activeTab === "kampanj" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">FAQ-hantering</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Hantera frågor och svar som visas i accordionen på startsidan.
          </p>

          <div className="mt-6 space-y-4">
            {config.faqs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-[#A89A92]">
                Inga FAQ-poster ännu.
              </p>
            ) : (
              config.faqs.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                      Fråga
                    </span>
                    <input
                      value={entry.question}
                      onChange={(event) =>
                        updateFaq(entry.id, "question", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                      Svar
                    </span>
                    <textarea
                      value={entry.answer}
                      onChange={(event) =>
                        updateFaq(entry.id, "answer", event.target.value)
                      }
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeFaq(entry.id)}
                    className="mt-3 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    Ta bort
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">
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
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
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
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={addFaq}
              className="mt-4 rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
            >
              + Lägg till FAQ
            </button>
          </div>
        </section>
          )}

        {activeTab === "oversikt" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Systemloggar</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Senaste backend-fel från checkout och integrationer.
          </p>

          {systemLogs.length === 0 ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#ECE5D8]/10 px-5 py-2.5 text-sm font-semibold text-[#ECE5D8]">
              🟢 Alla system fungerar perfekt
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {systemLogs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#A89A92]">
                    <span className="font-mono">
                      {formatLogTimestamp(log.timestamp)}
                    </span>
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 font-semibold uppercase tracking-wide text-red-300">
                      {log.source}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-white">
                    {log.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
          )}

        {activeTab === "recensioner" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Kundrecensioner</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Granska inkomna recensioner. Endast godkända recensioner visas i butiken.
          </p>

          {isLoadingReviews ? (
            <p className="mt-8 text-sm text-[#A89A92]">Laddar recensioner…</p>
          ) : customerReviews.length === 0 ? (
            <p className="mt-8 text-sm text-[#A89A92]">
              Inga recensioner har skickats in ännu.
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                    <th className="px-3 py-3">Kund</th>
                    <th className="px-3 py-3">Produkt</th>
                    <th className="px-3 py-3">Betyg</th>
                    <th className="px-3 py-3">Recension</th>
                    <th className="px-3 py-3">Datum</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Åtgärder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customerReviews.map((review) => {
                    const isPending = review.status === REVIEW_STATUS.PENDING;
                    const isApproving = approvingReviewId === review.id;
                    const isDeleting = deletingReviewId === review.id;
                    const isReplying = replyingReviewId === review.id;
                    const isSavingReply = savingReplyId === review.id;

                    return (
                      <tr key={review.id} className="align-top">
                        <td className="px-3 py-4 font-semibold text-white">
                          {review.name}
                          {review.isVerified && (
                            <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              Verifierat köp
                            </span>
                          )}
                          {review.email ? (
                            <span className="mt-1 block text-xs font-medium text-[#A89A92]">
                              {review.email}
                            </span>
                          ) : (
                            <span className="mt-1 block text-[10px] font-medium text-[#A89A92]">
                              Ingen e-post
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          {review.productTag ? (
                            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#ECE5D8]">
                              {review.productTag}
                            </span>
                          ) : (
                            <span className="text-xs text-[#A89A92]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            {review.rating}
                            <span aria-hidden>★</span>
                          </span>
                        </td>
                        <td className="max-w-xs px-3 py-4 text-[#CFC4BD]">
                          <p className="line-clamp-4 whitespace-pre-wrap">
                            {review.text}
                          </p>
                          {review.adminReply ? (
                            <div className="mt-3 rounded-xl border border-white/10 bg-white/5/70 px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-[#ECE5D8]">
                                Admin-svar
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-[#CFC4BD] whitespace-pre-wrap">
                                {review.adminReply}
                              </p>
                            </div>
                          ) : null}
                          {isReplying ? (
                            <div className="mt-3 space-y-2">
                              <textarea
                                value={
                                  replyDrafts[review.id] ??
                                  review.adminReply ??
                                  ""
                                }
                                onChange={(event) =>
                                  setReplyDrafts((current) => ({
                                    ...current,
                                    [review.id]: event.target.value,
                                  }))
                                }
                                rows={4}
                                maxLength={2000}
                                placeholder="Skriv ditt svar till kunden…"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#ECE5D8] focus:outline-none"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleReplyToReview(review.id)
                                  }
                                  disabled={isSavingReply}
                                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-[#ECE5D8] transition hover:bg-white/10 disabled:opacity-60"
                                >
                                  {isSavingReply ? "Sparar…" : "Skicka svar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyingReviewId(null)}
                                  disabled={isSavingReply}
                                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-[#CFC4BD] transition hover:bg-white/10 hover:text-white disabled:opacity-60"
                                >
                                  Avbryt
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-[#A89A92]">
                          {new Date(review.createdAt).toLocaleDateString("sv-SE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-3 py-4">
                          {isPending ? (
                            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase text-neutral-400">
                              Väntar på godkännande
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-white/10 bg-[#ECE5D8]/10 px-2.5 py-1 text-[10px] font-medium uppercase text-[#ECE5D8]">
                              Godkänd
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => void handleApproveReview(review.id)}
                                disabled={isApproving || isDeleting || isSavingReply}
                                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[#ECE5D8]/10 px-4 py-2 text-xs font-bold uppercase text-[#ECE5D8] transition hover:bg-[#ECE5D8]/20 disabled:opacity-60"
                              >
                                {isApproving ? "Godkänner…" : "Godkänn"}
                              </button>
                            )}
                            {!isReplying ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReviewId(review.id);
                                  setReplyDrafts((current) => ({
                                    ...current,
                                    [review.id]:
                                      current[review.id] ??
                                      review.adminReply ??
                                      "",
                                  }));
                                }}
                                disabled={isApproving || isDeleting || isSavingReply}
                                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-[#ECE5D8] transition hover:bg-white/5 disabled:opacity-60"
                              >
                                Svara
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleDeleteReview(review.id)}
                              disabled={isApproving || isDeleting || isSavingReply}
                              className="inline-flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                            >
                              {isDeleting ? "Tar bort…" : "Ta bort"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}

        {activeTab === "lager" && config && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Lagerhantering</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Ange lagerantal per produktvariant. Aktivera synlighet för att visa
            lagerstatus för köpare på produktsidan.
          </p>

          <div className="mt-6 space-y-6">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <div>
                <span className="block text-sm font-semibold text-white">
                  Visa lagerstatus för köpare
                </span>
                <span className="mt-1 block text-xs text-[#A89A92]">
                  Visar pulserande lageretikett vid lågt lager och &quot;Slutsåld&quot; vid 0.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.stockManagement.showStockToBuyers}
                onChange={(event) =>
                  updateStockManagement("showStockToBuyers", event.target.checked)
                }
                className="h-5 w-5 rounded border-white/20 text-[#ECE5D8] focus:ring-[#ECE5D8]"
              />
            </label>

            <label className="block max-w-xs">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Tröskel för lågt lager
              </span>
              <input
                type="number"
                min={1}
                value={config.stockManagement.lowStockThreshold}
                onChange={(event) =>
                  updateStockManagement(
                    "lowStockThreshold",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
              <span className="mt-1 block text-xs text-[#A89A92]">
                Vid detta antal eller lägre visas &quot;Endast X kvar i lager!&quot;
              </span>
            </label>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Lager per variant</h3>
              {buildAdminVariantStockRows(config).length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-[#A89A92]">
                  Lägg till produkter under Kampanj för att hantera lager.
                </p>
              ) : (
                buildAdminVariantStockRows(config).map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {row.productName}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#ECE5D8]">
                        {row.variantLabel}
                      </p>
                    </div>
                    <label className="flex items-center gap-3 sm:min-w-[10rem]">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                        Antal
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={config.stockManagement.counts[row.key] ?? 0}
                        onChange={(event) =>
                          updateVariantStockCount(
                            row.key,
                            Number(event.target.value),
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-[#ECE5D8] sm:w-28"
                      />
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        )}

        {activeTab === "navigation" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Navigation</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Styr synlighet och visningsnamn för menylänkar och widgets.
          </p>

          <div className="mt-6 space-y-4">
            {SITE_NAV_KEYS.map((key) => {
              const item = config.siteNavigation[key];
              const meta = SITE_NAV_ADMIN_META[key];

              return (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {meta.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#A89A92]">{meta.hint}</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.hide_navbar}
                        onChange={(event) =>
                          updateNavItem(key, "hide_navbar", event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                      />
                      <span className="text-sm leading-snug text-[#CFC4BD]">
                        <span className="block font-semibold text-white">
                          Dölj endast i toppmenyn
                        </span>
                        <span className="mt-0.5 block text-xs text-[#A89A92]">
                          Länken försvinner från header och mobilmeny.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.hide_section}
                        onChange={(event) =>
                          updateNavItem(key, "hide_section", event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                      />
                      <span className="text-sm leading-snug text-[#CFC4BD]">
                        <span className="block font-semibold text-white">
                          Dölj helt från hemsidan
                        </span>
                        <span className="mt-0.5 block text-xs text-[#A89A92]">
                          Sektionen eller widgeten renderas inte på startsidan.
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                        Visningsnamn (SV)
                      </span>
                      <input
                        value={item.label_sv}
                        maxLength={SITE_NAV_LABEL_MAX}
                        onChange={(event) =>
                          updateNavItem(key, "label_sv", event.target.value)
                        }
                        placeholder={meta.title}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                        Display name (EN)
                      </span>
                      <input
                        value={item.label_en}
                        maxLength={SITE_NAV_LABEL_MAX}
                        onChange={(event) =>
                          updateNavItem(key, "label_en", event.target.value)
                        }
                        placeholder={meta.title}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
          )}

        <div className="flex justify-end pb-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-14 items-center justify-center rounded-full bg-[#ECE5D8] px-10 text-base font-bold text-white shadow-lg shadow-black/40 transition hover:bg-white/50 disabled:opacity-60"
          >
            {isSaving ? "Sparar…" : "Spara ändringar"}
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
