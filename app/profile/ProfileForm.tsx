'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';

export function ProfileForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('saving');
    const sb = supabaseBrowser();
    const { data } = await sb.auth.getUser();
    if (!data.user) return setState('error');
    const { error } = await sb.from('profiles').update({ full_name: name.trim().slice(0, 80), phone: phone.trim().slice(0, 30) }).eq('id', data.user.id);
    setState(error ? 'error' : 'saved');
    if (!error) setTimeout(() => setState('idle'), 2000);
  };

  return (
    <form onSubmit={save} className="card h-fit space-y-4 p-6">
      <h2 className="text-xl font-semibold">My details</h2>
      <div><label htmlFor="pn" className="label">Name</label><input id="pn" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></div>
      <div><label htmlFor="pp" className="label">Contact number</label><input id="pp" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} /></div>
      <button className="btn-primary w-full" disabled={state === 'saving'}>
        {state === 'saving' ? <Loader2 size={16} className="animate-spin" /> : state === 'saved' ? <Check size={16} /> : null}
        {state === 'saved' ? 'Saved' : 'Save details'}
      </button>
      {state === 'error' && <p role="alert" className="text-sm text-red-700">Could not save. Please try again.</p>}
    </form>
  );
}
