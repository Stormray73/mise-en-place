import React from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlannedRecipeWithRecipe } from "./PlannedRecipeRow";

interface MealSlotProps {
  meal: {
    id: string;
    slot: string;
    plannedRecipes: PlannedRecipeWithRecipe[];
  };
  onDeleteMeal: (mealId: string) => void;
  onCloneMeal: (mealId: string) => void;
  onAddRecipe: (mealId: string) => void;
  onEditMeal: (meal: any) => void;
}

export default function MealSlot({
  meal,
  onDeleteMeal,
  onCloneMeal,
  onAddRecipe,
  onEditMeal,
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
          <button
            onClick={() => onEditMeal(meal)}
            className={`text-[10px] font-black uppercase tracking-widest text-left hover:underline transition-all ${
              isPreset ? "text-zinc-400 hover:text-zinc-200" : "text-blue-400 hover:text-blue-300"
            }`}
            title="Edit Meal details & recipes"
          >
            {meal.slot}
          </button>
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

      <div className="p-2 space-y-1">
        {meal.plannedRecipes.map((pr) => (
          <Link
            key={pr.id}
            href={`/recipes/${pr.recipeId}?scale=${pr.scale}`}
            className="group/item flex items-center justify-between block truncate text-xs hover:text-blue-400 text-zinc-200 transition-colors py-1 px-1.5 rounded hover:bg-zinc-800/80"
            title={pr.recipe.title}
          >
            <span className="truncate flex-1">
              {pr.recipe.title}
              {pr.scale !== 1 && (
                <span className="text-zinc-500 ml-1 text-[10px]">x{pr.scale}</span>
              )}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              {pr.isLeftoverSource && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-500"
                  title="Produces Leftovers"
                />
              )}
              {pr.sourcePlannedRecipeId && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green-500"
                  title="Consumed Leftovers"
                />
              )}
              {pr.excludeFromPrep && (
                <span
                  className="text-[9px] px-1 py-0.2 bg-zinc-700/60 border border-zinc-600/30 rounded text-zinc-400 font-mono"
                  title="Excluded from prep list"
                >
                  NP
                </span>
              )}
            </div>
          </Link>
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
