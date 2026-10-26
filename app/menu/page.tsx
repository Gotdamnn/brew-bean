import type { Metadata } from 'next';
import { CATEGORIES, type CategoryId } from '@/lib/menu';
import { MenuBrowser } from './MenuBrowser';

export const metadata: Metadata = { title: 'Menu', description: 'Coffee, matcha, blended drinks, refreshers, cocktails, beers and food at Brew & Shot Café.' };

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const sp = await searchParams;
  const valid = CATEGORIES.some((c) => c.id === sp.category);
  return (
    <>
      <section className="bg-espresso py-16 text-center text-cream sm:py-20">
        <div className="container-x">
          <p className="eyebrow mb-3 !text-gold">Special Menu</p>
          <h1 className="text-5xl font-semibold text-cream sm:text-6xl">Our Menu</h1>
          <p className="mt-4 font-script text-3xl text-beige">Simplicity in Every Sip</p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cream/70">Hot drinks are 12 oz, iced and blended drinks are 16 oz. Prices in Philippine pesos.</p>
        </div>
      </section>
      <MenuBrowser initialCategory={valid ? (sp.category as CategoryId) : 'all'} initialQuery={sp.q?.slice(0, 60) ?? ''} />
    </>
  );
}
