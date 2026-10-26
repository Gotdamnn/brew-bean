import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, supabaseAdmin } from '@/lib/supabase/server';
import { isNonPublicUrl } from '@/lib/site-config';
import { isSameOrigin } from '@/lib/security';

const Body = z.object({ reviewQrUrl: z.string().trim().max(300) });

/** Update (or clear) the review QR destination — used when the production domain changes. */
export async function POST(req: Request) {
  if (!(await isSameOrigin())) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });

  const db = supabaseAdmin();
  const url = parsed.data.reviewQrUrl;
  if (!url) {
    await db.from('site_settings').delete().eq('key', 'review_qr_url');
    return NextResponse.json({ ok: true, cleared: true });
  }
  if (isNonPublicUrl(url))
    return NextResponse.json({ error: 'Use a public https:// address customers can reach — not localhost, a LAN IP or http.' }, { status: 400 });

  const { error } = await db
    .from('site_settings')
    .upsert({ key: 'review_qr_url', value: url, updated_at: new Date().toISOString(), updated_by: admin.id });
  if (error) return NextResponse.json({ error: 'Could not save' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
