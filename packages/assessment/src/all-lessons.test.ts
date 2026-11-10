import fc from 'fast-check';
import { getCatalog } from '@atlas/curriculum';
import { describe, expect, it } from 'vitest';
import { evaluate, generateItem, type Difficulty } from './items';
import { grade } from './grade';
import { hintFor } from './hints';

/** Cross-cutting checks for every interactive lesson (all grades, all generators). */
// Drafts are never shown to children; every lesson that can be shown is checked.
const lessons = getCatalog().lessons.filter((l) => l.mode === 'interactive' && l.reviewStatus !== 'draft');
const arbDiff = fc.constantFrom<Difficulty>(1, 2, 3);
const arbSeed = fc.integer({ min: 0, max: 2 ** 32 - 1 });

describe('every interactive lesson', () => {
  it('declares every misconception tag its grader can emit, and its answers match the independent evaluator', () => {
    fc.assert(
      fc.property(arbDiff, arbSeed, fc.integer({ min: 0, max: 99 }), (d, s, v) => {
        for (const l of lessons) {
          if (l.mode !== 'interactive') continue;
          const item = generateItem(l.generator, d, s);
          expect(evaluate(item.presentation), l.id).toBe(item.answer);
          const tag = grade(item, { value: v }).misconception;
          if (tag && tag !== 'UNCLASSIFIED') expect(l.misconceptionCodes, `${l.id} ${tag}`).toContain(tag);
        }
      }),
      { numRuns: 150 },
    );
  });
  it('fills every hint placeholder in both languages', () => {
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        for (const l of lessons) {
          if (l.mode !== 'interactive') continue;
          const item = generateItem(l.generator, d, s);
          for (let h = 0; h <= 4; h++) for (const loc of ['en', 'id'] as const) expect(hintFor(l, item, h, loc).text, `${l.id} H${h} ${loc}`).not.toMatch(/\{\w+\}/);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('Kindergarten: teen numbers and bonds within 20', () => {
  it('teen items are 11–19 and counting only the loose ones is tagged', () => {
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        const it = generateItem('teen-frames', d, s);
        expect(it.answer).toBeGreaterThanOrEqual(11);
        expect(it.answer).toBeLessThanOrEqual(19);
        expect(grade(it, { value: it.params.missing! }).misconception).toBe('TEEN_ONES_ONLY');
      }),
    );
  });
  it('level-1 bonds always split off the ten; wholes stay within 20', () => {
    fc.assert(
      fc.property(arbSeed, (s) => {
        expect(generateItem('bond-20', 1, s).params.part).toBe(10);
        for (const d of [1, 2, 3] as const) expect(generateItem('bond-20-equation', d, s).params.whole).toBeLessThanOrEqual(20);
      }),
    );
  });
  it('an answer above 20 on the keypad is graded "not yet", never rejected', () => {
    const it = generateItem('teen-equation', 1, 3);
    expect(grade(it, { value: 45 }).correct).toBe(false);
  });
});
