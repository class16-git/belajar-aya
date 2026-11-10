-- CreateEnum
CREATE TYPE "ContentReviewDecisionKind" AS ENUM ('approve', 'reject');

-- CreateEnum
CREATE TYPE "ContentReviewerRole" AS ENUM ('parent', 'educator');

-- CreateTable
CREATE TABLE "ContentReviewDecision" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemVersion" TEXT NOT NULL,
    "decision" "ContentReviewDecisionKind" NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerRole" "ContentReviewerRole" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReviewDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentReviewDecision_familyId_itemId_createdAt_idx" ON "ContentReviewDecision"("familyId", "itemId", "createdAt");

-- AddForeignKey
ALTER TABLE "ContentReviewDecision" ADD CONSTRAINT "ContentReviewDecision_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Defence in depth: bounded sizes; a rejection always carries a reason.
ALTER TABLE "ContentReviewDecision" ADD CONSTRAINT "ContentReviewDecision_bounds_check" CHECK (
  char_length("itemId") BETWEEN 1 AND 120 AND
  char_length("itemVersion") BETWEEN 5 AND 20 AND
  char_length("reviewerName") BETWEEN 1 AND 40 AND
  char_length("note") <= 400 AND
  ("decision" <> 'reject' OR char_length("note") >= 3)
);
