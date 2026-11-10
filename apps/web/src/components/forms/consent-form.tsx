'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function ConsentForm({ version }: { version: string }) {
  const { t } = useI18n();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await api('/api/parent/consent', { body: { agree: true, version } });
        if (r.ok) window.location.href = '/family';
        else setError(t.app.error);
      }}
    >
      <label className="flex items-start gap-3 rounded-xl border-2 border-sand bg-linen p-4">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#46613F]" />
        <span>{t.consent.checkbox}</span>
      </label>
      <div role="alert" className="font-semibold text-clay-dark">{error}</div>
      <button type="submit" className="btn-primary" disabled={!checked}>{t.consent.agree}</button>
    </form>
  );
}
