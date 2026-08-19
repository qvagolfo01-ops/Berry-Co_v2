import { db, type Availability } from "./db";

interface CartOwner {
  userId?: string;
  guestToken?: string;
}

/**
 * A cart belongs to EITHER a logged-in user OR a guest session token,
 * never both. This mirrors the top nav showing Cart as available before
 * "Login/Sign up" — guests can add to cart, but wishlist requires login
 * (see wishlist-service.ts, which always takes a userId).
 */
async function getOrCreateCart({ userId, guestToken }: CartOwner) {
  if (userId) {
    return db.cart.upsert({ where: { userId }, create: { userId } });
  }
  if (guestToken) {
    return db.cart.upsert({ where: { sessionToken: guestToken }, create: { sessionToken: guestToken } });
  }
  throw Object.assign(new Error("NO_CART_OWNER"), { status: 401 });
}

export async function getCart(owner: CartOwner) {
  const cart = await getOrCreateCart(owner);
  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
    orderBy: { addedAt: "asc" },
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceSnapshot * item.quantity, 0);

  return { cartId: cart.id, items, subtotal, itemCount: items.length };
}

/**
 * Validates a product against the same availability states shown on the
 * Product Page and Search filters: In-Stock, Pre-Order, On Sale, Out of Stock.
 *   - IN_STOCK / ON_SALE  -> must have stockQty >= requested quantity
 *   - PRE_ORDER           -> must be within [preOrderStart, preOrderEnd]
 *   - OUT_OF_STOCK        -> always rejected
 */
function assertPurchasable(
  product: {
    availability: Availability;
    stockQty: number;
    preOrderStart: Date | null;
    preOrderEnd: Date | null;
    isActive: boolean;
    name: string;
  },
  requestedQty: number
) {
  if (!product.isActive) {
    throw Object.assign(new Error(`"${product.name}" is no longer available.`), { status: 409 });
  }

  switch (product.availability) {
    case "OUT_OF_STOCK":
      throw Object.assign(new Error(`"${product.name}" is out of stock.`), { status: 409 });

    case "IN_STOCK":
    case "ON_SALE":
      if (product.stockQty < requestedQty) {
        throw Object.assign(
          new Error(`Only ${product.stockQty} unit(s) of "${product.name}" left in stock.`),
          { status: 409 }
        );
      }
      break;

    case "PRE_ORDER": {
      const now = new Date();
      const opened = !product.preOrderStart || now >= product.preOrderStart;
      const closed = product.preOrderEnd ? now > product.preOrderEnd : false;
      if (!opened || closed) {
        throw Object.assign(new Error(`Pre-orders for "${product.name}" are not currently open.`), {
          status: 409,
        });
      }
      break;
    }
  }
}

export async function addToCart(owner: CartOwner, productId: string, quantity: number) {
  if (quantity < 1) {
    throw Object.assign(new Error("Quantity must be at least 1."), { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw Object.assign(new Error("PRODUCT_NOT_FOUND"), { status: 404 });
  }

  const cart = await getOrCreateCart(owner);

  // If it's already in the cart, we're incrementing — so validate against
  // the NEW total quantity, not just the delta.
  const existing = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  assertPurchasable(product, newQuantity);

  return db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity, unitPriceSnapshot: product.price },
    update: {
      quantity: newQuantity,
      unitPriceSnapshot: product.price, // refresh price snapshot on re-add
    },
  });
}

export async function updateCartItemQuantity(owner: CartOwner, cartItemId: string, quantity: number) {
  const cart = await getOrCreateCart(owner);
  const item = await db.cartItem.findUnique({ where: { id: cartItemId } });

  if (!item || item.cartId !== cart.id) {
    throw Object.assign(new Error("CART_ITEM_NOT_FOUND"), { status: 404 });
  }

  if (quantity < 1) {
    await db.cartItem.delete({ where: { id: cartItemId } });
    return null;
  }

  if (!item.product) {
    throw Object.assign(new Error("PRODUCT_NOT_FOUND"), { status: 404 });
  }

  assertPurchasable(item.product, quantity);

  return db.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
}

export async function removeCartItem(owner: CartOwner, cartItemId: string) {
  const cart = await getOrCreateCart(owner);
  const item = await db.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.cartId !== cart.id) {
    throw Object.assign(new Error("CART_ITEM_NOT_FOUND"), { status: 404 });
  }
  await db.cartItem.delete({ where: { id: cartItemId } });
}

export async function clearCart(cartId: string) {
  await db.cartItem.deleteMany({ where: { cartId } });
}
