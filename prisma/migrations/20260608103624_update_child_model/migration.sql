/*
  Warnings:

  - You are about to drop the column `ageMonths` on the `Child` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Child" DROP COLUMN "ageMonths",
ADD COLUMN     "ageYear" INTEGER;
