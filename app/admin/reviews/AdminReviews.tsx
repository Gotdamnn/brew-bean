/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Check, EyeOff, Lock, Trash2, X, Loader2, Coffee, CalendarDays, Flag, RotateCcw } from 'lucide-react';
import { Stars } from '@/components/Stars';

export interface AdminReview {
  id: string;
  customer_name: string | null;
  rating: number;
  drink_ordered: string | null;
  review_text: string;
  visit_date: string | null;
  image_url: string | null;
  publish_consent: boolean;
  is_public: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  admin_note: string | null;
  created_at: string;
  moderated_at: string | null;
}

interface Stats {
  total: number; pending: number; approved: number; privateCount: number; thisWeek: number; avgAll: number;
  dist: { n: number; c: number }[];
}

const BADGE: Record<AdminReview['status'], string> = {
  pending: 'bg-gold/25 text-espresso',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  hidden: 'bg-beige text-coffee',
};

export function AdminReviews({ reviews, stats, filters }: { reviews: AdminReview[]; stats: Stats; filters: Record<string, string> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setFilter = (k: string, v: string) => {
    const p = new URLSearchParams({ ...filters, [k]: v });
    [...p.keys()].forEach((key) => !p.get(key) && p.delete(key));
    start(() => router.push(`/admin/reviews?${p.toString()}`));
  };

  const act = async (id: string, method: 'PATCH' | 'DELETE', body?: object) => {
    if (method === 'DELETE' && !confirm('Permanently delete this review and its photo? Use this only for spam or abusive content.')) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Action failed');
      start(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const maxDist = Math.max(1, ...stats.dist.map((d) => d.c));

  return (
    <div className="container-x py-10">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Pending', stats.pending, 'awaiting review'],
          ['Approved', stats.approved, 'publicly visible'],
          ['Private', stats.privateCount, 'management only'],
          ['This week', stats.thisWeek, 'new submissions'],
          ['Avg. (all)', stats.avgAll ? stats.avgAll.toFixed(2) : '—', `${stats.total} total`],
        ].map(([l, v, s]) => (
          <div key={l as string} className="card p-5">
            <p className="text-xs uppercase tracking-widest text-caramel">{l}</p>
            <p className="mt-1 font-display text-4xl">{v}</p>
            <p className="text-xs text-coffee/60">{s}</p>
          </div>
        ))}
      </div>
      <div className="card mt-4 p-5">
        <p className="mb-3 text-sm font-semibold">Rating distribution (all submissions, incl. private)</p>
        <div className="grid gap-1.5">
          {stats.dist.map(({ n, c }) => (
            <div key={n} className="flex items-center gap-3 text-sm">
              <span className="w-10">{n}★</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-beige"><span className="block h-full rounded-full bg-coffee" style={{ width: `${(c / maxDist) * 100}%` }} /></span>
              <span className="w-8 text-right text-coffee/70">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-soft">
          {['pending', 'approved', 'hidden', 'rejected', 'all'].map((s) => (
            <button key={s} onClick={() => setFilter('status', s)} className={`chip !py-1.5 capitalize ${filters.status === s ? 'bg-espresso text-cream' : 'text-coffee hover:bg-beige'}`}>{s}</button>
          ))}
        </div>
        <select aria-label="Rating" value={filters.rating} onChange={(e) => setFilter('rating', e.target.value)} className="input !w-auto !rounded-full !py-2 !text-sm">
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
        </select>
        <select aria-label="Visibility" value={filters.visibility} onChange={(e) => setFilter('visibility', e.target.value)} className="input !w-auto !rounded-full !py-2 !text-sm">
          <option value="">Public &amp; private</option>
          <option value="public">Public only</option>
          <option value="private">Private only</option>
        </select>
        <label className="text-xs text-coffee/70">From<input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className="input !rounded-full !py-1.5 !text-sm" /></label>
        <label className="text-xs text-coffee/70">To<input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className="input !rounded-full !py-1.5 !text-sm" /></label>
        {pending && <Loader2 className="mb-2 animate-spin text-caramel" size={20} />}
      </div>

      <p className="mt-4 rounded-2xl bg-white/70 p-3 text-xs text-coffee/70">
        Fair-moderation reminder: approve honest reviews regardless of star rating. Hide or reject only spam, abuse, personal information, or content unrelated to the café — constructive criticism should stay visible.
      </p>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      {/* List */}
      <ul className="mt-6 space-y-4">
        {reviews.length === 0 && <li className="card p-12 text-center text-coffee/70">No reviews match these filters.</li>}
        {reviews.map((r) => {
          const canApprove = r.is_public && r.publish_consent;
          const busy = busyId === r.id;
          return (
            <li key={r.id} className={`card overflow-hidden ${busy ? 'opacity-60' : ''}`}>
              <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} size={18} />
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${BADGE[r.status]}`}>{r.status}</span>
                    {!r.is_public && <span className="inline-flex items-center gap-1 rounded-full bg-espresso px-2.5 py-0.5 text-xs text-cream"><Lock size={11} /> Private feedback</span>}
                    {r.is_public && !r.publish_consent && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">No publish consent</span>}
                  </div>
                  <p className="mt-3 whitespace-pre-line leading-relaxed">{r.review_text}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-coffee/70">
                    <span className="font-medium text-espresso">{r.customer_name || 'Anonymous'}</span>
                    <span>Submitted {new Date(r.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {r.drink_ordered && <span className="inline-flex items-center gap-1"><Coffee size={12} /> {r.drink_ordered}</span>}
                    {r.visit_date && <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> Visited {r.visit_date}</span>}
                  </div>
                  {r.admin_note && <p className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gold/15 px-3 py-1.5 text-xs text-espresso"><Flag size={12} /> {r.admin_note}</p>}
                </div>
                {r.image_url && (
                  <a href={r.image_url} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={r.image_url} alt="Customer upload" className="h-32 w-full rounded-2xl object-cover md:w-44" />
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-beige bg-cream/50 px-5 py-3">
                {r.status !== 'approved' && (
                  <button disabled={busy || !canApprove} onClick={() => act(r.id, 'PATCH', { status: 'approved' })} className="chip bg-emerald-700 text-white disabled:opacity-40" title={canApprove ? 'Show on the website' : 'Private or no consent — cannot be published'}>
                    <Check size={15} /> Approve
                  </button>
                )}
                {r.status === 'approved' && (
                  <button disabled={busy} onClick={() => act(r.id, 'PATCH', { status: 'hidden' })} className="chip bg-white ring-1 ring-beige"><EyeOff size={15} /> Hide</button>
                )}
                {r.status !== 'approved' && r.status !== 'hidden' && (
                  <button disabled={busy} onClick={() => act(r.id, 'PATCH', { status: 'hidden' })} className="chip bg-white ring-1 ring-beige" title="Keep for management, don’t publish"><EyeOff size={15} /> Keep private</button>
                )}
                {r.status !== 'rejected' && (
                  <button disabled={busy} onClick={() => act(r.id, 'PATCH', { status: 'rejected' })} className="chip bg-white ring-1 ring-beige"><X size={15} /> Reject</button>
                )}
                {r.status !== 'pending' && (
                  <button disabled={busy} onClick={() => act(r.id, 'PATCH', { status: 'pending' })} className="chip bg-white ring-1 ring-beige"><RotateCcw size={15} /> Back to pending</button>
                )}
                <button disabled={busy} onClick={() => act(r.id, 'DELETE')} className="chip ml-auto text-red-700 hover:bg-red-50"><Trash2 size={15} /> Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
