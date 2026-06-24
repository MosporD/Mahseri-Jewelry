import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchaseControls } from "@/components/product-purchase-controls";
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
      <section className="section">
        <div className="container">
          <p className="breadcrumb" style={{ color: "var(--muted)", marginBottom: "2.4rem" }}>
            <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
            <Link href={`/shop/${product.collection}`}>Shop</Link> &nbsp;/&nbsp; {product.name}
          </p>

          <div className="product-layout">
          <div className="pd-media">
            <span className="pd-zoom-hint">Click to zoom</span>
            <Image
              className="pd-img"
              src={product.image || "/assets/art/precious-stone.svg"}
              alt={product.name}
              width={900}
              height={900}
              priority
            />
          </div>

          <div className="pd-info">
            <p className="pc-cat">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="pd-price">{formatPrice(price)}</p>
            <p className="pd-desc">{product.description || "Handcrafted in the Mahseri atelier."}</p>
            <ul className="pd-specs">
              <li><span>Metal</span><b>{product.material}</b></li>
              <li><span>Approx. weight</span><b>{product.weight}</b></li>
              <li><span>Hallmark</span><b>Stamped & certified</b></li>
              <li><span>Availability</span><b>{inStock ? "In stock · ships in 1–2 days" : "Out of stock"}</b></li>
            </ul>
            <ProductPurchaseControls productId={product.id} disabled={!inStock} />
            <ul className="pd-trust">
              <li>◇ Insured delivery anywhere in Jordan</li>
              <li>◇ 14-day exchange, no questions asked</li>
              <li>◇ 2-year craftsmanship warranty on gold</li>
            </ul>
            <details className="size-guide">
              <summary>Ring & bangle size guide</summary>
              <div className="sg-body">
                <p>Wrap a strip of paper around your finger or wrist, mark where it meets, and measure the length in millimetres. Match it below — or visit the atelier and we will size you in person.</p>
                <table>
                  <tbody>
                    <tr><th>Size</th><th>Circumference</th><th>Fits</th></tr>
                    <tr><td>S</td><td>49–52 mm</td><td>Ring sizes 5–6</td></tr>
                    <tr><td>M</td><td>53–57 mm</td><td>Ring sizes 6.5–8</td></tr>
                    <tr><td>L</td><td>58–62 mm</td><td>Ring sizes 8.5–10</td></tr>
                    <tr><td>Bangle</td><td>160–190 mm wrist</td><td>Made to your measure</td></tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Complete the look</p>
            <h2>You may also love</h2>
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
