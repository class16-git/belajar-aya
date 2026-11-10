import { describe, expect, it } from 'vitest';
import { enforcedCsp, nonceCsp, summariseCspReport } from './csp';

describe('CSP (ATL-14)', () => {
  it('the nonce policy has no unsafe-inline scripts, uses the nonce with strict-dynamic, and keeps the other directives', () => {
    const p = nonceCsp('bm9uY2Utbm9uY2Utbm9uY2U=', false);
    const script = p.split('; ').find((d) => d.startsWith('script-src'))!;
    expect(script).toBe("script-src 'self' 'nonce-bm9uY2Utbm9uY2Utbm9uY2U=' 'strict-dynamic'");
    for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "connect-src 'self'"]) expect(p).toContain(d);
    expect(p).not.toContain('unsafe-eval');
    expect(enforcedCsp(false)).toContain("script-src 'self' 'unsafe-inline'");
  });
  it('rejects a nonce that could break out of the header', () => {
    expect(() => nonceCsp("abc'; script-src *", false)).toThrow();
    expect(() => nonceCsp('short', false)).toThrow();
  });
  it('report summaries drop query strings, fragments and script samples', () => {
    const s = summariseCspReport({ 'csp-report': { 'document-uri': 'https://atlas.example/learn/session/abc?token=secret#x', 'effective-directive': 'script-src-elem', 'blocked-uri': 'inline', 'script-sample': 'alert(document.cookie)' } });
    expect(s).toEqual({ page: '/learn/session/abc', directive: 'script-src-elem', blocked: 'inline' });
    expect(JSON.stringify(s)).not.toMatch(/secret|cookie/);
    expect(summariseCspReport('nonsense')).toBeNull();
  });
});
