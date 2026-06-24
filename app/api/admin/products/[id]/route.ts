import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { assertAdminFromRequest } from "@/src/lib/admin-auth";
import { deleteProduct } from "@/src/lib/catalog";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdminFromRequest(request);
    const { id } = await context.params;
    await deleteProduct(id);
    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete product." },
      { status: 500 }
    );
  }
}
