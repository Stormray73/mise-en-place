/**
 * @file MealSlot.tsx
 * @responsibility Handles a single meal slot (e.g., Breakfast) and its recipes, including cloning and deletion.
 * @dependencies PlannedRecipeRow, Button, Card, React
 */

import React from "react";
import PlannedRecipeRow, { PlannedRecipeWithRecipe } from "./PlannedRecipeRow";
import { Button } from "./ui/Button";

export interface MealWithRecipes {
  id: string;
  date: string | Date;
  slot: string;
  plannedRecipes: PlannedRecipeWithRecipe[];
  macros: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

interface MealSlotProps {
  meal: MealWithRecipes;
  onDeleteMeal: (id: string) => void;
  onCloneMeal: (id: string) => void;
  onAddRecipe: (mealId: string) => void;
  onRemoveRecipe: (id: string) => void;
  onToggleLeftoverSource: (id: string, isSource: boolean) => void;
  onUpdatePlannedRecipe: (
    id: string,
    updates: { scale?: number; prepState?: string },
  ) => void;
  onLinkLeftover: (id: string, sourceId: string | null) => void;
  leftoverSourceOptions: { id: string; date: string | Date }[];
}

export default function MealSlot({
  meal,
  onDeleteMeal,
  onCloneMeal,
  onAddRecipe,
  onRemoveRecipe,
  onToggleLeftoverSource,
  onUpdatePlannedRecipe,
  onLinkLeftover,
  leftoverSourceOptions,
}: MealSlotProps) {
  return (
    <div
      className="bg-zinc-800/50 rounded p-2 border border-zinc-700"
      data-testid={`meal-slot-${meal.id}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-400 uppercase">
            {meal.slot}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {Math.round(meal.macros.calories)} kcal
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCloneMeal(meal.id)}
            className="text-[9px] h-auto py-1 uppercase px-2"
            title="Duplicate Meal"
          >
            Clone
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteMeal(meal.id)}
          className="text-zinc-500 hover:text-red-500 h-auto py-1 px-2 text-lg leading-none"
          title="Delete Meal"
          data-testid={`delete-meal-${meal.id}`}
        >
          &times;
        </Button>
      </div>

      <div className="space-y-1">
        {meal.plannedRecipes.map((pr) => (
          <PlannedRecipeRow
            key={pr.id}
            pr={pr}
            onRemove={onRemoveRecipe}
            onToggleLeftoverSource={onToggleLeftoverSource}
            onUpdate={onUpdatePlannedRecipe}
            onLinkLeftover={onLinkLeftover}
            sourceOptions={leftoverSourceOptions.filter(
              (source) => source.id !== pr.id,
            )}
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddRecipe(meal.id)}
          className="w-full text-left justify-start text-[10px] text-zinc-500 hover:text-zinc-300 py-1 h-auto"
        >
          + Add Recipe
        </Button>
      </div>
    </div>
  );
}
