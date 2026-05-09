import { prisma } from "./prisma";
import { convert, canConvert } from "./units";
import { Macros, Recipe, RecipeSaveData } from "@/types";

export async function calculateMacros(
  recipe: Partial<Recipe>,
): Promise<Macros> {
  if (recipe.manualMacros) {
    return recipe.manualMacros as unknown as Macros;
  }

  const totals: Macros = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  for (const component of recipe.components || []) {
    let componentMacros: Macros | null = null;

    if (component.ingredient) {
      const baseMacros = component.ingredient.baseMacros as unknown as Macros;
      if (baseMacros) {
        // USDA macros are usually per 100g or 100ml
        // We assume baseMacros are per baseAmount (default 100)
        let baseUnit = "";
        if (canConvert(component.unit, "g")) {
          baseUnit = "g";
        } else if (canConvert(component.unit, "ml")) {
          baseUnit = "ml";
        }

        if (baseUnit) {
          const quantityInBase = convert(
            component.quantity,
            component.unit,
            baseUnit,
          );
          const ingredient = component.ingredient as { baseAmount?: number };
          const baseAmount = ingredient.baseAmount || 100;
          const ratio = quantityInBase / baseAmount;
          componentMacros = {
            calories: baseMacros.calories * ratio,
            protein: baseMacros.protein * ratio,
            fat: baseMacros.fat * ratio,
            carbs: baseMacros.carbs * ratio,
          };
        }
      }
    } else if (component.childRecipe) {
      let fullChildRecipe = component.childRecipe as Partial<Recipe>;
      if (!fullChildRecipe.components) {
        const fetched = await prisma.recipe.findUnique({
          where: { id: component.childRecipeId as string },
          include: {
            components: {
              include: {
                ingredient: true,
                childRecipe: true,
              },
            },
          },
        });
        if (fetched) fullChildRecipe = fetched as unknown as Partial<Recipe>;
      }

      if (fullChildRecipe && fullChildRecipe.yieldAmount) {
        const childMacros = await calculateMacros(fullChildRecipe);
        const ratio =
          convert(
            component.quantity,
            component.unit,
            fullChildRecipe.yieldUnit as string,
          ) / fullChildRecipe.yieldAmount;
        componentMacros = {
          calories: childMacros.calories * ratio,
          protein: childMacros.protein * ratio,
          fat: childMacros.fat * ratio,
          carbs: childMacros.carbs * ratio,
        };
      }
    }

    if (componentMacros) {
      totals.calories += componentMacros.calories;
      totals.protein += componentMacros.protein;
      totals.fat += componentMacros.fat;
      totals.carbs += componentMacros.carbs;
    }
  }

  return totals;
}

async function checkCircularDependency(
  rootId: string,
  componentIds: string[],
): Promise<boolean> {
  for (const id of componentIds) {
    if (id === rootId) return true;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: { components: true },
    });
    if (recipe) {
      const childIds = recipe.components
        .map((c) => c.childRecipeId)
        .filter((cid): cid is string => cid !== null);
      if (await checkCircularDependency(rootId, childIds)) return true;
    }
  }
  return false;
}

export async function saveRecipe(
  id: string | null,
  data: RecipeSaveData & { userId: string },
) {
  const { components, steps, ...recipeData } = data;

  // Check for circular dependencies
  if (id && components) {
    const componentIds = components
      .map((c) => c.childRecipeId)
      .filter((cid): cid is string => cid !== null && cid !== undefined);

    if (await checkCircularDependency(id, componentIds)) {
      throw new Error(
        "Circular dependency detected: This change would create a dependency loop.",
      );
    }
  }

  const stepsPayload = {
    create: steps?.map((s) => ({
      order: s.order,
      instruction: s.instruction,
      timerInSeconds: s.timerInSeconds,
    })),
  };

  const componentsPayload = {
    create: components?.map((c) => ({
      quantity: c.quantity,
      unit: c.unit,
      ingredientId: c.ingredientId || undefined,
      childRecipeId: c.childRecipeId || undefined,
    })),
  };

  if (id) {
    return prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        steps: {
          deleteMany: {},
          ...stepsPayload,
        },
        components: {
          deleteMany: {},
          ...componentsPayload,
        },
      },
    });
  } else {
    return prisma.recipe.create({
      data: {
        ...recipeData,
        steps: stepsPayload,
        components: componentsPayload,
      },
    });
  }
}
