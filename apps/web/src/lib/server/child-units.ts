import 'server-only';
import {
  CAREGIVER_LED_LEVELS,
  findExpansionItem,
  gradeUnitAssessment,
  isExpansionVisible,
  loadExpansionLevel,
  type ReviewStatus,
  type Unit,
} from '@atlas/curriculum';
import { prisma, type ChildProfile } from '@atlas/database';
import { mulberry32, shuffle, type Locale, type Stage } from '@atlas/shared';
import { config } from './config';
import { HttpError } from './http';
import { readingStage } from './library';
import { ageContext } from './children';

/**
 * Expansion learning units for CHILDREN (fail closed). A unit reaches a child only when it is visible under
 * `config.minReview` (isExpansionVisible: human review in production, scholar approval for Islamic/Arabic content,
 * never when rejected), has no validator errors, and belongs to the child's own stage. The answer key, machine checks,
 * explanations and the distractor → misconception map never leave the server before answering.
 */

/** Pure visibility filter (unit-tested for the production threshold). */
export function unitsVisibleToChildren(units: Unit[], errors: string[], minReview: ReviewStatus): Unit[] {
  return units.filter((u) => isExpansionVisible(u, minReview) && !errors.some((e) => mentions(e, u.id)));
}
const mentions = (e: string, id: string) => new RegExp(`(^|[^a-z0-9_-])${id.replace(/[-]/g, '\\-')}([^a-z0-9_-]|$)`).test(e);

/** Stable 32-bit hash (FNV-1a), the same seed scheme as the Reading Garden's choiceOrder. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Display order of one assessment item's choices: display position → authored index. Authors put the correct answer
 * at index 0, so the order is a fixed shuffle per (unit, item) and is never the identity.
 */
export function unitChoiceOrder(unitId: string, itemId: string, count: number): number[] {
  const base = Array.from({ length: count }, (_, i) => i);
  const order = shuffle(mulberry32(fnv1a(`${unitId}/${itemId}`)), base);
  if (count > 1 && order.every((v, i) => v === i)) return [...order.slice(1), order[0]!];
  return order;
}

/** Maps display positions to authored indices. Unknown items, missing items or out-of-range positions → null. */
export function toOriginalAnswers(u: Unit, display: Record<string, number>): Record<string, number> | null {
  const keys = Object.keys(display);
  if (keys.length !== u.assessment.length) return null;
  const out: Record<string, number> = {};
  for (const a of u.assessment) {
    if (!Object.prototype.hasOwnProperty.call(display, a.id)) return null;
    const pos = display[a.id]!;
    const original = unitChoiceOrder(u.id, a.id, a.choices.en.length)[pos];
    if (!Number.isInteger(pos) || original === undefined) return null;
    out[a.id] = original;
  }
  return out;
}

export const isCaregiverLed = (u: Unit) => CAREGIVER_LED_LEVELS.includes(u.level);

/** Client-safe child view: display-order choices only. */
export function unitForChild(u: Unit, locale: Locale) {
  const caregiverLed = isCaregiverLed(u) || u.childInstructions.length === 0;
  return {
    id: u.id,
    level: u.level as Stage,
    title: u.title[locale],
    objective: u.objective[locale],
    caregiverLed,
    instructions: (caregiverLed ? u.parentInstructions : u.childInstructions).map((x) => x[locale]),
    minutes: u.durationMinutes,
    items: u.assessment.map((a) => ({
      id: a.id,
      prompt: a.prompt[locale],
      choices: unitChoiceOrder(u.id, a.id, a.choices.en.length).map((i) => a.choices[locale][i]!),
    })),
  };
}
export type ChildUnitView = ReturnType<typeof unitForChild>;

/** Server-side grading of display-position answers; feedback is localized and shown only after answering. */
export function gradeChildUnit(u: Unit, display: Record<string, number>, locale: Locale) {
  const original = toOriginalAnswers(u, display);
  if (!original) throw new HttpError(400, 'VALIDATION_ERROR');
  const g = gradeUnitAssessment(u, original);
  const codes = [...new Set(g.results.map((r) => r.misconception).filter((c): c is string => !!c))];
  return {
    correct: g.correct,
    total: g.total,
    results: g.results.map((r) => ({ id: r.id, correct: r.correct, explanation: r.explanation[locale] })),
    misconceptions: codes,
    hints: codes.map((c) => u.misconceptions.find((m) => m.code === c)).filter((m): m is Unit['misconceptions'][number] => !!m).map((m) => ({ code: m.code, text: m.remediation[locale] })),
  };
}

/** The unit stage for a learner: the same mapping as the reading journeys (parent-set grade wins, then age). */
export const unitStage = (child: ChildProfile) => readingStage(child);

/** Units the child may see: their stage only, visible under the deployment threshold, screen use allowed. */
export async function childUnits(child: ChildProfile): Promise<Unit[]> {
  if (!ageContext(child).policy.childScreenActivitiesAllowed) return [];
  const l = await loadExpansionLevel(unitStage(child));
  return unitsVisibleToChildren(l.units, l.errors, config.minReview).sort((a, b) => a.id.localeCompare(b.id));
}

export async function visibleChildUnit(child: ChildProfile, unitId: string): Promise<Unit> {
  const u = (await childUnits(child)).find((x) => x.id === unitId);
  if (!u) throw new HttpError(404, 'NOT_FOUND');
  return u;
}

// ── Mastery evidence for parents ─────────────────────────────────────────────────────────────────────────────────────

export const SECURE_SCORE = 0.8;

export interface UnitAttemptRow {
  unitId: string;
  correct: number;
  total: number;
  misconceptions: string[];
  createdAt: Date;
}

export interface UnitProgress {
  unitId: string;
  attempts: number;
  /** Best fraction correct, 0–1. */
  best: number;
  secure: boolean;
  /** Calendar day (child's local date) on which the unit first became secure. */
  secureOn: string | null;
  /** Next spaced review (local calendar date, YYYY-MM-DD) or null when none is scheduled. */
  nextReviewAt: string | null;
  misconceptions: { code: string; count: number }[];
  lastAt: Date;
}

const dayIn = (d: Date, timeZone: string | null | undefined) => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timeZone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
};
const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/**
 * Pure rule: SECURE once two attempts on different calendar days (child's local date, else UTC) each score ≥ 80%.
 * Spaced reviews fall `reviewAfterDays` after the first secure day; a review counts as done when a ≥ 80% attempt is on
 * or after its date. nextReviewAt is the first review not yet done.
 */
export function computeUnitProgress(rows: UnitAttemptRow[], reviewAfterDays: (unitId: string) => number[] | null, timeZone?: string | null): UnitProgress[] {
  const byUnit = new Map<string, UnitAttemptRow[]>();
  for (const r of [...rows].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
    const list = byUnit.get(r.unitId) ?? [];
    list.push(r);
    byUnit.set(r.unitId, list);
  }
  const out: UnitProgress[] = [];
  for (const [unitId, list] of byUnit) {
    const good = list.filter((r) => r.total > 0 && r.correct / r.total >= SECURE_SCORE).map((r) => dayIn(r.createdAt, timeZone));
    const days = [...new Set(good)];
    const secureOn = days.length >= 2 ? days[1]! : null;
    let nextReviewAt: string | null = null;
    if (secureOn) {
      for (const d of [...(reviewAfterDays(unitId) ?? [])].sort((a, b) => a - b)) {
        const due = addDays(secureOn, d);
        if (!good.some((g) => g >= due)) { nextReviewAt = due; break; }
      }
    }
    const misc = new Map<string, number>();
    for (const r of list) for (const c of r.misconceptions) misc.set(c, (misc.get(c) ?? 0) + 1);
    out.push({
      unitId,
      attempts: list.length,
      best: Math.max(...list.map((r) => (r.total > 0 ? r.correct / r.total : 0))),
      secure: !!secureOn,
      secureOn,
      nextReviewAt,
      misconceptions: [...misc].map(([code, count]) => ({ code, count })),
      lastAt: list[list.length - 1]!.createdAt,
    });
  }
  return out.sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

/** Parent-facing unit evidence for one child (the caller has already checked the child belongs to the family). */
export async function unitProgress(childId: string) {
  const child = await prisma.childProfile.findUniqueOrThrow({ where: { id: childId }, select: { timezone: true } });
  const rows = await prisma.unitAttempt.findMany({ where: { childId }, orderBy: { createdAt: 'asc' }, take: 2000, select: { unitId: true, correct: true, total: true, misconceptions: true, createdAt: true } });
  const units = new Map<string, Unit>();
  for (const id of new Set(rows.map((r) => r.unitId))) {
    const f = await findExpansionItem(id);
    if (f && 'assessment' in f.item) units.set(id, f.item);
  }
  const progress = computeUnitProgress(rows, (id) => units.get(id)?.mastery.reviewAfterDays ?? null, child.timezone);
  return progress.map((p) => ({ ...p, unit: units.get(p.unitId) ?? null }));
}
