-- AlterTable
ALTER TABLE "ReadingEvent" ADD COLUMN     "answers" JSONB,
ADD COLUMN     "attemptId" TEXT,
ADD COLUMN     "firstAttempt" BOOLEAN,
ALTER COLUMN "parentAssisted" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ReadingEvent_attemptId_key" ON "ReadingEvent"("attemptId");

