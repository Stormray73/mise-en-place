/**
 * @file IngredientSearch.tsx
 * @responsibility Handles USDA and sub-recipe autocomplete for adding ingredients.
 * @dependencies USDAFood, RecipeSearchResult (types), Autocomplete (UI)
 */

import { USDAFood, RecipeSearchResult } from "@/types";
import { Autocomplete } from "./ui/Autocomplete";

interface IngredientSearchProps {
  onAddIngredient: (food: USDAFood) => void;
  onAddSubRecipe: (recipe: RecipeSearchResult) => void;
}

export function IngredientSearch({
  onAddIngredient,
  onAddSubRecipe,
}: IngredientSearchProps) {
  const searchUSDA = async (query: string) => {
    const res = await fetch(`/api/usda/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.foods || [];
  };

  const searchRecipes = async (query: string) => {
    const res = await fetch(
      `/api/recipes/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    return data.recipes || [];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Autocomplete<USDAFood>
        label="Add USDA Ingredient"
        placeholder="Search ingredients..."
        onSearch={searchUSDA}
        onSelect={onAddIngredient}
        minChars={3}
        keyExtractor={(food) => food.fdcId}
        renderItem={(food) => (
          <>
            <div className="font-medium">{food.description}</div>
            <div className="text-xs text-zinc-400">{food.foodCategory}</div>
          </>
        )}
      />

      <Autocomplete<RecipeSearchResult>
        label="Add Sub-recipe"
        placeholder="Search recipes..."
        onSearch={searchRecipes}
        onSelect={onAddSubRecipe}
        minChars={2}
        keyExtractor={(recipe) => recipe.id}
        renderItem={(recipe) => (
          <>
            <div className="font-medium">{recipe.title}</div>
            <div className="text-xs text-zinc-400">
              Yield: {recipe.yieldAmount} {recipe.yieldUnit}
            </div>
          </>
        )}
      />
    </div>
  );
}
