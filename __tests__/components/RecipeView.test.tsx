import { render, screen, fireEvent } from "@testing-library/react";
import RecipeView from "@/components/RecipeView";
import { expect, test, describe, vi } from "vitest";
import { Recipe, Macros, RecipeStep, RecipeComponent } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => "/recipes/r1",
}));

const mockMacros: Macros = {
  calories: 1000,
  protein: 50,
  fat: 30,
  carbs: 100,
};

const mockRecipe: Recipe & {
  steps: RecipeStep[];
  components: RecipeComponent[];
} = {
  id: "r1",
  title: "Big Batch Pasta",
  yieldAmount: 10,
  yieldUnit: "cup",
  servings: 5,
  userId: "u1",
  createdAt: new Date(),
  updatedAt: new Date(),
  steps: [{ id: "s1", order: 1, instruction: "Boil water", recipeId: "r1" }],
  components: [
    {
      type: "ingredient",
      ingredientId: "i1",
      id: "c1",
      quantity: 500,
      unit: "g",
      ingredient: { id: "i1", name: "Pasta" },
      recipeId: "r1",
    },
  ],
};

describe("RecipeView", () => {
  test("toggles between full recipe and per serving macros", () => {
    render(<RecipeView recipe={mockRecipe} macros={mockMacros} />);

    // Default: Full Recipe
    expect(screen.getByText("1000")).toBeInTheDocument(); // Calories
    expect(screen.getByText("50g")).toBeInTheDocument(); // Protein

    const perServingBtn = screen.getByRole("button", { name: /Per Serving/i });
    const fullRecipeBtn = screen.getByRole("button", { name: /Full Recipe/i });
    expect(perServingBtn).toBeInTheDocument();
    expect(fullRecipeBtn).toBeInTheDocument();

    // Switch to Per Serving
    fireEvent.click(perServingBtn);
    expect(screen.getByText("200")).toBeInTheDocument(); // 1000 / 5
    expect(screen.getByText("10g")).toBeInTheDocument(); // 50 / 5

    // Switch back
    fireEvent.click(fullRecipeBtn);
    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  test("shows a helpful tip if servings metadata is missing", () => {
    const recipeNoServings = { ...mockRecipe, servings: null };
    render(<RecipeView recipe={recipeNoServings} macros={mockMacros} />);

    expect(
      screen.queryByRole("button", { name: /Show Per Serving/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /Set a serving count in the editor to enable per-serving macros/i,
      ),
    ).toBeInTheDocument();
  });

  test("scales ingredient quantities correctly", () => {
    render(<RecipeView recipe={mockRecipe} macros={mockMacros} />);

    expect(screen.getByText("500 g")).toBeInTheDocument();

    const scaleInput = screen.getByLabelText(/Scale:/i);
    fireEvent.change(scaleInput, { target: { value: "2" } });

    expect(screen.getByText("1000 g")).toBeInTheDocument();
  });
});
