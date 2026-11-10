import { z } from 'zod';
import { RAW_LESSONS, RAW_SKILLS } from './content-index';
import {
  lessonSchema,
  skillGraphSchema,
  type InteractiveLesson,
  type Lesson,
  type OfflineCard,
  type ReviewStatus,
  type Skill,
} from './schema';
import { isVisible, publicationIssues } from './publication';

export interface Catalog {
  curriculumVersion: string;
  skills: Skill[];
  lessons: Lesson[];
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  catalog: Catalog | null;
}

/** Parse + cross-validate all content. Pure: callers decide what to do with errors. */
export function validateContent(rawLessons: unknown[], rawSkills: unknown): ValidationResult {
  const errors: string[] = [];
  const graph = skillGraphSchema.safeParse(rawSkills);
  if (!graph.success) {
    return { ok: false, errors: [`skills.json: ${graph.error.message}`], catalog: null };
  }
  const skills = graph.data.skills;
  const skillIds = new Set(skills.map((s) => s.id));
  for (const s of skills) {
    for (const p of s.prerequisites) {
      if (!skillIds.has(p)) errors.push(`Skill ${s.id}: unknown prerequisite ${p}`);
    }
  }
  // Cycle detection (prerequisite graph must be a DAG).
  const state = new Map<string, 'visiting' | 'done'>();
  const byId = new Map(skills.map((s) => [s.id, s]));
  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'visiting') {
      errors.push(`Prerequisite cycle: ${[...path, id].join(' -> ')}`);
      return;
    }
    state.set(id, 'visiting');
    for (const p of byId.get(id)?.prerequisites ?? []) visit(p, [...path, id]);
    state.set(id, 'done');
  };
  skills.forEach((s) => visit(s.id, []));

  const lessons: Lesson[] = [];
  const seen = new Set<string>();
  rawLessons.forEach((raw, i) => {
    const parsed = lessonSchema.safeParse(raw);
    if (!parsed.success) {
      const id = (raw as { id?: string })?.id ?? `#${i}`;
      errors.push(`Lesson ${id}: ${formatZod(parsed.error)}`);
      return;
    }
    const l = parsed.data;
    if (seen.has(l.id)) errors.push(`Duplicate lesson id ${l.id}`);
    seen.add(l.id);
    const skill = byId.get(l.skillId);
    if (!skill) errors.push(`Lesson ${l.id}: unknown skill ${l.skillId}`);
    else {
      if (skill.band !== l.ageBand) errors.push(`Lesson ${l.id}: age band differs from skill`);
      const missing = skill.prerequisites.filter((p) => !l.prerequisites.includes(p));
      if (missing.length) errors.push(`Lesson ${l.id}: missing skill prerequisites ${missing}`);
    }
    for (const p of l.prerequisites) {
      if (!skillIds.has(p)) errors.push(`Lesson ${l.id}: unknown prerequisite ${p}`);
    }
    if (l.reviewStatus !== 'draft') {
      for (const issue of publicationIssues(l)) errors.push(`Lesson ${l.id}: ${issue.message}`);
    }
    lessons.push(l);
  });
  return {
    ok: errors.length === 0,
    errors,
    catalog: { curriculumVersion: graph.data.curriculumVersion, skills, lessons },
  };
}

function formatZod(e: z.ZodError): string {
  return e.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
}

let cached: Catalog | null = null;
/** The validated built-in catalog. Throws at startup if content is invalid (fail closed). */
export function getCatalog(): Catalog {
  if (cached) return cached;
  const result = validateContent(RAW_LESSONS, RAW_SKILLS);
  if (!result.ok || !result.catalog) {
    throw new Error(`Invalid curriculum content:\n${result.errors.join('\n')}`);
  }
  cached = result.catalog;
  return cached;
}

export function getSkill(id: string): Skill | undefined {
  return getCatalog().skills.find((s) => s.id === id);
}

export function getLesson(id: string): Lesson | undefined {
  return getCatalog().lessons.find((l) => l.id === id);
}

export function visibleLessons(minReview: ReviewStatus): Lesson[] {
  return getCatalog().lessons.filter((l) => isVisible(l, minReview));
}

export function visibleInteractiveLessons(minReview: ReviewStatus): InteractiveLesson[] {
  return visibleLessons(minReview).filter((l): l is InteractiveLesson => l.mode === 'interactive');
}

export function visibleOfflineCards(minReview: ReviewStatus): OfflineCard[] {
  return visibleLessons(minReview).filter((l): l is OfflineCard => l.mode === 'offline');
}

export function curriculumVersion(): string {
  return getCatalog().curriculumVersion;
}
