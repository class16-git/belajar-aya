'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { fmt } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';

type State = 'ON_SHELF' | 'HIDDEN' | null;

/** Parent puts a book on one child's shelf, hides it, or clears the choice. */
export function ShelfControls({ childId, childName, bookId, initial }: { childId: string; childName: string; bookId: string; initial: State }) {
  const { t } = useI18n();
  const [state, setState] = useState<State>(initial);
  const [busy, setBusy] = useState(false);
  const set = async (s: State) => {
    setBusy(true);
    const r = await api('/api/parent/library/shelf', { body: { childId, bookId, state: s } });
    setBusy(false);
    if (r.ok) setState(s);
  };
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="shelf-controls" data-state={state ?? 'NONE'}>
      <p className="w-full text-sm font-semibold" aria-live="polite">
        {state === 'ON_SHELF' ? `✓ ${fmt(t.library.onShelf, { name: childName })}` : state === 'HIDDEN' ? fmt(t.library.hiddenFor, { name: childName }) : ' '}
      </p>
      {state === 'ON_SHELF' ? (
        <button type="button" className="btn-secondary" disabled={busy} onClick={() => void set(null)}>{t.library.removeFromShelf}</button>
      ) : (
        <button type="button" className="btn-primary" disabled={busy} onClick={() => void set('ON_SHELF')}>{fmt(t.library.addToShelf, { name: childName })}</button>
      )}
      {state === 'HIDDEN' ? (
        <button type="button" className="btn-ghost" disabled={busy} onClick={() => void set(null)}>{t.library.unhide}</button>
      ) : (
        <button type="button" className="btn-ghost" disabled={busy} onClick={() => void set('HIDDEN')}>{fmt(t.library.hide, { name: childName })}</button>
      )}
    </div>
  );
}
