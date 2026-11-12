import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@atlas/database';
import { getCatalog } from '@atlas/curriculum';
import { AckTransition } from '@/components/forms/ack-transition';
import { ObservationForm } from '@/components/forms/observation-form';
import { ParentShell } from '@/components/ui/parent-shell';
import { StatusBadge } from '@/components/ui/status';
import { fmt, getDictionary, gradeLabel } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { buildProgress } from '@/lib/server/progress';
import { readingSummary } from '@/lib/server/library';
import { unitProgress } from '@/lib/server/child-units';

export const metadata = { title: 'Progress' };
export const dynamic = 'force-dynamic';

export default async function ChildDashboard({ params }: { params: Promise<{ childId: string }> }) {
  const auth = await requireParentPage();
  const { childId } = await params;
  const child = await prisma.childProfile.findFirst({ where: { id: childId, familyId: auth.family.id } });
  if (!child) notFound();
  const reading = await readingSummary(child.id);
  const unitsDone = await unitProgress(child.id);
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const p = await buildProgress(child);
  const df = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeZone: p.ctx.timezone });
  const dtf = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: p.ctx.timezone });
  const skillTitle = (id: string | null) => getCatalog().skills.find((s) => s.id === id)?.title[locale] ?? id ?? '';
  const lessonTitle = (id: string | null) => getCatalog().lessons.find((l) => l.id === id)?.title[locale] ?? '';
  const misc = (code: string) => (t.dashboard.misconception as Record<string, string>)[code] ?? code;
  const tryOff = (code: string) => (t.dashboard.tryOffline as Record<string, string>)[code] ?? '';

  return (
    <ParentShell t={t} active="dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h1">{fmt(t.dashboard.title, { name: child.nickname })}</h1>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base">
            <div className="flex gap-1"><dt className="muted">{t.dashboard.age}:</dt><dd className="font-semibold">{p.ctx.age ? fmt(t.dashboard.years, { y: p.ctx.age.years, m: p.ctx.age.months }) : t.family.ageUnknown}</dd></div>
            <div className="flex gap-1"><dt className="muted">{t.dashboard.grade}:</dt><dd className="font-semibold">{child.schoolGrade ? gradeLabel(t, child.schoolGrade) : '—'}</dd></div>
            <div className="flex gap-1"><dt className="muted">{t.dashboard.mode}:</dt><dd className="font-semibold">{p.isToddler ? t.family.modeToddler : t.family.modeElementary}</dd></div>
            <div className="flex gap-1"><dt className="muted">{t.dashboard.localDate}:</dt><dd className="font-semibold">{p.ctx.localDate} ({p.ctx.timezone})</dd></div>
          </dl>
          <p className="mt-1 text-sm muted">{t.dashboard.turnedNote}</p>
        </div>
        <Link href={`/children/${child.id}`} className="btn-secondary no-print">{t.family.edit}</Link>
      </div>

      {p.ctx.notices.length > 0 && (
        <section className="card mt-6 border-2 border-sky bg-sky-light/50" aria-labelledby="transition-h">
          <h2 id="transition-h" className="h2">{fmt(t.dashboard.transitionTitle, { name: child.nickname })}</h2>
          <p className="mb-3 mt-1">{t.dashboard.transitionBody}</p>
          <AckTransition childId={child.id} />
        </section>
      )}

      {p.availability.awaitingReview > 0 && (
        <p className="card mt-6 border-2 border-clay bg-clay-light/40" data-testid="awaiting-review">
          {fmt(t.dashboard.awaitingReview, { n: p.availability.awaitingReview })}{' '}
          <Link href="/curriculum" className="link">{t.nav.curriculum}</Link>
        </p>
      )}

      <section className="card mt-6" aria-labelledby="reading-h" data-testid="reading-summary">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="reading-h" className="h2">{t.library.progress.title}</h2>
          <Link href={`/library?child=${child.id}`} className="btn-secondary">{t.library.progress.open}</Link>
        </div>
        {reading.reads + reading.checks === 0 ? <p className="mt-2 muted">{t.library.progress.noData}</p> : (
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            <li>{fmt(t.library.progress.sharedReads, { n: reading.reads })}</li>
            <li>{fmt(t.library.progress.checks, { n: reading.checks })}</li>
            {reading.listening !== null && <li>{fmt(t.library.progress.listening, { v: reading.listening })}</li>}
            {reading.decoding !== null && <li>{fmt(t.library.progress.decoding, { v: reading.decoding })}</li>}
          </ul>
        )}
        <p className="mt-2 text-sm muted">{t.library.progress.separate}</p>
      </section>

      <section className="card mt-6" aria-labelledby="unit-progress-h" data-testid="unit-progress">
        <h2 id="unit-progress-h" className="h2">{t.unitProgress.title}</h2>
        <p className="mt-1 text-sm muted">{t.unitProgress.intro}</p>
        {unitsDone.length === 0 ? <p className="mt-2 muted">{t.unitProgress.none}</p> : (
          <ul className="mt-3 divide-y divide-sand">
            {unitsDone.map((u) => {
              const day = (d: string) => new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));
              return (
                <li key={u.unitId} className="py-3" data-unit-progress={u.unitId} data-secure={u.secure ? 'true' : 'false'}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="min-w-[12rem] flex-1 font-semibold">{u.unit?.title[locale] ?? t.unitProgress.unknownUnit}</span>
                    <span className={`chip ${u.secure ? 'border-sage-dark bg-sage-light text-sage-dark' : 'border-sand bg-white text-bark'}`}>
                      <span aria-hidden="true">{u.secure ? '✓' : '◐'}</span> {u.secure && u.secureOn ? fmt(t.unitProgress.secureSince, { date: day(u.secureOn) }) : t.unitProgress.building}
                    </span>
                    <span className="text-sm">{fmt(t.unitProgress.attempts, { n: u.attempts })}</span>
                    <span className="text-sm">{fmt(t.unitProgress.best, { pct: Math.round(u.best * 100) })}</span>
                    {u.secure && <span className="text-sm">{u.nextReviewAt ? fmt(t.unitProgress.nextReview, { date: day(u.nextReviewAt) }) : t.unitProgress.noReview}</span>}
                  </div>
                  {u.misconceptions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold">{t.unitProgress.misconceptions}</p>
                      <ul className="mt-1 space-y-2">
                        {u.misconceptions.map((m) => {
                          const d = u.unit?.misconceptions.find((x) => x.code === m.code);
                          return (
                            <li key={m.code} className="rounded-xl bg-linen p-3 text-sm" data-unit-misconception={m.code}>
                              <p className="font-semibold">{d?.description[locale] ?? m.code} <span className="font-normal muted">· {fmt(t.unitProgress.seen, { n: m.count })}</span></p>
                              {d && <p className="mt-1">→ {d.remediation[locale]}</p>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!p.gradeSupported ? (
        <p className="card mt-6" data-testid="grade-not-supported">{fmt(t.dashboard.gradeNotSupported, { grade: gradeLabel(t, child.schoolGrade) })}</p>
      ) : p.isToddler ? (
        <>
          <p className="card mt-6">{fmt(t.dashboard.toddlerIntro, { name: child.nickname })}</p>
          <section className="mt-6" aria-labelledby="offline-h">
            <h2 id="offline-h" className="h2">{t.dashboard.offline}</h2>
            <ul className="mt-3 grid gap-4 md:grid-cols-3">
              {p.suggestedCards.map((c) => (
                <li key={c.id} className="card flex flex-col gap-2">
                  <h3 className="font-bold">{c.title[locale]}</h3>
                  <p className="text-sm muted">{c.objective[locale]}</p>
                  <Link href={`/cards/${c.id}?child=${child.id}`} aria-label={`${t.cards.open}: ${c.title[locale]}`} className="btn-primary mt-auto">{t.cards.open}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="card mt-6" aria-labelledby="areas-h">
            <h2 id="areas-h" className="h2">{t.dashboard.observedSkills}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {p.toddlerSkills.map(({ skill, count }) => (
                <li key={skill.id} className="flex items-center justify-between rounded-xl bg-linen px-3 py-2">
                  <span>{skill.title[locale]}</span>
                  <span className="text-sm muted">{fmt(t.dashboard.observedCount, { n: count })}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          {p.recommendation && p.recommendation.kind === 'interactive' && (
            <section className="card mt-6" aria-labelledby="next-h" data-testid="recommendation">
              <h2 id="next-h" className="h2">{t.dashboard.nextUp}</h2>
              <p className="mt-1 text-lg font-semibold">{lessonTitle(p.recommendation.lessonId)} · {t.learn.stage[p.recommendation.cpaStage]}</p>
              <p className="mt-1"><span className="font-semibold">{t.dashboard.why}:</span> {p.recommendation.reason[locale]}</p>
              <p className="mt-1 text-sm muted">{t.dashboard.rule}: <code>{p.recommendation.ruleId}</code></p>
            </section>
          )}

          <section className="card mt-6 overflow-hidden" aria-labelledby="skills-h">
            <h2 id="skills-h" className="h2">{t.dashboard.skills}</h2>
            <p className="mt-1 text-sm muted">{t.dashboard.scoreNote}</p>
            <ul className="mt-4 divide-y divide-sand">
              {p.skills.map((s) => (
                <li key={s.skill.id} className="py-3" data-skill={s.skill.id}>
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 rounded-lg py-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus">
                      <span className="min-w-[12rem] flex-1 font-semibold">{s.skill.title[locale]}</span>
                      <StatusBadge status={s.status} t={t} />
                      <span className="flex items-center gap-2 text-sm" title={t.dashboard.score}>
                        <span className="sr-only">{t.dashboard.score}:</span>
                        <span aria-hidden="true" className="block h-2.5 w-24 overflow-hidden rounded-full bg-linen">
                          <span className="block h-full bg-sage-dark" style={{ width: `${Math.round((s.score ?? 0) * 100)}%` }} />
                        </span>
                        {s.score === null ? '—' : s.score.toFixed(2)}
                      </span>
                      <span className="text-sm">{t.dashboard.independent}: {Math.min(s.independentCorrect, 3)}/3{s.independentCorrect >= 3 ? ' ✓' : ''}</span>
                      <span className="text-sm">{t.dashboard.formats}: {Math.min(s.formats, 2)}/2{s.formats >= 2 ? ' ✓' : ''}</span>
                      <span className="text-sm">{t.dashboard.nextReview}: {s.nextReviewAt ? df.format(s.nextReviewAt) : '—'}</span>
                      <span className="text-sm font-semibold text-sky" aria-hidden="true">{t.dashboard.evidence} ▾</span>
                    </summary>
                    <div className="mt-3 overflow-x-auto rounded-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus" tabIndex={0} role="region" aria-label={`${t.dashboard.evidence}: ${s.skill.title[locale]}`}>
                      {s.attempts.length === 0 ? (
                        <p className="muted">{t.dashboard.noEvidence}</p>
                      ) : (
                        <table className="w-full min-w-[34rem] text-left text-sm">
                          <caption className="sr-only">{t.dashboard.evidence}: {s.skill.title[locale]}</caption>
                          <thead>
                            <tr className="border-b border-sand">
                              {(['when', 'answer', 'result', 'hints', 'tries', 'tags'] as const).map((k) => <th key={k} scope="col" className="py-2 pr-3 font-semibold">{t.dashboard.attempt[k]}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {s.attempts.map((a) => (
                              <tr key={a.id} className="border-b border-linen">
                                <td className="py-1.5 pr-3">{dtf.format(a.at)}</td>
                                <td className="py-1.5 pr-3">{a.value ?? '—'}</td>
                                <td className="py-1.5 pr-3">{a.correct ? `✓ ${t.dashboard.correct}` : `○ ${t.dashboard.incorrect}`} <span className="muted">({a.independent ? t.dashboard.independentTag : t.dashboard.supportedTag})</span></td>
                                <td className="py-1.5 pr-3">{a.hints}</td>
                                <td className="py-1.5 pr-3">{a.tryNumber}</td>
                                <td className="py-1.5 pr-3">{a.tags.map(misc).join(', ')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="card" aria-labelledby="misc-h">
              <h2 id="misc-h" className="h2">{t.dashboard.misconceptions}</h2>
              {p.misconceptions.length === 0 ? (
                <p className="mt-2 muted">{t.dashboard.noMisconceptions}</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {p.misconceptions.map((m) => (
                    <li key={m.code} className="rounded-xl bg-linen p-3" data-misconception={m.code}>
                      <p className="font-semibold">{misc(m.code)}</p>
                      <p className="text-sm muted">{skillTitle(m.skillId)} · {fmt(t.dashboard.seenTimes, { n: m.count, date: df.format(m.last) })}</p>
                      <p className="mt-1 text-sm">→ {tryOff(m.code)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="card" aria-labelledby="due-h">
              <h2 id="due-h" className="h2">{t.dashboard.dueReviews}</h2>
              {p.dueReviews.length === 0 ? <p className="mt-2 muted">{t.dashboard.noDue}</p> : (
                <ul className="mt-3 list-disc pl-6">{p.dueReviews.map((s) => <li key={s.skill.id}>{s.skill.title[locale]}</li>)}</ul>
              )}
              <h2 className="h2 mt-6">{t.dashboard.offline}</h2>
              <ul className="mt-3 space-y-2">
                {p.offlineExtensions.map((o) => <li key={o.lessonId} className="rounded-xl bg-linen p-3 text-sm"><span className="font-semibold">{o.title[locale]}:</span> {o.text[locale]}</li>)}
                {p.offlineExtensions.length === 0 && <li className="muted">{t.dashboard.noDue}</li>}
              </ul>
            </section>
          </div>
        </>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="obs-h">
          <h2 id="obs-h" className="h2">{t.dashboard.observations}</h2>
          {p.observations.length === 0 ? <p className="mt-2 muted">{t.dashboard.noObservations}</p> : (
            <ul className="mt-3 space-y-2">
              {p.observations.slice(0, 10).map((o) => (
                <li key={o.id} className="rounded-xl bg-linen p-3 text-sm" data-testid="observation">
                  <p className="font-semibold">{o.lessonId ? lessonTitle(o.lessonId) : skillTitle(o.skillId)} · {t.observation.levels[o.level]}</p>
                  <p className="muted">{df.format(o.observedAt)}</p>
                  {o.note && <p className="mt-1 whitespace-pre-wrap">{o.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card no-print" aria-labelledby="add-obs-h">
          <h2 id="add-obs-h" className="h2">{t.dashboard.addObservation}</h2>
          <div className="mt-3">
            <ObservationForm
              childId={child.id}
              today={p.ctx.localDate}
              skills={getCatalog().skills.filter((s) => s.band === (p.isToddler ? 'toddler' : 'g1')).map((s) => ({ id: s.id, title: s.title[locale] }))}
            />
          </div>
        </section>
      </div>
    </ParentShell>
  );
}
