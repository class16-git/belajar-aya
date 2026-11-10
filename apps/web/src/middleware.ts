import { NextResponse, type NextRequest } from 'next/server';
import { nonceCsp } from '@/lib/csp';

/** Per-request CSP nonce, sent report-only first (ATL-14). */
export function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const policy = nonceCsp(nonce, process.env.NODE_ENV !== 'production');
  const headers = new Headers(req.headers);
  headers.set('x-nonce', nonce);
  headers.set('content-security-policy-report-only', policy);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set('Content-Security-Policy-Report-Only', policy);
  return res;
}

export const config = {
  matcher: [{ source: '/((?!api/|_next/static|_next/image|favicon.ico).*)', missing: [{ type: 'header', key: 'next-router-prefetch' }] }],
};
