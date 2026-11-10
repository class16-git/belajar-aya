/**
 * Guard for destructive test helpers (audit ATL-01). Pure URL checks run before any database client exists; the
 * marker check runs before any destructive SQL. Never claims an unmarked database (that is the build's job only for
 * fresh, empty databases — CI marks its disposable database explicitly).
 */
export class UnsafeTestDatabaseError extends Error {}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function assertSafeTestDatabaseUrl(raw: string | undefined, extraAllowedHosts: string[] = []): URL {
  if (!raw) throw new UnsafeTestDatabaseError('No test database URL is set.');
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeTestDatabaseError('The test database URL is malformed.');
  }
  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') throw new UnsafeTestDatabaseError('Only PostgreSQL test databases are supported.');
  const allowed = new Set([...LOCAL_HOSTS, ...extraAllowedHosts.map((h) => h.trim().toLowerCase()).filter(Boolean)]);
  if (!allowed.has(url.hostname.toLowerCase())) {
    throw new UnsafeTestDatabaseError(`Refusing destructive tests against host "${url.hostname}" (not local or in E2E_ALLOWED_DB_HOSTS).`);
  }
  const name = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!/test/i.test(name) || /prod/i.test(name)) {
    throw new UnsafeTestDatabaseError(`Refusing destructive tests against database "${name}" (its name must contain "test" and not "prod").`);
  }
  return url;
}

type Queryable = { $queryRawUnsafe<T = unknown>(query: string): Promise<T> };

/** The database must already be marked "synthetic" (see packages/database/src/db-role.ts). */
export async function assertSyntheticMarker(client: Queryable): Promise<void> {
  let role: string | undefined;
  try {
    const rows = await client.$queryRawUnsafe<{ role: string }[]>('SELECT "role" FROM atlas_meta.database_role WHERE "id" = 1');
    role = rows[0]?.role;
  } catch {
    role = undefined;
  }
  if (role !== 'synthetic') {
    throw new UnsafeTestDatabaseError(
      role ? `Refusing destructive tests: the database is marked "${role}".` : 'Refusing destructive tests: the database has no "synthetic" role marker. Run `pnpm --filter @atlas/database db-role synthetic` against a fresh test database first.',
    );
  }
}
