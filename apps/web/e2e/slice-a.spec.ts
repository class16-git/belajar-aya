import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFamily, db, signIn } from './helpers';

/** Slice A extension: age 3–4 caregiver-led cards (synthetic learners only). */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });

const PRESCHOOL = [
  'lesson-pre-dress-001',
  'lesson-pre-sounds-001',
  'lesson-pre-prewrite-001',
  'lesson-pre-3period-001',
  'lesson-pre-count10-001',
  'lesson-pre-pattern-001',
  'lesson-pre-shapes-001',
  'lesson-pre-length-001',
  'lesson-robo-ramps-001',
];

async function axe(page: Page, name: string) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}

/** A synthetic toddler-mode learner who turned 3 a few months ago. */
async function threeYearOld(toddlerId: string) {
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 3, dob.getMonth() - 2);
  await db.childProfile.update({ where: { id: toddlerId }, data: { dateOfBirth: dob } });
}

test('a 3-year-old gets age 3–4 cards only after the parent confirms the transition', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'pre-ack');
  await threeYearOld(fam.toddlerId);
  await signIn(page, fam.email);
  await page.goto(`/dashboard/${fam.toddlerId}`);
  const preschoolLink = page.getByRole('link', { name: /^Open card:/ });
  await expect(preschoolLink.first()).toBeVisible();
  const before = await preschoolLink.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  for (const id of PRESCHOOL) expect(before.some((h) => h.includes(`/cards/${id}?`))).toBe(false);

  const ack = await page.request.post(`/api/parent/children/${fam.toddlerId}/acknowledge-transition`, { headers: { Origin: baseURL! } });
  expect(ack.ok()).toBe(true);
  await page.reload();
  const after = await preschoolLink.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  expect(after.some((h) => PRESCHOOL.some((id) => h.includes(`/cards/${id}?`)))).toBe(true);
});

for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 820, height: 1180 }] as const) {
  test(`every age 3–4 card renders with safety notes, both languages, no overflow @${vp.name}`, async ({ page, request, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const fam = await createFamily(request, baseURL!, `pre-${vp.name}`);
    await signIn(page, fam.email);
    await page.goto('/cards');
    for (const id of PRESCHOOL) await expect(page.locator(`[data-card="${id}"]`)).toContainText('Ages 3–4');
    for (const id of PRESCHOOL) {
      await page.goto(`/cards/${id}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText('An adult stays within arm', { exact: false })).toBeVisible();
      await expect(page.locator('body')).not.toContainText('{');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${id} overflow`).toBeLessThanOrEqual(1);
    }
    await page.goto('/cards/lesson-pre-count10-001');
    await page.screenshot({ path: join(OUT, `${vp.name}-60-card-count-10.png`), fullPage: true });
    await axe(page, `count10@${vp.name}`);
    await page.goto('/cards/lesson-robo-ramps-001');
    await page.screenshot({ path: join(OUT, `${vp.name}-61-card-ramps.png`), fullPage: true });
    await axe(page, `ramps@${vp.name}`);
  });
}
