import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { calculateMacros, saveRecipe } from "@/lib/recipes";
import { prisma } from "@/lib/prisma";
import { Recipe, Macros, RecipeSaveData } from "@/types";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recipe: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Recipe Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateMacros", () => {
    it("should calculate macros for simple ingredients", async () => {
      const chickenMacros: Macros = {
        calories: 165,
        protein: 31,
        fat: 3.6,
        carbs: 0,
      };
      const recipe: Partial<Recipe> = {
        components: [
          {
            type: "ingredient",
            ingredientId: "i1",
            id: "1",
            recipeId: "r1",
            quantity: 200,
            unit: "g",
            ingredient: {
              id: "i1",
              name: "Chicken",
              baseMacros: chickenMacros as unknown,
            },
          },
        ],
      };

      const macros = await calculateMacros(recipe);
      expect(macros.calories).toBe(330);
      expect(macros.protein).toBe(62);
    });

    it("should handle sub-recipes", async () => {
      const riceMacros: Macros = {
        calories: 130,
        protein: 2.7,
        fat: 0.3,
        carbs: 28,
      };
      const subRecipe: Partial<Recipe> = {
        id: "sub1",
        yieldAmount: 1,
        yieldUnit: "portion",
        components: [
          {
            type: "ingredient",
            ingredientId: "i2",
            id: "2",
            recipeId: "sub1",
            quantity: 100,
            unit: "g",
            ingredient: {
              id: "i2",
              name: "Rice",
              baseMacros: riceMacros as unknown,
            },
          },
        ],
      };

      const mainRecipe: Partial<Recipe> = {
        components: [
          {
            type: "sub-recipe",
            childRecipeId: "sub1",
            id: "3",
            recipeId: "main1",
            quantity: 2,
            unit: "portion",
            childRecipe: subRecipe as Recipe,
          },
        ],
      };

      const macros = await calculateMacros(mainRecipe);
      expect(macros.calories).toBe(260);
    });
  });

  describe("saveRecipe", () => {
    it("should detect circular dependencies", async () => {
      const recipeB = {
        id: "B",
        components: [{ type: "sub-recipe", childRecipeId: "A" }],
      };

      (prisma.recipe.findUnique as Mock).mockResolvedValue(recipeB);

      const data: RecipeSaveData & { userId: string } = {
        title: "Recipe A",
        yieldAmount: 1,
        yieldUnit: "portion",
        components: [
          {
            type: "sub-recipe",
            childRecipeId: "B",
            quantity: 1,
            unit: "portion",
          },
        ],
        steps: [],
        userId: "user1",
      };

      await expect(saveRecipe("A", data)).rejects.toThrow(
        /Circular dependency/,
      );
    });

    it("should save recipe with favorites and tags", async () => {
      const data: RecipeSaveData & { userId: string } = {
        title: "Favorite Salad",
        yieldAmount: 1,
        yieldUnit: "portion",
        isFavorite: true,
        tags: ["Quick", "Healthy"],
        components: [],
        steps: [],
        userId: "user1",
      };

      (prisma.recipe.create as Mock).mockResolvedValue({
        id: "new-id",
        ...data,
      });

      await saveRecipe(null, data);

      expect(prisma.recipe.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isFavorite: true,
            tags: {
              connectOrCreate: [
                {
                  where: { name_userId: { name: "Quick", userId: "user1" } },
                  create: { name: "Quick", userId: "user1" },
                },
                {
                  where: { name_userId: { name: "Healthy", userId: "user1" } },
                  create: { name: "Healthy", userId: "user1" },
                },
              ],
            },
          }),
        }),
      );
    });
  });
});
