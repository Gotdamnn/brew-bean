'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function QrDestinationForm({ current, fallback }: { current: string; fallback: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(current);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async (value: string) => {
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewQrUrl: value }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error || 'Could not save' });
    setMsg({ ok: true, text: value ? 'Saved. The QR code now points to the new address.' : 'Reset to the default site URL.' });
    router.refresh();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(url.trim()); }} className="mt-5 space-y-3">
      <label htmlFor="qr-url" className="label">Custom review URL</label>
      <input id="qr-url" className="input" type="url" placeholder={fallback || 'https://your-domain.com/reviews/submit'} value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Save destination</button>
        {current && <button type="button" className="btn-outline" disabled={busy} onClick={() => { setUrl(''); save(''); }}>Reset to default</button>}
      </div>
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-700'}`}>{msg.text}</p>}
    </form>
  );
}
