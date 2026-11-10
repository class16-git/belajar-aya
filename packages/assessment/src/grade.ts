import { z } from 'zod';
import type { Item } from './items';

export const responseSchema = z.object({ value: z.number().int().min(0).max(20) }).strict();
export type ItemResponse = z.infer<typeof responseSchema>;

export const MISCONCEPTIONS = [
  'COUNTING_ERROR',
  'RECOUNT_FULL_FRAME',
  'PART_WHOLE_CONFUSION',
  'WHOLE_AS_PART',
  'ADDED_PARTS',
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
    if (count !== undefined && count > 10 && v === count - 10) {
      return { correct: false, misconception: 'RECOUNT_FULL_FRAME' };
    }
    return { correct: false, misconception: 'COUNTING_ERROR' };
  }
  // Part–whole items: structural confusions first, then off-by-one counting slips.
  if (whole !== undefined && part !== undefined) {
    if (v === part) return { correct: false, misconception: 'PART_WHOLE_CONFUSION' };
    if (v === whole) return { correct: false, misconception: 'WHOLE_AS_PART' };
    if (v === whole + part) return { correct: false, misconception: 'ADDED_PARTS' };
  }
  if (Math.abs(v - item.answer) === 1) return { correct: false, misconception: 'COUNTING_ERROR' };
  return { correct: false, misconception: 'UNCLASSIFIED' };
}
