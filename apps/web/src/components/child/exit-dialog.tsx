'use client';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

/** Parent gate: leaving child mode needs the parent PIN (server-verified, rate-limited). */
export function GrownUpsButton() {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <button type="button" className="btn-secondary" onClick={() => { setErr(null); ref.current?.showModal(); }}>
        <span aria-hidden="true">🔒</span> {t.learn.grownUps}
      </button>
      <dialog ref={ref} aria-labelledby="gate-title" className="w-[min(92vw,26rem)] rounded-xl2 border border-sand bg-white p-0 shadow-soft backdrop:bg-ink/40">
        <form
          method="dialog"
          className="space-y-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const pin = String(new FormData(e.currentTarget).get('pin') ?? '');
            const r = await api('/api/child-mode/exit', { body: { pin } });
            if (r.ok) window.location.href = '/family';
            else setErr(r.status === 429 ? t.auth.rateLimited : t.pin.wrong);
          }}
        >
          <h2 id="gate-title" className="h2">{t.pin.enterTitle}</h2>
          <p>{t.pin.enterBody}</p>
          <div>
            <label htmlFor="gate-pin" className="field-label">{t.pin.pin}</label>
            <input id="gate-pin" name="pin" type="password" inputMode="numeric" autoComplete="off" required className="input text-2xl tracking-widest" />
          </div>
          <p role="alert" className="min-h-6 font-semibold text-clay-dark">{err}</p>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{t.pin.unlock}</button>
            <button type="button" className="btn-secondary" onClick={() => ref.current?.close()}>{t.app.cancel}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
