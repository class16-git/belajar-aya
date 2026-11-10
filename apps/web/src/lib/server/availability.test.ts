import { describe, expect, it } from 'vitest';
import { getCatalog } from '@atlas/curriculum';
import { availabilityForBand, cardBandsFor, interactiveBandForGrade } from './availability';

describe('grade → interactive curriculum band (Phase 1)', () => {
  it('Kindergarten, Grade 1 and an unset grade get the Grade 1 lessons', () => {
    expect(interactiveBandForGrade('Kindergarten')).toBe('g1');
    expect(interactiveBandForGrade('Grade 1')).toBe('g1');
    expect(interactiveBandForGrade(null)).toBe('g1');
  });
  it('Grades 2–6 (and pre-school labels) get no interactive lessons instead of Grade 1 work', () => {
    for (const g of ['Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Preschool', 'Toddler']) {
      expect(interactiveBandForGrade(g)).toBeNull();
    }
  });
});

describe('availability counts for the parent review notice', () => {
  // Data-independent: compare against the catalog's actual review statuses.
  const count = (band: 'g1' | 'toddler', status: string) =>
    getCatalog().lessons.filter((l) => l.ageBand === band && l.reviewStatus === status).length;

  for (const band of ['g1', 'toddler'] as const) {
    it(`${band}: production shows only human-reviewed content; agent-checked content awaits review`, () => {
      const a = availabilityForBand(band, 'reviewed');
      expect(a.visible).toBe(count(band, 'reviewed') + count(band, 'published'));
      expect(a.awaitingReview).toBe(count(band, 'agent_reviewed'));
    });
    it(`${band}: preview shows reviewed and agent-checked content; drafts never count`, () => {
      const a = availabilityForBand(band, 'agent_reviewed');
      expect(a.visible).toBe(count(band, 'reviewed') + count(band, 'published') + count(band, 'agent_reviewed'));
      expect(a.awaitingReview).toBe(0);
    });
  }
});

describe('cardBandsFor', () => {
  it('suggests only toddler cards until the parent confirms the age transition', () => {
    expect(cardBandsFor(2, true)).toEqual(['toddler']);
    expect(cardBandsFor(4, false)).toEqual(['toddler']);
    expect(cardBandsFor(null, true)).toEqual(['toddler']);
  });
  it('follows the age once confirmed: own band plus the one below', () => {
    expect(cardBandsFor(3, true)).toEqual(['toddler', 'preschool']);
    expect(cardBandsFor(4, true)).toEqual(['preschool', 'prek']);
    expect(cardBandsFor(5, true)).toEqual(['prek', 'kindergarten']);
    expect(cardBandsFor(6, true)).toEqual(['prek', 'kindergarten']);
  });
});
