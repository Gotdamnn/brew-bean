import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Coffee, Leaf, MessageSquareHeart, Sparkles, Star, Wine, CupSoda, Snowflake, IceCream } from 'lucide-react';
import { BEST_SELLER_IDS, getProduct, PRODUCTS, type CategoryId } from '@/lib/menu';
import { getPublicReviews, getReviewStats } from '@/lib/reviews';
import { photo } from '@/lib/photos';
import { ProductCard } from '@/components/ProductCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Reveal, SectionHeading } from '@/components/Reveal';
import { DrinkArt } from '@/components/DrinkArt';
import { LogoBadge } from '@/components/Logo';
import { Stars } from '@/components/Stars';

export const revalidate = 60;

const MENU_TILES: { id: CategoryId; title: string; blurb: string; Icon: typeof Coffee; tone: string; kind: 'hot' | 'iced' | 'blended' | 'cocktail' }[] = [
  { id: 'coffee', title: 'Coffee', blurb: 'Americano to Choco Pistachio', Icon: Coffee, tone: '#B88A64', kind: 'hot' },
  { id: 'blended-coffee', title: 'Blended Coffee', blurb: 'Dark Mocha, Java Chips, Golden Hour', Icon: Snowflake, tone: '#C48A4A', kind: 'blended' },
  { id: 'blended-non-coffee', title: 'Blended Non-Coffee', blurb: 'Cookies & Cream, Matcha Craze', Icon: IceCream, tone: '#E79AA6', kind: 'blended' },
  { id: 'refreshers', title: 'Refreshers', blurb: 'Peach, Lychee, Passion Fruit & more', Icon: CupSoda, tone: '#F2B27E', kind: 'iced' },
  { id: 'non-coffee', title: 'Non-Coffee', blurb: 'Matcha Latte, Strawberry Matcha', Icon: Leaf, tone: '#97AE62', kind: 'iced' },
  { id: 'cocktails', title: 'Cocktails & Imported Beers', blurb: 'Sangrias, house mixes, beers & soju', Icon: Wine, tone: '#8E2B3A', kind: 'cocktail' },
];

export default async function HomePage() {
  const [reviews, stats] = await Promise.all([getPublicReviews(6), getReviewStats()]);
  const best = BEST_SELLER_IDS.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  const hero = photo('hero');
  const welcome = photo('welcome');

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="relative isolate overflow-hidden bg-espresso text-cream">
        {hero ? (
          <>
            <Image src={hero} alt="Freshly made coffee at Brew & Shot Café" fill priority sizes="100vw" className="-z-20 object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-espresso via-espresso/80 to-espresso/20" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10">
            <div className="absolute -right-40 top-1/2 h-[720px] w-[720px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,164,109,.35),rgba(111,78,55,.2)_45%,transparent_70%)]" />
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-coffee/30 blur-3xl" />
            <svg className="absolute inset-0 h-full w-full opacity-[.06]" aria-hidden="true">
              <pattern id="beans" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                <ellipse cx="20" cy="20" rx="9" ry="13" fill="#FFF9F1" />
                <path d="M20 8c-4 8 4 16 0 24" stroke="#3B2418" strokeWidth="2" fill="none" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#beans)" />
            </svg>
          </div>
        )}

        <div className="container-x grid min-h-[calc(100svh-72px)] items-center gap-10 py-16 lg:grid-cols-[1.1fr_.9fr]">
          <div className="animate-rise">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-gold">
              <Sparkles size={14} /> Dine in or take away
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] text-cream sm:text-6xl lg:text-7xl">
              Brew &amp; Shot
              <span className="block text-gold">Café</span>
            </h1>
            <p className="mt-4 font-script text-4xl text-beige sm:text-5xl">Simplicity in Every Sip</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
              Your perfect cup starts here. Discover expertly prepared coffee, creamy lattes, delicious matcha, refreshing drinks, and indulgent blended creations.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/menu" className="btn-gold !px-7 !py-3.5">Explore Our Menu <ArrowRight size={18} /></Link>
              <Link href="/menu" className="btn-ghost-light !px-7 !py-3.5">Order Now</Link>
            </div>
            {stats.total > 0 && (
              <Link href="/reviews" className="mt-10 inline-flex items-center gap-3 text-sm text-cream/80 hover:text-cream">
                <Stars value={stats.average} size={18} />
                <span><strong className="text-cream">{stats.average.toFixed(1)}</strong> from {stats.total} customer review{stats.total === 1 ? '' : 's'}</span>
              </Link>
            )}
          </div>

          {!hero && (
            <div className="relative mx-auto hidden aspect-square w-full max-w-lg sm:block" aria-hidden="true">
              <div className="absolute inset-[8%] rounded-full border border-gold/25" />
              <div className="absolute inset-[18%] rounded-full border border-dashed border-gold/20" />
              <DrinkArt kind="iced" tone="#C49A6C" uid="hero-a" className="absolute left-[24%] top-[6%] w-[52%] drop-shadow-2xl" />
              <DrinkArt kind="blended" tone="#97AE62" uid="hero-b" className="absolute -left-[2%] top-[38%] w-[40%] -rotate-6 drop-shadow-2xl" />
              <DrinkArt kind="hot" tone="#6B4430" uid="hero-c" className="absolute right-[-2%] top-[42%] w-[40%] rotate-6 drop-shadow-2xl" />
              <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2"><LogoBadge size={92} className="shadow-lift ring-4 ring-espresso" /></div>
            </div>
          )}
        </div>
      </section>

      {/* ───────────── WELCOME ───────────── */}
      <section className="section grain">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-4xl bg-beige shadow-lift">
                {welcome ? (
                  <Image src={welcome} alt="Inside Brew & Shot Café" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-beige via-cream to-beige">
                    <div className="text-center">
                      <LogoBadge size={180} className="mx-auto shadow-lift" />
                      <p className="mt-6 font-script text-4xl text-coffee">Est. 2024</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -right-4 hidden rounded-3xl bg-espresso p-6 text-cream shadow-lift sm:block">
                <p className="font-display text-4xl text-gold">{PRODUCTS.length}+</p>
                <p className="text-sm text-cream/80">drinks, bites &amp; treats</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-3">Welcome to Brew &amp; Shot</p>
            <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">A cosy corner for coffee by day and shots by night.</h2>
            <p className="mt-6 leading-relaxed text-coffee/85">
              At Brew &amp; Shot Café we keep things simple: honest espresso, creamy lattes, real matcha, bright fruit refreshers and indulgent blended creations — plus comfort food and a curated bar menu when the evening calls for it.
            </p>
            <p className="mt-4 leading-relaxed text-coffee/85">Pull up a seat and stay a while, or grab your favourite to go.</p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[['Coffee', Coffee], ['Matcha', Leaf], ['Bar', Wine]].map(([l, I]) => {
                const Icon = I as typeof Coffee;
                return (
                  <div key={l as string} className="rounded-3xl bg-white p-4 shadow-soft">
                    <Icon className="mx-auto text-caramel" size={22} />
                    <p className="mt-2 text-sm font-medium">{l as string}</p>
                  </div>
                );
              })}
            </div>
            <Link href="/about" className="btn-primary mt-9">Discover Our Story <ArrowRight size={18} /></Link>
          </Reveal>
        </div>
      </section>

      {/* ───────────── BEST SELLERS ───────────── */}
      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading eyebrow="Customer favourites" title="Our Best Sellers" sub="The cups our regulars keep coming back for." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {best.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90}><ProductCard product={p} /></Reveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/menu" className="btn-outline">See the full menu <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ───────────── EXPLORE MENU ───────────── */}
      <section className="section grain">
        <div className="container-x">
          <SectionHeading eyebrow="Something for every mood" title="Explore Our Menu" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MENU_TILES.map((t, i) => (
              <Reveal key={t.id} delay={(i % 3) * 90}>
                <Link href={`/menu?category=${t.id}`} className="group relative flex h-56 overflow-hidden rounded-4xl bg-espresso p-7 text-cream shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative z-10 flex flex-col justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-gold"><t.Icon size={20} /></span>
                    <div>
                      <h3 className="text-2xl font-semibold text-cream">{t.title}</h3>
                      <p className="mt-1 max-w-[14rem] text-sm text-cream/70">{t.blurb}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm text-gold">Browse <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                    </div>
                  </div>
                  <DrinkArt kind={t.kind} tone={t.tone} uid={`tile-${t.id}`} className="absolute -bottom-6 -right-6 w-48 opacity-90 transition duration-700 group-hover:rotate-6 group-hover:scale-110" />
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-coffee/70">
            Hungry? We also serve <Link href="/menu?category=snacks" className="text-caramel underline-offset-4 hover:underline">snacks</Link>, <Link href="/menu?category=rice-meals" className="text-caramel underline-offset-4 hover:underline">rice meals</Link>, <Link href="/menu?category=pasta" className="text-caramel underline-offset-4 hover:underline">pasta</Link> and <Link href="/menu?category=pastries" className="text-caramel underline-offset-4 hover:underline">pastries</Link>.
          </p>
        </div>
      </section>

      {/* ───────────── REVIEWS PREVIEW ───────────── */}
      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading
            eyebrow="Real reviews"
            title="What Our Customers Are Saying"
            sub={stats.total > 0 ? (
              <span className="inline-flex flex-wrap items-center justify-center gap-2">
                <Stars value={stats.average} size={18} /> <strong className="text-espresso">{stats.average.toFixed(1)}</strong> average from {stats.total} approved review{stats.total === 1 ? '' : 's'}
              </span>
            ) : undefined}
          />
          {reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={(i % 3) * 90}><ReviewCard review={r} /></Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="mx-auto max-w-xl rounded-4xl border-2 border-dashed border-beige bg-cream p-10 text-center">
                <MessageSquareHeart className="mx-auto text-caramel" size={40} />
                <h3 className="mt-4 text-2xl font-semibold">Be the first to leave a review</h3>
                <p className="mt-2 text-coffee/75">We&apos;re just getting started here. Tell us about your visit and your words could be the first thing new guests read.</p>
              </div>
            </Reveal>
          )}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href="/reviews#feedback" className="btn-primary"><Star size={16} /> Share Your Experience</Link>
            {reviews.length > 0 && <Link href="/reviews#all-reviews" className="btn-outline">Read all reviews</Link>}
          </div>
        </div>
      </section>
    </>
  );
}
