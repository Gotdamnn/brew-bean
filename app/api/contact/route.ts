import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { cleanText, clientIpHash, isSameOrigin, looksLikeSpam } from '@/lib/security';

const Body = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(80),
  email: z.string().trim().email('Please enter a valid email').max(120),
  phone: z.string().trim().max(30).optional().default(''),
  message: z.string().trim().min(5, 'Please write a short message').max(2000),
  website: z.string().max(0).optional().default(''),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json({ error: 'The contact form is not connected yet. Please reach us by phone or social media.' }, { status: 503 });
  if (!(await isSameOrigin())) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid message' }, { status: 400 });
  const b = parsed.data;
  if (b.website || looksLikeSpam(b.message)) return NextResponse.json({ ok: true }); // silently drop bots

  const db = supabaseAdmin();
  const ip_hash = await clientIpHash();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db.from('contact_messages').select('id', { count: 'exact', head: true }).eq('ip_hash', ip_hash).gte('created_at', since);
  if ((count ?? 0) >= 5) return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });

  const { error } = await db.from('contact_messages').insert({ name: cleanText(b.name), email: b.email, phone: b.phone || null, message: cleanText(b.message), ip_hash });
  if (error) return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
