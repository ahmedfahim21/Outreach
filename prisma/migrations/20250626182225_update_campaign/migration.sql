/*
  Warnings:

  - You are about to drop the column `autoFollowups` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `autoNegotiation` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `customSearchIntent` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `searchIntent` on the `Campaign` table. All the data in the column will be lost.
  - Added the required column `totalBudgetForOutreach` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "autoFollowups",
DROP COLUMN "autoNegotiation",
DROP COLUMN "customSearchIntent",
DROP COLUMN "searchIntent",
ADD COLUMN     "totalBudgetForOutreach" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "email" TEXT;
