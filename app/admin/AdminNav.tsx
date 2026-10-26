'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, QrCode, Printer } from 'lucide-react';

const TABS = [
  { href: '/admin/reviews', label: 'Reviews', Icon: MessageSquare },
  { href: '/admin/qr', label: 'QR Code', Icon: QrCode },
  { href: '/admin/poster', label: 'Poster', Icon: Printer },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 rounded-full bg-cream p-1">
      {TABS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={`chip ${path.startsWith(href) ? 'bg-espresso text-cream' : 'text-coffee hover:bg-beige'}`}>
          <Icon size={15} /> {label}
        </Link>
      ))}
    </nav>
  );
}
