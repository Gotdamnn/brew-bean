'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { peso } from '@/lib/menu';
import { useCart } from '@/components/CartProvider';
import { CartLines } from '@/components/CartDrawer';

export default function CartPage() {
  const { summary, ready, clear } = useCart();
  return (
    <section className="grain min-h-[70vh] py-14">
      <div className="container-x max-w-5xl">
        <Link href="/menu" className="inline-flex items-center gap-2 text-sm text-caramel hover:underline"><ArrowLeft size={16} /> Continue Shopping</Link>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Your Cart</h1>
        {!ready ? (
          <div className="mt-10 h-40 animate-pulse rounded-3xl bg-beige/60" />
        ) : summary.lines.length === 0 ? (
          <div className="card mt-10 p-12 text-center">
            <ShoppingBag className="mx-auto text-caramel" size={40} />
            <p className="mt-4 font-display text-2xl">Your cart is empty</p>
            <Link href="/menu" className="btn-primary mt-6">Explore Our Menu</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="card px-6">
              <CartLines />
              <div className="border-t border-beige py-4 text-right">
                <button onClick={clear} className="text-sm text-coffee/60 hover:text-espresso hover:underline">Clear cart</button>
              </div>
            </div>
            <aside className="card h-fit p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl font-semibold">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Items</dt><dd>{summary.count}</dd></div>
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{peso(summary.subtotal)}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-coffee/60">Take-out fees for food and pastries apply to Take Away orders and are shown at checkout.</p>
              <div className="mt-5 flex items-end justify-between border-t border-beige pt-4">
                <span className="text-sm">Estimated total</span>
                <span className="font-display text-3xl">{peso(summary.subtotal)}</span>
              </div>
              <Link href="/checkout" className="btn-primary mt-6 w-full !py-3.5">Checkout</Link>
              <Link href="/menu" className="btn-outline mt-2 w-full">Continue Shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
