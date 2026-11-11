import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createFamily, signIn } from './helpers';

/** Expansion pilot batch: original Grade 2–6 passages render in review (preview) mode on a phone. Synthetic data. */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });
const PILOT = ['passage-g2-paper-boat', 'passage-g3-market-list', 'passage-g4-class-plant', 'passage-g5-broken-window', 'passage-g6-grandfathers-radio'];

test.use({ viewport: { width: 390, height: 844 } });

test('pilot passages render with questions, no answer key, no overflow and no axe violations @mobile', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'pilot');
  await signIn(page, fam.email);
  for (const id of PILOT) {
    await page.goto(`/library/passage/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const src = JSON.parse(readFileSync(join(process.cwd(), `../../content/library/passages/${id}.json`), 'utf8')) as { questions: { prompt: { en: string } }[] };
    await expect(page.getByText(src.questions[0]!.prompt.en, { exact: false }).first()).toBeVisible();
    const html = await page.content();
    expect(html, id).not.toMatch(/"answer"|evidenceParagraph/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${id} overflow`).toBe(true);
    await page.waitForFunction(() => document.title.trim().length > 0); // Next streams metadata; a missing title still fails here
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(res.violations.map((v) => v.id), `${id} axe`).toEqual([]);
  }
  await page.screenshot({ path: join(OUT, 'mobile-110-pilot-g6-passage.png'), fullPage: true });
});
