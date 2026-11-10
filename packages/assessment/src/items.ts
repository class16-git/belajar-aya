import { mulberry32, randomInt, shuffle, type CpaStage } from '@atlas/shared';
import type { GeneratorId } from '@atlas/curriculum';

export const GENERATOR_VERSION = 'gen-2026.11.1';
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
  | { kind: 'bond-equation'; whole: number; knownPart: number; blank: 'first' | 'second' };

export interface ItemParams {
  count?: number;
  part?: number;
  whole?: number;
  missing?: number;
}

/** Full server-side item, including the answer key. */
export interface Item {
  generator: GeneratorId;
  generatorVersion: string;
  seed: number;
  difficulty: Difficulty;
  /** Item format used for "variety" evidence in the mastery rules. */
  format: GeneratorId;
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
};

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
  }
}
