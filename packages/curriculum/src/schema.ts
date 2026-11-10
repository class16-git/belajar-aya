import { z } from 'zod';
import { AGE_BANDS } from '@atlas/shared';

/**
 * Lesson content contract v2 (ADR-0004). Extends the starter JSON schema in
 * docs/spec/curriculum (kept for reference) with localized fields, a review record,
 * and an "agent_reviewed" status that is never shown in production.
 */
export const REVIEW_STATUSES = ['draft', 'agent_reviewed', 'reviewed', 'published'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const SAFE_TEXT = /^[^<>]*$/; // content is rendered as text; reject markup to keep authored JSON inert
const text = z.string().trim().min(1).max(600).regex(SAFE_TEXT, 'Markup is not allowed in content');
export const localized = z.object({ en: text, id: text }).strict();
export type Localized = z.infer<typeof localized>;

const skillId = z.string().regex(/^(MATH-G1|TOD)-[A-Z0-9-]+$/);
const misconception = z.string().regex(/^[A-Z][A-Z_]+$/);

const reviewRecord = z
  .object({
    agentChecks: z.array(z.string()).default([]),
    reviewedBy: z.string().min(1).max(80).optional(),
    reviewerRole: z.enum(['parent', 'educator', 'curriculum_reviewer']).optional(),
    reviewedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict();

const base = {
  id: z.string().regex(/^lesson-[a-z0-9-]+$/),
  skillId,
  title: localized,
  ageBand: z.enum(AGE_BANDS),
  domain: z.enum(['mathematics', 'language', 'practical_life', 'sensorial', 'cultural']),
  objective: localized,
  prerequisites: z.array(skillId),
  misconceptionCodes: z.array(misconception),
  safetyNotes: z.array(localized),
  parentNotes: z.array(localized).default([]),
  reviewStatus: z.enum(REVIEW_STATUSES),
  review: reviewRecord.default({ agentChecks: [] }),
  contentVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
};

export const GENERATOR_IDS = ['count-ten-frame', 'count-scattered', 'make-ten-frame', 'number-bond', 'bond-equation'] as const;
export type GeneratorId = (typeof GENERATOR_IDS)[number];

export const interactiveLessonSchema = z
  .object({
    ...base,
    mode: z.literal('interactive'),
    cpaStage: z.enum(['concrete', 'pictorial', 'abstract']),
    materials: z.array(localized),
    generator: z.enum(GENERATOR_IDS),
    /** H0..H4; placeholders like {part} and {whole} are filled from server-side item params. */
    hintLadder: z.array(localized).length(5),
    offlineExtension: localized,
  })
  .strict();

export const hazardFlags = z
  .object({
    chokingRisk: z.boolean(),
    water: z.boolean(),
    sharp: z.boolean(),
    heat: z.boolean(),
    allergens: z.boolean(),
  })
  .strict();

export const offlineCardSchema = z
  .object({
    ...base,
    mode: z.literal('offline'),
    cpaStage: z.literal('not_applicable'),
    prepMinutes: z.number().int().min(0).max(30),
    activityMinutes: z.object({ min: z.number().int().min(1), max: z.number().int().max(15) }).strict(),
    materials: z.array(localized).min(1),
    preparation: z.array(localized).min(1),
    steps: z.array(localized).min(2),
    adultWording: z.array(localized).min(1),
    observationCues: z.array(localized).min(1),
    cleanup: localized,
    variations: z.array(localized).default([]),
    hazards: hazardFlags,
    supervisionRequired: z.literal(true),
    hintLadder: z.array(localized).default([]),
  })
  .strict()
  .superRefine((card, ctx) => {
    if (card.safetyNotes.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Offline cards need at least one safety note' });
    }
    if (card.hazards.chokingRisk && card.ageBand === 'toddler') {
      ctx.addIssue({
        code: 'custom',
        message: 'Toddler cards must not use materials with a choking risk',
      });
    }
  });

export const lessonSchema = z.union([interactiveLessonSchema, offlineCardSchema]);
export type InteractiveLesson = z.infer<typeof interactiveLessonSchema>;
export type OfflineCard = z.infer<typeof offlineCardSchema>;
export type Lesson = InteractiveLesson | OfflineCard;

export const skillSchema = z
  .object({
    id: skillId,
    domain: z.enum(['mathematics', 'language', 'practical_life', 'sensorial', 'cultural']),
    band: z.enum(AGE_BANDS),
    title: localized,
    description: localized,
    prerequisites: z.array(skillId),
    order: z.number().int().min(1),
    usesCpa: z.boolean(),
    evidence: z.enum(['digital_attempts', 'parent_observation']),
  })
  .strict();
export type Skill = z.infer<typeof skillSchema>;

export const skillGraphSchema = z
  .object({ curriculumVersion: z.string(), skills: z.array(skillSchema).min(1) })
  .strict();
