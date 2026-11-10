'use client';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

const INITIALS = /^\p{L}[\p{L} .'’-]{0,39}$/u;

/** Approve / reject one expansion item. The server re-checks everything (version, state, auth, origin). */
export function ReviewDecisionForm({ itemId, itemVersion, title }: { itemId: string; itemVersion: string; title: string }) {
  const { t } = useI18n();
  const F = t.review.form;
  const router = useRouter();
  const uid = useId();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'educator'>('parent');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const submit = async (decision: 'approve' | 'reject') => {
    if (!INITIALS.test(name.trim())) return setMsg({ kind: 'error', text: F.needInitials });
    if (decision === 'reject' && note.trim().length < 3) return setMsg({ kind: 'error', text: F.needReason });
    setBusy(true);
    const r = await api('/api/review/decisions', { body: { itemId, itemVersion, decision, reviewerName: name.trim(), reviewerRole: role, note: note.trim() } });
    setBusy(false);
    if (r.ok) {
      setMsg({ kind: 'ok', text: F.saved });
      router.refresh();
    } else {
      setMsg({ kind: 'error', text: r.status === 409 && r.data.error === 'VERSION_MISMATCH' ? F.versionChanged : r.status === 429 ? F.rateLimited : F.failed });
    }
  };

  return (
    <form className="mt-3 space-y-3 rounded-xl border border-sand bg-white p-3" onSubmit={(ev) => ev.preventDefault()} data-testid="review-form" aria-label={`${F.legend}: ${title}`}>
      <p className="font-bold">{F.legend}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="field-label">{F.initials}</label>
          <input id={`${uid}-name`} className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off" aria-describedby={`${uid}-name-hint`} />
          <p id={`${uid}-name-hint`} className="field-hint">{F.initialsHint}</p>
        </div>
        <fieldset>
          <legend className="field-label">{F.role}</legend>
          <div className="flex flex-wrap gap-2">
            {(['parent', 'educator'] as const).map((r) => (
              <label key={r} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-sand bg-white px-3 has-[:checked]:border-bark">
                <input type="radio" name={`${uid}-role`} value={r} checked={role === r} onChange={() => setRole(r)} className="h-4 w-4" />
                {r === 'parent' ? F.role_parent : F.role_educator}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label htmlFor={`${uid}-note`} className="field-label">{F.note}</label>
        <textarea id={`${uid}-note`} className="input min-h-20" value={note} onChange={(e) => setNote(e.target.value)} maxLength={400} aria-describedby={`${uid}-note-hint`} />
        <p id={`${uid}-note-hint`} className="field-hint">{F.noteHint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" disabled={busy} onClick={() => void submit('approve')}>✓ {F.approve}</button>
        <button type="button" className="btn-danger" disabled={busy} onClick={() => void submit('reject')}>✕ {F.reject}</button>
      </div>
      {msg && <p key={msg.kind} role={msg.kind === 'error' ? 'alert' : 'status'} className={`text-sm font-semibold ${msg.kind === 'error' ? 'text-clay-dark' : 'text-sage-dark'}`}>{msg.text}</p>}
    </form>
  );
}
