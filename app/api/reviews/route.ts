import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { REVIEW_BUCKET } from '@/lib/reviews';
import { PHOTO_MAX_BYTES, ReviewInput } from '@/lib/review-schema';
import { cleanText, clientIpHash, isSameOrigin, looksLikeSpam, userAgent } from '@/lib/security';

export const runtime = 'nodejs';

/** Identify real image type from magic bytes — never trust the browser's MIME type. */
function sniffImage(buf: Uint8Array): { mime: string; ext: string } | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  )
    return { mime: 'image/webp', ext: 'webp' };
  return null;
}

const fail = (error: string, status = 400, field?: string) => NextResponse.json({ error, field }, { status });

export async function POST(req: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return fail('Reviews are not connected to the database yet. Please let our staff know!', 503);
  if (!(await isSameOrigin())) return fail('Invalid request origin', 403);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail('Invalid submission');
  }

  const raw = Object.fromEntries(
    ['customerName', 'rating', 'drinkOrdered', 'reviewText', 'visitDate', 'visibility', 'consent', 'website', 'startedAt'].map((k) => [k, form.get(k) ?? undefined]),
  );
  const parsed = ReviewInput.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? 'Please check your review', 400, String(issue?.path?.[0] ?? ''));
  }
  const v = parsed.data;

  // Bot checks: honeypot filled, or submitted impossibly fast after the form loaded.
  if (v.website) return fail('Invalid submission');
  if (v.startedAt && Date.now() - v.startedAt < 3000) return fail('That was quick! Please take a moment and try again.', 429);

  const db = supabaseAdmin();
  const ip_hash = await clientIpHash();

  // Rate limit: 3 reviews per hour, 8 per day per visitor.
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [{ count: perHour }, { count: perDay }] = await Promise.all([
    db.from('reviews').select('id', { count: 'exact', head: true }).eq('ip_hash', ip_hash).gte('created_at', hourAgo),
    db.from('reviews').select('id', { count: 'exact', head: true }).eq('ip_hash', ip_hash).gte('created_at', dayAgo),
  ]);
  if ((perHour ?? 0) >= 3 || (perDay ?? 0) >= 8)
    return fail('You’ve sent several reviews recently. Thank you! Please try again a bit later.', 429);

  // Optional photo
  let image_path: string | null = null;
  const file = form.get('photo');
  if (file && typeof file !== 'string' && file.size > 0) {
    if (file.size > PHOTO_MAX_BYTES) return fail('Photo must be 5 MB or smaller.', 400, 'photo');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind) return fail('Photo must be a JPG, PNG or WEBP image.', 400, 'photo');
    const now = new Date();
    const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${kind.ext}`;
    const { error: upErr } = await db.storage.from(REVIEW_BUCKET).upload(path, bytes, { contentType: kind.mime, upsert: false });
    if (upErr) return fail('We could not upload your photo. Please try again without it.', 500, 'photo');
    image_path = path;
  }

  const text = cleanText(v.reviewText);
  const flagged = looksLikeSpam(text);
  const isPublic = v.visibility === 'public';

  const { error } = await db.from('reviews').insert({
    customer_name: cleanText(v.customerName) || null,
    rating: v.rating,
    drink_ordered: v.drinkOrdered || null,
    review_text: text,
    visit_date: v.visitDate || null,
    image_path,
    publish_consent: isPublic && v.consent,
    is_public: isPublic,
    status: 'pending',
    admin_note: flagged ? 'Auto-flagged: contains several links or repeated characters — please check for spam.' : null,
    ip_hash,
    user_agent: await userAgent(),
  });

  if (error) {
    if (image_path) await db.storage.from(REVIEW_BUCKET).remove([image_path]);
    return fail('We could not save your review. Please try again.', 500);
  }

  revalidatePath('/admin/reviews');
  // Success is only reported after the database confirms the insert.
  return NextResponse.json({ ok: true, visibility: v.visibility }, { status: 201 });
}
