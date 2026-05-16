-- DropForeignKey
ALTER TABLE "PlannedRecipe" DROP CONSTRAINT "PlannedRecipe_recipeId_fkey";

-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlannedRecipe" ADD COLUMN     "excludeFromPrep" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "PlannedRecipe" ADD CONSTRAINT "PlannedRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
