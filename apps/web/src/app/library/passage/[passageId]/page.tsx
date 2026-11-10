import Link from 'next/link';
import { notFound } from 'next/navigation';
import { choiceOrder } from '@atlas/curriculum';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { libraryView } from '@/lib/server/library';

export const metadata = { title: 'Reading practice' };
export const dynamic = 'force-dynamic';

/** Parent review view of an Atlas-original passage, including the answer key (parent area only, PIN-gated). */
export default async function PassageReviewPage({ params, searchParams }: { params: Promise<{ passageId: string }>; searchParams: Promise<{ child?: string }> }) {
  await requireParentPage();
  const { passageId } = await params;
  const sp = await searchParams;
  const p = libraryView().passages.find((x) => x.id === passageId);
  if (!p) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const L = t.library;
  return (
    <ParentShell t={t} active="library">
      <Link href={`/library/journey/${p.stage}${sp.child ? `?child=${encodeURIComponent(sp.child)}` : ''}`} className="btn-ghost">← {L.stageName[p.stage]}</Link>
      <article className="card mx-auto mt-3 max-w-3xl space-y-5" data-testid="passage-review">
        <p className="text-sm font-semibold text-sage-dark">{L.stageName[p.stage]} · {L.passage.original}</p>
        <h1 className="h1">{p.title[locale]}</h1>
        {p.paragraphs[locale].map((para, i) => <p key={i} className="text-lg leading-relaxed"><span className="chip mr-2 border-sand bg-linen text-bark">{i + 1}</span>{para}</p>)}
        <h2 className="h2">{L.passage.questions}</h2>
        <ol className="space-y-4">
          {p.questions.map((q) => (
            <li key={q.id} className="rounded-xl bg-linen p-3">
              <p className="font-bold">{q.prompt[locale]}</p>
              <ul className="mt-1 list-disc pl-6">{choiceOrder(p, q.id).map((i) => <li key={i} className={i === q.answer ? 'font-bold' : ''}>{q.choices[locale][i]}{i === q.answer ? ` ✓ (${L.passage.answerKey})` : ''}</li>)}</ul>
              <p className="mt-1 text-sm muted">{fmt(L.passage.evidence, { n: q.evidenceParagraph + 1 })}</p>
            </li>
          ))}
        </ol>
      </article>
    </ParentShell>
  );
}
