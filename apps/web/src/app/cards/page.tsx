import Link from 'next/link';
import { getCatalog, visibleOfflineCards } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { config } from '@/lib/server/config';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { availabilityForBand } from '@/lib/server/availability';

export const metadata = { title: 'Activity cards' };

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ child?: string; skill?: string }> }) {
  const auth = await requireParentPage();
  const sp = await searchParams;
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const child = sp.child ? await prisma.childProfile.findFirst({ where: { id: sp.child, familyId: auth.family.id } }) : null;
  const skills = getCatalog().skills.filter((s) => s.band === 'toddler');
  const cards = visibleOfflineCards(config.minReview).filter((c) => !sp.skill || c.skillId === sp.skill);
  const q = (skill?: string) => {
    const u = new URLSearchParams();
    if (child) u.set('child', child.id);
    if (skill) u.set('skill', skill);
    const s = u.toString();
    return s ? `?${s}` : '';
  };
  return (
    <ParentShell t={t} active="cards">
      <h1 className="h1">{t.cards.title}</h1>
      <p className="mt-2 max-w-prose">{t.cards.intro}</p>
      {child && <p className="mt-2 font-semibold">{t.cards.forChild}: {child.nickname}</p>}
      <nav aria-label={t.observation.skill} className="mt-4 flex flex-wrap gap-2">
        <Link href={`/cards${q()}`} aria-current={!sp.skill ? 'page' : undefined} className={`chip min-h-11 px-4 ${!sp.skill ? 'border-bark bg-bark text-white' : 'border-sand bg-white text-bark'}`}>{t.cards.filterAll}</Link>
        {skills.map((s) => (
          <Link key={s.id} href={`/cards${q(s.id)}`} aria-current={sp.skill === s.id ? 'page' : undefined} className={`chip min-h-11 px-4 ${sp.skill === s.id ? 'border-bark bg-bark text-white' : 'border-sand bg-white text-bark'}`}>{s.title[locale]}</Link>
        ))}
      </nav>
      {cards.length === 0 && availabilityForBand('toddler', config.minReview).awaitingReview > 0 && (
        <p className="card mt-6 border-2 border-clay bg-clay-light/40" data-testid="awaiting-review">
          {fmt(t.dashboard.awaitingReview, { n: availabilityForBand('toddler', config.minReview).awaitingReview })}{' '}
          <Link href="/curriculum" className="link">{t.nav.curriculum}</Link>
        </p>
      )}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.id} className="card flex flex-col gap-2" data-card={c.id}>
            <p className="text-sm font-semibold text-sage-dark">{skills.find((s) => s.id === c.skillId)?.title[locale]}</p>
            <h2 className="text-lg font-bold">{c.title[locale]}</h2>
            <p className="text-sm">{c.objective[locale]}</p>
            <p className="text-sm muted">{fmt(t.cards.prepTime, { n: c.prepMinutes })} · {fmt(t.cards.duration, c.activityMinutes)}</p>
            <Link href={`/cards/${c.id}${q()}`} aria-label={`${t.cards.open}: ${c.title[locale]}`} className="btn-primary mt-auto">{t.cards.open}</Link>
          </li>
        ))}
      </ul>
    </ParentShell>
  );
}
