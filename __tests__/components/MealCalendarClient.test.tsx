import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import MealCalendarClient from "@/app/meal-planner/MealCalendarClient";
import { expect, test, vi, describe, beforeEach } from "vitest";
import * as actions from "@/app/meal-planner/actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/meal-planner",
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock the server actions
vi.mock("@/app/meal-planner/actions", () => ({
  createMealAction: vi.fn().mockResolvedValue({ success: true }),
  addRecipeToMealAction: vi.fn().mockResolvedValue({ success: true }),
  deleteMealAction: vi.fn().mockResolvedValue({ success: true }),
  updatePlannedRecipeAction: vi.fn().mockResolvedValue({ success: true }),
  removeRecipeFromMealAction: vi.fn().mockResolvedValue({ success: true }),
  setLeftoverSourceAction: vi.fn().mockResolvedValue({ success: true }),
  linkLeftoverConsumptionAction: vi.fn().mockResolvedValue({ success: true }),
  cloneMealAction: vi.fn().mockResolvedValue({ success: true }),
  reorderMealAction: vi.fn().mockResolvedValue({ success: true }),
}));

const mockStartDate = new Date("2026-05-10T00:00:00Z").toISOString(); // A Sunday
const mockAllRecipes = [
  { id: "r1", title: "Pasta" },
  { id: "r2", title: "Salad" },
];

const mockMeals = [
  {
    id: "m1",
    date: "2026-05-10T00:00:00Z",
    slot: "Dinner",
    mealPlanId: "mp1",
    createdAt: new Date(),
    updatedAt: new Date(),
    plannedRecipes: [
      {
        id: "pr1",
        recipeId: "r1",
        recipe: { title: "Pasta" },
        scale: 1,
        isLeftoverSource: false,
      },
    ],
    macros: { calories: 500, protein: 20, fat: 15, carbs: 70 },
  },
];

describe("MealCalendarClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders 7 days of the week", () => {
    render(
      <MealCalendarClient
        initialMeals={[]}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    expect(screen.getByText(/Sun/i)).toBeInTheDocument();
    expect(screen.getByText(/Sat/i)).toBeInTheDocument();
  });

  test("renders existing meals and recipes", () => {
    render(
      <MealCalendarClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialMeals={mockMeals as any}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("Pasta")).toBeInTheDocument();
    expect(screen.getByText("500 kcal")).toBeInTheDocument();
  });

  test("can open add meal modal", () => {
    render(
      <MealCalendarClient
        initialMeals={[]}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    const addButtons = screen.getAllByText(/\+ Add Meal/i);
    fireEvent.click(addButtons[0]);

    expect(screen.getByText("Add Meal Slot")).toBeInTheDocument();
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
  });

  test("can open add recipe modal", () => {
    render(
      <MealCalendarClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialMeals={mockMeals as any}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    fireEvent.click(screen.getByText("+ Add Recipe"));
    expect(screen.getByText("Add Recipe to Meal")).toBeInTheDocument();
    expect(screen.getByText("Salad")).toBeInTheDocument();
  });

  test("can open clone meal modal", () => {
    render(
      <MealCalendarClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialMeals={mockMeals as any}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    fireEvent.click(screen.getByTitle("Clone Meal"));
    expect(screen.getByText("Clone Meal to Date")).toBeInTheDocument();
  });

  test("updates planned recipe scale", async () => {
    render(
      <MealCalendarClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialMeals={mockMeals as any}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    // Scale is now inside EditMealModal — open it by clicking the meal slot title
    fireEvent.click(screen.getByTitle("Edit Meal details & recipes"));

    // Wait for the modal to appear
    await waitFor(() =>
      expect(screen.getByText("Edit Meal: Dinner")).toBeInTheDocument(),
    );

    const scaleInput = screen.getByTestId("scale-input-pr1");
    fireEvent.change(scaleInput, { target: { value: "2" } });

    expect(actions.updatePlannedRecipeAction).toHaveBeenCalledWith("pr1", {
      scale: 2,
    });
  });

  test("two-stage AddMealModal workflow and recipe search filtering", async () => {
    // Mock actions
    vi.mocked(actions.createMealAction).mockResolvedValue({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { id: "new-meal-id", slot: "Lunch" } as any,
    });
    vi.mocked(actions.addRecipeToMealAction).mockResolvedValue({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { id: "new-pr-id", recipeId: "r1" } as any,
    });

    render(
      <MealCalendarClient
        initialMeals={[]}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    // 1. Open the modal
    const addButtons = screen.getAllByText(/\+ Add Meal/i);
    fireEvent.click(addButtons[0]);

    expect(screen.getByText("Add Meal Slot")).toBeInTheDocument();

    // 2. Select a slot (e.g. Lunch)
    fireEvent.click(screen.getByText("Lunch"));

    // 3. Verify it transitioned to the recipe stage and did not close
    await waitFor(() => {
      expect(screen.getByText("Add Recipe to Meal")).toBeInTheDocument();
    });

    // 4. Test recipe search bar filtering
    const searchInput = screen.getByPlaceholderText("Search recipes...");
    expect(screen.getByText("Pasta")).toBeInTheDocument();
    expect(screen.getByText("Salad")).toBeInTheDocument();

    // Type "Pas"
    fireEvent.change(searchInput, { target: { value: "Pas" } });
    expect(screen.getByText("Pasta")).toBeInTheDocument();
    expect(screen.queryByText("Salad")).not.toBeInTheDocument();

    // 5. Select recipe and check callback is invoked
    fireEvent.click(screen.getByText("Pasta"));
    await waitFor(() => {
      expect(actions.addRecipeToMealAction).toHaveBeenCalledWith(
        "new-meal-id",
        "r1",
      );
    });
  });
});
