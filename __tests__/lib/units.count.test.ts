import { convert, canConvert, USDAFoodPortion } from "@/lib/units";
import { describe, it, expect } from "vitest";

describe("Unit Conversion Utility - Count-based Units", () => {
  const onionPortions: USDAFoodPortion[] = [
    {
      gramWeight: 110,
      modifier: '1 medium (2-1/2" dia)',
      amount: 1,
      measureUnitName: "whole",
    },
    {
      gramWeight: 150,
      modifier: "1 cup, chopped",
      amount: 1,
      measureUnitName: "cup",
    },
  ];

  const genericPortions: USDAFoodPortion[] = [
    {
      gramWeight: 50,
      modifier: "each",
      amount: 1,
      measureUnitName: "piece",
    },
  ];

  describe("canConvert", () => {
    it("should return true for item to mass with valid portions", () => {
      expect(canConvert("item", "g", onionPortions)).toBe(true);
    });

    it("should return false for item to mass without valid portions", () => {
      expect(canConvert("item", "g", [])).toBe(false);
      expect(canConvert("item", "g")).toBe(false);
    });
  });

  describe("convert", () => {
    it("should convert item to mass (g) using heuristic", () => {
      // 1 item of onion should be 110g based on "whole" keyword
      expect(convert(1, "item", "g", onionPortions)).toBeCloseTo(110, 0);
    });

    it("should convert item to mass (g) using 'piece'/'each' heuristic", () => {
      expect(convert(1, "item", "g", genericPortions)).toBeCloseTo(50, 0);
    });

    it("should convert mass (lb) to item", () => {
      // 1 lb = 453.59237 g
      // 1 item = 110g
      // 1 lb = 453.59237 / 110 = 4.123567 items
      expect(convert(1, "lb", "item", onionPortions)).toBeCloseTo(4.1236, 4);
    });

    it("should throw if no item-like portion is found", () => {
      const volumeOnlyPortions: USDAFoodPortion[] = [
        {
          gramWeight: 150,
          modifier: "1 cup",
          amount: 1,
          measureUnitName: "cup",
        },
      ];
      expect(() => convert(1, "item", "g", volumeOnlyPortions)).toThrow(
        /no item weight data/,
      );
    });
  });
});
