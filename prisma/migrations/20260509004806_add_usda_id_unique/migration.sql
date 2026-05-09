/*
  Warnings:

  - A unique constraint covering the columns `[usdaId]` on the table `Ingredient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "baseAmount" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_usdaId_key" ON "Ingredient"("usdaId");
