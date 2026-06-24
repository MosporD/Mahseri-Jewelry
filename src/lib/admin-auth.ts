import { createClient } from "@supabase/supabase-js";

export async function assertAdminFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon || !token) {
    throw new Error("Admin authentication is required.");
  }

  const supabase = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid admin session.");

  const allowedEmail = process.env.ADMIN_EMAIL;
  if (allowedEmail && data.user.email !== allowedEmail) {
    throw new Error("This account is not allowed to manage products.");
  }

  return data.user;
}
