/*
  Warnings:

  - You are about to drop the column `created_at` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `creator_id` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `contest_id` on the `DsaProblem` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `DsaProblem` table. All the data in the column will be lost.
  - You are about to drop the column `memory_limit` on the `DsaProblem` table. All the data in the column will be lost.
  - You are about to drop the column `time_limit` on the `DsaProblem` table. All the data in the column will be lost.
  - You are about to drop the column `execution_time` on the `DsaSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `points_earned` on the `DsaSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `problem_id` on the `DsaSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_at` on the `DsaSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `test_cases_passed` on the `DsaSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `total_test_cases` on the `DsaSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `DsaSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `contest_id` on the `McqQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `correct_option_index` on the `McqQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `McqQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `is_correct` on the `McqSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `points_earned` on the `McqSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `McqSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `selected_option_index` on the `McqSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_at` on the `McqSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `McqSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `expected_output` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `is_hidden` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `problem_id` on the `TestCase` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,questionId]` on the table `McqSubmission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contestId` to the `DsaProblem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executionTime` to the `DsaSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemId` to the `DsaSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DsaSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contestId` to the `McqQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctOptionIndex` to the `McqQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `McqQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `McqSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedOptionIndex` to the `McqSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `McqSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedOutput` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contest" DROP CONSTRAINT "Contest_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "DsaProblem" DROP CONSTRAINT "DsaProblem_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "DsaSubmission" DROP CONSTRAINT "DsaSubmission_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "DsaSubmission" DROP CONSTRAINT "DsaSubmission_user_id_fkey";

-- DropForeignKey
ALTER TABLE "McqQuestion" DROP CONSTRAINT "McqQuestion_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "McqSubmission" DROP CONSTRAINT "McqSubmission_question_id_fkey";

-- DropForeignKey
ALTER TABLE "McqSubmission" DROP CONSTRAINT "McqSubmission_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_problem_id_fkey";

-- DropIndex
DROP INDEX "McqSubmission_user_id_question_id_key";

-- AlterTable
ALTER TABLE "Contest" DROP COLUMN "created_at",
DROP COLUMN "creator_id",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DsaProblem" DROP COLUMN "contest_id",
DROP COLUMN "created_at",
DROP COLUMN "memory_limit",
DROP COLUMN "time_limit",
ADD COLUMN     "contestId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "memoryLimit" INTEGER NOT NULL DEFAULT 256,
ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 2000;

-- AlterTable
ALTER TABLE "DsaSubmission" DROP COLUMN "execution_time",
DROP COLUMN "points_earned",
DROP COLUMN "problem_id",
DROP COLUMN "submitted_at",
DROP COLUMN "test_cases_passed",
DROP COLUMN "total_test_cases",
DROP COLUMN "user_id",
ADD COLUMN     "executionTime" INTEGER NOT NULL,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "problemId" INTEGER NOT NULL,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTestCases" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "McqQuestion" DROP COLUMN "contest_id",
DROP COLUMN "correct_option_index",
DROP COLUMN "question_text",
ADD COLUMN     "contestId" INTEGER NOT NULL,
ADD COLUMN     "correctOptionIndex" INTEGER NOT NULL,
ADD COLUMN     "questionText" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "McqSubmission" DROP COLUMN "is_correct",
DROP COLUMN "points_earned",
DROP COLUMN "question_id",
DROP COLUMN "selected_option_index",
DROP COLUMN "submitted_at",
DROP COLUMN "user_id",
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD COLUMN     "selectedOptionIndex" INTEGER NOT NULL,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "created_at",
DROP COLUMN "expected_output",
DROP COLUMN "is_hidden",
DROP COLUMN "problem_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expectedOutput" TEXT NOT NULL,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "problemId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "McqSubmission_userId_questionId_key" ON "McqSubmission"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqQuestion" ADD CONSTRAINT "McqQuestion_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaProblem" ADD CONSTRAINT "DsaProblem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "DsaProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmission" ADD CONSTRAINT "McqSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmission" ADD CONSTRAINT "McqSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "McqQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmission" ADD CONSTRAINT "DsaSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmission" ADD CONSTRAINT "DsaSubmission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "DsaProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
