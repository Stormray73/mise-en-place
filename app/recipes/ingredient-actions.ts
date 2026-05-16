"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult, Macros } from "@/types";

import { Prisma } from "@prisma/client";

export interface CustomIngredientSaveData {
  id?: string;
  name: string;
  baseAmount: number;
  unit: string;
  macros: Macros;
}

export async function saveCustomIngredientAction(
  data: CustomIngredientSaveData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { id, name, baseAmount, unit, macros } = data;

    if (!name || name.trim() === "") {
      return { success: false, error: "Name is required" };
    }

    if (baseAmount <= 0) {
      return { success: false, error: "Base amount must be positive" };
    }

    const foodPortions = [
      {
        amount: baseAmount,
        measureUnitName: unit,
        modifier: "",
        gramWeight: baseAmount,
      },
    ];

    if (id) {
      const existing = await prisma.ingredient.findUnique({
        where: { id },
      });

      if (!existing || existing.userId !== session.user.id) {
        return {
          success: false,
          error: "Ingredient not found or unauthorized",
        };
      }

      await prisma.ingredient.update({
        where: { id },
        data: {
          name,
          baseAmount,
          baseMacros: macros as unknown as Prisma.InputJsonValue,
          foodPortions: foodPortions as unknown as Prisma.InputJsonValue,
        },
      });

      revalidatePath("/dashboard/pantry");
      return { success: true, data: { id } };
    } else {
      const created = await prisma.ingredient.create({
        data: {
          name,
          baseAmount,
          baseMacros: macros as unknown as Prisma.InputJsonValue,
          foodPortions: foodPortions as unknown as Prisma.InputJsonValue,
          userId: session.user.id,
        },
      });

      revalidatePath("/dashboard/pantry");
      return { success: true, data: { id: created.id } };
    }
  } catch (error) {
    console.error("Save custom ingredient error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteCustomIngredientAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        components: true,
      },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Ingredient not found or unauthorized" };
    }

    if (existing.components.length > 0) {
      return {
        success: false,
        error: "Cannot delete ingredient because it is used in recipes.",
      };
    }

    await prisma.ingredient.delete({
      where: { id },
    });

    revalidatePath("/dashboard/pantry");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete custom ingredient error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
