import Link from "next/link";
import { storeSettings } from "@/src/lib/seed-data";

export const metadata = {
  title: "Contact"
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Contact
          </p>
          <h1>Visit or message the atelier</h1>
          <p>For commissions, repairs, sizing, or private viewings, we would love to welcome you.</p>
        </div>
      </section>
      <section className="section">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Mahseri Jewellery</h2>
            <p>{storeSettings.address}</p>
            <p>
              <a href={`tel:${storeSettings.phone}`}>{storeSettings.phone}</a>
              <br />
              <a href={`mailto:${storeSettings.email}`}>{storeSettings.email}</a>
            </p>
            <div className="hero-actions">
              <a className="btn btn-solid" href={`https://wa.me/${storeSettings.whatsapp}`}>
                WhatsApp us
              </a>
              <Link className="btn btn-ghost" href="/shop">
                Browse collection
              </Link>
            </div>
          </div>
          <form className="checkout-form">
            <label>
              Name
              <input name="name" placeholder="Your name" />
            </label>
            <label>
              Phone
              <input name="phone" placeholder="+962..." />
            </label>
            <label>
              Message
              <textarea name="message" rows={5} placeholder="How can we help?" />
            </label>
            <p className="form-status">
              Contact form persistence will be connected through the same server order/contact APIs.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
