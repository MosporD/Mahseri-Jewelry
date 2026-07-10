"use client";

import { useEffect } from "react";

const SELECTORS = [
  ".section-head",
  ".collection-card",
  ".product-grid .product-card",
  ".craft-step",
  ".service-card",
  ".hallmark-seal-wrap",
  ".material-tabs",
  ".testimonial-stage"
].join(", ");

export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS));
    if (!elements.length) return;

    const siblingIndex = new Map<HTMLElement, number>();
    const counters = new Map<HTMLElement | null, number>();
    elements.forEach((element) => {
      const parent = element.parentElement;
      const next = (counters.get(parent) ?? 0) + 1;
      counters.set(parent, next);
      siblingIndex.set(element, next - 1);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.style.transitionDelay = `${(siblingIndex.get(element) ?? 0) % 4 * 90}ms`;
          element.classList.add("reveal-in");
          io.unobserve(element);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    elements.forEach((element) => {
      element.classList.add("reveal");
      io.observe(element);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
