import { expect, test } from '@playwright/test';
import { answer, answerFor, createFamily, currentActivityId, db, enterChildMode, signIn } from './helpers';

/** Permanent regression tests for the independent audit findings (ATL-xx). */

async function g1WithCountingSecure(request: import('@playwright/test').APIRequestContext, baseURL: string, tag: string) {
  const fam = await createFamily(request, baseURL, tag);
  await db.masteryState.create({
    data: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20', score: 0.9, phase: 'mastered', attempts: 6, independentCorrect: 6, consecutiveIndependentCorrect: 6, formats: ['count-ten-frame', 'count-scattered'], lastEvidenceAt: new Date(Date.now() - 2 * 86_400_000), nextReviewAt: new Date(Date.now() + 7 * 86_400_000), reviewStep: 1, modelVersion: 'mastery-rules-2026.11.2' },
  });
  return fam;
}

test('ATL-03: the number-bond scaffold shows exactly whole − part fillable spaces after a wrong answer', async ({ page, request, baseURL }) => {
  const fam = await g1WithCountingSecure(request, baseURL!, 'atl03');
  await signIn(page, fam.email);
  await enterChildMode(page);
  for (let round = 0; round < 3; round++) {
    await db.learningSession.updateMany({ where: { childId: fam.g1Id, endedAt: null }, data: { endedAt: new Date() } });
    const s = await db.learningSession.create({ data: { childId: fam.g1Id, targetItems: 5, localDate: new Date().toISOString().slice(0, 10), skillId: 'MATH-G1-BONDS-10', lessonId: 'lesson-g1-bonds-10-002' } });
    await page.goto(`/learn/session/${s.id}`);
    await page.getByRole('button', { name: 'Start' }).click();
    const id = await currentActivityId(page);
    const item = (await db.activityInstance.findUniqueOrThrow({ where: { id } })).itemJson as { presentation: { whole: number; knownPart: number } };
    const right = await answerFor(id);
    const radios = page.getByRole('radio');
    let wrong = right + 1;
    for (let i = 0; i < (await radios.count()); i++) {
      const v = Number(await radios.nth(i).textContent());
      if (v !== right) { wrong = v; break; }
    }
    await answer(page, wrong);
    await expect(page.getByText('Not yet. Let’s look again.')).toBeVisible();
    const { whole, knownPart } = item.presentation;
    await expect(page.locator('[data-cell="fillable"]')).toHaveCount(whole - knownPart);
    await expect(page.locator('[data-cell="unused"]')).toHaveCount((whole > 10 ? 20 : 10) - whole);
  }
});
