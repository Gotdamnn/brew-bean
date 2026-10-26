import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';
import { getReviewQrUrl } from '@/lib/reviews';
import { qrPng, qrSvg } from '@/lib/qr';

/** Admin-only download of the official review QR code as PNG (1200px / 2400px) or SVG. */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  const { url, publicOk } = await getReviewQrUrl();
  if (!url || !publicOk)
    return NextResponse.json({ error: 'Set a public https review URL first (not localhost or a private address).' }, { status: 400 });

  const sp = new URL(req.url).searchParams;
  const format = sp.get('format') === 'svg' ? 'svg' : 'png';
  if (format === 'svg') {
    return new NextResponse(await qrSvg(url), {
      headers: { 'Content-Type': 'image/svg+xml', 'Content-Disposition': 'attachment; filename="brew-and-shot-review-qr.svg"', 'Cache-Control': 'no-store' },
    });
  }
  const size = sp.get('size') === 'xl' ? 2400 : 1200;
  const png = await qrPng(url, size);
  return new NextResponse(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="brew-and-shot-review-qr-${size}.png"`, 'Cache-Control': 'no-store' },
  });
}
