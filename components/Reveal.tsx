'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, sub, center = true }: { eyebrow?: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <div className={`mb-12 ${center ? 'mx-auto max-w-2xl text-center' : ''}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-coffee/80">{sub}</p>}
    </div>
  );
}
