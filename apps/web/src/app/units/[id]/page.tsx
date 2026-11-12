import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Unit } from '@atlas/curriculum';
import { BulletList, EntryBadges, Section } from '@/components/units/badges';
import { ArabicPhrases, Fact, Provenance } from '@/components/units/parts';
import { ParentShell } from '@/components/ui/parent-shell';
import { PrintControls } from '@/components/ui/print-controls';
import { fmt, getDictionary, type Dictionary } from '@/lib/i18n';
import { findExpansion, isReviewable } from '@/lib/server/expansion';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Unit guide' };
export const dynamic = 'force-dynamic';

const HAZARDS = ['chokingRisk', 'sharp', 'water', 'heat', 'allergens', 'electrical'] as const;
const LETTERS = ['A', 'B', 'C', 'D'];

/** Printable parent/teacher guide for one unit, with the assessment answer key. Parent area only. */
export default async function UnitGuidePage({ params }: { params: Promise<{ id: string }> }) {
  await requireParentPage();
  const { id } = await params;
  const e = await findExpansion(id);
  if (!e || e.kind !== 'unit') notFound();
  const u = e.item as Unit;
  const prereqTitles = new Map((await Promise.all(u.prerequisites.map(async (p) => [p, (await findExpansion(p))?.item.title] as const))).filter(([, t]) => t));
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const U = t.units;
  const G = U.guide;
  const L = (x: { en: string; id: string }) => x[locale];
  const Ls = (xs: { en: string; id: string }[]) => xs.map(L);
  const hazards = HAZARDS.filter((h) => u.safety.hazards[h]);
  const strand = U.strand[u.strand as keyof Dictionary['units']['strand']] ?? u.strand;

  return (
    <ParentShell t={t} active="units">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/units" className="btn-ghost">← {G.back}</Link>
        <PrintControls />
      </div>
      <article className="print-card mx-auto max-w-4xl space-y-6" data-testid="unit-guide" data-unit={u.id}>
        <header className="card print-card space-y-3">
          <p className="text-sm font-semibold text-sage-dark">{t.curriculum.stage[u.level]} · {U.framework[u.framework]} · {strand}</p>
          <h1 className="h1">{L(u.title)}</h1>
          <EntryBadges e={e} t={t} />
          <p className="rounded-xl bg-linen p-3 text-sm font-semibold" data-testid="parent-only-note"><span aria-hidden="true">🔒 </span>{G.parentOnly}</p>
          {e.religious && <p className="rounded-xl border-2 border-clay bg-clay-light/50 p-3 text-sm font-semibold">{G.religiousNote}</p>}
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Fact label={G.duration} value={fmt(U.minutes, u.durationMinutes)} />
            <Fact label={G.evidenceLabel} value={G.evidence[u.mastery.evidence]} />
            <Fact label={G.safety} value={G.supervision[u.safety.supervision]} />
            <Fact label={G.version} value={`v${u.version}`} />
          </dl>
          {isReviewable(e) && <Link href={`/review?item=${u.id}`} className="btn-secondary no-print w-fit">{G.reviewThis}</Link>}
        </header>

        <div className="card print-card space-y-6">
          <Section id="objective" title={G.objective}><p className="text-lg">{L(u.objective)}</p></Section>
          <Section id="rationale" title={G.rationale}><p>{L(u.rationale)}</p></Section>
          <div className="grid gap-6 md:grid-cols-2">
            <Section id="outcomes" title={G.outcomes}><BulletList items={Ls(u.outcomes)} /></Section>
            <Section id="success" title={G.successCriteria}>
              <ul className="space-y-1.5">{Ls(u.successCriteria).map((s, i) => <li key={i} className="flex gap-2"><span aria-hidden="true" className="text-sage-dark">☐</span><span>{s}</span></li>)}</ul>
            </Section>
          </div>
          <Section id="prerequisites" title={G.prerequisites}>
            {u.prerequisites.length === 0 ? <p className="muted">{G.noPrerequisites}</p> : (
              <ul className="flex flex-wrap gap-2">{u.prerequisites.map((p) => <li key={p}><Link href={`/units/${p}`} className="link break-all">{prereqTitles.get(p) ? L(prereqTitles.get(p)!) : p}</Link></li>)}</ul>
            )}
          </Section>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Section id="parent" title={G.parentInstructions} className="card print-card"><BulletList ordered items={Ls(u.parentInstructions)} /></Section>
          <Section id="child" title={G.childInstructions} className="card print-card">
            {u.childInstructions.length === 0 ? <p className="muted">{G.caregiverLed}</p> : (
              <ul className="space-y-2">{Ls(u.childInstructions).map((c, i) => <li key={i} className="rounded-xl bg-sage-light px-3 py-2 text-lg">{c}</li>)}</ul>
            )}
          </Section>
        </div>

        {u.cpa && (
          <Section id="cpa" title={G.cpa} className="card print-card">
            <ol className="grid gap-3 md:grid-cols-3">
              {(['concrete', 'pictorial', 'abstract'] as const).map((k, i) => (
                <li key={k} className="rounded-xl border border-sand bg-paper p-3" data-cpa={k}>
                  <p className="flex items-center gap-2 font-bold"><span className="chip border-sage-dark bg-sage-dark text-white" aria-hidden="true">{i + 1}</span>{G[k]}</p>
                  <BulletList items={Ls(u.cpa![k])} />
                </li>
              ))}
            </ol>
          </Section>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Section id="materials" title={G.materials} className="card print-card"><BulletList items={Ls(u.materials)} /></Section>
          <Section id="preparation" title={G.preparation} className="card print-card"><BulletList ordered items={Ls(u.preparation)} /></Section>
        </div>

        <Section id="safety" title={G.safety} className="rounded-xl2 border-2 border-clay bg-clay-light/50 p-5">
          <p className="font-semibold"><span aria-hidden="true">⚠ </span>{G.supervision[u.safety.supervision]}</p>
          <p className="mt-2 flex flex-wrap gap-1.5" data-testid="hazards">
            {hazards.length === 0 ? <span className="text-sm">{G.noHazards}</span> : hazards.map((h) => <span key={h} className="chip border-clay-dark bg-white text-clay-dark" data-hazard={h}><span aria-hidden="true">⚠</span>{G.hazard[h]}</span>)}
          </p>
          <div className="mt-2"><BulletList items={Ls(u.safety.notes)} /></div>
        </Section>

        <div className="card print-card space-y-6">
          <Section id="guided" title={G.guidedExamples}><BulletList ordered items={Ls(u.guidedExamples)} /></Section>
          <Section id="practice" title={G.practice}><BulletList ordered items={Ls(u.practice)} /></Section>
        </div>

        <Section id="assessment" title={G.assessment} className="card print-card">
          <ol className="space-y-4" data-testid="answer-key">
            {u.assessment.map((a, n) => (
              <li key={a.id} className="print-break-avoid rounded-xl border border-sand bg-paper p-4" data-item={a.id}>
                <p className="font-bold">{n + 1}. {L(a.prompt)}</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {a.choices[locale].map((c, i) => {
                    const code = a.distractorMisconceptions[String(i)];
                    const right = i === a.answer;
                    return (
                      <li key={i} className={`rounded-lg border px-3 py-1.5 ${right ? 'border-sage-dark bg-sage-light font-bold text-sage-dark' : 'border-sand bg-white'}`} data-correct={right || undefined}>
                        <span className="mr-1">{LETTERS[i]}.</span>{c}
                        {right && <span className="ml-1">✓ <span className="text-sm">({G.answerKey})</span></span>}
                        {code && <span className="mt-0.5 block text-xs font-normal text-clay-dark">{fmt(G.reveals, { code })}</span>}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-sm"><span className="font-semibold">{G.explanation}:</span> {L(a.explanation)}</p>
                {a.check && <p className="mt-1 text-sm muted"><span className="font-semibold">{G.check}:</span> <code className="break-all">{a.check.expression} = {a.check.result}</code></p>}
              </li>
            ))}
          </ol>
        </Section>

        <Section id="misconceptions" title={G.misconceptions} className="card print-card">
          <ul className="space-y-3">
            {u.misconceptions.map((m) => (
              <li key={m.code} className="print-break-avoid rounded-xl border-l-4 border-clay bg-paper p-3" data-misconception={m.code}>
                <p className="break-words font-mono text-xs text-clay-dark">{m.code}</p>
                <p className="font-semibold">{L(m.description)}</p>
                <p className="mt-1"><span className="font-semibold text-sage-dark">{G.remediation}:</span> {L(m.remediation)}</p>
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Section id="extension" title={G.extension} className="card print-card"><BulletList items={Ls(u.extension)} /></Section>
          <Section id="accessibility" title={G.accessibility} className="card print-card"><BulletList items={Ls(u.accessibility)} /></Section>
        </div>

        <Section id="mastery" title={G.mastery} className="card print-card">
          <p className="text-lg">{L(u.mastery.masteryRule)}</p>
          <p className="mt-2 flex flex-wrap gap-1.5 text-sm">
            <span className="chip border-sand bg-linen text-bark">{G.evidenceLabel}: {G.evidence[u.mastery.evidence]}</span>
            {u.mastery.reviewAfterDays.map((d) => <span key={d} className="chip border-sky bg-sky-light text-[#2f5370]">↻ {fmt(G.reviewAfter, { days: d })}</span>)}
          </p>
        </Section>

        {u.arabicPhrases.length > 0 && <ArabicPhrases phrases={u.arabicPhrases} t={t} locale={locale} />}

        <Section id="sources" title={G.sources} className="card print-card">
          <ul className="space-y-2 text-sm">
            {u.sources.map((s, i) => (
              <li key={i} className="break-words">
                <span className="chip mr-1 border-sand bg-linen text-bark">{G.sourceKind[s.kind]}</span>
                <span className="font-semibold">{s.title}</span>
                {s.url && <span className="block font-mono text-xs">{s.url}</span>}
                <span className={`chip ml-1 ${s.verification === 'verified' ? 'border-sage bg-sage-light text-sage-dark' : s.verification === 'unverified' ? 'border-clay bg-clay-light text-clay-dark' : 'border-sand bg-white text-muted'}`}>{G.verification[s.verification]}{s.verifiedBy ? ` — ${fmt(G.verifiedBy, { who: s.verifiedBy })}` : ''}</span>
                {s.note && <span className="mt-0.5 block muted">{s.note}</span>}
              </li>
            ))}
          </ul>
        </Section>

        <Provenance e={e} t={t} />
      </article>
    </ParentShell>
  );
}
