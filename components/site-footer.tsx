import Link from "next/link";
import { storeSettings } from "@/src/lib/seed-data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
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
            <p className="footer-about">
              Family atelier crafting fine gold and silver jewellery in Amman since 1989. Pure metal,
              honest pricing, lifetime care.
            </p>
            <ul className="footer-social">
              <li><a href="https://www.instagram.com/almahserijewellery/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://www.google.com/maps/place/Al+Mahseri+Jewellery/@31.9316289,35.9368612,17z" target="_blank" rel="noopener noreferrer">Google Maps</a></li>
            </ul>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link href="/shop/gold?category=Necklaces">Necklaces</Link></li>
              <li><Link href="/shop/gold?category=Rings">Rings</Link></li>
              <li><Link href="/shop/gold?category=Bracelets">Bracelets</Link></li>
              <li><Link href="/shop/gold?category=Earrings">Earrings</Link></li>
              <li><Link href="/shop/gold?category=Brooches">Brooches</Link></li>
              <li><Link href="/shop/gold?category=Nose%20Jewellery">Nose Jewellery</Link></li>
              <li><Link href="/shop/gold?category=Anklets">Anklets</Link></li>
              <li><Link href="/shop/gold?category=Navel%20Rings">Navel Rings</Link></li>
              <li><Link href="/shop/gems">Gems</Link></li>
            </ul>
          </div>
          <div>
            <h4>House</h4>
            <ul>
              <li><Link href="/about">Our story</Link></li>
              <li><Link href="/contact">Visit the atelier</Link></li>
              <li><Link href="/cart">Your bag</Link></li>
            </ul>
          </div>
          <div>
            <h4>Atelier</h4>
            <ul>
              <li>Madaba Street, Al Wehdat</li>
              <li>Amman, Jordan</li>
              <li><a href={`tel:${storeSettings.phone}`}>{storeSettings.phone}</a></li>
              <li><a href={`mailto:${storeSettings.email}`}>{storeSettings.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Mahseri Jewellery. All rights reserved.</p>
          <p>Insured delivery · 14-day exchange · 2-year gold warranty</p>
        </div>
      </div>
    </footer>
  );
}
