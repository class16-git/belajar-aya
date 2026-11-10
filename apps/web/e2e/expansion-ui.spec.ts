import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { createFamily, db, enterChildMode, signIn } from './helpers';

/** Expansion units and readings: parent browse, guides, review queue, export and apply-reviews CLI. Synthetic data only. */
const OUT = join(process.cwd(), '../../artifacts/screenshots');
mkdirSync(OUT, { recursive: true });
const CONTENT = join(process.cwd(), '../../content');
const CLI = join(process.cwd(), 'scripts/apply-reviews.mjs');

async function axe(page: Page, name: string) {
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), `${name} axe`).toEqual([]);
}
async function noOverflow(page: Page, name: string) {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(o, `${name} horizontal overflow`).toBeLessThanOrEqual(1);
}
const origin = (baseURL: string) => ({ Origin: baseURL });

function walk(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (n.endsWith('.json')) out.push(p);
  }
  return out;
}
const contentFile = (id: string) => walk(join(CONTENT, 'units')).concat(walk(join(CONTENT, 'readings'))).find((f) => JSON.parse(readFileSync(f, 'utf8')).id === id)!;

/** First item of each kind waiting for review (ids discovered from the page, so new content does not break this). */
async function queueItems(page: Page) {
  await page.goto('/review');
  const unit = await page.locator('[data-review-item][data-kind="unit"]').first().getAttribute('data-review-item');
  const reading = await page.locator('[data-review-item][data-kind="reading"]').first().getAttribute('data-review-item');
  expect(unit && reading, 'needs one unit and one reading awaiting review').toBeTruthy();
  return { unit: unit!, reading: reading! };
}

async function decide(page: Page, itemId: string, decision: 'Approve' | 'Reject', note = '') {
  const item = page.locator(`[data-review-item="${itemId}"]`);
  await item.getByLabel('Your initials').fill('AB');
  if (note) await item.getByLabel('Note').fill(note);
  await item.getByRole('button', { name: decision }).click();
  await expect(item.getByRole('status')).toContainText('Decision saved.');
  await expect(item.getByTestId('latest-decision')).toHaveAttribute('data-decision', decision === 'Approve' ? 'approve' : 'reject');
}

for (const vp of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 820, height: 1180 }] as const) {
  test(`parent browses units and readings, opens a unit guide and a reading, sees the review queue @${vp.name}`, async ({ page, request, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const fam = await createFamily(request, baseURL!, `xp-${vp.name}`);
    await signIn(page, fam.email);
    await page.getByRole('navigation', { name: 'Menu' }).getByRole('link', { name: 'Units' }).click();
    await page.waitForURL('**/units');
    const units = page.getByTestId('unit-list').locator('[data-unit]');
    const readings = page.getByTestId('reading-list').locator('[data-reading]');
    expect(await units.count()).toBeGreaterThan(0);
    expect(await readings.count()).toBeGreaterThan(0);
    await expect(page.getByTestId('state-badge').first()).toBeVisible();
    await noOverflow(page, 'units');
    await page.screenshot({ path: join(OUT, `${vp.name}-120-units.png`), fullPage: true });
    await axe(page, `units@${vp.name}`);

    // Filters are server-side GET params.
    const level = (await units.first().getAttribute('data-level'))!;
    await page.getByLabel('Level').selectOption(level);
    await page.getByLabel('Show').selectOption('units');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForURL(/kind=units/);
    expect(new Set(await page.locator('[data-unit]').evaluateAll((els) => els.map((e) => e.getAttribute('data-level'))))).toEqual(new Set([level]));
    await expect(page.getByTestId('reading-list')).toHaveCount(0);
    await page.goto('/units?status=published&kind=bogus&level=nope');
    await expect(page.getByLabel('Status')).toHaveValue('published');
    await expect(page.getByLabel('Show')).toHaveValue('all'); // unknown values fall back safely

    // Unit guide: every section, the answer key, hazard chips, provenance.
    await page.goto('/units');
    const unitId = (await units.first().getAttribute('data-unit'))!;
    await units.first().getByRole('link', { name: /^Open guide/ }).click();
    await page.waitForURL(`**/units/${unitId}`);
    const guide = page.getByTestId('unit-guide');
    for (const s of ['objective', 'rationale', 'outcomes', 'success', 'parent', 'child', 'materials', 'preparation', 'safety', 'guided', 'practice', 'assessment', 'misconceptions', 'extension', 'accessibility', 'mastery', 'sources', 'provenance']) {
      await expect(guide.locator(`[data-section="${s}"]`), s).toBeVisible();
    }
    const items = guide.getByTestId('answer-key').locator('[data-item]');
    expect(await items.count()).toBeGreaterThanOrEqual(3);
    await expect(items.first().locator('[data-correct]')).toHaveCount(1);
    await expect(items.first()).toContainText('Why:');
    await noOverflow(page, 'unit guide');
    await page.screenshot({ path: join(OUT, `${vp.name}-120-unit-guide.png`), fullPage: true });
    await axe(page, `unit-guide@${vp.name}`);
    // Print styles hide navigation and controls.
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('navigation', { name: 'Menu' })).toBeHidden();
    await expect(page.getByRole('button', { name: /Print/ })).toBeHidden();
    await page.emulateMedia({ media: 'screen' });

    // Reading: numbered paragraphs, read-aloud notes for parent-read texts, answers, fact checks.
    await page.goto('/units?kind=readings');
    const readingId = (await page.locator('[data-reading]').first().getAttribute('data-reading'))!;
    await page.goto(`/readings/${readingId}`);
    const r = page.getByTestId('reading');
    const paras = r.locator('[data-paragraph]');
    expect(await paras.count()).toBeGreaterThanOrEqual(2);
    await expect(paras.first()).toContainText('1');
    const parentRead = JSON.parse(readFileSync(contentFile(readingId), 'utf8')).mode === 'parent_read';
    if (parentRead) expect(await r.getByTestId('read-aloud-note').count()).toBeGreaterThan(0);
    await expect(r.getByTestId('answer-key').locator('[data-question]').first().locator('[data-correct]')).toHaveCount(1);
    for (const s of ['vocabulary', 'questions', 'discussion', 'offline', 'facts', 'provenance']) await expect(r.locator(`[data-section="${s}"]`), s).toBeVisible();
    await noOverflow(page, 'reading');
    await page.screenshot({ path: join(OUT, `${vp.name}-120-reading.png`), fullPage: true });
    await axe(page, `reading@${vp.name}`);

    // Review queue with validator evidence.
    await page.getByRole('navigation', { name: 'Menu' }).getByRole('link', { name: 'Review' }).click();
    await page.waitForURL('**/review');
    const first = page.getByTestId('review-queue').locator('[data-review-item]').first();
    await expect(first.getByTestId('zero-errors')).toHaveText('✓ 0 validation errors');
    await expect(first.getByTestId('review-form')).toBeVisible();
    await noOverflow(page, 'review');
    await page.screenshot({ path: join(OUT, `${vp.name}-120-review.png`), fullPage: true });
    await axe(page, `review@${vp.name}`);

    // Bahasa Indonesia follows the parent's UI language.
    expect((await page.request.post('/api/locale', { headers: origin(baseURL!), data: { locale: 'id' } })).ok()).toBe(true);
    await page.goto(`/units/${unitId}`);
    await expect(page.getByTestId('unit-guide').locator('[data-section="assessment"] h2')).toHaveText('Penilaian dengan kunci jawaban');
    const idTitle = JSON.parse(readFileSync(contentFile(unitId), 'utf8')).title.id as string;
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(idTitle);
    await noOverflow(page, 'unit guide (id)');
    await axe(page, `unit-guide-id@${vp.name}`);
    if (vp.name === 'tablet') await page.screenshot({ path: join(OUT, 'tablet-120-unit-guide-id.png'), fullPage: true });
  });
}

test('answer keys never reach child routes; child mode and signed-out users cannot use units, readings or review', async ({ page, request, baseURL, browser }) => {
  const fam = await createFamily(request, baseURL!, 'xp-child');
  await signIn(page, fam.email);
  const { unit, reading } = await queueItems(page);
  const unitJson = JSON.parse(readFileSync(contentFile(unit), 'utf8'));
  const explanation = unitJson.assessment[0].explanation.en as string;
  await page.goto(`/units/${unit}`);
  await expect(page.getByTestId('unit-guide')).toContainText(explanation); // the parent sees it
  await enterChildMode(page);
  for (const path of ['/units', `/units/${unit}`, `/readings/${reading}`, '/review']) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/learn$/);
  }
  for (const path of ['/learn', '/learn/library']) {
    await page.goto(path);
    const html = await page.content();
    expect(html, path).not.toContain(explanation);
    expect(html, path).not.toMatch(/"answer"|distractorMisconceptions|evidenceParagraph/);
  }
  const h = origin(baseURL!);
  expect((await page.request.post('/api/review/decisions', { headers: h, data: { itemId: unit, itemVersion: unitJson.version, decision: 'approve', reviewerName: 'AB', reviewerRole: 'parent', note: '' } })).status()).toBe(403);
  expect((await page.request.get('/api/review/export')).status()).toBe(403);
  expect(await db.contentReviewDecision.count()).toBe(0);
  const anon = await browser.newContext();
  const ap = await anon.newPage();
  await ap.goto(`${baseURL}/units/${unit}`);
  await expect(ap).toHaveURL(/\/signin$/);
  expect((await anon.request.get(`${baseURL}/api/review/export`)).status()).toBe(401);
  await anon.close();
});

test('approve and reject persist, export, and apply to a temp copy of the content with apply-reviews', async ({ page, request, baseURL }) => {
  const fam = await createFamily(request, baseURL!, 'xp-decide');
  await signIn(page, fam.email);
  const { unit, reading } = await queueItems(page);
  const unitFile = contentFile(unit);
  const readingFile = contentFile(reading);
  const before = { unit: readFileSync(unitFile, 'utf8'), reading: readFileSync(readingFile, 'utf8') };

  await decide(page, unit, 'Approve');
  // Reject needs a reason (client check, then the server).
  const ri = page.locator(`[data-review-item="${reading}"]`);
  await ri.getByLabel('Your initials').fill('AB');
  await ri.getByRole('button', { name: 'Reject' }).click();
  await expect(ri.getByRole('alert')).toContainText('Write a reason before rejecting.');
  const h = origin(baseURL!);
  const version = JSON.parse(before.reading).version as string;
  expect((await page.request.post('/api/review/decisions', { headers: h, data: { itemId: reading, itemVersion: version, decision: 'reject', reviewerName: 'AB', reviewerRole: 'parent', note: '' } })).status()).toBe(400);
  expect((await page.request.post('/api/review/decisions', { headers: h, data: { itemId: reading, itemVersion: '0.0.1', decision: 'approve', reviewerName: 'AB', reviewerRole: 'parent', note: '' } })).status()).toBe(409);
  expect((await page.request.post('/api/review/decisions', { data: { itemId: reading, itemVersion: version, decision: 'approve', reviewerName: 'AB', reviewerRole: 'parent', note: '' } })).status()).toBe(403); // no Origin
  await decide(page, reading, 'Reject', 'Paragraph 2 needs a simpler word.');

  // Persisted (reload) and listed in the history table.
  await page.reload();
  await expect(page.locator(`[data-review-item="${unit}"]`).getByTestId('latest-decision')).toContainText('Approved by AB (parent)');
  await expect(page.getByTestId('decision-history').locator('tr[data-decision]')).toHaveCount(2);
  const rows = await db.contentReviewDecision.findMany({ orderBy: { createdAt: 'asc' } });
  expect(rows.map((r) => [r.itemId, r.decision, r.reviewerName, r.reviewerRole])).toEqual([[unit, 'approve', 'AB', 'parent'], [reading, 'reject', 'AB', 'parent']]);
  expect(rows.every((r) => r.itemVersion.match(/^\d+\.\d+\.\d+$/))).toBe(true);

  const exp = await (await page.request.get('/api/review/export')).json();
  expect(exp.format).toBe('atlas-review-decisions');
  expect(exp.decisions.map((d: { itemId: string; decision: string; itemKind: string }) => [d.itemId, d.decision, d.itemKind])).toEqual([[unit, 'approve', 'unit'], [reading, 'reject', 'reading']]);
  const priv = await (await page.request.get('/api/parent/export')).json();
  expect(priv.contentReviewDecisions).toHaveLength(2);

  // apply-reviews CLI on a temp copy of the content files (the real content is never touched).
  const tmp = mkdtempSync(join(tmpdir(), 'atlas-apply-'));
  try {
    for (const f of [unitFile, readingFile]) {
      const dest = join(tmp, relative(CONTENT, f));
      mkdirSync(join(dest, '..'), { recursive: true });
      cpSync(f, dest);
    }
    const exportFile = join(tmp, 'decisions.json');
    writeFileSync(exportFile, JSON.stringify(exp));
    const run = (file: string) => spawnSync(process.execPath, [CLI, file, '--content-dir', tmp], { encoding: 'utf8' });
    const ok = run(exportFile);
    expect(ok.status, ok.stderr).toBe(0);
    expect(ok.stdout).toContain('2 applied, 0 refused');
    const u = JSON.parse(readFileSync(join(tmp, relative(CONTENT, unitFile)), 'utf8'));
    const r = JSON.parse(readFileSync(join(tmp, relative(CONTENT, readingFile)), 'utf8'));
    const ou = JSON.parse(before.unit);
    const or = JSON.parse(before.reading);
    expect(u.reviewStatus).toBe('reviewed');
    expect(u.review).toMatchObject({ reviewedBy: 'AB', reviewerRole: 'parent', reviewedAt: rows[0]!.createdAt.toISOString().slice(0, 10), agentChecks: ou.review.agentChecks });
    expect(u.review.rejectedReason).toBeUndefined();
    expect(r.review.rejectedReason).toBe('Paragraph 2 needs a simpler word.');
    expect(r.reviewStatus).toBe(or.reviewStatus);
    expect(u.religiousReview).toEqual(ou.religiousReview); // never touched
    expect(r.religiousReview).toEqual(or.religiousReview);
    // Everything except review fields is unchanged.
    const strip = (x: Record<string, unknown>) => { const { review: _r, reviewStatus: _s, ...rest } = x; return rest; };
    expect(strip(u)).toEqual(strip(ou));
    expect(strip(r)).toEqual(strip(or));

    // Version mismatch: refused, file untouched, non-zero exit.
    const snapshot = readFileSync(join(tmp, relative(CONTENT, unitFile)), 'utf8');
    const stale = { ...exp, decisions: [{ ...exp.decisions[0], itemVersion: '9.9.9', decision: 'reject', note: 'stale review' }] };
    writeFileSync(exportFile, JSON.stringify(stale));
    const bad = run(exportFile);
    expect(bad.status).toBe(1);
    expect(bad.stderr).toContain('REFUSED');
    expect(readFileSync(join(tmp, relative(CONTENT, unitFile)), 'utf8')).toBe(snapshot);
    // Malformed exports are rejected before anything is written.
    writeFileSync(exportFile, JSON.stringify({ ...exp, decisions: [{ ...exp.decisions[0], reviewerRole: 'scholar' }] }));
    expect(run(exportFile).status).toBe(2);
    expect(readFileSync(join(tmp, relative(CONTENT, unitFile)), 'utf8')).toBe(snapshot);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  expect(readFileSync(unitFile, 'utf8')).toBe(before.unit);
  expect(readFileSync(readingFile, 'utf8')).toBe(before.reading);
});

test('cross-family isolation: another family can neither read nor change decisions', async ({ browser, request, baseURL }) => {
  const a = await createFamily(request, baseURL!, 'xp-a');
  const b = await createFamily(request, baseURL!, 'xp-b');
  const ca = await browser.newContext();
  const pa = await ca.newPage();
  await signIn(pa, a.email);
  const { unit } = await queueItems(pa);
  await decide(pa, unit, 'Approve');
  const famA = await db.family.findFirstOrThrow({ where: { owner: { email: a.email } } });
  const famB = await db.family.findFirstOrThrow({ where: { owner: { email: b.email } } });

  const cb = await browser.newContext();
  const pb = await cb.newPage();
  await signIn(pb, b.email);
  expect((await (await pb.request.get('/api/review/export')).json()).decisions).toEqual([]);
  await pb.goto('/review');
  await expect(pb.getByTestId('decision-history').locator('tr[data-decision]')).toHaveCount(0);
  await expect(pb.locator(`[data-review-item="${unit}"]`).getByTestId('latest-decision')).toHaveCount(0);
  // A forged familyId is rejected; B's own decisions are always stored under B.
  const version = JSON.parse(readFileSync(contentFile(unit), 'utf8')).version as string;
  const body = { itemId: unit, itemVersion: version, decision: 'reject', reviewerName: 'CD', reviewerRole: 'educator', note: 'Not for us.' };
  expect((await pb.request.post('/api/review/decisions', { headers: origin(baseURL!), data: { ...body, familyId: famA.id } })).status()).toBe(400);
  expect((await pb.request.post('/api/review/decisions', { headers: origin(baseURL!), data: body })).status()).toBe(201);
  expect(await db.contentReviewDecision.count({ where: { familyId: famA.id } })).toBe(1);
  expect(await db.contentReviewDecision.count({ where: { familyId: famB.id } })).toBe(1);
  const expA = await (await pa.request.get('/api/review/export')).json();
  expect(expA.decisions.map((d: { decision: string; reviewerName: string }) => [d.decision, d.reviewerName])).toEqual([['approve', 'AB']]);
  await pa.goto('/review');
  await expect(pa.getByTestId('decision-history').locator('tr[data-decision]')).toHaveCount(1);
  await ca.close();
  await cb.close();
});
