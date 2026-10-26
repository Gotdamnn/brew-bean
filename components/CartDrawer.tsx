'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X, CheckCircle2 } from 'lucide-react';
import { peso } from '@/lib/menu';
import { useCart } from './CartProvider';
import { ProductImage } from './ProductImage';

export function CartLines({ editable = true }: { editable?: boolean }) {
  const { summary, setQty, remove } = useCart();
  return (
    <ul className="divide-y divide-beige">
      {summary.lines.map((l) => (
        <li key={l.key} className="flex gap-4 py-4">
          <ProductImage product={l.product} variant={l.variantId} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-espresso">{l.product.name}</p>
                <p className="text-xs text-coffee/70">{l.variantLabel}</p>
                {l.addOns.length > 0 && <p className="text-xs text-caramel">+ {l.addOns.map((a) => a.name).join(', ')}</p>}
              </div>
              <p className="shrink-0 font-medium">{peso(l.lineTotal)}</p>
            </div>
            {editable ? (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-full border border-beige">
                  <button className="p-2 text-coffee" onClick={() => setQty(l.key, l.quantity - 1)} aria-label={`Decrease ${l.product.name}`}><Minus size={14} /></button>
                  <span className="w-7 text-center text-sm">{l.quantity}</span>
                  <button className="p-2 text-coffee" onClick={() => setQty(l.key, l.quantity + 1)} aria-label={`Increase ${l.product.name}`}><Plus size={14} /></button>
                </div>
                <button onClick={() => remove(l.key)} className="rounded-full p-2 text-coffee/60 hover:bg-beige hover:text-espresso" aria-label={`Remove ${l.product.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <p className="mt-1 text-xs text-coffee/70">Qty {l.quantity} × {peso(l.unitPrice)}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, summary, toast } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <>
      {/* toast */}
      <div aria-live="polite" className="no-print pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
        {toast && (
          <div className="pointer-events-auto flex animate-rise items-center gap-3 rounded-full bg-espresso px-5 py-3 text-sm text-cream shadow-lift">
            <CheckCircle2 size={18} className="text-gold" /> {toast}
            <button className="font-semibold text-gold underline-offset-2 hover:underline" onClick={() => setDrawerOpen(true)}>View cart</button>
          </div>
        )}
      </div>

      <div className={`no-print fixed inset-0 z-[75] transition ${drawerOpen ? 'visible' : 'invisible'}`} aria-hidden={!drawerOpen}>
        <div className={`absolute inset-0 bg-espresso/40 backdrop-blur-sm transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setDrawerOpen(false)} />
        <aside
          role="dialog"
          aria-label="Shopping cart"
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-lift transition-transform duration-500 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-beige px-6 py-5">
            <h2 className="text-2xl font-semibold">Your Cart</h2>
            <button onClick={() => setDrawerOpen(false)} className="rounded-full p-2 hover:bg-beige" aria-label="Close cart"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            {summary.lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-beige text-coffee"><ShoppingBag size={32} /></div>
                <p className="mt-5 font-display text-xl">Your cart is empty</p>
                <p className="mt-1 text-sm text-coffee/70">Find your perfect cup on our menu.</p>
                <Link href="/menu" onClick={() => setDrawerOpen(false)} className="btn-primary mt-6">Explore Our Menu</Link>
              </div>
            ) : (
              <CartLines />
            )}
          </div>
          {summary.lines.length > 0 && (
            <div className="border-t border-beige px-6 py-5">
              <div className="flex justify-between text-sm text-coffee/80"><span>Subtotal</span><span className="font-display text-xl text-espresso">{peso(summary.subtotal)}</span></div>
              <p className="mt-1 text-xs text-coffee/60">Take-out fees (if any) are added at checkout.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href="/menu" onClick={() => setDrawerOpen(false)} className="btn-outline">Continue Shopping</Link>
                <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn-primary">Checkout</Link>
              </div>
              <Link href="/cart" onClick={() => setDrawerOpen(false)} className="mt-3 block text-center text-xs text-caramel hover:underline">View full cart</Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
