import { prisma } from "./prisma";
import {
  convert,
  canConvert,
  USDAFoodPortion,
  normalizeUnitAndQuantity,
} from "./units";
import { Macros, Recipe, RecipeSaveData } from "@/types";

const DISCRETE_DESIGNATIONS: Record<
  string,
  { singular: string; fallbackWeight: number }
> = {
  can: { singular: "can", fallbackWeight: 400 },
  cans: { singular: "can", fallbackWeight: 400 },
  packet: { singular: "packet", fallbackWeight: 10 },
  packets: { singular: "packet", fallbackWeight: 10 },
  bunch: { singular: "bunch", fallbackWeight: 100 },
  bunches: { singular: "bunch", fallbackWeight: 100 },
  sheet: { singular: "sheet", fallbackWeight: 5 },
  sheets: { singular: "sheet", fallbackWeight: 5 },
};

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

    if (
      "type" in component &&
      component.type === "ingredient" &&
      component.ingredient
    ) {
      const baseMacros = component.ingredient.baseMacros as unknown as Macros;
      if (baseMacros) {
        // USDA macros are usually per 100g or 100ml
        // We assume baseMacros are per baseAmount (default 100)
        let baseUnit = "";
        const portions = component.ingredient
          .foodPortions as unknown as USDAFoodPortion[];

        const lowerUnit = (component.unit || "").toLowerCase().trim();
        const discreteInfo = DISCRETE_DESIGNATIONS[lowerUnit];

        if (discreteInfo) {
          // It's a discrete designation!
          // Try direct match in portions
          const singularUnit = discreteInfo.singular;
          const matchingPortion = portions?.find((p) => {
            const mod = (p.modifier || "").toLowerCase();
            const meas = (p.measureUnitName || "").toLowerCase();
            return mod.includes(singularUnit) || meas.includes(singularUnit);
          });

          let totalGrams = 0;
          if (matchingPortion) {
            const amount = matchingPortion.amount || 1;
            totalGrams =
              (matchingPortion.gramWeight / amount) * component.quantity;
          } else {
            // Apply sensible fallback
            totalGrams = discreteInfo.fallbackWeight * component.quantity;
            console.warn(
              `Warning: Portion unit "${component.unit}" for ingredient "${component.ingredient.name}" matched a discrete designation, but no corresponding entry was found in USDA portions database. Applied a default average fallback of ${discreteInfo.fallbackWeight}g.`,
            );
          }

          const baseAmount = component.ingredient.baseAmount || 100;
          const ratio = totalGrams / baseAmount;
          componentMacros = {
            calories: baseMacros.calories * ratio,
            protein: baseMacros.protein * ratio,
            fat: baseMacros.fat * ratio,
            carbs: baseMacros.carbs * ratio,
          };
        } else {
          // Normal unit conversion path
          if (canConvert(component.unit, "g", portions)) {
            baseUnit = "g";
          } else if (canConvert(component.unit, "ml", portions)) {
            baseUnit = "ml";
          }

          if (baseUnit) {
            try {
              const quantityInBase = convert(
                component.quantity,
                component.unit,
                baseUnit,
                portions,
              );
              const ingredient = component.ingredient as {
                baseAmount?: number;
              };
              const baseAmount = ingredient.baseAmount || 100;
              const ratio = quantityInBase / baseAmount;
              componentMacros = {
                calories: baseMacros.calories * ratio,
                protein: baseMacros.protein * ratio,
                fat: baseMacros.fat * ratio,
                carbs: baseMacros.carbs * ratio,
              };
            } catch (e) {
              console.error(
                `Failed to convert units for macro calculation: ${e}`,
              );
              componentMacros = null;
            }
          }
        }
      }
    } else if (
      "type" in component &&
      component.type === "sub-recipe" &&
      component.childRecipe
    ) {
      let fullChildRecipe = component.childRecipe as Partial<Recipe>;
      if (!fullChildRecipe.components) {
        const fetched = await prisma.recipe.findUnique({
          where: { id: component.childRecipeId },
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
    } else {
      // Handle cases where the type might be missing (e.g. raw Prisma objects before conversion)
      // This is a safety fallback for untyped or legacy data
      const c = component as Record<string, unknown>;
      if (c.ingredient) {
        // ... safety fallback logic could go here if needed
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
  const { components, steps, tags, ...recipeData } = data;

  // Check for circular dependencies
  if (id && components) {
    const componentIds = components
      .map((c) => (c.type === "sub-recipe" ? c.childRecipeId : null))
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
    create: components?.map((c) => {
      const normalized = normalizeUnitAndQuantity(c.quantity, c.unit);
      return {
        quantity: normalized.quantity,
        unit: normalized.unit,
        ingredientId:
          c.type === "ingredient" ? c.ingredientId || undefined : undefined,
        childRecipeId:
          c.type === "sub-recipe" ? c.childRecipeId || undefined : undefined,
        prepState: c.prepState,
        needsReview: c.type === "ingredient" ? c.needsReview || false : false,
        isToTaste: !!c.isToTaste,
        isOptional: !!c.isOptional,
      };
    }),
  };

  const tagsPayload = tags
    ? {
        connectOrCreate: tags.map((tagName) => ({
          where: {
            name_userId: {
              name: tagName,
              userId: data.userId,
            },
          },
          create: {
            name: tagName,
            userId: data.userId,
          },
        })),
      }
    : undefined;

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
        tags: tags
          ? {
              set: [], // Clear existing relations
              ...tagsPayload,
            }
          : undefined,
      },
    });
  } else {
    return prisma.recipe.create({
      data: {
        ...recipeData,
        steps: stepsPayload,
        components: componentsPayload,
        tags: tagsPayload,
      },
    });
  }
}
