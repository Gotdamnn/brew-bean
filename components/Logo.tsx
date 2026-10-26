import Image from 'next/image';
import Link from 'next/link';

export function LogoBadge({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Brew & Shot Café logo"
      width={size}
      height={size}
      priority
      className={`rounded-full ${className}`}
    />
  );
}

export function LogoLockup({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Brew & Shot Café — home">
      <LogoBadge size={44} className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
      <span className="leading-none">
        <span className={`block font-display text-lg font-semibold tracking-wide ${light ? 'text-cream' : 'text-espresso'}`}>
          Brew &amp; Shot
        </span>
        <span className={`block text-[10px] uppercase tracking-[0.3em] ${light ? 'text-gold' : 'text-caramel'}`}>Café</span>
      </span>
    </Link>
  );
}
