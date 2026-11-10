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
