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
    fdcId?: number;
    baseMacros?: Macros;
    baseAmount?: number;
    foodPortions?: USDAFoodPortion[];
  };
  ingredientId?: string;
  quantity: number;
  unit: string;
  locationTags?: string[];
  restockThreshold?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let ingredientId = data.ingredientId;

  if (!ingredientId && data.ingredient) {
    const ingredient = await upsertIngredient({
      name: data.ingredient.name || data.ingredient.description,
      usdaId: data.ingredient.usdaId || data.ingredient.fdcId?.toString(),
      baseMacros: data.ingredient.baseMacros,
      baseAmount: data.ingredient.baseAmount,
      foodPortions: data.ingredient.foodPortions,
    });
    ingredientId = ingredient.id;
  }

  if (!ingredientId) throw new Error("Ingredient is required");

  await addToPantry(
    session.user.id,
    ingredientId,
    data.quantity,
    data.unit,
    data.locationTags || [],
    data.restockThreshold || 0,
  );

  revalidatePath("/dashboard/pantry");
}

export async function updatePantryItemAction(
  itemId: string,
  data: {
    quantity?: number;
    unit?: string;
    locationTags?: string[];
    restockThreshold?: number;
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

  // Fetch item first to get current quantity
  // (We could optimize this with a custom prisma update but this is safer)
  const pantry = await getPantry(session.user.id);
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

  const { checkStock } = await import("@/lib/pantry");

  const results = await Promise.all(
    components.map(async (c) => {
      if (!c.ingredientId) return { hasStock: true };
      const hasStock = await checkStock(
        session.user.id,
        c.ingredientId,
        c.quantity * scale,
        c.unit,
      );
      return { ingredientId: c.ingredientId, hasStock };
    }),
  );

  return results;
}
