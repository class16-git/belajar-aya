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

test('ATL-05: comprehension checks are idempotent per attempt, first try vs review is recorded, assistance unknown', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'atl05');
  await signIn(page, fam.email);
  await enterChildMode(page);
  const headers = { Origin: baseURL! };
  const attemptId = crypto.randomUUID();
  const body = { passageId: 'passage-g1-rain-garden', attemptId, answers: { q1: 0, q2: 1, q3: 2 } };
  // Concurrent duplicate submissions + a later retry of the same attempt → exactly one event, same result.
  const [a, b] = await Promise.all([page.request.post('/api/library/comprehension', { headers, data: body }), page.request.post('/api/library/comprehension', { headers, data: body })]);
  const retry = await page.request.post('/api/library/comprehension', { headers, data: body });
  const [ra, rb, rr] = [await a.json(), await b.json(), await retry.json()];
  expect([a.status(), b.status(), retry.status()]).toEqual([200, 200, 200]);
  expect(rb.correct).toBe(ra.correct);
  expect(rr.replayed).toBe(true);
  expect(rr.correct).toBe(ra.correct);
  let events = await db.readingEvent.findMany({ where: { childId: fam.g1Id, kind: 'COMPREHENSION_CHECK' } });
  expect(events).toHaveLength(1);
  expect(events[0]!.firstAttempt).toBe(true);
  expect(events[0]!.parentAssisted).toBeNull(); // never recorded as "unassisted" from child mode
  // Reusing the attempt id with different answers cannot rewrite the first-try score.
  const tamper = await page.request.post('/api/library/comprehension', { headers, data: { ...body, answers: { q1: 1, q2: 1, q3: 1 } } });
  expect((await tamper.json()).correct).toBe(ra.correct);
  // A new attempt on the same passage is a review, not a first try.
  await page.request.post('/api/library/comprehension', { headers, data: { ...body, attemptId: crypto.randomUUID() } });
  events = await db.readingEvent.findMany({ where: { childId: fam.g1Id, kind: 'COMPREHENSION_CHECK' }, orderBy: { createdAt: 'asc' } });
  expect(events.map((e) => e.firstAttempt)).toEqual([true, false]);
  // Missing attempt id is rejected.
  expect((await page.request.post('/api/library/comprehension', { headers, data: { passageId: body.passageId, answers: body.answers } })).status()).toBe(400);
});

test('ATL-06: the skills API follows canonical grade/age eligibility for every grade', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'atl06');
  await signIn(page, fam.email);
  const get = async (id: string) => (await page.request.get(`/api/skills?childId=${id}`)).json();
  const cases: [string | null, (r: { supported: boolean; bands: string[]; skills: { band: string }[] }) => void][] = [
    ['Grade 1', (r) => { expect(r.bands).toEqual(['g1']); expect(r.skills.every((s) => s.band === 'g1')).toBe(true); }],
    [null, (r) => expect(r.bands).toEqual(['g1'])],
    ['Kindergarten', (r) => { expect(r.bands).toEqual(['kindergarten', 'g1']); expect(r.skills.some((s) => s.band === 'kindergarten')).toBe(true); }],
  ];
  for (const g of ['Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']) cases.push([g, (r) => { expect(r.supported).toBe(false); expect(r.skills).toEqual([]); }]);
  for (const [grade, check] of cases) {
    await db.childProfile.update({ where: { id: fam.g1Id }, data: { schoolGrade: grade } });
    check(await get(fam.g1Id));
  }
  const tod = await get(fam.toddlerId);
  expect(tod.mode).toBe('offline');
  expect(tod.bands).toEqual(['toddler']);
  // An older child kept in toddler mode by the parent stays on offline bands.
  await db.childProfile.update({ where: { id: fam.g1Id }, data: { mode: 'TODDLER_OFFLINE' } });
  expect((await get(fam.g1Id)).mode).toBe('offline');
});

test('ATL-15: a failed finish is not shown as finished; "Try again" re-sends it and finishing is idempotent', async ({ page, request, baseURL }) => {
  const fam = await g1WithCountingSecure(request, baseURL!, 'atl15');
  await signIn(page, fam.email);
  await enterChildMode(page);
  await db.learningSession.updateMany({ where: { childId: fam.g1Id, endedAt: null }, data: { endedAt: new Date() } });
  const s = await db.learningSession.create({ data: { childId: fam.g1Id, targetItems: 1, localDate: new Date().toISOString().slice(0, 10), skillId: 'MATH-G1-BONDS-10', lessonId: 'lesson-g1-bonds-10-002' } });
  await page.goto(`/learn/session/${s.id}`);
  await page.getByRole('button', { name: 'Start' }).click();
  await answer(page, await answerFor(await currentActivityId(page)));
  let calls = 0;
  await page.route(`**/api/learn/session/${s.id}/finish`, (route) => { calls++; return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' }); });
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.locator('div.card[role="alert"]')).toContainText('Something went wrong');
  await expect(page.getByTestId('summary')).toHaveCount(0);
  expect(calls).toBe(1);
  // Network abort is also an error, not a completion.
  await page.unroute(`**/api/learn/session/${s.id}/finish`);
  await page.route(`**/api/learn/session/${s.id}/finish`, (route) => route.abort());
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('div.card[role="alert"]')).toBeVisible();
  await expect(page.getByTestId('summary')).toHaveCount(0);
  await page.unroute(`**/api/learn/session/${s.id}/finish`);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByTestId('summary')).toContainText('You finished!');
  await expect(page.getByTestId('summary')).toContainText('1');
  const ended = (await db.learningSession.findUniqueOrThrow({ where: { id: s.id } })).endedAt;
  expect(ended).not.toBeNull();
  const again = await page.request.post(`/api/learn/session/${s.id}/finish`, { headers: { Origin: baseURL! } });
  expect(again.status()).toBe(200);
  expect((await db.learningSession.findUniqueOrThrow({ where: { id: s.id } })).endedAt).toEqual(ended);
});

test('ATL-13: answer choices follow the radio-group keyboard pattern (one tab stop, arrows, Home/End, skip eliminated)', async ({ page, request, baseURL }) => {
  const fam = await g1WithCountingSecure(request, baseURL!, 'atl13');
  await signIn(page, fam.email);
  await enterChildMode(page);
  await db.learningSession.updateMany({ where: { childId: fam.g1Id, endedAt: null }, data: { endedAt: new Date() } });
  const s = await db.learningSession.create({ data: { childId: fam.g1Id, targetItems: 3, localDate: new Date().toISOString().slice(0, 10), skillId: 'MATH-G1-BONDS-10', lessonId: 'lesson-g1-bonds-10-002' } });
  await page.goto(`/learn/session/${s.id}`);
  await page.getByRole('button', { name: 'Start' }).click();
  const radios = page.getByRole('radiogroup').getByRole('radio');
  const n = await radios.count();
  expect(n).toBeGreaterThan(2);
  const focusedIndex = () => page.evaluate(() => [...document.querySelectorAll('[role="radiogroup"] [role="radio"]')].indexOf(document.activeElement as Element));
  const checkedIndex = () => page.evaluate(() => [...document.querySelectorAll('[role="radiogroup"] [role="radio"]')].findIndex((e) => e.getAttribute('aria-checked') === 'true'));
  // Exactly one tab stop in the group.
  expect(await page.locator('[role="radiogroup"] [role="radio"][tabindex="0"]').count()).toBe(1);
  // Tab into the group lands on the first option without checking it.
  for (let i = 0; i < 40 && (await focusedIndex()) < 0; i++) await page.keyboard.press('Tab');
  expect(await focusedIndex()).toBe(0);
  expect(await checkedIndex()).toBe(-1);
  await page.keyboard.press('ArrowRight');
  expect([await focusedIndex(), await checkedIndex()]).toEqual([1, 1]);
  await page.keyboard.press('ArrowDown');
  expect([await focusedIndex(), await checkedIndex()]).toEqual([2, 2]);
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowLeft');
  expect([await focusedIndex(), await checkedIndex()]).toEqual([0, 0]);
  await page.keyboard.press('ArrowLeft'); // wraps
  expect([await focusedIndex(), await checkedIndex()]).toEqual([n - 1, n - 1]);
  await page.keyboard.press('Home');
  expect(await checkedIndex()).toBe(0);
  await page.keyboard.press('End');
  expect(await checkedIndex()).toBe(n - 1);
  // The tab stop follows the checked option, and Tab leaves the group in one press.
  expect(await page.locator('[role="radiogroup"] [role="radio"][tabindex="0"]').getAttribute('aria-checked')).toBe('true');
  await page.keyboard.press('Tab');
  expect(await focusedIndex()).toBe(-1);
  // Answer wrongly with the keyboard; eliminated (disabled) options are never reached by arrows.
  const right = await answerFor(await currentActivityId(page));
  const values = await radios.allTextContents();
  const wrongIdx = values.findIndex((v) => Number(v) !== right);
  await radios.nth(wrongIdx).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByText('Not yet. Let’s look again.')).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  const disabled = await page.evaluate(() => [...document.querySelectorAll('[role="radiogroup"] [role="radio"]')].map((e) => (e as HTMLButtonElement).disabled));
  expect(disabled.filter(Boolean)).toHaveLength(1);
  {
    const start = disabled.indexOf(false);
    await radios.nth(start).focus();
    for (let k = 0; k < n * 2; k++) {
      await page.keyboard.press('ArrowRight');
      expect(disabled[await focusedIndex()]).toBe(false);
    }
  }
});

test('ATL-14: pages hydrate under the report-only nonce CSP with zero violations; an injected inline script is reported', async ({ page, request, baseURL }) => {
  const violations: string[] = [];
  page.on('console', (m) => { if (/Content Security Policy/i.test(m.text())) violations.push(`${page.url()}: ${m.text()}`); });
  const first = await page.goto('/signin');
  const csp = first!.headers()['content-security-policy-report-only']!;
  expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
  expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  const nonce = /'nonce-([^']+)'/.exec(csp)![1]!;
  // Next.js put the nonce on its own scripts; every script element carries it.
  const scripts = await page.evaluate(() => [...document.querySelectorAll('script')].map((s) => s.nonce));
  expect(scripts.length).toBeGreaterThan(0);
  expect(new Set(scripts)).toEqual(new Set([nonce]));
  // A new nonce on every request.
  expect((await page.request.get('/signin')).headers()['content-security-policy-report-only']).not.toBe(csp);

  const fam = await g1WithCountingSecure(request, baseURL!, 'atl14');
  await signIn(page, fam.email);
  for (const path of ['/family', '/library', '/settings']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }
  await enterChildMode(page);
  await page.goto('/learn');
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: /./ }).first().waitFor();
  expect(violations).toEqual([]);

  // Interactivity proves hydration worked under the policy.
  await page.goto('/learn/library');
  await page.waitForLoadState('networkidle');
  expect(violations).toEqual([]);

  // Simulated HTML-injection bug: an inline <script> without the nonce in server HTML is reported
  // (report-only: not yet blocked), while the page's own nonced scripts are not.
  await page.route('**/privacy', async (route) => {
    const res = await route.fetch();
    const html = (await res.text()).replace('</body>', '<script>window.__injected = 1</script></body>');
    await route.fulfill({ response: res, body: html });
  });
  await page.goto('/privacy');
  await expect.poll(() => violations.filter((v) => /inline script violates/i.test(v)).length).toBe(1);
  const rep = await page.request.post('/api/csp-report', { headers: { 'Content-Type': 'application/csp-report' }, data: { 'csp-report': { 'document-uri': `${baseURL}/privacy?x=1`, 'effective-directive': 'script-src-elem', 'blocked-uri': 'inline' } } });
  expect(rep.status()).toBe(204);
});
