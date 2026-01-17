-- CreateEnum
CREATE TYPE "Role" AS ENUM ('creator', 'contestee');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqQuestion" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" TEXT[],
    "correct_option_index" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "created_at" INTEGER NOT NULL,

    CONSTRAINT "McqQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaProblem" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "points" INTEGER NOT NULL DEFAULT 100,
    "time_limit" INTEGER NOT NULL DEFAULT 2000,
    "memory_limit" INTEGER NOT NULL DEFAULT 256,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DsaProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqSubmission" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "selected_option_index" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McqSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaSubmission" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "test_cases_passed" INTEGER NOT NULL DEFAULT 0,
    "total_test_cases" INTEGER NOT NULL DEFAULT 0,
    "execution_time" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DsaSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "McqSubmission_user_id_question_id_key" ON "McqSubmission"("user_id", "question_id");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqQuestion" ADD CONSTRAINT "McqQuestion_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaProblem" ADD CONSTRAINT "DsaProblem_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "DsaProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmission" ADD CONSTRAINT "McqSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmission" ADD CONSTRAINT "McqSubmission_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "McqQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmission" ADD CONSTRAINT "DsaSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmission" ADD CONSTRAINT "DsaSubmission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "DsaProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
