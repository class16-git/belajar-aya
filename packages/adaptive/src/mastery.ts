/**
 * Rule-based mastery model (docs/spec/ai/ADAPTIVE_ENGINE.md). MVP heuristic — NOT psychometrically
 * validated; thresholds are configuration to be tuned with educator feedback.
 */
export const MASTERY_MODEL_VERSION = 'mastery-rules-2026.11.1';

export interface MasteryConfig {
  initialScore: number;
  independentCorrectDelta: number;
  supportedCorrectDelta: number;
  incorrectDelta: number;
  masteryScore: number;
  minIndependentCorrect: number;
  minFormats: number;
  /** Hours after reaching "secure" before the delayed retention check is due. */
  delayedCheckHours: number;
  /** Spaced review intervals (days) after each successful check. */
  reviewIntervalsDays: number[];
}

export const DEFAULT_MASTERY_CONFIG: MasteryConfig = {
  initialScore: 0.35,
  independentCorrectDelta: 0.12,
  supportedCorrectDelta: 0.05,
  incorrectDelta: -0.08,
  masteryScore: 0.8,
  minIndependentCorrect: 3,
  minFormats: 2,
  delayedCheckHours: 20,
  reviewIntervalsDays: [3, 7, 14, 30],
};

export type MasteryPhase = 'learning' | 'secure' | 'mastered';
export type MasteryStatus = 'not_started' | 'in_progress' | 'secure' | 'review_due' | 'mastered';

export interface MasteryState {
  skillId: string;
  score: number;
  phase: MasteryPhase;
  attempts: number;
  independentCorrect: number;
  consecutiveIndependentCorrect: number;
  formats: string[]; // formats with an independent correct answer
  lastEvidenceAt: string | null; // ISO instant
  nextReviewAt: string | null; // ISO instant
  reviewStep: number;
  modelVersion: string;
}

export interface Evidence {
  skillId: string;
  correct: boolean;
  /** Hints shown before this answer on the same item. */
  hintsUsed: number;
  /** 1 = first try on this item. Later tries are "supported". */
  tryNumber: number;
  format: string;
  misconception: string | null;
  at: Date;
}

export const isIndependent = (e: Pick<Evidence, 'correct' | 'hintsUsed' | 'tryNumber'>) =>
  e.correct && e.hintsUsed === 0 && e.tryNumber === 1;

export function initialState(skillId: string, cfg = DEFAULT_MASTERY_CONFIG): MasteryState {
  return {
    skillId,
    score: cfg.initialScore,
    phase: 'learning',
    attempts: 0,
    independentCorrect: 0,
    consecutiveIndependentCorrect: 0,
    formats: [],
    lastEvidenceAt: null,
    nextReviewAt: null,
    reviewStep: 0,
    modelVersion: MASTERY_MODEL_VERSION,
  };
}

const clamp = (n: number) => Math.min(1, Math.max(0, Math.round(n * 1000) / 1000));
const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3_600_000).toISOString();

export function isCheckDue(s: MasteryState, now: Date): boolean {
  return s.phase !== 'learning' && s.nextReviewAt !== null && new Date(s.nextReviewAt) <= now;
}

export interface MasteryUpdate {
  state: MasteryState;
  rules: string[];
}

export function updateMastery(
  prev: MasteryState | null,
  e: Evidence,
  cfg = DEFAULT_MASTERY_CONFIG,
): MasteryUpdate {
  const rules: string[] = [];
  const s: MasteryState = prev ? { ...prev, formats: [...prev.formats] } : initialState(e.skillId, cfg);
  if (!prev) rules.push('M1_INIT');
  const checkWasDue = isCheckDue(s, e.at);
  const independent = isIndependent(e);

  s.attempts += 1;
  s.lastEvidenceAt = e.at.toISOString();
  s.modelVersion = MASTERY_MODEL_VERSION;
  if (independent) {
    s.score = clamp(s.score + cfg.independentCorrectDelta);
    s.independentCorrect += 1;
    s.consecutiveIndependentCorrect += 1;
    if (!s.formats.includes(e.format)) s.formats.push(e.format);
    rules.push('M2_INDEPENDENT_CORRECT');
  } else if (e.correct) {
    s.score = clamp(s.score + cfg.supportedCorrectDelta);
    s.consecutiveIndependentCorrect = 0;
    rules.push('M3_SUPPORTED_CORRECT');
  } else {
    s.score = clamp(s.score + cfg.incorrectDelta);
    s.consecutiveIndependentCorrect = 0;
    rules.push('M4_INCORRECT');
  }

  if (checkWasDue) {
    if (independent) {
      // Retention demonstrated after a delay.
      s.phase = 'mastered';
      const days = cfg.reviewIntervalsDays[Math.min(s.reviewStep, cfg.reviewIntervalsDays.length - 1)] ?? 7;
      s.reviewStep += 1;
      s.nextReviewAt = addHours(e.at, days * 24);
      rules.push('M6_DELAYED_CHECK_PASSED');
    } else if (!e.correct) {
      // Lapse: mastery must be re-earned; never assumed.
      s.phase = 'learning';
      s.nextReviewAt = null;
      s.reviewStep = 0;
      rules.push('M7_DELAYED_CHECK_LAPSED');
    } else {
      rules.push('M8_CHECK_STILL_DUE_SUPPORTED');
    }
    return { state: s, rules };
  }

  const meetsCriteria =
    s.score >= cfg.masteryScore &&
    s.independentCorrect >= cfg.minIndependentCorrect &&
    s.formats.length >= cfg.minFormats;
  if (s.phase === 'learning' && meetsCriteria) {
    s.phase = 'secure';
    s.nextReviewAt = addHours(e.at, cfg.delayedCheckHours);
    rules.push('M5_SECURE_SCHEDULE_DELAYED_CHECK');
  } else if (s.phase === 'secure' && s.score < cfg.masteryScore) {
    s.phase = 'learning';
    s.nextReviewAt = null;
    rules.push('M9_SECURE_DROPPED');
  }
  return { state: s, rules };
}

export function masteryStatus(s: MasteryState | null | undefined, now: Date): MasteryStatus {
  if (!s || s.attempts === 0) return 'not_started';
  if (isCheckDue(s, now)) return 'review_due';
  if (s.phase === 'mastered') return 'mastered';
  if (s.phase === 'secure') return 'secure';
  return 'in_progress';
}

/** Prerequisites unlock dependants once "secure"; full mastery still needs the delayed check. */
export const unlocksDependants = (s: MasteryState | null | undefined) =>
  !!s && (s.phase === 'secure' || s.phase === 'mastered');
