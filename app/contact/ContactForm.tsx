'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

export function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send your message.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message.');
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="card grid place-items-center p-12 text-center">
        <div>
          <CheckCircle2 className="mx-auto animate-pop text-caramel" size={56} />
          <h2 className="mt-4 text-3xl font-semibold">Message sent!</h2>
          <p className="mt-2 text-coffee/80">Thanks for reaching out — we&apos;ll get back to you soon.</p>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="card space-y-5 p-7 sm:p-10">
      <h2 className="text-3xl font-semibold">Send us a message</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="cn">Name *</label><input id="cn" className="input" value={f.name} onChange={set('name')} required maxLength={80} autoComplete="name" /></div>
        <div><label className="label" htmlFor="cp">Phone</label><input id="cp" className="input" type="tel" value={f.phone} onChange={set('phone')} maxLength={30} autoComplete="tel" /></div>
      </div>
      <div><label className="label" htmlFor="ce">Email *</label><input id="ce" className="input" type="email" value={f.email} onChange={set('email')} required maxLength={120} autoComplete="email" /></div>
      <div><label className="label" htmlFor="cm">Message *</label><textarea id="cm" className="input min-h-[160px]" value={f.message} onChange={set('message')} required minLength={5} maxLength={2000} /></div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={f.website} onChange={set('website')} />
      {error && <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn-primary w-full !py-3.5" disabled={busy}>{busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send Message</button>
    </form>
  );
}
