'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldAlert, X, SlidersHorizontal } from 'lucide-react';
import { ALCOHOL_NOTICE, CATEGORIES, PRODUCTS, ADD_ONS, peso, type CategoryId } from '@/lib/menu';
import { ProductCard } from '@/components/ProductCard';

type Filter = 'all' | CategoryId;
type Temp = 'any' | 'hot' | 'iced';

export function MenuBrowser({ initialCategory, initialQuery }: { initialCategory: Filter; initialQuery: string }) {
  const [cat, setCat] = useState<Filter>(initialCategory);
  const [q, setQ] = useState(initialQuery);
  const [temp, setTemp] = useState<Temp>('any');
  const [bestOnly, setBestOnly] = useState(false);

  // keep URL shareable without a navigation
  useEffect(() => {
    const url = new URL(window.location.href);
    cat === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', cat);
    q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }, [cat, q]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (temp !== 'any' && !p.variants.some((v) => v.id === temp)) return false;
      if (bestOnly && !p.bestSeller) return false;
      if (needle && !`${p.name} ${p.description}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [cat, q, temp, bestOnly]);

  const groups = CATEGORIES.filter((c) => filtered.some((p) => p.category === c.id));
  const showsBar = groups.some((g) => g.group === 'bar');

  return (
    <section className="grain pb-24">
      {/* Filter bar */}
      <div className="sticky top-[72px] z-30 border-b border-beige bg-cream/95 backdrop-blur-md">
        <div className="container-x py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search the menu</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-coffee/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search drinks, food, flavours…" className="input !rounded-full !bg-white !py-2.5 pl-11 pr-10" />
              {q && (
                <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-coffee/60 hover:bg-beige" aria-label="Clear search"><X size={16} /></button>
              )}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto">
              <SlidersHorizontal size={16} className="shrink-0 text-coffee/60" />
              {(['any', 'hot', 'iced'] as Temp[]).map((t) => (
                <button key={t} onClick={() => setTemp(t)} aria-pressed={temp === t}
                  className={`chip shrink-0 border ${temp === t ? 'border-coffee bg-coffee text-white' : 'border-beige bg-white text-coffee hover:border-caramel'}`}>
                  {t === 'any' ? 'Any temp' : t === 'hot' ? 'Hot' : 'Iced'}
                </button>
              ))}
              <button onClick={() => setBestOnly((v) => !v)} aria-pressed={bestOnly}
                className={`chip shrink-0 border ${bestOnly ? 'border-gold bg-gold text-espresso' : 'border-beige bg-white text-coffee hover:border-caramel'}`}>
                Best sellers
              </button>
            </div>
          </div>
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Menu categories">
            {[{ id: 'all' as Filter, name: 'All' }, ...CATEGORIES].map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}
                className={`chip shrink-0 ${cat === c.id ? 'bg-espresso text-cream shadow-soft' : 'bg-white text-coffee ring-1 ring-beige hover:ring-caramel'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-x pt-10">
        <p className="mb-6 text-sm text-coffee/70" aria-live="polite">{filtered.length} item{filtered.length === 1 ? '' : 's'}</p>

        {showsBar && (
          <div className="mb-10 flex gap-4 rounded-3xl border border-gold/40 bg-white p-5 shadow-soft">
            <ShieldAlert className="shrink-0 text-caramel" />
            <div className="text-sm leading-relaxed text-espresso">
              <p className="font-semibold">Legal drinking age notice</p>
              <p className="mt-1 text-coffee/80">{ALCOHOL_NOTICE}</p>
            </div>
          </div>
        )}

        {groups.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-display text-2xl">Nothing matches that just yet.</p>
            <button className="btn-outline mt-5" onClick={() => { setQ(''); setCat('all'); setTemp('any'); setBestOnly(false); }}>Reset filters</button>
          </div>
        )}

        {groups.map((g) => (
          <div key={g.id} className="mb-16" id={g.id}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2 border-b-2 border-espresso pb-3">
              <div>
                <h2 className="text-3xl font-semibold">{g.name}</h2>
                <p className="text-sm text-coffee/70">{g.short}</p>
              </div>
              {g.note && <p className="text-xs font-semibold uppercase tracking-widest text-caramel">{g.note}</p>}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.filter((p) => p.category === g.id).map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>
        ))}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="text-xl font-semibold">Drink add-ons</h3>
            <ul className="mt-3 divide-y divide-beige text-sm">
              {ADD_ONS.filter((a) => a.group === 'drink').map((a) => (
                <li key={a.id} className="flex justify-between py-2"><span>{a.name}</span><span className="text-caramel">{peso(a.price)}</span></li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold">Food add-ons &amp; fees</h3>
            <ul className="mt-3 divide-y divide-beige text-sm">
              {ADD_ONS.filter((a) => a.group === 'food').map((a) => (
                <li key={a.id} className="flex justify-between py-2"><span>{a.name}</span><span className="text-caramel">{peso(a.price)}</span></li>
              ))}
              <li className="flex justify-between py-2"><span>Food take-out fee</span><span className="text-caramel">{peso(20)}</span></li>
              <li className="flex justify-between py-2"><span>Pastries take-out fee</span><span className="text-caramel">{peso(15)}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
