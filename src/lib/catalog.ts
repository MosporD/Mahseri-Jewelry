import { cache } from "react";
import { seedProducts } from "./seed-data";
import { createServiceSupabaseClient } from "./supabase";
import type { Product, ProductCollection, ProductInput } from "./types";

const tableName = process.env.SUPABASE_PRODUCTS_TABLE || "products";

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    image: normalizeImagePath(product.image),
    in_stock: product.in_stock ?? product.inStock ?? true,
    making_fee: product.making_fee ?? product.makingFee ?? 0
  };
}

export function normalizeImagePath(image?: string | null) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  return "/" + image.replace(/\\/g, "/");
}

export function isGoldProduct(product: Product) {
  return product.collection === "gold" || ["21K Gold", "18K Gold"].includes(product.material);
}

export function isSilverProduct(product: Product) {
  return product.collection === "silver" || product.material === "925 Silver";
}

export function isGemProduct(product: Product) {
  return product.collection === "gems";
}

export function productMatchesCollection(product: Product, collection?: ProductCollection) {
  if (!collection) return true;
  if (collection === "gold") return isGoldProduct(product) && !isGemProduct(product);
  if (collection === "silver") return isSilverProduct(product) && !isGemProduct(product);
  return isGemProduct(product);
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return seedProducts.map(normalizeProduct);

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error || !data?.length) {
    return seedProducts.map(normalizeProduct);
  }

  return (data as Product[]).map(normalizeProduct);
});

export async function getProductsByCollection(collection: ProductCollection) {
  const products = await getProducts();
  return products.filter((product) => productMatchesCollection(product, collection));
}

export async function getProduct(id: string) {
  const products = await getProducts();
  return products.find((product) => product.id === id) || null;
}

export async function upsertProduct(input: ProductInput) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase service credentials are required to save products.");
  }

  const product = normalizeProduct(input);
  const { data, error } = await supabase
    .from(tableName)
    .upsert(product, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return normalizeProduct(data as Product);
}

export async function deleteProduct(id: string) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase service credentials are required to delete products.");
  }

  const { error } = await supabase.from(tableName).delete().eq("id", id);
  if (error) throw error;
}
