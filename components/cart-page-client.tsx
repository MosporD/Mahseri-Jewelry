"use client";

import { FormEvent, useMemo, useState } from "react";
import { useCart } from "./cart-provider";
import type { Product } from "@/src/lib/types";
import { storeSettings } from "@/src/lib/seed-data";

export function CartPageClient({ products }: { products: Product[] }) {
  const { items, updateItem, removeItem, clearCart } = useCart();
  const [status, setStatus] = useState("");
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const lines = items
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        item,
        product,
        lineTotal: product.price * item.qty
      };
    })
    .filter(Boolean) as Array<{ item: { productId: string; qty: number }; product: Product; lineTotal: number }>;
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = subtotal >= storeSettings.freeShippingThreshold || subtotal === 0 ? 0 : storeSettings.shippingFlat;
  const total = subtotal + shipping;
  const deposit = Math.round(total * 0.4);
  const balance = total - deposit;

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lines.length) return;
    setStatus("Sending order...");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customer_name: String(form.get("name") || ""),
        customer_phone: String(form.get("phone") || ""),
        customer_email: String(form.get("email") || ""),
        city: String(form.get("city") || ""),
        address: String(form.get("address") || ""),
        payment_method: String(form.get("payment") || "cod"),
        notes: String(form.get("notes") || ""),
        subtotal,
        shipping,
        total,
        deposit_due: deposit,
        balance_due: balance,
        items: lines.map((line) => ({
          product_id: line.product.id,
          name: line.product.name,
          quantity: line.item.qty,
          unit_price: line.product.price,
          line_total: line.lineTotal
        }))
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || "Could not create order.");
      return;
    }
    clearCart();
    setStatus(`Order ${result.orderNumber || result.id} received. We will contact you to confirm.`);
  }

  return (
    <div className="cart-page-grid">
      <div>
        {lines.length ? (
          lines.map((line) => (
            <article className="cart-line" key={line.product.id}>
              <div>
                <h3>{line.product.name}</h3>
                <p>{line.product.material} · {line.product.weight}</p>
                <p>{line.product.price.toLocaleString("en-JO")} JOD each</p>
              </div>
              <div className="admin-actions">
                <input
                  aria-label={`Quantity for ${line.product.name}`}
                  min={1}
                  type="number"
                  value={line.item.qty}
                  onChange={(event) => updateItem(line.product.id, Number(event.target.value))}
                />
                <button className="btn btn-ghost" type="button" onClick={() => removeItem(line.product.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-note">Your bag is empty — the collection is waiting.</p>
        )}
      </div>
      <aside className="admin-panel">
        <h2>Checkout</h2>
        <p>Subtotal: {subtotal.toLocaleString("en-JO")} JOD</p>
        <p>Delivery: {shipping ? `${shipping} JOD` : "Free"}</p>
        <p>Total: {total.toLocaleString("en-JO")} JOD</p>
        <p>Deposit due now: {deposit.toLocaleString("en-JO")} JOD</p>
        <form className="checkout-form" onSubmit={submitOrder}>
          <label>Name<input name="name" required /></label>
          <label>Phone<input name="phone" required /></label>
          <label>Email<input name="email" type="email" /></label>
          <label>City<select name="city">{storeSettings.cities.map((city) => <option key={city}>{city}</option>)}</select></label>
          <label>Address<textarea name="address" required rows={3} /></label>
          <label>Payment<select name="payment"><option value="cod">Cash on delivery</option><option value="cliq">CliQ / bank transfer</option><option value="whatsapp">WhatsApp order</option></select></label>
          <label>Notes<textarea name="notes" rows={3} /></label>
          <button className="btn btn-solid" type="submit" disabled={!lines.length}>Place order</button>
          {status ? <p className="form-status">{status}</p> : null}
        </form>
      </aside>
    </div>
  );
}
