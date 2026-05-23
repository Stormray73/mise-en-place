"use server";

import { auth } from "@/auth";
import {
  generateShoppingList,
  addManualShoppingItem,
  deleteManualShoppingItem,
  completeShop,
} from "@/lib/shopping-list";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types";
import { prisma } from "@/lib/prisma";

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

  // We can delegate to completeShop with a single item
  await completeShop(session.user.id, null, [
    {
      ingredientId,
      quantity,
      unit,
      reason: "meal-plan", // default fallback
    },
  ]);

  revalidatePath("/dashboard/pantry");
  revalidatePath("/dashboard/shopping-list");
  revalidatePath("/dashboard");
}

export async function addManualShoppingItemAction(
  name: string,
  quantity: number = 1,
  unit?: string,
  isRecurring: boolean = false,
  storeId?: string | null,
  recurringInterval?: string | null,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await addManualShoppingItem(
      session.user.id,
      name,
      quantity,
      unit,
      isRecurring,
      storeId,
      recurringInterval,
    );

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

export async function completeShopAction(
  storeId: string | null,
  items: {
    id?: string;
    ingredientId?: string;
    quantity: number;
    unit: string;
    reason: "meal-plan" | "low-stock" | "manual";
  }[],
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await completeShop(session.user.id, storeId, items);

    revalidatePath("/dashboard/pantry");
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

export async function getStoresAction(): Promise<
  ActionResult<{ id: string; name: string }[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const stores = await prisma.store.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: stores };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createStoreAction(
  name: string,
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const store = await prisma.store.create({
      data: {
        name,
        userId: session.user.id,
      },
      select: { id: true, name: true },
    });

    revalidatePath("/dashboard/shopping-list");
    return { success: true, data: store };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteStoreAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.store.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard/shopping-list");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function assignStoreToIngredientAction(
  ingredientId: string,
  storeId: string | null,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        lastPurchasedStoreId: storeId,
      },
    });

    revalidatePath("/dashboard/shopping-list");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function assignStoreToManualItemAction(
  manualItemId: string,
  storeId: string | null,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.manualShoppingItem.update({
      where: { id: manualItemId, userId: session.user.id },
      data: {
        storeId,
      },
    });

    revalidatePath("/dashboard/shopping-list");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
