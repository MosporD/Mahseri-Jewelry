"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/src/lib/supabase";
import { categories, gemTypes } from "@/src/lib/seed-data";
import type { Product, ProductInput } from "@/src/lib/types";

const emptyProduct: ProductInput = {
  id: "",
  sku: "",
  name: "",
  collection: "gold",
  category: "Bracelets",
  material: "21K Gold",
  gender: "Her",
  price: 1,
  weight: "1 g",
  making_fee: 0,
  badge: null,
  art: null,
  image: "",
  description: "",
  in_stock: true
};

export function AdminDashboard({ initialProducts }: { initialProducts: Product[] }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editing, setEditing] = useState<ProductInput>(emptyProduct);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function authHeaders(): Promise<Record<string, string>> {
    const activeSession = session || (supabase ? (await supabase.auth.getSession()).data.session : null);
    return activeSession ? { Authorization: `Bearer ${activeSession.access_token}` } : {};
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setStatus("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable admin login.");
      return;
    }
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setStatus(error ? error.message : "Signed in.");
  }

  async function refreshProducts() {
    const response = await fetch("/api/admin/products", {
      headers: await authHeaders()
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || "Could not load products.");
      return;
    }
    setProducts(result.products);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving product...");
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(await authHeaders())
      },
      body: JSON.stringify({
        ...editing,
        id: editing.id || slugify(editing.name),
        price: Number(editing.price) || 1,
        making_fee: Number(editing.making_fee) || 0
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || "Could not save product.");
      return;
    }
    setStatus("Product saved.");
    setEditing(emptyProduct);
    await refreshProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: await authHeaders()
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || "Could not delete product.");
      return;
    }
    setStatus("Product deleted.");
    await refreshProducts();
  }

  async function uploadImage(file: File) {
    setStatus("Uploading image...");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", `${editing.collection}/${slugify(editing.category || "products")}`);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: await authHeaders(),
      body: formData
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || "Could not upload image.");
      return;
    }
    setEditing((current) => ({ ...current, image: result.url }));
    setStatus("Image uploaded.");
  }

  if (!session) {
    return (
      <form className="admin-form" onSubmit={login}>
        <h2>Admin sign in</h2>
        <p>Use a Supabase Auth account. Set `ADMIN_EMAIL` in Vercel to restrict access to one owner account.</p>
        <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label>
        <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></label>
        <button className="btn btn-solid" type="submit">Sign in</button>
        {status ? <p className="form-status">{status}</p> : null}
      </form>
    );
  }

  return (
    <div className="admin-grid">
      <section className="admin-panel">
        <h2>Products</h2>
        <button className="btn btn-ghost" type="button" onClick={refreshProducts}>Refresh</button>
        <table className="admin-table">
          <thead>
            <tr><th>SKU</th><th>Name</th><th>Metal</th><th>Price</th><th /></tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.material}</td>
                <td>{product.price} JOD</td>
                <td className="admin-actions">
                  <button className="btn btn-ghost" type="button" onClick={() => setEditing(product)}>Edit</button>
                  <button className="btn btn-ghost" type="button" onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <form className="admin-form" onSubmit={saveProduct}>
        <h2>{editing.id ? "Edit product" : "New product"}</h2>
        <label>ID<input value={editing.id} onChange={(event) => setEditing({ ...editing, id: event.target.value })} placeholder="auto-from-name" /></label>
        <label>SKU<input value={editing.sku} onChange={(event) => setEditing({ ...editing, sku: event.target.value })} /></label>
        <label>Name<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required /></label>
        <label>Collection<select value={editing.collection} onChange={(event) => setEditing({ ...editing, collection: event.target.value as ProductInput["collection"] })}><option value="gold">Gold</option><option value="silver">Silver</option><option value="gems">Gems</option></select></label>
        <label>Category<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}>{[...categories, ...gemTypes].map((category) => <option key={category}>{category}</option>)}</select></label>
        <label>Material<select value={editing.material} onChange={(event) => setEditing({ ...editing, material: event.target.value })}><option>21K Gold</option><option>18K Gold</option><option>925 Silver</option><option>Gemstone</option></select></label>
        <label>Gender<select value={editing.gender} onChange={(event) => setEditing({ ...editing, gender: event.target.value as ProductInput["gender"] })}><option>Her</option><option>Him</option><option>Both</option></select></label>
        <label>Weight<input value={editing.weight} onChange={(event) => setEditing({ ...editing, weight: event.target.value })} /></label>
        <label>Price<input type="number" value={editing.price} onChange={(event) => setEditing({ ...editing, price: Number(event.target.value) })} /></label>
        <label>Making fee<input type="number" value={editing.making_fee || 0} onChange={(event) => setEditing({ ...editing, making_fee: Number(event.target.value) })} /></label>
        <label>Image URL<input value={editing.image || ""} onChange={(event) => setEditing({ ...editing, image: event.target.value })} /></label>
        <label>Upload image<input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0])} /></label>
        <p className="form-status">Crop images before upload when needed; the storage-backed crop editor can be expanded from this upload path.</p>
        <label>Description<textarea rows={4} value={editing.description || ""} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label>
        <label><input checked={Boolean(editing.in_stock ?? true)} type="checkbox" onChange={(event) => setEditing({ ...editing, in_stock: event.target.checked })} /> In stock</label>
        <div className="admin-actions">
          <button className="btn btn-solid" type="submit">Save product</button>
          <button className="btn btn-ghost" type="button" onClick={() => setEditing(emptyProduct)}>Clear</button>
        </div>
        {status ? <p className="form-status">{status}</p> : null}
      </form>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
