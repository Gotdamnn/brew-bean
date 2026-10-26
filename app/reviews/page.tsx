import Link from 'next/link';
import type { Metadata } from 'next';
import { PenLine } from 'lucide-react';
import { getPublicReviews, getReviewStats } from '@/lib/reviews';
import { ReviewForm } from '@/components/ReviewForm';
import { PublicReviews } from '@/components/PublicReviews';

export const metadata: Metadata = { title: 'Reviews', description: 'Read real reviews from Brew & Shot Café guests and share your own experience.' };
export const revalidate = 60;

export default async function ReviewsPage() {
  const [reviews, stats] = await Promise.all([getPublicReviews(200), getReviewStats()]);
  return (
    <>
      <section className="grain bg-cream pb-16 pt-14 sm:pt-20" id="feedback">
        <div className="container-x">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="eyebrow">Customer Reviews</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Your Feedback Matters!</h1>
            <p className="mt-4 text-base leading-relaxed text-coffee/80 sm:text-lg">
              We&apos;d love to hear about your Brew &amp; Shot experience. Your feedback helps us serve you better, one sip at a time.
            </p>
            <Link href="/reviews/submit" className="btn-outline mt-6 sm:hidden"><PenLine size={16} /> Write a Review</Link>
          </div>
          <ReviewForm />
        </div>
      </section>

      <section className="section bg-beige/40" id="all-reviews">
        <div className="container-x">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="eyebrow">From our guests</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">What Our Customers Are Saying</h2>
            <p className="mt-3 text-sm text-coffee/70">Every review here was written by a real guest and approved by our team. Ratings are calculated from approved public reviews only.</p>
          </div>
          <PublicReviews reviews={reviews} stats={stats} />
        </div>
      </section>
    </>
  );
}
