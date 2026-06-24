import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalSpotTile } from "@/components/metal-spot-tile";
import { ProductCard } from "@/components/product-card";
import { getProductsByCollection } from "@/src/lib/catalog";
import { categories, gemTypes } from "@/src/lib/seed-data";
import { getMetalSpot } from "@/src/lib/pricing";
import type { ProductCollection } from "@/src/lib/types";

const copy = {
  gold: {
    title: "Gold Collection",
    desc: "21K and 18K pieces handcrafted in our Amman atelier — dense, warm, and hallmarked for purity."
  },
  silver: {
    title: "Silver Collection",
    desc: "925 sterling pieces — river-smooth polish, sculptural silhouettes, and the same patient hand finish as our gold."
  },
  gems: {
    title: "Precious Gems",
    desc: "Rubies, emeralds, sapphires, diamonds and pearls — selected for colour, clarity and character."
  }
} satisfies Record<ProductCollection, { title: string; desc: string }>;

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!isCollection(collection)) return {};
  return {
    title: copy[collection].title,
    description: copy[collection].desc
  };
}

export default async function CollectionPage({
  params,
  searchParams
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ category?: string; material?: string; gender?: string; sort?: string }>;
}) {
  const [{ collection }, query] = await Promise.all([params, searchParams]);
  if (!isCollection(collection)) notFound();

  const [allProducts, spot] = await Promise.all([
    getProductsByCollection(collection),
    getMetalSpot().catch(() => null)
  ]);

  const category = query.category || "All";
  const material = query.material || "All";
  const gender = query.gender || "All";
  const sort = query.sort || "featured";
  const categoryList = collection === "gems" ? gemTypes : categories;
  const materialList = Array.from(new Set(allProducts.map((product) => product.material)));

  const filtered = allProducts
    .filter((product) => category === "All" || product.category === category)
    .filter((product) => material === "All" || product.material === material)
    .filter((product) => gender === "All" || product.gender === gender || product.gender === "Both")
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/shop">Shop</Link> &nbsp;/&nbsp;{" "}
            {copy[collection].title}
          </p>
          <h1>{copy[collection].title}</h1>
          <p>{copy[collection].desc}</p>
        </div>
      </section>

      <section className="section shop-metal-switch-section">
        <div className="container">
          <nav className="shop-metal-switch" aria-label="Choose collection">
            <Link className={`shop-metal-pill${collection === "gold" ? " active" : ""}`} href="/shop/gold">Gold</Link>
            <Link className={`shop-metal-pill${collection === "silver" ? " active" : ""}`} href="/shop/silver">Silver</Link>
            <Link className={`shop-metal-pill${collection === "gems" ? " active" : ""}`} href="/shop/gems">Gems</Link>
          </nav>
          <MetalSpotTile collection={collection} spot={spot} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="shop-layout">
            <aside className="shop-filters open" aria-label="Product filters">
              <FilterGroup title={collection === "gems" ? "Gem type" : "Category"} values={["All", ...categoryList]} active={category} param="category" collection={collection} current={{ category, material, gender, sort }} />
              <FilterGroup title="Material" values={["All", ...materialList]} active={material} param="material" collection={collection} current={{ category, material, gender, sort }} />
              <FilterGroup title="Shop for" values={["All", "Her", "Him", "Both"]} active={gender} param="gender" collection={collection} current={{ category, material, gender, sort }} />
              <FilterGroup title="Sort" values={["featured", "price-asc", "price-desc", "name"]} active={sort} param="sort" collection={collection} current={{ category, material, gender, sort }} />
            </aside>
            <div className="shop-main">
              <div className="shop-bar-mobile">
                <span className="shop-count">
                  {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
                </span>
              </div>
              <div className="shop-toolbar-desktop">
                <span className="shop-count">
                  {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
                </span>
              </div>
              <div className="product-grid" id="shop-grid">
                {filtered.length ? (
                  filtered.map((product) => <ProductCard key={product.id} product={product} spot={spot} />)
                ) : (
                  <p className="empty-note">No pieces match that combination — try another filter.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section cta-band">
        <div className="container">
          <p className="eyebrow">Explore more</p>
          <h2>{collection === "gold" ? "Explore the silver collection" : "Explore the gold collection"}</h2>
          <p>One atelier standard across every metal, stone, and finish.</p>
          <Link className="btn btn-gold" href={collection === "gold" ? "/shop/silver" : "/shop/gold"}>
            {collection === "gold" ? "Shop silver" : "Shop gold"}
          </Link>
        </div>
      </section>
    </>
  );
}

function FilterGroup({
  title,
  values,
  active,
  param,
  collection,
  current
}: {
  title: string;
  values: string[];
  active: string;
  param: string;
  collection: ProductCollection;
  current: { category: string; material: string; gender: string; sort: string };
}) {
  return (
    <div className="filter-section">
      <p className="filter-label">{title}</p>
      <div className="filter-group">
        {values.map((value) => (
          <Link
            key={value}
            className={`chip${active === value ? " active" : ""}`}
            href={{ pathname: `/shop/${collection}`, query: buildQuery(current, param, value) }}
          >
            {formatFilterLabel(value)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function buildQuery(
  current: { category: string; material: string; gender: string; sort: string },
  param: string,
  value: string
) {
  const next = { ...current, [param]: value };
  return Object.fromEntries(
    Object.entries(next).filter(([, entry]) => entry !== "All" && entry !== "featured")
  );
}

function formatFilterLabel(value: string) {
  return value
    .replace("price-asc", "Price: low to high")
    .replace("price-desc", "Price: high to low")
    .replace("featured", "Featured")
    .replace("name", "Name: A to Z");
}

function isCollection(value: string): value is ProductCollection {
  return value === "gold" || value === "silver" || value === "gems";
}
