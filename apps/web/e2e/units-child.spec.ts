import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFamily, db, enterChildMode, exitChildMode, signIn } from './helpers';

/**
 * Child-facing expansion learning units (preview mode: agent_reviewed units are visible). Unit ids are discovered from
 * the built app (the parent /units page), never from disk, because content is added while other work goes on.
 * Synthetic data only.
 */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });
const origin = (baseURL: string) => ({ Origin: baseURL });

async function axe(page: Page, name: string) {
  await page.waitForFunction(() => document.title.trim().length > 0);
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}
async function noOverflow(page: Page, name: string) {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(o, `${name} horizontal overflow`).toBeLessThanOrEqual(1);
}

async function addG2(request: APIRequestContext, baseURL: string, nickname = 'Bima') {
  const base = { timezone: 'Asia/Jakarta', locale: 'en', itemsPerSession: 5, targetMinutes: 15, audioEnabled: false, reducedMotion: false, focusSkillId: null };
  const r = await request.post('/api/parent/children', { headers: origin(baseURL), data: { ...base, nickname, dateOfBirth: '2018-03-10', schoolGrade: 'Grade 2', mode: 'ELEMENTARY_GUIDED' } });
  expect(r.status()).toBe(201);
  return (await r.json()).id as string;
}

/** G2 units as the parent area lists them: visible to children in this deployment, and hidden ones. */
async function g2Units(page: Page) {
  await page.goto('/units?level=g2&kind=units');
  const ids = async (visible: 'true' | 'false') => page.locator(`[data-unit][data-level="g2"][data-visible="${visible}"]`).evaluateAll((els) => els.map((e) => e.getAttribute('data-unit')!));
  const shown = await ids('true');
  const hidden = await ids('false');
  expect(shown.length, 'needs G2 units visible in preview').toBeGreaterThan(0);
  return { shown, hidden };
}

/** Correct choice text and explanation per item, from the parent-only unit guide (answer key). */
async function answerKey(page: Page, unitId: string) {
  await page.goto(`/units/${unitId}`);
  const items = page.getByTestId('answer-key').locator('> li[data-item]');
  const out: { id: string; correct: string; explanation: string }[] = [];
  for (let i = 0; i < (await items.count()); i++) {
    const li = items.nth(i);
    const correct = ((await li.locator('[data-correct]').innerText()).replace(/^[A-D]\.\s*/, '').replace(/\s*✓[\s\S]*$/, '')).trim();
    const explanation = ((await li.locator('> p').nth(1).innerText()).replace(/^[^:]+:\s*/, '')).trim();
    out.push({ id: (await li.getAttribute('data-item'))!, correct, explanation });
  }
  const misconceptions = await page.getByTestId('unit-guide').locator('[data-misconception]').evaluateAll((els) => els.map((e) => e.getAttribute('data-misconception')!));
  return { items: out, misconceptions };
}

for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 820, height: 1180 }] as const) {
  test(`G2 child sees G2 units, answers a unit check by keyboard, parent sees evidence @${vp.name}`, async ({ page, request, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const fam = await createFamily(request, baseURL!, `uc-${vp.name}`);
    const g2Id = await addG2(request, baseURL!);
    await signIn(page, fam.email);
    const { shown, hidden } = await g2Units(page);
    const unitId = shown[0]!;
    const { items: key, misconceptions } = await answerKey(page, unitId);
    expect(key.length).toBeGreaterThanOrEqual(3);

    await enterChildMode(page, 'Bima');
    const list = page.getByTestId('child-units');
    await expect(list).toBeVisible();
    const listed = await list.locator('[data-child-unit]').evaluateAll((els) => els.map((e) => e.getAttribute('data-child-unit')!));
    expect(new Set(listed)).toEqual(new Set(shown));
    for (const h of hidden) expect(listed).not.toContain(h);
    await noOverflow(page, 'learn');

    await list.locator(`[data-child-unit="${unitId}"]`).getByRole('link').click();
    await page.waitForURL(`**/learn/unit/${unitId}`);
    await expect(page.getByTestId('unit-child')).toBeVisible();
    // Nothing in the HTML (including the RSC payload) reveals the key before answering.
    const html = await page.content();
    expect(html).not.toContain('distractorMisconceptions');
    for (const k of key) expect(html).not.toContain(k.explanation);
    for (const code of misconceptions) expect(html).not.toContain(code);
    await noOverflow(page, `unit@${vp.name}`);
    await axe(page, `unit@${vp.name}`);
    await page.screenshot({ path: join(OUT, `${vp.name}-130-unit-child.png`), fullPage: true });

    // Keyboard only: Tab into the first radio group, Space to choose, arrows to move, Tab to the next group.
    const check = page.getByTestId('unit-check');
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.type === 'radio')) break;
    }
    for (const k of key) {
      const group = check.locator(`[data-item="${k.id}"]`);
      await page.keyboard.press('Space');
      for (let n = 0; n < 4; n++) {
        const label = (await group.locator('label:has(input:checked)').innerText()).trim();
        if (label === k.correct) break;
        await page.keyboard.press('ArrowDown');
      }
      await expect(group.locator('label:has(input:checked)')).toHaveText(k.correct);
      await page.keyboard.press('Tab');
    }
    await expect(page.getByRole('button', { name: 'Check my answers' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('unit-result')).toBeVisible();
    await expect(check.getByTestId('item-feedback')).toHaveCount(key.length);
    await expect(check.getByTestId('item-feedback').first()).toContainText(key[0]!.explanation);
    const rows = await db.unitAttempt.findMany({ where: { childId: g2Id } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ unitId, correct: key.length, total: key.length, firstAttempt: true, parentAssisted: null, misconceptions: [] });
    await noOverflow(page, `unit-done@${vp.name}`);
    await axe(page, `unit-done@${vp.name}`);

    // Parent sees the evidence panel.
    await exitChildMode(page);
    await page.goto(`/dashboard/${g2Id}`);
    const panel = page.getByTestId('unit-progress').locator(`[data-unit-progress="${unitId}"]`);
    await expect(panel).toContainText('Checks: 1');
    await expect(panel).toContainText('Best: 100%');
    await expect(panel).toHaveAttribute('data-secure', 'false');
    await noOverflow(page, `dashboard@${vp.name}`);
  });
}

test('unit check is idempotent, isolated per family, and refuses hidden units and parent pages in child mode', async ({ browser, request, baseURL }) => {
  const h = origin(baseURL!);
  const a = await createFamily(request, baseURL!, 'uc-a');
  const aG2 = await addG2(request, baseURL!);
  const ctxA = await browser.newContext({ baseURL });
  const pageA = await ctxA.newPage();
  await signIn(pageA, a.email);
  const { shown, hidden } = await g2Units(pageA);
  const unitId = shown[0]!;
  await pageA.goto('/units?level=g6&kind=units');
  const otherStage = await pageA.locator('[data-unit][data-level="g6"][data-visible="true"]').first().getAttribute('data-unit');
  expect(otherStage).toBeTruthy();
  await enterChildMode(pageA, 'Bima');
  await pageA.goto(`/learn/unit/${unitId}`);
  const itemIds = await pageA.getByTestId('unit-check').locator('fieldset[data-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-item')!));
  const answers = Object.fromEntries(itemIds.map((id) => [id, 0]));
  const attemptId = randomUUID();
  const post = (data: unknown, id = unitId, page = pageA) => page.request.post(`/api/units/${id}/check`, { headers: h, data });

  // Concurrent duplicate + retry → one row, same result.
  const [r1, r2] = await Promise.all([post({ attemptId, answers }), post({ attemptId, answers })]);
  const r3 = await post({ attemptId, answers });
  for (const r of [r1, r2, r3]) expect(r.status()).toBe(200);
  const [b1, b2, b3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
  expect(b2.correct).toBe(b1.correct);
  expect(b3).toMatchObject({ correct: b1.correct, replayed: true, firstAttempt: true });
  expect(await db.unitAttempt.count({ where: { attemptId } })).toBe(1);
  // A new attempt is a review, not a first attempt.
  const again = await (await post({ attemptId: randomUUID(), answers })).json();
  expect(again.firstAttempt).toBe(false);
  expect(await db.unitAttempt.count({ where: { childId: aG2 } })).toBe(2);

  // Input validation: strict body, unknown or missing items, out-of-range positions.
  expect((await post({ attemptId: randomUUID(), answers, extra: 1 })).status()).toBe(400);
  expect((await post({ attemptId: randomUUID(), answers: { ...answers, a99: 0 } })).status()).toBe(400);
  expect((await post({ attemptId: randomUUID(), answers: { [itemIds[0]!]: 0 } })).status()).toBe(400);
  expect((await post({ attemptId: 'not-a-uuid', answers })).status()).toBe(400);
  // Units not visible to children under the threshold, and unknown units: 404.
  if (hidden[0]) {
    expect((await post({ attemptId: randomUUID(), answers }, hidden[0])).status()).toBe(404);
    expect((await pageA.goto(`/learn/unit/${hidden[0]}`))!.status()).toBe(404);
  }
  expect((await post({ attemptId: randomUUID(), answers }, 'unit-g2-math-not-real')).status()).toBe(404);
  // A unit of another stage (visible to children, but not at this child's stage) is not this child's.
  expect((await post({ attemptId: randomUUID(), answers }, otherStage!)).status()).toBe(404);
  expect((await pageA.goto(`/learn/unit/${otherStage}`))!.status()).toBe(404);
  expect(await db.unitAttempt.count({ where: { childId: aG2 } })).toBe(2);
  // Child mode cannot open the parent units area, the review queue or the dashboard.
  for (const p of ['/units', `/units/${unitId}`, '/review', `/dashboard/${aG2}`]) {
    await pageA.goto(p);
    await expect(pageA).toHaveURL(/\/learn$/);
  }

  // Another family: its child cannot replay this child's attempt; its parent cannot read this child's evidence.
  const ctxB = await browser.newContext({ baseURL });
  const pageB = await ctxB.newPage();
  const b = await createFamily(pageB.request, baseURL!, 'uc-b');
  await addG2(pageB.request, baseURL!);
  void b; // signed in by sign-up (pageB shares the cookie jar)
  expect((await pageB.goto(`/dashboard/${aG2}`))!.status()).toBe(404);
  const exp = await (await pageB.request.get('/api/parent/export')).json();
  expect(JSON.stringify(exp)).not.toContain(attemptId);
  await enterChildMode(pageB, 'Bima');
  expect((await post({ attemptId, answers }, unitId, pageB)).status()).toBe(409);
  expect(await db.unitAttempt.count({ where: { childId: aG2 } })).toBe(2);
  // Signed-out: 401. Parent (not in child mode): 403.
  const anon = await browser.newContext();
  expect((await anon.request.post(`${baseURL}/api/units/${unitId}/check`, { headers: h, data: { attemptId: randomUUID(), answers } })).status()).toBe(401);
  await anon.close();
  await exitChildMode(pageA);
  expect((await post({ attemptId: randomUUID(), answers })).status()).toBe(403);
  // Family export includes unit attempts.
  const expA = await (await pageA.request.get('/api/parent/export')).json();
  expect(expA.children.find((c: { id: string }) => c.id === aG2).unitAttempts).toHaveLength(2);
  await ctxA.close();
  await ctxB.close();
});
