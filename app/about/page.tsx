import Link from "next/link";

export const metadata = {
  title: "Our Story"
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Our Story
          </p>
          <h1>Three generations of gold</h1>
          <p>What began at a single workbench in downtown Amman is now one of Jordan&apos;s most trusted names in handcrafted jewellery.</p>
        </div>
      </section>
      <section className="section">
        <div className="container split">
          <div className="frame">
            <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <circle cx="100" cy="100" r="62" stroke="#d8bc7e" strokeWidth="8" />
              <circle cx="100" cy="100" r="48" stroke="rgba(216,188,126,0.45)" strokeWidth="1.6" />
              <circle cx="100" cy="38" r="7" fill="#d8bc7e" />
            </svg>
          </div>
          <div>
            <p className="eyebrow">Since 1989</p>
            <h2>Craft is our inheritance</h2>
            <p>Mahseri Jewellery was founded at a single bench in Amman&apos;s gold souq, where our founder learned to draw wire, raise bangles, and finish clasps the way his teachers had — slowly, and by hand.</p>
            <p>Three decades later the bench has grown into a full atelier, but the rule has never changed: no piece leaves the workshop until the person who made it would give it to their own family.</p>
            <p>Today the second and third generations work side by side — one keeping the old techniques alive, the other drawing the clean, modern silhouettes you see in the collection.</p>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="stat-band">
            <div><strong>35+</strong><span>Years of craft</span></div>
            <div><strong>12000+</strong><span>Pieces handcrafted</span></div>
            <div><strong>900+</strong><span>Bespoke commissions</span></div>
            <div><strong>3</strong><span>Generations at the bench</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">The journey</p>
            <h2>From one bench to a house</h2>
          </div>
          <div className="timeline">
            {[
              ["1989", "The first bench", "Our founder opens a one-man workshop in Amman's gold souq, repairing chains and crafting wedding bangles for neighbouring shops."],
              ["1998", "A name above the door", "The Mahseri storefront opens, selling our own designs for the first time under the family name."],
              ["2011", "The second generation", "The founder's children join the atelier, bringing modern design training to traditional goldsmithing."],
              ["2020", "Bespoke studio", "We open a dedicated commission studio for engagement sets, heirloom remakes, and pieces built around family stories."],
              ["Today", "Mahseri online", "The full collection comes to your screen, with insured delivery to every governorate in Jordan."]
            ].map(([year, title, text]) => (
              <div className="timeline-item" key={year}>
                <p className="year">{year}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What we stand by</p>
            <h2>The Mahseri promise</h2>
          </div>
          <div className="value-grid">
            {[
              ["I.", "Pure metal, honestly weighed", "Every piece is hallmarked and weighed in front of you. The purity on the stamp is the purity in your hand — always."],
              ["II.", "Made by hands, not lines", "No outsourcing, no mass casting. Each piece passes through our own benches and our own quality eye before it is yours."],
              ["III.", "With you for life", "Complimentary annual polishing, honest repairs, and resizing for as long as you own your piece."]
            ].map(([num, title, text]) => (
              <article className="value-card" key={num}>
                <span className="num">{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container">
          <p className="eyebrow">See it in person</p>
          <h2>The kettle is always on</h2>
          <p>Visit the atelier in downtown Amman for a private viewing — or start with the collection online.</p>
          <Link className="btn btn-gold" href="/shop">Shop the collection</Link>
        </div>
      </section>
    </>
  );
}
