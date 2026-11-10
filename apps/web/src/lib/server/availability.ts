import { getCatalog, isVisible, type ReviewStatus } from '@atlas/curriculum';
import type { AgeBand } from '@atlas/shared';

/**
 * Which interactive curriculum band a child's parent-set school grade maps to.
 * Phase 1 only has Grade 1 content (number sense, number bonds to 10), which also suits Kindergarten.
 * Other grades get NO interactive lessons rather than silently receiving Grade 1 work.
 * An unset grade keeps Grade 1 content (the parent chose guided practice without naming a grade).
 * Grade is never inferred from age.
 */
export function interactiveBandForGrade(grade: string | null): AgeBand | null {
  if (grade === null || grade === 'Kindergarten' || grade === 'Grade 1') return 'g1';
  return null;
}

export interface Availability {
  /** Lessons/cards children can see in this environment. */
  visible: number;
  /** Agent-checked lessons/cards that would appear once a human reviews them. */
  awaitingReview: number;
}

/** Counts per band, so parents can be told when lessons are waiting for their review. */
export function availabilityForBand(band: AgeBand, minReview: ReviewStatus): Availability {
  const lessons = getCatalog().lessons.filter((l) => l.ageBand === band);
  const visible = lessons.filter((l) => isVisible(l, minReview)).length;
  const awaitingReview = lessons.filter((l) => l.reviewStatus === 'agent_reviewed' && !isVisible(l, minReview)).length;
  return { visible, awaitingReview };
}

/**
 * Offline card bands suggested for a learner's age. Without the parent's confirmation of the age transition
 * (no automatic change), only toddler cards are suggested. After it, each age gets its own band plus the one
 * below for review and confidence.
 */
export function cardBandsFor(ageYears: number | null, transitionAcknowledged: boolean): AgeBand[] {
  if (ageYears === null || ageYears < 3 || !transitionAcknowledged) return ['toddler'];
  if (ageYears < 4) return ['toddler', 'preschool'];
  if (ageYears < 5) return ['preschool', 'prek'];
  return ['prek', 'kindergarten'];
}
