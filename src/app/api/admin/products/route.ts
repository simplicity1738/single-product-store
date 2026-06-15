import { NextResponse } from "next/server";
import { updateStoreProduct } from "@/lib/store-config.server";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string;
      title?: string;
      description?: string;
      price?: number;
      image?: string;
      sizeLabel?: string;
      bestSeller?: boolean;
      premium?: boolean;
    };

    const productId = body.productId?.trim();
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Produkt-ID saknas." },
        { status: 400 },
      );
    }

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Produkttitel krävs." },
        { status: 400 },
      );
    }

    const result = await updateStoreProduct(productId, {
      title,
      description: body.description?.trim() ?? "",
      price: Number(body.price),
      image: body.image?.trim() || "/logo.png",
      sizeLabel: body.sizeLabel?.trim() ?? "",
      bestSeller: body.bestSeller,
      premium: body.premium,
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
