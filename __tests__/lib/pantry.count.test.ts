import { describe, it, expect, beforeEach, vi } from "vitest";
import { deductFromPantry, getIngredientStock, checkStock } from "@/lib/pantry";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pantryItem: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Pantry Deduction - Count-based Units", () => {
  const userId = "user1";
  const ingredientId = "ing1";
  const onionPortions = [
    {
      gramWeight: 110,
      modifier: "1 medium",
      amount: 1,
      measureUnitName: "whole",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should deduct 'item' from 'g' stock", async () => {
    const mockPantryItems = [
      {
        id: "p1",
        userId,
        ingredientId,
        quantity: 500,
        unit: "g",
        ingredient: {
          id: ingredientId,
          name: "Onion",
          foodPortions: onionPortions,
        },
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.pantryItem.findMany as any).mockResolvedValue(mockPantryItems);

    await deductFromPantry(userId, ingredientId, 1, "item");

    // 1 item = 110g. Remaining should be 500 - 110 = 390g
    expect(prisma.pantryItem.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: {
        quantity: 390,
        packageQuantity: undefined,
      },
    });
  });

  it("should deduct 'g' from 'item' stock", async () => {
    const mockPantryItems = [
      {
        id: "p2",
        userId,
        ingredientId,
        quantity: 5,
        unit: "item",
        ingredient: {
          id: ingredientId,
          name: "Onion",
          foodPortions: onionPortions,
        },
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.pantryItem.findMany as any).mockResolvedValue(mockPantryItems);

    // Deduct 220g = 2 items. Remaining should be 3 items.
    await deductFromPantry(userId, ingredientId, 220, "g");

    expect(prisma.pantryItem.update).toHaveBeenCalledWith({
      where: { id: "p2" },
      data: {
        quantity: 3,
        packageQuantity: undefined,
      },
    });
  });

  it("should check stock correctly with mixed units", async () => {
    const mockPantryItems = [
      {
        id: "p3",
        userId,
        ingredientId,
        quantity: 2,
        unit: "item",
        ingredient: {
          id: ingredientId,
          name: "Onion",
          foodPortions: onionPortions,
        },
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.pantryItem.findMany as any).mockResolvedValue(mockPantryItems);

    // 2 items = 220g.
    const hasEnoughG = await checkStock(userId, ingredientId, 200, "g");
    const hasEnoughItems = await checkStock(userId, ingredientId, 3, "item");

    expect(hasEnoughG).toBe(true);
    expect(hasEnoughItems).toBe(false);
  });
});
