import { prisma } from "./prisma";
import { getIngredientStock } from "./pantry";
import { convert, canConvert, USDAFoodPortion } from "./units";

export interface ShoppingListItem {
  ingredientId: string;
  name: string;
  requiredQuantity: number;
  availableQuantity: number;
  neededQuantity: number;
  unit: string;
  reason: "meal-plan" | "low-stock" | "manual";
}

export async function generateShoppingList(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<ShoppingListItem[]> {
  // 1. Get all meal plan ingredients in range
  // We use getWeeklyMealPlan but we might need a more flexible one or just call it multiple times
  // Actually, let's just query meals directly for simplicity here
  const meals = await prisma.meal.findMany({
    where: {
      mealPlan: { userId },
      date: { gte: startDate, lte: endDate },
    },
    include: {
      plannedRecipes: {
        include: {
          recipe: {
            include: {
              components: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const aggregateNeeds: Record<
    string,
    { name: string; quantity: number; unit: string }
  > = {};

  for (const meal of meals) {
    for (const pr of meal.plannedRecipes) {
      for (const component of pr.recipe.components) {
        if (component.ingredientId && component.ingredient) {
          const key = component.ingredientId;
          const quantity = component.quantity * pr.scale;

          if (!aggregateNeeds[key]) {
            aggregateNeeds[key] = {
              name: component.ingredient.name,
              quantity,
              unit: component.unit,
            };
          } else {
            const portions = component.ingredient
              .foodPortions as unknown as USDAFoodPortion[];
            if (
              canConvert(component.unit, aggregateNeeds[key].unit, portions)
            ) {
              aggregateNeeds[key].quantity += convert(
                quantity,
                component.unit,
                aggregateNeeds[key].unit,
                portions,
              );
            } else {
              // Different unit category, add as separate item or log?
              // For shopping list, we'll just keep the first unit for now
              console.warn(
                `Unit mismatch for ${component.ingredient.name} in shopping list`,
              );
            }
          }
        }
      }
    }
  }

  // 2. Get all pantry items for this user
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
    include: { ingredient: true },
  });

  const shoppingList: Record<string, ShoppingListItem> = {};

  // 3. Process meal plan needs vs stock
  for (const [ingredientId, need] of Object.entries(aggregateNeeds)) {
    const stock = await getIngredientStock(userId, ingredientId);

    let availableInNeedUnit = 0;
    if (canConvert(stock.unit, need.unit, stock.portions)) {
      availableInNeedUnit = convert(
        stock.quantity,
        stock.unit,
        need.unit,
        stock.portions,
      );
    }

    const deficit = Math.max(0, need.quantity - availableInNeedUnit);

    if (deficit > 0) {
      shoppingList[ingredientId] = {
        ingredientId,
        name: need.name,
        requiredQuantity: need.quantity,
        availableQuantity: availableInNeedUnit,
        neededQuantity: deficit,
        unit: need.unit,
        reason: "meal-plan",
      };
    }
  }

  // 4. Add items below restock threshold

  // Aggregate threshold items
  const thresholdNeeds: Record<
    string,
    { name: string; deficit: number; unit: string }
  > = {};

  for (const item of pantryItems) {
    const stock = await getIngredientStock(userId, item.ingredientId);
    if (stock.quantity < item.restockThreshold) {
      const deficit = item.restockThreshold - stock.quantity;
      if (deficit > 0) {
        if (!thresholdNeeds[item.ingredientId]) {
          thresholdNeeds[item.ingredientId] = {
            name: item.ingredient.name,
            deficit: convert(deficit, item.unit, item.unit, stock.portions), // Deficit in item's unit
            unit: item.unit,
          };
        } else {
          // Already processing this ingredient, maybe aggregate thresholds?
          // Usually one ingredient has one threshold if we are careful, but let's be safe.
        }
      }
    }
  }

  for (const [ingredientId, threshold] of Object.entries(thresholdNeeds)) {
    if (!shoppingList[ingredientId]) {
      shoppingList[ingredientId] = {
        ingredientId,
        name: threshold.name,
        requiredQuantity: 0,
        availableQuantity: 0, // Not accurately tracked here, but neededQuantity is what matters
        neededQuantity: threshold.deficit,
        unit: threshold.unit,
        reason: "low-stock",
      };
    }
  }

  return Object.values(shoppingList);
}
