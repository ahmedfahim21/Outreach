/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gmailEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleConnected` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `searchEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[contactEmail]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactEmail` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `walletAddress` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "emailVerified",
DROP COLUMN "gmailEnabled",
DROP COLUMN "googleConnected",
DROP COLUMN "image",
DROP COLUMN "searchEnabled",
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ALTER COLUMN "walletAddress" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "GoogleAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAccount_userId_key" ON "GoogleAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAccount_googleId_key" ON "GoogleAccount"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_contactEmail_key" ON "User"("contactEmail");

-- AddForeignKey
ALTER TABLE "GoogleAccount" ADD CONSTRAINT "GoogleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
