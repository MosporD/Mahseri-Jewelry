"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function ProductPurchaseControls({
  productId,
  disabled
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  return (
    <div className="qty-row">
      <div className="qty-control" aria-label="Quantity">
        <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button>
        <output>{qty}</output>
        <button type="button" onClick={() => setQty((value) => value + 1)}>+</button>
      </div>
      <button
        className="btn btn-solid"
        disabled={disabled}
        onClick={() => {
          addItem(productId, qty);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1600);
        }}
        style={{ flex: 1 }}
        type="button"
      >
        {added ? "Added" : "Add to bag"}
      </button>
    </div>
  );
}
