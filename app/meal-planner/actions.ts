/**
 * @file app/meal-planner/actions.ts
 * @responsibility Server actions for meal planning and prep-ahead dashboard.
 * @dependencies auth, mealPlanLib, prisma, types
 */

"use server";

import { auth } from "@/auth";
import * as mealPlanLib from "@/lib/meal-plans";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ActionResult, Meal, PlannedRecipe, PrepItem } from "@/types";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function createMealAction(
  date: Date,
  slot: string,
): Promise<ActionResult<Meal>> {
  try {
    const userId = await getUserId();
    const mealPlan = await mealPlanLib.getMealPlan(userId);
    const meal = await mealPlanLib.createMeal(mealPlan.id, date, slot);
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: meal as unknown as Meal };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function addRecipeToMealAction(
  mealId: string,
  recipeId: string,
  scale: number = 1.0,
  prepState?: string,
): Promise<ActionResult<PlannedRecipe>> {
  try {
    const userId = await getUserId();
    // Verify ownership
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { mealPlan: true },
    });
    if (!meal || meal.mealPlan.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const plannedRecipe = await mealPlanLib.addRecipeToMeal(
      mealId,
      recipeId,
      scale,
      prepState,
    );
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: plannedRecipe as unknown as PlannedRecipe };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteMealAction(
  mealId: string,
): Promise<ActionResult<void>> {
  try {
    const userId = await getUserId();
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { mealPlan: true },
    });
    if (!meal || meal.mealPlan.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await mealPlanLib.deleteMeal(mealId);
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updatePlannedRecipeAction(
  plannedRecipeId: string,
  data: { scale?: number; prepState?: string },
): Promise<ActionResult<PlannedRecipe>> {
  try {
    const userId = await getUserId();
    const pr = await prisma.plannedRecipe.findUnique({
      where: { id: plannedRecipeId },
      include: { meal: { include: { mealPlan: true } } },
    });
    if (!pr || pr.meal.mealPlan.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await mealPlanLib.updatePlannedRecipe(
      plannedRecipeId,
      data,
    );

    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");

    return { success: true, data: updated as unknown as PlannedRecipe };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function removeRecipeFromMealAction(
  plannedRecipeId: string,
): Promise<ActionResult<void>> {
  try {
    const userId = await getUserId();
    const pr = await prisma.plannedRecipe.findUnique({
      where: { id: plannedRecipeId },
      include: { meal: { include: { mealPlan: true } } },
    });
    if (!pr || pr.meal.mealPlan.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await mealPlanLib.removeRecipeFromMeal(plannedRecipeId);
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function setLeftoverSourceAction(
  plannedRecipeId: string,
  isSource: boolean,
): Promise<ActionResult<void>> {
  try {
    const userId = await getUserId();
    const pr = await prisma.plannedRecipe.findUnique({
      where: { id: plannedRecipeId },
      include: { meal: { include: { mealPlan: true } } },
    });
    if (!pr || pr.meal.mealPlan.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await mealPlanLib.setLeftoverSource(plannedRecipeId, isSource);
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function linkLeftoverConsumptionAction(
  plannedRecipeId: string,
  sourcePlannedRecipeId: string | null,
): Promise<ActionResult<void>> {
  try {
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
      return { success: false, error: "Unauthorized" };
    }

    // If linking, verify source exists and date is valid
    if (sourcePlannedRecipeId) {
      const sourcePlannedRecipe = await prisma.plannedRecipe.findUnique({
        where: { id: sourcePlannedRecipeId },
        include: { meal: true },
      });

      if (!sourcePlannedRecipe)
        return { success: false, error: "Source not found" };

      if (
        new Date(consumerPlannedRecipe.meal.date) <
        new Date(sourcePlannedRecipe.meal.date)
      ) {
        return {
          success: false,
          error: "Leftovers cannot be consumed before they are produced.",
        };
      }
    }

    await mealPlanLib.linkLeftoverConsumption(
      plannedRecipeId,
      sourcePlannedRecipeId,
    );
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPrepAheadDataAction(
  startDate: Date,
  endDate: Date,
): Promise<ActionResult<PrepItem[]>> {
  try {
    const userId = await getUserId();
    const data = await mealPlanLib.getPrepAheadData(userId, startDate, endDate);
    return { success: true, data: data as PrepItem[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function togglePrepCompletionAction(
  ingredientId: string | null,
  childRecipeId: string | null,
  completed: boolean,
): Promise<ActionResult<void>> {
  try {
    const userId = await getUserId();
    await mealPlanLib.togglePrepCompletion(
      userId,
      ingredientId,
      childRecipeId,
      completed,
    );
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function cloneMealAction(
  mealId: string,
  targetDate: Date,
): Promise<ActionResult<void>> {
  try {
    const userId = await getUserId();
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { mealPlan: true },
    });
    if (!meal || meal.mealPlan.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await mealPlanLib.cloneMeal(mealId, targetDate);
    revalidatePath("/meal-planner");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
