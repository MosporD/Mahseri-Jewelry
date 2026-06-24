import Link from "next/link";
import Image from "next/image";
import { MaterialGuide } from "@/components/material-guide";
import { ProductCard } from "@/components/product-card";
import { Testimonials } from "@/components/testimonials";
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

const categoryArtAssets: Record<string, string> = {
  Brooches: "/assets/art/brooch.svg",
  "Nose Jewellery": "/assets/art/nose.svg",
  Anklets: "/assets/art/anklet.svg",
  "Leg Chains": "/assets/art/leg-chains.svg",
  "Navel Rings": "/assets/art/navel-ring.svg",
  "Full Set": "/assets/art/full-set.svg",
  "Half Set": "/assets/art/half-set.svg",
  "3 Piece Set": "/assets/art/three-piece-set.svg"
};

function CategoryArt({ category }: { category: string }) {
  const stroke = "#c6a35c";
  const soft = "rgba(198,163,92,0.45)";

  if (category === "Necklaces") {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <path d="M30 32 C45 105 75 130 100 134 C125 130 155 105 170 32" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M40 32 C53 98 78 122 100 126 C122 122 147 98 160 32" stroke={soft} strokeWidth="1.6" />
        <circle cx="100" cy="148" r="13" stroke={stroke} strokeWidth="4" />
        <path d="M100 134 L100 136" stroke={stroke} strokeWidth="4" />
        <path d="M95 168 L100 180 L105 168" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === "Rings") {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="118" r="52" stroke={stroke} strokeWidth="7" />
        <circle cx="100" cy="118" r="40" stroke={soft} strokeWidth="1.5" />
        <path d="M78 64 L100 34 L122 64 L100 80 Z" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
        <path d="M78 64 L122 64" stroke={stroke} strokeWidth="3" />
        <path d="M100 34 L93 64 M100 34 L107 64" stroke={soft} strokeWidth="1.5" />
      </svg>
    );
  }

  if (category === "Bracelets") {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="62" stroke={stroke} strokeWidth="8" />
        <circle cx="100" cy="100" r="48" stroke={soft} strokeWidth="1.6" />
        <circle cx="100" cy="38" r="7" fill={stroke} />
        <circle cx="156" cy="120" r="5" fill={soft} />
      </svg>
    );
  }

  if (category === "Earrings") {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <path d="M62 34 a9 9 0 1 1 0.1 0" stroke={stroke} strokeWidth="3" />
        <path d="M62 50 L62 76" stroke={stroke} strokeWidth="3" />
        <circle cx="62" cy="116" r="38" stroke={stroke} strokeWidth="5" />
        <path d="M138 34 a9 9 0 1 1 0.1 0" stroke={stroke} strokeWidth="3" />
        <path d="M138 50 L138 70" stroke={stroke} strokeWidth="3" />
        <path d="M138 70 L120 130 L156 130 Z" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }

  const asset = categoryArtAssets[category];
  if (asset) {
    return <Image className="art-line" src={asset} alt="" width={180} height={180} />;
  }

  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path d="M52 26 C70 70 86 84 100 88 C114 84 130 70 148 26" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" />
      <rect x="78" y="98" width="44" height="58" stroke={stroke} strokeWidth="4" />
      <rect x="86" y="108" width="28" height="38" stroke={soft} strokeWidth="1.6" />
      <path d="M100 88 L100 98" stroke={stroke} strokeWidth="3" />
      <path d="M78 127 H122" stroke={soft} strokeWidth="1.6" />
    </svg>
  );
}

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
            <h1>Gold that carries <em>your story</em> forward.</h1>
            <p className="hero-text">
              From our family workshop in the heart of Amman, Mahseri crafts jewellery in
              21K and 18K gold and 925 silver — pure metal, modern silhouettes,
              and a finish that only patient hands can give.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-solid" href="/shop">Explore the collection</Link>
              <Link className="btn btn-outline" href="/about">Our craft</Link>
            </div>
            <div className="hero-stats">
              <div><strong>35+</strong><span>Years of craft</span></div>
              <div><strong>100%</strong><span>Made in-house</span></div>
              <div><strong>2yr</strong><span>Gold warranty</span></div>
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
                  <CategoryArt category={category} />
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
          <MaterialGuide />
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
          <Testimonials />
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
