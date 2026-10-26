-- ════════════════════════════════════════════════════════════════════
--  Brew & Shot Café — Supabase schema
--  Run this whole file once in Supabase → SQL Editor → New query → Run.
--  It is idempotent: safe to re-run.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── PROFILES (customers + admins) ──────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text check (char_length(full_name) <= 80),
  phone       text check (char_length(phone) <= 30),
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

-- Users can edit their own name/phone, but NEVER their is_admin flag.
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Column-level privileges: signed-in users may only change these two columns.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Auto-create a profile row on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id,
          left(coalesce(new.raw_user_meta_data->>'full_name', ''), 80),
          left(coalesce(new.raw_user_meta_data->>'phone', ''), 30))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ─── REVIEWS ────────────────────────────────────────────────────────
do $$ begin
  create type public.review_status as enum ('pending', 'approved', 'rejected', 'hidden');
exception when duplicate_object then null; end $$;

create table if not exists public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  customer_name      text check (char_length(customer_name) <= 60),
  rating             smallint not null check (rating between 1 and 5),
  drink_ordered      text check (char_length(drink_ordered) <= 80),
  review_text        text not null check (char_length(review_text) between 10 and 1000),
  visit_date         date,
  image_path         text,            -- object path inside the private "review-photos" bucket
  publish_consent    boolean not null default false,
  is_public          boolean not null default true,  -- false = private feedback for management only
  status             public.review_status not null default 'pending',
  admin_note         text check (char_length(admin_note) <= 500),
  ip_hash            text,            -- salted hash, used only for rate limiting
  user_agent         text,
  created_at         timestamptz not null default now(),
  moderated_at       timestamptz,
  moderated_by       uuid references auth.users(id),
  -- A private review can never be approved for public display
  constraint private_never_public check (not (status = 'approved' and (is_public = false or publish_consent = false)))
);

create index if not exists reviews_status_idx   on public.reviews (status, created_at desc);
create index if not exists reviews_ip_time_idx  on public.reviews (ip_hash, created_at desc);

alter table public.reviews enable row level security;

-- No anonymous/customer access to the base table at all. Submissions go through
-- the server API (service role) which validates, rate-limits and stores photos.
drop policy if exists "reviews: admins read"   on public.reviews;
drop policy if exists "reviews: admins update" on public.reviews;
drop policy if exists "reviews: admins delete" on public.reviews;
create policy "reviews: admins read"   on public.reviews for select using (public.is_admin());
create policy "reviews: admins update" on public.reviews for update using (public.is_admin());
create policy "reviews: admins delete" on public.reviews for delete using (public.is_admin());

-- Public, safe projection: only approved + public + consented reviews,
-- and only non-sensitive columns (no IP hash, user agent, admin notes).
create or replace view public.public_reviews
with (security_invoker = false) as
  select id,
         coalesce(nullif(trim(customer_name), ''), 'Anonymous') as customer_name,
         rating, drink_ordered, review_text, visit_date, image_path, created_at
  from public.reviews
  where status = 'approved' and is_public = true and publish_consent = true;

revoke all on public.public_reviews from anon, authenticated;
grant select on public.public_reviews to anon, authenticated;

-- Aggregate stats computed from real approved reviews only
create or replace view public.public_review_stats
with (security_invoker = false) as
  select count(*)::int as total,
         coalesce(round(avg(rating)::numeric, 2), 0)::float as average,
         count(*) filter (where rating = 5)::int as five,
         count(*) filter (where rating = 4)::int as four,
         count(*) filter (where rating = 3)::int as three,
         count(*) filter (where rating = 2)::int as two,
         count(*) filter (where rating = 1)::int as one
  from public.reviews
  where status = 'approved' and is_public = true and publish_consent = true;

revoke all on public.public_review_stats from anon, authenticated;
grant select on public.public_review_stats to anon, authenticated;

-- ─── SITE SETTINGS (QR destination etc.) ────────────────────────────
create table if not exists public.site_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id)
);
alter table public.site_settings enable row level security;
drop policy if exists "settings: public read"  on public.site_settings;
drop policy if exists "settings: admin write"  on public.site_settings;
create policy "settings: public read" on public.site_settings for select using (true);
create policy "settings: admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ─── ORDERS ─────────────────────────────────────────────────────────
do $$ begin
  create type public.order_status as enum ('received', 'preparing', 'ready', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  user_id         uuid references auth.users(id) on delete set null,
  customer_name   text not null check (char_length(customer_name) between 1 and 60),
  contact_number  text not null check (char_length(contact_number) between 7 and 20),
  service_type    text not null check (service_type in ('dine_in', 'take_away')),
  notes           text check (char_length(notes) <= 300),
  subtotal        integer not null check (subtotal >= 0),
  fees            integer not null default 0 check (fees >= 0),
  total           integer not null check (total >= 0),
  contains_alcohol boolean not null default false,
  payment_status  text not null default 'pay_at_counter' check (payment_status in ('pay_at_counter', 'paid')),
  status          public.order_status not null default 'received',
  ip_hash         text,
  created_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    text not null,
  product_name  text not null,
  variant_label text not null,
  add_ons       jsonb not null default '[]'::jsonb,
  unit_price    integer not null,
  quantity      integer not null check (quantity between 1 and 20),
  line_total    integer not null
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders: own read"   on public.orders;
drop policy if exists "orders: admin all"  on public.orders;
create policy "orders: own read"  on public.orders for select using (auth.uid() = user_id);
create policy "orders: admin all" on public.orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items: own read"  on public.order_items;
drop policy if exists "order_items: admin all" on public.order_items;
create policy "order_items: own read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items: admin all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- ─── CONTACT MESSAGES ───────────────────────────────────────────────
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  email       text not null check (char_length(email) <= 120),
  phone       text check (char_length(phone) <= 30),
  message     text not null check (char_length(message) between 5 and 2000),
  ip_hash     text,
  created_at  timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists "contact: admin read" on public.contact_messages;
create policy "contact: admin read" on public.contact_messages for select using (public.is_admin());

-- ─── STORAGE: private bucket for review photos ──────────────────────
-- Private: files are never directly public. The server issues short-lived
-- signed URLs only for photos attached to approved, public reviews (and to admins).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- No storage policies for anon/authenticated → only the service role (server) can read/write.

-- ════════════════════════════════════════════════════════════════════
--  MAKE YOURSELF AN ADMIN (run after you sign up on the website):
--  update public.profiles set is_admin = true
--  where id = (select id from auth.users where email = 'owner@example.com');
-- ════════════════════════════════════════════════════════════════════
