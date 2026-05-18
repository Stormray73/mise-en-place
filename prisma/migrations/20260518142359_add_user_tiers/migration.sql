/*
  Warnings:

  - You are about to drop the column `locationTags` on the `PantryItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "ManualShoppingItem" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PantryItem" DROP COLUMN "locationTags",
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "packageQuantity" DOUBLE PRECISION DEFAULT 1,
ADD COLUMN     "packageSize" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiUsageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "PantryLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PantryLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PantryLocation_name_userId_key" ON "PantryLocation"("name", "userId");

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "PantryLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryLocation" ADD CONSTRAINT "PantryLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
