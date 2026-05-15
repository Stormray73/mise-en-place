import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getIngredientStock, deductFromPantry, checkStock } from "@/lib/pantry";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pantryItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Pantry Utility", () => {
  const userId = "user-1";
  const ingredientId = "ing-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getIngredientStock", () => {
    it("should aggregate stock across multiple items", async () => {
      const mockItems = [
        {
          id: "1",
          quantity: 500,
          unit: "g",
          ingredient: { id: ingredientId, foodPortions: [] },
        },
        {
          id: "2",
          quantity: 1,
          unit: "kg",
          ingredient: { id: ingredientId, foodPortions: [] },
        },
      ];
      vi.mocked(prisma.pantryItem.findMany).mockResolvedValue(
        mockItems as unknown as Awaited<
          ReturnType<typeof prisma.pantryItem.findMany>
        >,
      );

      const stock = await getIngredientStock(userId, ingredientId);
      expect(stock.quantity).toBe(1500);
      expect(stock.unit).toBe("g");
    });
  });

  describe("deductFromPantry", () => {
    it("should deduct from multiple items (FIFO)", async () => {
      const mockItems = [
        {
          id: "1",
          quantity: 500,
          unit: "g",
          ingredient: { id: ingredientId, foodPortions: [] },
        },
        {
          id: "2",
          quantity: 1000,
          unit: "g",
          ingredient: { id: ingredientId, foodPortions: [] },
        },
      ];
      vi.mocked(prisma.pantryItem.findMany).mockResolvedValue(
        mockItems as unknown as Awaited<
          ReturnType<typeof prisma.pantryItem.findMany>
        >,
      );

      await deductFromPantry(userId, ingredientId, 800, "g");

      expect(prisma.pantryItem.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { quantity: 0 },
      });
      expect(prisma.pantryItem.update).toHaveBeenCalledWith({
        where: { id: "2" },
        data: { quantity: 700 },
      });
    });
  });

  describe("checkStock", () => {
    it("should return true if enough stock exists", async () => {
      const mockItems = [
        {
          id: "1",
          quantity: 500,
          unit: "g",
          ingredient: { id: ingredientId, foodPortions: [] },
        },
      ];
      vi.mocked(prisma.pantryItem.findMany).mockResolvedValue(
        mockItems as unknown as Awaited<
          ReturnType<typeof prisma.pantryItem.findMany>
        >,
      );

      const hasStock = await checkStock(userId, ingredientId, 300, "g");
      expect(hasStock).toBe(true);
    });

    it("should return false if not enough stock exists", async () => {
      const mockItems = [
        {
          id: "1",
          quantity: 500,
          unit: "g",
          ingredient: { id: ingredientId, foodPortions: [] },
        },
      ];
      vi.mocked(prisma.pantryItem.findMany).mockResolvedValue(
        mockItems as unknown as Awaited<
          ReturnType<typeof prisma.pantryItem.findMany>
        >,
      );

      const hasStock = await checkStock(userId, ingredientId, 800, "g");
      expect(hasStock).toBe(false);
    });
  });
});
