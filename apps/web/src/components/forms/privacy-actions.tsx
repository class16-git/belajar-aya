'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function RevokeConsent() {
  const { t } = useI18n();
  return (
    <button type="button" className="btn-secondary" onClick={async () => {
      if (!window.confirm(t.privacy.revokeBody)) return;
      await api('/api/parent/consent', { method: 'DELETE' });
      window.location.href = '/consent';
    }}>{t.privacy.revoke}</button>
  );
}

export function DeleteFamily() {
  const { t } = useI18n();
  const [err, setErr] = useState<string | null>(null);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      if (f.get('confirm') !== 'DELETE') return setErr(t.privacy.deleteWrong);
      const r = await api('/api/parent/family', { method: 'DELETE', body: { confirm: 'DELETE', password: f.get('password') } });
      if (r.ok) window.location.href = '/';
      else setErr(r.status === 401 ? t.auth.invalid : t.privacy.deleteWrong);
    }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="del-confirm" className="field-label">{t.privacy.deleteConfirmLabel}</label>
          <input id="del-confirm" name="confirm" autoComplete="off" className="input" required />
        </div>
        <div>
          <label htmlFor="del-password" className="field-label">{t.auth.password}</label>
          <input id="del-password" name="password" type="password" autoComplete="current-password" className="input" required />
        </div>
      </div>
      <p role="alert" className="min-h-6 font-semibold text-clay-dark">{err}</p>
      <button type="submit" className="btn-danger">{t.privacy.deleteButton}</button>
    </form>
  );
}
