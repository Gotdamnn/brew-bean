'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu as MenuIcon, ShoppingBag, User, X, ShieldCheck } from 'lucide-react';
import { LogoLockup } from './Logo';
import { useCart } from './CartProvider';
import { useAuthUser } from './useAuthUser';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About Us' },
  { href: '/specialties', label: 'Our Specialties' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact Us' },
];

export function Navbar() {
  const path = usePathname();
  const { summary, setDrawerOpen, ready } = useCart();
  const auth = useAuthUser();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  const count = ready ? summary.count : 0;

  return (
    <header
      className={`no-print sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/90 shadow-soft backdrop-blur-md' : 'bg-cream'
      }`}
    >
      <nav className="container-x flex h-[72px] items-center justify-between gap-4" aria-label="Main">
        <LogoLockup />

        <ul className="hidden items-center gap-1 xl:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`relative rounded-full px-3.5 py-2 text-sm transition ${
                  active(l.href) ? 'text-espresso font-medium' : 'text-coffee/75 hover:text-espresso'
                }`}
              >
                {l.label}
                {active(l.href) && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gold" />}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {auth.isAdmin && (
            <Link href="/admin/reviews" className="hidden rounded-full p-2.5 text-coffee hover:bg-beige sm:inline-flex" title="Admin dashboard">
              <ShieldCheck size={20} />
              <span className="sr-only">Admin dashboard</span>
            </Link>
          )}
          <Link
            href={auth.email ? '/profile' : '/signin'}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-coffee hover:bg-beige sm:inline-flex"
          >
            <User size={18} />
            <span className="hidden lg:inline">{auth.email ? auth.name?.split(' ')[0] || 'Profile' : 'Sign In'}</span>
          </Link>
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative inline-flex rounded-full p-2.5 text-coffee hover:bg-beige"
            aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-caramel px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
          <Link href="/menu" className="btn-primary hidden !px-5 !py-2.5 md:inline-flex">
            Order Now
          </Link>
          <button
            className="inline-flex rounded-full p-2.5 text-espresso hover:bg-beige xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto bg-cream transition-all duration-300 xl:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <ul className="container-x flex flex-col gap-1 py-6">
          {LINKS.map((l, i) => (
            <li key={l.href} className={open ? 'animate-rise' : ''} style={{ animationDelay: `${i * 40}ms` }}>
              <Link
                href={l.href}
                className={`block rounded-2xl px-4 py-4 font-display text-2xl ${
                  active(l.href) ? 'bg-white text-espresso shadow-soft' : 'text-coffee'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-4 grid grid-cols-2 gap-3">
            <Link href={auth.email ? '/profile' : '/signin'} className="btn-outline">
              <User size={18} /> {auth.email ? 'My Profile' : 'Sign In'}
            </Link>
            <Link href="/menu" className="btn-primary">
              Order Now
            </Link>
          </li>
          {auth.isAdmin && (
            <li className="mt-2">
              <Link href="/admin/reviews" className="btn-dark w-full">
                <ShieldCheck size={18} /> Admin Dashboard
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
