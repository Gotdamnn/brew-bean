'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { LogoBadge } from './Logo';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get('next') || '/profile';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/profile';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured()) return setError('Accounts are not connected yet. Please try again later.');
    if (mode === 'signup' && password.length < 8) return setError('Use at least 8 characters for your password.');
    setBusy(true);
    const sb = supabaseBrowser();
    try {
      if (mode === 'signin') {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
        router.replace(next);
        router.refresh();
      } else {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim().slice(0, 80), phone: phone.trim().slice(0, 30) },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace('/profile');
          router.refresh();
        } else setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <div className="card mx-auto max-w-md p-10 text-center">
        <MailCheck className="mx-auto text-caramel" size={48} />
        <h1 className="mt-4 text-3xl font-semibold">Check your inbox</h1>
        <p className="mt-2 text-coffee/80">We sent a confirmation link to <strong>{email}</strong>. Open it to activate your account.</p>
      </div>
    );

  return (
    <div className="card mx-auto w-full max-w-md p-8 sm:p-10">
      <LogoBadge size={64} className="mx-auto" />
      <h1 className="mt-5 text-center text-3xl font-semibold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="mt-1 text-center text-sm text-coffee/70">
        {mode === 'signin' ? 'Sign in to see your orders.' : 'Save your details and track your order history.'}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === 'signup' && (
          <>
            <div><label htmlFor="n" className="label">Full name</label><input id="n" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={80} /></div>
            <div><label htmlFor="ph" className="label">Contact number <span className="font-normal text-coffee/60">(optional)</span></label><input id="ph" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={20} /></div>
          </>
        )}
        <div><label htmlFor="e" className="label">Email</label><input id="e" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
        <div><label htmlFor="p" className="label">Password</label><input id="p" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={mode === 'signup' ? 8 : undefined} /></div>
        {error && <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full !py-3.5">
          {busy && <Loader2 size={18} className="animate-spin" />} {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-coffee/80">
        {mode === 'signin' ? (<>New here? <Link className="text-caramel hover:underline" href={`/signup${next !== '/profile' ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link></>) : (<>Already have an account? <Link className="text-caramel hover:underline" href="/signin">Sign in</Link></>)}
      </p>
      <p className="mt-3 text-center text-xs text-coffee/60">You don&apos;t need an account to order or to leave a review.</p>
    </div>
  );
}
