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
          <h1>A family atelier in Amman</h1>
          <p>Mahseri Jewellery has shaped gold and silver pieces with patient hands since 1989.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Since 1989</p>
            <h2>Pure metal, honest pricing, lifetime care</h2>
            <p className="lead">
              The new app keeps the atelier story intact while moving the catalogue, orders, and admin
              editing into a real database-backed workflow.
            </p>
          </div>
          <div className="story-grid">
            <article>
              <h3>Craft</h3>
              <p>Every piece begins with weight, metal purity, and the finishing work that gives it character.</p>
            </article>
            <article>
              <h3>Transparency</h3>
              <p>Gold and silver prices are calculated from live metal feeds with making fees clearly separated.</p>
            </article>
            <article>
              <h3>Care</h3>
              <p>Private viewings, resizing, repair, and delivery stay connected to the same Mahseri team.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
