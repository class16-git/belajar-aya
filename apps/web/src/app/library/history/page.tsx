import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@atlas/database';
import { DeleteHistory } from '@/components/library/library-settings';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { getLibrary } from '@atlas/curriculum';

export const metadata = { title: 'Reading history' };
export const dynamic = 'force-dynamic';

export default async function ReadingHistoryPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const auth = await requireParentPage();
  const sp = await searchParams;
  const child = sp.child ? await prisma.childProfile.findFirst({ where: { id: sp.child, familyId: auth.family.id } }) : null;
  if (!child) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const L = t.library;
  const lib = getLibrary();
  const events = await prisma.readingEvent.findMany({ where: { childId: child.id }, orderBy: { observedAt: 'desc' }, take: 200 });
  const name = (e: { bookId: string | null; passageId: string | null }) =>
    e.bookId ? (lib.books.find((b) => b.id === e.bookId)?.title ?? e.bookId) : e.passageId ? (lib.passages.find((p) => p.id === e.passageId)?.title[locale] ?? e.passageId) : '—';
  return (
    <ParentShell t={t} active="library">
      <Link href={`/library?child=${child.id}`} className="btn-ghost">← {L.title}</Link>
      <h1 className="h1 mt-3">{L.history.title}: {child.nickname}</h1>
      {events.length === 0 ? <p className="card mt-6">{L.history.empty}</p> : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm" data-testid="reading-history">
            <thead><tr><th className="p-2">{L.history.when}</th><th className="p-2">{L.history.what}</th><th className="p-2">{L.history.item}</th><th className="p-2">{L.history.ratings}</th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-sand" data-kind={e.kind}>
                  <td className="p-2">{e.observedAt.toISOString().slice(0, 10)}</td>
                  <td className="p-2">{L.kinds[e.kind]}</td>
                  <td className="p-2">{name(e)}</td>
                  <td className="p-2">
                    {e.total !== null && fmt(L.history.score, { correct: e.correct ?? 0, total: e.total })}
                    {e.kind === 'COMPREHENSION_CHECK' && <span className="ml-2 chip border-sand bg-linen text-bark">{e.firstAttempt ? L.history.firstTry : L.history.review}</span>}
                    {e.listening !== null && <span className="mr-2">{L.record.listening}: {e.listening}</span>}
                    {e.decoding !== null && <span>{L.record.decoding}: {e.decoding}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6"><DeleteHistory childId={child.id} label={fmt(L.history.deleteAll, { name: child.nickname })} confirmText={fmt(L.history.confirm, { name: child.nickname })} /></div>
    </ParentShell>
  );
}
