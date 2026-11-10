import Link from 'next/link';
import { ChildShell } from '@/components/child/child-shell';
import { BookCover } from '@/components/library/book-cover';
import { getDictionary } from '@/lib/i18n';
import { currentLocale, requireChildPage } from '@/lib/server/guards';
import { childShelf, journeyFor, passagesForChild, readingStage } from '@/lib/server/library';

export const metadata = { title: 'Reading Garden' };
export const dynamic = 'force-dynamic';

/** Child view: only books a grown-up put on this child's shelf, plus reading practice for their stage. */
export default async function ChildLibraryPage() {
  const { child } = await requireChildPage();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const C = t.library.child;
  const stage = readingStage(child);
  const journey = journeyFor(stage);
  const shelf = await childShelf(child.id);
  const practice = passagesForChild(stage);
  return (
    <ChildShell reducedMotion={child.reducedMotion}>
      <Link href="/learn" className="btn-ghost">← {t.app.back}</Link>
      <h1 className="mt-2 text-3xl font-bold">{C.title}</h1>
      <section className="mt-6" aria-labelledby="my-shelf" data-testid="child-shelf">
        <h2 id="my-shelf" className="text-2xl font-bold">{C.shelf}</h2>
        {shelf.length === 0 ? <p className="card mt-3 text-lg">{C.shelfEmpty}</p> : (
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shelf.map((b) => (
              <li key={b.id} data-book={b.id}>
                <Link href={`/learn/library/${b.id}`} className="card flex h-full flex-col items-center gap-3 text-center transition-transform duration-calm hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus">
                  <BookCover id={b.id} title={b.title} topic={b.topics[0]!} size="md" />
                  <span className="text-lg font-bold">{b.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      {journey.screen !== 'none' && (
        <section className="mt-8" aria-labelledby="practice-h" data-testid="child-practice">
          <h2 id="practice-h" className="text-2xl font-bold">{C.practice}</h2>
          {practice.length === 0 ? <p className="card mt-3 text-lg">{C.practiceEmpty}</p> : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {practice.map((p) => (
                <li key={p.id} className="card flex flex-col gap-3" data-passage={p.id}>
                  <h3 className="text-2xl font-bold">{p.title[locale]}</h3>
                  <Link href={`/learn/library/read/${p.id}`} className="btn-primary btn-xl w-fit">{C.read}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </ChildShell>
  );
}
