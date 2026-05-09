"use server";

import { auth } from "@/auth";
import { saveRecipe } from "@/lib/recipes";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecipeSaveData, Macros } from "@/types";
import { Prisma } from "@prisma/client";

export async function saveRecipeAction(data: RecipeSaveData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ensure all ingredients exist in the database
  // The UI sends ingredient data, but Prisma needs ingredientId
  const componentsWithIngredients = await Promise.all(
    data.components.map(async (comp) => {
      if (comp.ingredient && !comp.ingredientId) {
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
    components: componentsWithIngredients,
  };

  const recipe = await saveRecipe(data.id || null, recipeData);

  redirect(`/dashboard`); // Or to the new recipe page
  return recipe;
}
