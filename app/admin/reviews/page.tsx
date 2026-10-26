import { notFound } from 'next/navigation';
import { requireAdmin, supabaseAdmin } from '@/lib/supabase/server';
import { signPhotoUrls } from '@/lib/reviews';
import { AdminReviews, type AdminReview } from './AdminReviews';

export const dynamic = 'force-dynamic';

type SP = { status?: string; rating?: string; from?: string; to?: string; visibility?: string };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  // Re-check on every page render — never rely on the layout alone.
  if (!(await requireAdmin())) notFound();
  const sp = await searchParams;
  const db = supabaseAdmin();

  let q = db
    .from('reviews')
    .select('id, customer_name, rating, drink_ordered, review_text, visit_date, image_path, publish_consent, is_public, status, admin_note, created_at, moderated_at')
    .order('created_at', { ascending: false })
    .limit(300);

  const status = ['pending', 'approved', 'rejected', 'hidden'].includes(sp.status ?? '') ? sp.status! : sp.status === 'all' ? null : 'pending';
  if (status) q = q.eq('status', status);
  const rating = Number(sp.rating);
  if (rating >= 1 && rating <= 5) q = q.eq('rating', rating);
  if (sp.visibility === 'private') q = q.eq('is_public', false);
  if (sp.visibility === 'public') q = q.eq('is_public', true);
  if (sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from)) q = q.gte('created_at', `${sp.from}T00:00:00`);
  if (sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.to)) q = q.lte('created_at', `${sp.to}T23:59:59`);

  const [{ data: rows }, { data: all }] = await Promise.all([q, db.from('reviews').select('rating, status, is_public, created_at').limit(10000)]);

  const urls = await signPhotoUrls((rows ?? []).map((r) => r.image_path), 60 * 30);
  const reviews: AdminReview[] = (rows ?? []).map((r, i) => ({ ...r, image_url: urls[i] }));

  const a = all ?? [];
  const weekAgo = Date.now() - 7 * 86_400_000;
  const stats = {
    total: a.length,
    pending: a.filter((r) => r.status === 'pending').length,
    approved: a.filter((r) => r.status === 'approved').length,
    privateCount: a.filter((r) => !r.is_public).length,
    thisWeek: a.filter((r) => +new Date(r.created_at) >= weekAgo).length,
    avgAll: a.length ? a.reduce((s, r) => s + r.rating, 0) / a.length : 0,
    dist: [5, 4, 3, 2, 1].map((n) => ({ n, c: a.filter((r) => r.rating === n).length })),
  };

  return <AdminReviews reviews={reviews} stats={stats} filters={{ status: status ?? 'all', rating: sp.rating ?? '', from: sp.from ?? '', to: sp.to ?? '', visibility: sp.visibility ?? '' }} />;
}
