import fc from 'fast-check';
import { getCatalog } from '@atlas/curriculum';
import { describe, expect, it } from 'vitest';
import { evaluate, fixingSteps, generateItem, runProgram, type Difficulty, type Item } from './items';
import { grade } from './grade';
import { hintFor } from './hints';

const arbDiff = fc.constantFrom<Difficulty>(1, 2, 3);
const arbSeed = fc.integer({ min: 0, max: 2 ** 32 - 1 });

describe('robot-trace (property-based)', () => {
  it('the program stays on the grid, the answer star is where the robot stops, and stars never sit on the robot', () => {
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        const it = generateItem('robot-trace', d, s);
        const p = it.presentation;
        if (p.kind !== 'robot-trace') throw new Error('kind');
        const path = runProgram(p.start, p.program, p.size);
        expect(path).not.toBeNull();
        expect(evaluate(p)).toBe(it.answer);
        expect(p.markers.map((m) => m.label).sort()).toEqual([1, 2, 3, 4]);
        expect(new Set(p.markers.map((m) => `${m.x},${m.y}`)).size).toBe(4);
        for (const m of p.markers) expect(m.x === p.start.x && m.y === p.start.y).toBe(false);
        expect(p.program.length).toBe(d === 1 ? 2 : d === 2 ? 3 : p.program.length);
        expect(p.program.length).toBeLessThanOrEqual(5);
        // No immediate back-tracking: programs stay readable.
        const opp = { up: 'down', down: 'up', left: 'right', right: 'left' } as const;
        for (let i = 1; i < p.program.length; i++) expect(p.program[i]).not.toBe(opp[p.program[i - 1]!]);
      }),
      { numRuns: 2000 },
    );
  });
  it('stopping one step early is always offered and tagged', () => {
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        const it = generateItem('robot-trace', d, s);
        expect(it.params.stoppedEarly).toBeDefined();
        expect(grade(it, { value: it.params.stoppedEarly! }).misconception).toBe('TRACE_STOPPED_EARLY');
      }),
    );
  });
});

describe('robot-debug (property-based)', () => {
  it('has exactly one step that can be fixed to reach the flag, and that is the answer', () => {
    fc.assert(
      fc.property(arbDiff, arbSeed, (d, s) => {
        const it = generateItem('robot-debug', d, s);
        const p = it.presentation;
        if (p.kind !== 'robot-debug') throw new Error('kind');
        const path = runProgram(p.start, p.program, p.size);
        expect(path).not.toBeNull();
        const end = path!.at(-1)!;
        expect(end.x === p.target.x && end.y === p.target.y).toBe(false); // the bug really misses the flag
        expect(fixingSteps(p.start, p.program, p.target, p.size)).toEqual([it.answer]);
        expect(p.choices).toEqual(p.program.map((_, i) => i + 1));
        expect(p.program.length).toBeGreaterThanOrEqual(3);
      }),
      { numRuns: 1000 },
    );
  });
  it('picking a neighbouring step is tagged DEBUG_ADJACENT_STEP', () => {
    const it = generateItem('robot-debug', 2, 11);
    const near = it.answer > 1 ? it.answer - 1 : it.answer + 1;
    expect(grade(it, { value: near }).misconception).toBe('DEBUG_ADJACENT_STEP');
  });
  it('never sends the wrong step or the end star to the client', () => {
    for (const g of ['robot-trace', 'robot-debug'] as const) {
      const p = generateItem(g, 2, 5).presentation as Record<string, unknown>;
      expect(p).not.toHaveProperty('answer');
      expect(p).not.toHaveProperty('wrong');
      expect(p).not.toHaveProperty('end');
    }
  });
});

describe('robotics lessons', () => {
  const lessons = getCatalog().lessons.filter((l) => l.mode === 'interactive' && l.generator.startsWith('robot'));
  it('declare every tag their grader can emit and fill every hint placeholder', () => {
    expect(lessons.map((l) => l.id).sort()).toEqual(['lesson-robo-g1-debug-001', 'lesson-robo-g1-trace-001']);
    fc.assert(
      fc.property(arbDiff, arbSeed, fc.integer({ min: 0, max: 6 }), (d, s, v) => {
        for (const l of lessons) {
          if (l.mode !== 'interactive') continue;
          const item: Item = generateItem(l.generator, d, s);
          const tag = grade(item, { value: v }).misconception;
          if (tag && tag !== 'UNCLASSIFIED') expect(l.misconceptionCodes).toContain(tag);
          for (let h = 0; h <= 4; h++) for (const loc of ['en', 'id'] as const) expect(hintFor(l, item, h, loc).text).not.toMatch(/\{\w+\}/);
        }
      }),
      { numRuns: 200 },
    );
  });
});
