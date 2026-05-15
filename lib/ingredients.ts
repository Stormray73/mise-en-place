import { prisma } from "./prisma";
import { Macros } from "@/types";
import { Prisma } from "@prisma/client";
import { USDAFoodPortion } from "./units";

export async function upsertIngredient(data: {
  name: string;
  usdaId?: string;
  baseMacros?: Macros;
  baseAmount?: number;
  foodPortions?: USDAFoodPortion[];
}) {
  if (!data.usdaId) {
    // If no usdaId, we just create/find by name?
    // Usually for pantry we might want custom ingredients too.
    return prisma.ingredient.create({
      data: {
        name: data.name,
        baseMacros: data.baseMacros as unknown as Prisma.InputJsonValue,
        baseAmount: data.baseAmount,
        foodPortions: data.foodPortions as unknown as Prisma.InputJsonValue,
      },
    });
  }

  return prisma.ingredient.upsert({
    where: { usdaId: data.usdaId },
    update: {
      name: data.name,
      baseMacros: data.baseMacros as unknown as Prisma.InputJsonValue,
      baseAmount: data.baseAmount,
      foodPortions: data.foodPortions as unknown as Prisma.InputJsonValue,
    },
    create: {
      name: data.name,
      usdaId: data.usdaId,
      baseMacros: data.baseMacros as unknown as Prisma.InputJsonValue,
      baseAmount: data.baseAmount,
      foodPortions: data.foodPortions as unknown as Prisma.InputJsonValue,
    },
  });
}
