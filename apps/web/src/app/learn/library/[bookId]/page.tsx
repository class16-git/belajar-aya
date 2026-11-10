import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@atlas/database';
import { ChildShell } from '@/components/child/child-shell';
import { FinishedButton, OpenWithGrownUp } from '@/components/library/child-book-actions';
import { BookCover } from '@/components/library/book-cover';
import { getDictionary } from '@/lib/i18n';
import { currentLocale, requireChildPage } from '@/lib/server/guards';
import { childShelf, sourceHost } from '@/lib/server/library';

export const metadata = { title: 'Book' };
export const dynamic = 'force-dynamic';

export default async function ChildBookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { auth, child } = await requireChildPage();
  const { bookId } = await params;
  const book = (await childShelf(child.id)).find((b) => b.id === bookId);
  if (!book) notFound(); // not on this child's shelf → indistinguishable from "does not exist"
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const C = t.library.child;
  const family = await prisma.family.findUniqueOrThrow({ where: { id: auth.family.id }, select: { libraryExternalLinks: true } });
  return (
    <ChildShell reducedMotion={child.reducedMotion}>
      <Link href="/learn/library" className="btn-ghost">← {C.back}</Link>
      <article className="card mt-3 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left" data-testid="child-book">
        <BookCover id={book.id} title={book.title} topic={book.topics[0]!} size="lg" />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-xl leading-relaxed">{book.synopsis[locale]}</p>
          <ul className="space-y-1 text-lg">{book.prompts.before.map((p, i) => <li key={i}>💭 {p[locale]}</li>)}</ul>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            {family.libraryExternalLinks ? <OpenWithGrownUp bookId={book.id} host={sourceHost(book)} /> : <p className="text-lg font-semibold">{C.linksOff}</p>}
            <FinishedButton bookId={book.id} />
          </div>
        </div>
      </article>
    </ChildShell>
  );
}
