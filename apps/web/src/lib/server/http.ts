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

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<output<S>> {
  const MAX_BODY = 32 * 1024; // all Atlas payloads are tiny; reject oversized bodies before parsing
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY) throw new HttpError(413, 'PAYLOAD_TOO_LARGE');
  const text = await req.text();
  if (text.length > MAX_BODY) throw new HttpError(413, 'PAYLOAD_TOO_LARGE');
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

export function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'local').trim();
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
