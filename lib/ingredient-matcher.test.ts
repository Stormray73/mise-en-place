import { describe, it, expect } from "vitest";
import { getRelevantIngredients } from "./ingredient-matcher";

describe("getRelevantIngredients", () => {
  const components = [
    { ingredient: { name: "Evaporated Milk" } },
    { ingredient: { name: "Granulated Sugar" } },
    { ingredient: { name: "Unsalted Butter" } },
    { ingredient: { name: "Salt" } },
  ];

  it("should match full ingredient names", () => {
    const result = getRelevantIngredients(
      "Add the granulated sugar and salt.",
      components,
    );
    expect(result).toHaveLength(2);
    expect(result[0].ingredient.name).toBe("Granulated Sugar");
    expect(result[1].ingredient.name).toBe("Salt");
  });

  it("should match shorthand names (e.g., 'milk' for 'Evaporated Milk')", () => {
    const result = getRelevantIngredients(
      "Pour in the milk slowly.",
      components,
    );
    expect(result).toHaveLength(1);
    expect(result[0].ingredient.name).toBe("Evaporated Milk");
  });

  it("should match shorthand names (e.g., 'butter' for 'Unsalted Butter')", () => {
    const result = getRelevantIngredients("Melt the butter.", components);
    expect(result).toHaveLength(1);
    expect(result[0].ingredient.name).toBe("Unsalted Butter");
  });

  it("should return empty array if no match found", () => {
    const result = getRelevantIngredients("Whisk the eggs.", components);
    expect(result).toHaveLength(0);
  });

  it("should ignore common stop words", () => {
    const result = getRelevantIngredients("Add a pinch of salt.", components);
    expect(result).toHaveLength(1);
    expect(result[0].ingredient.name).toBe("Salt");
  });
});
