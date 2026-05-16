"use client";

/**
 * @file IngredientSearch.tsx
 * @responsibility Handles USDA and sub-recipe autocomplete for adding ingredients.
 * @dependencies USDAFood, RecipeSearchResult (types), Autocomplete (UI)
 */

import React, { useState } from "react";
import { USDAFood, RecipeSearchResult } from "@/types";
import { Autocomplete } from "./ui/Autocomplete";
import CustomIngredientModal from "./CustomIngredientModal";

interface IngredientSearchProps {
  onAddIngredient: (food: USDAFood) => void;
  onAddSubRecipe: (recipe: RecipeSearchResult) => void;
}

export function IngredientSearch({
  onAddIngredient,
  onAddSubRecipe,
}: IngredientSearchProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialQuery, setModalInitialQuery] = useState("");
  const [modalInitialData, setModalInitialData] = useState<
    Partial<USDAFood> | undefined
  >(undefined);

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

  const handleEditCustom = (e: React.MouseEvent, food: USDAFood) => {
    e.stopPropagation();
    setModalInitialData(food);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Autocomplete<USDAFood>
          label="Add USDA Ingredient"
          placeholder="Search ingredients..."
          onSearch={searchUSDA}
          onSelect={onAddIngredient}
          minChars={3}
          keyExtractor={(food) => food.fdcId}
          renderItem={(food) => (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{food.description}</div>
                <div className="text-xs text-zinc-400">{food.foodCategory}</div>
              </div>
              {food.userId && (
                <button
                  type="button"
                  onClick={(e) => handleEditCustom(e, food)}
                  className="text-xs px-2 py-1 bg-zinc-600 hover:bg-zinc-500 rounded"
                >
                  Edit
                </button>
              )}
            </div>
          )}
          footerAction={(query) => (
            <button
              type="button"
              onClick={() => {
                setModalInitialData(undefined);
                setModalInitialQuery(query);
                setModalOpen(true);
              }}
              className="w-full text-left px-4 py-3 text-sm text-blue-400 hover:bg-zinc-700 transition-colors"
            >
              + Create &quot;{query}&quot; as custom ingredient
            </button>
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

      {modalOpen && (
        <CustomIngredientModal
          initialQuery={modalInitialQuery}
          initialData={modalInitialData}
          onClose={() => setModalOpen(false)}
          onSaved={(ingredient) => {
            if (!modalInitialData) {
              onAddIngredient(ingredient);
            }
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}
