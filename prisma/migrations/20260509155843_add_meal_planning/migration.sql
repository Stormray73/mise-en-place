-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "slot" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedRecipe" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "prepState" TEXT,
    "isLeftoverSource" BOOLEAN NOT NULL DEFAULT false,
    "sourcePlannedRecipeId" TEXT,

    CONSTRAINT "PlannedRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepCompletion" (
    "id" TEXT NOT NULL,
    "plannedRecipeId" TEXT NOT NULL,
    "ingredientId" TEXT,
    "childRecipeId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrepCompletion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedRecipe" ADD CONSTRAINT "PlannedRecipe_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedRecipe" ADD CONSTRAINT "PlannedRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedRecipe" ADD CONSTRAINT "PlannedRecipe_sourcePlannedRecipeId_fkey" FOREIGN KEY ("sourcePlannedRecipeId") REFERENCES "PlannedRecipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepCompletion" ADD CONSTRAINT "PrepCompletion_plannedRecipeId_fkey" FOREIGN KEY ("plannedRecipeId") REFERENCES "PlannedRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepCompletion" ADD CONSTRAINT "PrepCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
