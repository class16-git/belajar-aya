import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError, type ZodTypeAny, type output } from 'zod';
import { logError } from './log';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * CSRF defence for cookie-authenticated mutations (in addition to SameSite=Lax cookies).
 * If ATLAS_PUBLIC_ORIGIN is set (comma-separated, e.g. "https://atlas.example.org"), the Origin must match one
 * exactly (scheme + host + port) and forwarded headers are ignored. Otherwise Origin must match the request Host.
 */
export function assertSameOrigin(req: Request): void {
  if (req.method === 'GET' || req.method === 'HEAD') return;
  const origin = req.headers.get('origin');
  if (!origin) throw new HttpError(403, 'BAD_ORIGIN');
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new HttpError(403, 'BAD_ORIGIN');
  }
  const allowed = (process.env.ATLAS_PUBLIC_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (allowed.length) {
    if (!allowed.includes(parsed.origin)) throw new HttpError(403, 'BAD_ORIGIN');
    return;
  }
  const host = req.headers.get('host');
  if (!host || parsed.host !== host) throw new HttpError(403, 'BAD_ORIGIN');
}

const MAX_BODY = 32 * 1024; // all Atlas payloads are tiny

/** Read at most MAX_BODY bytes; abort as soon as the limit is exceeded (also for chunked bodies). */
async function readLimited(req: Request): Promise<string> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY) throw new HttpError(413, 'PAYLOAD_TOO_LARGE');
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel().catch(() => undefined);
      throw new HttpError(413, 'PAYLOAD_TOO_LARGE');
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<output<S>> {
  const text = await readLimited(req);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new HttpError(400, 'INVALID_JSON');
  }
  const r = schema.safeParse(raw);
  if (!r.success) throw new HttpError(400, 'VALIDATION_ERROR');
  return r.data;
}

/**
 * Client IP for rate limiting. On Vercel, use the headers Vercel sets (x-vercel-forwarded-for / x-real-ip).
 * Otherwise use the RIGHT-most X-Forwarded-For entry: it is appended by our own reverse proxy, whereas
 * left-most entries can be supplied by the client to dodge per-IP limits.
 */
export function clientIp(req: Request): string {
  // Platform headers are only trustworthy when we actually run on that platform; elsewhere a client could set them.
  if (process.env.VERCEL === '1') {
    const platform = req.headers.get('x-vercel-forwarded-for') ?? req.headers.get('x-real-ip');
    if (platform) return platform.split(',')[0]!.trim();
  }
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',').map((p) => p.trim()).filter(Boolean).at(-1) ?? 'unknown';
  return 'local';
}

export function handle(route: string, fn: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      assertSameOrigin(req);
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.code }, e.status);
      if (e instanceof ZodError) return json({ error: 'VALIDATION_ERROR' }, 400);
      logError('api.unhandled', e, { route });
      return json({ error: 'INTERNAL' }, 500);
    }
  };
}
