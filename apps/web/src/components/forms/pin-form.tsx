'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function PinForm({ onDone }: { onDone?: () => void }) {
  const { t } = useI18n();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="grid gap-3 sm:grid-cols-3 sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const pin = String(f.get('pin') ?? '');
        if (!/^\d{4,8}$/.test(pin)) return setMsg({ ok: false, text: t.pin.invalid });
        if (pin !== f.get('pin2')) return setMsg({ ok: false, text: t.pin.mismatch });
        const r = await api('/api/parent/pin', { body: { pin, password: f.get('password') } });
        if (r.ok) {
          setMsg({ ok: true, text: t.pin.saved });
          (e.target as HTMLFormElement).reset();
          onDone?.();
          window.location.reload();
        } else setMsg({ ok: false, text: r.status === 401 ? t.auth.invalid : t.app.error });
      }}
    >
      <div>
        <label htmlFor="pin" className="field-label">{t.pin.pin}</label>
        <input id="pin" name="pin" inputMode="numeric" autoComplete="off" type="password" className="input" required />
      </div>
      <div>
        <label htmlFor="pin2" className="field-label">{t.pin.confirm}</label>
        <input id="pin2" name="pin2" inputMode="numeric" autoComplete="off" type="password" className="input" required />
      </div>
      <div>
        <label htmlFor="pin-password" className="field-label">{t.pin.currentPassword}</label>
        <input id="pin-password" name="password" type="password" autoComplete="current-password" className="input" required />
      </div>
      <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary">{t.app.save}</button>
        <span role="status" className={msg?.ok ? 'font-semibold text-sage-dark' : 'font-semibold text-clay-dark'}>{msg?.text}</span>
      </div>
    </form>
  );
}
