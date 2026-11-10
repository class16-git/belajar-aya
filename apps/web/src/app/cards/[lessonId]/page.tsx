import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog, isVisible } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { ObservationForm } from '@/components/forms/observation-form';
import { ParentShell } from '@/components/ui/parent-shell';
import { PrintControls } from '@/components/ui/print-controls';
import { fmt, getDictionary } from '@/lib/i18n';
import { ageContext } from '@/lib/server/children';
import { config } from '@/lib/server/config';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Activity card' };

export default async function CardPage({ params, searchParams }: { params: Promise<{ lessonId: string }>; searchParams: Promise<{ child?: string }> }) {
  const auth = await requireParentPage();
  const { lessonId } = await params;
  const sp = await searchParams;
  const card = getCatalog().lessons.find((l) => l.id === lessonId);
  if (!card || card.mode !== 'offline' || !isVisible(card, config.minReview)) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const children = await prisma.childProfile.findMany({ where: { familyId: auth.family.id }, orderBy: { createdAt: 'asc' } });
  const child = children.find((c) => c.id === sp.child) ?? children.find((c) => c.mode === 'TODDLER_OFFLINE') ?? null;
  const L = (x: { en: string; id: string }) => x[locale];
  const hazards = (Object.keys(t.cards.hazard) as (keyof typeof t.cards.hazard)[]).filter((h) => card.hazards[h]);
  const skill = getCatalog().skills.find((s) => s.id === card.skillId);
  return (
    <ParentShell t={t} active="cards">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/cards${child ? `?child=${child.id}` : ''}`} className="btn-ghost">← {t.app.back}</Link>
        <PrintControls />
      </div>
      <article className="card print-card mx-auto max-w-3xl space-y-5" data-testid="card">
        <header>
          <p className="text-sm font-semibold text-sage-dark">{skill ? L(skill.title) : ''}</p>
          <h1 className="h1">{L(card.title)}</h1>
          <p className="mt-1 text-lg">{L(card.objective)}</p>
          <p className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="chip border-sand bg-linen text-bark">{fmt(t.cards.prepTime, { n: card.prepMinutes })}</span>
            <span className="chip border-sand bg-linen text-bark">{fmt(t.cards.duration, card.activityMinutes)}</span>
            <span className="chip border-sage bg-sage-light text-sage-dark">{t.cards.noScreen}</span>
          </p>
        </header>
        <section className="print-break-avoid rounded-xl border-2 border-clay bg-clay-light/60 p-4" aria-labelledby="safety-h">
          <h2 id="safety-h" className="h2 flex items-center gap-2"><span aria-hidden="true">⚠</span>{t.cards.safety}</h2>
          <p className="mt-1 font-semibold">{t.cards.supervision}</p>
          {hazards.length > 0 && <p className="mt-1 text-sm">{hazards.map((h) => t.cards.hazard[h]).join(' · ')}</p>}
          <ul className="mt-2 list-disc space-y-1 pl-6">{card.safetyNotes.map((n, i) => <li key={i}>{L(n)}</li>)}</ul>
        </section>
        <div className="grid gap-5 md:grid-cols-2">
          <section className="print-break-avoid"><h2 className="h2">{t.cards.materials}</h2><ul className="mt-2 list-disc space-y-1 pl-6">{card.materials.map((m, i) => <li key={i}>{L(m)}</li>)}</ul></section>
          <section className="print-break-avoid"><h2 className="h2">{t.cards.prep}</h2><ul className="mt-2 list-disc space-y-1 pl-6">{card.preparation.map((m, i) => <li key={i}>{L(m)}</li>)}</ul></section>
        </div>
        <section className="print-break-avoid"><h2 className="h2">{t.cards.steps}</h2><ol className="mt-2 list-decimal space-y-2 pl-6">{card.steps.map((s, i) => <li key={i}>{L(s)}</li>)}</ol></section>
        <div className="grid gap-5 md:grid-cols-2">
          <section className="print-break-avoid"><h2 className="h2">{t.cards.say}</h2><ul className="mt-2 space-y-2">{card.adultWording.map((w, i) => <li key={i} className="rounded-xl bg-linen px-3 py-2 italic">“{L(w)}”</li>)}</ul></section>
          <section className="print-break-avoid"><h2 className="h2">{t.cards.watch}</h2><ul className="mt-2 list-disc space-y-1 pl-6">{card.observationCues.map((o, i) => <li key={i}>{L(o)}</li>)}</ul></section>
        </div>
        <section className="print-break-avoid"><h2 className="h2">{t.cards.cleanup}</h2><p className="mt-2">{L(card.cleanup)}</p></section>
        {card.variations.length > 0 && <section className="print-break-avoid"><h2 className="h2">{t.cards.variations}</h2><ul className="mt-2 list-disc pl-6">{card.variations.map((v, i) => <li key={i}>{L(v)}</li>)}</ul></section>}
        <p className="rounded-xl bg-sage-light p-3 font-semibold text-sage-dark">↻ {t.cards.repeat}</p>
        <p className="text-xs muted">{card.id} · v{card.contentVersion} · {t.cards.reviewStatus}: {t.curriculum.status[card.reviewStatus]}</p>
      </article>
      {child && (
        <section className="card no-print mx-auto mt-6 max-w-3xl" aria-labelledby="obs-h">
          <h2 id="obs-h" className="h2">{t.observation.title}</h2>
          <p className="mb-3 muted">{t.cards.forChild}: {child.nickname}</p>
          <ObservationForm childId={child.id} lessonId={card.id} today={ageContext(child).localDate} />
        </section>
      )}
    </ParentShell>
  );
}
