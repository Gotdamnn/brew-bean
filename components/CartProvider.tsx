'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { lineKey, MAX_QTY, priceLine, summarize, type CartLine } from '@/lib/pricing';

interface CartCtx {
  lines: CartLine[];
  ready: boolean;
  add: (l: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  summary: ReturnType<typeof summarize>;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  toast: string | null;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = 'bns-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        // drop anything that no longer exists on the menu
        setLines(parsed.filter((l) => priceLine(l)));
      }
    } catch {
      /* storage unavailable — cart still works in memory */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const add = useCallback((l: CartLine) => {
    if (!priceLine(l)) return;
    const k = lineKey(l);
    setLines((prev) => {
      const i = prev.findIndex((x) => lineKey(x) === k);
      if (i === -1) return [...prev, l];
      const next = [...prev];
      next[i] = { ...next[i], quantity: Math.min(MAX_QTY, next[i].quantity + l.quantity) };
      return next;
    });
    const name = priceLine(l)!.product.name;
    setToast(`${l.quantity} × ${name} added to your cart`);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((x) => (lineKey(x) === key ? { ...x, quantity: Math.max(0, Math.min(MAX_QTY, qty)) } : x))
        .filter((x) => x.quantity > 0),
    );
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((x) => lineKey(x) !== key)), []);
  const clear = useCallback(() => setLines([]), []);
  const summary = useMemo(() => summarize(lines), [lines]);

  return (
    <Ctx.Provider value={{ lines, ready, add, setQty, remove, clear, summary, drawerOpen, setDrawerOpen, toast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
