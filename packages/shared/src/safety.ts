import type { CalendarAge } from './age';
import type { ChildMode } from './types';

export const PLACEMENT_VERSION = 'placement-2026.11.1';

export type SafetyBand = 'under3' | 'age3to5' | 'age6plus' | 'unknown';

export interface SafetyPolicy {
  band: SafetyBand;
  /** Child may use interactive screen activities on their own (still parent-launched). */
  childScreenActivitiesAllowed: boolean;
  /** Offline, caregiver-led cards are always allowed. */
  offlineCardsAllowed: true;
  /** Small loose parts must never be suggested. */
  smallPartsForbidden: boolean;
  /** Content age bands that may be recommended. Grade is never inferred from age. */
  rationale: string;
}

/**
 * Hard safety restrictions sit at the top of the decision hierarchy. They derive from age (if a DOB is
 * known) and from the parent-chosen mode; the stricter of the two wins.
 */
export function safetyPolicy(age: CalendarAge | null, mode: ChildMode): SafetyPolicy {
  const band: SafetyBand =
    age === null ? 'unknown' : age.years < 3 ? 'under3' : age.years < 6 ? 'age3to5' : 'age6plus';
  const toddlerByAge = band === 'under3';
  const toddlerByMode = mode === 'TODDLER_OFFLINE';
  return {
    band,
    childScreenActivitiesAllowed: !toddlerByAge && !toddlerByMode,
    offlineCardsAllowed: true,
    smallPartsForbidden: band === 'under3' || band === 'unknown' || toddlerByMode,
    rationale: toddlerByAge
      ? 'Under 3: caregiver-led offline activities only; no independent screen use.'
      : toddlerByMode
        ? 'Parent selected caregiver-led offline mode.'
        : 'Guided interactive practice permitted; parent controls session length.',
  };
}

export interface AgeTransitionNotice {
  code: 'TURNED_3_OFFER_NEW_ACTIVITIES';
  requiresParentConfirmation: true;
}

/**
 * Proactive transition handling: when a learner in toddler mode turns 3, *propose* new activities.
 * Never change mode or grade automatically.
 */
export function ageTransitionNotices(age: CalendarAge | null, mode: ChildMode): AgeTransitionNotice[] {
  if (age && age.years >= 3 && mode === 'TODDLER_OFFLINE') {
    return [{ code: 'TURNED_3_OFFER_NEW_ACTIVITIES', requiresParentConfirmation: true }];
  }
  return [];
}
