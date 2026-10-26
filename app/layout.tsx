import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { CartDrawer } from '@/components/CartDrawer';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { siteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: siteUrl() ? new URL(siteUrl()) : undefined,
  title: { default: 'Brew & Shot Café — Simplicity in Every Sip', template: '%s · Brew & Shot Café' },
  description:
    'Expertly prepared coffee, creamy lattes, matcha, refreshers, blended creations, cocktails and comfort food. Dine in or take away at Brew & Shot Café.',
  openGraph: { title: 'Brew & Shot Café', description: 'Simplicity in Every Sip', images: ['/logo.png'], type: 'website' },
};

export const viewport: Viewport = { themeColor: '#3B2418', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Allura&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Poppins:wght@300;400;500;600&display=swap"
        />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream">
          Skip to content
        </a>
        <CartProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
