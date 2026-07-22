"use client";

import { useEffect } from "react";
import ProductImage from "@/components/ProductImage";
import PaymentTrustBadges from "@/components/PaymentTrustBadges";
import CheckoutTrustSignals from "@/components/CheckoutTrustSignals";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProductSelection } from "@/contexts/ProductContext";
import { useStoreConfig } from "@/contexts/StoreConfigContext";
import { formatCurrency } from "@/lib/product";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";
import {
  getMaxOrderableQuantity,
  getVariantLabelForSelection,
} from "@/lib/stock-management";
import { CAMPAIGN_ADDON_PRODUCT_ID } from "@/lib/campaign-addons";
import { PRESENTATION_BUNDLE_PRODUCT_ID } from "@/lib/presentation-bundle";

export default function CartDrawer() {
  const { locale, t } = useLanguage();
  const {
    cart,
    isCartOpen,
    closeCart,
    updateCartQuantity,
    cartItemCount,
  } = useProductSelection();
  const {
    calculateOrderTotal,
    getLineLabel,
    catalogProducts,
    stockManagement,
    siteSettings,
  } = useStoreConfig();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const summary = calculateOrderTotal(cart, null);
  const subtotal = summary.subtotal;
  const campaignDiscount = summary.campaignDiscount;
  const cartNet = Math.max(0, subtotal - campaignDiscount);
  const appliedCampaignLabel = summary.appliedCampaigns
    .map((campaign) => campaign.name)
    .join(" · ");

  useEffect(() => {
    if (!isCartOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isCartOpen, closeCart]);

  function handleCheckout() {
    closeCart();
    window.requestAnimationFrame(() => {
      document
        .getElementById("checkout-form")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col justify-between border-l border-white/10 bg-[#181312] text-white shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        aria-hidden={!isCartOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <h2
              id="cart-drawer-title"
              className="text-2xl font-serif text-white"
            >
              {t.cart.title}
            </h2>
            {cartItemCount > 0 && (
              <p className="mt-0.5 text-sm text-[#CFC4BD]">
                {cartItemCount}{" "}
                {cartItemCount === 1 ? t.cart.itemSingular : t.cart.itemPlural}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center text-lg text-neutral-400 transition hover:text-white"
            aria-label={t.cart.close}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#ECE5D8]/10 text-[#ECE5D8]">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-[#CFC4BD]">
                {t.cart.empty}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {summary.lineItems.map((line) => {
                const label = getLineLabel(
                  line.productId,
                  line.variantMg,
                  line.selectedStrength,
                  line.campaignAddonId,
                );
                const productImage =
                  line.productId === PRESENTATION_BUNDLE_PRODUCT_ID
                    ? (siteSettings?.presentationBundle?.imagePath ??
                      "/simplicity-presentation-set.png")
                    : (catalogProducts.find(
                        (product) => product.id === line.productId,
                      )?.image ?? "/logo.png");
                const catalogProduct = catalogProducts.find(
                  (product) => product.id === line.productId,
                );
                const maxQuantity =
                  line.productId === CAMPAIGN_ADDON_PRODUCT_ID ||
                  line.productId === PRESENTATION_BUNDLE_PRODUCT_ID ||
                  !catalogProduct
                    ? 99
                    : getMaxOrderableQuantity(
                        stockManagement,
                        line.productId,
                        getVariantLabelForSelection(
                          catalogProduct,
                          line.variantMg,
                          line.selectedStrength,
                        ),
                      );
                const atMaxStock = line.quantity >= maxQuantity;

                return (
                  <li
                    key={`${line.productId}-${line.variantMg}-${line.selectedStrength ?? ""}-${line.campaignAddonId ?? ""}`}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white"
                  >
                    <div
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 ${PRODUCT_IMAGE_FRAME_CLASS}`}
                    >
                      <ProductImage
                        src={productImage}
                        alt={label}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{label}</p>
                      {line.selectedStrength && (
                        <p className="mt-0.5 text-xs text-[#CFC4BD]">
                          {line.selectedStrength}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-[#ECE5D8]">
                        {formatCurrency(line.unitPrice, localeCode)}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              line.productId,
                              line.variantMg,
                              line.quantity - 1,
                              line.selectedStrength,
                              line.campaignAddonId,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-medium text-white transition hover:bg-white/20"
                          aria-label={`${t.order.decreaseQty}: ${label}`}
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-white">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              line.productId,
                              line.variantMg,
                              line.quantity + 1,
                              line.selectedStrength,
                              line.campaignAddonId,
                            )
                          }
                          disabled={atMaxStock}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`${t.order.increaseQty}: ${label}`}
                        >
                          +
                        </button>
                      </div>
                      {atMaxStock ? (
                        <p className="mt-2 text-xs font-medium text-amber-300">
                          {t.cart.maxStockReached}
                        </p>
                      ) : null}
                    </div>

                    <p className="shrink-0 text-sm font-bold text-white">
                      {formatCurrency(line.lineSubtotal, localeCode)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#181312] px-5 py-5 sm:px-6">
          {summary.appliedCampaigns.length > 0 && (
            <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              🎉 Kampanj tillämpad: {appliedCampaignLabel}!
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#CFC4BD]">
              {t.cart.subtotal}
            </span>
            <span className="text-lg font-semibold text-white">
              {formatCurrency(subtotal, localeCode)}
            </span>
          </div>

          {campaignDiscount > 0 && (
            <div className="mt-2 flex items-center justify-between text-sm text-emerald-300">
              <span className="font-medium">Kampanjrabatt</span>
              <span className="font-semibold">
                {formatCurrency(-campaignDiscount, localeCode)}
              </span>
            </div>
          )}

          {campaignDiscount > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-semibold text-white">Att betala</span>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(cartNet, localeCode)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="mt-4 w-full rounded-xl bg-[#ECE5D8] py-4 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.cart.checkout}
          </button>

          <CheckoutTrustSignals className="mt-4" />

          <PaymentTrustBadges className="mt-5" hideLabel />
        </div>
      </aside>
    </>
  );
}
