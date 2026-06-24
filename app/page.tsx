import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/src/lib/catalog";
import { getMetalSpot } from "@/src/lib/pricing";

export default async function HomePage() {
  const [products, spot] = await Promise.all([
    getProducts(),
    getMetalSpot().catch(() => null)
  ]);
  const featured = products.slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Amman atelier · since 1989</p>
            <h1>
              Fine jewellery with <em>honest live metal pricing</em>
            </h1>
            <p className="hero-text">
              Gold, silver, and gems crafted by Mahseri Jewellery with transparent pricing,
              insured delivery, and lifetime care.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-solid" href="/shop/gold">Shop gold</Link>
              <Link className="btn btn-ghost" href="/shop/silver">Shop silver</Link>
            </div>
          </div>
          <div className="hero-card">
            <span className="dot" />
            <p>Live prices · Jordan delivery · Atelier care</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">The Collections</p>
            <h2>Gold, silver or gems — one standard of craft</h2>
          </div>
          <div className="collection-grid shop-metal-grid">
            <Link className="collection-card collection-card-gold" href="/shop/gold">
              <div className="cc-info">
                <h3>Gold</h3>
                <p>21K & 18K</p>
              </div>
            </Link>
            <Link className="collection-card collection-card-silver" href="/shop/silver">
              <div className="cc-info">
                <h3>Silver</h3>
                <p>925 Sterling</p>
              </div>
            </Link>
            <Link className="collection-card collection-card-gems" href="/shop/gems">
              <div className="cc-info">
                <h3>Gems</h3>
                <p>Precious stones</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Featured pieces</p>
            <h2>Fresh from the catalogue</h2>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} spot={spot} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
