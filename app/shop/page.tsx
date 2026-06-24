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
    </>
  );
}
