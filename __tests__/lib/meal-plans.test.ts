/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../lib/prisma";
import { getMealPlan, createMeal, addRecipeToMeal } from "../../lib/meal-plans";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    mealPlan: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    meal: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    plannedRecipe: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Meal Plan Library", () => {
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets or creates a meal plan for a user", async () => {
    const mockMealPlan = { id: "mp-1", userId: mockUserId };
    (prisma.mealPlan.findUnique as any).mockResolvedValue(mockMealPlan);

    const result = await getMealPlan(mockUserId);
    expect(result).toEqual(mockMealPlan);
    expect(prisma.mealPlan.findUnique).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    });
  });

  it("creates a new meal slot", async () => {
    const mockDate = new Date("2026-05-15");
    const mockMeal = {
      id: "m-1",
      date: mockDate,
      slot: "Dinner",
      mealPlanId: "mp-1",
    };
    (prisma.meal.findFirst as any).mockResolvedValue(null);
    (prisma.meal.create as any).mockResolvedValue(mockMeal);

    const result = await createMeal("mp-1", mockDate, "Dinner");
    expect(result).toEqual(mockMeal);
    expect(prisma.meal.create).toHaveBeenCalled();
  });

  it("adds a recipe to a meal", async () => {
    const mockPlannedRecipe = {
      id: "pr-1",
      mealId: "m-1",
      recipeId: "r-1",
      scale: 1.5,
    };
    (prisma.plannedRecipe.create as any).mockResolvedValue(mockPlannedRecipe);

    const result = await addRecipeToMeal("m-1", "r-1", 1.5);
    expect(result).toEqual(mockPlannedRecipe);
    expect(prisma.plannedRecipe.create).toHaveBeenCalledWith({
      data: {
        mealId: "m-1",
        recipeId: "r-1",
        scale: 1.5,
        prepState: undefined,
      },
    });
  });
});
