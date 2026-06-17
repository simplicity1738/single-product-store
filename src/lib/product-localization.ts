import type { Locale } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import type { ProductId } from "@/lib/product";
import type { ConfigProduct } from "@/lib/store-config";

function isKnownProductId(id: string): id is ProductId {
  return id in translations.sv.products.items;
}

function getCatalogFallback(
  productId: string,
  locale: Locale,
  field: "name" | "description",
): string {
  if (!isKnownProductId(productId)) return "";
  return field === "name"
    ? translations[locale].products.items[productId].name
    : translations[locale].products.items[productId].description;
}

export function getLocalizedProductName(
  entry: ConfigProduct | undefined,
  productId: string,
  locale: Locale,
): string {
  if (locale === "en") {
    return (
      entry?.name_en?.trim() ||
      getCatalogFallback(productId, "en", "name") ||
      entry?.name_sv?.trim() ||
      entry?.title?.trim() ||
      productId
    );
  }

  return (
    entry?.name_sv?.trim() ||
    entry?.title?.trim() ||
    getCatalogFallback(productId, "sv", "name") ||
    productId
  );
}

export function getLocalizedProductDescription(
  entry: ConfigProduct | undefined,
  productId: string,
  locale: Locale,
): string {
  if (locale === "en") {
    return (
      entry?.description_en?.trim() ||
      getCatalogFallback(productId, "en", "description") ||
      entry?.description_sv?.trim() ||
      entry?.description?.trim() ||
      ""
    );
  }

  return (
    entry?.description_sv?.trim() ||
    entry?.description?.trim() ||
    getCatalogFallback(productId, "sv", "description") ||
    ""
  );
}

export const PRODUCT_LOCALIZED_FIELD_LIMITS = {
  name: 160,
  description: 2000,
} as const;

export function buildLocalizedProductFields(input: {
  name_sv?: string;
  name_en?: string;
  description_sv?: string;
  description_en?: string;
  title?: string;
  description?: string;
  id?: string;
}): Pick<
  ConfigProduct,
  "name_sv" | "name_en" | "description_sv" | "description_en" | "title" | "description"
> {
  const name_sv = (input.name_sv ?? input.title ?? "").trim();
  const description_sv = (input.description_sv ?? input.description ?? "").trim();
  const productId = input.id ?? "";

  const name_en = (input.name_en ?? "").trim();
  const description_en = (input.description_en ?? "").trim();

  return {
    name_sv,
    name_en: name_en || (productId ? getCatalogFallback(productId, "en", "name") : "") || name_sv,
    description_sv,
    description_en:
      description_en ||
      (productId ? getCatalogFallback(productId, "en", "description") : "") ||
      description_sv,
    title: name_sv,
    description: description_sv,
  };
}
