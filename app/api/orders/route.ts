import { NextResponse } from 'next/server';
import { z } from 'zod';
import { summarize } from '@/lib/pricing';
import { getSessionUser, supabaseAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { cleanText, clientIpHash, isSameOrigin } from '@/lib/security';

const Body = z.object({
  customerName: z.string().trim().min(1, 'Please enter your name').max(60),
  contactNumber: z
    .string()
    .trim()
    .min(7, 'Please enter a valid contact number')
    .max(20)
    .regex(/^[+()\d\s-]+$/, 'Contact number can only contain digits, spaces, +, - and ()'),
  serviceType: z.enum(['dine_in', 'take_away']),
  notes: z.string().max(300).optional().default(''),
  ageConfirmed: z.boolean().optional().default(false),
  website: z.string().max(0).optional().default(''), // honeypot
  items: z
    .array(
      z.object({
        productId: z.string().max(80),
        variantId: z.enum(['hot', 'iced', 'regular']),
        addOnIds: z.array(z.string().max(40)).max(6),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, 'Your cart is empty')
    .max(40),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json({ error: 'Online ordering is not connected yet. Please order at the counter.' }, { status: 503 });
  if (!(await isSameOrigin())) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid order' }, { status: 400 });
  const b = parsed.data;
  if (b.website) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // Re-price everything from the official menu; reject anything that doesn't match.
  const s = summarize(b.items, b.serviceType);
  if (s.lines.length !== b.items.length) return NextResponse.json({ error: 'Some items in your cart are no longer available. Please review your cart.' }, { status: 409 });
  if (s.containsAlcohol && !b.ageConfirmed)
    return NextResponse.json({ error: 'Please confirm you are 18+ and will present a valid ID for alcoholic drinks.' }, { status: 400 });

  const db = supabaseAdmin();
  const ip_hash = await clientIpHash();

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db.from('orders').select('id', { count: 'exact', head: true }).eq('ip_hash', ip_hash).gte('created_at', since);
  if ((count ?? 0) >= 5) return NextResponse.json({ error: 'Too many orders in a short time. Please wait a few minutes or order at the counter.' }, { status: 429 });

  const user = await getSessionUser();
  const now = new Date();
  const order_number = `BS-${now.toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data: order, error } = await db
    .from('orders')
    .insert({
      order_number,
      user_id: user?.id ?? null,
      customer_name: cleanText(b.customerName),
      contact_number: b.contactNumber.trim(),
      service_type: b.serviceType,
      notes: cleanText(b.notes) || null,
      subtotal: s.subtotal,
      fees: s.feeTotal,
      total: s.total,
      contains_alcohol: s.containsAlcohol,
      payment_status: 'pay_at_counter',
      ip_hash,
    })
    .select('id, order_number, created_at')
    .single();
  if (error || !order) return NextResponse.json({ error: 'We could not place your order. Please try again.' }, { status: 500 });

  const { error: itemsErr } = await db.from('order_items').insert(
    s.lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      product_name: l.product.name,
      variant_label: l.variantLabel,
      add_ons: l.addOns,
      unit_price: l.unitPrice,
      quantity: l.quantity,
      line_total: l.lineTotal,
    })),
  );
  if (itemsErr) {
    await db.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'We could not place your order. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    createdAt: order.created_at,
    serviceType: b.serviceType,
    items: s.lines.map((l) => ({ name: l.product.name, variant: l.variantLabel, addOns: l.addOns.map((a) => a.name), quantity: l.quantity, lineTotal: l.lineTotal })),
    subtotal: s.subtotal,
    fees: s.fees,
    total: s.total,
    paymentStatus: 'pay_at_counter',
  });
}
