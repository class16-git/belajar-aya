-- CreateEnum
CREATE TYPE "ReadingEventKind" AS ENUM ('SHARED_READ', 'INDEPENDENT_READ', 'RETELL', 'ACTIVITY', 'COMPREHENSION_CHECK', 'CHILD_FINISHED');

-- CreateEnum
CREATE TYPE "ShelfState" AS ENUM ('ON_SHELF', 'HIDDEN');

-- AlterTable
ALTER TABLE "Family" ADD COLUMN     "libraryExternalLinks" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ReadingEvent" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "bookId" TEXT,
    "passageId" TEXT,
    "kind" "ReadingEventKind" NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "parentAssisted" BOOLEAN NOT NULL DEFAULT false,
    "listening" INTEGER,
    "decoding" INTEGER,
    "enjoyment" INTEGER,
    "correct" INTEGER,
    "total" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShelfEntry" (
    "childId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "state" "ShelfState" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShelfEntry_pkey" PRIMARY KEY ("childId","bookId")
);

-- CreateIndex
CREATE INDEX "ReadingEvent_childId_observedAt_idx" ON "ReadingEvent"("childId", "observedAt");

-- AddForeignKey
ALTER TABLE "ReadingEvent" ADD CONSTRAINT "ReadingEvent_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfEntry" ADD CONSTRAINT "ShelfEntry_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Defence in depth: ratings are small rubric levels, comprehension totals are bounded.
ALTER TABLE "ReadingEvent" ADD CONSTRAINT "ReadingEvent_ratings_check" CHECK (
  ("listening" IS NULL OR "listening" BETWEEN 0 AND 3) AND
  ("decoding" IS NULL OR "decoding" BETWEEN 0 AND 3) AND
  ("enjoyment" IS NULL OR "enjoyment" BETWEEN 0 AND 2) AND
  ("total" IS NULL OR "total" BETWEEN 1 AND 10) AND
  ("correct" IS NULL OR ("correct" >= 0 AND "total" IS NOT NULL AND "correct" <= "total"))
);
