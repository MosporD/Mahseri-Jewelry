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
          <h1>Visit the atelier</h1>
          <p>For commissions, repairs, sizing, or simply to see the collection in the metal — we would love to welcome you.</p>
        </div>
      </section>
      <section className="section">
        <div className="container contact-layout">
          <div className="contact-card">
            <ContactRow title="The atelier" icon="◇">
              <p>Madaba Street, Al Wehdat<br />Amman, Jordan</p>
              <p>
                <a href="https://www.google.com/maps/place/Al+Mahseri+Jewellery/@31.9316289,35.9368612,17z" target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                </a>
              </p>
            </ContactRow>
            <ContactRow title="Call or WhatsApp" icon="☎">
              <p>
                <a href={`tel:${storeSettings.phone}`}>{storeSettings.phone}</a><br />
                <a href={`https://wa.me/${storeSettings.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  Message us on WhatsApp
                </a>
              </p>
            </ContactRow>
            <ContactRow title="Write to us" icon="✉">
              <p><a href={`mailto:${storeSettings.email}`}>{storeSettings.email}</a></p>
            </ContactRow>
            <ContactRow title="Instagram" icon="◎">
              <p><a href="https://www.instagram.com/almahserijewellery/" target="_blank" rel="noopener noreferrer">@almahserijewellery</a></p>
            </ContactRow>
            <ContactRow title="Opening hours" icon="◷">
              <table className="hours-table">
                <tbody>
                  <tr><td>Saturday – Thursday</td><td>10:00 – 20:00</td></tr>
                  <tr><td>Friday</td><td>14:00 – 20:00</td></tr>
                </tbody>
              </table>
            </ContactRow>
          </div>

          <div>
            <div className="section-head" style={{ marginBottom: "2rem" }}>
              <p className="eyebrow">Send a message</p>
              <h2>Tell us what you have in mind</h2>
            </div>
            <form className="checkout-form">
              <div className="row-2">
                <div className="field">
                  <label htmlFor="cf-name">Your name</label>
                  <input id="cf-name" name="name" type="text" required autoComplete="name" />
                </div>
                <div className="field">
                  <label htmlFor="cf-phone">Phone or email</label>
                  <input id="cf-phone" name="contact" type="text" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="cf-subject">I&apos;m interested in</label>
                <select id="cf-subject" name="subject">
                  <option>A piece from the collection</option>
                  <option>A bespoke commission</option>
                  <option>Repair or restoration</option>
                  <option>Resizing</option>
                  <option>Something else</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="cf-message">Your message</label>
                <textarea id="cf-message" name="message" rows={5} required />
              </div>
              <button className="btn btn-solid" type="submit">Send message</button>
              <p className="form-status" role="status">Contact form delivery will be connected through the server contact API.</p>
            </form>

            <div className="map-frame">
              <iframe
                title="Al Mahseri Jewellery on Google Maps"
                src="https://maps.google.com/maps?q=31.9316289,35.9368612&hl=en&z=16&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Good to know</p>
            <h2>Questions, answered</h2>
          </div>
          <div className="faq">
            {[
              ["How is the price of a gold piece calculated?", "Each piece is priced on its hallmarked weight at the day's gold rate, plus a transparent crafting fee. We will always break the price down for you — gram by gram — before you buy."],
              ["Do you deliver outside Amman?", "Yes — we deliver to every governorate in Jordan with insured couriers. Orders over 300 JOD ship free; everything else is a flat 5 JOD. Most orders arrive within one to two working days."],
              ["Can I exchange or return a piece?", "Collection pieces can be exchanged within 14 days in their original condition. Bespoke and engraved pieces are made only for you, so they cannot be returned — but we will always work with you until they are right."],
              ["How long does a bespoke commission take?", "Most commissions are ready in two to four weeks, depending on complexity. We share sketches before we begin and photos as your piece takes shape."],
              ["Do you buy back or trade in gold?", "Yes. We buy back Mahseri pieces at the day's gold rate, and we are happy to remake inherited gold into something new while keeping its sentimental weight."]
            ].map(([question, answer]) => (
              <details className="faq-item" key={question}>
                <summary>{question}</summary>
                <div className="faq-body">{answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ContactRow({
  title,
  icon,
  children
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="contact-row">
      <div className="icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
