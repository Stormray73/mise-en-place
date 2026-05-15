import { convert, canConvert } from "@/lib/units";
import { describe, it, expect } from "vitest";

describe("Unit Conversion Utility", () => {
  describe("canConvert", () => {
    it("should return true for same category units", () => {
      expect(canConvert("g", "kg")).toBe(true);
      expect(canConvert("ml", "L")).toBe(true);
    });

    it("should return false for different category units without portions", () => {
      expect(canConvert("g", "L")).toBe(false);
      expect(canConvert("tsp", "lb")).toBe(false);
    });

    it("should return true for different category units with valid portions", () => {
      const portions = [
        {
          gramWeight: 200,
          modifier: "1 cup",
          amount: 1,
          measureUnitName: "cup",
        },
      ];
      expect(canConvert("cup", "g", portions)).toBe(true);
      expect(canConvert("ml", "lb", portions)).toBe(true);
    });
  });

  describe("convert", () => {
    describe("Density-based (Cross-category)", () => {
      const applePortions = [
        {
          gramWeight: 182,
          modifier: "1 medium",
          amount: 1,
          measureUnitName: "cup",
        },
      ];

      it("should convert volume to mass (cup to g)", () => {
        // 1 cup of apple is 182g
        expect(convert(1, "cup", "g", applePortions)).toBeCloseTo(182, 0);
      });

      it("should convert volume to mass (ml to oz)", () => {
        // 1 cup = 236.588 ml = 182g
        // 1 ml = 182 / 236.588 g = 0.769 g
        // 0.769 g = 0.769 / 28.3495 oz = 0.027 oz
        expect(convert(100, "ml", "oz", applePortions)).toBeCloseTo(2.71, 2);
      });

      it("should convert mass to volume (g to cup)", () => {
        expect(convert(182, "g", "cup", applePortions)).toBeCloseTo(1, 2);
      });

      it("should convert mass to volume (lb to L)", () => {
        // 1 lb = 453.592 g
        // 182 g = 1 cup = 236.588 ml
        // 453.592 g = (453.592 / 182) * 236.588 ml = 589.6 ml = 0.5896 L
        expect(convert(1, "lb", "L", applePortions)).toBeCloseTo(0.5896, 4);
      });

      it("should throw if no compatible portions found", () => {
        const badPortions = [
          {
            gramWeight: 10,
            modifier: "1 piece",
            amount: 1,
            measureUnitName: "piece",
          },
        ];
        expect(() => convert(1, "cup", "g", badPortions)).toThrow();
      });
    });

    describe("Mass", () => {
      it("should convert mg to g", () => {
        expect(convert(1000, "mg", "g")).toBe(1);
      });

      it("should convert g to kg", () => {
        expect(convert(1000, "g", "kg")).toBe(1);
      });

      it("should convert kg to g", () => {
        expect(convert(1, "kg", "g")).toBe(1000);
      });

      it("should convert oz to g", () => {
        // 1 oz is approx 28.3495 g
        expect(convert(1, "oz", "g")).toBeCloseTo(28.3495, 4);
      });

      it("should convert lb to kg", () => {
        // 1 lb is approx 0.453592 kg
        expect(convert(1, "lb", "kg")).toBeCloseTo(0.453592, 6);
      });
    });

    describe("Volume", () => {
      it("should convert ml to cl", () => {
        expect(convert(10, "ml", "cl")).toBe(1);
      });

      it("should convert ml to L", () => {
        expect(convert(1000, "ml", "L")).toBe(1);
      });

      it("should convert L to ml", () => {
        expect(convert(1, "L", "ml")).toBe(1000);
      });

      it("should convert tsp to tbsp", () => {
        expect(convert(3, "tsp", "tbsp")).toBe(1);
      });

      it("should convert tbsp to cup", () => {
        expect(convert(16, "tbsp", "cup")).toBe(1);
      });

      it("should convert cup to ml", () => {
        // 1 US cup is approx 236.588 ml
        expect(convert(1, "cup", "ml")).toBeCloseTo(236.588, 3);
      });

      it("should convert pt to cup", () => {
        expect(convert(1, "pt", "cup")).toBe(2);
      });

      it("should convert qt to pt", () => {
        expect(convert(1, "qt", "pt")).toBe(2);
      });

      it("should convert gal to qt", () => {
        expect(convert(1, "gal", "qt")).toBe(4);
      });
    });

    it("should throw error for incompatible units", () => {
      expect(() => convert(1, "g", "L")).toThrow();
    });
  });
});
