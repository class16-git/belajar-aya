import Link from 'next/link';
import { prisma } from '@atlas/database';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { libraryView, readingStage } from '@/lib/server/library';

export const metadata = { title: 'Reading journeys' };
export const dynamic = 'force-dynamic';

export default async function JourneysPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const auth = await requireParentPage();
  const sp = await searchParams;
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const L = t.library;
  const child = sp.child ? await prisma.childProfile.findFirst({ where: { id: sp.child, familyId: auth.family.id } }) : null;
  const current = child ? readingStage(child) : null;
  const { journeys } = libraryView();
  const q = child ? `?child=${child.id}` : '';
  return (
    <ParentShell t={t} active="library">
      <Link href={`/library${q}`} className="btn-ghost">← {L.title}</Link>
      <h1 className="h1 mt-3">{L.journey.title}</h1>
      <p className="mt-2 max-w-prose">{L.journey.intro}</p>
      <ol className="mt-6 grid gap-3 md:grid-cols-2" data-testid="journey-list">
        {journeys.map((j, i) => (
          <li key={j.stage} className={`card flex flex-col gap-2 ${j.stage === current ? 'border-2 border-sage-dark' : ''}`} data-stage={j.stage}>
            <p className="text-sm font-semibold text-sage-dark">{L.stageName[j.stage]} · {L.journey.screen[j.screen]}</p>
            <h2 className="text-lg font-bold">{i + 1}. {j.title[locale]}</h2>
            <p className="text-sm">{j.experience[locale]}</p>
            <Link href={`/library/journey/${j.stage}${q}`} className="btn-secondary mt-auto w-fit">{L.seeJourney}</Link>
          </li>
        ))}
      </ol>
    </ParentShell>
  );
}
