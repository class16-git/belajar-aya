import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createFamily, signIn } from './helpers';

/** Browser verification of the WHOLE expansion corpus: every unit guide and reading renders on a phone. Synthetic data. */
const root = join(process.cwd(), '../../content');
const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/^(unit|reading)-.*\.json$/.test(f)) files.push(p); } };
walk(join(root, 'units'));
walk(join(root, 'readings'));
const items = files.map((f) => JSON.parse(readFileSync(f, 'utf8')) as { id: string; framework?: string; genre?: string; title: { en: string } });

test.use({ viewport: { width: 390, height: 844 } });
test.setTimeout(10 * 60_000);

test(`all ${items.length} expansion units and readings render for the parent on a phone, without overflow`, async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'corpus');
  await signIn(page, fam.email);
  const axeSampled = new Set<string>();
  for (const it of items) {
    const url = it.id.startsWith('unit-') ? `/units/${it.id}` : `/readings/${it.id}`;
    const res = await page.goto(url);
    expect(res?.status(), it.id).toBe(200);
    await expect(page.getByRole('heading', { level: 1 }), it.id).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${it.id} overflow`).toBe(true);
    const kind = it.framework ?? it.genre ?? 'other';
    if (!axeSampled.has(kind)) {
      axeSampled.add(kind);
      await page.waitForFunction(() => document.title.trim().length > 0);
      const a = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(a.violations.map((v) => v.id), `${it.id} axe`).toEqual([]);
    }
  }
  expect(axeSampled.size).toBeGreaterThan(5);
});

test('review queue: filters by kind, level and framework, pages 10 at a time, and keeps Islamic items scholar-gated', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'revfilter');
  await signIn(page, fam.email);
  await page.goto('/review');
  await expect(page.getByTestId('review-count')).toContainText('page 1 of');
  expect(await page.locator('[data-testid="review-queue"] > li').count()).toBe(10);
  await page.getByTestId('review-pagination').getByRole('link', { name: /Next/ }).click();
  await expect(page.getByTestId('review-count')).toContainText('page 2 of');
  // Pick the filter from an item actually awaiting review (content approval state changes over time).
  await page.goto('/review?kind=units');
  const firstId = (await page.locator('[data-testid="review-queue"] [data-review-item]').first().getAttribute('data-review-item'))!;
  const [, level, framework] = firstId.split('-');
  await page.goto(`/review?kind=units&level=${level}&framework=${framework}`);
  const ids = await page.locator('[data-testid="review-queue"] [data-review-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-review-item') ?? ''));
  expect(ids.length).toBeGreaterThan(0);
  for (const id of ids) expect(id.startsWith(`unit-${level}-${framework}-`), id).toBe(true);
  await page.goto('/review?kind=islamic');
  const n = await page.locator('[data-testid="review-queue"] > li').count();
  expect(n).toBeGreaterThan(0);
  await expect(page.getByTestId('review-queue')).toContainText(/scholar/i);
});
