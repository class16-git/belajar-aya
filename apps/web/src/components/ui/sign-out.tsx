'use client';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function SignOutButton() {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={async () => {
        await api('/api/auth/signout', { method: 'POST' });
        window.location.href = '/';
      }}
    >
      {t.auth.signOut}
    </button>
  );
}
