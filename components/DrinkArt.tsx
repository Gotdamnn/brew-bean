import type { CategoryId, VariantId } from '@/lib/menu';

/**
 * Hand-drawn style product illustrations, tinted per drink. Used whenever a product
 * has no photo yet (set `image` on a product in lib/menu.ts to use a real photo).
 */
type Kind = 'hot' | 'iced' | 'blended' | 'cocktail' | 'beer' | 'plate' | 'pastry';

export function artKind(category: CategoryId, variant?: VariantId): Kind {
  if (category === 'blended-coffee' || category === 'blended-non-coffee') return 'blended';
  if (category === 'cocktails') return 'cocktail';
  if (category === 'beers') return 'beer';
  if (category === 'pastries') return 'pastry';
  if (['snacks', 'rice-meals', 'pasta'].includes(category)) return 'plate';
  if (category === 'refreshers') return 'iced';
  return variant === 'hot' ? 'hot' : 'iced';
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function DrinkArt({ kind, tone, uid, className = '' }: { kind: Kind; tone: string; uid: string; className?: string }) {
  const dark = shade(tone, -38);
  const light = shade(tone, 40);
  const g = `g-${uid}`;
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${g}-bg`} cx=".5" cy=".55" r=".55">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".9" />
          <stop offset="1" stopColor="#EFE2D2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="108" r="86" fill={`url(#${g}-bg)`} />
      <ellipse cx="100" cy="178" rx="58" ry="7" fill="#3B2418" opacity=".12" />

      {kind === 'hot' && (
        <g>
          <g className="origin-bottom animate-steam" style={{ animationDelay: '0s' }}>
            <path d="M84 62c-6-8 6-12 0-22" stroke="#A47148" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".5" />
          </g>
          <g className="origin-bottom animate-steam" style={{ animationDelay: '.9s' }}>
            <path d="M104 58c-6-8 6-12 0-22" stroke="#A47148" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".5" />
          </g>
          <ellipse cx="100" cy="166" rx="62" ry="11" fill="#FFFFFF" stroke="#EFE2D2" strokeWidth="2" />
          <path d="M52 92h96l-10 62a12 12 0 0 1-12 10H74a12 12 0 0 1-12-10z" fill="#FFF9F1" stroke="#3B2418" strokeWidth="3" />
          <path d="M148 104c18 0 20 30 0 32" stroke="#3B2418" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="100" cy="94" rx="47" ry="9" fill={`url(#${g})`} />
          <path d="M100 88c-8 0-12 4-8 7 3 2 5 2 8 6 3-4 5-4 8-6 4-3 0-7-8-7z" fill="#FFF9F1" opacity=".9" />
          <rect x="84" y="122" width="32" height="16" rx="8" fill="#3B2418" />
          <text x="100" y="134" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="11" fill="#C5A46D">B&amp;S</text>
        </g>
      )}

      {kind === 'iced' && (
        <g>
          <path d="M112 22l-6 52" stroke="#3B2418" strokeWidth="6" strokeLinecap="round" />
          <path d="M60 60h80l-9 106a8 8 0 0 1-8 7H77a8 8 0 0 1-8-7z" fill="#FFFFFF" fillOpacity=".55" stroke="#3B2418" strokeWidth="3" />
          <path d="M65 86h70l-7 80a6 6 0 0 1-6 5H78a6 6 0 0 1-6-5z" fill={`url(#${g})`} />
          <path d="M65 86h70l-1 12H66z" fill={light} opacity=".75" />
          <rect x="74" y="92" width="18" height="16" rx="3" fill="#FFFFFF" opacity=".55" transform="rotate(-12 83 100)" />
          <rect x="104" y="100" width="18" height="16" rx="3" fill="#FFFFFF" opacity=".45" transform="rotate(10 113 108)" />
          <rect x="56" y="54" width="88" height="10" rx="5" fill="#3B2418" />
          <circle cx="100" cy="138" r="15" fill="#3B2418" />
          <text x="100" y="142" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="11" fill="#C5A46D">B&amp;S</text>
        </g>
      )}

      {kind === 'blended' && (
        <g>
          <path d="M108 8l-8 56" stroke="#3B2418" strokeWidth="7" strokeLinecap="round" />
          <path d="M62 52c0-20 76-20 76 0z" fill="#FFFFFF" stroke="#3B2418" strokeWidth="3" />
          <path d="M70 46c8-14 52-14 60 0" fill={light} opacity=".7" />
          <path d="M74 40c4-3 8 3 12 0s8 3 12 0 8 3 12 0 8 3 12 0" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="56" y="52" width="88" height="10" rx="5" fill="#3B2418" />
          <path d="M60 62h80l-9 104a8 8 0 0 1-8 7H77a8 8 0 0 1-8-7z" fill={`url(#${g})`} stroke="#3B2418" strokeWidth="3" />
          <path d="M70 80c10 6 50 6 60 0" stroke="#FFFFFF" strokeWidth="3" opacity=".35" fill="none" />
          <circle cx="100" cy="128" r="15" fill="#3B2418" />
          <text x="100" y="132" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="11" fill="#C5A46D">B&amp;S</text>
        </g>
      )}

      {kind === 'cocktail' && (
        <g>
          <path d="M58 58h84l-30 50v44h22v8H66v-8h22v-44z" fill="#FFFFFF" fillOpacity=".5" stroke="#3B2418" strokeWidth="3" strokeLinejoin="round" />
          <path d="M66 66h68l-25 42h-18z" fill={`url(#${g})`} />
          <circle cx="132" cy="58" r="14" fill="#C5A46D" stroke="#3B2418" strokeWidth="3" />
          <path d="M132 46v24M120 58h24" stroke="#3B2418" strokeWidth="2" opacity=".4" />
          <path d="M84 30l20 48" stroke="#3B2418" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {kind === 'beer' && (
        <g>
          <path d="M88 24h24v28c0 8 14 14 14 30v80a8 8 0 0 1-8 8H82a8 8 0 0 1-8-8V82c0-16 14-22 14-30z" fill={`url(#${g})`} stroke="#3B2418" strokeWidth="3" />
          <rect x="86" y="18" width="28" height="10" rx="3" fill="#C5A46D" stroke="#3B2418" strokeWidth="2.5" />
          <rect x="74" y="104" width="52" height="40" rx="6" fill="#FFF9F1" stroke="#3B2418" strokeWidth="2.5" />
          <text x="100" y="128" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="12" fontWeight="700" fill="#3B2418">IMPORTED</text>
        </g>
      )}

      {kind === 'plate' && (
        <g>
          <ellipse cx="100" cy="130" rx="74" ry="34" fill="#FFFFFF" stroke="#3B2418" strokeWidth="3" />
          <ellipse cx="100" cy="126" rx="52" ry="22" fill="#FFF9F1" stroke="#EFE2D2" strokeWidth="2" />
          <path d="M62 122c8-26 68-26 76 0-10 14-66 14-76 0z" fill={`url(#${g})`} stroke="#3B2418" strokeWidth="2.5" />
          <circle cx="84" cy="114" r="5" fill="#FFF9F1" opacity=".7" />
          <circle cx="112" cy="110" r="4" fill="#FFF9F1" opacity=".6" />
          <path d="M150 76l-10 34M160 80l-12 32" stroke="#A47148" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {kind === 'pastry' && (
        <g>
          <ellipse cx="100" cy="140" rx="70" ry="22" fill="#FFFFFF" stroke="#3B2418" strokeWidth="3" />
          <path d="M58 132c0-40 84-40 84 0z" fill={`url(#${g})`} stroke="#3B2418" strokeWidth="3" />
          <path d="M70 118c10-14 50-14 60 0" stroke="#FFF9F1" strokeWidth="3" opacity=".6" fill="none" strokeLinecap="round" />
          <path d="M80 104l6-6M100 98l0-8M118 104l-6-6" stroke="#3B2418" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
