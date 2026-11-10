-- Concurrency guarantees (partial unique indexes are not expressible in schema.prisma).
-- Close duplicates that may already exist before adding the constraints.
UPDATE "ActivityInstance" a SET "status" = 'ABANDONED'
WHERE a."status" = 'ACTIVE' AND EXISTS (
  SELECT 1 FROM "ActivityInstance" b
  WHERE b."sessionId" = a."sessionId" AND b."status" = 'ACTIVE' AND b."createdAt" > a."createdAt");
UPDATE "LearningSession" s SET "endedAt" = now()
WHERE s."endedAt" IS NULL AND EXISTS (
  SELECT 1 FROM "LearningSession" t
  WHERE t."childId" = s."childId" AND t."endedAt" IS NULL AND t."startedAt" > s."startedAt");

-- At most one open learning session per child.
CREATE UNIQUE INDEX "LearningSession_one_open_per_child" ON "LearningSession" ("childId") WHERE "endedAt" IS NULL;
-- At most one active item per session.
CREATE UNIQUE INDEX "ActivityInstance_one_active_per_session" ON "ActivityInstance" ("sessionId") WHERE "status" = 'ACTIVE';
