import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFamily, db, enterChildMode, PIN, signIn } from './helpers';

/** Reading Garden (Product Bible v3). Synthetic families only; preview build (agent-checked books visible). */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });
const EGG = 'book-bookdash-egg';
const CIRCLES = 'book-bookdash-circles';
const TREE = 'book-bookdash-a-very-important-tree';

async function axe(page: Page, name: string) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}
async function noOverflow(page: Page, name: string) {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(o, `${name} horizontal overflow`).toBeLessThanOrEqual(1);
}
const origin = (baseURL: string) => ({ Origin: baseURL });

for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 820, height: 1180 }] as const) {
  test(`parent journey: library, journey, book detail with rights, shelf, record, history @${vp.name}`, async ({ page, request, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const fam = await createFamily(request, baseURL!, `rg-${vp.name}`);
    await signIn(page, fam.email);
    await page.getByRole('link', { name: 'Reading Garden' }).first().click();
    await page.waitForURL('**/library');
    await expect(page.getByTestId('journey-card')).toHaveAttribute('data-stage', 'g1');
    await expect(page.getByTestId('all-books').locator('[data-book]')).toHaveCount(12);
    await expect(page.getByTestId('preview-badge').first()).toBeVisible();
    await noOverflow(page, 'library');
    await page.screenshot({ path: join(OUT, `${vp.name}-90-reading-garden.png`), fullPage: true });
    await axe(page, `library@${vp.name}`);

    // Filters are server-side GET forms.
    await page.getByLabel('Topic').selectOption('food');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByTestId('all-books').locator('[data-book]')).toHaveCount(1);

    // Journey for Grade 1: five strands, separate listening and decoding rubric, original passage.
    await page.goto(`/library/journey/g1?child=${fam.g1Id}`);
    await expect(page.locator('[data-strand]')).toHaveCount(5);
    await expect(page.getByTestId('rubric')).toContainText('Reading the words (decoding)');
    await noOverflow(page, 'journey');
    await page.screenshot({ path: join(OUT, `${vp.name}-91-reading-journey-g1.png`), fullPage: true });
    await axe(page, `journey@${vp.name}`);

    // Book detail: rights panel with evidence, link-only, sensitive theme notice.
    await page.goto(`/library/${CIRCLES}?child=${fam.g1Id}`);
    await expect(page.getByTestId('sensitive')).toContainText('death and life cycles');
    const rights = page.getByTestId('rights-panel');
    await expect(rights).toContainText('Link only');
    await expect(rights).toContainText('CC-BY-4.0');
    await expect(rights).toContainText('bookdash.org/who-we-are/open-content-partners');
    await expect(rights).toContainText('Not yet reviewed by a person.');
    await noOverflow(page, 'book');
    await page.screenshot({ path: join(OUT, `${vp.name}-92-book-detail.png`), fullPage: true });
    await axe(page, `book@${vp.name}`);

    // Put on Kakak's shelf, record a reading with separate listening/decoding.
    await page.goto(`/library/${EGG}?child=${fam.g1Id}`);
    await page.getByRole('button', { name: 'Put on Kakak’s shelf' }).click();
    await expect(page.getByTestId('shelf-controls')).toHaveAttribute('data-state', 'ON_SHELF');
    const form = page.getByTestId('record-reading');
    await form.getByRole('radio', { name: /^2 — Retells beginning/ }).check();
    await form.getByRole('radio', { name: /^1 — Sounds out short words/ }).check();
    await form.getByRole('button', { name: 'Save' }).click();
    await expect(form.getByRole('status')).toContainText('Saved');
    const ev = await db.readingEvent.findFirstOrThrow({ where: { childId: fam.g1Id, bookId: EGG } });
    expect([ev.kind, ev.listening, ev.decoding]).toEqual(['SHARED_READ', 2, 1]);

    await page.goto(`/library/history?child=${fam.g1Id}`);
    await expect(page.getByTestId('reading-history').locator('tr[data-kind="SHARED_READ"]')).toHaveCount(1);
    page.once('dialog', (d) => void d.accept());
    await page.getByRole('button', { name: 'Delete Kakak’s reading history' }).click();
    await expect(page.getByText('No reading recorded yet.')).toBeVisible();
    expect(await db.readingEvent.count({ where: { childId: fam.g1Id } })).toBe(0);
  });
}

test('leaving Atlas: catalog URL only, no referrer/opener, no child data; switch turns links off everywhere', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'rg-leave');
  await signIn(page, fam.email);
  await page.goto(`/library/go/${EGG}?child=${fam.g1Id}`);
  const a = page.getByTestId('external-link');
  await expect(a).toHaveAttribute('href', 'https://bookdash.org/books/egg/');
  await expect(a).toHaveAttribute('rel', /noopener/);
  await expect(a).toHaveAttribute('rel', /noreferrer/);
  await expect(a).toHaveAttribute('target', '_blank');
  expect(await a.getAttribute('href')).not.toContain(fam.g1Id);
  await axe(page, 'leaving');
  // There is no URL parameter to redirect elsewhere: unknown ids 404.
  expect((await page.request.get('/library/go/book-not-real')).status()).toBe(404);
  expect((await page.request.get('/library/go/https%3A%2F%2Fevil.example.com')).status()).toBe(404);

  const off = await page.request.post('/api/parent/library/settings', { headers: origin(baseURL!), data: { externalLinks: false } });
  expect(off.ok()).toBe(true);
  await page.reload();
  await expect(page.getByTestId('external-link')).toHaveCount(0);
});

test('child mode: only shelf books, PIN gate for external links, finished event, server-graded comprehension', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'rg-child');
  await db.shelfEntry.create({ data: { childId: fam.g1Id, bookId: EGG, state: 'ON_SHELF' } });
  await db.shelfEntry.create({ data: { childId: fam.g1Id, bookId: TREE, state: 'HIDDEN' } });
  await signIn(page, fam.email);
  await enterChildMode(page);
  await page.getByTestId('reading-garden-entry').click();
  await page.waitForURL('**/learn/library');
  await expect(page.getByTestId('child-shelf').locator('[data-book]')).toHaveCount(1);
  await expect(page.getByTestId('child-practice').locator('[data-passage="passage-g1-rain-garden"]')).toBeVisible();
  await page.screenshot({ path: join(OUT, 'tablet-93-child-reading-garden.png'), fullPage: true });
  await axe(page, 'child-library');

  // Not on the shelf (hidden or never added) → indistinguishable 404.
  expect((await page.request.get(`/learn/library/${TREE}`)).status()).toBe(404);
  expect((await page.request.get(`/learn/library/${CIRCLES}`)).status()).toBe(404);

  await page.goto(`/learn/library/${EGG}`);
  const headers = origin(baseURL!);
  const wrong = await page.request.post('/api/library/open', { headers, data: { bookId: EGG, pin: '0000' } });
  expect(wrong.status()).toBe(401);
  const right = await page.request.post('/api/library/open', { headers, data: { bookId: EGG, pin: PIN } });
  expect(await right.json()).toEqual({ url: 'https://bookdash.org/books/egg/' });
  const notShelf = await page.request.post('/api/library/open', { headers, data: { bookId: TREE, pin: PIN } });
  expect(notShelf.status()).toBe(404);
  // UI: the PIN dialog opens the catalog URL in a new tab (popup), and the child session stays in child mode.
  await page.getByRole('button', { name: /Open with a grown-up/ }).click();
  await page.getByLabel('Parent PIN').fill(PIN);
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Open', exact: true }).click()]);
  expect(popup.url()).toContain('bookdash.org/books/egg');
  await popup.close();
  await page.getByRole('button', { name: 'I finished it!' }).click();
  await expect(page.getByText('Well done!')).toBeVisible();
  expect(await db.readingEvent.count({ where: { childId: fam.g1Id, kind: 'CHILD_FINISHED' } })).toBe(1);
  expect((await page.request.get('/library')).url()).toMatch(/\/learn$/); // parent area stays locked

  // Comprehension: the page carries no answer key; the server grades; client claims are rejected.
  await page.goto('/learn/library/read/passage-g1-rain-garden');
  const html = await page.content();
  expect(html).not.toMatch(/"answer"|evidenceParagraph/);
  const forged = await page.request.post('/api/library/comprehension', { headers, data: { passageId: 'passage-g1-rain-garden', answers: { q1: 0, q2: 0, q3: 0 }, correct: 3 } });
  expect(forged.status()).toBe(400);
  const otherStage = await page.request.post('/api/library/comprehension', { headers, data: { passageId: 'passage-g6-advert-report', answers: { q1: 0, q2: 0, q3: 0, q4: 0 } } });
  expect(otherStage.status()).toBe(404);
  const comp = page.getByTestId('comprehension');
  await comp.getByRole('button', { name: 'Check my answers' }).click();
  await expect(comp.getByRole('alert')).toContainText('Answer every question first.');
  for (const q of ['q1', 'q2', 'q3']) await comp.locator(`[data-question="${q}"] input[type=radio]`).first().check();
  await expect(comp.getByRole('alert')).toHaveCount(0); // the reminder clears once answers change
  await page.screenshot({ path: join(OUT, 'desktop-94-child-reading-practice.png'), fullPage: true });
  await axe(page, 'passage');
  await comp.getByRole('button', { name: 'Check my answers' }).click();
  await expect(page.getByTestId('comprehension-result')).toContainText(/You got \d of 3\./);
  const check = await db.readingEvent.findFirstOrThrow({ where: { childId: fam.g1Id, kind: 'COMPREHENSION_CHECK' } });
  expect(check.total).toBe(3);
});

test('family isolation and child-mode restrictions on every reading route', async ({ browser, request, baseURL }) => {
  const a = await createFamily(request, baseURL!, 'rg-a');
  const b = await createFamily(request, baseURL!, 'rg-b');
  await db.readingEvent.create({ data: { childId: b.g1Id, bookId: EGG, kind: 'SHARED_READ', observedAt: new Date(), listening: 2 } });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await signIn(page, a.email);
  const h = origin(baseURL!);
  expect((await page.request.post('/api/parent/library/shelf', { headers: h, data: { childId: b.g1Id, bookId: EGG, state: 'ON_SHELF' } })).status()).toBe(404);
  expect((await page.request.post('/api/parent/library/events', { headers: h, data: { childId: b.g1Id, bookId: EGG, kind: 'SHARED_READ', observedOn: '2026-11-10' } })).status()).toBe(404);
  expect((await page.request.delete('/api/parent/library/events', { headers: h, data: { childId: b.g1Id, eventId: null } })).status()).toBe(404);
  expect(await db.readingEvent.count({ where: { childId: b.g1Id } })).toBe(1);
  expect((await page.request.get(`/library/history?child=${b.g1Id}`)).status()).toBe(404);
  // Unknown/unpublished books cannot be shelved; free-text and out-of-range ratings are rejected.
  expect((await page.request.post('/api/parent/library/shelf', { headers: h, data: { childId: a.g1Id, bookId: 'book-not-real', state: 'ON_SHELF' } })).status()).toBe(404);
  expect((await page.request.post('/api/parent/library/events', { headers: h, data: { childId: a.g1Id, bookId: EGG, kind: 'SHARED_READ', observedOn: '2026-11-10', listening: 9 } })).status()).toBe(400);
  expect((await page.request.post('/api/parent/library/events', { headers: h, data: { childId: a.g1Id, bookId: EGG, kind: 'SHARED_READ', observedOn: '2026-11-10', note: 'free text' } })).status()).toBe(400);
  // Child mode cannot use parent library APIs or pages.
  await enterChildMode(page);
  expect((await page.request.post('/api/parent/library/shelf', { headers: h, data: { childId: a.g1Id, bookId: EGG, state: 'ON_SHELF' } })).status()).toBe(403);
  expect((await page.request.post('/api/parent/library/settings', { headers: h, data: { externalLinks: true } })).status()).toBe(403);
  await page.goto(`/library/${EGG}`);
  await expect(page).toHaveURL(/\/learn$/);
  await ctx.close();
  // Unauthenticated (fresh context, no cookies)
  const anon = await browser.newContext();
  expect((await anon.request.post(`${baseURL}/api/library/open`, { headers: h, data: { bookId: EGG, pin: '1234' } })).status()).toBe(401);
  await anon.close();
});

test('toddler journey is grown-up-led with no screen practice; export includes reading data', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'rg-tod');
  await signIn(page, fam.email);
  await page.goto(`/library?child=${fam.toddlerId}`);
  await expect(page.getByTestId('journey-card')).toHaveAttribute('data-stage', 'age2_3');
  await expect(page.getByTestId('journey-card')).toContainText('No screen time');
  await page.goto(`/library/journey/age2_3?child=${fam.toddlerId}`);
  await expect(page.getByTestId('rubric')).toContainText('Decoding is not assessed at this age.');
  await db.readingEvent.create({ data: { childId: fam.toddlerId, bookId: EGG, kind: 'SHARED_READ', observedAt: new Date(), listening: 1 } });
  const exp = await (await page.request.get('/api/parent/export')).json();
  const tod = exp.children.find((c: { id: string }) => c.id === fam.toddlerId);
  expect(tod.readingEvents).toHaveLength(1);
  expect(exp.family.libraryExternalLinks).toBe(true);
  await page.goto(`/dashboard/${fam.toddlerId}`);
  await expect(page.getByTestId('reading-summary')).toContainText('Readings recorded: 1');
});
