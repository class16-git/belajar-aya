import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog, publicationIssues, requiresReligiousReview, type ReligiousReview } from '@atlas/curriculum';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Review lesson' };

/** Parent-only review view. Shows drafts (never shown to children) with everything a reviewer must check. */
export default async function ReviewLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  await requireParentPage();
  const { lessonId } = await params;
  const lesson = getCatalog().lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const c = t.curriculum;
  const L = (x: { en: string; id: string }) => x[locale];
  const issues = publicationIssues(lesson);
  const religious = requiresReligiousReview(lesson);
  const rr = lesson.religiousReview;
  const rrKeys: (keyof Omit<ReligiousReview, 'notes'>)[] = ['doctrinalSchool', 'fiqhSchool', 'arabicSource', 'edition', 'pageOrSection', 'translationReviewer', 'scholarReviewer', 'reviewedAt', 'approvalStatus'];
  const list = (title: string, items: { en: string; id: string }[]) =>
    items.length > 0 && (
      <section>
        <h2 className="h2">{title}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">{items.map((x, i) => <li key={i}>{L(x)}</li>)}</ul>
      </section>
    );

  return (
    <ParentShell t={t} active="curriculum">
      <Link href="/curriculum" className="btn-ghost">← {t.app.back}</Link>
      <article className="card mx-auto mt-3 max-w-3xl space-y-5" data-testid="review-lesson">
        <header>
          <p className="text-xs muted">{lesson.id} · v{lesson.contentVersion} · {t.cards.ageLabel[lesson.ageBand]} · {c.status[lesson.reviewStatus]}</p>
          <h1 className="h1">{fmt(c.reviewTitle, { title: L(lesson.title) })}</h1>
          <p className="mt-1 text-lg">{L(lesson.objective)}</p>
          <p className="mt-3 rounded-xl border-2 border-sky bg-sky-light p-3 text-sm">{c.reviewNotice}</p>
        </header>

        <section aria-labelledby="blocking-h" className={`rounded-xl border-2 p-4 ${issues.length ? 'border-clay bg-clay-light/50' : 'border-sage bg-sage-light'}`}>
          <h2 id="blocking-h" className="h2">{c.blocking}</h2>
          {issues.length === 0 ? <p className="mt-1">{c.nothingBlocking}</p> : (
            <ul className="mt-2 list-disc space-y-1 pl-6" data-testid="blocking-issues">{issues.map((i) => <li key={i.message}>{i.message}</li>)}</ul>
          )}
          {lesson.reviewFlags.length > 0 && (
            <p className="mt-2 text-sm"><span className="font-semibold">{c.flags}:</span> {lesson.reviewFlags.map((f) => c.flag[f]).join(' · ')}</p>
          )}
          {lesson.objectiveIds.length > 0 && (
            <p className="mt-1 text-sm"><span className="font-semibold">{c.objectivesLinked}:</span> {lesson.objectiveIds.join(', ')}</p>
          )}
        </section>

        {lesson.arabicPhrases.length > 0 && (
          <section aria-labelledby="arabic-h">
            <h2 id="arabic-h" className="h2">{c.arabicTitle}</h2>
            <ul className="mt-2 space-y-2">
              {lesson.arabicPhrases.map((p, i) => (
                <li key={i} className="rounded-xl border border-sand bg-paper p-3" data-testid="arabic-phrase">
                  <p lang="ar" dir="rtl" className="text-3xl leading-relaxed">{p.arabic}</p>
                  <p className="mt-1"><span className="italic">{p.transliteration}</span> — {L(p.meaning)}</p>
                  <span className={`chip mt-2 ${p.verified ? 'border-sage-dark bg-sage-light text-sage-dark' : 'border-clay bg-clay-light text-clay-dark'}`}>
                    {p.verified ? `✓ ${c.verified}` : `! ${c.unverified}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {religious && (
          <section aria-labelledby="rr-h">
            <h2 id="rr-h" className="h2">{c.religiousRecord}</h2>
            <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[14rem_1fr]">
              {rrKeys.map((k) => (
                <div key={k} className="contents">
                  <dt className="font-semibold">{c.rr[k]}</dt>
                  <dd className={rr?.[k] ? '' : 'muted italic'}>{rr?.[k] ?? c.notProvided}</dd>
                </div>
              ))}
            </dl>
            {rr && rr.notes.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">{rr.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
          </section>
        )}

        {lesson.mode === 'offline' ? (
          <>
            {list(t.cards.safety, lesson.safetyNotes)}
            {list(t.cards.materials, lesson.materials)}
            {list(t.cards.prep, lesson.preparation)}
            {list(t.cards.steps, lesson.steps)}
            {list(t.cards.say, lesson.adultWording)}
            {list(t.cards.watch, lesson.observationCues)}
            <section><h2 className="h2">{t.cards.cleanup}</h2><p className="mt-2">{L(lesson.cleanup)}</p></section>
          </>
        ) : (
          <>
            {list(t.cards.materials, lesson.materials)}
            {list(t.learn.hint, lesson.hintLadder)}
          </>
        )}
        {list(t.cards.notesForParent, lesson.parentNotes)}

        <section aria-labelledby="how-h" className="rounded-xl bg-linen p-4 text-sm">
          <h2 id="how-h" className="h2">{c.howToApprove}</h2>
          {religious && (
            <>
              <p className="mt-2">{c.howReligious}</p>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-2 text-xs">{`pnpm content:religious-approve -- --scholar "<initials>" --translator "<initials>" --school "<doctrinal school>" --fiqh "<madhhab>" --source "<Arabic source>" --edition "<edition>" --section "<page/section>" ${lesson.id}`}</pre>
            </>
          )}
          <p className="mt-2">{c.howContent}</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-2 text-xs">{`pnpm content:approve -- --reviewer "<initials>" --role parent ${lesson.id}`}</pre>
        </section>
      </article>
    </ParentShell>
  );
}
