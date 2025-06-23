/*
  Warnings:

  - You are about to drop the column `totalBudget` on the `Campaign` table. All the data in the column will be lost.
  - Added the required column `totalBudgetInEURC` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalBudgetInUSDC` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "totalBudget",
ADD COLUMN     "totalBudgetInEURC" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalBudgetInUSDC" DOUBLE PRECISION NOT NULL;
