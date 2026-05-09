import { convert, canConvert } from "@/lib/units";
import { describe, it, expect } from "vitest";

describe("Unit Conversion Utility", () => {
  describe("canConvert", () => {
    it("should return true for same category units", () => {
      expect(canConvert("g", "kg")).toBe(true);
      expect(canConvert("ml", "L")).toBe(true);
    });

    it("should return false for different category units", () => {
      expect(canConvert("g", "L")).toBe(false);
      expect(canConvert("tsp", "lb")).toBe(false);
    });
  });

  describe("convert", () => {
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
