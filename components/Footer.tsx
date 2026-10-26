import Link from 'next/link';
import { Facebook, Instagram, MapPin, Clock, Star } from 'lucide-react';
import { LogoBadge } from './Logo';
import { SITE } from '@/lib/site-config';

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05 5.68 5.68 0 1 0 5.68 5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48z" />
    </svg>
  );
}

export const SOCIALS = [
  { key: 'facebook', label: 'Facebook', href: SITE.socials.facebook, Icon: Facebook },
  { key: 'instagram', label: 'Instagram', href: SITE.socials.instagram, Icon: Instagram },
  { key: 'tiktok', label: 'TikTok', href: SITE.socials.tiktok, Icon: TikTokIcon },
] as const;

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {SOCIALS.map(({ key, label, href, Icon }) =>
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-full border border-current/20 transition hover:-translate-y-0.5 hover:bg-gold hover:text-espresso">
            <Icon size={18} />
          </a>
        ) : (
          <span key={key} title={`${label} link not set yet`} aria-label={`${label} (coming soon)`}
            className="grid h-10 w-10 place-items-center rounded-full border border-current/20 opacity-50">
            <Icon size={18} />
          </span>
        ),
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="no-print bg-espresso text-cream">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <LogoBadge size={56} className="ring-2 ring-gold/40" />
            <div>
              <p className="font-display text-xl text-cream">Brew &amp; Shot Café</p>
              <p className="font-script text-2xl text-gold">{SITE.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70">
            Coffee, matcha, blended creations, cocktails and comfort food. {SITE.serviceModes}.
          </p>
          <SocialLinks className="mt-6 text-cream" />
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg text-gold">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-cream/75">
            {[['/', 'Home'], ['/about', 'About Us'], ['/specialties', 'Our Specialties'], ['/contact', 'Contact Us'], ['/profile', 'My Account']].map(([h, l]) => (
              <li key={h}><Link className="transition hover:text-gold" href={h}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg text-gold">Menu</h3>
          <ul className="space-y-2.5 text-sm text-cream/75">
            {[['coffee', 'Coffee'], ['blended-coffee', 'Blended Coffee'], ['non-coffee', 'Matcha & Non-Coffee'], ['refreshers', 'Refreshers'], ['cocktails', 'Cocktails & Beers'], ['rice-meals', 'Food & Pastries']].map(([c, l]) => (
              <li key={c}><Link className="transition hover:text-gold" href={`/menu?category=${c}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg text-gold">Visit &amp; Review</h3>
          <ul className="space-y-3 text-sm text-cream/75">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" />{SITE.address}</li>
            {SITE.hours.map((h) => (
              <li key={h.days} className="flex gap-2.5"><Clock size={16} className="mt-0.5 shrink-0 text-gold" />{h.days}: {h.time}</li>
            ))}
          </ul>
          <Link href="/reviews/submit" className="btn-gold mt-6 !py-2.5">
            <Star size={16} /> Write a Review
          </Link>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-cream/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Brew &amp; Shot Café. All rights reserved.</p>
          <p>Est. {SITE.established} · {SITE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
