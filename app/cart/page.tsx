import Link from "next/link";
import { CartPageClient } from "@/components/cart-page-client";
import { getProducts } from "@/src/lib/catalog";

export const metadata = {
  title: "Cart"
};

export default async function CartPage() {
  const products = await getProducts();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Cart
          </p>
          <h1>Your Bag</h1>
          <p>Review your selected pieces and send the order to Mahseri Jewellery for confirmation.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <CartPageClient products={products} />
        </div>
      </section>
    </>
  );
}
