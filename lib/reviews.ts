import 'server-only';
import { isSupabaseConfigured } from './supabase/env';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase/env';
import { supabaseAdmin } from './supabase/server';

/** Cookie-less anon client for public reads, so pages can be cached (ISR). */
const anon = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
import { isNonPublicUrl, siteUrl } from './site-config';

export interface PublicReview {
  id: string;
  customer_name: string;
  rating: number;
  drink_ordered: string | null;
  review_text: string;
  visit_date: string | null;
  image_url: string | null;
  created_at: string;
}

export interface ReviewStats {
  total: number;
  average: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const EMPTY_STATS: ReviewStats = { total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
export const REVIEW_BUCKET = 'review-photos';

export async function signPhotoUrls(paths: (string | null)[], seconds = 60 * 60): Promise<(string | null)[]> {
  const real = paths.filter((p): p is string => !!p);
  if (!real.length) return paths.map(() => null);
  try {
    const { data } = await supabaseAdmin().storage.from(REVIEW_BUCKET).createSignedUrls(real, seconds);
    const map = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
    return paths.map((p) => (p ? map.get(p) ?? null : null));
  } catch {
    return paths.map(() => null);
  }
}

/** Approved, public, consented reviews only — straight from the database. Nothing is fabricated. */
export async function getPublicReviews(limit = 60): Promise<PublicReview[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = anon();
  const { data, error } = await supabase
    .from('public_reviews')
    .select('id, customer_name, rating, drink_ordered, review_text, visit_date, image_path, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  const urls = await signPhotoUrls(data.map((r) => r.image_path));
  return data.map((r, i) => ({ ...r, image_url: urls[i] }));
}

export async function getReviewStats(): Promise<ReviewStats> {
  if (!isSupabaseConfigured()) return EMPTY_STATS;
  const supabase = anon();
  const { data } = await supabase.from('public_review_stats').select('*').single();
  if (!data) return EMPTY_STATS;
  return {
    total: data.total,
    average: Number(data.average) || 0,
    breakdown: { 1: data.one, 2: data.two, 3: data.three, 4: data.four, 5: data.five },
  };
}

/**
 * Where the review QR code points. An admin can override it from /admin/qr
 * (stored in site_settings.review_qr_url); otherwise NEXT_PUBLIC_SITE_URL + /reviews/submit.
 */
export async function getReviewQrUrl(): Promise<{ url: string; source: 'admin' | 'env' | 'none'; publicOk: boolean }> {
  let url = '';
  let source: 'admin' | 'env' | 'none' = 'none';
  if (isSupabaseConfigured()) {
    const supabase = anon();
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'review_qr_url').maybeSingle();
    if (data?.value) {
      url = data.value;
      source = 'admin';
    }
  }
  if (!url && siteUrl()) {
    url = `${siteUrl()}/reviews/submit`;
    source = 'env';
  }
  return { url, source, publicOk: !!url && !isNonPublicUrl(url) };
}
