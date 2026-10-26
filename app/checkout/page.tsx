'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Store, ShoppingBag, Wallet, ShieldAlert } from 'lucide-react';
import { ALCOHOL_NOTICE, peso } from '@/lib/menu';
import { summarize } from '@/lib/pricing';
import { useCart } from '@/components/CartProvider';
import { CartLines } from '@/components/CartDrawer';

interface Placed {
  orderNumber: string;
  createdAt: string;
  serviceType: 'dine_in' | 'take_away';
  items: { name: string; variant: string; addOns: string[]; quantity: number; lineTotal: number }[];
  subtotal: number;
  fees: { label: string; price: number }[];
  total: number;
}

export default function CheckoutPage() {
  const { lines, ready, clear } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState<'dine_in' | 'take_away'>('dine_in');
  const [notes, setNotes] = useState('');
  const [age, setAge] = useState(false);
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const s = useMemo(() => summarize(lines, service), [lines, service]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Please enter your name.');
    if (phone.replace(/\D/g, '').length < 7) return setError('Please enter a valid contact number.');
    if (s.containsAlcohol && !age) return setError('Please confirm the legal-age requirement for alcoholic drinks.');
    setBusy(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, contactNumber: phone, serviceType: service, notes, ageConfirmed: age, website: hp, items: lines }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setPlaced(data as Placed);
      clear();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    return (
      <section className="grain py-16">
        <div className="container-x max-w-2xl">
          <div className="card p-8 text-center sm:p-12">
            <CheckCircle2 className="mx-auto animate-pop text-caramel" size={64} />
            <h1 className="mt-5 text-4xl font-semibold">Order received!</h1>
            <p className="mt-2 text-coffee/80">Thank you, {name.split(' ')[0]}. Our baristas have your order.</p>
            <p className="mt-6 text-sm uppercase tracking-widest text-caramel">Order number</p>
            <p className="font-display text-4xl tracking-wide">{placed.orderNumber}</p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-beige/60 p-4 text-left text-sm">
              <Wallet className="shrink-0 text-caramel" size={20} />
              <p><strong>Payment not yet collected.</strong> Please pay at the counter when you pick up or are served. Show this order number to our staff.</p>
            </div>
            <ul className="mt-6 divide-y divide-beige text-left text-sm">
              {placed.items.map((i, k) => (
                <li key={k} className="flex justify-between gap-3 py-2">
                  <span>{i.quantity} × {i.name} <span className="text-coffee/60">({i.variant}{i.addOns.length ? `, + ${i.addOns.join(', ')}` : ''})</span></span>
                  <span>{peso(i.lineTotal)}</span>
                </li>
              ))}
              {placed.fees.map((f) => (
                <li key={f.label} className="flex justify-between py-2 text-coffee/80"><span>{f.label}</span><span>{peso(f.price)}</span></li>
              ))}
              <li className="flex justify-between py-3 font-display text-xl"><span>Total due</span><span>{peso(placed.total)}</span></li>
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/menu" className="btn-primary">Order more</Link>
              <Link href="/reviews/submit" className="btn-outline">Leave a review</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grain py-14">
      <div className="container-x max-w-5xl">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-caramel hover:underline"><ArrowLeft size={16} /> Back to cart</Link>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Checkout</h1>

        {ready && lines.length === 0 ? (
          <div className="card mt-10 p-12 text-center">
            <ShoppingBag className="mx-auto text-caramel" size={40} />
            <p className="mt-4 font-display text-2xl">Your cart is empty</p>
            <Link href="/menu" className="btn-primary mt-6">Explore Our Menu</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]" noValidate>
            <div className="card space-y-6 p-6 sm:p-8">
              <div>
                <label htmlFor="name" className="label">Customer name *</label>
                <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="phone" className="label">Contact number *</label>
                <input id="phone" className="input" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="09XX XXX XXXX" autoComplete="tel" required />
              </div>
              <fieldset>
                <legend className="label">Dine In or Take Away *</legend>
                <div className="grid grid-cols-2 gap-3">
                  {([['dine_in', 'Dine In', Store], ['take_away', 'Take Away', ShoppingBag]] as const).map(([v, l, Icon]) => (
                    <button type="button" key={v} onClick={() => setService(v)} aria-pressed={service === v}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 transition ${service === v ? 'border-coffee bg-coffee text-white shadow-soft' : 'border-beige hover:border-caramel'}`}>
                      <Icon size={18} /> {l}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="notes" className="label">Order notes <span className="font-normal text-coffee/60">(optional)</span></label>
                <textarea id="notes" className="input min-h-[100px]" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Less ice, extra hot, allergies, table number…" />
                <p className="mt-1 text-right text-xs text-coffee/50">{notes.length}/300</p>
              </div>
              {/* honeypot — hidden from humans */}
              <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" name="website" />

              {s.containsAlcohol && (
                <label className="flex cursor-pointer gap-3 rounded-2xl border border-gold/50 bg-cream p-4 text-sm">
                  <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-coffee" />
                  <span><span className="flex items-center gap-1.5 font-semibold"><ShieldAlert size={16} className="text-caramel" /> I am 18 or older</span><span className="mt-1 block text-coffee/80">{ALCOHOL_NOTICE}</span></span>
                </label>
              )}
              <div className="flex gap-3 rounded-2xl bg-beige/50 p-4 text-sm text-coffee">
                <Wallet className="shrink-0 text-caramel" size={20} />
                <p>Online payment isn&apos;t available yet — you&apos;ll <strong>pay at the counter</strong>. Placing an order does not charge you.</p>
              </div>
            </div>

            <aside className="card h-fit p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl font-semibold">Order Summary</h2>
              <div className="max-h-[320px] overflow-y-auto"><CartLines editable={false} /></div>
              <dl className="space-y-2 border-t border-beige pt-4 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{peso(s.subtotal)}</dd></div>
                {s.fees.map((f) => (<div key={f.label} className="flex justify-between text-coffee/80"><dt>{f.label}</dt><dd>{peso(f.price)}</dd></div>))}
              </dl>
              <div className="mt-4 flex items-end justify-between border-t border-beige pt-4">
                <span>Total due at counter</span>
                <span className="font-display text-3xl">{peso(s.total)}</span>
              </div>
              {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              <button type="submit" disabled={busy || !ready || lines.length === 0} className="btn-primary mt-5 w-full !py-4">
                {busy ? (<><Loader2 className="animate-spin" size={18} /> Placing order…</>) : 'Place Order'}
              </button>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
}
