import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { SITE } from '@/lib/site-config';
import { SocialLinks } from '@/components/Footer';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  const q = SITE.mapsEmbedQuery.trim();
  return (
    <>
      <section className="bg-espresso py-20 text-center text-cream">
        <div className="container-x">
          <p className="eyebrow !text-gold">We&apos;d love to hear from you</p>
          <h1 className="mt-3 text-5xl font-semibold text-cream sm:text-6xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">Questions, event bookings, bulk orders or just saying hi — drop us a message.</p>
        </div>
      </section>

      <section className="section grain">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <div className="card space-y-5 p-7">
              {[
                { Icon: MapPin, t: 'Visit us', d: SITE.address },
                { Icon: Phone, t: 'Call', d: SITE.phone },
                { Icon: Mail, t: 'Email', d: SITE.email },
              ].map(({ Icon, t, d }) => (
                <div key={t} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-beige text-coffee"><Icon size={20} /></span>
                  <div><p className="text-sm font-semibold">{t}</p><p className="text-coffee/80">{d}</p></div>
                </div>
              ))}
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-beige text-coffee"><Clock size={20} /></span>
                <div>
                  <p className="text-sm font-semibold">Opening hours</p>
                  {SITE.hours.map((h) => <p key={h.days} className="text-coffee/80">{h.days}: {h.time}</p>)}
                </div>
              </div>
              <div className="border-t border-beige pt-5">
                <p className="mb-3 text-sm font-semibold">Follow Brew &amp; Shot</p>
                <SocialLinks className="text-coffee" />
              </div>
            </div>
            <div className="card overflow-hidden">
              {q ? (
                <iframe
                  title="Brew & Shot Café on Google Maps"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`}
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="grid h-72 place-items-center bg-beige/50 p-6 text-center text-sm text-coffee/70">
                  <div><MapPin className="mx-auto text-caramel" /><p className="mt-2">Map appears here once the café address is set in <code>lib/site-config.ts</code>.</p></div>
                </div>
              )}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
