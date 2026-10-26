import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Sign In' };

export default function SignInPage() {
  return (
    <section className="grain flex min-h-[75vh] items-center py-16">
      <div className="container-x"><Suspense><AuthForm mode="signin" /></Suspense></div>
    </section>
  );
}
