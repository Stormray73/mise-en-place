import { prisma } from "./prisma";
import { convert, canConvert, USDAFoodPortion } from "./units";

export async function getPantry(userId: string) {
  return prisma.pantryItem.findMany({
    where: { userId },
    include: {
      ingredient: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function addToPantry(
  userId: string,
  ingredientId: string,
  quantity: number,
  unit: string,
  locationTags: string[] = [],
  restockThreshold: number = 0,
) {
  return prisma.pantryItem.create({
    data: {
      userId,
      ingredientId,
      quantity,
      unit,
      locationTags,
      restockThreshold,
    },
  });
}

export async function updatePantryItem(
  itemId: string,
  data: {
    quantity?: number;
    unit?: string;
    locationTags?: string[];
    restockThreshold?: number;
  },
) {
  return prisma.pantryItem.update({
    where: { id: itemId },
    data,
  });
}

export async function deletePantryItem(itemId: string) {
  return prisma.pantryItem.delete({
    where: { id: itemId },
  });
}

export async function getIngredientStock(userId: string, ingredientId: string) {
  const items = await prisma.pantryItem.findMany({
    where: { userId, ingredientId },
    include: { ingredient: true },
  });

  if (items.length === 0) return { quantity: 0, unit: "g" }; // Default to g if no items

  const baseUnit = items[0].unit;
  const portions = items[0].ingredient
    .foodPortions as unknown as USDAFoodPortion[];

  let totalQuantity = 0;
  for (const item of items) {
    if (canConvert(item.unit, baseUnit, portions)) {
      totalQuantity += convert(item.quantity, item.unit, baseUnit, portions);
    } else {
      // If we can't convert, we skip but maybe we should log a warning
      console.warn(
        `Cannot convert ${item.unit} to ${baseUnit} for ingredient ${ingredientId}`,
      );
    }
  }

  return { quantity: totalQuantity, unit: baseUnit, portions };
}

export async function deductFromPantry(
  userId: string,
  ingredientId: string,
  quantityToDeduct: number,
  unit: string,
) {
  const items = await prisma.pantryItem.findMany({
    where: { userId, ingredientId },
    include: { ingredient: true },
    orderBy: { createdAt: "asc" }, // FIFO
  });

  let remainingToDeduct = quantityToDeduct;

  for (const item of items) {
    if (remainingToDeduct <= 0) break;

    const portions = item.ingredient
      .foodPortions as unknown as USDAFoodPortion[];
    if (!canConvert(unit, item.unit, portions)) {
      console.warn(`Cannot convert ${unit} to ${item.unit} for deduction`);
      continue;
    }

    const deductionInItemUnit = convert(
      remainingToDeduct,
      unit,
      item.unit,
      portions,
    );

    if (item.quantity >= deductionInItemUnit) {
      await prisma.pantryItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity - deductionInItemUnit },
      });
      remainingToDeduct = 0;
    } else {
      await prisma.pantryItem.update({
        where: { id: item.id },
        data: { quantity: 0 },
      });
      remainingToDeduct -= convert(item.quantity, item.unit, unit, portions);
    }
  }

  if (remainingToDeduct > 0) {
    // We floored at 0 as per requirements
    console.warn(
      `Inventory discrepancy: wanted to deduct ${quantityToDeduct} ${unit} but only partially successful. ${remainingToDeduct} ${unit} remaining.`,
    );
  }
}

export async function checkStock(
  userId: string,
  ingredientId: string,
  requiredQuantity: number,
  requiredUnit: string,
) {
  const stock = await getIngredientStock(userId, ingredientId);
  if (stock.quantity === 0) return false;

  if (canConvert(requiredUnit, stock.unit, stock.portions)) {
    const stockInRequiredUnit = convert(
      stock.quantity,
      stock.unit,
      requiredUnit,
      stock.portions,
    );
    return stockInRequiredUnit >= requiredQuantity;
  }

  return false;
}

export async function deductRecipeIngredients(
  userId: string,
  recipeId: string,
  scale: number,
) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      components: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!recipe) return;

  for (const component of recipe.components) {
    if (component.ingredientId) {
      const quantity = component.quantity * scale;
      await deductFromPantry(
        userId,
        component.ingredientId,
        quantity,
        component.unit,
      );
    }
    // Note: We might want to recursively deduct sub-recipes too if they are not already deducted.
    // For now, let's keep it simple as per Story 4.
  }
}
