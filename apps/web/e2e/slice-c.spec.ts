import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFamily, db, signIn } from './helpers';

/** Slice C (offline part): age 4–5 and Kindergarten caregiver-led cards. Synthetic learners only. */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });

const CARDS = [
  'lesson-prek-sound-letter-001', 'lesson-prek-movable-letters-001', 'lesson-prek-world-cycles-001', 'lesson-prek-compose-10-001',
  'lesson-prek-add-sub-objects-001', 'lesson-robo-prek-adult-robot-001', 'lesson-robo-prek-gears-001', 'lesson-k-read-words-001',
  'lesson-k-maps-plants-001', 'lesson-k-routines-001', 'lesson-k-picture-problems-001', 'lesson-robo-k-loops-001', 'lesson-robo-k-linkage-001',
];
const K_CARDS = CARDS.filter((c) => c.includes('-k-'));

async function axe(page: Page, name: string) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}

test('a 5-year-old gets age 4–5 / Kindergarten cards only after the parent confirms, never toddler cards', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'k-cards');
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 5, dob.getMonth() - 3);
  await db.childProfile.update({ where: { id: fam.toddlerId }, data: { dateOfBirth: dob } });
  await signIn(page, fam.email);
  await page.goto(`/dashboard/${fam.toddlerId}`);
  const links = page.getByRole('link', { name: /^Open card:/ });
  await expect(links.first()).toBeVisible();
  const hrefs = async () => links.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  expect((await hrefs()).every((h) => h.includes('/cards/lesson-tod-'))).toBe(true);

  await page.request.post(`/api/parent/children/${fam.toddlerId}/acknowledge-transition`, { headers: { Origin: baseURL! } });
  await page.reload();
  const after = await hrefs();
  expect(after.length).toBeGreaterThan(0);
  expect(after.some((h) => h.includes('/cards/lesson-tod-'))).toBe(false);
  expect(after.every((h) => CARDS.some((c) => h.includes(`/cards/${c}?`)))).toBe(true);
});

test('all age 4–5 and Kindergarten cards render with safety notes and no overflow @mobile', async ({ page, request, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const fam = await createFamily(request, baseURL!, 'k-render');
  await signIn(page, fam.email);
  await page.goto('/cards');
  for (const id of CARDS) await expect(page.locator(`[data-card="${id}"]`)).toContainText(K_CARDS.includes(id) ? 'Kindergarten' : 'Ages 4–5');
  for (const id of CARDS) {
    await page.goto(`/cards/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('An adult stays within reach', { exact: false })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, id).toBeLessThanOrEqual(1);
  }
  await page.goto('/cards/lesson-prek-compose-10-001');
  await axe(page, 'compose-10');
  await page.screenshot({ path: join(OUT, 'mobile-80-card-hiding-hands.png'), fullPage: true });
  await page.goto('/cards/lesson-robo-k-linkage-001');
  await axe(page, 'linkage');
  await page.screenshot({ path: join(OUT, 'mobile-81-card-linkage.png'), fullPage: true });
});
