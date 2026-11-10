import { mulberry32, randomInt, shuffle, type CpaStage } from '@atlas/shared';
import type { GeneratorId } from '@atlas/curriculum';

export const GENERATOR_VERSION = 'gen-2026.11.2';
export type Difficulty = 1 | 2 | 3;

/** Client-safe description of an item. Never contains the answer. */
export type Presentation =
  | { kind: 'count-ten-frame'; counters: number; frames: 1 | 2; choices: number[] }
  | { kind: 'count-scattered'; dots: { x: number; y: number }[]; choices: number[] }
  | { kind: 'make-ten-frame'; filled: number; whole: 10; choices: number[] }
  | {
      kind: 'number-bond';
      whole: number;
      knownPart: number;
      unknownSide: 'left' | 'right';
      choices: number[];
    }
  | { kind: 'bond-equation'; whole: number; knownPart: number; blank: 'first' | 'second' }
  /** Concrete addition: two groups of counters (second group is marked, not only coloured). */
  | { kind: 'add-counters'; first: number; second: number; choices: number[] }
  /** Pictorial addition: number bond with both parts known and the whole unknown. */
  | { kind: 'add-bond'; first: number; second: number; choices: number[] }
  /** Abstract addition: `first + second = □`, or the missing-part form `first + □ = total`. */
  | { kind: 'add-equation'; first: number; second: number | null; total: number | null; blank: 'total' | 'second' }
  /** Concrete subtraction: `whole` counters, the last `takeAway` are crossed out. */
  | { kind: 'sub-takeaway'; whole: number; takeAway: number; choices: number[] }
  /** Pictorial subtraction: number bond (whole and one part) beside `whole − part = ?`. */
  | { kind: 'sub-bond'; whole: number; knownPart: number; choices: number[] }
  /** Abstract subtraction: `whole − part = □`, or the missing-part form `whole − □ = result`. */
  | { kind: 'sub-equation'; whole: number; part: number | null; result: number | null; blank: 'result' | 'part' }
  /**
   * One-step story with a bar model. `op` add: a + b (whole unknown). `op` sub: whole a, b taken away.
   * The story text is rendered from localized templates keyed by `context`, so the server never sends prose
   * that has not been through content review.
   */
  | { kind: 'bar-model-story'; op: 'add' | 'sub'; context: StoryContext; a: number; b: number; choices: number[] };

export const STORY_CONTEXTS = ['apples', 'birds', 'books', 'boats', 'shells', 'kites'] as const;
export type StoryContext = (typeof STORY_CONTEXTS)[number];

export interface ItemParams {
  count?: number;
  part?: number;
  whole?: number;
  missing?: number;
  /** Second addend (addition items). */
  other?: number;
}

/** Full server-side item, including the answer key. */
export interface Item {
  generator: GeneratorId;
  generatorVersion: string;
  seed: number;
  difficulty: Difficulty;
  /** Item format used for "variety" evidence in the mastery rules (generator, or generator:variant). */
  format: string;
  cpaStage: CpaStage;
  params: ItemParams;
  presentation: Presentation;
  answer: number;
}

/** Pick the bounded range for a difficulty level (1..3). */
function band<T>(levels: readonly [T, T, T], d: Difficulty): T {
  return levels[d - 1] as T;
}

const STAGE: Record<GeneratorId, CpaStage> = {
  'count-ten-frame': 'concrete',
  'count-scattered': 'pictorial',
  'make-ten-frame': 'concrete',
  'number-bond': 'pictorial',
  'bond-equation': 'abstract',
  'add-counters': 'concrete',
  'add-bond': 'pictorial',
  'add-equation': 'abstract',
  'sub-takeaway': 'concrete',
  'sub-bond': 'pictorial',
  'sub-equation': 'abstract',
  'bar-model-story': 'pictorial',
};

/** Two addends a, b ≥ min whose total lies in [lo, hi] (hi ≤ 10). */
function addends(rng: () => number, lo: number, hi: number, min = 1): [number, number] {
  const total = randomInt(rng, Math.max(lo, 2 * min), hi);
  const a = randomInt(rng, min, total - min);
  return [a, total - a];
}
type Range = readonly [number, number];
const ADD_TOTAL: readonly [Range, Range, Range] = [[2, 5], [4, 8], [6, 10]];
const SUB_WHOLE: readonly [Range, Range, Range] = [[3, 5], [5, 8], [6, 10]];

/** Up to four plausible, in-range, unique options including the answer; sorted for calm scanning. */
export function buildChoices(
  answer: number,
  candidates: number[],
  min: number,
  max: number,
  rng: () => number,
): number[] {
  const set = new Set<number>([answer]);
  for (const c of candidates) {
    if (set.size >= 4) break;
    if (Number.isInteger(c) && c >= min && c <= max) set.add(c);
  }
  let guard = 0;
  while (set.size < Math.min(4, max - min + 1) && guard++ < 50) set.add(randomInt(rng, min, max));
  return [...set].sort((a, b) => a - b);
}

export function generateItem(generator: GeneratorId, difficulty: Difficulty, seed: number): Item {
  const rng = mulberry32(seed);
  const base = {
    generator,
    generatorVersion: GENERATOR_VERSION,
    seed,
    difficulty,
    format: generator,
    cpaStage: STAGE[generator],
  };
  switch (generator) {
    case 'count-ten-frame': {
      const [lo, hi] = band([[1, 10], [6, 15], [11, 20]] as const, difficulty);
      const count = randomInt(rng, lo, hi);
      const choices = buildChoices(count, [count - 1, count + 1, count > 10 ? count - 10 : count + 2], 0, 20, rng);
      return {
        ...base,
        params: { count },
        answer: count,
        presentation: { kind: generator, counters: count, frames: count > 10 ? 2 : 1, choices },
      };
    }
    case 'count-scattered': {
      const [lo, hi] = band([[3, 10], [6, 14], [10, 20]] as const, difficulty);
      const count = randomInt(rng, lo, hi);
      // Place dots on a jittered 5x4 grid so they never overlap (keeps counting fair).
      const cells = shuffle(rng, Array.from({ length: 20 }, (_, i) => i)).slice(0, count);
      const dots = cells.map((c) => ({
        x: Math.round(((c % 5) + 0.5 + (rng() - 0.5) * 0.4) * 20),
        y: Math.round((Math.floor(c / 5) + 0.5 + (rng() - 0.5) * 0.4) * 25),
      }));
      const choices = buildChoices(count, [count - 1, count + 1, count + 2], 0, 20, rng);
      return { ...base, params: { count }, answer: count, presentation: { kind: generator, dots, choices } };
    }
    case 'make-ten-frame': {
      const lo = band([5, 3, 1] as const, difficulty);
      const part = randomInt(rng, lo, 9);
      const missing = 10 - part;
      const choices = buildChoices(missing, [missing - 1, missing + 1, part], 0, 10, rng);
      return {
        ...base,
        params: { part, whole: 10, missing },
        answer: missing,
        presentation: { kind: generator, filled: part, whole: 10, choices },
      };
    }
    case 'number-bond': {
      const [lo, hi] = band([[4, 6], [5, 8], [6, 10]] as const, difficulty);
      const whole = randomInt(rng, lo, hi);
      const part = randomInt(rng, 1, whole - 1);
      const missing = whole - part;
      const choices = buildChoices(missing, [missing + 1, missing - 1, part], 0, whole, rng);
      return {
        ...base,
        params: { part, whole, missing },
        answer: missing,
        presentation: {
          kind: generator,
          whole,
          knownPart: part,
          unknownSide: rng() < 0.5 ? 'left' : 'right',
          choices,
        },
      };
    }
    case 'bond-equation': {
      const [lo, hi] = band([[5, 7], [6, 10], [7, 10]] as const, difficulty);
      const whole = randomInt(rng, lo, hi);
      const part = randomInt(rng, 1, whole - 1);
      const missing = whole - part;
      return {
        ...base,
        params: { part, whole, missing },
        answer: missing,
        presentation: {
          kind: generator,
          whole,
          knownPart: part,
          blank: difficulty === 3 && rng() < 0.5 ? 'first' : 'second',
        },
      };
    }
    case 'add-counters':
    case 'add-bond': {
      const [lo, hi] = band(ADD_TOTAL, difficulty);
      const [a, b] = addends(rng, lo, hi);
      const total = a + b;
      // Distractors model real slips: counting on from the wrong number, off by one, subtracting instead.
      const choices = buildChoices(total, [total - 1, total + 1, Math.abs(a - b)], 0, 10, rng);
      return {
        ...base,
        params: { part: a, other: b, whole: total },
        answer: total,
        presentation: { kind: generator, first: a, second: b, choices },
      };
    }
    case 'add-equation': {
      const [lo, hi] = band(ADD_TOTAL, difficulty);
      const [a, b] = addends(rng, lo, hi);
      const total = a + b;
      const missingPart = difficulty === 3 && rng() < 0.5;
      return {
        ...base,
        format: missingPart ? 'add-equation:missing-part' : 'add-equation',
        params: missingPart ? { part: a, other: b, whole: total, missing: b } : { part: a, other: b, whole: total },
        answer: missingPart ? b : total,
        presentation: missingPart
          ? { kind: generator, first: a, second: null, total, blank: 'second' }
          : { kind: generator, first: a, second: b, total: null, blank: 'total' },
      };
    }
    case 'sub-takeaway':
    case 'sub-bond': {
      const [lo, hi] = band(SUB_WHOLE, difficulty);
      const whole = randomInt(rng, lo, hi);
      const part = randomInt(rng, 1, whole - 1);
      const left = whole - part;
      const choices = buildChoices(left, [left + 1, left - 1, part], 0, whole, rng);
      return {
        ...base,
        params: { whole, part, missing: left },
        answer: left,
        presentation:
          generator === 'sub-takeaway'
            ? { kind: generator, whole, takeAway: part, choices }
            : { kind: generator, whole, knownPart: part, choices },
      };
    }
    case 'sub-equation': {
      const [lo, hi] = band(SUB_WHOLE, difficulty);
      const whole = randomInt(rng, lo, hi);
      const part = randomInt(rng, 1, whole - 1);
      const left = whole - part;
      const missingPart = difficulty === 3 && rng() < 0.5;
      return {
        ...base,
        format: missingPart ? 'sub-equation:missing-part' : 'sub-equation',
        // For the missing-part form the unknown is the amount taken away.
        params: missingPart ? { whole, part: left, missing: part } : { whole, part, missing: left },
        answer: missingPart ? part : left,
        presentation: missingPart
          ? { kind: generator, whole, part: null, result: left, blank: 'part' }
          : { kind: generator, whole, part, result: null, blank: 'result' },
      };
    }
    case 'bar-model-story': {
      // Difficulty 1 keeps to joining stories; 2–3 mix joining and taking away.
      const op: 'add' | 'sub' = difficulty === 1 ? (rng() < 0.7 ? 'add' : 'sub') : rng() < 0.5 ? 'add' : 'sub';
      const context = STORY_CONTEXTS[randomInt(rng, 0, STORY_CONTEXTS.length - 1)] as StoryContext;
      if (op === 'add') {
        const [lo, hi] = band(ADD_TOTAL, difficulty);
        // Story numbers start at 2 so every sentence reads naturally in English ("2 apples", never "1 apples").
        const [a, b] = addends(rng, lo, hi, 2);
        const total = a + b;
        return {
          ...base,
          format: 'bar-model-story:add',
          params: { part: a, other: b, whole: total },
          answer: total,
          presentation: { kind: generator, op, context, a, b, choices: buildChoices(total, [Math.abs(a - b), total - 1, total + 1], 0, 10, rng) },
        };
      }
      const [lo, hi] = band(SUB_WHOLE, difficulty);
      const whole = randomInt(rng, lo, hi);
      const part = randomInt(rng, 2, whole - 1);
      const left = whole - part;
      return {
        ...base,
        format: 'bar-model-story:sub',
        // part + other = whole holds for both story types, so one hint ladder reads truthfully for each.
        params: { whole, part, other: left, missing: left },
        answer: left,
        // whole + part (adding instead of subtracting) is the key story misconception; keep it as a choice when in range.
        presentation: { kind: generator, op, context, a: whole, b: part, choices: buildChoices(left, [whole + part, left + 1, part], 0, 10, rng) },
      };
    }
  }
}

/** Independent evaluator (does not reuse generator internals) — used by property tests. */
export function evaluate(p: Presentation): number {
  switch (p.kind) {
    case 'count-ten-frame':
      return p.counters;
    case 'count-scattered':
      return p.dots.length;
    case 'make-ten-frame':
      return p.whole - p.filled;
    case 'number-bond':
    case 'bond-equation':
      return p.whole - p.knownPart;
    case 'add-counters':
    case 'add-bond':
      return p.first + p.second;
    case 'add-equation':
      return p.blank === 'total' ? p.first + (p.second ?? NaN) : (p.total ?? NaN) - p.first;
    case 'sub-takeaway':
      return p.whole - p.takeAway;
    case 'sub-bond':
      return p.whole - p.knownPart;
    case 'sub-equation':
      return p.blank === 'result' ? p.whole - (p.part ?? NaN) : p.whole - (p.result ?? NaN);
    case 'bar-model-story':
      return p.op === 'add' ? p.a + p.b : p.a - p.b;
  }
}
