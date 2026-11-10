import { getCatalog, isVisible } from '@atlas/curriculum';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { config } from '@/lib/server/config';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Curriculum' };

export default async function CurriculumPage() {
  await requireParentPage();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const cat = getCatalog();
  const bands = ['g1', 'toddler'] as const;
  return (
    <ParentShell t={t} active="curriculum">
      <h1 className="h1">{t.curriculum.title}</h1>
      <p className="mt-2 max-w-prose">{t.curriculum.intro}</p>
      <p className="mt-1 text-sm muted">{t.curriculum.fidelity} · v{cat.curriculumVersion}</p>
      {bands.map((band) => (
        <section key={band} className="mt-8" aria-labelledby={`band-${band}`}>
          <h2 id={`band-${band}`} className="h2">{t.curriculum.band[band]}</h2>
          <ol className="mt-3 grid gap-4 md:grid-cols-2">
            {cat.skills.filter((s) => s.band === band).sort((a, b) => a.order - b.order).map((s) => {
              const lessons = cat.lessons.filter((l) => l.skillId === s.id);
              return (
                <li key={s.id} id={s.id} className="card">
                  <p className="text-xs font-mono muted">{s.id}</p>
                  <h3 className="text-lg font-bold">{s.title[locale]}</h3>
                  <p className="text-sm">{s.description[locale]}</p>
                  <p className="mt-2 text-sm"><span className="font-semibold">{t.curriculum.prerequisites}:</span>{' '}
                    {s.prerequisites.length === 0 ? t.curriculum.none : s.prerequisites.map((p, i) => (
                      <span key={p}>{i > 0 && ', '}<a href={`#${p}`} className="link">{cat.skills.find((x) => x.id === p)?.title[locale] ?? p}</a></span>
                    ))}
                  </p>
                  <h4 className="mt-3 text-sm font-semibold">{t.curriculum.lessons}</h4>
                  {lessons.length === 0 ? <p className="text-sm muted">{t.curriculum.noLessons}</p> : (
                    <ul className="mt-1 space-y-1 text-sm">
                      {lessons.map((l) => (
                        <li key={l.id} className="rounded-lg bg-linen px-2 py-1.5">
                          <span className="font-semibold">{l.title[locale]}</span>
                          {l.mode === 'interactive' && <span className="muted"> · {t.curriculum.cpa}: {t.learn.stage[l.cpaStage]}</span>}
                          <br />
                          <span className="muted">{t.curriculum.status[l.reviewStatus]} — {isVisible(l, config.minReview) ? t.curriculum.visibleNow : t.curriculum.hiddenNow}</span>
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
