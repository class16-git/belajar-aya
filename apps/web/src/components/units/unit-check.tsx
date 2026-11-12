'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

interface Item { id: string; prompt: string; choices: string[] }
interface Result { id: string; correct: boolean; explanation: string }
interface Graded { results: Result[]; correct: number; total: number; hints: { code: string; text: string }[] }

/**
 * A child's check on a learning unit. Choices arrive in display order only; the server grades by display position.
 * Explanations and remediation hints arrive only after answering. Native radios: arrow keys move within a question,
 * Tab moves between questions (ATL-13). No score is shown as pressure.
 */
export function UnitCheck({ unitId, attemptId, items }: { unitId: string; attemptId: string; items: Item[] }) {
  const { t } = useI18n();
  const T = t.unitChild;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [graded, setGraded] = useState<Graded | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const done = !!graded;
  return (
    <form
      className="space-y-5"
      data-testid="unit-check"
      aria-labelledby="unit-check-h"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || done) return;
        if (Object.keys(answers).length < items.length) return setErr(T.answerAll);
        setErr(null);
        setBusy(true);
        const r = await api<Graded>(`/api/units/${unitId}/check`, { body: { attemptId, answers } });
        setBusy(false);
        if (r.ok) setGraded(r.data);
        else setErr(T.error);
      }}
    >
      <div>
        <h2 id="unit-check-h" className="text-2xl font-bold">{T.check}</h2>
        <p className="mt-1 text-lg">{T.checkIntro}</p>
      </div>
      {items.map((q, qi) => {
        const res = graded?.results.find((x) => x.id === q.id);
        return (
          <fieldset key={q.id} className="card space-y-3" data-item={q.id}>
            <legend className="float-left mb-1 w-full text-xl font-bold">{qi + 1}. {q.prompt}</legend>
            <div className="clear-both grid gap-2">
              {q.choices.map((c, i) => (
                <label key={i} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 text-lg focus-within:outline focus-within:outline-[3px] focus-within:outline-focus ${answers[q.id] === i ? 'border-sky bg-sky-light' : 'border-sand bg-white'}`}>
                  <input type="radio" name={q.id} value={i} disabled={done} checked={answers[q.id] === i} onChange={() => { setErr(null); setAnswers((a) => ({ ...a, [q.id]: i })); }} className="h-6 w-6 shrink-0" />
                  <span className="min-w-0 break-words">{c}</span>
                </label>
              ))}
            </div>
            {res && (
              <div role="status" className={`rounded-xl border-2 p-3 ${res.correct ? 'border-sage-dark bg-sage-light' : 'border-clay bg-clay-light'}`} data-testid="item-feedback">
                <p className="font-semibold">{res.correct ? `✓ ${T.right}` : T.notYet}</p>
                <p className="mt-1">{res.explanation}</p>
              </div>
            )}
          </fieldset>
        );
      })}
      {err && <p role="alert" className="font-semibold text-clay-dark">{err}</p>}
      {graded ? (
        <div className="card space-y-3 text-center" role="status" data-testid="unit-result">
          <p className="text-2xl font-bold">{T.done}</p>
          {graded.hints.length > 0 && (
            <div className="rounded-xl bg-linen p-3 text-left" data-testid="unit-hints">
              <p className="font-semibold">{T.tryIdea}</p>
              <ul className="mt-1 list-disc pl-6">{graded.hints.map((h) => <li key={h.code}>{h.text}</li>)}</ul>
            </div>
          )}
          <Link href="/learn" className="btn-primary btn-xl">{T.back}</Link>
        </div>
      ) : (
        <button type="submit" className="btn-primary btn-xl" disabled={busy}>{T.submit}</button>
      )}
    </form>
  );
}
