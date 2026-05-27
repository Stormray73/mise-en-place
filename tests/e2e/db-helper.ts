import { PrismaClient } from "@prisma/client";

export async function resetDatabase() {
  const prisma = new PrismaClient();
  try {
    await prisma.plannedRecipe.deleteMany({});
    await prisma.meal.deleteMany({});
    await prisma.prepCompletion.deleteMany({});
    await prisma.recipeComponent.deleteMany({});
    await prisma.recipe.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.manualShoppingItem.deleteMany({});
    await prisma.pantryItem.deleteMany({});
    console.log("✅ E2E database reset completed successfully.");
  } catch (err) {
    console.error("❌ E2E database reset failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}
