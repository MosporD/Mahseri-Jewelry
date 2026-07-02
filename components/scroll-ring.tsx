"use client";

import { useEffect, useRef } from "react";

const gold = "var(--gold)";
const soft = "rgba(185, 151, 79, 0.4)";

export function ScrollRing() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      svgRef.current?.style.setProperty("transform", `rotate(${progress * 360}deg)`);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <aside className="scroll-ring" aria-hidden="true">
      <div className="scroll-ring-halo" />
      <svg ref={svgRef} viewBox="0 0 260 260" fill="none">
        <circle cx="130" cy="158" r="58" stroke={gold} strokeWidth="7" />
        <circle cx="130" cy="158" r="48" stroke={soft} strokeWidth="1.4" />
        <path d="M104 72 L130 100 L156 72" stroke={gold} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M104 72 H156" stroke={gold} strokeWidth="3" />
        <path d="M104 72 L118 52 H142 L156 72" stroke={gold} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M118 52 L130 72 L142 52" stroke={soft} strokeWidth="1.4" />
        <path d="M130 72 V100" stroke={soft} strokeWidth="1.4" />
        <path d="M186 50 v16 M178 58 h16" stroke={soft} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M72 38 v10 M67 43 h10" stroke={soft} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </aside>
  );
}
