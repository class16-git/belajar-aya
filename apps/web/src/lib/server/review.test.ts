import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_VERSION } from '@atlas/shared';

// Route-level tests run without a database or cookies: session, limiter, audit and prisma are stubbed.
const getAuth = vi.fn();
const create = vi.fn();
const rateLimit = vi.fn();
vi.mock('./session', () => ({ getAuth: () => getAuth() }));
vi.mock('./rate-limit', () => ({ rateLimit: (...a: unknown[]) => rateLimit(...a) }));
vi.mock('./audit', () => ({ audit: vi.fn() }));
vi.mock('@atlas/database', () => ({ prisma: { contentReviewDecision: { create: (a: unknown) => create(a) } } }));

const { decisionSchema, assertDecisionAllowed, exportDecisions } = await import('./review');
const { expansionView } = await import('./expansion');
const { POST } = await import('@/app/api/review/decisions/route');

const VIEW = await expansionView(); // content chunks load asynchronously, so resolve once at module level
const reviewable = () => {
  const e = [...VIEW.units, ...VIEW.readings].find((x) => x.state === 'subject_validated' && x.errors.length === 0);
  if (!e) throw new Error('test needs at least one item awaiting review');
  return e;
};
const valid = () => {
  const e = reviewable();
  return { itemId: e.item.id, itemVersion: e.item.version, decision: 'approve', reviewerName: 'AB', reviewerRole: 'parent', note: '' };
};
const auth = (over: Record<string, unknown> = {}) => ({
  session: { id: 's1', childModeChildId: null, ...over },
  user: { id: 'u1', email: 'x@example.test' },
  family: { id: 'fam-1', consentVersion: CONSENT_VERSION },
});
const post = (body: unknown, origin = 'http://atlas.test') =>
  POST(new Request('http://atlas.test/api/review/decisions', { method: 'POST', headers: { host: 'atlas.test', origin, 'content-type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({}) });

describe('decisionSchema', () => {
  it('accepts a well-formed approve and a reject with a reason', () => {
    expect(decisionSchema.safeParse(valid()).success).toBe(true);
    expect(decisionSchema.safeParse({ ...valid(), decision: 'reject', note: 'Paragraph 2 is unclear.' }).success).toBe(true);
    expect(decisionSchema.safeParse({ ...valid(), reviewerName: 'Siti A.' }).success).toBe(true);
  });
  it('rejects unknown fields, markup, bad initials, roles a family cannot claim, and rejections without a reason', () => {
    for (const bad of [
      { ...valid(), familyId: 'other-family' },
      { ...valid(), reviewStatus: 'published' },
      { ...valid(), reviewerName: '' },
      { ...valid(), reviewerName: '<b>AB</b>' },
      { ...valid(), reviewerName: '12' },
      { ...valid(), reviewerRole: 'curriculum_reviewer' },
      { ...valid(), reviewerRole: 'scholar' },
      { ...valid(), decision: 'publish' },
      { ...valid(), decision: 'reject', note: '' },
      { ...valid(), decision: 'reject', note: '  ' },
      { ...valid(), note: '<script>x</script>' },
      { ...valid(), note: 'x'.repeat(401) },
      { ...valid(), itemId: '../../etc/passwd' },
      { ...valid(), itemVersion: 'latest' },
    ]) expect(decisionSchema.safeParse(bad).success, JSON.stringify(bad).slice(0, 80)).toBe(false);
  });
});

describe('assertDecisionAllowed', () => {
  it('404 for unknown items, 409 for a stale version or an item that is not awaiting review', () => {
    const e = reviewable();
    const body = decisionSchema.parse(valid());
    expect(() => assertDecisionAllowed(undefined, body)).toThrow(expect.objectContaining({ status: 404 }));
    expect(() => assertDecisionAllowed(e, { ...body, itemVersion: '9.9.9' })).toThrow(expect.objectContaining({ status: 409, code: 'VERSION_MISMATCH' }));
    for (const state of ['human_reviewed', 'published', 'rejected', 'structurally_validated'] as const) {
      expect(() => assertDecisionAllowed({ ...e, state }, body)).toThrow(expect.objectContaining({ status: 409, code: 'NOT_REVIEWABLE' }));
    }
    expect(() => assertDecisionAllowed({ ...e, errors: ['x'] }, body)).toThrow(expect.objectContaining({ code: 'NOT_REVIEWABLE' }));
    expect(assertDecisionAllowed(e, body)).toBe(e);
  });
});

describe('POST /api/review/decisions authorization', () => {
  beforeEach(() => {
    getAuth.mockReset();
    create.mockReset();
    rateLimit.mockReset();
    create.mockResolvedValue({ id: 'd1', createdAt: new Date('2026-11-10T00:00:00Z') });
  });
  it('401 signed out, 403 in child mode, 403 without consent, 403 cross-origin; nothing is written', async () => {
    getAuth.mockResolvedValue(null);
    expect((await post(valid())).status).toBe(401);
    getAuth.mockResolvedValue(auth({ childModeChildId: 'child-1' }));
    expect((await post(valid())).status).toBe(403);
    getAuth.mockResolvedValue({ ...auth(), family: { id: 'fam-1', consentVersion: null } });
    expect((await post(valid())).status).toBe(403);
    getAuth.mockResolvedValue(auth());
    expect((await post(valid(), 'https://evil.test')).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });
  it('rate-limits per parent and always writes the caller’s own family id', async () => {
    getAuth.mockResolvedValue(auth());
    const res = await post(valid());
    expect(res.status).toBe(201);
    expect(rateLimit).toHaveBeenCalledWith('review-decide:u1', expect.any(Number), expect.any(Number));
    expect(create.mock.calls[0]![0].data).toMatchObject({ familyId: 'fam-1', itemId: valid().itemId, decision: 'approve', reviewerName: 'AB' });
    expect((await post({ ...valid(), familyId: 'fam-2' })).status).toBe(400);
    expect((await post({ ...valid(), itemVersion: '9.9.9' })).status).toBe(409);
    expect((await post({ ...valid(), itemId: 'unit-g2-math-not-real' })).status).toBe(404);
    expect(create).toHaveBeenCalledTimes(1);
  });
  it('a rate-limited parent gets 429', async () => {
    getAuth.mockResolvedValue(auth());
    const { HttpError } = await import('./http');
    rateLimit.mockRejectedValueOnce(new HttpError(429, 'RATE_LIMITED'));
    expect((await post(valid())).status).toBe(429);
  });
});

describe('exportDecisions', () => {
  it('exports only decision fields, with the kind of each item', () => {
    const out = exportDecisions([{ itemId: 'unit-g2-math-x', itemVersion: '1.0.0', decision: 'approve', reviewerName: 'AB', reviewerRole: 'parent', note: '', createdAt: new Date('2026-11-10T01:02:03Z') }], () => 'unit', new Date('2026-11-11T00:00:00Z'));
    expect(out.format).toBe('atlas-review-decisions');
    expect(out.decisions).toEqual([{ itemId: 'unit-g2-math-x', itemKind: 'unit', itemVersion: '1.0.0', decision: 'approve', reviewerName: 'AB', reviewerRole: 'parent', note: '', createdAt: '2026-11-10T01:02:03.000Z' }]);
    expect(JSON.stringify(out)).not.toContain('familyId');
  });
});
