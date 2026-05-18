/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecipeEditor } from "@/components/RecipeEditor";
import { expect, test, vi, beforeEach, describe } from "vitest";

// Mock the server action
const mockSaveRecipe = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/app/recipes/actions", () => ({
  saveRecipeAction: (data: any) => mockSaveRecipe(data),
  getTagsAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
  scrapeRecipeAction: vi.fn().mockResolvedValue({ success: true, data: null }),
  checkR2ConfiguredAction: vi.fn().mockResolvedValue(true),
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
    expect(
      screen.getByRole("combobox", { name: /Yield Unit/i }),
    ).toBeInTheDocument();
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

    // After selection, it should appear in the ComponentList
    expect(screen.getByText("Apple, fresh")).toBeInTheDocument();
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
    fireEvent.change(screen.getByRole("combobox", { name: /Yield Unit/i }), {
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

  test("shows error if title is missing", async () => {
    render(<RecipeEditor />);

    const saveButton = screen.getByText(/Save Recipe/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Recipe title is required/i)).toBeInTheDocument();
    });
    expect(mockSaveRecipe).not.toHaveBeenCalled();
  });

  test("filters out empty steps before saving", async () => {
    render(<RecipeEditor />);

    fireEvent.change(screen.getByLabelText(/Recipe Title/i), {
      target: { value: "Test Recipe" },
    });

    const addStepButton = screen.getByText(/Add Step/i);
    fireEvent.click(addStepButton); // Step 1
    fireEvent.click(addStepButton); // Step 2
    fireEvent.click(addStepButton); // Step 3

    const stepInputs = screen.getAllByPlaceholderText(/Instruction for step/i);
    fireEvent.change(stepInputs[0], { target: { value: "First step" } });
    fireEvent.change(stepInputs[1], { target: { value: "   " } }); // Whitespace only
    fireEvent.change(stepInputs[2], { target: { value: "Third step" } });

    const saveButton = screen.getByText(/Save Recipe/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: [
            { order: 1, instruction: "First step" },
            { order: 2, instruction: "Third step" },
          ],
        }),
      );
    });
  });

  test("persists prepState for components", async () => {
    const mockFood = {
      fdcId: 456,
      description: "Onion",
      foodNutrients: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foods: [mockFood] }),
    });

    render(<RecipeEditor />);

    fireEvent.change(screen.getByLabelText(/Recipe Title/i), {
      target: { value: "Onion Recipe" },
    });

    // Add ingredient
    const searchInput = screen.getByPlaceholderText(/Search ingredients.../i);
    fireEvent.change(searchInput, { target: { value: "Onion" } });
    await waitFor(() => expect(screen.getByText("Onion")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Onion"));

    // Set prepState
    const prepInput = screen.getByPlaceholderText(/Prep \(e.g. diced\)/i);
    fireEvent.change(prepInput, { target: { value: "finely diced" } });

    const saveButton = screen.getByText(/Save Recipe/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          components: expect.arrayContaining([
            expect.objectContaining({
              prepState: "finely diced",
            }),
          ]),
        }),
      );
    });
  });
});
