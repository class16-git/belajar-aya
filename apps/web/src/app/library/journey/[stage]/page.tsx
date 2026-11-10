import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STRANDS } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { STAGES, type Stage } from '@atlas/shared';
import { BookCard } from '@/components/library/book-card';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { journeyFor, libraryView } from '@/lib/server/library';

export const metadata = { title: 'Reading journey' };
export const dynamic = 'force-dynamic';

export default async function JourneyPage({ params, searchParams }: { params: Promise<{ stage: string }>; searchParams: Promise<{ child?: string }> }) {
  const auth = await requireParentPage();
  const { stage } = await params;
  if (!(STAGES as readonly string[]).includes(stage)) notFound();
  const sp = await searchParams;
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const L = t.library;
  const child = sp.child ? await prisma.childProfile.findFirst({ where: { id: sp.child, familyId: auth.family.id } }) : null;
  const j = journeyFor(stage as Stage);
  const { books, passages } = libraryView();
  const stageBooks = books.filter((b) => b.stages.includes(stage as Stage));
  const stagePassages = j.passageIds.map((id) => passages.find((p) => p.id === id)).filter((p) => !!p);
  const q = child ? `?child=${child.id}` : '';
  const list = (title: string, items: { en: string; id: string }[]) => (
    <div><h3 className="font-bold">{title}</h3><ul className="mt-1 list-disc space-y-1 pl-6">{items.map((x, i) => <li key={i}>{x[locale]}</li>)}</ul></div>
  );
  const rubric = (title: string, items: { en: string; id: string }[]) => (
    <div><h3 className="font-bold">{title}</h3><ol className="mt-1 space-y-1">{items.map((x, i) => <li key={i}><span className="chip mr-2 border-sand bg-linen text-bark">{i}</span>{x[locale]}</li>)}</ol></div>
  );
  return (
    <ParentShell t={t} active="library">
      <Link href={`/library/journey${q}`} className="btn-ghost">← {L.journey.allStages}</Link>
      <article className="mt-3 space-y-6" data-testid="journey" data-stage={stage}>
        <header>
          <p className="text-sm font-semibold text-sage-dark">{L.stageName[stage as Stage]} · {L.journey.screen[j.screen]}</p>
          <h1 className="h1">{j.title[locale]}</h1>
          <p className="mt-2 max-w-prose text-lg">{j.experience[locale]}</p>
        </header>
        <section className="card" aria-labelledby="strands-h">
          <h2 id="strands-h" className="h2">{L.journey.strands}</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {STRANDS.map((s) => (
              <div key={s} className="rounded-xl bg-linen p-3" data-strand={s}>
                <dt className="font-bold">{L.strand[s]}</dt>
                <dd>{j.strands[s][locale]}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card space-y-4" aria-labelledby="routines-h">
          <h2 id="routines-h" className="h2">{L.journey.routines}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {j.routines.map((r, i) => (
              <div key={i}><h3 className="font-bold">{r.title[locale]}</h3><ol className="mt-1 list-decimal space-y-1 pl-6">{r.steps.map((s, k) => <li key={k}>{s[locale]}</li>)}</ol></div>
            ))}
          </div>
        </section>
        <section className="card space-y-3" aria-labelledby="anybook-h">
          <h2 id="anybook-h" className="h2">{L.journey.anyBook}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {list(L.before, j.anyBookPrompts.before)}
            {list(L.during, j.anyBookPrompts.during)}
            {list(L.after, j.anyBookPrompts.after)}
          </div>
        </section>
        <section className="card space-y-4" aria-labelledby="rubric-h" data-testid="rubric">
          <h2 id="rubric-h" className="h2">{L.journey.rubric}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {rubric(L.journey.listening, j.rubric.listening)}
            {j.rubric.decoding ? rubric(L.journey.decoding, j.rubric.decoding) : <p className="muted">{L.journey.decodingNA}</p>}
          </div>
        </section>
        {stagePassages.length > 0 && (
          <section className="card" aria-labelledby="practice-h">
            <h2 id="practice-h" className="h2">{L.journey.practice}</h2>
            <ul className="mt-2 space-y-2">{stagePassages.map((p) => <li key={p!.id}><Link className="link" href={`/library/passage/${p!.id}${q}`}>{p!.title[locale]}</Link>{p!.reviewStatus !== 'reviewed' && p!.reviewStatus !== 'published' && <span className="chip ml-2 border-clay bg-clay-light text-clay-dark">{L.previewBadge}</span>}</li>)}</ul>
          </section>
        )}
        {stageBooks.length > 0 && (
          <section aria-labelledby="books-h">
            <h2 id="books-h" className="h2">{L.journey.books}</h2>
            <ul className="mt-3 grid gap-4 md:grid-cols-2">{stageBooks.map((b) => <BookCard key={b.id} book={b} t={t} locale={locale} href={`/library/${b.id}${q}`} />)}</ul>
          </section>
        )}
      </article>
    </ParentShell>
  );
}
