'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export interface AuthState {
  loading: boolean;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
}

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ loading: true, email: null, name: null, isAdmin: false });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ loading: false, email: null, name: null, isAdmin: false });
      return;
    }
    const sb = supabaseBrowser();
    let alive = true;

    const load = async () => {
      const { data } = await sb.auth.getUser();
      const user = data.user;
      if (!user) {
        if (alive) setState({ loading: false, email: null, name: null, isAdmin: false });
        return;
      }
      const { data: profile } = await sb.from('profiles').select('full_name, is_admin').eq('id', user.id).maybeSingle();
      if (alive)
        setState({
          loading: false,
          email: user.email ?? null,
          name: profile?.full_name || null,
          isAdmin: !!profile?.is_admin,
        });
    };
    load();
    const { data: sub } = sb.auth.onAuthStateChange(() => load());
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
