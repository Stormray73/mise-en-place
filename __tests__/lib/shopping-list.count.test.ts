import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateShoppingList } from "@/lib/shopping-list";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    meal: {
      findMany: vi.fn(),
    },
    pantryItem: {
      findMany: vi.fn(),
    },
    manualShoppingItem: {
      findMany: vi.fn(),
    },
  },
}));

describe("Shopping List Consolidation - Count-based Units", () => {
  const userId = "user1";
  const onionId = "onion1";
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

  it("should consolidate 'item' and 'g' needs", async () => {
    const mockMeals = [
      {
        plannedRecipes: [
          {
            scale: 1,
            recipe: {
              components: [
                {
                  ingredientId: onionId,
                  quantity: 1,
                  unit: "item",
                  ingredient: {
                    id: onionId,
                    name: "Onion",
                    foodPortions: onionPortions,
                  },
                },
              ],
            },
          },
          {
            scale: 1,
            recipe: {
              components: [
                {
                  ingredientId: onionId,
                  quantity: 110,
                  unit: "g",
                  ingredient: {
                    id: onionId,
                    name: "Onion",
                    foodPortions: onionPortions,
                  },
                },
              ],
            },
          },
        ],
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.meal.findMany as any).mockResolvedValue(mockMeals);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.pantryItem.findMany as any).mockResolvedValue([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.manualShoppingItem.findMany as any).mockResolvedValue([]);

    const list = await generateShoppingList(userId, new Date(), new Date());

    const onionNeed = list.find((i) => i.ingredientId === onionId);
    expect(onionNeed).toBeDefined();
    // 1 item + 110g = 2 items (since "item" was the first unit encountered)
    expect(onionNeed?.requiredQuantity).toBeCloseTo(2, 1);
    expect(onionNeed?.unit).toBe("item");
  });
});
