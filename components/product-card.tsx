import Image from "next/image";
import Link from "next/link";
import { computeProductPrice, formatPrice } from "@/src/lib/pricing";
import type { MetalSpot, Product } from "@/src/lib/types";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product, spot }: { product: Product; spot: MetalSpot | null }) {
  const price = computeProductPrice(product, spot);
  const image = product.image || "/assets/art/precious-stone.svg";
  const inStock = product.in_stock ?? product.inStock ?? true;

  return (
    <article className={`product-card${inStock ? "" : " pc-out-of-stock"}`}>
      <div className="pc-media">
        {product.badge ? <span className="pc-badge">{product.badge}</span> : null}
        <Link href={`/product/${product.id}`} aria-label={product.name}>
          <Image
            className="pc-img"
            src={image}
            alt={product.name}
            width={640}
            height={640}
            sizes="(max-width: 768px) 92vw, 33vw"
          />
        </Link>
      </div>
      <div className="pc-body">
        <p className="pc-cat">{product.category}</p>
        <h3>
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="pc-material">
          {product.material} · {product.weight}
        </p>
        <p className="pc-price">{formatPrice(price)}</p>
        <p className={`pc-availability${inStock ? " in-stock" : " out-of-stock"}`}>
          {inStock ? "In stock" : "Out of stock"}
        </p>
        <AddToCartButton productId={product.id} disabled={!inStock} />
      </div>
    </article>
  );
}
