import Link from 'next/link';
import { DrinkArt } from '@/components/DrinkArt';

export default function NotFound() {
  return (
    <section className="grain grid min-h-[70vh] place-items-center py-16 text-center">
      <div>
        <DrinkArt kind="hot" tone="#6F4E37" uid="404" className="mx-auto h-40 w-40" />
        <h1 className="mt-4 text-5xl font-semibold">Spilled the beans</h1>
        <p className="mt-2 text-coffee/75">We couldn&apos;t find that page.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/menu" className="btn-outline">Explore Our Menu</Link>
        </div>
      </div>
    </section>
  );
}
