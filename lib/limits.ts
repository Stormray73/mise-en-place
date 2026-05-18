import { Tier } from "@prisma/client";
import { prisma } from "./prisma";

export const LIMITS = {
  [Tier.FREE]: {
    maxRecipes: 50,
    maxAiUsage: 50,
    maxImagesPerRecipe: 1,
  },
  [Tier.PRO]: {
    maxRecipes: Infinity,
    maxAiUsage: Infinity,
    maxImagesPerRecipe: 5,
  },
};

export async function checkRecipeLimit(userId: string, tier: Tier) {
  if (tier === Tier.PRO) return { allowed: true };

  const count = await prisma.recipe.count({
    where: { userId },
  });

  if (count >= LIMITS[Tier.FREE].maxRecipes) {
    return {
      allowed: false,
      error: `You have reached the limit of ${LIMITS[Tier.FREE].maxRecipes} recipes for the FREE tier. Upgrade to PRO for unlimited recipes.`,
    };
  }

  return { allowed: true };
}

export async function checkAiLimit(userId: string, tier: Tier) {
  if (tier === Tier.PRO) return { allowed: true };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiUsageCount: true },
  });

  if (!user) return { allowed: false, error: "User not found" };

  if (user.aiUsageCount >= LIMITS[Tier.FREE].maxAiUsage) {
    return {
      allowed: false,
      error: `You have reached the limit of ${LIMITS[Tier.FREE].maxAiUsage} AI uses for the FREE tier. Upgrade to PRO for unlimited AI access.`,
    };
  }

  return { allowed: true };
}

export async function incrementAiUsage(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      aiUsageCount: {
        increment: 1,
      },
    },
  });
}
