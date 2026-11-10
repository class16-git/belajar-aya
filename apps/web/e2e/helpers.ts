import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const TEST_DB = process.env.E2E_DATABASE_URL ?? 'postgresql://postgres@localhost:5432/atlas_test';
export const db = new PrismaClient({ datasources: { db: { url: TEST_DB } } });

export const PASSWORD = 'synthetic-password-123';
export const PIN = '2468';
export const CONSENT_VERSION = '2026-11-v1';

let n = 0;
/** Unique synthetic email per test family. Never real data. */
export const testEmail = (tag: string) => `e2e.${tag}.${Date.now()}.${n++}@example.test`;

export async function resetDb() {
  await db.$executeRawUnsafe(
    'TRUNCATE "ParentUser","Family","Session","ChildProfile","LearningSession","ActivityInstance","Attempt","MasteryState","ParentObservation","RecommendationLog","ConsentRecord","AuditEvent","RateLimit" CASCADE',
  );
}

const origin = (baseURL: string) => ({ Origin: baseURL });

/** Create a consented family with a PIN and two synthetic learners through the public API. */
export async function createFamily(request: APIRequestContext, baseURL: string, tag = 'fam') {
  await clearRateLimits();
  const email = testEmail(tag);
  const h = { headers: origin(baseURL) };
  expect((await request.post('/api/auth/signup', { ...h, data: { email, password: PASSWORD, locale: 'en' } })).status()).toBe(201);
  expect((await request.post('/api/parent/consent', { ...h, data: { agree: true, version: CONSENT_VERSION } })).ok()).toBe(true);
  expect((await request.post('/api/parent/pin', { ...h, data: { pin: PIN, password: PASSWORD } })).ok()).toBe(true);
  const base = { timezone: 'Asia/Jakarta', locale: 'en', itemsPerSession: 5, targetMinutes: 15, audioEnabled: false, reducedMotion: false, focusSkillId: null };
  const g1 = await request.post('/api/parent/children', { ...h, data: { ...base, nickname: 'Kakak', dateOfBirth: '2019-08-15', schoolGrade: 'Grade 1', mode: 'ELEMENTARY_GUIDED' } });
  const tod = await request.post('/api/parent/children', { ...h, data: { ...base, nickname: 'Adek', dateOfBirth: '2024-05-20', schoolGrade: null, mode: 'TODDLER_OFFLINE' } });
  return { email, g1Id: (await g1.json()).id as string, toddlerId: (await tod.json()).id as string };
}

/** Tests create many families from one IP; reset the limiter in the TEST database only. */
export async function clearRateLimits() {
  await db.rateLimit.deleteMany({});
}

export async function signIn(page: Page, email: string) {
  await clearRateLimits();
  await page.goto('/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/family');
}

/** Server-side answer key, read straight from the test database (never exposed to the browser). */
export async function answerFor(activityId: string): Promise<number> {
  const a = await db.activityInstance.findUniqueOrThrow({ where: { id: activityId } });
  return (a.itemJson as { answer: number }).answer;
}

export async function currentActivityId(page: Page): Promise<string> {
  const el = page.locator('[data-activity-id]');
  await expect(el).toBeVisible();
  return (await el.getAttribute('data-activity-id'))!;
}

/** Answer the visible item with a value (choice button or keypad). */
export async function answer(page: Page, value: number) {
  const radio = page.getByRole('radio', { name: String(value), exact: true });
  if (await radio.count()) {
    await radio.click();
  } else {
    for (const d of String(value)) await page.getByRole('button', { name: d, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Check' }).click();
}

export async function enterChildMode(page: Page, childName = 'Kakak') {
  await page.goto('/family');
  await page.getByTestId(`child-${childName}`).getByRole('button', { name: 'Start learning' }).click();
  await page.waitForURL('**/learn');
}

export async function startFirstChoice(page: Page) {
  await page.getByRole('button', { name: 'Start' }).first().click();
  await page.waitForURL('**/learn/session/**');
  const intro = page.getByRole('button', { name: 'Start' });
  await intro.click();
}

export async function exitChildMode(page: Page) {
  await page.getByRole('button', { name: /Grown-ups/ }).click();
  await page.getByLabel('PIN').fill(PIN);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await page.waitForURL('**/family');
}
