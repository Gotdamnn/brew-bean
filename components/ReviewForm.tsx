/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Camera, Globe, Loader2, Lock, Star, Trash2 } from 'lucide-react';
import { PHOTO_MAX_BYTES, PHOTO_TYPES, REVIEW_MAX, REVIEW_MIN } from '@/lib/review-schema';
import { RATING_LABELS } from './Stars';
import { ItemCombobox } from './ItemCombobox';

type Errors = Partial<Record<'rating' | 'reviewText' | 'photo' | 'consent' | 'visitDate' | 'form', string>>;

function localToday() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function ReviewForm() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [drink, setDrink] = useState('');
  const [text, setText] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<null | 'public' | 'private'>(null);
  const startedAt = useRef(Date.now());
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pickPhoto = (f: File | undefined) => {
    setErrors((e) => ({ ...e, photo: undefined }));
    if (!f) return;
    if (!(PHOTO_TYPES as readonly string[]).includes(f.type)) return setErrors((e) => ({ ...e, photo: 'Please choose a JPG, PNG or WEBP image.' }));
    if (f.size > PHOTO_MAX_BYTES) return setErrors((e) => ({ ...e, photo: 'Photo must be 5 MB or smaller.' }));
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };
  const clearPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!rating) e.rating = 'Please choose a star rating.';
    const t = text.trim();
    if (t.length < REVIEW_MIN) e.reviewText = `Please write at least ${REVIEW_MIN} characters.`;
    else if ((t.match(/\p{L}/gu) || []).length < 5) e.reviewText = 'Please write a few words about your visit.';
    if (visibility === 'public' && !consent) e.consent = 'Please allow us to publish your review, or choose private feedback.';
    if (visitDate && visitDate > localToday()) e.visitDate = 'Visit date can’t be in the future.';
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set('customerName', name);
      fd.set('rating', String(rating));
      fd.set('drinkOrdered', drink);
      fd.set('reviewText', text);
      fd.set('visitDate', visitDate);
      fd.set('visibility', visibility);
      fd.set('consent', String(visibility === 'public' && consent));
      fd.set('website', hp);
      fd.set('startedAt', String(startedAt.current));
      if (photo) fd.set('photo', photo);
      const res = await fetch('/api/reviews', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const field = data.field as keyof Errors | undefined;
        setErrors({ [field && field in { rating: 1, reviewText: 1, photo: 1, consent: 1, visitDate: 1 } ? field : 'form']: data.error || 'Something went wrong. Please try again.' });
        return;
      }
      setDone(data.visibility === 'private' ? 'private' : 'public');
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      setErrors({ form: 'We couldn’t reach the server. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div ref={topRef} className="card mx-auto max-w-xl scroll-mt-28 p-8 text-center sm:p-12" role="status">
        <div className="mx-auto grid h-24 w-24 animate-pop place-items-center rounded-full bg-espresso shadow-lift">
          <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden="true">
            <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#C5A46D" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" className="animate-draw" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">Thank You for Your Feedback!</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-coffee/80">
          Your review has been received. Thank you for sharing your experience with Brew &amp; Shot Café. We hope to see you again soon!
        </p>
        <p className="mt-3 text-sm text-coffee/60">
          {done === 'private' ? 'Your private feedback goes only to our café management team.' : 'Our team will review it shortly before it appears on our website.'}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/" className="btn-outline">Back to Home</Link>
          <Link href="/menu" className="btn-primary">Explore Our Menu</Link>
        </div>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <div ref={topRef} className="scroll-mt-28">
    <form onSubmit={submit} noValidate className="card mx-auto w-full max-w-xl space-y-7 p-6 sm:p-10">
      {/* 1. Rating first — the one required tap */}
      <fieldset data-error={!!errors.rating}>
        <legend className="label text-base">How was your experience? <span className="text-caramel">*</span></legend>
        <div className="flex flex-col items-center rounded-3xl bg-cream px-2 py-5" role="radiogroup" aria-label="Overall experience rating" onMouseLeave={() => setHover(0)}>
          <div className="flex gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={rating === i}
                aria-label={`${i} star${i > 1 ? 's' : ''} — ${RATING_LABELS[i]}`}
                onClick={() => { setRating(i); setErrors((e) => ({ ...e, rating: undefined })); }}
                onMouseEnter={() => setHover(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setRating((r) => Math.min(5, r + 1)); }
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setRating((r) => Math.max(1, r - 1)); }
                }}
                className="grid h-14 w-14 place-items-center rounded-full transition active:scale-90 sm:h-16 sm:w-16"
              >
                <Star
                  size={44}
                  strokeWidth={1.5}
                  className={`transition duration-200 ${i <= shown ? 'scale-110 text-gold' : 'text-beige'}`}
                  fill="currentColor"
                  stroke={i <= shown ? '#A47148' : '#d9c7b1'}
                />
              </button>
            ))}
          </div>
          <p className={`mt-2 h-6 font-display text-lg ${shown ? 'text-espresso' : 'text-coffee/50'}`} aria-live="polite">
            {shown ? RATING_LABELS[shown] : 'Tap a star to rate'}
          </p>
        </div>
        {errors.rating && <p className="mt-2 text-sm text-red-700">{errors.rating}</p>}
      </fieldset>

      {/* 2. Review text */}
      <div data-error={!!errors.reviewText}>
        <label htmlFor="rv-text" className="label text-base">Your Review <span className="text-caramel">*</span></label>
        <textarea
          id="rv-text"
          className={`input min-h-[150px] ${errors.reviewText ? '!border-red-400' : ''}`}
          placeholder="Tell us about your experience! How was your drink, service, and visit?"
          value={text}
          maxLength={REVIEW_MAX}
          onChange={(e) => { setText(e.target.value); setErrors((x) => ({ ...x, reviewText: undefined })); }}
          aria-invalid={!!errors.reviewText}
          aria-describedby="rv-text-help"
        />
        <div id="rv-text-help" className="mt-1 flex justify-between text-xs">
          <span className="text-red-700">{errors.reviewText}</span>
          <span className={text.length > REVIEW_MAX * 0.9 ? 'text-caramel' : 'text-coffee/50'}>{text.length}/{REVIEW_MAX}</span>
        </div>
      </div>

      {/* 3. Name */}
      <div>
        <label htmlFor="rv-name" className="label">Your Name <span className="font-normal text-coffee/60">(optional)</span></label>
        <input id="rv-name" className="input" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="given-name" />
        <p className="mt-1 text-xs text-coffee/60">Leave blank to post as “Anonymous”.</p>
      </div>

      {/* 4. What did you order */}
      <div>
        <span className="label">What Did You Order? <span className="font-normal text-coffee/60">(optional)</span></span>
        <ItemCombobox value={drink} onChange={setDrink} />
      </div>

      {/* 5. Visit date */}
      <div data-error={!!errors.visitDate}>
        <label htmlFor="rv-date" className="label">Visit Date <span className="font-normal text-coffee/60">(optional)</span></label>
        <input id="rv-date" type="date" className="input" value={visitDate} max={localToday()} onChange={(e) => setVisitDate(e.target.value)} />
        {errors.visitDate && <p className="mt-1 text-sm text-red-700">{errors.visitDate}</p>}
      </div>

      {/* 6. Photo */}
      <div data-error={!!errors.photo}>
        <span className="label">Add a Photo <span className="font-normal text-coffee/60">(optional)</span></span>
        {preview ? (
          <div className="relative overflow-hidden rounded-3xl">
            <img src={preview} alt="Preview of your photo" className="max-h-72 w-full object-cover" />
            <button type="button" onClick={clearPhoto} className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm text-espresso shadow-soft">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-beige bg-cream/60 px-4 py-8 text-center transition hover:border-caramel">
            <Camera className="text-caramel" size={28} />
            <span className="text-sm font-medium">Tap to add a photo of your drink</span>
            <span className="text-xs text-coffee/60">JPG, PNG or WEBP · up to 5 MB</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0])} />
          </label>
        )}
        {errors.photo && <p className="mt-2 text-sm text-red-700">{errors.photo}</p>}
      </div>

      {/* 7. Privacy */}
      <fieldset data-error={!!errors.consent} className="space-y-3">
        <legend className="label">Who can see your feedback?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {([
            ['public', Globe, 'Public review', 'May appear on our website after approval'],
            ['private', Lock, 'Private feedback', 'Only café management will see it'],
          ] as const).map(([val, Icon, title, sub]) => (
            <button
              key={val}
              type="button"
              aria-pressed={visibility === val}
              onClick={() => { setVisibility(val); setErrors((e) => ({ ...e, consent: undefined })); }}
              className={`rounded-2xl border p-4 text-left transition ${visibility === val ? 'border-coffee bg-coffee text-white shadow-soft' : 'border-beige hover:border-caramel'}`}
            >
              <span className="flex items-center gap-2 font-medium"><Icon size={16} /> {title}</span>
              <span className={`mt-1 block text-xs ${visibility === val ? 'text-cream/80' : 'text-coffee/60'}`}>{sub}</span>
            </button>
          ))}
        </div>
        {visibility === 'public' && (
          <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 text-sm ${errors.consent ? 'border-red-400 bg-red-50' : 'border-beige bg-cream/60'}`}>
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: undefined })); }} className="mt-0.5 h-5 w-5 shrink-0 accent-coffee" />
            <span className="leading-relaxed text-espresso">
              I give Brew &amp; Shot Café permission to publish my review{name.trim() ? ', name' : ''}{photo ? ' and photo' : ''} on its website. I understand reviews are checked by our team and may appear publicly after approval.
            </span>
          </label>
        )}
        {errors.consent && <p className="text-sm text-red-700">{errors.consent}</p>}
      </fieldset>

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />

      {errors.form && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{errors.form}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full !py-4 text-base">
        {busy ? (<><Loader2 className="animate-spin" size={20} /> Sending your review…</>) : 'Submit My Review'}
      </button>
      <p className="text-center text-xs text-coffee/60">No account needed. We never share your feedback with third parties.</p>
    </form>
    </div>
  );
}
