import { describe, expect, it } from 'vitest';
import { getExpansion, isExpansionVisible, type Unit } from '@atlas/curriculum';
import { computeUnitProgress, gradeChildUnit, toOriginalAnswers, unitChoiceOrder, unitForChild, unitsVisibleToChildren } from './child-units';

const ALL = await getExpansion(); // content chunks load asynchronously, so resolve once at module level
const units = ALL.units;
const sample = (): Unit => {
  const u = units.find((x) => isExpansionVisible(x, 'agent_reviewed') && x.assessment.length >= 3);
  if (!u) throw new Error('test needs at least one agent-reviewed unit');
  return u;
};
/** Display answers that pick the authored index `pick(a)` for each item. */
const displayFor = (u: Unit, pick: (a: Unit['assessment'][number]) => number) =>
  Object.fromEntries(u.assessment.map((a) => [a.id, unitChoiceOrder(u.id, a.id, a.choices.en.length).indexOf(pick(a))]));

describe('unitChoiceOrder', () => {
  it('is a stable permutation and never the identity', () => {
    for (const u of units)
      for (const a of u.assessment) {
        const n = a.choices.en.length;
        const o = unitChoiceOrder(u.id, a.id, n);
        expect(o).toEqual(unitChoiceOrder(u.id, a.id, n));
        expect([...o].sort()).toEqual(Array.from({ length: n }, (_, i) => i));
        expect(o.every((v, i) => v === i)).toBe(false);
      }
  });
  it('moves the authored-first correct answer away from position 0 for most items', () => {
    const items = units.flatMap((u) => u.assessment.map((a) => unitChoiceOrder(u.id, a.id, a.choices.en.length).indexOf(a.answer)));
    expect(items.filter((p) => p === 0).length / items.length).toBeLessThan(0.5);
  });
  it('depends on the unit id as well as the item id', () => {
    const four = Array.from({ length: 20 }, (_, i) => unitChoiceOrder(`unit-g2-math-x${i}`, 'a1', 4).join(''));
    expect(new Set(four).size).toBeGreaterThan(1);
  });
});

describe('display → original mapping and grading', () => {
  it('maps display positions to authored indices and grades all-correct', () => {
    const u = sample();
    const disp = displayFor(u, (a) => a.answer);
    expect(toOriginalAnswers(u, disp)).toEqual(Object.fromEntries(u.assessment.map((a) => [a.id, a.answer])));
    const g = gradeChildUnit(u, disp, 'en');
    expect(g.correct).toBe(u.assessment.length);
    expect(g.misconceptions).toEqual([]);
    expect(g.results.every((r) => typeof r.explanation === 'string' && r.explanation.length > 0)).toBe(true);
  });
  it('a display position equal to the authored answer index is not automatically right', () => {
    const u = sample();
    const naive = Object.fromEntries(u.assessment.map((a) => [a.id, a.answer]));
    const g = gradeChildUnit(u, naive, 'en');
    expect(g.correct).toBeLessThan(u.assessment.length);
  });
  it('wrong choices report the distractor misconception and its remediation text', () => {
    const u = units.find((x) => x.assessment.some((a) => Object.keys(a.distractorMisconceptions).length));
    if (!u) return;
    const a = u.assessment.find((x) => Object.keys(x.distractorMisconceptions).length)!;
    const [k, code] = Object.entries(a.distractorMisconceptions)[0]!;
    const disp = displayFor(u, (x) => (x.id === a.id ? Number(k) : x.answer));
    const g = gradeChildUnit(u, disp, 'id');
    expect(g.misconceptions).toContain(code);
    expect(g.hints.find((h) => h.code === code)?.text).toBe(u.misconceptions.find((m) => m.code === code)!.remediation.id);
  });
  it('refuses unknown, missing or out-of-range answers', () => {
    const u = sample();
    const ok = displayFor(u, (a) => a.answer);
    expect(toOriginalAnswers(u, { ...ok, a99: 0 })).toBeNull();
    const { [u.assessment[0]!.id]: _drop, ...missing } = ok;
    expect(toOriginalAnswers(u, missing)).toBeNull();
    expect(toOriginalAnswers(u, { ...ok, [u.assessment[0]!.id]: 3 + 1 })).toBeNull();
    expect(() => gradeChildUnit(u, { a99: 0 }, 'en')).toThrow();
  });
  it('the client view never carries the answer key, checks, explanations or the distractor map', () => {
    for (const u of units.slice(0, 30)) {
      const v = JSON.stringify(unitForChild(u, 'en'));
      for (const k of ['"answer"', '"check"', '"explanation"', 'distractorMisconceptions', 'misconceptions', 'remediation']) expect(v).not.toContain(k);
      for (const a of u.assessment) expect(v).not.toContain(a.explanation.en);
    }
  });
  it('caregiver-led levels show the parent instructions', () => {
    const u = units.find((x) => x.level === 'age3_4');
    if (!u) return;
    const v = unitForChild(u, 'en');
    expect(v.caregiverLed).toBe(true);
    expect(v.instructions).toEqual(u.parentInstructions.map((x) => x.en));
  });
});

describe('visibility filter (fail closed)', () => {
  it('production threshold lists no AI-drafted unit without a human review record', () => {
    const shown = unitsVisibleToChildren(units, [], 'reviewed');
    for (const u of shown) {
      expect(u.review.reviewedBy && u.review.reviewedAt).toBeTruthy();
      if (u.framework === 'islamic') expect(u.religiousReview?.approvalStatus).toBe('approved');
    }
    expect(shown.filter((u) => u.provenance.origin === 'ai_drafted' && !u.review.reviewedBy)).toEqual([]);
  });
  it('preview threshold never lists draft Islamic, rejected or erroring units', () => {
    const u = sample();
    const rejected = { ...u, id: `${u.id}-r`, review: { ...u.review, rejectedReason: 'no' } } as Unit;
    const shown = unitsVisibleToChildren([...units, rejected], [`${u.id}: synthetic error`], 'agent_reviewed');
    expect(shown.some((x) => x.id === u.id || x.id === rejected.id)).toBe(false);
    expect(shown.some((x) => x.framework === 'islamic' && x.reviewStatus === 'draft')).toBe(false);
  });
});

describe('unitProgress rule', () => {
  const at = (iso: string, correct: number, total = 5, misconceptions: string[] = []) => ({ unitId: 'unit-g2-math-x', correct, total, misconceptions, createdAt: new Date(iso) });
  const days = () => [3, 7];
  it('two ≥80% attempts on the same day are not secure', () => {
    const [p] = computeUnitProgress([at('2026-11-01T02:00:00Z', 4), at('2026-11-01T05:00:00Z', 5)], days, 'UTC');
    expect(p!.secure).toBe(false);
    expect(p!.nextReviewAt).toBeNull();
    expect(p!.attempts).toBe(2);
    expect(p!.best).toBe(1);
  });
  it('two ≥80% attempts on different days are secure; reviews follow reviewAfterDays from the secure day', () => {
    const [p] = computeUnitProgress([at('2026-11-01T02:00:00Z', 4), at('2026-11-02T02:00:00Z', 3, 5, ['X_Y']), at('2026-11-03T02:00:00Z', 4)], days, 'UTC');
    expect(p).toMatchObject({ secure: true, secureOn: '2026-11-03', nextReviewAt: '2026-11-06', attempts: 3 });
    expect(p!.misconceptions).toEqual([{ code: 'X_Y', count: 1 }]);
    const [q] = computeUnitProgress([at('2026-11-01T02:00:00Z', 4), at('2026-11-03T02:00:00Z', 4), at('2026-11-06T02:00:00Z', 5)], days, 'UTC');
    expect(q!.nextReviewAt).toBe('2026-11-10');
  });
  it('a below-80% attempt does not count', () => {
    const [p] = computeUnitProgress([at('2026-11-01T02:00:00Z', 4), at('2026-11-02T02:00:00Z', 3)], days, 'UTC');
    expect(p!.secure).toBe(false);
  });
  it('uses the child’s local date: two UTC days can be one Jakarta day', () => {
    const rows = [at('2026-11-01T17:30:00Z', 5), at('2026-11-02T03:00:00Z', 5)]; // both 2 Nov in Asia/Jakarta (UTC+7)
    expect(computeUnitProgress(rows, days, 'UTC')[0]!.secure).toBe(true);
    expect(computeUnitProgress(rows, days, 'Asia/Jakarta')[0]!.secure).toBe(false);
  });
});
