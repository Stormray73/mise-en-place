"use server";

import { auth } from "@/auth";
import {
  generateShoppingList,
  addManualShoppingItem,
  deleteManualShoppingItem,
} from "@/lib/shopping-list";
import { addToPantry } from "@/lib/pantry";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types";

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
  revalidatePath("/dashboard");
}

export async function addManualShoppingItemAction(
  name: string,
  quantity: number = 1,
  unit?: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await addManualShoppingItem(session.user.id, name, quantity, unit);

    revalidatePath("/dashboard/shopping-list");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteManualShoppingItemAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await deleteManualShoppingItem(id, session.user.id);

    revalidatePath("/dashboard/shopping-list");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
