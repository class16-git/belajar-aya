import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { answer, answerFor, createFamily, currentActivityId, db, enterChildMode, signIn } from './helpers';

const OUT = join(process.cwd(), '../../artifacts/screenshots');

test('Kindergarten learner: teen numbers unlock after counting; full ten-frame item with "forgot the ten" feedback @tablet', async ({ page, request, baseURL }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  const fam = await createFamily(request, baseURL!, 'k-maths');
  await db.childProfile.update({ where: { id: fam.g1Id }, data: { schoolGrade: 'Kindergarten' } });
  await db.masteryState.create({
    data: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20', score: 0.9, phase: 'mastered', attempts: 6, independentCorrect: 6, consecutiveIndependentCorrect: 6, formats: ['count-ten-frame', 'count-scattered'], lastEvidenceAt: new Date(Date.now() - 2 * 86_400_000), nextReviewAt: new Date(Date.now() + 7 * 86_400_000), reviewStep: 1, modelVersion: 'mastery-rules-2026.11.1' },
  });
  await signIn(page, fam.email);
  await enterChildMode(page);
  await expect(page.locator('[data-lesson="lesson-k-teens-001"]')).toBeVisible();
  await page.locator('[data-lesson="lesson-k-teens-001"]').getByRole('button', { name: 'Start' }).click();
  await page.waitForURL('**/learn/session/**');
  await page.getByRole('button', { name: 'Start' }).click();
  const id = await currentActivityId(page);
  const right = await answerFor(id);
  const item = await db.activityInstance.findUniqueOrThrow({ where: { id } });
  const ones = (item.itemJson as { params: { missing: number } }).params.missing;
  await expect(page.getByTestId('question')).toContainText('One ten-frame is full');
  await answer(page, ones);
  await expect(page.getByText('Don’t forget the full ten-frame')).toBeVisible();
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => v.id)).toEqual([]);
  await page.screenshot({ path: join(OUT, 'tablet-95-k-teen-numbers.png'), fullPage: true });
  await page.getByRole('button', { name: 'Try again' }).click();
  await answer(page, right);
  await expect(page.locator('[data-phase="correct"]')).toBeVisible();
  await expect(page.getByTestId('credit')).toContainText('Made with ❤ by Ayah, for Kakak and Adek');
});

test('Grade 1 learners never get Kindergarten-only lessons', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'k-g1');
  await db.masteryState.create({
    data: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20', score: 0.9, phase: 'mastered', attempts: 6, independentCorrect: 6, consecutiveIndependentCorrect: 6, formats: ['count-ten-frame', 'count-scattered'], lastEvidenceAt: new Date(Date.now() - 2 * 86_400_000), nextReviewAt: new Date(Date.now() + 7 * 86_400_000), reviewStep: 1, modelVersion: 'mastery-rules-2026.11.1' },
  });
  await signIn(page, fam.email);
  await enterChildMode(page);
  const r = await page.request.post('/api/learn/session', { headers: { Origin: baseURL! }, data: { lessonId: 'lesson-k-teens-001' } });
  expect(r.status()).toBe(403);
});

const K_LESSONS = [
  { id: 'lesson-k-teens-001', skill: 'K-MATH-TEENS', shot: '96-k-teens-frames' },
  { id: 'lesson-k-teens-002', skill: 'K-MATH-TEENS', shot: '97-k-teens-sentence' },
  { id: 'lesson-k-bonds-20-001', skill: 'K-MATH-BONDS-20', shot: '98-k-bonds-20' },
  { id: 'lesson-k-bonds-20-002', skill: 'K-MATH-BONDS-20', shot: '99-k-bonds-20-sentence' },
  { id: 'lesson-k-picture-story-001', skill: 'K-MATH-STORIES', shot: '100-k-picture-story' },
] as const;

for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 820, height: 1180 }] as const) {
  for (const l of K_LESSONS) {
    test(`K lesson ${l.id} @${vp.name}: wrong → tagged, hint, supported correct, a11y, no overflow`, async ({ page, request, baseURL }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const fam = await createFamily(request, baseURL!, `k-${vp.name}`);
      await db.childProfile.update({ where: { id: fam.g1Id }, data: { schoolGrade: 'Kindergarten' } });
      await signIn(page, fam.email);
      await enterChildMode(page);
      const s = await db.learningSession.create({ data: { childId: fam.g1Id, targetItems: 5, localDate: new Date().toISOString().slice(0, 10), skillId: l.skill, lessonId: l.id } });
      await page.goto(`/learn/session/${s.id}`);
      await page.getByRole('button', { name: 'Start' }).click();
      const id = await currentActivityId(page);
      const right = await answerFor(id);
      await expect(page.getByTestId('question')).not.toContainText('{');
      const radios = page.getByRole('radio');
      let wrong = right + 1;
      for (let i = 0; i < (await radios.count()); i++) {
        const v = Number(await radios.nth(i).textContent());
        if (v !== right) { wrong = v; break; }
      }
      await answer(page, wrong);
      await expect(page.getByText('Not yet. Let’s look again.')).toBeVisible();
      const attempt = await db.attempt.findFirstOrThrow({ where: { activityId: id } });
      expect(attempt.misconceptionCodes.length).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'I need help' }).click();
      await expect(page.getByRole('note')).not.toContainText('{');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const small = await page.locator('main button:visible').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && (r.width < 44 || r.height < 44)).length);
      expect(small).toBe(0);
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await page.screenshot({ path: join(OUT, `${vp.name}-${l.shot}.png`), fullPage: true });
      await answer(page, right);
      await expect(page.getByText('You got it, with a little help.')).toBeVisible();
    });
  }
}

test('parent view of a Kindergarten learner: dashboard lists K skills; curriculum shows the Kindergarten band', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'k-parent');
  await db.childProfile.update({ where: { id: fam.g1Id }, data: { schoolGrade: 'Kindergarten' } });
  await signIn(page, fam.email);
  await page.goto(`/dashboard/${fam.g1Id}`);
  for (const s of ['K-MATH-TEENS', 'K-MATH-BONDS-20', 'K-MATH-STORIES', 'MATH-G1-COUNT-20']) await expect(page.locator(`[data-skill="${s}"]`)).toBeVisible();
  await page.screenshot({ path: join(OUT, 'tablet-101-dashboard-kindergarten.png'), fullPage: true });
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => v.id)).toEqual([]);
  await page.goto('/curriculum');
  await expect(page.locator('#band-kindergarten')).toHaveText('Kindergarten');
  await expect(page.locator('#K-MATH-TEENS')).toBeVisible();
});
