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
import {
  upsertIngredient,
  matchIngredientFuzzy,
  cleanIngredientName,
} from "@/lib/ingredients";
import { parseQuantityUnitAndName } from "@/lib/units";
import { deductRecipeIngredients } from "@/lib/pantry";
import { scrapeRecipe } from "@/lib/scraper";
import { parseBulkRecipes, parseRecipeFromImage } from "@/lib/ai-parser";
import { extractTextFromFile } from "@/lib/file-extractor";
import { checkRecipeLimit, checkAiLimit, incrementAiUsage } from "@/lib/limits";
import { Tier, RecipeStatus } from "@prisma/client";

import {
  isR2Configured,
  uploadImage as uploadToR2,
  getPresignedUploadUrl,
  persistR2Image,
  extractR2KeyFromUrl,
} from "@/lib/r2";

export async function checkR2ConfiguredAction(): Promise<boolean> {
  return isR2Configured;
}

export async function getPresignedUploadUrlAction(
  fileName: string,
  contentType: string,
): Promise<
  ActionResult<{ uploadUrl: string; publicUrl: string; key: string }>
> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isR2Configured) {
      return { success: false, error: "Cloudflare R2 is not configured" };
    }

    const data = await getPresignedUploadUrl(fileName, contentType);
    return { success: true, data };
  } catch (err) {
    console.error("Failed to generate presigned upload URL:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
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
        components: r.ingredients.map((ing) => {
          const normalized = parseQuantityUnitAndName(
            ing.quantity,
            ing.unit,
            ing.name,
          );
          return {
            type: "ingredient" as const,
            quantity: normalized.quantity,
            unit: normalized.unit,
            ingredientId: null,
            ingredient: { name: normalized.name },
            prepState: ing.prepState,
          };
        }),
      }));
    } else if (type === "file") {
      const file = formData.get("file") as File | null;
      const imageUrlParam = formData.get("imageUrl") as string | null;
      if (!file && !imageUrlParam)
        return { success: false, error: "No file or image URL provided" };

      if (imageUrlParam || (file && file.type.startsWith("image/"))) {
        // Handle image with Vision AI
        let imageUrl = imageUrlParam;
        if (!imageUrl && file) {
          if (isR2Configured) {
            const buffer = Buffer.from(await file.arrayBuffer());
            imageUrl = await uploadToR2(buffer, file.name, file.type);
          } else {
            // Fallback to base64 for AI SDK if R2 is not configured
            const buffer = Buffer.from(await file.arrayBuffer());
            imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
          }
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
            components: r.ingredients.map((ing) => {
              const normalized = parseQuantityUnitAndName(
                ing.quantity,
                ing.unit,
                ing.name,
              );
              return {
                type: "ingredient" as const,
                quantity: normalized.quantity,
                unit: normalized.unit,
                ingredientId: null,
                ingredient: { name: normalized.name },
                prepState: ing.prepState,
              };
            }),
            imageUrl: isR2Configured ? imageUrl : null,
          },
        ];
      } else if (file) {
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
          components: r.ingredients.map((ing) => {
            const normalized = parseQuantityUnitAndName(
              ing.quantity,
              ing.unit,
              ing.name,
            );
            return {
              type: "ingredient" as const,
              quantity: normalized.quantity,
              unit: normalized.unit,
              ingredientId: null,
              ingredient: { name: normalized.name },
              prepState: ing.prepState,
            };
          }),
        }));
      }
    }

    // Fetch all of user's existing recipes first to resolve sub-recipes
    const userRecipes = await prisma.recipe.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true },
    });

    const findMatchingRecipe = (
      ingredientName: string,
      allRecipes: { id: string; title: string }[],
    ) => {
      const trimmedIng = ingredientName.trim().toLowerCase();
      const directMatch = allRecipes.find(
        (r) => r.title.trim().toLowerCase() === trimmedIng,
      );
      if (directMatch) return directMatch;

      const cleanedIng = cleanIngredientName(ingredientName);
      if (!cleanedIng) return null;
      return allRecipes.find((r) => {
        const cleanedTitle = cleanIngredientName(r.title);
        return cleanedTitle === cleanedIng;
      });
    };

    // Resolve fuzzy matching or sub-recipe matching for all imported recipe ingredients
    recipes = await Promise.all(
      recipes.map(async (recipe) => {
        const components = await Promise.all(
          recipe.components.map(async (c) => {
            if (c.type === "ingredient" && c.ingredient) {
              // 1. Check if it matches a sub-recipe
              const matchedRecipe = findMatchingRecipe(
                c.ingredient.name,
                userRecipes,
              );
              if (matchedRecipe) {
                return {
                  type: "sub-recipe" as const,
                  quantity: c.quantity,
                  unit: c.unit,
                  childRecipeId: matchedRecipe.id,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  childRecipe: { title: matchedRecipe.title } as any,
                  prepState: c.prepState,
                  isToTaste: !!c.isToTaste,
                  isOptional: !!c.isOptional,
                };
              }

              // 2. Standard fuzzy match if not a sub-recipe
              if (!c.ingredientId) {
                const match = await matchIngredientFuzzy(c.ingredient.name);
                return {
                  ...c,
                  ingredientId: match.ingredientId,
                  ingredient: {
                    ...c.ingredient,
                    ...match.ingredient,
                  },
                  needsReview: match.needsReview,
                };
              }
            }
            return c;
          }),
        );
        return {
          ...recipe,
          components,
        };
      }),
    );

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

      // Save draft recipes in DB
      const savedRecipes = await Promise.all(
        recipes.map(async (r) => {
          const componentsWithIngredients = await Promise.all(
            r.components.map(async (c) => {
              if (c.type === "ingredient" && c.ingredient && !c.ingredientId) {
                const ingredient = await upsertIngredient({
                  name: c.ingredient.name,
                  usdaId: c.ingredient.usdaId as string,
                  baseMacros: c.ingredient.baseMacros as unknown as Macros,
                  baseAmount: c.ingredient.baseAmount as unknown as number,
                  foodPortions: c.ingredient
                    .foodPortions as unknown as USDAFoodPortion[],
                });
                return {
                  ...c,
                  ingredientId: ingredient.id,
                };
              }
              return c;
            }),
          );

          const recipeData = {
            ...r,
            userId: session.user.id!,
            status: "DRAFT" as RecipeStatus,
            components: componentsWithIngredients.map((c) => ({
              ...c,
              ingredientId:
                c.type === "ingredient" ? c.ingredientId || null : null,
              childRecipeId:
                c.type === "sub-recipe" ? c.childRecipeId || null : null,
            })),
          };
          return saveRecipe(null, recipeData);
        }),
      );

      // Now fetch updated user recipes (including newly saved drafts) to perform cross-batch sub-recipe linking!
      const updatedUserRecipes = await prisma.recipe.findMany({
        where: { userId: session.user.id! },
        select: { id: true, title: true },
      });

      // Fetch newly saved recipes with their created components from DB
      const dbRecipes = await prisma.recipe.findMany({
        where: {
          id: { in: savedRecipes.map((sr) => sr.id) },
        },
        include: {
          components: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      // Update any component in database that should now link to another recipe in this batch or library
      await Promise.all(
        dbRecipes.map(async (dbRecipe) => {
          await Promise.all(
            dbRecipe.components.map(async (component) => {
              // We only want to convert it to a sub-recipe if it's currently an ingredient component
              if (component.ingredientId) {
                const ingName = component.ingredient?.name || "";
                const matchedRecipe = findMatchingRecipe(
                  ingName,
                  updatedUserRecipes,
                );
                // Exclude self reference to avoid circular dependency loop
                if (matchedRecipe && matchedRecipe.id !== dbRecipe.id) {
                  await prisma.recipeComponent.update({
                    where: { id: component.id },
                    data: {
                      ingredientId: null,
                      childRecipeId: matchedRecipe.id,
                    },
                  });
                }
              }
            }),
          );
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

    let finalImageUrl = data.imageUrl;
    if (isR2Configured && data.imageUrl) {
      const tmpKey = extractR2KeyFromUrl(data.imageUrl);
      if (tmpKey && tmpKey.startsWith("tmp/")) {
        try {
          finalImageUrl = await persistR2Image(tmpKey);
        } catch (err) {
          console.error("Failed to persist temp R2 image:", err);
        }
      }
    }

    const recipeData = {
      ...data,
      imageUrl: finalImageUrl,
      status: "PUBLISHED" as RecipeStatus,
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
