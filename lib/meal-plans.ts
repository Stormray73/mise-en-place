import { prisma } from "./prisma";
import { convert, canConvert } from "./units";
import { calculateMacros } from "./recipes";

export async function getMealPlan(userId: string) {
  let mealPlan = await prisma.mealPlan.findFirst({
    where: { userId },
  });

  if (!mealPlan) {
    mealPlan = await prisma.mealPlan.create({
      data: { userId },
    });
  }

  return mealPlan;
}

export async function createMeal(mealPlanId: string, date: Date, slot: string) {
  return prisma.meal.create({
    data: {
      mealPlanId,
      date,
      slot,
    },
  });
}

export async function addRecipeToMeal(
  mealId: string,
  recipeId: string,
  scale: number = 1.0,
  prepState?: string,
) {
  return prisma.plannedRecipe.create({
    data: {
      mealId,
      recipeId,
      scale,
      prepState,
    },
  });
}

export async function getWeeklyMealPlan(userId: string, startDate: Date) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const mealPlan = await getMealPlan(userId);

  const meals = await prisma.meal.findMany({
    where: {
      mealPlanId: mealPlan.id,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      plannedRecipes: {
        include: {
          recipe: {
            include: {
              components: {
                include: {
                  ingredient: true,
                  childRecipe: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Calculate macros for each meal
  return Promise.all(
    meals.map(async (meal) => {
      const mealMacros = { calories: 0, protein: 0, fat: 0, carbs: 0 };

      for (const pr of meal.plannedRecipes) {
        const recipeMacros = await calculateMacros(pr.recipe);
        mealMacros.calories += recipeMacros.calories * pr.scale;
        mealMacros.protein += recipeMacros.protein * pr.scale;
        mealMacros.fat += recipeMacros.fat * pr.scale;
        mealMacros.carbs += recipeMacros.carbs * pr.scale;
      }

      return { ...meal, macros: mealMacros };
    }),
  );
}

export async function deleteMeal(mealId: string) {
  return prisma.meal.delete({
    where: { id: mealId },
  });
}

export async function updatePlannedRecipe(
  plannedRecipeId: string,
  data: { scale?: number; prepState?: string },
) {
  return prisma.plannedRecipe.update({
    where: { id: plannedRecipeId },
    data,
  });
}

export async function removeRecipeFromMeal(plannedRecipeId: string) {
  return prisma.plannedRecipe.delete({
    where: { id: plannedRecipeId },
  });
}

export async function setLeftoverSource(
  plannedRecipeId: string,
  isSource: boolean,
) {
  return prisma.plannedRecipe.update({
    where: { id: plannedRecipeId },
    data: { isLeftoverSource: isSource },
  });
}

export async function linkLeftoverConsumption(
  plannedRecipeId: string,
  sourcePlannedRecipeId: string | null,
) {
  return prisma.plannedRecipe.update({
    where: { id: plannedRecipeId },
    data: { sourcePlannedRecipeId },
  });
}

// Internal helper for recursive ingredient aggregation
async function aggregateRecipe(
  recipeId: string,
  multiplier: number,
  aggregator: {
    [key: string]: {
      id: string;
      type: "ingredient" | "recipe";
      name: string;
      quantity: number;
      unit: string;
      prepState?: string;
    };
  },
) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      components: {
        include: {
          ingredient: true,
          childRecipe: true,
        },
      },
    },
  });

  if (!recipe) return;

  for (const component of recipe.components) {
    if (component.ingredient) {
      const ingredient = component.ingredient;
      const key = `${ingredient.id}_${component.prepState || "raw"}`;

      let quantity = component.quantity * multiplier;
      let unit = component.unit;

      const targetUnit = unit.toLowerCase().includes("g")
        ? "g"
        : unit.toLowerCase().includes("ml")
          ? "ml"
          : unit;
      if (unit !== targetUnit && canConvert(unit, targetUnit)) {
        quantity = convert(quantity, unit, targetUnit);
        unit = targetUnit;
      }

      if (!aggregator[key]) {
        aggregator[key] = {
          id: ingredient.id,
          type: "ingredient",
          name: ingredient.name,
          quantity: 0,
          unit: unit,
          prepState: component.prepState || undefined,
        };
      } else {
        if (
          aggregator[key].unit !== unit &&
          canConvert(unit, aggregator[key].unit)
        ) {
          aggregator[key].quantity += convert(
            quantity,
            unit,
            aggregator[key].unit,
          );
        } else {
          aggregator[key].quantity += quantity;
        }
      }
    } else if (component.childRecipeId) {
      await aggregateRecipe(
        component.childRecipeId,
        multiplier * (component.quantity / (recipe.yieldAmount || 1)),
        aggregator,
      );
    }
  }
}

export async function getPrepAheadData(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const plannedRecipes = await prisma.plannedRecipe.findMany({
    where: {
      meal: {
        mealPlan: { userId },
        date: { gte: startDate, lte: endDate },
      },
      sourcePlannedRecipeId: null,
    },
    include: {
      recipe: true,
    },
  });

  const aggregator: {
    [key: string]: {
      id: string;
      type: "ingredient" | "recipe";
      name: string;
      quantity: number;
      unit: string;
      prepState?: string;
    };
  } = {};

  for (const pr of plannedRecipes) {
    await aggregateRecipe(pr.recipeId, pr.scale, aggregator);
  }

  // Fetch completions
  const completions = await prisma.prepCompletion.findMany({
    where: { userId },
  });

  return Object.values(aggregator).map((item) => ({
    ...item,
    completed: completions.some(
      (c) =>
        (item.type === "ingredient" && c.ingredientId === item.id) ||
        (item.type === "recipe" && c.childRecipeId === item.id),
    ),
  }));
}

export async function togglePrepCompletion(
  userId: string,
  ingredientId: string | null,
  childRecipeId: string | null,
  completed: boolean,
) {
  if (completed) {
    return prisma.prepCompletion.create({
      data: {
        userId,
        ingredientId,
        childRecipeId,
        completed: true,
      },
    });
  } else {
    return prisma.prepCompletion.deleteMany({
      where: {
        userId,
        ingredientId,
        childRecipeId,
      },
    });
  }
}

export async function cloneMeal(mealId: string, targetDate: Date) {
  const sourceMeal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: { plannedRecipes: true },
  });

  if (!sourceMeal) throw new Error("Source meal not found");

  const newMeal = await prisma.meal.create({
    data: {
      mealPlanId: sourceMeal.mealPlanId,
      date: targetDate,
      slot: sourceMeal.slot,
      plannedRecipes: {
        create: sourceMeal.plannedRecipes.map((pr) => ({
          recipeId: pr.recipeId,
          scale: pr.scale,
          prepState: pr.prepState,
          isLeftoverSource: pr.isLeftoverSource,
          // We don't clone sourcePlannedRecipeId or consumedLeftovers for now to avoid complexity
        })),
      },
    },
  });

  return newMeal;
}
