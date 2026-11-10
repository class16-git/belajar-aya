'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { fmt } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';

interface Q { id: string; prompt: string; choices: string[] }
interface Result { id: string; correct: boolean; evidenceParagraph: number }

/**
 * Comprehension check on an Atlas-original passage. Answers are graded on the server; after checking, each
 * question shows "Yes!" or which paragraph to look at again — never the answer key, never a score comparison.
 */
export function Comprehension({ passageId, attemptId, questions }: { passageId: string; attemptId: string; questions: Q[] }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<{ results: Result[]; correct: number; total: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const done = !!results;
  return (
    <form
      className="space-y-6"
      data-testid="comprehension"
      onSubmit={async (e) => {
        e.preventDefault();
        if (Object.keys(answers).length < questions.length) return setErr(t.library.child.answerAll);
        setErr(null);
        const r = await api<{ results: Result[]; correct: number; total: number }>('/api/library/comprehension', { body: { passageId, attemptId, answers } });
        if (r.ok) setResults(r.data);
        else setErr(t.app.error);
      }}
    >
      {questions.map((q, qi) => {
        const res = results?.results.find((x) => x.id === q.id);
        return (
          <fieldset key={q.id} className="card space-y-3" data-question={q.id}>
            <legend className="float-left mb-1 w-full text-xl font-bold">{qi + 1}. {q.prompt}</legend>
            <div className="clear-both grid gap-2">
              {q.choices.map((c, i) => (
                <label key={i} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 text-lg ${answers[q.id] === i ? 'border-sky bg-sky-light' : 'border-sand bg-white'}`}>
                  <input type="radio" name={q.id} value={i} disabled={done} checked={answers[q.id] === i} onChange={() => { setErr(null); setAnswers((a) => ({ ...a, [q.id]: i })); }} className="h-5 w-5" />
                  {c}
                </label>
              ))}
            </div>
            {res && (
              <p role="status" className={`rounded-xl border-2 p-3 font-semibold ${res.correct ? 'border-sage-dark bg-sage-light' : 'border-clay bg-clay-light'}`}>
                {res.correct ? `✓ ${t.library.child.right}` : fmt(t.library.child.lookAgain, { n: res.evidenceParagraph + 1 })}
              </p>
            )}
          </fieldset>
        );
      })}
      {err && <p role="alert" className="font-semibold text-clay-dark">{err}</p>}
      {results ? (
        <div className="card space-y-3 text-center" role="status" data-testid="comprehension-result">
          <p className="text-2xl font-bold">{fmt(t.library.child.result, { correct: results.correct, total: results.total })}</p>
          <Link href="/learn/library" className="btn-primary btn-xl">{t.library.child.back}</Link>
        </div>
      ) : (
        <button type="submit" className="btn-primary btn-xl">{t.library.child.check}</button>
      )}
    </form>
  );
}
