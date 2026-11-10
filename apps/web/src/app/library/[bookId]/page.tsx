import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@atlas/database';
import { BookCover } from '@/components/library/book-cover';
import { RecordReading } from '@/components/library/record-reading';
import { ShelfControls } from '@/components/library/shelf-controls';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { localToday } from '@/lib/server/dates';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { journeyFor, libraryView, readingStage, sourceHost } from '@/lib/server/library';

export const metadata = { title: 'Book' };
export const dynamic = 'force-dynamic';

export default async function BookPage({ params, searchParams }: { params: Promise<{ bookId: string }>; searchParams: Promise<{ child?: string }> }) {
  const auth = await requireParentPage();
  const { bookId } = await params;
  const sp = await searchParams;
  const { books, sources } = libraryView();
  const book = books.find((b) => b.id === bookId);
  if (!book) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const L = t.library;
  const children = await prisma.childProfile.findMany({ where: { familyId: auth.family.id }, orderBy: { createdAt: 'asc' } });
  const child = children.find((c) => c.id === sp.child) ?? children[0] ?? null;
  const entry = child ? await prisma.shelfEntry.findUnique({ where: { childId_bookId: { childId: child.id, bookId } } }) : null;
  const family = await prisma.family.findUniqueOrThrow({ where: { id: auth.family.id }, select: { libraryExternalLinks: true } });
  const source = sources.find((s) => s.id === book.sourceId)!;
  const host = sourceHost(book);
  const journey = child ? journeyFor(readingStage(child)) : null;
  const q = child ? `?child=${child.id}` : '';
  const list = (title: string, items: { en: string; id: string }[]) => (
    <div>
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-6">{items.map((x, i) => <li key={i}>{x[locale]}</li>)}</ul>
    </div>
  );

  return (
    <ParentShell t={t} active="library">
      <Link href={`/library${q}`} className="btn-ghost">← {t.app.back}</Link>
      <article className="mt-3 space-y-6" data-testid="book-detail" data-book={book.id}>
        <header className="card flex flex-col gap-5 sm:flex-row">
          <BookCover id={book.id} title={book.title} topic={book.topics[0]!} size="lg" />
          <div className="space-y-3">
            <h1 className="h1">{book.title}</h1>
            <p className="text-lg">{book.synopsis[locale]}</p>
            <p className="flex flex-wrap gap-1.5">
              {book.stages.map((s) => <span key={s} className="chip border-sand bg-linen text-bark">{L.stageName[s]}</span>)}
              {book.topics.map((x) => <span key={x} className="chip border-sand bg-white text-bark">{L.topic[x]}</span>)}
              <span className="chip border-sky bg-sky-light text-[#2f5370]">{L.role[book.role]}</span>
              <span className="chip border-bark bg-white text-bark">{L.linkOnlyBadge}</span>
            </p>
            {book.publicationStatus !== 'published' && <p className="chip w-fit border-clay bg-clay-light text-clay-dark">{L.previewBadge}</p>}
            {book.sensitiveThemes.length > 0 && (
              <p className="rounded-xl border-2 border-clay bg-clay-light/50 p-3 font-semibold" data-testid="sensitive">
                {fmt(L.readFirst, { themes: book.sensitiveThemes.map((x) => L.theme[x]).join(', ') })}
              </p>
            )}
            {child && <ShelfControls childId={child.id} childName={child.nickname} bookId={book.id} initial={entry?.state ?? null} />}
            {family.libraryExternalLinks ? (
              <Link href={`/library/go/${book.id}${q}`} className="btn-secondary w-fit">{fmt(L.open, { host })} ↗</Link>
            ) : (
              <p className="text-sm muted">{L.linksOff}</p>
            )}
          </div>
        </header>

        <section className="card space-y-4" aria-labelledby="read-h">
          <h2 id="read-h" className="h2">{L.talk}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {list(L.before, book.prompts.before)}
            {list(L.during, book.prompts.during)}
            {list(L.after, book.prompts.after)}
          </div>
        </section>

        <section className="card space-y-3" aria-labelledby="beyond-h">
          <h2 id="beyond-h" className="h2">{L.beyond}</h2>
          <p><span className="font-semibold">{L.montessori}:</span> {book.extensions.montessori[locale]}</p>
          {book.extensions.maths && <p><span className="font-semibold">{L.maths}:</span> {book.extensions.maths[locale]}</p>}
          {book.extensions.stem && <p><span className="font-semibold">{L.stem}:</span> {book.extensions.stem[locale]}</p>}
        </section>

        {child && journey && (
          <section className="card space-y-3" aria-labelledby="record-h">
            <h2 id="record-h" className="h2">{L.record.title} — {child.nickname}</h2>
            <RecordReading childId={child.id} bookId={book.id} listening={journey.rubric.listening} decoding={journey.rubric.decoding} today={localToday(child.timezone)} />
          </section>
        )}

        <section className="card space-y-3 text-sm" aria-labelledby="rights-h" data-testid="rights-panel">
          <h2 id="rights-h" className="h2">{L.rights.title}</h2>
          <p className="font-semibold">{fmt(L.rights.linkOnly, { host })}</p>
          <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[12rem_1fr]">
            <dt className="font-semibold">{L.credits}</dt>
            <dd>{book.creators.map((c) => `${c.name} (${L.creatorRole[c.role]})`).join(', ')}</dd>
            <dt className="font-semibold">{L.language}</dt>
            <dd>{L.languageName[book.language as 'en' | 'id'] ?? book.language}</dd>
            {book.otherLanguagesListed.length > 0 && (<><dt className="font-semibold">{L.alsoListed}</dt><dd>{book.otherLanguagesListed.join(', ')}</dd></>)}
            {book.isbn && (<><dt className="font-semibold">{L.isbn}</dt><dd>{book.isbn}</dd></>)}
            <dt className="font-semibold">{L.rights.sourceLicense}</dt>
            <dd>{book.rights.sourceLicense ?? '—'} ({source.name})</dd>
            <dt className="font-semibold">{L.rights.attribution}</dt>
            <dd>{book.rights.attributionText}</dd>
            <dt className="font-semibold">{L.rights.review}</dt>
            <dd>{book.educationalReview ? fmt(L.rights.reviewedBy, { who: book.educationalReview.reviewedBy, date: book.educationalReview.reviewedAt }) : L.rights.notReviewed}</dd>
          </dl>
          {!book.rights.titleLicenseConfirmed && <p className="rounded-lg bg-linen p-3">{L.rights.titleUnconfirmed}</p>}
          <div>
            <h3 className="font-bold">{L.rights.evidence}</h3>
            <ul className="mt-1 space-y-2">
              {book.rights.evidence.map((e, i) => (
                <li key={i} className="break-words">
                  <span className="font-mono text-xs">{e.url}</span> — {fmt(L.rights.checked, { date: e.checkedAt })}
                  {e.quote && <blockquote className="mt-1 border-l-4 border-sand pl-3 italic">{e.quote}</blockquote>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    </ParentShell>
  );
}
