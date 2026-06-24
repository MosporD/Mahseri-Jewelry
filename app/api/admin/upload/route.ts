import { NextRequest, NextResponse } from "next/server";
import { assertAdminFromRequest } from "@/src/lib/admin-auth";
import { createServiceSupabaseClient } from "@/src/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    await assertAdminFromRequest(request);
    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase service credentials are required." }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "products");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_PRODUCTS_BUCKET || "product-images";
    const safeName = file.name.replace(/[^a-z0-9.\-_]+/gi, "-").toLowerCase();
    const objectPath = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: true
    });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return NextResponse.json({ path: objectPath, url: data.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload image." },
      { status: 500 }
    );
  }
}
