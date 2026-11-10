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
