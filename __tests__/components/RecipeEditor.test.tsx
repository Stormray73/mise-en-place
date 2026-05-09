/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecipeEditor } from "@/components/RecipeEditor";
import { expect, test, vi, beforeEach, describe } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the server action
const mockSaveRecipe = vi.fn();
vi.mock("@/app/recipes/actions", () => ({
  saveRecipeAction: (data: any) => mockSaveRecipe(data),
}));

describe("RecipeEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders basic fields", () => {
    render(<RecipeEditor />);
    expect(screen.getByLabelText(/Recipe Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Yield Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Yield Unit/i)).toBeInTheDocument();
  });

  test("allows adding and removing steps", () => {
    render(<RecipeEditor />);

    const addStepButton = screen.getByText(/Add Step/i);
    fireEvent.click(addStepButton);

    expect(
      screen.getByPlaceholderText(/Instruction for step 1/i),
    ).toBeInTheDocument();

    const removeStepButton = screen.getByLabelText(/Remove Step 1/i);
    fireEvent.click(removeStepButton);

    expect(
      screen.queryByPlaceholderText(/Instruction for step 1/i),
    ).not.toBeInTheDocument();
  });

  test("allows searching and adding USDA ingredients", async () => {
    const mockFood = {
      fdcId: 123,
      description: "Apple, fresh",
      foodNutrients: [
        { nutrientName: "Energy", value: 52, unitName: "KCAL" },
        { nutrientName: "Protein", value: 0.3, unitName: "G" },
        { nutrientName: "Total lipid (fat)", value: 0.2, unitName: "G" },
        {
          nutrientName: "Carbohydrate, by difference",
          value: 14,
          unitName: "G",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foods: [mockFood] }),
    });

    render(<RecipeEditor />);

    const searchInput = screen.getByPlaceholderText(/Search ingredients.../i);
    fireEvent.change(searchInput, { target: { value: "Apple" } });

    await waitFor(() =>
      expect(screen.getByText("Apple, fresh")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Apple, fresh"));

    expect(screen.getByDisplayValue("Apple, fresh")).toBeInTheDocument();
    const quantityInputs = screen.getAllByPlaceholderText(/Qty/i);
    expect(quantityInputs.length).toBe(1);
  });

  test("submits form data to saveRecipeAction", async () => {
    render(<RecipeEditor />);

    fireEvent.change(screen.getByLabelText(/Recipe Title/i), {
      target: { value: "Test Recipe" },
    });
    fireEvent.change(screen.getByLabelText(/Yield Amount/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/Yield Unit/i), {
      target: { value: "cup" },
    });

    const addStepButton = screen.getByText(/Add Step/i);
    fireEvent.click(addStepButton);
    fireEvent.change(screen.getByPlaceholderText(/Instruction for step 1/i), {
      target: { value: "Cook it" },
    });

    const saveButton = screen.getByText(/Save Recipe/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Recipe",
          yieldAmount: 4,
          yieldUnit: "cup",
          steps: [{ order: 1, instruction: "Cook it" }],
        }),
      );
    });
  });
});
