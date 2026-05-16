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
import {
  RecipeSaveData,
  Macros,
  Recipe,
  ActionResult,
  USDAFoodPortion,
} from "@/types";
import { upsertIngredient } from "@/lib/ingredients";
import { deductRecipeIngredients } from "@/lib/pantry";
import { scrapeRecipe } from "@/lib/scraper";

export async function scrapeRecipeAction(
  url: string,
): Promise<ActionResult<RecipeSaveData>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const recipeData = await scrapeRecipe(url);
    return { success: true, data: recipeData };
  } catch (error) {
    console.error("Scrape recipe error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function deductRecipeIngredientsAction(
  recipeId: string,
  scale: number,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await deductRecipeIngredients(session.user.id, recipeId, scale);

    revalidatePath("/dashboard/pantry");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Deduct recipe ingredients error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function toggleFavoriteAction(
  id: string,
  isFavorite: boolean,
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

    await prisma.recipe.update({
      where: { id },
      data: { isFavorite },
    });

    revalidatePath("/recipes");
    revalidatePath("/dashboard");
    revalidatePath(`/recipes/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function getTagsAction(): Promise<ActionResult<string[]>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      select: { name: true },
    });

    return { success: true, data: tags.map((t) => t.name) };
  } catch (error) {
    console.error("Get tags error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

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
          const ingredient = await upsertIngredient({
            name: comp.ingredient.name,
            usdaId: comp.ingredient.usdaId as string,
            baseMacros: comp.ingredient.baseMacros as unknown as Macros,
            baseAmount: comp.ingredient.baseAmount as unknown as number,
            foodPortions: comp.ingredient
              .foodPortions as unknown as USDAFoodPortion[],
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
