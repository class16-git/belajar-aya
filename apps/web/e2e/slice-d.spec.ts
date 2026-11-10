import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { answer, answerFor, createFamily, currentActivityId, db, enterChildMode, signIn } from './helpers';

/** Slice D: Grade 1 unplugged robotics — on-screen trace/debug plus printable rubric and sensor cards. */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });

async function axe(page: Page, name: string) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}

async function secureCounting(childId: string) {
  await db.masteryState.create({
    data: { childId, skillId: 'MATH-G1-COUNT-20', score: 0.9, phase: 'mastered', attempts: 6, independentCorrect: 6, consecutiveIndependentCorrect: 6, formats: ['count-ten-frame', 'count-scattered'], lastEvidenceAt: new Date(Date.now() - 2 * 86_400_000), nextReviewAt: new Date(Date.now() + 7 * 86_400_000), reviewStep: 1, modelVersion: 'mastery-rules-2026.11.1' },
  });
}

const LESSONS = [
  { id: 'lesson-robo-g1-trace-001', shot: '70-robot-trace', extra: '[data-marker]' },
  { id: 'lesson-robo-g1-debug-001', shot: '71-robot-debug', extra: '[data-testid="robot-flag"]' },
] as const;

for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 820, height: 1180 }] as const) {
  for (const l of LESSONS) {
    test(`robotics ${l.id} @${vp.name}: grid, program, tagged wrong answer, path hint, supported correct`, async ({ page, request, baseURL }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const fam = await createFamily(request, baseURL!, `robo-${vp.name}`);
      await secureCounting(fam.g1Id);
      await signIn(page, fam.email);
      await enterChildMode(page);
      const s = await db.learningSession.create({ data: { childId: fam.g1Id, targetItems: 5, localDate: new Date().toISOString().slice(0, 10), skillId: 'ROBO-G1-DEBUG', lessonId: l.id } });
      await page.goto(`/learn/session/${s.id}`);
      await page.getByRole('button', { name: 'Start' }).click();

      const id = await currentActivityId(page);
      await expect(page.getByTestId('robot-grid')).toBeVisible();
      await expect(page.getByTestId('robot')).toBeVisible();
      await expect(page.locator(l.extra).first()).toBeVisible();
      await expect(page.getByTestId('robot-program').locator('li').first()).toHaveAttribute('aria-label', /^Step 1: (up|down|left|right)$/);

      const right = await answerFor(id);
      await answer(page, right === 1 ? 2 : right - 1);
      await expect(page.getByText('Not yet. Let’s look again.')).toBeVisible();
      await expect(page.locator('[data-testid="robot-grid"] polyline')).toHaveCount(1); // the dotted path appears after a mistake (a flat line has no visible height)
      await page.getByRole('button', { name: 'I need help' }).click();
      await expect(page.getByRole('note')).not.toContainText('{');

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await page.screenshot({ path: join(OUT, `${vp.name}-${l.shot}.png`), fullPage: true });
      await axe(page, `${l.id}@${vp.name}`);

      await answer(page, right);
      await expect(page.getByText('You got it, with a little help.')).toBeVisible();
      const attempts = await db.attempt.findMany({ where: { activityId: id }, orderBy: { createdAt: 'asc' } });
      expect(attempts.map((a) => a.correct)).toEqual([false, true]);
      expect(attempts[1]!.independent).toBe(false);
    });
  }
}

test('robot activities are not offered before counting is secure', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'robo-lock');
  await signIn(page, fam.email);
  await enterChildMode(page);
  const r = await page.request.post('/api/learn/session', { headers: { Origin: baseURL! }, data: { lessonId: 'lesson-robo-g1-trace-001' } });
  expect(r.status()).toBe(403);
});

test('Grade 1 robotics cards: rubric lines and sensor safety render @mobile', async ({ page, request, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const fam = await createFamily(request, baseURL!, 'robo-cards');
  await signIn(page, fam.email);
  await page.goto('/cards/lesson-robo-g1-grid-001');
  await expect(page.getByText('Rubric 3 — Debugs', { exact: false })).toBeVisible();
  await axe(page, 'grid-card');
  await page.screenshot({ path: join(OUT, 'mobile-72-card-floor-grid-robot.png'), fullPage: true });
  await page.goto('/cards/lesson-robo-g1-sensors-001');
  await expect(page.getByText('Never shine a torch', { exact: false })).toBeVisible();
  await axe(page, 'sensor-card');
});
