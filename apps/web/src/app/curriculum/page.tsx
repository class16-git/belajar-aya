import Link from 'next/link';
import { coverage, coverageMatrix, getCatalog, isVisible, reviewQueue, type CoverageStatus } from '@atlas/curriculum';
import { AGE_BANDS, FRAMEWORKS, STAGES } from '@atlas/shared';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { config } from '@/lib/server/config';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Curriculum' };

const STATUS_STYLE: Record<CoverageStatus, string> = {
  planned: 'border-sand bg-white text-muted',
  draft: 'border-sand bg-linen text-bark',
  awaiting_religious_review: 'border-clay bg-clay-light text-clay-dark',
  awaiting_review: 'border-sky bg-sky-light text-[#2f5370]',
  published: 'border-sage-dark bg-sage-light text-sage-dark',
};

export default async function CurriculumPage() {
  await requireParentPage();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const c = t.curriculum;
  const cat = getCatalog();
  const rows = coverage(cat);
  const matrix = coverageMatrix(rows);
  const queue = reviewQueue(cat);
  // Every band that has skills, youngest first (now includes ages 3–6, Kindergarten and robotics).
  const bands = AGE_BANDS.filter((b) => cat.skills.some((s) => s.band === b));

  return (
    <ParentShell t={t} active="curriculum">
      <h1 className="h1">{c.title}</h1>
      <p className="mt-2 max-w-prose">{c.intro}</p>
      <p className="mt-1 text-sm muted">{c.fidelity} · v{cat.curriculumVersion}</p>

      {/* Review queue first: it is where the parent has work to do. */}
      <section className="card mt-8" aria-labelledby="queue-h" data-testid="review-queue">
        <h2 id="queue-h" className="h2">{c.queueTitle}</h2>
        <p className="mt-1 text-sm muted">{c.queueIntro}</p>
        {queue.length === 0 ? (
          <p className="mt-3">{c.queueEmpty}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {queue.map((q) => (
              <li key={q.lesson.id} className="rounded-xl border border-sand bg-paper p-3" data-review-item={q.lesson.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{q.lesson.title[locale]}</p>
                    <p className="text-xs muted">
                      {q.lesson.id} · {t.cards.ageLabel[q.lesson.ageBand]} · {c.status[q.lesson.reviewStatus]}
                    </p>
                  </div>
                  <Link href={`/curriculum/review/${q.lesson.id}`} className="btn-secondary" aria-label={`${c.openReview}: ${q.lesson.title[locale]}`}>
                    {c.openReview}
                  </Link>
                </div>
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {q.needs.map((n) => (
                    <span key={n} className={`chip ${n === 'religious_review' ? 'border-clay bg-clay-light text-clay-dark' : 'border-sky bg-sky-light text-[#2f5370]'}`}>{c.needs[n]}</span>
                  ))}
                </p>
                {q.lesson.reviewFlags.length > 0 && (
                  <p className="mt-2 text-xs"><span className="font-semibold">{c.flags}:</span> {q.lesson.reviewFlags.map((f) => c.flag[f]).join(' · ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mt-8 overflow-hidden" aria-labelledby="coverage-h">
        <h2 id="coverage-h" className="h2">{c.coverageTitle}</h2>
        <p className="mt-1 text-sm muted">{c.coverageIntro}</p>
        <div className="mt-3 overflow-x-auto rounded-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus" tabIndex={0} role="region" aria-label={c.coverageTitle}>
          <table className="w-full min-w-[36rem] text-left text-sm" data-testid="coverage-matrix">
            <thead>
              <tr className="border-b border-sand">
                <th scope="col" className="py-2 pr-3 font-semibold">&nbsp;</th>
                {FRAMEWORKS.map((f) => <th key={f} scope="col" className="py-2 pr-3 font-semibold">{c.framework[f]}</th>)}
              </tr>
            </thead>
            <tbody>
              {STAGES.map((s) => (
                <tr key={s} className="border-b border-linen">
                  <th scope="row" className="py-1.5 pr-3 font-semibold">{c.stage[s]}</th>
                  {FRAMEWORKS.map((f) => {
                    const cell = matrix[s][f];
                    const pending = cell.total - cell.published - cell.planned;
                    return (
                      <td key={f} className="py-1.5 pr-3" data-cell={`${s}:${f}`}>
                        <span className={cell.published > 0 ? 'font-semibold text-sage-dark' : ''}>{cell.published}/{cell.total}</span>
                        {pending > 0 && <span className="muted"> (+{pending})</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="objectives-h">
        <h2 id="objectives-h" className="h2">{c.objectivesTitle}</h2>
        <div className="mt-3 space-y-2">
          {STAGES.map((s) => {
            const stageRows = rows.filter((r) => r.objective.stage === s);
            return (
              <details key={s} className="card" data-stage={s}>
                <summary className="cursor-pointer list-none font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus">
                  {c.stage[s]} <span className="text-sm font-normal muted">· {stageRows.filter((r) => r.status === 'published').length}/{stageRows.length}</span>
                </summary>
                <ul className="mt-3 space-y-2">
                  {stageRows.map((r) => (
                    <li key={r.objective.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-linen px-3 py-2 text-sm" data-objective={r.objective.id}>
                      <span>
                        <span className="font-semibold">{r.objective.title[locale]}</span>
                        <br />
                        <span className="text-xs muted">{c.framework[r.objective.framework]} · {r.objective.id}</span>
                      </span>
                      <span className={`chip ${STATUS_STYLE[r.status]}`}>{c.coverageStatus[r.status]}</span>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </section>

      {bands.map((band) => (
        <section key={band} className="mt-8" aria-labelledby={`band-${band}`}>
          <h2 id={`band-${band}`} className="h2">{t.cards.ageLabel[band]}</h2>
          <ol className="mt-3 grid gap-4 md:grid-cols-2">
            {cat.skills.filter((s) => s.band === band).sort((a, b) => a.order - b.order).map((s) => {
              const lessons = cat.lessons.filter((l) => l.skillId === s.id);
              return (
                <li key={s.id} id={s.id} className="card">
                  <p className="text-xs font-mono muted">{s.id}</p>
                  <h3 className="text-lg font-bold">{s.title[locale]}</h3>
                  <p className="text-sm">{s.description[locale]}</p>
                  <p className="mt-2 text-sm"><span className="font-semibold">{c.prerequisites}:</span>{' '}
                    {s.prerequisites.length === 0 ? c.none : s.prerequisites.map((p, i) => (
                      <span key={p}>{i > 0 && ', '}<a href={`#${p}`} className="link">{cat.skills.find((x) => x.id === p)?.title[locale] ?? p}</a></span>
                    ))}
                  </p>
                  <h4 className="mt-3 text-sm font-semibold">{c.lessons}</h4>
                  {lessons.length === 0 ? <p className="text-sm muted">{c.noLessons}</p> : (
                    <ul className="mt-1 space-y-1 text-sm">
                      {lessons.map((l) => (
                        <li key={l.id} className="rounded-lg bg-linen px-2 py-1.5">
                          <span className="font-semibold">{l.title[locale]}</span>
                          {l.mode === 'interactive' && <span className="muted"> · {c.cpa}: {t.learn.stage[l.cpaStage]}</span>}
                          <br />
                          <span className="muted">{c.status[l.reviewStatus]} — {isVisible(l, config.minReview) ? c.visibleNow : c.hiddenNow}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </ParentShell>
  );
}
