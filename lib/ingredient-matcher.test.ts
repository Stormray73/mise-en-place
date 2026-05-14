import { describe, it, expect } from "vitest";
import { getRelevantIngredients } from "./ingredient-matcher";
import { RecipeComponent } from "@/types";

describe("getRelevantIngredients", () => {
  const components = [
    {
      type: "ingredient",
      ingredientId: "1",
      id: "c1",
      recipeId: "r1",
      quantity: 1,
      unit: "cup",
      ingredient: { id: "1", name: "Evaporated Milk" },
    },
    {
      type: "ingredient",
      ingredientId: "2",
      id: "c2",
      recipeId: "r1",
      quantity: 1,
      unit: "cup",
      ingredient: { id: "2", name: "Granulated Sugar" },
    },
    {
      type: "ingredient",
      ingredientId: "3",
      id: "c3",
      recipeId: "r1",
      quantity: 1,
      unit: "cup",
      ingredient: { id: "3", name: "Unsalted Butter" },
    },
    {
      type: "ingredient",
      ingredientId: "4",
      id: "c4",
      recipeId: "r1",
      quantity: 1,
      unit: "cup",
      ingredient: { id: "4", name: "Salt" },
    },
  ] as RecipeComponent[];

  it("should match full ingredient names", () => {
    const result = getRelevantIngredients(
      "Add the granulated sugar and salt.",
      components,
    );
    expect(result).toHaveLength(2);
    const res0 = result[0] as Extract<RecipeComponent, { type: "ingredient" }>;
    const res1 = result[1] as Extract<RecipeComponent, { type: "ingredient" }>;
    expect(res0.ingredient!.name).toBe("Granulated Sugar");
    expect(res1.ingredient!.name).toBe("Salt");
  });

  it("should match shorthand names (e.g., 'milk' for 'Evaporated Milk')", () => {
    const result = getRelevantIngredients(
      "Pour in the milk slowly.",
      components,
    );
    expect(result).toHaveLength(1);
    const res = result[0] as Extract<RecipeComponent, { type: "ingredient" }>;
    expect(res.ingredient!.name).toBe("Evaporated Milk");
  });

  it("should match shorthand names (e.g., 'butter' for 'Unsalted Butter')", () => {
    const result = getRelevantIngredients("Melt the butter.", components);
    expect(result).toHaveLength(1);
    const res = result[0] as Extract<RecipeComponent, { type: "ingredient" }>;
    expect(res.ingredient!.name).toBe("Unsalted Butter");
  });

  it("should return empty array if no match found", () => {
    const result = getRelevantIngredients("Whisk the eggs.", components);
    expect(result).toHaveLength(0);
  });

  it("should ignore common stop words", () => {
    const result = getRelevantIngredients("Add a pinch of salt.", components);
    expect(result).toHaveLength(1);
    const res = result[0] as Extract<RecipeComponent, { type: "ingredient" }>;
    expect(res.ingredient!.name).toBe("Salt");
  });
});
