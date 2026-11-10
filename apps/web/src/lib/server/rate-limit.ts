import 'server-only';
import { prisma } from '@atlas/database';
import { HttpError } from './http';

/** Fixed-window limiter stored in Postgres (works across instances). Atomic single statement. */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "windowStart", "count") VALUES (${key}, now(), 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE "RateLimit"."windowStart" END
    RETURNING "count"`;
  if ((rows[0]?.count ?? 0) > limit) throw new HttpError(429, 'RATE_LIMITED');
}
