import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { AdminNav } from './AdminNav';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <Notice title="Database not connected" body="Add your Supabase keys to the environment (see README) to use the admin dashboard." />;
  }
  const admin = await requireAdmin();
  if (!admin) {
    return <Notice title="Admins only" body="This area is restricted to Brew & Shot Café staff. If you manage the café, ask the owner to grant your account admin access." />;
  }
  return (
    <div className="min-h-screen bg-cream">
      <div className="no-print border-b border-beige bg-white">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="eyebrow">Café admin</p>
            <p className="font-display text-xl">Management Dashboard</p>
          </div>
          <AdminNav />
        </div>
      </div>
      {children}
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <section className="grain grid min-h-[70vh] place-items-center py-16">
      <div className="card max-w-md p-10 text-center">
        <ShieldAlert className="mx-auto text-caramel" size={44} />
        <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-coffee/80">{body}</p>
        <Link href="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    </section>
  );
}
