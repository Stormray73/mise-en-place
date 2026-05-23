/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PrepAheadDashboard from "@/app/meal-planner/PrepAheadDashboard";
import { addRecipeToMeal } from "@/lib/meal-plans";
import { prisma } from "@/lib/prisma";

// Mock the prisma dependency
vi.mock("@/lib/prisma", () => ({
  prisma: {
    plannedRecipe: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    prepCompletion: {
      findMany: vi.fn(),
    },
  },
}));

// Mock Next.js actions used in PrepAheadDashboard
vi.mock("@/app/meal-planner/actions", () => ({
  getPrepAheadDataAction: vi
    .fn()
    .mockResolvedValue({ success: true, data: [] }),
  togglePrepCompletionAction: vi.fn().mockResolvedValue({ success: true }),
  dismissPrepItemAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("BUG-043: Duplicate Planned Recipes Permitted in Single Meal Slot", () => {
  it("should throw an error when attempting to add a duplicate recipe to the same meal slot", async () => {
    // Mock that a planned recipe with the same recipeId and mealId already exists
    const mockExisting = { id: "pr-1", mealId: "m-1", recipeId: "r-1" };
    vi.mocked(prisma.plannedRecipe.findFirst).mockResolvedValue(
      mockExisting as any,
    );

    await expect(addRecipeToMeal("m-1", "r-1")).rejects.toThrow(
      "This recipe is already in this meal slot.",
    );
  });

  it("should successfully add recipe to meal slot if it is not a duplicate", async () => {
    // Mock that no matching planned recipe exists in this meal slot
    vi.mocked(prisma.plannedRecipe.findFirst).mockResolvedValue(null);
    const mockCreated = {
      id: "pr-2",
      mealId: "m-1",
      recipeId: "r-2",
      scale: 1.0,
    };
    vi.mocked(prisma.plannedRecipe.create).mockResolvedValue(
      mockCreated as any,
    );

    const result = await addRecipeToMeal("m-1", "r-2");
    expect(result).toEqual(mockCreated);
    expect(prisma.plannedRecipe.create).toHaveBeenCalled();
  });
});

describe("BUG-042: Prep-Ahead Aggregator Fails to Update when Recipe is Deleted from Meal Plan", () => {
  const startDate = "2026-05-10T00:00:00Z";
  const endDate = "2026-05-17T00:00:00Z";

  it("should render initial data and reactive to prop changes when recipe is deleted", () => {
    const initialData: any[] = [
      {
        id: "ing-1",
        type: "ingredient",
        name: "Prep Tomatoes",
        quantity: 2,
        unit: "cups",
        completed: false,
      },
    ];

    // Render with initial data
    const { rerender } = render(
      <PrepAheadDashboard
        startDate={startDate}
        endDate={endDate}
        initialData={initialData}
      />,
    );

    // Should see prep item "Prep Tomatoes"
    expect(screen.getByText("Prep Tomatoes")).toBeInTheDocument();

    // Rerender with empty initialData (recipe was deleted on the server, revalidating the path)
    rerender(
      <PrepAheadDashboard
        startDate={startDate}
        endDate={endDate}
        initialData={[]}
      />,
    );

    // "Prep Tomatoes" should be removed and show the empty state message
    expect(screen.queryByText("Prep Tomatoes")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "No ingredients to prep for this period. Schedule some meals!",
      ),
    ).toBeInTheDocument();
  });
});
