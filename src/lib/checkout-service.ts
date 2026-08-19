import { db, type ShippingAddress, type OrderItem, type Order } from "./db";
import { generateOrderNumber } from "./order-number";

export interface CheckoutInput {
  userId: string; // checkout requires a logged-in user (guests must sign in/up first)
  shippingAddress: ShippingAddress;
  paymentMethod: string; // e.g. "card", "gcash", "cod" — left generic on purpose
  shippingFee?: number;
}

// NOTE ON MONEY MATH: this uses plain `number` for totals, which is fine for
// the in-memory stand-in but is NOT safe for real currency math (floating
// point rounding). Once Supabase is connected, store prices as integer
// cents/centavos, or use a decimal library (e.g. decimal.js) for the
// subtotal/total calculations below — the same way Prisma.Decimal was doing
// it before this file was adapted away from Prisma.

/**
 * Checkout is the one place where correctness matters most, so everything
 * happens inside a single transaction wrapper (db.$transaction — see the
 * migration note in db.ts about making this a real Postgres transaction
 * once Supabase is connected):
 *   1. Re-fetch the cart fresh (never trust client-side totals).
 *   2. Re-validate EVERY line against current availability/stock/pre-order
 *      window — prices and stock can change between "view cart" and
 *      "click checkout".
 *   3. Decrement stockQty for IN_STOCK / ON_SALE items (pre-orders don't
 *      decrement stock the same way — see note below).
 *   4. Snapshot product name + price onto OrderItem so the order stays
 *      accurate even if the product is edited/discontinued later.
 *   5. Create the Order with status PENDING — matching the "Pending" badge
 *      already shown in your admin's Recent Orders table.
 *   6. Empty the cart.
 * If any step fails, the whole checkout throws and nothing is created.
 * (Real atomicity — no partial orders, no stock silently vanishing — only
 * arrives once step 3-6 run inside an actual Postgres transaction; see
 * the $transaction note in db.ts.)
 */
export async function checkout(input: CheckoutInput): Promise<Order> {
  return db.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId: input.userId },
      include: { items: { include: { product: true } } },
    });

    const cartWithItems = cart as (typeof cart & {
      items: { productId: string; quantity: number; product: NonNullable<Awaited<ReturnType<typeof tx.product.findUnique>>> }[];
    }) | null;

    if (!cartWithItems || cartWithItems.items.length === 0) {
      throw Object.assign(new Error("Your cart is empty."), { status: 400 });
    }

    let subtotal = 0;
    const orderItemsData: Omit<OrderItem, "id" | "orderId">[] = [];

    for (const item of cartWithItems.items) {
      const product = item.product;

      if (!product.isActive) {
        throw Object.assign(
          new Error(`"${product.name}" is no longer available and was removed from checkout.`),
          { status: 409 }
        );
      }

      const isPreOrder = product.availability === "PRE_ORDER";

      if (isPreOrder) {
        const now = new Date();
        const opened = !product.preOrderStart || now >= product.preOrderStart;
        const closed = product.preOrderEnd ? now > product.preOrderEnd : false;
        if (!opened || closed) {
          throw Object.assign(new Error(`Pre-order window for "${product.name}" has closed.`), {
            status: 409,
          });
        }
        // Pre-orders are NOT decremented from stockQty here — they represent
        // future manufacturing/allocation, typically tracked separately by
        // the admin (see Inventory / Orders tabs in the dashboard) rather
        // than physical on-hand stock.
      } else if (product.availability === "OUT_OF_STOCK") {
        throw Object.assign(new Error(`"${product.name}" is out of stock.`), { status: 409 });
      } else {
        // IN_STOCK or ON_SALE — must have real stock, and we decrement it
        // atomically inside this same transaction wrapper to prevent
        // overselling when two customers check out the same last unit
        // simultaneously.
        const updated = await tx.product.updateMany({
          where: { id: product.id, stockQty: { gte: item.quantity } },
          data: { stockQty: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw Object.assign(new Error(`"${product.name}" just sold out — please update your cart.`), {
            status: 409,
          });
        }
      }

      const unitPrice = product.price; // always use current price, not the stale cart snapshot
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: product.id,
        productNameSnapshot: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        isPreOrder,
      });
    }

    const shippingFee = input.shippingFee ?? 0;
    const total = subtotal + shippingFee;

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: input.userId,
        status: "PENDING",
        subtotal,
        shippingFee,
        total,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        paymentStatus: "UNPAID",
        items: { createMany: { data: orderItemsData } },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cartWithItems.id } });

    return order;
  });
}
