"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import type { Product } from "@/src/lib/types";
import { storeSettings } from "@/src/lib/seed-data";

export function CartPageClient({ products }: { products: Product[] }) {
  const { items, updateItem, removeItem, clearCart } = useCart();
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess(`Order ${result.orderNumber || result.id} received. We will contact you to confirm.`);
    setStatus("");
  }

  if (success) {
    return (
      <div className="order-success">
        <div className="check">✓</div>
        <h2>Order received with thanks</h2>
        <p className="order-no">{success.split(" received")[0]}</p>
        <p>{success}</p>
        <Link className="btn btn-outline" href="/shop">Continue browsing</Link>
      </div>
    );
  }

  return (
    <>
      {!lines.length ? (
        <div>
          <p className="empty-note">Your bag is empty — the collection is waiting.</p>
          <p style={{ textAlign: "center" }}><Link className="btn btn-solid" href="/shop">Browse the collection</Link></p>
        </div>
      ) : null}
      <div className="cart-layout">
      <div className="cart-table">
        {lines.length ? (
          lines.map((line) => (
            <article className="cart-line" key={line.product.id}>
              <div>
                <div className="cl-thumb">
                  <Image
                    src={line.product.image || "/assets/art/precious-stone.svg"}
                    alt=""
                    width={74}
                    height={74}
                  />
                </div>
              </div>
              <div>
                <h4>{line.product.name}</h4>
                <p className="cl-meta">{line.product.material} · {line.product.weight} · {line.product.price.toLocaleString("en-JO")} JOD each</p>
                <div className="cl-qty">
                  <button type="button" onClick={() => updateItem(line.product.id, Math.max(1, line.item.qty - 1))}>−</button>
                  <span>{line.item.qty}</span>
                  <button type="button" onClick={() => updateItem(line.product.id, line.item.qty + 1)}>+</button>
                  <button type="button" onClick={() => removeItem(line.product.id)}>Remove</button>
                </div>
              </div>
              <div>
                <p className="cl-price">{line.lineTotal.toLocaleString("en-JO")} JOD</p>
              </div>
            </article>
          ))
        ) : (
          null
        )}
      </div>
      <aside className="summary-card">
        <h3>Order Summary</h3>
        <div className="summary-row"><span>Subtotal</span><span>{subtotal.toLocaleString("en-JO")} JOD</span></div>
        <div className="summary-row"><span>Delivery</span><span>{shipping ? `${shipping} JOD` : "Free"}</span></div>
        <p className="free-ship-note">
          {subtotal > 0 && subtotal < storeSettings.freeShippingThreshold
            ? `Add ${(storeSettings.freeShippingThreshold - subtotal).toLocaleString("en-JO")} JOD for free delivery.`
            : "Complimentary insured delivery applies."}
        </p>
        <div className="summary-row total"><span>Total</span><span>{total.toLocaleString("en-JO")} JOD</span></div>
        <form className="checkout-form" onSubmit={submitOrder}>
          <div className="field"><label htmlFor="co-name">Full name</label><input id="co-name" name="name" required autoComplete="name" /></div>
          <div className="row-2">
            <div className="field"><label htmlFor="co-phone">Phone</label><input id="co-phone" name="phone" required placeholder="07X XXX XXXX" autoComplete="tel" /></div>
            <div className="field"><label htmlFor="co-city">City</label><select id="co-city" name="city">{storeSettings.cities.map((city) => <option key={city}>{city}</option>)}</select></div>
          </div>
          <div className="field"><label htmlFor="co-email">Email (for your invoice)</label><input id="co-email" name="email" type="email" placeholder="you@example.com" /></div>
          <div className="field"><label htmlFor="co-address">Delivery address</label><textarea id="co-address" name="address" required rows={2} /></div>
          <div className="field">
            <label>Payment</label>
            <div className="pay-options">
              <label className="pay-option"><input defaultChecked name="payment" type="radio" value="cod" /><span>Cash on delivery<small>40% deposit required to confirm. Remaining 60% paid to the courier on delivery.</small></span></label>
              <label className="pay-option"><input name="payment" type="radio" value="cliq" /><span>CliQ / bank transfer<small>Pay a 40% deposit via CliQ to confirm. Remaining 60% before/at delivery.</small></span></label>
              <label className="pay-option"><input name="payment" type="radio" value="whatsapp" /><span>Confirm via WhatsApp<small>Send your order straight to the atelier</small></span></label>
              <label className="pay-option"><input name="payment" type="radio" value="card" /><span>Card — Visa / Mastercard<small>We send you a secure payment link after confirming your order</small></span></label>
            </div>
            <p style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: "0.65rem" }}>
              Confirmation deposit due now: {deposit.toLocaleString("en-JO")} JOD (40%). Remaining: {balance.toLocaleString("en-JO")} JOD.
            </p>
            <p style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: "0.35rem" }}>
              Deposit payment aliases: <strong>MosporD</strong> or <strong>00962797157007</strong>.
            </p>
          </div>
          <div className="field"><label htmlFor="co-notes">Notes (engraving, sizing, gift wrap)</label><textarea id="co-notes" name="notes" rows={2} /></div>
          <button className="btn btn-gold btn-wide" type="submit" disabled={!lines.length}>Place order</button>
          <p style={{ fontSize: "0.76rem", color: "var(--muted)", textAlign: "center" }}>
            Every order is confirmed personally by the atelier before dispatch.
          </p>
          {status ? <p className="form-status">{status}</p> : null}
        </form>
      </aside>
    </div>
    </>
  );
}
