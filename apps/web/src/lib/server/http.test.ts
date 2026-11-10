import { afterEach, describe, expect, it } from 'vitest';
import { assertSameOrigin } from './http';

const req = (headers: Record<string, string>, method = 'POST') => new Request('http://internal/api/x', { method, headers });

describe('assertSameOrigin (review finding F5)', () => {
  afterEach(() => {
    delete process.env.ATLAS_PUBLIC_ORIGIN;
  });
  it('requires an Origin on mutations and matches it to Host', () => {
    expect(() => assertSameOrigin(req({ host: 'a.test' }))).toThrow();
    expect(() => assertSameOrigin(req({ host: 'a.test', origin: 'https://evil.test' }))).toThrow();
    expect(() => assertSameOrigin(req({ host: 'a.test', origin: 'https://a.test' }))).not.toThrow();
    expect(() => assertSameOrigin(req({ host: 'a.test' }, 'GET'))).not.toThrow();
  });
  it('ignores X-Forwarded-Host entirely', () => {
    expect(() => assertSameOrigin(req({ host: 'a.test', 'x-forwarded-host': 'evil.test', origin: 'https://evil.test' }))).toThrow();
  });
  it('with ATLAS_PUBLIC_ORIGIN, requires an exact scheme+host+port match regardless of Host', () => {
    process.env.ATLAS_PUBLIC_ORIGIN = 'https://atlas.example.org';
    expect(() => assertSameOrigin(req({ host: 'evil.test', origin: 'https://atlas.example.org' }))).not.toThrow();
    expect(() => assertSameOrigin(req({ host: 'atlas.example.org', origin: 'http://atlas.example.org' }))).toThrow();
    expect(() => assertSameOrigin(req({ host: 'atlas.example.org', origin: 'https://atlas.example.org:8443' }))).toThrow();
    expect(() => assertSameOrigin(req({ host: 'atlas.example.org', origin: 'null' }))).toThrow();
  });
});

describe('clientIp (N1: rate-limit key must not be client-spoofable)', () => {
  it('trusts platform-set client IP headers only when running on Vercel', async () => {
    const { clientIp } = await import('./http');
    // Not on Vercel: a client-supplied x-real-ip must be ignored.
    expect(clientIp(req({ 'x-real-ip': '6.6.6.6', 'x-forwarded-for': '203.0.113.9' }))).toBe('203.0.113.9');
    process.env.VERCEL = '1';
    expect(clientIp(req({ 'x-real-ip': '203.0.113.9', 'x-forwarded-for': '1.1.1.1, 203.0.113.9' }))).toBe('203.0.113.9');
    expect(clientIp(req({ 'x-vercel-forwarded-for': '198.51.100.7', 'x-forwarded-for': '6.6.6.6' }))).toBe('198.51.100.7');
    delete process.env.VERCEL;
  });
  it('uses the right-most X-Forwarded-For entry (appended by our proxy), not the client-supplied left-most one', async () => {
    const { clientIp } = await import('./http');
    expect(clientIp(req({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' }))).toBe('203.0.113.9');
    expect(clientIp(req({ 'x-forwarded-for': '7.7.7.7, 203.0.113.9' }))).toBe('203.0.113.9');
  });
});

describe('parseBody (N2: bounded body size even without Content-Length)', () => {
  it('rejects an oversized streamed body without buffering it all', async () => {
    const { parseBody, HttpError } = await import('./http');
    const { z } = await import('zod');
    let pulled = 0;
    const chunk = new TextEncoder().encode('x'.repeat(16 * 1024));
    const body = new ReadableStream<Uint8Array>({
      pull(ctl) {
        pulled++;
        if (pulled > 1000) ctl.close(); // 16 MB if fully consumed
        else ctl.enqueue(chunk);
      },
    });
    const r = new Request('http://internal/api/x', { method: 'POST', body, duplex: 'half' } as RequestInit);
    await expect(parseBody(r, z.object({}))).rejects.toMatchObject({ status: 413 });
    expect(pulled).toBeLessThan(10);
    expect(HttpError).toBeDefined();
  });
  it('still parses a normal body', async () => {
    const { parseBody } = await import('./http');
    const { z } = await import('zod');
    const r = new Request('http://internal/api/x', { method: 'POST', body: JSON.stringify({ a: 1 }) });
    await expect(parseBody(r, z.object({ a: z.number() }))).resolves.toEqual({ a: 1 });
  });
});
