"use client";

import { useEffect } from "react";
import ProductImage from "@/components/ProductImage";
import PaymentTrustBadges from "@/components/PaymentTrustBadges";
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
  } = useStoreConfig();
  const localeCode = locale === "sv" ? "sv-SE" : "en-US";

  const summary = calculateOrderTotal(cart, null);
  const subtotal = summary.subtotal;

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
        className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-md transition-opacity duration-300 ${
          isCartOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col border-l border-rose-100 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        aria-hidden={!isCartOpen}
      >
        <div className="flex items-center justify-between border-b border-rose-100 px-5 py-5 sm:px-6">
          <div>
            <h2
              id="cart-drawer-title"
              className="text-xl font-bold text-zinc-900"
            >
              {t.cart.title}
            </h2>
            {cartItemCount > 0 && (
              <p className="mt-0.5 text-sm text-zinc-500">
                {cartItemCount}{" "}
                {cartItemCount === 1 ? t.cart.itemSingular : t.cart.itemPlural}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-zinc-900"
            aria-label={t.cart.close}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-6 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
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
              <p className="mt-4 text-sm font-medium text-zinc-600">
                {t.cart.empty}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {summary.lineItems.map((line) => {
                const label = getLineLabel(
                  line.productId,
                  line.variantMg,
                  line.selectedStrength,
                  line.campaignAddonId,
                );
                const productImage =
                  catalogProducts.find(
                    (product) => product.id === line.productId,
                  )?.image ?? "/logo.png";
                const catalogProduct = catalogProducts.find(
                  (product) => product.id === line.productId,
                );
                const maxQuantity =
                  line.productId === CAMPAIGN_ADDON_PRODUCT_ID || !catalogProduct
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
                    className="flex gap-4 rounded-2xl border border-rose-100 bg-rose-50/30 p-4"
                  >
                    <div
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-white ${PRODUCT_IMAGE_FRAME_CLASS}`}
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
                      <p className="font-semibold text-zinc-900">{label}</p>
                      {line.selectedStrength && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {line.selectedStrength}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-rose-600">
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-sm font-medium text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50"
                          aria-label={`${t.order.decreaseQty}: ${label}`}
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-zinc-900">
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-sm font-medium text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`${t.order.increaseQty}: ${label}`}
                        >
                          +
                        </button>
                      </div>
                      {atMaxStock ? (
                        <p className="mt-2 text-xs font-medium text-amber-700">
                          {t.cart.maxStockReached}
                        </p>
                      ) : null}
                    </div>

                    <p className="shrink-0 text-sm font-bold text-zinc-900">
                      {formatCurrency(line.lineSubtotal, localeCode)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-rose-100 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-600">{t.cart.subtotal}</span>
            <span className="text-lg font-bold text-zinc-900">
              {formatCurrency(subtotal, localeCode)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-400/25 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.cart.checkout}
          </button>

          <PaymentTrustBadges className="mt-5" hideLabel />
        </div>
      </aside>
    </>
  );
}
