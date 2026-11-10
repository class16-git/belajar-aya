'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function StartLearningButton({ childId, disabled }: { childId: string; disabled?: boolean }) {
  const { t } = useI18n();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        className="btn-primary"
        disabled={disabled}
        onClick={async () => {
          const r = await api('/api/parent/child-mode', { body: { childId } });
          if (r.ok) window.location.href = '/learn';
          else setErr(r.data.error === 'PIN_REQUIRED' ? t.family.pinNeeded : t.app.error);
        }}
      >
        {t.family.startLearning}
      </button>
      {err && <p role="alert" className="mt-2 text-sm font-semibold text-clay-dark">{err}</p>}
    </div>
  );
}
