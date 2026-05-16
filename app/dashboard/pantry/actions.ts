"use server";

import { auth } from "@/auth";
import {
  getPantry,
  addToPantry,
  updatePantryItem,
  deletePantryItem,
} from "@/lib/pantry";
import { upsertIngredient } from "@/lib/ingredients";
import { revalidatePath } from "next/cache";

import { Macros } from "@/types";
import { USDAFoodPortion } from "@/lib/units";

export async function addToPantryAction(data: {
  ingredient?: {
    name?: string;
    description?: string;
    usdaId?: string;
    fdcId?: number | string;
    baseMacros?: Macros | null;
    baseAmount?: number | null;
    foodPortions?: USDAFoodPortion[] | null;
  };
  ingredientId?: string;
  quantity: number;
  unit: string;
  locationId?: string;
  restockThreshold?: number;
  packageQuantity?: number;
  packageSize?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let ingredientId = data.ingredientId;

  if (!ingredientId && data.ingredient) {
    const ingredient = await upsertIngredient({
      name: (data.ingredient.name || data.ingredient.description) as string,
      usdaId: data.ingredient.usdaId || data.ingredient.fdcId?.toString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      baseMacros: data.ingredient.baseMacros as any,
      baseAmount: (data.ingredient.baseAmount === null
        ? undefined
        : data.ingredient.baseAmount) as number | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      foodPortions: data.ingredient.foodPortions as any,
    });
    ingredientId = ingredient.id;
  }

  if (!ingredientId) throw new Error("Ingredient is required");

  await addToPantry(
    session.user.id,
    ingredientId,
    data.quantity,
    data.unit,
    data.locationId,
    data.restockThreshold || 0,
    data.packageQuantity,
    data.packageSize,
  );

  revalidatePath("/dashboard/pantry");
}

export async function updatePantryItemAction(
  itemId: string,
  data: {
    quantity?: number;
    unit?: string;
    locationId?: string;
    restockThreshold?: number;
    packageQuantity?: number;
    packageSize?: number;
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await updatePantryItem(itemId, data);
  revalidatePath("/dashboard/pantry");
}

export async function deletePantryItemAction(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await deletePantryItem(itemId);
  revalidatePath("/dashboard/pantry");
}

export async function decrementPantryItemAction(
  itemId: string,
  amount: number,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Fetch item first to get current quantity
  // (We could optimize this with a custom prisma update but this is safer)
  const pantry = await getPantry(userId);
  const item = pantry.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");

  const newQuantity = Math.max(0, item.quantity - amount);
  await updatePantryItem(itemId, { quantity: newQuantity });

  revalidatePath("/dashboard/pantry");
}

export async function checkRecipeStockAction(
  components: { ingredientId: string | null; quantity: number; unit: string }[],
  scale: number,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { checkStock } = await import("@/lib/pantry");

  const results = await Promise.all(
    components.map(async (c) => {
      if (!c.ingredientId) return { hasStock: true };
      const hasStock = await checkStock(
        userId,
        c.ingredientId,
        c.quantity * scale,
        c.unit,
      );
      return { ingredientId: c.ingredientId, hasStock };
    }),
  );

  return results;
}
