import Link from "next/link";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getProducts } from "@/src/lib/catalog";

export const metadata = {
  title: "Admin"
};

export default async function AdminPage() {
  const products = await getProducts();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Admin
          </p>
          <h1>Catalogue Admin</h1>
          <p>Persistent product editing backed by Supabase Auth, Database, and Storage.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <AdminDashboard initialProducts={products} />
        </div>
      </section>
    </>
  );
}
