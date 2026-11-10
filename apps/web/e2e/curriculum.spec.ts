import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFamily, enterChildMode, signIn } from './helpers';

const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });

async function axe(page: import('@playwright/test').Page, name: string) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}

for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 820, height: 1180 }] as const) {
  test(`curriculum coverage, review queue and religious review view @${vp.name}`, async ({ page, request, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const fam = await createFamily(request, baseURL!, `curr-${vp.name}`);
    await signIn(page, fam.email);
    await page.goto('/curriculum');

    const queue = page.getByTestId('review-queue');
    const islamic = queue.locator('[data-review-item="lesson-islm-meal-adab-001"]');
    await expect(islamic).toContainText('Qualified religious review');
    await expect(islamic).toContainText('Arabic text');
    await expect(queue.locator('[data-review-item="lesson-robo-arrows-001"]')).toHaveCount(0); // owner-approved
    await expect(queue.locator('[data-review-item="lesson-g1-count-20-001"]')).toHaveCount(0);

    const matrix = page.getByTestId('coverage-matrix');
    await expect(matrix.locator('[data-cell="g1:singapore_math"]')).toContainText('4/8');
    await expect(matrix.locator('[data-cell="age2_3:islamic_studies"]')).toContainText('0/3');
    await page.locator('[data-stage="age2_3"] summary').click();
    await expect(page.locator('[data-objective="islm.age2_3.bismillah-alhamdulillah"]')).toContainText('Awaiting religious review');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: join(OUT, `${vp.name}-40-curriculum-coverage.png`), fullPage: true });
    await axe(page, `curriculum@${vp.name}`);

    await islamic.getByRole('link', { name: /Open for review/ }).click();
    await page.waitForURL('**/curriculum/review/lesson-islm-meal-adab-001');
    const review = page.getByTestId('review-lesson');
    await expect(page.getByTestId('blocking-issues')).toContainText('Religious review is unverified');
    await expect(page.getByTestId('blocking-issues')).toContainText('Arabic phrases are not verified');
    const phrases = page.getByTestId('arabic-phrase');
    await expect(phrases).toHaveCount(2);
    await expect(phrases.first()).toContainText('Unverified');
    await expect(phrases.first().locator('[lang="ar"]')).toHaveAttribute('dir', 'rtl');
    await expect(review).toContainText('Not provided — the reviewer supplies this');
    await expect(review).toContainText('content:religious-approve');
    const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow2).toBeLessThanOrEqual(1);
    await page.screenshot({ path: join(OUT, `${vp.name}-41-religious-review-view.png`), fullPage: true });
    await axe(page, `review@${vp.name}`);
  });
}

test('child mode cannot open the curriculum or review views', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'curr-child');
  await signIn(page, fam.email);
  await enterChildMode(page);
  for (const path of ['/curriculum', '/curriculum/review/lesson-islm-meal-adab-001']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/learn$/);
  }
});

test('unknown lessons 404 on the review view', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'curr-404');
  await signIn(page, fam.email);
  await page.goto('/curriculum/review/lesson-does-not-exist');
  await expect(page.getByText('We could not find that page.')).toBeVisible();
});
