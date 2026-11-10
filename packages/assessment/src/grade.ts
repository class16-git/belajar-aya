import { z } from 'zod';
import type { Item } from './items';

/** The keypad allows two digits, so any 0–99 answer is gradable (an out-of-range answer is "not yet", not an error). */
export const responseSchema = z.object({ value: z.number().int().min(0).max(99) }).strict();
export type ItemResponse = z.infer<typeof responseSchema>;

export const MISCONCEPTIONS = [
  'COUNTING_ERROR',
  'RECOUNT_FULL_FRAME',
  'PART_WHOLE_CONFUSION',
  'WHOLE_AS_PART',
  'ADDED_PARTS',
  // Slice B: addition & subtraction within 10 and one-step stories.
  'COUNT_ON_WRONG_START',
  'COUNT_BACK_WRONG_START',
  'WRONG_OPERATION',
  'COUNTED_TAKEN_AWAY',
  // Slice D: robotics tracing and debugging.
  'TRACE_STOPPED_EARLY',
  'LEFT_RIGHT_CONFUSION',
  'DEBUG_ADJACENT_STEP',
  // Kindergarten: teen numbers.
  'TEEN_ONES_ONLY',
  'UNCLASSIFIED',
] as const;
export type Misconception = (typeof MISCONCEPTIONS)[number];

export interface GradeResult {
  correct: boolean;
  misconception: Misconception | null;
}

/** Deterministic server-side grading. Never trust a client-sent "correct" flag. */
export function grade(item: Item, response: ItemResponse): GradeResult {
  const v = response.value;
  if (v === item.answer) return { correct: true, misconception: null };
  const { part, whole, count } = item.params;
  if (item.generator === 'count-ten-frame' || item.generator === 'count-scattered') {
    // Only a ten-frame has a "full frame" to forget; scattered dots have no frame.
    if (item.generator === 'count-ten-frame' && count !== undefined && count > 10 && v === count - 10) {
      return { correct: false, misconception: 'RECOUNT_FULL_FRAME' };
    }
    return { correct: false, misconception: 'COUNTING_ERROR' };
  }
  if (item.generator === 'teen-frames' || item.generator === 'teen-equation') {
    const ones = item.params.missing ?? -1;
    const total = item.params.whole ?? -1;
    if (item.answer === total) {
      if (v === ones) return { correct: false, misconception: 'TEEN_ONES_ONLY' };
      if (v === 10) return { correct: false, misconception: 'PART_WHOLE_CONFUSION' };
    } else {
      if (v === total) return { correct: false, misconception: 'WHOLE_AS_PART' };
      if (v === 10) return { correct: false, misconception: 'PART_WHOLE_CONFUSION' };
    }
    return { correct: false, misconception: Math.abs(v - item.answer) === 1 ? 'COUNTING_ERROR' : 'UNCLASSIFIED' };
  }
  if (item.generator === 'robot-trace') {
    if (v === item.params.stoppedEarly) return { correct: false, misconception: 'TRACE_STOPPED_EARLY' };
    if (v === item.params.mirrored) return { correct: false, misconception: 'LEFT_RIGHT_CONFUSION' };
    return { correct: false, misconception: 'UNCLASSIFIED' };
  }
  if (item.generator === 'robot-debug') {
    return { correct: false, misconception: Math.abs(v - item.answer) === 1 ? 'DEBUG_ADJACENT_STEP' : 'UNCLASSIFIED' };
  }
  const slice = gradeAddSub(item, v);
  if (slice) return { correct: false, misconception: slice };
  // Part–whole items: structural confusions first, then off-by-one counting slips.
  if (whole !== undefined && part !== undefined) {
    if (v === part) return { correct: false, misconception: 'PART_WHOLE_CONFUSION' };
    if (v === whole) return { correct: false, misconception: 'WHOLE_AS_PART' };
    if (v === whole + part) return { correct: false, misconception: 'ADDED_PARTS' };
  }
  if (Math.abs(v - item.answer) === 1) return { correct: false, misconception: 'COUNTING_ERROR' };
  return { correct: false, misconception: 'UNCLASSIFIED' };
}

/**
 * Misconceptions for addition/subtraction items. Structural errors (wrong operation, giving a part or the
 * whole) take precedence over counting slips, because they need a different response from the adult.
 */
function gradeAddSub(item: Item, v: number): Misconception | null {
  const p = item.presentation;
  const isAdd =
    p.kind === 'add-counters' || p.kind === 'add-bond' || (p.kind === 'add-equation' && p.blank === 'total') || ((p.kind === 'bar-model-story' || p.kind === 'picture-story') && p.op === 'add');
  const isSub =
    p.kind === 'sub-takeaway' || p.kind === 'sub-bond' || (p.kind === 'sub-equation' && p.blank === 'result') || ((p.kind === 'bar-model-story' || p.kind === 'picture-story') && p.op === 'sub');
  const { part = 0, other = 0, whole = 0 } = item.params;
  if (isAdd) {
    if (v === Math.abs(part - other)) return 'WRONG_OPERATION';
    if (v === part || v === other) return 'PART_WHOLE_CONFUSION';
    // "4 + 3": saying "4, 5, 6" (counting the start number again) gives one less.
    if (v === whole - 1) return 'COUNT_ON_WRONG_START';
    if (v === whole + 1) return 'COUNTING_ERROR';
    return 'UNCLASSIFIED';
  }
  if (isSub) {
    if (v === whole + part) return 'WRONG_OPERATION';
    if (v === whole) return 'WHOLE_AS_PART';
    if (v === part) return 'COUNTED_TAKEN_AWAY';
    // "8 − 3": saying "8, 7, 6" (counting the start number) gives one more.
    if (v === item.answer + 1) return 'COUNT_BACK_WRONG_START';
    if (v === item.answer - 1) return 'COUNTING_ERROR';
    return 'UNCLASSIFIED';
  }
  // Missing-part forms (first + □ = total, whole − □ = result) fall through to the part–whole rules,
  // plus "added instead of subtracting" when the child combines the two numbers shown.
  if (p.kind === 'add-equation' && p.total !== null && v === p.total + p.first) return 'ADDED_PARTS';
  if (p.kind === 'sub-equation' && p.result !== null && v === p.whole + p.result) return 'WRONG_OPERATION';
  return null;
}
