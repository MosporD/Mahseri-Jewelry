import type { MetadataRoute } from "next";
import { getProducts } from "@/src/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahserijewellery.com";
  const products = await getProducts();
  const staticRoutes = ["", "/shop", "/shop/gold", "/shop/silver", "/shop/gems", "/about", "/contact", "/cart"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date()
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date()
    }))
  ];
}
