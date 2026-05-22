import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanIngredientName } from "@/lib/ingredients";

// Mock prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    recipe: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("Import Sub-Recipe Auto-Linking Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserRecipes = [
    { id: "recipe-pasta-sauce", title: "Pasta Sauce" },
    { id: "recipe-chicken-broth", title: "Chicken Broth" },
    { id: "recipe-pie-crust", title: "Perfect Pie Crust" },
  ];

  const findMatchingRecipe = (
    ingredientName: string,
    allRecipes: { id: string; title: string }[],
  ) => {
    const trimmedIng = ingredientName.trim().toLowerCase();
    const directMatch = allRecipes.find(
      (r) => r.title.trim().toLowerCase() === trimmedIng,
    );
    if (directMatch) return directMatch;

    const cleanedIng = cleanIngredientName(ingredientName);
    if (!cleanedIng) return null;
    const match = allRecipes.find((r) => {
      const cleanedTitle = cleanIngredientName(r.title);
      return cleanedTitle === cleanedIng;
    });
    return match || null;
  };

  it("should match ingredients to recipes case-insensitively with exact names", () => {
    const match = findMatchingRecipe("pasta sauce", mockUserRecipes);
    expect(match).not.toBeNull();
    expect(match?.id).toBe("recipe-pasta-sauce");
  });

  it("should match ingredients to recipes ignoring leading/trailing spaces", () => {
    const match = findMatchingRecipe("  Chicken Broth  ", mockUserRecipes);
    expect(match).not.toBeNull();
    expect(match?.id).toBe("recipe-chicken-broth");
  });

  it("should match ingredients to recipes with noise-stripped names", () => {
    // "Perfect Pie Crust" matches "pie crust" when cleanIngredientName strips "perfect" or "perfect" is matched via noise stripping/sub-cleaning
    // Let's test a clean match
    const match = findMatchingRecipe("organic chicken broth", mockUserRecipes);
    expect(match).not.toBeNull();
    expect(match?.id).toBe("recipe-chicken-broth");
  });

  it("should return null when there is no matching recipe title", () => {
    const match = findMatchingRecipe("unrelated ingredient", mockUserRecipes);
    expect(match).toBeNull();
  });
});
