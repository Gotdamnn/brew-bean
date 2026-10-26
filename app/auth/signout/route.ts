import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
