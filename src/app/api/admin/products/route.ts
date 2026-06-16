import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { updateStoreProduct } from "@/lib/store-config.server";
import type { ProductStockStatus } from "@/lib/product-stock";
import {
  ADMIN_PRODUCT_FIELD_LIMITS,
  sanitizeIdentifier,
  sanitizePlainText,
} from "@/lib/sanitize";

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      productId?: string;
      title?: string;
      description?: string;
      price?: number;
      image?: string;
      variantsInput?: string;
      sizeLabel?: string;
      bestSeller?: boolean;
      premium?: boolean;
      status?: ProductStockStatus;
      includedItems?: string;
    };

    const productId = body.productId
      ? sanitizeIdentifier(body.productId, ADMIN_PRODUCT_FIELD_LIMITS.productId)
      : "";
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Produkt-ID saknas." },
        { status: 400 },
      );
    }

    const title = body.title
      ? sanitizePlainText(body.title, ADMIN_PRODUCT_FIELD_LIMITS.title)
      : "";
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Produkttitel krävs." },
        { status: 400 },
      );
    }

    const variantsInput =
      body.variantsInput !== undefined
        ? sanitizePlainText(
            body.variantsInput,
            ADMIN_PRODUCT_FIELD_LIMITS.variantsInput,
          )
        : body.sizeLabel !== undefined
          ? sanitizePlainText(body.sizeLabel, ADMIN_PRODUCT_FIELD_LIMITS.sizeLabel)
          : undefined;

    const result = await updateStoreProduct(productId, {
      title,
      description: body.description
        ? sanitizePlainText(
            body.description,
            ADMIN_PRODUCT_FIELD_LIMITS.description,
          )
        : "",
      price: Number(body.price),
      image: body.image
        ? sanitizePlainText(body.image, ADMIN_PRODUCT_FIELD_LIMITS.image) ||
          "/logo.png"
        : "/logo.png",
      ...(variantsInput !== undefined ? { variantsInput } : {}),
      includedItems:
        body.includedItems !== undefined
          ? sanitizePlainText(
              body.includedItems,
              ADMIN_PRODUCT_FIELD_LIMITS.includedItems,
            )
          : undefined,
      bestSeller: body.bestSeller,
      premium: body.premium,
      status: body.status,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Produkten hittades inte." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produkten uppdaterades.",
      product: result.product,
      bestSellerProductIds: result.bestSellerProductIds,
      premiumProductIds: result.premiumProductIds,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte uppdatera produkten." },
      { status: 500 },
    );
  }
}
