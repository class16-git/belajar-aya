/**
 * Content-Security-Policy (audit ATL-14).
 *
 * ENFORCED_CSP is the static policy sent by next.config.ts. NONCE_CSP is the stricter per-request policy (nonce +
 * 'strict-dynamic', no 'unsafe-inline' scripts) that middleware sends as Content-Security-Policy-Report-Only. Next.js
 * reads the nonce from the request's CSP header and adds it to its own scripts. Once the report-only policy has run
 * clean in production, swap: enforce NONCE_CSP and drop 'unsafe-inline' (see docs/delivery/RELEASE_RUNBOOK.md).
 */
const COMMON = [
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

export function enforcedCsp(dev: boolean): string {
  return ["default-src 'self'", `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`, ...COMMON].join('; ');
}

export function nonceCsp(nonce: string, dev: boolean): string {
  if (!/^[A-Za-z0-9+/=_-]{16,}$/.test(nonce)) throw new Error('invalid nonce');
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    ...COMMON,
    'report-uri /api/csp-report',
  ].join('; ');
}

/** Keep only what is needed to find the page and directive; never query strings, fragments or script samples. */
export function summariseCspReport(body: unknown): { page: string; directive: string; blocked: string } | null {
  const r = (body && typeof body === 'object' && 'csp-report' in body ? (body as Record<string, unknown>)['csp-report'] : Array.isArray(body) ? (body[0] as { body?: unknown })?.body : null) as Record<string, unknown> | null;
  if (!r || typeof r !== 'object') return null;
  const str = (k: string[]) => { for (const key of k) if (typeof r[key] === 'string') return r[key] as string; return ''; };
  const path = (u: string) => { try { const x = new URL(u); return x.origin === 'null' ? u.slice(0, 40) : `${x.origin}${x.pathname}`; } catch { return u.slice(0, 40); } };
  return {
    page: path(str(['document-uri', 'documentURL'])).replace(/^https?:\/\/[^/]+/, ''),
    directive: str(['effective-directive', 'violated-directive', 'effectiveDirective']).slice(0, 60),
    blocked: path(str(['blocked-uri', 'blockedURL'])).slice(0, 120),
  };
}
