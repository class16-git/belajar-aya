'use client';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { fmt } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';

/** "I finished it" — no score, no streak; just a moment of recognition and a prompt to talk with a grown-up. */
export function FinishedButton({ bookId }: { bookId: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  return done ? (
    <p role="status" className="rounded-xl border-2 border-sage-dark bg-sage-light p-4 text-lg font-semibold">✓ {t.library.child.thanks}</p>
  ) : (
    <button type="button" className="btn-primary btn-xl" onClick={async () => { const r = await api('/api/library/finished', { body: { bookId } }); if (r.ok) setDone(true); }}>
      {t.library.child.finished}
    </button>
  );
}

/**
 * Parent gate before leaving Atlas. The server checks the PIN and returns the reviewed catalog URL; it opens in a new
 * tab without a referrer or opener, so the external site learns nothing about Atlas or the child.
 */
export function OpenWithGrownUp({ bookId, host }: { bookId: string; host: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <button type="button" className="btn-secondary btn-xl" onClick={() => { setErr(null); ref.current?.showModal(); }}>
        <span aria-hidden="true">🔒</span> {t.library.child.withGrownUp}
      </button>
      <dialog ref={ref} aria-labelledby="open-gate-title" className="w-[min(92vw,26rem)] rounded-xl2 border border-sand bg-white p-0 shadow-soft backdrop:bg-ink/40">
        <form
          method="dialog"
          className="space-y-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const pin = String(new FormData(form).get('pin') ?? '');
            const r = await api<{ url: string }>('/api/library/open', { body: { bookId, pin } });
            if (r.ok && r.data.url.startsWith('https://')) {
              ref.current?.close();
              form.reset();
              window.open(r.data.url, '_blank', 'noopener,noreferrer');
            } else setErr(r.status === 429 ? t.auth.rateLimited : r.status === 403 ? t.library.child.linksOff : t.library.child.wrongPin);
          }}
        >
          <h2 id="open-gate-title" className="h2">{t.pin.enterTitle}</h2>
          <p>{fmt(t.library.child.pinPrompt, { host })}</p>
          <label className="block">
            <span className="font-semibold">{t.library.child.pin}</span>
            <input name="pin" type="password" inputMode="numeric" autoComplete="off" pattern="\d{4,8}" required className="input mt-1" />
          </label>
          {err && <p role="alert" className="font-semibold text-clay-dark">{err}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">{t.library.child.open}</button>
            <button type="button" className="btn-ghost" onClick={() => ref.current?.close()}>{t.library.child.cancel}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
