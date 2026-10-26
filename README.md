# Brew & Shot Café — Website

Next.js 15 · React 19 · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Lucide icons · `qrcode`

## What's included

| Area | Route |
|---|---|
| Home (hero, welcome, best sellers, menu categories, live review preview) | `/` |
| Full menu with search, category / temperature / best-seller filters, product details, sizes, add-ons, quantity | `/menu` |
| Cart drawer + cart page, checkout (name, contact, Dine In / Take Away, notes) | `/cart`, `/checkout` |
| About, Our Specialties, Contact (form + map + hours + socials) | `/about`, `/specialties`, `/contact` |
| Sign in / sign up / profile with order history | `/signin`, `/signup`, `/profile` |
| Reviews page (form + public reviews with average, totals, sort, star filters) | `/reviews` |
| **QR landing page** (lightweight, mobile-first review form) | `/reviews/submit` |
| Admin: moderation dashboard, stats, filters | `/admin/reviews` |
| Admin: QR code (PNG 1200/2400px, SVG), change QR destination | `/admin/qr` |
| Admin: printable A5 poster with the live QR code | `/admin/poster` |

## 1 · Create the database (≈5 min)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**.
   This creates the tables, row-level security policies, the safe `public_reviews` view, and a **private** `review-photos` storage bucket.
3. **Authentication → URL Configuration**: set *Site URL* to your production domain and add `https://YOUR-DOMAIN/auth/callback` to *Redirect URLs*.

## 2 · Configure environment

Copy `.env.example` to `.env.local` (and add the same values in your host's dashboard):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # server only — never expose
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
RATE_LIMIT_SALT=any-long-random-string
```

## 3 · Run / deploy

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Deploy on Vercel: import the folder/repo, add the env vars, deploy. Then point your domain at it.

## 4 · Make yourself an admin

Sign up on the website, then in the Supabase SQL Editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'owner@example.com');
```

The **Admin** shield appears in the navigation once you're signed in.

## 5 · Print the QR code

Go to `/admin/qr`. The code encodes `NEXT_PUBLIC_SITE_URL + /reviews/submit`, or a custom URL you save there.
It refuses to generate for `localhost`, private IPs, or plain `http`, so a printed code can never point at a dev machine.
If the domain changes, update it on that page, then re-download and reprint. `/admin/poster` prints the A5 table/counter poster.

## How the review system stays honest and secure

- Customers never need an account. Submissions go through `/api/reviews`, which validates on the server (zod), checks a honeypot and minimum fill time, rate-limits per visitor (3/hour, 8/day, salted IP hash), and sniffs photo magic bytes (JPG/PNG/WEBP, ≤5 MB).
- Photos go to a **private** bucket; the site serves short-lived signed URLs only for approved public reviews and to admins.
- Every review starts as `pending`. Only reviews that are **public + consented + approved** are visible, through the `public_reviews` view, which exposes no IP hash, user agent or admin notes. A database constraint makes it impossible to approve private feedback.
- Averages and totals come from real approved reviews only. With no reviews, the site shows an invitation to be the first.
- The "Thank you" confirmation appears only after the server confirms the database insert.
- All admin pages and admin APIs re-check `is_admin` on the server, and RLS blocks non-admins at the database level too.

## Orders

`/api/orders` recomputes every price from `lib/menu.ts` (client prices are ignored), saves the order with `payment_status = pay_at_counter`, and shows the customer an order number. **No payment is simulated.** Add a real payment provider (e.g. PayMongo for GCash/cards) before marking orders paid.

## Things to fill in (marked "EDIT ME")

- `lib/site-config.ts` — address, Google Maps query, phone, email, opening hours, Facebook / Instagram / TikTok URLs. No verified public details for the café were found online, so these are placeholders.
- `app/about/page.tsx` — the real founding story (one paragraph is an obvious placeholder).
- **Photos:** drop files into `public/photos/` named `hero`, `welcome`, `about-1`, `about-2`, `about-3` (`.jpg/.png/.webp`) and they appear automatically. For product photos, put them in `public/products/` and set `image: '/products/spanish-latte.jpg'` on the product in `lib/menu.ts`. Until then, branded drink illustrations tinted per flavour are shown.

## Menu notes / assumptions to confirm

- Prices are taken from the menu photos and your brief. The Non-Coffee section wasn't in the photos, so those items/prices come from your written brief.
- Food (snacks, rice meals, pasta, pastries, food add-ons) is included from the second menu photo.
- Take-out fees (₱20 food, ₱15 pastries) are applied **once per Take Away order** when that kind of item is present. Change this in `lib/pricing.ts` if they're charged per item.
- Refreshers, non-coffee and pastries had no printed descriptions; short neutral descriptions were written. Edit them in `lib/menu.ts`.
- To disambiguate duplicate names, the latte is "Salted Caramel Latte", the blended one "Salted Caramel Frappe", and the blended non-coffee one "Strawberry Matcha Cream".
