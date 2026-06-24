"use client";

import { useState } from "react";

const testimonials = [
  {
    quote: "The 21K rope chain I ordered is heavier and finer than anything I found in the souq. You can feel the hand work in every link.",
    cite: "Omar K. — Amman"
  },
  {
    quote: "They engraved my grandmother's initials on a signet and delivered it to Irbid in two days. It made my mother cry — in the best way.",
    cite: "Rania S. — Irbid"
  },
  {
    quote: "Bought the Hala bangle for our anniversary. The made-to-order sizing and the box it arrived in — everything felt considered.",
    cite: "Fadi & Lina — Aqaba"
  }
];

export function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="testimonial-stage">
        {testimonials.map((testimonial, index) => (
          <article className={`testimonial${active === index ? " active" : ""}`} key={testimonial.cite}>
            <p className="stars">★★★★★</p>
            <blockquote>“{testimonial.quote}”</blockquote>
            <cite>{testimonial.cite}</cite>
          </article>
        ))}
      </div>
      <div className="testimonial-dots">
        {testimonials.map((testimonial, index) => (
          <button
            aria-label={`Show testimonial ${index + 1}`}
            className={active === index ? "active" : ""}
            key={testimonial.cite}
            onClick={() => setActive(index)}
            type="button"
          />
        ))}
      </div>
    </>
  );
}
