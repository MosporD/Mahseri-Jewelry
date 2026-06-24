"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="site-header">
      <p className="announce">Complimentary insured delivery across Jordan on orders over 300 JOD</p>
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
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">Our Story</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="nav-actions">
          <Link className="cart-button" href="/cart" aria-label="Open cart">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 8h12l1 13H5L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="cart-count">{count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
