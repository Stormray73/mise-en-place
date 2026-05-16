/**
 * @file app/dashboard/pantry/location-actions.ts
 * @responsibility Server actions for managed pantry locations.
 */

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult, PantryLocation } from "@/types";

export async function getLocationsAction(): Promise<
  ActionResult<PantryLocation[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const locations = await prisma.pantryLocation.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });

    return { success: true, data: locations as unknown as PantryLocation[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createLocationAction(
  name: string,
): Promise<ActionResult<PantryLocation>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const normalizedName = name.trim();
    if (!normalizedName) return { success: false, error: "Name is required" };

    const existing = await prisma.pantryLocation.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: normalizedName, mode: "insensitive" },
      },
    });

    if (existing) {
      return { success: false, error: "Location already exists" };
    }

    const location = await prisma.pantryLocation.create({
      data: {
        userId: session.user.id,
        name: normalizedName,
      },
    });

    revalidatePath("/dashboard/pantry");
    return { success: true, data: location as unknown as PantryLocation };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteLocationAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.pantryLocation.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard/pantry");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
