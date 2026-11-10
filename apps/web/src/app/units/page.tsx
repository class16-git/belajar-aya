import Link from 'next/link';
import { READING_GENRES, UNIT_FRAMEWORKS, type PipelineState, type Reading, type Unit } from '@atlas/curriculum';
import { STAGES, type Locale } from '@atlas/shared';
import { EntryBadges } from '@/components/units/badges';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary, type Dictionary } from '@/lib/i18n';
import { expansionView, type ExpansionEntry } from '@/lib/server/expansion';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Units and readings' };
export const dynamic = 'force-dynamic';

const STATES: readonly PipelineState[] = ['subject_validated', 'human_reviewed', 'published', 'rejected', 'structurally_validated'];
const KINDS = ['all', 'units', 'readings'] as const;
type Kind = (typeof KINDS)[number];
const pick = <T extends string>(list: readonly T[], v: string | undefined): T | undefined => (list as readonly string[]).includes(v ?? '') ? (v as T) : undefined;

type SP = { kind?: string; level?: string; framework?: string; genre?: string; status?: string };

/** Parent-only browser of expansion units and readings. All filtering is server-side via GET query params. */
export default async function UnitsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireParentPage();
  const sp = await searchParams;
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const U = t.units;
  const { units, readings } = expansionView();
  const kind: Kind = pick(KINDS, sp.kind) ?? 'all';
  const level = pick(STAGES, sp.level);
  const framework = pick(UNIT_FRAMEWORKS, sp.framework);
  const genre = pick(READING_GENRES, sp.genre);
  const status = pick(STATES, sp.status);
  const common = (e: ExpansionEntry) => (!level || e.item.level === level) && (!status || e.state === status);
  const byLevel = (a: ExpansionEntry, b: ExpansionEntry) => STAGES.indexOf(a.item.level) - STAGES.indexOf(b.item.level) || a.item.id.localeCompare(b.item.id);
  const shownUnits = kind === 'readings' ? [] : units.filter((e) => common(e) && (!framework || (e.item as Unit).framework === framework)).sort(byLevel);
  const shownReadings = kind === 'units' ? [] : readings.filter((e) => common(e) && (!genre || (e.item as Reading).genre === genre)).sort(byLevel);
  const levels = STAGES.filter((s) => [...units, ...readings].some((e) => e.item.level === s));
  const filtered = kind !== 'all' || level || framework || genre || status;

  return (
    <ParentShell t={t} active="units">
      <h1 className="h1">{U.title}</h1>
      <p className="mt-2 max-w-prose">{U.intro}</p>
      <p className="mt-3 max-w-prose rounded-xl border-2 border-sky bg-sky-light p-3 text-sm" data-testid="review-context">{U.reviewContext}</p>

      <form method="get" className="card mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]" aria-label={U.filters} data-testid="unit-filters">
        <Select name="kind" label={U.filterKind} value={kind} options={KINDS.map((k) => [k, U.kind[k]])} />
        <Select name="level" label={U.filterLevel} value={level ?? ''} any={U.any} options={levels.map((s) => [s, t.curriculum.stage[s]])} />
        <Select name="framework" label={U.filterFramework} value={framework ?? ''} any={U.any} options={UNIT_FRAMEWORKS.map((f) => [f, U.framework[f]])} />
        <Select name="genre" label={U.filterGenre} value={genre ?? ''} any={U.any} options={READING_GENRES.map((g) => [g, U.genre[g]])} />
        <Select name="status" label={U.filterStatus} value={status ?? ''} any={U.any} options={STATES.map((s) => [s, U.state[s]])} />
        <div className="flex flex-wrap items-end gap-2">
          <button type="submit" className="btn-secondary">{U.apply}</button>
          {filtered && <Link href="/units" className="btn-ghost">{U.clear}</Link>}
        </div>
      </form>

      {kind !== 'readings' && (
        <section className="mt-8" aria-labelledby="units-h">
          <h2 id="units-h" className="h2">{U.unitsHeading} <span className="text-base font-normal muted">· {fmt(U.count, { n: shownUnits.length })}</span></h2>
          {shownUnits.length === 0 ? <p className="mt-2 muted">{U.noResults}</p> : (
            <ul className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="unit-list">
              {shownUnits.map((e) => <UnitCard key={e.item.id} e={e as ExpansionEntry<Unit>} t={t} locale={locale} />)}
            </ul>
          )}
        </section>
      )}

      {kind !== 'units' && (
        <section className="mt-8" aria-labelledby="readings-h">
          <h2 id="readings-h" className="h2">{U.readingsHeading} <span className="text-base font-normal muted">· {fmt(U.count, { n: shownReadings.length })}</span></h2>
          {shownReadings.length === 0 ? <p className="mt-2 muted">{U.noResults}</p> : (
            <ul className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="reading-list">
              {shownReadings.map((e) => <ReadingCard key={e.item.id} e={e as ExpansionEntry<Reading>} t={t} locale={locale} />)}
            </ul>
          )}
        </section>
      )}
    </ParentShell>
  );
}

function Select({ name, label, value, options, any }: { name: string; label: string; value: string; options: [string, string][]; any?: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold">{label}</span>
      <select name={name} defaultValue={value} className="input mt-1">
        {any && <option value="">{any}</option>}
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function UnitCard({ e, t, locale }: { e: ExpansionEntry<Unit>; t: Dictionary; locale: Locale }) {
  const u = e.item;
  return (
    <li className="card flex flex-col gap-2" data-unit={u.id} data-level={u.level} data-state={e.state}>
      <p className="text-sm font-semibold text-sage-dark">{t.curriculum.stage[u.level]} · {t.units.framework[u.framework]} · {t.units.strand[u.strand as keyof Dictionary['units']['strand']] ?? u.strand}</p>
      <h3 className="text-lg font-bold leading-snug">{u.title[locale]}</h3>
      <p className="line-clamp-3 text-sm">{u.objective[locale]}</p>
      <p className="text-sm muted">⏱ {fmt(t.units.minutes, u.durationMinutes)}</p>
      <EntryBadges e={e} t={t} />
      <Link href={`/units/${u.id}`} className="btn-primary mt-auto w-fit" aria-label={`${t.units.openGuide}: ${u.title[locale]}`}>{t.units.openGuide}</Link>
    </li>
  );
}

function ReadingCard({ e, t, locale }: { e: ExpansionEntry<Reading>; t: Dictionary; locale: Locale }) {
  const r = e.item;
  return (
    <li className="card flex flex-col gap-2" data-reading={r.id} data-level={r.level} data-state={e.state}>
      <p className="text-sm font-semibold text-sage-dark">{t.curriculum.stage[r.level]} · {t.units.genre[r.genre]} · {t.units.readingLevel[r.readingLevel]}</p>
      <h3 className="text-lg font-bold leading-snug">{r.title[locale]}</h3>
      <p className="line-clamp-3 text-sm">{r.text[locale][0]}</p>
      <p className="text-sm muted">{t.units.mode[r.mode]}</p>
      <EntryBadges e={e} t={t} />
      <Link href={`/readings/${r.id}`} className="btn-primary mt-auto w-fit" aria-label={`${t.units.openReading}: ${r.title[locale]}`}>{t.units.openReading}</Link>
    </li>
  );
}

