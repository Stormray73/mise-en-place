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
import {
  parseRecipe,
  parseBulkRecipes,
  parseRecipeFromImage,
} from "@/lib/ai-parser";
import { extractTextFromFile } from "@/lib/file-extractor";
import { checkRecipeLimit, checkAiLimit, incrementAiUsage } from "@/lib/limits";
import { Tier, RecipeStatus } from "@prisma/client";

import { isR2Configured, uploadImage as uploadToR2 } from "@/lib/r2";

export async function checkR2ConfiguredAction(): Promise<boolean> {
  return isR2Configured;
}

export async function importRecipeAction(
  formData: FormData,
): Promise<
  ActionResult<{ recipes: RecipeSaveData[]; type: "single" | "bulk" }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const type = formData.get("type") as string; // 'url', 'text', 'file'
    let recipes: RecipeSaveData[] = [];

    // Check AI usage limit
    const aiCheck = await checkAiLimit(
      session.user.id,
      session.user.tier as Tier,
    );
    if (!aiCheck.allowed) {
      return { success: false, error: aiCheck.error || "AI limit reached" };
    }

    if (type === "url") {
      const url = formData.get("url") as string;
      const data = await scrapeRecipe(url);
      recipes = [data];
    } else if (type === "text") {
      const text = formData.get("text") as string;
      const parsedRecipes = await parseBulkRecipes(text);
      recipes = parsedRecipes.map((r) => ({
        title: r.title,
        yieldAmount: r.yieldAmount,
        yieldUnit: r.yieldUnit,
        servings: r.servings,
        steps: r.steps.map((s, i) => ({
          order: i + 1,
          instruction: s.instruction,
          timerInSeconds: s.timerInSeconds,
        })),
        components: r.ingredients.map((ing) => ({
          type: "ingredient" as const,
          quantity: ing.quantity,
          unit: ing.unit,
          ingredientId: null,
          ingredient: { name: ing.name },
          prepState: ing.prepState,
        })),
      }));
    } else if (type === "file") {
      const file = formData.get("file") as File;
      if (!file) return { success: false, error: "No file provided" };

      if (file.type.startsWith("image/")) {
        // Handle image with Vision AI
        // First upload to R2 if configured, or use base64 (AI SDK supports both)
        // For simplicity with AI SDK, we'll use base64 or a temp URL if we had one.
        // Actually uploadToR2 is already there.
        let imageUrl: string | undefined;
        if (isR2Configured) {
          const buffer = Buffer.from(await file.arrayBuffer());
          imageUrl = await uploadToR2(buffer, file.name, file.type);
        } else {
          // Fallback to base64 for AI SDK if R2 is not configured
          const buffer = Buffer.from(await file.arrayBuffer());
          imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
        }

        const r = await parseRecipeFromImage(imageUrl!);
        recipes = [
          {
            title: r.title,
            yieldAmount: r.yieldAmount,
            yieldUnit: r.yieldUnit,
            servings: r.servings,
            steps: r.steps.map((s, i) => ({
              order: i + 1,
              instruction: s.instruction,
              timerInSeconds: s.timerInSeconds,
            })),
            components: r.ingredients.map((ing) => ({
              type: "ingredient" as const,
              quantity: ing.quantity,
              unit: ing.unit,
              ingredientId: null,
              ingredient: { name: ing.name },
              prepState: ing.prepState,
            })),
            imageUrl: isR2Configured ? imageUrl : null,
          },
        ];
      } else {
        // Handle document extraction
        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await extractTextFromFile(buffer, file.type);
        const parsedRecipes = await parseBulkRecipes(text);
        recipes = parsedRecipes.map((r) => ({
          title: r.title,
          yieldAmount: r.yieldAmount,
          yieldUnit: r.yieldUnit,
          servings: r.servings,
          steps: r.steps.map((s, i) => ({
            order: i + 1,
            instruction: s.instruction,
            timerInSeconds: s.timerInSeconds,
          })),
          components: r.ingredients.map((ing) => ({
            type: "ingredient" as const,
            quantity: ing.quantity,
            unit: ing.unit,
            ingredientId: null,
            ingredient: { name: ing.name },
            prepState: ing.prepState,
          })),
        }));
      }
    }

    // Increment AI usage
    await incrementAiUsage(session.user.id);

    // If bulk (more than 1), save as drafts automatically
    if (recipes.length > 1) {
      // Check recipe limits for all
      const limitCheck = await checkRecipeLimit(
        session.user.id,
        session.user.tier as Tier,
      );
      if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.error || "Limit exceeded" };
      }

      const savedDrafts = await Promise.all(
        recipes.map(async (r) => {
          const recipeData = {
            ...r,
            userId: session.user.id!,
            status: "DRAFT" as RecipeStatus,
            components: r.components.map((c) => ({
              ...c,
              ingredientId: null,
              childRecipeId: null,
            })),
          };
          return saveRecipe(null, recipeData);
        }),
      );

      revalidatePath("/recipes");
      revalidatePath("/dashboard");
      return { success: true, data: { recipes: recipes, type: "bulk" } };
    }

    return { success: true, data: { recipes: recipes, type: "single" } };
  } catch (error) {
    console.error("Import recipe error:", error);
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
  // ... existing code ...
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

    // Check recipe limit for new recipes
    if (!data.id) {
      const limitCheck = await checkRecipeLimit(
        session.user.id,
        session.user.tier as Tier,
      );
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.error || "Recipe limit reached",
        };
      }
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
