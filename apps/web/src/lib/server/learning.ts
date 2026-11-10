import 'server-only';
import {
  chooseDifficulty,
  lessonChoices,
  MASTERY_MODEL_VERSION,
  recommendNext,
  RECOMMENDER_VERSION,
  updateMastery,
  type Evidence,
  type MasteryState,
  type RecommendInput,
} from '@atlas/adaptive';
import { generateItem, grade, hintFor, MAX_HINT_LEVEL, type Item } from '@atlas/assessment';
import {
  curriculumVersion,
  getCatalog,
  getLesson,
  visibleInteractiveLessons,
  type InteractiveLesson,
} from '@atlas/curriculum';
import { prisma, Prisma, type ChildProfile, type MasteryState as DbMastery } from '@atlas/database';
import { PLACEMENT_VERSION, isLocale, type Locale } from '@atlas/shared';
import { randomSeed } from '@atlas/shared/server';
import { ageContext, type AgeContext } from './children';
import { interactiveBandForGrade } from './availability';
import { config } from './config';
import { HttpError } from './http';

export function toEngineState(m: DbMastery): MasteryState {
  return {
    skillId: m.skillId,
    score: m.score,
    phase: m.phase as MasteryState['phase'],
    attempts: m.attempts,
    independentCorrect: m.independentCorrect,
    consecutiveIndependentCorrect: m.consecutiveIndependentCorrect,
    formats: m.formats,
    lastEvidenceAt: m.lastEvidenceAt?.toISOString() ?? null,
    nextReviewAt: m.nextReviewAt?.toISOString() ?? null,
    reviewStep: m.reviewStep,
    modelVersion: m.modelVersion,
  };
}

export async function engineInput(child: ChildProfile, ctx: AgeContext, now: Date, focus: string | null): Promise<RecommendInput> {
  const [mastery, attempts] = await Promise.all([
    prisma.masteryState.findMany({ where: { childId: child.id } }),
    prisma.attempt.findMany({ where: { childId: child.id }, orderBy: { createdAt: 'desc' }, take: 30 }),
  ]);
  const recentEvidence: Evidence[] = attempts.map((a) => ({
    skillId: a.skillId,
    correct: a.correct,
    hintsUsed: a.hintCount,
    tryNumber: a.tryNumber,
    format: a.format,
    misconception: a.misconceptionCodes[0] ?? null,
    at: a.createdAt,
  }));
  const band = interactiveBandForGrade(child.schoolGrade);
  return {
    now,
    policy: ctx.policy,
    // Grade is parent-set and never inferred; grades without a curriculum band get no lessons (not Grade 1 work).
    band: band ?? 'g1',
    skills: getCatalog().skills,
    lessons: band ? visibleInteractiveLessons(config.minReview).filter((l) => l.ageBand === band) : [],
    mastery: new Map(mastery.map((m) => [m.skillId, toEngineState(m)])),
    recentEvidence,
    focusSkillId: focus,
  };
}

const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

const childLocale = (c: ChildProfile): Locale => (isLocale(c.locale) ? c.locale : 'en');

/** The child's small curated choice set (Montessori: choice among a few). */
export async function childChoices(child: ChildProfile, now = new Date()) {
  const ctx = ageContext(child, now);
  const gradeSupported = interactiveBandForGrade(child.schoolGrade) !== null;
  if (!ctx.policy.childScreenActivitiesAllowed || !gradeSupported) {
    return { ctx, rec: null, choices: [] as InteractiveLesson[], gradeSupported };
  }
  const input = await engineInput(child, ctx, now, child.focusSkillId);
  const rec = recommendNext(input);
  return { ctx, rec, choices: lessonChoices(input, rec, 3), gradeSupported };
}

export async function startSession(child: ChildProfile, lessonId: string | undefined) {
  const now = new Date();
  const { ctx, rec, choices, gradeSupported } = await childChoices(child, now);
  if (!ctx.policy.childScreenActivitiesAllowed) throw new HttpError(403, 'OFFLINE_ONLY');
  if (!gradeSupported) throw new HttpError(403, 'GRADE_NOT_SUPPORTED');
  const lesson = lessonId ? choices.find((l) => l.id === lessonId) : choices[0];
  if (!lesson || !rec) throw new HttpError(lessonId ? 403 : 409, lessonId ? 'LESSON_NOT_AVAILABLE' : 'NO_CONTENT');
  try {
    return await prisma.$transaction(async (tx) => {
      // One open session per child: close any other (e.g. another tab) and abandon its open item,
      // so two activities for the same child can never be answered in parallel.
      const open = await tx.learningSession.findMany({ where: { childId: child.id, endedAt: null }, select: { id: true } });
      if (open.length) {
        await tx.activityInstance.updateMany({ where: { sessionId: { in: open.map((o) => o.id) }, status: 'ACTIVE' }, data: { status: 'ABANDONED' } });
        await tx.learningSession.updateMany({ where: { id: { in: open.map((o) => o.id) } }, data: { endedAt: now } });
      }
      return tx.learningSession.create({
        data: { childId: child.id, targetItems: child.itemsPerSession, localDate: ctx.localDate, skillId: lesson.skillId, lessonId: lesson.id },
      });
    });
  } catch (e) {
    // A concurrent start won the race (partial unique index: one open session per child) — reuse it.
    if (isUniqueViolation(e)) {
      const existing = await prisma.learningSession.findFirst({ where: { childId: child.id, endedAt: null } });
      if (existing) return existing;
    }
    throw e;
  }
}

export interface ActivityPayload {
  activityId: string;
  lessonId: string;
  title: string;
  objective: string;
  generator: Item['generator'];
  cpaStage: Item['cpaStage'];
  presentation: Item['presentation'];
  itemNumber: number;
  totalItems: number;
  hintsUsed: number;
  tries: number;
  maxTries: number;
}

function payload(activity: { id: string; lessonId: string; itemJson: unknown; hintsUsed: number; tries: number }, n: number, total: number, locale: Locale): ActivityPayload {
  const item = activity.itemJson as Item;
  const lesson = getLesson(activity.lessonId) as InteractiveLesson;
  return {
    activityId: activity.id,
    lessonId: lesson.id,
    title: lesson.title[locale],
    objective: lesson.objective[locale],
    generator: item.generator,
    cpaStage: item.cpaStage,
    presentation: item.presentation, // answer key stays server-side
    itemNumber: n,
    totalItems: total,
    hintsUsed: activity.hintsUsed,
    tries: activity.tries,
    maxTries: config.maxTriesPerItem,
  };
}

async function ownedSession(child: ChildProfile, sessionId: string) {
  const s = await prisma.learningSession.findFirst({ where: { id: sessionId, childId: child.id } });
  if (!s) throw new HttpError(404, 'NOT_FOUND');
  return s;
}

export async function nextActivity(child: ChildProfile, sessionId: string): Promise<{ done: true } | { done: false; activity: ActivityPayload }> {
  const now = new Date();
  const session = await ownedSession(child, sessionId);
  if (session.endedAt) return { done: true };
  const locale = childLocale(child);
  const existing = await prisma.activityInstance.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });
  const active = existing.find((a) => a.status === 'ACTIVE');
  if (active) return { done: false, activity: payload(active, existing.length, session.targetItems, locale) };
  if (existing.length >= session.targetItems) return { done: true };

  // Age, safety band and placement are recomputed for every item (handles learner-local midnight/birthdays).
  const ctx = ageContext(child, now);
  if (!ctx.policy.childScreenActivitiesAllowed) return { done: true };
  const input = await engineInput(child, ctx, now, session.skillId);
  let lesson: InteractiveLesson | undefined;
  let difficulty: 1 | 2 | 3;
  let ruleId: string;
  let reason: string;
  if (existing.length === 0) {
    lesson = input.lessons.find((l) => l.id === session.lessonId);
    difficulty = chooseDifficulty(input.mastery.get(session.skillId));
    ruleId = 'C1_CHILD_CHOICE';
    reason = 'Child chose this activity from the suggested set.';
  } else {
    const rec = recommendNext(input);
    if (rec.kind === 'interactive') {
      lesson = input.lessons.find((l) => l.id === rec.lessonId);
      difficulty = rec.difficulty;
      ruleId = rec.ruleId;
      reason = rec.reason.en;
    } else {
      lesson = input.lessons.find((l) => l.id === session.lessonId);
      difficulty = 1;
      ruleId = rec.ruleId;
      reason = rec.reason.en;
    }
  }
  if (!lesson) return { done: true }; // content was unpublished mid-session: stop safely

  const item = generateItem(lesson.generator, difficulty, randomSeed());
  let activity;
  try {
    // Log + activity are created together; a partial unique index allows one ACTIVE item per session.
    activity = await prisma.$transaction(async (tx) => {
      const log = await tx.recommendationLog.create({
        data: {
          childId: child.id,
          localDate: ctx.localDate,
          timezone: ctx.timezone,
          ageYears: ctx.age?.years ?? null,
          ageMonths: ctx.age?.months ?? null,
          ageDays: ctx.age?.days ?? null,
          safetyBand: ctx.policy.band,
          placementVersion: PLACEMENT_VERSION,
          curriculumVersion: curriculumVersion(),
          recommenderVersion: RECOMMENDER_VERSION,
          ruleId,
          decisionReason: reason,
          skillId: lesson.skillId,
          lessonId: lesson.id,
        },
      });
      return tx.activityInstance.create({
        data: {
          childId: child.id,
          sessionId,
          skillId: lesson.skillId,
          lessonId: lesson.id,
          contentVersion: lesson.contentVersion,
          generatorVersion: item.generatorVersion,
          cpaStage: item.cpaStage,
          itemJson: item as unknown as Prisma.InputJsonValue,
          recommendationId: log.id,
        },
      });
    });
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;
    // A concurrent request already created this session's active item — return that one.
    const all = await prisma.activityInstance.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });
    const current = all.find((a) => a.status === 'ACTIVE');
    if (!current) throw new HttpError(409, 'CONFLICT');
    return { done: false, activity: payload(current, all.length, session.targetItems, locale) };
  }
  return { done: false, activity: payload(activity, existing.length + 1, session.targetItems, locale) };
}

async function ownedActiveActivity(child: ChildProfile, activityId: string) {
  const a = await prisma.activityInstance.findFirst({ where: { id: activityId, childId: child.id } });
  if (!a) throw new HttpError(404, 'NOT_FOUND');
  if (a.status !== 'ACTIVE') throw new HttpError(409, 'ACTIVITY_CLOSED');
  return a;
}

export async function submitAttempt(child: ChildProfile, activityId: string, value: number) {
  const now = new Date();
  const activity = await ownedActiveActivity(child, activityId);
  const item = activity.itemJson as unknown as Item;
  const result = grade(item, { value }); // server-side grading only
  const tryNumber = activity.tries + 1;
  const finished = result.correct || tryNumber >= config.maxTriesPerItem;

  return prisma.$transaction(async (tx) => {
    // Optimistic concurrency on BOTH tries and hintsUsed: a double-submit, or a hint issued while this
    // answer was being graded, makes the claim fail (409) instead of recording stale "independent" evidence.
    const claimed = await tx.activityInstance.updateMany({
      // The item's session must still be open: items stranded in an ended session are never answerable.
      where: { id: activity.id, status: 'ACTIVE', tries: activity.tries, hintsUsed: activity.hintsUsed, session: { is: { endedAt: null } } },
      data: { tries: tryNumber, ...(finished ? { status: 'COMPLETED', completedAt: now } : {}) },
    });
    if (claimed.count !== 1) throw new HttpError(409, 'CONFLICT');
    // Serialise read-modify-write of mastery per (child, skill) so concurrent evidence is never lost.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`mastery:${child.id}:${activity.skillId}`}))::text AS locked`;
    const prev = await tx.masteryState.findUnique({ where: { childId_skillId: { childId: child.id, skillId: activity.skillId } } });
    const evidence: Evidence = {
      skillId: activity.skillId,
      correct: result.correct,
      hintsUsed: activity.hintsUsed,
      tryNumber,
      format: item.format,
      misconception: result.misconception,
      at: now,
    };
    const { state, rules } = updateMastery(prev ? toEngineState(prev) : null, evidence);
    const data = {
      score: state.score,
      phase: state.phase,
      attempts: state.attempts,
      independentCorrect: state.independentCorrect,
      consecutiveIndependentCorrect: state.consecutiveIndependentCorrect,
      formats: state.formats,
      lastEvidenceAt: state.lastEvidenceAt ? new Date(state.lastEvidenceAt) : null,
      nextReviewAt: state.nextReviewAt ? new Date(state.nextReviewAt) : null,
      reviewStep: state.reviewStep,
      modelVersion: MASTERY_MODEL_VERSION,
    };
    await tx.masteryState.upsert({
      where: { childId_skillId: { childId: child.id, skillId: activity.skillId } },
      create: { childId: child.id, skillId: activity.skillId, ...data },
      update: data,
    });
    const independent = result.correct && activity.hintsUsed === 0 && tryNumber === 1;
    await tx.attempt.create({
      data: {
        childId: child.id,
        activityId: activity.id,
        skillId: activity.skillId,
        format: item.format,
        answerJson: { value },
        correct: result.correct,
        independent,
        hintCount: activity.hintsUsed,
        tryNumber,
        misconceptionCodes: result.misconception ? [result.misconception] : [],
        rulesApplied: rules,
      },
    });
    return {
      correct: result.correct,
      independent,
      misconception: result.misconception,
      tryNumber,
      triesLeft: Math.max(0, config.maxTriesPerItem - tryNumber),
      finished,
      // The solution is revealed only once the item is finished.
      solution: finished ? { ...item.params, answer: item.answer } : null,
    };
  });
}

export async function requestHint(child: ChildProfile, activityId: string) {
  const activity = await ownedActiveActivity(child, activityId);
  const item = activity.itemJson as unknown as Item;
  const lesson = getLesson(activity.lessonId) as InteractiveLesson;
  const level = Math.min(MAX_HINT_LEVEL, activity.hintsUsed);
  const hint = hintFor(lesson, item, level, childLocale(child));
  const claimed = await prisma.activityInstance.updateMany({
    where: { id: activity.id, status: 'ACTIVE', hintsUsed: activity.hintsUsed, tries: activity.tries, session: { is: { endedAt: null } } },
    data: {
      hintsUsed: activity.hintsUsed + 1,
      // H4 is a worked example: close this item; the next one is a fresh analogous item.
      ...(hint.workedExample ? { status: 'COMPLETED', completedAt: new Date() } : {}),
    },
  });
  if (claimed.count !== 1) throw new HttpError(409, 'CONFLICT');
  return { hint, finished: hint.workedExample, solution: hint.workedExample ? { ...item.params, answer: item.answer } : null };
}

export async function finishSession(child: ChildProfile, sessionId: string) {
  const session = await ownedSession(child, sessionId);
  if (!session.endedAt) {
    await prisma.learningSession.update({ where: { id: session.id }, data: { endedAt: new Date() } });
  }
  await prisma.activityInstance.updateMany({ where: { sessionId, status: 'ACTIVE' }, data: { status: 'ABANDONED' } });
  const activities = await prisma.activityInstance.findMany({
    where: { sessionId },
    include: { attempts: { orderBy: { createdAt: 'asc' } } },
  });
  const worked = activities.filter((a) => a.attempts.length > 0 || a.hintsUsed > 0).length;
  const onOwn = activities.filter((a) => a.attempts.some((t) => t.independent)).length;
  return { worked, onOwn, withHelp: Math.max(0, worked - onOwn) };
}
