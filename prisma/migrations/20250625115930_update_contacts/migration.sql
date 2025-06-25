/*
  Warnings:

  - You are about to drop the column `company` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `profileUrl` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "company",
DROP COLUMN "email",
DROP COLUMN "platform",
DROP COLUMN "position",
DROP COLUMN "profileUrl",
DROP COLUMN "score",
DROP COLUMN "skills",
ADD COLUMN     "ai_concerns" TEXT[],
ADD COLUMN     "ai_reasoning" TEXT,
ADD COLUMN     "ai_score" INTEGER,
ADD COLUMN     "ai_strengths" TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "role" TEXT;
