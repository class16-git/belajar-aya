import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChildShell } from '@/components/child/child-shell';
import { UnitCheck } from '@/components/units/unit-check';
import { fmt, getDictionary } from '@/lib/i18n';
import { childUnits, unitForChild } from '@/lib/server/child-units';
import { currentLocale, requireChildPage } from '@/lib/server/guards';

export const metadata = { title: 'Learning unit' };
export const dynamic = 'force-dynamic';

/** Child view of one learning unit: instructions (or a grown-up-led view) and a server-graded check. */
export default async function ChildUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { child } = await requireChildPage();
  const { id } = await params;
  const unit = (await childUnits(child)).find((u) => u.id === id);
  if (!unit) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const T = t.unitChild;
  const view = unitForChild(unit, locale); // display-order choices only; no answer key, checks or explanations
  return (
    <ChildShell reducedMotion={child.reducedMotion}>
      <Link href="/learn" className="btn-ghost">← {T.back}</Link>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <article className="card space-y-4" data-testid="unit-child" data-unit={view.id}>
          <h1 className="text-3xl font-bold">{view.title}</h1>
          <p className="text-xl">{view.objective}</p>
          <p className="text-base muted">⏱ {fmt(T.minutes, view.minutes)}</p>
          {view.caregiverLed && (
            <p className="rounded-xl border-2 border-sky bg-sky-light p-3 text-lg font-semibold" data-testid="with-grown-up">
              <span aria-hidden="true">🤝 </span>{T.withGrownUp}
              <span className="mt-1 block text-base font-normal">{T.withGrownUpNote}</span>
            </p>
          )}
          {view.examples.length > 0 && (
            <section className="space-y-2 rounded-xl bg-linen p-4" aria-labelledby="look-together" data-testid="unit-examples">
              <h2 id="look-together" className="text-2xl font-bold">{T.lookTogether}</h2>
              <p className="text-base muted">{T.lookTogetherNote}</p>
              <ul className="space-y-2 text-xl leading-relaxed">
                {view.examples.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          )}
          <h2 className="text-2xl font-bold">{T.steps}</h2>
          <ol className="list-decimal space-y-2 pl-7 text-xl leading-relaxed">
            {view.instructions.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </article>
        <UnitCheck unitId={view.id} attemptId={randomUUID()} items={view.items} />
      </div>
    </ChildShell>
  );
}
