'use client';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function AckTransition({ childId }: { childId: string }) {
  const { t } = useI18n();
  return (
    <button type="button" className="btn-secondary" onClick={async () => {
      await api(`/api/parent/children/${childId}/acknowledge-transition`, { method: 'POST' });
      window.location.reload();
    }}>{t.dashboard.transitionAck}</button>
  );
}
