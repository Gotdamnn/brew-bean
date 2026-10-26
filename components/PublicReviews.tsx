'use client';

import { useMemo, useState } from 'react';
import { MessageSquareHeart } from 'lucide-react';
import type { PublicReview, ReviewStats } from '@/lib/reviews';
import { ReviewCard } from './ReviewCard';
import { Stars } from './Stars';

type Sort = 'newest' | 'highest' | 'lowest';

export function PublicReviews({ reviews, stats }: { reviews: PublicReview[]; stats: ReviewStats }) {
  const [sort, setSort] = useState<Sort>('newest');
  const [stars, setStars] = useState<number | null>(null);

  const list = useMemo(() => {
    const l = stars ? reviews.filter((r) => r.rating === stars) : [...reviews];
    l.sort((a, b) =>
      sort === 'newest'
        ? +new Date(b.created_at) - +new Date(a.created_at)
        : sort === 'highest'
          ? b.rating - a.rating || +new Date(b.created_at) - +new Date(a.created_at)
          : a.rating - b.rating || +new Date(b.created_at) - +new Date(a.created_at),
    );
    return l;
  }, [reviews, sort, stars]);

  if (stats.total === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-4xl border-2 border-dashed border-beige bg-white p-10 text-center">
        <MessageSquareHeart className="mx-auto text-caramel" size={40} />
        <h3 className="mt-4 text-2xl font-semibold">No public reviews yet</h3>
        <p className="mt-2 text-coffee/75">Be the first to share your Brew &amp; Shot experience — approved reviews will show up right here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-8 rounded-4xl bg-white p-6 shadow-soft sm:p-8 md:grid-cols-[220px_1fr]">
        <div className="text-center md:border-r md:border-beige md:pr-8">
          <p className="font-display text-6xl font-semibold">{stats.average.toFixed(1)}</p>
          <Stars value={stats.average} size={22} className="mt-2" />
          <p className="mt-2 text-sm text-coffee/70">{stats.total} approved review{stats.total === 1 ? '' : 's'}</p>
        </div>
        <div className="space-y-2">
          {([5, 4, 3, 2, 1] as const).map((n) => {
            const c = stats.breakdown[n];
            const pct = stats.total ? (c / stats.total) * 100 : 0;
            return (
              <button key={n} onClick={() => setStars(stars === n ? null : n)} aria-pressed={stars === n}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-1 text-sm transition ${stars === n ? 'bg-cream' : 'hover:bg-cream/60'}`}>
                <span className="w-12 text-left">{n} star</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-beige"><span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} /></span>
                <span className="w-8 text-right text-coffee/70">{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by star rating">
          <button onClick={() => setStars(null)} aria-pressed={stars === null} className={`chip ${stars === null ? 'bg-espresso text-cream' : 'bg-white ring-1 ring-beige'}`}>All</button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button key={n} onClick={() => setStars(n)} aria-pressed={stars === n} className={`chip ${stars === n ? 'bg-espresso text-cream' : 'bg-white ring-1 ring-beige'}`}>{n}★</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-coffee/70">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input !w-auto !rounded-full !py-2 !text-sm">
            <option value="newest">Newest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </label>
      </div>

      {list.length === 0 ? (
        <p className="py-16 text-center text-coffee/70">No {stars}-star reviews yet.</p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
