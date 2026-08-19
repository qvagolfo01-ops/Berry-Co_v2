import { randomUUID } from "crypto";

// ============================================================
// TEMPORARY in-memory data layer for cart / wishlist / checkout.
//
// This exists because src/lib/supabase/{client,server,admin}.ts
// aren't backed by a live Supabase project yet. Every function here
// is named and shaped to match what the equivalent Supabase query
// will look like, so migrating later is a per-function swap, not a
// rewrite of cart-service.ts / wishlist-service.ts / checkout-service.ts.
//
// MIGRATION PATH (once Supabase is connected):
//   1. Create these tables in Supabase: carts, cart_items, wishlists,
//      wishlist_items, orders, order_items (products table likely
//      already exists — see src/lib/data/data-products.ts).
//   2. In this file, replace each in-memory array operation with a
//      call to `createClient()` from src/lib/supabase/server.ts and
//      the equivalent `.from("table").select/insert/update()` chain.
//   3. Keep the exported function names/signatures identical —
//      cart-service.ts, wishlist-service.ts, and checkout-service.ts
//      never need to change, they just call `db.*`.
//   4. Replace the fake `$transaction` at the bottom with a real
//      Postgres transaction (a `supabase.rpc()` call to a SQL
//      function is the standard approach, since supabase-js doesn't
//      support multi-statement client-side transactions).
//
// Data resets on every server restart — expected for a stand-in,
// not a bug. Seed data below gives you something to test cart/
// wishlist/checkout against without waiting on the DB.
// ============================================================

export type Availability = "IN_STOCK" | "ON_SALE" | "PRE_ORDER" | "OUT_OF_STOCK";

export interface Product {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  availability: Availability;
  isActive: boolean;
  preOrderStart: Date | null;
  preOrderEnd: Date | null;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionToken: string | null;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: number;
  addedAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  addedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isPreOrder: boolean;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: Date;
  items: OrderItem[];
}

// ------------------------------------------------------------
// Seed data — replace with real rows once product data is pulled
// from src/lib/data/data-products.ts / Supabase. Enough here to
// exercise every availability branch in cart-service.ts.
// ------------------------------------------------------------
const products: Product[] = [
  {
    id: "prod_booster_box",
    name: "Deckdrop Starter Booster Box",
    price: 120,
    stockQty: 12,
    availability: "IN_STOCK",
    isActive: true,
    preOrderStart: null,
    preOrderEnd: null,
  },
  {
    id: "prod_sale_sleeve",
    name: "Holo Sleeve Pack (50ct)",
    price: 15,
    stockQty: 40,
    availability: "ON_SALE",
    isActive: true,
    preOrderStart: null,
    preOrderEnd: null,
  },
  {
    id: "prod_preorder_set",
    name: "Next Set Pre-Order Bundle",
    price: 89.99,
    stockQty: 0,
    availability: "PRE_ORDER",
    isActive: true,
    preOrderStart: new Date("2026-04-28T00:00:00+09:00"),
    preOrderEnd: new Date("2026-06-10T23:59:59+09:00"),
  },
  {
    id: "prod_sold_out",
    name: "Limited Playmat",
    price: 45,
    stockQty: 0,
    availability: "OUT_OF_STOCK",
    isActive: true,
    preOrderStart: null,
    preOrderEnd: null,
  },
];

const carts: Cart[] = [];
const cartItems: CartItem[] = [];
const wishlists: Wishlist[] = [];
const wishlistItems: WishlistItem[] = [];
const orders: Order[] = [];

function clone<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function withProduct<T extends { productId: string }>(row: T) {
  return { ...clone(row), product: clone(products.find((p) => p.id === row.productId) ?? null) };
}

// ============================================================
// dbMethods — the six data namespaces, pulled into their own const
// so $transaction (below) can reference this object's type without
// referencing `db` itself. That's the fix: `const db = { ...,
// $transaction(fn: (tx: typeof db) => ...) }` is circular — TS needs
// db's full type to resolve `typeof db`, but can't finish computing
// db's type until it resolves that same reference. Because
// `dbMethods` never mentions `db`, `typeof dbMethods` resolves
// immediately, which is all $transaction's callback actually needs
// (it only ever calls tx.cart / tx.product / tx.order / tx.cartItem
// — never tx.$transaction, so nested transactions were never a case
// this needed to support anyway).
// ============================================================
const dbMethods = {
  product: {
    async findUnique({ where }: { where: { id: string } }): Promise<Product | null> {
      return clone(products.find((p) => p.id === where.id) ?? null);
    },

    /** Mirrors Prisma's conditional updateMany — used for atomic stock decrement. */
    async updateMany({
      where,
      data,
    }: {
      where: { id: string; stockQty: { gte: number } };
      data: { stockQty: { decrement: number } };
    }): Promise<{ count: number }> {
      const product = products.find((p) => p.id === where.id && p.stockQty >= where.stockQty.gte);
      if (!product) return { count: 0 };
      product.stockQty -= data.stockQty.decrement;
      return { count: 1 };
    },
  },

  cart: {
    async upsert({
      where,
      create,
    }: {
      where: { userId?: string; sessionToken?: string };
      create: { userId?: string; sessionToken?: string };
    }): Promise<Cart> {
      let cart = carts.find(
        (c) =>
          (where.userId && c.userId === where.userId) ||
          (where.sessionToken && c.sessionToken === where.sessionToken)
      );
      if (!cart) {
        cart = { id: randomUUID(), userId: create.userId ?? null, sessionToken: create.sessionToken ?? null };
        carts.push(cart);
      }
      return clone(cart);
    },

    async findUnique({
      where,
      include,
    }: {
      where: { userId?: string; sessionToken?: string };
      include?: { items?: { include?: { product?: boolean } } };
    }) {
      const cart = carts.find(
        (c) =>
          (where.userId && c.userId === where.userId) ||
          (where.sessionToken && c.sessionToken === where.sessionToken)
      );
      if (!cart) return null;
      if (!include?.items) return clone(cart);

      const items = cartItems.filter((ci) => ci.cartId === cart.id).map((ci) => withProduct(ci));
      return { ...clone(cart), items };
    },

    async delete({ where }: { where: { id: string } }) {
      const idx = carts.findIndex((c) => c.id === where.id);
      if (idx >= 0) carts.splice(idx, 1);
    },
  },

  cartItem: {
    async findMany({
      where,
    }: {
      where: { cartId: string };
      include?: { product?: boolean };
      orderBy?: { addedAt: "asc" | "desc" };
    }) {
      return cartItems
        .filter((ci) => ci.cartId === where.cartId)
        .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
        .map((ci) => withProduct(ci));
    },

    async findUnique({
      where,
    }: {
      where: { id?: string; cartId_productId?: { cartId: string; productId: string } };
    }) {
      const item = where.id
        ? cartItems.find((ci) => ci.id === where.id)
        : cartItems.find(
            (ci) =>
              ci.cartId === where.cartId_productId!.cartId && ci.productId === where.cartId_productId!.productId
          );
      return item ? withProduct(item) : null;
    },

    async upsert({
      where,
      create,
      update,
    }: {
      where: { cartId_productId: { cartId: string; productId: string } };
      create: { cartId: string; productId: string; quantity: number; unitPriceSnapshot: number };
      update: { quantity: number; unitPriceSnapshot: number };
    }) {
      const existing = cartItems.find(
        (ci) => ci.cartId === where.cartId_productId.cartId && ci.productId === where.cartId_productId.productId
      );
      if (existing) {
        Object.assign(existing, update);
        return withProduct(existing);
      }
      const created: CartItem = { id: randomUUID(), addedAt: new Date(), ...create };
      cartItems.push(created);
      return withProduct(created);
    },

    async update({ where, data }: { where: { id: string }; data: { quantity: number } }) {
      const item = cartItems.find((ci) => ci.id === where.id);
      if (!item) throw Object.assign(new Error("CART_ITEM_NOT_FOUND"), { status: 404 });
      item.quantity = data.quantity;
      return withProduct(item);
    },

    async delete({ where }: { where: { id: string } }) {
      const idx = cartItems.findIndex((ci) => ci.id === where.id);
      if (idx >= 0) cartItems.splice(idx, 1);
    },

    async deleteMany({ where }: { where: { cartId: string } }) {
      for (let i = cartItems.length - 1; i >= 0; i--) {
        if (cartItems[i].cartId === where.cartId) cartItems.splice(i, 1);
      }
    },
  },

  wishlist: {
    async upsert({ where, create }: { where: { userId: string }; create: { userId: string } }): Promise<Wishlist> {
      let wishlist = wishlists.find((w) => w.userId === where.userId);
      if (!wishlist) {
        wishlist = { id: randomUUID(), userId: create.userId };
        wishlists.push(wishlist);
      }
      return clone(wishlist);
    },
  },

  wishlistItem: {
    async findMany({ where }: { where: { wishlistId: string }; include?: { product?: boolean }; orderBy?: { addedAt: "asc" | "desc" } }) {
      return wishlistItems
        .filter((wi) => wi.wishlistId === where.wishlistId)
        .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()) // desc — matches wishlist-service.ts
        .map((wi) => withProduct(wi));
    },

    async findUnique({ where }: { where: { wishlistId_productId: { wishlistId: string; productId: string } } }) {
      const item = wishlistItems.find(
        (wi) =>
          wi.wishlistId === where.wishlistId_productId.wishlistId &&
          wi.productId === where.wishlistId_productId.productId
      );
      return item ? clone(item) : null;
    },

    async upsert({
      where,
      create,
    }: {
      where: { wishlistId_productId: { wishlistId: string; productId: string } };
      create: { wishlistId: string; productId: string };
      update: Record<string, never>;
    }) {
      const existing = wishlistItems.find(
        (wi) =>
          wi.wishlistId === where.wishlistId_productId.wishlistId &&
          wi.productId === where.wishlistId_productId.productId
      );
      if (existing) return withProduct(existing);
      const created: WishlistItem = { id: randomUUID(), addedAt: new Date(), ...create };
      wishlistItems.push(created);
      return withProduct(created);
    },

    async deleteMany({ where }: { where: { wishlistId: string; productId: string } }) {
      for (let i = wishlistItems.length - 1; i >= 0; i--) {
        const wi = wishlistItems[i];
        if (wi.wishlistId === where.wishlistId && wi.productId === where.productId) wishlistItems.splice(i, 1);
      }
    },
  },

  order: {
    async create({
      data,
    }: {
      data: {
        orderNumber: string;
        userId: string;
        status: Order["status"];
        subtotal: number;
        shippingFee: number;
        total: number;
        shippingAddress: ShippingAddress;
        paymentMethod: string;
        paymentStatus: Order["paymentStatus"];
        items: { createMany: { data: Omit<OrderItem, "id" | "orderId">[] } };
      };
      include?: { items?: boolean };
    }): Promise<Order> {
      const orderId = randomUUID();
      const items: OrderItem[] = data.items.createMany.data.map((i) => ({ id: randomUUID(), orderId, ...i }));
      const order: Order = {
        id: orderId,
        orderNumber: data.orderNumber,
        userId: data.userId,
        status: data.status,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        total: data.total,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        createdAt: new Date(),
        items,
      };
      orders.push(order);
      return clone(order);
    },

    async findUnique({ where, include }: { where: { id: string }; include?: { items?: boolean } }) {
      const order = orders.find((o) => o.id === where.id);
      return order ? clone(order) : null;
    },
  },
};

// ============================================================
// db — same call shape used by cart-service.ts / wishlist-service.ts
// / checkout-service.ts, so those files don't need structural
// changes right now.
// ============================================================
export const db = {
  ...dbMethods,

  /**
   * Not a real transaction — just runs the callback against the same
   * in-memory store. Fine for local dev with no DB. Once Supabase is
   * connected, replace with a `supabase.rpc()` call to a Postgres
   * function so checkout stays atomic (order create + stock decrement
   * + cart clear all succeed or all roll back together).
   */
  async $transaction<T>(fn: (tx: typeof dbMethods) => Promise<T>): Promise<T> {
    return fn(db);
  },
};