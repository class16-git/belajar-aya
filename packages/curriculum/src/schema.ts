import { z } from 'zod';
import { AGE_BANDS, FRAMEWORKS, STAGES } from '@atlas/shared';

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

const skillId = z.string().regex(/^[A-Z][A-Z0-9]*(-[A-Z0-9]+)+$/);
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

export const DOMAINS = [
  'mathematics',
  'language',
  'practical_life',
  'sensorial',
  'cultural',
  'robotics_stem',
  'islamic_studies',
] as const;

/** Flags that route an item to a specific human reviewer. The agent can raise them, never clear them. */
export const REVIEW_FLAGS = [
  'religious_content',
  'theological_interpretation',
  'scholar_wording_required',
  'arabic_text',
  'quran_text',
  'translation_review',
  'pronunciation_review',
  'attribution',
  'source_verification',
  'fiqh_ruling',
  'madhhab_selection',
  'physical_safety',
  'electrical_safety',
  'worldview_alignment',
  'namc_mapping_unverified',
  'syllabus_alignment_unverified',
] as const;

/**
 * Religious review record (Curriculum Bible, islam/SOURCE_AND_SCHOLAR_REVIEW.md). Required for every
 * Islamic-studies lesson and every lesson containing Arabic text. Only a qualified human sets
 * approvalStatus to "approved" (pnpm content:religious-approve); citations are never invented.
 */
export const religiousReviewSchema = z
  .object({
    doctrinalSchool: z.string().max(200).nullable(),
    fiqhSchool: z.string().max(100).nullable(),
    arabicSource: z.string().max(300).nullable(),
    edition: z.string().max(200).nullable(),
    pageOrSection: z.string().max(100).nullable(),
    translationReviewer: z.string().max(80).nullable(),
    scholarReviewer: z.string().max(80).nullable(),
    reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    approvalStatus: z.enum(['unverified', 'approved', 'rejected']),
    notes: z.array(z.string().max(400)).default([]),
  })
  .strict();
export type ReligiousReview = z.infer<typeof religiousReviewSchema>;

/** Arabic shown to families is data that must be verified (diacritics, wording, translation). */
export const arabicPhraseSchema = z
  .object({
    arabic: z.string().min(1).max(300).regex(SAFE_TEXT),
    transliteration: z.string().min(1).max(300).regex(SAFE_TEXT),
    meaning: localized,
    verified: z.boolean(),
  })
  .strict();

const base = {
  id: z.string().regex(/^lesson-[a-z0-9-]+$/),
  skillId,
  title: localized,
  ageBand: z.enum(AGE_BANDS),
  domain: z.enum(DOMAINS),
  objective: localized,
  prerequisites: z.array(skillId),
  misconceptionCodes: z.array(misconception),
  safetyNotes: z.array(localized),
  parentNotes: z.array(localized).default([]),
  reviewStatus: z.enum(REVIEW_STATUSES),
  review: reviewRecord.default({ agentChecks: [] }),
  contentVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  // Curriculum Bible fields (all optional for backwards compatibility).
  framework: z.enum(FRAMEWORKS).optional(),
  objectiveIds: z.array(z.string()).default([]),
  copyrightStatus: z.enum(['original', 'licensed', 'needs_clearance']).default('original'),
  namcReferenceStatus: z.enum(['not_applicable', 'unverified', 'licensed', 'educator_mapped']).default('not_applicable'),
  reviewFlags: z.array(z.enum(REVIEW_FLAGS)).default([]),
  arabicPhrases: z.array(arabicPhraseSchema).default([]),
  religiousReview: religiousReviewSchema.optional(),
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
    domain: z.enum(DOMAINS),
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

/** A learning objective in the age-2→Grade-6 registry (content/objectives/*.json). Planning data, never child-facing. */
export const objectiveSchema = z
  .object({
    id: z.string().regex(/^(mont|math|robo|islm)\.(age2_3|age3_4|age4_5|k|g[1-6])\.[a-z0-9-]+$/),
    framework: z.enum(FRAMEWORKS),
    strand: z.string().regex(/^[a-z_]+$/),
    stage: z.enum(STAGES),
    title: localized,
    prerequisites: z.array(z.string()),
    usesCpa: z.boolean(),
    delivery: z.enum(['offline', 'blended', 'guided', 'project']),
    assessment: z.enum(['observation', 'digital', 'rubric', 'portfolio']),
    implementation: z.object({ skillIds: z.array(skillId) }).strict(),
    reviewFlags: z.array(z.enum(REVIEW_FLAGS)),
    requiresReligiousReview: z.boolean(),
    sourceStatus: z.literal('original_planning'),
  })
  .strict()
  .superRefine((o, ctx) => {
    if (o.framework === 'islamic_studies' && !o.requiresReligiousReview) {
      ctx.addIssue({ code: 'custom', message: 'Islamic-studies objectives always require religious review' });
    }
  });
export type Objective = z.infer<typeof objectiveSchema>;

export const objectivesFileSchema = z
  .object({
    framework: z.enum(FRAMEWORKS),
    curriculumVersion: z.string(),
    sourceStatus: z.literal('original_planning_not_official'),
    objectives: z.array(objectiveSchema),
  })
  .strict();
