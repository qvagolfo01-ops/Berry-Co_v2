import { NextRequest, NextResponse } from "next/server";
import { getSession, getOrCreateGuestToken } from "@/lib/session";
import { getCart, addToCart } from "@/lib/cart-service";

/**
 * Resolves who "owns" this cart request. Cart works for guests too (the
 * nav bar shows "Cart" as accessible before "Login/Sign up"), so we fall
 * back to a guest cookie token when there's no session.
 */
async function resolveOwner() {
  const session = await getSession();
  if (session) return { userId: session.userId };
  const guestToken = await getOrCreateGuestToken();
  return { guestToken };
}

// GET /api/cart — powers the Cart page and the cart icon item count
export async function GET() {
  try {
    const owner = await resolveOwner();
    const cart = await getCart(owner);
    return NextResponse.json(cart);
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/cart  { productId, quantity } — "Add to Cart" button on the Product Page
export async function POST(req: NextRequest) {
  try {
    const owner = await resolveOwner();
    const { productId, quantity = 1 } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    const item = await addToCart(owner, productId, quantity);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  const e = err as { status?: number; message?: string };
  return NextResponse.json({ error: e.message ?? "Something went wrong." }, { status: e.status ?? 500 });
}
