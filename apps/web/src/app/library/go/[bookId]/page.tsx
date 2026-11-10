import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@atlas/database';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { libraryView, sourceHost } from '@/lib/server/library';

export const metadata = { title: 'Leaving Atlas' };
export const dynamic = 'force-dynamic';

/**
 * Interstitial before an external book site. The destination comes only from the reviewed catalog (no URL
 * parameter, so no open redirect), carries no child data, and opens without referrer or opener.
 */
export default async function LeavingPage({ params, searchParams }: { params: Promise<{ bookId: string }>; searchParams: Promise<{ child?: string }> }) {
  const auth = await requireParentPage();
  const { bookId } = await params;
  const sp = await searchParams;
  const book = libraryView().books.find((b) => b.id === bookId);
  if (!book) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const L = t.library;
  const host = sourceHost(book);
  const family = await prisma.family.findUniqueOrThrow({ where: { id: auth.family.id }, select: { libraryExternalLinks: true } });
  const back = `/library/${book.id}${sp.child ? `?child=${encodeURIComponent(sp.child)}` : ''}`;
  return (
    <ParentShell t={t} active="library">
      <section className="card mx-auto max-w-xl space-y-4" data-testid="leaving">
        <h1 className="h1">{L.leaving.title}</h1>
        <p className="text-lg font-semibold">{book.title}</p>
        {family.libraryExternalLinks ? (
          <>
            <p>{fmt(L.leaving.body, { host })}</p>
            <p className="break-all rounded-lg bg-linen p-3 font-mono text-sm">{book.sourcePageUrl}</p>
            <div className="flex flex-wrap gap-3">
              <a href={book.sourcePageUrl} target="_blank" rel="noopener noreferrer external" referrerPolicy="no-referrer" className="btn-primary" data-testid="external-link">
                {fmt(L.leaving.continue, { host })} <span className="sr-only">{L.leaving.newTab}</span>
              </a>
              <Link href={back} className="btn-ghost">{L.leaving.stay}</Link>
            </div>
          </>
        ) : (
          <>
            <p>{L.linksOff}</p>
            <Link href={back} className="btn-primary">{L.leaving.stay}</Link>
          </>
        )}
      </section>
    </ParentShell>
  );
}
