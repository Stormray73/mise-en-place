import { render, screen, fireEvent } from "@testing-library/react";
import MealCalendarClient from "@/app/meal-planner/MealCalendarClient";
import { expect, test, vi, describe, beforeEach } from "vitest";

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
}));

interface PlannedRecipeWithRecipe {
  id: string;
  recipeId: string;
  recipe: {
    title: string;
  };
  scale: number;
  prepState?: string | null;
  isLeftoverSource: boolean;
  sourcePlannedRecipeId?: string | null;
}

interface MealWithRecipes {
  id: string;
  date: string | Date;
  slot: string;
  plannedRecipes: PlannedRecipeWithRecipe[];
}

const mockInitialMeals: MealWithRecipes[] = [];
const mockStartDate = new Date("2026-05-10T00:00:00Z").toISOString(); // A Sunday
const mockAllRecipes = [
  { id: "r1", title: "Pasta" },
  { id: "r2", title: "Salad" },
];

describe("MealCalendarClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders 7 days of the week", () => {
    render(
      <MealCalendarClient
        initialMeals={mockInitialMeals}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    // Sunday to Saturday
    expect(screen.getByText(/Sun/i)).toBeInTheDocument();
    expect(screen.getByText(/Sat/i)).toBeInTheDocument();
  });

  test("can click to add a meal slot", async () => {
    render(
      <MealCalendarClient
        initialMeals={mockInitialMeals}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    const addButtons = screen.getAllByText(/\+ Add/i);
    fireEvent.click(addButtons[0]); // Click first day's add button

    expect(screen.getByText(/Add Meal Slot/i)).toBeInTheDocument();
  });
});
