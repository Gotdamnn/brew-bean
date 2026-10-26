import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getProduct, peso, minPrice } from '@/lib/menu';
import { DrinkArt, artKind } from '@/components/DrinkArt';
import { Reveal, SectionHeading } from '@/components/Reveal';
import { ProductCard } from '@/components/ProductCard';

export const metadata: Metadata = { title: 'Our Specialties', description: 'Signature drinks at Brew & Shot Café.' };

const FEATURES = [
  { id: 'blended-coffee-golden-hour', kicker: 'House signature', body: 'Biscoff cookie butter blended with espresso and ice — caramelised, toasty and dangerously drinkable.' },
  { id: 'coffee-choco-pistachio-latte', kicker: 'Premium pour', body: 'Pistachio sauce and chocolate layered over espresso. Our most indulgent iced latte.' },
  { id: 'non-coffee-strawberry-matcha', kicker: 'Matcha bar', body: 'Bright strawberry, creamy milk and earthy matcha in three beautiful layers.' },
  { id: 'coffee-blue-breve-latte', kicker: 'Rich & velvety', body: 'Heavy cream and full-cream milk meet espresso for a silky, decadent breve.' },
  { id: 'coffee-sea-salt-latte', kicker: 'Salty-sweet', body: 'Our latte capped with a cloud of sea salt foam — the sip that converts first-timers.' },
  { id: 'cocktails-ichigo-blossom', kicker: 'After dark', body: 'Gin and soju with a strawberry bloom. For guests 18+, valid ID required.' },
];

const COLLECTIONS = ['coffee-spanish-latte', 'blended-coffee-dark-mocha', 'blended-non-coffee-matcha-craze', 'refreshers-passion-fruit', 'cocktails-red-sangria', 'pastries-burnt-cheesecake'];

export default function SpecialtiesPage() {
  const feats = FEATURES.map((f) => ({ ...f, p: getProduct(f.id)! })).filter((f) => f.p);
  const coll = COLLECTIONS.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <>
      <section className="bg-espresso py-20 text-center text-cream">
        <div className="container-x">
          <p className="eyebrow !text-gold">Made at Brew &amp; Shot</p>
          <h1 className="mt-3 text-5xl font-semibold text-cream sm:text-6xl">Our Specialties</h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">The drinks that define us — from Biscoff-blended Golden Hour to layered strawberry matcha.</p>
        </div>
      </section>

      <section className="section grain">
        <div className="container-x space-y-20">
          {feats.map((f, i) => (
            <Reveal key={f.id}>
              <div className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                <div className="relative mx-auto aspect-square w-full max-w-md">
                  <div className="absolute inset-[6%] rounded-full bg-gradient-to-br from-beige to-white shadow-lift" />
                  <DrinkArt kind={artKind(f.p.category)} tone={f.p.tone} uid={`spec-${f.id}`} className="relative h-full w-full" />
                </div>
                <div>
                  <p className="eyebrow">{f.kicker}</p>
                  <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">{f.p.name}</h2>
                  <p className="mt-2 text-sm text-coffee/60">{f.p.description}</p>
                  <p className="mt-5 text-lg leading-relaxed text-coffee/85">{f.body}</p>
                  <p className="mt-5 font-display text-3xl">{peso(minPrice(f.p))}</p>
                  <Link href={`/menu?q=${encodeURIComponent(f.p.name)}`} className="btn-primary mt-6">Order this <ArrowRight size={16} /></Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading eyebrow="A little of everything" title="Try the collection" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coll.map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </div>
      </section>
    </>
  );
}
