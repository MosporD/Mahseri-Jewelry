"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function navClass(href: string) {
    if (href === "/" && pathname === "/") return "active";
    if (href !== "/" && pathname.startsWith(href)) return "active";
    return undefined;
  }

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

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
        <nav className={`site-nav${open ? " open" : ""}`} aria-label="Main navigation">
          <Link className={navClass("/")} href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link className={navClass("/shop")} href="/shop" onClick={() => setOpen(false)}>Shop</Link>
          <Link className={navClass("/about")} href="/about" onClick={() => setOpen(false)}>Our Story</Link>
          <Link className={navClass("/contact")} href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </nav>
        <div className="nav-actions">
          <Link className="cart-button" href="/cart" aria-label="Open cart">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 8h12l1 13H5L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="cart-count">{count}</span>
          </Link>
          <button
            className={`menu-toggle${open ? " open" : ""}`}
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
