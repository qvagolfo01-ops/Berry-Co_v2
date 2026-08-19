import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getWishlist, addToWishlist } from "@/lib/wishlist-service";

// GET /api/wishlist — powers the wishlist page / heart-icon states
export async function GET() {
  try {
    const session = await requireUser();
    const items = await getWishlist(session.userId);
    return NextResponse.json({ items });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/wishlist  { productId } — "Add to Wishlist" button on the Product Page
export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    const item = await addToWishlist(session.userId, productId);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  const e = err as { status?: number; message?: string };
  return NextResponse.json({ error: e.message ?? "Something went wrong." }, { status: e.status ?? 500 });
}
