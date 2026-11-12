import Link from 'next/link';
import type { Reading, Unit } from '@atlas/curriculum';
import type { Locale } from '@atlas/shared';
import { EntryBadges } from '@/components/units/badges';
import { ReviewDecisionForm } from '@/components/units/review-form';
import { Select } from '@/components/units/select';
import { STAGES } from '@atlas/shared';
import { UNIT_FRAMEWORKS } from '@atlas/curriculum';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary, type Dictionary } from '@/lib/i18n';
import { expansionView, isReviewable, type ExpansionEntry } from '@/lib/server/expansion';
import { currentLocale, requireParentPage } from '@/lib/server/guards';
import { familyDecisions, latestByItem } from '@/lib/server/review';

export const metadata = { title: 'Review queue' };
export const dynamic = 'force-dynamic';

const day = (d: Date) => d.toISOString().slice(0, 10);

/** Human review queue for expansion content. Decisions are stored per family (ContentReviewDecision). */
const PAGE_SIZE = 10;
type SP = { kind?: string; level?: string; framework?: string; decided?: string; page?: string; item?: string };
const pick = <T extends string>(xs: readonly T[], v?: string) => (xs as readonly string[]).includes(v ?? '') ? (v as T) : undefined;

export default async function ReviewPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const auth = await requireParentPage();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const R = t.review;
  const { units, readings } = await expansionView();
  const all = [...units, ...readings];
  const rows = await familyDecisions(auth.family.id);
  const latest = latestByItem(rows);
  // Batch review: filter by kind, level and framework, hide items already decided, 10 per page.
  const kind = pick(['units', 'readings', 'islamic'] as const, sp.kind);
  const level = pick(STAGES, sp.level);
  const framework = pick(UNIT_FRAMEWORKS, sp.framework);
  const decided = sp.decided === 'all' ? 'all' : 'undecided';
  const isIslamic = (e: ExpansionEntry) => ('framework' in e.item && e.item.framework === 'islamic') || ('crossCurricular' in e.item && e.item.crossCurricular.some((c) => c.subject === 'islamic_values'));
  const reviewable = all.filter((e) => isReviewable(e) && e.errors.length === 0);
  const single = sp.item ? reviewable.filter((e) => e.item.id === sp.item) : null; // deep link to one item (decided or not)
  const matching = single ?? reviewable.filter(
    (e) =>
      (!kind || (kind === 'units' ? e.item.id.startsWith('unit-') : kind === 'readings' ? e.item.id.startsWith('reading-') : isIslamic(e))) &&
      (!level || e.item.level === level) &&
      (!framework || ('framework' in e.item && e.item.framework === framework)) &&
      (decided === 'all' || !latest.has(e.item.id)),
  );
  const pages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1));
  const queue = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const qs = (p: number) => `?${new URLSearchParams({ ...(kind ? { kind } : {}), ...(level ? { level } : {}), ...(framework ? { framework } : {}), ...(decided === 'all' ? { decided } : {}), page: String(p) })}`;
  const U = t.units;
  const titleOf = (id: string) => all.find((e) => e.item.id === id)?.item.title[locale] ?? id;

  return (
    <ParentShell t={t} active="review">
      <h1 className="h1">{R.title}</h1>
      <p className="mt-2 max-w-prose">{R.intro}</p>

      <form method="get" className="card mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]" aria-label={U.filters} data-testid="review-filters">
        <Select name="kind" label={U.filterKind} value={kind ?? ''} any={U.kind.all} options={[['units', U.kind.units], ['readings', U.kind.readings], ['islamic', R.islamicOnly]]} />
        <Select name="level" label={U.filterLevel} value={level ?? ''} any={U.any} options={STAGES.map((s) => [s, t.curriculum.stage[s]])} />
        <Select name="framework" label={U.filterFramework} value={framework ?? ''} any={U.any} options={UNIT_FRAMEWORKS.map((f) => [f, U.framework[f]])} />
        <Select name="decided" label={R.filterDecided} value={decided === 'all' ? 'all' : ''} any={R.undecidedOnly} options={[['all', R.includeDecided]]} />
        <div className="flex flex-wrap items-end gap-2">
          <button type="submit" className="btn-secondary">{U.apply}</button>
          <Link href="/review" className="btn-ghost">{U.clear}</Link>
        </div>
      </form>
      <p className="mt-3 text-sm muted" data-testid="review-count">{fmt(R.showing, { n: queue.length, total: matching.length, all: reviewable.length, page, pages })}</p>

      {queue.length === 0 ? <p className="card mt-6">{R.empty}</p> : (
        <ul className="mt-6 space-y-5" data-testid="review-queue">
          {queue.map((e) => <QueueItem key={e.item.id} e={e} t={t} locale={locale} latest={latest.get(e.item.id)} />)}
        </ul>
      )}
      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-3" aria-label={R.pagination} data-testid="review-pagination">
          {page > 1 ? <Link href={qs(page - 1)} className="btn-secondary">← {R.prev}</Link> : <span />}
          <span className="text-sm">{fmt(R.pageOf, { page, pages })}</span>
          {page < pages ? <Link href={qs(page + 1)} className="btn-secondary">{R.next} →</Link> : <span />}
        </nav>
      )}

      <section className="card mt-8" aria-labelledby="history-h" data-testid="decision-history">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="history-h" className="h2">{R.historyTitle}</h2>
          <a href="/api/review/export" className="btn-secondary" download>⤓ {R.export}</a>
        </div>
        {rows.length === 0 ? <p className="mt-2 muted">{R.historyEmpty}</p> : (
          <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label={R.historyTitle}>
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead><tr className="border-b border-sand"><th scope="col" className="py-2 pr-3">{R.colItem}</th><th scope="col" className="py-2 pr-3">{R.colDecision}</th><th scope="col" className="py-2 pr-3">{R.colWho}</th><th scope="col" className="py-2 pr-3">{R.colDate}</th><th scope="col" className="py-2">{R.colNote}</th></tr></thead>
              <tbody>
                {[...rows].reverse().map((r, i) => (
                  <tr key={i} className="border-b border-sand/60 align-top" data-decision={r.decision} data-item={r.itemId}>
                    <td className="py-2 pr-3"><span className="font-semibold">{titleOf(r.itemId)}</span><span className="block text-xs muted">{r.itemId} · v{r.itemVersion}</span></td>
                    <td className="py-2 pr-3">{r.decision === 'approve' ? '✓' : '✕'} {R.decision[r.decision]}</td>
                    <td className="py-2 pr-3">{r.reviewerName} ({R.role[r.reviewerRole]})</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{day(r.createdAt)}</td>
                    <td className="py-2 break-words">{r.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 rounded-xl bg-linen p-3 text-sm">
          <p className="font-semibold">{R.applyTitle}</p>
          <p className="mt-1">{R.applyBody}</p>
          <pre className="mt-2 whitespace-pre-wrap break-all rounded-lg bg-white p-2 text-xs">node apps/web/scripts/apply-reviews.mjs atlas-review-decisions.json</pre>
        </div>
      </section>
    </ParentShell>
  );
}

function QueueItem({ e, t, locale, latest }: { e: ExpansionEntry; t: Dictionary; locale: Locale; latest?: Awaited<ReturnType<typeof familyDecisions>>[number] }) {
  const R = t.review;
  const x = e.item;
  const isUnit = e.kind === 'unit';
  const summary = isUnit ? (x as Unit).objective[locale] : (x as Reading).objectives[0]![locale];
  const meta = isUnit ? `${t.units.framework[(x as Unit).framework]}` : `${t.units.genre[(x as Reading).genre]} · ${t.units.mode[(x as Reading).mode]}`;
  const openSources = 'factChecks' in x ? x.factChecks.filter((f) => f.status === 'needs_source').length : 0;
  const href = isUnit ? `/units/${x.id}` : `/readings/${x.id}`;
  return (
    <li id={x.id} className="card scroll-mt-4" data-review-item={x.id} data-kind={e.kind}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sage-dark">{isUnit ? t.units.unitsHeading : t.units.readingsHeading} · {t.curriculum.stage[x.level]} · {meta}</p>
          <h2 className="text-xl font-bold">{x.title[locale]}</h2>
          <p className="break-all text-xs muted">{x.id} · v{x.version}</p>
        </div>
        <Link href={href} className="btn-secondary" aria-label={`${R.openItem}: ${x.title[locale]}`}>{R.openItem}</Link>
      </div>
      <p className="mt-2">{summary}</p>
      <div className="mt-2"><EntryBadges e={e} t={t} /></div>

      <div className="mt-3 rounded-xl border border-sage bg-sage-light/40 p-3 text-sm" data-testid="validator-evidence">
        <p className="font-semibold">{R.evidence}</p>
        <p className="mt-1 flex flex-wrap gap-1.5">
          <span className="chip border-sage-dark bg-white text-sage-dark" data-testid="zero-errors">✓ {R.zeroErrors}</span>
          {x.review.agentChecks.map((c) => <span key={c} className="chip border-sage bg-white text-sage-dark">✓ {c}</span>)}
        </p>
        {x.review.agentChecks.length === 0 && <p className="mt-1 muted">{R.noAgentChecks}</p>}
        <p className="mt-2"><span className="font-semibold">{R.flags}:</span> {x.reviewFlags.length ? x.reviewFlags.join(' · ') : R.noFlags}</p>
        {openSources > 0 && <p className="mt-1 font-semibold text-clay-dark">! {fmt(R.openSources, { n: openSources })}</p>}
      </div>

      {e.religious && <p className="mt-3 rounded-xl border-2 border-clay bg-clay-light/50 p-3 text-sm font-semibold" data-testid="scholar-notice">☪ {R.scholarNotice}</p>}

      {latest && (
        <p className="mt-3 text-sm font-semibold" data-testid="latest-decision" data-decision={latest.decision}>
          {latest.decision === 'approve' ? '✓' : '✕'} {fmt(R.latest, { decision: R.decision[latest.decision], who: latest.reviewerName, role: R.role[latest.reviewerRole], date: day(latest.createdAt) })}
        </p>
      )}
      <ReviewDecisionForm itemId={x.id} itemVersion={x.version} title={x.title[locale]} />
    </li>
  );
}
