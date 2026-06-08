/*
  Warnings:

  - The primary key for the `ActivityNote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ActivityTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Child` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DailyActivity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `screeningSessionId` column on the `DailyActivity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `templateId` column on the `DailyActivity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Expert` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExpertInteraction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `childId` column on the `ExpertInteraction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `screeningSessionId` column on the `ExpertInteraction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FaceAuthLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `userId` column on the `FaceAuthLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FaceCredential` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GrowthRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OtpCode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `userId` column on the `OtpCode` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ScreeningAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `optionId` column on the `ScreeningAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ScreeningOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ScreeningQuestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ScreeningSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WeeklyActivityProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `ActivityNote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dailyActivityId` on the `ActivityNote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ActivityTemplate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Child` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Child` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `DailyActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `childId` on the `DailyActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Expert` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ExpertInteraction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `ExpertInteraction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expertId` on the `ExpertInteraction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `FaceAuthLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `FaceCredential` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `FaceCredential` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `GrowthRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `childId` on the `GrowthRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `OtpCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ScreeningAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `screeningSessionId` on the `ScreeningAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `questionId` on the `ScreeningAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ScreeningOption` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `questionId` on the `ScreeningOption` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ScreeningQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ScreeningSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `childId` on the `ScreeningSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `WeeklyActivityProgress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `childId` on the `WeeklyActivityProgress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ActivityNote" DROP CONSTRAINT "ActivityNote_dailyActivityId_fkey";

-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_userId_fkey";

-- DropForeignKey
ALTER TABLE "DailyActivity" DROP CONSTRAINT "DailyActivity_childId_fkey";

-- DropForeignKey
ALTER TABLE "DailyActivity" DROP CONSTRAINT "DailyActivity_screeningSessionId_fkey";

-- DropForeignKey
ALTER TABLE "DailyActivity" DROP CONSTRAINT "DailyActivity_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ExpertInteraction" DROP CONSTRAINT "ExpertInteraction_childId_fkey";

-- DropForeignKey
ALTER TABLE "ExpertInteraction" DROP CONSTRAINT "ExpertInteraction_expertId_fkey";

-- DropForeignKey
ALTER TABLE "ExpertInteraction" DROP CONSTRAINT "ExpertInteraction_screeningSessionId_fkey";

-- DropForeignKey
ALTER TABLE "ExpertInteraction" DROP CONSTRAINT "ExpertInteraction_userId_fkey";

-- DropForeignKey
ALTER TABLE "FaceAuthLog" DROP CONSTRAINT "FaceAuthLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "FaceCredential" DROP CONSTRAINT "FaceCredential_userId_fkey";

-- DropForeignKey
ALTER TABLE "GrowthRecord" DROP CONSTRAINT "GrowthRecord_childId_fkey";

-- DropForeignKey
ALTER TABLE "OtpCode" DROP CONSTRAINT "OtpCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScreeningAnswer" DROP CONSTRAINT "ScreeningAnswer_optionId_fkey";

-- DropForeignKey
ALTER TABLE "ScreeningAnswer" DROP CONSTRAINT "ScreeningAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ScreeningAnswer" DROP CONSTRAINT "ScreeningAnswer_screeningSessionId_fkey";

-- DropForeignKey
ALTER TABLE "ScreeningOption" DROP CONSTRAINT "ScreeningOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ScreeningSession" DROP CONSTRAINT "ScreeningSession_childId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyActivityProgress" DROP CONSTRAINT "WeeklyActivityProgress_childId_fkey";

-- AlterTable
ALTER TABLE "ActivityNote" DROP CONSTRAINT "ActivityNote_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "dailyActivityId",
ADD COLUMN     "dailyActivityId" UUID NOT NULL,
ADD CONSTRAINT "ActivityNote_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ActivityTemplate" DROP CONSTRAINT "ActivityTemplate_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ActivityTemplate_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Child" DROP CONSTRAINT "Child_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "Child_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "DailyActivity" DROP CONSTRAINT "DailyActivity_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "childId",
ADD COLUMN     "childId" UUID NOT NULL,
DROP COLUMN "screeningSessionId",
ADD COLUMN     "screeningSessionId" UUID,
DROP COLUMN "templateId",
ADD COLUMN     "templateId" UUID,
ADD CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Expert" DROP CONSTRAINT "Expert_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Expert_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ExpertInteraction" DROP CONSTRAINT "ExpertInteraction_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "childId",
ADD COLUMN     "childId" UUID,
DROP COLUMN "expertId",
ADD COLUMN     "expertId" UUID NOT NULL,
DROP COLUMN "screeningSessionId",
ADD COLUMN     "screeningSessionId" UUID,
ADD CONSTRAINT "ExpertInteraction_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FaceAuthLog" DROP CONSTRAINT "FaceAuthLog_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID,
ADD CONSTRAINT "FaceAuthLog_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FaceCredential" DROP CONSTRAINT "FaceCredential_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "FaceCredential_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GrowthRecord" DROP CONSTRAINT "GrowthRecord_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "childId",
ADD COLUMN     "childId" UUID NOT NULL,
ADD CONSTRAINT "GrowthRecord_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OtpCode" DROP CONSTRAINT "OtpCode_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID,
ADD CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ScreeningAnswer" DROP CONSTRAINT "ScreeningAnswer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "screeningSessionId",
ADD COLUMN     "screeningSessionId" UUID NOT NULL,
DROP COLUMN "questionId",
ADD COLUMN     "questionId" UUID NOT NULL,
DROP COLUMN "optionId",
ADD COLUMN     "optionId" UUID,
ADD CONSTRAINT "ScreeningAnswer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ScreeningOption" DROP CONSTRAINT "ScreeningOption_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "questionId",
ADD COLUMN     "questionId" UUID NOT NULL,
ADD CONSTRAINT "ScreeningOption_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ScreeningQuestion" DROP CONSTRAINT "ScreeningQuestion_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ScreeningQuestion_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ScreeningSession" DROP CONSTRAINT "ScreeningSession_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "childId",
ADD COLUMN     "childId" UUID NOT NULL,
ADD CONSTRAINT "ScreeningSession_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WeeklyActivityProgress" DROP CONSTRAINT "WeeklyActivityProgress_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "childId",
ADD COLUMN     "childId" UUID NOT NULL,
ADD CONSTRAINT "WeeklyActivityProgress_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityNote_dailyActivityId_key" ON "ActivityNote"("dailyActivityId");

-- CreateIndex
CREATE INDEX "Child_userId_idx" ON "Child"("userId");

-- CreateIndex
CREATE INDEX "DailyActivity_childId_idx" ON "DailyActivity"("childId");

-- CreateIndex
CREATE INDEX "ExpertInteraction_userId_idx" ON "ExpertInteraction"("userId");

-- CreateIndex
CREATE INDEX "ExpertInteraction_childId_idx" ON "ExpertInteraction"("childId");

-- CreateIndex
CREATE INDEX "ExpertInteraction_expertId_idx" ON "ExpertInteraction"("expertId");

-- CreateIndex
CREATE INDEX "FaceAuthLog_userId_idx" ON "FaceAuthLog"("userId");

-- CreateIndex
CREATE INDEX "FaceCredential_userId_idx" ON "FaceCredential"("userId");

-- CreateIndex
CREATE INDEX "GrowthRecord_childId_idx" ON "GrowthRecord"("childId");

-- CreateIndex
CREATE INDEX "ScreeningAnswer_screeningSessionId_idx" ON "ScreeningAnswer"("screeningSessionId");

-- CreateIndex
CREATE INDEX "ScreeningAnswer_questionId_idx" ON "ScreeningAnswer"("questionId");

-- CreateIndex
CREATE INDEX "ScreeningOption_questionId_idx" ON "ScreeningOption"("questionId");

-- CreateIndex
CREATE INDEX "ScreeningSession_childId_idx" ON "ScreeningSession"("childId");

-- CreateIndex
CREATE INDEX "WeeklyActivityProgress_childId_idx" ON "WeeklyActivityProgress"("childId");

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaceCredential" ADD CONSTRAINT "FaceCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaceAuthLog" ADD CONSTRAINT "FaceAuthLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthRecord" ADD CONSTRAINT "GrowthRecord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningOption" ADD CONSTRAINT "ScreeningOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScreeningQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningSession" ADD CONSTRAINT "ScreeningSession_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningAnswer" ADD CONSTRAINT "ScreeningAnswer_screeningSessionId_fkey" FOREIGN KEY ("screeningSessionId") REFERENCES "ScreeningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningAnswer" ADD CONSTRAINT "ScreeningAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScreeningQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningAnswer" ADD CONSTRAINT "ScreeningAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ScreeningOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_screeningSessionId_fkey" FOREIGN KEY ("screeningSessionId") REFERENCES "ScreeningSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ActivityTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityNote" ADD CONSTRAINT "ActivityNote_dailyActivityId_fkey" FOREIGN KEY ("dailyActivityId") REFERENCES "DailyActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyActivityProgress" ADD CONSTRAINT "WeeklyActivityProgress_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertInteraction" ADD CONSTRAINT "ExpertInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertInteraction" ADD CONSTRAINT "ExpertInteraction_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertInteraction" ADD CONSTRAINT "ExpertInteraction_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "Expert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertInteraction" ADD CONSTRAINT "ExpertInteraction_screeningSessionId_fkey" FOREIGN KEY ("screeningSessionId") REFERENCES "ScreeningSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
