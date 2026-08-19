import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { removeFromWishlist } from "@/lib/wishlist-service";

// DELETE /api/wishlist/:productId — un-heart a product
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const session = await requireUser();
    const { productId } = await params;
    await removeFromWishlist(session.userId, productId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    return NextResponse.json({ error: e.message ?? "Something went wrong." }, { status: e.status ?? 500 });
  }
}
