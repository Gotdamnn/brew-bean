/* eslint-disable @next/next/no-img-element */
import { Coffee, Quote } from 'lucide-react';
import type { PublicReview } from '@/lib/reviews';
import { Stars } from './Stars';

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

export function ReviewCard({ review }: { review: PublicReview }) {
  const initial = review.customer_name.trim().charAt(0).toUpperCase() || 'A';
  return (
    <article className="card flex h-full flex-col p-6 transition duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <Stars value={review.rating} size={18} />
        <Quote size={28} className="text-beige" />
      </div>
      <p className="mt-4 flex-1 whitespace-pre-line leading-relaxed text-espresso/90">{review.review_text}</p>
      {review.image_url && (
        <img src={review.image_url} alt={`Photo shared by ${review.customer_name}`} loading="lazy" className="mt-4 aspect-[4/3] w-full rounded-2xl object-cover" />
      )}
      {review.drink_ordered && (
        <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs text-coffee">
          <Coffee size={13} /> {review.drink_ordered}
        </p>
      )}
      <div className="mt-5 flex items-center gap-3 border-t border-beige pt-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-espresso font-display text-gold">{initial}</span>
        <div>
          <p className="font-medium text-espresso">{review.customer_name}</p>
          <p className="text-xs text-coffee/60">{fmtDate(review.created_at)}</p>
        </div>
      </div>
    </article>
  );
}
