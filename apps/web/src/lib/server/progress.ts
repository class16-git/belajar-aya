import 'server-only';
import { masteryStatus, recommendNext, recommendOfflineCards, type MasteryStatus } from '@atlas/adaptive';
import { getCatalog, visibleOfflineCards, visibleInteractiveLessons, type Skill } from '@atlas/curriculum';
import { prisma, type ChildProfile } from '@atlas/database';
import { ageContext } from './children';
import { config } from './config';
import { engineInput, toEngineState } from './learning';
import { availabilityForBand, cardBandsFor, interactiveBandForGrade, interactiveBandsForGrade } from './availability';

export interface SkillProgress {
  skill: Skill;
  status: MasteryStatus;
  score: number | null;
  independentCorrect: number;
  formats: number;
  nextReviewAt: Date | null;
  attempts: {
    id: string;
    at: Date;
    value: number | null;
    correct: boolean;
    independent: boolean;
    hints: number;
    tryNumber: number;
    tags: string[];
    format: string;
  }[];
}

export async function buildProgress(child: ChildProfile, now = new Date()) {
  const ctx = ageContext(child, now);
  const catalog = getCatalog();
  const isToddler = child.mode === 'TODDLER_OFFLINE' || !ctx.policy.childScreenActivitiesAllowed;
  const [mastery, attempts, observations, recLog] = await Promise.all([
    prisma.masteryState.findMany({ where: { childId: child.id } }),
    prisma.attempt.findMany({ where: { childId: child.id }, orderBy: { createdAt: 'desc' }, take: 300 }),
    prisma.parentObservation.findMany({ where: { childId: child.id }, orderBy: { observedAt: 'desc' }, take: 50 }),
    prisma.recommendationLog.findMany({ where: { childId: child.id }, orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);
  const mById = new Map(mastery.map((m) => [m.skillId, m]));

  // On-screen skills for this learner's grade (Kindergarten: K + Grade 1), in sequence order.
  const bands = interactiveBandsForGrade(child.schoolGrade);
  const interactiveSkills = catalog.skills
    .filter((s) => (bands.length ? bands : ['g1']).includes(s.band) && s.evidence === 'digital_attempts')
    .sort((a, b) => a.order - b.order);
  const skills: SkillProgress[] = interactiveSkills.map((skill) => {
    const m = mById.get(skill.id);
    const st = m ? toEngineState(m) : null;
    return {
      skill,
      status: masteryStatus(st, now),
      score: m?.score ?? null,
      independentCorrect: m?.independentCorrect ?? 0,
      formats: m?.formats.length ?? 0,
      nextReviewAt: m?.nextReviewAt ?? null,
      attempts: attempts
        .filter((a) => a.skillId === skill.id)
        .slice(0, 25)
        .map((a) => ({
          id: a.id,
          at: a.createdAt,
          value: typeof (a.answerJson as { value?: unknown })?.value === 'number' ? (a.answerJson as { value: number }).value : null,
          correct: a.correct,
          independent: a.independent,
          hints: a.hintCount,
          tryNumber: a.tryNumber,
          tags: a.misconceptionCodes,
          format: a.format,
        })),
    };
  });

  // Misconception patterns over the last 30 days.
  const since = now.getTime() - 30 * 86_400_000;
  const patterns = new Map<string, { code: string; count: number; last: Date; skillId: string }>();
  for (const a of attempts) {
    if (a.createdAt.getTime() < since) continue;
    for (const code of a.misconceptionCodes) {
      const p = patterns.get(code);
      if (p) p.count += 1;
      else patterns.set(code, { code, count: 1, last: a.createdAt, skillId: a.skillId });
    }
  }
  const misconceptions = [...patterns.values()].sort((a, b) => b.count - a.count);

  const gradeSupported = isToddler || interactiveBandForGrade(child.schoolGrade) !== null;
  // Tell the parent when lessons exist but are waiting for their (human) review.
  const availability = availabilityForBand(isToddler ? 'toddler' : 'g1', config.minReview);
  let recommendation = null;
  if (!isToddler && gradeSupported) {
    const input = await engineInput(child, ctx, now, child.focusSkillId);
    recommendation = recommendNext(input);
  }
  // Age-appropriate offline suggestions: under-3 only toddler cards; older bands only after the parent
  // acknowledged the age-transition notice (no automatic change of mode).
  const cardBands = cardBandsFor(ctx.age?.years ?? null, child.transitionAcknowledged);
  const cards = visibleOfflineCards(config.minReview).filter((c) => cardBands.includes(c.ageBand));
  const cardHistory = observations
    .filter((o) => o.lessonId && o.skillId)
    .map((o) => ({ lessonId: o.lessonId!, skillId: o.skillId!, observedAt: o.observedAt }));
  const suggestedCards = recommendOfflineCards(cards, cardHistory, 3).map((id) => cards.find((c) => c.id === id)!);

  // For Grade 1: offline extensions of skills currently in progress.
  const lessons = visibleInteractiveLessons(config.minReview);
  const activeSkillIds = skills.filter((s) => s.status === 'in_progress' || s.status === 'review_due').map((s) => s.skill.id);
  const offlineExtensions = lessons
    .filter((l) => activeSkillIds.includes(l.skillId))
    .map((l) => ({ lessonId: l.id, skillId: l.skillId, title: l.title, text: l.offlineExtension }));

  const toddlerSkills = catalog.skills
    .filter((s) => s.band === 'toddler')
    .map((s) => ({ skill: s, count: observations.filter((o) => o.skillId === s.id).length }));

  return {
    ctx,
    isToddler,
    gradeSupported,
    availability,
    skills,
    misconceptions,
    dueReviews: skills.filter((s) => s.status === 'review_due'),
    recommendation,
    recentDecisions: recLog,
    suggestedCards,
    offlineExtensions,
    observations,
    toddlerSkills,
  };
}
