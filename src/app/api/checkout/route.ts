import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { checkout } from "@/lib/checkout-service";

// POST /api/checkout  { shippingAddress, paymentMethod, shippingFee? }
// Requires login — guests get redirected to Login/Sign up first, same as
// the nav bar implies (Cart is guest-accessible, checkout is not).
export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = await req.json();

    if (!body.shippingAddress || !body.paymentMethod) {
      return NextResponse.json({ error: "shippingAddress and paymentMethod are required" }, { status: 400 });
    }

    const order = await checkout({
      userId: session.userId,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      shippingFee: body.shippingFee,
    });

    // Order now shows up immediately in the admin dashboard's
    // "Recent Orders" table and increments Total Orders / Pending Orders.
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    return NextResponse.json({ error: e.message ?? "Checkout failed." }, { status: e.status ?? 500 });
  }
}
