import fc from 'fast-check';
import { getCatalog } from '@atlas/curriculum';
import { describe, expect, it } from 'vitest';
import { evaluate, generateItem, STORY_CONTEXTS, type Difficulty, type Item } from './items';
import { grade } from './grade';
import { hintFor } from './hints';

const SLICE_B = ['add-counters', 'add-bond', 'add-equation', 'sub-takeaway', 'sub-bond', 'sub-equation', 'bar-model-story'] as const;
const arbGen = fc.constantFrom(...SLICE_B);
const arbDiff = fc.constantFrom<Difficulty>(1, 2, 3);
const arbSeed = fc.integer({ min: 0, max: 2 ** 32 - 1 });

/** First seed whose item satisfies `pred` (deterministic, for golden cases). */
function find(gen: (typeof SLICE_B)[number], d: Difficulty, pred: (i: Item) => boolean): Item {
  for (let s = 0; s < 50_000; s++) {
    const it = generateItem(gen, d, s);
    if (pred(it)) return it;
  }
  throw new Error(`no seed for ${gen}`);
}

describe('slice B generators (property-based)', () => {
  it('stay within 10, never use 0 as an addend or take away nothing, and never go negative', () => {
    fc.assert(
      fc.property(arbGen, arbDiff, arbSeed, (g, d, s) => {
        const item = generateItem(g, d, s);
        const { whole = -1, part = -1 } = item.params;
        expect(whole).toBeLessThanOrEqual(10);
        expect(part).toBeGreaterThanOrEqual(1);
        expect(item.answer).toBeGreaterThanOrEqual(1);
        expect(item.answer).toBeLessThanOrEqual(10);
        expect(evaluate(item.presentation)).toBe(item.answer);
      }),
      { numRuns: 3000 },
    );
  });

  it('difficulty 1 keeps totals small (≤ 5 for addition, wholes ≤ 5 for subtraction)', () => {
    fc.assert(
      fc.property(arbSeed, (s) => {
        for (const g of ['add-counters', 'add-bond', 'add-equation'] as const) expect(generateItem(g, 1, s).params.whole).toBeLessThanOrEqual(5);
        for (const g of ['sub-takeaway', 'sub-bond', 'sub-equation'] as const) expect(generateItem(g, 1, s).params.whole).toBeLessThanOrEqual(5);
      }),
    );
  });

  it('missing-part forms appear only at difficulty 3 and are tagged as their own format', () => {
    fc.assert(
      fc.property(fc.constantFrom('add-equation' as const, 'sub-equation' as const), arbDiff, arbSeed, (g, d, s) => {
        const item = generateItem(g, d, s);
        if (d < 3) expect(item.format).toBe(g);
        if (item.format.endsWith(':missing-part')) expect(d).toBe(3);
      }),
    );
  });

  it('stories use a known context, and their format records the operation (variety evidence)', () => {
    const ops = new Set<string>();
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        const item = generateItem('bar-model-story', d, s);
        const p = item.presentation;
        if (p.kind !== 'bar-model-story') throw new Error('kind');
        expect(STORY_CONTEXTS).toContain(p.context);
        expect(p.a).toBeGreaterThanOrEqual(2); // grammar: never "1 apples"
        expect(p.b).toBeGreaterThanOrEqual(2);
        expect(item.format).toBe(`bar-model-story:${p.op}`);
        ops.add(p.op);
      }),
      { numRuns: 500 },
    );
    expect(ops).toEqual(new Set(['add', 'sub']));
  });

  it('choices include the answer, are unique and within 0–10', () => {
    fc.assert(
      fc.property(arbGen, arbDiff, arbSeed, (g, d, s) => {
        const item = generateItem(g, d, s);
        const p = item.presentation;
        if (!('choices' in p)) return;
        expect(p.choices).toContain(item.answer);
        expect(new Set(p.choices).size).toBe(p.choices.length);
        for (const c of p.choices) expect(c).toBeGreaterThanOrEqual(0);
        for (const c of p.choices) expect(c).toBeLessThanOrEqual(10);
      }),
      { numRuns: 2000 },
    );
  });

  it('every misconception tag the grader can emit is declared on the lesson that uses the generator', () => {
    const lessons = getCatalog().lessons.filter((l) => l.mode === 'interactive' && (SLICE_B as readonly string[]).includes(l.generator));
    expect(lessons.map((l) => l.mode === 'interactive' && l.generator).sort()).toEqual([...SLICE_B].sort());
    fc.assert(
      fc.property(arbDiff, arbSeed, fc.integer({ min: 0, max: 20 }), (d, s, v) => {
        for (const l of lessons) {
          if (l.mode !== 'interactive') continue;
          const tag = grade(generateItem(l.generator, d, s), { value: v }).misconception;
          if (tag && tag !== 'UNCLASSIFIED') expect(l.misconceptionCodes, `${l.id} ${tag}`).toContain(tag);
        }
      }),
      { numRuns: 300 },
    );
  });
});

describe('slice B grader golden cases', () => {
  const add43 = find('add-counters', 2, (i) => i.params.part === 4 && i.params.other === 3);
  it('4 + 3: 7 correct; 6 counts on from the wrong number; 1 subtracts; 4 repeats a part; 8 is off by one', () => {
    expect(grade(add43, { value: 7 })).toEqual({ correct: true, misconception: null });
    expect(grade(add43, { value: 6 }).misconception).toBe('COUNT_ON_WRONG_START');
    expect(grade(add43, { value: 1 }).misconception).toBe('WRONG_OPERATION');
    expect(grade(add43, { value: 4 }).misconception).toBe('PART_WHOLE_CONFUSION');
    expect(grade(add43, { value: 8 }).misconception).toBe('COUNTING_ERROR');
  });

  const sub83 = find('sub-takeaway', 3, (i) => i.params.whole === 8 && i.params.part === 3);
  it('8 − 3: 5 correct; 6 counts back from the wrong number; 11 adds; 3 counts the ones taken; 8 takes none', () => {
    expect(grade(sub83, { value: 5 }).correct).toBe(true);
    expect(grade(sub83, { value: 6 }).misconception).toBe('COUNT_BACK_WRONG_START');
    expect(grade(sub83, { value: 11 }).misconception).toBe('WRONG_OPERATION');
    expect(grade(sub83, { value: 3 }).misconception).toBe('COUNTED_TAKEN_AWAY');
    expect(grade(sub83, { value: 8 }).misconception).toBe('WHOLE_AS_PART');
    expect(grade(sub83, { value: 4 }).misconception).toBe('COUNTING_ERROR');
  });

  it('take-away story answered by adding is WRONG_OPERATION (adding instead of subtracting)', () => {
    const story = find('bar-model-story', 2, (i) => i.presentation.kind === 'bar-model-story' && i.presentation.op === 'sub' && i.params.whole === 7 && i.params.part === 2);
    expect(grade(story, { value: 5 }).correct).toBe(true);
    expect(grade(story, { value: 9 }).misconception).toBe('WRONG_OPERATION');
  });

  it('missing-part forms: 3 + □ = 9 and 9 − □ = 4', () => {
    const add = find('add-equation', 3, (i) => i.format === 'add-equation:missing-part' && i.params.part === 3 && i.params.whole === 9);
    expect(grade(add, { value: 6 }).correct).toBe(true);
    expect(grade(add, { value: 9 }).misconception).toBe('WHOLE_AS_PART');
    expect(grade(add, { value: 12 }).misconception).toBe('ADDED_PARTS');
    expect(grade(add, { value: 3 }).misconception).toBe('PART_WHOLE_CONFUSION');
    const sub = find('sub-equation', 3, (i) => i.format === 'sub-equation:missing-part' && i.params.whole === 9 && i.params.part === 4);
    expect(grade(sub, { value: 5 }).correct).toBe(true);
    expect(grade(sub, { value: 13 }).misconception).toBe('WRONG_OPERATION');
    expect(grade(sub, { value: 4 }).misconception).toBe('PART_WHOLE_CONFUSION');
  });
});

describe('slice B hint ladders', () => {
  it('every placeholder in every hint is filled from the item params, in both languages', () => {
    const lessons = getCatalog().lessons.filter((l) => l.mode === 'interactive' && (SLICE_B as readonly string[]).includes(l.generator));
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        for (const l of lessons) {
          if (l.mode !== 'interactive') continue;
          const item = generateItem(l.generator, d, s);
          for (let level = 0; level <= 4; level++)
            for (const loc of ['en', 'id'] as const) expect(hintFor(l, item, level, loc).text, `${l.id} H${level} ${loc}`).not.toMatch(/\{\w+\}/);
        }
      }),
      { numRuns: 200 },
    );
  });
});
