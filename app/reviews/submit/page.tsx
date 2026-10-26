import type { Metadata } from 'next';
import { ReviewForm } from '@/components/ReviewForm';
import { LogoBadge } from '@/components/Logo';

/**
 * QR code landing page. Kept deliberately light and static so it opens
 * instantly on a phone after scanning: Rate → Write → Submit → Thank you.
 */
export const metadata: Metadata = {
  title: 'Write a Review',
  description: 'Rate your visit and tell us about your Brew & Shot experience.',
};
export const dynamic = 'force-static';

export default function SubmitReviewPage() {
  return (
    <section className="grain min-h-screen bg-cream pb-16 pt-8 sm:pt-14">
      <div className="container-x">
        <div className="mx-auto mb-8 max-w-xl text-center">
          <LogoBadge size={72} className="mx-auto shadow-soft" />
          <h1 className="mt-5 text-3xl font-semibold sm:text-5xl">Your Feedback Matters!</h1>
          <p className="mt-3 leading-relaxed text-coffee/80">
            We&apos;d love to hear about your Brew &amp; Shot experience. Your feedback helps us serve you better, one sip at a time.
          </p>
        </div>
        <ReviewForm />
      </div>
    </section>
  );
}
