'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== itemId));
  };

  const subtotal = cart.reduce<number>((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-black text-dark">Your Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Cart Items Section */}
        <div className="flex-1 bg-highlights rounded-3xl p-6 shadow-sm border border-dark/10 w-full space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-sm font-semibold text-dark/70">Your cart is empty.</p>
              <Link
                href="/products"
                className="inline-block bg-brand hover:bg-brand-dark text-white font-bold px-6 py-2.5 rounded-full text-xs transition shadow-sm"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#F3E4C8]/50 border border-dark/10 rounded-2xl p-4 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#F3E4C8] rounded-xl flex items-center justify-center text-[10px] text-dark/60 font-bold">
                    Image
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-dark">{item.name}</h3>
                    <p className="text-xs text-dark/70">{item.category}</p>
                    <p className="font-extrabold text-sm text-dark mt-1">${item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-highlights border border-dark/20 rounded-full px-3 py-1 gap-3 text-xs font-bold">
                    <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-[#E23B2E]">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-[#E23B2E]">
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-brand font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="w-full lg:w-80 bg-highlights rounded-3xl p-6 shadow-sm border border-dark/10 space-y-4">
          <h2 className="text-lg font-bold text-dark border-b border-dark/10 pb-2">
            Order Summary
          </h2>

          <div className="space-y-2 text-xs font-medium text-dark/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span>₱{shipping}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-dark pt-2 border-t border-dark/10">
              <span>Total</span>
              <span>₱{total}</span>
            </div>
          </div>

          <Link
            href={cart.length > 0 ? '/checkout' : '#'}
            className={`w-full block text-center font-bold py-3 rounded-full text-xs transition ${
              cart.length > 0
                ? 'bg-[#E23B2E] hover:bg-brand-dark text-white shadow-sm'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}