/*
  Warnings:

  - You are about to drop the column `created_at` on the `McqQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "McqQuestion" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
