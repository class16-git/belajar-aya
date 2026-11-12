-- CreateTable
CREATE TABLE "UnitAttempt" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "unitVersion" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "firstAttempt" BOOLEAN NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "misconceptions" TEXT[],
    "parentAssisted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitAttempt_attemptId_key" ON "UnitAttempt"("attemptId");

-- CreateIndex
CREATE INDEX "UnitAttempt_childId_unitId_createdAt_idx" ON "UnitAttempt"("childId", "unitId", "createdAt");

-- AddForeignKey
ALTER TABLE "UnitAttempt" ADD CONSTRAINT "UnitAttempt_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
