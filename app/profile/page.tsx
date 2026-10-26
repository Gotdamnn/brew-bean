import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { LogOut, Receipt, ShieldCheck } from 'lucide-react';
import { supabaseServer, getSessionUser } from '@/lib/supabase/server';
import { peso } from '@/lib/menu';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = { title: 'My Profile' };
export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = { received: 'Received', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect('/signin?next=/profile');
  const supabase = await supabaseServer();
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('full_name, phone, is_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('orders')
      .select('id, order_number, created_at, service_type, total, status, payment_status, order_items(product_name, variant_label, quantity, line_total)')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <section className="grain py-14">
      <div className="container-x max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Hi, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
            <p className="mt-1 text-sm text-coffee/70">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {profile?.is_admin && <Link href="/admin/reviews" className="btn-dark"><ShieldCheck size={16} /> Admin</Link>}
            <form action="/auth/signout" method="post"><button className="btn-outline"><LogOut size={16} /> Sign out</button></form>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
          <ProfileForm initialName={profile?.full_name ?? ''} initialPhone={profile?.phone ?? ''} />

          <div className="card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><Receipt size={22} className="text-caramel" /> Order History</h2>
            {!orders?.length ? (
              <div className="py-12 text-center">
                <p className="text-coffee/75">No orders yet. Orders placed while signed in will appear here.</p>
                <Link href="/menu" className="btn-primary mt-5">Order Now</Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {orders.map((o) => (
                  <li key={o.id} className="rounded-3xl border border-beige p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-display text-lg">{o.order_number}</p>
                        <p className="text-xs text-coffee/60">
                          {new Date(o.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })} · {o.service_type === 'dine_in' ? 'Dine In' : 'Take Away'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full bg-beige px-3 py-1 text-xs font-medium">{STATUS[o.status] ?? o.status}</span>
                        <p className="mt-1 font-display text-xl">{peso(o.total)}</p>
                      </div>
                    </div>
                    <ul className="mt-3 text-sm text-coffee/80">
                      {(o.order_items as { product_name: string; variant_label: string; quantity: number }[]).map((i, k) => (
                        <li key={k}>{i.quantity} × {i.product_name} <span className="text-coffee/50">({i.variant_label})</span></li>
                      ))}
                    </ul>
                    {o.payment_status === 'pay_at_counter' && <p className="mt-2 text-xs text-caramel">Pay at counter</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
