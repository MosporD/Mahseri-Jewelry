import Link from "next/link";
import { storeSettings } from "@/src/lib/seed-data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <span className="monogram">
              <em>
                M<b>J</b>
              </em>
            </span>
            <span className="brand-name">
              Mahseri
              <small>Jewellery</small>
            </span>
          </div>
          <p className="footer-about">
            Family atelier crafting fine gold and silver jewellery in Amman since 1989. Pure metal,
            honest pricing, lifetime care.
          </p>
        </div>
        <div>
          <h3>Collection</h3>
          <ul>
            <li><Link href="/shop/gold">Gold</Link></li>
            <li><Link href="/shop/silver">Silver</Link></li>
            <li><Link href="/shop/gems">Gems</Link></li>
            <li><Link href="/admin">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <ul>
            <li><a href={`tel:${storeSettings.phone}`}>{storeSettings.phone}</a></li>
            <li><a href={`mailto:${storeSettings.email}`}>{storeSettings.email}</a></li>
            <li>{storeSettings.address}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
