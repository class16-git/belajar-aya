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

/** CSRF defence for cookie-authenticated mutations: require a same-origin Origin header. */
export function assertSameOrigin(req: Request): void {
  if (req.method === 'GET' || req.method === 'HEAD') return;
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!origin || !host) throw new HttpError(403, 'BAD_ORIGIN');
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, 'BAD_ORIGIN');
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(403, 'BAD_ORIGIN');
  }
}

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<output<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
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
