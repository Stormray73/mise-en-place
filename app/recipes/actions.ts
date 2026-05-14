/**
 * @file app/recipes/actions.ts
 * @responsibility Server actions for recipe management (save, delete).
 * @dependencies auth, lib/recipes, prisma, types
 */

"use server";

import { auth } from "@/auth";
import { saveRecipe } from "@/lib/recipes";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { RecipeSaveData, Macros, Recipe, ActionResult } from "@/types";
import { Prisma } from "@prisma/client";

export async function saveRecipeAction(
  data: RecipeSaveData,
): Promise<ActionResult<Recipe>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Ensure all ingredients exist in the database
    // The UI sends ingredient data, but Prisma needs ingredientId
    const componentsWithIngredients = await Promise.all(
      data.components.map(async (comp) => {
        if (
          comp.type === "ingredient" &&
          comp.ingredient &&
          !comp.ingredientId
        ) {
          // Upsert ingredient
          const baseMacros = comp.ingredient.baseMacros as unknown as Macros;
          const baseAmount = comp.ingredient.baseAmount as unknown as number;

          const ingredient = await prisma.ingredient.upsert({
            where: { usdaId: comp.ingredient.usdaId as string },
            update: {
              name: comp.ingredient.name,
              baseMacros: baseMacros as unknown as Prisma.InputJsonValue,
              baseAmount: baseAmount,
            },
            create: {
              name: comp.ingredient.name,
              usdaId: comp.ingredient.usdaId,
              baseMacros: baseMacros as unknown as Prisma.InputJsonValue,
              baseAmount: baseAmount,
            },
          });
          return {
            ...comp,
            ingredientId: ingredient.id,
          };
        }
        return comp;
      }),
    );

    const recipeData = {
      ...data,
      userId: session.user.id,
      components: componentsWithIngredients.map((c) => ({
        ...c,
        ingredientId: c.type === "ingredient" ? c.ingredientId : null,
        childRecipeId: c.type === "sub-recipe" ? c.childRecipeId : null,
      })),
    };

    const recipe = await saveRecipe(data.id || null, recipeData);

    revalidatePath("/recipes");
    revalidatePath("/dashboard");
    return { success: true, data: recipe as unknown as Recipe };
  } catch (error) {
    console.error("Save recipe error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function deleteRecipeAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!recipe || recipe.userId !== session.user.id) {
      return { success: false, error: "Recipe not found or unauthorized" };
    }

    await prisma.recipe.delete({
      where: { id },
    });

    revalidatePath("/recipes");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete recipe error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
