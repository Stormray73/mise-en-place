/* eslint-disable @typescript-eslint/no-explicit-any */
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

describe("Shopping List Generation - Custom Recurring Intervals", () => {
  const userId = "user1";

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock returns
    vi.mocked(prisma.meal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.pantryItem.findMany).mockResolvedValue([]);
  });

  it("should show a recurring item with 2 weeks interval if more than 14 days have elapsed", async () => {
    const lastPurchased = new Date();
    // 15 days ago
    lastPurchased.setDate(lastPurchased.getDate() - 15);

    const mockManualItems = [
      {
        id: "item1",
        userId,
        name: "Paper Towels",
        quantity: 2,
        unit: "pack",
        isRecurring: true,
        recurringInterval: "2_weeks",
        lastPurchasedAt: lastPurchased,
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: null,
        store: null,
      },
    ];

    vi.mocked(prisma.manualShoppingItem.findMany).mockResolvedValue(
      mockManualItems as any,
    );

    const startDate = new Date(); // today
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const list = await generateShoppingList(userId, startDate, endDate);

    const paperTowels = list.find((i) => i.id === "item1");
    expect(paperTowels).toBeDefined();
    expect(paperTowels?.name).toBe("Paper Towels");
  });

  it("should hide a recurring item with 2 weeks interval if less than 14 days have elapsed", async () => {
    const lastPurchased = new Date();
    // 5 days ago
    lastPurchased.setDate(lastPurchased.getDate() - 5);

    const mockManualItems = [
      {
        id: "item1",
        userId,
        name: "Paper Towels",
        quantity: 2,
        unit: "pack",
        isRecurring: true,
        recurringInterval: "2_weeks",
        lastPurchasedAt: lastPurchased,
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: null,
        store: null,
      },
    ];

    vi.mocked(prisma.manualShoppingItem.findMany).mockResolvedValue(
      mockManualItems as any,
    );

    const startDate = new Date(); // today
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const list = await generateShoppingList(userId, startDate, endDate);

    const paperTowels = list.find((i) => i.id === "item1");
    expect(paperTowels).toBeUndefined();
  });

  it("should show a recurring item with monthly interval if more than 30 days have elapsed", async () => {
    const lastPurchased = new Date();
    // 35 days ago
    lastPurchased.setDate(lastPurchased.getDate() - 35);

    const mockManualItems = [
      {
        id: "item2",
        userId,
        name: "Dish Soap",
        quantity: 1,
        unit: "bottle",
        isRecurring: true,
        recurringInterval: "monthly",
        lastPurchasedAt: lastPurchased,
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: null,
        store: null,
      },
    ];

    vi.mocked(prisma.manualShoppingItem.findMany).mockResolvedValue(
      mockManualItems as any,
    );

    const startDate = new Date(); // today
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const list = await generateShoppingList(userId, startDate, endDate);

    const dishSoap = list.find((i) => i.id === "item2");
    expect(dishSoap).toBeDefined();
    expect(dishSoap?.name).toBe("Dish Soap");
  });

  it("should hide a recurring item with monthly interval if less than 30 days have elapsed", async () => {
    const lastPurchased = new Date();
    // 10 days ago
    lastPurchased.setDate(lastPurchased.getDate() - 10);

    const mockManualItems = [
      {
        id: "item2",
        userId,
        name: "Dish Soap",
        quantity: 1,
        unit: "bottle",
        isRecurring: true,
        recurringInterval: "monthly",
        lastPurchasedAt: lastPurchased,
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: null,
        store: null,
      },
    ];

    vi.mocked(prisma.manualShoppingItem.findMany).mockResolvedValue(
      mockManualItems as any,
    );

    const startDate = new Date(); // today
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const list = await generateShoppingList(userId, startDate, endDate);

    const dishSoap = list.find((i) => i.id === "item2");
    expect(dishSoap).toBeUndefined();
  });
});
