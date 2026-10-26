import Image from 'next/image';
import type { Product, VariantId } from '@/lib/menu';
import { DrinkArt, artKind } from './DrinkArt';

export function ProductImage({ product, variant, className = '' }: { product: Product; variant?: VariantId; className?: string }) {
  if (product.image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      </div>
    );
  }
  const v = variant ?? (product.variants.find((x) => x.id === 'iced') ? 'iced' : product.variants[0].id);
  return (
    <div className={`grid place-items-center bg-gradient-to-b from-beige/70 to-cream ${className}`}>
      <DrinkArt kind={artKind(product.category, v)} tone={product.tone} uid={`${product.id}-${v}`} className="h-[78%] w-[78%]" />
    </div>
  );
}
