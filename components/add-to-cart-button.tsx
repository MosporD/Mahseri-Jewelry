"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function AddToCartButton({
  productId,
  disabled = false,
  label = "Add to bag"
}: {
  productId: string;
  disabled?: boolean;
  label?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className="btn btn-solid"
      disabled={disabled}
      onClick={() => {
        addItem(productId, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      type="button"
    >
      {added ? "Added" : label}
    </button>
  );
}
