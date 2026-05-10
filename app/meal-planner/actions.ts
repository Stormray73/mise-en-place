"use server";

import { auth } from "@/auth";
import * as mealPlanLib from "@/lib/meal-plans";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function createMealAction(date: Date, slot: string) {
  const userId = await getUserId();
  const mealPlan = await mealPlanLib.getMealPlan(userId);
  const meal = await mealPlanLib.createMeal(mealPlan.id, date, slot);
  revalidatePath("/meal-planner");
  return meal;
}

export async function addRecipeToMealAction(
  mealId: string,
  recipeId: string,
  scale: number = 1.0,
  prepState?: string,
) {
  const userId = await getUserId();
  // Verify ownership
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: { mealPlan: true },
  });
  if (!meal || meal.mealPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const plannedRecipe = await mealPlanLib.addRecipeToMeal(
    mealId,
    recipeId,
    scale,
    prepState,
  );
  revalidatePath("/meal-planner");
  return plannedRecipe;
}

export async function deleteMealAction(mealId: string) {
  const userId = await getUserId();
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: { mealPlan: true },
  });
  if (!meal || meal.mealPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await mealPlanLib.deleteMeal(mealId);
  revalidatePath("/meal-planner");
}

export async function updatePlannedRecipeAction(
  plannedRecipeId: string,
  data: { scale?: number; prepState?: string },
) {
  const userId = await getUserId();
  const pr = await prisma.plannedRecipe.findUnique({
    where: { id: plannedRecipeId },
    include: { meal: { include: { mealPlan: true } } },
  });
  if (!pr || pr.meal.mealPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const updated = await mealPlanLib.updatePlannedRecipe(plannedRecipeId, data);
  revalidatePath("/meal-planner");
  return updated;
}

export async function removeRecipeFromMealAction(plannedRecipeId: string) {
  const userId = await getUserId();
  const pr = await prisma.plannedRecipe.findUnique({
    where: { id: plannedRecipeId },
    include: { meal: { include: { mealPlan: true } } },
  });
  if (!pr || pr.meal.mealPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await mealPlanLib.removeRecipeFromMeal(plannedRecipeId);
  revalidatePath("/meal-planner");
}

export async function setLeftoverSourceAction(
  plannedRecipeId: string,
  isSource: boolean,
) {
  const userId = await getUserId();
  const pr = await prisma.plannedRecipe.findUnique({
    where: { id: plannedRecipeId },
    include: { meal: { include: { mealPlan: true } } },
  });
  if (!pr || pr.meal.mealPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await mealPlanLib.setLeftoverSource(plannedRecipeId, isSource);
  revalidatePath("/meal-planner");
}

export async function linkLeftoverConsumptionAction(
  plannedRecipeId: string,
  sourcePlannedRecipeId: string | null,
) {
  const userId = await getUserId();

  // Fetch consumer meal
  const consumerPlannedRecipe = await prisma.plannedRecipe.findUnique({
    where: { id: plannedRecipeId },
    include: { meal: { include: { mealPlan: true } } },
  });
  if (
    !consumerPlannedRecipe ||
    consumerPlannedRecipe.meal.mealPlan.userId !== userId
  ) {
    throw new Error("Unauthorized");
  }

  // If linking, verify source exists and date is valid
  if (sourcePlannedRecipeId) {
    const sourcePlannedRecipe = await prisma.plannedRecipe.findUnique({
      where: { id: sourcePlannedRecipeId },
      include: { meal: true },
    });

    if (!sourcePlannedRecipe) throw new Error("Source not found");

    if (
      new Date(consumerPlannedRecipe.meal.date) <
      new Date(sourcePlannedRecipe.meal.date)
    ) {
      throw new Error("Leftovers cannot be consumed before they are produced.");
    }
  }

  await mealPlanLib.linkLeftoverConsumption(
    plannedRecipeId,
    sourcePlannedRecipeId,
  );
  revalidatePath("/meal-planner");
}

export async function getPrepAheadDataAction(startDate: Date, endDate: Date) {
  const userId = await getUserId();
  return mealPlanLib.getPrepAheadData(userId, startDate, endDate);
}

export async function togglePrepCompletionAction(
  ingredientId: string | null,
  childRecipeId: string | null,
  completed: boolean,
) {
  const userId = await getUserId();
  await mealPlanLib.togglePrepCompletion(
    userId,
    ingredientId,
    childRecipeId,
    completed,
  );
  revalidatePath("/meal-planner");
}

export async function cloneMealAction(mealId: string, targetDate: Date) {
  const userId = await getUserId();
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: { mealPlan: true },
  });
  if (!meal || meal.mealPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await mealPlanLib.cloneMeal(mealId, targetDate);
  revalidatePath("/meal-planner");
}
