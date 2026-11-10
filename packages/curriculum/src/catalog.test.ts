import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RAW_LESSON_FILES, RAW_LESSONS, RAW_OBJECTIVES, RAW_SKILLS } from './content-index';
import { getCatalog, validateContent, visibleOfflineCards } from './catalog';
import { isVisible, publicationIssues, resolveDeployEnv, resolveMinReview } from './publication';
import type { Lesson } from './schema';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const findRaw = (id: string) => clone(RAW_LESSONS.find((l) => (l as Lesson).id === id)) as Lesson;

describe('built-in content', () => {
  it('validates with no errors', () => {
    const r = validateContent(RAW_LESSONS, RAW_SKILLS, RAW_OBJECTIVES);
    expect(r.errors).toEqual([]);
  });
  it('indexes every lesson file on disk', () => {
    const root = join(import.meta.dirname, '../../../content');
    const found: string[] = [];
    const walk = (d: string) =>
      readdirSync(d).forEach((f) => {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/^lesson-.*\.json$/.test(f)) found.push(relative(root, p));
      });
    walk(root);
    expect(found.sort()).toEqual([...RAW_LESSON_FILES].sort());
  });
  it('has at least 10 toddler offline cards with safety notes and supervision', () => {
    const cards = visibleOfflineCards('agent_reviewed').filter((c) => c.ageBand === 'toddler');
    expect(cards.length).toBeGreaterThanOrEqual(10);
    for (const c of cards) {
      expect(c.safetyNotes.length).toBeGreaterThan(0);
      expect(c.supervisionRequired).toBe(true);
      expect(c.hazards.chokingRisk).toBe(false);
      expect(c.activityMinutes.max).toBeLessThanOrEqual(10);
    }
  });
  it('every localized field has both languages and no unresolved placeholders in titles', () => {
    for (const l of getCatalog().lessons) {
      expect(l.title.en.length).toBeGreaterThan(0);
      expect(l.title.id.length).toBeGreaterThan(0);
      expect(l.title.en).not.toMatch(/\{/);
    }
  });
  it('every Grade 1 math lesson carries a CPA stage and a 5-step hint ladder', () => {
    for (const l of getCatalog().lessons.filter((x) => x.mode === 'interactive')) {
      expect(['concrete', 'pictorial', 'abstract']).toContain(l.cpaStage);
      expect(l.hintLadder).toHaveLength(5);
    }
  });
});

describe('publication gate (scenario 9)', () => {
  it('draft lessons fail the publication check and are never visible', () => {
    const draft = findRaw('lesson-g1-draft-example');
    expect(publicationIssues(draft).map((i) => i.message)).toContain('Draft content cannot be published');
    expect(isVisible(draft, 'draft')).toBe(false);
    expect(isVisible(draft, 'agent_reviewed')).toBe(false);
  });
  it('"reviewed" without a human review record is rejected', () => {
    const l = findRaw('lesson-g1-bonds-10-001');
    l.reviewStatus = 'reviewed';
    l.review = { agentChecks: [] }; // no human record
    expect(publicationIssues(l).length).toBeGreaterThan(0);
    l.review = { agentChecks: [], reviewedBy: 'AB', reviewerRole: 'parent', reviewedAt: '2026-11-10' };
    expect(publicationIssues(l)).toEqual([]);
    expect(isVisible(l, 'reviewed')).toBe(true);
  });
  it('agent-reviewed content is hidden when production requires human review', () => {
    const l = findRaw('lesson-g1-bonds-10-001');
    l.reviewStatus = 'agent_reviewed';
    l.review = { agentChecks: ['schema'] };
    expect(isVisible(l, 'reviewed')).toBe(false);
    expect(isVisible(l, 'agent_reviewed')).toBe(true);
  });
  it('production can never lower the minimum review below "reviewed"', () => {
    expect(resolveMinReview('agent_reviewed', 'production')).toBe('reviewed');
    expect(resolveMinReview('draft', 'development')).toBe('agent_reviewed');
    expect(resolveMinReview(undefined, 'development')).toBe('reviewed');
    expect(resolveMinReview('agent_reviewed', 'development')).toBe('agent_reviewed');
    expect(resolveMinReview('agent_reviewed', 'preview')).toBe('agent_reviewed');
  });
  it('a production build is real production unless explicitly labelled preview', () => {
    expect(resolveDeployEnv(undefined, 'production')).toBe('production');
    expect(resolveDeployEnv('preview', 'production')).toBe('preview');
    expect(resolveDeployEnv('bogus', 'production')).toBe('production');
    expect(resolveDeployEnv(undefined, 'development')).toBe('development');
    // Trusted platform signal wins over a mislabelled ATLAS_ENV.
    expect(resolveDeployEnv('preview', 'production', 'production')).toBe('production');
    expect(resolveDeployEnv('preview', 'production', 'preview')).toBe('preview');
  });
});

describe('malicious or malformed content is rejected', () => {
  it('rejects markup in text fields (XSS hardening)', () => {
    const l = findRaw('lesson-tod-match-001') as unknown as Record<string, unknown>;
    l.title = { en: '<img src=x onerror=alert(1)>', id: 'x' };
    expect(validateContent([l], RAW_SKILLS).ok).toBe(false);
  });
  it('rejects unknown fields', () => {
    const l = findRaw('lesson-tod-match-001') as unknown as Record<string, unknown>;
    l.script = 'alert(1)';
    expect(validateContent([l], RAW_SKILLS).ok).toBe(false);
  });
  it('rejects toddler cards that declare a choking risk', () => {
    const l = findRaw('lesson-tod-match-001');
    if (l.mode === 'offline') l.hazards.chokingRisk = true;
    expect(validateContent([l], RAW_SKILLS).errors.join()).toMatch(/choking/);
  });
  it('rejects unknown prerequisites and prerequisite cycles', () => {
    const skills = clone(RAW_SKILLS) as { skills: { id: string; prerequisites: string[] }[] };
    skills.skills[0]!.prerequisites = ['MATH-G1-BONDS-10'];
    const r = validateContent([], skills);
    expect(r.errors.join()).toMatch(/cycle/i);
    const l = findRaw('lesson-g1-bonds-10-001');
    l.prerequisites = ['MATH-G1-UNKNOWN'];
    expect(validateContent([l], RAW_SKILLS).ok).toBe(false);
  });
});
