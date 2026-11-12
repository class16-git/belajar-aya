import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Reading } from '@atlas/curriculum';
import { BulletList, EntryBadges, Section } from '@/components/units/badges';
import { ArabicPhrases, Provenance } from '@/components/units/parts';
import { ParentShell } from '@/components/ui/parent-shell';
import { PrintControls } from '@/components/ui/print-controls';
import { fmt, getDictionary } from '@/lib/i18n';
import { findExpansion, isReviewable } from '@/lib/server/expansion';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Reading' };
export const dynamic = 'force-dynamic';

const LETTERS = ['A', 'B', 'C', 'D'];
const FACT_STYLE = {
  common_knowledge: 'border-sage bg-sage-light text-sage-dark',
  sourced: 'border-sage-dark bg-white text-sage-dark',
  invented_example: 'border-sky bg-sky-light text-[#2f5370]',
  needs_source: 'border-clay bg-clay-light text-clay-dark',
} as const;
const FACT_ICON = { common_knowledge: '✓', sourced: '✓', invented_example: '✎', needs_source: '!' } as const;

/** Parent view of an original reading, with answers. Parent area only. */
export default async function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireParentPage();
  const { id } = await params;
  const e = await findExpansion(id);
  if (!e || e.kind !== 'reading') notFound();
  const r = e.item as Reading;
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const U = t.units;
  const R = U.reading;
  const L = (x: { en: string; id: string }) => x[locale];
  const paragraphs = r.text[locale];
  const notes = r.readAloudNotes.map(L);
  const noteFor = (i: number) => (i === paragraphs.length - 1 ? notes.slice(i) : notes[i] ? [notes[i]!] : []);

  return (
    <ParentShell t={t} active="units">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/units?kind=readings" className="btn-ghost">← {R.back}</Link>
        <PrintControls />
      </div>
      <article className="mx-auto max-w-4xl space-y-6" data-testid="reading" data-reading={r.id}>
        <header className="card print-card space-y-3">
          <p className="text-sm font-semibold text-sage-dark">{t.curriculum.stage[r.level]} · {U.genre[r.genre]} · {U.readingLevel[r.readingLevel]}</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{L(r.title)}</h1>
          <p className="flex flex-wrap gap-1.5"><span className="chip border-bark bg-white text-bark">{U.mode[r.mode]}</span></p>
          <EntryBadges e={e} t={t} />
          <p className="rounded-xl bg-linen p-3 text-sm font-semibold"><span aria-hidden="true">🔒 </span>{U.guide.parentOnly}</p>
          {e.religious && <p className="rounded-xl border-2 border-clay bg-clay-light/50 p-3 text-sm font-semibold">{U.guide.religiousNote}</p>}
          {isReviewable(e) && <Link href={`/review?item=${r.id}`} className="btn-secondary no-print w-fit">{U.guide.reviewThis}</Link>}
        </header>

        <section className="card print-card" aria-labelledby="text-h" data-testid="reading-text">
          <h2 id="text-h" className="h2">{R.text}</h2>
          <ol className="mt-4 space-y-5">
            {paragraphs.map((p, i) => {
              const aside = noteFor(i);
              return (
                <li key={i} id={`p-${i + 1}`} className={`print-break-avoid grid gap-3 ${notes.length ? 'md:grid-cols-[minmax(0,1fr)_15rem]' : ''}`} data-paragraph={i + 1}>
                  <p className="flex gap-3 font-serif text-xl leading-relaxed text-ink">
                    <span className="mt-1 inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-linen px-2 font-sans text-sm font-bold text-bark" aria-label={fmt(R.paragraph, { n: i + 1 })}>{i + 1}</span>
                    <span>{p}</span>
                  </p>
                  {aside.length > 0 && (
                    <aside className="rounded-xl border-l-4 border-sky bg-sky-light/60 p-3 text-sm" aria-label={R.readAloud} data-testid="read-aloud-note">
                      <p className="font-semibold text-[#2f5370]"><span aria-hidden="true">🗣 </span>{R.readAloud}</p>
                      {aside.map((n, j) => <p key={j} className="mt-1">{n}</p>)}
                    </aside>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {r.sequenceCards.length > 0 && (
          <Section id="sequence" title={R.sequenceCards} className="card print-card">
            <p className="text-sm muted">{R.sequenceHint}</p>
            <ol className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="sequence-cards">
              {r.sequenceCards.map((c, i) => (
                <li key={i} className="print-break-avoid flex min-h-28 flex-col justify-between rounded-xl border-2 border-dashed border-sand bg-paper p-3">
                  <span className="chip w-fit border-bark bg-white text-bark">{i + 1}</span>
                  <span className="mt-2">{L(c)}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Section id="objectives" title={R.objectives} className="card print-card"><BulletList items={r.objectives.map(L)} /></Section>
          <Section id="vocabulary" title={R.vocabulary} className="card print-card">
            <dl className="space-y-2">
              {r.vocabulary.map((v, i) => (
                <div key={i} className="rounded-lg bg-paper p-2">
                  <dt className="font-bold">{L(v.word)}</dt>
                  <dd className="text-sm">{L(v.meaning)}</dd>
                </div>
              ))}
            </dl>
          </Section>
        </div>

        <Section id="questions" title={R.questions} className="card print-card">
          <ol className="space-y-4" data-testid="answer-key">
            {r.questions.map((q, n) => (
              <li key={q.id} className="print-break-avoid rounded-xl border border-sand bg-paper p-4" data-question={q.id}>
                <p className="text-xs font-semibold uppercase tracking-wide muted">{R.questionKind[q.kind]}</p>
                <p className="font-bold">{n + 1}. {L(q.prompt)}</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {q.choices[locale].map((c, i) => (
                    <li key={i} className={`rounded-lg border px-3 py-1.5 ${i === q.answer ? 'border-sage-dark bg-sage-light font-bold text-sage-dark' : 'border-sand bg-white'}`} data-correct={i === q.answer || undefined}>
                      <span className="mr-1">{LETTERS[i]}.</span>{c}{i === q.answer && <span className="ml-1">✓ <span className="text-sm">({U.guide.answerKey})</span></span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm"><a href={`#p-${q.evidenceParagraph + 1}`} className="link text-[#2f5370]">{fmt(R.evidenceIn, { n: q.evidenceParagraph + 1 })}</a></p>
                {q.check && <p className="mt-1 text-sm muted"><span className="font-semibold">{U.guide.check}:</span> <code className="break-all">{q.check.expression} = {q.check.result}</code></p>}
              </li>
            ))}
          </ol>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Section id="discussion" title={R.discussion} className="card print-card">
            <ul className="space-y-2">{r.discussionPrompts.map((d, i) => <li key={i} className="rounded-xl bg-linen px-3 py-2 italic">“{L(d)}”</li>)}</ul>
          </Section>
          <Section id="offline" title={R.offline} className="card print-card border-2 border-sage bg-sage-light/40"><p>{L(r.offlineActivity)}</p></Section>
        </div>

        {r.crossCurricular.length > 0 && (
          <Section id="cross" title={R.crossCurricular} className="card print-card">
            <ul className="grid gap-2 sm:grid-cols-2">
              {r.crossCurricular.map((c, i) => (
                <li key={i} className="rounded-lg bg-paper p-2"><span className="chip border-sky bg-sky-light text-[#2f5370]">{R.subject[c.subject]}</span><p className="mt-1 text-sm">{L(c.connection)}</p></li>
              ))}
            </ul>
          </Section>
        )}

        {r.safetyNotes.length > 0 && (
          <Section id="safety" title={R.safetyNotes} className="rounded-xl2 border-2 border-clay bg-clay-light/50 p-5"><BulletList items={r.safetyNotes.map(L)} /></Section>
        )}

        {r.arabicPhrases.length > 0 && <ArabicPhrases phrases={r.arabicPhrases} t={t} locale={locale} />}

        <Section id="facts" title={R.factChecks} className="card print-card">
          {r.factChecks.length === 0 ? <p className="muted">{R.noFactChecks}</p> : (
            <ul className="space-y-2 text-sm" data-testid="fact-checks">
              {r.factChecks.map((f, i) => (
                <li key={i} className="flex flex-col gap-1 rounded-lg bg-paper p-2 sm:flex-row sm:items-start sm:gap-3" data-fact-status={f.status}>
                  <span className={`chip w-fit shrink-0 ${FACT_STYLE[f.status]}`}><span aria-hidden="true">{FACT_ICON[f.status]}</span>{R.factStatus[f.status]}</span>
                  <span className="min-w-0 break-words">{f.claim}{f.source && <span className="block font-mono text-xs muted">{f.source.title} — {f.source.url}</span>}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Provenance e={e} t={t} />
      </article>
    </ParentShell>
  );
}
