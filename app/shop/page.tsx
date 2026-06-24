import Link from "next/link";

export const metadata = {
  title: "Shop"
};

export default function ShopHubPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Shop
          </p>
          <h1>The Collection</h1>
          <p>Every piece is handcrafted in our Amman atelier. Begin with gold, silver, or precious gems.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Choose your collection</p>
            <h2>Gold, silver or gems — one standard of craft</h2>
          </div>
          <div className="collection-grid shop-metal-grid">
            <Link className="collection-card collection-card-gold" href="/shop/gold">
              <div className="cc-art">
                <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
                  <circle cx="100" cy="118" r="52" stroke="#d8bc7e" strokeWidth="7" />
                  <path d="M78 64 L100 34 L122 64 L100 80 Z" stroke="#d8bc7e" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M30 32 C45 105 75 130 100 134 C125 130 155 105 170 32" stroke="rgba(216,188,126,0.5)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div className="cc-veil" />
              <span className="cc-arrow">→</span>
              <div className="cc-info">
                <h3>Gold</h3>
                <p>21K & 18K</p>
              </div>
            </Link>
            <Link className="collection-card collection-card-silver" href="/shop/silver">
              <div className="cc-art">
                <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
                  <circle cx="100" cy="100" r="62" stroke="#c8ccd4" strokeWidth="8" />
                  <circle cx="100" cy="100" r="48" stroke="rgba(200,204,212,0.45)" strokeWidth="1.6" />
                  <circle cx="100" cy="38" r="7" fill="#c8ccd4" />
                </svg>
              </div>
              <div className="cc-veil" />
              <span className="cc-arrow">→</span>
              <div className="cc-info">
                <h3>Silver</h3>
                <p>925 Sterling</p>
              </div>
            </Link>
            <Link className="collection-card collection-card-gems" href="/shop/gems">
              <div className="cc-art">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="art-line" src="/assets/art/precious-stone.svg" alt="" aria-hidden="true" />
              </div>
              <div className="cc-veil" />
              <span className="cc-arrow">→</span>
              <div className="cc-info">
                <h3>Gems</h3>
                <p>Precious stones</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <section className="section cta-band">
        <div className="container">
          <p className="eyebrow">Need help choosing?</p>
          <h2>Tell us what you are looking for</h2>
          <p>We can help you compare metals, weights, sizing, and the best piece for the occasion.</p>
          <Link className="btn btn-gold" href="/contact">Contact the atelier</Link>
        </div>
      </section>
    </>
  );
}
