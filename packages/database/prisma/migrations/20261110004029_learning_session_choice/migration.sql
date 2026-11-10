/*
  Warnings:

  - Added the required column `lessonId` to the `LearningSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skillId` to the `LearningSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LearningSession" ADD COLUMN     "lessonId" TEXT NOT NULL,
ADD COLUMN     "skillId" TEXT NOT NULL;
