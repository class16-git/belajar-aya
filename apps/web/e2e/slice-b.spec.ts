import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { answer, answerFor, createFamily, currentActivityId, db, enterChildMode, signIn } from './helpers';

/**
 * Slice B (Grade 1 addition & subtraction within 10, bar-model stories): one end-to-end session per lesson,
 * on phone and tablet, with axe and screenshots. Prerequisites are seeded as already mastered (synthetic).
 */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });

const LESSONS = [
  { id: 'lesson-g1-add-10-001', shot: '50-add-counters', rep: '[data-counter="second"]' },
  { id: 'lesson-g1-add-10-002', shot: '51-add-bond', rep: '[data-testid="bond"]' },
  { id: 'lesson-g1-add-10-003', shot: '52-add-equation', rep: '[data-testid="sentence"]' },
  { id: 'lesson-g1-sub-10-001', shot: '53-sub-takeaway', rep: '[data-counter="taken"]' },
  { id: 'lesson-g1-sub-10-002', shot: '54-sub-bond', rep: '[data-testid="bond"]' },
  { id: 'lesson-g1-sub-10-003', shot: '55-sub-equation', rep: '[data-testid="sentence"]' },
  { id: 'lesson-g1-word-1-001', shot: '56-bar-model-story', rep: '[data-testid="bar-model"]' },
] as const;

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
] as const;

async function seedMastered(childId: string, skills: [string, string[]][]) {
  const past = new Date(Date.now() - 2 * 86_400_000);
  const later = new Date(Date.now() + 7 * 86_400_000);
  for (const [skillId, formats] of skills) {
    await db.masteryState.create({
      data: { childId, skillId, score: 0.9, phase: 'mastered', attempts: 6, independentCorrect: 6, consecutiveIndependentCorrect: 6, formats, lastEvidenceAt: past, nextReviewAt: later, reviewStep: 1, modelVersion: 'mastery-rules-2026.11.1' },
    });
  }
}

const PREREQS: [string, string[]][] = [
  ['MATH-G1-COUNT-20', ['count-ten-frame', 'count-scattered']],
  ['MATH-G1-BONDS-10', ['make-ten-frame', 'number-bond']],
];
const ADD_SUB: [string, string[]][] = [
  ['MATH-G1-ADD-10', ['add-counters', 'add-bond']],
  ['MATH-G1-SUB-10', ['sub-takeaway', 'sub-bond']],
];

async function axe(page: Page, name: string) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}

/**
 * The child picks from a small suggested set (3), so a later-stage lesson is not always offered. To exercise
 * each lesson deterministically, the test opens the session row directly (test DB only); the first item then
 * comes from the real server path. Unlocking through the public API is covered by the tests further down.
 */
async function startLesson(page: Page, childId: string, lessonId: string, start = /^(Start|Mulai)$/) {
  const skillId = lessonId.includes('add') ? 'MATH-G1-ADD-10' : lessonId.includes('sub') ? 'MATH-G1-SUB-10' : 'MATH-G1-WORD-1';
  const s = await db.learningSession.create({ data: { childId, targetItems: 5, localDate: new Date().toISOString().slice(0, 10), skillId, lessonId } });
  await page.goto(`/learn/session/${s.id}`);
  await page.getByRole('button', { name: start }).click();
}

/** A wrong value the child can actually enter: another choice, or answer + 1 on the keypad. */
async function wrongValue(page: Page, right: number): Promise<number> {
  const radios = page.getByRole('radio');
  const n = await radios.count();
  for (let i = 0; i < n; i++) {
    const v = Number(await radios.nth(i).textContent());
    if (v !== right) return v;
  }
  return right + 1;
}

for (const vp of VIEWPORTS) {
  for (const l of LESSONS) {
    test(`slice B ${l.id} @${vp.name}: representation, misconception feedback, hint, correct answer`, async ({ page, request, baseURL }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const fam = await createFamily(request, baseURL!, `sb-${vp.name}`);
      await seedMastered(fam.g1Id, l.id.startsWith('lesson-g1-word') ? [...PREREQS, ...ADD_SUB] : PREREQS);
      await signIn(page, fam.email);
      await enterChildMode(page);
      await startLesson(page, fam.g1Id, l.id);

      const id = await currentActivityId(page);
      await expect(page.locator(l.rep).first()).toBeVisible();
      await expect(page.getByTestId('question')).not.toContainText('{');
      const right = await answerFor(id);

      // Wrong first try: kind, specific feedback; the attempt is recorded with a misconception tag.
      await answer(page, await wrongValue(page, right));
      await expect(page.getByText('Not yet. Let’s look again.')).toBeVisible();
      const attempt = await db.attempt.findFirstOrThrow({ where: { activityId: id } });
      expect(attempt.correct).toBe(false);
      expect(attempt.misconceptionCodes.length).toBeGreaterThan(0);

      // A hint escalates without revealing the answer key to the client.
      await page.getByRole('button', { name: 'I need help' }).click();
      await expect(page.getByRole('note')).toBeVisible();
      await expect(page.getByRole('note')).not.toContainText('{');

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1);
      const small = await page.locator('main button:visible').evaluateAll((els) =>
        els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && (r.width < 44 || r.height < 44)).length,
      );
      expect(small, 'undersized child targets').toBe(0);
      await page.screenshot({ path: join(OUT, `${vp.name}-${l.shot}.png`), fullPage: true });
      await axe(page, `${l.id}@${vp.name}`);

      // Supported correct answer: accepted, never counted as independent.
      await answer(page, right);
      await expect(page.locator('[data-phase="correct"]')).toBeVisible();
      await expect(page.getByText('You got it, with a little help.')).toBeVisible();
      const ok = await db.attempt.findFirstOrThrow({ where: { activityId: id, correct: true } });
      expect(ok.independent).toBe(false);
    });
  }
}

test('story problems are locked until addition AND subtraction are secure', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'sb-lock');
  await seedMastered(fam.g1Id, [...PREREQS, ADD_SUB[0]!]);
  await signIn(page, fam.email);
  await enterChildMode(page);
  const r = await page.request.post('/api/learn/session', { headers: { Origin: baseURL! }, data: { lessonId: 'lesson-g1-word-1-001' } });
  expect(r.status()).toBe(403);
  const sub = await page.request.post('/api/learn/session', { headers: { Origin: baseURL! }, data: { lessonId: 'lesson-g1-sub-10-001' } });
  expect(sub.status()).toBe(201);
});

test('once number bonds are secure, concrete addition is suggested first and can be started by the child', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'sb-next');
  await seedMastered(fam.g1Id, PREREQS);
  await signIn(page, fam.email);
  await page.goto(`/dashboard/${fam.g1Id}`);
  await expect(page.getByTestId('recommendation')).toContainText('R6_NEXT_UNLOCKED');
  await enterChildMode(page);
  await page.getByRole('button', { name: 'Start' }).first().click();
  await page.waitForURL('**/learn/session/**');
  const session = await db.learningSession.findFirstOrThrow({ where: { childId: fam.g1Id, endedAt: null } });
  expect(session.lessonId).toBe('lesson-g1-add-10-001');
});

test('Indonesian story text renders with numbers filled in', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'sb-id');
  await db.childProfile.update({ where: { id: fam.g1Id }, data: { locale: 'id' } });
  await seedMastered(fam.g1Id, [...PREREQS, ...ADD_SUB]);
  await signIn(page, fam.email);
  await enterChildMode(page);
  await startLesson(page, fam.g1Id, 'lesson-g1-word-1-001');
  await expect(page.getByTestId('question')).toContainText('Berapa');
  await expect(page.getByTestId('question')).not.toContainText('{');
});
