import { calculateMacros } from "@/lib/recipes";
import { describe, it, expect, vi } from "vitest";
import { Recipe } from "@/types";

describe("Recipe Macro Calculation - Count-based Units", () => {
  it("should calculate macros for ingredient using 'item' unit", async () => {
    const onionPortions = [
      {
        gramWeight: 110,
        modifier: "1 medium",
        amount: 1,
        measureUnitName: "whole",
      },
    ];

    const recipe: Partial<Recipe> = {
      title: "One Onion",
      components: [
        {
          id: "c1",
          type: "ingredient" as const,
          ingredientId: "i1",
          quantity: 2,
          unit: "item",
          recipeId: "r1",
          ingredient: {
            id: "i1",
            name: "Onion",
            baseMacros: {
              calories: 40, // per 100g
              protein: 1,
              fat: 0.1,
              carbs: 9,
            },
            baseAmount: 100,
            foodPortions: onionPortions,
          },
        },
      ],
    };

    const macros = await calculateMacros(recipe);

    // 2 items = 2 * 110g = 220g
    // 220g / 100g = 2.2 ratio
    // calories = 40 * 2.2 = 88
    expect(macros.calories).toBeCloseTo(88, 1);
    expect(macros.protein).toBeCloseTo(2.2, 1);
  });

  it("should return 0 macros if portion data is missing for 'item' unit", async () => {
    const recipe: Partial<Recipe> = {
      title: "Mystery Item",
      components: [
        {
          id: "c2",
          type: "ingredient" as const,
          ingredientId: "i2",
          quantity: 1,
          unit: "item",
          recipeId: "r1",
          ingredient: {
            id: "i2",
            name: "Mystery",
            baseMacros: {
              calories: 100,
              protein: 10,
              fat: 10,
              carbs: 10,
            },
            baseAmount: 100,
            foodPortions: [], // No portion data
          },
        },
      ],
    };

    const macros = await calculateMacros(recipe);
    expect(macros.calories).toBe(0);
  });
});
