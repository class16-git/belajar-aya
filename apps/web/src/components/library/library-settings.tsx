'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function ExternalLinksToggle({ initial }: { initial: boolean }) {
  const { t } = useI18n();
  const [on, setOn] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="external-links-toggle">
      <label className="flex items-center gap-2 font-semibold">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={on}
          onChange={async (e) => {
            const v = e.currentTarget.checked;
            const r = await api('/api/parent/library/settings', { body: { externalLinks: v } });
            if (r.ok) {
              setOn(v);
              setMsg(t.library.settings.saved);
            }
          }}
        />
        {t.library.settings.allow}
      </label>
      <span className="chip border-sand bg-white text-bark">{on ? t.library.settings.on : t.library.settings.off}</span>
      <span role="status" className="text-sm muted">{msg}</span>
    </div>
  );
}

export function DeleteHistory({ childId, label, confirmText }: { childId: string; label: string; confirmText: string }) {
  const { t } = useI18n();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="btn-secondary"
        onClick={async () => {
          if (!window.confirm(confirmText)) return;
          const r = await api('/api/parent/library/events', { method: 'DELETE', body: { childId, eventId: null } });
          if (r.ok) {
            setMsg(t.library.history.deleted);
            window.location.reload();
          }
        }}
      >
        {label}
      </button>
      <span role="status" className="text-sm">{msg}</span>
    </div>
  );
}
