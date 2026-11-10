import { describe, expect, it } from 'vitest';
import { availabilityForBand, interactiveBandForGrade } from './availability';

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
  it('production (human review required): nothing visible, agent-checked content awaits review', () => {
    const g1 = availabilityForBand('g1', 'reviewed');
    expect(g1.visible).toBe(0);
    expect(g1.awaitingReview).toBe(5); // the draft example is not counted: it cannot be approved as-is
    const toddler = availabilityForBand('toddler', 'reviewed');
    expect(toddler).toEqual({ visible: 0, awaitingReview: 13 });
  });
  it('preview (agent-checked allowed): everything agent-checked is visible, nothing awaits', () => {
    expect(availabilityForBand('g1', 'agent_reviewed')).toEqual({ visible: 5, awaitingReview: 0 });
    expect(availabilityForBand('toddler', 'agent_reviewed')).toEqual({ visible: 13, awaitingReview: 0 });
  });
});
