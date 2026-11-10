import { describe, expect, it } from 'vitest';
import { assertSafeTestDatabaseUrl, assertSyntheticMarker, UnsafeTestDatabaseError } from './test-db-guard';

describe('destructive test database guard (ATL-01)', () => {
  it('accepts a local test database', () => {
    expect(assertSafeTestDatabaseUrl('postgresql://postgres@localhost:5432/atlas_test').hostname).toBe('localhost');
    expect(() => assertSafeTestDatabaseUrl('postgres://u:p@127.0.0.1/atlas_e2e_test')).not.toThrow();
  });
  it.each([
    [undefined, /No test database/],
    ['not a url', /malformed/],
    ['mysql://localhost/atlas_test', /PostgreSQL/],
    ['postgresql://user:pw@ep-cool-123.neon.tech/neondb', /not local/],
    ['postgresql://user:pw@db.example.com/atlas_test', /not local/],
    ['postgresql://postgres@localhost:5432/atlas', /must contain "test"/],
    ['postgresql://postgres@localhost:5432/atlas_prod_test', /not "prod"/],
  ])('rejects %s before any SQL', (url, msg) => {
    expect(() => assertSafeTestDatabaseUrl(url as string | undefined)).toThrow(msg);
  });
  it('allows a remote host only when explicitly allow-listed', () => {
    expect(() => assertSafeTestDatabaseUrl('postgresql://u@ci-db.internal/atlas_test', ['ci-db.internal'])).not.toThrow();
  });
  it('requires an existing "synthetic" marker and never claims an unmarked database', async () => {
    const client = (role: string | null | 'error') => ({
      $queryRawUnsafe: async <T,>() => {
        if (role === 'error') throw new Error('relation does not exist');
        return (role ? [{ role }] : []) as T;
      },
    });
    await expect(assertSyntheticMarker(client('synthetic'))).resolves.toBeUndefined();
    await expect(assertSyntheticMarker(client('production'))).rejects.toBeInstanceOf(UnsafeTestDatabaseError);
    await expect(assertSyntheticMarker(client(null))).rejects.toThrow(/no "synthetic" role marker/);
    await expect(assertSyntheticMarker(client('error'))).rejects.toThrow(/no "synthetic" role marker/);
  });
});
