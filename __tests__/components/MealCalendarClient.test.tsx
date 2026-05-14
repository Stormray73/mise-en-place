import { render, screen, fireEvent } from "@testing-library/react";

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
  createMealAction: vi.fn(),
  addRecipeToMealAction: vi.fn(),
  deleteMealAction: vi.fn(),
  updatePlannedRecipeAction: vi.fn(),
  removeRecipeFromMealAction: vi.fn(),
  setLeftoverSourceAction: vi.fn(),
  linkLeftoverConsumptionAction: vi.fn(),
  cloneMealAction: vi.fn(),
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
        initialMeals={mockMeals}
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
        initialMeals={mockMeals}
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
        initialMeals={mockMeals}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    fireEvent.click(screen.getByTitle("Duplicate Meal"));
    expect(screen.getByText("Clone Meal to Date")).toBeInTheDocument();
  });

  test("updates planned recipe scale", () => {
    render(
      <MealCalendarClient
        initialMeals={mockMeals}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    const scaleInput = screen.getByTestId("scale-input-pr1");
    fireEvent.change(scaleInput, { target: { value: "2" } });

    expect(actions.updatePlannedRecipeAction).toHaveBeenCalledWith("pr1", {
      scale: 2,
    });
  });
});
