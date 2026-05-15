"use server";

import { auth } from "@/auth";
import { generateShoppingList } from "@/lib/shopping-list";
import { addToPantry } from "@/lib/pantry";
import { revalidatePath } from "next/cache";

export async function getShoppingListAction(startDate: Date, endDate: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return generateShoppingList(session.user.id, startDate, endDate);
}

export async function purchaseItemAction(
  ingredientId: string,
  quantity: number,
  unit: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // For now, we just add it to the pantry.
  // In a more complex system, we might want to update an existing item or ask for a location.
  // We'll default to "Purchased" location tag.
  await addToPantry(session.user.id, ingredientId, quantity, unit, [
    "Purchased",
  ]);

  revalidatePath("/dashboard/pantry");
  revalidatePath("/dashboard/shopping-list");
}
