'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { REVIEW_ITEM_OPTIONS } from '@/lib/menu';

/** Accessible, searchable dropdown of menu items (ARIA combobox pattern). */
export function ItemCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REVIEW_ITEM_OPTIONS.filter((o) => !q || o.value.toLowerCase().includes(q) || o.group.toLowerCase().includes(q)).slice(0, 60);
  }, [query]);

  const choose = (v: string) => {
    onChange(v);
    setQuery('');
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(options.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter' && open && options[active]) { e.preventDefault(); choose(options[active].value); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="relative">
      {value && !open ? (
        <div className="input flex items-center justify-between !py-2.5">
          <span>{value}</span>
          <span className="flex gap-1">
            <button type="button" className="rounded-full px-2 py-1 text-xs text-caramel hover:bg-beige" onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}>Change</button>
            <button type="button" className="rounded-full p-1 text-coffee/60 hover:bg-beige" onClick={() => onChange('')} aria-label="Clear selected item"><X size={16} /></button>
          </span>
        </div>
      ) : (
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-coffee/40" />
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && options[active] ? `${id}-opt-${active}` : undefined}
            className="input pl-11 pr-10"
            placeholder="Search our menu (e.g. Spanish Latte)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKey}
          />
          <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-coffee/40" />
        </div>
      )}
      {open && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-beige bg-white p-1 shadow-lift">
          {options.length === 0 && <li className="px-4 py-3 text-sm text-coffee/60">No matching items</li>}
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={value === o.value}
              onMouseDown={(e) => { e.preventDefault(); choose(o.value); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm ${i === active ? 'bg-cream' : ''}`}
            >
              <span>{o.value}</span>
              <span className="text-xs text-coffee/50">{o.group}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
