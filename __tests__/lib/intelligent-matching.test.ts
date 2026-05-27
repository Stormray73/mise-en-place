import { describe, it, expect, vi } from "vitest";
import {
  normalizeUnicodeFractions,
  normalizeUnit,
  parseQuantityUnitAndName,
} from "@/lib/units";
import { cleanIngredientName } from "@/lib/ingredients";
import { getDiscreteWeight } from "@/lib/recipes";
import { USDAFoodPortion } from "@/lib/units";

describe("Intelligent Matching & Normalization", () => {
  describe("Story 5: Robust Unit Normalization", () => {
    it("should standardize unicode fractions to floats", () => {
      expect(normalizeUnicodeFractions("¼")).toBe("0.25");
      expect(normalizeUnicodeFractions("½")).toBe("0.5");
      expect(normalizeUnicodeFractions("¾")).toBe("0.75");
      expect(normalizeUnicodeFractions("⅓")).toBe("0.333");
    });

    it("should handle case-insensitive shorthand and trailing dots", () => {
      expect(normalizeUnit("T")).toBe("tbsp");
      expect(normalizeUnit("t")).toBe("tsp");
      expect(normalizeUnit("tbsp.")).toBe("tbsp");
      expect(normalizeUnit("tsp.")).toBe("tsp");
      expect(normalizeUnit("C")).toBe("cup");
      expect(normalizeUnit("oz.")).toBe("oz");
      expect(normalizeUnit("lb.")).toBe("lb");
      expect(normalizeUnit("lbs")).toBe("lb");
    });

    it("should parse ingredients formatted without spaces", () => {
      // Space-less unit formats
      expect(parseQuantityUnitAndName(1, "2T", "flour")).toEqual({
        quantity: 2,
        unit: "tbsp",
        name: "flour",
      });

      expect(parseQuantityUnitAndName(1, "6oz", "chicken")).toEqual({
        quantity: 6,
        unit: "oz",
        name: "chicken",
      });

      expect(parseQuantityUnitAndName(1, "1lb.", "beef")).toEqual({
        quantity: 1,
        unit: "lb",
        name: "beef",
      });

      expect(parseQuantityUnitAndName(1, "¼ C", "butter")).toEqual({
        quantity: 0.25,
        unit: "cup",
        name: "butter",
      });
    });

    it("should extract quantity & unit prefix from names", () => {
      expect(parseQuantityUnitAndName(1, "ea", "2T flour")).toEqual({
        quantity: 2,
        unit: "tbsp",
        name: "flour",
      });

      expect(parseQuantityUnitAndName(1, "ea", "½ cup sugar")).toEqual({
        quantity: 0.5,
        unit: "cup",
        name: "sugar",
      });

      expect(parseQuantityUnitAndName(1, "", "1 1/2 tsp salt")).toEqual({
        quantity: 1.5,
        unit: "tsp",
        name: "salt",
      });
    });

    it("should extract simple number prefix from names", () => {
      expect(parseQuantityUnitAndName(1, "ea", "2 carrots")).toEqual({
        quantity: 2,
        unit: "ea",
        name: "carrots",
      });
    });
  });

  describe("Story 6: Noise-Stripped Fuzzy Matching", () => {
    it("should strip prep instructions, adjectives, and parentheticals", () => {
      expect(cleanIngredientName("organic unsalted butter")).toBe("butter");
      expect(cleanIngredientName("peanuts (raw)")).toBe("peanuts");
      expect(cleanIngredientName("beans (drained), chopped")).toBe("beans");
      expect(cleanIngredientName("large eggs, room temperature")).toBe(
        "eggs room temperature",
      );
      expect(cleanIngredientName("extra virgin olive oil")).toBe("olive oil");
    });
  });

  describe("Story 7: Discrete Designations in Macro Calculations", () => {
    const mockPortions: USDAFoodPortion[] = [
      {
        gramWeight: 340,
        modifier: "1 can",
        amount: 1,
        measureUnitName: "can",
      },
    ];

    it("should direct match discrete portion weights from USDA portions", () => {
      const weight = getDiscreteWeight(2, "can", mockPortions, "black beans");
      expect(weight).toBe(680); // 2 * 340
    });

    it("should apply fallback weight when portion is not in database", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Fallback for tuna can -> 150g
      const tunaWeight = getDiscreteWeight(1, "can", [], "canned tuna");
      expect(tunaWeight).toBe(150);

      // Fallback for packet -> 10g
      const packetWeight = getDiscreteWeight(2, "packet", [], "yeast");
      expect(packetWeight).toBe(20);

      // Fallback for bunch -> 100g
      const bunchWeight = getDiscreteWeight(1.5, "bunch", [], "cilantro");
      expect(bunchWeight).toBe(150);

      // Fallback for sheet -> 10g
      const sheetWeight = getDiscreteWeight(3, "sheet", [], "gelatin");
      expect(sheetWeight).toBe(30);

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
