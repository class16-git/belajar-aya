import Link from 'next/link';
import { ChildShell } from '@/components/child/child-shell';
import { StartLesson } from '@/components/child/start-lesson';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireChildPage } from '@/lib/server/guards';
import { childChoices } from '@/lib/server/learning';

export const metadata = { title: 'Learn' };
export const dynamic = 'force-dynamic';

export default async function LearnPage() {
  const { child } = await requireChildPage();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const { ctx, choices, rec, gradeSupported } = await childChoices(child);
  return (
    <ChildShell reducedMotion={child.reducedMotion}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{fmt(t.learn.hello, { name: child.nickname })}</h1>
        <Link href="/learn/library" className="btn-secondary btn-xl" data-testid="reading-garden-entry"><span aria-hidden="true">📚</span> {t.library.child.entry}</Link>
      </div>
      {!ctx.policy.childScreenActivitiesAllowed ? (
        <p className="card mt-6">{t.learn.offlineOnly}</p>
      ) : !gradeSupported ? (
        <p className="card mt-6" data-testid="grade-coming-soon">{t.learn.gradeComingSoon}</p>
      ) : choices.length === 0 ? (
        <p className="card mt-6">{t.learn.nothing}</p>
      ) : (
        <>
          <p className="mt-2 text-xl">{t.learn.choose}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {choices.map((l, i) => (
              <li key={l.id} className={`card flex flex-col gap-3 ${i === 0 ? 'border-2 border-sage-dark' : ''}`} data-lesson={l.id}>
                {i === 0 && rec?.kind === 'interactive' && <span className="chip w-fit border-sage-dark bg-sage-light text-sage-dark">★ {t.learn.suggested}</span>}
                <h2 className="text-2xl font-bold">{l.title[locale]}</h2>
                <p className="text-lg">{l.objective[locale]}</p>
                <span className="chip w-fit border-sand bg-white text-bark">{t.learn.stage[l.cpaStage]}</span>
                <div className="mt-auto"><StartLesson lessonId={l.id} primary={i === 0} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChildShell>
  );
}
