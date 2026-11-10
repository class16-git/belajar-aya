'use client';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/client';

/** A4 / Letter print toggle. Injects a matching @page size rule. */
export function PrintControls() {
  const { t } = useI18n();
  const [paper, setPaper] = useState<'A4' | 'letter'>('A4');
  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      <style>{`@page { size: ${paper}; margin: 14mm; }`}</style>
      <fieldset className="flex items-center gap-2">
        <legend className="sr-only">{t.cards.paper}</legend>
        <span className="font-semibold">{t.cards.paper}:</span>
        {(['A4', 'letter'] as const).map((p) => (
          <label key={p} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-sand bg-white px-3 has-[:checked]:border-bark">
            <input type="radio" name="paper" value={p} checked={paper === p} onChange={() => setPaper(p)} className="h-4 w-4" />
            {p === 'A4' ? t.cards.a4 : t.cards.letter}
          </label>
        ))}
      </fieldset>
      <button type="button" className="btn-primary" onClick={() => window.print()} data-paper={paper}>🖨 {t.cards.print}</button>
    </div>
  );
}
