import Link from 'next/link';
import { BOOK_TOPICS } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { STAGES, type Stage } from '@atlas/shared';
import { BookCard } from '@/components/library/book-card';
import { ExternalLinksToggle } from '@/components/library/library-settings';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { booksForStage, journeyFor, libraryView, readingStage } from '@/lib/server/library';

export const metadata = { title: 'Reading Garden' };
export const dynamic = 'force-dynamic';

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ child?: string; topic?: string; stage?: string }> }) {
  const auth = await requireParentPage();
  const sp = await searchParams;
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const L = t.library;
  const children = await prisma.childProfile.findMany({ where: { familyId: auth.family.id }, orderBy: { createdAt: 'asc' } });
  const child = children.find((c) => c.id === sp.child) ?? children[0] ?? null;
  const { books, lib } = libraryView();
  const family = await prisma.family.findUniqueOrThrow({ where: { id: auth.family.id }, select: { libraryExternalLinks: true } });
  const entries = child ? await prisma.shelfEntry.findMany({ where: { childId: child.id } }) : [];
  const stateOf = (id: string) => entries.find((e) => e.bookId === id)?.state ?? null;
  const stage: Stage | null = child ? readingStage(child) : null;
  const journey = stage ? journeyFor(stage) : null;
  const shelf = books.filter((b) => stateOf(b.id) === 'ON_SHELF');
  const suggested = stage ? booksForStage(books, stage).filter((b) => !stateOf(b.id)).slice(0, 4) : [];
  const topic = (BOOK_TOPICS as readonly string[]).includes(sp.topic ?? '') ? sp.topic : undefined;
  const stageFilter = (STAGES as readonly string[]).includes(sp.stage ?? '') ? (sp.stage as Stage) : undefined;
  const filtered = books.filter((b) => (!topic || b.topics.includes(topic as never)) && (!stageFilter || b.stages.includes(stageFilter)) && stateOf(b.id) !== 'HIDDEN');
  const href = (id: string) => `/library/${id}${child ? `?child=${child.id}` : ''}`;
  const awaiting = lib.books.filter((b) => b.publicationStatus !== 'withdrawn' && b.publicationStatus !== 'published').length;

  return (
    <ParentShell t={t} active="library">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">{L.title}</h1>
          <p className="mt-2 max-w-prose">{L.intro}</p>
        </div>
        <Link href={`/library/journey${child ? `?child=${child.id}` : ''}`} className="btn-secondary">{L.journey.title}</Link>
      </div>

      {children.length === 0 ? (
        <p className="card mt-6">{L.noChildren}</p>
      ) : (
        <nav aria-label={L.readingFor} className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-semibold">{L.readingFor}:</span>
          {children.map((c) => (
            <Link key={c.id} href={`/library?child=${c.id}`} aria-current={c.id === child?.id ? 'page' : undefined} className={`chip min-h-11 px-4 ${c.id === child?.id ? 'border-bark bg-bark text-white' : 'border-sand bg-white text-bark'}`}>{c.nickname}</Link>
          ))}
        </nav>
      )}

      {child && journey && stage && (
        <section className="card mt-6 border-2 border-sage-dark bg-sage-light/40" aria-labelledby="journey-h" data-testid="journey-card" data-stage={stage}>
          <h2 id="journey-h" className="h2">{fmt(L.journeyCard, { name: child.nickname, stage: L.stageName[stage] })}</h2>
          <p className="mt-1">{journey.experience[locale]}</p>
          <p className="mt-1 text-sm font-semibold">{L.journey.screen[journey.screen]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/library/journey/${stage}?child=${child.id}`} className="btn-primary">{L.seeJourney}</Link>
            <Link href={`/library/history?child=${child.id}`} className="btn-ghost">{L.history.title}</Link>
          </div>
        </section>
      )}

      {books.length === 0 && (
        <p className="card mt-6 border-2 border-clay bg-clay-light/40" data-testid="library-empty">{L.noBooks} {awaiting > 0 && fmt(L.awaitingReview, { n: awaiting })}</p>
      )}

      {child && books.length > 0 && (
        <section className="mt-8" aria-labelledby="shelf-h" data-testid="parent-shelf">
          <h2 id="shelf-h" className="h2">{fmt(L.shelfTitle, { name: child.nickname })}</h2>
          {shelf.length === 0 ? <p className="mt-2 muted">{fmt(L.shelfEmpty, { name: child.nickname })}</p> : (
            <ul className="mt-3 grid gap-4 md:grid-cols-2">{shelf.map((b) => <BookCard key={b.id} book={b} t={t} locale={locale} href={href(b.id)} />)}</ul>
          )}
        </section>
      )}

      {suggested.length > 0 && (
        <section className="mt-8" aria-labelledby="suggested-h" data-testid="suggested">
          <h2 id="suggested-h" className="h2">{L.suggested}</h2>
          <ul className="mt-3 grid gap-4 md:grid-cols-2">{suggested.map((b) => <BookCard key={b.id} book={b} t={t} locale={locale} href={href(b.id)} />)}</ul>
        </section>
      )}

      {books.length > 0 && (
        <section className="mt-8" aria-labelledby="all-h">
          <h2 id="all-h" className="h2">{L.allBooks}</h2>
          <form method="get" className="mt-3 flex flex-wrap items-end gap-3" aria-label={L.filters}>
            {child && <input type="hidden" name="child" value={child.id} />}
            <label className="block">
              <span className="text-sm font-semibold">{L.filterTopic}</span>
              <select name="topic" defaultValue={topic ?? ''} className="input mt-1 w-44">
                <option value="">{L.any}</option>
                {BOOK_TOPICS.filter((x) => books.some((b) => b.topics.includes(x))).map((x) => <option key={x} value={x}>{L.topic[x]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">{L.filterStage}</span>
              <select name="stage" defaultValue={stageFilter ?? ''} className="input mt-1 w-44">
                <option value="">{L.any}</option>
                {STAGES.filter((s) => books.some((b) => b.stages.includes(s))).map((s) => <option key={s} value={s}>{L.stageName[s]}</option>)}
              </select>
            </label>
            <button type="submit" className="btn-secondary">{L.apply}</button>
            {(topic || stageFilter) && <Link href={`/library${child ? `?child=${child.id}` : ''}`} className="btn-ghost">{L.clear}</Link>}
          </form>
          {filtered.length === 0 ? <p className="mt-3 muted">{L.noResults}</p> : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="all-books">{filtered.map((b) => <BookCard key={b.id} book={b} t={t} locale={locale} href={href(b.id)} />)}</ul>
          )}
        </section>
      )}

      <section className="card mt-8" aria-labelledby="settings-h">
        <h2 id="settings-h" className="h2">{L.settings.title}</h2>
        <div className="mt-2"><ExternalLinksToggle initial={family.libraryExternalLinks} /></div>
      </section>
    </ParentShell>
  );
}
