"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="site-header">
      <div className="announce">Insured delivery · 14-day exchange · Live gold pricing</div>
      <div className="container nav-shell">
        <Link className="brand" href="/">
          <span className="monogram">
            <em>
              M<b>J</b>
            </em>
          </span>
          <span className="brand-name">
            Mahseri
            <small>Jewellery</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/shop/gold">Gold</Link>
          <Link href="/shop/silver">Silver</Link>
          <Link href="/shop/gems">Gems</Link>
          <Link href="/about">Our Story</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="nav-actions">
          <Link className="cart-button" href="/cart" aria-label="Open cart">
            Bag <span className="cart-count">{count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
