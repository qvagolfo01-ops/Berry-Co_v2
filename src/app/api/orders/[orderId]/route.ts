import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";

// GET /api/orders/:orderId — order confirmation page after checkout
export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const session = await requireUser();
    const { orderId } = await params;

    const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });

    if (!order || order.userId !== session.userId) {
      // Same 404 whether it doesn't exist or belongs to someone else —
      // never leak which orderIds are valid for other accounts.
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    return NextResponse.json({ error: e.message ?? "Something went wrong." }, { status: e.status ?? 500 });
  }
}
