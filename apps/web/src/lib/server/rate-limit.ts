import 'server-only';
import { prisma } from '@atlas/database';
import { sha256 } from '@atlas/shared/server';
import { HttpError } from './http';

/** Keys are stored hashed so the table never holds emails or other identifiers in plain text. */
export const rateLimitKey = (key: string) => sha256(key);

/** Remove a user's limiter rows (used when a family is deleted). */
export async function clearRateLimits(rawKeys: string[]): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key: { in: rawKeys.map(rateLimitKey) } } });
}

/** Fixed-window limiter stored in Postgres (works across instances). Atomic single statement. */
export async function rateLimit(rawKey: string, limit: number, windowSeconds: number): Promise<void> {
  const key = rateLimitKey(rawKey);
  // Opportunistic cleanup of rows whose windows are long over (keeps the table small; ~1 in 50 calls).
  if (Math.random() < 0.02) {
    await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "windowStart" < now() - interval '2 days'`;
  }
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "windowStart", "count") VALUES (${key}, now(), 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE "RateLimit"."windowStart" END
    RETURNING "count"`;
  if ((rows[0]?.count ?? 0) > limit) throw new HttpError(429, 'RATE_LIMITED');
}
