import { prisma } from "./prisma";
import { getIngredientStock } from "./pantry";
import { convert, canConvert, USDAFoodPortion } from "./units";
import { determineDepartment } from "./ingredients";

export interface ShoppingListItem {
  id?: string; // For manual items
  ingredientId?: string;
  name: string;
  requiredQuantity: number;
  availableQuantity: number;
  neededQuantity: number;
  unit: string;
  reason: "meal-plan" | "low-stock" | "manual";
  department: string;
  storeId: string | null;
  storeName: string | null;
  isRecurring: boolean;
  lastPurchasedAt?: Date | null;
}

export async function generateShoppingList(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<ShoppingListItem[]> {
  // 1. Get all meal plan ingredients in range
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
                  ingredient: {
                    include: {
                      lastPurchasedStore: true,
                    },
                  },
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
    {
      name: string;
      quantity: number;
      unit: string;
      department: string;
      storeId: string | null;
      storeName: string | null;
    }
  > = {};

  for (const meal of meals) {
    for (const pr of meal.plannedRecipes) {
      if (pr.excludeFromPrep) continue; // Respect Story 12/excludeFromPrep

      for (const component of pr.recipe.components) {
        if (component.ingredientId && component.ingredient) {
          const key = component.ingredientId;
          const quantity = component.quantity * pr.scale;

          const ingredientStore = component.ingredient.lastPurchasedStore;
          const department = component.ingredient.department || determineDepartment(component.ingredient.name);

          if (!aggregateNeeds[key]) {
            aggregateNeeds[key] = {
              name: component.ingredient.name,
              quantity,
              unit: component.unit,
              department,
              storeId: ingredientStore?.id || null,
              storeName: ingredientStore?.name || null,
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
    include: {
      ingredient: {
        include: {
          lastPurchasedStore: true,
        },
      },
    },
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
        department: need.department,
        storeId: need.storeId,
        storeName: need.storeName,
        isRecurring: false,
      };
    }
  }

  // 4. Add items below restock threshold
  const thresholdNeeds: Record<
    string,
    {
      name: string;
      deficit: number;
      unit: string;
      department: string;
      storeId: string | null;
      storeName: string | null;
    }
  > = {};

  for (const item of pantryItems) {
    const stock = await getIngredientStock(userId, item.ingredientId);
    if (stock.quantity < item.restockThreshold) {
      const deficit = item.restockThreshold - stock.quantity;
      if (deficit > 0) {
        if (!thresholdNeeds[item.ingredientId]) {
          const ingredientStore = item.ingredient.lastPurchasedStore;
          const department = item.ingredient.department || determineDepartment(item.ingredient.name);
          thresholdNeeds[item.ingredientId] = {
            name: item.ingredient.name,
            deficit: convert(deficit, item.unit, item.unit, stock.portions),
            unit: item.unit,
            department,
            storeId: ingredientStore?.id || null,
            storeName: ingredientStore?.name || null,
          };
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
        availableQuantity: 0,
        neededQuantity: threshold.deficit,
        unit: threshold.unit,
        reason: "low-stock",
        department: threshold.department,
        storeId: threshold.storeId,
        storeName: threshold.storeName,
        isRecurring: false,
      };
    }
  }

  // 5. Add manual items
  const manualItems = await prisma.manualShoppingItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { store: true },
  });

  const results: ShoppingListItem[] = [];

  for (const item of manualItems) {
    // Filter out recurring items whose lastPurchasedAt is within or after the current viewing window (startDate)
    if (item.isRecurring && item.lastPurchasedAt && item.lastPurchasedAt >= startDate) {
      continue;
    }

    results.push({
      id: item.id,
      name: item.name,
      requiredQuantity: item.quantity,
      availableQuantity: 0,
      neededQuantity: item.quantity,
      unit: item.unit || "item",
      reason: "manual",
      department: determineDepartment(item.name),
      storeId: item.storeId,
      storeName: item.store?.name || null,
      isRecurring: item.isRecurring,
      lastPurchasedAt: item.lastPurchasedAt,
    });
  }

  for (const item of Object.values(shoppingList)) {
    results.push(item);
  }

  return results;
}

export async function addManualShoppingItem(
  userId: string,
  name: string,
  quantity: number = 1,
  unit?: string,
  isRecurring: boolean = false,
  storeId?: string | null,
) {
  return prisma.manualShoppingItem.create({
    data: {
      userId,
      name,
      quantity,
      unit,
      isRecurring,
      storeId: storeId || null,
    },
  });
}

export async function deleteManualShoppingItem(id: string, userId: string) {
  return prisma.manualShoppingItem.deleteMany({
    where: {
      id,
      userId,
    },
  });
}

export async function completeShop(
  userId: string,
  storeId: string | null,
  items: {
    id?: string; // Manual item ID
    ingredientId?: string;
    quantity: number;
    unit: string;
    reason: "meal-plan" | "low-stock" | "manual";
  }[]
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (item.reason === "manual" && item.id) {
        // Handle manual items
        const manualItem = await tx.manualShoppingItem.findUnique({
          where: { id: item.id, userId },
        });
        if (manualItem) {
          if (manualItem.isRecurring) {
            // Update lastPurchasedAt and storeId
            await tx.manualShoppingItem.update({
              where: { id: item.id },
              data: {
                lastPurchasedAt: new Date(),
                storeId: storeId || undefined,
              },
            });
          } else {
            // Delete non-recurring items
            await tx.manualShoppingItem.delete({
              where: { id: item.id },
            });
          }
        }
      } else if (item.ingredientId) {
        // Handle ingredient-based items
        if (storeId) {
          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: { lastPurchasedStoreId: storeId },
          });
        }

        // Add item to pantry
        const existingPantryItem = await tx.pantryItem.findFirst({
          where: { userId, ingredientId: item.ingredientId },
          include: { ingredient: true },
        });

        if (existingPantryItem) {
          const portions = existingPantryItem.ingredient.foodPortions as unknown as USDAFoodPortion[];
          let qtyToAdd = item.quantity;
          if (canConvert(item.unit, existingPantryItem.unit, portions)) {
            qtyToAdd = convert(item.quantity, item.unit, existingPantryItem.unit, portions);
          }
          await tx.pantryItem.update({
            where: { id: existingPantryItem.id },
            data: {
              quantity: existingPantryItem.quantity + qtyToAdd,
            },
          });
        } else {
          await tx.pantryItem.create({
            data: {
              userId,
              ingredientId: item.ingredientId,
              quantity: item.quantity,
              unit: item.unit,
            },
          });
        }
      }
    }
  });
}
