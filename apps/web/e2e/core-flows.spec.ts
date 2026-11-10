import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import {
  answer,
  answerFor,
  createFamily,
  currentActivityId,
  db,
  enterChildMode,
  exitChildMode,
  PASSWORD,
  PIN,
  signIn,
  startFirstChoice,
  testEmail,
  clearRateLimits,
} from './helpers';

const rlKey = (k: string) => createHash('sha256').update(k).digest('hex');

test.describe('Phase 0 gate: onboarding, two profiles, parent gate', () => {
  test('parent signs up, consents, sets a PIN and creates both learner profiles', async ({ page }) => {
    const email = testEmail('onboard');
    await page.goto('/');
    await page.getByRole('link', { name: 'Create a parent account' }).click();
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL('**/consent');
    // Consent gate: cannot proceed without checking the box.
    await expect(page.getByRole('button', { name: 'I agree' })).toBeDisabled();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'I agree' }).click();
    await page.waitForURL('**/family');
    await expect(page.getByText('No learners yet')).toBeVisible();

    await page.getByLabel('PIN', { exact: true }).fill(PIN);
    await page.getByLabel('Confirm PIN').fill(PIN);
    await page.getByLabel('Your account password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Set your parent PIN')).toBeHidden();

    // Grade 1 learner
    await page.getByRole('link', { name: /Add a child/ }).click();
    await page.getByLabel('Nickname').fill('Kakak');
    await page.getByLabel('Date of birth (optional)').fill('2019-08-15');
    await page.getByLabel(/School grade/).selectOption('Grade 1');
    await page.getByRole('radio', { name: /Guided practice/ }).check();
    await page.getByRole('button', { name: 'Add learner' }).click();
    await page.waitForURL('**/family');

    // Toddler learner, caregiver-led
    await page.getByRole('link', { name: /Add a child/ }).click();
    await page.getByLabel('Nickname').fill('Adek');
    await page.getByLabel('Date of birth (optional)').fill('2024-05-20');
    await page.getByRole('radio', { name: /Caregiver-led/ }).check();
    await page.getByRole('button', { name: 'Add learner' }).click();
    await page.waitForURL('**/family');

    const g1 = page.getByTestId('child-Kakak');
    const tod = page.getByTestId('child-Adek');
    await expect(g1).toContainText('7 years 2 months');
    await expect(g1).toContainText('Grade 1');
    await expect(g1.getByRole('button', { name: 'Start learning' })).toBeEnabled();
    await expect(tod).toContainText('2 years 5 months');
    await expect(tod.getByRole('link', { name: 'Open activity cards' })).toBeVisible();
    await expect(tod.getByRole('button', { name: 'Start learning' })).toHaveCount(0);

    const consent = await db.consentRecord.findMany({ where: { family: { owner: { email } } } });
    expect(consent).toHaveLength(1);
    expect(consent[0]!.version).toBe('2026-11-v1');
  });

  test('scenario 6: child mode cannot open parent areas or other records; PIN required to leave', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'gate');
    await signIn(page, fam.email);
    await enterChildMode(page);
    for (const path of ['/family', '/dashboard', `/dashboard/${fam.g1Id}`, `/dashboard/${fam.toddlerId}`, '/privacy', '/settings', '/cards']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/learn$/);
    }
    const headers = { Origin: baseURL! };
    expect((await page.request.get(`/api/parent/progress?childId=${fam.toddlerId}`)).status()).toBe(403);
    expect((await page.request.get('/api/parent/export')).status()).toBe(403);
    expect((await page.request.post('/api/auth/signout', { headers })).status()).toBe(403);
    expect((await page.request.post('/api/locale', { headers, data: { locale: 'id' } })).status()).toBe(403);
    // Wrong PIN keeps the child inside.
    await page.goto('/learn');
    await page.getByRole('button', { name: /Grown-ups/ }).click();
    await page.getByLabel('PIN').fill('0000');
    await page.getByRole('button', { name: 'Unlock' }).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('not correct');
    await page.getByLabel('PIN').fill(PIN);
    await page.getByRole('button', { name: 'Unlock' }).click();
    await page.waitForURL('**/family');
    const audit = await db.auditEvent.findMany({ where: { action: { in: ['child_mode.pin_failed', 'child_mode.exited'] } } });
    expect(audit.map((a) => a.action)).toEqual(expect.arrayContaining(['child_mode.pin_failed', 'child_mode.exited']));
  });
});

test.describe('Phase 1: Grade 1 learning loop', () => {
  test('scenarios 1 & 3: independent success raises the score; hint-supported success is not independent', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'learn');
    await signIn(page, fam.email);
    await enterChildMode(page);
    await expect(page.getByRole('heading', { name: 'Hello, Kakak!' })).toBeVisible();
    await startFirstChoice(page);

    // Item 1 — concrete counting with the ten-frame: tap counters, then answer independently.
    let id = await currentActivityId(page);
    let value = await answerFor(id);
    const counters = page.getByRole('button', { name: /^Counter \d+$/ });
    const n = await counters.count();
    for (let i = 0; i < n; i++) await counters.first().click(); // a counted counter is relabelled "Counter n, counted"
    await expect(page.getByRole('button', { name: /^Counter \d+, counted$/ })).toHaveCount(n);
    await expect(page.getByText(`Counted: ${n}`)).toBeVisible();
    await answer(page, value);
    await expect(page.getByText('Yes! That’s it.')).toBeVisible();
    let state = await db.masteryState.findUniqueOrThrow({ where: { childId_skillId: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20' } } });
    expect(state.score).toBeCloseTo(0.47, 5);
    expect(state.independentCorrect).toBe(1);
    // No auto-advance: the child chooses to continue.
    await page.waitForTimeout(500);
    expect(await currentActivityId(page)).toBe(id);
    await page.getByRole('button', { name: 'Next' }).click();

    // Item 2 — ask for help first, then answer correctly: supported, not independent.
    id = await currentActivityId(page);
    expect(id).not.toBe((await db.activityInstance.findFirstOrThrow({ where: { childId: fam.g1Id }, orderBy: { createdAt: 'asc' } })).id);
    value = await answerFor(id);
    await page.getByRole('button', { name: 'I need help' }).click();
    await expect(page.getByRole('note')).toBeVisible();
    await answer(page, value);
    await expect(page.getByText('You got it, with a little help.')).toBeVisible();
    state = await db.masteryState.findUniqueOrThrow({ where: { childId_skillId: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20' } } });
    expect(state.independentCorrect).toBe(1);
    expect(state.score).toBeCloseTo(0.52, 5);
    const attempt = await db.attempt.findFirstOrThrow({ where: { activityId: id } });
    expect(attempt.independent).toBe(false);
    expect(attempt.hintCount).toBe(1);

    // Finish the short set; the session ends with a clear summary.
    for (let i = 3; i <= 5; i++) {
      await page.getByRole('button', { name: 'Next' }).click();
      const aid = await currentActivityId(page);
      await answer(page, await answerFor(aid));
      await expect(page.getByText('Yes! That’s it.')).toBeVisible();
    }
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.getByTestId('summary')).toContainText('You worked on 5 questions.');
    await expect(page.getByTestId('summary')).toContainText('On your own: 4');
    await expect(page.getByTestId('summary')).toContainText('With help: 1');
  });

  test('scenario 2: the same error twice routes to concrete practice, not harder work; wrong answers allow another try', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'misc');
    // Make counting secure so the bonds skill is unlocked (prerequisite).
    await db.masteryState.create({
      data: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20', score: 0.83, phase: 'secure', attempts: 4, independentCorrect: 4, consecutiveIndependentCorrect: 4, formats: ['count-ten-frame', 'count-scattered'], lastEvidenceAt: new Date(), nextReviewAt: new Date(Date.now() + 20 * 3600_000), reviewStep: 0, modelVersion: 'mastery-rules-2026.11.1' },
    });
    await db.childProfile.update({ where: { id: fam.g1Id }, data: { focusSkillId: 'MATH-G1-BONDS-10' } });
    await signIn(page, fam.email);
    await enterChildMode(page);
    await expect(page.locator('[data-lesson]').first()).toHaveAttribute('data-lesson', /bonds-10/);
    await startFirstChoice(page);
    const id = await currentActivityId(page);
    const item = (await db.activityInstance.findUniqueOrThrow({ where: { id } })).itemJson as { answer: number; params: { part: number } };
    // Off by one, twice → COUNTING_ERROR twice.
    const wrong = item.answer + 1 <= 10 && item.answer + 1 !== item.params.part ? item.answer + 1 : item.answer - 1;
    await answer(page, wrong);
    await expect(page.getByText('Not yet. Let’s look again.')).toBeVisible();
    await expect(page.getByText('Close! Count again, one at a time.')).toBeVisible();
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('radio', { name: String(wrong), exact: true })).toBeDisabled();
    const wrong2 = wrong === item.answer + 1 ? item.answer - 1 : item.answer + 1;
    if (wrong2 >= 0 && wrong2 !== item.params.part && (await page.getByRole('radio', { name: String(wrong2), exact: true }).count())) {
      await answer(page, wrong2);
    } else {
      // Fall back: answer via API with an off-by-one value outside the choices.
      await page.request.post('/api/attempts', { headers: { Origin: page.url().split('/learn')[0]! }, data: { activityId: id, response: { value: wrong2 < 0 ? item.answer + 2 : wrong2 } } });
    }
    await expect.poll(async () => db.attempt.count({ where: { activityId: id, correct: false } })).toBeGreaterThanOrEqual(2);
    const attempts = await db.attempt.findMany({ where: { activityId: id }, orderBy: { createdAt: 'asc' } });
    expect(attempts.some((a) => a.misconceptionCodes.includes('COUNTING_ERROR'))).toBe(true);

    await exitChildMode(page);
    await page.goto(`/dashboard/${fam.g1Id}`);
    const rec = page.getByTestId('recommendation');
    await expect(rec).toContainText('R2_MISCONCEPTION_REMEDIATE');
    await expect(rec).toContainText('Hands-on');
    await expect(page.locator('[data-misconception]').first()).toBeVisible();
  });

  test('scenario 10: delayed review tests retention; a lapse is not mastery', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'review');
    const past = new Date(Date.now() - 2 * 86_400_000);
    await db.masteryState.create({
      data: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20', score: 0.83, phase: 'secure', attempts: 4, independentCorrect: 4, consecutiveIndependentCorrect: 4, formats: ['count-ten-frame', 'count-scattered'], lastEvidenceAt: past, nextReviewAt: new Date(Date.now() - 3600_000), reviewStep: 0, modelVersion: 'mastery-rules-2026.11.1' },
    });
    await signIn(page, fam.email);
    await page.goto(`/dashboard/${fam.g1Id}`);
    await expect(page.locator('[data-skill="MATH-G1-COUNT-20"]')).toContainText('Review due');
    await expect(page.getByTestId('recommendation')).toContainText('R4_DUE_REVIEW');
    await enterChildMode(page);
    await startFirstChoice(page);
    const id = await currentActivityId(page);
    const value = await answerFor(id);
    await answer(page, value === 0 ? 1 : value - 1);
    await expect(page.getByText('Not yet. Let’s look again.')).toBeVisible();
    const lapsed = await db.masteryState.findUniqueOrThrow({ where: { childId_skillId: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20' } } });
    expect(lapsed.phase).toBe('learning');
    const attempt = await db.attempt.findFirstOrThrow({ where: { activityId: id } });
    expect(attempt.rulesApplied).toContain('M7_DELAYED_CHECK_LAPSED');
  });

  test('server grading ignores client claims and never sends the answer key', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'grading');
    await signIn(page, fam.email);
    await enterChildMode(page);
    const headers = { Origin: baseURL! };
    const s = await (await page.request.post('/api/learn/session', { headers, data: {} })).json();
    const next = await page.request.post('/api/activities/next', { headers, data: { sessionId: s.sessionId } });
    const body = await next.text();
    expect(body).not.toContain('"answer"');
    expect(body).not.toContain('"missing"');
    const { activity } = JSON.parse(body);
    const forged = await page.request.post('/api/attempts', { headers, data: { activityId: activity.activityId, response: { value: 0 }, correct: true } });
    expect(forged.status()).toBe(400);
    expect(await db.attempt.count({ where: { childId: fam.g1Id } })).toBe(0);
    // Locked lesson cannot be forced.
    const locked = await page.request.post('/api/learn/session', { headers, data: { lessonId: 'lesson-g1-bonds-10-003' } });
    expect(locked.status()).toBe(403);
    // Draft lesson cannot be started.
    const draft = await page.request.post('/api/learn/session', { headers, data: { lessonId: 'lesson-g1-draft-example' } });
    expect(draft.status()).toBe(403);
  });
});

test.describe('Phase 1: toddler offline cards, observations, language, privacy', () => {
  test('scenario 4: parent prints a matching card and logs an observation — no child screen use', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'toddler');
    await signIn(page, fam.email);
    expect((await page.request.post('/api/parent/child-mode', { headers: { Origin: baseURL! }, data: { childId: fam.toddlerId } })).status()).toBe(403);
    await page.getByTestId('child-Adek').getByRole('link', { name: 'Open activity cards' }).click();
    await page.waitForURL('**/cards?child=*');
    await expect(page.locator('[data-card]').first()).toBeVisible();
    expect(await page.locator('[data-card]').count()).toBeGreaterThanOrEqual(10);
    await page.getByRole('link', { name: /Open card: Match familiar objects/ }).click();
    const card = page.getByTestId('card');
    for (const section of ['Safety', 'You will need', 'Steps', 'Words you can use', 'What to notice', 'Clean up together']) {
      await expect(card.getByRole('heading', { name: section })).toBeVisible();
    }
    await expect(card).toContainText('Adult supervision required');
    await expect(card).toContainText('toilet-paper tube');
    await expect(card).toContainText('Repeat another day');

    await page.getByRole('radio', { name: 'Letter' }).check();
    await expect(page.getByRole('button', { name: /Print/ })).toHaveAttribute('data-paper', 'letter');
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('button', { name: /Print/ })).toBeHidden();
    await expect(page.getByRole('navigation')).toBeHidden();
    await expect(card).toBeVisible();
    await page.emulateMedia({ media: 'screen' });

    await page.getByRole('radio', { name: 'Exploring with help' }).check();
    await page.getByLabel('Note (optional)').fill('Matched cups after watching once. <b>not html</b>');
    await page.getByRole('button', { name: 'Save observation' }).click();
    await expect(page.getByText('Observation saved.')).toBeVisible();
    const obs = await db.parentObservation.findFirstOrThrow({ where: { childId: fam.toddlerId } });
    expect(obs.lessonId).toBe('lesson-tod-match-001');
    expect(obs.skillId).toBe('TOD-MATCH-OBJECT');
    await page.goto(`/dashboard/${fam.toddlerId}`);
    await expect(page.getByTestId('observation').first()).toContainText('Exploring with help');
    // Notes render as text, never HTML.
    await expect(page.getByTestId('observation').first()).toContainText('<b>not html</b>');
    await expect(page.getByText('There are no scores for toddlers')).toBeVisible();
  });

  test('scenario 5: switching EN↔ID keeps attempt history', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'locale');
    await signIn(page, fam.email);
    await enterChildMode(page);
    await startFirstChoice(page);
    await answer(page, await answerFor(await currentActivityId(page)));
    await expect(page.getByText('Yes! That’s it.')).toBeVisible();
    await exitChildMode(page);
    const before = await db.attempt.count({ where: { childId: fam.g1Id } });
    expect(before).toBe(1);
    await page.goto(`/dashboard/${fam.g1Id}`);
    await page.getByRole('button', { name: /^ID/ }).click();
    await expect(page.getByRole('heading', { name: 'Kemajuan Kakak' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    await expect(page.getByText('Kelas 1', { exact: true })).toBeVisible(); // grade label is localised too
    await page.locator('[data-skill="MATH-G1-COUNT-20"] summary').click();
    await expect(page.locator('[data-skill="MATH-G1-COUNT-20"] tbody tr')).toHaveCount(1);
    await page.getByRole('button', { name: /^EN/ }).click();
    await expect(page.getByRole('heading', { name: 'Progress for Kakak' })).toBeVisible();
    expect(await db.attempt.count({ where: { childId: fam.g1Id } })).toBe(before);
  });

  test('scenario 7: parent exports then deletes data; records are gone', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'privacy');
    await signIn(page, fam.email);
    await page.request.post('/api/parent/observations', { headers: { Origin: baseURL! }, data: { childId: fam.toddlerId, lessonId: 'lesson-tod-sort-001', level: 'INTRODUCED', note: 'synthetic', observedOn: '2026-11-10' } });
    await page.goto('/privacy');
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download export' }).click();
    const file = await (await download).path();
    const data = JSON.parse(readFileSync(file, 'utf8'));
    expect(data.format).toBe('atlas-family-export');
    expect(data.children).toHaveLength(2);
    expect(JSON.stringify(data)).not.toContain('scrypt$');
    expect(data.children.find((c: { nickname: string }) => c.nickname === 'Adek').observations).toHaveLength(1);

    await page.getByLabel('Type DELETE to confirm').fill('delete');
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Delete everything' }).click();
    await expect(page.locator('main [role="alert"]').last()).toContainText('Type DELETE');
    await page.getByLabel('Type DELETE to confirm').fill('DELETE');
    await page.getByRole('button', { name: 'Delete everything' }).click();
    await page.waitForURL((u) => u.pathname === '/');
    expect(await db.parentUser.count({ where: { email: fam.email } })).toBe(0);
    expect(await db.childProfile.count({ where: { id: { in: [fam.g1Id, fam.toddlerId] } } })).toBe(0);
    expect(await db.parentObservation.count({ where: { childId: fam.toddlerId } })).toBe(0);
    expect(await db.auditEvent.count({ where: { targetId: { in: [fam.g1Id, fam.toddlerId] } } })).toBe(0);
    expect((await page.request.get(`/api/parent/progress?childId=${fam.g1Id}`)).status()).toBe(401);
    await page.goto(`/dashboard/${fam.g1Id}`);
    await expect(page).toHaveURL(/\/signin$/);
  });

  test('withdrawing consent pauses learning until consent is given again', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'consent');
    await signIn(page, fam.email);
    page.once('dialog', (d) => d.accept());
    await page.goto('/privacy');
    await page.getByRole('button', { name: 'Withdraw consent' }).click();
    await page.waitForURL('**/consent');
    await page.goto('/family');
    await expect(page).toHaveURL(/\/consent$/);
    expect((await page.request.post('/api/parent/child-mode', { headers: { Origin: baseURL! }, data: { childId: fam.g1Id } })).status()).toBe(403);
    expect((await page.request.get('/api/parent/export')).status()).toBe(200);
  });
});

test.describe('concurrency (review findings F1, F3, F4)', () => {
  async function childModeApi(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext, baseURL: string, tag: string) {
    const fam = await createFamily(request, baseURL, tag);
    await signIn(page, fam.email);
    await enterChildMode(page);
    return { fam, headers: { Origin: baseURL } };
  }

  test('concurrent session starts and item requests create exactly one open session and one active item', async ({ page, request, baseURL }) => {
    const { fam, headers } = await childModeApi(page, request, baseURL!, 'race-start');
    const starts = await Promise.all([1, 2, 3].map(() => page.request.post('/api/learn/session', { headers, data: {} })));
    expect(starts.every((r) => r.status() === 201)).toBe(true);
    expect(await db.learningSession.count({ where: { childId: fam.g1Id, endedAt: null } })).toBe(1);
    const open = await db.learningSession.findFirstOrThrow({ where: { childId: fam.g1Id, endedAt: null } });
    const nexts = await Promise.all([1, 2, 3, 4].map(() => page.request.post('/api/activities/next', { headers, data: { sessionId: open.id } })));
    const ids = new Set(await Promise.all(nexts.map(async (r) => (await r.json()).activity?.activityId)));
    expect(ids.size).toBe(1);
    expect(await db.activityInstance.count({ where: { sessionId: open.id, status: 'ACTIVE' } })).toBe(1);
  });

  test('a double-submitted answer is recorded once; a hint racing an answer never yields "independent" evidence', async ({ page, request, baseURL }) => {
    const { fam, headers } = await childModeApi(page, request, baseURL!, 'race-attempt');
    const s = await (await page.request.post('/api/learn/session', { headers, data: {} })).json();
    for (let round = 0; round < 3; round++) {
      const { activity } = await (await page.request.post('/api/activities/next', { headers, data: { sessionId: s.sessionId } })).json();
      const value = await answerFor(activity.activityId);
      const res = await Promise.all([
        page.request.post('/api/attempts', { headers, data: { activityId: activity.activityId, response: { value } } }),
        page.request.post('/api/attempts', { headers, data: { activityId: activity.activityId, response: { value } } }),
        page.request.post(`/api/activities/${activity.activityId}/hint`, { headers }),
      ]);
      expect(res.filter((r) => r.status() === 200).length).toBeGreaterThanOrEqual(1);
      expect(res.every((r) => r.status() === 200 || r.status() === 409)).toBe(true);
      const attempts = await db.attempt.findMany({ where: { activityId: activity.activityId } });
      const act = await db.activityInstance.findUniqueOrThrow({ where: { id: activity.activityId } });
      expect(attempts.filter((a) => a.tryNumber === 1)).toHaveLength(attempts.length > 0 ? 1 : 0);
      if (attempts.some((a) => a.independent)) expect(act.hintsUsed).toBe(0);
    }
    // Every recorded attempt contributed exactly once to mastery.
    const state = await db.masteryState.findUnique({ where: { childId_skillId: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20' } } });
    expect(state?.attempts ?? 0).toBe(await db.attempt.count({ where: { childId: fam.g1Id, skillId: 'MATH-G1-COUNT-20' } }));
  });

  test('starting a new session (e.g. another tab) abandons the old open item so it cannot be answered', async ({ page, request, baseURL }) => {
    const { headers } = await childModeApi(page, request, baseURL!, 'race-tabs');
    const s1 = await (await page.request.post('/api/learn/session', { headers, data: {} })).json();
    const { activity } = await (await page.request.post('/api/activities/next', { headers, data: { sessionId: s1.sessionId } })).json();
    await page.request.post('/api/learn/session', { headers, data: {} });
    const late = await page.request.post('/api/attempts', { headers, data: { activityId: activity.activityId, response: { value: await answerFor(activity.activityId) } } });
    expect(late.status()).toBe(409);
  });
});

test.describe('final review regressions (N3, N4, N7)', () => {
  test('N3: a child in child mode cannot replace the session via sign-up or sign-in', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'n3');
    await signIn(page, fam.email);
    await enterChildMode(page);
    const headers = { Origin: baseURL! };
    const up = await page.request.post('/api/auth/signup', { headers, data: { email: testEmail('n3-escape'), password: 'synthetic-password-123', locale: 'en' } });
    expect(up.status()).toBe(403);
    const inn = await page.request.post('/api/auth/signin', { headers, data: { email: fam.email, password: PASSWORD } });
    expect(inn.status()).toBe(403);
    await page.goto('/family');
    await expect(page).toHaveURL(/\/learn$/);
  });

  test('N4: an item left ACTIVE in an ended session cannot be answered or hinted', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'n4');
    await signIn(page, fam.email);
    await enterChildMode(page);
    const headers = { Origin: baseURL! };
    const s = await (await page.request.post('/api/learn/session', { headers, data: {} })).json();
    const { activity } = await (await page.request.post('/api/activities/next', { headers, data: { sessionId: s.sessionId } })).json();
    // Simulate the race outcome: the session was ended while this item was being created.
    await db.learningSession.update({ where: { id: s.sessionId }, data: { endedAt: new Date() } });
    const value = await answerFor(activity.activityId);
    expect((await page.request.post('/api/attempts', { headers, data: { activityId: activity.activityId, response: { value } } })).status()).toBe(409);
    expect((await page.request.post(`/api/activities/${activity.activityId}/hint`, { headers })).status()).toBe(409);
    expect(await db.attempt.count({ where: { childId: fam.g1Id } })).toBe(0);
  });

  test('N7: PIN guesses are also limited per parent account, across sessions', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'n7');
    await signIn(page, fam.email);
    await enterChildMode(page);
    const user = await db.parentUser.findUniqueOrThrow({ where: { email: fam.email } });
    // Simulate 20 earlier wrong guesses from other sessions today.
    await db.rateLimit.create({ data: { key: rlKey(`pin-user:${user.id}`), windowStart: new Date(), count: 20 } });
    const r = await page.request.post('/api/child-mode/exit', { headers: { Origin: baseURL! }, data: { pin: '0000' } });
    expect(r.status()).toBe(429);
  });
});

test.describe('final review regressions (R-F6, R-F7)', () => {
  test('R-F7: failed sign-ins from one IP do not lock the parent out from another IP', async ({ request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'rf7');
    await clearRateLimits();
    const attacker = { Origin: baseURL!, 'x-forwarded-for': '203.0.113.66' };
    for (let i = 0; i < 12; i++) await request.post('/api/auth/signin', { headers: attacker, data: { email: fam.email, password: 'wrong-password-xx' } });
    expect((await request.post('/api/auth/signin', { headers: attacker, data: { email: fam.email, password: 'wrong-password-xx' } })).status()).toBe(429);
    const parent = await request.post('/api/auth/signin', { headers: { Origin: baseURL!, 'x-forwarded-for': '198.51.100.20' }, data: { email: fam.email, password: PASSWORD } });
    expect(parent.status()).toBe(200);
  });

  test('R-F6: rate-limit rows never store plain emails and are removed when the family is deleted', async ({ page, request, baseURL }) => {
    const fam = await createFamily(request, baseURL!, 'rf6');
    await signIn(page, fam.email);
    const user = await db.parentUser.findUniqueOrThrow({ where: { email: fam.email } });
    await page.request.post('/api/parent/pin', { headers: { Origin: baseURL! }, data: { pin: '2468', password: PASSWORD } });
    const keys = (await db.rateLimit.findMany()).map((r) => r.key);
    expect(keys.some((k) => k.includes('@'))).toBe(false);
    expect(keys).toContain(rlKey(`pin-set:${user.id}`));
    expect((await page.request.delete('/api/parent/family', { headers: { Origin: baseURL! }, data: { confirm: 'DELETE', password: PASSWORD } })).ok()).toBe(true);
    const after = (await db.rateLimit.findMany()).map((r) => r.key);
    for (const k of [`pin-set:${user.id}`, `delete:${user.id}`, `signin-email:${fam.email}`]) expect(after).not.toContain(rlKey(k));
  });
});

test.describe('security', () => {
  test('IDOR: a parent cannot read or change another family’s child', async ({ browser, baseURL }) => {
    const a = await browser.newContext({ baseURL });
    const b = await browser.newContext({ baseURL });
    const famA = await createFamily(a.request, baseURL!, 'idorA');
    await createFamily(b.request, baseURL!, 'idorB');
    const headers = { Origin: baseURL! };
    expect((await b.request.get(`/api/parent/progress?childId=${famA.g1Id}`)).status()).toBe(404);
    expect((await b.request.get(`/api/skills?childId=${famA.g1Id}`)).status()).toBe(404);
    expect((await b.request.patch(`/api/parent/children/${famA.g1Id}`, { headers, data: { nickname: 'x', timezone: 'UTC', schoolGrade: null, mode: 'ELEMENTARY_GUIDED', locale: 'en' } })).status()).toBe(404);
    expect((await b.request.post('/api/parent/observations', { headers, data: { childId: famA.toddlerId, level: 'INTRODUCED', observedOn: '2026-11-10' } })).status()).toBe(404);
    expect((await b.request.post('/api/parent/child-mode', { headers, data: { childId: famA.g1Id } })).status()).toBe(404);
    const page = await b.newPage();
    await page.goto(`/dashboard/${famA.g1Id}`);
    await expect(page.getByText('We could not find that page.')).toBeVisible();
    await a.close();
    await b.close();
  });

  test('unauthenticated API calls are rejected; DOB changes need confirmation and are audited', async ({ request, baseURL }) => {
    const anon = await request.get('/api/parent/children');
    expect(anon.status()).toBe(401);
    const fam = await createFamily(request, baseURL!, 'dob');
    const headers = { Origin: baseURL! };
    const body = { nickname: 'Kakak', dateOfBirth: '2019-08-16', timezone: 'Asia/Jakarta', schoolGrade: 'Grade 1', mode: 'ELEMENTARY_GUIDED', locale: 'en' };
    const noConfirm = await request.patch(`/api/parent/children/${fam.g1Id}`, { headers, data: body });
    expect(noConfirm.status()).toBe(400);
    expect((await noConfirm.json()).error).toBe('CONFIRM_SENSITIVE');
    expect((await request.patch(`/api/parent/children/${fam.g1Id}`, { headers, data: { ...body, confirmSensitive: true } })).ok()).toBe(true);
    const ev = await db.auditEvent.findFirstOrThrow({ where: { targetId: fam.g1Id, action: 'child.sensitive_updated' } });
    expect(JSON.stringify(ev.metadata)).not.toContain('2019');
    const future = await request.patch(`/api/parent/children/${fam.g1Id}`, { headers, data: { ...body, dateOfBirth: '2030-01-01', confirmSensitive: true } });
    expect(future.status()).toBe(400);
    // Grade is unchanged by DOB edits.
    expect((await db.childProfile.findUniqueOrThrow({ where: { id: fam.g1Id } })).schoolGrade).toBe('Grade 1');
  });

  test('sign-in is rate limited', async ({ request, baseURL }) => {
    const email = testEmail('rl');
    let last = 0;
    for (let i = 0; i < 10; i++) {
      last = (await request.post('/api/auth/signin', { headers: { Origin: baseURL! }, data: { email, password: 'wrong-password-xx' } })).status();
    }
    expect(last).toBe(429);
  });

  test('oversized request bodies are rejected', async ({ request, baseURL }) => {
    const r = await request.post('/api/auth/signin', { headers: { Origin: baseURL! }, data: { email: 'x'.repeat(40_000), password: 'y' } });
    expect(r.status()).toBe(413);
  });

  test('security headers are present', async ({ request }) => {
    const r = await request.get('/');
    expect(r.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(r.headers()['x-content-type-options']).toBe('nosniff');
    expect(r.headers()['x-powered-by']).toBeUndefined();
  });
});
