import Link from 'next/link';
import { notFound } from 'next/navigation';
import { passageForClient } from '@atlas/curriculum';
import { ChildShell } from '@/components/child/child-shell';
import { Comprehension } from '@/components/library/comprehension';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireChildPage } from '@/lib/server/guards';
import { passagesForChild, readingStage } from '@/lib/server/library';

export const metadata = { title: 'Reading practice' };
export const dynamic = 'force-dynamic';

export default async function ReadPassagePage({ params }: { params: Promise<{ passageId: string }> }) {
  const { child } = await requireChildPage();
  const { passageId } = await params;
  const passage = passagesForChild(readingStage(child)).find((p) => p.id === passageId);
  if (!passage) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const C = t.library.child;
  const view = passageForClient(passage, locale); // no answer key, choices in display order
  return (
    <ChildShell reducedMotion={child.reducedMotion}>
      <Link href="/learn/library" className="btn-ghost">← {C.back}</Link>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <article className="card space-y-4" data-testid="passage">
          <h1 className="text-3xl font-bold">{view.title}</h1>
          {view.paragraphs.map((para, i) => (
            <p key={i} className="text-xl leading-relaxed" id={`para-${i + 1}`}>
              <span className="chip mr-2 border-sand bg-linen text-bark" aria-label={fmt(C.paragraph, { n: i + 1 })}>{i + 1}</span>
              {para}
            </p>
          ))}
        </article>
        <Comprehension passageId={view.id} questions={view.questions} />
      </div>
    </ChildShell>
  );
}
