import fc from 'fast-check';
import { getCatalog, GENERATOR_IDS } from '@atlas/curriculum';
import { describe, expect, it } from 'vitest';
import { evaluate, generateItem, type Difficulty } from './items';
import { grade } from './grade';
import { hintFor } from './hints';

const arbGen = fc.constantFrom(...GENERATOR_IDS);
const arbDiff = fc.constantFrom<Difficulty>(1, 2, 3);
const arbSeed = fc.integer({ min: 0, max: 2 ** 32 - 1 });

describe('item generators (property-based)', () => {
  it('answer always matches an independent evaluator', () => {
    fc.assert(
      fc.property(arbGen, arbDiff, arbSeed, (g, d, s) => {
        const item = generateItem(g, d, s);
        expect(evaluate(item.presentation)).toBe(item.answer);
        expect(grade(item, { value: item.answer }).correct).toBe(true);
      }),
      { numRuns: 2000 },
    );
  });
  it('is deterministic for a seed', () => {
    fc.assert(
      fc.property(arbGen, arbDiff, arbSeed, (g, d, s) => {
        expect(generateItem(g, d, s)).toEqual(generateItem(g, d, s));
      }),
    );
  });
  it('stays within bounded ranges (bonds within 10, counts within 20)', () => {
    fc.assert(
      fc.property(arbGen, arbDiff, arbSeed, (g, d, s) => {
        const { params, answer } = generateItem(g, d, s);
        expect(Number.isInteger(answer)).toBe(true);
        expect(answer).toBeGreaterThanOrEqual(0);
        if (g.startsWith('count')) expect(answer).toBeLessThanOrEqual(20);
        else if (g.startsWith('robot')) expect(answer).toBeGreaterThanOrEqual(1);
        else {
          expect(params.whole).toBeLessThanOrEqual(10);
          expect(params.part).toBeGreaterThanOrEqual(1);
          expect(answer).toBeGreaterThanOrEqual(1);
        }
      }),
      { numRuns: 2000 },
    );
  });
  it('multiple-choice options include the answer, are unique and contain no impossible distractors', () => {
    fc.assert(
      fc.property(arbGen, arbDiff, arbSeed, (g, d, s) => {
        const item = generateItem(g, d, s);
        const p = item.presentation;
        if (!('choices' in p)) return;
        expect(p.choices).toContain(item.answer);
        expect(new Set(p.choices).size).toBe(p.choices.length);
        expect(p.choices.length).toBeGreaterThanOrEqual(2);
        expect(p.choices.length).toBeLessThanOrEqual(g === 'robot-debug' ? 5 : 4); // one option per program step
        const max = 'whole' in p ? p.whole : 20;
        for (const c of p.choices) {
          expect(Number.isInteger(c)).toBe(true);
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThanOrEqual(max);
        }
      }),
      { numRuns: 2000 },
    );
  });
  it('scattered dots never overlap', () => {
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        const p = generateItem('count-scattered', d, s).presentation;
        if (p.kind !== 'count-scattered') throw new Error('kind');
        const keys = p.dots.map((dot) => `${Math.round(dot.x / 20)}:${Math.round(dot.y / 25)}`);
        for (let i = 0; i < p.dots.length; i++)
          for (let j = i + 1; j < p.dots.length; j++) {
            const a = p.dots[i]!;
            const b = p.dots[j]!;
            expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(8);
          }
        expect(keys.length).toBe(p.dots.length);
      }),
    );
  });
  it('client presentation never includes the answer key fields', () => {
    const p = generateItem('make-ten-frame', 1, 42).presentation as Record<string, unknown>;
    expect(p).not.toHaveProperty('answer');
    expect(p).not.toHaveProperty('missing');
  });
});

describe('grader golden cases and misconception tags', () => {
  const makeTen = (part: number) => {
    for (let s = 0; s < 10000; s++) {
      const it = generateItem('make-ten-frame', 3, s);
      if (it.params.part === part) return it;
    }
    throw new Error('no seed');
  };
  it('6 + ? = 10: 4 is correct', () => {
    expect(grade(makeTen(6), { value: 4 })).toEqual({ correct: true, misconception: null });
  });
  it('off-by-one is a counting error', () => {
    expect(grade(makeTen(6), { value: 3 }).misconception).toBe('COUNTING_ERROR');
    expect(grade(makeTen(6), { value: 5 }).misconception).toBe('COUNTING_ERROR');
  });
  it('repeating the known part is part–whole confusion; giving the whole is WHOLE_AS_PART', () => {
    expect(grade(makeTen(6), { value: 6 }).misconception).toBe('PART_WHOLE_CONFUSION');
    expect(grade(makeTen(6), { value: 10 }).misconception).toBe('WHOLE_AS_PART');
    expect(grade(makeTen(2), { value: 12 }).misconception).toBe('ADDED_PARTS');
  });
  it('counting 13 as 3 means the full frame was not counted', () => {
    for (let s = 0; s < 10000; s++) {
      const it = generateItem('count-ten-frame', 3, s);
      if (it.answer === 13) {
        expect(grade(it, { value: 3 }).misconception).toBe('RECOUNT_FULL_FRAME');
        expect(grade(it, { value: 12 }).misconception).toBe('COUNTING_ERROR');
        return;
      }
    }
    throw new Error('no seed');
  });
});

describe('hint ladder', () => {
  it('fills placeholders and escalates representation and worked example', () => {
    const lesson = getCatalog().lessons.find((l) => l.id === 'lesson-g1-bonds-10-001');
    if (!lesson || lesson.mode !== 'interactive') throw new Error('lesson');
    const item = generateItem('make-ten-frame', 1, 7);
    const h0 = hintFor(lesson, item, 0, 'en');
    const h3 = hintFor(lesson, item, 3, 'id');
    const h4 = hintFor(lesson, item, 4, 'en');
    expect(h0.showRepresentation).toBe(false);
    expect(h3.text).toContain(String(item.params.part));
    expect(h3.showRepresentation).toBe(true);
    expect(h4.workedExample).toBe(true);
    expect(h4.text).toContain(`${item.params.part} and ${item.params.missing} make 10`);
    expect(hintFor(lesson, item, 99, 'en').level).toBe(4);
  });
});
