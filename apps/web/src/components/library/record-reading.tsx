'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

type Desc = { en: string; id: string };

/** Structured reading observation: listening and decoding are separate; no free text is collected. */
export function RecordReading({ childId, bookId, listening, decoding, today }: { childId: string; bookId: string | null; listening: Desc[]; decoding: Desc[] | null; today: string }) {
  const { t, locale } = useI18n();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scale = (name: string, label: string, descs: Desc[]) => (
    <fieldset className="space-y-1">
      <legend className="font-semibold">{label}</legend>
      <label className="flex items-start gap-2"><input type="radio" name={name} value="" defaultChecked className="mt-1 h-5 w-5" /> <span>{t.library.record.notObserved}</span></label>
      {descs.map((d, i) => (
        <label key={i} className="flex items-start gap-2"><input type="radio" name={name} value={i} className="mt-1 h-5 w-5" /> <span><span className="font-semibold">{i}</span> — {d[locale]}</span></label>
      ))}
    </fieldset>
  );
  return (
    <form
      className="space-y-4"
      data-testid="record-reading"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const n = (k: string) => (f.get(k) === null || f.get(k) === '' ? null : Number(f.get(k)));
        setBusy(true);
        const r = await api('/api/parent/library/events', {
          body: { childId, bookId, kind: f.get('kind'), observedOn: f.get('observedOn'), parentAssisted: f.get('assisted') === 'on', listening: n('listening'), decoding: n('decoding'), enjoyment: n('enjoyment') },
        });
        setBusy(false);
        setMsg(r.ok ? t.library.record.saved : t.app.error);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-semibold">{t.library.record.kind}</span>
          <select name="kind" className="input mt-1" defaultValue="SHARED_READ">
            {(['SHARED_READ', 'INDEPENDENT_READ', 'RETELL', 'ACTIVITY'] as const).map((k) => <option key={k} value={k}>{t.library.kinds[k]}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="font-semibold">{t.library.record.date}</span>
          <input type="date" name="observedOn" required defaultValue={today} max={today} className="input mt-1" />
        </label>
      </div>
      {scale('listening', t.library.record.listening, listening)}
      {decoding ? scale('decoding', t.library.record.decoding, decoding) : <p className="text-sm muted">{t.library.record.decodingNA}</p>}
      <fieldset className="flex flex-wrap gap-4">
        <legend className="font-semibold">{t.library.record.enjoyment}</legend>
        {(['e0', 'e1', 'e2'] as const).map((k, i) => (
          <label key={k} className="flex items-center gap-2"><input type="radio" name="enjoyment" value={i} className="h-5 w-5" /> {t.library.record.enjoy[k]}</label>
        ))}
      </fieldset>
      <label className="flex items-center gap-2"><input type="checkbox" name="assisted" defaultChecked className="h-5 w-5" /> {t.library.record.assisted}</label>
      <p className="text-sm muted">{t.library.record.privacy}</p>
      <button type="submit" className="btn-primary" disabled={busy}>{t.library.record.save}</button>
      <p role="status" className="text-sm font-semibold">{msg}</p>
    </form>
  );
}
