import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/src/lib/catalog";
import { getMetalSpot } from "@/src/lib/pricing";
import { categories } from "@/src/lib/seed-data";

const categoryBlurbs: Record<string, string> = {
  Necklaces: "Chains & pendants",
  Rings: "Bands & signets",
  Bracelets: "Cuffs & bangles",
  Earrings: "Studs & hoops",
  Brooches: "Pins & clasps",
  "Nose Jewellery": "Rings & studs",
  Anklets: "Fine chain & beads",
  "Leg Chains": "Ankle to ankle",
  "Navel Rings": "Curved & set",
  "Full Set": "Complete matching set",
  "Half Set": "Necklace & earrings",
  "3 Piece Set": "Ring, chain & earrings"
};

const categoryArt: Record<string, string> = {
  Brooches: "/assets/art/brooch.svg",
  "Nose Jewellery": "/assets/art/nose.svg",
  Anklets: "/assets/art/anklet.svg",
  "Leg Chains": "/assets/art/leg-chains.svg",
  "Navel Rings": "/assets/art/navel-ring.svg",
  "Full Set": "/assets/art/full-set.svg",
  "Half Set": "/assets/art/half-set.svg",
  "3 Piece Set": "/assets/art/three-piece-set.svg"
};

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
              Handcrafted jewellery with <em>honest live metal pricing</em>
            </h1>
            <p className="hero-text">
              Gold, silver, and gems crafted by Mahseri Jewellery with transparent pricing,
              insured delivery across Jordan, and lifetime atelier care.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-solid" href="/shop/gold">Shop gold</Link>
              <Link className="btn btn-ghost" href="/shop/silver">Shop silver</Link>
            </div>
            <div className="hero-stats">
              <div><strong>1989</strong><span>Family atelier</span></div>
              <div><strong>21K</strong><span>Regional gold</span></div>
              <div><strong>925</strong><span>Sterling silver</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-frame">
              <div className="hero-viewer">
                {featured.slice(0, 3).map((product, index) => (
                  <div className={`hero-slide${index === 0 ? " active" : ""}`} key={product.id}>
                    <Image
                      src={product.image || "/assets/art/precious-stone.svg"}
                      alt={product.name}
                      width={900}
                      height={1125}
                      priority={index === 0}
                    />
                  </div>
                ))}
                <div className="hero-shine" />
              </div>
            </div>
            <div className="hero-card">
              <span className="dot" />
              <p>Handcrafted to order · Amman</p>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[
            "21K · 18K Gold",
            "925 Sterling Silver",
            "Handcrafted in Amman",
            "Free engraving on signets",
            "Insured delivery across Jordan",
            "21K · 18K Gold",
            "925 Sterling Silver",
            "Handcrafted in Amman",
            "Free engraving on signets",
            "Insured delivery across Jordan"
          ].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">The Collections</p>
            <h2>Every category, one standard of craft</h2>
          </div>
          <div className="collection-grid category-showcase-grid">
            {categories.map((category) => (
              <Link
                className="collection-card collection-card-gold"
                href={`/shop/gold?category=${encodeURIComponent(category)}`}
                key={category}
              >
                <div className="cc-art">
                  {categoryArt[category] ? (
                    <Image
                      className="art-line"
                      src={categoryArt[category]}
                      alt=""
                      width={180}
                      height={180}
                    />
                  ) : (
                    <span className="monogram">
                      <em>
                        M<b>J</b>
                      </em>
                    </span>
                  )}
                </div>
                <div className="cc-veil" />
                <div className="cc-info">
                  <h3>{category}</h3>
                  <p>{categoryBlurbs[category]}</p>
                </div>
                <span className="cc-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Selected pieces</p>
            <h2>The edit of the season</h2>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} spot={spot} />
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link className="text-link" href="/shop">
              View the full collection <span>→</span>
            </Link>
          </p>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Know your metal</p>
            <h2>An honest guide to what you wear</h2>
          </div>
          <div className="material-panel active">
            <div>
              <h3>21K — The regional signature</h3>
              <p>
                The classic standard of Jordanian gold. Rich colour with everyday resilience,
                priced from live metal data and finished by hand.
              </p>
              <ul className="material-meta">
                <li><span>Purity</span><b>88.5% gold</b></li>
                <li><span>Tone</span><b>Rich yellow</b></li>
                <li><span>Best for</span><b>Chains, bracelets, daily luxury</b></li>
              </ul>
              <div className="purity-bar"><i style={{ width: "88.5%" }} /></div>
            </div>
            <div className="material-swatch">
              <div className="coin" style={{ background: "radial-gradient(circle at 32% 28%, #ffeec0, #e3b652 55%, #b78c33)" }}>
                21
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Atelier services</p>
            <h2>We stay with your piece for life</h2>
          </div>
          <div className="service-grid">
            {[
              ["Bespoke design", "From a sketch on paper to a finished piece — initials, dates, and one-of-one commissions made in-house."],
              ["Repair & restore", "Chains, clasps, settings and structure — repaired by the same hands that craft our new pieces."],
              ["Polish & renew", "Bring back the first-day glow. Complimentary annual polishing for every Mahseri piece."],
              ["Resizing", "Rings and selected bangles resized for a perfect fit — usually ready within two days."]
            ].map(([title, text]) => (
              <article className="service-card" key={title}>
                <div className="icon">◆</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tinted testimonials">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Word of mouth</p>
            <h2>Loved across Jordan</h2>
          </div>
          <div className="testimonial-stage">
            <article className="testimonial active">
              <p className="stars">★★★★★</p>
              <blockquote>
                “The 21K bracelet I ordered is heavier and finer than anything I found in the souq.
                You can feel the hand work in every link.”
              </blockquote>
              <cite>Mahseri customer — Amman</cite>
            </article>
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container">
          <p className="eyebrow">Begin your piece</p>
          <h2>Made for moments that matter</h2>
          <p>Browse the collection online, or visit the atelier in downtown Amman for a private viewing.</p>
          <Link className="btn btn-gold" href="/shop">Shop the collection</Link>
        </div>
      </section>
    </>
  );
}
