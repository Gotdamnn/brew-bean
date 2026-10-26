import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin, supabaseAdmin } from '@/lib/supabase/server';
import { REVIEW_BUCKET } from '@/lib/reviews';
import { isSameOrigin } from '@/lib/security';

const Patch = z.object({ status: z.enum(['pending', 'approved', 'rejected', 'hidden']), admin_note: z.string().max(500).optional() });
const Id = z.string().uuid();

async function guard(id: string) {
  if (!(await isSameOrigin())) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (!Id.safeParse(id).success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  return admin;
}

function refreshPublic() {
  revalidatePath('/');
  revalidatePath('/reviews');
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await guard(id);
  if (admin instanceof NextResponse) return admin;

  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  const db = supabaseAdmin();
  if (parsed.data.status === 'approved') {
    const { data: r } = await db.from('reviews').select('is_public, publish_consent').eq('id', id).single();
    if (!r) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    if (!r.is_public || !r.publish_consent)
      return NextResponse.json({ error: 'This is private feedback (or has no publishing consent) and cannot be made public.' }, { status: 400 });
  }

  const { error } = await db
    .from('reviews')
    .update({ status: parsed.data.status, ...(parsed.data.admin_note !== undefined ? { admin_note: parsed.data.admin_note } : {}), moderated_at: new Date().toISOString(), moderated_by: admin.id })
    .eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not update review' }, { status: 500 });
  refreshPublic();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await guard(id);
  if (admin instanceof NextResponse) return admin;

  const db = supabaseAdmin();
  const { data: r } = await db.from('reviews').select('image_path').eq('id', id).single();
  const { error } = await db.from('reviews').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not delete review' }, { status: 500 });
  if (r?.image_path) await db.storage.from(REVIEW_BUCKET).remove([r.image_path]);
  refreshPublic();
  return NextResponse.json({ ok: true });
}
