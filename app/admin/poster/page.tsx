import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/server';
import { getReviewQrUrl } from '@/lib/reviews';
import { qrSvg } from '@/lib/qr';
import { LogoBadge } from '@/components/Logo';
import { PrintButton } from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function PosterPage() {
  if (!(await requireAdmin())) notFound();
  const { url, publicOk } = await getReviewQrUrl();
  if (!url || !publicOk) {
    return (
      <div className="container-x py-16">
        <div className="card mx-auto max-w-lg p-10 text-center">
          <AlertTriangle className="mx-auto text-caramel" size={40} />
          <p className="mt-4 font-display text-2xl">Set a public review URL first</p>
          <Link href="/admin/qr" className="btn-primary mt-6">Go to QR settings</Link>
        </div>
      </div>
    );
  }
  const svg = await qrSvg(url);

  return (
    <div className="flex flex-col items-center gap-6 py-10 print:py-0">
      <div className="no-print flex flex-wrap items-center justify-center gap-3">
        <PrintButton />
        <p className="text-sm text-coffee/70">Prints on A5. For A4, choose “Fit to page” in the print dialog.</p>
      </div>

      {/* A5 poster: 148 × 210 mm */}
      <article
        className="relative flex flex-col items-center overflow-hidden bg-cream text-center shadow-lift print:shadow-none"
        style={{ width: '148mm', height: '210mm', padding: '12mm 12mm 0' }}
      >
        <div className="absolute inset-[5mm] rounded-[6mm] border-2 border-espresso/80" aria-hidden="true" />
        <div className="absolute inset-[7mm] rounded-[5mm] border border-gold" aria-hidden="true" />

        <LogoBadge size={78} className="relative mt-[2mm]" />
        <h1 className="relative mt-[5mm] font-display font-bold leading-none tracking-wide text-espresso" style={{ fontSize: '30pt' }}>
          ENJOYED YOUR BREW?
        </h1>
        <p className="relative mt-[3mm] font-semibold uppercase tracking-[0.18em] text-caramel" style={{ fontSize: '12pt' }}>
          WE&apos;D LOVE YOUR FEEDBACK!
        </p>

        <div className="relative mt-[6mm] rounded-[5mm] bg-white p-[4mm] shadow-soft ring-2 ring-espresso" style={{ width: '72mm' }}>
          <div className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>

        <p className="relative mt-[6mm] max-w-[100mm] text-espresso" style={{ fontSize: '12pt', lineHeight: 1.45 }}>
          Scan the QR code and tell us about your Brew &amp; Shot experience.
        </p>
        <p className="relative mt-[5mm] rounded-full bg-espresso px-[6mm] py-[2.5mm] font-semibold tracking-[0.25em] text-gold" style={{ fontSize: '11pt' }}>
          SCAN • RATE • REVIEW
        </p>

        <footer className="absolute inset-x-[7mm] bottom-[7mm] rounded-b-[5mm] bg-espresso py-[3.5mm] text-cream" style={{ fontSize: '9pt' }}>
          <span className="font-display font-semibold tracking-widest">BREW &amp; SHOT CAFÉ</span>
          <span className="mx-2 text-gold">—</span>
          <span className="italic text-beige">Simplicity in Every Sip</span>
        </footer>
      </article>
      <p className="no-print max-w-md break-all text-center text-xs text-coffee/60">Encodes: {url}</p>
    </div>
  );
}
