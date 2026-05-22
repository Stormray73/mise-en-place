import { describe, it, expect } from "vitest";
import { cleanIngredientName, getSimilarity } from "@/lib/ingredients";

describe("Ingredient Fuzzy Matching Pre-processing", () => {
  describe("cleanIngredientName", () => {
    it("should remove parenthetical text", () => {
      expect(cleanIngredientName("peanuts (raw)")).toBe("peanuts");
      expect(cleanIngredientName("black beans (drained, organic)")).toBe(
        "black beans",
      );
    });

    it("should remove common adjectives and prep instructions", () => {
      expect(cleanIngredientName("organic unsalted butter")).toBe("butter");
      expect(cleanIngredientName("fresh chopped tomatoes")).toBe("tomatoes");
      expect(cleanIngredientName("diced cooked chicken breast")).toBe(
        "chicken breast",
      );
      expect(cleanIngredientName("roasted shredded coconut")).toBe("coconut");
    });

    it("should clean punctuation and excessive whitespace", () => {
      expect(cleanIngredientName("garlic, minced,")).toBe("garlic");
      expect(cleanIngredientName(", fresh ginger ,")).toBe("ginger");
    });
  });

  describe("getSimilarity", () => {
    it("should compute higher similarity for cleaned names", () => {
      // Direct raw similarity of "organic unsalted butter" vs "butter" without cleaning is very low
      // With cleaning, they both clean to "butter", yielding similarity 1.0
      expect(getSimilarity("organic unsalted butter", "butter")).toBe(1);

      // "peanuts (raw)" cleans to "peanuts", yielding similarity 1.0 with "peanuts"
      expect(getSimilarity("peanuts (raw)", "peanuts")).toBe(1);

      // "fresh chopped tomatoes" vs "diced tomatoes"
      // cleans to "tomatoes" vs "tomatoes" -> 1.0
      expect(getSimilarity("fresh chopped tomatoes", "diced tomatoes")).toBe(1);
    });
  });
});
