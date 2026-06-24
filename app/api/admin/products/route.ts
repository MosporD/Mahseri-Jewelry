import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { assertAdminFromRequest } from "@/src/lib/admin-auth";
import { getProducts, upsertProduct } from "@/src/lib/catalog";
import type { ProductInput } from "@/src/lib/types";

export async function GET(request: NextRequest) {
  try {
    await assertAdminFromRequest(request);
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertAdminFromRequest(request);
    const product = (await request.json()) as ProductInput;
    if (!product.id || !product.name || !product.material) {
      return NextResponse.json({ error: "Missing required product fields." }, { status: 400 });
    }
    const saved = await upsertProduct(product);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${saved.id}`);
    return NextResponse.json({ product: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save product." },
      { status: 500 }
    );
  }
}
