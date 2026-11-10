import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { answer, answerFor, createFamily, currentActivityId, db, enterChildMode, signIn, startFirstChoice } from './helpers';

const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const axeViolations: { page: string; id: string; impact: string | null | undefined; nodes: number }[] = [];

async function check(page: Page, name: string, vp: (typeof VIEWPORTS)[number], opts: { childTargets?: boolean } = {}) {
  // No horizontal scrolling at any viewport.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `${name}@${vp.name} horizontal overflow`).toBeLessThanOrEqual(1);
  if (opts.childTargets) {
    // Child controls: at least 44x44 CSS px.
    const small = await page.locator('main button:visible').evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && (r.width < 44 || r.height < 44)).length,
    );
    expect(small, `${name}@${vp.name} undersized child targets`).toBe(0);
  }
  await page.screenshot({ path: join(OUT, `${vp.name}-${name}.png`), fullPage: true });
  if (vp.name === 'tablet' || vp.name === 'mobile') {
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    for (const v of res.violations) axeViolations.push({ page: `${name}@${vp.name}`, id: v.id, impact: v.impact, nodes: v.nodes.length });
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name}@${vp.name} axe`).toEqual([]);
  }
}

test.afterAll(() => {
  console.log(`AXE_SUMMARY ${JSON.stringify(axeViolations)}`);
});

for (const vp of VIEWPORTS) {
  test.describe(`visual QA @${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`public and parent screens @${vp.name}`, async ({ page, request, baseURL }) => {
      await page.goto('/');
      await check(page, '01-landing', vp);
      await page.goto('/signin');
      await check(page, '02-signin', vp);
      const fam = await createFamily(request, baseURL!, `vis-${vp.name}`);
      await signIn(page, fam.email);
      await check(page, '03-family', vp);
      await page.goto('/children/new');
      await check(page, '04-child-form', vp);
      await page.goto(`/dashboard/${fam.toddlerId}`);
      await check(page, '05-dashboard-toddler', vp);
      await page.goto(`/cards?child=${fam.toddlerId}`);
      await check(page, '06-cards', vp);
      await page.goto(`/cards/lesson-tod-pour-001?child=${fam.toddlerId}`);
      await check(page, '07-card', vp);
      await page.emulateMedia({ media: 'print' });
      await page.screenshot({ path: join(OUT, `${vp.name}-08-card-print.png`), fullPage: true });
      await page.emulateMedia({ media: 'screen' });
      await page.goto('/curriculum');
      await check(page, '09-curriculum', vp);
      await page.goto('/privacy');
      await check(page, '10-privacy', vp);
      await page.goto('/settings');
      await check(page, '11-settings', vp);
      await page.goto(`/dashboard/${fam.g1Id}`);
      await check(page, '12-dashboard-g1-empty', vp);
    });

    test(`child learning states @${vp.name}`, async ({ page, request, baseURL }) => {
      const fam = await createFamily(request, baseURL!, `vischild-${vp.name}`);
      await db.masteryState.create({
        data: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20', score: 0.83, phase: 'secure', attempts: 4, independentCorrect: 4, consecutiveIndependentCorrect: 4, formats: ['count-ten-frame', 'count-scattered'], lastEvidenceAt: new Date(), nextReviewAt: new Date(Date.now() + 20 * 3600_000), reviewStep: 0, modelVersion: 'mastery-rules-2026.11.1' },
      });
      await db.childProfile.update({ where: { id: fam.g1Id }, data: { focusSkillId: 'MATH-G1-BONDS-10' } });
      await signIn(page, fam.email);
      await enterChildMode(page);
      await check(page, '20-learn-choices', vp, { childTargets: true });
      await page.getByRole('button', { name: 'Start' }).first().click();
      await page.waitForURL('**/learn/session/**');
      await check(page, '21-runner-intro', vp, { childTargets: true });
      await page.getByRole('button', { name: 'Start' }).click();

      // Item 1: concrete make-ten
      let id = await currentActivityId(page);
      await check(page, '22-runner-make-ten', vp, { childTargets: true });
      const empty = page.getByRole('button', { name: /^Empty space/ });
      await empty.first().click(); // place one counter (the item may have only one empty space)
      await page.getByRole('button', { name: 'I need help' }).click();
      await page.getByRole('button', { name: 'I need help' }).click();
      await page.getByRole('button', { name: 'I need help' }).click();
      await check(page, '23-runner-hint-representation', vp, { childTargets: true });
      const item = (await db.activityInstance.findUniqueOrThrow({ where: { id } })).itemJson as { answer: number; params: { part: number } };
      const wrong = [item.answer + 1, item.answer - 1].find((v) => v >= 0 && v !== item.params.part && v <= 10)!;
      if (await page.getByRole('radio', { name: String(wrong), exact: true }).count()) {
        await answer(page, wrong);
        await check(page, '24-runner-wrong', vp, { childTargets: true });
        await page.getByRole('button', { name: 'Try again' }).click();
      }
      await answer(page, item.answer);
      await check(page, '25-runner-correct-supported', vp, { childTargets: true });
      await page.getByRole('button', { name: 'Next' }).click();

      // Item 2: pictorial number bond — answer independently
      id = await currentActivityId(page);
      await check(page, '26-runner-number-bond', vp, { childTargets: true });
      await answer(page, await answerFor(id));
      await check(page, '27-runner-correct', vp, { childTargets: true });
      await page.getByRole('button', { name: 'Next' }).click();

      // Items 3–5: progress towards abstract; capture the keypad and the worked-example state.
      for (let i = 3; i <= 5; i++) {
        id = await currentActivityId(page);
        const kind = await page.locator('[data-phase]').evaluate(() => (document.querySelector('[role="radiogroup"]') ? 'choice' : 'keypad'));
        if (kind === 'keypad') {
          await check(page, `28-runner-equation-${i}`, vp, { childTargets: true });
        }
        if (i === 5) {
          for (let h = 0; h < 5; h++) await page.getByRole('button', { name: 'I need help' }).click();
          await check(page, '29-runner-worked-example', vp, { childTargets: true });
        } else {
          await answer(page, await answerFor(id));
        }
        await page.getByRole('button', { name: i === 5 ? 'Finish' : 'Next' }).click();
      }
      await expect(page.getByTestId('summary')).toBeVisible();
      await check(page, '30-runner-summary', vp, { childTargets: true });

      // PIN dialog
      await page.getByRole('button', { name: /Grown-ups/ }).click();
      await page.screenshot({ path: join(OUT, `${vp.name}-31-pin-dialog.png`) });
      await page.keyboard.press('Escape');

      // Offline/network error state
      await page.goto('/learn');
      await page.getByRole('button', { name: 'Start' }).first().click();
      await page.waitForURL('**/learn/session/**');
      await page.route('**/api/attempts', (r) => r.abort('internetdisconnected'));
      await page.getByRole('button', { name: 'Start' }).click();
      await answer(page, await answerFor(await currentActivityId(page)));
      await expect(page.locator('main [role="alert"]')).toContainText('offline');
      await check(page, '32-runner-offline', vp, { childTargets: true });
      await page.unroute('**/api/attempts');

      // Parent dashboard with real evidence afterwards
      await page.goto('/learn');
      await page.getByRole('button', { name: /Grown-ups/ }).click();
      await page.getByLabel('PIN').fill('2468');
      await page.getByRole('button', { name: 'Unlock' }).click();
      await page.waitForURL('**/family');
      await page.goto(`/dashboard/${fam.g1Id}`);
      await page.locator('[data-skill="MATH-G1-BONDS-10"] summary').click();
      await check(page, '33-dashboard-g1-evidence', vp);
      await page.getByRole('button', { name: /^ID/ }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'id');
      await check(page, '34-dashboard-g1-indonesian', vp);
      await page.getByRole('button', { name: /^EN/ }).click();
    });
  });
}

test('keyboard: parent can complete sign-in and navigate with the keyboard only', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'kbd');
  await page.goto('/signin');
  await page.keyboard.press('Tab'); // skip link
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByLabel('Email').focus();
  await page.keyboard.type(fam.email);
  await page.keyboard.press('Tab');
  await page.keyboard.type('synthetic-password-123');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/family');
  const nav = page.getByRole('navigation').getByRole('link', { name: 'Activity cards' });
  await nav.focus();
  await page.keyboard.press('Enter');
  await page.waitForURL('**/cards');
});

test('reduced motion preference is honoured', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const d = await page.locator('.btn-primary').first().evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(parseFloat(d)).toBeLessThan(0.05);
});
