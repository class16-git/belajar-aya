'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function StartLesson({ lessonId, primary }: { lessonId: string; primary: boolean }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={busy}
        className={`${primary ? 'btn-primary' : 'btn-secondary'} btn-xl w-full`}
        onClick={async () => {
          setBusy(true);
          const r = await api<{ sessionId: string }>('/api/learn/session', { body: { lessonId } });
          if (r.ok) window.location.href = `/learn/session/${r.data.sessionId}`;
          else {
            setBusy(false);
            setErr(true);
          }
        }}
      >
        {t.learn.start}
      </button>
      {err && <p role="alert" className="mt-2 text-base font-semibold text-clay-dark">{t.app.error}</p>}
    </>
  );
}
