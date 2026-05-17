/**
 * @file MealSlot.tsx
 * @responsibility Handles a single meal slot (e.g., Breakfast) and its recipes, including cloning and deletion.
 * @dependencies PlannedRecipeRow, Button, Card, React
 */

import React from "react";
import PlannedRecipeRow, { PlannedRecipeWithRecipe } from "./PlannedRecipeRow";
import { Button } from "./ui/Button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MealSlotProps {
  meal: {
    id: string;
    slot: string;
    plannedRecipes: PlannedRecipeWithRecipe[];
  };
  onDeleteMeal: (mealId: string) => void;
  onCloneMeal: (mealId: string) => void;
  onAddRecipe: (mealId: string) => void;
  onRemoveRecipe: (plannedRecipeId: string) => void;
  onToggleLeftoverSource: (plannedRecipeId: string, isSource: boolean) => void;
  onUpdatePlannedRecipe: (
    id: string,
    updates: { scale?: number; prepState?: string; excludeFromPrep?: boolean },
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: meal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPreset = ["Breakfast", "Lunch", "Dinner"].includes(meal.slot);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden"
      data-testid={`meal-slot-${meal.id}`}
    >
      <div className="p-2 border-b border-zinc-700/50 bg-zinc-900/30 flex justify-between items-center group">
        <div className="flex items-center gap-2">
          {!isPreset && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400"
              title="Drag to reorder"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zM7 9a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm-6 7a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
          )}
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              isPreset ? "text-zinc-400" : "text-blue-400"
            }`}
          >
            {meal.slot}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onCloneMeal(meal.id)}
            className="p-1 text-zinc-500 hover:text-white transition-colors"
            title="Clone Meal"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          </button>
          <button
            onClick={() => onDeleteMeal(meal.id)}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
            title="Delete Meal"
            data-testid={`delete-meal-${meal.id}`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-2 space-y-2">
        {meal.plannedRecipes.map((pr) => (
          <PlannedRecipeRow
            key={pr.id}
            pr={pr}
            onRemove={onRemoveRecipe}
            onToggleLeftoverSource={onToggleLeftoverSource}
            onUpdate={onUpdatePlannedRecipe}
            onLinkLeftover={onLinkLeftover}
            sourceOptions={leftoverSourceOptions}
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddRecipe(meal.id)}
          className="w-full text-left justify-start text-[10px] text-zinc-500 hover:text-zinc-300 py-1 h-auto border-dashed border-zinc-700 hover:border-zinc-500"
        >
          + Add Recipe
        </Button>
      </div>
    </div>
  );
}
