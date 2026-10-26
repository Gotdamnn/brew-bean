/**
 * Café details. Everything marked EDIT ME is a placeholder — no verified public
 * address, hours or social links were found for Brew & Shot Café, so replace these
 * with the real values before launch. Nothing here is invented as fact.
 */
export const SITE = {
  name: 'Brew & Shot Café',
  shortName: 'B&S',
  tagline: 'Simplicity in Every Sip',
  established: '2024', // from the official logo ("Est. 2024")
  serviceModes: 'Dine In or Take Away',

  // EDIT ME ↓
  address: 'Street address, Barangay, City, Province', // EDIT ME
  mapsEmbedQuery: '', // EDIT ME — e.g. "Brew & Shot Cafe, Quezon City". Leave empty to hide the live map.
  phone: '+63 9XX XXX XXXX', // EDIT ME
  email: 'hello@your-domain.com', // EDIT ME
  hours: [
    { days: 'Monday – Friday', time: 'EDIT ME' },
    { days: 'Saturday – Sunday', time: 'EDIT ME' },
  ],
  socials: {
    facebook: '', // EDIT ME — full URL
    instagram: '', // EDIT ME — full URL
    tiktok: '', // EDIT ME — full URL
  },
};

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || '';
  return raw.replace(/\/+$/, '');
}

/** True when a URL can't be reached by customers' phones (localhost, LAN, preview tunnels). */
export function isNonPublicUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const h = u.hostname;
    return (
      u.protocol !== 'https:' ||
      h === 'localhost' ||
      h.endsWith('.localhost') ||
      h.endsWith('.local') ||
      /^127\./.test(h) ||
      /^10\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      h === '0.0.0.0' ||
      h === '[::1]'
    );
  } catch {
    return true;
  }
}
