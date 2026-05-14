/**
 * @file AddRecipeModal.tsx
 * @responsibility Modal for selecting and adding a recipe to a specific meal.
 * @dependencies Modal, Button, React
 */

import React from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";

interface RecipeOption {
  id: string;
  title: string;
}

interface AddRecipeModalProps {
  mealId: string;
  allRecipes: RecipeOption[];
  onClose: () => void;
  onAdd: (mealId: string, recipeId: string) => void;
}

export default function AddRecipeModal({
  mealId,
  allRecipes,
  onClose,
  onAdd,
}: AddRecipeModalProps) {
  return (
    <Modal title="Add Recipe to Meal" onClose={onClose}>
      <div className="space-y-2">
        {allRecipes.map((recipe) => (
          <Button
            key={recipe.id}
            onClick={() => onAdd(mealId, recipe.id)}
            variant="ghost"
            className="w-full text-left justify-start p-6"
          >
            {recipe.title}
          </Button>
        ))}
        {allRecipes.length === 0 && (
          <p className="text-zinc-500 text-center py-4">No recipes found.</p>
        )}
      </div>
    </Modal>
  );
}
