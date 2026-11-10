import type { MasteryStatus } from '@atlas/adaptive';
import type { Dictionary } from '@/lib/i18n';

/** Status is conveyed by icon + text, never colour alone. */
const STYLE: Record<MasteryStatus, { cls: string; icon: string }> = {
  not_started: { cls: 'border-sand bg-white text-muted', icon: '○' },
  in_progress: { cls: 'border-sky bg-sky-light text-[#2f5370]', icon: '◐' },
  secure: { cls: 'border-sage bg-sage-light text-sage-dark', icon: '◕' },
  review_due: { cls: 'border-clay bg-clay-light text-clay-dark', icon: '↻' },
  mastered: { cls: 'border-sage-dark bg-sage-dark text-white', icon: '●' },
};

export function StatusBadge({ status, t }: { status: MasteryStatus; t: Dictionary }) {
  const s = STYLE[status];
  return (
    <span className={`chip ${s.cls}`} data-status={status}>
      <span aria-hidden="true">{s.icon}</span>
      {t.dashboard.statusLabel[status]}
    </span>
  );
}
