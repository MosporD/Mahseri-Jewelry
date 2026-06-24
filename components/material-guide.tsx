"use client";

import { useState } from "react";

const materials = [
  {
    id: "21k",
    label: "21K Gold",
    title: "21K — The regional signature",
    text: "The classic standard of Jordanian gold. Rich colour with everyday resilience — the metal of our signature chains and bracelets.",
    purity: "87.5% gold",
    tone: "Rich yellow",
    best: "Chains, bracelets, daily luxury",
    coin: "21",
    fill: "radial-gradient(circle at 32% 28%, #ffeec0, #e3b652 55%, #b78c33)",
    width: "87.5%"
  },
  {
    id: "18k",
    label: "18K Gold",
    title: "18K — Modern balance",
    text: "Strength meets refinement. 18K holds detail beautifully, making it our choice for sculpted pendants, fine earrings and pieces you live in.",
    purity: "75% gold",
    tone: "Soft elegant yellow",
    best: "Detailed & everyday designs",
    coin: "18",
    fill: "radial-gradient(circle at 32% 28%, #fdf0cd, #ddb968 55%, #ad8c46)",
    width: "75%"
  },
  {
    id: "925",
    label: "925 Silver",
    title: "925 — Sterling character",
    text: "Solid sterling silver, polished to a moonlit finish. Versatile, durable, and the most welcoming way into handcrafted jewellery.",
    purity: "92.5% silver",
    tone: "Cool white lustre",
    best: "Everyday essentials & stacking",
    coin: "925",
    fill: "radial-gradient(circle at 32% 28%, #ffffff, #cfd3d8 55%, #9aa0a8)",
    width: "92.5%"
  }
];

export function MaterialGuide() {
  const [active, setActive] = useState(materials[0].id);

  return (
    <>
      <div className="material-tabs" role="tablist">
        {materials.map((material) => (
          <button
            className={active === material.id ? "active" : ""}
            key={material.id}
            onClick={() => setActive(material.id)}
            type="button"
          >
            {material.label}
          </button>
        ))}
      </div>
      {materials.map((material) => (
        <div className={`material-panel${active === material.id ? " active" : ""}`} key={material.id}>
          <div>
            <h3>{material.title}</h3>
            <p>{material.text}</p>
            <ul className="material-meta">
              <li><span>Purity</span><b>{material.purity}</b></li>
              <li><span>Tone</span><b>{material.tone}</b></li>
              <li><span>Best for</span><b>{material.best}</b></li>
            </ul>
            <div className="purity-bar"><i style={{ width: material.width }} /></div>
          </div>
          <div className="material-swatch">
            <div className="coin" style={{ background: material.fill }}>{material.coin}</div>
          </div>
        </div>
      ))}
    </>
  );
}
