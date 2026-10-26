'use client';

import { useState } from 'react';
import { Plus, Eye, Wine } from 'lucide-react';
import { getCategory, minPrice, peso, type Product } from '@/lib/menu';
import { ProductImage } from './ProductImage';
import { ProductModal } from './ProductModal';
import { useCart } from './CartProvider';

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { add } = useCart();
  const simple = product.variants.length === 1 && !product.addOns;
  const multi = product.variants.length > 1;

  const quickAdd = () => {
    // One-variant items without add-ons go straight to the cart; others open customisation.
    if (simple) add({ productId: product.id, variantId: product.variants[0].id, addOnIds: [], quantity: 1 });
    else setOpen(true);
  };

  return (
    <>
      <article className="card group flex h-full flex-col overflow-hidden transition duration-500 hover:-translate-y-1.5 hover:shadow-lift">
        <button onClick={() => setOpen(true)} className="relative block overflow-hidden text-left" aria-label={`View details for ${product.name}`}>
          <ProductImage product={product} className={`${compact ? 'aspect-[4/3]' : 'aspect-square'} w-full transition duration-700 group-hover:scale-105`} />
          {product.bestSeller && (
            <span className="absolute left-4 top-4 rounded-full bg-espresso px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">Best Seller</span>
          )}
          {product.alcoholic && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-espresso">
              <Wine size={12} /> 18+
            </span>
          )}
        </button>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-caramel">{getCategory(product.category).name}</p>
          <h3 className="mt-1 text-xl font-semibold">{product.name}</h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-coffee/75">{product.description}</p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              {multi && <span className="block text-[11px] text-coffee/60">from</span>}
              <span className="font-display text-2xl font-semibold text-espresso">{peso(minPrice(product))}</span>
            </div>
            <div className="text-right text-[11px] text-coffee/60">{product.variants.map((v) => v.label.split(' · ')[0]).join(' / ')}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setOpen(true)} className="btn-outline !px-3 !py-2.5">
              <Eye size={16} /> Details
            </button>
            <button onClick={quickAdd} className="btn-primary !px-3 !py-2.5">
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </article>
      {open && <ProductModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
