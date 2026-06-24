import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { getProduct, getProducts, productMatchesCollection } from "@/src/lib/catalog";
import { computeProductPrice, formatPrice, getMetalSpot } from "@/src/lib/pricing";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description || `${product.material} ${product.category} from Mahseri Jewellery.`,
    openGraph: {
      images: product.image ? [product.image] : []
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, products, spot] = await Promise.all([
    getProduct(id),
    getProducts(),
    getMetalSpot().catch(() => null)
  ]);

  if (!product) notFound();

  const price = computeProductPrice(product, spot);
  const inStock = product.in_stock ?? product.inStock ?? true;
  const related = products
    .filter((item) => item.id !== product.id && productMatchesCollection(item, product.collection))
    .slice(0, 4);

  return (
    <>
      <section className="product-detail section">
        <div className="container pd-grid">
          <div className="pd-media">
            <Image
              src={product.image || "/assets/art/precious-stone.svg"}
              alt={product.name}
              width={900}
              height={900}
              priority
            />
          </div>
          <div className="pd-copy">
            <p className="breadcrumb">
              <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
              <Link href={`/shop/${product.collection}`}>{product.collection}</Link> &nbsp;/&nbsp;{" "}
              {product.name}
            </p>
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="pd-price">{formatPrice(price)}</p>
            <p>{product.description || "Handcrafted in the Mahseri atelier."}</p>
            <ul className="pd-specs">
              <li><span>Material</span><strong>{product.material}</strong></li>
              <li><span>Weight</span><strong>{product.weight}</strong></li>
              <li><span>Stock</span><strong>{inStock ? "In stock" : "Out of stock"}</strong></li>
            </ul>
            <AddToCartButton productId={product.id} disabled={!inStock} />
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Related</p>
            <h2>You may also like</h2>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} spot={spot} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
