'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityPayload } from '@/lib/server/learning';
import { api } from '@/lib/api';
import { fmt } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';
import { Choices, Keypad, NumberBond, ScatteredDots } from './models';
import { TenFrame } from './ten-frame';

type Phase = 'loading' | 'intro' | 'answering' | 'wrong' | 'correct' | 'solution' | 'done' | 'error';
interface Hint { level: number; text: string; showRepresentation: boolean; workedExample: boolean }
interface Solution { part?: number; whole?: number; missing?: number; count?: number; answer: number }
interface AttemptResult { correct: boolean; independent: boolean; misconception: string | null; finished: boolean; solution: Solution | null; triesLeft: number }
interface Summary { worked: number; onOwn: number; withHelp: number }

/**
 * Explicit learning state machine:
 * intro → answering (concrete/pictorial exploration + answer) → wrong ↺ / correct / solution → next … → done (summary).
 * Never auto-advances: the child presses "Next". The session ends after a short set.
 */
export function ActivityRunner({ sessionId }: { sessionId: string }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('loading');
  const [act, setAct] = useState<ActivityPayload | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());
  const [hint, setHint] = useState<Hint | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [netError, setNetError] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(async () => {
    const r = await api<Summary>(`/api/learn/session/${sessionId}/finish`, { method: 'POST' });
    if (r.ok) setSummary(r.data);
    setPhase('done');
  }, [sessionId]);

  const load = useCallback(async () => {
    setPhase('loading');
    setNetError(false);
    const r = await api<{ done: boolean; activity?: ActivityPayload }>('/api/activities/next', { body: { sessionId } });
    if (!r.ok) {
      setNetError(r.status === 0);
      setPhase('error');
      return;
    }
    if (r.data.done || !r.data.activity) return finish();
    const a = r.data.activity;
    setAct(a);
    setSelected(null);
    setTyped('');
    setMarked(new Set());
    setEliminated(new Set());
    setHint(null);
    setResult(null);
    setSolution(null);
    setPhase(a.itemNumber === 1 && a.tries === 0 && a.hintsUsed === 0 ? 'intro' : 'answering');
  }, [sessionId, finish]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (phase === 'answering') headingRef.current?.focus();
    if (phase === 'wrong' || phase === 'correct' || phase === 'solution') feedbackRef.current?.focus();
  }, [phase, act?.activityId]);

  if (phase === 'loading') return <p role="status" className="card text-center">{t.app.loading}</p>;
  if (phase === 'error')
    return (
      <div role="alert" className="card space-y-4 text-center">
        <p>{netError ? t.app.offline : t.app.error}</p>
        <button type="button" className="btn-primary btn-xl" onClick={() => void load()}>{t.learn.tryAgain}</button>
      </div>
    );
  if (phase === 'done') return <SessionSummary summary={summary} />;
  if (!act) return null;

  const p = act.presentation;
  const answer = p.kind === 'bond-equation' ? (typed === '' ? null : Number(typed)) : selected;
  const locked = phase !== 'answering' || busy;
  const showRep = (hint?.showRepresentation ?? false) || phase === 'wrong' || phase === 'solution';

  async function check() {
    if (answer === null || !act) return;
    setBusy(true);
    const r = await api<AttemptResult>('/api/attempts', { body: { activityId: act.activityId, response: { value: answer } } });
    setBusy(false);
    if (!r.ok) {
      setNetError(r.status === 0);
      return setPhase('error');
    }
    setResult(r.data);
    if (r.data.correct) {
      setSolution(r.data.solution);
      setPhase('correct');
    } else if (r.data.finished) {
      setSolution(r.data.solution);
      setPhase('solution');
    } else {
      if (selected !== null) setEliminated((s) => new Set(s).add(selected));
      setPhase('wrong');
    }
  }

  async function askHint() {
    if (!act) return;
    setBusy(true);
    const r = await api<{ hint: Hint; finished: boolean; solution: Solution | null }>(`/api/activities/${act.activityId}/hint`, { method: 'POST' });
    setBusy(false);
    if (!r.ok) return setPhase('error');
    setHint(r.data.hint);
    if (r.data.finished) {
      setSolution(r.data.solution);
      setPhase('solution');
    } else if (phase === 'wrong') setPhase('answering');
  }

  const toggle = (i: number) =>
    setMarked((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const question = fmt(t.learn.q[act.generator], 'whole' in p ? { whole: p.whole, part: 'knownPart' in p ? p.knownPart : 0 } : {});
  const solutionText = solution
    ? solution.count !== undefined
      ? fmt(t.learn.solutionCount, { count: solution.count })
      : fmt(t.learn.solution, { part: solution.part ?? 0, missing: solution.missing ?? 0, whole: solution.whole ?? 0 })
    : '';

  return (
    <div className="space-y-5" data-phase={phase} data-activity-id={act.activityId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-muted">{act.title}</p>
          <p className="text-base"><span className="font-semibold">{t.learn.objective}:</span> {act.objective}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip border-sand bg-white text-bark">{t.learn.stage[act.cpaStage]}</span>
          <Progress n={act.itemNumber} total={act.totalItems} />
        </div>
      </div>

      {phase === 'intro' ? (
        <div className="card space-y-5 text-center">
          <h1 className="h1">{act.title}</h1>
          <p className="text-xl">{act.objective}</p>
          <button type="button" className="btn-primary btn-xl" onClick={() => setPhase('answering')} autoFocus>{t.learn.start}</button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <section className="card" aria-label={t.learn.stage[act.cpaStage]}>
            {p.kind === 'count-ten-frame' && (
              <>
                <TenFrame filled={p.counters} frames={p.frames} mode="count" marked={marked} onToggle={toggle} disabled={locked && phase !== 'wrong'} />
                <p className="mt-3 text-base text-muted">{t.learn.tapToCount} <span aria-live="polite">{fmt(t.learn.counted, { n: marked.size })}</span></p>
              </>
            )}
            {p.kind === 'count-scattered' && (
              <>
                <ScatteredDots dots={p.dots} marked={marked} onToggle={toggle} disabled={locked && phase !== 'wrong'} />
                <p className="mt-3 text-base text-muted">{t.learn.tapToCount} <span aria-live="polite">{fmt(t.learn.counted, { n: marked.size })}</span></p>
              </>
            )}
            {p.kind === 'make-ten-frame' && (
              <>
                <TenFrame filled={p.filled} mode="fill" marked={marked} onToggle={toggle} highlightEmpty={showRep} disabled={locked && phase !== 'wrong'} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-base text-muted">
                  <span>{t.learn.tapToFill} <span aria-live="polite">{fmt(t.learn.placed, { n: marked.size })}</span></span>
                  {marked.size > 0 && <button type="button" className="btn-ghost" onClick={() => setMarked(new Set())}>{t.learn.reset}</button>}
                </div>
              </>
            )}
            {p.kind === 'number-bond' && (
              <>
                <NumberBond whole={p.whole} part={p.knownPart} unknownSide={p.unknownSide} revealed={phase === 'correct' || phase === 'solution' ? (solution?.answer ?? null) : null} />
                {showRep && <div className="mt-4"><TenFrame filled={p.knownPart} mode="fill" marked={marked} onToggle={toggle} highlightEmpty /></div>}
              </>
            )}
            {p.kind === 'bond-equation' && (
              <>
                <Equation whole={p.whole} part={p.knownPart} blank={p.blank} value={phase === 'correct' || phase === 'solution' ? String(solution?.answer ?? '') : typed} />
                {showRep && <div className="mt-4"><NumberBond whole={p.whole} part={p.knownPart} unknownSide="right" /></div>}
              </>
            )}
          </section>

          <section className="card space-y-5" aria-labelledby="q">
            <h1 id="q" ref={headingRef} tabIndex={-1} className="text-2xl font-bold leading-snug focus:outline-none">{question}</h1>
            {'choices' in p ? (
              <Choices options={p.choices} selected={selected} onSelect={setSelected} disabled={locked} eliminated={eliminated} />
            ) : (
              <div className="space-y-3">
                <p className="text-base text-muted">{t.learn.yourAnswer}: <span className="text-2xl font-bold text-ink" aria-live="polite">{typed || '—'}</span></p>
                <Keypad value={typed} onChange={setTyped} disabled={locked} />
              </div>
            )}

            {hint && phase !== 'solution' && (
              <div role="note" className="rounded-xl border-2 border-sky bg-sky-light p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-[#2f5370]">{t.learn.hint}</p>
                <p className="mt-1">{hint.text}</p>
              </div>
            )}

            <div ref={feedbackRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
              {phase === 'wrong' && result && (
                <div className="rounded-xl border-2 border-clay bg-clay-light p-4">
                  <p className="font-bold">{t.learn.notYet}</p>
                  <p>{t.learn.feedback[(result.misconception ?? 'UNCLASSIFIED') as keyof typeof t.learn.feedback]}</p>
                </div>
              )}
              {phase === 'correct' && result && (
                <div className="rounded-xl border-2 border-sage-dark bg-sage-light p-4">
                  <p className="flex items-center gap-2 font-bold"><span aria-hidden="true">✓</span>{result.independent ? t.learn.correct : t.learn.correctAfterHelp}</p>
                  {solutionText && <p>{solutionText}</p>}
                </div>
              )}
              {phase === 'solution' && (
                <div className="rounded-xl border-2 border-sky bg-sky-light p-4">
                  <p className="font-bold">{t.learn.lastTry}</p>
                  <p>{solutionText}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {(phase === 'answering' || phase === 'wrong') && (
                <>
                  {phase === 'wrong' ? (
                    <button type="button" className="btn-primary btn-xl" onClick={() => { setSelected(null); setTyped(''); setPhase('answering'); }}>{t.learn.tryAgain}</button>
                  ) : (
                    <button type="button" className="btn-primary btn-xl" disabled={answer === null || busy} onClick={() => void check()}>{t.learn.check}</button>
                  )}
                  <button type="button" className="btn-secondary btn-xl" disabled={busy} onClick={() => void askHint()}>{t.learn.needHelp}</button>
                </>
              )}
              {(phase === 'correct' || phase === 'solution') && (
                <button type="button" className="btn-primary btn-xl" onClick={() => void (act.itemNumber >= act.totalItems ? finish() : load())}>
                  {act.itemNumber >= act.totalItems ? t.learn.finish : t.learn.next}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Equation({ whole, part, blank, value }: { whole: number; part: number; blank: 'first' | 'second'; value: string }) {
  const box = (
    <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-dashed border-clay-dark bg-white text-5xl font-bold text-ink">{value || ' '}</span>
  );
  return (
    <p className="flex flex-wrap items-center justify-center gap-3 py-6 text-5xl font-bold" aria-label={`${blank === 'first' ? '?' : part} + ${blank === 'first' ? part : '?'} = ${whole}`}>
      {blank === 'first' ? box : <span>{part}</span>}
      <span aria-hidden="true">+</span>
      {blank === 'first' ? <span>{part}</span> : box}
      <span aria-hidden="true">=</span>
      <span>{whole}</span>
    </p>
  );
}

function Progress({ n, total }: { n: number; total: number }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={fmt(t.learn.progress, { n, total })}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-3 w-3 rounded-full border-2 ${i < n ? 'border-bark bg-bark' : 'border-sand bg-white'}`} />
      ))}
    </div>
  );
}

function SessionSummary({ summary }: { summary: Summary | null }) {
  const { t } = useI18n();
  return (
    <div className="card mx-auto max-w-xl space-y-4 text-center" data-testid="summary">
      <h1 className="h1">{t.learn.summaryTitle}</h1>
      <p className="text-xl">{t.learn.finished}</p>
      {summary && (
        <ul className="space-y-1">
          <li>{fmt(t.learn.summaryWorked, { n: summary.worked })}</li>
          <li>{fmt(t.learn.summaryOnOwn, { n: summary.onOwn })}</li>
          <li>{fmt(t.learn.summaryHelp, { n: summary.withHelp })}</li>
        </ul>
      )}
      <p className="muted">{t.learn.summaryNext}</p>
      <a href="/learn" className="btn-primary btn-xl">{t.learn.backToChoices}</a>
    </div>
  );
}
