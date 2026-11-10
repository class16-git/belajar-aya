import type { PipelineState } from '@atlas/curriculum';
import type { Dictionary } from '@/lib/i18n';
import type { ExpansionEntry } from '@/lib/server/expansion';

/** Status is conveyed by icon + text, never colour alone. */
const STATE: Record<PipelineState, { cls: string; icon: string }> = {
  drafted: { cls: 'border-sand bg-white text-muted', icon: '○' },
  structurally_validated: { cls: 'border-clay bg-clay-light text-clay-dark', icon: '!' },
  subject_validated: { cls: 'border-sky bg-sky-light text-[#2f5370]', icon: '◐' },
  human_reviewed: { cls: 'border-sage bg-sage-light text-sage-dark', icon: '✓' },
  published: { cls: 'border-sage-dark bg-sage-dark text-white', icon: '●' },
  rejected: { cls: 'border-clay-dark bg-white text-clay-dark', icon: '✕' },
};

export function StateBadge({ state, t }: { state: PipelineState; t: Dictionary }) {
  const s = STATE[state];
  return (
    <span className={`chip ${s.cls}`} data-state={state} data-testid="state-badge">
      <span aria-hidden="true">{s.icon}</span>
      {t.units.state[state]}
    </span>
  );
}

/** All status chips for one entry: pipeline state, scholar requirement, child visibility. */
export function EntryBadges({ e, t }: { e: ExpansionEntry; t: Dictionary }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <StateBadge state={e.state} t={t} />
      {e.religious && !e.scholarApproved && (
        <span className="chip border-clay bg-clay-light text-clay-dark" data-testid="scholar-badge"><span aria-hidden="true">☪</span>{t.units.needsScholar}</span>
      )}
      {e.religious && e.scholarApproved && <span className="chip border-sage bg-sage-light text-sage-dark">{t.units.scholarApproved}</span>}
      {!e.visibleToChildren && (
        <span className="chip border-bark bg-white text-bark" data-testid="not-shown"><span aria-hidden="true">⊘</span>{t.units.notShown}</span>
      )}
    </span>
  );
}

export function Section({ id, title, children, className = '' }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={`${id}-h`} className={`print-break-avoid ${className}`} data-section={id}>
      <h2 id={`${id}-h`} className="h2">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function BulletList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const cls = `space-y-1.5 pl-6 ${ordered ? 'list-decimal' : 'list-disc'}`;
  return ordered ? <ol className={cls}>{items.map((x, i) => <li key={i}>{x}</li>)}</ol> : <ul className={cls}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}
