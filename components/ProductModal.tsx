'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, X, ShieldAlert, Check } from 'lucide-react';
import { addOnsFor, ALCOHOL_NOTICE, getCategory, peso, type Product, type VariantId } from '@/lib/menu';
import { MAX_QTY } from '@/lib/pricing';
import { ProductImage } from './ProductImage';
import { useCart } from './CartProvider';

export function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState<VariantId>(product.variants[product.variants.length > 1 ? 1 : 0].id);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const extras = addOnsFor(product);
  const cat = getCategory(product.category);

  const unit = useMemo(() => {
    const v = product.variants.find((x) => x.id === variantId)!;
    return v.price + extras.filter((a) => addOnIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  }, [variantId, addOnIds, product, extras]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [onClose]);

  const toggle = (id: string) => setAddOnIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const submit = () => {
    add({ productId: product.id, variantId, addOnIds, quantity: qty });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-espresso/50 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`pm-${product.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-3xl animate-rise overflow-y-auto rounded-t-4xl bg-white shadow-lift outline-none sm:rounded-4xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-espresso shadow-soft hover:bg-beige" aria-label="Close">
          <X size={20} />
        </button>
        <div className="grid md:grid-cols-2">
          <ProductImage product={product} variant={variantId} className="aspect-square w-full md:aspect-auto md:h-full md:rounded-l-4xl" />
          <div className="flex flex-col p-6 sm:p-8">
            <p className="eyebrow">{cat.name}{cat.note ? ` · ${cat.note}` : ''}</p>
            <h2 id={`pm-${product.id}`} className="mt-2 text-3xl font-semibold">{product.name}</h2>
            <p className="mt-3 leading-relaxed text-coffee/80">{product.description}</p>

            {product.alcoholic && (
              <div className="mt-4 flex gap-3 rounded-2xl bg-beige/60 p-4 text-sm text-espresso">
                <ShieldAlert size={20} className="shrink-0 text-caramel" />
                <p>{ALCOHOL_NOTICE}</p>
              </div>
            )}

            {product.variants.length > 1 && (
              <fieldset className="mt-6">
                <legend className="label">Size &amp; temperature</legend>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariantId(v.id)}
                      aria-pressed={variantId === v.id}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        variantId === v.id ? 'border-coffee bg-coffee text-white shadow-soft' : 'border-beige hover:border-caramel'
                      }`}
                    >
                      <span className="block text-sm font-medium">{v.label}</span>
                      <span className={`text-sm ${variantId === v.id ? 'text-gold' : 'text-caramel'}`}>{peso(v.price)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {product.variants.length === 1 && (
              <p className="mt-6 text-sm text-coffee/70">{product.variants[0].label} · <span className="font-semibold text-espresso">{peso(product.variants[0].price)}</span></p>
            )}

            {extras.length > 0 && (
              <fieldset className="mt-6">
                <legend className="label">Add-ons <span className="font-normal text-coffee/60">(optional)</span></legend>
                <div className="space-y-2">
                  {extras.map((a) => {
                    const on = addOnIds.includes(a.id);
                    return (
                      <button key={a.id} type="button" onClick={() => toggle(a.id)} aria-pressed={on}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${on ? 'border-caramel bg-cream' : 'border-beige hover:border-caramel'}`}>
                        <span className="flex items-center gap-3">
                          <span className={`grid h-5 w-5 place-items-center rounded-md border ${on ? 'border-coffee bg-coffee text-white' : 'border-coffee/30'}`}>
                            {on && <Check size={14} />}
                          </span>
                          {a.name}
                        </span>
                        <span className="text-caramel">+{peso(a.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-beige">
                <button className="p-3 text-coffee disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><Minus size={16} /></button>
                <span className="w-8 text-center font-medium" aria-live="polite">{qty}</span>
                <button className="p-3 text-coffee disabled:opacity-30" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
              <button onClick={submit} className="btn-primary flex-1 !py-3.5">
                Add to Cart · {peso(unit * qty)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
