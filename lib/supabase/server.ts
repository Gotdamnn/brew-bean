import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env';

/** Request-scoped client acting as the signed-in user (RLS enforced). */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // called from a Server Component — middleware refreshes the session instead
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS — use ONLY in server code after doing
 * your own validation / authorization. Never import from client components.
 */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured() || !key) throw new Error('Supabase service role is not configured');
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** Returns the user only if they are an admin (checked server-side against the DB). */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return null;
  const { data } = await supabaseAdmin().from('profiles').select('is_admin').eq('id', user.id).single();
  return data?.is_admin ? user : null;
}
