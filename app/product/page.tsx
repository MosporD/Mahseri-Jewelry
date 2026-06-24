import { redirect } from "next/navigation";

export default async function LegacyProductRedirect({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  redirect(id ? `/product/${id}` : "/shop");
}
