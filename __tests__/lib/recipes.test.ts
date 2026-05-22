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

    it("should calculate macros for discrete designations using USDA portions if available", async () => {
      const blackBeansMacros: Macros = {
        calories: 130,
        protein: 8,
        fat: 0.5,
        carbs: 20,
      };
      const recipe: Partial<Recipe> = {
        components: [
          {
            type: "ingredient",
            ingredientId: "i3",
            id: "3",
            recipeId: "r3",
            quantity: 2,
            unit: "can",
            ingredient: {
              id: "i3",
              name: "Black Beans",
              baseMacros: blackBeansMacros as unknown,
              baseAmount: 100,
              foodPortions: [
                {
                  gramWeight: 260,
                  modifier: "1 can",
                  amount: 1,
                  measureUnitName: "can",
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ] as any,
            },
          },
        ],
      };

      const macros = await calculateMacros(recipe);
      // 2 cans * 260g/can = 520g total
      // 520g / 100g baseAmount = 5.2 ratio
      // 130 * 5.2 = 676 calories
      // 8 * 5.2 = 41.6 protein
      expect(macros.calories).toBeCloseTo(676);
      expect(macros.protein).toBeCloseTo(41.6);
    });

    it("should calculate macros for discrete designations using fallbacks if USDA portions are not matched", async () => {
      const seasoningMacros: Macros = {
        calories: 300,
        protein: 10,
        fat: 2,
        carbs: 60,
      };
      const recipe: Partial<Recipe> = {
        components: [
          {
            type: "ingredient",
            ingredientId: "i4",
            id: "4",
            recipeId: "r4",
            quantity: 3,
            unit: "packet",
            ingredient: {
              id: "i4",
              name: "Taco Seasoning",
              baseMacros: seasoningMacros as unknown,
              baseAmount: 100,
              foodPortions: [], // No matching portions
            },
          },
        ],
      };

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const macros = await calculateMacros(recipe);
      // fallback weight for packet is 10g
      // 3 packets * 10g/packet = 30g total
      // 30g / 100g baseAmount = 0.3 ratio
      // 300 * 0.3 = 90 calories
      // 10 * 0.3 = 3 protein
      expect(macros.calories).toBeCloseTo(90);
      expect(macros.protein).toBeCloseTo(3);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
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
