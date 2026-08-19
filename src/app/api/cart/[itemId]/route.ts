import { NextRequest, NextResponse } from "next/server";
import { getSession, getOrCreateGuestToken } from "@/lib/session";
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart-service";

async function resolveOwner() {
  const session = await getSession();
  if (session) return { userId: session.userId };
  const guestToken = await getOrCreateGuestToken();
  return { guestToken };
}

// PATCH /api/cart/:itemId  { quantity } — the +/- stepper on a cart line item
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const owner = await resolveOwner();
    const { itemId } = await params;
    const { quantity } = await req.json();
    if (typeof quantity !== "number") {
      return NextResponse.json({ error: "quantity must be a number" }, { status: 400 });
    }
    const item = await updateCartItemQuantity(owner, itemId, quantity);
    return NextResponse.json({ item }); // item is null if quantity was 0 (removed)
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/cart/:itemId — explicit "remove" action on a cart line item
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const owner = await resolveOwner();
    const { itemId } = await params;
    await removeCartItem(owner, itemId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  const e = err as { status?: number; message?: string };
  return NextResponse.json({ error: e.message ?? "Something went wrong." }, { status: e.status ?? 500 });
}
