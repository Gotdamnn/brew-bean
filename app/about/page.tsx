import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Heart, Leaf, Sparkles, Users, Coffee, Target, Eye } from 'lucide-react';
import { BEST_SELLER_IDS, getProduct } from '@/lib/menu';
import { photo } from '@/lib/photos';
import { SITE } from '@/lib/site-config';
import { ProductCard } from '@/components/ProductCard';
import { Reveal, SectionHeading } from '@/components/Reveal';
import { LogoBadge } from '@/components/Logo';
import { DrinkArt } from '@/components/DrinkArt';

export const metadata: Metadata = { title: 'About Us', description: 'Our Story — Brewed with Passion.' };

/**
 * ✏️  EDITABLE CONTENT — replace with Brew & Shot Café's real story.
 * The copy below sticks to what's known from the menu & logo (Est. 2024,
 * "Simplicity in Every Sip", dine in or take away, café by day + bar menu)
 * and does not invent history, founders, awards or numbers.
 */
const ABOUT = {
  intro:
    'Brew & Shot Café is a neighbourhood café built around one simple idea: a really good drink, made properly, in a place that feels like yours. Coffee and matcha by day, sangria and a cold bottle when the evening rolls in.',
  story: [
    'We opened our doors in 2024 with a short menu and a big promise — Simplicity in Every Sip. No fuss, no gimmicks: espresso pulled with care, milk steamed just right, and flavours that taste like what they say they are.',
    '[EDIT ME — add the real founding story here: who started Brew & Shot, why, and what makes this spot special to the community.]',
  ],
  mission: 'To serve consistently great coffee, matcha and comfort food at honest prices, with service that makes every guest feel like a regular.',
  vision: 'To be the neighbourhood’s favourite place to slow down — for a morning latte, an afternoon study session, or an evening catch-up with friends.',
  values: [
    { Icon: Sparkles, title: 'Simplicity', text: 'A focused menu done really well, every single time.' },
    { Icon: Coffee, title: 'Craft', text: 'Careful extraction, balanced sweetness and proper technique.' },
    { Icon: Heart, title: 'Warmth', text: 'Friendly faces and a space where you can stay a while.' },
    { Icon: Users, title: 'Community', text: 'We listen — every review and suggestion shapes what we do.' },
  ],
};

export default function AboutPage() {
  const pics = ['about-1', 'about-2', 'about-3'].map(photo);
  const featured = BEST_SELLER_IDS.slice(0, 3).map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      <section className="relative overflow-hidden bg-espresso py-20 text-cream sm:py-28">
        <div className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,164,109,.28),transparent_65%)]" />
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="animate-rise">
            <p className="eyebrow !text-gold">About Us</p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight text-cream sm:text-6xl">
              Our Story — <span className="italic text-gold">Brewed with Passion</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">{ABOUT.intro}</p>
          </div>
          <div className="mx-auto"><LogoBadge size={240} className="shadow-lift ring-8 ring-cream/5" /></div>
        </div>
      </section>

      <section className="section grain">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Est. {SITE.established}</p>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">How it started</h2>
            {ABOUT.story.map((p, i) => (
              <p key={i} className={`mt-5 leading-relaxed ${p.startsWith('[EDIT') ? 'rounded-2xl border border-dashed border-caramel/50 bg-white/60 p-4 text-sm italic text-caramel' : 'text-coffee/85'}`}>{p}</p>
            ))}
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-4">
              {pics.map((src, i) => (
                <div key={i} className={`relative overflow-hidden rounded-4xl bg-beige shadow-soft ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}`}>
                  {src ? (
                    <Image src={src} alt="Brew & Shot Café" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-beige to-cream">
                      <DrinkArt kind={(['iced', 'hot', 'blended'] as const)[i]} tone={['#C49A6C', '#6B4430', '#97AE62'][i]} uid={`about-${i}`} className="h-3/4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[{ Icon: Target, t: 'Our Mission', d: ABOUT.mission }, { Icon: Eye, t: 'Our Vision', d: ABOUT.vision }].map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 100}>
              <div className="h-full rounded-4xl bg-espresso p-10 text-cream shadow-lift">
                <Icon className="text-gold" size={32} />
                <h3 className="mt-5 text-3xl font-semibold text-cream">{t}</h3>
                <p className="mt-3 text-lg leading-relaxed text-cream/80">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section grain">
        <div className="container-x">
          <SectionHeading eyebrow="What we stand for" title="Our Values" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT.values.map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="card h-full p-7 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-beige text-coffee"><Icon size={24} /></span>
                  <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-coffee/75">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading eyebrow="Start here" title="Featured Drinks" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-12 text-center">
            <Link href="/menu" className="btn-primary"><Leaf size={16} /> Explore Our Menu</Link>
          </div>
        </div>
      </section>
    </>
  );
}
