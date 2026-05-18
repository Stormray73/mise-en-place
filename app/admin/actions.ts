"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types";
import { Tier, Role } from "@prisma/client";

export async function updateUserTierAction(
  userId: string,
  tier: Tier,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { tier },
    });

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update user tier error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: Role,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Prevent self-demotion if desired, but for now we allow it
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update user role error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function getAdminStatsAction(): Promise<
  ActionResult<{ totalAiUsage: number; totalUsers: number }>
> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const totalUsers = await prisma.user.count();
    const aggregate = await prisma.user.aggregate({
      _sum: {
        aiUsageCount: true,
      },
    });

    return {
      success: true,
      data: {
        totalAiUsage: aggregate._sum.aiUsageCount || 0,
        totalUsers,
      },
    };
  } catch (error) {
    console.error("Get admin stats error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
