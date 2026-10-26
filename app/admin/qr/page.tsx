import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, Download, ExternalLink, Printer, Smartphone } from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/server';
import { getReviewQrUrl } from '@/lib/reviews';
import { siteUrl } from '@/lib/site-config';
import { qrSvg } from '@/lib/qr';
import { QrDestinationForm } from './QrDestinationForm';

export const dynamic = 'force-dynamic';

export default async function AdminQrPage() {
  if (!(await requireAdmin())) notFound();
  const { url, source, publicOk } = await getReviewQrUrl();
  const svg = url && publicOk ? await qrSvg(url) : null;

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[400px_1fr]">
      <div className="card p-8 text-center">
        <p className="eyebrow">Official review QR code</p>
        {svg ? (
          <>
            <div className="mx-auto mt-5 w-full max-w-[300px] rounded-3xl bg-white p-3 ring-1 ring-beige [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="mt-4 break-all text-sm text-coffee/80">{url}</p>
            <div className="mt-6 grid gap-2">
              <a href="/api/admin/qr?format=png" className="btn-primary"><Download size={16} /> Download PNG (1200px)</a>
              <a href="/api/admin/qr?format=png&size=xl" className="btn-outline"><Download size={16} /> PNG for large print (2400px)</a>
              <a href="/api/admin/qr?format=svg" className="btn-outline"><Download size={16} /> Download SVG (vector)</a>
              <Link href="/admin/poster" className="btn-dark"><Printer size={16} /> Open printable poster</Link>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-3xl bg-red-50 p-6 text-left text-sm text-red-900">
            <AlertTriangle className="mb-2" />
            <p className="font-semibold">No public destination yet</p>
            <p className="mt-1">
              {url ? <>The current destination <code className="break-all">{url}</code> is not publicly reachable (localhost, a private IP or http). </> : null}
              Set <code>NEXT_PUBLIC_SITE_URL</code> to your production domain or enter a public URL on the right. The QR code is only generated for a public https address so printed codes never point to a development machine.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="card p-8">
          <h2 className="text-2xl font-semibold">QR destination</h2>
          <p className="mt-2 text-sm text-coffee/75">
            Currently using {source === 'admin' ? 'a custom URL saved here' : source === 'env' ? <>the site URL from <code>NEXT_PUBLIC_SITE_URL</code></> : 'nothing'}.
            If your domain changes, update it here — then download and reprint the code.
          </p>
          <QrDestinationForm current={source === 'admin' ? url : ''} fallback={siteUrl() ? `${siteUrl()}/reviews/submit` : ''} />
        </div>
        <div className="card p-8">
          <h2 className="flex items-center gap-2 text-2xl font-semibold"><Smartphone size={22} className="text-caramel" /> Before you print</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-coffee/85">
            <li>Scan the code above with an iPhone camera and an Android camera — both should open the review form.</li>
            <li>Submit a short test review and confirm it appears under <Link className="text-caramel underline" href="/admin/reviews?status=pending">Pending</Link>, then delete it.</li>
            <li>Print at least 3 × 3 cm (table tents) or 6 × 6 cm (counter posters). Keep the white border around the code.</li>
            <li>Avoid glossy lamination directly over the code under strong lights; matte works best.</li>
          </ol>
          {url && publicOk && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline mt-5"><ExternalLink size={16} /> Open the review page</a>
          )}
        </div>
      </div>
    </div>
  );
}
